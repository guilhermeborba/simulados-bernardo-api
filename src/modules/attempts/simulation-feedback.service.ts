import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptStatus,
  Prisma,
  SimulationStatus,
  UserRole,
  UserStatus,
  type AttemptAnswer,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttemptsCorrectionService } from './attempts-correction.service';
import {
  canonicalOfficialAnswers,
  correctAnswer,
  equivalentAnswer,
  normalizeSimulationAnswer,
  publicOptions,
  snapshotClassificationMode,
  type SimulationSnapshot,
} from './simulation-feedback.contract';

type RequestUser = { id: string; role: UserRole };
type SimulationAttempt = Prisma.AttemptGetPayload<{
  include: { simulation: { include: { discipline: true } } };
}>;
type Activity = SimulationAttempt['simulation'];

/** The Giz mode is additive. Legacy simulation/quiz grading remains separate. */
@Injectable()
export class SimulationFeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correction: AttemptsCorrectionService,
  ) {}

  async start(idOrSlug: string, user: RequestUser) {
    return this.prisma.$transaction(
      async (db) => {
        const rows = await db.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "Simulation" WHERE ("id"=${idOrSlug} OR "slug"=${idOrSlug}) AND "activityKind"='SIMULATION'::"ActivityKind" FOR UPDATE`;
        if (rows.length !== 1)
          throw new NotFoundException('Published simulation not found');
        const simulation = await db.simulation.findUnique({
          where: { id: rows[0].id },
          include: { discipline: true },
        });
        if (!simulation || simulation.status !== SimulationStatus.PUBLISHED)
          throw new NotFoundException('Published simulation not found');
        await this.assertAccess(db, simulation, user);
        const open = await db.attempt.findFirst({
          where: {
            studentId: user.id,
            simulationId: simulation.id,
            status: AttemptStatus.IN_PROGRESS,
          },
          include: { simulation: { include: { discipline: true } } },
        });
        // Never change the grading policy of an attempt already in progress.
        if (open) return open;
        const ids = await db.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "Question" WHERE "simulationId"=${simulation.id} AND "isActive"=true AND "deletedAt" IS NULL ORDER BY "id" FOR SHARE`;
        const questions = await db.question.findMany({
          where: { id: { in: ids.map((row) => row.id) } },
          include: {
            options: { orderBy: { sortOrder: 'asc' } },
            answers: true,
          },
          orderBy: { sortOrder: 'asc' },
        });
        if (!questions.length)
          throw new BadRequestException('Simulation has no active questions');
        const snapshots = questions.map((question) => ({
          questionId: question.id,
          originKey: question.originKey ?? question.id,
          type: question.type,
          statement: question.statement,
          tip: question.tip,
          funFact: question.funFact,
          explanation: question.explanation ?? '',
          theme: question.theme?.trim() || null,
          points: question.points,
          sortOrder: question.sortOrder,
          options: question.options.map((option) => ({
            id: option.id,
            optionKey: option.optionKey,
            text: option.text,
            groupKey: option.groupKey,
            order: option.sortOrder,
          })),
          officialAnswers: question.answers.map((answer) => ({
            answerKey: answer.answerKey,
            answerValue: answer.answerValue,
          })),
        }));
        let maxScore = new Prisma.Decimal(0);
        for (const snapshot of snapshots) {
          if (!snapshot.points.isFinite() || !snapshot.points.greaterThan(0))
            throw new BadRequestException('Question points are invalid');
          correctAnswer(snapshot);
          maxScore = maxScore.plus(snapshot.points);
        }
        const attempt = await db.attempt.create({
          data: {
            studentId: user.id,
            simulationId: simulation.id,
            immediateFeedback: true,
            maxScore,
          },
          include: { simulation: { include: { discipline: true } } },
        });
        await db.attemptQuestionSnapshot.createMany({
          data: snapshots.map((snapshot) => ({
            ...snapshot,
            attemptId: attempt.id,
          })),
        });
        return attempt;
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  }

  getAttempt(id: string, user: RequestUser) {
    return this.withAttempt(id, user, false, async (_db, attempt) => attempt);
  }
  getQuestions(id: string, user: RequestUser) {
    return this.withAttempt(id, user, false, async (db) => {
      const { snapshots, answers } = await this.content(db, id);
      return snapshots.map((snapshot) =>
        this.presentQuestion(snapshot, answers.get(snapshot.questionId)),
      );
    });
  }
  confirm(
    id: string,
    questionId: string,
    value: Record<string, unknown>,
    user: RequestUser,
  ) {
    return this.withAttempt(id, user, true, async (db, attempt) => {
      if (
        attempt.status !== AttemptStatus.IN_PROGRESS &&
        attempt.status !== AttemptStatus.FINISHED
      )
        throw new BadRequestException('Attempt is not available');
      const snapshot = await db.attemptQuestionSnapshot.findUnique({
        where: { attemptId_questionId: { attemptId: id, questionId } },
      });
      if (!snapshot)
        throw new NotFoundException('Question not found for this attempt');
      const answer = normalizeSimulationAnswer(snapshot, value);
      const previous = await db.attemptAnswer.findUnique({
        where: { attemptId_questionId: { attemptId: id, questionId } },
      });
      if (previous?.confirmedAt) {
        if (
          !equivalentAnswer(
            normalizeSimulationAnswer(snapshot, previous.answer),
            answer,
            snapshotClassificationMode(snapshot),
          )
        )
          throw new ConflictException('This answer has already been confirmed');
        return this.presentConfirmation(snapshot, previous);
      }
      if (attempt.status !== AttemptStatus.IN_PROGRESS)
        throw new BadRequestException('Attempt is not in progress');
      const saved = await db.attemptAnswer.create({
        data: {
          attemptId: id,
          questionId,
          ...this.confirmation(snapshot, answer),
        },
      });
      return this.presentConfirmation(snapshot, saved);
    });
  }
  finish(id: string, user: RequestUser) {
    return this.withAttempt(id, user, true, async (db, attempt) => {
      if (
        attempt.status !== AttemptStatus.IN_PROGRESS &&
        attempt.status !== AttemptStatus.FINISHED
      )
        throw new BadRequestException('Attempt is not available');
      const { snapshots, answers } = await this.content(db, id);
      if (attempt.status === AttemptStatus.FINISHED)
        return this.presentResult(attempt, snapshots, answers);
      for (const snapshot of snapshots) {
        if (!answers.get(snapshot.questionId)?.confirmedAt) {
          const saved = await db.attemptAnswer.create({
            data: {
              attemptId: id,
              questionId: snapshot.questionId,
              ...this.confirmation(snapshot, {}),
            },
          });
          answers.set(snapshot.questionId, saved);
        }
      }
      let score = new Prisma.Decimal(0);
      let correctCount = 0;
      for (const answer of answers.values()) {
        if (answer.isCorrect) {
          correctCount += 1;
          score = score.plus(answer.pointsEarned ?? 0);
        }
      }
      const finishedAt = new Date();
      const finished = await db.attempt.update({
        where: { id },
        data: {
          status: AttemptStatus.FINISHED,
          finishedAt,
          score,
          correctCount,
          wrongCount: snapshots.length - correctCount,
          percentage: attempt.maxScore.greaterThan(0)
            ? score.div(attempt.maxScore).mul(100).toDecimalPlaces(2)
            : 0,
          durationSeconds: Math.max(
            0,
            Math.floor(
              (finishedAt.getTime() - attempt.startedAt.getTime()) / 1000,
            ),
          ),
        },
        include: { simulation: { include: { discipline: true } } },
      });
      return this.presentResult(finished, snapshots, answers);
    });
  }
  result(id: string, user: RequestUser) {
    return this.withAttempt(id, user, false, async (db, attempt) => {
      if (attempt.status !== AttemptStatus.FINISHED)
        throw new BadRequestException('Attempt is not finished');
      const { snapshots, answers } = await this.content(db, id);
      return this.presentResult(attempt, snapshots, answers);
    });
  }

  private async withAttempt<T>(
    id: string,
    user: RequestUser,
    mutable: boolean,
    action: (
      db: Prisma.TransactionClient,
      attempt: SimulationAttempt,
    ) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (db) => {
        const reference = await db.attempt.findUnique({
          where: { id },
          select: { studentId: true, simulationId: true },
        });
        if (!reference) throw new NotFoundException('Attempt not found');
        if (user.role !== UserRole.ADMIN && reference.studentId !== user.id)
          throw new ForbiddenException('Cannot access this attempt');
        const activityRows = await db.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "Simulation" WHERE "id"=${reference.simulationId} AND "activityKind"='SIMULATION'::"ActivityKind" FOR SHARE`;
        const mode = mutable ? Prisma.sql`FOR UPDATE` : Prisma.sql`FOR SHARE`;
        const attemptRows = await db.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "Attempt" WHERE "id"=${id} AND "simulationId"=${reference.simulationId} ${mode}`;
        if (activityRows.length !== 1 || attemptRows.length !== 1)
          throw new NotFoundException('Attempt not found');
        const attempt = await db.attempt.findUnique({
          where: { id },
          include: { simulation: { include: { discipline: true } } },
        });
        if (!attempt || !attempt.immediateFeedback)
          throw new BadRequestException(
            'Immediate feedback is not enabled for this attempt',
          );
        await this.assertAccess(db, attempt.simulation, user);
        return action(db, attempt);
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  }

  private async assertAccess(
    db: Prisma.TransactionClient,
    simulation: Activity,
    user: RequestUser,
  ) {
    await db.$queryRaw`SELECT "id" FROM "User" WHERE "id"=${user.id} FOR SHARE`;
    const active = await db.user.findFirst({
      where: {
        id: user.id,
        role: { equals: user.role, in: [UserRole.STUDENT, UserRole.ADMIN] },
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!active)
      throw new UnauthorizedException(
        'Active student or administrator required',
      );
    await db.$queryRaw`SELECT "id" FROM "Discipline" WHERE "id"=${simulation.disciplineId} FOR SHARE`;
    const discipline = await db.discipline.findFirst({
      where: { id: simulation.disciplineId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (
      simulation.activityKind !== ActivityKind.SIMULATION ||
      simulation.deletedAt ||
      (simulation.status !== SimulationStatus.PUBLISHED &&
        simulation.status !== SimulationStatus.ARCHIVED) ||
      !discipline
    )
      throw new NotFoundException('Published simulation not found');
    if (simulation.turmaId !== null) {
      const turma = await db.$queryRaw<
        { id: string }[]
      >`SELECT "id" FROM "Turma" WHERE "id"=${simulation.turmaId} AND "deletedAt" IS NULL FOR SHARE`;
      if (!turma.length)
        throw new NotFoundException('Published simulation not found');
      if (user.role !== UserRole.ADMIN) {
        const membership = await db.$queryRaw<
          { id: string }[]
        >`SELECT "id" FROM "TurmaMembership" WHERE "turmaId"=${simulation.turmaId} AND "userId"=${user.id} FOR SHARE`;
        if (!membership.length)
          throw new NotFoundException('Published simulation not found');
      }
    }
  }

  private async content(db: Prisma.TransactionClient, attemptId: string) {
    const snapshots = await db.attemptQuestionSnapshot.findMany({
      where: { attemptId },
      orderBy: { sortOrder: 'asc' },
    });
    if (!snapshots.length)
      throw new BadRequestException('Attempt has no question snapshots');
    const answers = await db.attemptAnswer.findMany({
      where: {
        attemptId,
        questionId: { in: snapshots.map((snapshot) => snapshot.questionId) },
      },
    });
    return {
      snapshots,
      answers: new Map(answers.map((answer) => [answer.questionId, answer])),
    };
  }
  private feedback(snapshot: SimulationSnapshot, isCorrect: boolean) {
    return {
      isCorrect,
      correctAnswer: correctAnswer(snapshot),
      tip: isCorrect ? null : snapshot.tip,
      funFact: isCorrect ? snapshot.funFact : null,
      explanation: snapshot.explanation || null,
    };
  }
  private confirmation(
    snapshot: SimulationSnapshot,
    answer: Record<string, string>,
  ) {
    const correction = this.correction.correct({
      type: snapshot.type,
      points: snapshot.points,
      officialAnswers: canonicalOfficialAnswers(snapshot),
      submittedAnswer: answer,
    });
    return {
      answer,
      isCorrect: correction.isCorrect,
      pointsEarned: correction.isCorrect
        ? snapshot.points
        : new Prisma.Decimal(0),
      confirmedAt: new Date(),
      feedback: this.feedback(snapshot, correction.isCorrect),
    };
  }
  private presentConfirmation(
    snapshot: SimulationSnapshot,
    answer: AttemptAnswer,
  ) {
    if (!answer.confirmedAt || typeof answer.isCorrect !== 'boolean')
      throw new BadRequestException('Confirmed answer is unavailable');
    return {
      id: answer.id,
      attemptId: answer.attemptId,
      questionId: answer.questionId,
      answer: answer.answer,
      confirmedAt: answer.confirmedAt,
      feedback: this.feedback(snapshot, answer.isCorrect),
    };
  }
  private presentQuestion(
    snapshot: SimulationSnapshot,
    answer?: AttemptAnswer,
  ) {
    const confirmation = answer?.confirmedAt
      ? this.presentConfirmation(snapshot, answer)
      : null;
    return {
      id: snapshot.questionId,
      type: snapshot.type,
      classificationMode: snapshotClassificationMode(snapshot),
      statement: snapshot.statement,
      theme: snapshot.theme,
      tip: confirmation?.feedback.tip ?? null,
      funFact: confirmation?.feedback.funFact ?? null,
      points: snapshot.points.toString(),
      order: snapshot.sortOrder,
      options: publicOptions(snapshot.options),
      answer: confirmation?.answer ?? null,
      confirmedAt: confirmation?.confirmedAt ?? null,
      feedback: confirmation?.feedback ?? null,
    };
  }
  private presentResult(
    attempt: SimulationAttempt,
    snapshots: SimulationSnapshot[],
    answers: Map<string, AttemptAnswer>,
  ) {
    const topics = new Map<
      string,
      { theme: string; correct: number; total: number }
    >();
    let unclassifiedQuestions = 0;
    const questions = snapshots.map((snapshot) => {
      const answer = answers.get(snapshot.questionId);
      if (!answer?.confirmedAt || typeof answer.isCorrect !== 'boolean')
        throw new BadRequestException('Finished answer is unavailable');
      if (snapshot.theme) {
        const entry = topics.get(snapshot.theme) ?? {
          theme: snapshot.theme,
          correct: 0,
          total: 0,
        };
        entry.total += 1;
        if (answer.isCorrect) entry.correct += 1;
        topics.set(snapshot.theme, entry);
      } else unclassifiedQuestions += 1;
      return {
        ...this.presentQuestion(snapshot, answer),
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned?.toString() ?? '0',
        correctAnswer: correctAnswer(snapshot),
        explanation: snapshot.explanation || null,
      };
    });
    return {
      attempt,
      questions,
      topics: [...topics.values()],
      unclassifiedQuestions,
    };
  }
}

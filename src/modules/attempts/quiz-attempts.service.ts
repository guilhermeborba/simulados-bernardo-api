import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptAnswer,
  AttemptQuestionSnapshot,
  AttemptStatus,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttemptsCorrectionService } from './attempts-correction.service';
import {
  parseStoredQuizMedia,
  QuizMediaKind,
} from '../quizzes/media/quiz-media';
import { publicQuizQuestionMedia } from './quiz-question-media';
import {
  normalizeQuizAnswer,
  parseSnapshotOfficialAnswers,
  publicQuizOptions,
  toPublicQuizFeedback,
} from './quiz-feedback';

type RequestUser = { id: string; role: UserRole };
type QuizAttempt = Prisma.AttemptGetPayload<{
  include: { simulation: { include: { discipline: true } } };
}>;

const publicSnapshotSelection = {
  questionId: true,
  originKey: true,
  type: true,
  statement: true,
  tip: true,
  points: true,
  sortOrder: true,
  options: true,
  media: true,
} satisfies Prisma.AttemptQuestionSnapshotSelect;

type PublicSnapshot = Prisma.AttemptQuestionSnapshotGetPayload<{
  select: typeof publicSnapshotSelection;
}>;

@Injectable()
export class QuizAttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correctionService: AttemptsCorrectionService,
  ) {}

  async confirmAnswer(
    attemptId: string,
    questionId: string,
    answer: Record<string, unknown>,
    user: RequestUser,
  ) {
    return this.withLockedAttempt(
      attemptId,
      user,
      true,
      async (database, attempt) => {
        this.assertConfirmableState(attempt.status);
        const snapshot = await database.attemptQuestionSnapshot.findUnique({
          where: { attemptId_questionId: { attemptId, questionId } },
        });
        if (!snapshot) {
          throw new NotFoundException(
            'Question not found for this quiz attempt',
          );
        }
        this.assertSnapshot(snapshot);
        const canonicalAnswer = normalizeQuizAnswer(answer, snapshot.options);
        const existingAnswer = await database.attemptAnswer.findUnique({
          where: { attemptId_questionId: { attemptId, questionId } },
        });
        const confirmedAnswer = this.readConfirmedAnswer(
          existingAnswer,
          snapshot,
        );
        if (confirmedAnswer) {
          if (confirmedAnswer.answer.optionKey !== canonicalAnswer.optionKey) {
            throw new ConflictException(
              'Quiz answer has already been confirmed',
            );
          }
          return this.presentConfirmation(existingAnswer!, snapshot);
        }
        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
          throw new BadRequestException('Quiz attempt is not in progress');
        }

        const correction = this.correctionService.correct({
          type: snapshot.type,
          points: snapshot.points,
          officialAnswers: parseSnapshotOfficialAnswers(
            snapshot.officialAnswers,
            snapshot.options,
          ),
          submittedAnswer: canonicalAnswer,
        });
        const pointsEarned = correction.isCorrect
          ? snapshot.points
          : new Prisma.Decimal(0);
        const feedback = {
          isCorrect: correction.isCorrect,
          pointsEarned: pointsEarned.toNumber(),
          explanation: snapshot.explanation,
          funFact: snapshot.funFact,
        };
        // Validate the stored contract before writing it. A malformed snapshot
        // must never become a confirmed answer or partially corrected attempt.
        toPublicQuizFeedback(feedback);
        const confirmationData = {
          answer: canonicalAnswer,
          isCorrect: correction.isCorrect,
          pointsEarned,
          confirmedAt: new Date(),
          feedback,
        };
        const savedAnswer = existingAnswer
          ? await database.attemptAnswer.update({
              where: { id: existingAnswer.id },
              data: confirmationData,
            })
          : await database.attemptAnswer.create({
              data: { attemptId, questionId, ...confirmationData },
            });
        return this.presentConfirmation(savedAnswer, snapshot);
      },
    );
  }

  async getQuestions(attemptId: string, user: RequestUser) {
    return this.withLockedAttempt(attemptId, user, false, async (database) => {
      const { snapshots, answers } = await this.readAttemptContent(
        database,
        attemptId,
      );
      return snapshots.map((snapshot) =>
        this.presentQuestion(
          snapshot,
          answers.get(snapshot.questionId) ?? null,
          attemptId,
        ),
      );
    });
  }

  async getMediaReference(
    attemptId: string,
    questionId: string,
    kind: QuizMediaKind,
    user: RequestUser,
  ) {
    return this.withLockedAttempt(attemptId, user, false, async (database) => {
      const snapshot = await database.attemptQuestionSnapshot.findUnique({
        where: { attemptId_questionId: { attemptId, questionId } },
        select: publicSnapshotSelection,
      });
      if (!snapshot) {
        throw new NotFoundException('Question not found for this quiz attempt');
      }
      this.assertSnapshot(snapshot);
      const reference = parseStoredQuizMedia(snapshot.media)?.[kind];
      if (!reference) {
        throw new NotFoundException('Quiz question media not found');
      }
      return { assetId: reference.assetId, sha256: reference.sha256 };
    });
  }

  async finish(attemptId: string, user: RequestUser) {
    return this.withLockedAttempt(
      attemptId,
      user,
      true,
      async (database, attempt) => {
        this.assertConfirmableState(attempt.status);
        const { snapshots, answers } = await this.readAttemptContent(
          database,
          attemptId,
        );
        if (attempt.status === AttemptStatus.FINISHED) {
          return this.presentResult(attempt, snapshots, answers);
        }

        let score = new Prisma.Decimal(0);
        let maxScore = new Prisma.Decimal(0);
        let correctCount = 0;
        for (const snapshot of snapshots) {
          const confirmed = this.readConfirmedAnswer(
            answers.get(snapshot.questionId) ?? null,
            snapshot,
          );
          if (!confirmed) {
            throw new BadRequestException(
              'Confirm all quiz answers before finishing',
            );
          }
          score = score.plus(confirmed.pointsEarned);
          maxScore = maxScore.plus(snapshot.points);
          if (confirmed.isCorrect) {
            correctCount += 1;
          }
        }
        if (!maxScore.greaterThan(0)) {
          throw new InternalServerErrorException(
            'Quiz score snapshot is invalid',
          );
        }
        const finishedAt = new Date();
        const finishedAttempt = await database.attempt.update({
          where: { id: attemptId },
          data: {
            status: AttemptStatus.FINISHED,
            finishedAt,
            score,
            maxScore,
            percentage: score
              .dividedBy(maxScore)
              .times(100)
              .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
            correctCount,
            wrongCount: snapshots.length - correctCount,
            durationSeconds: Math.max(
              0,
              Math.floor(
                (finishedAt.getTime() - attempt.startedAt.getTime()) / 1000,
              ),
            ),
          },
          include: { simulation: { include: { discipline: true } } },
        });
        return this.presentResult(finishedAttempt, snapshots, answers);
      },
    );
  }

  async getResult(attemptId: string, user: RequestUser) {
    return this.withLockedAttempt(
      attemptId,
      user,
      false,
      async (database, attempt) => {
        if (attempt.status !== AttemptStatus.FINISHED) {
          throw new BadRequestException('Quiz attempt is not finished');
        }
        const { snapshots, answers } = await this.readAttemptContent(
          database,
          attemptId,
        );
        return this.presentResult(attempt, snapshots, answers);
      },
    );
  }

  private async withLockedAttempt<T>(
    attemptId: string,
    user: RequestUser,
    mutable: boolean,
    action: (
      database: Prisma.TransactionClient,
      attempt: QuizAttempt,
    ) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (database) => {
        const reference = await database.attempt.findUnique({
          where: { id: attemptId },
          select: { studentId: true, simulationId: true },
        });
        if (!reference) {
          throw new NotFoundException('Attempt not found');
        }
        this.assertOwner(reference.studentId, user);

        // The activity lock comes first, matching publication, archiving and start.
        // Reads share both locks; mutations serialize on the attempt so retries,
        // answer confirmation and finishing all observe one committed state.
        const activities = await database.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Simulation"
        WHERE "id" = ${reference.simulationId}
          AND "activityKind" = ${ActivityKind.QUIZ}::"ActivityKind"
        FOR SHARE
      `;
        if (activities.length !== 1) {
          throw new NotFoundException('Quiz attempt not found');
        }
        const lockMode = mutable
          ? Prisma.sql`FOR UPDATE`
          : Prisma.sql`FOR SHARE`;
        const lockedAttempts = await database.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Attempt"
        WHERE "id" = ${attemptId} AND "simulationId" = ${reference.simulationId}
        ${lockMode}
      `;
        if (lockedAttempts.length !== 1) {
          throw new NotFoundException('Attempt not found');
        }
        const attempt = await database.attempt.findUnique({
          where: { id: attemptId },
          include: { simulation: { include: { discipline: true } } },
        });
        if (!attempt) {
          throw new NotFoundException('Attempt not found');
        }
        this.assertOwner(attempt.studentId, user);
        await this.assertVisible(database, attempt, user);
        return action(database, attempt);
      },
      { maxWait: 10_000, timeout: 15_000 },
    );
  }

  private async assertVisible(
    database: Prisma.TransactionClient,
    attempt: QuizAttempt,
    user: RequestUser,
  ): Promise<void> {
    const quiz = attempt.simulation;
    if (
      quiz.activityKind !== ActivityKind.QUIZ ||
      quiz.deletedAt !== null ||
      quiz.publishedAt === null ||
      (quiz.status !== SimulationStatus.PUBLISHED &&
        quiz.status !== SimulationStatus.ARCHIVED) ||
      !quiz.discipline.isActive ||
      quiz.discipline.deletedAt !== null
    ) {
      throw new NotFoundException('Published quiz not found');
    }
    if (quiz.turmaId === null) {
      return;
    }
    const turma = await database.turma.findFirst({
      where: {
        id: quiz.turmaId,
        deletedAt: null,
        ...(user.role === UserRole.ADMIN
          ? {}
          : { memberships: { some: { userId: user.id } } }),
      },
      select: { id: true },
    });
    if (!turma) {
      throw new NotFoundException('Published quiz not found');
    }
  }

  private async readAttemptContent(
    database: Prisma.TransactionClient,
    attemptId: string,
  ) {
    const snapshots = await database.attemptQuestionSnapshot.findMany({
      where: { attemptId },
      select: publicSnapshotSelection,
      orderBy: { sortOrder: 'asc' },
    });
    if (snapshots.length === 0) {
      throw new BadRequestException('Quiz attempt has no question snapshots');
    }
    snapshots.forEach((snapshot) => this.assertSnapshot(snapshot));
    const answerRows = await database.attemptAnswer.findMany({
      where: { attemptId },
    });
    return {
      snapshots,
      answers: new Map(answerRows.map((answer) => [answer.questionId, answer])),
    };
  }

  private readConfirmedAnswer(
    answer: AttemptAnswer | null,
    snapshot: PublicSnapshot,
  ) {
    if (!answer || (answer.confirmedAt === null && answer.feedback === null)) {
      return null;
    }
    if (
      answer.confirmedAt === null ||
      answer.feedback === null ||
      answer.isCorrect === null ||
      answer.pointsEarned === null
    ) {
      throw new InternalServerErrorException('Quiz confirmation is invalid');
    }
    const feedback = toPublicQuizFeedback(answer.feedback);
    if (
      !feedback ||
      feedback.isCorrect !== answer.isCorrect ||
      !answer.pointsEarned.equals(feedback.pointsEarned) ||
      !answer.pointsEarned.equals(answer.isCorrect ? snapshot.points : 0)
    ) {
      throw new InternalServerErrorException('Quiz confirmation is invalid');
    }
    let canonicalAnswer: ReturnType<typeof normalizeQuizAnswer>;
    try {
      canonicalAnswer = normalizeQuizAnswer(answer.answer, snapshot.options);
    } catch {
      throw new InternalServerErrorException('Quiz confirmation is invalid');
    }
    return {
      answer: canonicalAnswer,
      feedback,
      confirmedAt: answer.confirmedAt,
      isCorrect: answer.isCorrect,
      pointsEarned: answer.pointsEarned,
    };
  }

  private presentConfirmation(
    answer: AttemptAnswer,
    snapshot: AttemptQuestionSnapshot,
  ) {
    const confirmed = this.readConfirmedAnswer(answer, snapshot);
    if (!confirmed) {
      throw new InternalServerErrorException('Quiz confirmation is invalid');
    }
    return {
      id: answer.id,
      attemptId: answer.attemptId,
      questionId: answer.questionId,
      answer: confirmed.answer,
      confirmedAt: confirmed.confirmedAt,
      feedback: confirmed.feedback,
    };
  }

  private presentQuestion(
    snapshot: PublicSnapshot,
    answer: AttemptAnswer | null,
    attemptId: string,
  ) {
    const confirmed = this.readConfirmedAnswer(answer, snapshot);
    const media = publicQuizQuestionMedia(
      snapshot.media,
      attemptId,
      snapshot.questionId,
    );
    return {
      id: snapshot.questionId,
      originKey: snapshot.originKey,
      type: snapshot.type,
      statement: snapshot.statement,
      tip: snapshot.tip,
      points: snapshot.points.toString(),
      order: snapshot.sortOrder,
      options: publicQuizOptions(snapshot.options),
      answer: confirmed?.answer ?? null,
      confirmedAt: confirmed?.confirmedAt ?? null,
      feedback: confirmed?.feedback ?? null,
      ...(media ? { media } : {}),
    };
  }

  private presentResult(
    attempt: QuizAttempt,
    snapshots: PublicSnapshot[],
    answers: Map<string, AttemptAnswer>,
  ) {
    const quiz = attempt.simulation;
    return {
      attempt: {
        id: attempt.id,
        studentId: attempt.studentId,
        simulationId: attempt.simulationId,
        activityKey: attempt.activityKey,
        contentVersion: attempt.contentVersion,
        status: attempt.status,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        durationSeconds: attempt.durationSeconds,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt,
        simulation: {
          id: quiz.id,
          activityKind: quiz.activityKind,
          activityKey: quiz.activityKey,
          contentVersion: quiz.contentVersion,
          title: quiz.title,
          subtitle: quiz.subtitle,
          slug: quiz.slug,
          schoolYear: quiz.schoolYear,
          topic: quiz.topic,
          disciplineId: quiz.disciplineId,
          turmaId: quiz.turmaId,
          discipline: {
            id: quiz.discipline.id,
            name: quiz.discipline.name,
            slug: quiz.discipline.slug,
          },
        },
      },
      questions: snapshots.map((snapshot) => {
        const answer = answers.get(snapshot.questionId) ?? null;
        const confirmed = this.readConfirmedAnswer(answer, snapshot);
        if (!confirmed) {
          throw new InternalServerErrorException(
            'Finished quiz confirmation is missing',
          );
        }
        return {
          ...this.presentQuestion(snapshot, answer, attempt.id),
          isCorrect: confirmed.isCorrect,
          pointsEarned: confirmed.pointsEarned.toNumber(),
        };
      }),
    };
  }

  private assertSnapshot(snapshot: PublicSnapshot): void {
    if (
      snapshot.type !== QuestionType.MULTIPLE_CHOICE ||
      !snapshot.points.isFinite() ||
      !snapshot.points.greaterThan(0)
    ) {
      throw new InternalServerErrorException(
        'Quiz question snapshot is invalid',
      );
    }
  }

  private assertOwner(studentId: string, user: RequestUser): void {
    if (user.id !== studentId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot access this attempt');
    }
  }

  private assertConfirmableState(status: AttemptStatus): void {
    if (
      status !== AttemptStatus.IN_PROGRESS &&
      status !== AttemptStatus.FINISHED
    ) {
      throw new BadRequestException('Quiz attempt is not in progress');
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityKind,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { slugify } from '../../common/utils/slugify';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateQuizDto, QuizQuestionDto } from './dto/create-quiz.dto';
import { FindAvailableQuizzesDto } from './dto/find-available-quizzes.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { assertQuizContentReady } from './quiz-content.validation';
import {
  QUIZ_ADMIN_SELECT,
  QUIZ_METADATA_SELECT,
  QUIZ_PRIVATE_INCLUDE,
} from './quizzes.presenter';

type PrivateQuiz = Prisma.SimulationGetPayload<{
  include: typeof QUIZ_PRIVATE_INCLUDE;
}>;

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.simulation.findMany({
      where: { activityKind: ActivityKind.QUIZ, deletedAt: null },
      select: QUIZ_METADATA_SELECT,
      orderBy: [{ activityKey: 'asc' }, { contentVersion: 'desc' }],
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.simulation.findFirst({
      where: { id, activityKind: ActivityKind.QUIZ, deletedAt: null },
      select: QUIZ_ADMIN_SELECT,
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  findAvailable(
    filters: FindAvailableQuizzesDto,
    viewer: { id: string; role: UserRole },
  ) {
    // Membership and active turma checks happen in the same catalogue query.
    const unrestricted = viewer.role === UserRole.ADMIN;
    return this.prisma.simulation.findMany({
      where: {
        activityKind: ActivityKind.QUIZ,
        status: SimulationStatus.PUBLISHED,
        deletedAt: null,
        discipline: {
          deletedAt: null,
          isActive: true,
          ...(filters.discipline ? { slug: filters.discipline } : {}),
        },
        OR: [
          { turmaId: null },
          {
            turma: {
              deletedAt: null,
              ...(unrestricted
                ? {}
                : { memberships: { some: { userId: viewer.id } } }),
            },
          },
        ],
        ...(filters.schoolYear !== undefined
          ? { schoolYear: filters.schoolYear }
          : {}),
        ...(filters.topic ? { topic: filters.topic } : {}),
      },
      select: QUIZ_METADATA_SELECT,
      distinct: ['activityKey'],
      orderBy: [{ activityKey: 'asc' }, { contentVersion: 'desc' }],
    });
  }

  create(dto: CreateQuizDto, createdById: string) {
    const questions = this.createQuestionData(dto.questions);
    const maxScore = assertQuizContentReady(questions);
    return this.runTransaction(async (transaction) => {
      await this.lockActivityKey(transaction, dto.activityKey);
      await this.assertReferences(transaction, dto.disciplineId, dto.turmaId);
      return transaction.simulation.create({
        data: {
          activityKind: ActivityKind.QUIZ,
          activityKey: dto.activityKey,
          contentVersion: 1,
          title: dto.title.trim(),
          subtitle: dto.subtitle?.trim() ?? null,
          slug: this.versionSlug(dto.activityKey, 1),
          schoolYear: dto.schoolYear,
          topic: dto.topic.trim(),
          disciplineId: dto.disciplineId,
          turmaId: dto.turmaId ?? null,
          bimester: null,
          assessment: null,
          totalQuestions: questions.length,
          maxScore,
          estimatedDurationMinutes: dto.estimatedDurationMinutes,
          createdById,
          questions: {
            create: questions.map((question) => this.nestedQuestion(question)),
          },
        },
        select: QUIZ_ADMIN_SELECT,
      });
    });
  }

  update(id: string, dto: UpdateQuizDto) {
    return this.withLockedQuiz(id, async (transaction, quiz) => {
      if (quiz.status !== SimulationStatus.DRAFT || quiz.publishedAt !== null) {
        throw new ConflictException(
          'Published quiz content is immutable; create a new version',
        );
      }
      await this.assertReferences(
        transaction,
        dto.disciplineId ?? quiz.disciplineId,
        dto.turmaId !== undefined ? dto.turmaId : quiz.turmaId,
      );
      const questionData = dto.questions
        ? this.createQuestionData(dto.questions)
        : null;
      const maxScore = questionData
        ? assertQuizContentReady(questionData)
        : null;
      if (questionData) {
        // Preserve retired question records without occupying the positive order
        // slots of this never-published draft; all changes share the row lock.
        const minimum = await transaction.question.aggregate({
          where: { simulationId: id },
          _min: { sortOrder: true },
        });
        const retiredOrder = Math.min(0, minimum._min.sortOrder ?? 0);
        for (const [index, question] of quiz.questions.entries()) {
          await transaction.question.update({
            where: { id: question.id },
            data: {
              isActive: false,
              deletedAt: new Date(),
              sortOrder: retiredOrder - index - 1,
            },
          });
        }
      }
      return transaction.simulation.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.subtitle !== undefined
            ? { subtitle: dto.subtitle?.trim() ?? null }
            : {}),
          ...(dto.schoolYear !== undefined
            ? { schoolYear: dto.schoolYear }
            : {}),
          ...(dto.topic !== undefined ? { topic: dto.topic.trim() } : {}),
          ...(dto.disciplineId !== undefined
            ? { disciplineId: dto.disciplineId }
            : {}),
          ...(dto.turmaId !== undefined ? { turmaId: dto.turmaId } : {}),
          ...(dto.estimatedDurationMinutes !== undefined
            ? { estimatedDurationMinutes: dto.estimatedDurationMinutes }
            : {}),
          ...(questionData
            ? {
                totalQuestions: questionData.length,
                maxScore: maxScore!,
                questions: {
                  create: questionData.map((question) =>
                    this.nestedQuestion(question),
                  ),
                },
              }
            : {}),
        },
        select: QUIZ_ADMIN_SELECT,
      });
    });
  }

  publish(id: string) {
    return this.withLockedQuiz(id, async (transaction, quiz) => {
      if (quiz.status === SimulationStatus.PUBLISHED) {
        return this.adminQuiz(transaction, id);
      }
      if (quiz.status !== SimulationStatus.DRAFT || quiz.publishedAt !== null) {
        throw new ConflictException(
          'Only a never-published draft can be published',
        );
      }
      await this.assertReferences(transaction, quiz.disciplineId, quiz.turmaId);
      const maxScore = assertQuizContentReady(quiz.questions);
      if (
        quiz.totalQuestions !== quiz.questions.length ||
        !quiz.maxScore.equals(maxScore)
      ) {
        throw new BadRequestException(
          'Quiz totals do not match its active questions',
        );
      }
      return transaction.simulation.update({
        where: { id },
        data: { status: SimulationStatus.PUBLISHED, publishedAt: new Date() },
        select: QUIZ_ADMIN_SELECT,
      });
    });
  }

  archive(id: string) {
    return this.withLockedQuiz(id, (transaction) =>
      transaction.simulation.update({
        where: { id },
        data: { status: SimulationStatus.ARCHIVED },
        select: QUIZ_METADATA_SELECT,
      }),
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.withLockedQuiz(id, (transaction) =>
      transaction.simulation.update({
        where: { id },
        data: { status: SimulationStatus.INACTIVE, deletedAt: new Date() },
      }),
    );
  }

  createVersion(id: string, createdById: string) {
    return this.withLockedQuiz(id, async (transaction, quiz) => {
      const activityKey = quiz.activityKey!;
      await this.lockActivityKey(transaction, activityKey);
      await this.assertReferences(transaction, quiz.disciplineId, quiz.turmaId);
      const maxScore = assertQuizContentReady(quiz.questions);
      const latest = await transaction.simulation.aggregate({
        where: { activityKind: ActivityKind.QUIZ, activityKey },
        _max: { contentVersion: true },
      });
      const contentVersion = (latest._max.contentVersion ?? 0) + 1;
      if (contentVersion > 2147483647) {
        throw new ConflictException('Quiz version range exhausted');
      }
      return transaction.simulation.create({
        data: {
          activityKind: ActivityKind.QUIZ,
          activityKey,
          contentVersion,
          title: quiz.title,
          subtitle: quiz.subtitle,
          slug: this.versionSlug(activityKey, contentVersion),
          schoolYear: quiz.schoolYear,
          topic: quiz.topic,
          disciplineId: quiz.disciplineId,
          turmaId: quiz.turmaId,
          bimester: null,
          assessment: null,
          totalQuestions: quiz.questions.length,
          maxScore,
          estimatedDurationMinutes: quiz.estimatedDurationMinutes,
          createdById,
          questions: {
            create: quiz.questions.map((question) =>
              this.nestedQuestion(question),
            ),
          },
        },
        select: QUIZ_ADMIN_SELECT,
      });
    });
  }

  private adminQuiz(transaction: Prisma.TransactionClient, id: string) {
    return transaction.simulation.findUniqueOrThrow({
      where: { id },
      select: QUIZ_ADMIN_SELECT,
    });
  }

  private withLockedQuiz<T>(
    id: string,
    operation: (
      transaction: Prisma.TransactionClient,
      quiz: PrivateQuiz,
    ) => Promise<T>,
  ): Promise<T> {
    return this.runTransaction(async (transaction) => {
      const rows = await transaction.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT "id" FROM "Simulation"
        WHERE "id" = ${id} AND "activityKind" = 'QUIZ' AND "deletedAt" IS NULL
        FOR UPDATE
      `);
      if (rows.length === 0) {
        throw new NotFoundException('Quiz not found');
      }
      const quiz = await transaction.simulation.findUniqueOrThrow({
        where: { id },
        include: QUIZ_PRIVATE_INCLUDE,
      });
      return operation(transaction, quiz);
    });
  }

  private async runTransaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(operation);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Quiz identity, version or slug already exists',
        );
      }
      throw error;
    }
  }

  private async lockActivityKey(
    transaction: Prisma.TransactionClient,
    activityKey: string,
  ) {
    await transaction.$queryRaw(Prisma.sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${activityKey}, 0))::text AS "locked"
    `);
  }

  private async assertReferences(
    transaction: Prisma.TransactionClient,
    disciplineId: string,
    turmaId: string | null | undefined,
  ): Promise<void> {
    const discipline = await transaction.discipline.findFirst({
      where: { id: disciplineId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!discipline) {
      throw new BadRequestException('Active discipline not found');
    }
    if (turmaId) {
      const turma = await transaction.turma.findFirst({
        where: { id: turmaId, deletedAt: null },
        select: { id: true },
      });
      if (!turma) {
        throw new BadRequestException('Active turma not found');
      }
    }
  }

  private versionSlug(activityKey: string, contentVersion: number): string {
    return slugify(`quiz-${activityKey}-v${contentVersion}`);
  }

  private createQuestionData(questions: QuizQuestionDto[]) {
    return questions.map((question, index) => ({
      originKey: question.originKey,
      type: QuestionType.MULTIPLE_CHOICE,
      statement: question.statement.trim(),
      explanation: question.explanation.trim(),
      tip: question.tip?.trim() ?? null,
      funFact: question.funFact?.trim() ?? null,
      media: null,
      points: new Prisma.Decimal(question.points),
      sortOrder: index + 1,
      options: question.options.map((option, optionIndex) => ({
        optionKey: option.optionKey.trim(),
        text: option.text.trim(),
        sortOrder: optionIndex + 1,
      })),
      answers: [
        { answerKey: 'correctAnswer', answerValue: question.correctAnswer },
      ],
    }));
  }

  private nestedQuestion(
    question:
      | PrivateQuiz['questions'][number]
      | ReturnType<QuizzesService['createQuestionData']>[number],
  ): Prisma.QuestionCreateWithoutSimulationInput {
    return {
      originKey: question.originKey,
      type: question.type,
      statement: question.statement,
      explanation: question.explanation,
      tip: question.tip,
      funFact: question.funFact,
      points: question.points,
      sortOrder: question.sortOrder,
      options: {
        create: question.options.map((option) => ({
          optionKey: option.optionKey,
          text: option.text,
          sortOrder: option.sortOrder,
        })),
      },
      answers: {
        create: question.answers.map((answer) => ({
          answerKey: answer.answerKey,
          answerValue: answer.answerValue,
        })),
      },
    };
  }
}

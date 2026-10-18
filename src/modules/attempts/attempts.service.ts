import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityKind,
  AttemptStatus,
  AttemptPracticeMode,
  Prisma,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from '../turmas/turmas.service';
import { assertQuizContentReady } from '../quizzes/quiz-content.validation';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { QuizAttemptsService } from './quiz-attempts.service';
import { SimulationFeedbackService } from './simulation-feedback.service';
import { classificationMode } from './simulation-feedback.contract';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  LearningSkillsService,
  QUESTION_SKILL_INCLUDE,
} from '../learning-skills/learning-skills.service';

interface RequestUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correctionService: AttemptsCorrectionService,
    private readonly turmasService: TurmasService,
    private readonly quizAttemptsService: QuizAttemptsService,
    private readonly learningSkills: LearningSkillsService,
    private readonly simulationFeedback: SimulationFeedbackService,
  ) {}

  async startAttempt(
    simulationIdOrSlug: string,
    student: { id: string; role: UserRole },
    immediateFeedback = false,
  ) {
    if (immediateFeedback)
      return this.simulationFeedback.start(simulationIdOrSlug, student);
    // The simulation row serializes simultaneous starts. The partial database
    // index remains the last line of protection against duplicate open attempts.
    return this.prisma.$transaction(async (transaction) => {
      const simulationId = await this.lockActivity(
        transaction,
        simulationIdOrSlug,
        ActivityKind.SIMULATION,
      );
      const simulation = await transaction.simulation.findFirst({
        where: {
          id: simulationId,
          activityKind: ActivityKind.SIMULATION,
          status: SimulationStatus.PUBLISHED,
          deletedAt: null,
        },
        include: {
          questions: {
            where: { isActive: true, deletedAt: null },
            select: { id: true },
          },
        },
      });
      if (!simulation) {
        throw new NotFoundException('Published simulation not found');
      }
      if (simulation.questions.length === 0) {
        throw new BadRequestException('Simulation has no active questions');
      }
      await this.turmasService.assertCanAccessTurma(
        simulation.turmaId,
        student,
        transaction,
      );
      const openAttempt = await transaction.attempt.findFirst({
        where: {
          studentId: student.id,
          simulationId: simulation.id,
          status: AttemptStatus.IN_PROGRESS,
        },
        include: { simulation: { include: { discipline: true } } },
      });
      if (openAttempt) {
        return openAttempt;
      }
      return transaction.attempt.create({
        data: {
          studentId: student.id,
          simulationId: simulation.id,
          status: AttemptStatus.IN_PROGRESS,
          maxScore: simulation.maxScore,
        },
        include: { simulation: { include: { discipline: true } } },
      });
    });
  }

  async startQuizAttempt(quizIdOrSlug: string, student: RequestUser) {
    return this.startQuizPractice(
      quizIdOrSlug,
      student,
      AttemptPracticeMode.NORMAL,
    );
  }

  async startReviewAttempt(quizId: string, student: RequestUser) {
    return this.startQuizPractice(quizId, student, AttemptPracticeMode.REVIEW);
  }

  private async startQuizPractice(
    quizIdOrSlug: string,
    student: RequestUser,
    practiceMode: AttemptPracticeMode,
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const quizId = await this.lockActivity(
        transaction,
        quizIdOrSlug,
        ActivityKind.QUIZ,
      );
      const quiz = await transaction.simulation.findFirst({
        where: {
          id: quizId,
          activityKind: ActivityKind.QUIZ,
          deletedAt: null,
          publishedAt: { not: null },
          status: {
            in: [SimulationStatus.PUBLISHED, SimulationStatus.ARCHIVED],
          },
        },
        include: {
          discipline: true,
          questions: {
            where: { isActive: true, deletedAt: null },
            include: {
              options: { orderBy: { sortOrder: 'asc' } },
              answers: true,
              ...QUESTION_SKILL_INCLUDE,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      if (!quiz) {
        throw new NotFoundException('Published quiz not found');
      }
      await this.learningSkills.assertStudent(transaction, student.id);
      await this.assertQuizAccess(transaction, quiz, student);
      if (
        practiceMode === AttemptPracticeMode.REVIEW &&
        quiz.status !== SimulationStatus.PUBLISHED
      ) {
        throw new NotFoundException('Published quiz not found');
      }
      const openAttempt = await transaction.attempt.findFirst({
        where: {
          studentId: student.id,
          simulationId: quiz.id,
          practiceMode,
          status: AttemptStatus.IN_PROGRESS,
        },
        include: { simulation: { include: { discipline: true } } },
      });
      if (openAttempt) {
        const snapshotCount = await transaction.attemptQuestionSnapshot.count({
          where: { attemptId: openAttempt.id },
        });
        if (snapshotCount === 0) {
          throw new BadRequestException(
            'Quiz attempt has no question snapshots',
          );
        }
        return openAttempt;
      }
      if (quiz.status !== SimulationStatus.PUBLISHED) {
        throw new NotFoundException('Published quiz not found');
      }
      if (practiceMode === AttemptPracticeMode.NORMAL) {
        await this.learningSkills.refreshQuestionSkills(
          transaction,
          quiz.questions,
        );
      }
      const selected =
        practiceMode === AttemptPracticeMode.REVIEW
          ? await this.learningSkills.reviewQuestions(
              transaction,
              student.id,
              quiz,
            )
          : quiz.questions.map((question) => ({
              question,
              practicedBefore: false,
            }));
      const questions = selected.map((row) => row.question);
      const maxScore = assertQuizContentReady(questions);
      const attempt = await transaction.attempt.create({
        data: {
          studentId: student.id,
          simulationId: quiz.id,
          activityKey: quiz.activityKey,
          contentVersion: quiz.contentVersion,
          practiceMode,
          status: AttemptStatus.IN_PROGRESS,
          maxScore,
        },
        include: { simulation: { include: { discipline: true } } },
      });
      await transaction.attemptQuestionSnapshot.createMany({
        data: selected.map(({ question, practicedBefore }, index) => ({
          attemptId: attempt.id,
          questionId: question.id,
          originKey: question.originKey!,
          type: question.type,
          statement: question.statement,
          tip: question.tip,
          funFact: question.funFact,
          explanation: question.explanation!,
          media:
            question.media === null
              ? Prisma.DbNull
              : (question.media as Prisma.InputJsonValue),
          points: question.points,
          sortOrder: index + 1,
          ...this.learningSkills.snapshotSkill(question, quiz),
          practicedBefore,
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
        })),
      });
      return attempt;
    });
  }

  async findAttempt(id: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(id);
    this.assertCanAccessAttempt(attempt.studentId, user);
    if (attempt.immediateFeedback)
      return this.simulationFeedback.getAttempt(id, user);
    if (attempt.practiceMode === AttemptPracticeMode.REVIEW) {
      return this.quizAttemptsService.getAttempt(id, user);
    }
    return attempt;
  }

  async getAttemptQuestions(attemptId: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);

    if (attempt.simulation.activityKind === ActivityKind.QUIZ) {
      return this.quizAttemptsService.getQuestions(attemptId, user);
    }
    if (attempt.immediateFeedback)
      return this.simulationFeedback.getQuestions(attemptId, user);

    const questions = await this.prisma.question.findMany({
      where: {
        simulationId: attempt.simulationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        answers: { select: { answerValue: true } },
        options: {
          orderBy: { sortOrder: 'asc' },
        },
        // A própria resposta do aluno, para que retomar a tentativa recupere o
        // que ele já tinha marcado. Continua sem expor o gabarito.
        attemptAnswers: {
          where: { attemptId },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return questions.map((question) => ({
      id: question.id,
      type: question.type,
      classificationMode: classificationMode(question.type, question.answers),
      statement: question.statement,
      tip: question.tip,
      funFact: question.funFact,
      points: question.points,
      order: question.sortOrder,
      answer: question.attemptAnswers[0]?.answer ?? null,
      options: question.options.map((option) => ({
        id: option.id,
        optionKey: option.optionKey,
        text: option.text,
        groupKey: option.groupKey,
        order: option.sortOrder,
      })),
    }));
  }

  async findMyAttempts(studentId: string) {
    return this.prisma.attempt.findMany({
      where: {
        studentId,
        simulation: { activityKind: ActivityKind.SIMULATION },
      },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyQuizAttempts(studentId: string) {
    // History contains metadata and totals only; private snapshots are never
    // included, including after a membership has been revoked.
    return this.prisma.attempt.findMany({
      where: {
        studentId,
        simulation: { activityKind: ActivityKind.QUIZ },
      },
      include: { simulation: { include: { discipline: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitAnswer(
    attemptId: string,
    questionId: string,
    dto: SubmitAnswerDto,
    user: RequestUser,
  ) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);
    if (attempt.simulation.activityKind === ActivityKind.QUIZ) {
      return this.quizAttemptsService.confirmAnswer(
        attemptId,
        questionId,
        dto.answer,
        user,
      );
    }
    if (attempt.immediateFeedback)
      return this.simulationFeedback.confirm(
        attemptId,
        questionId,
        dto.answer,
        user,
      );
    this.assertAttemptInProgress(attempt.status);

    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        simulationId: attempt.simulationId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found for this attempt');
    }

    return this.prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        answer: dto.answer as Prisma.InputJsonValue,
      },
      update: {
        answer: dto.answer as Prisma.InputJsonValue,
        isCorrect: null,
        pointsEarned: null,
      },
    });
  }

  async finishAttempt(attemptId: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);
    if (attempt.simulation.activityKind === ActivityKind.QUIZ) {
      return this.quizAttemptsService.finish(attemptId, user);
    }
    if (attempt.immediateFeedback)
      return this.simulationFeedback.finish(attemptId, user);
    this.assertAttemptInProgress(attempt.status);

    const questions = await this.prisma.question.findMany({
      where: {
        simulationId: attempt.simulationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        answers: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
    const submittedAnswers = await this.prisma.attemptAnswer.findMany({
      where: { attemptId },
    });
    const submittedByQuestionId = new Map(
      submittedAnswers.map((answer) => [answer.questionId, answer]),
    );

    let score = 0;
    let correctCount = 0;

    await this.prisma.$transaction(
      questions.map((question) => {
        const submittedAnswer = submittedByQuestionId.get(question.id);
        const correction = this.correctionService.correct({
          type: question.type,
          points: question.points,
          officialAnswers: question.answers,
          submittedAnswer: submittedAnswer?.answer ?? null,
        });

        if (correction.isCorrect) {
          correctCount += 1;
          score += correction.pointsEarned;
        }

        return this.prisma.attemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: question.id,
            },
          },
          create: {
            attemptId,
            questionId: question.id,
            answer: {},
            isCorrect: correction.isCorrect,
            pointsEarned: correction.pointsEarned,
          },
          update: {
            isCorrect: correction.isCorrect,
            pointsEarned: correction.pointsEarned,
          },
        });
      }),
    );

    const wrongCount = questions.length - correctCount;
    const percentage =
      attempt.maxScore.toNumber() > 0
        ? Number(((score / attempt.maxScore.toNumber()) * 100).toFixed(2))
        : 0;
    const finishedAt = new Date();
    const durationSeconds = Math.max(
      0,
      Math.floor((finishedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    const finishedAttempt = await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.FINISHED,
        finishedAt,
        score,
        percentage,
        correctCount,
        wrongCount,
        durationSeconds,
      },
    });

    return this.getResult(finishedAttempt.id, user);
  }

  async getResult(attemptId: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);
    if (attempt.simulation.activityKind === ActivityKind.QUIZ) {
      return this.quizAttemptsService.getResult(attemptId, user);
    }
    if (attempt.immediateFeedback)
      return this.simulationFeedback.result(attemptId, user);

    if (attempt.status !== AttemptStatus.FINISHED) {
      throw new BadRequestException('Attempt is not finished');
    }

    const questions = await this.prisma.question.findMany({
      where: {
        simulationId: attempt.simulationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        answers: { select: { answerValue: true } },
        attemptAnswers: {
          where: { attemptId },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      attempt,
      questions: questions.map((question) => {
        const attemptAnswer = question.attemptAnswers[0];

        return {
          id: question.id,
          type: question.type,
          classificationMode: classificationMode(question.type, question.answers),
          statement: question.statement,
          tip: question.tip,
          funFact: question.funFact,
          points: question.points,
          order: question.sortOrder,
          answer: attemptAnswer?.answer ?? null,
          isCorrect: attemptAnswer?.isCorrect ?? false,
          pointsEarned: attemptAnswer?.pointsEarned ?? 0,
        };
      }),
    };
  }

  private async lockActivity(
    transaction: Prisma.TransactionClient,
    idOrSlug: string,
    activityKind: ActivityKind,
    shared = false,
  ): Promise<string> {
    const lockMode = shared ? Prisma.sql`FOR SHARE` : Prisma.sql`FOR UPDATE`;
    const rows = await transaction.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Simulation"
      WHERE ("id" = ${idOrSlug} OR "slug" = ${idOrSlug})
        AND "activityKind" = ${activityKind}::"ActivityKind"
      ${lockMode}
    `;
    if (rows.length !== 1) {
      throw new NotFoundException(
        activityKind === ActivityKind.QUIZ
          ? 'Published quiz not found'
          : 'Published simulation not found',
      );
    }
    return rows[0].id;
  }

  private async assertQuizAccess(
    database: Prisma.TransactionClient,
    quiz: {
      turmaId: string | null;
      discipline: { isActive: boolean; deletedAt: Date | null };
    },
    user: RequestUser,
  ): Promise<void> {
    if (!quiz.discipline.isActive || quiz.discipline.deletedAt) {
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

  private async findAttemptOrThrow(id: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        simulation: {
          include: {
            discipline: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return attempt;
  }

  private assertCanAccessAttempt(studentId: string, user: RequestUser): void {
    if (user.role === UserRole.ADMIN || user.id === studentId) {
      return;
    }

    throw new ForbiddenException('Cannot access this attempt');
  }

  private assertAttemptInProgress(status: AttemptStatus): void {
    if (status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress');
    }
  }
}

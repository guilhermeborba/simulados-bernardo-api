import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttemptStatus,
  Prisma,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

interface RequestUser {
  id: string;
  role: UserRole;
}

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correctionService: AttemptsCorrectionService,
  ) {}

  async startAttempt(simulationId: string, studentId: string) {
    const simulation = await this.prisma.simulation.findFirst({
      where: {
        id: simulationId,
        status: SimulationStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        questions: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!simulation) {
      throw new NotFoundException('Published simulation not found');
    }

    if (simulation.questions.length === 0) {
      throw new BadRequestException('Simulation has no active questions');
    }

    return this.prisma.attempt.create({
      data: {
        studentId,
        simulationId,
        status: AttemptStatus.IN_PROGRESS,
        maxScore: simulation.maxScore,
      },
    });
  }

  async findAttempt(id: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(id);
    this.assertCanAccessAttempt(attempt.studentId, user);

    return attempt;
  }

  async findMyAttempts(studentId: string) {
    return this.prisma.attempt.findMany({
      where: { studentId },
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

  async submitAnswer(
    attemptId: string,
    questionId: string,
    dto: SubmitAnswerDto,
    user: RequestUser,
  ) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);
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
          statement: question.statement,
          tip: question.tip,
          points: question.points,
          order: question.sortOrder,
          answer: attemptAnswer?.answer ?? null,
          isCorrect: attemptAnswer?.isCorrect ?? false,
          pointsEarned: attemptAnswer?.pointsEarned ?? 0,
        };
      }),
    };
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

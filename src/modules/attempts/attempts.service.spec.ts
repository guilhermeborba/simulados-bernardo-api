import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  AttemptStatus,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { AttemptsService } from './attempts.service';

describe('AttemptsService', () => {
  let service: AttemptsService;
  let prisma: {
    simulation: {
      findFirst: jest.Mock;
    };
    attempt: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    question: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    attemptAnswer: {
      upsert: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const student = {
    id: 'student-1',
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    prisma = {
      simulation: {
        findFirst: jest.fn(),
      },
      attempt: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      question: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      attemptAnswer: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(async (operations: unknown[]) => operations),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AttemptsService,
        AttemptsCorrectionService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = moduleRef.get(AttemptsService);
  });

  it('starts an attempt for a published simulation', async () => {
    prisma.simulation.findFirst.mockResolvedValue({
      id: 'simulation-1',
      status: SimulationStatus.PUBLISHED,
      maxScore: new Prisma.Decimal(2),
      questions: [{ id: 'question-1' }],
    });
    prisma.attempt.create.mockResolvedValue({
      id: 'attempt-1',
      status: AttemptStatus.IN_PROGRESS,
    });

    await expect(
      service.startAttempt('simulation-1', student.id),
    ).resolves.toMatchObject({
      id: 'attempt-1',
      status: AttemptStatus.IN_PROGRESS,
    });
    expect(prisma.attempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: student.id,
        simulationId: 'simulation-1',
        status: AttemptStatus.IN_PROGRESS,
        maxScore: new Prisma.Decimal(2),
      }),
    });
  });

  it('blocks answer updates after attempt is finished', async () => {
    prisma.attempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      studentId: student.id,
      simulationId: 'simulation-1',
      status: AttemptStatus.FINISHED,
      simulation: {},
    });

    await expect(
      service.submitAnswer(
        'attempt-1',
        'question-1',
        { answer: { answer: 'a' } },
        student,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks attempts owned by another student', async () => {
    prisma.attempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      studentId: 'other-student',
      simulationId: 'simulation-1',
      status: AttemptStatus.IN_PROGRESS,
      simulation: {},
    });

    await expect(service.findAttempt('attempt-1', student)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('finishes an attempt and calculates score', async () => {
    const startedAt = new Date(Date.now() - 30_000);
    prisma.attempt.findUnique
      .mockResolvedValueOnce({
        id: 'attempt-1',
        studentId: student.id,
        simulationId: 'simulation-1',
        status: AttemptStatus.IN_PROGRESS,
        startedAt,
        maxScore: new Prisma.Decimal(2),
        simulation: {},
      })
      .mockResolvedValueOnce({
        id: 'attempt-1',
        studentId: student.id,
        simulationId: 'simulation-1',
        status: AttemptStatus.FINISHED,
        startedAt,
        maxScore: new Prisma.Decimal(2),
        simulation: {},
      });
    prisma.question.findMany
      .mockResolvedValueOnce([
        {
          id: 'question-1',
          type: QuestionType.MULTIPLE_CHOICE,
          points: new Prisma.Decimal(1),
          answers: [createOfficialAnswer('correctAnswer', 'a')],
        },
        {
          id: 'question-2',
          type: QuestionType.MULTIPLE_CHOICE,
          points: new Prisma.Decimal(1),
          answers: [createOfficialAnswer('correctAnswer', 'b')],
        },
      ])
      .mockResolvedValueOnce([]);
    prisma.attemptAnswer.findMany.mockResolvedValue([
      {
        questionId: 'question-1',
        answer: { answer: 'a' },
      },
      {
        questionId: 'question-2',
        answer: { answer: 'c' },
      },
    ]);
    prisma.attemptAnswer.upsert.mockResolvedValue({});
    prisma.attempt.update.mockResolvedValue({
      id: 'attempt-1',
      status: AttemptStatus.FINISHED,
    });

    await service.finishAttempt('attempt-1', student);

    expect(prisma.attempt.update).toHaveBeenCalledWith({
      where: { id: 'attempt-1' },
      data: expect.objectContaining({
        status: AttemptStatus.FINISHED,
        score: 1,
        percentage: 50,
        correctCount: 1,
        wrongCount: 1,
        durationSeconds: expect.any(Number),
      }),
    });
  });

  function createOfficialAnswer(answerKey: string, answerValue: string) {
    return {
      id: `answer-${answerKey}`,
      questionId: 'question-1',
      answerKey,
      answerValue,
      metadata: null,
    };
  }
});

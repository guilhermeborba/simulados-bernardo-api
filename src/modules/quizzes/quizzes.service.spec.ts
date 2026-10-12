import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  ActivityKind,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { QUIZ_ADMIN_SELECT, QUIZ_METADATA_SELECT } from './quizzes.presenter';
import { QuizzesService } from './quizzes.service';

function fixture() {
  return {
    id: 'quiz-1',
    activityKey: 'quiz-logic',
    activityKind: ActivityKind.QUIZ,
    contentVersion: 1,
    title: 'Quiz de lógica',
    topic: 'Lógica',
    schoolYear: 0,
    disciplineId: 'discipline-1',
    turmaId: null,
    status: SimulationStatus.PUBLISHED as SimulationStatus,
    publishedAt: new Date('2026-10-12T00:00:00Z') as Date | null,
    totalQuestions: 1,
    maxScore: new Prisma.Decimal(1),
    questions: [
      {
        id: 'q1',
        originKey: 'q1',
        statement: 'Qual alternativa?',
        explanation: 'A explicação pertence ao conteúdo privado.',
        type: QuestionType.MULTIPLE_CHOICE,
        media: null,
        points: new Prisma.Decimal(1),
        sortOrder: 1,
        options: [
          { optionKey: 'A', text: 'Sim', sortOrder: 1 },
          { optionKey: 'B', text: 'Não', sortOrder: 2 },
        ],
        answers: [{ answerKey: 'correctAnswer', answerValue: 'A' }],
      },
    ],
  };
}

function setup(quiz = fixture()) {
  const transaction = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: quiz.id }]),
    simulation: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(quiz),
      update: jest.fn().mockResolvedValue({ id: quiz.id }),
      aggregate: jest.fn().mockResolvedValue({ _max: { contentVersion: 4 } }),
      create: jest.fn().mockResolvedValue({ id: 'quiz-5', contentVersion: 5 }),
    },
    discipline: {
      findFirst: jest.fn().mockResolvedValue({ id: 'discipline-1' }),
    },
    turma: { findFirst: jest.fn().mockResolvedValue({ id: 'turma-1' }) },
  };
  const prisma = {
    $transaction: jest.fn((operation: (client: unknown) => Promise<unknown>) =>
      operation(transaction),
    ),
    simulation: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };
  return {
    service: new QuizzesService(prisma as unknown as PrismaService),
    transaction,
    prisma,
  };
}

describe('QuizzesService', () => {
  it('keeps published content immutable, even if manually moved back to draft', async () => {
    const quiz = fixture();
    quiz.status = SimulationStatus.DRAFT;
    const { service, transaction } = setup(quiz);
    await expect(
      service.update(quiz.id, { title: 'Alterado' }),
    ).rejects.toThrow(ConflictException);
    expect(transaction.simulation.update).not.toHaveBeenCalled();
  });

  it('clears nullable draft metadata with explicit nulls', async () => {
    const quiz = fixture();
    quiz.status = SimulationStatus.DRAFT;
    quiz.publishedAt = null;
    const { service, transaction } = setup(quiz);
    await service.update(quiz.id, {
      subtitle: null,
      turmaId: null,
      estimatedDurationMinutes: null,
    });
    expect(transaction.simulation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtitle: null,
          turmaId: null,
          estimatedDurationMinutes: null,
        }),
      }),
    );
  });

  it('clones to the highest logical version plus one, preserving question origins privately', async () => {
    const { service, transaction } = setup();
    await expect(
      service.createVersion('quiz-1', 'admin-1'),
    ).resolves.toMatchObject({ contentVersion: 5 });
    const call = transaction.simulation.create.mock.calls[0][0] as {
      data: {
        activityKey: string;
        contentVersion: number;
        questions: { create: { originKey: string; answers: unknown }[] };
      };
      select: unknown;
    };
    expect(call.data.activityKey).toBe('quiz-logic');
    expect(call.data.contentVersion).toBe(5);
    expect(call.data.questions.create[0].originKey).toBe('q1');
    expect(call.data.questions.create[0].answers).toEqual({
      create: [{ answerKey: 'correctAnswer', answerValue: 'A' }],
    });
    expect(call.select).toBe(QUIZ_ADMIN_SELECT);
  });

  it('uses an explicit metadata-only catalogue and filters membership for teacher', async () => {
    const { service, prisma } = setup();
    await service.findAvailable(
      { schoolYear: 0 },
      { id: 'teacher-1', role: UserRole.TEACHER },
    );
    const call = prisma.simulation.findMany.mock.calls[0][0] as {
      where: { schoolYear: number; OR: unknown[] };
      select: unknown;
      distinct: string[];
    };
    expect(call.select).toBe(QUIZ_METADATA_SELECT);
    expect(call.where.schoolYear).toBe(0);
    expect(call.where.OR).toContainEqual({
      turma: {
        deletedAt: null,
        memberships: { some: { userId: 'teacher-1' } },
      },
    });
    expect(call.distinct).toEqual(['activityKey']);
    expect(QUIZ_METADATA_SELECT).not.toHaveProperty('questions');
    expect(QUIZ_ADMIN_SELECT.questions.select).not.toHaveProperty('answers');
  });

  it('does not expose or mutate a legacy simulation through quiz lookup', async () => {
    const { service, transaction } = setup();
    transaction.$queryRaw.mockResolvedValue([]);
    await expect(service.archive('legacy-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(transaction.simulation.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});

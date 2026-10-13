import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityKind,
  LearningSkillStatus,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as quizMedia from './media/quiz-media';
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
        media: null as Prisma.JsonValue | null,
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
    learningSkill: { findUniqueOrThrow: jest.fn(), findMany: jest.fn() },
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
  afterEach(() => jest.restoreAllMocks());

  it('normalizes registered media before storing a new question', async () => {
    const media = {
      image: {
        assetId: 'counting-image',
        sha256: 'a'.repeat(64),
        alt: 'Dois círculos.',
      },
    };
    const normalize = jest
      .spyOn(quizMedia, 'normalizeQuizMedia')
      .mockReturnValue(media);
    const ready = jest
      .spyOn(quizMedia, 'assertQuizMediaReady')
      .mockImplementation(() => undefined);
    const { service, transaction } = setup();
    const requestMedia = {
      image: { assetId: 'counting-image', alt: 'Dois círculos.' },
    };
    await service.create(
      {
        activityKey: 'quiz-counting',
        disciplineId: 'discipline-1',
        schoolYear: 1,
        title: 'Contando formas',
        topic: 'Contagem',
        questions: [
          {
            originKey: 'counting-q1',
            statement: 'Quantos círculos?',
            explanation: 'São dois círculos.',
            points: 1,
            options: [
              { optionKey: 'A', text: 'Um' },
              { optionKey: 'B', text: 'Dois' },
            ],
            correctAnswer: 'B',
            media: requestMedia,
          },
        ],
      },
      'admin-1',
    );
    expect(normalize).toHaveBeenCalledWith(requestMedia);
    expect(ready).toHaveBeenCalledWith(media);
    expect(transaction.simulation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          questions: { create: [expect.objectContaining({ media })] },
        }),
      }),
    );
    expect(QUIZ_ADMIN_SELECT.questions.select.media).toBe(true);
  });

  it('preserves pinned media when creating a new editorial version', async () => {
    const quiz = fixture();
    const media = {
      audio: {
        assetId: 'counting-audio',
        sha256: 'b'.repeat(64),
        transcript: 'Conte as formas.',
      },
    };
    quiz.questions[0].media = media;
    const ready = jest
      .spyOn(quizMedia, 'assertQuizMediaReady')
      .mockImplementation(() => undefined);
    const { service, transaction } = setup(quiz);
    await service.createVersion(quiz.id, 'admin-1');
    expect(ready).toHaveBeenCalledWith(media);
    expect(transaction.simulation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          questions: { create: [expect.objectContaining({ media })] },
        }),
      }),
    );
  });

  it('rejects unavailable registered media before publication without changing the draft', async () => {
    const quiz = fixture();
    quiz.status = SimulationStatus.DRAFT;
    quiz.publishedAt = null;
    quiz.questions[0].media = {
      image: {
        assetId: 'missing-image',
        sha256: 'a'.repeat(64),
        alt: 'Imagem indisponível.',
      },
    };
    const { service, transaction } = setup(quiz);
    await expect(service.publish(quiz.id)).rejects.toThrow(BadRequestException);
    expect(transaction.simulation.update).not.toHaveBeenCalled();
  });

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
  it('blocks publication of questions linked to a pending skill review', async () => {
    const quiz = fixture();
    quiz.status = SimulationStatus.DRAFT;
    quiz.publishedAt = null;
    Object.assign(quiz.questions[0], { skill: { skill: { id: 'skill-1' } } });
    const { service, transaction } = setup(quiz);
    transaction.learningSkill.findMany.mockResolvedValue([
      {
        id: 'skill-1',
        disciplineId: quiz.disciplineId,
        schoolYear: quiz.schoolYear,
        status: LearningSkillStatus.DRAFT,
        deletedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        publishedAt: null,
      },
    ]);
    await expect(service.publish(quiz.id)).rejects.toThrow(BadRequestException);
    expect(transaction.simulation.update).not.toHaveBeenCalled();
  });
  it('preserves approved skill links when cloning a published quiz version', async () => {
    const quiz = fixture();
    Object.assign(quiz.questions[0], { skill: { skill: { id: 'skill-1' } } });
    const { service, transaction } = setup(quiz);
    transaction.learningSkill.findMany.mockResolvedValue([
      {
        id: 'skill-1',
        disciplineId: quiz.disciplineId,
        schoolYear: quiz.schoolYear,
        status: LearningSkillStatus.PUBLISHED,
        deletedAt: null,
        reviewedBy: 'admin',
        reviewedAt: new Date(),
        publishedAt: new Date(),
      },
    ]);
    await service.createVersion(quiz.id, 'admin');
    expect(transaction.simulation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          questions: {
            create: [
              expect.objectContaining({
                skill: { create: { skillId: 'skill-1' } },
              }),
            ],
          },
        }),
      }),
    );
  });
  it('rejects a draft year change that contradicts its immutable skill audience', async () => {
    const quiz = fixture();
    quiz.status = SimulationStatus.DRAFT;
    quiz.publishedAt = null;
    Object.assign(quiz.questions[0], { skill: { skill: { id: 'skill-1' } } });
    const { service, transaction } = setup(quiz);
    transaction.learningSkill.findMany.mockResolvedValue([
      {
        id: 'skill-1',
        disciplineId: quiz.disciplineId,
        schoolYear: quiz.schoolYear,
        status: LearningSkillStatus.DRAFT,
        deletedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        publishedAt: null,
      },
    ]);
    await expect(service.update(quiz.id, { schoolYear: 1 })).rejects.toThrow(
      BadRequestException,
    );
    expect(transaction.simulation.update).not.toHaveBeenCalled();
  });
});

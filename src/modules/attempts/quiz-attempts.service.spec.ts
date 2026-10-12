import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  ActivityKind,
  AttemptStatus,
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { TurmasService } from '../turmas/turmas.service';
import { AttemptsCorrectionService } from './attempts-correction.service';
import { AttemptsService } from './attempts.service';

function makeQuiz() {
  return {
    id: 'quiz-1',
    activityKind: ActivityKind.QUIZ,
    activityKey: 'math-count',
    contentVersion: 1,
    status: SimulationStatus.PUBLISHED as SimulationStatus,
    publishedAt: new Date(),
    deletedAt: null,
    turmaId: null as string | null,
    discipline: { isActive: true, deletedAt: null as Date | null },
    maxScore: new Prisma.Decimal(99),
    questions: [
      {
        id: 'question-1',
        originKey: 'count-1',
        type: QuestionType.MULTIPLE_CHOICE,
        statement: 'Quanto é 1 + 1?',
        tip: 'Conte os objetos.',
        funFact: 'Curiosidade revelada depois.',
        explanation: 'Um objeto e mais um formam dois objetos.',
        media: null,
        points: new Prisma.Decimal('1.25'),
        sortOrder: 1,
        options: [
          { id: 'option-a', optionKey: 'A', text: '1', groupKey: null, sortOrder: 1 },
          { id: 'option-b', optionKey: 'B', text: '2', groupKey: null, sortOrder: 2 },
        ],
        answers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
      },
    ],
  };
}

function makeAttempt(quiz = makeQuiz()) {
  return {
    id: 'attempt-1',
    studentId: 'student-1',
    simulationId: quiz.id,
    activityKey: quiz.activityKey,
    contentVersion: quiz.contentVersion,
    status: AttemptStatus.IN_PROGRESS,
    maxScore: new Prisma.Decimal('1.25'),
    simulation: quiz,
  };
}

function makeDatabase() {
  const database = {
    simulation: { findFirst: jest.fn().mockResolvedValue(makeQuiz()) },
    turma: { findFirst: jest.fn().mockResolvedValue({ id: 'turma-1' }) },
    attempt: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(makeAttempt()),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue(makeAttempt()),
    },
    question: { findMany: jest.fn(), findFirst: jest.fn() },
    attemptAnswer: { findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn() },
    attemptQuestionSnapshot: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([
        {
          questionId: 'question-1',
          originKey: 'count-1',
          type: QuestionType.MULTIPLE_CHOICE,
          statement: 'Enunciado preservado na tentativa.',
          tip: 'Dica preservada.',
          funFact: 'Curiosidade privada.',
          explanation: 'Explicação privada.',
          points: new Prisma.Decimal('1.25'),
          sortOrder: 1,
          options: [
            {
              id: 'option-b',
              optionKey: 'B',
              text: '2',
              groupKey: null,
              order: 1,
              correctAnswer: 'Do not expose storage extras',
            },
          ],
          officialAnswers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
        },
      ]),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ id: 'quiz-1' }]),
    $transaction: jest.fn<Promise<unknown>, [unknown]>(),
  };
  database.$transaction.mockImplementation(async (operation) =>
    (operation as (transaction: typeof database) => Promise<unknown>)(database),
  );
  return database;
}

describe('Quiz attempt foundation', () => {
  const student = { id: 'student-1', role: UserRole.STUDENT };
  let database: ReturnType<typeof makeDatabase>;
  let service: AttemptsService;

  beforeEach(() => {
    database = makeDatabase();
    service = new AttemptsService(
      database as unknown as PrismaService,
      new AttemptsCorrectionService(),
      { assertCanAccessTurma: jest.fn() } as unknown as TurmasService,
    );
  });

  it('copies the content version and derives the score from snapshotted questions', async () => {
    await service.startQuizAttempt('quiz-1', student);
    expect(database.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityKey: 'math-count',
          contentVersion: 1,
          maxScore: new Prisma.Decimal('1.25'),
        }),
      }),
    );
    expect(database.attemptQuestionSnapshot.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          attemptId: 'attempt-1',
          questionId: 'question-1',
          originKey: 'count-1',
          explanation: 'Um objeto e mais um formam dois objetos.',
          officialAnswers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
          options: [
            { id: 'option-a', optionKey: 'A', text: '1', groupKey: null, order: 1 },
            { id: 'option-b', optionKey: 'B', text: '2', groupKey: null, order: 2 },
          ],
        }),
      ],
    });
  });

  it('resumes an archived quiz without replacing the stored questions', async () => {
    const quiz = { ...makeQuiz(), status: SimulationStatus.ARCHIVED, questions: [] };
    database.simulation.findFirst.mockResolvedValue(quiz);
    database.attempt.findFirst.mockResolvedValue(makeAttempt(quiz));
    await expect(service.startQuizAttempt('quiz-1', student)).resolves.toMatchObject({
      id: 'attempt-1',
    });
    expect(database.attempt.create).not.toHaveBeenCalled();
    expect(database.attemptQuestionSnapshot.createMany).not.toHaveBeenCalled();
  });

  it('refuses new attempts on an archived quiz', async () => {
    database.simulation.findFirst.mockResolvedValue({
      ...makeQuiz(),
      status: SimulationStatus.ARCHIVED,
    });
    await expect(service.startQuizAttempt('quiz-1', student)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(database.attempt.create).not.toHaveBeenCalled();
  });

  it('refuses to start when private turma membership has been revoked', async () => {
    database.simulation.findFirst.mockResolvedValue({ ...makeQuiz(), turmaId: 'turma-1' });
    database.turma.findFirst.mockResolvedValue(null);
    await expect(service.startQuizAttempt('quiz-1', student)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(database.attempt.create).not.toHaveBeenCalled();
  });

  it('refuses inactive disciplines even for otherwise published quizzes', async () => {
    database.simulation.findFirst.mockResolvedValue({
      ...makeQuiz(),
      discipline: { isActive: false, deletedAt: null },
    });
    await expect(service.startQuizAttempt('quiz-1', student)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('never falls back to live content if an open quiz attempt lacks snapshots', async () => {
    database.attempt.findFirst.mockResolvedValue(makeAttempt());
    database.attemptQuestionSnapshot.count.mockResolvedValue(0);
    await expect(service.startQuizAttempt('quiz-1', student)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(database.attemptQuestionSnapshot.createMany).not.toHaveBeenCalled();
  });

  it('reads preserved snapshots and explicitly removes feedback and answer keys', async () => {
    const result = await service.getAttemptQuestions('attempt-1', student);
    expect(result).toEqual([
      {
        id: 'question-1',
        originKey: 'count-1',
        type: QuestionType.MULTIPLE_CHOICE,
        statement: 'Enunciado preservado na tentativa.',
        tip: 'Dica preservada.',
        points: new Prisma.Decimal('1.25'),
        order: 1,
        answer: null,
        options: [{ id: 'option-b', optionKey: 'B', text: '2', groupKey: null, order: 1 }],
      },
    ]);
    expect(database.question.findMany).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toMatch(/officialAnswers|correctAnswer|explanation|funFact/);
  });

  it('revalidates turma membership before reading snapshots', async () => {
    database.simulation.findFirst.mockResolvedValue({ ...makeQuiz(), turmaId: 'turma-1' });
    database.attempt.findUnique.mockResolvedValue(
      makeAttempt({ ...makeQuiz(), turmaId: 'turma-1' }),
    );
    database.turma.findFirst.mockResolvedValue(null);
    await expect(service.getAttemptQuestions('attempt-1', student)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(database.attemptQuestionSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('rechecks quiz visibility instead of trusting attempt metadata loaded before deletion', async () => {
    database.simulation.findFirst.mockResolvedValue(null);
    await expect(service.getAttemptQuestions('attempt-1', student)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(database.attemptQuestionSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('checks ownership before fetching private quiz content', async () => {
    await expect(
      service.getAttemptQuestions('attempt-1', { id: 'other-student', role: UserRole.STUDENT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(database.attemptQuestionSnapshot.findMany).not.toHaveBeenCalled();
  });

  it.each(['submitAnswer', 'finishAttempt', 'getResult'] as const)(
    'prevents %s from correcting a quiz with the legacy simulation flow',
    async (operation) => {
      const call = operation === 'submitAnswer'
        ? service.submitAnswer('attempt-1', 'question-1', { answer: { answer: 'B' } }, student)
        : service[operation]('attempt-1', student);
      await expect(call).rejects.toBeInstanceOf(BadRequestException);
      expect(database.question.findMany).not.toHaveBeenCalled();
      expect(database.attemptAnswer.upsert).not.toHaveBeenCalled();
    },
  );

  it('keeps quiz history separate from the simulation history', async () => {
    await service.findMyAttempts(student.id);
    await service.findMyQuizAttempts(student.id);
    expect(database.attempt.findMany.mock.calls.map(([query]) => query.where)).toEqual([
      { studentId: student.id, simulation: { activityKind: ActivityKind.SIMULATION } },
      { studentId: student.id, simulation: { activityKind: ActivityKind.QUIZ } },
    ]);
  });
});

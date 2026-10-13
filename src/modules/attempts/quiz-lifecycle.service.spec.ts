import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { LearningService } from '../learning/learning.service';
import { QuizAttemptsService } from './quiz-attempts.service';

type QuizAttempt = Prisma.AttemptGetPayload<{
  include: { simulation: { include: { discipline: true } } };
}>;

const student = { id: 'student-1', role: UserRole.STUDENT };
const instant = new Date('2026-10-12T12:00:00.000Z');

function snapshot(
  overrides: Partial<AttemptQuestionSnapshot> = {},
): AttemptQuestionSnapshot {
  return {
    id: 'snapshot-1',
    attemptId: 'attempt-1',
    questionId: 'question-1',
    originKey: 'soma-1',
    type: QuestionType.MULTIPLE_CHOICE,
    statement: 'Quanto é 2 + 2?',
    tip: 'Some dois pares.',
    funFact: 'Dois pares têm quatro objetos.',
    explanation: 'Dois objetos e mais dois objetos totalizam quatro.',
    media: null,
    points: new Prisma.Decimal('0.1'),
    sortOrder: 1,
    options: [
      { id: 'option-1', optionKey: 'A', text: '3', groupKey: null, order: 1 },
      { id: 'option-2', optionKey: 'B', text: '4', groupKey: null, order: 2 },
    ],
    officialAnswers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
    createdAt: instant,
    ...overrides,
  };
}

function confirmedAnswer(
  question: AttemptQuestionSnapshot,
  isCorrect = true,
  overrides: Partial<AttemptAnswer> = {},
): AttemptAnswer {
  const points = isCorrect ? question.points : new Prisma.Decimal(0);
  return {
    id: `answer-${question.questionId}`,
    attemptId: question.attemptId,
    questionId: question.questionId,
    answer: { optionKey: isCorrect ? 'B' : 'A' },
    confirmedAt: instant,
    isCorrect,
    pointsEarned: points,
    feedback: {
      isCorrect,
      pointsEarned: points.toNumber(),
      explanation: question.explanation,
      funFact: question.funFact,
    },
    createdAt: instant,
    ...overrides,
  };
}

function quizAttempt(): QuizAttempt {
  return {
    id: 'attempt-1',
    studentId: student.id,
    simulationId: 'quiz-1',
    activityKey: 'somando',
    contentVersion: 1,
    status: AttemptStatus.IN_PROGRESS,
    startedAt: instant,
    finishedAt: null,
    score: null,
    maxScore: new Prisma.Decimal('0.1'),
    percentage: null,
    correctCount: 0,
    wrongCount: 0,
    durationSeconds: null,
    createdAt: instant,
    updatedAt: instant,
    simulation: {
      id: 'quiz-1',
      title: 'Somando',
      subtitle: null,
      slug: 'quiz-somando-v1',
      schoolYear: 3,
      bimester: null,
      assessment: null,
      activityKind: ActivityKind.QUIZ,
      activityKey: 'somando',
      contentVersion: 1,
      topic: 'Adição',
      turmaId: null,
      disciplineId: 'discipline-1',
      status: SimulationStatus.PUBLISHED,
      totalQuestions: 1,
      maxScore: new Prisma.Decimal('0.1'),
      estimatedDurationMinutes: 2,
      createdById: 'admin-1',
      createdAt: instant,
      updatedAt: instant,
      publishedAt: instant,
      deletedAt: null,
      discipline: {
        id: 'discipline-1',
        name: 'Matemática',
        slug: 'matematica',
        description: null,
        icon: null,
        themeColor: null,
        isActive: true,
        createdAt: instant,
        updatedAt: instant,
        deletedAt: null,
      },
    },
  };
}

describe('QuizAttemptsService lifecycle', () => {
  let attempt: QuizAttempt;
  let snapshots: AttemptQuestionSnapshot[];
  let answers: AttemptAnswer[];
  let service: QuizAttemptsService;
  let correction: AttemptsCorrectionService;
  let rewards: { rewardFor: jest.Mock; recordCompletion: jest.Mock };
  let database: {
    attempt: { findUnique: jest.Mock; update: jest.Mock };
    attemptQuestionSnapshot: { findMany: jest.Mock; findUnique: jest.Mock };
    attemptAnswer: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    turma: { findFirst: jest.Mock };
    $queryRaw: jest.Mock;
  };

  beforeEach(() => {
    attempt = quizAttempt();
    snapshots = [snapshot()];
    answers = [];
    database = {
      attempt: {
        findUnique: jest.fn().mockImplementation(() => attempt),
        update: jest
          .fn()
          .mockImplementation(({ data }: { data: Partial<QuizAttempt> }) => {
            attempt = { ...attempt, ...data };
            return attempt;
          }),
      },
      attemptQuestionSnapshot: {
        findMany: jest.fn().mockImplementation(() => snapshots),
        findUnique: jest
          .fn()
          .mockImplementation(
            ({
              where,
            }: {
              where: { attemptId_questionId: { questionId: string } };
            }) =>
              snapshots.find(
                (question) =>
                  question.questionId === where.attemptId_questionId.questionId,
              ) ?? null,
          ),
      },
      attemptAnswer: {
        findMany: jest.fn().mockImplementation(() => answers),
        findUnique: jest
          .fn()
          .mockImplementation(
            ({
              where,
            }: {
              where: { attemptId_questionId: { questionId: string } };
            }) =>
              answers.find(
                (answer) =>
                  answer.questionId === where.attemptId_questionId.questionId,
              ) ?? null,
          ),
        create: jest
          .fn()
          .mockImplementation(() => confirmedAnswer(snapshots[0])),
        update: jest
          .fn()
          .mockImplementation(() => confirmedAnswer(snapshots[0])),
      },
      turma: { findFirst: jest.fn().mockResolvedValue({ id: 'turma-1' }) },
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'locked-row' }]),
    };
    const prisma = {
      $transaction: jest.fn(
        (action: (transaction: typeof database) => Promise<unknown>) =>
          action(database),
      ),
    };
    correction = new AttemptsCorrectionService();
    rewards = {
      rewardFor: jest
        .fn()
        .mockResolvedValue({ xpAwarded: 0, reason: 'LEGACY', day: null }),
      recordCompletion: jest.fn().mockResolvedValue({
        xpAwarded: 10,
        reason: 'AWARDED',
        day: '2026-10-12',
      }),
    };
    service = new QuizAttemptsService(
      prisma as unknown as PrismaService,
      correction,
      rewards as unknown as LearningService,
    );
  });

  it('checks ownership before any snapshot, lock or correction access', async () => {
    await expect(
      service.confirmAnswer(
        attempt.id,
        snapshots[0].questionId,
        { optionKey: 'B' },
        { id: 'other-student', role: UserRole.STUDENT },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(database.$queryRaw).not.toHaveBeenCalled();
    expect(database.attemptQuestionSnapshot.findUnique).not.toHaveBeenCalled();
    expect(database.attemptAnswer.create).not.toHaveBeenCalled();
  });

  it('does not return future feedback or raw snapshot JSON before confirmation', async () => {
    snapshots[0].options = [
      {
        id: 'option-1',
        optionKey: 'A',
        text: '3',
        groupKey: null,
        order: 1,
        correctAnswer: 'PRIVATE',
      },
      { id: 'option-2', optionKey: 'B', text: '4', groupKey: null, order: 2 },
    ];
    const questions = await service.getQuestions(attempt.id, student);
    expect(questions[0]).toMatchObject({
      answer: null,
      confirmedAt: null,
      feedback: null,
      points: '0.1',
    });
    const serialized = JSON.stringify(questions);
    expect(serialized).not.toContain('PRIVATE');
    expect(serialized).not.toContain('officialAnswers');
    expect(serialized).not.toContain(snapshots[0].explanation);
    expect(serialized).not.toContain(snapshots[0].funFact!);
  });

  it('hides unconfirmed stored draft selections on resume', async () => {
    answers = [
      confirmedAnswer(snapshots[0], true, {
        confirmedAt: null,
        feedback: null,
      }),
    ];
    await expect(service.getQuestions(attempt.id, student)).resolves.toEqual([
      expect.objectContaining({
        answer: null,
        confirmedAt: null,
        feedback: null,
      }),
    ]);
    await expect(service.finish(attempt.id, student)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(database.attempt.update).not.toHaveBeenCalled();
  });

  it('corrects the first confirmation using the attempt snapshot', async () => {
    const correct = jest.spyOn(correction, 'correct');
    const response = await service.confirmAnswer(
      attempt.id,
      snapshots[0].questionId,
      { answer: ' b ' },
      student,
    );
    expect(response).toMatchObject({
      answer: { optionKey: 'B' },
      feedback: {
        isCorrect: true,
        pointsEarned: 0.1,
        explanation: snapshots[0].explanation,
      },
    });
    expect(correct).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedAnswer: { optionKey: 'B' },
        officialAnswers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
      }),
    );
  });

  it('replays saved feedback without correcting again, including after finish', async () => {
    attempt.status = AttemptStatus.FINISHED;
    answers = [confirmedAnswer(snapshots[0])];
    snapshots[0].officialAnswers = [
      { answerKey: 'correctAnswer', answerValue: 'A' },
    ];
    const correct = jest.spyOn(correction, 'correct');
    const response = await service.confirmAnswer(
      attempt.id,
      snapshots[0].questionId,
      { selectedOption: ' b ' },
      student,
    );
    expect(response.feedback.isCorrect).toBe(true);
    expect(response.confirmedAt).toEqual(instant);
    expect(correct).not.toHaveBeenCalled();
    expect(database.attemptAnswer.create).not.toHaveBeenCalled();
    expect(database.attemptAnswer.update).not.toHaveBeenCalled();
  });

  it('refuses to change a confirmed answer', async () => {
    answers = [confirmedAnswer(snapshots[0])];
    await expect(
      service.confirmAnswer(
        attempt.id,
        snapshots[0].questionId,
        { optionKey: 'A' },
        student,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(database.attemptAnswer.update).not.toHaveBeenCalled();
  });

  it('refuses a first confirmation after finishing', async () => {
    attempt.status = AttemptStatus.FINISHED;
    await expect(
      service.confirmAnswer(
        attempt.id,
        snapshots[0].questionId,
        { optionKey: 'B' },
        student,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(database.attemptAnswer.create).not.toHaveBeenCalled();
  });

  it.each([AttemptStatus.ABANDONED, AttemptStatus.EXPIRED])(
    'refuses mutations and confirmation replays in %s attempts',
    async (status) => {
      attempt.status = status;
      answers = [confirmedAnswer(snapshots[0])];
      await expect(
        service.confirmAnswer(
          attempt.id,
          snapshots[0].questionId,
          { optionKey: 'B' },
          student,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.finish(attempt.id, student)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(database.attemptAnswer.update).not.toHaveBeenCalled();
      expect(database.attempt.update).not.toHaveBeenCalled();
    },
  );

  it('refuses question ids that have no snapshot in the attempt', async () => {
    await expect(
      service.confirmAnswer(
        attempt.id,
        'another-question',
        { optionKey: 'B' },
        student,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(database.attemptAnswer.create).not.toHaveBeenCalled();
  });

  it('fails closed when persisted correction and feedback disagree', async () => {
    answers = [confirmedAnswer(snapshots[0], true, { isCorrect: false })];
    await expect(
      service.getQuestions(attempt.id, student),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    await expect(service.finish(attempt.id, student)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(database.attempt.update).not.toHaveBeenCalled();
  });

  it('refuses invalid snapshot points before exposing content or finishing', async () => {
    snapshots[0].points = new Prisma.Decimal(0);
    answers = [confirmedAnswer(snapshots[0], false)];
    await expect(
      service.getQuestions(attempt.id, student),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    await expect(service.finish(attempt.id, student)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(database.attempt.update).not.toHaveBeenCalled();
  });

  it('sums decimal scores exactly and computes the summary once', async () => {
    snapshots = [
      snapshot({ points: new Prisma.Decimal('0.1') }),
      snapshot({
        id: 'snapshot-2',
        questionId: 'question-2',
        points: new Prisma.Decimal('0.2'),
        sortOrder: 2,
      }),
      snapshot({
        id: 'snapshot-3',
        questionId: 'question-3',
        points: new Prisma.Decimal('0.3'),
        sortOrder: 3,
      }),
    ];
    answers = snapshots.map((question, index) =>
      confirmedAnswer(question, index < 2),
    );
    const result = await service.finish(attempt.id, student);
    expect(result.attempt.score?.toString()).toBe('0.3');
    expect(result.attempt.maxScore.toString()).toBe('0.6');
    expect(result.attempt.percentage?.toString()).toBe('50');
    expect(result.attempt).toMatchObject({
      status: AttemptStatus.FINISHED,
      correctCount: 2,
      wrongCount: 1,
    });
    expect(database.attempt.update).toHaveBeenCalledTimes(1);
    expect(result.reward).toEqual({
      xpAwarded: 10,
      reason: 'AWARDED',
      day: '2026-10-12',
    });
    expect(rewards.recordCompletion).toHaveBeenCalledTimes(1);
  });

  it('replays persisted final totals after archiving without recomputing them', async () => {
    attempt = {
      ...attempt,
      status: AttemptStatus.FINISHED,
      score: new Prisma.Decimal('0.1'),
      percentage: new Prisma.Decimal(100),
      correctCount: 1,
      finishedAt: instant,
      durationSeconds: 12,
    };
    answers = [confirmedAnswer(snapshots[0])];
    const beforeArchive = await service.getResult(attempt.id, student);
    attempt.simulation.status = SimulationStatus.ARCHIVED;
    attempt.simulation.updatedAt = new Date('2026-10-13T12:00:00Z');
    const afterArchive = await service.finish(attempt.id, student);
    expect(afterArchive).toEqual(beforeArchive);
    expect(database.attempt.update).not.toHaveBeenCalled();
    expect(afterArchive.attempt.simulation).not.toHaveProperty('updatedAt');
    expect(afterArchive.attempt.simulation).not.toHaveProperty('status');
    expect(afterArchive.reward).toEqual({
      xpAwarded: 0,
      reason: 'LEGACY',
      day: null,
    });
    expect(rewards.recordCompletion).not.toHaveBeenCalled();
  });

  it('checks current discipline availability before returning feedback', async () => {
    attempt.simulation.discipline.isActive = false;
    answers = [confirmedAnswer(snapshots[0])];
    await expect(
      service.getQuestions(attempt.id, student),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(database.attemptQuestionSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('checks current turma membership before returning feedback', async () => {
    attempt.simulation.turmaId = 'turma-1';
    database.turma.findFirst.mockResolvedValue(null);
    answers = [confirmedAnswer(snapshots[0])];
    await expect(
      service.getQuestions(attempt.id, student),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(database.attemptQuestionSnapshot.findMany).not.toHaveBeenCalled();
  });

  it('does not turn a failed answer persistence into a final summary', async () => {
    database.attemptAnswer.create.mockRejectedValue(
      new Error('Database write failed'),
    );
    await expect(
      service.confirmAnswer(
        attempt.id,
        snapshots[0].questionId,
        { optionKey: 'B' },
        student,
      ),
    ).rejects.toThrow('Database write failed');
    expect(database.attempt.update).not.toHaveBeenCalled();
  });

  it('keeps finalization failures visible without rewriting confirmed feedback', async () => {
    answers = [confirmedAnswer(snapshots[0])];
    database.attempt.update.mockRejectedValue(
      new Error('Database write failed'),
    );
    await expect(service.finish(attempt.id, student)).rejects.toThrow(
      'Database write failed',
    );
    expect(database.attemptAnswer.update).not.toHaveBeenCalled();
    expect(database.attemptAnswer.create).not.toHaveBeenCalled();
  });
});

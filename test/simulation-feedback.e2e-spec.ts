import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Prisma, QuestionType, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Session {
  id: string;
  accessToken: string;
}
interface Fixture {
  id: string;
  attemptId: string;
  questionIds: string[];
  turmaId: string | null;
}
jest.setTimeout(30_000);
describe('Giz simulation confirmation (real Nest/PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let student: Session;
  let outsider: Session;
  let admin: Session;
  let disciplineId: string;
  const simulationIds: string[] = [];
  const createdUserIds: string[] = [];
  const turmaIds: string[] = [];
  const password = 'Synthetic-Giz-password-123';
  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = 'test';
    process.env.RATE_LIMIT_MAX = '10000';
    const { AppModule } = await import('../src/app.module');
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    const passwordHash = await hash(password, 4);
    async function session(role: UserRole) {
      const user = await prisma.user.create({
        data: {
          name: 'Synthetic Giz test',
          email: `${randomUUID()}@example.test`,
          passwordHash,
          role,
          status: 'ACTIVE',
        },
      });
      createdUserIds.push(user.id);
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password })
        .expect(200);
      return { id: user.id, accessToken: String(login.body.accessToken) };
    }
    admin = await session(UserRole.ADMIN);
    student = await session(UserRole.STUDENT);
    outsider = await session(UserRole.STUDENT);
    disciplineId = (
      await prisma.discipline.create({
        data: { name: 'Synthetic Giz discipline', slug: `giz-${randomUUID()}` },
      })
    ).id;
  });
  afterAll(async () => {
    if (prisma) {
      const attempts = await prisma.attempt.findMany({
        where: { simulationId: { in: simulationIds } },
        select: { id: true },
      });
      const questions = await prisma.question.findMany({
        where: { simulationId: { in: simulationIds } },
        select: { id: true },
      });
      await prisma.attemptQuestionSnapshot.deleteMany({
        where: { attemptId: { in: attempts.map((a) => a.id) } },
      });
      await prisma.attemptAnswer.deleteMany({
        where: { attemptId: { in: attempts.map((a) => a.id) } },
      });
      await prisma.attempt.deleteMany({
        where: { id: { in: attempts.map((a) => a.id) } },
      });
      await prisma.questionAnswer.deleteMany({
        where: { questionId: { in: questions.map((q) => q.id) } },
      });
      await prisma.questionOption.deleteMany({
        where: { questionId: { in: questions.map((q) => q.id) } },
      });
      await prisma.question.deleteMany({
        where: { id: { in: questions.map((q) => q.id) } },
      });
      await prisma.simulation.deleteMany({
        where: { id: { in: simulationIds } },
      });
      if (disciplineId)
        await prisma.discipline.deleteMany({ where: { id: disciplineId } });
      await prisma.turmaMembership.deleteMany({
        where: { turmaId: { in: turmaIds } },
      });
      await prisma.turma.deleteMany({ where: { id: { in: turmaIds } } });
      const userIds = createdUserIds;
      await prisma.refreshToken.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await app?.close();
  });
  function http(method: 'get' | 'post', path: string, user = student) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${user.accessToken}`);
  }
  async function fixture(
    immediateFeedback = true,
    privateClass = false,
    legacyBooleanAnswers = false,
    textClassification = false,
  ): Promise<Fixture> {
    const turmaId = privateClass
      ? (
          await prisma.turma.create({
            data: {
              name: 'Synthetic Giz turma',
              slug: randomUUID(),
              schoolYear: 3,
              memberships: { create: { userId: student.id } },
            },
          })
        ).id
      : null;
    if (turmaId) turmaIds.push(turmaId);
    const simulation = await prisma.simulation.create({
      data: {
        title: 'Synthetic Giz simulation',
        slug: randomUUID(),
        schoolYear: 3,
        bimester: 1,
        assessment: 'AV1',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        disciplineId,
        createdById: admin.id,
        turmaId,
        totalQuestions: 4,
        maxScore: 1,
      },
    });
    simulationIds.push(simulation.id);
    const types = [
      QuestionType.MULTIPLE_CHOICE,
      QuestionType.TRUE_FALSE_MULTIPLE,
      QuestionType.MATCHING,
      QuestionType.CLASSIFICATION,
    ];
    const questionIds: string[] = [];
    for (const [index, type] of types.entries()) {
      const optionKeys =
        type === QuestionType.MULTIPLE_CHOICE
          ? ['A', 'B']
          : type === QuestionType.MATCHING
            ? ['left:x', 'left:y', 'right:a', 'right:b']
            : ['x', 'y'];
      const correct =
        type === QuestionType.MULTIPLE_CHOICE
          ? { correctAnswer: 'A' }
          : type === QuestionType.MATCHING
            ? { x: 'b', y: 'a' }
            : type === QuestionType.TRUE_FALSE_MULTIPLE
              ? legacyBooleanAnswers
                ? { x: 'true', y: 'false' }
                : { x: 'V', y: 'F' }
              : textClassification
                ? {
                    x: 'Bernardo,Brasil,Florianópolis',
                    y: 'cadeira,cachorro,escola',
                  }
                : { x: 'C', y: 'P' };
      const question = await prisma.question.create({
        data: {
          simulationId: simulation.id,
          type,
          statement: `Synthetic question ${index + 1}`,
          theme: index < 2 ? 'Leitura' : index === 2 ? 'Relações' : null,
          tip: 'Uma pista sem a resposta.',
          funFact: 'Uma curiosidade após acertar.',
          points: new Prisma.Decimal((index + 1) / 10),
          sortOrder: index + 1,
          options: {
            create: optionKeys.map((key, i) => ({
              optionKey: key,
              text: `Opção ${key}`,
              groupKey: key.startsWith('left:')
                ? 'left'
                : key.startsWith('right:')
                  ? 'right'
                  : null,
              sortOrder: i + 1,
              metadata: { privateMarker: 'not-public' },
            })),
          },
          answers: {
            create: Object.entries(correct).map(([answerKey, answerValue]) => ({
              answerKey,
              answerValue: answerValue!,
            })),
          },
        },
      });
      questionIds.push(question.id);
    }
    const response = await http(
      'post',
      `/simulations/${simulation.id}/attempts`,
    )
      .send(immediateFeedback ? { immediateFeedback: true } : {})
      .expect(201);
    return {
      id: simulation.id,
      attemptId: String(response.body.id),
      questionIds,
      turmaId,
    };
  }
  const confirm = (
    f: Fixture,
    index: number,
    answer: Record<string, unknown>,
    user = student,
  ) =>
    http(
      'post',
      `/attempts/${f.attemptId}/questions/${f.questionIds[index]}/answer`,
      user,
    ).send({ answer });
  const getQuestions = (f: Fixture, user = student) =>
    http('get', `/attempts/${f.attemptId}/questions`, user);
  const finish = (f: Fixture, user = student) =>
    http('post', `/attempts/${f.attemptId}/finish`, user);
  function noPrivate(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(noPrivate);
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      expect([
        'officialAnswers',
        'answerKey',
        'answerValue',
        'questionSnapshots',
        'passwordHash',
        'privateMarker',
      ]).not.toContain(key);
      noPrivate(child);
    }
  }
  it('does not expose an answer or curiosity before confirmation; releases only the confirmed question', async () => {
    const f = await fixture();
    const before = await getQuestions(f).expect(200);
    expect(before.body).toHaveLength(4);
    expect(before.body[3].classificationMode).toBe('CP');
    for (const question of before.body) {
      expect(question).toMatchObject({
        answer: null,
        confirmedAt: null,
        feedback: null,
        tip: null,
        funFact: null,
      });
      expect(question).not.toHaveProperty('correctAnswer');
    }
    noPrivate(before.body);
    await http('get', `/attempts/${f.attemptId}/result`).expect(400);
    const saved = await confirm(f, 0, { answer: 'B' }).expect(201);
    expect(saved.body.feedback).toMatchObject({
      isCorrect: false,
      correctAnswer: { answer: 'A' },
      tip: 'Uma pista sem a resposta.',
      funFact: null,
    });
    const after = await getQuestions(f).expect(200);
    expect(after.body[0].feedback).toEqual(saved.body.feedback);
    expect(after.body[1].feedback).toBeNull();
    noPrivate(after.body);
  });
  it('grades all four types with exact decimal totals and retains confirmed feedback on reload', async () => {
    const f = await fixture();
    for (const [index, answer] of [
      { answer: 'A' },
      { x: 'V', y: 'F' },
      { x: 'b', y: 'a' },
      { x: 'C', y: 'P' },
    ].entries()) {
      const saved = await confirm(f, index, answer).expect(201);
      expect(saved.body.feedback.isCorrect).toBe(true);
      expect(saved.body.feedback.tip).toBeNull();
      expect(saved.body.feedback.funFact).toBe('Uma curiosidade após acertar.');
    }
    const result = await finish(f).expect(201);
    expect(result.body.attempt).toMatchObject({
      immediateFeedback: true,
      score: '1',
      maxScore: '1',
      correctCount: 4,
      wrongCount: 0,
      percentage: '100',
    });
    expect(result.body.topics).toEqual([
      { theme: 'Leitura', correct: 2, total: 2 },
      { theme: 'Relações', correct: 1, total: 1 },
    ]);
    expect(result.body.unclassifiedQuestions).toBe(1);
    expect(result.body.questions[2].correctAnswer).toEqual({ x: 'b', y: 'a' });
    expect(result.body.questions[0].options).toHaveLength(2);
    noPrivate(result.body);
  });
  it.each([
    { x: 'V', y: 'F' },
    { x: true, y: false },
  ])(
    'starts and grades legacy true/false official answers with equivalent replay: %p',
    async (answer) => {
      const f = await fixture(true, false, true);
      const questions = await getQuestions(f).expect(200);
      expect(questions.body[1].feedback).toBeNull();
      noPrivate(questions.body);
      const first = await confirm(f, 1, answer).expect(201);
      expect(first.body.answer).toEqual({ x: 'V', y: 'F' });
      expect(first.body.feedback).toMatchObject({
        isCorrect: true,
        correctAnswer: { x: 'V', y: 'F' },
      });
      for (const equivalent of [
        { x: true, y: false },
        { answers: { y: ' false ', x: 'TRUE' } },
        { x: 'V', y: 'F' },
      ]) {
        const replay = await confirm(f, 1, equivalent).expect(201);
        expect(replay.body).toEqual(first.body);
      }
      await confirm(f, 1, { x: false, y: false }).expect(409);
      const result = await finish(f).expect(201);
      expect(result.body.attempt).toMatchObject({
        correctCount: 1,
        score: '0.2',
        percentage: '20',
      });
      expect(result.body.questions[1].correctAnswer).toEqual({
        x: 'V',
        y: 'F',
      });
      const saved = await prisma.attemptQuestionSnapshot.findUniqueOrThrow({
        where: {
          attemptId_questionId: {
            attemptId: f.attemptId,
            questionId: f.questionIds[1],
          },
        },
      });
      expect(saved.officialAnswers).toEqual([
        { answerKey: 'x', answerValue: 'true' },
        { answerKey: 'y', answerValue: 'false' },
      ]);
    },
  );
  it.each([
    { immediate: true, correct: true },
    { immediate: true, correct: false },
    { immediate: false, correct: true },
    { immediate: false, correct: false },
  ])(
    'supports real textual classification without exposing future answers: %p',
    async ({ immediate, correct }) => {
      const f = await fixture(immediate, false, false, true);
      const official = {
        x: 'Bernardo,Brasil,Florianópolis',
        y: 'cadeira,cachorro,escola',
      };
      const answer = {
        x: correct ? 'bernardo,brasil,florianópolis' : 'outra resposta',
        y: 'CADEIRA,CACHORRO,ESCOLA',
      };
      const before = await getQuestions(f).expect(200);
      expect(before.body[3].classificationMode).toBe('TEXT');
      expect(before.body[0]).not.toHaveProperty('classificationMode');
      expect(JSON.stringify(before.body)).not.toContain(official.x);
      expect(JSON.stringify(before.body)).not.toContain(official.y);
      noPrivate(before.body);
      if (immediate) {
        for (const invalid of [
          { x: 'one' },
          { x: ' ', y: 'two' },
          { x: true, y: 'two' },
          { x: 'one', y: 'a'.repeat(2001) },
        ])
          await confirm(f, 3, invalid).expect(400);
      }
      const saved = await confirm(f, 3, answer).expect(201);
      expect(saved.body.answer).toEqual(answer);
      if (immediate) {
        expect(saved.body.feedback).toMatchObject({
          isCorrect: correct,
          correctAnswer: official,
          tip: correct ? null : 'Uma pista sem a resposta.',
          funFact: correct ? 'Uma curiosidade após acertar.' : null,
        });
        const replay = await confirm(f, 3, {
          answers: {
            x: ' ' + answer.x.toUpperCase() + ' ',
            y: answer.y.toLowerCase(),
          },
        }).expect(201);
        expect(replay.body).toEqual(saved.body);
        const restored = await getQuestions(f).expect(200);
        expect(restored.body[3]).toMatchObject({
          classificationMode: 'TEXT',
          feedback: saved.body.feedback,
        });
      } else {
        expect(saved.body.feedback).toBeNull();
        expect(saved.body.confirmedAt).toBeNull();
      }
      const result = await finish(f).expect(201);
      expect(result.body.attempt).toMatchObject({
        immediateFeedback: immediate,
        correctCount: correct ? 1 : 0,
        score: correct ? '0.4' : '0',
        percentage: correct ? '40' : '0',
      });
      expect(result.body.questions[3]).toMatchObject({
        classificationMode: 'TEXT',
        answer,
        isCorrect: correct,
      });
      if (immediate) {
        expect(result.body.questions[3].correctAnswer).toEqual(official);
      } else {
        expect(result.body.questions[3]).not.toHaveProperty('correctAnswer');
        const raw = await prisma.attemptAnswer.findUniqueOrThrow({
          where: {
            attemptId_questionId: {
              attemptId: f.attemptId,
              questionId: f.questionIds[3],
            },
          },
        });
        expect(raw.answer).toEqual(answer);
      }
      noPrivate(result.body);
    },
  );
  it('makes equivalent retries and concurrent confirmations idempotent and rejects changed selections', async () => {
    const f = await fixture();
    const replies = await Promise.all(
      Array.from({ length: 4 }, () => confirm(f, 0, { optionKey: ' a ' })),
    );
    expect(replies.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    expect(new Set(replies.map((r) => r.body.id)).size).toBe(1);
    expect(new Set(replies.map((r) => r.body.confirmedAt)).size).toBe(1);
    await confirm(f, 0, { answer: 'B' }).expect(409);
    expect(
      await prisma.attemptAnswer.count({
        where: { attemptId: f.attemptId, questionId: f.questionIds[0] },
      }),
    ).toBe(1);
  });
  it('finishes once under concurrent requests, treats missing answers as blank and replays saved results', async () => {
    const f = await fixture();
    await confirm(f, 0, { answer: 'A' }).expect(201);
    const replies = await Promise.all(
      Array.from({ length: 4 }, () => finish(f)),
    );
    expect(replies.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    expect(new Set(replies.map((r) => r.body.attempt.finishedAt)).size).toBe(1);
    expect(replies[0].body.attempt).toMatchObject({
      score: '0.1',
      percentage: '10',
      correctCount: 1,
      wrongCount: 3,
    });
    expect(replies[0].body.questions[1]).toMatchObject({
      answer: {},
      isCorrect: false,
      correctAnswer: { x: 'V', y: 'F' },
    });
    await confirm(f, 0, { value: 'a' }).expect(201);
    await confirm(f, 1, { x: 'V', y: 'F' }).expect(409);
    const result = await http('get', `/attempts/${f.attemptId}/result`).expect(
      200,
    );
    expect(result.body).toEqual(replies[0].body);
  });
  it('keeps a coherent result when confirmation races with finishing', async () => {
    const f = await fixture();
    const [confirmation, finished] = await Promise.all([
      confirm(f, 0, { answer: 'A' }),
      finish(f),
    ]);
    expect(finished.status).toBe(201);
    expect([201, 409]).toContain(confirmation.status);
    const correct = confirmation.status === 201;
    expect(finished.body.attempt.correctCount).toBe(correct ? 1 : 0);
    expect(finished.body.questions[0]).toMatchObject({
      answer: correct ? { answer: 'A' } : {},
      isCorrect: correct,
    });
    const replay = await http('get', `/attempts/${f.attemptId}/result`).expect(
      200,
    );
    expect(replay.body).toEqual(finished.body);
    expect(
      await prisma.attemptAnswer.count({ where: { attemptId: f.attemptId } }),
    ).toBe(4);
  });
  it('rechecks discipline availability and rejects later publication withdrawal', async () => {
    const f = await fixture();
    await prisma.discipline.update({
      where: { id: disciplineId },
      data: { isActive: false },
    });
    try {
      await getQuestions(f).expect(404);
      await confirm(f, 0, { answer: 'A' }).expect(404);
      await finish(f).expect(404);
    } finally {
      await prisma.discipline.update({
        where: { id: disciplineId },
        data: { isActive: true },
      });
    }
    await prisma.simulation.update({
      where: { id: f.id },
      data: { status: 'DRAFT' },
    });
    await getQuestions(f).expect(404);
    await finish(f).expect(404);
  });
  it('keeps the original text, answers, points and theme when editorial content changes', async () => {
    const f = await fixture();
    await prisma.question.update({
      where: { id: f.questionIds[0] },
      data: {
        statement: 'Edited statement',
        theme: 'Changed theme',
        points: 99,
        answers: {
          updateMany: {
            where: { answerKey: 'correctAnswer' },
            data: { answerValue: 'B' },
          },
        },
        options: {
          updateMany: {
            where: { optionKey: 'A' },
            data: { text: 'Edited option' },
          },
        },
      },
    });
    const saved = await confirm(f, 0, { answer: 'A' }).expect(201);
    expect(saved.body.feedback.isCorrect).toBe(true);
    const result = await finish(f).expect(201);
    expect(result.body.questions[0]).toMatchObject({
      statement: 'Synthetic question 1',
      theme: 'Leitura',
      points: '0.1',
      correctAnswer: { answer: 'A' },
    });
    expect(result.body.questions[0].options[0].text).toBe('Opção A');
    expect(result.body.attempt.maxScore).toBe('1');
  });
  it('checks ownership and current private membership on every operation', async () => {
    const f = await fixture(true, true);
    await getQuestions(f, outsider).expect(403);
    await confirm(f, 0, { answer: 'A' }, outsider).expect(403);
    await finish(f, outsider).expect(403);
    await prisma.turmaMembership.deleteMany({
      where: { turmaId: f.turmaId!, userId: student.id },
    });
    await getQuestions(f).expect(404);
    await http('get', `/attempts/${f.attemptId}`).expect(404);
    await confirm(f, 0, { answer: 'A' }).expect(404);
    await finish(f).expect(404);
    await getQuestions(f, admin).expect(200);
  });
  it('does not change the grading policy or editable answers of a legacy attempt', async () => {
    const f = await fixture(false);
    const resumed = await http('post', `/simulations/${f.id}/attempts`)
      .send({ immediateFeedback: true })
      .expect(201);
    expect(resumed.body).toMatchObject({
      id: f.attemptId,
      immediateFeedback: false,
    });
    const first = await confirm(f, 0, { answer: 'A' }).expect(201);
    expect(first.body.feedback).toBeNull();
    await confirm(f, 0, { answer: 'B' }).expect(201);
    const result = await finish(f).expect(201);
    expect(result.body.questions[0].isCorrect).toBe(false);
    expect(result.body.questions[0]).not.toHaveProperty('correctAnswer');
  });
  it.each([
    { x: 'V', y: 'F' },
    { x: true, y: false },
  ])(
    'grades legacy attempts with true/false official answers and preserves the raw submission: %p',
    async (answer) => {
      const f = await fixture(false, false, true);
      const saved = await confirm(f, 1, answer).expect(201);
      expect(saved.body.answer).toEqual(answer);
      expect(saved.body.feedback).toBeNull();
      expect(saved.body.confirmedAt).toBeNull();
      const result = await finish(f).expect(201);
      expect(result.body.attempt).toMatchObject({
        immediateFeedback: false,
        correctCount: 1,
        score: '0.2',
        percentage: '20',
      });
      expect(result.body.questions[1].isCorrect).toBe(true);
      expect(result.body.questions[1]).not.toHaveProperty('correctAnswer');
      const persisted = await prisma.attemptAnswer.findUniqueOrThrow({
        where: {
          attemptId_questionId: {
            attemptId: f.attemptId,
            questionId: f.questionIds[1],
          },
        },
      });
      expect(persisted.answer).toEqual(answer);
      expect(persisted.confirmedAt).toBeNull();
      expect(
        await prisma.attemptQuestionSnapshot.count({
          where: { attemptId: f.attemptId },
        }),
      ).toBe(0);
    },
  );
  it('serializes starts, rejects invalid answer bodies and validates the opt-in DTO', async () => {
    const f = await fixture();
    const starts = await Promise.all(
      Array.from({ length: 4 }, () =>
        http('post', `/simulations/${f.id}/attempts`).send({
          immediateFeedback: true,
        }),
      ),
    );
    expect(new Set(starts.map((r) => r.body.id))).toEqual(
      new Set([f.attemptId]),
    );
    expect(
      await prisma.attemptQuestionSnapshot.count({
        where: { attemptId: f.attemptId },
      }),
    ).toBe(4);
    await confirm(f, 1, { x: 'V' }).expect(400);
    await confirm(f, 0, { answer: 'unknown' }).expect(400);
    await http('post', `/simulations/${f.id}/attempts`)
      .send({ immediateFeedback: 'true' })
      .expect(400);
  });
});

import { createHash, randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  Prisma,
  QuestionType,
  SimulationStatus,
  UserRole,
} from '@prisma/client';
import { hash } from 'bcryptjs';
import helmet from 'helmet';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';

import { assertTestDatabaseUrl } from './support/test-database.cjs';
const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);

interface Session {
  id: string;
  email: string;
  accessToken: string;
}

const questionFixtures = [
  {
    type: QuestionType.MULTIPLE_CHOICE,
    points: 1,
    options: [
      { optionKey: 'A', text: 'Uma unidade', sortOrder: 1 },
      { optionKey: 'B', text: 'Duas unidades', sortOrder: 2 },
    ],
    official: { correctAnswer: 'B' },
    correct: { optionKey: 'B' },
    wrong: { optionKey: 'A' },
    incomplete: {},
  },
  {
    type: QuestionType.TRUE_FALSE_MULTIPLE,
    points: 2,
    options: [
      { optionKey: 'A', text: 'A afirmação A', sortOrder: 1 },
      { optionKey: 'B', text: 'A afirmação B', sortOrder: 2 },
    ],
    official: { A: 'V', B: 'F' },
    correct: { answers: { A: 'V', B: 'F' } },
    wrong: { answers: { A: 'V', B: 'V' } },
    incomplete: { answers: { A: 'V' } },
  },
  {
    type: QuestionType.MATCHING,
    points: 3,
    options: [
      { optionKey: 'A', text: 'Primeiro item', groupKey: 'left', sortOrder: 1 },
      { optionKey: 'B', text: 'Segundo item', groupKey: 'left', sortOrder: 2 },
      { optionKey: '1', text: 'Primeiro par', groupKey: 'right', sortOrder: 3 },
      { optionKey: '2', text: 'Segundo par', groupKey: 'right', sortOrder: 4 },
    ],
    official: { A: '2', B: '1' },
    correct: { answers: { A: '2', B: '1' } },
    wrong: { answers: { A: '2', B: '2' } },
    incomplete: { answers: { A: '2' } },
  },
  {
    type: QuestionType.CLASSIFICATION,
    points: 4,
    options: [
      { optionKey: 'A', text: 'Item de classificação A', sortOrder: 1 },
      { optionKey: 'B', text: 'Item de classificação B', sortOrder: 2 },
    ],
    official: { A: 'C', B: 'P' },
    correct: { answers: { A: 'C', B: 'P' } },
    wrong: { answers: { A: 'C', B: 'C' } },
    incomplete: { answers: { A: 'C' } },
  },
];

// Allow the student's own `answer`, but never server-side answer keys or secrets.
function expectSafePayload(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(expectSafePayload);
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of [
    'passwordHash',
    'tokenHash',
    'correctAnswer',
    'answerKey',
    'answerValue',
    'officialAnswers',
    'replacedByTokenId',
  ]) {
    expect(record).not.toHaveProperty(key);
  }
  Object.values(record).forEach(expectSafePayload);
}

const correctionCases = questionFixtures.flatMap((fixture) => [
  {
    fixture,
    state: 'complete',
    answer: fixture.correct,
    expected: fixture.points,
  },
  { fixture, state: 'partly wrong', answer: fixture.wrong, expected: 0 },
  { fixture, state: 'incomplete', answer: fixture.incomplete, expected: 0 },
]);

describe('Current simulation flows over HTTP (real Nest + PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;
  const password = 'Synthetic-password-123';
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let guardian: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;
  let otherTurmaId: string;
  let publicSimulationId: string;
  let privateSimulationId: string;
  let otherPrivateSimulationId: string;
  let draftSimulationId: string;
  let questions: Array<{ id: string; type: QuestionType }>;

  beforeAll(async () => {
    // AppModule's ConfigModule reads process.env on import; set the test URL first.
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = 'test';
    process.env.RATE_LIMIT_MAX = '10000';
    const { AppModule } = await import('../src/app.module');
    app = await NestFactory.create(AppModule, { logger: false });
    app.use(helmet());
    app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    // APP_FILTER, interceptors, middleware, JWT and Roles guards remain real.
    await app.init();
    prisma = app.get(PrismaService);
    passwordHash = await hash(password, 4);
  });

  beforeEach(async () => {
    // The shared URL guard and runner guarantee an empty, owned test database.
    // These synthetic fixtures are independent; no project seed is imported.
    await prisma.attemptAnswer.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.questionAnswer.deleteMany();
    await prisma.questionOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.simulation.deleteMany();
    await prisma.discipline.deleteMany();
    await prisma.turmaMembership.deleteMany();
    await prisma.turmaInvite.deleteMany();
    await prisma.turma.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.guardianStudent.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.auditLog.deleteMany();
    admin = await createSession(UserRole.ADMIN);
    student = await createSession(UserRole.STUDENT);
    outsider = await createSession(UserRole.STUDENT);
    guardian = await createSession(UserRole.GUARDIAN);
    teacher = await createSession(UserRole.TEACHER);
    const discipline = await prisma.discipline.create({
      data: { name: 'Matemática sintética', slug: 'matematica' },
    });
    disciplineId = discipline.id;
    const turma = await prisma.turma.create({
      data: {
        name: 'Turma sintética A',
        slug: 'synthetic-turma-a',
        schoolYear: 3,
      },
    });
    const otherTurma = await prisma.turma.create({
      data: {
        name: 'Turma sintética B',
        slug: 'synthetic-turma-b',
        schoolYear: 3,
      },
    });
    turmaId = turma.id;
    otherTurmaId = otherTurma.id;
    const publicSimulation = await createSimulation('public');
    publicSimulationId = publicSimulation.id;
    questions = publicSimulation.questions;
    privateSimulationId = (await createSimulation('private', { turmaId })).id;
    otherPrivateSimulationId = (
      await createSimulation('private-other', { turmaId: otherTurmaId })
    ).id;
    draftSimulationId = (
      await createSimulation('draft', { status: SimulationStatus.DRAFT })
    ).id;
  });

  afterAll(async () => {
    await app?.close();
  });

  async function createSession(role: UserRole): Promise<Session> {
    const user = await prisma.user.create({
      data: {
        name: `Synthetic ${role}`,
        email: `${randomUUID()}@example.test`,
        passwordHash,
        role,
        status: 'ACTIVE',
        ...(role === UserRole.STUDENT
          ? {
              studentProfile: { create: { schoolYear: 3 } },
            }
          : {}),
      },
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    expectSafePayload(login.body.user);
    return {
      id: user.id,
      email: user.email,
      accessToken: login.body.accessToken,
    };
  }

  function authenticated(
    method: 'get' | 'post' | 'patch' | 'delete',
    path: string,
    session = student,
  ) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${session.accessToken}`);
  }

  async function createSimulation(
    slug: string,
    overrides: Partial<Prisma.SimulationUncheckedCreateInput> = {},
  ) {
    return prisma.simulation.create({
      data: {
        title: `Simulado sintético ${slug}`,
        slug,
        schoolYear: 3,
        bimester: 1,
        assessment: 'AV1',
        totalQuestions: 4,
        maxScore: 10,
        disciplineId,
        createdById: admin.id,
        status: SimulationStatus.PUBLISHED,
        ...overrides,
        questions: {
          create: questionFixtures.map((fixture, index) => ({
            type: fixture.type,
            statement: `Questão sintética ${fixture.type}`,
            tip: 'Leia cada item com atenção.',
            funFact: `Curiosidade sintética ${index + 1}`,
            points: fixture.points,
            sortOrder: index + 1,
            options: { create: fixture.options },
            answers: {
              create: Object.entries(fixture.official).map(
                ([answerKey, answerValue]) => ({
                  answerKey,
                  answerValue,
                }),
              ),
            },
          })),
        },
      },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async function start(simulationId = publicSimulationId) {
    return authenticated(
      'post',
      `/simulations/${simulationId}/attempts`,
    ).expect(201);
  }

  async function submitAll(attemptId: string) {
    for (const [index, fixture] of questionFixtures.entries()) {
      const answer = await authenticated(
        'post',
        `/attempts/${attemptId}/questions/${questions[index].id}/answer`,
      )
        .send({ answer: fixture.correct })
        .expect(201);
      expectSafePayload(answer.body);
      expect(answer.body.isCorrect).toBeNull();
    }
  }

  it('boots the real health routes, headers, DTO validation and error envelope', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/ready').expect(200);
    const invalid = await request(app.getHttpServer())
      .get('/simulations/available?schoolYear=13')
      .set('x-request-id', 'synthetic-request')
      .expect(400);
    expect(invalid.headers['x-content-type-options']).toBe('nosniff');
    expect(invalid.body).toMatchObject({
      statusCode: 400,
      method: 'GET',
      requestId: 'synthetic-request',
      path: '/simulations/available?schoolYear=13',
    });
    expect(Array.isArray(invalid.body.message)).toBe(true);
    await authenticated('post', '/auth/login')
      .send({ email: student.email, password, unexpected: true })
      .expect(400);
  });

  it('registers and authenticates a student without accepting privilege escalation or exposing hashes', async () => {
    const email = `${randomUUID()}@example.test`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Synthetic signup', email, password, role: 'ADMIN' })
      .expect(400);
    expect(await prisma.user.count({ where: { email } })).toBe(0);
    const signup = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Synthetic signup', email, password })
      .expect(201);
    expect(signup.body.user).toMatchObject({
      email,
      role: 'STUDENT',
      status: 'ACTIVE',
    });
    expectSafePayload(signup.body.user);
    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.passwordHash).not.toBe(password);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(me.body.id).toBe(stored.id);
    expectSafePayload(me.body);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Wrong-password-123' })
      .expect(401);
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.refreshToken}`)
      .expect(401);
  });

  it('hides drafts and other turmas, including a direct attempt URL, then grants access through an invite', async () => {
    const anonymous = await request(app.getHttpServer())
      .get('/simulations/available')
      .expect(200);
    expect(anonymous.body.map((item: { id: string }) => item.id)).toEqual([
      publicSimulationId,
    ]);
    expectSafePayload(anonymous.body);
    const initial = await authenticated('get', '/simulations/available').expect(
      200,
    );
    expect(initial.body.map((item: { id: string }) => item.id)).toEqual([
      publicSimulationId,
    ]);
    await authenticated(
      'post',
      `/simulations/${privateSimulationId}/attempts`,
    ).expect(404);
    await authenticated(
      'post',
      `/simulations/${draftSimulationId}/attempts`,
    ).expect(404);
    await request(app.getHttpServer())
      .post(`/simulations/${publicSimulationId}/attempts`)
      .expect(401);
    await authenticated('post', `/turmas/${turmaId}/invites`)
      .send({ maxUses: 1 })
      .expect(403);
    const invite = await authenticated(
      'post',
      `/turmas/${turmaId}/invites`,
      admin,
    )
      .send({ label: 'Synthetic invite', maxUses: 1 })
      .expect(201);
    const stored = await prisma.turmaInvite.findUniqueOrThrow({
      where: { id: invite.body.id },
    });
    expect(stored.tokenHash).toBe(
      createHash('sha256').update(invite.body.token).digest('hex'),
    );
    expect(stored.tokenHash).not.toBe(invite.body.token);
    await authenticated('post', '/me/turmas/join')
      .send({ token: invite.body.token })
      .expect(200);
    const repeated = await authenticated('post', '/me/turmas/join')
      .send({ token: invite.body.token })
      .expect(200);
    expect(repeated.body.alreadyMember).toBe(true);
    expect(
      (
        await prisma.turmaInvite.findUniqueOrThrow({
          where: { id: invite.body.id },
        })
      ).usedCount,
    ).toBe(1);
    await authenticated('post', '/me/turmas/join', outsider)
      .send({ token: invite.body.token })
      .expect(403);
    const catalogue = await authenticated(
      'get',
      '/simulations/available',
    ).expect(200);
    expect(
      catalogue.body.map((item: { id: string }) => item.id).sort(),
    ).toEqual([privateSimulationId, publicSimulationId].sort());
    expectSafePayload(catalogue.body);
    await start(privateSimulationId);
    await authenticated(
      'post',
      `/simulations/${otherPrivateSimulationId}/attempts`,
    ).expect(404);
    await authenticated(
      'post',
      `/simulations/${privateSimulationId}/attempts`,
      outsider,
    ).expect(404);
  });

  it('enrolls during registration through a valid invite and refuses an invalid invite without an orphan account', async () => {
    const invalidEmail = `${randomUUID()}@example.test`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Synthetic signup',
        email: invalidEmail,
        password,
        inviteToken: 'invalid-token-that-is-long-enough',
      })
      .expect(404);
    expect(await prisma.user.count({ where: { email: invalidEmail } })).toBe(0);
    const invite = await authenticated(
      'post',
      `/turmas/${turmaId}/invites`,
      admin,
    )
      .send({})
      .expect(201);
    const signup = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Synthetic invited',
        email: `${randomUUID()}@example.test`,
        password,
        inviteToken: invite.body.token,
      })
      .expect(201);
    const catalogue = await request(app.getHttpServer())
      .get('/simulations/available')
      .set('Authorization', `Bearer ${signup.body.accessToken}`)
      .expect(200);
    expect(catalogue.body.map((item: { id: string }) => item.id)).toContain(
      privateSimulationId,
    );
    expect(catalogue.body.map((item: { id: string }) => item.id)).not.toContain(
      otherPrivateSimulationId,
    );
  });

  it('preserves publication, archival and soft-delete restrictions in the catalogue and direct links', async () => {
    await authenticated(
      'patch',
      `/simulations/${draftSimulationId}/publish`,
    ).expect(403);
    await authenticated(
      'patch',
      `/simulations/${draftSimulationId}/publish`,
      admin,
    ).expect(200);
    const published = await request(app.getHttpServer())
      .get('/simulations/available')
      .expect(200);
    expect(published.body.map((item: { id: string }) => item.id)).toContain(
      draftSimulationId,
    );
    await authenticated(
      'patch',
      `/simulations/${draftSimulationId}/archive`,
      admin,
    ).expect(200);
    await authenticated(
      'post',
      `/simulations/${draftSimulationId}/attempts`,
    ).expect(404);
    await authenticated(
      'delete',
      `/simulations/${publicSimulationId}`,
      admin,
    ).expect(204);
    const deleted = await prisma.simulation.findUniqueOrThrow({
      where: { id: publicSimulationId },
    });
    expect(deleted.deletedAt).not.toBeNull();
    expect(deleted.status).toBe('INACTIVE');
    const catalogue = await request(app.getHttpServer())
      .get('/simulations/available')
      .expect(200);
    expect(catalogue.body).toEqual([]);
    await authenticated(
      'post',
      `/simulations/${publicSimulationId}/attempts`,
    ).expect(404);
  });

  it('excludes inactive and deleted disciplines from the public catalogue', async () => {
    await prisma.discipline.update({
      where: { id: disciplineId },
      data: { isActive: false },
    });
    expect(
      (
        await request(app.getHttpServer())
          .get('/simulations/available')
          .expect(200)
      ).body,
    ).toEqual([]);
    await prisma.discipline.update({
      where: { id: disciplineId },
      data: { isActive: true, deletedAt: new Date() },
    });
    expect(
      (
        await request(app.getHttpServer())
          .get('/simulations/available')
          .expect(200)
      ).body,
    ).toEqual([]);
  });

  it.each(['expired', 'revoked'])(
    'refuses a %s turma invitation without granting membership',
    async (state) => {
      const invite = await authenticated(
        'post',
        `/turmas/${turmaId}/invites`,
        admin,
      )
        .send({})
        .expect(201);
      if (state === 'expired') {
        await prisma.turmaInvite.update({
          where: { id: invite.body.id },
          data: { expiresAt: new Date(Date.now() - 1000) },
        });
      } else {
        await authenticated(
          'post',
          `/turmas/invites/${invite.body.id}/revoke`,
          admin,
        ).expect(200);
      }
      await authenticated('post', '/me/turmas/join')
        .send({ token: invite.body.token })
        .expect(state === 'expired' ? 403 : 404);
      expect(
        await prisma.turmaMembership.count({ where: { userId: student.id } }),
      ).toBe(0);
      expect(
        (
          await prisma.turmaInvite.findUniqueOrThrow({
            where: { id: invite.body.id },
          })
        ).usedCount,
      ).toBe(0);
      await authenticated(
        'post',
        `/simulations/${privateSimulationId}/attempts`,
      ).expect(404);
    },
  );

  it.each([-2, -1, 0, 1, 5, 6, 9, 10, 12])(
    'filters the catalogue for schoolYear %s across the supported audiences',
    async (schoolYear) => {
      const simulation = await createSimulation(`year-${schoolYear}`, {
        schoolYear,
      });
      const catalogue = await request(app.getHttpServer())
        .get(
          `/simulations/available?schoolYear=${schoolYear}&discipline=matematica&bimester=1&assessment=av1`,
        )
        .expect(200);
      expect(catalogue.body.map((item: { id: string }) => item.id)).toEqual([
        simulation.id,
      ]);
      expect(catalogue.body[0].schoolYear).toBe(schoolYear);
      expectSafePayload(catalogue.body);
    },
  );

  it('starts, saves, edits, resumes and finishes an attempt with the four question formats', async () => {
    const started = await start();
    const attemptId = started.body.id;
    expectSafePayload(started.body);
    expect(started.body.status).toBe('IN_PROGRESS');
    await authenticated('get', `/attempts/${attemptId}/result`).expect(400);
    await authenticated(
      'post',
      `/attempts/${attemptId}/questions/${questions[0].id}/answer`,
    )
      .send({ answer: questionFixtures[0].wrong })
      .expect(201);
    await submitAll(attemptId);
    const resumed = await start();
    expect(resumed.body.id).toBe(attemptId);
    expect(
      await prisma.attempt.count({
        where: { studentId: student.id, simulationId: publicSimulationId },
      }),
    ).toBe(1);
    const restored = await authenticated(
      'get',
      `/attempts/${attemptId}/questions`,
    ).expect(200);
    expect(
      restored.body.map((question: { type: string }) => question.type),
    ).toEqual(questionFixtures.map((fixture) => fixture.type));
    restored.body.forEach(
      (question: Record<string, unknown>, index: number) => {
        expect(question.answer).toEqual(questionFixtures[index].correct);
        expect(question).not.toHaveProperty('isCorrect');
      },
    );
    expectSafePayload(restored.body);
    const finished = await authenticated(
      'post',
      `/attempts/${attemptId}/finish`,
    ).expect(201);
    expect(finished.body.attempt).toMatchObject({
      status: 'FINISHED',
      correctCount: 4,
      wrongCount: 0,
    });
    expect(Number(finished.body.attempt.score)).toBe(10);
    expect(Number(finished.body.attempt.percentage)).toBe(100);
    expect(
      finished.body.questions.every(
        (question: { isCorrect: boolean }) => question.isCorrect,
      ),
    ).toBe(true);
    expect(
      finished.body.questions.map(
        (question: { funFact: string }) => question.funFact,
      ),
    ).toEqual(
      questionFixtures.map((_, index) => `Curiosidade sintética ${index + 1}`),
    );
    expectSafePayload(finished.body);
    const result = await authenticated(
      'get',
      `/attempts/${attemptId}/result`,
    ).expect(200);
    expect(result.body).toEqual(finished.body);
    const history = await authenticated('get', '/me/attempts').expect(200);
    expect(history.body).toHaveLength(1);
    expect(history.body[0].id).toBe(attemptId);
    expectSafePayload(history.body);
    await authenticated(
      'post',
      `/attempts/${attemptId}/questions/${questions[0].id}/answer`,
    )
      .send({ answer: questionFixtures[0].wrong })
      .expect(400);
    await authenticated('post', `/attempts/${attemptId}/finish`).expect(400);
    expect(
      (
        await prisma.attemptAnswer.findUniqueOrThrow({
          where: {
            attemptId_questionId: { attemptId, questionId: questions[0].id },
          },
        })
      ).answer,
    ).toEqual(questionFixtures[0].correct);
  });

  it('prevents another student from reading or changing an attempt, and restricts question administration', async () => {
    const attempt = await start();
    const attemptId = attempt.body.id;
    for (const path of [
      `/attempts/${attemptId}`,
      `/attempts/${attemptId}/questions`,
      `/attempts/${attemptId}/result`,
    ]) {
      await authenticated('get', path, outsider).expect(403);
    }
    await authenticated(
      'post',
      `/attempts/${attemptId}/questions/${questions[0].id}/answer`,
      outsider,
    )
      .send({ answer: questionFixtures[0].correct })
      .expect(403);
    await authenticated(
      'post',
      `/attempts/${attemptId}/finish`,
      outsider,
    ).expect(403);
    expect(await prisma.attemptAnswer.count({ where: { attemptId } })).toBe(0);
    await request(app.getHttpServer())
      .get(`/simulations/${publicSimulationId}/questions`)
      .expect(401);
    await authenticated(
      'get',
      `/simulations/${publicSimulationId}/questions`,
    ).expect(403);
    const adminQuestions = await authenticated(
      'get',
      `/simulations/${publicSimulationId}/questions`,
      admin,
    ).expect(200);
    expect(adminQuestions.body).toHaveLength(4);
    expectSafePayload(adminQuestions.body);
    const ownAttempt = await authenticated(
      'get',
      `/attempts/${attemptId}`,
    ).expect(200);
    expectSafePayload(ownAttempt.body);
  });

  it('rejects answers from a different simulation and invalid bodies without persisting them', async () => {
    const attempt = await start();
    const foreignQuestion = await prisma.question.findFirstOrThrow({
      where: { simulationId: privateSimulationId },
    });
    await authenticated(
      'post',
      `/attempts/${attempt.body.id}/questions/${foreignQuestion.id}/answer`,
    )
      .send({ answer: { optionKey: 'B' } })
      .expect(404);
    await authenticated(
      'post',
      `/attempts/${attempt.body.id}/questions/${questions[0].id}/answer`,
    )
      .send({ answer: 'B' })
      .expect(400);
    await authenticated(
      'post',
      `/attempts/${attempt.body.id}/questions/${questions[0].id}/answer`,
    )
      .send({ answer: { optionKey: 'B' }, isCorrect: true })
      .expect(400);
    expect(
      await prisma.attemptAnswer.count({
        where: { attemptId: attempt.body.id },
      }),
    ).toBe(0);
  });

  it('allows unanswered simulations to finish and records every missing answer as zero points', async () => {
    const attempt = await start();
    const finished = await authenticated(
      'post',
      `/attempts/${attempt.body.id}/finish`,
    ).expect(201);
    expect(finished.body.attempt).toMatchObject({
      correctCount: 0,
      wrongCount: 4,
    });
    expect(Number(finished.body.attempt.score)).toBe(0);
    expect(finished.body.questions).toHaveLength(4);
    finished.body.questions.forEach(
      (question: { isCorrect: boolean; pointsEarned: string }) => {
        expect(question.isCorrect).toBe(false);
        expect(Number(question.pointsEarned)).toBe(0);
      },
    );
    expectSafePayload(finished.body);
  });

  it.each(correctionCases)(
    'corrects $fixture.type as all-or-nothing when the answer is $state',
    async ({ fixture, answer, expected }) => {
      const attempt = await start();
      const question = questions.find((item) => item.type === fixture.type)!;
      await authenticated(
        'post',
        `/attempts/${attempt.body.id}/questions/${question.id}/answer`,
      )
        .send({ answer })
        .expect(201);
      const finished = await authenticated(
        'post',
        `/attempts/${attempt.body.id}/finish`,
      ).expect(201);
      const result = finished.body.questions.find(
        (item: { id: string }) => item.id === question.id,
      );
      expect(Number(result.pointsEarned)).toBe(expected);
      expect(result.isCorrect).toBe(expected > 0);
      expect(Number(finished.body.attempt.score)).toBe(expected);
      expect(finished.body.attempt.correctCount).toBe(expected > 0 ? 1 : 0);
      expectSafePayload(finished.body);
    },
  );

  it('supports the existing legacy answer endpoint without exposing correction before finish', async () => {
    const attempt = await start();
    const answer = await authenticated(
      'post',
      `/attempts/${attempt.body.id}/answers`,
    )
      .send({
        questionId: questions[0].id,
        answer: questionFixtures[0].correct,
      })
      .expect(201);
    expect(answer.body.isCorrect).toBeNull();
    expectSafePayload(answer.body);
    const restored = await authenticated(
      'get',
      `/attempts/${attempt.body.id}/questions`,
    ).expect(200);
    expect(restored.body[0].answer).toEqual(questionFixtures[0].correct);
    expectSafePayload(restored.body);
  });

  it('grants student summaries to the owner and linked guardian while keeping other students and guardians out', async () => {
    const attempt = await start();
    await submitAll(attempt.body.id);
    await authenticated('post', `/attempts/${attempt.body.id}/finish`).expect(
      201,
    );
    for (const suffix of ['', '/attempts', '/performance']) {
      await authenticated(
        'get',
        `/students/${student.id}${suffix}`,
        outsider,
      ).expect(403);
      await authenticated(
        'get',
        `/students/${student.id}${suffix}`,
        guardian,
      ).expect(403);
      await authenticated(
        'get',
        `/students/${student.id}${suffix}`,
        teacher,
      ).expect(403);
    }
    const profile = await authenticated('get', '/students/me').expect(200);
    expect(profile.body.id).toBe(student.id);
    expect(profile.body.studentProfile.schoolYear).toBe(3);
    expectSafePayload(profile.body);
    const link = await authenticated('post', '/guardians/students', admin)
      .send({
        guardianId: guardian.id,
        studentId: student.id,
        relationship: 'responsável sintético',
      })
      .expect(201);
    expectSafePayload(link.body);
    for (const session of [student, guardian, admin]) {
      for (const suffix of ['', '/attempts', '/performance']) {
        const summary = await authenticated(
          'get',
          `/students/${student.id}${suffix}`,
          session,
        ).expect(200);
        expectSafePayload(summary.body);
      }
      for (const suffix of ['summary', 'by-discipline']) {
        const report = await authenticated(
          'get',
          `/reports/student/${student.id}/${suffix}`,
          session,
        ).expect(200);
        expectSafePayload(report.body);
      }
    }
    const children = await authenticated(
      'get',
      '/guardians/me/students',
      guardian,
    ).expect(200);
    expect(children.body).toHaveLength(1);
    expect(children.body[0].student.id).toBe(student.id);
    expect(children.body[0].student.studentProfile.schoolYear).toBe(3);
    expectSafePayload(children.body);
    await authenticated('get', `/students/${outsider.id}`, guardian).expect(
      403,
    );
    await authenticated(
      'get',
      `/reports/student/${student.id}/summary`,
      outsider,
    ).expect(403);
    await authenticated(
      'get',
      `/reports/student/${outsider.id}/summary`,
      guardian,
    ).expect(403);
    await authenticated(
      'get',
      `/attempts/${attempt.body.id}/questions`,
      guardian,
    ).expect(403);
    await authenticated(
      'delete',
      `/guardians/${guardian.id}/students/${student.id}`,
      admin,
    ).expect(204);
    await authenticated(
      'get',
      `/students/${student.id}/attempts`,
      guardian,
    ).expect(403);
  });
});

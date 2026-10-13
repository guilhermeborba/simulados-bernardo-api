import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Session {
  id: string;
  token: string;
}
interface Quiz {
  id: string;
  activityKey: string;
  questions: { id: string }[];
}
const years = [
  ['INFANTIL', -2],
  ['INFANTIL', -1],
  ...Array.from({ length: 5 }, (_, i) => ['FUNDAMENTAL_I', i + 1]),
  ...Array.from({ length: 4 }, (_, i) => ['FUNDAMENTAL_II', i + 6]),
  ['MEDIO', 10],
  ['MEDIO', 11],
  ['MEDIO', 12],
  ['ENFERMAGEM', 0],
] as [string, number][];
const fixedTime = '2026-10-12T18:00:00.000Z';

// Real guards, DTOs, migration chain and concurrent PostgreSQL transactions.
// The guarded integration runner supplies only a disposable synthetic database.
describe('Skills, evidence and review (Nest + PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = 'test';
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
    await app.listen(0, '127.0.0.1');
    prisma = app.get(PrismaService);
    jest.useFakeTimers({
      now: new Date(fixedTime),
      doNotFake: [
        'nextTick',
        'setImmediate',
        'clearImmediate',
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'performance',
        'hrtime',
        'queueMicrotask',
      ],
    });
  });

  async function clean() {
    // These are exclusively fixture tables in the runner's empty test database.
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Discipline", "Turma", "AuditLog" CASCADE',
    );
  }
  async function session(role: UserRole = UserRole.STUDENT): Promise<Session> {
    const user = await prisma.user.create({
      data: {
        name: 'Synthetic mission account',
        email: `${randomUUID()}@example.test`,
        role,
        status: 'ACTIVE',
        passwordHash: 'synthetic-not-a-password',
        ...(role === UserRole.STUDENT
          ? { studentProfile: { create: { schoolYear: 3 } } }
          : {}),
      },
    });
    // Long-lived synthetic tokens let these cases cross midnight/week boundaries.
    const token = app.get(JwtService).sign(
      { sub: user.id, email: user.email, role, type: 'access' },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '365d',
      },
    );
    return { id: user.id, token };
  }
  beforeEach(async () => {
    jest.setSystemTime(new Date(fixedTime));
    await clean();
    admin = await session(UserRole.ADMIN);
    student = await session();
    outsider = await session();
    teacher = await session(UserRole.TEACHER);
    disciplineId = (
      await prisma.discipline.create({
        data: { name: 'Synthetic mission theme', slug: 'matematica' },
      })
    ).id;
    turmaId = (
      await prisma.turma.create({
        data: {
          name: 'Synthetic mission group',
          slug: 'mission-group',
          schoolYear: 3,
        },
      })
    ).id;
  });
  afterAll(async () => {
    jest.useRealTimers();
    if (prisma) await clean();
    await app?.close();
  });
  function http(
    method: 'get' | 'post' | 'patch',
    path: string,
    user = student,
  ) {
    if (method === 'post' && path.endsWith('/answer'))
      jest.setSystemTime(new Date(Date.now() + 1000));
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${user.token}`);
  }
  async function quiz(
    overrides: Record<string, unknown> = {},
    publish = true,
  ): Promise<Quiz> {
    const response = await http('post', '/quizzes', admin)
      .send({
        activityKey: `mission-quiz-${randomUUID()}`,
        title: 'Synthetic learning activity',
        topic: 'Practice',
        schoolYear: 3,
        disciplineId,
        questions: [
          {
            originKey: 'synthetic.quantity',
            statement: 'Quanto é um mais um?',
            explanation: 'Um mais um são dois.',
            points: 2.5,
            options: [
              { optionKey: 'A', text: 'Uma unidade' },
              { optionKey: 'B', text: 'Duas unidades' },
            ],
            correctAnswer: 'B',
          },
        ],
        ...overrides,
      })
      .expect(201);
    if (publish)
      await http('patch', `/quizzes/${response.body.id}/publish`, admin).expect(
        200,
      );
    return response.body as Quiz;
  }
  async function ready(q: Quiz, user = student, optionKey = 'B') {
    const started = await http(
      'post',
      `/quizzes/${q.id}/attempts`,
      user,
    ).expect(201);
    const questions = await http(
      'get',
      `/attempts/${started.body.id}/questions`,
      user,
    ).expect(200);
    for (const question of questions.body as { id: string }[])
      await http(
        'post',
        `/attempts/${started.body.id}/questions/${question.id}/answer`,
        user,
      )
        .send({ answer: { optionKey } })
        .expect(201);
    return started.body.id as string;
  }
  function finish(attemptId: string, user = student) {
    return http('post', `/attempts/${attemptId}/finish`, user);
  }
  function missionPayload(
    activityKeys: string[],
    overrides: Record<string, unknown> = {},
  ) {
    return {
      title: 'Synthetic weekly mission',
      description: 'Pratique duas pequenas atividades no seu tempo.',
      segment: 'FUNDAMENTAL_I',
      schoolYear: 3,
      weekStart: '2026-10-12',
      slot: 1,
      activityKeys,
      ...overrides,
    };
  }
  async function mission(
    activityKeys: string[],
    overrides: Record<string, unknown> = {},
    publish = true,
  ) {
    const created = await http('post', '/missions', admin)
      .send(missionPayload(activityKeys, overrides))
      .expect(201);
    if (publish)
      await http('patch', `/missions/${created.body.id}/publish`, admin).expect(
        200,
      );
    return created.body.id as string;
  }
  async function home(user = student, query = '') {
    return (await http('get', `/me/learning-home${query}`, user).expect(200))
      .body;
  }
  function safe(value: unknown) {
    const text = JSON.stringify(value);
    for (const key of [
      'officialAnswers',
      'passwordHash',
      'tokenHash',
      'correctAnswer',
      'questionSnapshots',
      'createdById',
    ])
      expect(text).not.toContain(`"${key}"`);
  }

  const progress = async (year = 3, user = student) =>
    (
      await http(
        'get',
        `/me/learning-progress?schoolYear=${year}`,
        user,
      ).expect(200)
    ).body;
  const complete = async (q: Quiz, user = student, option = 'B') =>
    finish(await ready(q, user, option), user).expect(201);
  async function skill(
    overrides: Record<string, unknown> = {},
    publish = true,
  ) {
    const created = await http('post', '/learning-skills', admin)
      .send({
        code: `synthetic.${randomUUID()}`,
        version: 1,
        title: 'Interpretar quantidades',
        description: 'Relacionar quantidades em perguntas sintéticas.',
        disciplineId,
        schoolYear: 3,
        ...overrides,
      })
      .expect(201);
    if (publish)
      await http('patch', `/learning-skills/${created.body.id}/publish`, admin)
        .send({ reviewConfirmed: true })
        .expect(200);
    return created.body;
  }
  function questions(
    sk: { code: string; version: number },
    count = 1,
    start = 0,
  ) {
    return Array.from({ length: count }, (_, i) => ({
      originKey: `synthetic.quantity.${i + start}`,
      statement: `Pergunta sintética ${i + start}: quanto é um mais um?`,
      explanation: 'Uma unidade mais uma unidade resulta em duas.',
      points: 1,
      skill: { code: sk.code, version: sk.version },
      options: [
        { optionKey: 'A', text: 'Uma unidade' },
        { optionKey: 'B', text: 'Duas unidades' },
      ],
      correctAnswer: 'B',
    }));
  }
  async function classified(
    sk: { code: string; version: number },
    count = 1,
    overrides: Record<string, unknown> = {},
  ) {
    return quiz({ questions: questions(sk, count), ...overrides });
  }
  const review = (quizId: string, user = student) =>
    http('post', '/me/review-attempts', user).send({ quizId });
  async function finishReview(id: string, optionKey = 'B') {
    const rows = (await http('get', `/attempts/${id}/questions`).expect(200))
      .body;
    for (const question of rows)
      await http('post', `/attempts/${id}/questions/${question.id}/answer`)
        .send({ answer: { optionKey } })
        .expect(201);
    return finish(id).expect(201);
  }
  it('begins empty and does not classify legacy history retroactively', async () => {
    const before = await progress();
    expect(before.skills).toEqual([]);
    expect(before.reviewSuggestions).toEqual([]);
    expect(before.inProgressReview).toBeNull();
    await complete(await quiz(), student, 'A');
    const after = await progress();
    expect(after.unclassifiedQuestions).toBe(1);
    expect(after.skills).toEqual([]);
    expect(after.reviewSuggestions).toEqual([]);
    safe(after);
  });
  it('requires current active STUDENT role for own evidence and ADMIN for authorship', async () => {
    await request(app.getHttpServer()).get('/me/learning-progress').expect(401);
    await http('get', '/me/learning-progress', teacher).expect(403);
    await http('post', '/learning-skills').send({}).expect(403);
    await http('post', '/me/review-attempts', teacher)
      .send({ quizId: 'unknown' })
      .expect(403);
    await http('get', `/me/learning-progress/${outsider.id}`).expect(404);
    await prisma.user.update({
      where: { id: student.id },
      data: { role: 'TEACHER' },
    });
    await http('get', '/me/learning-progress').expect(401);
  });
  it.each([
    {},
    { quizId: null },
    { quizId: 9 },
    { quizId: 'missing', questions: ['forged'] },
    { quizId: 'missing', schoolYear: 3 },
  ])('rejects a forged review payload %j', async (body) => {
    await http('post', '/me/review-attempts').send(body).expect(400);
  });
  it('requires explicit editorial approval and compatible skill scope to publish', async () => {
    const draft = await skill({}, false);
    await http('patch', `/learning-skills/${draft.id}/publish`, admin)
      .send({})
      .expect(400);
    await http('patch', `/learning-skills/${draft.id}/publish`, admin)
      .send({ reviewConfirmed: false })
      .expect(400);
    const q = await quiz({ questions: questions(draft) }, false);
    await http('patch', `/quizzes/${q.id}/publish`, admin).expect(400);
    await http('patch', `/learning-skills/${draft.id}/publish`, admin)
      .send({ reviewConfirmed: true })
      .expect(200);
    await http('patch', `/quizzes/${q.id}/publish`, admin).expect(200);
    const other = await skill({ schoolYear: 4 });
    await http('post', '/quizzes', admin)
      .send({
        activityKey: `invalid-${randomUUID()}`,
        title: 'Synthetic wrong scope',
        schoolYear: 3,
        topic: 'Quantities',
        disciplineId,
        questions: questions(other),
      })
      .expect(400);
    await http('patch', `/quizzes/${q.id}`, admin)
      .send({ questions: questions(other) })
      .expect(409);
  });
  it('counts first classified responses separately from retries and REVIEW without extra reward', async () => {
    const sk = await skill();
    const q = await classified(sk);
    const first = await complete(q, student, 'A');
    let data = await progress();
    expect(data.skills[0]).toMatchObject({
      firstResponse: { questions: 1, correct: 0 },
      repeat: { responses: 0, correct: 0 },
      review: { responses: 0, correct: 0, differentQuestions: 0 },
      evidence: 'INSUFFICIENT',
    });
    expect(data.reviewSuggestions[0].quizId).toBe(q.id);
    const before = (await home()).xp.total;
    const started = (await review(q.id).expect(201)).body;
    expect(started.practiceMode).toBe('REVIEW');
    const content = (
      await http('get', `/attempts/${started.id}/questions`).expect(200)
    ).body;
    expect(content).toHaveLength(1);
    expect(content[0].practicedBefore).toBe(true);
    safe(content);
    const result = await finishReview(started.id);
    expect(result.body.reward).toEqual({
      xpAwarded: 0,
      reason: 'REVIEW',
      day: null,
    });
    expect(
      await finish(started.id)
        .expect(201)
        .then((r) => r.body),
    ).toEqual(result.body);
    expect(
      await http('get', `/attempts/${started.id}/result`)
        .expect(200)
        .then((r) => r.body),
    ).toEqual(result.body);
    expect((await home()).xp.total).toBe(before);
    expect(await prisma.quizCompletionReward.count()).toBe(1);
    expect(await prisma.missionProgress.count()).toBe(0);
    data = await progress();
    expect(data.skills[0]).toMatchObject({
      firstResponse: { questions: 1, correct: 0 },
      review: { responses: 1, correct: 1, differentQuestions: 1 },
      evidence: 'INSUFFICIENT',
    });
    expect(data.reviewSuggestions).toEqual([]);
    expect((await progress(3, outsider)).skills).toEqual([]);
    expect(first.body.reward.xpAwarded).toBe(10);
  });
  it('never declares observed evidence from repeated correct answers alone', async () => {
    const sk = await skill();
    const q = await classified(sk);
    await complete(q, student, 'A');
    for (let i = 0; i < 6; i++) await complete(q);
    const row = (await progress()).skills[0];
    expect(row.firstResponse.questions).toBe(1);
    expect(row.repeat).toEqual({ responses: 6, correct: 6 });
    expect(row.evidence).toBe('INSUFFICIENT');
  });
  it('reports initial observations only after five independent first responses', async () => {
    const sk = await skill();
    await complete(await classified(sk, 5));
    const row = (await progress()).skills[0];
    expect(row.firstResponse).toEqual({ questions: 5, correct: 5 });
    expect(row.distinctQuestions).toBe(5);
    expect(row.evidence).toBe('OBSERVED');
    expect(JSON.stringify(row).toLowerCase()).not.toContain('master');
  });
  it('selects at most five unseen alternatives from one published quiz version', async () => {
    const sk = await skill();
    const first = await classified(sk);
    await complete(first, student, 'A');
    const next = (
      await http('post', `/quizzes/${first.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http('patch', `/quizzes/${next.id}`, admin)
      .send({ questions: questions(sk, 8) })
      .expect(200);
    await http('patch', `/quizzes/${next.id}/publish`, admin).expect(200);
    const started = (await review(next.id).expect(201)).body;
    const selected = (
      await http('get', `/attempts/${started.id}/questions`).expect(200)
    ).body;
    expect(selected).toHaveLength(5);
    expect(
      selected.every((q: { practicedBefore: boolean }) => !q.practicedBefore),
    ).toBe(true);
    expect(
      selected.map((q: { originKey: string }) => q.originKey),
    ).not.toContain('synthetic.quantity.0');
    expect(started.contentVersion).toBe(2);
    expect(started.maxScore).toBe('5');
    await finishReview(started.id);
    await complete(next);
    const row = (await progress()).skills[0];
    expect(row.firstResponse.questions).toBe(3);
    expect(row.repeat.responses).toBe(6);
    expect(row.review.responses).toBe(5);
    expect(row.evidence).toBe('INSUFFICIENT');
  });
  it('resumes a separate REVIEW while NORMAL is open and serializes concurrent starts', async () => {
    const sk = await skill();
    const q = await classified(sk);
    await complete(q, student, 'A');
    const normal = await ready(q);
    const rows = await Promise.all(
      Array.from({ length: 6 }, () => review(q.id).expect(201)),
    );
    expect(new Set(rows.map((r) => r.body.id)).size).toBe(1);
    expect(rows[0].body.id).not.toBe(normal);
    expect((await home()).inProgress.id).toBe(normal);
    expect((await progress()).inProgressReview.id).toBe(rows[0].body.id);
    await prisma.simulation.update({
      where: { id: q.id },
      data: { status: 'ARCHIVED' },
    });
    await http('get', `/attempts/${rows[0].body.id}/questions`).expect(200);
    await finishReview(rows[0].body.id);
  });
  it('does not use pending/archived skills or inaccessible source content in review', async () => {
    const sk = await skill();
    const q = await classified(sk);
    await complete(q, student, 'A');
    await http('patch', `/learning-skills/${sk.id}/archive`, admin).expect(200);
    expect((await progress()).skills[0].firstResponse.questions).toBe(1);
    expect((await progress()).reviewSuggestions).toEqual([]);
    await review(q.id).expect(404);
  });
  it('retains generic own statistics after group revocation without leaking questions or suggestions', async () => {
    const sk = await skill();
    await prisma.turmaMembership.create({
      data: { userId: student.id, turmaId },
    });
    const q = await classified(sk, 1, {
      turmaId,
      title: 'Secret private quiz',
      topic: 'Secret topic',
    });
    await complete(q, student, 'A');
    await prisma.turmaMembership.deleteMany({ where: { userId: student.id } });
    const data = await progress();
    expect(data.skills[0].firstResponse.questions).toBe(1);
    expect(data.reviewSuggestions).toEqual([]);
    expect(JSON.stringify(data)).not.toMatch(
      /Secret private|Secret topic|statement|officialAnswers/,
    );
    await review(q.id).expect(404);
  });
  it.each(years)(
    'supports %s / %i with explicit evidence and authorized practice',
    async (segment, schoolYear) => {
      if (schoolYear <= 0) {
        const slug =
          schoolYear === 0
            ? 'enfermagem'
            : 'infantil-espacos-tempos-quantidades';
        disciplineId = (
          await prisma.discipline.create({
            data: { slug, name: 'Synthetic age-compatible discipline' },
          })
        ).id;
      }
      const sk = await skill({ schoolYear });
      await http('patch', '/me/learning-preferences')
        .send({ segment, schoolYear })
        .expect(200);
      const q = await classified(sk, 1, { schoolYear });
      await complete(q, student, 'A');
      const data = await progress(schoolYear);
      expect(data.schoolYear).toBe(schoolYear);
      expect(data.skills[0].evidence).toBe('INSUFFICIENT');
      expect(data.reviewSuggestions).toHaveLength(1);
      const id = (await review(q.id).expect(201)).body.id;
      await finishReview(id);
      expect((await progress(schoolYear)).skills[0].review.responses).toBe(1);
    },
  );
  it.each([
    { status: 'INACTIVE' },
    { role: 'TEACHER' },
    { deletedAt: new Date(fixedTime) },
  ])(
    'rejects existing review access after current account changes: %j',
    async (data) => {
      const sk = await skill();
      const q = await classified(sk);
      await complete(q, student, 'A');
      const id = (await review(q.id).expect(201)).body.id;
      const rows = (await http('get', `/attempts/${id}/questions`).expect(200))
        .body;
      await prisma.user.update({
        where: { id: student.id },
        data: data as Prisma.UserUpdateInput,
      });
      await http('get', `/attempts/${id}`).expect(401);
      await http('get', `/attempts/${id}/questions`).expect(401);
      await http('get', `/attempts/${id}/result`).expect(401);
      await http('post', `/attempts/${id}/questions/${rows[0].id}/answer`)
        .send({ answer: { optionKey: 'B' } })
        .expect(401);
      await finish(id).expect(401);
      expect(
        await prisma.attemptAnswer.count({ where: { attemptId: id } }),
      ).toBe(0);
      expect(
        (await prisma.attempt.findUniqueOrThrow({ where: { id } })).status,
      ).toBe('IN_PROGRESS');
    },
  );
  it('rejects a stale ADMIN token after demotion when accessing another student review', async () => {
    const sk = await skill();
    const q = await classified(sk);
    await complete(q, student, 'A');
    const id = (await review(q.id).expect(201)).body.id;
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: 'STUDENT' },
    });
    await http('get', `/attempts/${id}`, admin).expect(401);
    await http('get', `/attempts/${id}/questions`, admin).expect(401);
    // Finish's existing role guard rejects ADMIN before entering the service.
    await finish(id, admin).expect(403);
  });
  it('ignores difficulties older than 30 days while retaining progress', async () => {
    const sk = await skill();
    await complete(await classified(sk), student, 'A');
    jest.setSystemTime(new Date('2026-11-13T18:00:00Z'));
    expect((await progress()).skills[0].firstResponse.questions).toBe(1);
    expect((await progress()).reviewSuggestions).toEqual([]);
  });
  it('review of another logical quiz does not advance its mission or collection', async () => {
    const sk = await skill();
    const source = await classified(sk);
    await complete(source, student, 'A');
    const target = await classified(sk, 3);
    await mission([target.activityKey]);
    const before = await prisma.userAchievement.count();
    const id = (await review(target.id).expect(201)).body.id;
    await finishReview(id);
    expect(await prisma.quizCompletionReward.count()).toBe(1);
    expect(await prisma.missionProgress.count()).toBe(0);
    expect(await prisma.userAchievement.count()).toBe(before);
    expect((await home()).xp.total).toBe(10);
  });
  it('freezes skill versions in snapshots and never reclassifies earlier answers', async () => {
    const first = await skill();
    const q = await classified(first);
    await complete(q, student, 'A');
    const newer = await skill({
      code: first.code,
      version: 2,
      title: 'New reviewed wording',
    });
    const version = (
      await http('post', `/quizzes/${q.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http('patch', `/quizzes/${version.id}`, admin)
      .send({ questions: questions(newer) })
      .expect(200);
    await http('patch', `/quizzes/${version.id}/publish`, admin).expect(200);
    await complete(version);
    const rows = (await progress()).skills;
    expect(rows).toHaveLength(2);
    expect(
      rows.find((row: { version: number }) => row.version === 1),
    ).toMatchObject({
      title: first.title,
      firstResponse: { questions: 1, correct: 0 },
    });
    expect(
      rows.find((row: { version: number }) => row.version === 2),
    ).toMatchObject({
      title: newer.title,
      firstResponse: { questions: 0, correct: 0 },
      repeat: { responses: 1, correct: 1 },
      evidence: 'INSUFFICIENT',
    });
  });
});

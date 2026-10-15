import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ActivityKind, SimulationStatus, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';
import {
  normalizeCatalogQuiz,
  readQuizCatalog,
  validateQuizCatalog,
} from '../prisma/quiz-catalog';
import { importQuizCatalog } from '../prisma/quiz-catalog-import';
import { QuizzesService } from '../src/modules/quizzes/quizzes.service';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
function fixture(
  activityKey = `catalog-${randomUUID()}`,
  overrides: Record<string, unknown> = {},
) {
  return {
    activityKey,
    contentVersion: 1,
    disciplineSlug: 'matematica',
    schoolYear: 3,
    topic: 'Contagem',
    title: 'Conte as unidades',
    estimatedDurationMinutes: 5,
    review: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
    questions: [
      {
        originKey: 'quantity.one',
        statement: 'Quanto é um mais um?',
        explanation: 'Uma unidade mais uma unidade resulta em duas.',
        points: 1,
        options: [
          { optionKey: 'A', text: 'Um' },
          { optionKey: 'B', text: 'Dois' },
        ],
        correctAnswer: 'B',
      },
    ],
    ...overrides,
  };
}
function approve(input: ReturnType<typeof fixture>) {
  return {
    ...input,
    review: {
      status: 'APPROVED',
      reviewedBy: 'Synthetic test reviewer',
      reviewedAt: '2026-10-01T12:00:00.000Z',
      contentHash: normalizeCatalogQuiz(input).contentHash,
    },
  };
}

describe('Atomic versioned quiz catalog import (real Nest + PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminId: string;
  let studentId: string;
  let token: string;
  let disciplineId: string;
  let passwordHash: string;
  const authorEmail = 'quiz-catalog-admin@example.test';
  const password = 'Synthetic-catalog-test-password-123';

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
    passwordHash = await hash(password, 4);
  });
  async function clean() {
    await prisma.attemptQuestionSnapshot.deleteMany();
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
  }
  beforeEach(async () => {
    await clean();
    adminId = (
      await prisma.user.create({
        data: {
          name: 'Synthetic catalog admin',
          email: authorEmail,
          passwordHash,
          role: UserRole.ADMIN,
          status: 'ACTIVE',
        },
      })
    ).id;
    const student = await prisma.user.create({
      data: {
        name: 'Synthetic catalog student',
        email: 'quiz-catalog-student@example.test',
        passwordHash,
        role: UserRole.STUDENT,
        status: 'ACTIVE',
        studentProfile: { create: { schoolYear: 3 } },
      },
    });
    studentId = student.id;
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: student.email, password })
      .expect(200);
    token = login.body.accessToken as string;
    disciplineId = (
      await prisma.discipline.create({
        data: { name: 'Synthetic math', slug: 'matematica' },
      })
    ).id;
  });
  afterAll(async () => {
    if (prisma) await clean();
    await app?.close();
  });
  function http(method: 'get' | 'post', path: string) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${token}`);
  }
  function run(inputs: unknown[], publishReviewed = false) {
    return importQuizCatalog(prisma, validateQuizCatalog(inputs), {
      authorEmail,
      publishReviewed,
    });
  }
  async function saved(activityKey: string, contentVersion = 1) {
    return prisma.simulation.findUniqueOrThrow({
      where: { activityKey_contentVersion: { activityKey, contentVersion } },
      include: { questions: { include: { options: true, answers: true } } },
    });
  }
  async function start(id: string) {
    const response = await http('post', `/quizzes/${id}/attempts`).expect(201);
    return response.body as { id: string };
  }

  it('imports only DRAFT quizzes and never creates accounts or disciplines', async () => {
    const input = fixture();
    expect(await run([input])).toEqual({
      created: 1,
      unchanged: 0,
      published: 0,
    });
    const quiz = await saved(input.activityKey);
    expect(quiz).toMatchObject({
      status: SimulationStatus.DRAFT,
      publishedAt: null,
      createdById: adminId,
      activityKind: ActivityKind.QUIZ,
      contentVersion: 1,
      bimester: null,
      assessment: null,
      totalQuestions: 1,
    });
    expect(quiz.maxScore.toString()).toBe('1');
    expect((await http('get', '/quizzes/available').expect(200)).body).toEqual(
      [],
    );
    expect(await prisma.user.count()).toBe(2);
    expect(await prisma.discipline.count()).toBe(1);
  });
  it('imports the complete 45-quiz catalog with all 213 questions and registered media twice unchanged', async () => {
    const catalog = readQuizCatalog();
    for (const slug of new Set(catalog.map((quiz) => quiz.disciplineSlug))) {
      if (slug !== 'matematica')
        await prisma.discipline.create({
          data: { name: `Synthetic ${slug}`, slug },
        });
    }
    const options = { authorEmail, bootstrapLatestVersions: true };
    expect(await importQuizCatalog(prisma, catalog, options)).toEqual({
      created: 45,
      unchanged: 0,
      published: 0,
    });
    const before = await prisma.simulation.findMany({
      orderBy: { activityKey: 'asc' },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { options: true, answers: true },
        },
      },
    });
    expect(before.every((quiz) => quiz.status === SimulationStatus.DRAFT)).toBe(
      true,
    );
    expect(await prisma.question.count()).toBe(213);
    const infantQuestions = before
      .filter((quiz) => quiz.schoolYear < 0)
      .flatMap((quiz) => quiz.questions);
    expect(infantQuestions).toHaveLength(18);
    for (const question of infantQuestions) {
      expect(question.media).toMatchObject({
        image: { sha256: expect.stringMatching(/^[a-f0-9]{64}$/) },
        audio: { sha256: expect.stringMatching(/^[a-f0-9]{64}$/) },
      });
    }
    expect(await importQuizCatalog(prisma, catalog, options)).toEqual({
      created: 0,
      unchanged: 45,
      published: 0,
    });
    expect(
      await prisma.simulation.findMany({
        orderBy: { activityKey: 'asc' },
        include: {
          questions: {
            orderBy: { sortOrder: 'asc' },
            include: { options: true, answers: true },
          },
        },
      }),
    ).toEqual(before);
    expect((await http('get', '/quizzes/available').expect(200)).body).toEqual(
      [],
    );
  });
  it('requires explicit bootstrap for a current baseline and still rejects gaps afterwards', async () => {
    const baseline = fixture('baseline', { contentVersion: 2 });
    const catalog = validateQuizCatalog([baseline]);
    await expect(
      importQuizCatalog(prisma, catalog, { authorEmail }),
    ).rejects.toThrow('consecutiva');
    expect(await prisma.simulation.count()).toBe(0);
    const options = { authorEmail, bootstrapLatestVersions: true };
    expect(await importQuizCatalog(prisma, catalog, options)).toEqual({
      created: 1,
      unchanged: 0,
      published: 0,
    });
    const before = await saved('baseline', 2);
    await expect(
      importQuizCatalog(
        prisma,
        validateQuizCatalog([
          fixture('a-new'),
          fixture('baseline', { contentVersion: 4 }),
        ]),
        options,
      ),
    ).rejects.toThrow('consecutiva');
    expect(await prisma.simulation.count()).toBe(1);
    expect(await saved('baseline', 2)).toEqual(before);
    await expect(
      importQuizCatalog(
        prisma,
        validateQuizCatalog([
          fixture('baseline', { contentVersion: 2, title: 'Changed' }),
        ]),
        options,
      ),
    ).rejects.toThrow('nova versão');
    expect(await saved('baseline', 2)).toEqual(before);
    expect(
      await importQuizCatalog(
        prisma,
        validateQuizCatalog([fixture('baseline', { contentVersion: 3 })]),
        options,
      ),
    ).toEqual({ created: 1, unchanged: 0, published: 0 });
  });
  it('publishes only a fully reviewed batch with a valid hash', async () => {
    const input = approve(fixture());
    expect(await run([input], true)).toEqual({
      created: 1,
      unchanged: 0,
      published: 1,
    });
    expect((await saved(input.activityKey)).publishedAt).not.toBeNull();
    expect(
      (await http('get', '/quizzes/available').expect(200)).body,
    ).toHaveLength(1);
  });
  it('rejects mixed pending/approved publication before any write', async () => {
    await expect(run([approve(fixture()), fixture()], true)).rejects.toThrow(
      'Publicação bloqueada',
    );
    expect(await prisma.simulation.count()).toBe(0);
  });
  it('can publish an existing unchanged draft once without replacing questions', async () => {
    const input = fixture();
    await run([input]);
    const before = await saved(input.activityKey);
    const reviewed = approve(input);
    expect(await run([reviewed], true)).toEqual({
      created: 0,
      unchanged: 1,
      published: 1,
    });
    const first = await saved(input.activityKey);
    expect(first.questions).toEqual(before.questions);
    expect(await run([reviewed], true)).toEqual({
      created: 0,
      unchanged: 1,
      published: 0,
    });
    expect(await saved(input.activityKey)).toEqual(first);
  });
  it('reimports without touching IDs, timestamps, confirmed answers or snapshots', async () => {
    const input = approve(fixture());
    await run([input], true);
    const before = await saved(input.activityKey);
    const attempt = await start(before.id);
    await http(
      'post',
      `/attempts/${attempt.id}/questions/${before.questions[0].id}/answer`,
    )
      .send({ answer: { optionKey: 'B' } })
      .expect(201);
    const attemptBefore = await prisma.attempt.findUniqueOrThrow({
      where: { id: attempt.id },
      include: { answers: true, questionSnapshots: true },
    });
    expect(await run([input], true)).toEqual({
      created: 0,
      unchanged: 1,
      published: 0,
    });
    expect(await saved(input.activityKey)).toEqual(before);
    expect(
      await prisma.attempt.findUniqueOrThrow({
        where: { id: attempt.id },
        include: { answers: true, questionSnapshots: true },
      }),
    ).toEqual(attemptBefore);
  });
  it('rejects a same-version content edit and rolls back the complete batch', async () => {
    const input = fixture('z-existing');
    await run([input]);
    const before = await saved(input.activityKey);
    await expect(
      run([fixture('a-new'), { ...input, title: 'Changed same version' }]),
    ).rejects.toThrow('nova versão');
    expect(await prisma.simulation.count()).toBe(1);
    expect(await saved(input.activityKey)).toEqual(before);
  });
  it('rejects missing disciplines without partially importing an earlier item', async () => {
    await expect(
      run([
        fixture('a-valid'),
        fixture('z-missing', { disciplineSlug: 'portugues' }),
      ]),
    ).rejects.toThrow('Disciplina ativa inexistente');
    expect(await prisma.simulation.count()).toBe(0);
  });
  it('requires an active existing ADMIN author and never reactivates the legacy seed account', async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { status: 'INACTIVE' },
    });
    await expect(run([fixture()])).rejects.toThrow('ADMIN ativo');
    expect(await prisma.simulation.count()).toBe(0);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: adminId } })).status,
    ).toBe('INACTIVE');
  });
  it('rejects a teacher author', async () => {
    await prisma.user.update({
      where: { id: adminId },
      data: { role: UserRole.TEACHER },
    });
    await expect(run([fixture()])).rejects.toThrow('ADMIN ativo');
    expect(await prisma.simulation.count()).toBe(0);
  });
  it('resolves existing turmaSlug and preserves quiz membership enforcement', async () => {
    const turma = await prisma.turma.create({
      data: {
        name: 'Synthetic private catalog',
        slug: 'catalog-private',
        schoolYear: 3,
      },
    });
    const input = approve(fixture(undefined, { turmaSlug: turma.slug }));
    await run([input], true);
    const quiz = await saved(input.activityKey);
    expect(quiz.turmaId).toBe(turma.id);
    expect((await http('get', '/quizzes/available').expect(200)).body).toEqual(
      [],
    );
    await http('post', `/quizzes/${quiz.id}/attempts`).expect(404);
    await prisma.turmaMembership.create({
      data: { turmaId: turma.id, userId: studentId },
    });
    await start(quiz.id);
  });
  it('rejects a missing turma instead of creating or making the quiz public', async () => {
    await expect(
      run([fixture(undefined, { turmaSlug: 'missing-turma' })]),
    ).rejects.toThrow('Turma ativa inexistente');
    expect(await prisma.turma.count()).toBe(0);
    expect(await prisma.simulation.count()).toBe(0);
  });
  it('never unarchives an identical published version', async () => {
    const input = approve(fixture());
    await run([input], true);
    const quiz = await saved(input.activityKey);
    await prisma.simulation.update({
      where: { id: quiz.id },
      data: { status: SimulationStatus.ARCHIVED },
    });
    const before = await saved(input.activityKey);
    expect(await run([input], true)).toEqual({
      created: 0,
      unchanged: 1,
      published: 0,
    });
    expect(await saved(input.activityKey)).toEqual(before);
  });
  it('never resurrects a soft-deleted version', async () => {
    const input = approve(fixture());
    await run([input], true);
    const quiz = await saved(input.activityKey);
    await prisma.simulation.update({
      where: { id: quiz.id },
      data: { deletedAt: new Date(), status: SimulationStatus.INACTIVE },
    });
    const before = await saved(input.activityKey);
    await run([input], true);
    expect(await saved(input.activityKey)).toEqual(before);
  });
  it('adds a consecutive version while an older attempt keeps its original correction', async () => {
    const first = approve(fixture());
    await run([first], true);
    const oldQuiz = await saved(first.activityKey);
    const attempt = await start(oldQuiz.id);
    const second = approve(
      fixture(first.activityKey, {
        contentVersion: 2,
        questions: [
          {
            ...first.questions[0],
            explanation: 'Updated explanation for a new version.',
            correctAnswer: 'A',
          },
        ],
      }),
    );
    expect(await run([second], true)).toEqual({
      created: 1,
      unchanged: 0,
      published: 1,
    });
    const answer = await http(
      'post',
      `/attempts/${attempt.id}/questions/${oldQuiz.questions[0].id}/answer`,
    )
      .send({ answer: { optionKey: 'B' } })
      .expect(201);
    expect(answer.body.feedback).toMatchObject({
      isCorrect: true,
      explanation: first.questions[0].explanation,
    });
    expect(await saved(first.activityKey)).toEqual(oldQuiz);
    expect(
      (await http('get', '/quizzes/available').expect(200)).body[0]
        .contentVersion,
    ).toBe(2);
  });
  it('rejects a version gap and a new activity that starts at version two', async () => {
    const first = fixture();
    await run([first]);
    await expect(
      run([fixture(first.activityKey, { contentVersion: 3 })]),
    ).rejects.toThrow('consecutiva');
    await expect(
      run([fixture(undefined, { contentVersion: 2 })]),
    ).rejects.toThrow('consecutiva');
    expect(await prisma.simulation.count()).toBe(1);
  });
  it('serializes simultaneous equivalent imports with one set of rows', async () => {
    const input = fixture();
    const results = await Promise.all(
      Array.from({ length: 4 }, () => run([input])),
    );
    expect(results.reduce((sum, result) => sum + result.created, 0)).toBe(1);
    expect(results.reduce((sum, result) => sum + result.unchanged, 0)).toBe(3);
    expect(await prisma.simulation.count()).toBe(1);
    expect(await prisma.question.count()).toBe(1);
    expect(await prisma.questionOption.count()).toBe(2);
    expect(await prisma.questionAnswer.count()).toBe(1);
  });
  it('coordinates version imports with the administrative API version lock order', async () => {
    const first = fixture();
    await run([first]);
    const quiz = await saved(first.activityKey);
    const result = await Promise.all([
      run([fixture(first.activityKey, { contentVersion: 2 })]),
      app.get(QuizzesService).createVersion(quiz.id, adminId),
    ]);
    expect(result).toHaveLength(2);
    const versions = await prisma.simulation.findMany({
      where: { activityKey: first.activityKey },
      orderBy: { contentVersion: 'asc' },
    });
    expect(versions.map((version) => version.contentVersion)).toEqual(
      versions.length === 2 ? [1, 2] : [1, 2, 3],
    );
  });
  it('rolls back previously created quizzes on a later legacy slug collision and preserves the simulation', async () => {
    const collision = fixture('z-collision');
    const simulation = await prisma.simulation.create({
      data: {
        title: 'Legacy simulation',
        slug: 'quiz-z-collision-v1',
        schoolYear: 3,
        bimester: 1,
        assessment: 'AV1',
        disciplineId,
        createdById: adminId,
        totalQuestions: 0,
        maxScore: 0,
      },
    });
    await expect(
      run([fixture('a-before-collision'), collision]),
    ).rejects.toThrow('slug já existe');
    expect(await prisma.simulation.count()).toBe(1);
    expect(await prisma.question.count()).toBe(0);
    expect(
      await prisma.simulation.findUniqueOrThrow({
        where: { id: simulation.id },
      }),
    ).toEqual(simulation);
  });
});

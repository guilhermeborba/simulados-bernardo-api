import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { LearningSegment, UserRole, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const defaults = {
  segment: null,
  schoolYear: null,
  audioEnabled: false,
  motionEnabled: true,
};
const endpoint = '/me/learning-preferences';
interface Session {
  id: string;
  token: string;
}

describe('Personal learning preferences (real Nest + PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let student: Session;
  let other: Session;
  let passwordHash: string;
  const password = 'Synthetic-preferences-password-123';

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

  async function session(role: UserRole = UserRole.STUDENT): Promise<Session> {
    const user = await prisma.user.create({
      data: {
        name: 'Synthetic preferences user',
        email: `${randomUUID()}@example.test`,
        role,
        status: UserStatus.ACTIVE,
        passwordHash,
        ...(role === UserRole.STUDENT
          ? { studentProfile: { create: { schoolYear: 3 } } }
          : {}),
      },
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return { id: user.id, token: login.body.accessToken as string };
  }

  beforeEach(async () => {
    await clean();
    student = await session();
    other = await session();
  });

  afterAll(async () => {
    if (prisma) await clean();
    await app?.close();
  });

  function http(method: 'get' | 'patch', user = student, path = endpoint) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${user.token}`);
  }

  it('returns defaults without writing preferences, user or legacy student profile', async () => {
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: student.id },
      include: { studentProfile: true },
    });
    const response = await http('get').expect(200);
    expect(response.body).toEqual(defaults);
    expect(await prisma.learningPreferences.count()).toBe(0);
    expect(
      await prisma.user.findUniqueOrThrow({
        where: { id: student.id },
        include: { studentProfile: true },
      }),
    ).toEqual(before);
    await http('patch').send({}).expect(200, defaults);
    expect(await prisma.learningPreferences.count()).toBe(0);
  });

  it.each([UserRole.GUARDIAN, UserRole.TEACHER, UserRole.ADMIN])(
    'supports the current active %s account',
    async (role) => {
      const user = await session(role);
      await http('get', user).expect(200, defaults);
      await http('patch', user)
        .send({ audioEnabled: true })
        .expect(200, { ...defaults, audioEnabled: true });
      await http('get', student).expect(200, defaults);
    },
  );

  it.each([
    ['INFANTIL', -1],
    ['INFANTIL', -2],
    ['FUNDAMENTAL_I', 1],
    ['FUNDAMENTAL_I', 2],
    ['FUNDAMENTAL_I', 3],
    ['FUNDAMENTAL_I', 4],
    ['FUNDAMENTAL_I', 5],
    ['FUNDAMENTAL_II', 6],
    ['FUNDAMENTAL_II', 7],
    ['FUNDAMENTAL_II', 8],
    ['FUNDAMENTAL_II', 9],
    ['MEDIO', 10],
    ['MEDIO', 11],
    ['MEDIO', 12],
    ['ENFERMAGEM', 0],
  ])(
    'persists the %s/%s choice without changing the profile',
    async (segment, schoolYear) => {
      const expected = { ...defaults, segment, schoolYear };
      await http('patch').send({ segment, schoolYear }).expect(200, expected);
      await http('get').expect(200, expected);
      expect(
        (
          await prisma.studentProfile.findUniqueOrThrow({
            where: { userId: student.id },
          })
        ).schoolYear,
      ).toBe(3);
      const row = await prisma.learningPreferences.findUniqueOrThrow({
        where: { userId: student.id },
      });
      expect(row.segment).toBe(segment);
      expect(row.schoolYear).toBe(schoolYear);
    },
  );

  it('supports segment-only filtering and explicit clearing with partial accessibility updates', async () => {
    await http('patch')
      .send({ segment: 'INFANTIL', audioEnabled: true, motionEnabled: false })
      .expect(200, {
        ...defaults,
        segment: 'INFANTIL',
        audioEnabled: true,
        motionEnabled: false,
      });
    await http('patch').send({ schoolYear: -1 }).expect(200);
    await http('patch')
      .send({ schoolYear: null })
      .expect(200, {
        ...defaults,
        segment: 'INFANTIL',
        audioEnabled: true,
        motionEnabled: false,
      });
    await http('patch')
      .send({ segment: null, schoolYear: null })
      .expect(200, { ...defaults, audioEnabled: true, motionEnabled: false });
  });

  it.each([
    { segment: null, schoolYear: 3 },
    { schoolYear: 3 },
    { segment: 'FUNDAMENTAL_I', schoolYear: 6 },
    { segment: 'MEDIO', schoolYear: 0 },
    { segment: 'ENFERMAGEM', schoolYear: 10 },
    { segment: 'INFANTIL', schoolYear: 4 },
  ])(
    'rejects incompatible filters %p without a partial write',
    async (body) => {
      await http('patch')
        .send({ ...body, audioEnabled: true })
        .expect(400);
      await http('get').expect(200, defaults);
      expect(await prisma.learningPreferences.count()).toBe(0);
    },
  );

  it('validates merged state and preserves all choices when changing only the segment fails', async () => {
    const saved = {
      ...defaults,
      segment: 'INFANTIL',
      schoolYear: -1,
      audioEnabled: true,
    };
    await http('patch').send(saved).expect(200, saved);
    const before = await prisma.learningPreferences.findUniqueOrThrow({
      where: { userId: student.id },
    });
    await http('patch')
      .send({ segment: 'MEDIO', audioEnabled: false })
      .expect(400);
    await http('patch').send({ segment: null }).expect(400);
    expect(
      await prisma.learningPreferences.findUniqueOrThrow({
        where: { userId: student.id },
      }),
    ).toEqual(before);
    await http('patch')
      .send({ segment: 'MEDIO', schoolYear: 10 })
      .expect(200, { ...saved, segment: 'MEDIO', schoolYear: 10 });
  });

  it.each([
    { userId: 'another-user', audioEnabled: true },
    { arbitrary: 'value' },
    { audioEnabled: 'true' },
    { audioEnabled: null },
    { motionEnabled: null },
    { motionEnabled: 0 },
    { schoolYear: '3', segment: 'FUNDAMENTAL_I' },
    { schoolYear: 2.5, segment: 'FUNDAMENTAL_I' },
    { segment: 'UNKNOWN' },
  ])('rejects unsafe or coerced payload %p', async (body) => {
    await http('patch').send(body).expect(400);
    await http('get').expect(200, defaults);
  });

  it('requires JWT for both methods and exposes no account selector', async () => {
    await request(app.getHttpServer()).get(endpoint).expect(401);
    await request(app.getHttpServer())
      .patch(endpoint)
      .send({ audioEnabled: true })
      .expect(401);
    await http(
      'get',
      student,
      `/users/${other.id}/learning-preferences`,
    ).expect(404);
    await http('patch')
      .send({ userId: other.id, audioEnabled: true })
      .expect(400);
  });

  it.each([{}, { sub: 19 }, { sub: '' }])(
    'rejects signed access tokens with an invalid subject %p',
    async (subject) => {
      const token = await app.get(JwtService).signAsync(
        {
          type: 'access',
          role: UserRole.STUDENT,
          email: 'synthetic@example.test',
          ...subject,
        },
        { secret: process.env.JWT_ACCESS_SECRET },
      );
      await request(app.getHttpServer())
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
      await request(app.getHttpServer())
        .patch(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({ audioEnabled: true })
        .expect(401);
      expect(await prisma.learningPreferences.count()).toBe(0);
    },
  );

  it.each([UserStatus.INACTIVE, UserStatus.PENDING, UserStatus.BLOCKED])(
    'rejects a previously issued token after %s status change',
    async (status) => {
      await prisma.user.update({ where: { id: student.id }, data: { status } });
      await http('get').expect(401);
      await http('patch').send({ audioEnabled: true }).expect(401);
      expect(await prisma.learningPreferences.count()).toBe(0);
    },
  );

  it('rejects a previously issued token after soft deletion', async () => {
    await prisma.user.update({
      where: { id: student.id },
      data: { deletedAt: new Date() },
    });
    await http('get').expect(401);
    await http('patch').send({ audioEnabled: true }).expect(401);
  });

  it('keeps accounts isolated and exposes only the public preference fields', async () => {
    await http('patch')
      .send({ segment: 'ENFERMAGEM', schoolYear: 0, audioEnabled: true })
      .expect(200);
    await http('get', other).expect(200, defaults);
    await http('patch', other)
      .send({ segment: 'MEDIO', schoolYear: 12, motionEnabled: false })
      .expect(200);
    await http('get').expect(200, {
      ...defaults,
      segment: 'ENFERMAGEM',
      schoolYear: 0,
      audioEnabled: true,
    });
    expect(await prisma.learningPreferences.count()).toBe(2);
  });

  it('preserves unrelated fields across concurrent first writes and later patches', async () => {
    const first = await Promise.all([
      http('patch').send({ audioEnabled: true }),
      http('patch').send({ motionEnabled: false }),
      http('patch').send({ segment: 'MEDIO', schoolYear: 10 }),
    ]);
    first.forEach((response) => expect(response.status).toBe(200));
    await http('get').expect(200, {
      segment: 'MEDIO',
      schoolYear: 10,
      audioEnabled: true,
      motionEnabled: false,
    });
    const later = await Promise.all([
      http('patch').send({ audioEnabled: false }),
      http('patch').send({ motionEnabled: true }),
      http('patch').send({ schoolYear: 12 }),
    ]);
    later.forEach((response) => expect(response.status).toBe(200));
    await http('get').expect(200, {
      ...defaults,
      segment: 'MEDIO',
      schoolYear: 12,
    });
    expect(await prisma.learningPreferences.count()).toBe(1);
  });

  it('preserves timestamps for a no-op PATCH', async () => {
    await http('patch').send({ audioEnabled: true }).expect(200);
    const before = await prisma.learningPreferences.findUniqueOrThrow({
      where: { userId: student.id },
    });
    await http('patch').send({ audioEnabled: true }).expect(200);
    expect(
      await prisma.learningPreferences.findUniqueOrThrow({
        where: { userId: student.id },
      }),
    ).toEqual(before);
  });

  it('does not grant access to a private quiz or create a turma membership', async () => {
    const admin = await session(UserRole.ADMIN);
    const discipline = await prisma.discipline.create({
      data: { name: 'Synthetic preferences discipline', slug: 'matematica' },
    });
    const turma = await prisma.turma.create({
      data: {
        name: 'Synthetic private turma',
        slug: 'preferences-private',
        schoolYear: -1,
      },
    });
    const quiz = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        activityKey: 'preferences-private-quiz',
        title: 'Synthetic private quiz',
        topic: 'Synthetic',
        schoolYear: -1,
        disciplineId: discipline.id,
        turmaId: turma.id,
        questions: [
          {
            originKey: 'one',
            statement: 'Synthetic question?',
            explanation: 'Synthetic explanation.',
            points: 1,
            correctAnswer: 'A',
            options: [
              { optionKey: 'A', text: 'One' },
              { optionKey: 'B', text: 'Two' },
            ],
          },
        ],
      })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/quizzes/${quiz.body.id}/publish`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    await http('patch')
      .send({ segment: 'INFANTIL', schoolYear: -1 })
      .expect(200);
    const catalogue = await http('get', student, '/quizzes/available').expect(
      200,
    );
    expect(JSON.stringify(catalogue.body)).not.toContain(
      quiz.body.id as string,
    );
    await request(app.getHttpServer())
      .post(`/quizzes/${quiz.body.id}/attempts`)
      .set('Authorization', `Bearer ${student.token}`)
      .expect(404);
    expect(await prisma.turmaMembership.count()).toBe(0);
  });

  it.each([
    { segment: null, schoolYear: 3 },
    { segment: LearningSegment.INFANTIL, schoolYear: 6 },
    { segment: LearningSegment.ENFERMAGEM, schoolYear: -1 },
  ])(
    'also enforces filter compatibility at database level: %p',
    async (fields) => {
      await expect(
        prisma.learningPreferences.create({
          data: { userId: student.id, ...fields },
        }),
      ).rejects.toThrow();
      expect(await prisma.learningPreferences.count()).toBe(0);
    },
  );

  it('removes the preference row when its user is physically deleted', async () => {
    await http('patch').send({ audioEnabled: true }).expect(200);
    await prisma.refreshToken.deleteMany({ where: { userId: student.id } });
    await prisma.studentProfile.deleteMany({ where: { userId: student.id } });
    await prisma.user.delete({ where: { id: student.id } });
    expect(
      await prisma.learningPreferences.findUnique({
        where: { userId: student.id },
      }),
    ).toBeNull();
  });
});

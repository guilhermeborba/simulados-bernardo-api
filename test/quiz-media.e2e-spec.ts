import { randomUUID } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Prisma, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma/prisma.service';
import {
  getRegisteredQuizAsset,
  readQuizMediaAsset,
} from '../src/modules/quizzes/media/quiz-media';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const imageId = 'infantil-4-cores-e-formas.forma-circulo.image';
const audioId = 'infantil-4-cores-e-formas.forma-circulo.audio';
const imageAlt = 'Um círculo verde sobre fundo claro.';
const audioTranscript = 'Observe a imagem e escolha a forma circular.';
const explanation = 'O círculo tem uma linha curva fechada, sem cantos.';
interface Session {
  id: string;
  accessToken: string;
}
interface Fixture {
  quiz: {
    id: string;
    activityKey: string;
    questions: { id: string; originKey: string }[];
  };
  attempt: { id: string };
  questionId: string;
}

function binaryParser(
  response: request.Response,
  callback: (error: Error | null, body?: Buffer) => void,
) {
  const chunks: Buffer[] = [];
  response.on('data', (chunk: Buffer) => chunks.push(chunk));
  response.on('end', () => callback(null, Buffer.concat(chunks)));
  response.on('error', callback);
}

function expectNoPrivateFields(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(expectNoPrivateFields);
    return;
  }
  const object = value as Record<string, unknown>;
  for (const key of [
    'passwordHash',
    'tokenHash',
    'correctAnswer',
    'answerKey',
    'answerValue',
    'officialAnswers',
    'questionSnapshots',
    'snapshots',
    'assetId',
    'sha256',
    'file',
    'mimeType',
    'byteLength',
  ])
    expect(object).not.toHaveProperty(key);
  Object.values(object).forEach(expectNoPrivateFields);
}

// This suite uses the checked-in packaged media, real authorization and an empty
// PostgreSQL supplied by the integration runner. It never changes packaged files.
describe('Quiz media authorization and snapshot fidelity (real Nest + PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;
  let passwordHash: string;
  const password = 'Synthetic-media-password-123';

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
    admin = await session(UserRole.ADMIN);
    student = await session(UserRole.STUDENT);
    outsider = await session(UserRole.STUDENT);
    teacher = await session(UserRole.TEACHER);
    disciplineId = (
      await prisma.discipline.create({
        data: { name: 'Synthetic media discipline', slug: 'matematica' },
      })
    ).id;
    turmaId = (
      await prisma.turma.create({
        data: {
          name: 'Synthetic media turma',
          slug: 'quiz-media',
          schoolYear: -2,
        },
      })
    ).id;
  });

  afterAll(async () => {
    if (prisma) await clean();
    await app?.close();
  });

  async function session(role: UserRole): Promise<Session> {
    const user = await prisma.user.create({
      data: {
        name: `Synthetic ${role}`,
        email: `${randomUUID()}@example.test`,
        passwordHash,
        role,
        status: 'ACTIVE',
        ...(role === UserRole.STUDENT
          ? { studentProfile: { create: { schoolYear: -2 } } }
          : {}),
      },
    });
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return { id: user.id, accessToken: response.body.accessToken as string };
  }

  function http(
    method: 'get' | 'post' | 'patch',
    path: string,
    user = student,
  ) {
    return request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${user.accessToken}`);
  }

  function payload(overrides: Record<string, unknown> = {}) {
    return {
      activityKey: `media-${randomUUID()}`,
      title: 'Quiz de formas',
      topic: 'Formas',
      schoolYear: -2,
      disciplineId,
      questions: [
        {
          originKey: 'shape.circle',
          statement: 'Observe a imagem. Qual figura aparece?',
          explanation,
          points: 1,
          options: [
            { optionKey: 'A', text: 'Triângulo' },
            { optionKey: 'B', text: 'Círculo' },
          ],
          correctAnswer: 'B',
          media: {
            image: { assetId: imageId, alt: imageAlt },
            audio: { assetId: audioId, transcript: audioTranscript },
          },
        },
      ],
      ...overrides,
    };
  }

  async function fixture(
    overrides: Record<string, unknown> = {},
  ): Promise<Fixture> {
    const quiz = (
      await http('post', '/quizzes', admin).send(payload(overrides)).expect(201)
    ).body as Fixture['quiz'];
    await http('patch', `/quizzes/${quiz.id}/publish`, admin).expect(200);
    const attempt = (
      await http('post', `/quizzes/${quiz.id}/attempts`).expect(201)
    ).body as Fixture['attempt'];
    return { quiz, attempt, questionId: quiz.questions[0].id };
  }

  function mediaPath(f: Fixture, kind = 'image') {
    return `/attempts/${f.attempt.id}/questions/${f.questionId}/media/${kind}`;
  }

  function binary(f: Fixture, kind = 'image', user = student) {
    return http('get', mediaPath(f, kind), user)
      .buffer(true)
      .parse(binaryParser);
  }

  function publicMedia(f: Fixture) {
    return {
      image: { url: mediaPath(f), alt: imageAlt },
      audio: { url: mediaPath(f, 'audio'), transcript: audioTranscript },
    };
  }

  async function confirm(f: Fixture) {
    return http(
      'post',
      `/attempts/${f.attempt.id}/questions/${f.questionId}/answer`,
    )
      .send({ answer: { optionKey: 'B' } })
      .expect(201);
  }

  async function privateFixture() {
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    return fixture({ turmaId });
  }

  it('pins media privately and presents authorized attempt URLs and accessibility text only', async () => {
    const f = await fixture();
    const registered = getRegisteredQuizAsset(imageId, 'image');
    const snapshot = await prisma.attemptQuestionSnapshot.findUniqueOrThrow({
      where: {
        attemptId_questionId: {
          attemptId: f.attempt.id,
          questionId: f.questionId,
        },
      },
    });
    expect(snapshot.media).toMatchObject({
      image: { assetId: imageId, sha256: registered.sha256, alt: imageAlt },
    });
    const questions = await http(
      'get',
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    expect(questions.body).toHaveLength(1);
    expect(questions.body[0]).toMatchObject({
      media: publicMedia(f),
      answer: null,
      feedback: null,
    });
    expect(questions.body[0]).not.toHaveProperty('explanation');
    expect(questions.body[0]).not.toHaveProperty('funFact');
    expectNoPrivateFields(questions.body);
    expect(JSON.stringify(questions.body)).not.toContain(explanation);
    expect(JSON.stringify(questions.body)).not.toContain(registered.sha256);
    expect(JSON.stringify(questions.body)).not.toContain(imageId);
    const available = await http('get', '/quizzes/available').expect(200);
    expectNoPrivateFields(available.body);
    expect(available.body[0]).not.toHaveProperty('questions');
  });

  it.each(['image', 'audio'] as const)(
    'serves registered %s bytes with private security headers',
    async (kind) => {
      const f = await fixture();
      const asset = getRegisteredQuizAsset(
        kind === 'image' ? imageId : audioId,
        kind,
      );
      const expected = readQuizMediaAsset(asset.id, kind, asset.sha256);
      const response = await binary(f, kind).expect(200);
      expect(response.body).toEqual(expected.bytes);
      expect(response.headers['content-type']).toContain(asset.mimeType);
      expect(Number(response.headers['content-length'])).toBe(
        expected.byteLength,
      );
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['content-security-policy']).toBe(
        "default-src 'none'; sandbox",
      );
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(response.headers['content-disposition']).toBe(
        `inline; filename="quiz-${kind}.${kind === 'image' ? 'svg' : 'wav'}"`,
      );
      expect(response.headers['content-disposition']).not.toContain(asset.id);
    },
  );

  it.each([
    ['bytes=0-3', 0, 3],
    ['bytes=4-', 4, null],
    ['bytes=-8', null, 8],
    ['bytes=0-999999999', 0, null],
  ] as const)('serves a valid WAV byte range %s', async (range, from, to) => {
    const f = await fixture();
    const asset = getRegisteredQuizAsset(audioId, 'audio');
    const expected = readQuizMediaAsset(asset.id, 'audio', asset.sha256).bytes;
    const start = from === null ? expected.length - (to as number) : from;
    const end = from === null || to === null ? expected.length - 1 : to;
    const response = await binary(f, 'audio').set('Range', range).expect(206);
    expect(response.headers['content-range']).toBe(
      `bytes ${start}-${end}/${expected.length}`,
    );
    expect(response.body).toEqual(expected.subarray(start, end + 1));
    expect(Number(response.headers['content-length'])).toBe(end - start + 1);
    expect(response.headers['cache-control']).toBe('private, no-store');
  });

  it.each([
    'bytes=',
    'items=0-2',
    'bytes=0-2,4-8',
    'bytes=8-2',
    'bytes=-0',
    'bytes=999999999-',
    'bytes=9007199254740992-',
  ])(
    'rejects malformed or unsatisfiable ranges with 416: %s',
    async (range) => {
      const f = await fixture();
      const asset = getRegisteredQuizAsset(audioId, 'audio');
      const response = await http('get', mediaPath(f, 'audio'))
        .set('Range', range)
        .expect(416);
      expect(response.headers['content-range']).toBe(
        `bytes */${asset.byteLength}`,
      );
      expectNoPrivateFields(response.body);
    },
  );

  it('applies authentication, role and ownership checks before range or asset disclosure', async () => {
    const f = await fixture();
    await request(app.getHttpServer())
      .get(mediaPath(f))
      .set('Range', 'invalid')
      .expect(401);
    await http('get', mediaPath(f), teacher)
      .set('Range', 'invalid')
      .expect(403);
    await http('get', mediaPath(f), outsider)
      .set('Range', 'invalid')
      .expect(403);
    const other = await fixture();
    await http(
      'get',
      `/attempts/${f.attempt.id}/questions/${other.questionId}/media/image`,
    ).expect(404);
    await http(
      'get',
      `/attempts/${f.attempt.id}/questions/${f.questionId}/media/video`,
    ).expect(400);
    await http('get', `/quizzes/media/${imageId}`).expect(404);
    await http('get', `/media/${imageId}`).expect(404);
    await request(app.getHttpServer())
      .get(`/quizzes/media/${imageId}`)
      .expect(404);
  });

  it('lets the owner and admin read finished media while preserving the confirmed feedback', async () => {
    const f = await fixture();
    const confirmation = await confirm(f);
    const finished = await http(
      'post',
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    expect(finished.body.questions[0]).toMatchObject({
      media: publicMedia(f),
      feedback: confirmation.body.feedback,
    });
    expect(finished.body.questions[0].feedback.explanation).toBe(explanation);
    expectNoPrivateFields(finished.body);
    await binary(f).expect(200);
    await binary(f, 'audio', admin).expect(200);
    const result = await http(
      'get',
      `/attempts/${f.attempt.id}/result`,
      admin,
    ).expect(200);
    expect(result.body).toEqual(finished.body);
    await http('get', mediaPath(f), outsider).expect(403);
  });

  it('preserves started media and text after source edits and a new published version', async () => {
    const f = await fixture();
    const initial = await http(
      'get',
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    const initialBytes = (await binary(f).expect(200)).body as Buffer;
    const newer = (
      await http('post', `/quizzes/${f.quiz.id}/versions`, admin).expect(201)
    ).body as Fixture['quiz'];
    const changedPayload = payload();
    changedPayload.questions[0].media.image.alt =
      'Descrição editorial da próxima versão.';
    changedPayload.questions[0].statement = 'Enunciado da próxima versão.';
    await http('patch', `/quizzes/${newer.id}`, admin)
      .send({ questions: changedPayload.questions })
      .expect(200);
    await http('patch', `/quizzes/${newer.id}/publish`, admin).expect(200);
    await prisma.question.update({
      where: { id: f.questionId },
      data: {
        statement: 'Source altered outside the API',
        media: Prisma.JsonNull,
      },
    });
    const reloaded = await http(
      'get',
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    expect(reloaded.body).toEqual(initial.body);
    expect((await binary(f).expect(200)).body).toEqual(initialBytes);
    await confirm(f);
    await http('post', `/attempts/${f.attempt.id}/finish`).expect(201);
  });

  it('continues and resumes existing media on archive while denying a new archived attempt', async () => {
    const f = await privateFixture();
    await http('patch', `/quizzes/${f.quiz.id}/archive`, admin).expect(200);
    const resumed = await http('post', `/quizzes/${f.quiz.id}/attempts`).expect(
      201,
    );
    expect(resumed.body.id).toBe(f.attempt.id);
    await binary(f).expect(200);
    await http('get', `/attempts/${f.attempt.id}/questions`).expect(200);
    await confirm(f);
    await http('post', `/attempts/${f.attempt.id}/finish`).expect(201);
    await http('post', `/quizzes/${f.quiz.id}/attempts`).expect(404);
  });

  it.each([
    'membership',
    'inactive-discipline',
    'deleted-discipline',
    'deleted-turma',
    'deleted-quiz',
  ] as const)(
    'revalidates %s for bytes and question text after a private attempt starts',
    async (revocation) => {
      const f = await privateFixture();
      await binary(f).expect(200);
      if (revocation === 'membership') {
        await prisma.turmaMembership.deleteMany({
          where: { turmaId, userId: student.id },
        });
      } else if (revocation === 'inactive-discipline') {
        await prisma.discipline.update({
          where: { id: disciplineId },
          data: { isActive: false },
        });
      } else if (revocation === 'deleted-discipline') {
        await prisma.discipline.update({
          where: { id: disciplineId },
          data: { deletedAt: new Date() },
        });
      } else if (revocation === 'deleted-turma') {
        await prisma.turma.update({
          where: { id: turmaId },
          data: { deletedAt: new Date() },
        });
      } else {
        await prisma.simulation.update({
          where: { id: f.quiz.id },
          data: { deletedAt: new Date() },
        });
      }
      await http('get', mediaPath(f)).expect(404);
      await http('get', mediaPath(f, 'audio')).expect(404);
      await http('get', `/attempts/${f.attempt.id}/questions`).expect(404);
      await http(
        'post',
        `/attempts/${f.attempt.id}/questions/${f.questionId}/answer`,
      )
        .send({ answer: { optionKey: 'B' } })
        .expect(404);
    },
  );

  it('returns generic 500 for malformed snapshot media without leaking stored private metadata', async () => {
    const f = await fixture();
    await prisma.attemptQuestionSnapshot.update({
      where: {
        attemptId_questionId: {
          attemptId: f.attempt.id,
          questionId: f.questionId,
        },
      },
      data: {
        media: {
          image: {
            assetId: imageId,
            sha256: 'bad',
            alt: imageAlt,
            correctAnswer: 'SECRET_SENTINEL',
          },
        },
      },
    });
    for (const path of [mediaPath(f), `/attempts/${f.attempt.id}/questions`]) {
      const response = await http('get', path).expect(500);
      expectNoPrivateFields(response.body);
      expect(JSON.stringify(response.body)).not.toContain('SECRET_SENTINEL');
      expect(JSON.stringify(response.body)).not.toContain(imageId);
    }
  });

  it.each(['unknown-asset', 'changed-hash'] as const)(
    'keeps accessibility text, confirmation and finish when bytes are unavailable: %s',
    async (failure) => {
      const f = await fixture();
      const snapshot = await prisma.attemptQuestionSnapshot.findUniqueOrThrow({
        where: {
          attemptId_questionId: {
            attemptId: f.attempt.id,
            questionId: f.questionId,
          },
        },
      });
      const media = snapshot.media as Prisma.JsonObject;
      const image = media.image as Prisma.JsonObject;
      await prisma.attemptQuestionSnapshot.update({
        where: { id: snapshot.id },
        data: {
          media: {
            ...media,
            image: {
              ...image,
              ...(failure === 'unknown-asset'
                ? { assetId: 'missing-packaged-image' }
                : { sha256: 'f'.repeat(64) }),
            },
          },
        },
      });
      await http('get', mediaPath(f)).expect(404);
      await binary(f, 'audio').expect(200);
      const questions = await http(
        'get',
        `/attempts/${f.attempt.id}/questions`,
      ).expect(200);
      expect(questions.body[0].media).toEqual(publicMedia(f));
      expectNoPrivateFields(questions.body);
      await confirm(f);
      const finished = await http(
        'post',
        `/attempts/${f.attempt.id}/finish`,
      ).expect(201);
      expect(finished.body.questions[0].media).toEqual(publicMedia(f));
      expect(finished.body.questions[0].feedback.explanation).toBe(explanation);
      expectNoPrivateFields(finished.body);
    },
  );
});

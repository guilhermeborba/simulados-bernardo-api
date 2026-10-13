import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { AttemptStatus, Prisma, PrismaClient } from '@prisma/client';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const baseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const migrationName = '20261012210000_quiz_answer_confirmation';
const migrationsRoot = resolve('prisma/migrations');
const originalCreatedAt = new Date('2026-10-01T12:34:56.123Z');

// All DDL is confined to this owned random schema in the guarded test database.
describe('Quiz confirmation migration over populated simulation answers', () => {
  let admin: PrismaClient;
  let database: PrismaClient;
  let schema: string;
  let directory: string;
  let databaseUrl: string;

  beforeAll(async () => {
    schema = `quiz_confirmation_migration_${randomUUID().replaceAll('-', '')}`;
    directory = mkdtempSync(join(tmpdir(), 'quiz-confirmation-migration-'));
    admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const url = new URL(baseUrl);
    url.searchParams.set('schema', schema);
    databaseUrl = url.toString();
    database = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    writeFileSync(
      join(directory, 'schema.prisma'),
      'datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}\n',
    );
    cpSync(
      join(migrationsRoot, 'migration_lock.toml'),
      join(directory, 'migrations/migration_lock.toml'),
      { recursive: true },
    );
    for (const migration of readdirSync(migrationsRoot).filter(
      (name) => name < migrationName && /^\d/.test(name),
    )) {
      cpSync(
        join(migrationsRoot, migration),
        join(directory, 'migrations', migration),
        { recursive: true },
      );
    }
    expect(deploy().status).toBe(0);
    // Explicit old columns prove that this applies to data written before task 4.
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('legacy-user','Synthetic legacy','legacy@example.test','synthetic-not-a-credential','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('legacy-discipline','Synthetic legacy','legacy',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"disciplineId",status,"totalQuestions","maxScore","createdById","updatedAt") VALUES ('legacy-sim','Synthetic legacy','legacy',3,1,'AV1','legacy-discipline','PUBLISHED',1,2.5,'legacy-user',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Question" (id,"simulationId",type,statement,points,"order","updatedAt") VALUES ('legacy-question','legacy-sim','MULTIPLE_CHOICE','Legacy statement',2.5,1,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "QuestionAnswer" (id,"questionId","answerKey","answerValue") VALUES ('legacy-key','legacy-question','correctAnswer','B')`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","maxScore",status,score,percentage,"correctCount","wrongCount","updatedAt") VALUES ('legacy-open','legacy-sim','legacy-user',2.5,'IN_PROGRESS',NULL,NULL,0,0,CURRENT_TIMESTAMP),('legacy-finished','legacy-sim','legacy-user',2.5,'FINISHED',2.5,100,1,0,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "AttemptAnswer" (id,"attemptId","questionId",answer,"isCorrect","pointsEarned","createdAt") VALUES ('legacy-open-answer','legacy-open','legacy-question','{"answer":"A"}'::jsonb,NULL,NULL,${originalCreatedAt}),('legacy-finished-answer','legacy-finished','legacy-question','{"answer":"B"}'::jsonb,TRUE,2.5,${originalCreatedAt})`;
    cpSync(
      join(migrationsRoot, migrationName),
      join(directory, 'migrations', migrationName),
      { recursive: true },
    );
    expect(deploy().status).toBe(0);
  }, 90000);

  afterAll(async () => {
    try {
      await database?.$disconnect();
    } finally {
      try {
        if (admin) {
          try {
            await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
          } finally {
            await admin.$disconnect();
          }
        }
      } finally {
        if (directory) rmSync(directory, { recursive: true, force: true });
      }
    }
  });

  function deploy() {
    return spawnSync(
      process.execPath,
      [
        resolve('node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema',
        join(directory, 'schema.prisma'),
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          PRISMA_HIDE_UPDATE_MESSAGE: 'true',
          CHECKPOINT_DISABLE: '1',
        },
        encoding: 'utf8',
        timeout: 30000,
      },
    );
  }

  async function expectOpenAnswerUnchanged() {
    expect(
      await database.attemptAnswer.findUniqueOrThrow({ where: { id: 'legacy-open-answer' } }),
    ).toMatchObject({
      answer: { answer: 'A' },
      isCorrect: null,
      pointsEarned: null,
      confirmedAt: null,
      feedback: null,
      createdAt: originalCreatedAt,
    });
  }

  it('preserves old answers, correction and creation dates without backfilling confirmation', async () => {
    await expectOpenAnswerUnchanged();
    const finishedAnswer = await database.attemptAnswer.findUniqueOrThrow({
      where: { id: 'legacy-finished-answer' },
    });
    expect(finishedAnswer).toMatchObject({
      answer: { answer: 'B' },
      isCorrect: true,
      confirmedAt: null,
      feedback: null,
      createdAt: originalCreatedAt,
    });
    expect(finishedAnswer.pointsEarned?.toNumber()).toBe(2.5);
    const attempts = await database.$queryRaw<
      { status: AttemptStatus; correctCount: number; wrongCount: number; score: Prisma.Decimal | null; percentage: Prisma.Decimal | null }[]
    >`SELECT * FROM "Attempt" ORDER BY "id"`;
    expect(attempts).toHaveLength(2);
    expect(attempts[0]).toMatchObject({ status: AttemptStatus.FINISHED, correctCount: 1, wrongCount: 0 });
    expect(attempts[0].score?.toNumber()).toBe(2.5);
    expect(attempts[0].percentage?.toNumber()).toBe(100);
    expect(attempts[1]).toMatchObject({ status: AttemptStatus.IN_PROGRESS, score: null, percentage: null });
    expect(await database.questionAnswer.findUnique({ where: { id: 'legacy-key' } })).toMatchObject({ answerValue: 'B' });
  });

  it.each([
    { confirmedAt: new Date(), feedback: Prisma.DbNull },
    { confirmedAt: null, feedback: { isCorrect: false, pointsEarned: 0, explanation: 'Feedback', funFact: null } },
    { confirmedAt: new Date(), feedback: [] },
    { confirmedAt: new Date(), feedback: 'Feedback' },
    { confirmedAt: new Date(), feedback: Prisma.JsonNull },
  ])('rejects partial markers and non-object feedback without changing the row %#', async (data) => {
    await expect(
      database.attemptAnswer.update({
        where: { id: 'legacy-open-answer' },
        data: { isCorrect: false, pointsEarned: 0, ...data },
      }),
    ).rejects.toThrow();
    await expectOpenAnswerUnchanged();
  });

  it.each([
    { isCorrect: null, pointsEarned: new Prisma.Decimal(0) },
    { isCorrect: false, pointsEarned: null },
    { isCorrect: false, pointsEarned: new Prisma.Decimal(-1) },
  ])('requires correction fields and nonnegative points for a confirmation %#', async (data) => {
    await expect(
      database.attemptAnswer.update({
        where: { id: 'legacy-open-answer' },
        data: {
          ...data,
          confirmedAt: new Date(),
          feedback: { isCorrect: false, pointsEarned: 0, explanation: 'Feedback', funFact: null },
        },
      }),
    ).rejects.toThrow();
    await expectOpenAnswerUnchanged();
  });

  it('rejects PostgreSQL numeric NaN in confirmed points', async () => {
    await expect(
      database.$executeRaw`UPDATE "AttemptAnswer" SET "confirmedAt"=CURRENT_TIMESTAMP,"feedback"='{}'::jsonb,"isCorrect"=FALSE,"pointsEarned"='NaN'::numeric WHERE id='legacy-open-answer'`,
    ).rejects.toThrow();
    await expectOpenAnswerUnchanged();
  });

  it('accepts a complete confirmation and preserves the original answer and creation date', async () => {
    const confirmedAt = new Date('2026-10-12T15:00:00.000Z');
    const feedback = { isCorrect: false, pointsEarned: 0, explanation: 'Explicação', funFact: null };
    const saved = await database.attemptAnswer.update({
      where: { id: 'legacy-open-answer' },
      data: { isCorrect: false, pointsEarned: 0, confirmedAt, feedback },
    });
    expect(saved).toMatchObject({
      answer: { answer: 'A' },
      isCorrect: false,
      confirmedAt,
      feedback,
      createdAt: originalCreatedAt,
    });
    expect(saved.pointsEarned?.toNumber()).toBe(0);
    expect(await database.attemptAnswer.count()).toBe(2);
  });
});

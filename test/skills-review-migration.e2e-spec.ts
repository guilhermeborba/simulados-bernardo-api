import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  AttemptPracticeMode,
  AttemptStatus,
  PrismaClient,
} from '@prisma/client';
import { assertTestDatabaseUrl } from './support/test-database.cjs';

const baseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const migrationName = '20261013020000_skills_review';
const migrationsRoot = resolve('prisma/migrations');
const newSnapshotColumns = [
  'skillCode',
  'skillVersion',
  'skillTitle',
  'skillDisciplineSlug',
  'skillSchoolYear',
  'practicedBefore',
];

describe('Skills and review migration over populated quiz history', () => {
  let admin: PrismaClient,
    database: PrismaClient,
    schema: string,
    directory: string,
    databaseUrl: string;
  let beforeAttempts: unknown, beforeSnapshots: unknown;
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
  // New Prisma defaults cannot be sent to a schema frozen before Giz.
  async function createHistoricalAttempt({
    data,
  }: {
    data: {
      studentId: string;
      simulationId: string;
      activityKey?: string;
      contentVersion?: number;
      status?: AttemptStatus;
      practiceMode: AttemptPracticeMode;
      maxScore: number;
    };
  }) {
    const id = randomUUID();
    const rows = await database.$queryRaw<
      { id: string; practiceMode: AttemptPracticeMode }[]
    >`
      INSERT INTO "Attempt" (id,"studentId","simulationId","activityKey","contentVersion",status,"practiceMode","maxScore","updatedAt")
      VALUES (${id},${data.studentId},${data.simulationId},${data.activityKey ?? null},${data.contentVersion ?? null},${data.status ?? AttemptStatus.IN_PROGRESS}::"AttemptStatus",${data.practiceMode}::"AttemptPracticeMode",${data.maxScore},CURRENT_TIMESTAMP)
      RETURNING id,"practiceMode"`;
    return rows[0];
  }
  async function originalAttempts() {
    return database.$queryRaw`SELECT to_jsonb(a)-'practiceMode' AS record FROM "Attempt" a WHERE "id" IN ('old-finished','old-open','old-simulation-attempt') ORDER BY "id"`;
  }
  async function originalSnapshots() {
    return database.$queryRaw`SELECT to_jsonb(s)-${newSnapshotColumns}::text[] AS record FROM "AttemptQuestionSnapshot" s WHERE "id"='old-snapshot'`;
  }
  beforeAll(async () => {
    schema = `skills_migration_${randomUUID().replaceAll('-', '')}`;
    directory = mkdtempSync(join(tmpdir(), 'skills-review-migration-'));
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
      (name) => /^\d/.test(name) && name < migrationName,
    ))
      cpSync(
        join(migrationsRoot, migration),
        join(directory, 'migrations', migration),
        { recursive: true },
      );
    expect(deploy().status).toBe(0);
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('old-owner','Synthetic migration owner','skills-migration@example.test','synthetic','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('old-math','Synthetic math','matematica',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear","activityKind","activityKey","contentVersion","disciplineId",topic,status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('old-quiz','Synthetic preserved quiz','old-quiz',3,'QUIZ','old-logical',1,'old-math','Contagem','PUBLISHED',1,2.5,'old-owner','2026-10-12T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"disciplineId",status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('old-simulation','Synthetic preserved simulation','old-simulation',3,1,'AV1','old-math','PUBLISHED',1,3,'old-owner','2026-10-12T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Question" (id,"simulationId",type,statement,explanation,"originKey",points,"order","updatedAt") VALUES ('old-question','old-quiz','MULTIPLE_CHOICE','Quanto é 1+1?','São duas unidades.','quantity.two',2.5,1,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId","activityKey","contentVersion",status,"maxScore",score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('old-finished','old-owner','old-quiz','old-logical',1,'FINISHED',2.5,2.5,100,1,0,'2026-10-13T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId","activityKey","contentVersion",status,"maxScore","updatedAt") VALUES ('old-open','old-owner','old-quiz','old-logical',1,'IN_PROGRESS',2.5,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId",status,"maxScore",score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('old-simulation-attempt','old-owner','old-simulation','FINISHED',3,1.5,50,0,1,'2026-10-13T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "AttemptQuestionSnapshot" (id,"attemptId","questionId","originKey",type,statement,explanation,points,"sortOrder",options,"officialAnswers") VALUES ('old-snapshot','old-finished','old-question','quantity.two','MULTIPLE_CHOICE','Quanto é 1+1?','São duas unidades.',2.5,1,'[{"optionKey":"A","text":"Uma"},{"optionKey":"B","text":"Duas"}]'::jsonb,'[{"answerKey":"correctAnswer","answerValue":"B"}]'::jsonb)`;
    await database.$executeRaw`INSERT INTO "AttemptAnswer" (id,"attemptId","questionId",answer,"isCorrect","pointsEarned","confirmedAt",feedback) VALUES ('old-answer','old-finished','old-question','{"optionKey":"B"}'::jsonb,true,2.5,'2026-10-13T11:59:00Z','{"isCorrect":true,"pointsEarned":2.5,"explanation":"São duas unidades.","funFact":null}'::jsonb)`;
    await database.$executeRaw`INSERT INTO "QuizCompletionReward" ("attemptId","xpAwarded",reason,day) VALUES ('old-finished',10,'AWARDED','2026-10-13')`;
    await database.$executeRaw`INSERT INTO "XpEvent" (id,"userId","attemptId","activityKey",day,amount) VALUES ('old-xp','old-owner','old-finished','old-logical','2026-10-13',10)`;
    await database.$executeRaw`INSERT INTO "UserAchievement" ("userId","achievementId","sourceAttemptId","earnedAt") VALUES ('old-owner','FIRST_QUIZ','old-finished','2026-10-13T12:00:00Z')`;
    beforeAttempts = await originalAttempts();
    beforeSnapshots = await originalSnapshots();
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
            await admin.$executeRawUnsafe(
              `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
            );
          } finally {
            await admin.$disconnect();
          }
        }
      } finally {
        if (directory) rmSync(directory, { recursive: true, force: true });
      }
    }
  });
  it('preserves attempt totals, answers, rewards and old question snapshots without inventing classification', async () => {
    expect(await originalAttempts()).toEqual(beforeAttempts);
    expect(await originalSnapshots()).toEqual(beforeSnapshots);
    expect(
      await database.attempt.findMany({
        select: { id: true, practiceMode: true },
        orderBy: { id: 'asc' },
      }),
    ).toEqual([
      { id: 'old-finished', practiceMode: 'NORMAL' },
      { id: 'old-open', practiceMode: 'NORMAL' },
      { id: 'old-simulation-attempt', practiceMode: 'NORMAL' },
    ]);
    expect(
      await database.attemptQuestionSnapshot.findUniqueOrThrow({
        where: { id: 'old-snapshot' },
        select: {
          skillCode: true,
          skillVersion: true,
          skillTitle: true,
          skillDisciplineSlug: true,
          skillSchoolYear: true,
          practicedBefore: true,
        },
      }),
    ).toEqual({
      skillCode: null,
      skillVersion: null,
      skillTitle: null,
      skillDisciplineSlug: null,
      skillSchoolYear: null,
      practicedBefore: false,
    });
    expect(await database.learningSkill.count()).toBe(0);
    expect(await database.questionSkill.count()).toBe(0);
    expect(await database.xpEvent.count()).toBe(1);
    expect(await database.quizCompletionReward.count()).toBe(1);
    expect(await database.userAchievement.count()).toBe(1);
  });
  it('allows one concurrent NORMAL and REVIEW session while blocking duplicate open sessions in each mode', async () => {
    const data = {
      studentId: 'old-owner',
      simulationId: 'old-quiz',
      activityKey: 'old-logical',
      contentVersion: 1,
      status: AttemptStatus.IN_PROGRESS,
      maxScore: 2.5,
    };
    await expect(
      createHistoricalAttempt({
        data: { ...data, practiceMode: AttemptPracticeMode.NORMAL },
      }),
    ).rejects.toMatchObject({ code: 'P2010', meta: { code: '23505' } });
    const review = await createHistoricalAttempt({
      data: { ...data, practiceMode: AttemptPracticeMode.REVIEW },
    });
    expect(review.practiceMode).toBe('REVIEW');
    await expect(
      createHistoricalAttempt({
        data: { ...data, practiceMode: AttemptPracticeMode.REVIEW },
      }),
    ).rejects.toMatchObject({ code: 'P2010', meta: { code: '23505' } });
  });
  it('rejects review attempts without a quiz identity and partial snapshot skill metadata', async () => {
    await expect(
      createHistoricalAttempt({
        data: {
          studentId: 'old-owner',
          simulationId: 'old-simulation',
          practiceMode: AttemptPracticeMode.REVIEW,
          maxScore: 3,
        },
      }),
    ).rejects.toThrow('Attempt_review_identity_check');
    await expect(
      database.attemptQuestionSnapshot.update({
        select: { id: true },
        where: { id: 'old-snapshot' },
        data: { skillCode: 'math.count' },
      }),
    ).rejects.toThrow('AttemptQuestionSnapshot_skill_complete_check');
    await expect(
      database.attemptQuestionSnapshot.update({
        select: { id: true },
        where: { id: 'old-snapshot' },
        data: {
          skillCode: 'math.count',
          skillVersion: 0,
          skillTitle: 'Contagem',
          skillDisciplineSlug: 'matematica',
          skillSchoolYear: 3,
        },
      }),
    ).rejects.toThrow('AttemptQuestionSnapshot_skill_complete_check');
    await expect(
      database.attemptQuestionSnapshot.update({
        select: { id: true },
        where: { id: 'old-snapshot' },
        data: {
          skillCode: 'math.count',
          skillVersion: 1,
          skillTitle: 'Contagem',
          skillDisciplineSlug: 'matematica',
          skillSchoolYear: 13,
        },
      }),
    ).rejects.toThrow('AttemptQuestionSnapshot_skill_complete_check');
    expect(await originalSnapshots()).toEqual(beforeSnapshots);
  });
  it('accepts complete skill snapshots while rejecting unsupported practice modes', async () => {
    await expect(
      database.$executeRaw`UPDATE "Attempt" SET "practiceMode"='OTHER'::"AttemptPracticeMode" WHERE "id"='old-open'`,
    ).rejects.toThrow('AttemptPracticeMode');
    const attempt = await createHistoricalAttempt({
      data: {
        studentId: 'old-owner',
        simulationId: 'old-quiz',
        activityKey: 'old-logical',
        contentVersion: 1,
        status: AttemptStatus.ABANDONED,
        practiceMode: AttemptPracticeMode.REVIEW,
        maxScore: 2.5,
      },
    });
    const snapshot = await database.attemptQuestionSnapshot.create({
      select: {
        skillCode: true,
        skillVersion: true,
        skillSchoolYear: true,
        practicedBefore: true,
      },
      data: {
        attemptId: attempt.id,
        questionId: 'old-question',
        originKey: 'quantity.two',
        type: 'MULTIPLE_CHOICE',
        statement: 'Synthetic review question',
        explanation: 'Synthetic explanation',
        points: 2.5,
        sortOrder: 1,
        options: [
          { optionKey: 'A', text: 'Uma' },
          { optionKey: 'B', text: 'Duas' },
        ],
        officialAnswers: [{ answerKey: 'correctAnswer', answerValue: 'B' }],
        skillCode: 'math.count',
        skillVersion: 1,
        skillTitle: 'Contagem',
        skillDisciplineSlug: 'matematica',
        skillSchoolYear: 3,
        practicedBefore: true,
      },
    });
    expect(snapshot).toMatchObject({
      skillCode: 'math.count',
      skillVersion: 1,
      skillSchoolYear: 3,
      practicedBefore: true,
    });
    expect(await originalSnapshots()).toEqual(beforeSnapshots);
  });
  it('requires real approval metadata for published skill rows', async () => {
    const data = {
      code: 'math.count',
      title: 'Contagem',
      description: 'Contar unidades.',
      disciplineId: 'old-math',
      schoolYear: 3,
      status: 'PUBLISHED' as const,
    };
    await expect(database.learningSkill.create({ data })).rejects.toThrow(
      'LearningSkill_review_check',
    );
    await expect(
      database.learningSkill.create({
        data: {
          ...data,
          code: 'math.other',
          publishedAt: new Date(),
          reviewedBy: 'owner',
          reviewedAt: null,
        },
      }),
    ).rejects.toThrow('LearningSkill_review_check');
    expect(await database.learningSkill.count()).toBe(0);
  });
  it('redeploys safely without duplicating data or rewriting history', async () => {
    const current =
      await database.$queryRaw`SELECT to_jsonb(a) AS record FROM "Attempt" a ORDER BY "id"`;
    expect(deploy().status).toBe(0);
    expect(
      await database.$queryRaw`SELECT to_jsonb(a) AS record FROM "Attempt" a ORDER BY "id"`,
    ).toEqual(current);
    expect(await originalAttempts()).toEqual(beforeAttempts);
    expect(await originalSnapshots()).toEqual(beforeSnapshots);
    expect(await database.xpEvent.count()).toBe(1);
  });
});

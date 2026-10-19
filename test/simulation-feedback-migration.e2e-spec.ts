import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const baseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const migrationName = "20261017120000_simulation_immediate_feedback";
const migrationsRoot = resolve("prisma/migrations");

describe("Simulation feedback migration over existing simulation and quiz history", () => {
  let admin: PrismaClient,
    database: PrismaClient,
    schema: string,
    directory: string,
    databaseUrl: string;
  let before: unknown;

  function deploy() {
    return spawnSync(
      process.execPath,
      [
        resolve("node_modules/prisma/build/index.js"),
        "migrate",
        "deploy",
        "--schema",
        join(directory, "schema.prisma"),
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          PRISMA_HIDE_UPDATE_MESSAGE: "true",
          CHECKPOINT_DISABLE: "1",
        },
        encoding: "utf8",
        timeout: 30000,
      },
    );
  }

  async function originalHistory() {
    const [attempts, questions, snapshots, answers] = await Promise.all([
      database.$queryRaw`SELECT to_jsonb(a)-'immediateFeedback' AS record FROM "Attempt" a WHERE "id" IN ('old-simulation-open','old-simulation-finished','old-quiz-finished') ORDER BY "id"`,
      database.$queryRaw`SELECT to_jsonb(q)-'theme' AS record FROM "Question" q WHERE "id" IN ('old-simulation-question','old-quiz-question') ORDER BY "id"`,
      database.$queryRaw`SELECT to_jsonb(s)-'theme' AS record FROM "AttemptQuestionSnapshot" s WHERE "id"='old-quiz-snapshot'`,
      database.$queryRaw`SELECT to_jsonb(a) AS record FROM "AttemptAnswer" a WHERE "id" IN ('old-simulation-open-answer','old-simulation-finished-answer','old-quiz-answer') ORDER BY "id"`,
    ]);
    return { attempts, questions, snapshots, answers };
  }

  beforeAll(async () => {
    schema = `simulation_feedback_migration_${randomUUID().replaceAll("-", "")}`;
    directory = mkdtempSync(join(tmpdir(), "simulation-feedback-migration-"));
    admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);
    databaseUrl = url.toString();
    database = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    writeFileSync(
      join(directory, "schema.prisma"),
      'datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}\n',
    );
    cpSync(
      join(migrationsRoot, "migration_lock.toml"),
      join(directory, "migrations/migration_lock.toml"),
      { recursive: true },
    );
    for (const migration of readdirSync(migrationsRoot).filter(
      (name) => /^\d/.test(name) && name < migrationName,
    ))
      cpSync(
        join(migrationsRoot, migration),
        join(directory, "migrations", migration),
        { recursive: true },
      );
    expect(deploy().status).toBe(0);

    // SQL deliberately uses the historical schema: the generated Prisma client
    // already knows the columns this test has not migrated yet.
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('old-owner','Synthetic migration owner','simulation-feedback-migration@example.test','synthetic','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('old-science','Synthetic science','migration-science',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"disciplineId",topic,status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('old-simulation','Synthetic preserved simulation','old-simulation',3,1,'AV1','old-science','Existing topic is not a question theme','PUBLISHED',1,2.5,'old-owner','2026-10-16T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear","activityKind","activityKey","contentVersion","disciplineId",topic,status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('old-quiz','Synthetic preserved quiz','old-quiz',3,'QUIZ','old-quiz-logical',1,'old-science','Existing quiz topic','PUBLISHED',1,2.5,'old-owner','2026-10-16T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Question" (id,"simulationId",type,statement,tip,"funFact",explanation,"originKey",media,points,"order","updatedAt") VALUES ('old-simulation-question','old-simulation','MULTIPLE_CHOICE','Synthetic simulation statement','Preserved simulation tip','Preserved simulation curiosity','Preserved explanation','simulation.origin','{"image":{"alt":"Synthetic preserved media","url":"https://example.test/image.png"}}'::jsonb,2.5,1,CURRENT_TIMESTAMP),('old-quiz-question','old-quiz','MULTIPLE_CHOICE','Synthetic quiz statement','Preserved quiz tip','Preserved quiz curiosity','Preserved quiz explanation','quiz.origin',NULL,2.5,1,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId",status,"maxScore","updatedAt") VALUES ('old-simulation-open','old-owner','old-simulation','IN_PROGRESS',2.5,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId",status,"maxScore",score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('old-simulation-finished','old-owner','old-simulation','FINISHED',2.5,2.5,100,1,0,'2026-10-16T13:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId","activityKey","contentVersion",status,"maxScore",score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('old-quiz-finished','old-owner','old-quiz','old-quiz-logical',1,'FINISHED',2.5,2.5,100,1,0,'2026-10-16T14:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "AttemptQuestionSnapshot" (id,"attemptId","questionId","originKey",type,statement,tip,"funFact",explanation,media,points,"sortOrder",options,"officialAnswers") VALUES ('old-quiz-snapshot','old-quiz-finished','old-quiz-question','quiz.origin','MULTIPLE_CHOICE','Synthetic saved quiz statement','Saved tip','Saved curiosity','Saved explanation','{"audio":{"url":"https://example.test/audio.mp3","transcript":"Saved transcript"}}'::jsonb,2.5,1,'[{"id":"old-a","optionKey":"A","text":"One","groupKey":null,"order":1,"metadata":{"preserved":true}},{"id":"old-b","optionKey":"B","text":"Two","groupKey":null,"order":2}]'::jsonb,'[{"answerKey":"correctAnswer","answerValue":"B"}]'::jsonb)`;
    await database.$executeRaw`INSERT INTO "AttemptAnswer" (id,"attemptId","questionId",answer,"isCorrect","pointsEarned") VALUES ('old-simulation-open-answer','old-simulation-open','old-simulation-question','{"answer":"A"}'::jsonb,NULL,NULL),('old-simulation-finished-answer','old-simulation-finished','old-simulation-question','{"answer":"B"}'::jsonb,true,2.5)`;
    await database.$executeRaw`INSERT INTO "AttemptAnswer" (id,"attemptId","questionId",answer,"isCorrect","pointsEarned","confirmedAt",feedback) VALUES ('old-quiz-answer','old-quiz-finished','old-quiz-question','{"optionKey":"B"}'::jsonb,true,2.5,'2026-10-16T13:59:00Z','{"isCorrect":true,"pointsEarned":2.5,"explanation":"Saved explanation","funFact":null}'::jsonb)`;
    before = await originalHistory();
    cpSync(
      join(migrationsRoot, migrationName),
      join(directory, "migrations", migrationName),
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

  it("preserves existing simulation responses, quiz JSON snapshots and all prior totals", async () => {
    expect(await originalHistory()).toEqual(before);
    expect(
      await database.attempt.findMany({
        where: {
          id: {
            in: [
              "old-simulation-open",
              "old-simulation-finished",
              "old-quiz-finished",
            ],
          },
        },
        select: { id: true, immediateFeedback: true },
        orderBy: { id: "asc" },
      }),
    ).toEqual([
      { id: "old-quiz-finished", immediateFeedback: false },
      { id: "old-simulation-finished", immediateFeedback: false },
      { id: "old-simulation-open", immediateFeedback: false },
    ]);
  });

  it("does not invent themes for existing questions or historical quiz snapshots", async () => {
    expect(
      await database.question.findMany({
        where: { id: { in: ["old-simulation-question", "old-quiz-question"] } },
        select: { id: true, theme: true },
        orderBy: { id: "asc" },
      }),
    ).toEqual([
      { id: "old-quiz-question", theme: null },
      { id: "old-simulation-question", theme: null },
    ]);
    expect(
      await database.attemptQuestionSnapshot.findUniqueOrThrow({
        where: { id: "old-quiz-snapshot" },
        select: { theme: true },
      }),
    ).toEqual({ theme: null });
  });

  it("defaults newly inserted attempts to deferred feedback and new themes to null", async () => {
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId",status,"maxScore","updatedAt") VALUES ('new-default-attempt','old-owner','old-simulation','ABANDONED',2.5,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Question" (id,"simulationId",type,statement,points,"order","updatedAt") VALUES ('new-default-question','old-simulation','MULTIPLE_CHOICE','Synthetic new question',1,2,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "AttemptQuestionSnapshot" (id,"attemptId","questionId","originKey",type,statement,explanation,points,"sortOrder",options,"officialAnswers") VALUES ('new-default-snapshot','new-default-attempt','new-default-question','new.origin','MULTIPLE_CHOICE','Synthetic new snapshot','Synthetic explanation',1,1,'[{"optionKey":"A","text":"One"}]'::jsonb,'[{"answerKey":"correctAnswer","answerValue":"A"}]'::jsonb)`;
    expect(
      await database.attempt.findUniqueOrThrow({
        where: { id: "new-default-attempt" },
        select: { immediateFeedback: true },
      }),
    ).toEqual({ immediateFeedback: false });
    expect(
      await database.question.findUniqueOrThrow({
        where: { id: "new-default-question" },
        select: { theme: true },
      }),
    ).toEqual({ theme: null });
    expect(
      await database.attemptQuestionSnapshot.findUniqueOrThrow({
        where: { id: "new-default-snapshot" },
        select: { theme: true },
      }),
    ).toEqual({ theme: null });
    expect(await originalHistory()).toEqual(before);
  });

  it("redeploys without rewriting the legacy rows or enabling their feedback mode", async () => {
    expect(deploy().status).toBe(0);
    expect(await originalHistory()).toEqual(before);
    expect(
      await database.attempt.count({ where: { immediateFeedback: true } }),
    ).toBe(0);
  });
});

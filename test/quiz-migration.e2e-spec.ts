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
import { PrismaClient, ActivityKind } from "@prisma/client";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const baseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const migrationName = "20261012180000_quiz_versions_and_attempt_snapshots";
const migrationsRoot = resolve("prisma/migrations");

// Only random schemas inside the runner's guarded disposable database are used.
describe("Quiz migration over populated legacy PostgreSQL", () => {
  let admin: PrismaClient;
  let database: PrismaClient;
  let schema: string;
  let directory: string;
  let databaseUrl: string;

  beforeEach(async () => {
    schema = `quiz_migration_${randomUUID().replaceAll("-", "")}`;
    directory = mkdtempSync(join(tmpdir(), "quiz-migration-"));
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
      (name) => name < migrationName && /^\d/.test(name),
    )) {
      cpSync(
        join(migrationsRoot, migration),
        join(directory, "migrations", migration),
        { recursive: true },
      );
    }
    expect(deploy().status).toBe(0);
    // Raw inserts intentionally use only columns that existed before this change.
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('legacy-user','Synthetic legacy','legacy@example.test','synthetic-not-a-credential','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('legacy-discipline','Synthetic legacy','legacy',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"disciplineId",status,"totalQuestions","maxScore","createdById","updatedAt") VALUES ('legacy-sim','Synthetic legacy','legacy',-2,0,'UNICO','legacy-discipline','PUBLISHED',1,2.5,'legacy-user',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Question" (id,"simulationId",type,statement,points,"order","updatedAt") VALUES ('legacy-question','legacy-sim','MULTIPLE_CHOICE','Legacy statement',2.5,1,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "QuestionAnswer" (id,"questionId","answerKey","answerValue") VALUES ('legacy-key','legacy-question','correctAnswer','B')`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","maxScore","updatedAt") VALUES ('legacy-attempt','legacy-sim','legacy-user',2.5,CURRENT_TIMESTAMP)`;
  });

  afterEach(async () => {
    await database?.$disconnect();
    if (admin) {
      try {
        await admin.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        );
      } finally {
        await admin.$disconnect();
      }
    }
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

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

  function addQuizMigration() {
    cpSync(
      join(migrationsRoot, migrationName),
      join(directory, "migrations", migrationName),
      { recursive: true },
    );
  }

  it("preserves populated legacy attempts, answers and sentinel metadata", async () => {
    addQuizMigration();
    expect(deploy().status).toBe(0);
    const simulation = await database.simulation.findUniqueOrThrow({
      where: { id: "legacy-sim" },
    });
    expect(simulation).toMatchObject({
      activityKind: ActivityKind.SIMULATION,
      activityKey: null,
      contentVersion: null,
      schoolYear: -2,
      bimester: 0,
      assessment: "UNICO",
      totalQuestions: 1,
    });
    expect(simulation.maxScore.toNumber()).toBe(2.5);
    expect(await database.attempt.count()).toBe(1);
    expect(
      await database.questionAnswer.findUnique({ where: { id: "legacy-key" } }),
    ).toMatchObject({ answerValue: "B" });
    expect(await database.attemptQuestionSnapshot.count()).toBe(0);
    // The conditional constraint still forbids null bimestre on a simulation.
    await expect(
      database.simulation.update({
        where: { id: "legacy-sim" },
        data: { bimester: null },
      }),
    ).rejects.toThrow();
  }, 60000);

  it("aborts before schema changes when legacy open attempts are duplicated", async () => {
    await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","maxScore","updatedAt") VALUES ('legacy-duplicate','legacy-sim','legacy-user',2.5,CURRENT_TIMESTAMP)`;
    addQuizMigration();
    const failed = deploy();
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toContain("Quiz migration blocked");
    const columns = await database.$queryRaw<
      Array<{ column_name: string }>
    >`SELECT column_name FROM information_schema.columns WHERE table_schema = ${schema} AND table_name = 'Simulation' AND column_name = 'activityKind'`;
    expect(columns).toHaveLength(0);
    const attempts = await database.$queryRaw<
      Array<{ id: string; status: string }>
    >`SELECT id,status FROM "Attempt" ORDER BY id`;
    expect(attempts).toHaveLength(2);
    expect(attempts.every(({ status }) => status === "IN_PROGRESS")).toBe(true);
    const answers = await database.$queryRaw<
      Array<{ answerValue: string }>
    >`SELECT "answerValue" FROM "QuestionAnswer" WHERE id='legacy-key'`;
    expect(answers).toEqual([{ answerValue: "B" }]);
  }, 60000);
});

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
const migrationName = "20261013003000_missions_xp";
const migrationsRoot = resolve("prisma/migrations");

describe("Additive mission/XP migration over historical attempts", () => {
  let admin: PrismaClient;
  let database: PrismaClient;
  let schema: string;
  let directory: string;
  let databaseUrl: string;
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
  beforeAll(async () => {
    schema = `mission_migration_${randomUUID().replaceAll("-", "")}`;
    directory = mkdtempSync(join(tmpdir(), "mission-migration-"));
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
    ))
      cpSync(
        join(migrationsRoot, migration),
        join(directory, "migrations", migration),
        { recursive: true },
      );
    expect(deploy().status).toBe(0);
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('historical-student','Synthetic historical','history@example.test','synthetic','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('historical-discipline','Synthetic historical','historical',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"activityKind","activityKey","contentVersion","disciplineId",status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('historical-quiz','Synthetic historical quiz','historical-quiz',3,NULL,NULL,'QUIZ','historical-key',1,'historical-discipline','PUBLISHED',1,2.5,'historical-student',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),('historical-sim','Synthetic historical simulation','historical-sim',3,1,'AV1','SIMULATION',NULL,NULL,'historical-discipline','PUBLISHED',1,2.5,'historical-student',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","activityKey","contentVersion","maxScore",status,score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('historical-quiz-done','historical-quiz','historical-student','historical-key',1,2.5,'FINISHED',2.5,100,1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),('historical-sim-done','historical-sim','historical-student',NULL,NULL,2.5,'FINISHED',2.5,100,1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),('historical-quiz-open','historical-quiz','historical-student','historical-key',1,2.5,'IN_PROGRESS',NULL,NULL,0,0,NULL,CURRENT_TIMESTAMP)`;
    before = await database.attempt.findMany({ orderBy: { id: "asc" } });
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
  it("preserves all completed and open quiz/simulation fields exactly", async () => {
    expect(await database.attempt.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
  });
  it("creates an empty ledger and reward receipts without retroactive grants or missions", async () => {
    expect(await database.xpEvent.count()).toBe(0);
    expect(await database.quizCompletionReward.count()).toBe(0);
    expect(await database.mission.count()).toBe(0);
    expect(await database.missionProgress.count()).toBe(0);
  });
  it("is safe to deploy again without changing history", () => {
    expect(deploy().status).toBe(0);
  });
});

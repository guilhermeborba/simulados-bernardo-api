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
const migrationName = "20261013010000_avatar_achievements";
const migrationsRoot = resolve("prisma/migrations");

describe("Collection migration preserves receipted quiz history", () => {
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
    schema = `collection_migration_${randomUUID().replaceAll("-", "")}`;
    directory = mkdtempSync(join(tmpdir(), "collection-migration-"));
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
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('history-owner','Synthetic history','collection-history@example.test','synthetic','STUDENT','ACTIVE',CURRENT_TIMESTAMP),('legacy-owner','Synthetic legacy','collection-legacy@example.test','synthetic','STUDENT','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('history-discipline','Synthetic history','history-collection',CURRENT_TIMESTAMP)`;
    for (let index = 0; index < 5; index++) {
      const id = `historical-quiz-${index}`;
      const key = `historical-key-${index}`;
      const topic = ["Shapes", "Colors", "Sounds", "Shapes", "Colors"][index];
      await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",assessment,"activityKind","activityKey","contentVersion","disciplineId",topic,status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES (${id},'Synthetic historical quiz',${id},3,NULL,'QUIZ',${key},1,'history-discipline',${topic},'PUBLISHED',1,2.5,'history-owner',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`;
      for (let day = 0; day < 2; day++) {
        const attemptId = `${id}-day-${day}`;
        const date = new Date(
          `2026-10-${12 + day}T${String(12 + index).padStart(2, "0")}:00:00.000Z`,
        );
        const learningDay = `2026-10-${12 + day}`;
        await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","activityKey","contentVersion","maxScore",status,score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES (${attemptId},${id},'history-owner',${key},1,2.5,'FINISHED',2.5,100,1,0,${date},${date})`;
        await database.$executeRaw`INSERT INTO "QuizCompletionReward" ("attemptId","xpAwarded",reason,day,"createdAt") VALUES (${attemptId},10,'AWARDED',${learningDay},${date})`;
        await database.$executeRaw`INSERT INTO "XpEvent" (id,"userId","attemptId","activityKey",day,amount,"createdAt") VALUES (${`event-${attemptId}`},'history-owner',${attemptId},${key},${learningDay},10,${date})`;
      }
    }
    await database.$executeRaw`INSERT INTO "Attempt" (id,"simulationId","studentId","activityKey","contentVersion","maxScore",status,score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('legacy-completed','historical-quiz-0','legacy-owner','historical-key-0',1,2.5,'FINISHED',2.5,100,1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Mission" (id,title,description,segment,"schoolYear",status,"startsAt","endsAt",slot,"publishedAt","createdById","updatedAt") VALUES ('history-mission','Synthetic historical mission','Synthetic only','FUNDAMENTAL_I',3,'PUBLISHED','2026-10-12T03:00:00Z','2026-10-19T03:00:00Z',1,'2026-10-11T12:00:00Z','history-owner',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "MissionActivity" (id,"missionId","activityKey","sortOrder") VALUES ('history-step','history-mission','historical-key-0',1)`;
    await database.$executeRaw`INSERT INTO "MissionProgress" (id,"userId","missionId","completedAt","updatedAt") VALUES ('history-progress','history-owner','history-mission','2026-10-12T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "MissionActivityCompletion" (id,"progressId","missionActivityId","attemptId","completedAt") VALUES ('history-step-done','history-progress','history-step','historical-quiz-0-day-0','2026-10-12T12:00:00Z')`;
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
  it("backfills all five cosmetics only from previously receipted quiz practice", async () => {
    const grants = await database.$queryRaw<
      { achievementId: string; earnedAt: Date }[]
    >`SELECT "achievementId", "earnedAt" FROM "UserAchievement" WHERE "userId"='history-owner' ORDER BY "achievementId"`;
    expect(grants.map((row) => row.achievementId)).toEqual([
      "FIRST_MISSION",
      "FIRST_QUIZ",
      "FIVE_QUIZZES",
      "THREE_TOPICS",
      "XP_100",
    ]);
    expect(
      grants.every((row) => row.earnedAt < new Date("2026-10-14T00:00:00Z")),
    ).toBe(true);
    const items = await database.$queryRaw<
      { itemId: string }[]
    >`SELECT "itemId" FROM "UserAvatarItem" WHERE "userId"='history-owner' ORDER BY "itemId"`;
    expect(items.map((row) => row.itemId)).toEqual([
      "constancia",
      "explorador",
      "horizonte",
      "missao",
      "primeiro-passo",
    ]);
    const legacy = await database.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(*)::int AS count FROM "UserAchievement" WHERE "userId"='legacy-owner'`;
    expect(legacy[0].count).toBe(0);
    expect(await database.xpEvent.count()).toBe(10);
    expect(
      (await database.xpEvent.aggregate({ _sum: { amount: true } }))._sum
        .amount,
    ).toBe(100);
    expect(await database.quizCompletionReward.count()).toBe(10);
    expect(await database.missionProgress.count()).toBe(1);
  });
  it("is safe to deploy again without duplicating cosmetics or changing history", async () => {
    expect(deploy().status).toBe(0);
    expect(await database.attempt.findMany({ orderBy: { id: "asc" } })).toEqual(
      before,
    );
    const counts = await database.$queryRaw<
      { achievements: number; items: number }[]
    >`SELECT (SELECT COUNT(*) FROM "UserAchievement")::int AS achievements, (SELECT COUNT(*) FROM "UserAvatarItem")::int AS items`;
    expect(counts).toEqual([{ achievements: 5, items: 5 }]);
  });
});

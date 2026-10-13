import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
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
const migrationName = "20261013030000_access_password_recovery";
const migrationsRoot = resolve("prisma/migrations");

describe("Access and recovery migration over populated user/session/history data", () => {
  let admin: PrismaClient,
    database: PrismaClient,
    schema: string,
    directory: string,
    databaseUrl: string;
  let beforeUsers: unknown, beforeRows: unknown;
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
  function originalUsers() {
    return database.$queryRaw`SELECT to_jsonb(u)-'authVersion' AS record FROM "User" u ORDER BY "id"`;
  }
  function originalRows() {
    return database.$queryRaw`SELECT * FROM (SELECT 'refresh' AS kind,to_jsonb(r) AS record FROM "RefreshToken" r UNION ALL SELECT 'attempt',to_jsonb(a) FROM "Attempt" a UNION ALL SELECT 'guardian',to_jsonb(g) FROM "GuardianStudent" g UNION ALL SELECT 'member',to_jsonb(m) FROM "TurmaMembership" m) historic ORDER BY kind,record::text`;
  }
  beforeAll(async () => {
    schema = `access_recovery_migration_${randomUUID().replaceAll("-", "")}`;
    directory = mkdtempSync(join(tmpdir(), "access-recovery-migration-"));
    admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);
    databaseUrl = url.toString();
    database = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    writeFileSync(
      join(directory, "schema.prisma"),
      'datasource db {\n provider="postgresql"\n url=env("DATABASE_URL")\n}\n',
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
    await database.$executeRaw`INSERT INTO "User" (id,name,email,"passwordHash",role,status,"updatedAt") VALUES ('old-student','Synthetic legacy student','migration-student@example.test','preserved-bcrypt','STUDENT','ACTIVE',CURRENT_TIMESTAMP),('old-teacher','Synthetic legacy teacher','migration-teacher@example.test','preserved-teacher-hash','TEACHER','ACTIVE',CURRENT_TIMESTAMP),('old-guardian','Synthetic legacy guardian','migration-guardian@example.test','preserved-guardian-hash','GUARDIAN','ACTIVE',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "RefreshToken" (id,"userId","tokenHash","expiresAt","updatedAt") VALUES ('old-refresh','old-student','preserved-refresh-hash','2026-10-20T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Turma" (id,name,slug,"schoolYear","updatedAt") VALUES ('old-class','Synthetic old class','old-class',3,CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "TurmaMembership" (id,"turmaId","userId") VALUES ('old-member','old-class','old-student')`;
    await database.$executeRaw`INSERT INTO "GuardianStudent" (id,"guardianId","studentId",relationship) VALUES ('old-guardian-link','old-guardian','old-student','Synthetic family')`;
    await database.$executeRaw`INSERT INTO "Discipline" (id,name,slug,"updatedAt") VALUES ('old-math','Synthetic math','matematica',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Simulation" (id,title,slug,"schoolYear",bimester,assessment,"disciplineId",status,"totalQuestions","maxScore","createdById","publishedAt","updatedAt") VALUES ('old-simulation','Synthetic old simulation','old-simulation',3,1,'AV1','old-math','PUBLISHED',1,3,'old-teacher','2026-10-12T12:00:00Z',CURRENT_TIMESTAMP)`;
    await database.$executeRaw`INSERT INTO "Attempt" (id,"studentId","simulationId",status,"maxScore",score,percentage,"correctCount","wrongCount","finishedAt","updatedAt") VALUES ('old-attempt','old-student','old-simulation','FINISHED',3,1.5,50,0,1,'2026-10-13T12:00:00Z',CURRENT_TIMESTAMP)`;
    beforeUsers = await originalUsers();
    beforeRows = await originalRows();
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
  it("adds version zero without changing password hashes, active sessions, links or assessment history", async () => {
    expect(await originalUsers()).toEqual(beforeUsers);
    expect(await originalRows()).toEqual(beforeRows);
    expect(
      await database.user.findMany({
        select: { id: true, authVersion: true },
        orderBy: { id: "asc" },
      }),
    ).toEqual([
      { id: "old-guardian", authVersion: 0 },
      { id: "old-student", authVersion: 0 },
      { id: "old-teacher", authVersion: 0 },
    ]);
  });
  it("does not automatically grant existing teachers access to any class or invent password reset links", async () => {
    expect(await database.teacherTurma.count()).toBe(0);
    expect(await database.passwordResetToken.count()).toBe(0);
  });
  it("enforces nonnegative auth versions and unique explicit teacher assignments with real foreign keys", async () => {
    await expect(
      database.user.update({
        where: { id: "old-student" },
        data: { authVersion: -1 },
      }),
    ).rejects.toThrow("User_authVersion_nonnegative_check");
    await database.teacherTurma.create({
      data: { teacherId: "old-teacher", turmaId: "old-class" },
    });
    await expect(
      database.teacherTurma.create({
        data: { teacherId: "old-teacher", turmaId: "old-class" },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
    await expect(
      database.teacherTurma.create({
        data: { teacherId: "missing-teacher", turmaId: "old-class" },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
    expect(await originalUsers()).toEqual(beforeUsers);
    expect(await originalRows()).toEqual(beforeRows);
  });
  it("stores only valid unique SHA-256 reset hashes and requires expiry after creation", async () => {
    const data = {
      userId: "old-student",
      tokenHash: createHash("sha256")
        .update("synthetic-only-secret")
        .digest("hex"),
      createdAt: new Date("2026-10-13T12:00:00Z"),
      expiresAt: new Date("2026-10-13T12:30:00Z"),
    };
    const valid = await database.passwordResetToken.create({ data });
    expect(valid.usedAt).toBeNull();
    expect(valid.deliveredAt).toBeNull();
    await expect(
      database.passwordResetToken.create({ data }),
    ).rejects.toMatchObject({ code: "P2002" });
    await expect(
      database.passwordResetToken.create({
        data: { ...data, tokenHash: "raw-link-secret" },
      }),
    ).rejects.toThrow("PasswordResetToken_hash_check");
    await expect(
      database.passwordResetToken.create({
        data: { ...data, tokenHash: "b".repeat(64), expiresAt: data.createdAt },
      }),
    ).rejects.toThrow("PasswordResetToken_expiry_check");
    expect(await originalRows()).toEqual(beforeRows);
  });
  it("redeploys safely without rewriting existing users, grants, tokens or history", async () => {
    const tokens = await database.passwordResetToken.findMany(),
      teachers = await database.teacherTurma.findMany();
    expect(deploy().status).toBe(0);
    expect(await originalUsers()).toEqual(beforeUsers);
    expect(await originalRows()).toEqual(beforeRows);
    expect(await database.passwordResetToken.findMany()).toEqual(tokens);
    expect(await database.teacherTurma.findMany()).toEqual(teachers);
  });
});

import { randomUUID } from "node:crypto";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as request from "supertest";
import { PrismaService } from "../src/database/prisma/prisma.service";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Session {
  id: string;
  token: string;
}
interface Quiz {
  id: string;
  activityKey: string;
  questions: { id: string }[];
}
const years = [
  ["INFANTIL", -2],
  ["INFANTIL", -1],
  ...Array.from({ length: 5 }, (_, i) => ["FUNDAMENTAL_I", i + 1]),
  ...Array.from({ length: 4 }, (_, i) => ["FUNDAMENTAL_II", i + 6]),
  ["MEDIO", 10],
  ["MEDIO", 11],
  ["MEDIO", 12],
  ["ENFERMAGEM", 0],
] as [string, number][];
const fixedTime = "2026-10-12T18:00:00.000Z";

// Real guards, DTOs, migration chain and concurrent PostgreSQL transactions.
// The guarded integration runner supplies only a disposable synthetic database.
describe("Persisted avatar and achievements (Nest + PostgreSQL)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = "test";
    const { AppModule } = await import("../src/app.module");
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await app.listen(0, "127.0.0.1");
    prisma = app.get(PrismaService);
    jest.useFakeTimers({
      now: new Date(fixedTime),
      doNotFake: [
        "nextTick",
        "setImmediate",
        "clearImmediate",
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "performance",
        "hrtime",
        "queueMicrotask",
      ],
    });
  });

  async function clean() {
    // These are exclusively fixture tables in the runner's empty test database.
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Discipline", "Turma", "AuditLog" CASCADE',
    );
  }
  async function session(role: UserRole = UserRole.STUDENT): Promise<Session> {
    const user = await prisma.user.create({
      data: {
        name: "Synthetic mission account",
        email: `${randomUUID()}@example.test`,
        role,
        status: "ACTIVE",
        passwordHash: "synthetic-not-a-password",
        ...(role === UserRole.STUDENT
          ? { studentProfile: { create: { schoolYear: 3 } } }
          : {}),
      },
    });
    // Long-lived synthetic tokens let these cases cross midnight/week boundaries.
    const token = app.get(JwtService).sign(
      { sub: user.id, email: user.email, role, type: "access" },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "365d",
      },
    );
    return { id: user.id, token };
  }
  beforeEach(async () => {
    jest.setSystemTime(new Date(fixedTime));
    await clean();
    admin = await session(UserRole.ADMIN);
    student = await session();
    outsider = await session();
    teacher = await session(UserRole.TEACHER);
    disciplineId = (
      await prisma.discipline.create({
        data: { name: "Synthetic mission theme", slug: "matematica" },
      })
    ).id;
    turmaId = (
      await prisma.turma.create({
        data: {
          name: "Synthetic mission group",
          slug: "mission-group",
          schoolYear: 3,
        },
      })
    ).id;
  });
  afterAll(async () => {
    jest.useRealTimers();
    if (prisma) await clean();
    await app?.close();
  });
  function http(
    method: "get" | "post" | "patch",
    path: string,
    user = student,
  ) {
    return request(app.getHttpServer())
      [method](path)
      .set("Authorization", `Bearer ${user.token}`);
  }
  async function quiz(
    overrides: Record<string, unknown> = {},
    publish = true,
  ): Promise<Quiz> {
    const response = await http("post", "/quizzes", admin)
      .send({
        activityKey: `mission-quiz-${randomUUID()}`,
        title: "Synthetic learning activity",
        topic: "Practice",
        schoolYear: 3,
        disciplineId,
        questions: [
          {
            originKey: "synthetic.quantity",
            statement: "Quanto é um mais um?",
            explanation: "Um mais um são dois.",
            points: 2.5,
            options: [
              { optionKey: "A", text: "Uma unidade" },
              { optionKey: "B", text: "Duas unidades" },
            ],
            correctAnswer: "B",
          },
        ],
        ...overrides,
      })
      .expect(201);
    if (publish)
      await http("patch", `/quizzes/${response.body.id}/publish`, admin).expect(
        200,
      );
    return response.body as Quiz;
  }
  async function ready(q: Quiz, user = student, optionKey = "B") {
    const started = await http(
      "post",
      `/quizzes/${q.id}/attempts`,
      user,
    ).expect(201);
    const questions = await http(
      "get",
      `/attempts/${started.body.id}/questions`,
      user,
    ).expect(200);
    for (const question of questions.body as { id: string }[])
      await http(
        "post",
        `/attempts/${started.body.id}/questions/${question.id}/answer`,
        user,
      )
        .send({ answer: { optionKey } })
        .expect(201);
    return started.body.id as string;
  }
  function finish(attemptId: string, user = student) {
    return http("post", `/attempts/${attemptId}/finish`, user);
  }
  function missionPayload(
    activityKeys: string[],
    overrides: Record<string, unknown> = {},
  ) {
    return {
      title: "Synthetic weekly mission",
      description: "Pratique duas pequenas atividades no seu tempo.",
      segment: "FUNDAMENTAL_I",
      schoolYear: 3,
      weekStart: "2026-10-12",
      slot: 1,
      activityKeys,
      ...overrides,
    };
  }
  async function mission(
    activityKeys: string[],
    overrides: Record<string, unknown> = {},
    publish = true,
  ) {
    const created = await http("post", "/missions", admin)
      .send(missionPayload(activityKeys, overrides))
      .expect(201);
    if (publish)
      await http("patch", `/missions/${created.body.id}/publish`, admin).expect(
        200,
      );
    return created.body.id as string;
  }
  async function home(user = student, query = "") {
    return (await http("get", `/me/learning-home${query}`, user).expect(200))
      .body;
  }
  function safe(value: unknown) {
    const text = JSON.stringify(value);
    for (const key of [
      "officialAnswers",
      "passwordHash",
      "tokenHash",
      "correctAnswer",
      "questionSnapshots",
      "createdById",
    ])
      expect(text).not.toContain(`"${key}"`);
  }

  const avatar = async (user = student) =>
    (await http("get", "/me/avatar", user).expect(200)).body;
  const achievements = async (user = student) =>
    (await http("get", "/me/achievements", user).expect(200)).body;
  const complete = async (q: Quiz, user = student, option = "B") =>
    finish(await ready(q, user, option), user).expect(201);
  const earned = (payload: {
    achievements: { id: string; earnedAt: string | null }[];
  }) =>
    payload.achievements
      .filter((a) => a.earnedAt)
      .map((a) => a.id)
      .sort();

  it("starts with a cosmetic starter and no fabricated XP, grades or achievements", async () => {
    const initial = await avatar();
    expect(initial.selection).toEqual({ itemId: "inicio", style: "AUTO" });
    expect(initial.items).toHaveLength(6);
    expect(
      initial.items
        .filter((item: { owned: boolean }) => item.owned)
        .map((item: { id: string }) => item.id),
    ).toEqual(["inicio"]);
    expect(initial.updatedAt).toBeNull();
    const catalog = await achievements();
    expect(catalog.achievements).toHaveLength(5);
    expect(earned(catalog)).toEqual([]);
    expect(catalog.stats).toEqual({
      completedQuizzes: 0,
      topics: 0,
      completedMissions: 0,
      totalXp: 0,
    });
    safe(initial);
    safe(catalog);
  });

  it("authenticates against current active role and rejects other roles and account probes", async () => {
    for (const path of ["/me/avatar", "/me/achievements"]) {
      await request(app.getHttpServer()).get(path).expect(401);
      await http("get", path, teacher).expect(403);
      await http("get", path, admin).expect(403);
      await http("get", `${path}/${outsider.id}`).expect(404);
    }
    await http("patch", "/me/avatar", teacher)
      .send({ style: "SEAL" })
      .expect(403);
    await prisma.user.update({
      where: { id: student.id },
      data: { status: "INACTIVE" },
    });
    await http("get", "/me/avatar").expect(401);
    await http("patch", "/me/avatar").send({ style: "SEAL" }).expect(401);
  });

  it.each([
    {},
    { itemId: null },
    { style: null },
    { itemId: "missing" },
    { style: "PURCHASE" },
    { itemId: 9 },
    { style: "AUTO", userId: "another" },
    { itemId: "inicio", xp: 999 },
  ])("validates strict partial avatar patch %j", async (body) => {
    await http("patch", "/me/avatar").send(body).expect(400);
    expect((await avatar()).selection).toEqual({
      itemId: "inicio",
      style: "AUTO",
    });
  });

  it("rejects an unowned cosmetic even if the caller claims sufficient XP", async () => {
    await http("patch", "/me/avatar").send({ itemId: "horizonte" }).expect(403);
    await http("patch", "/me/avatar")
      .send({ itemId: "primeiro-passo" })
      .expect(403);
    expect((await home()).xp.total).toBe(0);
  });

  it("awards first conclusion even with a wrong answer, preserving the result and grade", async () => {
    const result = await complete(
      await quiz({ topic: "Private topic never in collection" }),
      student,
      "A",
    );
    expect(Number(result.body.attempt.score)).toBe(0);
    expect(Number(result.body.attempt.percentage)).toBe(0);
    expect(result.body.reward.xpAwarded).toBe(10);
    const catalog = await achievements();
    expect(earned(catalog)).toEqual(["FIRST_QUIZ"]);
    expect(catalog.stats).toEqual({
      completedQuizzes: 1,
      topics: 1,
      completedMissions: 0,
      totalXp: 10,
    });
    expect(JSON.stringify(catalog)).not.toContain("Private topic");
    const first = (await avatar()).items.find(
      (item: { id: string }) => item.id === "primeiro-passo",
    );
    expect(first.owned).toBe(true);
    expect(first.unlockedAt).toBe(fixedTime);
    expect(
      await http("get", `/attempts/${result.body.attempt.id}/result`)
        .expect(200)
        .then((r) => r.body),
    ).toEqual(result.body);
    expect(
      await finish(result.body.attempt.id)
        .expect(201)
        .then((r) => r.body),
    ).toEqual(result.body);
    expect(earned(await achievements())).toEqual(["FIRST_QUIZ"]);
  });

  it("persists owned item and presentation across instances and merges partial changes", async () => {
    await complete(await quiz());
    await http("patch", "/me/avatar")
      .send({ itemId: "primeiro-passo", style: "SEAL" })
      .expect(200);
    expect((await avatar()).selection).toEqual({
      itemId: "primeiro-passo",
      style: "SEAL",
    });
    await http("patch", "/me/avatar").send({ style: "MASCOT" }).expect(200);
    expect((await avatar()).selection).toEqual({
      itemId: "primeiro-passo",
      style: "MASCOT",
    });
    await http("patch", "/me/avatar").send({ itemId: "inicio" }).expect(200);
    expect((await avatar()).selection).toEqual({
      itemId: "inicio",
      style: "MASCOT",
    });
    const second = new PrismaService();
    try {
      await second.$connect();
      const raw = await second.$queryRawUnsafe<
        { itemId: string; style: string }[]
      >(
        'SELECT "itemId", "style" FROM "UserAvatar" WHERE "userId" = $1',
        student.id,
      );
      expect(raw).toEqual([{ itemId: "inicio", style: "MASCOT" }]);
    } finally {
      await second.$disconnect();
    }
    expect((await avatar(outsider)).selection).toEqual({
      itemId: "inicio",
      style: "AUTO",
    });
    expect(earned(await achievements(outsider))).toEqual([]);
    expect((await home()).xp.total).toBe(10);
  });

  it("serializes first partial patches without losing either preference", async () => {
    await complete(await quiz());
    await Promise.all([
      http("patch", "/me/avatar")
        .send({ itemId: "primeiro-passo" })
        .expect(200),
      http("patch", "/me/avatar").send({ style: "SEAL" }).expect(200),
    ]);
    expect((await avatar()).selection).toEqual({
      itemId: "primeiro-passo",
      style: "SEAL",
    });
  });

  it("counts themes once per logical quiz using its earliest conclusion, not content versions", async () => {
    const first = await quiz({
      activityKey: "collection-logical",
      topic: "  Shapes  ",
    });
    await complete(first);
    await complete(first);
    const second = (
      await http("post", `/quizzes/${first.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http("patch", `/quizzes/${second.id}`, admin)
      .send({ topic: "Numbers" })
      .expect(200);
    await http("patch", `/quizzes/${second.id}/publish`, admin).expect(200);
    await complete(second);
    await complete(await quiz({ topic: "shapes" }));
    let stats = (await achievements()).stats;
    expect(stats.completedQuizzes).toBe(2);
    expect(stats.topics).toBe(1);
    await complete(await quiz({ topic: "Colors" }));
    await complete(await quiz({ topic: "Sounds" }));
    stats = (await achievements()).stats;
    expect(stats.completedQuizzes).toBe(4);
    expect(stats.topics).toBe(3);
    expect(earned(await achievements())).toEqual([
      "FIRST_QUIZ",
      "THREE_TOPICS",
    ]);
    expect(
      (await avatar()).items.find(
        (item: { id: string }) => item.id === "explorador",
      ).owned,
    ).toBe(true);
  });

  it("keeps collection growth after the XP cap and never adds cosmetic XP bonuses", async () => {
    for (let i = 0; i < 6; i++)
      await complete(await quiz({ topic: `Theme ${i}` }));
    const data = await achievements();
    expect(data.stats).toEqual({
      completedQuizzes: 6,
      topics: 6,
      completedMissions: 0,
      totalXp: 50,
    });
    expect(earned(data)).toEqual([
      "FIRST_QUIZ",
      "FIVE_QUIZZES",
      "THREE_TOPICS",
    ]);
    const avatarData = await avatar();
    expect(
      avatarData.items.find((item: { id: string }) => item.id === "constancia")
        .owned,
    ).toBe(true);
    expect(
      avatarData.items.find((item: { id: string }) => item.id === "horizonte")
        .owned,
    ).toBe(false);
    expect((await home()).xp.today).toBe(50);
    expect(
      (await http("get", "/me/pontuacao").expect(200)).body.simulados,
    ).toBe(0);
  });

  it("unlocks the XP milestone on another day without requiring uninterrupted visits", async () => {
    const quizzes = await Promise.all(Array.from({ length: 5 }, () => quiz()));
    for (const q of quizzes) await complete(q);
    jest.setSystemTime(new Date("2026-10-16T18:00:00.000Z"));
    for (const q of quizzes) await complete(q);
    expect((await achievements()).stats.totalXp).toBe(100);
    expect(earned(await achievements())).toContain("XP_100");
    expect(
      (await avatar()).items.find(
        (item: { id: string }) => item.id === "horizonte",
      ).owned,
    ).toBe(true);
  });

  it("unlocks a mission cosmetic atomically and keeps it after the weekly window closes", async () => {
    const q = await quiz();
    await mission([q.activityKey]);
    await complete(q);
    expect(earned(await achievements())).toEqual([
      "FIRST_MISSION",
      "FIRST_QUIZ",
    ]);
    await http("patch", "/me/avatar").send({ itemId: "missao" }).expect(200);
    jest.setSystemTime(new Date("2026-11-12T18:00:00.000Z"));
    expect((await avatar()).selection.itemId).toBe("missao");
    expect(
      (await avatar()).items.find(
        (item: { id: string }) => item.id === "missao",
      ).owned,
    ).toBe(true);
    expect((await home()).missions).toEqual([]);
  });

  it.each(years)(
    "supports %s / %i with the same durable ownership",
    async (segment, schoolYear) => {
      await http("patch", "/me/learning-preferences")
        .send({ segment, schoolYear })
        .expect(200);
      await complete(await quiz({ schoolYear }));
      await http("patch", "/me/avatar")
        .send({ itemId: "primeiro-passo", style: "AUTO" })
        .expect(200);
      expect((await avatar()).selection.itemId).toBe("primeiro-passo");
      expect(earned(await achievements())).toContain("FIRST_QUIZ");
    },
  );

  it("grants once across concurrent quizzes, duplicate finishes and saves", async () => {
    const quizzes = await Promise.all(
      Array.from({ length: 6 }, (_, i) => quiz({ topic: `Concurrent ${i}` })),
    );
    const attempts = await Promise.all(quizzes.map((q) => ready(q)));
    await Promise.all(attempts.map((id) => finish(id).expect(201)));
    await Promise.all(attempts.map((id) => finish(id).expect(201)));
    const data = await achievements();
    expect(data.stats.completedQuizzes).toBe(6);
    expect(data.stats.totalXp).toBe(50);
    expect(earned(data)).toEqual([
      "FIRST_QUIZ",
      "FIVE_QUIZZES",
      "THREE_TOPICS",
    ]);
    await http("patch", "/me/avatar")
      .send({ itemId: "constancia", style: "SEAL" })
      .expect(200);
    expect((await avatar()).selection).toEqual({
      itemId: "constancia",
      style: "SEAL",
    });
  });

  it("retains granted cosmetics after source archive/deletion and a curriculum change", async () => {
    const q = await quiz();
    await complete(q);
    await http("patch", "/me/avatar")
      .send({ itemId: "primeiro-passo" })
      .expect(200);
    await prisma.simulation.update({
      where: { id: q.id },
      data: { status: "ARCHIVED", deletedAt: new Date() },
    });
    await http("patch", "/me/learning-preferences")
      .send({ segment: "ENFERMAGEM", schoolYear: 0 })
      .expect(200);
    const data = await avatar();
    expect(data.selection.itemId).toBe("primeiro-passo");
    expect(
      data.items.find((item: { id: string }) => item.id === "primeiro-passo")
        .owned,
    ).toBe(true);
    expect(earned(await achievements())).toEqual(["FIRST_QUIZ"]);
  });
  it("retains earned ownership after private access revocation without exposing content", async () => {
    await prisma.turmaMembership.create({
      data: { userId: student.id, turmaId },
    });
    const q = await quiz({
      turmaId,
      topic: "Secret clinical theme",
      title: "Secret private class",
    });
    await complete(q);
    await prisma.turmaMembership.deleteMany({
      where: { userId: student.id, turmaId },
    });
    const collection = await achievements();
    expect(earned(collection)).toContain("FIRST_QUIZ");
    expect(JSON.stringify(collection)).not.toContain("Secret");
    expect(JSON.stringify(collection)).not.toContain(q.id);
    await http("patch", "/me/avatar")
      .send({ itemId: "primeiro-passo" })
      .expect(200);
    await http("post", `/quizzes/${q.id}/attempts`).expect(404);
    expect(earned(await achievements(outsider))).toEqual([]);
  });

  it.each(["UserAchievement", "UserAvatarItem"])(
    "rolls back grade, XP, mission and grants when %s fails",
    async (table) => {
      const q = await quiz();
      await mission([q.activityKey]);
      const id = await ready(q);
      const functionName = "synthetic_collection_failure";
      await prisma.$executeRawUnsafe(
        `CREATE FUNCTION "${functionName}"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic collection failure'; END $$`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE TRIGGER "synthetic_collection_failure" BEFORE INSERT ON "${table}" FOR EACH ROW EXECUTE FUNCTION "${functionName}"()`,
      );
      try {
        await finish(id).expect(500);
        const current = await prisma.attempt.findUniqueOrThrow({
          where: { id },
        });
        expect(current.status).toBe("IN_PROGRESS");
        expect(current.finishedAt).toBeNull();
        expect(current.score).toBeNull();
        expect(await prisma.xpEvent.count()).toBe(0);
        expect(await prisma.quizCompletionReward.count()).toBe(0);
        expect(await prisma.missionProgress.count()).toBe(0);
        const grants = await prisma.$queryRawUnsafe<{ count: number }[]>(
          'SELECT (SELECT COUNT(*) FROM "UserAchievement")::int + (SELECT COUNT(*) FROM "UserAvatarItem")::int AS count',
        );
        expect(grants[0].count).toBe(0);
      } finally {
        await prisma.$executeRawUnsafe(
          `DROP TRIGGER "synthetic_collection_failure" ON "${table}"`,
        );
        await prisma.$executeRawUnsafe(`DROP FUNCTION "${functionName}"()`);
      }
      await finish(id).expect(201);
      expect(earned(await achievements())).toEqual([
        "FIRST_MISSION",
        "FIRST_QUIZ",
      ]);
    },
  );

  it("keeps ownership and selection when an origin attempt is physically removed", async () => {
    const result = await complete(await quiz());
    await http("patch", "/me/avatar")
      .send({ itemId: "primeiro-passo" })
      .expect(200);
    await prisma.attemptAnswer.deleteMany({
      where: { attemptId: result.body.attempt.id },
    });
    await prisma.attemptQuestionSnapshot.deleteMany({
      where: { attemptId: result.body.attempt.id },
    });
    await prisma.attempt.delete({ where: { id: result.body.attempt.id } });
    expect((await avatar()).selection.itemId).toBe("primeiro-passo");
    expect(
      (await avatar()).items.find(
        (item: { id: string }) => item.id === "primeiro-passo",
      ).owned,
    ).toBe(true);
    expect(earned(await achievements())).toContain("FIRST_QUIZ");
  });
});

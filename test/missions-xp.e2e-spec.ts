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
describe("Weekly missions and atomic quiz XP (Nest + PostgreSQL)", () => {
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
  async function count(table: string) {
    const rows = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT count(*)::integer AS count FROM "${table}"`,
    );
    return rows[0].count;
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

  it("persists one award and an identical result across concurrent finishes and later reads", async () => {
    const q = await quiz();
    const id = await ready(q);
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => finish(id).expect(201)),
    );
    const canonical = responses[0].body;
    responses.forEach((r) => expect(r.body).toEqual(canonical));
    expect(canonical.reward).toEqual({
      xpAwarded: 10,
      reason: "AWARDED",
      day: "2026-10-12",
    });
    jest.setSystemTime(new Date("2026-10-13T04:00:00Z"));
    expect((await finish(id).expect(201)).body).toEqual(canonical);
    expect(
      (await http("get", `/attempts/${id}/result`).expect(200)).body,
    ).toEqual(canonical);
    expect(await count("XpEvent")).toBe(1);
    expect(await count("QuizCompletionReward")).toBe(1);
    expect((await home()).xp).toMatchObject({
      total: 10,
      today: 0,
      dailyLimit: 50,
      perQuiz: 10,
      day: "2026-10-13",
    });
    safe(canonical);
  });

  it("rewards completion rather than correctness without changing the quiz grade", async () => {
    const id = await ready(await quiz(), student, "A");
    const result = (await finish(id).expect(201)).body;
    expect(result.attempt).toMatchObject({
      score: "0",
      percentage: "0",
      correctCount: 0,
    });
    expect(result.reward.xpAwarded).toBe(10);
  });

  it("does not award an incomplete attempt or let a different account finish it", async () => {
    const q = await quiz();
    const id = (await http("post", `/quizzes/${q.id}/attempts`).expect(201))
      .body.id;
    await finish(id).expect(400);
    await finish(id, outsider).expect(403);
    expect(await count("XpEvent")).toBe(0);
    expect(await count("QuizCompletionReward")).toBe(0);
    expect((await home()).inProgress.id).toBe(id);
  });

  it("does not grant XP retroactively for results completed before this feature", async () => {
    const id = await ready(await quiz());
    await prisma.attempt.update({
      where: { id },
      data: {
        status: "FINISHED",
        finishedAt: new Date(),
        score: 2.5,
        percentage: 100,
        correctCount: 1,
      },
    });
    expect((await finish(id).expect(201)).body.reward).toEqual({
      xpAwarded: 0,
      reason: "LEGACY",
      day: null,
    });
    expect(await count("XpEvent")).toBe(0);
    expect(await count("QuizCompletionReward")).toBe(0);
  });

  it("shares eligibility across a new published version of the same logical quiz", async () => {
    const first = await quiz();
    const initialId = await ready(first);
    await finish(initialId).expect(201);
    const version = (
      await http("post", `/quizzes/${first.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http("patch", `/quizzes/${version.id}/publish`, admin).expect(200);
    const id = await ready(version);
    expect((await finish(id).expect(201)).body.reward).toEqual({
      xpAwarded: 0,
      reason: "ALREADY_REWARDED",
      day: "2026-10-12",
    });
    expect(await count("XpEvent")).toBe(1);
    expect((await home()).xp.total).toBe(10);
  });

  it("keeps the original completed attempt link after a new quiz version is published", async () => {
    const first = await quiz();
    await mission([first.activityKey]);
    const originalAttempt = await ready(first);
    await finish(originalAttempt).expect(201);
    const version = (
      await http("post", `/quizzes/${first.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http("patch", `/quizzes/${version.id}/publish`, admin).expect(200);
    const activity = (await home()).missions[0].activities[0];
    expect(activity).toMatchObject({
      quizId: first.id,
      attemptId: originalAttempt,
      completed: true,
    });
    expect(
      (await http("get", `/attempts/${activity.attemptId}`).expect(200)).body
        .simulationId,
    ).toBe(activity.quizId);
  });

  it("preserves completed progress but offers current practice when the original version is unavailable", async () => {
    const first = await quiz({ title: "Original completed version" });
    await mission([first.activityKey]);
    const originalAttempt = await ready(first);
    await finish(originalAttempt).expect(201);
    const version = (
      await http("post", `/quizzes/${first.id}/versions`, admin).expect(201)
    ).body as Quiz;
    await http("patch", `/quizzes/${version.id}`, admin)
      .send({ title: "Current available version" })
      .expect(200);
    await http("patch", `/quizzes/${version.id}/publish`, admin).expect(200);
    await prisma.simulation.update({
      where: { id: first.id },
      data: { deletedAt: new Date() },
    });
    const state = await home();
    expect(state.missions[0]).toMatchObject({
      status: "COMPLETED",
      completedActivities: 1,
    });
    expect(state.missions[0].activities[0]).toMatchObject({
      quizId: version.id,
      title: "Current available version",
      attemptId: null,
      completed: true,
    });
    expect(JSON.stringify(state.missions)).not.toContain(
      "Original completed version",
    );
    await http("get", `/attempts/${originalAttempt}/result`).expect(404);
    expect(state.xp.total).toBe(10);
  });

  it("serializes six different simultaneous quiz completions at the 50 XP daily limit", async () => {
    const attempts: string[] = [];
    for (let i = 0; i < 6; i++) attempts.push(await ready(await quiz()));
    const responses = await Promise.all(
      attempts.map((id) => finish(id).expect(201)),
    );
    expect(
      responses.map((r) => r.body.reward.xpAwarded).sort((a, b) => a - b),
    ).toEqual([0, 10, 10, 10, 10, 10]);
    const limited = responses.find((r) => r.body.reward.xpAwarded === 0)!;
    expect(limited.body.reward.reason).toBe("DAILY_LIMIT");
    expect((await finish(limited.body.attempt.id).expect(201)).body).toEqual(
      limited.body,
    );
    expect(await count("XpEvent")).toBe(5);
    expect(await count("QuizCompletionReward")).toBe(6);
    expect((await home()).xp).toMatchObject({ total: 50, today: 50 });
  });

  it("uses São Paulo midnight instead of UTC midnight for daily eligibility", async () => {
    const q = await quiz();
    jest.setSystemTime(new Date("2026-10-12T23:59:59Z"));
    expect(
      (await finish(await ready(q)).expect(201)).body.reward.xpAwarded,
    ).toBe(10);
    jest.setSystemTime(new Date("2026-10-13T00:00:01Z"));
    expect(
      (await finish(await ready(q)).expect(201)).body.reward,
    ).toMatchObject({ xpAwarded: 0, day: "2026-10-12" });
    jest.setSystemTime(new Date("2026-10-13T02:59:59Z"));
    expect(
      (await finish(await ready(q)).expect(201)).body.reward.xpAwarded,
    ).toBe(0);
    jest.setSystemTime(new Date("2026-10-13T03:00:00Z"));
    expect(
      (await finish(await ready(q)).expect(201)).body.reward,
    ).toMatchObject({ xpAwarded: 10, day: "2026-10-13" });
    expect((await home()).xp).toMatchObject({ total: 20, today: 10 });
  });

  it("keeps accounts independent and clears unavailable resume metadata", async () => {
    const q = await quiz({ turmaId });
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    const id = await ready(q);
    expect((await home()).inProgress.id).toBe(id);
    expect((await home(outsider)).inProgress).toBeNull();
    await prisma.turmaMembership.deleteMany({ where: { userId: student.id } });
    expect((await home()).inProgress).toBeNull();
    await finish(id).expect(404);
    expect((await home()).xp.total).toBe(0);
    safe(await home());
  });

  it.each(years)(
    "supports two weekly missions for %s schoolYear %s",
    async (segment, schoolYear) => {
      const q = await quiz({ schoolYear });
      await mission([q.activityKey], { segment, schoolYear, slot: 1 });
      await mission([q.activityKey], {
        segment,
        schoolYear,
        slot: 2,
        title: "Synthetic second mission",
      });
      const result = await home(student, `?schoolYear=${schoolYear}`);
      expect(result.missions).toHaveLength(2);
      expect(
        result.missions.map((m: { schoolYear: number }) => m.schoolYear),
      ).toEqual([schoolYear, schoolYear]);
      expect(result.suggestedQuiz.schoolYear).toBe(schoolYear);
      safe(result);
    },
  );

  it("tracks each step once, restores progress on another request and completes the mission", async () => {
    const one = await quiz();
    const two = await quiz();
    const mid = await mission([one.activityKey, two.activityKey]);
    expect((await home()).missions[0]).toMatchObject({
      id: mid,
      status: "AVAILABLE",
      completedActivities: 0,
      totalActivities: 2,
    });
    const first = await ready(one);
    await finish(first).expect(201);
    const afterFirst = (await home()).missions[0];
    expect(afterFirst).toMatchObject({
      status: "IN_PROGRESS",
      completedActivities: 1,
    });
    expect(afterFirst.activities[0]).toMatchObject({
      completed: true,
      attemptId: first,
    });
    await finish(first).expect(201);
    await finish(await ready(one)).expect(201);
    expect((await home()).missions[0].completedActivities).toBe(1);
    await finish(await ready(two)).expect(201);
    const done = (await http("get", "/me/missions").expect(200)).body[0];
    expect(done).toMatchObject({
      status: "COMPLETED",
      completedActivities: 2,
      totalActivities: 2,
    });
    expect(await count("MissionProgress")).toBe(1);
    expect(await count("MissionActivityCompletion")).toBe(2);
    expect((await home()).xp.total).toBe(20);
  });

  it("credits simultaneous steps and only one completion per mission activity", async () => {
    const quizzes = [await quiz(), await quiz()];
    await mission(quizzes.map((q) => q.activityKey));
    const ids = await Promise.all(quizzes.map((q) => ready(q)));
    await Promise.all(ids.map((id) => finish(id).expect(201)));
    const m = (await home()).missions[0];
    expect(m).toMatchObject({ status: "COMPLETED", completedActivities: 2 });
    await Promise.all(ids.map((id) => finish(id).expect(201)));
    expect(await count("MissionActivityCompletion")).toBe(2);
  });

  it("credits missions even after the quiz has already earned XP that day", async () => {
    const q = await quiz();
    await finish(await ready(q)).expect(201);
    jest.setSystemTime(new Date("2026-10-12T18:01:00Z"));
    await mission([q.activityKey]);
    expect((await home()).missions[0].completedActivities).toBe(0);
    const result = (await finish(await ready(q)).expect(201)).body;
    expect(result.reward.reason).toBe("ALREADY_REWARDED");
    expect((await home()).missions[0].status).toBe("COMPLETED");
    expect((await home()).xp.total).toBe(10);
  });

  it("starts the weekly window Monday in São Paulo and expires precisely the next Monday", async () => {
    const q = await quiz();
    jest.setSystemTime(new Date("2026-10-12T02:59:59Z"));
    await mission([q.activityKey]);
    expect((await home()).missions).toEqual([]);
    jest.setSystemTime(new Date("2026-10-12T03:00:00Z"));
    expect((await home()).missions[0]).toMatchObject({
      startsAt: "2026-10-12T03:00:00.000Z",
      endsAt: "2026-10-19T03:00:00.000Z",
    });
    jest.setSystemTime(new Date("2026-10-19T02:59:59Z"));
    const id = await ready(q);
    expect((await home()).missions).toHaveLength(1);
    jest.setSystemTime(new Date("2026-10-19T03:00:00Z"));
    await finish(id).expect(201);
    expect((await home()).missions).toEqual([]);
    expect(await count("MissionProgress")).toBe(0);
    expect((await home()).xp.total).toBe(10);
  });

  it("uses saved learning preferences before the profile without granting turma access", async () => {
    const q = await quiz({ schoolYear: 0 });
    await mission([q.activityKey], { segment: "ENFERMAGEM", schoolYear: 0 });
    await http("patch", "/me/learning-preferences")
      .send({ segment: "ENFERMAGEM", schoolYear: 0 })
      .expect(200);
    expect((await home()).missions[0].schoolYear).toBe(0);
    await prisma.studentProfile.deleteMany({ where: { userId: student.id } });
    await http("patch", "/me/learning-preferences")
      .send({ segment: null, schoolYear: null })
      .expect(200);
    const unselected = await home();
    expect(unselected.missions).toEqual([]);
    expect(unselected.suggestedQuiz).toBeNull();
  });

  it("hides the entire mission when any step or group becomes unavailable", async () => {
    const publicQuiz = await quiz();
    const privateQuiz = await quiz({ turmaId });
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    await mission([publicQuiz.activityKey, privateQuiz.activityKey], {
      turmaId,
    });
    expect((await home()).missions).toHaveLength(1);
    expect((await home(outsider)).missions).toEqual([]);
    await http("patch", `/quizzes/${privateQuiz.id}/archive`, admin).expect(
      200,
    );
    expect((await home()).missions).toEqual([]);
    await finish(await ready(publicQuiz)).expect(201);
    expect(await count("MissionProgress")).toBe(0);
  });

  it("revalidates every mission step after a concurrent archive instead of using stale availability", async () => {
    const first = await quiz();
    const second = await quiz();
    await mission([first.activityKey, second.activityKey]);
    const id = await ready(first);
    let announceLock!: () => void;
    let releaseLock!: () => void;
    const locked = new Promise<void>((resolve) => {
      announceLock = resolve;
    });
    const release = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    const archive = prisma.$transaction(
      async (database) => {
        await database.$queryRaw`SELECT "id" FROM "Simulation" WHERE "id" = ${second.id} FOR UPDATE`;
        announceLock();
        await release;
        await database.simulation.update({
          where: { id: second.id },
          data: { status: "ARCHIVED" },
        });
      },
      { timeout: 15000 },
    );
    await locked;
    const completion = finish(id)
      .expect(201)
      .then((response) => response.body);
    try {
      let waiting = false;
      for (let poll = 0; poll < 50; poll++) {
        const rows = await prisma.$queryRaw<
          { count: number }[]
        >`SELECT count(*)::integer AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%Simulation%' AND query LIKE '%FOR SHARE%'`;
        if (rows[0].count > 0) {
          waiting = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      expect(waiting).toBe(true);
    } finally {
      releaseLock();
      await archive;
    }
    const result = await completion;
    expect(result.reward.xpAwarded).toBe(10);
    expect(await count("MissionProgress")).toBe(0);
    expect((await home()).missions).toEqual([]);
  });

  it("lets another mission step start while finish holds the learner reward mutex", async () => {
    const first = await quiz();
    const second = await quiz();
    await mission([first.activityKey, second.activityKey]);
    const firstAttempt = await ready(first);
    const barrier = 7854163;
    let announce!: () => void;
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      announce = resolve;
    });
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION mission_start_fk_barrier() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_advisory_xact_lock(${barrier}); RETURN NEW; END $$`,
    );
    // AFTER trigger sorts after RI_* foreign-key checks, so the real start has
    // already acquired its User KEY SHARE when it reaches this owned barrier.
    const simulationId = second.id.replace(/'/g, "''");
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER zz_mission_start_fk_barrier AFTER INSERT ON "Attempt" FOR EACH ROW WHEN (NEW."simulationId" = '${simulationId}') EXECUTE FUNCTION mission_start_fk_barrier()`,
    );
    const gate = prisma.$transaction(
      async (database) => {
        await database.$queryRaw`SELECT pg_advisory_xact_lock(${barrier}::bigint)::text AS locked`;
        announce();
        await released;
      },
      { timeout: 15000 },
    );
    await held;
    const started = http("post", `/quizzes/${second.id}/attempts`)
      .expect(201)
      .then((response) => response.body);
    let completed: Promise<Record<string, unknown>> | undefined;
    try {
      let startWaiting = false;
      for (let poll = 0; poll < 50; poll++) {
        const rows = await prisma.$queryRaw<
          { count: number }[]
        >`SELECT count(*)::integer AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%INSERT%' AND query LIKE '%Attempt%'`;
        if (rows[0].count > 0) {
          startWaiting = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      expect(startWaiting).toBe(true);
      completed = finish(firstAttempt)
        .expect(201)
        .then((response) => response.body as Record<string, unknown>);
      let finishWaitingOnActivity = false;
      for (let poll = 0; poll < 50; poll++) {
        const rows = await prisma.$queryRaw<
          { count: number }[]
        >`SELECT count(*)::integer AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%Simulation%' AND query LIKE '%FOR SHARE%'`;
        if (rows[0].count > 0) {
          finishWaitingOnActivity = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      expect(finishWaitingOnActivity).toBe(true);
    } finally {
      release();
      await gate;
      await Promise.allSettled([started, ...(completed ? [completed] : [])]);
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER IF EXISTS zz_mission_start_fk_barrier ON "Attempt"',
      );
      await prisma.$executeRawUnsafe(
        "DROP FUNCTION IF EXISTS mission_start_fk_barrier()",
      );
    }
    const [newAttempt, result] = await Promise.all([started, completed!]);
    expect(newAttempt).toMatchObject({
      status: "IN_PROGRESS",
      simulationId: second.id,
    });
    expect(result).toMatchObject({
      reward: { xpAwarded: 10 },
      attempt: { status: "FINISHED" },
    });
    expect((await home()).missions[0]).toMatchObject({
      status: "IN_PROGRESS",
      completedActivities: 1,
    });
  });

  it("allows draft curation and replacement but refuses to publish unavailable content", async () => {
    const draft = await quiz({}, false);
    const mid = await mission([draft.activityKey], {}, false);
    await http("patch", `/missions/${mid}/publish`, admin).expect(400);
    expect((await home()).missions).toEqual([]);
    const available = await quiz();
    await http("patch", `/missions/${mid}`, admin)
      .send({ activityKeys: [available.activityKey] })
      .expect(200);
    await http("patch", `/missions/${mid}/publish`, admin).expect(200);
    await http("patch", `/missions/${mid}`, admin)
      .send({ title: "Different published content" })
      .expect(409);
  });

  it("allows exactly one published mission per weekly slot under concurrent publication", async () => {
    const q = await quiz();
    const ids = [
      await mission([q.activityKey], {}, false),
      await mission([q.activityKey], {}, false),
    ];
    const responses = await Promise.all(
      ids.map((id) => http("patch", `/missions/${id}/publish`, admin)),
    );
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await home()).missions).toHaveLength(1);
    const publishedId = responses.find((r) => r.status === 200)!.body
      .id as string;
    await http("patch", `/missions/${publishedId}/archive`, admin).expect(200);
    const replacementId = ids.find((id) => id !== publishedId)!;
    await http("patch", `/missions/${replacementId}/publish`, admin).expect(
      200,
    );
    expect((await home()).missions[0].id).toBe(replacementId);
  });

  it("rejects a public mission that references private turma content", async () => {
    const q = await quiz({ turmaId });
    await http("post", "/missions", admin)
      .send(missionPayload([q.activityKey]))
      .expect(400);
  });

  it.each([
    { weekStart: "2026-10-13" },
    { weekStart: "2026-02-30" },
    { weekStart: "2026-10-12T00:00:00Z" },
    { segment: "INFANTIL", schoolYear: 3 },
    { schoolYear: 13 },
    { slot: 3 },
    { slot: null },
    { activityKeys: [] },
    { activityKeys: ["duplicate", "duplicate"] },
    { userId: "someone-else" },
  ])("rejects invalid curation payload %j", async (overrides) => {
    const q = await quiz();
    await http("post", "/missions", admin)
      .send(missionPayload([q.activityKey], overrides))
      .expect(400);
  });

  it("protects personal endpoints, admin authoring and inactive accounts", async () => {
    await request(app.getHttpServer()).get("/me/learning-home").expect(401);
    await http("get", "/me/learning-home", teacher).expect(403);
    await http("get", "/missions", student).expect(403);
    await http("post", "/missions")
      .send(missionPayload(["some-key"]))
      .expect(403);
    await http("get", "/me/learning-home?schoolYear=13").expect(400);
    await http("get", "/me/learning-home?userId=another").expect(400);
    await prisma.user.update({
      where: { id: student.id },
      data: { status: "BLOCKED" },
    });
    expect((await http("get", "/me/learning-home")).status).toBe(401);
  });

  it.each(["XpEvent", "QuizCompletionReward", "MissionActivityCompletion"])(
    "rolls back attempt, XP and progress when %s persistence fails",
    async (table) => {
      const q = await quiz();
      await mission([q.activityKey]);
      const id = await ready(q);
      const before = await prisma.attempt.findUniqueOrThrow({ where: { id } });
      await prisma.$executeRawUnsafe(
        "CREATE FUNCTION reject_mission_xp_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic reward persistence failure'; END $$",
      );
      await prisma.$executeRawUnsafe(
        `CREATE TRIGGER reject_mission_xp_write BEFORE INSERT ON "${table}" FOR EACH ROW EXECUTE FUNCTION reject_mission_xp_write()`,
      );
      try {
        await finish(id).expect(500);
        expect(
          await prisma.attempt.findUniqueOrThrow({ where: { id } }),
        ).toEqual(before);
        expect(await count("XpEvent")).toBe(0);
        expect(await count("QuizCompletionReward")).toBe(0);
        expect(await count("MissionProgress")).toBe(0);
        expect(await count("MissionActivityCompletion")).toBe(0);
      } finally {
        await prisma.$executeRawUnsafe(
          `DROP TRIGGER IF EXISTS reject_mission_xp_write ON "${table}"`,
        );
        await prisma.$executeRawUnsafe(
          "DROP FUNCTION IF EXISTS reject_mission_xp_write()",
        );
      }
      expect((await finish(id).expect(201)).body.reward.xpAwarded).toBe(10);
      expect((await home()).missions[0].status).toBe("COMPLETED");
    },
  );
});

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { getSimulationSlug } from "../prisma/seed-inventory";
import { randomUUID } from "node:crypto";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  ActivityKind,
  AttemptStatus,
  QuestionType,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";
import * as request from "supertest";
import { PrismaService } from "../src/database/prisma/prisma.service";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Session {
  id: string;
  accessToken: string;
}

function expectNoPrivateContent(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(expectNoPrivateContent);
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of [
    "passwordHash",
    "tokenHash",
    "correctAnswer",
    "answerKey",
    "answerValue",
    "officialAnswers",
    "questionSnapshots",
    "snapshots",
    "explanation",
    "funFact",
    "media",
  ]) {
    expect(record).not.toHaveProperty(key);
  }
  Object.values(record).forEach(expectNoPrivateContent);
}

// Real routes, guards, validation, transactions and persisted snapshots.
describe("Quiz versions and snapshots over HTTP (real Nest + PostgreSQL)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;
  let passwordHash: string;
  const password = "Synthetic-quiz-password-123";

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = "test";
    process.env.RATE_LIMIT_MAX = "10000";
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
        data: { name: "Quiz synthetic math", slug: "matematica" },
      })
    ).id;
    turmaId = (
      await prisma.turma.create({
        data: {
          name: "Synthetic quiz turma",
          slug: "quiz-turma",
          schoolYear: 3,
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
        status: "ACTIVE",
        ...(role === UserRole.STUDENT
          ? { studentProfile: { create: { schoolYear: 3 } } }
          : {}),
      },
    });
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password })
      .expect(200);
    return { id: user.id, accessToken: response.body.accessToken };
  }
  function http(
    method: "get" | "post" | "patch" | "delete",
    path: string,
    user = student,
  ) {
    return request(app.getHttpServer())
      [method](path)
      .set("Authorization", `Bearer ${user.accessToken}`);
  }
  function quizPayload(overrides: Record<string, unknown> = {}) {
    return {
      activityKey: `synthetic-${randomUUID()}`,
      title: "Quiz de quantidades",
      topic: "Quantidades",
      schoolYear: 3,
      disciplineId,
      questions: [
        {
          originKey: "quantity.one",
          statement: "Quanto é um mais um?",
          explanation: "Somamos uma unidade com outra: duas unidades.",
          funFact: "Curiosidade reservada ao feedback.",
          tip: "Conte as unidades.",
          points: 1.5,
          options: [
            { optionKey: "A", text: "Uma unidade" },
            { optionKey: "B", text: "Duas unidades" },
          ],
          correctAnswer: "B",
        },
        {
          originKey: "quantity.two",
          statement: "Qual alternativa representa três?",
          explanation: "Três vem depois de dois.",
          points: 2.25,
          options: [
            { optionKey: "A", text: "Três" },
            { optionKey: "B", text: "Dois" },
          ],
          correctAnswer: "A",
        },
      ],
      ...overrides,
    };
  }
  async function createQuiz(overrides: Record<string, unknown> = {}) {
    return (
      await http("post", "/quizzes", admin)
        .send(quizPayload(overrides))
        .expect(201)
    ).body;
  }
  async function publish(id: string) {
    return http("patch", `/quizzes/${id}/publish`, admin).expect(200);
  }
  async function start(id: string, user = student) {
    return http("post", `/quizzes/${id}/attempts`, user).expect(201);
  }

  it("protects admin authoring, draft content and unknown DTO fields", async () => {
    await request(app.getHttpServer()).get("/quizzes/available").expect(401);
    await http("post", "/quizzes").send(quizPayload()).expect(403);
    await http("post", "/quizzes", teacher).send(quizPayload()).expect(403);
    await http("post", "/quizzes", admin)
      .send(quizPayload({ bimester: 1 }))
      .expect(400);
    const quiz = await createQuiz();
    expect((await http("get", "/quizzes/available").expect(200)).body).toEqual(
      [],
    );
    await http("get", `/quizzes/${quiz.id}`).expect(403);
    await http("post", `/quizzes/${quiz.id}/attempts`).expect(404);
    await http("post", `/simulations/${quiz.id}/attempts`).expect(404);
    expect(await prisma.attempt.count()).toBe(0);
  });

  it.each([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])(
    "supports existing audience sentinel/year %s without artificial bimestre",
    async (schoolYear) => {
      const quiz = await createQuiz({ schoolYear });
      expect(quiz).toMatchObject({
        schoolYear,
        activityKind: "QUIZ",
        contentVersion: 1,
      });
      const saved = await prisma.simulation.findUniqueOrThrow({
        where: { id: quiz.id },
      });
      expect(saved.bimester).toBeNull();
      expect(saved.assessment).toBeNull();
      await publish(quiz.id);
      const catalog = await http(
        "get",
        `/quizzes/available?schoolYear=${schoolYear}`,
      ).expect(200);
      expect(catalog.body).toHaveLength(1);
      expect(catalog.body[0].id).toBe(quiz.id);
      expectNoPrivateContent(catalog.body);
    },
  );

  it("validates pedagogical content and totals before creating any draft", async () => {
    const payload = quizPayload();
    for (const questions of [
      [{ ...payload.questions[0], explanation: "   " }],
      [{ ...payload.questions[0], correctAnswer: "C" }],
      [
        payload.questions[0],
        { ...payload.questions[1], originKey: payload.questions[0].originKey },
      ],
      [
        {
          ...payload.questions[0],
          options: [
            { optionKey: "A", text: "Um" },
            { optionKey: "a", text: "Dois" },
          ],
        },
      ],
      [
        {
          ...payload.questions[0],
          media: { url: "https://example.test/private" },
        },
      ],
      [
        { ...payload.questions[0], points: 9999.99 },
        { ...payload.questions[1], points: 1 },
      ],
    ]) {
      await http("post", "/quizzes", admin)
        .send({ ...payload, questions })
        .expect(400);
    }
    expect(await prisma.simulation.count()).toBe(0);
    const quiz = await createQuiz();
    expect(Number(quiz.maxScore)).toBe(3.75);
    expect(quiz.totalQuestions).toBe(2);
    expect(quiz.questions).toHaveLength(2);
    expect(JSON.stringify(quiz)).not.toContain("correctAnswer");
    expect(JSON.stringify(quiz)).not.toContain("officialAnswers");
  });

  it("allows draft replacement, prohibits null required patches and makes published content immutable", async () => {
    const quiz = await createQuiz();
    await http("patch", `/quizzes/${quiz.id}`, admin)
      .send({ title: null })
      .expect(400);
    await http("patch", `/quizzes/${quiz.id}`, admin)
      .send({ questions: null })
      .expect(400);
    const changed = await http("patch", `/quizzes/${quiz.id}`, admin)
      .send({ questions: [quizPayload().questions[1]] })
      .expect(200);
    expect(changed.body.totalQuestions).toBe(1);
    expect(Number(changed.body.maxScore)).toBe(2.25);
    await publish(quiz.id);
    await http("patch", `/quizzes/${quiz.id}`, admin)
      .send({ title: "Novo título" })
      .expect(409);
    await http("patch", `/quizzes/${quiz.id}/archive`, admin).expect(200);
    await http("patch", `/quizzes/${quiz.id}`, admin)
      .send({ title: "Novo título" })
      .expect(409);
    await http("patch", `/quizzes/${quiz.id}/publish`, admin).expect(409);
  });

  it("allocates distinct consecutive versions under concurrency and publishes only newest catalog metadata", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const clones = await Promise.all(
      Array.from({ length: 3 }, () =>
        http("post", `/quizzes/${quiz.id}/versions`, admin).expect(201),
      ),
    );
    expect(clones.map(({ body }) => body.contentVersion).sort()).toEqual([
      2, 3, 4,
    ]);
    for (const clone of clones) {
      expect(clone.body.activityKey).toBe(quiz.activityKey);
      expect(
        clone.body.questions.map((q: { originKey: string }) => q.originKey),
      ).toEqual(["quantity.one", "quantity.two"]);
      expect(clone.body.questions[0].id).not.toBe(quiz.questions[0].id);
    }
    const latest = clones.find(({ body }) => body.contentVersion === 4)!.body;
    await publish(latest.id);
    const available = await http("get", "/quizzes/available").expect(200);
    expect(available.body.map((q: { id: string }) => q.id)).toEqual([
      latest.id,
    ]);
    const original = await start(quiz.id);
    expect(original.body.contentVersion).toBe(1);
  });

  it("shares one open attempt and one atomic set of private snapshots for concurrent starts", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const responses = await Promise.all(
      Array.from({ length: 8 }, () => start(quiz.id)),
    );
    expect(new Set(responses.map(({ body }) => body.id)).size).toBe(1);
    responses.forEach(({ body }) => expectNoPrivateContent(body));
    const attemptId = responses[0].body.id;
    expect(await prisma.attempt.count()).toBe(1);
    const snapshots = await prisma.attemptQuestionSnapshot.findMany({
      where: { attemptId },
      orderBy: { sortOrder: "asc" },
    });
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0].officialAnswers).toEqual([
      { answerKey: "correctAnswer", answerValue: "B" },
    ]);
    expect(snapshots.map(({ originKey }) => originKey)).toEqual([
      "quantity.one",
      "quantity.two",
    ]);
    expect(Number(responses[0].body.maxScore)).toBe(3.75);
    expect(responses[0].body).toMatchObject({
      activityKey: quiz.activityKey,
      contentVersion: 1,
    });
    const questions = await http(
      "get",
      `/attempts/${attemptId}/questions`,
    ).expect(200);
    expect(questions.body).toHaveLength(2);
    expectNoPrivateContent(questions.body);
    expect(questions.body[0]).toMatchObject({
      id: quiz.questions[0].id,
      statement: quizPayload().questions[0].statement,
      points: "1.5",
      order: 1,
      answer: null,
    });
    expect(
      questions.body[0].options.map((o: { optionKey: string }) => o.optionKey),
    ).toEqual(["A", "B"]);
    await http("get", `/attempts/${attemptId}/questions`, outsider).expect(403);
    expectNoPrivateContent(
      (await http("get", `/attempts/${attemptId}`, admin).expect(200)).body,
    );
  });

  it("retains started content and official key despite a new version or direct changes to the live source", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const attempt = (await start(quiz.id)).body;
    const before = (
      await http("get", `/attempts/${attempt.id}/questions`).expect(200)
    ).body;
    const clone = (
      await http("post", `/quizzes/${quiz.id}/versions`, admin).expect(201)
    ).body;
    await http("patch", `/quizzes/${clone.id}`, admin)
      .send({
        questions: [
          {
            ...quizPayload().questions[0],
            statement: "Versão nova",
            correctAnswer: "A",
          },
        ],
      })
      .expect(200);
    await publish(clone.id);
    // Deliberately bypass authoring to prove the attempt reader uses its snapshot.
    await prisma.question.update({
      where: { id: quiz.questions[0].id },
      data: {
        statement: "Fonte alterada externamente",
        points: 99,
        explanation: "Outra explicação",
      },
    });
    await prisma.questionAnswer.updateMany({
      where: { questionId: quiz.questions[0].id },
      data: { answerValue: "A" },
    });
    expect(
      (await http("get", `/attempts/${attempt.id}/questions`).expect(200)).body,
    ).toEqual(before);
    expect((await start(quiz.id)).body.id).toBe(attempt.id);
    const newer = (await start(clone.id)).body;
    expect(newer.id).not.toBe(attempt.id);
    expect(newer.contentVersion).toBe(2);
    const oldKey = await prisma.attemptQuestionSnapshot.findFirstOrThrow({
      where: { attemptId: attempt.id, sortOrder: 1 },
    });
    expect(oldKey.officialAnswers).toEqual([
      { answerKey: "correctAnswer", answerValue: "B" },
    ]);
  });

  it("rejects generic simulation/question mutation paths for quizzes", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    for (const suffix of ["", "/publish", "/archive"]) {
      await http("patch", `/simulations/${quiz.id}${suffix}`, admin)
        .send(suffix ? {} : { title: "Bypass" })
        .expect(404);
    }
    await http("delete", `/simulations/${quiz.id}`, admin).expect(404);
    await http("get", `/simulations/${quiz.id}`, admin).expect(404);
    await http("get", `/simulations/${quiz.id}/questions`, admin).expect(404);
    await http("patch", `/questions/${quiz.questions[0].id}`, admin)
      .send({ statement: "Bypass" })
      .expect(404);
    await http("delete", `/questions/${quiz.questions[0].id}`, admin).expect(
      404,
    );
    await http("post", `/simulations/${quiz.id}/questions`, admin)
      .send({
        type: "MULTIPLE_CHOICE",
        statement: "Bypass",
        points: 1,
        order: 3,
        options: [{ optionKey: "A", text: "Uma", order: 1 }],
        answers: [{ answerKey: "correctAnswer", answerValue: "A" }],
      })
      .expect(404);
  });

  it("allows authorized resume after archive but blocks new starts", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const attempt = (await start(quiz.id)).body;
    await http("patch", `/quizzes/${quiz.id}/archive`, admin).expect(200);
    expect((await http("get", "/quizzes/available").expect(200)).body).toEqual(
      [],
    );
    expect((await start(quiz.id)).body.id).toBe(attempt.id);
    await http("get", `/attempts/${attempt.id}/questions`).expect(200);
    await http("post", `/quizzes/${quiz.id}/attempts`, outsider).expect(404);
  });

  it("enforces membership in both private catalog and resumed snapshots, including teacher catalog", async () => {
    const quiz = await createQuiz({ turmaId });
    await publish(quiz.id);
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    expect(
      (await http("get", "/quizzes/available").expect(200)).body,
    ).toHaveLength(1);
    expect(
      (await http("get", "/quizzes/available", outsider).expect(200)).body,
    ).toEqual([]);
    expect(
      (await http("get", "/quizzes/available", teacher).expect(200)).body,
    ).toEqual([]);
    await http("post", `/quizzes/${quiz.id}/attempts`, outsider).expect(404);
    const attempt = (await start(quiz.id)).body;
    await prisma.turmaMembership.deleteMany({ where: { userId: student.id } });
    await http("get", `/attempts/${attempt.id}/questions`).expect(404);
    await http("post", `/quizzes/${quiz.id}/attempts`).expect(404);
    const history = await http("get", "/me/quiz-attempts").expect(200);
    expect(history.body).toHaveLength(1);
    expectNoPrivateContent(history.body);
  });

  it.each([
    "discipline-inactive",
    "discipline-deleted",
    "turma-deleted",
    "quiz-deleted",
  ])("denies content after %s without losing snapshots", async (condition) => {
    const quiz = await createQuiz({ turmaId });
    await publish(quiz.id);
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    const attempt = (await start(quiz.id)).body;
    if (condition === "discipline-inactive")
      await prisma.discipline.update({
        where: { id: disciplineId },
        data: { isActive: false },
      });
    if (condition === "discipline-deleted")
      await prisma.discipline.update({
        where: { id: disciplineId },
        data: { deletedAt: new Date() },
      });
    if (condition === "turma-deleted")
      await prisma.turma.update({
        where: { id: turmaId },
        data: { deletedAt: new Date() },
      });
    if (condition === "quiz-deleted")
      await http("delete", `/quizzes/${quiz.id}`, admin).expect(204);
    expect((await http("get", "/quizzes/available").expect(200)).body).toEqual(
      [],
    );
    const denied = await http("get", `/attempts/${attempt.id}/questions`);
    expect([403, 404]).toContain(denied.status);
    expect(
      await prisma.attemptQuestionSnapshot.count({
        where: { attemptId: attempt.id },
      }),
    ).toBe(2);
  });

  it("confirms quiz answers while incomplete finish and unfinished result remain unavailable", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const attempt = (await start(quiz.id)).body;
    await http(
      "post",
      `/attempts/${attempt.id}/questions/${quiz.questions[0].id}/answer`,
    )
      .send({ answer: { optionKey: "B" } })
      .expect(201);
    await http("post", `/attempts/${attempt.id}/answers`)
      .send({ questionId: quiz.questions[0].id, answer: { optionKey: "B" } })
      .expect(201);
    await http("post", `/attempts/${attempt.id}/finish`).expect(400);
    await http("get", `/attempts/${attempt.id}/result`).expect(400);
    expect(await prisma.attemptAnswer.count()).toBe(1);
    expect(
      (await prisma.attempt.findUniqueOrThrow({ where: { id: attempt.id } }))
        .status,
    ).toBe(AttemptStatus.IN_PROGRESS);
  });

  it("excludes quizzes from legacy history, scores, performance, errors, admin catalog and turma counts", async () => {
    const quiz = await createQuiz({ turmaId });
    await publish(quiz.id);
    await prisma.turmaMembership.create({
      data: { turmaId, userId: student.id },
    });
    const attempt = (await start(quiz.id)).body;
    // Synthetic finished row checks query isolation independently of task 4.
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "FINISHED",
        score: 3.75,
        percentage: 100,
        finishedAt: new Date(),
      },
    });
    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: quiz.questions[0].id,
        answer: { optionKey: "B" },
        isCorrect: true,
        pointsEarned: 1.5,
      },
    });
    for (const path of [
      "/simulations/available",
      "/simulations",
      "/me/attempts",
      `/students/${student.id}/attempts`,
      "/reports/questions/error-rate",
    ]) {
      const response = await http(
        "get",
        path,
        path === "/simulations" || path.endsWith("error-rate")
          ? admin
          : student,
      ).expect(200);
      expect(response.body).toEqual([]);
    }
    await http(
      "get",
      `/reports/simulations/${quiz.id}/performance`,
      admin,
    ).expect(404);
    const reports = await http(
      "get",
      `/reports/student/${student.id}/summary`,
    ).expect(200);
    expect(reports.body.totalFinishedAttempts).toBe(0);
    expect(
      (
        await http(
          "get",
          `/reports/student/${student.id}/by-discipline`,
        ).expect(200)
      ).body,
    ).toEqual([]);
    const points = await http("get", "/me/pontuacao").expect(200);
    expect(JSON.stringify(points.body)).not.toContain(quiz.title);
    const quizHistory = await http("get", "/me/quiz-attempts").expect(200);
    expect(quizHistory.body).toHaveLength(1);
    expectNoPrivateContent(quizHistory.body);
    const turmas = await http("get", "/turmas", admin).expect(200);
    const turma = turmas.body.find(
      (item: { id: string }) => item.id === turmaId,
    );
    expect(turma._count.simulations).toBe(0);
    expect(points.body).toMatchObject({
      media: 0,
      simulados: 0,
      diasSeguidos: 0,
      melhorSimulado: null,
    });
    const performance = await http(
      "get",
      `/students/${student.id}/performance`,
    ).expect(200);
    expect(performance.body.totalFinishedAttempts).toBe(0);
    const ranking = await http("get", `/me/turmas/${turmaId}/ranking`).expect(
      200,
    );
    expect(ranking.body).toMatchObject({
      totalClassificados: 0,
      meusSimuladosNaTurma: 0,
      minhaPosicao: null,
      podio: [],
    });
  });

  it("rolls back attempt creation if writing the snapshots fails", async () => {
    const quiz = await createQuiz();
    await publish(quiz.id);
    const questionId = quiz.questions[0].id as string;
    expect(questionId).toMatch(/^[a-z0-9]+$/);
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION quiz_snapshot_test_failure() RETURNS trigger LANGUAGE plpgsql AS $body$ BEGIN IF NEW."questionId" = '${questionId}' THEN RAISE EXCEPTION 'synthetic snapshot failure'; END IF; RETURN NEW; END $body$`,
    );
    try {
      await prisma.$executeRawUnsafe(
        'CREATE TRIGGER quiz_snapshot_test_failure BEFORE INSERT ON "AttemptQuestionSnapshot" FOR EACH ROW EXECUTE FUNCTION quiz_snapshot_test_failure()',
      );
      await http("post", `/quizzes/${quiz.id}/attempts`).expect(500);
      expect(await prisma.attempt.count()).toBe(0);
      expect(await prisma.attemptQuestionSnapshot.count()).toBe(0);
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER IF EXISTS quiz_snapshot_test_failure ON "AttemptQuestionSnapshot"',
      );
      await prisma.$executeRawUnsafe(
        "DROP FUNCTION quiz_snapshot_test_failure()",
      );
    }
    await start(quiz.id);
  });

  it("refuses simulation seed collisions before writing users, disciplines or content", async () => {
    const quiz = await createQuiz();
    const slug = getSimulationSlug({
      disciplineSlug: "matematica",
      schoolYear: 1,
      bimester: 1,
      assessment: "AV1",
    });
    await prisma.simulation.update({ where: { id: quiz.id }, data: { slug } });
    const usersBefore = await prisma.user.count();
    const run = spawnSync(
      process.execPath,
      [
        resolve("node_modules/ts-node/dist/bin.js"),
        "--transpile-only",
        "prisma/seed.ts",
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          SEED_DRY_RUN: "false",
          SEED_INVENTORY: "false",
        },
        encoding: "utf8",
        timeout: 20000,
      },
    );
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("Seed de simulados bloqueado");
    expect(await prisma.user.count()).toBe(usersBefore);
    expect(await prisma.discipline.count()).toBe(1);
    expect(await prisma.simulation.count()).toBe(1);
    expect(await prisma.question.count()).toBe(2);
  }, 30000);

  it("serializes existing simulation starts too, without adding quiz snapshots", async () => {
    const simulation = await prisma.simulation.create({
      data: {
        title: "Synthetic simulation",
        slug: "synthetic-legacy",
        activityKind: ActivityKind.SIMULATION,
        schoolYear: 3,
        bimester: 1,
        assessment: "AV1",
        disciplineId,
        createdById: admin.id,
        status: "PUBLISHED",
        totalQuestions: 1,
        maxScore: 1,
        questions: {
          create: {
            type: QuestionType.MULTIPLE_CHOICE,
            statement: "Legacy question",
            points: 1,
            sortOrder: 1,
          },
        },
      },
    });
    const attempts = await Promise.all(
      Array.from({ length: 6 }, () =>
        http("post", `/simulations/${simulation.id}/attempts`).expect(201),
      ),
    );
    expect(new Set(attempts.map(({ body }) => body.id)).size).toBe(1);
    expect(await prisma.attemptQuestionSnapshot.count()).toBe(0);
  });
});

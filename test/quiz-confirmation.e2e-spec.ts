import { randomUUID } from "node:crypto";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AttemptStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import * as request from "supertest";
import { PrismaService } from "../src/database/prisma/prisma.service";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Session {
  id: string;
  accessToken: string;
}
interface QuizQuestion {
  id: string;
  originKey: string;
}
interface Quiz {
  id: string;
  activityKey: string;
  questions: QuizQuestion[];
}
interface Attempt {
  id: string;
  status: string;
  maxScore: string;
}
interface Fixture {
  quiz: Quiz;
  attempt: Attempt;
  first: string;
  second: string;
}

function expectNoOfficialContent(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(expectNoOfficialContent);
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
    "media",
  ])
    expect(record).not.toHaveProperty(key);
  Object.values(record).forEach(expectNoOfficialContent);
}

// These cases cross real guards, DTO validation and PostgreSQL transactions.
// The integration runner gives this suite an empty, disposable database only.
describe("Quiz confirmation and saved results (real Nest + PostgreSQL)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Session;
  let student: Session;
  let outsider: Session;
  let teacher: Session;
  let disciplineId: string;
  let turmaId: string;
  let passwordHash: string;
  const password = "Synthetic-confirmation-password-123";
  const firstExplanation = "Uma unidade mais outra unidade resulta em duas.";
  const secondExplanation = "Três vem imediatamente depois de dois.";
  const firstFunFact = "Curiosidade disponível depois de confirmar.";

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
        data: { name: "Synthetic confirmation math", slug: "matematica" },
      })
    ).id;
    turmaId = (
      await prisma.turma.create({
        data: {
          name: "Synthetic confirmation turma",
          slug: "quiz-confirmation",
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
    return { id: user.id, accessToken: response.body.accessToken as string };
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
  function payload(overrides: Record<string, unknown> = {}) {
    return {
      activityKey: `confirmation-${randomUUID()}`,
      title: "Quiz de quantidades",
      topic: "Quantidades",
      schoolYear: 3,
      disciplineId,
      questions: [
        {
          originKey: "quantity.one",
          statement: "Quanto é um mais um?",
          explanation: firstExplanation,
          funFact: firstFunFact,
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
          explanation: secondExplanation,
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
  async function fixture(
    overrides: Record<string, unknown> = {},
  ): Promise<Fixture> {
    const quiz = (
      await http("post", "/quizzes", admin).send(payload(overrides)).expect(201)
    ).body as Quiz;
    await http("patch", `/quizzes/${quiz.id}/publish`, admin).expect(200);
    const attempt = (
      await http("post", `/quizzes/${quiz.id}/attempts`).expect(201)
    ).body as Attempt;
    return {
      quiz,
      attempt,
      first: quiz.questions[0].id,
      second: quiz.questions[1].id,
    };
  }
  function confirm(
    attemptId: string,
    questionId: string,
    answer: Record<string, unknown>,
    user = student,
  ) {
    return http(
      "post",
      `/attempts/${attemptId}/questions/${questionId}/answer`,
      user,
    ).send({ answer });
  }
  async function confirmAll(f: Fixture) {
    await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201);
    await confirm(f.attempt.id, f.second, { optionKey: "A" }).expect(201);
  }
  function assertUntouchedQuestion(question: Record<string, unknown>) {
    expect(question).toMatchObject({
      answer: null,
      confirmedAt: null,
      feedback: null,
    });
    expect(question).not.toHaveProperty("explanation");
    expect(question).not.toHaveProperty("funFact");
    expectNoOfficialContent(question);
  }

  it("returns feedback only for the confirmed question and restores the canonical answer on reload", async () => {
    const f = await fixture();
    const initial = await http(
      "get",
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    initial.body.forEach(assertUntouchedQuestion);
    expect(JSON.stringify(initial.body)).not.toContain(firstExplanation);
    expect(JSON.stringify(initial.body)).not.toContain(secondExplanation);
    const correct = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    expect(correct.body).toMatchObject({
      attemptId: f.attempt.id,
      questionId: f.first,
      answer: { optionKey: "B" },
      feedback: {
        isCorrect: true,
        pointsEarned: 1.5,
        explanation: firstExplanation,
        funFact: firstFunFact,
      },
    });
    expect(new Date(correct.body.confirmedAt).toISOString()).toBe(
      correct.body.confirmedAt,
    );
    expectNoOfficialContent(correct.body);
    expect(JSON.stringify(correct.body)).not.toContain(secondExplanation);
    const reload = await http(
      "get",
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    expect(reload.body[0]).toMatchObject({
      answer: { optionKey: "B" },
      confirmedAt: correct.body.confirmedAt,
      feedback: correct.body.feedback,
    });
    assertUntouchedQuestion(reload.body[1]);
    const wrong = await confirm(f.attempt.id, f.second, {
      optionKey: "B",
    }).expect(201);
    expect(wrong.body.feedback).toEqual({
      isCorrect: false,
      pointsEarned: 0,
      explanation: secondExplanation,
      funFact: null,
    });
    const persisted = await prisma.attemptAnswer.findUniqueOrThrow({
      where: {
        attemptId_questionId: { attemptId: f.attempt.id, questionId: f.first },
      },
    });
    expect(persisted.confirmedAt!.toISOString()).toBe(correct.body.confirmedAt);
    expect(persisted.feedback).toEqual(correct.body.feedback);
    expect(Number(persisted.pointsEarned)).toBe(1.5);
    expectNoOfficialContent(
      (await http("get", "/me/quiz-attempts").expect(200)).body,
    );
  });

  it("rejects unknown choices, maps, nonstrings, empty, ambiguous and extra input without saving anything", async () => {
    const f = await fixture();
    for (const answer of [
      {},
      { optionKey: "C" },
      { optionKey: "" },
      { optionKey: "  " },
      { optionKey: 1 },
      { optionKey: null },
      { optionKey: true },
      { optionKey: ["B"] },
      { optionKey: { value: "B" } },
      { options: ["B"] },
      { questionOne: "B" },
      { optionKey: "B", value: "B" },
      { optionKey: "B", extra: "value" },
      { selectedOption: { optionKey: "B" } },
    ])
      await confirm(f.attempt.id, f.first, answer).expect(400);
    for (const body of [
      {},
      { answer: null },
      { answer: [] },
      { answer: "B" },
      { answer: { optionKey: "B" }, extra: true },
    ]) {
      await http(
        "post",
        `/attempts/${f.attempt.id}/questions/${f.first}/answer`,
      )
        .send(body)
        .expect(400);
    }
    expect(await prisma.attemptAnswer.count()).toBe(0);
    (
      await http("get", `/attempts/${f.attempt.id}/questions`).expect(200)
    ).body.forEach(assertUntouchedQuestion);
  });

  it("does not let a question from a different quiz or attempt be confirmed", async () => {
    const f = await fixture();
    const other = await fixture();
    await confirm(f.attempt.id, other.first, { optionKey: "B" }).expect(404);
    await confirm(f.attempt.id, "missing-question", { optionKey: "B" }).expect(
      404,
    );
    await confirm("missing-attempt", f.first, { optionKey: "B" }).expect(404);
    expect(await prisma.attemptAnswer.count()).toBe(0);
  });

  it("replays equivalent scalar shapes and the route alias with the same saved feedback and timestamp", async () => {
    const f = await fixture();
    const original = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    await prisma.attemptQuestionSnapshot.updateMany({
      where: { attemptId: f.attempt.id, questionId: f.first },
      data: {
        explanation: "Changed outside normal authoring",
        funFact: "Changed outside normal authoring",
      },
    });
    await prisma.attemptAnswer.updateMany({
      where: { attemptId: f.attempt.id, questionId: f.first },
      data: {
        feedback: {
          ...original.body.feedback,
          correctAnswer: "PRIVATE_SENTINEL",
          metadata: { officialAnswers: ["PRIVATE_SENTINEL"] },
        },
      },
    });
    for (const answer of [
      { optionKey: " b " },
      { value: "B" },
      { answer: "b" },
      { selectedOption: " B " },
    ])
      expect(
        (await confirm(f.attempt.id, f.first, answer).expect(201)).body,
      ).toEqual(original.body);
    const alias = await http("post", `/attempts/${f.attempt.id}/answers`)
      .send({ questionId: f.first, answer: { optionKey: " b " } })
      .expect(201);
    expect(alias.body).toEqual(original.body);
    const reload = await http(
      "get",
      `/attempts/${f.attempt.id}/questions`,
    ).expect(200);
    expect(reload.body[0].feedback).toEqual(original.body.feedback);
    expect(await prisma.attemptAnswer.count()).toBe(1);
  });

  it("blocks changing an already confirmed answer without changing persisted feedback", async () => {
    const f = await fixture();
    const original = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    await confirm(f.attempt.id, f.first, { optionKey: "A" }).expect(409);
    await http("post", `/attempts/${f.attempt.id}/answers`)
      .send({ questionId: f.first, answer: { value: "A" } })
      .expect(409);
    expect(
      (await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201))
        .body,
    ).toEqual(original.body);
    expect(await prisma.attemptAnswer.count()).toBe(1);
  });

  it("serializes concurrent equivalent confirmations into one row and one feedback", async () => {
    const f = await fixture();
    const responses = await Promise.all(
      Array.from({ length: 8 }, () =>
        confirm(f.attempt.id, f.first, { optionKey: " b " }).expect(201),
      ),
    );
    responses.forEach(({ body }) => expect(body).toEqual(responses[0].body));
    expect(await prisma.attemptAnswer.count()).toBe(1);
  });

  it("accepts exactly one of two concurrently competing choices", async () => {
    const f = await fixture();
    const responses = await Promise.all(
      ["A", "B"].map((optionKey) =>
        confirm(f.attempt.id, f.first, { optionKey }),
      ),
    );
    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409]);
    const winner = responses.find(({ status }) => status === 201)!;
    const row = await prisma.attemptAnswer.findFirstOrThrow();
    expect(row.answer).toEqual(winner.body.answer);
    expect(row.feedback).toEqual(winner.body.feedback);
    expect(await prisma.attemptAnswer.count()).toBe(1);
  });

  it("rejects incomplete finish without changing the attempt or confirmed feedback", async () => {
    const f = await fixture();
    await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201);
    const before = await prisma.attempt.findUniqueOrThrow({
      where: { id: f.attempt.id },
    });
    const answerBefore = await prisma.attemptAnswer.findFirstOrThrow();
    await http("post", `/attempts/${f.attempt.id}/finish`).expect(400);
    await http("get", `/attempts/${f.attempt.id}/result`).expect(400);
    expect(
      await prisma.attempt.findUniqueOrThrow({ where: { id: f.attempt.id } }),
    ).toEqual(before);
    expect(await prisma.attemptAnswer.findFirstOrThrow()).toEqual(answerBefore);
  });

  it("persists totals once and shares the saved result across repeated and concurrent finishes", async () => {
    const f = await fixture();
    const first = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    await confirm(f.attempt.id, f.second, { optionKey: "B" }).expect(201);
    const initialFinishes = await Promise.all(
      Array.from({ length: 6 }, () =>
        http("post", `/attempts/${f.attempt.id}/finish`).expect(201),
      ),
    );
    const finished = initialFinishes[0];
    initialFinishes.forEach(({ body }) => expect(body).toEqual(finished.body));
    expect(finished.body.attempt).toMatchObject({
      status: "FINISHED",
      score: "1.5",
      maxScore: "3.75",
      percentage: "40",
      correctCount: 1,
      wrongCount: 1,
    });
    expect(finished.body.questions).toHaveLength(2);
    expect(finished.body.questions[0]).toMatchObject({
      id: f.first,
      feedback: first.body.feedback,
      isCorrect: true,
      pointsEarned: 1.5,
    });
    expect(finished.body.questions[1]).toMatchObject({
      isCorrect: false,
      pointsEarned: 0,
    });
    expectNoOfficialContent(finished.body);
    const rowBefore = await prisma.attempt.findUniqueOrThrow({
      where: { id: f.attempt.id },
    });
    const concurrent = await Promise.all(
      Array.from({ length: 6 }, () =>
        http("post", `/attempts/${f.attempt.id}/finish`).expect(201),
      ),
    );
    concurrent.forEach(({ body }) => expect(body).toEqual(finished.body));
    expect(
      (await http("get", `/attempts/${f.attempt.id}/result`).expect(200)).body,
    ).toEqual(finished.body);
    expect(
      await prisma.attempt.findUniqueOrThrow({ where: { id: f.attempt.id } }),
    ).toEqual(rowBefore);
    expect(
      (await confirm(f.attempt.id, f.first, { optionKey: " b " }).expect(201))
        .body,
    ).toEqual(first.body);
    await confirm(f.attempt.id, f.first, { optionKey: "A" }).expect(409);
    expect(await prisma.attemptAnswer.count()).toBe(2);
    const next = await http("post", `/quizzes/${f.quiz.id}/attempts`).expect(
      201,
    );
    expect(next.body.id).not.toBe(f.attempt.id);
    (
      await http("get", `/attempts/${next.body.id}/questions`).expect(200)
    ).body.forEach(assertUntouchedQuestion);
  });

  it("keeps confirmation and finish consistent when the final question races with finish", async () => {
    const f = await fixture();
    await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201);
    const [confirmed, finish] = await Promise.all([
      confirm(f.attempt.id, f.second, { optionKey: "A" }),
      http("post", `/attempts/${f.attempt.id}/finish`),
    ]);
    expect(confirmed.status).toBe(201);
    expect([201, 400]).toContain(finish.status);
    const row = await prisma.attempt.findUniqueOrThrow({
      where: { id: f.attempt.id },
    });
    expect(row.status).toBe(finish.status === 201 ? "FINISHED" : "IN_PROGRESS");
    const final = await http("post", `/attempts/${f.attempt.id}/finish`).expect(
      201,
    );
    expect(final.body.attempt).toMatchObject({
      score: "3.75",
      percentage: "100",
      correctCount: 2,
      wrongCount: 0,
    });
    expect(await prisma.attemptAnswer.count()).toBe(2);
  });

  it.each([
    { points: [99.99, 0.01], score: "99.99", percentage: "99.99" },
    { points: [0.01, 0.02], score: "0.01", percentage: "33.33" },
  ])(
    "preserves decimal scoring and rounds the percentage to two decimals ($percentage)",
    async ({ points, score, percentage }) => {
      const questions = payload().questions.map((question, i) => ({
        ...question,
        points: points[i],
      }));
      const f = await fixture({ questions });
      const confirmed = await confirm(f.attempt.id, f.first, {
        optionKey: "B",
      }).expect(201);
      expect(confirmed.body.feedback.pointsEarned).toBe(points[0]);
      await confirm(f.attempt.id, f.second, { optionKey: "B" }).expect(201);
      const result = await http(
        "post",
        `/attempts/${f.attempt.id}/finish`,
      ).expect(201);
      expect(result.body.attempt).toMatchObject({
        score,
        percentage,
        correctCount: 1,
        wrongCount: 1,
      });
    },
  );

  it("corrects from the started snapshot despite a newer published version and external source changes", async () => {
    const f = await fixture();
    const clone = (
      await http("post", `/quizzes/${f.quiz.id}/versions`, admin).expect(201)
    ).body;
    await http("patch", `/quizzes/${clone.id}`, admin)
      .send({
        questions: payload().questions.map((question) => ({
          ...question,
          explanation: "New version explanation",
          correctAnswer: "A",
        })),
      })
      .expect(200);
    await http("patch", `/quizzes/${clone.id}/publish`, admin).expect(200);
    await prisma.question.update({
      where: { id: f.first },
      data: {
        statement: "Externally changed statement",
        points: 99,
        explanation: "Externally changed explanation",
      },
    });
    await prisma.questionAnswer.updateMany({
      where: { questionId: f.first },
      data: { answerValue: "A" },
    });
    const confirmed = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    expect(confirmed.body.feedback).toEqual({
      isCorrect: true,
      pointsEarned: 1.5,
      explanation: firstExplanation,
      funFact: firstFunFact,
    });
    await confirm(f.attempt.id, f.second, { optionKey: "A" }).expect(201);
    const result = await http(
      "post",
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    expect(result.body.attempt).toMatchObject({
      contentVersion: 1,
      maxScore: "3.75",
      score: "3.75",
      percentage: "100",
    });
    expect(result.body.questions[0].statement).toBe("Quanto é um mais um?");
    expectNoOfficialContent(result.body);
  });

  it("enforces owner and role guards for confirmation, finish, questions and result", async () => {
    const f = await fixture();
    for (const path of [
      `/attempts/${f.attempt.id}/questions`,
      `/attempts/${f.attempt.id}/result`,
    ]) {
      await request(app.getHttpServer()).get(path).expect(401);
      await http("get", path, outsider).expect(403);
      await http("get", path, teacher).expect(403);
    }
    await request(app.getHttpServer())
      .post(`/attempts/${f.attempt.id}/questions/${f.first}/answer`)
      .send({ answer: { optionKey: "B" } })
      .expect(401);
    await confirm(f.attempt.id, f.first, { optionKey: "B" }, outsider).expect(
      403,
    );
    await confirm(f.attempt.id, f.first, { optionKey: "B" }, teacher).expect(
      403,
    );
    await confirm(f.attempt.id, f.first, { optionKey: "B" }, admin).expect(403);
    await http("post", `/attempts/${f.attempt.id}/finish`, outsider).expect(
      403,
    );
    await http("post", `/attempts/${f.attempt.id}/finish`, admin).expect(403);
    await confirmAll(f);
    const read = await http(
      "get",
      `/attempts/${f.attempt.id}/questions`,
      admin,
    ).expect(200);
    expectNoOfficialContent(read.body);
    const result = await http(
      "post",
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    expect(
      (await http("get", `/attempts/${f.attempt.id}/result`, admin).expect(200))
        .body,
    ).toEqual(result.body);
  });

  it("allows confirmation, reload and finish after archive but refuses a new archived attempt", async () => {
    const f = await fixture();
    await http("patch", `/quizzes/${f.quiz.id}/archive`, admin).expect(200);
    await confirmAll(f);
    await http("get", `/attempts/${f.attempt.id}/questions`).expect(200);
    await http("post", `/attempts/${f.attempt.id}/finish`).expect(201);
    await http("get", `/attempts/${f.attempt.id}/result`).expect(200);
    await http("post", `/quizzes/${f.quiz.id}/attempts`).expect(404);
  });

  it.each([
    "membership-revoked",
    "discipline-inactive",
    "discipline-deleted",
    "turma-deleted",
    "quiz-deleted",
  ])(
    "blocks content and mutations after %s while retaining safe personal statistics",
    async (condition) => {
      await prisma.turmaMembership.create({
        data: { turmaId, userId: student.id },
      });
      const f = await fixture({ turmaId });
      await confirmAll(f);
      await http("post", `/attempts/${f.attempt.id}/finish`).expect(201);
      const open = (
        await http("post", `/quizzes/${f.quiz.id}/attempts`).expect(201)
      ).body;
      await confirm(open.id, f.first, { optionKey: "B" }).expect(201);
      if (condition === "membership-revoked")
        await prisma.turmaMembership.deleteMany({
          where: { userId: student.id },
        });
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
        await http("delete", `/quizzes/${f.quiz.id}`, admin).expect(204);
      await confirm(open.id, f.second, { optionKey: "A" }).expect(404);
      await confirm(open.id, f.first, { optionKey: "B" }).expect(404);
      await http("post", `/attempts/${open.id}/finish`).expect(404);
      await http("post", `/attempts/${f.attempt.id}/finish`).expect(404);
      await http("get", `/attempts/${open.id}/questions`).expect(404);
      await http("get", `/attempts/${f.attempt.id}/result`).expect(404);
      const history = await http("get", "/me/quiz-attempts").expect(200);
      expect(history.body).toHaveLength(2);
      expectNoOfficialContent(history.body);
      expect(JSON.stringify(history.body)).not.toContain(firstExplanation);
      expect(JSON.stringify(history.body)).not.toContain(
        "Quanto é um mais um?",
      );
      expect(await prisma.attemptAnswer.count()).toBe(3);
      expect(
        (await prisma.attempt.findUniqueOrThrow({ where: { id: open.id } }))
          .status,
      ).toBe("IN_PROGRESS");
    },
  );

  it.each([AttemptStatus.ABANDONED, AttemptStatus.FINISHED])(
    "refuses first-time confirmation after status becomes %s",
    async (status) => {
      const f = await fixture();
      await prisma.attempt.update({
        where: { id: f.attempt.id },
        data: { status },
      });
      await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(400);
      if (status === AttemptStatus.ABANDONED)
        await http("post", `/attempts/${f.attempt.id}/finish`).expect(400);
      expect(await prisma.attemptAnswer.count()).toBe(0);
    },
  );

  it("rolls back confirmation completely when PostgreSQL rejects the saved answer", async () => {
    const f = await fixture();
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION quiz_confirmation_reject_answer() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic confirmation persistence failure'; END $$`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER quiz_confirmation_reject_answer AFTER INSERT ON "AttemptAnswer" FOR EACH ROW EXECUTE FUNCTION quiz_confirmation_reject_answer()`,
    );
    try {
      await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(500);
      expect(await prisma.attemptAnswer.count()).toBe(0);
      const row = await prisma.attempt.findUniqueOrThrow({
        where: { id: f.attempt.id },
      });
      expect(row.status).toBe("IN_PROGRESS");
      expect(row.score).toBeNull();
    } finally {
      await prisma.$executeRawUnsafe(
        `DROP TRIGGER IF EXISTS quiz_confirmation_reject_answer ON "AttemptAnswer"`,
      );
      await prisma.$executeRawUnsafe(
        `DROP FUNCTION IF EXISTS quiz_confirmation_reject_answer()`,
      );
    }
    await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201);
    expect(await prisma.attemptAnswer.count()).toBe(1);
  });

  it("rolls back the finish status and totals on persistence failure without changing confirmations", async () => {
    const f = await fixture();
    await confirmAll(f);
    const before = await prisma.attempt.findUniqueOrThrow({
      where: { id: f.attempt.id },
    });
    const answersBefore = await prisma.attemptAnswer.findMany({
      orderBy: { id: "asc" },
    });
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION quiz_confirmation_reject_finish() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic finish persistence failure'; END $$`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER quiz_confirmation_reject_finish BEFORE UPDATE ON "Attempt" FOR EACH ROW WHEN (NEW.status = 'FINISHED') EXECUTE FUNCTION quiz_confirmation_reject_finish()`,
    );
    try {
      await http("post", `/attempts/${f.attempt.id}/finish`).expect(500);
      expect(
        await prisma.attempt.findUniqueOrThrow({ where: { id: f.attempt.id } }),
      ).toEqual(before);
      expect(
        await prisma.attemptAnswer.findMany({ orderBy: { id: "asc" } }),
      ).toEqual(answersBefore);
      await http("get", `/attempts/${f.attempt.id}/result`).expect(400);
    } finally {
      await prisma.$executeRawUnsafe(
        `DROP TRIGGER IF EXISTS quiz_confirmation_reject_finish ON "Attempt"`,
      );
      await prisma.$executeRawUnsafe(
        `DROP FUNCTION IF EXISTS quiz_confirmation_reject_finish()`,
      );
    }
    const result = await http(
      "post",
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    expect(result.body.attempt).toMatchObject({
      status: "FINISHED",
      score: "3.75",
      percentage: "100",
    });
    expect(
      await prisma.attemptAnswer.findMany({ orderBy: { id: "asc" } }),
    ).toEqual(answersBefore);
  });

  it("projects snapshot option extras through an allowlist on replay, reload and result", async () => {
    const f = await fixture();
    const confirmed = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    const snapshot = await prisma.attemptQuestionSnapshot.findFirstOrThrow({
      where: { attemptId: f.attempt.id, questionId: f.first },
    });
    const options = snapshot.options as Array<
      Record<string, string | number | null>
    >;
    await prisma.attemptQuestionSnapshot.update({
      where: { id: snapshot.id },
      data: {
        options: options.map((option) => ({
          ...option,
          correctAnswer: "PRIVATE_SENTINEL",
          metadata: { officialAnswers: ["PRIVATE_SENTINEL"] },
        })),
      },
    });
    const replay = await confirm(f.attempt.id, f.first, {
      optionKey: "B",
    }).expect(201);
    expect(replay.body).toEqual(confirmed.body);
    await confirm(f.attempt.id, f.second, { optionKey: "A" }).expect(201);
    const result = await http(
      "post",
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    for (const value of [
      replay.body,
      (await http("get", `/attempts/${f.attempt.id}/questions`).expect(200))
        .body,
      result.body,
      (await http("get", `/attempts/${f.attempt.id}/result`).expect(200)).body,
    ]) {
      expectNoOfficialContent(value);
      expect(JSON.stringify(value)).not.toContain("PRIVATE_SENTINEL");
    }
  });

  it("keeps the completed result byte-for-byte equivalent after archiving its source quiz", async () => {
    const f = await fixture();
    await confirmAll(f);
    const finished = await http(
      "post",
      `/attempts/${f.attempt.id}/finish`,
    ).expect(201);
    await http("patch", `/quizzes/${f.quiz.id}/archive`, admin).expect(200);
    expect(
      (await http("get", `/attempts/${f.attempt.id}/result`).expect(200)).body,
    ).toEqual(finished.body);
    expect(
      (await http("post", `/attempts/${f.attempt.id}/finish`).expect(201)).body,
    ).toEqual(finished.body);
  });

  it("fails closed on malformed stored feedback without exposing official content", async () => {
    const f = await fixture();
    await confirm(f.attempt.id, f.first, { optionKey: "B" }).expect(201);
    await prisma.attemptAnswer.updateMany({
      where: { attemptId: f.attempt.id, questionId: f.first },
      data: {
        feedback: {
          isCorrect: "yes",
          pointsEarned: 1.5,
          explanation: firstExplanation,
          funFact: null,
          correctAnswer: "PRIVATE_SENTINEL",
        },
      },
    });
    for (const response of [
      await http("get", `/attempts/${f.attempt.id}/questions`),
      await confirm(f.attempt.id, f.first, { optionKey: "B" }),
    ]) {
      expect(response.status).toBe(500);
      expect(JSON.stringify(response.body)).not.toContain("PRIVATE_SENTINEL");
      expectNoOfficialContent(response.body);
    }
  });
});

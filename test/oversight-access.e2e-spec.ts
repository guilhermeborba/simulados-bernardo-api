import { randomUUID } from "node:crypto";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as request from "supertest";
import { PrismaService } from "../src/database/prisma/prisma.service";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
interface Account {
  id: string;
  token: string;
}

// Every name, classification and record below exists solely in the disposable test DB.
describe("Readonly oversight and current classroom authorization (Nest + PostgreSQL)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: Account,
    teacher: Account,
    guardian: Account,
    student: Account,
    outsider: Account;
  let disciplineId: string, assignedId: string, privateId: string;
  let guardianLinkId: string;
  let privateQuizId: string, privateSimulationId: string;
  let privateQuestionId: string, privateAttemptId: string;

  async function clean() {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Discipline", "Turma", "AuditLog" CASCADE',
    );
  }
  async function account(role: UserRole): Promise<Account> {
    const user = await prisma.user.create({
      data: {
        name: `Synthetic ${role}`,
        email: `${randomUUID()}@example.test`,
        role,
        status: "ACTIVE",
        passwordHash: "synthetic",
        ...(role === "STUDENT"
          ? { studentProfile: { create: { schoolYear: 3 } } }
          : {}),
      },
    });
    const token = app.get(JwtService).sign(
      { sub: user.id, email: user.email, role, type: "access", authVersion: 0 },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "1h",
      },
    );
    return { id: user.id, token };
  }
  const http = (path: string, user = teacher) =>
    request(app.getHttpServer())
      .get(path)
      .set("Authorization", `Bearer ${user.token}`);
  const mutate = (
    method: "post" | "delete" | "patch",
    path: string,
    user = admin,
  ) =>
    request(app.getHttpServer())
      [method](path)
      .set("Authorization", `Bearer ${user.token}`);

  async function activity(key: string, turmaId: string | null, quiz = true) {
    const row = await prisma.simulation.create({
      data: {
        title: `Synthetic ${key}`,
        slug: `synthetic-${key}`,
        schoolYear: 3,
        disciplineId,
        createdById: admin.id,
        activityKind: quiz ? "QUIZ" : "SIMULATION",
        activityKey: quiz ? key : null,
        contentVersion: quiz ? 1 : null,
        bimester: quiz ? null : 1,
        assessment: quiz ? null : "AV1",
        topic: `Theme ${key}`,
        turmaId,
        status: "PUBLISHED",
        publishedAt: new Date(),
        totalQuestions: 1,
        maxScore: 1,
        questions: {
          create: {
            type: "MULTIPLE_CHOICE",
            originKey: quiz ? "synthetic.origin" : null,
            statement: `Private statement ${key}`,
            explanation: "Synthetic explanation",
            points: 1,
            sortOrder: 1,
            options: {
              create: [
                { optionKey: "A", text: "One", sortOrder: 1 },
                { optionKey: "B", text: "Two", sortOrder: 2 },
              ],
            },
            answers: {
              create: { answerKey: "correctAnswer", answerValue: "B" },
            },
          },
        },
      },
      include: { questions: true },
    });
    const skill = quiz
      ? await prisma.learningSkill.create({
          data: {
            code: `skill.${key}`,
            title: `Skill ${key}`,
            description: "Synthetic classification.",
            schoolYear: 3,
            disciplineId,
            status: "PUBLISHED",
            publishedAt: new Date(),
            reviewedAt: new Date(),
            reviewedBy: admin.id,
          },
        })
      : null;
    if (skill)
      await prisma.questionSkill.create({
        data: { questionId: row.questions[0].id, skillId: skill.id },
      });
    const attempt = await prisma.attempt.create({
      data: {
        studentId: student.id,
        simulationId: row.id,
        activityKey: quiz ? key : null,
        contentVersion: quiz ? 1 : null,
        status: "FINISHED",
        finishedAt: new Date(),
        score: 1,
        maxScore: 1,
        percentage: 100,
        correctCount: 1,
        answers: {
          create: {
            questionId: row.questions[0].id,
            answer: { optionKey: "B" },
            isCorrect: true,
            pointsEarned: 1,
            confirmedAt: new Date(),
            feedback: {
              isCorrect: true,
              pointsEarned: 1,
              explanation: "Synthetic explanation",
              funFact: null,
            },
          },
        },
        ...(skill
          ? {
              questionSnapshots: {
                create: {
                  questionId: row.questions[0].id,
                  originKey: "synthetic.origin",
                  type: "MULTIPLE_CHOICE",
                  statement: `Private statement ${key}`,
                  explanation: "Synthetic explanation",
                  points: 1,
                  sortOrder: 1,
                  options: [
                    { optionKey: "A", text: "One" },
                    { optionKey: "B", text: "Two" },
                  ],
                  officialAnswers: [
                    { answerKey: "correctAnswer", answerValue: "B" },
                  ],
                  skillCode: skill.code,
                  skillVersion: 1,
                  skillTitle: skill.title,
                  skillDisciplineSlug: "matematica",
                  skillSchoolYear: 3,
                },
              },
            }
          : {}),
      },
    });
    return { row, attempt };
  }
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
    await app.listen(0, "127.0.0.1");
    prisma = app.get(PrismaService);
  });
  beforeEach(async () => {
    await clean();
    admin = await account("ADMIN");
    teacher = await account("TEACHER");
    guardian = await account("GUARDIAN");
    student = await account("STUDENT");
    outsider = await account("STUDENT");
    disciplineId = (
      await prisma.discipline.create({
        data: { name: "Synthetic math", slug: "matematica" },
      })
    ).id;
    assignedId = (
      await prisma.turma.create({
        data: {
          name: "Assigned synthetic class",
          slug: "assigned",
          schoolYear: 3,
        },
      })
    ).id;
    privateId = (
      await prisma.turma.create({
        data: {
          name: "Secret synthetic class",
          slug: "private",
          schoolYear: 3,
        },
      })
    ).id;
    await prisma.turmaMembership.createMany({
      data: [
        { userId: student.id, turmaId: assignedId },
        { userId: student.id, turmaId: privateId },
      ],
    });
    guardianLinkId = (
      await prisma.guardianStudent.create({
        data: {
          guardianId: guardian.id,
          studentId: student.id,
          relationship: "Synthetic guardian",
        },
      })
    ).id;
    await mutate("post", `/turmas/${assignedId}/teachers`)
      .send({ teacherId: teacher.id })
      .expect(201);
    await activity("public-quiz", null);
    await activity("assigned-quiz", assignedId);
    const privateQuiz = await activity("secret-quiz", privateId);
    privateQuizId = privateQuiz.row.id;
    privateAttemptId = privateQuiz.attempt.id;
    privateQuestionId = privateQuiz.row.questions[0].id;
    await activity("public-simulation", null, false);
    await activity("assigned-simulation", assignedId, false);
    privateSimulationId = (
      await activity("secret-simulation", privateId, false)
    ).row.id;
  });
  afterAll(async () => {
    if (prisma) await clean();
    await app?.close();
  });

  function privateFields(value: unknown) {
    if (!value || typeof value !== "object") return;
    for (const [key, nested] of Object.entries(value)) {
      expect(
        [
          "passwordHash",
          "email",
          "tokenHash",
          "officialAnswers",
          "answerValue",
          "correctAnswer",
          "accessToken",
          "refreshToken",
          "answer",
          "feedback",
          "guardianId",
        ].includes(key),
      ).toBe(false);
      privateFields(nested);
    }
  }
  it("roster exposes only currently linked active students and assigned group names", async () => {
    const roster = await http("/me/oversight-students").expect(200);
    expect(roster.body).toEqual([
      {
        id: student.id,
        name: "Synthetic STUDENT",
        schoolYear: 3,
        turmas: [
          {
            id: assignedId,
            name: "Assigned synthetic class",
            slug: "assigned",
          },
        ],
      },
    ]);
    privateFields(roster.body);
    for (const user of [guardian, admin]) {
      const value = await http("/me/oversight-students", user).expect(200);
      expect(
        value.body.some((row: { id: string }) => row.id === student.id),
      ).toBe(true);
      privateFields(value.body);
    }
    await http("/me/oversight-students", student).expect(403);
    await request(app.getHttpServer())
      .get("/me/oversight-students")
      .expect(401);
  });
  it("teacher sees public and assigned-class assessments and skills, without metadata from another private group", async () => {
    const summary = await http(`/reports/student/${student.id}/summary`).expect(
      200,
    );
    expect(summary.body.totalFinishedAttempts).toBe(2);
    expect(
      summary.body.lastAttempts.map(
        (row: { simulation: { id: string } }) => row.simulation.id,
      ),
    ).not.toContain(privateSimulationId);
    const disciplines = await http(
      `/reports/student/${student.id}/by-discipline`,
    ).expect(200);
    expect(disciplines.body).toHaveLength(1);
    expect(disciplines.body[0].attempts).toBe(2);
    const progress = await http(
      `/students/${student.id}/learning-progress?schoolYear=3`,
    ).expect(200);
    expect(Object.keys(progress.body).sort()).toEqual([
      "schoolYear",
      "skills",
      "unclassifiedQuestions",
    ]);
    expect(
      progress.body.skills.map((row: { code: string }) => row.code).sort(),
    ).toEqual(["skill.assigned-quiz", "skill.public-quiz"]);
    expect(
      JSON.stringify([summary.body, disciplines.body, progress.body]),
    ).not.toMatch(/secret|Private statement|officialAnswers|answerValue/);
    privateFields(summary.body);
    privateFields(disciplines.body);
    privateFields(progress.body);
    const attempts = await http(`/students/${student.id}/attempts`).expect(200);
    expect(attempts.body).toHaveLength(2);
    expect(JSON.stringify(attempts.body)).not.toContain("secret");
    privateFields(attempts.body);
    const performance = await http(
      `/students/${student.id}/performance`,
    ).expect(200);
    expect(JSON.stringify(performance.body)).not.toContain("secret");
    privateFields(performance.body);
  });
  it("guardian/admin may read linked student records but no role gets student mutation or quiz answers through oversight", async () => {
    for (const user of [guardian, admin]) {
      expect(
        (await http(`/reports/student/${student.id}/summary`, user).expect(200))
          .body.totalFinishedAttempts,
      ).toBe(3);
      const progress = await http(
        `/students/${student.id}/learning-progress?schoolYear=3`,
        user,
      ).expect(200);
      expect(progress.body.skills).toHaveLength(3);
      privateFields(progress.body);
    }
    for (const user of [guardian, teacher]) {
      await mutate("patch", "/students/me", user)
        .send({ schoolYear: 5 })
        .expect(403);
      await mutate("post", `/quizzes/${privateQuizId}/attempts`, user).expect(
        403,
      );
      await mutate(
        "post",
        `/attempts/${privateAttemptId}/questions/${privateQuestionId}/answer`,
        user,
      )
        .send({ answer: { optionKey: "A" } })
        .expect(403);
      await http(`/attempts/${privateAttemptId}/questions`, user).expect(403);
    }
    await http(
      `/students/${outsider.id}/learning-progress?schoolYear=3`,
      guardian,
    ).expect(403);
    await http(`/reports/student/${outsider.id}/summary`, teacher).expect(403);
    await http(
      `/students/${student.id}/learning-progress?schoolYear=99`,
    ).expect(400);
    await http(
      `/students/${student.id}/learning-progress?studentId=${outsider.id}`,
    ).expect(400);
  });
  it("assignment is ADMIN-only, idempotent and requires an active persisted teacher role", async () => {
    await mutate("post", `/turmas/${assignedId}/teachers`, guardian)
      .send({ teacherId: teacher.id })
      .expect(403);
    await mutate("post", `/turmas/${assignedId}/teachers`, teacher)
      .send({ teacherId: teacher.id })
      .expect(403);
    await mutate("post", `/turmas/${assignedId}/teachers`)
      .send({ teacherId: student.id })
      .expect(404);
    await mutate("post", `/turmas/${assignedId}/teachers`)
      .send({ teacherId: teacher.id, studentId: student.id })
      .expect(400);
    await prisma.user.update({
      where: { id: teacher.id },
      data: { status: "INACTIVE" },
    });
    await mutate("post", `/turmas/${privateId}/teachers`)
      .send({ teacherId: teacher.id })
      .expect(404);
    await http("/me/oversight-students").expect(401);
    await prisma.user.update({
      where: { id: teacher.id },
      data: { status: "ACTIVE" },
    });
    await mutate("post", `/turmas/${assignedId}/teachers`)
      .send({ teacherId: teacher.id })
      .expect(201);
    expect(
      await prisma.teacherTurma.count({
        where: { teacherId: teacher.id, turmaId: assignedId },
      }),
    ).toBe(1);
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: "STUDENT" },
    });
    await mutate(
      "delete",
      `/turmas/${assignedId}/teachers/${teacher.id}`,
    ).expect(401);
  });
  it("removing classroom assignment or membership revokes roster and direct student URLs immediately", async () => {
    await mutate(
      "delete",
      `/turmas/${assignedId}/teachers/${teacher.id}`,
    ).expect(204);
    expect((await http("/me/oversight-students").expect(200)).body).toEqual([]);
    await http(`/students/${student.id}/learning-progress?schoolYear=3`).expect(
      403,
    );
    await http(`/reports/student/${student.id}/summary`).expect(403);
    await mutate("post", `/turmas/${assignedId}/teachers`)
      .send({ teacherId: teacher.id })
      .expect(201);
    await prisma.turmaMembership.deleteMany({
      where: { userId: student.id, turmaId: assignedId },
    });
    expect((await http("/me/oversight-students").expect(200)).body).toEqual([]);
    await http(`/reports/student/${student.id}/by-discipline`).expect(403);
  });
  it("removing guardian link or soft-deleting class/student makes prior URLs unavailable", async () => {
    await prisma.guardianStudent.delete({ where: { id: guardianLinkId } });
    expect(
      (await http("/me/oversight-students", guardian).expect(200)).body,
    ).toEqual([]);
    await http(
      `/students/${student.id}/learning-progress?schoolYear=3`,
      guardian,
    ).expect(403);
    await prisma.turma.update({
      where: { id: assignedId },
      data: { deletedAt: new Date() },
    });
    expect((await http("/me/oversight-students").expect(200)).body).toEqual([]);
    await http(`/reports/student/${student.id}/summary`).expect(403);
    await prisma.user.update({
      where: { id: student.id },
      data: { deletedAt: new Date() },
    });
    expect(
      (await http("/me/oversight-students", admin).expect(200)).body.some(
        (row: { id: string }) => row.id === student.id,
      ),
    ).toBe(false);
    await http(
      `/students/${student.id}/learning-progress?schoolYear=3`,
      admin,
    ).expect(404);
  });
  it("persisted account role and auth version supersede roles from an older access token", async () => {
    await prisma.user.update({
      where: { id: teacher.id },
      data: { role: "STUDENT" },
    });
    await http("/me/oversight-students").expect(401);
    await prisma.user.update({
      where: { id: teacher.id },
      data: { role: "TEACHER", authVersion: { increment: 1 } },
    });
    await http("/me/oversight-students").expect(401);
    await http(`/students/${student.id}/learning-progress?schoolYear=3`).expect(
      401,
    );
  });
});

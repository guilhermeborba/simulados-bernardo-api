import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { once } from "node:events";
import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { getStorageToken, ThrottlerStorageService } from "@nestjs/throttler";
import { compare, hash } from "bcryptjs";
import * as request from "supertest";
import { PrismaService } from "../src/database/prisma/prisma.service";
import { AuthService } from "../src/modules/auth/auth.service";
import {
  PasswordRecoveryService,
  RECOVERY_ACCEPTED_MESSAGE,
} from "../src/modules/auth/password-recovery.service";
import { assertTestDatabaseUrl } from "./support/test-database.cjs";

jest.setTimeout(30000);
const databaseUrl = assertTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const password = "Synthetic-original-password-42";
const changedPassword = "Synthetic-changed-password-83";
const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
interface Mail {
  to: string[];
  subject: string;
  text: string;
}

describe("Password recovery transactions and Resend delivery (Nest + PostgreSQL)", () => {
  let app: INestApplication,
    prisma: PrismaService,
    server: Server,
    config: ConfigService;
  let user: { id: string; email: string; passwordHash: string };
  let captured: Mail[] = [];
  let captureFailure: unknown;
  let pauseVerifiedLogin: (() => Promise<void>) | null = null;
  let failDelivery = false,
    failNotification = false;
  let synchronizeLocks = false,
    locks = 0,
    releaseLocks: () => void,
    bothLocks: Promise<void>;
  const envBefore: Record<string, string | undefined> = {};
  beforeAll(async () => {
    for (const key of [
      "DATABASE_URL",
      "NODE_ENV",
      "PASSWORD_RESET_ENABLED",
      "RESEND_API_KEY",
      "MAIL_FROM",
      "RESEND_API_URL",
    ])
      envBefore[key] = process.env[key];
    server = createServer((incoming, response) => {
      void (async () => {
        let raw = "";
        for await (const chunk of incoming) raw += chunk;
        const message = JSON.parse(raw) as Mail;
        captured.push(message);
        expect(
          message.to.every((email) => email.endsWith("@example.test")),
        ).toBe(true);
        expect(incoming.headers["idempotency-key"]).toMatch(
          /^password-(reset|changed)\//,
        );
        response.setHeader("Content-Type", "application/json");
        response.statusCode = (
          message.subject.startsWith("Redefina")
            ? failDelivery
            : failNotification
        )
          ? 503
          : 200;
        // Even malicious provider errors must never be propagated or logged.
        response.end(
          JSON.stringify(
            response.statusCode === 200
              ? { id: "synthetic-delivery" }
              : { recipient: message.to, sensitive: message.text },
          ),
        );
      })().catch((error: unknown) => {
        captureFailure = error;
        response.statusCode = 500;
        response.end("Synthetic capture failed.");
      });
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = "test";
    process.env.PASSWORD_RESET_ENABLED = "true";
    process.env.RESEND_API_KEY = "synthetic-api-key";
    process.env.MAIL_FROM = "synthetic@example.test";
    process.env.RESEND_API_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/emails`;
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
    config = app.get(ConfigService);
    prisma.$use(async (params, next) => {
      if (
        pauseVerifiedLogin &&
        params.model === "User" &&
        params.action === "update" &&
        params.args?.data?.lastLoginAt
      )
        await pauseVerifiedLogin();
      if (
        synchronizeLocks &&
        locks < 2 &&
        params.action === "queryRaw" &&
        JSON.stringify(params.args).includes("User") &&
        JSON.stringify(params.args).includes("FOR NO KEY UPDATE")
      ) {
        locks += 1;
        if (locks === 2) releaseLocks();
        await bothLocks;
      }
      return next(params);
    });
  });
  async function clean() {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "User", "Discipline", "Turma", "AuditLog" CASCADE',
    );
  }
  beforeEach(async () => {
    const throttle = app.get<ThrottlerStorageService>(getStorageToken());
    throttle.onApplicationShutdown();
    throttle.storage.clear();
    await clean();
    captured = [];
    failDelivery = false;
    failNotification = false;
    synchronizeLocks = false;
    pauseVerifiedLogin = null;
    locks = 0;
    bothLocks = new Promise((resolve) => {
      releaseLocks = resolve;
    });
    config.set("PASSWORD_RESET_ENABLED", true);
    user = await prisma.user.create({
      data: {
        name: "Synthetic recovery account",
        email: `recovery-${randomUUID()}@example.test`,
        passwordHash: await hash(password, 4),
        role: "STUDENT",
        status: "ACTIVE",
      },
    });
  });
  afterEach(() => {
    expect(captureFailure).toBeUndefined();
    synchronizeLocks = false;
    releaseLocks();
    jest.restoreAllMocks();
  });
  afterAll(async () => {
    if (prisma) await clean();
    await app?.close();
    if (server)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    for (const [key, value] of Object.entries(envBefore)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  function forgot(email = user.email) {
    return request(app.getHttpServer())
      .post("/auth/forgot-password")
      .send({ email });
  }
  function reset(token: string, replacement = changedPassword) {
    return request(app.getHttpServer())
      .post("/auth/reset-password")
      .send({ token, password: replacement });
  }
  function tokenFrom(
    message = captured.find((row) => row.subject.startsWith("Redefina"))!,
  ) {
    const token = message.text.match(
      /\/redefinir-senha#token=([A-Za-z0-9_-]{43})/,
    )?.[1];
    expect(token).toBeDefined();
    expect(message.text).not.toContain("/redefinir-senha?token=");
    return token!;
  }
  async function deliveredToken() {
    const raw = randomBytes(32).toString("base64url");
    const now = Date.now();
    const row = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(raw),
        createdAt: new Date(now - 120_000),
        expiresAt: new Date(now + 30 * 60_000),
        deliveredAt: new Date(now - 60_000),
      },
    });
    return { raw, row };
  }
  async function session() {
    return app.get(AuthService).login({ email: user.email, password });
  }
  async function unchanged() {
    expect(
      await prisma.user.findUnique({ where: { id: user.id } }),
    ).toMatchObject({ authVersion: 0, passwordHash: user.passwordHash });
    expect(
      await compare(
        password,
        (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
          .passwordHash,
      ),
    ).toBe(true);
  }
  it("returns the same 202 message for active, missing, inactive and deleted accounts; delivery is private and hashed", async () => {
    const inactive = await prisma.user.create({
      data: {
        name: "Synthetic inactive",
        email: "inactive@example.test",
        passwordHash: "synthetic",
        role: "STUDENT",
        status: "INACTIVE",
      },
    });
    const deleted = await prisma.user.create({
      data: {
        name: "Synthetic deleted",
        email: "deleted@example.test",
        passwordHash: "synthetic",
        role: "STUDENT",
        status: "ACTIVE",
        deletedAt: new Date(),
      },
    });
    const accepted = { message: RECOVERY_ACCEPTED_MESSAGE };
    for (const email of [
      user.email,
      "missing@example.test",
      inactive.email,
      deleted.email,
    ]) {
      const response = await forgot(email).expect(202);
      expect(response.body).toEqual(accepted);
      expect(response.headers["set-cookie"]).toBeUndefined();
    }
    expect(captured).toHaveLength(1);
    const raw = tokenFrom();
    const stored = await prisma.passwordResetToken.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      userId: user.id,
      tokenHash: tokenHash(raw),
      usedAt: null,
      deliveredAt: expect.any(Date),
    });
    expect(stored[0].expiresAt.getTime() - stored[0].createdAt.getTime()).toBe(
      30 * 60_000,
    );
    expect(JSON.stringify(stored)).not.toContain(raw);
  });
  it("coalesces concurrent requests and cooldown across service instances through the DB user lock", async () => {
    synchronizeLocks = true;
    const service = app.get(PasswordRecoveryService);
    const results = await Promise.all([
      service.forgotPassword(user.email),
      service.forgotPassword(user.email),
    ]);
    synchronizeLocks = false;
    expect(locks).toBe(2);
    expect(results[0]).toEqual(results[1]);
    expect(captured).toHaveLength(1);
    expect(await prisma.passwordResetToken.count()).toBe(1);
    await forgot().expect(202);
    expect(captured).toHaveLength(1);
    await prisma.passwordResetToken.updateMany({
      data: { createdAt: new Date(Date.now() - 61_000) },
    });
    await forgot().expect(202);
    expect(captured).toHaveLength(2);
    expect(tokenFrom(captured[1])).not.toBe(tokenFrom(captured[0]));
  });
  it("resets once, invalidates every old access/refresh session and sibling reset link, and sends a link-free notification", async () => {
    const first = await session(),
      second = await session();
    const one = await deliveredToken(),
      sibling = await deliveredToken();
    const response = await reset(one.raw).expect(200);
    expect(response.body).toEqual({ success: true });
    expect(response.headers["set-cookie"]).toBeUndefined();
    const current = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(current.authVersion).toBe(1);
    expect(await compare(changedPassword, current.passwordHash)).toBe(true);
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(0);
    expect(
      await prisma.passwordResetToken.count({
        where: { userId: user.id, usedAt: null },
      }),
    ).toBe(0);
    for (const old of [first, second]) {
      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${old.accessToken}`)
        .expect(401);
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: old.refreshToken })
        .expect(401);
    }
    await reset(one.raw).expect(400);
    await reset(sibling.raw).expect(400);
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password })
      .expect(401);
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, password: changedPassword })
      .expect(200);
    expect(captured).toHaveLength(1);
    expect(captured[0].subject).toContain("foi alterada");
    expect(captured[0].text).not.toContain(one.raw);
    expect(captured[0].text).not.toContain("token=");
  });
  it("two concurrently valid links for one account can change the password only once", async () => {
    const one = await deliveredToken(),
      two = await deliveredToken();
    synchronizeLocks = true;
    const service = app.get(PasswordRecoveryService);
    const results = await Promise.allSettled([
      service.resetPassword({ token: one.raw, password: changedPassword }),
      service.resetPassword({
        token: two.raw,
        password: "Synthetic-second-password-62",
      }),
    ]);
    synchronizeLocks = false;
    expect(locks).toBe(2);
    expect(results.filter((row) => row.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((row) => row.status === "rejected")).toHaveLength(1);
    expect(
      await prisma.passwordResetToken.count({ where: { usedAt: null } }),
    ).toBe(0);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .authVersion,
    ).toBe(1);
  });
  it("a refresh racing the reset cannot leave any renewable old session behind", async () => {
    const old = await session(),
      link = await deliveredToken();
    synchronizeLocks = true;
    const [resetResult, refreshResult] = await Promise.allSettled([
      app
        .get(PasswordRecoveryService)
        .resetPassword({ token: link.raw, password: changedPassword }),
      app.get(AuthService).refresh({ refreshToken: old.refreshToken }),
    ]);
    synchronizeLocks = false;
    expect(locks).toBe(2);
    expect(resetResult.status).toBe("fulfilled");
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(0);
    if (refreshResult.status === "fulfilled") {
      await expect(
        app
          .get(AuthService)
          .refresh({ refreshToken: refreshResult.value.refreshToken }),
      ).rejects.toThrow();
      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${refreshResult.value.accessToken}`)
        .expect(401);
    }
    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${old.accessToken}`)
      .expect(401);
  });
  it("a login already verified against the old password cannot create a session after reset commits", async () => {
    const link = await deliveredToken();
    let reachedVerification!: () => void;
    let resumeLogin!: () => void;
    const paused = new Promise<void>((resolve) => {
      reachedVerification = resolve;
    });
    const resume = new Promise<void>((resolve) => {
      resumeLogin = resolve;
    });
    pauseVerifiedLogin = async () => {
      reachedVerification();
      await resume;
    };
    const oldLogin = app
      .get(AuthService)
      .login({ email: user.email, password });
    const settled = oldLogin.then(
      () => "accepted",
      () => "rejected",
    );
    try {
      await paused;
      await app
        .get(PasswordRecoveryService)
        .resetPassword({ token: link.raw, password: changedPassword });
    } finally {
      pauseVerifiedLogin = null;
      resumeLogin();
    }
    expect(await settled).toBe("rejected");
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(0);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .authVersion,
    ).toBe(1);
    await expect(
      app
        .get(AuthService)
        .login({ email: user.email, password: changedPassword }),
    ).resolves.toMatchObject({ user: { id: user.id } });
  });
  it("rolls back password, token consumption and session revocation together when persistence fails", async () => {
    const old = await session(),
      link = await deliveredToken();
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION reject_synthetic_reset() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'synthetic reset rollback'; END; $$ LANGUAGE plpgsql`,
    );
    try {
      await prisma.$executeRawUnsafe(
        'CREATE TRIGGER reject_synthetic_reset BEFORE UPDATE OF "revokedAt" ON "RefreshToken" FOR EACH ROW EXECUTE FUNCTION reject_synthetic_reset()',
      );
      try {
        await reset(link.raw).expect(500);
        await unchanged();
        expect(
          (
            await prisma.passwordResetToken.findUniqueOrThrow({
              where: { id: link.row.id },
            })
          ).usedAt,
        ).toBeNull();
        expect(
          await prisma.refreshToken.count({
            where: { userId: user.id, revokedAt: null },
          }),
        ).toBe(1);
      } finally {
        await prisma.$executeRawUnsafe(
          'DROP TRIGGER reject_synthetic_reset ON "RefreshToken"',
        );
      }
    } finally {
      await prisma.$executeRawUnsafe("DROP FUNCTION reject_synthetic_reset()");
    }
    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${old.accessToken}`)
      .expect(200);
    await reset(link.raw).expect(200);
  });
  it("rejects expired, undelivered, used and inactive-user links without changing credentials", async () => {
    const expired = await deliveredToken(),
      undelivered = await deliveredToken(),
      used = await deliveredToken(),
      inactive = await deliveredToken();
    await prisma.passwordResetToken.update({
      where: { id: expired.row.id },
      data: { expiresAt: new Date(Date.now() - 1) },
    });
    await prisma.passwordResetToken.update({
      where: { id: undelivered.row.id },
      data: { deliveredAt: null },
    });
    await prisma.passwordResetToken.update({
      where: { id: used.row.id },
      data: { usedAt: new Date() },
    });
    for (const raw of [
      expired.raw,
      undelivered.raw,
      used.raw,
      randomBytes(32).toString("base64url"),
    ])
      await reset(raw).expect(400);
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "BLOCKED" },
    });
    await reset(inactive.raw).expect(400);
    await unchanged();
  });
  it("provider failure and cooldown are uniform, leave no usable link and never log recipient or raw token", async () => {
    failDelivery = true;
    const warn = jest
      .spyOn(Logger.prototype, "warn")
      .mockImplementation(() => undefined);
    const failed = await forgot().expect(202);
    expect(failed.body).toEqual({ message: RECOVERY_ACCEPTED_MESSAGE });
    expect(captured).toHaveLength(1);
    const raw = tokenFrom();
    await reset(raw).expect(400);
    await unchanged();
    await forgot().expect(202);
    expect(captured).toHaveLength(1);
    const logs = JSON.stringify(warn.mock.calls);
    expect(logs).toContain("password_recovery_delivery_failed");
    expect(logs).not.toContain(user.email);
    expect(logs).not.toContain(raw);
    expect(
      await prisma.passwordResetToken.count({ where: { usedAt: null } }),
    ).toBe(0);
  });
  it("notification delivery failure preserves the completed password change", async () => {
    const link = await deliveredToken();
    failNotification = true;
    await reset(link.raw).expect(200);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .authVersion,
    ).toBe(1);
    expect(
      await compare(
        changedPassword,
        (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
          .passwordHash,
      ),
    ).toBe(true);
    await reset(link.raw).expect(400);
  });
  it("disabled delivery has one 503 response for every account and creates no reset token", async () => {
    config.set("PASSWORD_RESET_ENABLED", false);
    const existing = await forgot().expect(503),
      missing = await forgot("disabled-missing@example.test").expect(503);
    expect(existing.body.message).toEqual(missing.body.message);
    expect(await prisma.passwordResetToken.count()).toBe(0);
    expect(captured).toHaveLength(0);
  });
  it("limits recovery requests per endpoint/IP without sending mail for unknown accounts", async () => {
    const responses = await Promise.all(
      Array.from({ length: 21 }, (_, index) =>
        forgot(`limited-${index}@example.test`),
      ),
    );
    expect(
      responses.filter((response) => response.status === 202),
    ).toHaveLength(20);
    expect(
      responses.filter((response) => response.status === 429),
    ).toHaveLength(1);
    expect(captured).toHaveLength(0);
    expect(await prisma.passwordResetToken.count()).toBe(0);
  });
  it("strict DTO rejects forged fields, too few characters and more than 72 UTF-8 bytes before consuming links", async () => {
    const link = await deliveredToken();
    for (const body of [
      { token: link.raw, password: "1234567" },
      { token: link.raw, password: "é".repeat(37) },
      { token: link.raw, password: "🙂".repeat(7) },
      { token: link.raw, password: changedPassword, userId: user.id },
      { token: "bad", password: changedPassword },
    ])
      await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send(body)
        .expect(400);
    expect(
      (
        await prisma.passwordResetToken.findUniqueOrThrow({
          where: { id: link.row.id },
        })
      ).usedAt,
    ).toBeNull();
    await unchanged();
    await reset(link.raw, "🙂".repeat(8)).expect(200);
  });
});

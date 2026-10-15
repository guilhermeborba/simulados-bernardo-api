/** Disposable local copy of the repository catalog; never accepts a database URL. */
const { spawn, spawnSync } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const { once } = require("node:events");
const { createServer } = require("node:net");
const { mkdtempSync, writeFileSync, rmSync, existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { resolve } = require("node:path");
const { createRequire } = require("node:module");
const checkOnly = process.argv.includes("--check");
const publishReviewed = process.argv.includes("--publish-reviewed");
if (
  process.argv
    .slice(2)
    .some((argument) => !["--check", "--publish-reviewed"].includes(argument))
)
  throw new Error("Only --check and --publish-reviewed are supported.");
const root = resolve(
  process.env.MOBILE_CATALOG_REPOSITORY || resolve(__dirname, ".."),
);
const requireSource = createRequire(resolve(root, "package.json"));
const { PrismaClient } = requireSource("@prisma/client");
const { hash } = requireSource("bcryptjs");
const port = Number(process.env.MOBILE_CATALOG_PORT || 3336);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("MOBILE_CATALOG_PORT must be between 1024 and 65535.");
if (!existsSync(resolve(root, "dist/src/app.module.js")))
  throw new Error("Build the API before starting the local catalog preview.");
const docker = process.env.MOBILE_PREVIEW_DOCKER_BINARY || "docker";
const name = `simulados-catalog-preview-${randomBytes(8).toString("hex")}`;
const temporary = mkdtempSync(resolve(tmpdir(), "simulados-catalog-preview-"));
let created = false;
let prisma;
let api;
let cleaning;
function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: root,
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) throw new Error("Local catalog command failed.");
  return result.stdout.trim();
}
async function cleanup() {
  if (cleaning) return cleaning;
  cleaning = (async () => {
    const errors = [];
    if (api && api.exitCode === null && api.signalCode === null) {
      const ended = once(api, "exit");
      api.kill("SIGTERM");
      const timer = setTimeout(() => api.kill("SIGKILL"), 3000);
      try {
        await ended;
      } catch {
        errors.push("API");
      } finally {
        clearTimeout(timer);
      }
    }
    if (prisma)
      try {
        await prisma.$disconnect();
      } catch {
        errors.push("Prisma");
      }
    if (created)
      try {
        command(docker, ["rm", "--force", name]);
      } catch {
        errors.push("container");
      }
    rmSync(temporary, { recursive: true, force: true });
    if (errors.length)
      throw new Error("Local preview cleanup failed: " + errors.join(", "));
  })();
  return cleaning;
}
for (const [signal, code] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
])
  process.once(
    signal,
    () =>
      void cleanup()
        .then(() => process.exit(code))
        .catch(() => {
          console.error("Local preview cleanup failed.");
          process.exit(1);
        }),
  );
(async () => {
  // Fail on a busy API port before creating a database.
  const probe = createServer();
  probe.listen(port, "127.0.0.1");
  await once(probe, "listening");
  await new Promise((done) => probe.close(done));
  const databasePassword = randomBytes(24).toString("hex");
  command(docker, [
    "run",
    "--detach",
    "--rm",
    "--pull=never",
    "--name",
    name,
    "--tmpfs",
    "/var/lib/postgresql/data",
    "--publish",
    "127.0.0.1::5432",
    "--env",
    "POSTGRES_USER=local_catalog_preview",
    "--env",
    `POSTGRES_PASSWORD=${databasePassword}`,
    "--env",
    "POSTGRES_DB=local_catalog_preview",
    "postgres:16-alpine",
  ]);
  created = true;
  const mapping = command(docker, ["port", name, "5432/tcp"]);
  const databasePort = /^127\.0\.0\.1:(\d+)$/.exec(mapping)?.[1];
  if (!databasePort) throw new Error("Invalid isolated database mapping.");
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (
      spawnSync(
        docker,
        ["exec", name, "pg_isready", "-U", "local_catalog_preview"],
        { stdio: "ignore" },
      ).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  if (!ready) throw new Error("Local database did not become ready.");
  const env = {
    ...process.env,
    NODE_ENV: "test",
    PORT: String(port),
    DATABASE_URL: `postgresql://local_catalog_preview:${databasePassword}@127.0.0.1:${databasePort}/local_catalog_preview`,
    FRONTEND_URL: "http://127.0.0.1:3000",
    FRONTEND_DATA_DIR: resolve(root, "prisma/seed-data"),
    JWT_ACCESS_SECRET: randomBytes(32).toString("hex"),
    JWT_REFRESH_SECRET: randomBytes(32).toString("hex"),
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    PASSWORD_RESET_ENABLED: "false",
    RESEND_API_KEY: "local-preview-disabled",
    MAIL_FROM: "disabled@example.test",
    RESEND_API_URL: "https://api.resend.com/emails",
    API_DOCS_ENABLED: "false",
    RATE_LIMIT_MAX: "10000",
    SEED_DRY_RUN: "false",
    SEED_INVENTORY: "false",
    SEED_QUIZZES_DRY_RUN: "false",
    SEED_QUIZZES_INVENTORY: "false",
    SEED_QUIZZES_PUBLISH_REVIEWED: String(publishReviewed),
  };
  command(
    process.execPath,
    [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
    { env },
  );
  command(
    process.execPath,
    ["-r", "ts-node/register/transpile-only", "prisma/seed.ts"],
    { env },
  );
  prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  const password = randomBytes(18).toString("base64url");
  const passwordHash = await hash(password, 10);
  const student = await prisma.user.create({
    data: {
      name: "Aluno da prévia local",
      email: "student@preview.example.test",
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      studentProfile: { create: { schoolYear: 3 } },
    },
  });
  const admin = await prisma.user.create({
    data: {
      name: "Admin da prévia local",
      email: "admin@preview.example.test",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  const turma = await prisma.turma.findUnique({
    where: { slug: "turma-bernardo" },
  });
  if (turma)
    await prisma.turmaMembership.create({
      data: { userId: student.id, turmaId: turma.id },
    });
  command(
    process.execPath,
    ["-r", "ts-node/register/transpile-only", "prisma/seed-quizzes.ts"],
    {
      env: { ...env, QUIZ_SEED_AUTHOR_EMAIL: admin.email },
    },
  );
  const simulations = await prisma.simulation.count({
    where: { activityKind: "SIMULATION", status: "PUBLISHED", deletedAt: null },
  });
  const questions = await prisma.question.count({
    where: { simulation: { activityKind: "SIMULATION" }, deletedAt: null },
  });
  const draftQuizzes = await prisma.simulation.count({
    where: { activityKind: "QUIZ", status: "DRAFT" },
  });
  const publishedQuizzes = await prisma.simulation.count({
    where: { activityKind: "QUIZ", status: "PUBLISHED" },
  });
  if (!publishReviewed && publishedQuizzes !== 0)
    throw new Error(
      "Local preview must preserve unpublished quizzes as drafts.",
    );
  if (publishReviewed && (publishedQuizzes === 0 || draftQuizzes !== 0))
    throw new Error("Reviewed catalog publication is incomplete.");
  const apiUrl = `http://127.0.0.1:${port}`;
  const access = resolve(temporary, "access.json");
  writeFileSync(
    access,
    JSON.stringify(
      {
        apiUrl,
        student: { email: student.email, password },
        admin: { email: admin.email, password },
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  const bootstrap = resolve(temporary, "bootstrap.cjs");
  writeFileSync(
    bootstrap,
    `
    const {createRequire}=require('node:module');
    const req=createRequire(${JSON.stringify(resolve(root, "package.json"))});
    const {NestFactory}=req('@nestjs/core'); const {ValidationPipe}=req('@nestjs/common');
    const {AppModule}=req(${JSON.stringify(resolve(root, "dist/src/app.module.js"))});
    (async()=>{ const app=await NestFactory.create(AppModule,{logger:false}); app.use(req('helmet')());
      app.enableCors({origin:process.env.FRONTEND_URL,credentials:true});
      app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
      app.enableShutdownHooks(); await app.listen(Number(process.env.PORT),'127.0.0.1');
    })().catch(()=>process.exit(1));
  `,
    { mode: 0o600 },
  );
  api = spawn(process.execPath, [bootstrap], {
    cwd: root,
    env,
    stdio: "ignore",
  });
  ready = false;
  for (let i = 0; i < 100; i++) {
    if (api.exitCode !== null)
      throw new Error("Local API exited before readiness.");
    try {
      if (
        (await fetch(`${apiUrl}/ready`, { signal: AbortSignal.timeout(1000) }))
          .ok
      ) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((done) => setTimeout(done, 250));
  }
  if (!ready) throw new Error("Local API did not become ready.");
  console.log(
    JSON.stringify({
      apiUrl,
      accessFile: access,
      simulations,
      questions,
      draftQuizzes,
      publishedQuizzes,
    }),
  );
  if (checkOnly) {
    const login = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: student.email, password }),
      signal: AbortSignal.timeout(10000),
    });
    if (!login.ok) throw new Error("Preview login failed.");
    const session = await login.json();
    const headers = { Authorization: `Bearer ${session.accessToken}` };
    const available = await fetch(`${apiUrl}/simulations/available`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    const quizzes = await fetch(`${apiUrl}/quizzes/available?schoolYear=3`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!available.ok || !quizzes.ok)
      throw new Error("Preview catalog read failed.");
    const activities = await available.json();
    const quizList = await quizzes.json();
    if (
      !Array.isArray(activities) ||
      activities.length === 0 ||
      !Array.isArray(quizList) ||
      (publishReviewed ? quizList.length === 0 : quizList.length !== 0)
    )
      throw new Error("Preview catalog visibility is invalid.");
    await cleanup();
    console.log("Catalog verification and resource cleanup passed.");
    return;
  }
  await once(api, "exit");
  throw new Error("Local API stopped.");
})().catch(async () => {
  console.error("Local catalog preview failed; no existing database was used.");
  try {
    await cleanup();
  } catch {
    console.error("Local preview cleanup failed.");
  }
  process.exitCode = 1;
});

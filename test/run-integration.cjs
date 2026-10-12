const { spawn } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const {
  DATABASE_NAME,
  assertTestDatabaseUrl,
} = require('./support/test-database.cjs');

const projectRoot = path.resolve(__dirname, '..');
const containerName = `simulados-regression-${randomUUID()}`;
const password = randomBytes(24).toString('hex');
let containerCreated = false;
let containerAttempted = false;
let interrupted = false;
let activeChild;

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    interrupted = true;
    activeChild?.kill(signal);
  });
}

function run(
  command,
  args,
  { capture = false, env = process.env, cleanup = false } = {},
) {
  if (interrupted && !cleanup) {
    return Promise.reject(new Error('Integration test interrupted'));
  }
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    activeChild = child;
    let stdout = '';
    if (capture) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', () => {});
    }
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (activeChild === child) activeChild = undefined;
      if (code !== 0) {
        reject(
          new Error(`${path.basename(command)} failed (${signal || code})`),
        );
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function disposableDatabaseUrl() {
  // No compose or .env database; the caller owns only this random container.
  // Local runs require an already available image and never pull one implicitly.
  containerAttempted = true;
  await run(
    'docker',
    [
      'run',
      '--detach',
      '--rm',
      '--pull=never',
      '--name',
      containerName,
      '--tmpfs',
      '/var/lib/postgresql/data',
      '--env',
      `POSTGRES_USER=${DATABASE_NAME}`,
      '--env',
      `POSTGRES_PASSWORD=${password}`,
      '--env',
      `POSTGRES_DB=${DATABASE_NAME}`,
      '--publish',
      '127.0.0.1::5432',
      'postgres:16-alpine',
    ],
    { capture: true },
  );
  containerCreated = true;
  console.log(`Disposable PostgreSQL: ${containerName}`);
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await run(
        'docker',
        [
          'exec',
          containerName,
          'pg_isready',
          '-U',
          DATABASE_NAME,
          '-d',
          DATABASE_NAME,
        ],
        { capture: true },
      );
      ready = true;
      break;
    } catch (error) {
      if (interrupted) throw error;
      await delay(250);
    }
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not become ready');
  const mapping = await run('docker', ['port', containerName, '5432/tcp'], {
    capture: true,
  });
  const port = /^127\.0\.0\.1:(\d+)$/.exec(mapping)?.[1];
  if (!port || port === '5432')
    throw new Error('Expected an isolated random local port');
  return `postgresql://${DATABASE_NAME}:${password}@127.0.0.1:${port}/${DATABASE_NAME}?schema=public`;
}

async function assertEmptyDatabase(databaseUrl) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });
  try {
    await prisma.$connect();
    const tables = await prisma.$queryRawUnsafe(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'",
    );
    for (const { tablename } of tables) {
      const identifier = `"${tablename.replaceAll('"', '""')}"`;
      const rows = await prisma.$queryRawUnsafe(
        `SELECT 1 FROM public.${identifier} LIMIT 1`,
      );
      if (rows.length) {
        throw new Error(
          'Integration runner refuses a database containing application data; recreate the test service',
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    const args = new Set(process.argv.slice(2));
    if ([...args].some((arg) => !['--external', '--auth-only'].includes(arg))) {
      throw new Error('Supported arguments: --external, --auth-only');
    }
    if (args.has('--external') && !process.env.TEST_DATABASE_URL) {
      throw new Error('--external requires TEST_DATABASE_URL');
    }
    const databaseUrl = assertTestDatabaseUrl(
      process.env.TEST_DATABASE_URL || (await disposableDatabaseUrl()),
    );
    const testEnv = {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: databaseUrl,
      TEST_DATABASE_URL: databaseUrl,
      FRONTEND_URL: 'http://127.0.0.1:3000',
      JWT_ACCESS_SECRET: 'synthetic-integration-access-secret',
      JWT_REFRESH_SECRET: 'synthetic-integration-refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      RATE_LIMIT_TTL_MS: '60000',
      RATE_LIMIT_MAX: '10000',
      API_DOCS_ENABLED: 'false',
      PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH || ''}`,
      PRISMA_HIDE_UPDATE_MESSAGE: 'true',
      CHECKPOINT_DISABLE: '1',
    };
    await run(
      process.execPath,
      ['node_modules/prisma/build/index.js', 'generate'],
      { env: testEnv },
    );
    await assertEmptyDatabase(databaseUrl);
    // Exercise the checked-in migration chain, rather than bypassing it with db push.
    await run(
      process.execPath,
      ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
      { env: testEnv },
    );
    const jestArgs = [
      'node_modules/jest/bin/jest.js',
      '--config',
      'test/jest-e2e.json',
      '--runInBand',
    ];
    if (args.has('--auth-only')) jestArgs.push('test/auth-refresh.e2e-spec.ts');
    await run(process.execPath, jestArgs, { env: testEnv });
  } finally {
    if (containerAttempted) {
      try {
        await run('docker', ['rm', '--force', containerName], {
          capture: true,
          cleanup: true,
        });
        console.log(`Disposable PostgreSQL removed: ${containerName}`);
      } catch (error) {
        if (containerCreated) throw error;
      }
    }
  }
}

main().catch((error) => {
  // Connection errors can contain a URL: never print credentials supplied to the runner.
  const message = String(error.message).replace(
    /postgres(?:ql)?:\/\/[^\s]+/gi,
    '[database URL redacted]',
  );
  console.error(message);
  process.exitCode = 1;
});

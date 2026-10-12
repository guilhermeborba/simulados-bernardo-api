const { spawn } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const projectRoot = path.resolve(__dirname, '..');
const containerName = `codex-auth-refresh-${randomUUID()}`;
const databaseName = 'auth_refresh_test';
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

async function main() {
  try {
    // Requires Docker and an already available postgres:16-alpine image.
    // Never pull an image or use the project's compose/.env database.
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
        `POSTGRES_USER=${databaseName}`,
        '--env',
        `POSTGRES_PASSWORD=${password}`,
        '--env',
        `POSTGRES_DB=${databaseName}`,
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
            databaseName,
            '-d',
            databaseName,
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

    const portMapping = await run(
      'docker',
      ['port', containerName, '5432/tcp'],
      { capture: true },
    );
    const port = /^127\.0\.0\.1:(\d+)$/.exec(portMapping)?.[1];
    if (!port || port === '5432')
      throw new Error('Expected an isolated local random port');
    const databaseUrl = `postgresql://${databaseName}:${password}@127.0.0.1:${port}/${databaseName}?schema=public`;
    const testEnv = {
      ...process.env,
      DATABASE_URL: databaseUrl,
      AUTH_REFRESH_TEST_DATABASE_URL: databaseUrl,
      PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH || ''}`,
      PRISMA_HIDE_UPDATE_MESSAGE: 'true',
      CHECKPOINT_DISABLE: '1',
    };
    await run(
      process.execPath,
      ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'],
      { env: testEnv },
    );
    await run(
      process.execPath,
      [
        'node_modules/jest/bin/jest.js',
        '--config',
        'test/jest-e2e.json',
        '--runInBand',
        'test/auth-refresh.e2e-spec.ts',
      ],
      { env: testEnv },
    );
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
  console.error(error.message);
  process.exitCode = 1;
});

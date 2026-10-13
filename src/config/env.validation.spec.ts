import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateEnv } from './env.validation';

function parseEnvExample(): Record<string, string> {
  const envExample = readFileSync(
    resolve(process.cwd(), '.env.example'),
    'utf8',
  );

  return Object.fromEntries(
    envExample
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        return [key, valueParts.join('=')];
      }),
  );
}

const base = {
  DATABASE_URL: 'postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic',
  FRONTEND_URL: 'https://web.example.test',
  JWT_ACCESS_SECRET: 'synthetic-access-secret-not-real',
  JWT_REFRESH_SECRET: 'synthetic-refresh-secret-not-real',
};
const recovery = {
  ...base,
  PASSWORD_RESET_ENABLED: 'true',
  RESEND_API_KEY: 're_synthetic_not_a_real_key',
  MAIL_FROM: 'notification@example.test',
};

describe('validateEnv', () => {
  it('keeps recovery disabled without any mail secrets', () => {
    const environment = validateEnv(base);
    expect(environment.PASSWORD_RESET_ENABLED).toBe(false);
    expect(environment.RESEND_API_KEY).toBeUndefined();
    expect(environment.MAIL_FROM).toBeUndefined();
    expect(environment.RESEND_API_URL).toBe('https://api.resend.com/emails');
  });

  it('accepts enabled recovery with a sender, key and the fixed official endpoint', () => {
    expect(validateEnv({ ...recovery, NODE_ENV: 'production' })).toMatchObject({
      PASSWORD_RESET_ENABLED: true,
      RESEND_API_URL: 'https://api.resend.com/emails',
      FRONTEND_URL: 'https://web.example.test',
    });
  });

  it.each([
    { RESEND_API_KEY: undefined },
    { RESEND_API_KEY: '' },
    { RESEND_API_KEY: '   ' },
    { RESEND_API_KEY: '\t\n' },
    { MAIL_FROM: undefined },
    { MAIL_FROM: '' },
    { MAIL_FROM: 'invalid-sender' },
    { MAIL_FROM: 'Sender <sender@example.test>' },
  ])(
    'refuses enabled recovery without valid mail configuration: %p',
    (fields) => {
      expect(() => validateEnv({ ...recovery, ...fields })).toThrow();
    },
  );

  it('normalizes whitespace around a configured synthetic API key', () => {
    expect(
      validateEnv({
        ...recovery,
        RESEND_API_KEY: '  re_synthetic_not_a_real_key  ',
      }).RESEND_API_KEY,
    ).toBe('re_synthetic_not_a_real_key');
  });

  it('accepts a local synthetic provider only in test mode at /emails with an explicit port', () => {
    expect(
      validateEnv({
        ...recovery,
        NODE_ENV: 'test',
        RESEND_API_URL: 'http://127.0.0.1:48500/emails',
      }).RESEND_API_URL,
    ).toBe('http://127.0.0.1:48500/emails');
  });

  it.each(['development', 'production'])(
    'rejects the loopback provider in %s',
    (NODE_ENV) => {
      expect(() =>
        validateEnv({
          ...recovery,
          NODE_ENV,
          RESEND_API_URL: 'http://127.0.0.1:48500/emails',
        }),
      ).toThrow();
    },
  );

  it.each([
    'https://other.example.test/emails',
    'https://api.resend.com/emails?token=synthetic',
    'https://api.resend.com/emails#fragment',
    'https://api.resend.com/emails/',
    'https://user:synthetic@api.resend.com/emails',
    'http://127.0.0.1/emails',
    'https://127.0.0.1:48500/emails',
    'http://localhost:48500/emails',
    'http://[::1]:48500/emails',
    'http://127.0.0.1:48500/other',
    'http://127.0.0.1:48500/emails/',
    'http://127.0.0.1:48500/emails/subpath',
    'http://127.0.0.1:48500/emails?recipient=synthetic',
    'http://127.0.0.1:48500/emails#fragment',
    'http://user:synthetic@127.0.0.1:48500/emails',
    'http://127.0.0.1.other.example.test:48500/emails',
    'http://127.0.0.1@other.example.test:48500/emails',
  ])(
    'rejects endpoints outside the official or isolated test transport: %s',
    (RESEND_API_URL) => {
      expect(() =>
        validateEnv({ ...recovery, NODE_ENV: 'test', RESEND_API_URL }),
      ).toThrow();
    },
  );

  it('requires HTTPS for production recovery links while allowing local development HTTP', () => {
    expect(() =>
      validateEnv({
        ...recovery,
        NODE_ENV: 'production',
        FRONTEND_URL: 'http://web.example.test',
      }),
    ).toThrow();
    expect(
      validateEnv({
        ...recovery,
        NODE_ENV: 'development',
        FRONTEND_URL: 'http://localhost:3000',
      }).FRONTEND_URL,
    ).toBe('http://localhost:3000');
  });

  it.each([
    'https://user@web.example.test',
    'https://user:synthetic@web.example.test',
    'https://web.example.test?redirect=synthetic',
    'https://web.example.test#token=synthetic',
    'https://web.example.test/path',
    'https://web.example.test/path/',
    'ftp://web.example.test',
    'file:///',
    'javascript:synthetic',
    'data:text/plain,synthetic',
  ])(
    'refuses noncanonical credentials, paths or protocols in the recovery origin: %s',
    (FRONTEND_URL) => {
      expect(() => validateEnv({ ...recovery, FRONTEND_URL })).toThrow();
    },
  );

  it('accepts the documented .env.example values', () => {
    expect(() => validateEnv(parseEnvExample())).not.toThrow();
  });
});

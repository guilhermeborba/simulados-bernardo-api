import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateEnv } from './env.validation';

function parseEnvExample(): Record<string, string> {
  const envExample = readFileSync(resolve(process.cwd(), '.env.example'), 'utf8');

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

describe('validateEnv', () => {
  it('accepts the documented .env.example values', () => {
    expect(() => validateEnv(parseEnvExample())).not.toThrow();
  });
});

import { assertTestDatabaseUrl } from './test-database.cjs';

const local =
  'postgresql://simulados_regression_test:synthetic@127.0.0.1:49123/simulados_regression_test?schema=public';

describe('Integration database boundary', () => {
  it.each([
    local,
    local.replace('49123', '5432'),
    local.replace('127.0.0.1', 'localhost'),
  ])(
    'permits a named disposable local test database with explicit port',
    (url) => {
      expect(assertTestDatabaseUrl(url)).toBe(url);
    },
  );

  it.each([
    undefined,
    'not-a-url',
    local.replace('127.0.0.1', 'production.example.test'),
    local.replace(':49123', ''),
    local.replace('/simulados_regression_test?', '/simulados?'),
    local.replace(
      'simulados_regression_test:synthetic@',
      'postgres:synthetic@',
    ),
    local.replace(':synthetic@', '@'),
    local.replace('postgresql:', 'https:'),
    `${local}&options=--search_path%3Dproduction`,
    local.replace('schema=public', 'schema=production'),
    `${local}#unsafe`,
  ])(
    'refuses missing, production-shaped or ambiguous database targets',
    (url) => {
      expect(() => assertTestDatabaseUrl(url)).toThrow();
    },
  );
});

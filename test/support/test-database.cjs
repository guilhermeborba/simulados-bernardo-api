const DATABASE_NAME = 'simulados_regression_test';

function assertTestDatabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      'TEST_DATABASE_URL must identify a disposable local PostgreSQL',
    );
  }
  if (
    !['postgresql:', 'postgres:'].includes(url.protocol) ||
    !['127.0.0.1', 'localhost'].includes(url.hostname) ||
    url.pathname !== `/${DATABASE_NAME}` ||
    url.username !== DATABASE_NAME ||
    !url.password ||
    !url.port ||
    url.hash ||
    [...url.searchParams.entries()].some(
      ([key, entry]) => key !== 'schema' || entry !== 'public',
    )
  ) {
    throw new Error(
      `Integration tests require localhost, an explicit port, and database/user ${DATABASE_NAME}`,
    );
  }
  return value;
}

module.exports = { DATABASE_NAME, assertTestDatabaseUrl };

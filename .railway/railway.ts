import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "sfo" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const simuladosBernardoApi = service("simulados-bernardo-api", {
    source: github("guilhermeborba/simulados-bernardo-api", { checkSuites: false }),
    build: "npm run build",
    start: "npx prisma migrate deploy && npm run start:prod",
    preDeploy: "npx prisma migrate deploy && npm run seed",
    replicas: { "sfo": 1 },
    env: { API_DOCS_ENABLED: preserve(), DATABASE_URL: preserve(), FRONTEND_URL: preserve(), JWT_ACCESS_EXPIRES_IN: preserve(), JWT_ACCESS_SECRET: preserve(), JWT_REFRESH_EXPIRES_IN: preserve(), JWT_REFRESH_SECRET: preserve(), NODE_ENV: preserve(), POSTGRES_DB: preserve(), POSTGRES_PASSWORD: preserve(), POSTGRES_USER: preserve(), RATE_LIMIT_MAX: preserve(), RATE_LIMIT_TTL_MS: preserve() },
  });

  return project("pleasing-charisma", {
    resources: [simuladosBernardoApi, Postgres, postgresVolume],
  });
});

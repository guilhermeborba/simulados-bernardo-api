# Guia de Deploy

## Pré-requisitos

- Node.js compatível com o projeto.
- PostgreSQL disponível.
- Variáveis de ambiente configuradas.
- Migrations aplicadas antes de servir tráfego.

## Variáveis obrigatórias

```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://...
FRONTEND_URL=https://frontend.example.com
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=100
API_DOCS_ENABLED=false
```

## Build

```bash
npm install
npm run prisma:generate
npm run build
```

## Migration

```bash
npm run prisma:migrate
```

## Execução

```bash
npm run start:prod
```

## Health checks

```http
GET /health
GET /ready
```

## Segurança operacional

- Usar `API_DOCS_ENABLED=false` em produção pública.
- Usar `FRONTEND_URL` restrito ao domínio real do front-end.
- Usar segredos JWT longos e aleatórios.
- Não registrar payloads sensíveis em logs.
- Monitorar falhas de `GET /ready`.

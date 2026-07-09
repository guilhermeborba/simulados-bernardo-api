# Simulados Bernardo API

Backend do **Simulados Bernardo**, uma plataforma educacional para criação, realização e acompanhamento de simulados escolares.

Este repositório inicia a migração do modelo atual, baseado em dados locais no front-end, para uma API persistente, segura e escalável com usuários autenticados, perfis, simulados, questões, tentativas, correção no servidor e relatórios de desempenho.

## Status

Fase 2 em desenvolvimento: autenticação e usuários.

Implementado neste repositório:

- Estrutura inicial NestJS com TypeScript.
- Configuração de ambiente com validação.
- Docker Compose para PostgreSQL.
- Prisma configurado com schema inicial do domínio.
- Endpoints técnicos `GET /health` e `GET /ready`.
- Cadastro, login, refresh token, logout e `GET /auth/me`.
- CRUD administrativo inicial de usuários.
- Guards de autenticação JWT e autorização por role.
- Teste unitário inicial do health check.
- Checklist de desenvolvimento em `docs/checklist-desenvolvimento.md`.

## Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT com refresh token
- Zod para validação de ambiente
- Jest e Supertest
- Docker Compose

## Arquitetura

Arquitetura em camadas:

```text
Controller -> Service -> Prisma -> Database
```

Estrutura inicial:

```text
src/
  app.module.ts
  main.ts
  config/
  database/
    prisma/
  health/
prisma/
  schema.prisma
docs/
  checklist-desenvolvimento.md
```

A estrutura será expandida por módulos conforme as fases:

```text
src/
  modules/
    auth/
    users/
    students/
    guardians/
    disciplines/
    simulations/
    questions/
    attempts/
    reports/
    admin/
  common/
```

## Modelo de domínio inicial

O schema inicial do Prisma cobre as entidades previstas no plano:

- `User`
- `RefreshToken`
- `StudentProfile`
- `GuardianStudent`
- `Discipline`
- `Simulation`
- `Question`
- `QuestionOption`
- `QuestionAnswer`
- `Attempt`
- `AttemptAnswer`

Enums principais:

- `UserRole`: `STUDENT`, `GUARDIAN`, `TEACHER`, `ADMIN`
- `UserStatus`: `ACTIVE`, `INACTIVE`, `PENDING`, `BLOCKED`
- `SimulationStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`, `INACTIVE`
- `QuestionType`: `MULTIPLE_CHOICE`, `TRUE_FALSE_MULTIPLE`, `MATCHING`, `CLASSIFICATION`
- `AttemptStatus`: `IN_PROGRESS`, `FINISHED`, `ABANDONED`, `EXPIRED`

## Endpoints implementados

### Health checks

```http
GET /health
GET /ready
```

`/health` verifica se a aplicação está respondendo.

`/ready` verifica se a aplicação consegue consultar o banco de dados.

### Autenticação

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

### Usuários

```http
GET    /users
GET    /users/:id
PATCH  /users/:id
PATCH  /users/:id/status
DELETE /users/:id
```

As rotas de usuários são administrativas e exigem role `ADMIN`.

## Endpoints planejados

### Recuperação de senha

```http
POST /auth/forgot-password
POST /auth/reset-password
```

### Alunos

```http
GET   /students/me
PATCH /students/me
GET   /students/:id
GET   /students/:id/attempts
GET   /students/:id/performance
```

### Disciplinas

```http
GET    /disciplines
POST   /disciplines
GET    /disciplines/:id
PATCH  /disciplines/:id
DELETE /disciplines/:id
```

### Simulados

```http
GET    /simulations
POST   /simulations
GET    /simulations/:id
PATCH  /simulations/:id
DELETE /simulations/:id
PATCH  /simulations/:id/publish
PATCH  /simulations/:id/archive
GET    /simulations/available
```

### Questões

```http
GET    /simulations/:simulationId/questions
POST   /simulations/:simulationId/questions
PATCH  /questions/:id
DELETE /questions/:id
PATCH  /questions/:id/reorder
```

### Tentativas

```http
POST  /simulations/:simulationId/attempts
GET   /attempts/:id
POST  /attempts/:id/answers
POST  /attempts/:id/finish
GET   /attempts/:id/result
GET   /me/attempts
```

### Relatórios

```http
GET /reports/student/:studentId/summary
GET /reports/student/:studentId/by-discipline
GET /reports/simulations/:simulationId/performance
GET /reports/questions/error-rate
```

## Regras importantes

- Apenas `ADMIN` e usuários explicitamente autorizados podem criar ou publicar simulados.
- Simulados em rascunho não aparecem para alunos.
- O gabarito oficial fica protegido no backend.
- A correção das respostas acontece no servidor.
- Tentativas finalizadas não podem ser alteradas.
- O histórico de tentativas deve ser preservado.
- Exclusões administrativas devem usar soft delete quando houver impacto histórico.
- Responsáveis e professores só podem consultar alunos vinculados ou autorizados.
- Logs não devem expor dados sensíveis.

## Privacidade e segurança

Como o sistema envolve dados de crianças, o backend deve seguir uma abordagem restritiva:

- Coletar apenas dados necessários.
- Restringir acesso por perfil.
- Evitar exposição pública de nomes completos.
- Não registrar dados sensíveis em logs.
- Proteger endpoints sensíveis com rate limit.
- Usar hash forte para senhas.
- Usar tokens com expiração e rotação de refresh token.
- Aplicar CORS restrito ao domínio do front-end.

## Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`.

```env
NODE_ENV=development
PORT=3333
POSTGRES_DB=simulados_bernardo
POSTGRES_USER=REPLACE_WITH_LOCAL_DATABASE_USER
POSTGRES_PASSWORD=REPLACE_WITH_LOCAL_DATABASE_PASSWORD
DATABASE_URL=postgresql://REPLACE_WITH_LOCAL_DATABASE_USER:REPLACE_WITH_LOCAL_DATABASE_PASSWORD@localhost:5432/simulados_bernardo?schema=public
FRONTEND_URL=http://localhost:3000
JWT_ACCESS_SECRET=REPLACE_WITH_RANDOM_ACCESS_SECRET_MIN_32_CHARS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=REPLACE_WITH_RANDOM_REFRESH_SECRET_MIN_32_CHARS
JWT_REFRESH_EXPIRES_IN=7d
```

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Suba o banco local:

```bash
docker compose up -d
```

Execute a primeira migration:

```bash
npm run prisma:migrate
```

Depois de alterar o schema localmente, gere o Prisma Client:

```bash
npm run prisma:generate
```

Rode a API em desenvolvimento:

```bash
npm run start:dev
```

Teste os endpoints técnicos:

```bash
curl http://localhost:3333/health
curl http://localhost:3333/ready
```

## Scripts

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
npm run test:e2e
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Testes

Áreas com cobertura obrigatória nas próximas fases:

- Autenticação.
- Autorização por perfil.
- Criação e publicação de simulados.
- Correção de questões.
- Finalização de tentativas.
- Bloqueio de acesso não autorizado.

Meta inicial:

- Services críticos acima de 85% de cobertura.
- Testes de integração para fluxos principais da API.
- Testes e2e para o fluxo completo de administrador e aluno.

## Fases de desenvolvimento

1. Fundação do backend: NestJS, TypeScript, Prisma, PostgreSQL, Docker e health check.
2. Autenticação e usuários: cadastro, login, refresh token, logout, roles e guards.
3. Disciplinas, simulados e questões: CRUDs, publicação, arquivamento e importação dos dados atuais.
4. Tentativas e correção: início, respostas, finalização, cálculo de nota e histórico.
5. Perfil e relatórios: histórico do aluno, melhores notas, desempenho por disciplina e vínculos.
6. Hardening e produção: rate limit, CORS, logs, auditoria, documentação e deploy.

## Integração com o front-end

O front-end atual deve deixar de importar questões diretamente dos arquivos locais em `data/` e passar a consumir esta API.

Fluxo recomendado de migração:

1. Criar o schema definitivo no banco.
2. Importar disciplinas, simulados, questões, alternativas, gabaritos e dicas.
3. Validar os dados importados contra o comportamento atual.
4. Adaptar o front-end para buscar disciplinas e simulados pela API.
5. Salvar tentativas e respostas no backend.
6. Remover a dependência direta dos arquivos locais após a transição.

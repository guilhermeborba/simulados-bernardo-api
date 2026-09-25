# simulados-bernardo-api — Guia para Agentes

API backend da plataforma educacional **Simulados Bernardo**: criação, realização e acompanhamento de simulados escolares para o Ensino Fundamental e Educação Infantil.

## Stack

- **Node.js + NestJS + TypeScript** (porta padrão: 3333)
- **PostgreSQL** via Docker Compose
- **Prisma ORM** (schema em `prisma/schema.prisma`)
- **JWT** (access token 15 min + refresh token 7 dias, ambos com hash no banco)
- **Jest** para testes unitários / `supertest` para e2e
- **Swagger** em `GET /docs` (quando `API_DOCS_ENABLED=true`)

## Como rodar localmente

```bash
docker compose up -d          # sobe o PostgreSQL
npm run prisma:migrate        # aplica migrations
npm run start:dev             # API em modo watch
```

```bash
npm run seed                  # importa todos os simulados no banco
npm run seed:dry-run          # valida sem gravar
```

Crie um `.env` baseado em `.env.example`. Variáveis obrigatórias: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`.

## Arquitetura

```
src/
  app.module.ts               # raiz: registra todos os módulos
  main.ts                     # bootstrap: Helmet, CORS, ValidationPipe, Swagger
  config/                     # validação de env (Zod)
  common/
    decorators/               # @CurrentUser(), @Roles()
    filters/                  # HttpExceptionFilter (erros padronizados)
    guards/                   # JwtAuthGuard, RolesGuard, OptionalJwtAuthGuard
    interceptors/             # LoggingInterceptor
    middleware/               # RequestIdMiddleware (x-request-id)
    utils/                    # slugify
  database/prisma/            # PrismaService
  health/                     # GET /health, GET /ready
  modules/
    auth/                     # register, login, logout, refresh, /me
    users/                    # CRUD admin de usuários
    students/                 # perfil, histórico e desempenho do aluno
    guardians/                # vínculo responsável-aluno
    disciplines/              # CRUD de disciplinas
    simulations/              # CRUD + publicação/arquivamento
    questions/                # CRUD de questões com gabarito protegido
    attempts/                 # início, respostas, finalização, resultado
    reports/                  # relatórios por aluno/disciplina/simulado
    turmas/                   # grupos fechados com controle de acesso por convite
    pontuacao/                # ranking e pontuação
    audit/                    # interceptor de auditoria (ações mutáveis)
prisma/
  schema.prisma
  seed.ts                     # script mestre de seed
  seed-data/                  # um arquivo .ts por simulado
```

Fluxo padrão de dados: `Controller → Service → PrismaService → PostgreSQL`

## Padrões de código

### Guards e autorização

Todos os endpoints autenticados têm `@UseGuards(JwtAuthGuard)`. Restrição por role usa `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`.

Roles disponíveis: `STUDENT`, `GUARDIAN`, `TEACHER`, `ADMIN`.

```ts
// Pegar o usuário autenticado num controller
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user: AuthTokenPayload) { ... }
```

### Soft delete

Entidades com histórico usam `deletedAt DateTime?`. Toda query de listagem filtra `{ deletedAt: null }`.

### DTOs

Usam `class-validator` + `class-transformer`. O `ValidationPipe` global está configurado com `whitelist: true` e `forbidNonWhitelisted: true`.

### Slugs

Use o utilitário `src/common/utils/slugify.ts` para gerar slugs, nunca implementar na mão.

### Erros

Lance sempre exceções do NestJS (`NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`). O `HttpExceptionFilter` global formata tudo.

## Modelo de domínio resumido

| Entidade | Descrição |
|---|---|
| `User` | Todos os perfis (roles: STUDENT, GUARDIAN, TEACHER, ADMIN) |
| `StudentProfile` | Dados extras do aluno (ano escolar, turma, escola) |
| `GuardianStudent` | Vínculo responsável ↔ aluno |
| `Discipline` | Matérias (Português, Matemática, etc.) — slugs fixos |
| `Simulation` | Simulado: pertence a uma disciplina e opcionalmente a uma turma |
| `Question` | Questão de um simulado; gabarito nunca é retornado em endpoints públicos |
| `QuestionOption` | Alternativas/itens da questão |
| `QuestionAnswer` | Gabarito oficial (guardado no servidor) |
| `Attempt` | Tentativa de um aluno num simulado |
| `AttemptAnswer` | Resposta do aluno por questão |
| `Turma` | Grupo fechado; simulados de turma são invisíveis para não-membros |
| `TurmaInvite` | Token de convite (hash no banco, token bruto viaja no link) |
| `TurmaMembership` | Vínculo aluno ↔ turma |
| `AuditLog` | Registro de ações mutáveis |

Tipos de questão: `MULTIPLE_CHOICE`, `TRUE_FALSE_MULTIPLE`, `MATCHING`, `CLASSIFICATION`.

## Tarefa mais comum: adicionar um novo simulado

Esta é a operação mais frequente no projeto. São sempre dois passos.

### Passo 1 — criar o arquivo de questões

Crie `prisma/seed-data/questoes-{disciplina}-{ano}ano-b{bimestre}-av{avaliacao}.ts`.

**Convenção de nome do arquivo:**
- `questoes-matematica-4ano-b1-av1.ts`
- `questoes-portugues-3ano-b2-av2.ts`
- `questoes-geografia-2ano-b4-av1.ts`

**Template de arquivo:**

```ts
export const questoes<Disciplina><Ano>AnoB<Bimestre>Av<Avaliacao> = [
  {
    id: 1,
    type: "multiple_choice",
    text: "Enunciado da questão?",
    tip: "Dica para o aluno (opcional).",
    funFact: "\"Você sabia?\" — curiosidade exibida sempre no resultado.",
    points: 1,
    options: [
      { id: "A", text: "Alternativa A" },
      { id: "B", text: "Alternativa B" },
      { id: "C", text: "Alternativa C" },
      { id: "D", text: "Alternativa D" },
    ],
    correctAnswer: "B",
  },
  // ... mais questões
];
```

O campo `funFact` é exibido sempre na tela de resultado (acertando ou errando) — é conteúdo extra de recompensa, não uma dica para responder.

### Passo 2 — registrar no seed.ts

Adicione uma entrada no array `simulations` em `prisma/seed.ts`:

```ts
{
  file: 'questoes-matematica-4ano-b1-av1.ts',
  exportName: 'questoesMatematica4AnoB1Av1',
  disciplineSlug: 'matematica',
  schoolYear: 4,
  bimester: 1,
  assessment: 'AV1',
  title: 'Simulado de Matemática',
  subtitle: '1º Bimestre — 4º Ano — AV1',
  estimatedDurationMinutes: 30,
},
```

**Regra de nomenclatura do `exportName`:** camelCase do nome do arquivo sem extensão:
`questoes-matematica-4ano-b1-av1.ts` → `questoesMatematica4AnoB1Av1`

### Passo 3 — testar

```bash
npm run seed:dry-run   # valida sem tocar no banco
npm run seed           # grava (idempotente: pode rodar várias vezes)
```

### Convenção de branch para novo simulado

```
feat/{disciplina-curta}-{ano}ano-b{bimestre}av{avaliacao}
```
Exemplos: `feat/mat-4ano-b1av1`, `feat/port-3ano-b2av2`, `feat/geo-4ano-b1av1`

## Disciplinas disponíveis (slugs fixos)

| Slug | Nome |
|---|---|
| `portugues` | Português |
| `matematica` | Matemática |
| `ciencias` | Ciências |
| `historia` | História |
| `geografia` | Geografia |
| `enfermagem` | Enfermagem (curso técnico) |
| `infantil-eu-outro-nos` | O eu, o outro e o nós (Ed. Infantil) |
| `infantil-corpo-gestos-movimentos` | Corpo, gestos e movimentos (Ed. Infantil) |
| `infantil-tracos-sons-cores-formas` | Traços, sons, cores e formas (Ed. Infantil) |
| `infantil-escuta-fala-pensamento-imaginacao` | Escuta, fala, pensamento e imaginação (Ed. Infantil) |
| `infantil-espacos-tempos-quantidades` | Espaços, tempos, quantidades, relações e transformações (Ed. Infantil) |

**Nunca crie novas disciplinas sem alinhamento** — a lista é controlada no seed.ts.

## Turmas (simulados privados)

Simulados com `turmaSlug` preenchido no seed só aparecem para membros da turma. Membros entram via link de convite gerado por ADMIN.

Turmas existentes: `turma-bernardo` (3º ano).

Para criar um simulado de turma, adicione `turmaSlug: 'turma-bernardo'` na entrada do seed.

## Principais endpoints por módulo

```
POST /auth/register | login | logout | refresh
GET  /auth/me

GET|PATCH /students/me
GET       /students/:id/attempts | /performance

GET|POST         /disciplines
GET|PATCH|DELETE /disciplines/:id

GET|POST           /simulations
GET|PATCH|DELETE   /simulations/:id
PATCH              /simulations/:id/publish | /archive
GET                /simulations/available

GET|POST /simulations/:simulationId/questions
PATCH|DELETE /questions/:id

POST /simulations/:simulationId/attempts
POST /attempts/:id/answers | /finish
GET  /attempts/:id/result
GET  /me/attempts

GET /reports/student/:id/summary | /by-discipline
GET /reports/simulations/:id/performance

GET|POST    /turmas
POST        /turmas/:id/invites
POST        /turmas/join
```

## Regras de negócio críticas

- Simulado em `DRAFT` nunca aparece para alunos.
- Gabarito (`QuestionAnswer`) nunca é retornado em endpoints públicos ou de aluno.
- Tentativa `FINISHED` não aceita novas respostas.
- Correção acontece no servidor (`attempts-correction.service.ts`).
- Soft delete obrigatório para entidades com histórico (User, Simulation, Question, Discipline, Turma).
- Logs nunca expõem senha, tokens ou dados sensíveis de crianças.

## Scripts úteis

```bash
npm run start:dev           # servidor com hot reload
npm run test                # testes unitários
npm run test:e2e            # testes e2e
npm run lint                # eslint
npm run prisma:studio       # UI visual do banco
npm run limpar:tentativas   # remove tentativas órfãs
npm run convite             # gera link de convite para uma turma
```

## Documentação adicional

- `PROGRESS.md` — **estado atual do projeto**: o que está concluído, o que está em andamento e as próximas iniciativas. Ler antes de começar qualquer task.
- `docs/decisions/` — **ADRs**: raciocínio por trás das decisões arquiteturais não óbvias (refresh token como hash, BFF com cookies httpOnly, turma com membership table, seed idempotente, gabarito protegido).
- `docs/checklist-desenvolvimento.md` — checklist das 6 fases do projeto
- `docs/guia-permissoes.md` — regras detalhadas de autorização por role
- `docs/guia-deploy.md` — deploy no Railway
- `docs/guia-seed-importacao.md` — guia detalhado do sistema de seed
- `docs/superpowers/plans/` — planos de implementação de features maiores
- `docs/superpowers/specs/` — specs técnicas de design

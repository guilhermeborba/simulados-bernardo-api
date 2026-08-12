# Integração front-end/API — Fluxo do aluno — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o front-end `simulados-bernardo` (Next.js 14) com `simulados-bernardo-api` (NestJS) para o fluxo completo do aluno: login/registro, listagem de simulados via API, execução de tentativa com correção no servidor, resultado e histórico.

**Architecture:** O front-end vira um BFF — rotas `app/api/*` do Next fazem proxy autenticado para o backend, guardando os tokens JWT em cookies `httpOnly`. O navegador só fala com o próprio Next (`fetch('/api/...')`), nunca direto com `localhost:3333`. Um endpoint novo (`GET /attempts/:id/questions`) é adicionado ao backend para o aluno buscar as questões de uma tentativa sem gabarito.

**Tech Stack:** NestJS + Prisma + Jest (backend, já configurado); Next.js 14 App Router + React 18 + TypeScript (frontend, sem framework de teste configurado — verificação via `tsc --noEmit`, `next lint`, `next build` e checklist manual).

## Global Constraints

- Spec de referência: `docs/superpowers/specs/2026-08-12-integracao-frontend-api-design.md` (neste repositório).
- Repositório backend: `/Users/guilhermeborba/Documents/htdocs/simulados-bernardo-api` (aqui).
- Repositório frontend: `/Users/guilhermeborba/Documents/htdocs/simulados-bernardo` (projeto irmão, caminhos absolutos usados em todas as tarefas de frontend).
- Cookies de auth: nomes `sb_access_token` e `sb_refresh_token`, `httpOnly`, `sameSite=lax`, `secure` apenas quando `NODE_ENV=production`, `path=/`. Nunca expor os tokens a JavaScript no navegador.
- Variável de ambiente nova no frontend: `BACKEND_API_URL` (sem prefixo `NEXT_PUBLIC_` — só usada server-side dentro de `app/api/*`).
- O backend já restringe CORS via `FRONTEND_URL=http://localhost:3000` (`.env.example`) — não precisa mudar, pois as chamadas ao backend passam a ser server-to-server (sem CORS).
- Fora de escopo nesta rodada: painel admin, área de responsável, relatórios agregados, recuperação de senha, edição de perfil do aluno (`/students/me`).
- Pré-requisito para testar: backend rodando localmente em `http://localhost:3333` (`npm run start:dev` neste repo, com Postgres via `docker compose up -d` e migrations aplicadas) e frontend em `http://localhost:3000` (`npm run dev` no repo `simulados-bernardo`).
- O frontend não tem framework de teste configurado (`package.json` só tem `dev/build/start/lint`). Verificação por tarefa usa `npx tsc --noEmit` (checagem de tipos) e, quando aplicável, `npm run lint`; a verificação funcional fim-a-fim é manual (browser), documentada na última tarefa.

---

## Backend (`simulados-bernardo-api`)

### Task 1: Endpoint `GET /attempts/:id/questions`

**Files:**
- Modify: `src/modules/attempts/attempts.service.ts` (novo método, após `findAttempt`, linha 72)
- Modify: `src/modules/attempts/attempts.controller.ts` (nova rota, após `findAttempt`, linha 39)
- Test: `src/modules/attempts/attempts.service.spec.ts` (novos testes)
- Modify: `README.md` (documentação do endpoint)

**Interfaces:**
- Produces: `AttemptsService.findAttemptQuestions(attemptId: string, user: RequestUser): Promise<Array<{ id: string; type: QuestionType; statement: string; tip: string | null; points: Prisma.Decimal; order: number; options: Array<{ id: string; optionKey: string; text: string; groupKey: string | null; order: number }> }>>` — usado pelo frontend (Task 12 em diante) como fonte das questões de uma tentativa, sem gabarito.

- [ ] **Step 1: Escrever os testes que falham**

Abra `src/modules/attempts/attempts.service.spec.ts` e adicione os dois testes abaixo logo após o teste `'blocks attempts owned by another student'` (antes de `'finishes an attempt and calculates score'`):

```ts
  it('returns active questions without official answers for the attempt owner', async () => {
    prisma.attempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      studentId: student.id,
      simulationId: 'simulation-1',
      status: AttemptStatus.IN_PROGRESS,
      simulation: {},
    });
    prisma.question.findMany.mockResolvedValue([
      {
        id: 'question-1',
        type: QuestionType.MULTIPLE_CHOICE,
        statement: 'Quanto é 2 + 2?',
        tip: 'Some as parcelas',
        points: new Prisma.Decimal(1),
        sortOrder: 1,
        options: [
          { id: 'opt-1', optionKey: 'a', text: '3', groupKey: null, sortOrder: 1 },
          { id: 'opt-2', optionKey: 'b', text: '4', groupKey: null, sortOrder: 2 },
        ],
      },
    ]);

    const result = await service.findAttemptQuestions('attempt-1', student);

    expect(result).toEqual([
      {
        id: 'question-1',
        type: QuestionType.MULTIPLE_CHOICE,
        statement: 'Quanto é 2 + 2?',
        tip: 'Some as parcelas',
        points: new Prisma.Decimal(1),
        order: 1,
        options: [
          { id: 'opt-1', optionKey: 'a', text: '3', groupKey: null, order: 1 },
          { id: 'opt-2', optionKey: 'b', text: '4', groupKey: null, order: 2 },
        ],
      },
    ]);
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: { simulationId: 'simulation-1', isActive: true, deletedAt: null },
      include: { options: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('blocks access to another student attempt questions', async () => {
    prisma.attempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      studentId: 'other-student',
      simulationId: 'simulation-1',
      status: AttemptStatus.IN_PROGRESS,
      simulation: {},
    });

    await expect(
      service.findAttemptQuestions('attempt-1', student),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npm test -- attempts.service.spec.ts`
Expected: FAIL — `TypeError: service.findAttemptQuestions is not a function` (o método ainda não existe).

- [ ] **Step 3: Implementar o método no service**

Em `src/modules/attempts/attempts.service.ts`, adicione o método abaixo logo depois de `findAttempt` (que termina na linha 72) e antes de `findMyAttempts`:

```ts
  async findAttemptQuestions(attemptId: string, user: RequestUser) {
    const attempt = await this.findAttemptOrThrow(attemptId);
    this.assertCanAccessAttempt(attempt.studentId, user);

    const questions = await this.prisma.question.findMany({
      where: {
        simulationId: attempt.simulationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return questions.map((question) => ({
      id: question.id,
      type: question.type,
      statement: question.statement,
      tip: question.tip,
      points: question.points,
      order: question.sortOrder,
      options: question.options.map((option) => ({
        id: option.id,
        optionKey: option.optionKey,
        text: option.text,
        groupKey: option.groupKey,
        order: option.sortOrder,
      })),
    }));
  }
```

- [ ] **Step 4: Adicionar a rota no controller**

Em `src/modules/attempts/attempts.controller.ts`, adicione o handler abaixo logo depois de `findAttempt` (linha 39) e antes de `submitAnswer`:

```ts
  @Get('attempts/:id/questions')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  findAttemptQuestions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attemptsService.findAttemptQuestions(id, user);
  }
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `npm test -- attempts.service.spec.ts`
Expected: PASS — 6 testes (4 existentes + 2 novos).

- [ ] **Step 6: Atualizar a documentação do endpoint**

Em `README.md`, na seção `### Tentativas`, altere o bloco de rotas de:

```http
POST  /simulations/:simulationId/attempts
GET   /attempts/:id
POST  /attempts/:id/answers
POST  /attempts/:id/questions/:questionId/answer
POST  /attempts/:id/finish
GET   /attempts/:id/result
GET   /me/attempts
```

para:

```http
POST  /simulations/:simulationId/attempts
GET   /attempts/:id
GET   /attempts/:id/questions
POST  /attempts/:id/answers
POST  /attempts/:id/questions/:questionId/answer
POST  /attempts/:id/finish
GET   /attempts/:id/result
GET   /me/attempts
```

E, no parágrafo logo abaixo do bloco, adicione a frase: `GET /attempts/:id/questions` devolve as questões ativas do simulado da tentativa (enunciado, dica, pontos e opções), sem gabarito — usado pelo front-end para renderizar a tentativa em andamento.

- [ ] **Step 7: Commit**

```bash
git add src/modules/attempts/attempts.service.ts src/modules/attempts/attempts.controller.ts src/modules/attempts/attempts.service.spec.ts README.md
git commit -m "feat: adicionar GET /attempts/:id/questions para o aluno consultar questões sem gabarito"
```

---

## Frontend (`simulados-bernardo`)

Todos os caminhos de arquivo abaixo são relativos a `/Users/guilhermeborba/Documents/htdocs/simulados-bernardo`.

### Task 2: Configuração de ambiente e cookies de auth

**Files:**
- Create: `.env.local.example`
- Create: `lib/serverCookies.ts`

**Interfaces:**
- Produces: `ACCESS_TOKEN_COOKIE`, `REFRESH_TOKEN_COOKIE` (constantes de nome de cookie), `AuthTokens` (`{ accessToken: string; refreshToken: string }`), `setAuthCookies(response: NextResponse, tokens: AuthTokens): void`, `clearAuthCookies(response: NextResponse): void` — usados por todas as rotas `app/api/auth/*` e pelo proxy genérico (Tasks 4–6).

- [ ] **Step 1: Criar o arquivo de exemplo de variáveis de ambiente**

Crie `.env.local.example`:

```env
BACKEND_API_URL=http://localhost:3333
```

Copie para `.env.local` localmente (`.env.local` já está no `.gitignore`):

```bash
cp .env.local.example .env.local
```

- [ ] **Step 2: Criar o helper de cookies**

Crie `lib/serverCookies.ts`:

```ts
import { NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'sb_access_token';
export const REFRESH_TOKEN_COOKIE = 'sb_refresh_token';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export function setAuthCookies(response: NextResponse, tokens: AuthTokens): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...baseCookieOptions(), maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...baseCookieOptions(), maxAge: 0 });
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add .env.local.example lib/serverCookies.ts
git commit -m "chore: configurar variável de ambiente do backend e helper de cookies de auth"
```

### Task 3: Helper de fetch server-side para o backend

**Files:**
- Create: `lib/backendFetch.server.ts`

**Interfaces:**
- Consumes: nenhuma (usa `process.env.BACKEND_API_URL`).
- Produces: `BackendResponse` (`{ status: number; body: unknown }`), `backendFetch(path: string, init？: RequestInit): Promise<BackendResponse>` — usado por todas as rotas `app/api/*` (Tasks 4, 5, 6).

- [ ] **Step 1: Criar o helper**

Crie `lib/backendFetch.server.ts`:

```ts
const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3333';

export interface BackendResponse {
  status: number;
  body: unknown;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<BackendResponse> {
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { status: response.status, body };
}
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificação manual rápida**

Com o backend rodando em `localhost:3333`, confirme que o helper alcança o backend criando um script descartável:

```bash
node -e "
fetch('http://localhost:3333/health').then(r => r.text()).then(console.log)
"
```

Expected: corpo de resposta do `/health` (ex.: `{"status":"ok"}`), confirmando que o backend está acessível na porta usada por `BACKEND_API_URL`.

- [ ] **Step 4: Commit**

```bash
git add lib/backendFetch.server.ts
git commit -m "chore: adicionar helper de fetch server-side para o backend"
```

### Task 4: Rotas de registro e login (`POST /api/auth/register`, `POST /api/auth/login`)

**Files:**
- Create: `lib/authResponse.server.ts`
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/login/route.ts`

**Interfaces:**
- Consumes: `backendFetch` (Task 3), `setAuthCookies` (Task 2).
- Produces: `authSuccessResponse(payload: { user: unknown; accessToken: string; refreshToken: string }): NextResponse` — reaproveitado por Task 4 (register/login).

- [ ] **Step 1: Criar o helper de resposta de auth**

Crie `lib/authResponse.server.ts`:

```ts
import { NextResponse } from 'next/server';
import { setAuthCookies } from './serverCookies';

interface BackendAuthPayload {
  user: unknown;
  accessToken: string;
  refreshToken: string;
}

export function authSuccessResponse(payload: BackendAuthPayload): NextResponse {
  const response = NextResponse.json({ user: payload.user });
  setAuthCookies(response, {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  return response;
}
```

- [ ] **Step 2: Criar a rota de login**

Crie `app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backendFetch.server';
import { authSuccessResponse } from '@/lib/authResponse.server';

export async function POST(request: NextRequest) {
  const credentials = await request.json();

  const { status, body } = await backendFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (status !== 200) {
    return NextResponse.json(body, { status });
  }

  return authSuccessResponse(
    body as { user: unknown; accessToken: string; refreshToken: string },
  );
}
```

- [ ] **Step 3: Criar a rota de registro**

Crie `app/api/auth/register/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backendFetch.server';
import { authSuccessResponse } from '@/lib/authResponse.server';

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const { status, body } = await backendFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (status !== 201) {
    return NextResponse.json(body, { status });
  }

  return authSuccessResponse(
    body as { user: unknown; accessToken: string; refreshToken: string },
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Verificação manual**

Com o backend rodando, teste a rota de registro diretamente (ela roda em `localhost:3000` quando `npm run dev` estiver ativo):

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno.teste@example.com","password":"senha12345"}'
```

Expected: `HTTP/1.1 200 OK` (a rota do Next sempre responde 200 no sucesso, mesmo repassando um 201 do backend), corpo `{"user": {...}}` sem `accessToken`/`refreshToken` no JSON, e headers `Set-Cookie` para `sb_access_token` e `sb_refresh_token`.

- [ ] **Step 6: Commit**

```bash
git add lib/authResponse.server.ts app/api/auth/register/route.ts app/api/auth/login/route.ts
git commit -m "feat: adicionar rotas de registro e login com cookies httpOnly"
```

### Task 5: Sessão (`GET /api/auth/me`, `POST /api/auth/logout`) e fetch autenticado com refresh

**Files:**
- Create: `lib/authenticatedBackendFetch.server.ts`
- Create: `app/api/auth/me/route.ts`
- Create: `app/api/auth/logout/route.ts`

**Interfaces:**
- Consumes: `backendFetch` (Task 3), `ACCESS_TOKEN_COOKIE`, `REFRESH_TOKEN_COOKIE`, `setAuthCookies`, `clearAuthCookies` (Task 2).
- Produces: `AuthenticatedFetchResult` (`{ status: number; body: unknown; refreshedTokens？: AuthTokens; shouldClearCookies？: boolean }`), `authenticatedBackendFetch(path: string, init？: RequestInit): Promise<AuthenticatedFetchResult>`, `applyAuthenticatedFetchCookies(response: NextResponse, result: AuthenticatedFetchResult): void` — usados por `app/api/auth/me` e pelo proxy genérico (Task 6).

- [ ] **Step 1: Criar o helper de fetch autenticado com refresh automático**

Crie `lib/authenticatedBackendFetch.server.ts`:

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch } from './backendFetch.server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AuthTokens,
  setAuthCookies,
  clearAuthCookies,
} from './serverCookies';

export interface AuthenticatedFetchResult {
  status: number;
  body: unknown;
  refreshedTokens?: AuthTokens;
  shouldClearCookies?: boolean;
}

export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedFetchResult> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const attempt = (token: string | undefined) =>
    backendFetch(path, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const first = await attempt(accessToken);

  if (first.status !== 401) {
    return first;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return { ...first, shouldClearCookies: true };
  }

  const refreshResult = await backendFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (refreshResult.status !== 200) {
    return { ...first, shouldClearCookies: true };
  }

  const refreshedTokens = refreshResult.body as AuthTokens;
  const retried = await attempt(refreshedTokens.accessToken);

  return { ...retried, refreshedTokens };
}

export function applyAuthenticatedFetchCookies(
  response: NextResponse,
  result: AuthenticatedFetchResult,
): void {
  if (result.refreshedTokens) {
    setAuthCookies(response, result.refreshedTokens);
  } else if (result.shouldClearCookies) {
    clearAuthCookies(response);
  }
}
```

- [ ] **Step 2: Criar a rota `GET /api/auth/me`**

Crie `app/api/auth/me/route.ts`:

```ts
import { NextResponse } from 'next/server';
import {
  authenticatedBackendFetch,
  applyAuthenticatedFetchCookies,
} from '@/lib/authenticatedBackendFetch.server';

export async function GET() {
  const result = await authenticatedBackendFetch('/auth/me');
  const response = NextResponse.json(result.body, { status: result.status });
  applyAuthenticatedFetchCookies(response, result);
  return response;
}
```

- [ ] **Step 3: Criar a rota `POST /api/auth/logout`**

Crie `app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/backendFetch.server';
import { clearAuthCookies, REFRESH_TOKEN_COOKIE } from '@/lib/serverCookies';

export async function POST() {
  const refreshToken = cookies().get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await backendFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Verificação manual**

Com o `npm run dev` do frontend ativo e um cookie de sessão obtido via `curl -c` no registro:

```bash
curl -i -c /tmp/sb-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Dois","email":"aluno.dois@example.com","password":"senha12345"}'

curl -i -b /tmp/sb-cookies.txt http://localhost:3000/api/auth/me
```

Expected: segunda chamada retorna `200` com `{"id":...,"name":"Aluno Dois","email":"aluno.dois@example.com","role":"STUDENT",...}`.

- [ ] **Step 6: Commit**

```bash
git add lib/authenticatedBackendFetch.server.ts app/api/auth/me/route.ts app/api/auth/logout/route.ts
git commit -m "feat: adicionar sessão (me/logout) com refresh automático de token"
```

### Task 6: Proxy genérico do backend (`/api/backend/[...path]`)

**Files:**
- Create: `app/api/backend/[...path]/route.ts`

**Interfaces:**
- Consumes: `authenticatedBackendFetch`, `applyAuthenticatedFetchCookies` (Task 5).
- Produces: rotas `GET/POST/PATCH/DELETE /api/backend/*` — usadas por `lib/apiClient.ts` (Task 7) para todos os endpoints de disciplinas, simulados e tentativas.

- [ ] **Step 1: Criar o handler catch-all**

Crie `app/api/backend/[...path]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import {
  authenticatedBackendFetch,
  applyAuthenticatedFetchCookies,
} from '@/lib/authenticatedBackendFetch.server';

async function handle(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = `/${params.path.join('/')}`;
  const search = request.nextUrl.search;
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  const result = await authenticatedBackendFetch(`${path}${search}`, {
    method: request.method,
    body,
  });

  const response = NextResponse.json(result.body, { status: result.status });
  applyAuthenticatedFetchCookies(response, result);
  return response;
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificação manual**

Reaproveitando o cookie salvo na Task 5:

```bash
curl -i -b /tmp/sb-cookies.txt "http://localhost:3000/api/backend/simulations/available?schoolYear=3&bimester=2&assessment=AV2"
```

Expected: `200` com um array JSON de simulados (pode ser `[]` se o seed ainda não rodou — nesse caso rode `npm run seed` no repositório do backend antes de prosseguir).

- [ ] **Step 4: Commit**

```bash
git add "app/api/backend/[...path]/route.ts"
git commit -m "feat: adicionar proxy autenticado genérico para o backend"
```

### Task 7: Cliente de API tipado (`lib/apiClient.ts`)

**Files:**
- Create: `lib/apiClient.ts`

**Interfaces:**
- Consumes: rotas `/api/auth/*` (Tasks 4–5) e `/api/backend/*` (Task 6) via `fetch` relativo.
- Produces: `AuthUser`, `login`, `register`, `logout`, `getMe`, `ApiDiscipline`, `ApiSimulation`, `getAvailableSimulations`, `ApiAttempt`, `startAttempt`, `ApiQuestionOption`, `ApiQuestion`, `getAttemptQuestions`, `submitAttemptAnswer`, `ApiAttemptResultQuestion`, `ApiAttemptResult`, `finishAttempt`, `getAttemptResult`, `ApiMyAttempt`, `getMyAttempts` — usados por `contexts/AuthContext.tsx` (Task 8), `components/LoginForm.tsx`/`RegisterForm.tsx` (Tasks 10–11), `components/DisciplineStep.tsx` (Task 13), `components/SimuladoRunner.tsx` (Task 14) e `components/HistoricoList.tsx` (Task 16).

- [ ] **Step 1: Criar o cliente de API**

Crie `lib/apiClient.ts`:

```ts
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const rawMessage = (body as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : rawMessage ?? 'Erro inesperado';
    throw new Error(message);
  }

  return body as T;
}

export function login(email: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return apiFetch<{ success: true }>('/api/auth/logout', { method: 'POST' });
}

export function getMe() {
  return apiFetch<AuthUser>('/api/auth/me');
}

export interface ApiDiscipline {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  themeColor: string | null;
}

export interface ApiSimulation {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  schoolYear: number;
  bimester: number;
  assessment: string;
  totalQuestions: number;
  maxScore: string;
  estimatedDurationMinutes: number | null;
  discipline: ApiDiscipline;
}

export function getAvailableSimulations(params: {
  schoolYear: number;
  bimester: number;
  assessment: string;
}) {
  const query = new URLSearchParams({
    schoolYear: String(params.schoolYear),
    bimester: String(params.bimester),
    assessment: params.assessment,
  });

  return apiFetch<ApiSimulation[]>(`/api/backend/simulations/available?${query.toString()}`);
}

export interface ApiAttempt {
  id: string;
  status: string;
  simulationId: string;
}

export function startAttempt(simulationId: string) {
  return apiFetch<ApiAttempt>(`/api/backend/simulations/${simulationId}/attempts`, {
    method: 'POST',
  });
}

export interface ApiQuestionOption {
  id: string;
  optionKey: string;
  text: string;
  groupKey: string | null;
  order: number;
}

export interface ApiQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_MULTIPLE' | 'MATCHING' | 'CLASSIFICATION';
  statement: string;
  tip: string | null;
  points: string;
  order: number;
  options: ApiQuestionOption[];
}

export function getAttemptQuestions(attemptId: string) {
  return apiFetch<ApiQuestion[]>(`/api/backend/attempts/${attemptId}/questions`);
}

export function submitAttemptAnswer(
  attemptId: string,
  questionId: string,
  answer: Record<string, unknown>,
) {
  return apiFetch(`/api/backend/attempts/${attemptId}/questions/${questionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
}

export interface ApiAttemptResultQuestion {
  id: string;
  type: ApiQuestion['type'];
  statement: string;
  tip: string | null;
  points: string;
  order: number;
  answer: unknown;
  isCorrect: boolean;
  pointsEarned: string;
}

export interface ApiAttemptResult {
  attempt: ApiAttempt & {
    score: string;
    maxScore: string;
    percentage: string;
    correctCount: number;
    wrongCount: number;
  };
  questions: ApiAttemptResultQuestion[];
}

export function finishAttempt(attemptId: string) {
  return apiFetch<ApiAttemptResult>(`/api/backend/attempts/${attemptId}/finish`, {
    method: 'POST',
  });
}

export function getAttemptResult(attemptId: string) {
  return apiFetch<ApiAttemptResult>(`/api/backend/attempts/${attemptId}/result`);
}

export interface ApiMyAttempt {
  id: string;
  status: string;
  score: string | null;
  maxScore: string;
  percentage: string | null;
  createdAt: string;
  finishedAt: string | null;
  simulation: {
    title: string;
    assessment: string;
    discipline: { name: string };
  };
}

export function getMyAttempts() {
  return apiFetch<ApiMyAttempt[]>('/api/backend/me/attempts');
}
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lib/apiClient.ts
git commit -m "feat: adicionar cliente de API tipado para autenticação, simulados e tentativas"
```

### Task 8: Contexto de autenticação (`AuthContext`)

**Files:**
- Create: `contexts/AuthContext.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `getMe`, `login`, `register`, `logout`, `AuthUser` (Task 7).
- Produces: `AuthProvider` (componente), `useAuth(): { user: AuthUser | null; isLoading: boolean; login; register; logout }` — usado por `middleware`/páginas protegidas indiretamente e diretamente por `SelectionScreen.tsx` (Task 13), `LoginForm.tsx`/`RegisterForm.tsx` (Tasks 10–11) e `HistoricoList.tsx` (Task 16).

- [ ] **Step 1: Criar o contexto**

Crie `contexts/AuthContext.tsx`:

```tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  AuthUser,
} from '@/lib/apiClient';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await apiLogin(email, password);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user: registeredUser } = await apiRegister(name, email, password);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
```

- [ ] **Step 2: Envolver a aplicação com o provider**

Em `app/layout.tsx`, adicione o import e envolva `{children}`:

```tsx
import type { Metadata } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
```

E troque:

```tsx
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
```

por:

```tsx
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add contexts/AuthContext.tsx app/layout.tsx
git commit -m "feat: adicionar AuthContext e prover sessão no layout raiz"
```

### Task 9: Middleware de proteção de rota

**Files:**
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `ACCESS_TOKEN_COOKIE` (Task 2).
- Produces: redireciona para `/login?returnTo=...` requisições não autenticadas a `/simulado/*` e `/historico` — consumido pelas rotas criadas nas Tasks 14 e 16, e testado pelo `LoginForm` (Task 10, `returnTo`).

- [ ] **Step 1: Criar o middleware**

Crie `middleware.ts` na raiz do projeto (mesmo nível de `app/`):

```ts
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/serverCookies';

const PROTECTED_PREFIXES = ['/simulado/', '/historico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (hasAccessToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/simulado/:path*', '/historico'],
};
```

Nota: o middleware só checa a **presença** do cookie, não a validade da assinatura — a validação real acontece a cada chamada ao backend via `authenticatedBackendFetch` (Task 5), que já limpa os cookies e devolve 401 se o token for inválido.

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificação manual**

Com o servidor dev rodando e sem cookies de sessão:

```bash
curl -i http://localhost:3000/historico
```

Expected: `307` (ou `308`) redirecionando para `/login?returnTo=%2Fhistorico`.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: proteger rotas de simulado e histórico com middleware de sessão"
```

### Task 10: Página de login

**Files:**
- Create: `components/LoginForm.tsx`
- Create: `app/login/page.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 8).
- Produces: rota `/login`, consumida pelo redirecionamento do middleware (Task 9) e pelos links de `RegisterForm` (Task 11).

- [ ] **Step 1: Criar o formulário de login**

Crie `components/LoginForm.tsx`:

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(searchParams.get('returnTo') || '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="card card--hero">
          <h1 className="text-3xl mb-6 text-center">📚 Entrar</h1>

          <form onSubmit={handleSubmit}>
            <label className="block text-left text-sm font-bold mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field mb-4"
              required
            />

            <label className="block text-left text-sm font-bold mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="input-field mb-4"
              required
            />

            {error && (
              <p className="text-sm mb-4" style={{ color: 'var(--bubble-deep)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn--lg w-full btn--grass"
            >
              {isSubmitting ? 'Entrando...' : '✨ Entrar'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
            Não tem conta?{' '}
            <Link href="/registro" className="font-bold" style={{ color: 'var(--ink)' }}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página**

Crie `app/login/page.tsx`:

```tsx
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Entrar — Simulados Bernardo',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Com `npm run dev` ativo, abra `http://localhost:3000/login` no navegador, entre com um e-mail/senha cadastrados na Task 4/5 e confirme redirecionamento para `/` com sessão ativa (sem erro no console).

- [ ] **Step 5: Commit**

```bash
git add components/LoginForm.tsx app/login/page.tsx
git commit -m "feat: adicionar página de login"
```

### Task 11: Página de registro

**Files:**
- Create: `components/RegisterForm.tsx`
- Create: `app/registro/page.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 8).
- Produces: rota `/registro`.

- [ ] **Step 1: Criar o formulário de registro**

Crie `components/RegisterForm.tsx`:

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="card card--hero">
          <h1 className="text-3xl mb-6 text-center">✨ Criar conta</h1>

          <form onSubmit={handleSubmit}>
            <label className="block text-left text-sm font-bold mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="input-field mb-4"
              required
              minLength={2}
            />

            <label className="block text-left text-sm font-bold mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field mb-4"
              required
            />

            <label className="block text-left text-sm font-bold mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="input-field mb-4"
              required
              minLength={8}
            />

            {error && (
              <p className="text-sm mb-4" style={{ color: 'var(--bubble-deep)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn--lg w-full btn--grass"
            >
              {isSubmitting ? 'Criando conta...' : '✨ Criar conta'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" className="font-bold" style={{ color: 'var(--ink)' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página**

Crie `app/registro/page.tsx`:

```tsx
import { Suspense } from 'react';
import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Criar conta — Simulados Bernardo',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Abra `http://localhost:3000/registro`, crie uma conta nova e confirme redirecionamento para `/` autenticado.

- [ ] **Step 5: Commit**

```bash
git add components/RegisterForm.tsx app/registro/page.tsx
git commit -m "feat: adicionar página de registro"
```

### Task 12: Adapter de tipos de questão

**Files:**
- Create: `lib/questionMapper.ts`

**Interfaces:**
- Consumes: `ApiQuestion`, `ApiQuestionOption` (Task 7).
- Produces: `TemplateOption`, `TemplateItem`, `TemplatePair`, `TemplateQuestion`, `mapApiQuestion(question: ApiQuestion): TemplateQuestion`, `buildAnswerBody(type: TemplateQuestion['type'], rawAnswer: unknown): Record<string, unknown>` — usados por `components/SimuladoRunner.tsx` (Task 14).

- [ ] **Step 1: Criar o adapter**

Crie `lib/questionMapper.ts`:

```ts
import type { ApiQuestion, ApiQuestionOption } from './apiClient';

export interface TemplateOption {
  id: string;
  text: string;
}

export interface TemplateItem {
  id: string;
  text: string;
}

export interface TemplatePair {
  left: TemplateItem;
  right: TemplateOption[];
}

export interface TemplateQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_multiple' | 'matching' | 'classification';
  text: string;
  tip: string;
  points: number;
  order: number;
  options?: TemplateOption[];
  items?: TemplateItem[];
  pairs?: TemplatePair[];
}

const TYPE_MAP: Record<ApiQuestion['type'], TemplateQuestion['type']> = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE_MULTIPLE: 'true_false_multiple',
  MATCHING: 'matching',
  CLASSIFICATION: 'classification',
};

export function mapApiQuestion(question: ApiQuestion): TemplateQuestion {
  const base = {
    id: question.id,
    type: TYPE_MAP[question.type],
    text: question.statement,
    tip: question.tip ?? '',
    points: Number(question.points),
    order: question.order,
  };

  if (question.type === 'MULTIPLE_CHOICE') {
    return {
      ...base,
      options: question.options.map((option) => ({ id: option.optionKey, text: option.text })),
    };
  }

  if (question.type === 'TRUE_FALSE_MULTIPLE' || question.type === 'CLASSIFICATION') {
    return {
      ...base,
      items: question.options.map((option) => ({ id: option.optionKey, text: option.text })),
    };
  }

  return { ...base, pairs: buildMatchingPairs(question.options) };
}

function buildMatchingPairs(options: ApiQuestionOption[]): TemplatePair[] {
  const leftOptions = options.filter((option) => option.groupKey === 'left');
  const rightOptions = options
    .filter((option) => option.groupKey === 'right')
    .map((option) => ({ id: stripPrefix(option.optionKey, 'right:'), text: option.text }));

  return leftOptions.map((option) => ({
    left: { id: stripPrefix(option.optionKey, 'left:'), text: option.text },
    right: rightOptions,
  }));
}

function stripPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function buildAnswerBody(
  type: TemplateQuestion['type'],
  rawAnswer: unknown,
): Record<string, unknown> {
  if (type === 'multiple_choice') {
    return { answer: rawAnswer as string };
  }

  return rawAnswer as Record<string, unknown>;
}
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificação manual do mapeamento**

Rode um script descartável comparando com o formato que o backend realmente grava (confirma que `groupKey`/`optionKey` batem com `prisma/seed.ts` do backend):

```bash
node -e "
const { mapApiQuestion, buildAnswerBody } = require('./lib/questionMapper.ts');
" 2>&1 | head -5
```

Como é TypeScript, essa checagem via `node` direta não roda — em vez disso, valide visualmente: abra `getAttemptQuestions` no navegador (Network tab) durante o smoke test da Task 17 e confirme que uma questão `MATCHING` tem metade das opções com `groupKey: "left"` e metade com `groupKey: "right"`, e que os `pairs` renderizados na Task 14 mostram o texto certo dos dois lados.

- [ ] **Step 4: Commit**

```bash
git add lib/questionMapper.ts
git commit -m "feat: adicionar adapter de tipos de questão da API para o formato de UI"
```

### Task 13: Fluxo de seleção ligado à API (auth gate + disciplinas ao vivo)

**Files:**
- Modify: `components/SelectionStep.tsx` (exportar mapa ano → schoolYear)
- Modify: `components/SelectionScreen.tsx` (auth gate no avanço)
- Modify: `components/DisciplineStep.tsx` (busca simulados via API)

**Interfaces:**
- Consumes: `YEARS` (interno a `SelectionStep.tsx`), `useAuth` (Task 8), `getAvailableSimulations`, `ApiSimulation` (Task 7).
- Produces: `YEAR_TO_SCHOOL_YEAR: Record<string, number>` exportado de `SelectionStep.tsx`, consumido por `DisciplineStep.tsx`.

- [ ] **Step 1: Exportar o mapa de ano em `SelectionStep.tsx`**

Em `components/SelectionStep.tsx`, logo depois da declaração de `const YEARS: ... = [...]` (linha 28, fechamento do array), adicione:

```ts
export const YEAR_TO_SCHOOL_YEAR: Record<string, number> = Object.fromEntries(
  YEARS.map((y) => [y.value, y.num]),
);
```

- [ ] **Step 2: Adicionar o auth gate em `SelectionScreen.tsx`**

Em `components/SelectionScreen.tsx`, adicione os imports:

```tsx
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
```

Dentro de `SelectionScreen`, logo após as declarações de `useState`, adicione:

```tsx
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const requireAuth = (proceed: () => void) => {
    if (isLoading) {
      return;
    }
    if (!user) {
      router.push('/login?returnTo=/');
      return;
    }
    proceed();
  };
```

E troque o bloco do `HeroStep`:

```tsx
  if (step === 'hero') {
    return (
      <HeroStep
        onStart={() => setStep('selection')}
        onViewDisciplines={() => {
          setSelectedYear('terceiro');
          setSelectedBimestre('2');
          setSelectedAssessment('AV2');
          setStep('discipline');
        }}
      />
    );
  }
```

por:

```tsx
  if (step === 'hero') {
    return (
      <HeroStep
        onStart={() => requireAuth(() => setStep('selection'))}
        onViewDisciplines={() =>
          requireAuth(() => {
            setSelectedYear('terceiro');
            setSelectedBimestre('2');
            setSelectedAssessment('AV2');
            setStep('discipline');
          })
        }
      />
    );
  }
```

- [ ] **Step 3: Reescrever `DisciplineStep.tsx` para buscar simulados na API**

Substitua todo o conteúdo de `components/DisciplineStep.tsx` por:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Year, Bimestre, Assessment } from './SelectionStep';
import { YEAR_TO_SCHOOL_YEAR } from './SelectionStep';
import { getAvailableSimulations, ApiSimulation } from '@/lib/apiClient';

interface DisciplineStepProps {
  year: Year;
  bimestre: Bimestre;
  assessment: Assessment;
  onBack: () => void;
}

const YEAR_LABELS: Record<string, string> = {
  primeiro: '1º Ano', segundo: '2º Ano', terceiro: '3º Ano', quarto: '4º Ano',
  quinto: '5º Ano', sexto: '6º Ano', setimo: '7º Ano', oitavo: '8º Ano', nono: '9º Ano',
};
const BIM_LABELS: Record<string, string> = {
  '1': '1º Bimestre', '2': '2º Bimestre', '3': '3º Bimestre', '4': '4º Bimestre',
};

export default function DisciplineStep({ year, bimestre, assessment, onBack }: DisciplineStepProps) {
  const router = useRouter();
  const [simulations, setSimulations] = useState<ApiSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const schoolYear = YEAR_TO_SCHOOL_YEAR[year];

    if (!schoolYear || !bimestre) {
      return;
    }

    setIsLoading(true);
    setError(null);

    getAvailableSimulations({ schoolYear, bimester: Number(bimestre), assessment })
      .then(setSimulations)
      .catch(() => setError('Não foi possível carregar as disciplinas.'))
      .finally(() => setIsLoading(false));
  }, [year, bimestre, assessment]);

  const handleStart = (simulation: ApiSimulation) => {
    router.push(`/simulado/${simulation.id}`);
  };

  return (
    <div className="page-shell flex flex-col px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-6 w-full max-w-5xl mx-auto">
        <button className="btn btn--ghost text-sm flex items-center gap-1" onClick={onBack} style={{ padding: '8px 16px' }}>
          ‹ Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span className="font-bold text-base" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
            Simulados Bernardo
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:block" style={{ color: 'var(--muted)' }}>
          03 · DISCIPLINAS
        </span>
      </div>

      <div className="w-full max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', fontSize: 38, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
            Escolha uma disciplina
          </h2>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 15 }}>
            Selecione o simulado que você quer praticar.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold flex-shrink-0"
             style={{ background: 'white', border: '1.5px solid var(--line)', color: 'var(--ink)', boxShadow: 'var(--shadow-1)' }}>
          <span style={{ color: 'var(--grass-deep)' }}>✦</span>
          {YEAR_LABELS[year] ?? year} · {BIM_LABELS[bimestre] ?? bimestre} · {assessment}
        </div>
      </div>

      {isLoading && <p className="text-center" style={{ color: 'var(--muted)' }}>Carregando disciplinas...</p>}
      {error && <p className="text-center" style={{ color: 'var(--bubble-deep)' }}>{error}</p>}
      {!isLoading && !error && simulations.length === 0 && (
        <p className="text-center" style={{ color: 'var(--muted)' }}>
          Nenhum simulado disponível para essa combinação ainda.
        </p>
      )}

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {simulations.map((simulation) => {
          const accent = simulation.discipline.themeColor ?? '#4A95E5';
          return (
            <div key={simulation.id} style={{
              background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '28px 24px 20px',
            }}>
              <div style={{ fontSize: 56, lineHeight: 1, textAlign: 'center', marginBottom: 20 }}>
                {simulation.discipline.icon ?? '📘'}
              </div>
              <div style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 26, color: 'var(--ink)', marginBottom: 8 }}>
                {simulation.discipline.name}
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink)', opacity: 0.7, lineHeight: 1.5, marginBottom: 20, flex: 1 }}>
                {simulation.subtitle ?? simulation.title}
              </p>
              <button
                onClick={() => handleStart(simulation)}
                style={{
                  background: accent, color: 'white', border: 'none', borderRadius: 'var(--radius-pill)',
                  padding: '13px 24px', fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', marginBottom: 20,
                }}
              >
                ▶ Começar
              </button>
              <div style={{
                borderTop: '1.5px dashed rgba(43,34,64,.15)', paddingTop: 14, display: 'flex', gap: 12,
                fontSize: 12, fontWeight: 600, color: 'var(--ink)', opacity: 0.6,
              }}>
                <span>📋 {simulation.totalQuestions} questões</span>
                {simulation.estimatedDurationMinutes && <span>⏰ ~{simulation.estimatedDurationMinutes} min</span>}
                <span>⚡ {simulation.maxScore} moedinhas</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Verificação manual**

Com o backend rodando e o seed aplicado (`npm run seed` no repo do backend), navegue em `http://localhost:3000` sem sessão: "Vamos começar!" deve redirecionar para `/login`. Depois de logar, avance até a etapa de disciplinas e confirme que os cards vêm da API (troque `bimestre`/`assessment` e veja a lista mudar).

- [ ] **Step 6: Commit**

```bash
git add components/SelectionStep.tsx components/SelectionScreen.tsx components/DisciplineStep.tsx
git commit -m "feat: proteger fluxo de seleção com auth e listar disciplinas via API"
```

### Task 14: Execução da tentativa (`SimuladoRunner`) e rota dinâmica

**Files:**
- Create: `components/SimuladoRunner.tsx`
- Create: `app/simulado/[simulationId]/page.tsx`

**Interfaces:**
- Consumes: `startAttempt`, `getAttemptQuestions`, `submitAttemptAnswer`, `finishAttempt`, `ApiAttemptResult` (Task 7); `mapApiQuestion`, `buildAnswerBody`, `TemplateQuestion` (Task 12).
- Produces: rota `/simulado/[simulationId]`, consumida pelos links de `DisciplineStep.tsx` (Task 13).

- [ ] **Step 1: Criar o componente de execução da tentativa**

Crie `components/SimuladoRunner.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  startAttempt,
  getAttemptQuestions,
  submitAttemptAnswer,
  finishAttempt,
  ApiAttemptResult,
} from '@/lib/apiClient';
import { mapApiQuestion, buildAnswerBody, TemplateQuestion } from '@/lib/questionMapper';

interface SimuladoRunnerProps {
  simulationId: string;
}

type RunnerState = 'loading' | 'ready' | 'finished' | 'error';

export default function SimuladoRunner({ simulationId }: SimuladoRunnerProps) {
  const router = useRouter();
  const [state, setState] = useState<RunnerState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TemplateQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: unknown }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ApiAttemptResult | null>(null);

  useEffect(() => {
    void loadAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);

  async function loadAttempt() {
    setState('loading');
    setCurrentIndex(0);
    setUserAnswers({});
    setResult(null);

    try {
      const attempt = await startAttempt(simulationId);
      const apiQuestions = await getAttemptQuestions(attempt.id);
      const mapped = apiQuestions.map(mapApiQuestion).sort((a, b) => a.order - b.order);

      setAttemptId(attempt.id);
      setQuestions(mapped);
      setState('ready');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao carregar o simulado');
      setState('error');
    }
  }

  function handleAnswerChange(questionId: string, answer: unknown) {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleConfirm() {
    if (!attemptId) return;

    const question = questions[currentIndex];
    const answer = userAnswers[question.id];

    setIsSubmitting(true);

    try {
      await submitAttemptAnswer(attemptId, question.id, buildAnswerBody(question.type, answer));

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const finalResult = await finishAttempt(attemptId);
        setResult(finalResult);
        setState('finished');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar resposta');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (state === 'loading') {
    return (
      <div className="page-shell flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>Preparando seu simulado...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <p className="mb-4" style={{ color: 'var(--bubble-deep)' }}>{errorMessage}</p>
          <button className="btn btn--grass" onClick={() => router.push('/')}>Voltar ao início</button>
        </div>
      </div>
    );
  }

  if (state === 'finished' && result) {
    return <ResultScreen result={result} onRetry={loadAttempt} onExit={() => router.push('/')} />;
  }

  const question = questions[currentIndex];
  const userAnswer = userAnswers[question.id];
  const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="page-shell flex flex-col px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-5 w-full max-w-2xl mx-auto">
        <button className="btn btn--ghost text-sm" onClick={() => router.push('/')} style={{ padding: '8px 16px' }}>
          ‹ Sair
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span className="font-bold text-base" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
            Simulados Bernardo
          </span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest hidden sm:block" style={{ color: 'var(--muted)' }}>
          QUESTÃO {currentIndex + 1}
        </span>
      </div>

      <div className="w-full max-w-2xl mx-auto mb-5 flex items-center gap-3">
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: 999,
            background: 'linear-gradient(90deg, var(--bubble), var(--sky))', transition: 'width .4s ease',
          }} />
        </div>
        <span style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', flexShrink: 0 }}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-[1.75rem] p-6 md:p-8" style={{ boxShadow: 'var(--shadow-3)' }}>
        <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold mb-5"
             style={{ background: '#FFE0EE', color: 'var(--bubble-deep)' }}>
          + Questão {currentIndex + 1}
        </div>

        <p style={{ fontFamily: 'var(--font-nunito)', fontWeight: 700, color: 'var(--ink)', fontSize: 18, lineHeight: 1.55, marginBottom: 24 }}>
          {question.text}
        </p>

        {question.type === 'multiple_choice' && question.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.options.map((option) => {
              const isSelected = userAnswer === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerChange(question.id, option.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--bubble)' : 'var(--line)'}`,
                    background: isSelected ? '#FFF0F7' : 'white', display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily: 'var(--font-nunito)', fontWeight: 600, color: 'var(--ink)', fontSize: 15,
                    cursor: 'pointer', boxShadow: 'var(--shadow-1)',
                  }}
                >
                  <span style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800,
                    background: isSelected ? 'var(--bubble)' : '#FFE9A3', color: isSelected ? 'white' : '#8B6000',
                  }}>
                    {option.id.toUpperCase()}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'true_false_multiple' && question.items && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.items.map((item) => {
              const selectedValue = (userAnswer as Record<string, string> | undefined)?.[item.id];
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 'var(--radius-md)', border: '2px solid var(--line)', background: 'white', boxShadow: 'var(--shadow-1)',
                }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-nunito)', fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
                    {item.text}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['V', 'F'].map((opt) => (
                      <button key={opt}
                        onClick={() => handleAnswerChange(question.id, { ...(userAnswer as Record<string, string>), [item.id]: opt })}
                        style={{
                          width: 44, height: 44, borderRadius: 12, border: 'none',
                          fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 16,
                          background: selectedValue === opt ? (opt === 'V' ? 'var(--grass)' : 'var(--bubble)') : '#F0EDE8',
                          color: selectedValue === opt ? 'white' : 'var(--muted)', cursor: 'pointer',
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'matching' && question.pairs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.pairs.map((pair) => {
              const selected = (userAnswer as Record<string, string> | undefined)?.[pair.left.id];
              return (
                <div key={pair.left.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 'var(--radius-md)', border: '2px solid var(--line)', background: 'white', boxShadow: 'var(--shadow-1)',
                }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-nunito)', fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
                    {pair.left.text}
                  </span>
                  <select
                    value={selected || ''}
                    onChange={(e) => handleAnswerChange(question.id, { ...(userAnswer as Record<string, string>), [pair.left.id]: e.target.value })}
                    style={{
                      padding: '8px 12px', borderRadius: 10, border: `2px solid ${selected ? 'var(--sky)' : 'var(--line)'}`,
                      fontFamily: 'var(--font-nunito)', fontWeight: 600, fontSize: 13,
                      background: selected ? '#F0F7FF' : 'white', color: 'var(--ink)', cursor: 'pointer',
                    }}
                  >
                    <option value="">— Escolha —</option>
                    {pair.right.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.text}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'classification' && question.items && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.items.map((item) => {
              const selectedValue = (userAnswer as Record<string, string> | undefined)?.[item.id];
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 'var(--radius-md)', border: '2px solid var(--line)', background: 'white', boxShadow: 'var(--shadow-1)',
                }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-nunito)', fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
                    {item.text}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['C', 'P'].map((opt) => (
                      <button key={opt}
                        onClick={() => handleAnswerChange(question.id, { ...(userAnswer as Record<string, string>), [item.id]: opt })}
                        style={{
                          width: 44, height: 44, borderRadius: 12, border: 'none',
                          fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 14,
                          background: selectedValue === opt ? 'var(--sky)' : '#F0EDE8',
                          color: selectedValue === opt ? 'white' : 'var(--muted)', cursor: 'pointer',
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16, borderTop: '1.5px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                flex: 1, height: 6, borderRadius: 999,
                background: i === currentIndex ? 'var(--bubble)' : q.id in userAnswers ? 'var(--grass)' : 'var(--line)',
                transition: 'background .2s',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {currentIndex > 0 ? (
              <button onClick={handleBack} style={{
                background: 'white', border: '2px solid var(--line)', borderRadius: 'var(--radius-pill)',
                padding: '10px 20px', fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 15,
                color: 'var(--ink-soft)', cursor: 'pointer', boxShadow: 'var(--shadow-1)',
              }}>
                ← Anterior
              </button>
            ) : <div />}

            <button
              onClick={handleConfirm}
              disabled={!hasAnswer || isSubmitting}
              style={{
                background: hasAnswer ? 'white' : 'var(--line)',
                border: `2px solid ${hasAnswer ? 'var(--line)' : 'transparent'}`,
                borderRadius: 'var(--radius-pill)', padding: '10px 24px',
                fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: 16,
                color: hasAnswer ? 'var(--ink)' : 'var(--muted)',
                cursor: hasAnswer ? 'pointer' : 'not-allowed',
                boxShadow: hasAnswer ? 'var(--shadow-1)' : 'none',
              }}
            >
              {isSubmitting ? 'Enviando...' : isLast ? 'Finalizar ✓' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({
  result,
  onRetry,
  onExit,
}: {
  result: ApiAttemptResult;
  onRetry: () => void;
  onExit: () => void;
}) {
  const score = Number(result.attempt.score ?? 0);
  const maxScore = Number(result.attempt.maxScore);
  const pct = Math.round((score / maxScore) * 100);
  const circumference = 2 * Math.PI * 44;
  const strokeDash = (score / maxScore) * circumference;
  const motivational = getMotivationalMessage(pct);

  return (
    <div className="page-shell">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
            📚 Resultado
          </span>
          <span className="badge">Concluído</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 flex flex-col gap-5">
            <div className="card card--hero flex items-center gap-6">
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" strokeWidth="10" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--grass)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${strokeDash} ${circumference}`} />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                      style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px', fontFamily: 'var(--font-fredoka)', fill: 'var(--ink)' }}>
                  <tspan fontSize="24" fontWeight="800">{score}</tspan>
                  <tspan fontSize="13" fill="var(--muted)"> /{maxScore}</tspan>
                </text>
              </svg>

              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
                  {motivational.emoji} {motivational.title}!
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                  {motivational.message}
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(237,255,245,.9)',
                  borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 700, color: 'var(--grass-deep)',
                }}>
                  ✅ {pct}% de aproveitamento
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
                📊 Análise detalhada
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {result.questions.map((question, idx) => (
                  <div key={question.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                        background: question.isCorrect ? 'rgba(237,255,245,.9)' : 'rgba(255,240,247,.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                      }}>
                        {question.isCorrect ? '✅' : '❌'}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>
                        Questão {idx + 1}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: question.isCorrect ? 'var(--grass-deep)' : 'var(--bubble-deep)' }}>
                        {question.isCorrect ? `+${question.pointsEarned} pt` : '0 pt'}
                      </div>
                    </div>
                    {!question.isCorrect && question.tip && (
                      <div style={{ marginBottom: 8, padding: '10px 14px', background: '#FFF8D6', border: '1.5px solid var(--sun)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#6B4A00', lineHeight: 1.5 }}>
                        💡 {question.tip}
                      </div>
                    )}
                    {idx < result.questions.length - 1 && <div style={{ height: 1, background: 'var(--line)' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="text-xs font-bold" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                O que fazer agora?
              </p>
              <button className="btn btn--sky w-full" onClick={onRetry}>🔄 Refazer simulado</button>
              <button className="btn btn--lilac w-full" onClick={onExit}>📚 Outra disciplina</button>
              <button className="btn btn--ghost w-full" onClick={onExit}>🏠 Voltar ao início</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMotivationalMessage(percentage: number) {
  if (percentage === 100) {
    return { emoji: '🏆', title: 'Perfeição Total', message: 'Você é um verdadeiro campeão! Acertou TODAS as questões! 🌟' };
  }
  if (percentage >= 90) {
    return { emoji: '⭐', title: 'Excelente', message: 'Você é incrível! Apenas um detalhe faltou para a perfeição! 🚀' };
  }
  if (percentage >= 70) {
    return { emoji: '👏', title: 'Muito Bom', message: 'Parabéns! Você está no caminho certo! Siga estudando! 📚' };
  }
  if (percentage >= 50) {
    return { emoji: '💪', title: 'Bom Início', message: 'Você está aprendendo! Continue praticando para melhorar! 🎯' };
  }
  return { emoji: '🌱', title: 'Próxima Vez', message: 'Você está no caminho! Revise os conteúdos e tente novamente! 💡' };
}
```

- [ ] **Step 2: Criar a rota dinâmica**

Crie `app/simulado/[simulationId]/page.tsx`:

```tsx
import { Suspense } from 'react';
import SimuladoRunner from '@/components/SimuladoRunner';

export default function SimuladoPage({ params }: { params: { simulationId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Carregando...</div>}>
      <SimuladoRunner simulationId={params.simulationId} />
    </Suspense>
  );
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificação manual completa do fluxo de tentativa**

Logado, siga o fluxo até um card de disciplina e clique "Começar". Confirme: (1) a primeira questão aparece com o tipo correto de UI (múltipla escolha/V-F/associação/classificação conforme o simulado escolhido); (2) cada "Confirmar" gera uma chamada de rede `POST /api/backend/attempts/.../questions/.../answer` com status 200 (aba Network); (3) na última questão, "Finalizar" mostra a tela de resultado com pontuação e, nas erradas, a dica; (4) "Refazer simulado" cria uma nova tentativa do zero.

- [ ] **Step 5: Commit**

```bash
git add components/SimuladoRunner.tsx "app/simulado/[simulationId]/page.tsx"
git commit -m "feat: implementar execução de tentativa via API com correção no servidor"
```

### Task 15: Remover o fluxo estático legado

**Files:**
- Delete: `app/simulado-ciencias/`, `app/simulado-ciencias-av1/`, `app/simulado-ciencias-av2/`, `app/simulado-geografia/`, `app/simulado-geografia-av1/`, `app/simulado-geografia-av2/`, `app/simulado-historia/`, `app/simulado-historia-av1/`, `app/simulado-historia-av2/`, `app/simulado-matematica/`, `app/simulado-matematica-av1/`, `app/simulado-matematica-av2/`, `app/simulado-portugues/`, `app/simulado-portugues-av2/` (14 diretórios de rota estática)
- Delete: `app/simulados/` (rota morta que só redirecionava para `/`)
- Delete: `components/SimuladoTemplate.tsx`, `components/SimuladoPortugues.tsx`, `components/SimuladoPortuguesPageClient.tsx`
- Delete: `components/SimuladosDisplay.tsx`, `components/SimuladosPageClient.tsx` (código morto — não referenciados por nenhuma rota ativa)
- Delete: `data/` (diretório inteiro — 13 arquivos `questoes-*.ts` com gabaritos embutidos no bundle)

**Interfaces:**
- Consumes: nenhuma (apenas remoção).
- Produces: nenhuma.

- [ ] **Step 1: Confirmar que nada mais referencia os arquivos antes de apagar**

```bash
grep -rn "SimuladoTemplate\|SimuladoPortugues\|SimuladosDisplay\|SimuladosPageClient\|from '@/data\|from '../data\|require(.*data/questoes" app components lib contexts 2>/dev/null
```

Expected: nenhuma ocorrência fora dos próprios arquivos que serão apagados (se aparecer algo em `app/simulado-*` ou nos componentes listados acima, é esperado — são os arquivos deste Task).

- [ ] **Step 2: Apagar as rotas estáticas e a rota morta**

```bash
rm -rf app/simulado-ciencias app/simulado-ciencias-av1 app/simulado-ciencias-av2 \
       app/simulado-geografia app/simulado-geografia-av1 app/simulado-geografia-av2 \
       app/simulado-historia app/simulado-historia-av1 app/simulado-historia-av2 \
       app/simulado-matematica app/simulado-matematica-av1 app/simulado-matematica-av2 \
       app/simulado-portugues app/simulado-portugues-av2 \
       app/simulados
```

- [ ] **Step 3: Apagar os componentes legados**

```bash
rm -f components/SimuladoTemplate.tsx components/SimuladoPortugues.tsx components/SimuladoPortuguesPageClient.tsx \
      components/SimuladosDisplay.tsx components/SimuladosPageClient.tsx
```

- [ ] **Step 4: Apagar os dados estáticos**

```bash
rm -rf data
```

- [ ] **Step 5: Checar tipos e build de produção**

Run: `npx tsc --noEmit && npm run build`
Expected: ambos concluem sem erro — confirma que nenhuma rota/import quebrado ficou para trás.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remover fluxo estático legado (rotas por disciplina, dados locais com gabarito)"
```

### Task 16: Página de histórico

**Files:**
- Create: `components/HistoricoList.tsx`
- Create: `app/historico/page.tsx`

**Interfaces:**
- Consumes: `getMyAttempts`, `ApiMyAttempt` (Task 7), `useAuth` (Task 8).
- Produces: rota `/historico`, protegida pelo middleware (Task 9).

- [ ] **Step 1: Criar o componente de listagem**

Crie `components/HistoricoList.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyAttempts, ApiMyAttempt } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export default function HistoricoList() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [attempts, setAttempts] = useState<ApiMyAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyAttempts()
      .then(setAttempts)
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="page-shell flex flex-col px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-6 w-full max-w-3xl mx-auto">
        <Link href="/" className="btn btn--ghost text-sm" style={{ padding: '8px 16px' }}>‹ Início</Link>
        <span className="font-bold text-base" style={{ fontFamily: 'var(--font-fredoka)', color: 'var(--ink)' }}>
          📚 Meu histórico
        </span>
        <button className="btn btn--ghost text-sm" style={{ padding: '8px 16px' }} onClick={handleLogout}>
          Sair
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {user && (
          <p className="mb-4" style={{ color: 'var(--muted)' }}>Olá, {user.name}! Aqui estão seus simulados.</p>
        )}

        {isLoading && <p style={{ color: 'var(--muted)' }}>Carregando...</p>}

        {!isLoading && attempts.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>Você ainda não fez nenhum simulado.</p>
        )}

        <div className="flex flex-col gap-3">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  {attempt.simulation.discipline.name} · {attempt.simulation.assessment}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {attempt.status === 'FINISHED'
                    ? `${attempt.score ?? 0} / ${attempt.maxScore} pontos (${attempt.percentage ?? 0}%)`
                    : 'Em andamento'}
                </div>
              </div>
              <span className="badge">{new Date(attempt.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página**

Crie `app/historico/page.tsx`:

```tsx
import { Suspense } from 'react';
import HistoricoList from '@/components/HistoricoList';

export const metadata = {
  title: 'Histórico — Simulados Bernardo',
};

export default function HistoricoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Carregando...</div>}>
      <HistoricoList />
    </Suspense>
  );
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Após concluir ao menos uma tentativa (Task 14), abra `http://localhost:3000/historico` e confirme que ela aparece na lista com nota e data corretas. Clique "Sair" e confirme redirecionamento para `/login` e que `/historico` volta a redirecionar para `/login` (sessão encerrada).

- [ ] **Step 5: Commit**

```bash
git add components/HistoricoList.tsx app/historico/page.tsx
git commit -m "feat: adicionar página de histórico de tentativas do aluno"
```

### Task 17: Documentação e checklist de smoke test fim-a-fim

**Files:**
- Modify: `README.md` (frontend)

**Interfaces:**
- Consumes: nenhuma.
- Produces: nenhuma (tarefa de fechamento).

- [ ] **Step 1: Atualizar o README do frontend**

Abra `README.md` (repo `simulados-bernardo`) e adicione uma seção `## Integração com a API`, documentando: a variável `BACKEND_API_URL` (copiar de `.env.local.example`), que o backend precisa estar rodando em `http://localhost:3333` antes do `npm run dev`, e que as questões deixaram de vir de `data/` — todo conteúdo agora vem da API via `/api/backend/*`.

- [ ] **Step 2: Rodar a verificação estática completa**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: as três concluem sem erro.

- [ ] **Step 3: Checklist manual fim-a-fim**

Com backend (`npm run start:dev`, porta 3333, seed aplicado) e frontend (`npm run dev`, porta 3000) rodando, percorra manualmente:

1. Deslogado, acessar `/historico` → redireciona para `/login?returnTo=/historico`.
2. Criar conta em `/registro` → cai autenticado em `/`.
3. Clicar "Vamos começar!" → avança para seleção de ano/bimestre/avaliação (não redireciona para login, já autenticado).
4. Escolher 3º Ano · 2º Bimestre · AV2 → tela de disciplinas mostra cards vindos da API.
5. Escolher uma disciplina → tentativa inicia, questões carregam, cada tipo (múltipla escolha, V/F, associação, classificação) renderiza corretamente conforme o simulado tiver esses tipos.
6. Responder todas as questões e finalizar → tela de resultado bate com o placar exibido, dicas aparecem nas erradas.
7. "Refazer simulado" → nova tentativa do zero.
8. Ir em `/historico` → a tentativa concluída aparece com nota e data.
9. "Sair" → volta para `/login`; tentar acessar `/simulado/<id-usado-antes>` diretamente → redireciona para `/login`.
10. Fazer login de novo com a mesma conta (`/login`) → volta a acessar `/historico` e ver o mesmo histórico.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: documentar integração com a API e variável BACKEND_API_URL"
```

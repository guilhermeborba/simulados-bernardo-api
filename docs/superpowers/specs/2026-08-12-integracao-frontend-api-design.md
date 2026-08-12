# Integração do front-end com a API — Fluxo do aluno

Data: 2026-08-12
Status: aprovado para planejamento

## Contexto

O backend (`simulados-bernardo-api`) já implementa autenticação, disciplinas, simulados, questões, tentativas com correção no servidor, perfil do aluno e relatórios (ver `README.md`). O front-end (`simulados-bernardo`, projeto Next.js 14 App Router irmão deste repositório) ainda funciona 100% com dados estáticos: os arquivos em `data/questoes-*.ts` contêm enunciados **e gabaritos** embutidos no bundle, não existe login, e o nome do aluno é apenas um campo de texto guardado em `useState` local, sem qualquer persistência.

Esta spec cobre a primeira integração real entre os dois projetos: o fluxo completo do aluno (login/registro, listagem de simulados via API, execução de tentativa com correção no servidor, resultado e histórico). Painel administrativo, área de responsável, relatórios agregados e recuperação de senha ficam para uma rodada futura.

## Gap identificado no backend

Não existe hoje nenhuma rota acessível a `STUDENT` que devolva o enunciado e as opções de uma questão sem o gabarito. `GET /simulations/:simulationId/questions` existe mas é `ADMIN`-only. Sem isso, o front não tem como renderizar as perguntas de uma tentativa em andamento.

**Decisão**: adicionar `GET /attempts/:id/questions` em `AttemptsController`, reaproveitando a checagem de acesso (`assertCanAccessAttempt`) que os outros endpoints de tentativa já usam — student só vê as próprias tentativas, admin vê todas. O serviço retorna as questões ativas do simulado da tentativa (`type`, `statement`, `tip`, `points`, `order`, `options`), sem incluir `answers`/gabarito.

## Arquitetura de integração

O front-end funciona como um **BFF (backend-for-frontend)** usando as próprias rotas de API do Next.js. O navegador nunca fala diretamente com `simulados-bernardo-api`; ele chama rotas relativas (`/api/...`) do próprio Next, que fazem o proxy para o backend.

Motivo: os tokens JWT (access + refresh) ficam em cookies `httpOnly`, inacessíveis a JavaScript no navegador, reduzindo a superfície de um ataque XSS. A troca de token exposto por localStorage por essa camada de proxy foi uma decisão explícita do usuário nesta sessão.

### Rotas de autenticação (efeitos colaterais de cookie)

- `POST /api/auth/register` → chama `POST /auth/register` no backend, seta cookies `sb_access_token` e `sb_refresh_token` (httpOnly, `sameSite=lax`, `secure` quando `NODE_ENV=production`, `path=/`), devolve ao cliente só `{ user }` (nunca os tokens).
- `POST /api/auth/login` → mesmo padrão de `POST /api/auth/register`.
- `POST /api/auth/logout` → lê `sb_refresh_token` do cookie, chama `POST /auth/logout` no backend, limpa os dois cookies.
- `GET /api/auth/me` → proxy autenticado padrão (ver abaixo) para `GET /auth/me`.

### Proxy genérico

`app/api/backend/[...path]/route.ts` trata todo o restante: `GET/POST/PATCH/DELETE`, encaminha método, corpo JSON e query string, injeta `Authorization: Bearer <sb_access_token>`.

Fluxo de refresh automático: se o backend responder 401, o handler chama `POST /auth/refresh` com o `sb_refresh_token` do cookie, atualiza os dois cookies com os novos tokens e repete a requisição original **uma vez**. Se o refresh também falhar, limpa os cookies e devolve 401 ao cliente — o cliente redireciona para `/login`.

Endpoints do backend cobertos por este proxy nesta rodada:

```
GET  /disciplines
GET  /simulations/available
POST /simulations/:id/attempts
GET  /attempts/:id
GET  /attempts/:id/questions        (novo, ver acima)
POST /attempts/:id/questions/:questionId/answer
POST /attempts/:id/finish
GET  /attempts/:id/result
GET  /me/attempts
```

### Proteção de rota

`middleware.ts` na raiz do Next protege `/selecao`, `/disciplinas`, `/simulado/*` e `/historico`: verifica apenas a **presença** do cookie `sb_access_token` (sem validar assinatura — isso é responsabilidade do backend a cada chamada) e redireciona para `/login?returnTo=...` quando ausente. Um `AuthContext` (React context) carrega `GET /api/auth/me` uma vez no mount do layout autenticado, expõe `{ user, isLoading, logout }` para a árvore de componentes.

## Fluxo do aluno

1. **`/login`** e **`/registro`** (páginas novas). Registro usa `POST /auth/register`, que já cria o usuário com role `STUDENT` e devolve tokens — comportamento equivalente a login automático após o cadastro.
2. **Home (`/`)** continua sendo o `HeroStep` atual; o botão "Começar" passa a checar autenticação (via `AuthContext`) antes de avançar — se não autenticado, redireciona para `/login`.
3. **`/selecao`**: mesmo componente `SelectionStep` (ano/bimestre/avaliação), sem mudança de comportamento — esses valores continuam sendo apenas filtros de UI, não vêm da API.
4. **`/disciplinas`**: `DisciplineStep` deixa de usar o array estático `DISCIPLINES` com rotas fixas por combinação `bimestre-AV`. Passa a chamar `GET /simulations/available?schoolYear=&bimester=&assessment=` (via proxy) e monta um card por simulado retornado, usando os dados de `discipline` já incluídos na resposta (nome, ícone, cor). Cada card leva para `/simulado/[simulationId]`.
5. **`/simulado/[simulationId]`** (rota dinâmica nova — substitui as 16 páginas estáticas `app/simulado-*`):
   - Ao entrar, chama `POST /simulations/:id/attempts` para criar a tentativa.
   - Busca as questões em `GET /attempts/:id/questions`.
   - O campo "digite seu nome" desaparece — o nome exibido vem de `user.name` do `AuthContext`.
   - A cada "Confirmar", envia `POST /attempts/:id/questions/:questionId/answer` com a resposta da questão atual (persistida no servidor, permitindo retomar a tentativa depois).
   - Na última questão, "Finalizar" chama `POST /attempts/:id/finish`, cuja resposta já é o resultado completo (`getResult`) — usado diretamente na tela de resultado.
   - "Refazer simulado" cria uma nova tentativa (`POST /simulations/:id/attempts` de novo — tentativas são sempre entidades novas no backend, não há reset in-place).
   - O botão "Pular para revisão (demo)" do protótipo atual é removido: sem gabarito no cliente, pular perguntas deixaria de fazer sentido como recurso de demonstração.
6. **`/historico`** (página nova): lista `GET /me/attempts` — disciplina, simulado, nota, data, status.

### Adapter de tipos de questão

O schema do backend é genérico: cada `Question` tem uma lista `options[]` com `optionKey`/`groupKey`/`sortOrder`, sem estrutura própria por tipo. É preciso reconstruir, no front, o formato que `SimuladoTemplate` já consome hoje. A convenção é a mesma usada por `prisma/seed.ts` ao importar os dados atuais, então basta espelhá-la em `lib/questionMapper.ts`:

- `multiple_choice`: `options[]` mapeia direto para `Option[]` (`id = optionKey`, `text`).
- `true_false_multiple` e `classification`: `options[]` (com `groupKey` `statement`/`item`) viram `items[]`.
- `matching`: `options[]` com `optionKey` prefixado `left:`/`right:` viram `pairs[]`; as opções `right:` formam um pool único, replicado em todo `pair.right` (é assim que o seed grava — não há lista de "right" por par).

O payload enviado em `POST .../answer` segue a mesma convenção usada pelo `AttemptsCorrectionService` (que já está pronta no backend, não muda):

- `multiple_choice`: `{ answer: { answer: <optionKey> } }`.
- `true_false_multiple`, `matching`, `classification`: `{ answer: { <itemId ou leftId>: <valor> } }` (mapa plano, chaves = ids usados em `question.answers[].answerKey`).

## Arquivos removidos do front-end

- `app/simulado-*/page.tsx` (16 páginas estáticas) e os componentes específicos por disciplina (`SimuladoPortugues.tsx`, `SimuladoPortuguesPageClient.tsx`).
- `data/questoes-*.ts` (todo o diretório `data/`) — as questões, com gabarito, param de existir no bundle do cliente.

## Fora de escopo nesta rodada

- Painel administrativo (CRUD de disciplinas/simulados/questões) — hoje só existe via seed e Swagger.
- Área de responsável (`/guardians/*`).
- Relatórios agregados (`/reports/*`).
- Recuperação de senha (`/auth/forgot-password`, `/auth/reset-password` — nem implementados no backend ainda).
- Edição de perfil do aluno (`/students/me`).

## Variáveis de ambiente novas (front-end)

```
BACKEND_API_URL=http://localhost:3333   # usado só server-side, dentro das rotas /api/*
```

Sem prefixo `NEXT_PUBLIC_`: o cliente nunca deve montar URL do backend diretamente, já que toda chamada passa pelo proxy do próprio Next.

O backend já está configurado corretamente para isso: `FRONTEND_URL=http://localhost:3000` no `.env.example` restringe o CORS para a origem do Next em desenvolvimento.

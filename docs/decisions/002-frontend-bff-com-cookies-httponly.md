# ADR 002 — Frontend como BFF com cookies httpOnly

**Data:** 2026-09-25
**Status:** vigente (implementação em andamento — ver spec de integração)

## Contexto

O frontend (Next.js 14) precisa autenticar o usuário e enviar os tokens JWT a cada requisição para a API. A abordagem mais simples seria guardar os tokens em `localStorage` e enviá-los diretamente do navegador para `simulados-bernardo-api`. Essa abordagem foi rejeitada.

## Decisão

O frontend age como **BFF (backend-for-frontend)**: as rotas `app/api/*` do Next.js fazem proxy server-side para a API. O navegador nunca vê nem armazena os tokens JWT.

- Após login/registro: a rota `/api/auth/login` do Next recebe os tokens da API, seta cookies `httpOnly` (`sb_access_token`, `sb_refresh_token`) e devolve ao navegador apenas `{ user }`.
- Para qualquer requisição autenticada: o Next.js lê o cookie no servidor, injeta o token no `Authorization: Bearer` header e faz o fetch para a API — o JS do navegador nunca toca no token.
- Os tokens só ficam visíveis em cookies `httpOnly`, inacessíveis a qualquer script JavaScript.

Variável de ambiente nova no frontend: `BACKEND_API_URL` (sem prefixo `NEXT_PUBLIC_` — server-side only).

## Por que isso importa

Tokens em `localStorage` são acessíveis a qualquer `<script>` na página. Um ataque XSS — mesmo via dependência comprometida — consegue extraí-los com `localStorage.getItem`. Cookies `httpOnly` não são legíveis por JavaScript, eliminando esse vetor.

## Consequência

- O frontend tem uma camada a mais (rotas de proxy), o que aumenta a latência levemente e o volume de código Next.
- CORS entre navegador e `simulados-bernardo-api` não precisa ser configurado: o tráfego real é server-to-server, sem CORS.
- O mecanismo de refresh de token (quando o access token expira) acontece dentro da rota de proxy, invisível ao navegador.

**Trade-off aceito:** complexidade ligeiramente maior no frontend em troca de uma postura de segurança significativamente melhor contra XSS — decisão explícita do projeto dado que o público inclui dados de crianças.

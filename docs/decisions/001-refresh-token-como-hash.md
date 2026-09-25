# ADR 001 — Refresh token armazenado como hash

**Data:** 2026-09-25
**Status:** vigente

## Contexto

Refresh tokens têm vida longa (7 dias por padrão) e, se vazados, permitem que um atacante mantenha acesso mesmo depois de o usuário trocar a senha. Era preciso decidir como armazená-los no banco.

## Decisão

O token bruto (`randomUUID()`) é entregue ao cliente. No banco (`RefreshToken.tokenHash`) guardamos apenas o SHA-256 do token, não o valor original.

```ts
// auth.service.ts
const rawToken = randomUUID();
const tokenHash = createHash('sha256').update(rawToken).digest('hex');
```

Para validar uma requisição com refresh token, fazemos o hash do token recebido e buscamos pelo hash — o valor bruto nunca é persistido.

## Por que SHA-256 e não bcrypt

SHA-256 é determinístico e rápido: dado o token, encontramos o hash em O(1). Bcrypt introduz um salt aleatório que impede buscas diretas. Para tokens de alta entropia (UUID v4 = 122 bits), SHA-256 é seguro — a proteção vem da entropia do token, não da lentidão do hash.

## Consequência

Um vazamento do banco não entrega refresh tokens utilizáveis. O atacante teria os hashes mas não os tokens originais, e não há como reverter SHA-256 de um UUID aleatório de 122 bits em tempo hábil.

**Trade-off aceito:** se alguém comprometer o banco E interceptar o tráfego no exato momento da emissão do token (janela de milissegundos), ainda assim conseguiria o token bruto. Esse risco foi considerado aceitável dado o contexto escolar da aplicação.

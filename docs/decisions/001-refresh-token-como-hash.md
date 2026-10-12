# ADR 001 — Refresh token armazenado como hash

**Data:** 2026-09-25
**Status:** vigente; descrição atualizada em 2026-10-12

## Decisão

O refresh entregue ao cliente é um JWT assinado, com `jti` aleatório gerado por `randomUUID()`, tipo `refresh` e expiração de 7 dias por padrão. No banco, `RefreshToken.tokenHash` guarda somente o SHA-256 do JWT completo. O token bruto não é persistido.

A API verifica assinatura, tipo e expiração do JWT, calcula seu hash e consulta o registro correspondente. A consulta também exige usuário ativo, ausência de revogação e validade do registro. SHA-256 permite localizar o token pelo hash sem armazenar sua credencial; a assinatura e o identificador aleatório protegem a emissão.

A rotação consome o registro anterior e cria/vincula o sucessor na mesma transação. Logout revoga a cadeia de sucessores. O [ADR 006](006-rotacao-atomica-e-revogacao-de-sessao.md) descreve as corridas, rollback e limites de revogação.

## Histórico

A redação original descrevia um token bruto UUID. A implementação atual assina um JWT com `jti`; o princípio de guardar somente seu hash permanece. O access JWT continua válido até sua expiração, mesmo após revogar o refresh.

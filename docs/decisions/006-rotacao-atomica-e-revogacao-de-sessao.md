# ADR 006 — Rotação atômica e revogação da sessão

Data: 2026-10-12
Status: implementado e validado localmente

## Contexto

O refresh criava um novo par antes de revogar o anterior, em operações separadas. Duas requisições podiam gerar dois sucessores válidos. Logout com um token antigo não revogava seu sucessor.

O refresh atual é um JWT com jti; o banco guarda somente seu SHA-256. Essa descrição complementa o ADR 001, que descrevia um token bruto UUID.

## Decisão

Executar leitura, validação, consumo condicional, criação do sucessor e gravação de replacedByTokenId em uma transação Prisma. O consumo usa UPDATE com revokedAt=null e expiresAt>agora; exatamente uma transação pode vencer. A concorrente recebe 401. Qualquer falha de assinatura, persistência ou vínculo reverte toda a operação.

Logout verifica o JWT e revoga a cadeia de sucessores do mesmo usuário numa transação. Cada linha é bloqueada por UPDATE antes de reler o vínculo. Se refresh vence a corrida, logout alcança seu sucessor; se logout vence, o consumo do refresh falha.

Não muda esquema, duração dos tokens, login/registro nem contratos públicos.

## Consequências

A transação no PostgreSQL protege consumo e revogação entre processos da API. O BFF web compartilha renovação somente dentro da mesma sessão e mantém uma janela curta para requisições com cookies antigos; esse coordenador é local a um processo.

JWT de acesso já emitido continua válido até sua expiração atual. A revogação encerra a possibilidade de renovar a sessão; não cria uma lista de revogação de access tokens.

## Validação reproduzível

- npm test -- --runInBand: unitários.
- npm run test:auth:integration: oito testes com PostgreSQL descartável.
- npm run build: compilação da API.

O runner de integração exige Docker e a imagem postgres:16-alpine já disponível. Cria contêiner exclusivo, tmpfs e porta aleatória em 127.0.0.1; passa a URL explicitamente ao Prisma/Jest e remove seu contêiner ao terminar. Não usa o banco de .env, Docker Compose ou seed do projeto.

Os testes reais cobrem leitura simultânea do mesmo token, revogação/expiração, rollback em assinatura e falhas SQL, cadeia de sucessores e corrida de logout com refresh.

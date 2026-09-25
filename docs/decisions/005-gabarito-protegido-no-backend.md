# ADR 005 — Gabarito protegido no backend, nunca exposto ao cliente

**Data:** 2026-09-25
**Status:** vigente

## Contexto

O sistema anterior ao backend tinha os gabaritos embutidos nos arquivos TypeScript do frontend (`data/questoes-*.ts`), distribuídos no bundle JavaScript baixado pelo navegador. Qualquer usuário com DevTools conseguia ver as respostas antes de finalizar o simulado.

## Decisão

O gabarito (`QuestionAnswer`) é armazenado no banco e **nunca retornado** em nenhum endpoint acessível a aluno ou visitante anônimo.

Regras de acesso:

- `GET /simulations/:simulationId/questions` — requer `ADMIN`. Retorna questões com opções mas sem gabarito mesmo para admin (o gabarito não está no DTO de saída).
- `GET /attempts/:id/questions` — requer `STUDENT` dono da tentativa. Retorna enunciado e opções, sem gabarito.
- `GET /attempts/:id/result` — disponível apenas após `FINISHED`. Retorna `isCorrect` e `pointsEarned` por questão — o aluno sabe se acertou, mas não qual seria a resposta certa de forma direta.

A correção acontece integralmente no servidor em `AttemptsCorrectionService`, que tem acesso ao `QuestionAnswer` diretamente via Prisma sem passar por nenhum serializer público.

## Tipos de correção implementados

- `MULTIPLE_CHOICE`: compara `answer.selectedKey` com `QuestionAnswer.answerValue`
- `TRUE_FALSE_MULTIPLE`: compara cada item individualmente, pontuação proporcional
- `MATCHING`: compara pares esquerda-direita
- `CLASSIFICATION`: compara categoria atribuída a cada item

## Consequência

Adicionar um novo tipo de questão exige implementar o método de correção em `attempts-correction.service.ts` antes de criar questões desse tipo — sem implementação, a tentativa finalizará com pontuação zero para aquela questão.

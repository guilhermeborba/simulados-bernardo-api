# ADR 005 — Gabarito protegido no backend, nunca exposto ao cliente

**Data:** 2026-09-25
**Status:** vigente

## Contexto

O sistema anterior ao backend tinha os gabaritos embutidos nos arquivos TypeScript do frontend (`data/questoes-*.ts`), distribuídos no bundle JavaScript baixado pelo navegador. Qualquer usuário com DevTools conseguia ver as respostas antes de finalizar o simulado.

## Decisão

O gabarito estruturado (`QuestionAnswer` e `AttemptQuestionSnapshot.officialAnswers`) é armazenado no banco e **nunca retornado** em nenhum endpoint acessível a aluno ou visitante anônimo. Campos como `correctAnswer`, `answerKey` e `answerValue` não fazem parte das respostas públicas.

Regras de acesso:

- `GET /simulations/:simulationId/questions` — requer `ADMIN`. Retorna questões com opções mas sem gabarito mesmo para admin (o gabarito não está no DTO de saída).
- `GET /attempts/:id/questions` — requer `STUDENT` dono da tentativa ou `ADMIN`. Retorna enunciado, opções e respostas salvas do aluno, sem gabarito. Em quizzes, questões não confirmadas têm `answer`, `confirmedAt` e `feedback` nulos; somente questões confirmadas incluem seu feedback pedagógico persistido.
- `GET /attempts/:id/result` — disponível apenas após `FINISHED`. Retorna `isCorrect` e `pointsEarned` por questão. Em quizzes, retorna também o feedback salvo; não acrescenta um campo com a alternativa oficial.

A correção acontece integralmente no servidor em `AttemptsCorrectionService`. Simulados usam `QuestionAnswer`; quizzes usam o gabarito privado copiado no início da tentativa, sem consultar o conteúdo editorial vivo. Nenhum deles passa por um serializer público.

A partir do lote 04, confirmar uma resposta de quiz libera uma explicação pedagógica e a curiosidade daquela questão, tenha o aluno acertado ou errado. Esses textos podem explicar a solução; são feedback de aprendizagem, sem publicação do gabarito estruturado. A resposta confirmada fica imutável e os textos não aparecem antecipadamente para as demais questões. Simulados mantêm seu comportamento existente. O contrato está no [ADR 008](008-confirmacao-e-resultado-idempotente-de-quiz.md).

## Tipos de correção implementados

- `MULTIPLE_CHOICE`: compara resposta simples ou os campos `answer`, `value`, `optionKey` e `selectedOption` com o gabarito.
- `TRUE_FALSE_MULTIPLE`, `MATCHING` e `CLASSIFICATION`: comparam todos os valores oficiais do mapa com o mapa enviado (diretamente ou em `answers`).
- Todos os tipos aplicam **tudo-ou-nada**: a questão recebe todos os pontos apenas quando todos os valores exigidos coincidem, após normalizar espaços nas extremidades e maiúsculas/minúsculas. Questão ausente ou parcialmente correta recebe zero. Pontuação proporcional não está implementada.

## Consequência

Adicionar um novo tipo de questão exige implementar o método de correção em `attempts-correction.service.ts` antes de criar questões desse tipo — sem implementação, a tentativa finalizará com pontuação zero para aquela questão.

# ADR 016 — Feedback confirmado de simulado no Giz

**Data:** 2026-10-17  
**Status:** implementado localmente; implantação pendente

## Contexto

O handoff Giz exige correção após confirmar cada resposta e gabarito na revisão, inclusive para questões erradas e em branco. O responsável autorizou continuar essa integração na web e no app Expo. Isso amplia a política do [ADR 005](005-gabarito-protegido-no-backend.md) somente para tentativas de simulado que aderem explicitamente ao novo modo. Quizzes e tentativas antigas preservam seus contratos.

## Decisão

`POST /simulations/:id/attempts` aceita `{ "immediateFeedback": true }`. Uma tentativa nova recebe a política imutável `immediateFeedback=true` e snapshots privados de enunciados, opções, gabaritos, textos pedagógicos, pontos e tema. Se já houver tentativa em andamento, ela é retornada com a política original, sem conversão ou recorreção.

Confirmar uma resposta exige seleção completa ou `{}` para branco. A correção ocorre no servidor; a primeira confirmação fica imutável. A resposta autorizada contém `isCorrect`, `correctAnswer`, `explanation` e, conforme o resultado, `tip` para erro/branco ou `funFact` para acerto. `correctAnswer` é um mapa canônico de apresentação; não é o registro privado `QuestionAnswer` nem o snapshot bruto.

Antes da confirmação, questões não contêm gabarito e têm `answer`, `confirmedAt`, `feedback`, `tip` e `funFact` nulos. Depois, somente o feedback daquela questão é liberado. A consulta permite recuperar confirmações após perda de rede sem confiar no cache do cliente. A finalização confirma questões restantes como branco e libera a revisão completa do snapshot.

Respostas canonicamente equivalentes são idempotentes, inclusive após finalizar; trocar a resposta confirmada produz `409`. A finalização também é idempotente. Transações com bloqueios da atividade e tentativa serializam início, confirmação e finalização; usuário ativo, disciplina e vínculo atual à turma são verificados durante a operação. Pontos são somados em Decimal, sem recorreção do conteúdo editorial vivo.

`Question.theme` é opcional e editorial. O tema é copiado no início da tentativa; o resultado agrega `{theme, correct, total}` e conta `unclassifiedQuestions`. Questões sem tema continuam sem classificação. Não se infere tema a partir de título, disciplina ou texto.

## Compatibilidade e limites

A migration é aditiva, com `immediateFeedback=false` para todo registro anterior e tema nulo. Não cria snapshots retroativos nem publica conteúdo. O caminho legado continua aceitando alterações até concluir e não recebe gabarito novo. O comportamento de quiz segue o ADR 008.

Esta decisão substitui a proibição absoluta do ADR 005 apenas na projeção autenticada de resposta confirmada/resultado desse modo. Gabaritos de questões futuras, snapshots brutos e endpoints anônimos continuam privados. Uma confirmação revela a solução daquela questão, portanto a seleção anterior não pode voltar a ser editável.

Aplicar migration e API antes dos clientes. A descrição reproduzível dos contratos e a ordem operacional estão no [guia do feedback Giz](../guia-feedback-giz.md). Não houve deploy ou alteração de base existente nesta entrega.

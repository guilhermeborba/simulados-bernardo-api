# Feedback de simulados no Giz

Implementação aditiva de 17/10/2026. A decisão e a exceção delimitada à política de gabarito estão no [ADR 016](decisions/016-feedback-confirmado-de-simulado-giz.md).

## Contrato

Os endpoints usam a sessão autenticada existente. O aluno acessa somente a própria tentativa, com vínculo atual à turma quando privada; ADMIN mantém acesso administrativo. Conta, disciplina, atividade e turma precisam continuar disponíveis. Uma tentativa arquivada pode ser concluída/revista; uma atividade em rascunho ou removida não é liberada.

```http
POST /simulations/:idOuSlug/attempts
Content-Type: application/json

{ "immediateFeedback": true }
```

A resposta inclui `immediateFeedback`. Se houver tentativa aberta, o ID e a política originais são preservados. Omissão ou `false` mantém o modo legado. Não há conversão no meio da execução.

`GET /attempts/:id/questions` usa os snapshots do modo novo. Cada questão não confirmada tem `answer`, `confirmedAt`, `feedback`, `tip` e `funFact` nulos, sem `correctAnswer`. Opções são uma lista pública de `id`, `optionKey`, `text`, `groupKey` e `order`; metadados privados são removidos.

```http
POST /attempts/:id/questions/:questionId/answer
Content-Type: application/json

{ "answer": { "answer": "B" } }
```

A forma canônica de múltipla escolha é `{answer:"B"}`. Os quatro aliases anteriores (`answer`, `value`, `optionKey`, `selectedOption`) continuam aceitos para esse tipo, mas não simultaneamente. Verdadeiro/falso usa mapa de todos os itens com `V`/`F`; classificação usa `C`/`P`; associação usa chaves da coluna esquerda e valores da direita, sem prefixos `left:`/`right:`. Um mapa pode ser envolvido em `answers`. Envie `{ "answer": {} }` para confirmar em branco. Seleção parcial, alternativa desconhecida ou conteúdo ambíguo produz `400`, sem confirmação.

```json
{
  "id": "resposta",
  "attemptId": "tentativa",
  "questionId": "questao",
  "answer": { "answer": "B" },
  "confirmedAt": "2026-10-17T12:00:00.000Z",
  "feedback": {
    "isCorrect": false,
    "correctAnswer": { "answer": "A" },
    "tip": "Uma dica editorial, quando disponível.",
    "funFact": null,
    "explanation": null
  }
}
```

A dica só é liberada para erro/branco; a curiosidade, para acerto. Campos editoriais ausentes são nulos. `correctAnswer` também é um mapa nos outros tipos. Reenvios equivalentes retornam a confirmação original. Alteração produz `409`; o cliente deve recuperar as questões e respeitar a confirmação que o servidor persistiu. Após finalizar, somente reenvio equivalente é permitido, sem nova gravação.

`POST /attempts/:id/finish` confirma as questões restantes como branco e salva a nota uma única vez. `GET /attempts/:id/result` exige `FINISHED`. Ambos devolvem o resultado persistido, com:

- `attempt`, contendo política, nota, máximo, contagens e datas reais;
- `questions`, incluindo opções do snapshot, resposta, correção, `correctAnswer`, explicação e tema;
- `topics: [{theme, correct, total}]`, considerando a questão inteira correta, conforme a regra de tudo ou nada;
- `unclassifiedQuestions`, quantidade sem tema editorial.

O modo legado continua sem os novos gabaritos. Não se usa o conteúdo editorial vivo para reconstruir snapshots históricos.

## Conteúdo editorial

`POST /simulations/:id/questions` e `PATCH /questions/:id` administrativos aceitam `theme`, texto opcional de até 120 caracteres. Espaços nas extremidades são removidos; vazio ou nulo remove a classificação. O campo não é preenchido automaticamente por seed nem pela interface. Edições afetam apenas tentativas iniciadas depois da alteração.

## Implantação

1. Revisar e aplicar `20261017120000_simulation_immediate_feedback` no ambiente autorizado com `prisma migrate deploy`.
2. Gerar o Prisma Client e publicar a API compatível; verificar health/readiness e os fluxos existentes.
3. Publicar a web e distribuir o app Expo compatíveis, que solicitam o modo novo explicitamente.
4. Cadastrar temas editoriais quando revisados e validar a jornada completa nesse ambiente.

A migration adiciona `Attempt.immediateFeedback` com default false e colunas de tema nulas em `Question`/`AttemptQuestionSnapshot`. Não altera respostas, notas, datas ou política de tentativas anteriores, nem exige seed. Os clientes novos dependem dessa API; uma API antiga pode recusar o campo de opt-in pelo ValidationPipe.

Os testes de integração usam exclusivamente PostgreSQL descartável protegido pelo runner (`npm run test:integration`), nunca a URL do `.env`. Há testes de quatro tipos, ausência de vazamento, reenvio, concorrência, conteúdo alterado, acesso atual e compatibilidade legada. Execução local e testes não representam implantação nem aceite físico do Expo.

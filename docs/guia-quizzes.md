# Quizzes — contratos, confirmação e migrações

Os lotes 03 e 04 oferecem autoria ADMIN, versões, início/retomada, confirmação de respostas, feedback persistido e resultado idempotente a partir dos snapshots privados. Importação editorial/mídia são do lote 05 e telas/BFF web do lote 06. Não há catálogo de quizzes semeado nem entrega de XP nesta etapa.

## Rotas implementadas

Todas usam JWT; gestão e tentativas acrescentam RolesGuard. Gestão usa ADMIN; iniciar, confirmar e concluir exige STUDENT. Leitura de tentativa/questões/resultado permite o dono STUDENT ou ADMIN; os históricos pessoais exigem STUDENT.

| Rota | Comportamento |
|---|---|
| `GET /quizzes/available` | Metadados da última versão publicada e autorizada de cada chave lógica |
| `GET /quizzes` | ADMIN lista versões não excluídas |
| `POST /quizzes` | ADMIN cria versão 1 em DRAFT com questões aninhadas |
| `GET/PATCH/DELETE /quizzes/:id` | ADMIN consulta, edita rascunho nunca publicado ou faz soft delete |
| `PATCH /quizzes/:id/publish` | ADMIN valida conteúdo, referências e publica o rascunho |
| `PATCH /quizzes/:id/archive` | ADMIN retira a versão publicada do catálogo |
| `POST /quizzes/:id/versions` | ADMIN clona a fonte para próxima versão DRAFT |
| `POST /quizzes/:id/attempts` | STUDENT inicia ou retoma a tentativa aberta; aceita ID ou slug |
| `GET /attempts/:id` | Dono/ADMIN consulta metadados, sem snapshots privados |
| `GET /attempts/:id/questions` | Dono/ADMIN recebe conteúdo do snapshot e feedback somente das questões confirmadas |
| `POST /attempts/:id/questions/:questionId/answer` | STUDENT confirma resposta de quiz; simulados mantêm envio/edição existentes |
| `POST /attempts/:id/answers` | Mesmo comportamento, com `questionId` no body |
| `POST /attempts/:id/finish` | STUDENT conclui depois de confirmar todas as questões; repetição devolve o resultado salvo |
| `GET /attempts/:id/result` | Dono/ADMIN consulta resultado de quiz `FINISHED`, sem gabarito |
| `GET /me/quiz-attempts` | STUDENT consulta seu histórico de prática separado de simulados |

Filtros de catálogo: `discipline` (slug), `schoolYear` (inteiro -2 a 12) e `topic`. Sentinelas atuais: -1 Infantil 4, -2 Infantil 5, 0 Enfermagem, 1–9 Fundamental e 10–12 Médio. Filtro de ano não é autorização de turma. Totais Decimal (`score`, `maxScore`, `percentage`) e `questions[].points` são strings. `feedback.pointsEarned` e os `questions[].pointsEarned` do resultado são números. Datas são strings ISO no JSON.

## Exemplo de criação

Use um `disciplineId` existente, sem criar novas disciplinas. Os IDs do exemplo são ilustrativos.

```json
{
  "activityKey": "quantidades-3ano-primeiros-passos",
  "disciplineId": "id-da-disciplina-existente",
  "schoolYear": 3,
  "topic": "Quantidades",
  "title": "Brincando com quantidades",
  "estimatedDurationMinutes": 5,
  "questions": [
    {
      "originKey": "soma-um-mais-um",
      "statement": "Quanto é um mais um?",
      "explanation": "Somamos uma unidade com outra e temos duas unidades.",
      "tip": "Conte as unidades.",
      "points": 1,
      "options": [
        { "optionKey": "A", "text": "Uma unidade" },
        { "optionKey": "B", "text": "Duas unidades" }
      ],
      "correctAnswer": "B"
    }
  ]
}
```

`correctAnswer` é apenas entrada administrativa, nunca resposta de API. A resposta ADMIN contém as questões e explicações sem gabarito; a resposta de catálogo contém apenas metadados. Antes de confirmação, o aluno não recebe explicação, curiosidade, mídia ou respostas oficiais.

São permitidas 1–50 perguntas com 2–8 alternativas, pontos positivos com duas casas decimais e soma até 9999,99. `originKey` deve ser único no quiz e preservado entre versões quando representa a mesma pergunta. Opções com chaves iguais desconsiderando maiúsculas/minúsculas são recusadas. O servidor calcula `totalQuestions`, `maxScore`, ordem, slug e versão. Campos desconhecidos, mídia, bimestre e AV são recusados; números do body JSON devem ser números, sem coerção de booleanos/string. Em PATCH de rascunho, `subtitle`, `turmaId` e `estimatedDurationMinutes` aceitam `null` para limpeza; campos obrigatórios não aceitam `null`. Substituir `questions` substitui o conjunto ativo do rascunho, mantendo os registros anteriores com soft delete.

Criar uma versão mantém a original. Após publicar, editar conteúdo exige `POST /quizzes/:id/versions`, PATCH no novo rascunho e publicação. Arquivar permite retomar uma tentativa aberta autorizada, mas impede criar uma nova naquela versão. Acesso atual à turma e disciplina é revalidado ao iniciar, retomar, confirmar, ler questões, concluir e consultar o resultado. Um quiz arquivado permite essas operações sobre tentativas existentes autorizadas. As rotas antigas de Simulation/Question não gerenciam quizzes.

## Confirmação e feedback do quiz

No quiz, enviar a resposta já é confirmá-la. Não existe salvamento editável de rascunho de resposta. O mesmo endpoint continua permitindo editar respostas de simulados em andamento, conforme o comportamento anterior.

```http
POST /attempts/id-da-tentativa/questions/id-da-pergunta/answer
Authorization: Bearer <access-token>
Content-Type: application/json

{ "answer": { "optionKey": "B" } }
```

O alias aceita o ID da pergunta no body:

```json
{
  "questionId": "id-da-pergunta",
  "answer": { "optionKey": "B" }
}
```

Dentro de `answer`, é aceita exatamente uma das chaves `optionKey`, `selectedOption`, `answer` ou `value`, com string não vazia que corresponda a uma opção do snapshot. `{ "selectedOption": " b " }` equivale a `{ "optionKey": "B" }`. A resposta salva usa a chave original da alternativa. Números, arrays, mapas, opções inexistentes, vazio, campos extras ou dois aliases simultâneos retornam 400 sem gravação.

Resposta de confirmação, com IDs/data ilustrativos:

```json
{
  "id": "id-da-resposta",
  "attemptId": "id-da-tentativa",
  "questionId": "id-da-pergunta",
  "answer": { "optionKey": "B" },
  "confirmedAt": "2026-10-12T15:00:00.000Z",
  "feedback": {
    "isCorrect": true,
    "pointsEarned": 1,
    "explanation": "Somamos uma unidade com outra e temos duas unidades.",
    "funFact": null
  }
}
```

A primeira confirmação e suas repetições equivalentes retornam 201. Repetir preserva ID, `confirmedAt` e feedback, sem correção ou escrita adicional. Mudar para outra alternativa válida retorna 409, inclusive após concluir a tentativa. Assim, perder a resposta HTTP não exige criar uma nova tentativa; o cliente pode repetir o mesmo envio. A primeira confirmação grava resposta, correção, data e feedback na mesma transação. Só confirmações já salvas podem ser repetidas após `FINISHED`; `ABANDONED`/`EXPIRED` recusam confirmação e conclusão.

`GET /attempts/:id/questions` devolve cada pergunta do snapshot com `id`, `originKey`, `type`, `statement`, `tip`, `points`, `order`, `options`, `answer`, `confirmedAt` e `feedback`. Opções contêm somente `id`, `optionKey`, `text`, `groupKey` e `order`. Em perguntas ainda não confirmadas, os três últimos campos são nulos; explicação, curiosidade e conteúdo oficial não aparecem. Nas confirmadas, `answer` é a escolha canônica do aluno e `feedback` contém o objeto salvo acima, tanto para acerto quanto para erro. Recarregar ou retomar recupera esse estado.

`correctAnswer`, `officialAnswers`, `answerKey`, `answerValue`, snapshots privados e mídia não são retornados. Explicação pedagógica pode explicar a solução depois da confirmação; isso não publica o gabarito estruturado nem o antecipa para as outras perguntas. Opções/feedback JSON passam por uma allowlist. Dados armazenados malformados produzem erro genérico, sem JSON privado na resposta.

## Conclusão e resultado

`POST /attempts/:id/finish` exige que todas as perguntas do snapshot estejam confirmadas. Se faltar alguma, retorna 400 e preserva a tentativa em andamento; não inventa respostas nem confirma automaticamente. Pontos máximos e pontos ganhos são somados com Decimal, e o percentual tem duas casas, com arredondamento `ROUND_HALF_UP`. Acertos, erros, duração e `finishedAt` são gravados junto com `FINISHED`, numa única transação.

O POST retorna 201 com `{ "attempt": { ... }, "questions": [ ... ] }`. O objeto `attempt` contém IDs, chave lógica/versão, estado, datas, notas, contagens, duração e metadados do quiz/disciplina. Cada pergunta contém a projeção da leitura, seu feedback salvo, `isCorrect` e `pointsEarned`. Repetir finish devolve esse resultado sem alterar notas, datas ou duração. `GET /attempts/:id/result` retorna o mesmo contrato com 200; antes de `FINISHED`, retorna 400.

A correção usa exclusivamente o gabarito, pontos e explicação copiados ao iniciar a tentativa. Publicar outra versão não altera respostas, feedback ou resultado da versão iniciada. Nenhum XP, recompensa ou pontuação de ranking de quiz é criado nessa etapa.

Leitura de questões/resultado, confirmação e conclusão revalidam owner, estado da atividade, disciplina e turma na mesma transação/conexão. Quiz publicado ou arquivado e disciplina ativa são necessários; soft delete ou perda de membership tornam o conteúdo inacessível (404). Outro aluno recebe 403. ADMIN pode ler sem membership, mas as rotas mutáveis exigem STUDENT. Histórico pessoal e `GET /attempts/:id` continuam fornecendo somente metadados/totais ao dono/ADMIN e não concedem acesso às questões. Locks na atividade precedem locks na tentativa; confirmações e finishes concorrentes observam o estado confirmado da mesma tentativa.

## Auditoria e aplicação das migrações

### Lote 03 — versões e snapshots

Antes de aplicar em um ambiente existente, execute a consulta somente de leitura no banco escolhido pelo operador:

```sql
SELECT "studentId", "simulationId", COUNT(*) AS open_attempts,
       ARRAY_AGG(id ORDER BY "createdAt") AS attempt_ids
FROM "Attempt"
WHERE status = 'IN_PROGRESS'
GROUP BY "studentId", "simulationId"
HAVING COUNT(*) > 1;
```

Resultado vazio permite prosseguir. Se houver duplicados, analise respostas, datas e histórico e registre a decisão de regularização. A migration não escolhe uma tentativa para descartar; não execute o script de limpeza automaticamente para contornar a auditoria. A aplicação bloqueia novas inserções enquanto audita/cria o índice e aborta integralmente se a condição persistir.

No ambiente autorizado, depois de auditoria e backup conforme o procedimento operacional existente:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

Se Prisma registrar essa migration como falha e o schema estiver comprovadamente sem alterações, após resolver a causa marque somente essa migration como revertida antes de repetir deploy:

```bash
npx prisma migrate resolve --rolled-back 20261012180000_quiz_versions_and_attempt_snapshots
npx prisma migrate deploy
```

Essa regularização é uma ação operacional explícita. Os testes aplicam migrations somente em PostgreSQL descartável; a implementação não aplicou migrations nem seed em nenhuma base existente. Preserve as constraints SQL e o índice parcial em futuras migrations.

### Lote 04 — marcação da confirmação

A migration `20261012210000_quiz_answer_confirmation` acrescenta `AttemptAnswer.confirmedAt` e `feedback`, nullable, num único bloco PostgreSQL `DO`. Respostas existentes de simulados mantêm JSON, correção, pontos e data de criação; os novos campos ficam nulos. Não há backfill nem confirmação automática de respostas antigas.

A constraint permite ambos nulos ou exige ambos preenchidos, feedback JSON objeto, `isCorrect` e `pointsEarned` não nulos e pontos entre 0 e 9999,99. O serviço valida também a forma pública do feedback e sua consistência com a correção salva. Os mesmos comandos de generate/deploy aplicam a cadeia inteira no ambiente autorizado. Nesta implementação, ambas as migrations foram verificadas somente em bases descartáveis; não houve alteração de banco existente, seed em produção ou deploy.

## Verificação

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run seed:dry-run
npm run test:integration
```

O runner cria e remove um PostgreSQL próprio. A suíte inclui migração sobre legado populado, rollback/diagnóstico de duplicatas, criação e versão concorrentes, snapshots estáveis, rollback de falha ao gravar snapshots, isolamento de relatórios/ranking, turma/owner e regressão dos simulados. Uma suíte limita o pool a uma conexão para verificar início concorrente de simulado privado sem espera por uma segunda conexão. O lote 04 acrescenta confirmação/recarga, normalização de alternativas, tentativas concorrentes iguais e conflitantes, corrida entre confirmação/conclusão, conclusão repetida, rollback de falhas de gravação/finish, versões estáveis, perda de acesso e projeções sem gabarito. Onze casos PostgreSQL aplicam a migration de confirmação sobre respostas antigas abertas/finalizadas e verificam preservação e constraints, inclusive rejeição de `numeric NaN`. CI executa as mesmas suítes contra o serviço PostgreSQL de teste, com a guarda de URL do [guia de regressão](guia-ci-regressao.md).

Validação do lote 04: 278 testes unitários, 117 de integração PostgreSQL e 8 jornadas HTTP web/Next/BFF/API, além de lint, build, Prisma validate e dry-run do acervo de simulados. As jornadas web verificam a compatibilidade dos fluxos existentes; a interface de quizzes continua no lote 06.

Decisões: [ADR 007 — versões e snapshots](decisions/007-quizzes-versionados-e-snapshots-privados.md), [ADR 008 — confirmação e resultado](decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md) e [ADR 005 — gabarito protegido](decisions/005-gabarito-protegido-no-backend.md).

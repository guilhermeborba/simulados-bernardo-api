# Quizzes — contratos, catálogo e mídia

Atualizado após a implementação técnica dos lotes 03–10, em **13/10/2026**. Quizzes têm autoria ADMIN, versões, início/retomada, confirmação, feedback persistido, resultado, importação própria, mídia de instrução, jornada web e preferências por conta. A plataforma também oferece [missões/XP](guia-missoes-xp.md), [avatar/conquistas](guia-colecoes-conquistas.md), [habilidades/REVIEW](guia-habilidades-revisao.md) e [acompanhamento autorizado](guia-acesso-recuperacao.md). O catálogo preparado contém 45 quizzes/213 perguntas nas 15 faixas, aprovados pelo responsável em 14/10/2026. O [registro editorial e da voz Dora](aprovacao-quizzes-e-voz-dora.md) vincula aprovação e hash; isso não equivale a deploy ou publicação em produção.

## Rotas implementadas

Todas usam JWT; gestão e tentativas acrescentam RolesGuard. Gestão usa ADMIN; iniciar, confirmar e concluir exige STUDENT. Leitura de tentativa/questões/resultado permite o dono STUDENT ou ADMIN; os históricos pessoais exigem STUDENT. Preferências permitem qualquer role, sempre da própria conta ativa.

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
| `GET /attempts/:id/questions` | Dono/ADMIN recebe conteúdo do snapshot, mídia de instrução e feedback somente das questões confirmadas |
| `GET /attempts/:id/questions/:questionId/media/:kind` | Dono/ADMIN recebe imagem ou áudio autenticado do snapshot, com suporte a Range |
| `POST /attempts/:id/questions/:questionId/answer` | STUDENT confirma resposta de quiz; simulados mantêm envio/edição existentes |
| `POST /attempts/:id/answers` | Mesmo comportamento, com `questionId` no body |
| `POST /attempts/:id/finish` | STUDENT conclui depois de confirmar todas as questões; repetição devolve o resultado salvo |
| `GET /attempts/:id/result` | Dono/ADMIN consulta resultado de quiz `FINISHED`, sem gabarito |
| `GET /me/quiz-attempts` | STUDENT consulta seu histórico de prática separado de simulados |
| `GET/PATCH /me/learning-preferences` | Qualquer conta ativa consulta/atualiza somente suas escolhas de faixa, áudio e movimento |
| `GET /me/learning-progress` | STUDENT consulta evidências e sugestões autorizadas de revisão por habilidade |
| `POST /me/review-attempts` | STUDENT inicia/retoma REVIEW com corpo `{ "quizId": "id" }`; seleção de até cinco perguntas no servidor |

Filtros de catálogo: `discipline` (slug), `schoolYear` (inteiro -2 a 12) e `topic`. Sentinelas atuais: -1 Infantil 4, -2 Infantil 5, 0 Enfermagem, 1–9 Fundamental e 10–12 Médio. Filtro de ano não é autorização de turma. Totais Decimal (`score`, `maxScore`, `percentage`) e `questions[].points` são strings. `feedback.pointsEarned` e os `questions[].pointsEarned` do resultado são números. Datas são strings ISO no JSON.

## Jornada web e BFF

A web oferece catálogo em `/quizzes`, runner em `/quiz/[quizId]` e histórico em `/quizzes/historico`. Segmento/ano são escolhas da conta; disciplina e tema filtram a consulta atual. As 15 faixas conservam os códigos da API. Enquanto o catálogo editorial não for revisado/publicado no ambiente escolhido, a tela pode apresentar o estado vazio; os testes usam quizzes sintéticos publicados apenas em banco descartável.

O runner exige STUDENT. Marcar uma alternativa cria somente uma escolha local editável; o envio acontece ao tocar em “Confirmar resposta”. Depois do feedback, a resposta fica bloqueada. A URL mantém `?attempt=<id>` para recarregar, retomar e abrir resultado pelo histórico. Retomada carrega o snapshot e as confirmações salvas; falha HTTP preserva a escolha para repetir a confirmação e a conclusão idempotentes. O histórico de simulados permanece em `/historico`.

O navegador usa `/api/backend/...`, sem receber JWT. O BFF aceita GET de `/quizzes/available` e POST de `/quizzes/:id/attempts`, além dos contratos existentes de tentativa e `me`; gestão ADMIN de quizzes não foi aberta por esse caminho. URLs de mídia válidas do snapshot viram `/api/backend/attempts/:id/questions/:questionId/media/:kind`. O helper aceita somente essa forma relativa, com `kind` image/audio, sem URL externa ou token na query.

A entrega binária usa a mesma sessão/renovação por cookies httpOnly. O BFF encaminha Range e mantém bytes, status 200/206/416 e headers controlados; valida MIME e tamanho anunciado/recebido, limites de imagem/áudio e Content-Range. Respostas de mídia usam private/no-store, nosniff e CSP restritiva. Cada pedido continua sujeito à autorização atual do backend, inclusive depois de revogar membership.

A interface oferece descrição de imagem e transcrição de áudio quando a entrega falha; áudio não tem autoplay e depende de ação do aluno. Preferência de movimento e `prefers-reduced-motion` reduzem animações. Estado, seleção e feedback têm textos e controles próprios, sem depender somente de cor ou som. A verificação automatizada em navegador não substitui uso com pessoas, leitor de tela e aparelhos reais.

## Preferências de aprendizagem

GET e PATCH retornam diretamente os quatro campos públicos, sem wrapper, IDs, datas ou dados da conta:

```json
{
  "segment": null,
  "schoolYear": null,
  "audioEnabled": false,
  "motionEnabled": true
}
```

| Segmento | Anos aceitos |
|---|---|
| `INFANTIL` | -1 e -2 |
| `FUNDAMENTAL_I` | 1 a 5 |
| `FUNDAMENTAL_II` | 6 a 9 |
| `MEDIO` | 10 a 12 |
| `ENFERMAGEM` | 0 |

`segment` preenchido aceita `schoolYear: null` para consultar a faixa inteira. Segmento nulo exige ano nulo. PATCH pode enviar somente os campos alterados; o servidor mescla com o último estado e valida o conjunto. Para mudar de faixa com um ano incompatível já salvo, envie ambos os filtros na mesma requisição:

```http
PATCH /me/learning-preferences
Authorization: Bearer <access-token>
Content-Type: application/json

{ "segment": "MEDIO", "schoolYear": 10 }
```

Para remover os filtros, envie `{ "segment": null, "schoolYear": null }`. Booleanos aceitam apenas true/false; strings, números e null nesses campos retornam 400. Segmento desconhecido e campos extras também retornam 400. Ano não compatível com o segmento também retorna 400, sem gravar os demais campos do PATCH. Dados de identidade não são aceitos: a conta é exclusivamente o subject do JWT. Usuário inexistente, inativo, excluído ou subject inválido retorna 401; não existe rota para consultar preferências de outra conta.

GET sem registro retorna os defaults sem criar linha. PATCH vazio ou sem efeito conserva dados/datas. Atualizações do mesmo usuário usam lock transacional da linha User antes de ler/criar as preferências, preservando campos distintos em pedidos concorrentes, inclusive na primeira gravação. Não há backfill de StudentProfile nem importação do localStorage legado. A preferência não muda a matrícula/ano escolar, não concede acesso a turma e não altera ranking de simulados.

Na web, as escolhas vêm da API por conta. Leitura/gravação são serializadas; troca/logout descarta estado e resultados atrasados da conta anterior. Falha ao salvar mantém a escolha anterior e informa o erro. Esse contrato pode ser reutilizado no app mobile. Decisão: [ADR 010](decisions/010-preferencias-de-aprendizagem-por-conta.md).

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

`correctAnswer` é apenas entrada administrativa, nunca resposta de API. A resposta ADMIN contém as questões e explicações sem gabarito; a resposta de catálogo contém apenas metadados. Antes de confirmação, o aluno recebe a mídia de instrução, quando presente, mas não recebe explicação, curiosidade ou respostas oficiais.

São permitidas 1–50 perguntas com 2–8 alternativas, pontos positivos com duas casas decimais e soma até 9999,99. `originKey` deve ser único no quiz e preservado entre versões quando representa a mesma pergunta. Opções com chaves iguais desconsiderando maiúsculas/minúsculas são recusadas. O servidor calcula `totalQuestions`, `maxScore`, ordem, slug e versão. Campos desconhecidos, URLs/caminhos de mídia, bimestre e AV são recusados; números do body JSON devem ser números, sem coerção de booleanos/string. Em PATCH de rascunho, `subtitle`, `turmaId` e `estimatedDurationMinutes` aceitam `null` para limpeza; campos obrigatórios não aceitam `null`. Substituir `questions` substitui o conjunto ativo do rascunho, mantendo os registros anteriores com soft delete.

Criar uma versão mantém a original. Após publicar, editar conteúdo exige `POST /quizzes/:id/versions`, PATCH no novo rascunho e publicação. Arquivar permite retomar uma tentativa aberta autorizada, mas impede criar uma nova naquela versão. Acesso atual à turma e disciplina é revalidado ao iniciar, retomar, confirmar, ler questões, concluir e consultar o resultado. Um quiz arquivado permite essas operações sobre tentativas existentes autorizadas. As rotas antigas de Simulation/Question não gerenciam quizzes.

## Mídia de instrução

O campo opcional `questions[].media` aceita uma imagem e/ou um áudio registrados. `alt` e `transcript` são obrigatórios quando o respectivo tipo existe. Exemplo de entrada administrativa com IDs realmente registrados:

```json
{
  "media": {
    "image": {
      "assetId": "infantil-4-cores-e-formas.cor-vermelha.image.v3",
      "alt": "Três balões alinhados: azul à esquerda, vermelho no meio e amarelo à direita."
    },
    "audio": {
      "assetId": "infantil-4-cores-e-formas.cor-vermelha.audio",
      "transcript": "Veja os balões. Qual é a cor do balão que está no meio? Alternativa A: Amarela. Alternativa B: Vermelha. Alternativa C: Azul."
    }
  }
}
```

A transcrição corresponde ao texto efetivamente narrado no asset. O servidor fixa também SHA-256, verifica formato/tamanho e recusa ID desconhecido, tipo incorreto, arquivo ausente, link simbólico ou digest divergente. Um ID registrado não pode passar a identificar bytes novos. Revisar um asset exige novo ID; editar conteúdo já publicado exige nova versão do quiz. O pacote conserva os assets anteriores para atender snapshots antigos.

A leitura de questões e o resultado expõem somente a projeção abaixo, nunca `assetId`, SHA-256, nome de arquivo ou gabarito:

```json
{
  "media": {
    "image": {
      "url": "/attempts/id-da-tentativa/questions/id-da-pergunta/media/image",
      "alt": "Três balões alinhados: azul à esquerda, vermelho no meio e amarelo à direita."
    },
    "audio": {
      "url": "/attempts/id-da-tentativa/questions/id-da-pergunta/media/audio",
      "transcript": "Veja os balões. Qual é a cor do balão que está no meio? Alternativa A: Amarela. Alternativa B: Vermelha. Alternativa C: Azul."
    }
  }
}
```

Sem mídia, a propriedade é omitida. As URLs são relativas à API e exigem `Authorization: Bearer <access-token>` em cada requisição. Só o dono STUDENT ou ADMIN pode ler; professor, responsável e outro aluno não recebem os bytes. Quiz/turma/disciplina e membership atual são revalidados antes de ler o asset. Revogação bloqueia novas leituras, inclusive por uma URL obtida anteriormente. Arquivar conserva acesso à tentativa existente quando a autorização permanece válida.

SVG e WAV usam MIME controlado, `X-Content-Type-Options: nosniff`, CSP restritiva, `Cache-Control: private, no-store` e `Accept-Ranges: bytes`. `Range: bytes=0-99`, intervalo aberto ou sufixo válido retornam 206 com `Content-Range`; intervalo inválido/múltiplo retorna 416 somente depois da autorização.

Alt e transcrição ficam no snapshot e continuam disponíveis quando o arquivo não pode ser entregue. Essa falha retorna 404 para os bytes e não impede confirmar ou concluir pelo texto. Mídia deve conter instrução, sem explicação antecipada ou gabarito; a revisão editorial verifica esse conteúdo. Os arquivos genéricos empacotados não contêm dados pessoais. A autorização da API não torna os arquivos do Git confidenciais; uploads e armazenamento de arquivos privados ainda não existem.

O build copia os assets para `dist/src/modules/quizzes/media/assets`. Geração das ilustrações, narração pt-BR e regras de conservação estão no [README da mídia](../src/modules/quizzes/media/README.md). O lote 06 implementa BFF binário, áudio opcional e fallback visual. Testes automatizados de teclado/mobile emulado/axe não encerram a validação com pessoas, leitor de tela e aparelhos reais.

## Catálogo e importação própria

A [matriz editorial](matriz-editorial-quizzes.md) apresenta os 45 quizzes: seis de Infantil com 18 perguntas, 27 de Fundamental com 135, nove de Médio com 45 e três de Enfermagem com 15. Todas as 18 perguntas infantis têm imagem, alt, narração e transcrição. Os JSONs de `prisma/quiz-data/` são insumos do servidor e não devem ser incluídos no bundle web ou em endpoints de conteúdo bruto.

Execute primeiro os checks sem banco:

```bash
npm run seed:quizzes:dry-run
npm run seed:quizzes:inventory
npm run --silent seed:quizzes:inventory:json > /tmp/quizzes-inventory.json
```

O dry-run/inventário não instancia Prisma nem importa dados. Valida a cobertura, metadados, alternativas, explicação, gabarito e mídia. O JSON exportado contém somente contagens, chaves/versões, faixas/disciplinas, status de revisão e `contentHash`, sem questões, respostas ou transcrições.

Para importar no banco explicitamente escolhido pelo operador, configure `DATABASE_URL` e `QUIZ_SEED_AUTHOR_EMAIL` com o e-mail de um ADMIN ativo existente. O importador não cria nem reativa usuários; o autor inativo do seed legado não serve para essa operação. As disciplinas precisam existir e estar ativas. Um `turmaSlug` opcional precisa referenciar turma existente e mantém o quiz privado para seus membros.

```bash
npm run seed:quizzes
```

O padrão cria **DRAFT**, invisível ao aluno. A importação é atômica: falha em referência, versão, mídia ou conteúdo reverte o lote inteiro. Repetir a mesma versão exige conteúdo idêntico e conserva IDs, datas e tentativas; divergência exige nova versão consecutiva. Arquivados/excluídos não são reativados. O seed de simulados permanece separado.

Depois da revisão efetivamente realizada, registre em cada entrada:

```json
{
  "review": {
    "status": "APPROVED",
    "reviewedBy": "Nome de quem realizou a revisão",
    "reviewedAt": "2026-10-12T12:00:00.000Z",
    "contentHash": "hash SHA-256 de 64 caracteres obtido no inventário"
  }
}
```

Nome, data e hash são ilustrativos. Use o `entries[].contentHash` da mesma chave/versão no inventário final e a data ISO real. A aprovação precisa corresponder às perguntas e à mídia conferidas; mudanças invalidam o hash. Para Enfermagem, a matriz requer revisão técnica apropriada, incluindo atualização das fontes; no Infantil, conferir compreensão, cor, contagem, áudio e acessibilidade.

```bash
npm run seed:quizzes:publish-reviewed
```

Esse comando publica/cria somente depois de validar aprovação correspondente em **todas** as entradas do lote fornecido. Entradas `PENDING` falham antes de qualquer gravação. O catálogo aprovado deve conservar o hash correspondente ao conteúdo revisado. Rascunhos idênticos podem ser publicados; versões arquivadas/excluídas continuam preservadas. A API `PATCH /quizzes/:id/publish` continua sendo uma ação administrativa explícita com validação de conteúdo; ela não lê o estado de revisão dos JSONs. Não usar essa rota para contornar a revisão editorial.

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

`correctAnswer`, `officialAnswers`, `answerKey`, `answerValue`, snapshots privados, IDs/digests do registro e caminhos de mídia não são retornados. Explicação pedagógica pode explicar a solução depois da confirmação; isso não publica o gabarito estruturado nem o antecipa para as outras perguntas. Opções/feedback JSON passam por uma allowlist. Dados armazenados malformados produzem erro genérico, sem JSON privado na resposta.

## Conclusão e resultado

`POST /attempts/:id/finish` exige que todas as perguntas do snapshot estejam confirmadas. Se faltar alguma, retorna 400 e preserva a tentativa em andamento; não inventa respostas nem confirma automaticamente. Pontos máximos e pontos ganhos são somados com Decimal, e o percentual tem duas casas, com arredondamento `ROUND_HALF_UP`. Acertos, erros, duração e `finishedAt` são gravados junto com `FINISHED`, numa única transação.

O POST retorna 201 com `{ "attempt": { ... }, "reward": { ... }, "questions": [ ... ] }`. `attempt.practiceMode` identifica NORMAL/REVIEW, e `reward` conserva a decisão da recompensa de conclusão. O objeto `attempt` contém IDs, chave lógica/versão, estado, datas, notas, contagens, duração e metadados do quiz/disciplina. Cada pergunta contém a projeção da leitura, seu feedback salvo, `isCorrect` e `pointsEarned`. Repetir finish devolve esse resultado sem alterar notas, datas ou duração. `GET /attempts/:id/result` retorna o mesmo contrato com 200; antes de `FINISHED`, retorna 400.

A correção usa exclusivamente o gabarito, pontos e explicação copiados ao iniciar a tentativa. Publicar outra versão não altera respostas, feedback ou resultado da versão iniciada. Desde o lote 07, conclusão NORMAL também grava a decisão de XP e progresso elegível de missão na transação; o lote 08 acrescenta conquistas/itens elegíveis. Repetir finish não concede novamente. REVIEW devolve `{ "xpAwarded": 0, "reason": "REVIEW", "day": null }` e não concede XP, progresso de missão ou novos itens. Quiz e revisão continuam fora do ranking/notas de simulados; regras completas nos guias de [missões/XP](guia-missoes-xp.md), [coleções](guia-colecoes-conquistas.md) e [habilidades](guia-habilidades-revisao.md).

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

### Lote 06 — preferências por conta

A migration `20261012230000_learning_preferences` acrescenta enum LearningSegment e tabela LearningPreferences, com userId como chave primária/FK. Uma constraint SQL impõe a mesma compatibilidade de segmento/ano da API; booleans têm os defaults acima. FK remove a linha se o usuário for fisicamente removido. Não modifica usuários, StudentProfile, tentativas ou respostas existentes e não cria registros de preferência automaticamente.

Aplique a cadeia com generate/deploy somente no ambiente operacional explicitamente escolhido, conforme o procedimento existente. Nesta implementação, a migration foi aplicada exclusivamente a PostgreSQL descartável, sem banco existente, seed de produção ou deploy.

## Verificação

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run seed:dry-run
npm run seed:quizzes:dry-run
npm run test:integration
```

O runner cria e remove um PostgreSQL próprio. A suíte inclui migração sobre legado populado, rollback/diagnóstico de duplicatas, criação e versão concorrentes, snapshots estáveis, rollback de falha ao gravar snapshots, isolamento de relatórios/ranking, turma/owner e regressão dos simulados. Uma suíte limita o pool a uma conexão para verificar início concorrente de simulado privado sem espera por uma segunda conexão. O lote 04 acrescenta confirmação/recarga, normalização de alternativas, tentativas concorrentes iguais e conflitantes, corrida entre confirmação/conclusão, conclusão repetida, rollback de falhas de gravação/finish, versões estáveis, perda de acesso e projeções sem gabarito. Onze casos PostgreSQL aplicam a migration de confirmação sobre respostas antigas abertas/finalizadas e verificam preservação e constraints, inclusive rejeição de `numeric NaN`. CI executa as mesmas suítes contra o serviço PostgreSQL de teste, com a guarda de URL do [guia de regressão](guia-ci-regressao.md).

Validação do lote 04: 278 testes unitários, 117 de integração PostgreSQL e 8 jornadas HTTP web/Next/BFF/API, além de lint, build, Prisma validate e dry-run do acervo de simulados. Na validação do lote 04, as jornadas web verificavam os fluxos existentes; a interface de quizzes foi implementada no lote 06 abaixo.

O lote 05 acrescenta validação editorial/mídia, importação de todos os 45 quizzes duas vezes, preservação de IDs/datas/tentativas, rollback de lote, referências ativas, versões consecutivas, importações concorrentes e corrida com versionamento da API. A suíte de mídia cobre snapshot, bytes SVG/WAV, Range, autorização/revogação e fallback textual com confirmação/conclusão. Validação final: **381 unitários, 162 testes PostgreSQL e 8 jornadas HTTP web/Next/BFF/API**, além de lint, build e dry-runs. Nenhum banco existente, publicação editorial ou deploy foi alterado.

O lote 06 acrescenta 52 casos PostgreSQL de preferências: defaults sem mutação, todas as faixas/roles, PATCH combinado e concorrente, rollback de validação, token com subject inválido/status alterado, isolamento de contas, proteção de turma e constraints. Fechamento da validação do lote 06: **409 unitários e 214 testes de integração API/PostgreSQL**, **30 testes de sessão e 16 jornadas HTTP web** passaram; builds API/web, lint da API e Prisma validate passaram, além de **24 testes Chromium desktop/mobile emulado** com os cinco segmentos, teclado, axe, fallback, retomada, perda de respostas e isolamento de sessão/preferências. A regressão web usa Next/BFF/API reais e fixtures sintéticas; testes de teclado, viewport mobile e axe são automatizados, com usabilidade humana/leitor de tela/aparelhos reais pendentes. Consulte também o [guia de CI](guia-ci-regressao.md).

Decisões: [ADR 010 — preferências por conta](decisions/010-preferencias-de-aprendizagem-por-conta.md), [ADR 007 — versões e snapshots](decisions/007-quizzes-versionados-e-snapshots-privados.md), [ADR 008 — confirmação e resultado](decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md), [ADR 009 — catálogo e mídia](decisions/009-catalogo-editorial-e-midia-versionada-de-quiz.md) e [ADR 005 — gabarito protegido](decisions/005-gabarito-protegido-no-backend.md).

## Evolução posterior e estado atual

O lote 09 acrescentou classificação por habilidades revisadas e snapshots privados dessa classificação; publicar um quiz exige definições de habilidade válidas e revisadas. REVIEW tem tentativa aberta separada de NORMAL, seleciona até cinco perguntas autorizadas no servidor e apresenta repetições de forma explícita. Primeiras respostas, repetições e revisão não são agrupadas numa promessa de domínio. Histórico antigo sem classificação continua sem classificação.

O lote 10 restringiu catálogos/relatórios privados docentes às turmas atribuídas e acrescentou acompanhamento somente de leitura por vínculo. A autorização de aluno/turma continua sendo verificada em cada operação.

Os números nas seções de validação dos lotes 03–06 são históricos. Última regressão funcional, no lote 10: **688 unitários e 395 integração na API; 30 testes de sessão, 48 jornadas HTTP e 78 Chromium desktop/mobile emulado na web**, com CI aprovada. Revisão/publicação dos quizzes, habilidades e missões, entrega real Resend, validação humana/aparelhos e implantação operacional continuam pendentes; consulte [PROGRESS](../PROGRESS.md) e [CI/regressão](guia-ci-regressao.md).

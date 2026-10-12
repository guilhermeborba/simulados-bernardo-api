# ADR 008 — Confirmação e resultado idempotente de quiz

Data: 2026-10-12. Status: aceito e implementado no lote 04.

## Contexto

O quiz precisa devolver feedback após cada resposta, preservar o que foi confirmado ao recarregar a página e tolerar repetição de requests. Permitir editar a resposta depois de ver a explicação alteraria a pontuação da mesma tentativa. Corrigir pelo conteúdo editorial vivo também contrariaria os snapshots do [ADR 007](007-quizzes-versionados-e-snapshots-privados.md).

## Decisão

`AttemptsService` identifica `activityKind` e encaminha somente quizzes ao `QuizAttemptsService`. As rotas existentes são reutilizadas: `POST /attempts/:id/questions/:questionId/answer`, seu alias `POST /attempts/:id/answers`, `GET /attempts/:id/questions`, `POST /attempts/:id/finish` e `GET /attempts/:id/result`. Os fluxos de simulados mantêm suas regras de envio, edição e correção.

O body da confirmação contém `answer`, um objeto com exatamente uma chave entre `optionKey`, `selectedOption`, `answer` e `value`. Seu valor precisa ser string não vazia e identificar uma alternativa do snapshot. Espaços nas extremidades e caixa são normalizados; o servidor salva `{optionKey: <chave original da alternativa>}`. Arrays, mapas, números, valores vazios, opções inexistentes, chaves extras e aliases simultâneos são recusados com 400. A primeira entrega continua limitada a múltipla escolha.

Confirmar corrige no servidor usando pontos e gabarito do snapshot. A mesma transação grava resposta canônica, `isCorrect`, `pointsEarned`, `confirmedAt` e `feedback`. O feedback salvo contém somente `{isCorrect, pointsEarned, explanation, funFact}`: booleano, número, string não vazia e string ou null, respectivamente. Depois da confirmação, a resposta fica imutável. Repetir uma escolha equivalente retorna 201 com os mesmos ID, data e feedback, sem nova correção ou escrita; escolher outra alternativa válida retorna 409. Essa regra permanece após `FINISHED`, desde que o conteúdo continue autorizado. Tentativas abandonadas ou expiradas não aceitam confirmação/conclusão.

## Leitura e acesso

A leitura usa projeções explícitas. Questões não confirmadas incluem enunciado, dica, opções, pontos e ordem, com `answer`, `confirmedAt` e `feedback` nulos; não incluem explicação, curiosidade, mídia ou respostas oficiais. Questões confirmadas incluem a resposta própria e o feedback persistido. Opções e feedback JSON são reconstruídos por allowlists. Conteúdo armazenado malformado provoca erro genérico, sem devolver JSON bruto.

O gabarito estruturado nunca é público, inclusive no resultado. Explicação e curiosidade são feedback pedagógico após confirmação e podem explicar a solução; essa distinção mantém o [ADR 005](005-gabarito-protegido-no-backend.md).

Cada operação de conteúdo verifica o dono ou ADMIN e a visibilidade atual na mesma transação/conexão. O quiz precisa ter sido publicado, estar `PUBLISHED` ou `ARCHIVED`, não estar excluído e pertencer a disciplina ativa não excluída. Turma privada precisa existir e o aluno precisa continuar membro; ADMIN dispensa membership. Locks compartilhados na atividade precedem locks na tentativa: compartilhados para leitura e exclusivos para confirmação/conclusão. Isso serializa requests concorrentes e conserva a ordem usada por publicação, arquivamento e início. Outro aluno recebe 403; conteúdo inacessível recebe 404. Histórico pessoal e metadados não concedem acesso às questões.

## Conclusão

Concluir exige confirmação de todas as perguntas do snapshot. Respostas ausentes produzem 400 sem atualização parcial; não se cria uma resposta vazia nem se confirma uma pergunta automaticamente. O serviço soma pontos confirmados e máximos com `Prisma.Decimal`, calcula percentual com duas casas e arredondamento `ROUND_HALF_UP`, conta acertos/erros e registra duração e `finishedAt` numa única transação.

Repetir finish após `FINISHED` devolve o resultado salvo, sem mudar notas, datas, duração ou confirmar novamente. `GET /result` exige `FINISHED` e retorna `{attempt, questions}`, com totais e feedback por pergunta. Totais Decimal e pontos disponíveis nas perguntas são strings no JSON; `feedback.pointsEarned` e `questions[].pointsEarned` são números. Não há XP, ranking de quiz ou recompensa nesta entrega.

## Migração e validação

A migration aditiva `20261012210000_quiz_answer_confirmation` acrescenta `AttemptAnswer.confirmedAt` e `feedback`, ambos nullable. Um único bloco PostgreSQL `DO` aplica o DDL atomicamente. A constraint aceita ambos nulos, preservando respostas antigas, ou exige ambos preenchidos, feedback objeto, `isCorrect`/`pointsEarned` preenchidos e pontos entre 0 e 9999,99. Não há backfill, criação de snapshots de simulados ou correção retroativa.

Testes unitários verificam contratos, projeções, correção, transações e idempotência. Testes reais Nest/PostgreSQL cobrem confirmação, retomada, respostas concorrentes iguais/diferentes, concorrência com finish, rollback de gravação/conclusão, isolamento de acesso, versões estáveis e ausência de conteúdo oficial. Onze casos de migração sobre respostas antigas abertas/finalizadas verificam preservação de respostas, notas, datas e ausência de backfill, além da constraint, inclusive `numeric NaN`.

A migration foi aplicada somente em PostgreSQL descartável. Aplicação em produção segue o procedimento operacional do [guia](../guia-quizzes.md). Importação editorial/mídia e jornada web permanecem nos lotes 05 e 06.

# ADR 010 — Preferências de aprendizagem por conta

Data: 2026-10-12. Status: implementado tecnicamente no lote 06; revisão editorial e validação humana da jornada continuam pendentes.

## Contexto

O catálogo de quizzes cobre Educação Infantil, Fundamental I/II, Médio e Enfermagem. Escolhas de faixa, áudio e movimento precisam acompanhar a conta entre navegadores e o futuro app. A preferência de trilha anterior fica no localStorage do navegador; reutilizá-la automaticamente em aparelho compartilhado poderia atribuir a uma pessoa escolhas de outra.

Escolher uma faixa serve à apresentação do catálogo. Não muda StudentProfile, não concede membership e não libera conteúdo privado. Também não altera notas, ranking ou a correção das atividades.

## Contrato e identidade

`GET/PATCH /me/learning-preferences` usa JWT e permite qualquer role da própria conta ACTIVE não excluída. O serviço verifica subject não vazio e válido para consulta, além do estado atual no banco; não usa email/role do token para escolher outra identidade. Não aceita userId no body e não oferece consulta/edição por ID de outra conta.

A resposta contém exatamente `segment`, `schoolYear`, `audioEnabled` e `motionEnabled`. Defaults: filtros nulos, áudio false e movimento true. Ano exige segmento compatível: INFANTIL -1/-2, FUNDAMENTAL_I 1–5, FUNDAMENTAL_II 6–9, MEDIO 10–12, ENFERMAGEM 0. Segmento preenchido permite ano nulo; segmento nulo exige ano nulo.

PATCH é parcial. Null limpa somente filtros; booleans são estritos, sem coerção. A validação considera o estado mesclado: mudar de faixa com ano incompatível exige enviar ambos os campos juntos. Erro retorna 400 sem gravar parcialmente as outras escolhas. Conta indisponível ou subject inválido retorna 401.

## Persistência e concorrência

A migration aditiva `20261012230000_learning_preferences` cria enum LearningSegment e tabela LearningPreferences com userId como chave primária/FK. Defaults SQL coincidem com a API. CHECK de segmento/ano exige resultado verdadeiro, evitando que a semântica SQL de null permita ano sem segmento. A exclusão física de usuário remove a preferência pela FK cascade; exclusão lógica e mudança de status bloqueiam as rotas.

GET retorna os defaults quando ainda não há linha, sem gravação. PATCH vazio ou sem efeito mantém dados e datas. Não há backfill nem importação de preferências de navegador.

PATCH bloqueia a linha User antes de ler a preferência e verifica ACTIVE/deletedAt no mesmo comando. O parent lock existe antes da primeira gravação, serializando tanto a criação quanto atualizações seguintes. Depois de adquirir o lock, o serviço lê o estado mais recente, mescla/valida e faz upsert na mesma transação. Pedidos concorrentes que alteram campos diferentes não sobrescrevem escolhas omitidas; uma falha reverte a operação inteira.

## Consumo web e continuidade mobile

A web carrega as escolhas pela API e serializa leituras/gravações. O estado carrega a identidade da conta; troca/logout limpa os valores e invalida respostas/filas antigas. Ao iniciar login, registro ou logout, a web aborta requisições autenticadas pendentes antes de alterar cookies e serializa as operações de autenticação; bootstrap e filas antigas também são invalidados por geração. Resultado atrasado de outra conta é ignorado. A interface confirma escolhas salvas e informa erro mantendo o último estado confirmado, sem dependência de localStorage para o fluxo de quizzes.

Áudio habilitado libera controles, sem autoplay; movimento pode ser reduzido pela preferência e por `prefers-reduced-motion`. O catálogo aceita filtros nulos para explorar todas as faixas. Preferências estão disponíveis para todos os roles; runner e histórico de quizzes continuam exigindo STUDENT. O futuro mobile pode reutilizar o mesmo contrato e deverá manter o isolamento de conta.

## Verificação e limites

25 novos testes unitários verificam DTOs estritos, defaults, identidade, merge/validação e ausência de gravações sem efeito. 52 casos reais Nest/PostgreSQL cobrem 15 faixas, roles, isolamento, primeira gravação concorrente e updates seguintes, rollback, JWT/status, turma privada, CHECK e cascade. A API completa passou 406 unitários e 214 casos de integração; web passou 30 testes de sessão e 16 jornadas HTTP. Builds API/web, lint da API e Prisma validate passaram; **24 testes Chromium desktop/mobile emulado** validaram os cinco segmentos, teclado, axe, fallback, retomada, perda de respostas e troca de conta. Bundles de quiz foram inspecionados sem gabaritos, identificadores privados de mídia ou fixtures sintéticas.

Migrations somente em banco descartável; nenhum banco existente, seed em produção ou deploy alterado. Os 45 quizzes/213 perguntas continuam PENDING; testes usam conteúdo sintético e não equivalem à revisão editorial. Usabilidade com pessoas, leitor de tela e aparelhos reais continua pendente. Missões e XP seguem para o lote 07; não fazem parte desta decisão.

Contratos: [guia de quizzes](../guia-quizzes.md). Execução: [CI e regressão](../guia-ci-regressao.md). Conteúdo: [matriz editorial](../matriz-editorial-quizzes.md).

# Estado do Projeto — simulados-bernardo-api

> Atualizado em: 2026-10-13
> Atualizar este arquivo ao concluir cada fase ou iniciativa relevante.

## Status geral

As 6 fases do plano original do backend foram implementadas, e a **integração web/API já existe no código atual**. O foco passa a incluir quizzes, missões, recompensas, revisão de dificuldades e preparação do app mobile, mantendo a expansão de conteúdo. Os lotes 01 e 02 validam sessões, acervo e fluxos existentes com regressão automatizada e CI. O lote 03 acrescenta autoria, versões e snapshots privados de quiz; o lote 04 implementa confirmação, feedback imediato e resultado idempotente. O lote 05 entrega importação e mídia, com 45 quizzes preparados nas 15 faixas; revisão humana e publicação continuam pendentes. O lote 06 implementa a jornada web de quiz, o BFF de mídia e preferências por conta. O lote 07 acrescenta missões semanais, XP transacional e Aprender hoje. O lote 08 acrescenta avatar, coleções e conquistas. O lote 09 acrescenta habilidades, evidências separadas e revisão de dificuldades. O próximo trabalho técnico é acesso docente/responsável e recuperação de senha (lote 10); revisão editorial e validação humana de uso continuam pendentes.

---

## Fases de desenvolvimento

| Fase | Título | Status |
|---|---|---|
| 1 | Fundação do backend | ✅ Concluída |
| 2 | Autenticação e usuários | ✅ Concluída |
| 3 | Disciplinas, simulados e questões | ✅ Concluída |
| 4 | Tentativas e correção | ✅ Concluída |
| 5 | Perfil e relatórios | ✅ Concluída |
| 6 | Segurança, hardening e produção | ✅ Concluída |

Pendências menores (não bloqueantes para produção):

- `POST /auth/forgot-password` + `POST /auth/reset-password` (recuperação de senha) — especificado, não implementado
- Restrição de professor a turmas autorizadas — professor existe como role mas sem controle de acesso a alunos específicos
- Validação humana de uso — automação HTTP/navegador não substitui observação por segmento, leitor de tela e aparelhos reais; o fechamento automatizado do lote 06 está registrado abaixo

---

## Conteúdo de simulados

**584 arquivos, 588 simulados publicáveis e 17.684 questões**, validados sem banco no lote 02 sobre a `main` de 12/10/2026. Há **192 simulados planejados** (96 da 2ª série e 96 da 3ª série do Médio) sem publicação, registrados explicitamente em `prisma/seed-backlog.ts`. Arquivo presente não promove uma entrada: é necessária revisão editorial e dry-run.

O arquivo legado de Português contém cinco simulados privados da turma Bernardo, preservados no inventário. Os números refletem o conteúdo versionado desta entrega; arquivos locais de Ensino Médio ainda em produção não foram incorporados. O registro anterior (492 simulados em 09/10) é histórico.

Consulte [inventário do acervo](docs/inventario-acervo.md) e execute `npm run seed:inventory` para obter o estado atual. O dry-run falha em conteúdo publicável ausente/inválido e o relatório não inclui gabaritos.

### Ensino Fundamental I (1º ao 5º ano)

Disciplinas: Ciências, Geografia, História, Matemática, Português — **todos os bimestres AV1+AV2 de todos os anos**. Total: 225 simulados, incluindo os cinco do legado.

| Série | Arquivos | Status |
|---|---|---|
| 1º ano | 40 | ✅ Completo |
| 2º ano | 40 | ✅ Completo |
| 3º ano | 60 (+5 simulados no legado) | ✅ Versionados e validados |
| 4º ano | 40 | ✅ Completo |
| 5º ano | 40 | ✅ Completo |

### Ensino Fundamental II (6º ao 9º ano)

Disciplinas: Arte, Ciências, Ed. Física, Geografia, História, Inglês, Matemática, Português — **todos os bimestres AV1+AV2 de todos os anos**.

| Série | Arquivos | Status |
|---|---|---|
| 6º ano | 64 | ✅ Completo |
| 7º ano | 64 | ✅ Completo |
| 8º ano | 64 | ✅ Completo |
| 9º ano | 64 | ✅ Completo |

### Ensino Médio

| Série | Simulados publicáveis | Planejados | Status |
|---|---|---|---|
| 1ª série | 96 | 0 | ✅ Versionados e validados |
| 2ª série | 0 | 96 | Produção/revisão editorial pendente |
| 3ª série | 0 | 96 | Produção/revisão editorial pendente |

### Outros

| Segmento | Cobertura | Status |
|---|---|---|
| Educação Infantil | Infantil 4 e 5 (todos os campos BNCC) | ✅ Completo |
| Enfermagem | Curso técnico (formato `topic`, sem bimestre) | ✅ Presente |

**Convenção de branch para novo simulado:** `feat/{disciplina-curta}-{ano}ano-b{bimestre}av{avaliacao}`

---

## Próximas iniciativas

### 1. Evolução para quizzes, aprendizagem lúdica e mobile

Plano: [Evolução — quizzes, gamificação e mobile](docs/superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md).

**Planejamento concluído em 2026-10-12; lotes 01 a 04 concluídos e lotes 05 a 08 implementados tecnicamente.** Revisão/publicação editorial, validação humana de uso e as demais entregas continuam pendentes. Público confirmado: Educação Infantil, Fundamental I e II, Ensino Médio e Enfermagem desde o primeiro lançamento. Catálogo preparado: 45 quizzes e 213 perguntas, distribuídos por todas as faixas, ainda sem aprovação editorial.

Sequência: consolidar a base → quizzes na web → missões/XP/avatar/conquistas → revisão e progresso por habilidade → prova e planejamento mobile → app/beta. Entregas, dependências, estimativas condicionais e critérios de aceite estão no plano.

**Lote 01 concluído:** BFF isola a renovação por sessão e trata 401 tardio sem cruzar contas; falhas temporárias preservam cookies. Backend consome o refresh e cria seu sucessor numa transação, com rollback em falhas. Logout revoga a cadeia e impede regravar cookies de uma renovação pendente.

Validação: 25 testes de sessão web; 83 unitários da API; 8 testes PostgreSQL descartável; verificações HTTP nas rotas Next reais; build da API e build web com fixture local de fontes. O build web comum falhou no loader Google Fonts em arquivo não alterado; o download real permanece pendente de verificação. Nenhum banco existente ou seed foi alterado. O coordenador BFF é por processo; avaliar coordenação compartilhada antes de ampliar réplicas.

Decisão: [ADR 006 — Rotação atômica e revogação da sessão](docs/decisions/006-rotacao-atomica-e-revogacao-de-sessao.md).

**Lote 02 concluído:** inventário com backlog editorial explícito e validação de arquivos, exports, tipos, alternativas, mapas de gabarito e metadados. API e web passam pelos fluxos de registro/login, convite, catálogo privado, início/retomada, envio/edição, conclusão e histórico usando PostgreSQL descartável. Perfis e vínculos de responsáveis usam o presenter de usuário seguro, sem `passwordHash`; alunos excluídos não aparecem na lista do responsável.

CI adicionada nos dois repositórios: API com lint, unitários, build, validação do acervo e integração; web com tipos, sessão, build normal e regressão HTTP contra API real. As cinco fontes da web são originais locais com licenças OFL, eliminando a falha de download durante o build. A validação do lote 02 supera a limitação de fontes registrada no lote 01.

Validação local do lote 02: 43 testes de integração API/PostgreSQL (35 de fluxos + 8 de refresh), 8 jornadas HTTP web/Next/API/PostgreSQL e 25 testes de sessão web. Também passaram 120 testes unitários da API, lint e os builds normais dos dois projetos. Detalhes no [guia de CI e regressão](docs/guia-ci-regressao.md). Os workflows das PRs 205 (API) e 40 (web) passaram no GitHub e as PRs foram integradas à main antes do lote 03. Nenhum banco existente, seed em produção ou deploy foi alterado.

**Lote 03 concluído:** migration aditiva distingue `SIMULATION`/`QUIZ`, preserva dados/sentinelas e audita tentativas abertas duplicadas antes de criar unicidade. `QuizzesModule` oferece gestão ADMIN, versões imutáveis após publicação e catálogo da última versão publicada autorizada. Início/retomada cria snapshots privados na mesma transação; leitura recupera conteúdo iniciado e revalida owner/turma/disciplina. Gabarito, explicação, curiosidade e mídia não aparecem nas questões não confirmadas do aluno. Quizzes não entram nos catálogos, históricos, relatórios, ranking, seed ou ferramenta de limpeza de simulados.

Validação do lote 03: 212 testes unitários, 79 de integração PostgreSQL (incluindo migração sobre legado populado, abort/rollback de duplicatas, versões/inícios concorrentes, rollback de snapshots e pool privado de uma conexão), 8 jornadas HTTP web/Next/BFF contra a API desta entrega, lint, build e dry-run de 588 simulados/17.684 questões. A migration só foi aplicada a bancos descartáveis. Contratos e procedimento operacional no [guia de quizzes](docs/guia-quizzes.md); decisão no [ADR 007](docs/decisions/007-quizzes-versionados-e-snapshots-privados.md).

Nesta entrega, quizzes aceitam múltipla escolha e explicação obrigatória; schema de mídia está reservado, sem aceitação até a política do lote 05. No fechamento do lote 03, as rotas de resposta/finish/result rejeitavam quizzes; o lote 04 abaixo implementa esses contratos. Nenhum quiz editorial foi semeado e a interface web não foi alterada.

**Lote 04 concluído:** confirmação corrige no servidor usando o snapshot da tentativa e grava resposta canônica, `confirmedAt` e feedback na mesma transação. A resposta fica bloqueada: reenvio equivalente recupera o feedback persistido, inclusive após concluir; outra alternativa retorna conflito. Retomada expõe resposta/feedback apenas das questões confirmadas, com projeções explícitas que excluem gabaritos e campos privados.

Conclusão exige todas as questões confirmadas, soma os pontos com Decimal e grava status/totais uma única vez; finishes concorrentes e reenvios retornam o mesmo resultado. Locks coordenam confirmação, leitura, arquivamento e conclusão; owner, turma e disponibilidade são revalidados dentro da transação. A migration aditiva conserva respostas antigas de simulados, sem backfill. Quizzes arquivados permitem continuar tentativas existentes com acesso válido; revogação de acesso bloqueia conteúdo, preservando o resumo pessoal.

Validação do lote 04: **278 testes unitários, 117 testes de integração PostgreSQL e 8 jornadas HTTP web/Next/BFF/API** passaram, além de lint, build, validação Prisma e dry-run do mesmo acervo. A integração cobre confirmação/conclusão concorrentes, perda de resposta seguida de reenvio, pontuação decimal, rollback de gravação, alterações de versão, autorização e ausência de conteúdo privado. Migration somente em bancos descartáveis; nenhuma base existente, seed editorial ou deploy alterado. Contratos no [guia de quizzes](docs/guia-quizzes.md) e decisão no [ADR 008](docs/decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md). No fechamento do lote 04, XP, mídia e telas de quiz ainda estavam pendentes; lotes 05/06 abaixo implementam mídia e jornada web.

**Lote 05 implementado tecnicamente; revisão/publicação pendentes:** catálogo próprio com 45 quizzes/213 perguntas, três quizzes por cada uma das 15 faixas, em cinco arquivos JSON. Toda entrada permanece `PENDING`; a matriz apresenta temas e responsáveis a definir. Importação exige ADMIN ativo existente, valida o lote completo e cria DRAFT por padrão. Dry-run/inventário funcionam sem banco e não exportam perguntas/gabaritos. Reimportação preserva conteúdo, IDs, datas e tentativas; divergência exige nova versão consecutiva. Publicação pelo importador exige revisão real com responsável/data/hash correspondente ao conteúdo.

As 18 perguntas infantis têm ilustrações SVG originais modernizadas, narração pt-BR, alt e transcrição. Registro limita formato/tamanho, fixa SHA-256 e conserva assets antigos. O início copia mídia para snapshots; a leitura pública expõe somente URLs relativas à tentativa e descrições. Entrega dos bytes exige dono/ADMIN e acesso atual, aceita Range e usa no-store; falha do arquivo preserva texto e não bloqueia confirmação/conclusão. Os assets empacotados são genéricos; upload/armazenamento confidencial de arquivos privados de turma continua fora desta implementação.

Validação do lote 05: **381 testes unitários, 162 testes de integração PostgreSQL e 8 jornadas HTTP web/Next/BFF/API**, lint, build, Prisma validate e dry-runs de simulados e quizzes. A integração inclui o catálogo completo importado duas vezes, imutabilidade/rollback/concorrência e mídia autorizada do snapshot com fallback. Nenhum banco existente, seed em produção ou deploy alterado. Operação no [guia de quizzes](docs/guia-quizzes.md), catálogo para revisão na [matriz editorial](docs/matriz-editorial-quizzes.md) e decisão no [ADR 009](docs/decisions/009-catalogo-editorial-e-midia-versionada-de-quiz.md).

**Lote 06 implementado tecnicamente:** a web oferece `/quizzes`, `/quiz/[quizId]` e `/quizzes/historico`, com filtros para as 15 faixas, disciplina/tema, seleção antes de confirmar, feedback, retomada, resultado e histórico separado de simulados. O runner exige conta STUDENT; os outros perfis podem explorar o catálogo e salvar suas preferências. O BFF libera os contratos de aluno de quiz e entrega SVG/WAV sem converter bytes em JSON, com cookies httpOnly, Range, validação de MIME/tamanho e no-store. A interface conserva texto alternativo/transcrição quando a mídia falha, usa áudio acionado pelo aluno e permite reduzir movimento.

`GET/PATCH /me/learning-preferences` persiste segmento/ano, áudio e movimento por conta ativa. Defaults são filtros nulos, áudio desativado e movimento habilitado. PATCH mescla o estado sob lock do usuário, verifica compatibilidade de ano/segmento e preserva campos em requisições concorrentes. A migration é aditiva, sem backfill; preferências não mudam perfil escolar nem autorização de turma. A web limpa o estado ao trocar de conta e ignora respostas atrasadas da conta anterior. Decisão: [ADR 010 — Preferências de aprendizagem por conta](docs/decisions/010-preferencias-de-aprendizagem-por-conta.md).

Fechamento da validação do lote 06: **409 unitários e 214 testes de integração API/PostgreSQL** passaram, incluindo 25 unitários/52 casos novos de preferências; **30 testes de sessão e 16 jornadas HTTP web** passaram. Builds API/web, lint da API e Prisma validate passaram; **24 testes de navegador Chromium desktop/mobile emulado** passaram, cobrindo os cinco segmentos, teclado, axe, retomada, respostas HTTP perdidas, fallback e sessão/preferências entre contas. Os bundles das páginas de quiz foram inspecionados sem gabaritos, identificadores privados de mídia ou fixtures sintéticas; esses testes não substituem sessões com pessoas, leitor de tela e aparelhos reais. Os testes legados de dias seguidos agora usam relógio fixo e cobrem a virada UTC/São Paulo; 17 casos passaram nos dois fusos e os 409 unitários passaram em UTC. Migrations somente em PostgreSQL descartável; nenhum banco existente, seed em produção, publicação editorial ou deploy alterado.

**Lote 07 implementado tecnicamente:** o módulo Learning oferece autoria ADMIN de missões por segmento/ano/turma/semana, duas posições editoriais, rascunhos editáveis e publicação imutável. A semana abre segunda-feira 00:00 e encerra na próxima segunda em America/Sao_Paulo. Publicação exige todas as atividades disponíveis e compatíveis; missões incompletas ou sem acesso ficam fora da projeção do aluno. Progresso por atividade e conclusão são persistidos por conta, sem contabilizar práticas anteriores à publicação ou depois da janela.

A conclusão de quiz grava resultado, `QuizCompletionReward`, `XpEvent` e progresso na mesma transação. A primeira conclusão de cada `activityKey` por aluno/dia concede **10 XP**, até **50 XP/dia**; versões novas não reiniciam a elegibilidade e reenvios devolvem o recibo gravado. Acertos não condicionam XP e missões não adicionam bônus. Tentativas antigas permanecem sem backfill de XP. Um mutex do aluno respeita a concorrência e as FKs de início de atividade; locks compartilhados e reconsulta das versões protegem a disponibilidade de todas as etapas durante a concessão.

`GET /me/learning-home` reúne faixa resolvida, saldo, retomada autorizada, missões e quiz sugerido; `GET /me/missions` retorna as mesmas missões. Query de ano prevalece sobre preferência e perfil. A home web apresenta Aprender hoje, os resultados mostram XP salvo no servidor e a troca de conta cancela estado/requisições anteriores. Links de conclusões conservam a versão original quando autorizada; origem indisponível oferece prática na versão atual sem perder progresso. Os problemas de contraste e de cabeçalho mobile encontrados pelos testes da home foram corrigidos.

O exportador offline `seed:missions:dry-run`/`seed:missions:inventory:json` prepara **30 rascunhos PENDING**, dois por cada uma das 15 faixas, com referências aos 45 quizzes. Não conecta ao banco nem publica. Em **2026-10-13**, o responsável pelo projeto assumiu a revisão dos quizzes preparados, incluindo Infantil e Enfermagem; isso não registra aprovação de conteúdo.

Validação final do lote 07: **479 testes unitários, 267 testes de integração API/PostgreSQL, 30 testes de sessão, 23 jornadas HTTP web e 38 testes Chromium desktop/mobile emulado** passaram. Lint/builds API/web, typecheck web, Prisma validate e os dry-runs de 588 simulados/17.684 questões, 45 quizzes/213 perguntas e 30 rascunhos de missão passaram. Os 53 casos novos de integração cobrem também migration sobre histórico, rollback de cada gravação, virada de semana/dia, concorrência com arquivo de uma etapa e início de outra atividade sob locks de FK. Axe verificou a home inteira pública/autenticada e resultados, sem violações detectadas; navegação mobile passou sem overflow, incluindo logout real e resposta atrasada de outra sessão. Isso não substitui avaliação com pessoas/leitor de tela/aparelhos reais. Operação em [missões e XP](docs/guia-missoes-xp.md), decisão no [ADR 011](docs/decisions/011-missoes-semanais-e-xp-transacional.md). Migration somente em PostgreSQL descartável; nenhuma base existente, seed em produção ou publicação editorial alterados.

Próxima tarefa técnica: **lote 08 — avatar, coleções e conquistas**. Os 45 quizzes/213 perguntas e os rascunhos de missão permanecem pendentes de revisão/publicação. O lançamento nas 15 faixas depende dessa revisão e da validação humana de uso. Continuam pendentes observação de uma sessão por segmento, leitor de tela/aparelhos reais, alinhamento final dos textos e métricas da etapa 0.

### Integração front-end / API — base existente

Spec histórica: `docs/superpowers/specs/2026-08-12-integracao-frontend-api-design.md`
Plano histórico: `docs/superpowers/plans/2026-08-12-integracao-frontend-api-plan.md`

A inspeção do frontend em `/home/guilhermeborba/projects/simulados-bernardo` confirmou login/registro, BFF com cookies httpOnly, catálogo da API, tentativa, retomada, resultado, histórico, convite e ranking no código atual. A validação funcional e os ajustes de sessão fazem parte da etapa 0 do novo plano.

O endpoint `GET /attempts/:id/questions` **já está implementado** em `AttemptsController` e `AttemptsService`, inclusive com recuperação das respostas do aluno, sem gabarito. A pendência da spec/plano de agosto foi superada pelo código atual.

### 2. Recuperação de senha

Endpoints planejados mas não implementados: `POST /auth/forgot-password` e `POST /auth/reset-password`. Requer envio de e-mail — decidir provider antes de implementar.

---

## Infraestrutura

- **Deploy:** Railway (ver `docs/guia-deploy.md` e `.railway/`)
- **Banco:** PostgreSQL (Docker localmente, Railway em produção)
- **CI:** GitHub Actions em `.github/workflows/ci.yml`; detalhes no [guia de CI e regressão](docs/guia-ci-regressao.md)
- **Swagger:** `GET /docs` (habilitar com `API_DOCS_ENABLED=true`)

---

## Decisões arquiteturais registradas

Ver `docs/decisions/` para o raciocínio por trás das escolhas não óbvias do projeto.

---

## Avatar, coleções e conquistas — lote 08

Cinco conquistas são verificadas no servidor: primeira conclusão, três temas, cinco quizzes lógicos distintos, primeira missão e 100 XP. Elas liberam cinco itens além do item inicial. Ownership e escolha de apresentação/ item ficam salvos por conta; GET /me/achievements e GET/PATCH /me/avatar exigem aluno ativo. Concessões acontecem na mesma transação de finish, com unicidade e mutex por aluno. Reenvios, versões e conclusões simultâneas não duplicam itens, XP ou resultado. Respostas erradas e conclusões após teto diário contam para o progresso apropriado.

A migration aditiva recupera conquistas/itens sustentados por recibos, missões concluídas e ledger existentes do lote 07, preservando tentativas, notas e saldo. Histórico anterior sem recibo não ganha conclusão ou XP retroativo. Ausência, troca de faixa, arquivamento de conteúdo, revogação de turma e remoção da tentativa de origem não retiram ownership. Agregados de coleção não revelam temas privados ou dados de outra conta.

A web oferece /colecao com prévia, itens liberados/bloqueados, critérios, progresso e salvamento confirmado. AUTO usa Bolinha no Infantil, Capelo no Fundamental I e selos nas faixas mais velhas; qualquer aluno pode escolher MASCOT ou SEAL. Home e resultado dão acesso à coleção.

**Validação:** 513 testes unitários/33 suites e 309 casos Nest/PostgreSQL/14 suites passaram, além de lint/build e Prisma validate. Incluem as 15 faixas, histórico populado antes da migration, falha de gravação com rollback de finish/XP/missão, temas normalizados, versões, turma, concorrência e persistência. A regressão legada de missões recebeu uma porta de escuta durável no servidor de teste para evitar ECONNRESET quando Supertest fechava um listener temporário em chamadas simultâneas. Web: 30 testes de sessão, 30 jornadas HTTP e 52 Chromium desktop/mobile passaram, com persistência em outro navegador, contas/respostas atrasadas, teclado, falhas/retry, Axe e ausência de overflow.

[ADR 012](docs/decisions/012-avatar-colecoes-e-conquistas.md) e [guia da coleção](docs/guia-colecoes-conquistas.md) registram regras e contratos. Revisão dos 45 quizzes e curadoria dos 30 rascunhos de missão continuam pendentes; o responsável pelo projeto assumiu a revisão sem aprovar o conteúdo. Não houve deploy, seed, migration em base existente ou publicação editorial. Validação com pessoas, leitor de tela e aparelhos reais continua pendente. Na conclusão do lote 08, a próxima tarefa técnica era o lote 09, entregue abaixo.


---

## Habilidades e revisão — lote 09

Habilidades têm código/versão, disciplina/faixa, estado editorial e revisão explícita por ADMIN ativo. Autoria de quiz permite uma habilidade principal por pergunta; publicação exige classificações revistas/publicadas. O catálogo offline propõe **45 habilidades e 213 classificações nas 15 faixas**, todas PENDING, vinculadas a hashes das fontes. Importação prepara somente rascunhos íntegros e não reclassifica versões publicadas. São objetivos internos iniciais, sem equivalência curricular presumida; aprovação humana continua pendente.

O snapshot congela metadados da habilidade no início. Progresso usa apenas respostas confirmadas de tentativas concluídas e separa primeiras respostas NORMAL, repetição NORMAL e REVIEW. A identidade activityKey/originKey é compartilhada entre versões, habilidades e modos: pergunta vista antes em revisão ou sem classificação não ganha primeira observação retrospectiva. Cinco primeiras respostas distintas permitem indicar registros iniciais disponíveis; repetição/revisão não promovem esse estado nem declaram domínio. Histórico sem classificação permanece sem classificação.

Dificuldades recentes usam a última resposta de cada origem nos últimos 30 dias; acerto posterior resolve a indicação de dificuldade. REVIEW escolhe até cinco perguntas de um único quiz atual publicado e autorizado sobre a mesma habilidade/faixa, priorizando perguntas diferentes e marcando as praticadas. Pode usar outro quiz da mesma habilidade. NORMAL e REVIEW têm tentativas abertas independentes. Confirmação, retomada e conclusão continuam idempotentes; REVIEW não grava recibo gamificado, XP, missão ou itens. Permissões de turma e status/papel atuais são verificados; uma conta alterada não conserva acesso com JWT antigo. Relatórios/ranking de simulados preservam o recorte de avaliação.

A web oferece /progresso, contadores/evidência, sugestões, revisão em andamento, runner com indicação de prática, resultado e filtros de histórico. Conta/geração e cancelamento impedem misturar respostas atrasadas entre contas; o BFF exige Origin correspondente no novo POST.

**Validação técnica:** 571 testes unitários/37 suites e 368 casos Nest/PostgreSQL/17 suites passaram, além de lint/build e dry-runs de quizzes, habilidades e missões. Cobertura inclui histórico antes da migration, constraints, rascunhos/hash/escopo de turma, revisão explícita, rollback de lote, 15 faixas, concorrência por modo, revogação/status/papel atual, versões, histórico sem classificação e ausência de recompensas em REVIEW. Web: typecheck/build, 30 testes de sessão, 39 jornadas HTTP e 64 Chromium desktop/mobile passaram, incluindo teclado, retomada, falhas/retry, contas atrasadas, Axe e overflow. CI fixa o commit compatível da API.

[ADR 013](docs/decisions/013-habilidades-e-revisao.md), [guia de habilidades](docs/guia-habilidades-revisao.md) e plano de evolução registram contratos, limites e curadoria. Os 45 quizzes/213 perguntas, 45 habilidades/classificações e 30 rascunhos de missão continuam pendentes de revisão/publicação. O responsável pelo projeto assumiu a revisão dos quizzes sem aprovar o conteúdo. Não houve seed, migration em banco existente ou deploy. Avaliação com pessoas, leitor de tela e aparelhos reais permanece pendente. Próxima tarefa técnica: **lote 10 — acesso docente/responsável e recuperação de senha**.

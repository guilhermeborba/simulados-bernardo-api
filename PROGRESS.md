# Estado do Projeto — simulados-bernardo-api

> Atualizado em: 2026-10-14
> Atualizar este arquivo ao concluir cada fase ou iniciativa relevante.

## Status geral

As 6 fases do plano original do backend foram implementadas, e a **integração web/API já existe no código atual**. O foco passa a incluir quizzes, missões, recompensas, revisão de dificuldades e preparação do app mobile, mantendo a expansão de conteúdo. Os lotes 01 e 02 validam sessões, acervo e fluxos existentes com regressão automatizada e CI. O lote 03 acrescenta autoria, versões e snapshots privados de quiz; o lote 04 implementa confirmação, feedback imediato e resultado idempotente. O lote 05 entrega importação e mídia, com 45 quizzes preparados nas 15 faixas; revisão humana e publicação continuam pendentes. O lote 06 implementa a jornada web de quiz, o BFF de mídia e preferências por conta. O lote 07 acrescenta missões semanais, XP transacional e Aprender hoje. O lote 08 acrescenta avatar, coleções e conquistas. O lote 09 acrescenta habilidades, evidências separadas e revisão de dificuldades. O lote 10 implementa acompanhamento por vínculos atuais e recuperação de senha com Resend. O lote 11 está em andamento com protótipo Expo e prova automatizada; o aceite em aparelhos reais continua pendente, assim como ativação de e-mail real, revisão editorial e validação humana de uso continuam pendentes.


## Entregas da evolução — posição em 13/10/2026

Os lotes **01 a 10 estão implementados e integrados à `main`** dos repositórios envolvidos. A integração de código não confirma implantação em produção nem publicação editorial. Os detalhes abaixo são registros do fechamento de cada lote; os totais antigos de testes são históricos.

| Lote | Entrega técnica | PRs integradas |
|---|---|---|
| 01 | Renovação isolada, rotação atômica e logout concorrente | [API #204](https://github.com/guilhermeborba/simulados-bernardo-api/pull/204), [web #39](https://github.com/guilhermeborba/simulados-bernardo/pull/39) |
| 02 | Inventário de simulados, regressão real, CI e fontes locais | [API #205](https://github.com/guilhermeborba/simulados-bernardo-api/pull/205), [web #40](https://github.com/guilhermeborba/simulados-bernardo/pull/40) |
| 03 | Modelo, versões e snapshots privados de quiz | [API #206](https://github.com/guilhermeborba/simulados-bernardo-api/pull/206) |
| 04 | Confirmação, feedback e resultado idempotente | [API #207](https://github.com/guilhermeborba/simulados-bernardo-api/pull/207) |
| 05 | Importação editorial, catálogo e mídia Infantil modernizada | [API #208](https://github.com/guilhermeborba/simulados-bernardo-api/pull/208) |
| 06 | Catálogo/runner/histórico web, mídia no BFF e preferências por conta | [API #209](https://github.com/guilhermeborba/simulados-bernardo-api/pull/209), [web #41](https://github.com/guilhermeborba/simulados-bernardo/pull/41) |
| 07 | Aprender hoje, missões semanais e XP transacional | [API #210](https://github.com/guilhermeborba/simulados-bernardo-api/pull/210), [web #42](https://github.com/guilhermeborba/simulados-bernardo/pull/42) |
| 08 | Avatar, coleção e conquistas persistidos | [API #211](https://github.com/guilhermeborba/simulados-bernardo-api/pull/211), [web #43](https://github.com/guilhermeborba/simulados-bernardo/pull/43) |
| 09 | Habilidades, evidências e revisão de dificuldades | [API #212](https://github.com/guilhermeborba/simulados-bernardo-api/pull/212), [web #44](https://github.com/guilhermeborba/simulados-bernardo/pull/44) |
| 10 | Acompanhamento por vínculo e recuperação de senha com Resend | [API #213](https://github.com/guilhermeborba/simulados-bernardo-api/pull/213), [web #45](https://github.com/guilhermeborba/simulados-bernardo/pull/45) |
| 11 | Prova e planejamento mobile | Protótipo e prova automatizada; aceite físico pendente |
| 12 | App e beta | Não iniciado |

### Validação mais recente — fechamento do lote 10

| Projeto | Resultado automatizado |
|---|---|
| API | **688 unitários / 39 suites; 395 casos Nest/PostgreSQL / 21 suites**; lint, build e Prisma validate |
| Web | **30 testes de sessão; 48 jornadas HTTP / 6 suites; 78 testes Chromium desktop/mobile emulado**; typecheck e build |
| Conteúdo offline | Dry-runs de simulados, quizzes, missões e habilidades aprovados; sem gravação em banco |

As CIs de implementação passaram: [API — execução 38438311892](https://github.com/guilhermeborba/simulados-bernardo-api/actions/runs/38438311892) e [web — execução 38439597355](https://github.com/guilhermeborba/simulados-bernardo/actions/runs/38439597355). As PRs #213/#45 foram integradas em 13/10/2026. A CI web fixa o commit compatível da API `e0b19669723de7d67c778fcc08a3f300b0003fa1`; o workflow identifica o contrato usado em cada execução.

### Pendências para ativação e lançamento

| Frente | Estado e próxima ação |
|---|---|
| Editorial de quizzes | **45 quizzes / 213 perguntas nas 15 faixas, todos PENDING**. O responsável pelo projeto assumiu a revisão; registrar somente avaliações realizadas e publicar depois da aprovação |
| Habilidades e classificações | **45 habilidades / 213 classificações PENDING**. Revisar objetivos e vínculos antes de publicar quizzes classificados |
| Missões | **30 rascunhos PENDING**, dois por faixa. Curar as semanas e publicar após disponibilizar os quizzes correspondentes |
| Recuperação de senha | Resend desativado por padrão. Configurar chave/remetente verificado e validar entrega real em ambiente autorizado |
| Limite de recuperação | 20 pedidos/minuto por endpoint e IP observado pela API. Navegadores que usam o mesmo BFF compartilham esse orçamento; definir a configuração de proxy/perímetro antes de ampliar o uso |
| Uso e acessibilidade | Observar sessões nos cinco segmentos, incluindo Infantil com adulto; testar leitor de tela e aparelhos físicos. Chromium mobile emulado não encerra esse aceite |
| Operação e métricas | Implantar migrations/API/web pelo processo autorizado, alinhar textos finais e definir eventos/linha de base; não houve deploy destas entregas |
| Mobile | Lote 11 com protótipo Expo, ADR provisório e backlog preliminar; Android primeiro confirmado; builds instaláveis e matriz física Android ainda precisam de validação. iOS será validado antes do seu beta. Lote 12 permanece futuro |

Migrations foram exercitadas **somente em PostgreSQL descartável**. Não houve importação/publicação editorial em base existente nem envio externo de e-mail. Os arquivos locais de conteúdo em produção continuam fora destas branches.

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

Pendências de ativação e validação (detalhadas no quadro acima):

- Ativação do Resend — implementação e transporte local disponíveis no lote 10; configurar chave/remetente verificado e verificar entrega real no ambiente autorizado
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

**Planejamento criado em 2026-10-12; lotes 01 a 10 já implementados e integrados, posição em 2026-10-13.** Revisão/publicação editorial, validação humana de uso e as demais entregas continuam pendentes. Público confirmado: Educação Infantil, Fundamental I e II, Ensino Médio e Enfermagem desde o primeiro lançamento. Catálogo preparado: 45 quizzes e 213 perguntas, distribuídos por todas as faixas, ainda sem aprovação editorial.

Sequência: consolidar a base → quizzes na web → missões/XP/avatar/conquistas → revisão e progresso por habilidade → prova e planejamento mobile → app/beta. Entregas, dependências, estimativas condicionais e critérios de aceite estão no plano.

**Lote 01 concluído:** BFF isola a renovação por sessão e trata 401 tardio sem cruzar contas; falhas temporárias preservam cookies. Backend consome o refresh e cria seu sucessor numa transação, com rollback em falhas. Logout revoga a cadeia e impede regravar cookies de uma renovação pendente.

Validação: 25 testes de sessão web; 83 unitários da API; 8 testes PostgreSQL descartável; verificações HTTP nas rotas Next reais; build da API e build web com fixture local de fontes. Naquele fechamento, o build web comum falhava no loader Google Fonts em arquivo não alterado e o download real não havia sido verificado; o lote 02 resolveu essa limitação com fontes locais originais. Nenhum banco existente ou seed foi alterado. O coordenador BFF é por processo; avaliar coordenação compartilhada antes de ampliar réplicas.

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

No fechamento do lote 07, a próxima tarefa técnica era o lote 08, entregue abaixo. Os 45 quizzes/213 perguntas e os rascunhos de missão permanecem pendentes de revisão/publicação. O lançamento nas 15 faixas depende dessa revisão e da validação humana de uso. Continuam pendentes observação de uma sessão por segmento, leitor de tela/aparelhos reais, alinhamento final dos textos e métricas da etapa 0.

### Integração front-end / API — base existente

Spec histórica: `docs/superpowers/specs/2026-08-12-integracao-frontend-api-design.md`
Plano histórico: `docs/superpowers/plans/2026-08-12-integracao-frontend-api-plan.md`

A inspeção do frontend em `/home/guilhermeborba/projects/simulados-bernardo` confirmou login/registro, BFF com cookies httpOnly, catálogo da API, tentativa, retomada, resultado, histórico, convite e ranking no código atual. A validação funcional e os ajustes de sessão foram entregues nos lotes 01/02; os lotes seguintes acrescentaram quizzes e aprendizagem.

O endpoint `GET /attempts/:id/questions` **já está implementado** em `AttemptsController` e `AttemptsService`, inclusive com recuperação das respostas do aluno, sem gabarito. A pendência da spec/plano de agosto foi superada pelo código atual.

### 2. Recuperação de senha

Endpoints implementados no lote 10 com Resend, escolhido pelo usuário. Entrega real exige chave e remetente verificado configurados fora do chat. Contratos e ativação no [guia de acesso e recuperação](docs/guia-acesso-recuperacao.md).

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

[ADR 013](docs/decisions/013-habilidades-e-revisao.md), [guia de habilidades](docs/guia-habilidades-revisao.md) e plano de evolução registram contratos, limites e curadoria. Os 45 quizzes/213 perguntas, 45 habilidades/213 classificações e 30 rascunhos de missão continuam pendentes de revisão/publicação. O responsável pelo projeto assumiu a revisão dos quizzes sem aprovar o conteúdo. Não houve seed, migration em banco existente ou deploy. Avaliação com pessoas, leitor de tela e aparelhos reais permanece pendente. Na conclusão do lote 09, a próxima tarefa era o lote 10, entregue abaixo.


---

## Acompanhamento e recuperação — lote 10

`TeacherTurma` permite a ADMIN atribuir/remover docentes, sem confundir convite de aluno com permissão de professor. Roster e relatórios exigem contas/alunos ativos e vínculo atual. Responsável consulta somente alunos vinculados; docente consulta alunos de suas turmas e registros públicos/dessas turmas, sem revelar outra turma privada do mesmo aluno. Catálogos privados, ranking e gestão de convites respeitam atribuições. Evidências de habilidade são somente para leitura; médias de simulados continuam separadas de quizzes/revisões.

A recuperação usa Resend escolhido pelo usuário, tokens aleatórios persistidos somente como hash, prazo de 30 minutos, consumo único, cooldown por conta e limite por IP observado pela API (compartilhado entre navegadores que usam o mesmo BFF). Pedido tem resposta uniforme e logs sem destinatário/link. Reset troca senha, invalida links irmãos e revoga sessões anteriores numa transação. Guards conferem papel/status/versão atuais no banco; login/refresh/reset concorrentes usam locks compatíveis. Novas senhas têm oito caracteres Unicode e no máximo 72 bytes; login legado foi preservado. A web remove o fragmento do link, conserva o token só em memória e não faz login automático nem altera cookies de outra conta aberta.

**Validação técnica:** 688 testes unitários/39 suites e 395 casos Nest/PostgreSQL/21 suites passaram. Incluem vínculos/revogação, ausência de outra turma privada, migration populada, cooldown/links concorrentes, reset com refresh ou login já verificado, rollback, limite por IP, configuração Resend, Unicode/72 bytes e privacidade de logs/auditoria/erros. Lint/build, Prisma validate e dry-runs de simulados, quizzes, missões e habilidades passaram. A web compatível passou 30 testes de sessão, 48 jornadas HTTP/6 suites e 78 testes Chromium desktop/mobile emulado; seu [PROGRESS.md](https://github.com/guilhermeborba/simulados-bernardo/blob/main/PROGRESS.md) registra a cobertura.

[ADR 014](docs/decisions/014-acesso-docente-e-recuperacao.md) e [guia de operação](docs/guia-acesso-recuperacao.md) documentam contratos e ativação. Resend está desativado por padrão; chave/remetente verificado e entrega real continuam pendentes. Testes usam servidor de e-mail sintético e PostgreSQL descartável. Não houve seed, migration em base existente, e-mail externo ou deploy. Os 45 quizzes/213 perguntas, 45 habilidades/213 classificações e 30 rascunhos de missão mantêm revisão/publicação pendentes. Pessoas, leitor de tela e aparelhos reais continuam necessários. Próxima tarefa técnica: **lote 11 — prova e planejamento mobile**, em andamento com aceite físico pendente.


---

## Prova e planejamento mobile — lote 11 em andamento

O [protótipo no repositório web](https://github.com/guilhermeborba/simulados-bernardo/tree/main/mobile) usa Expo 57.0.28, React Native 0.86.3, React 19.2.3 e Expo Router. Dependências nativas ficam isoladas do Next/React 18; 39 tipos públicos puros foram extraídos para `packages/api-contracts` e são importados/reexportados pela web e consumidos por tipos no mobile. A API atual atende os contratos Bearer sem novos endpoints, migrations ou mudança na sessão web.

A prova oferece login/restauração, Aprender hoje, catálogo por faixa, quiz NORMAL/REVIEW com confirmação/feedback/mídia/resultado, histórico, progresso, preferências/itens, acompanhamento e recuperação/entrada manual de link. O catálogo de simulados abre sua realização na web sem transferir Bearer; cadastro e runner nativo dos quatro tipos ficam no lote 12.

Sessão própria mantém access em memória e refresh em SecureStore, com marcador em cache, escrita ordenada, renovação única e isolamento de contas. Expo Fetch impede redirects/omite cookies. JSON tem limite de 2 MiB e timeout/cancelamento no corpo; SVG/WAV têm MIME/limites, fallback e cache temporário com limpeza explícita. Perder a resposta de refresh depois do commit pode exigir login; não há promessa de recuperação do sucessor nem fila offline.

**Validação local:** 57 testes (34 núcleo/20 adaptadores/3 links), 7 de telas e 12 integrações reais Nest/PostgreSQL passaram; typecheck, compatibilidade SDK, bundles Hermes Android/iOS e prebuild dos projetos nativos passaram. Auditoria local validou 40 SVGs/18 WAVs; isso não comprova player/renderização física. A web passou tipos/build, 30 testes de sessão e 48 HTTP após compartilhar os tipos. O job mobile separado da CI repete as verificações contra a API compatível fixada.

[ADR 015](docs/decisions/015-prova-mobile-e-contratos-compartilhados.md), [guia da prova](docs/guia-prova-mobile.md) e [plano dedicado](docs/superpowers/plans/2026-10-13-mobile-proof-and-beta-plan.md) registram arquitetura, mapa de telas, matriz física, distribuição e backlog preliminar. A estimativa do lote 12 é preliminar e precisa ser revista depois dos aparelhos, sem substituir as estimativas históricas do planejamento original.

**O lote 11 permanece aberto.** Nenhum APK/IPA foi assinado/distribuído e nenhum Android/iPhone físico foi validado. O AVD Pixel_10a disponível não foi executado. O usuário confirmou Android primeiro; os aparelhos disponíveis ainda aguardam resposta. O aceite físico Android fecha esta etapa; a matriz iPhone será exigida antes do beta iOS; a decisão Expo continua provisória até a matriz física. Lote 12 não iniciado. Conteúdo editorial permanece PENDING, Resend real desativado; não houve cloud build, compra/registro de loja, deploy ou alteração em banco existente.


## Prévia local de catálogo e narração — 14/10/2026

Criado runner opt-in `npm run preview:mobile:catalog`: PostgreSQL próprio em
tmpfs/loopback, migrations e seed oficial do checkout, contas locais com senha
aleatória em arquivo temporário 0600 e API em 127.0.0.1:3336. Não usa DATABASE_URL
existente nem banco de produção. O acervo validado contém **588 simulados e
17.684 questões**; **45 quizzes** foram importados como DRAFT e nenhum publicado.
A realização dos simulados no protótipo mobile continua pela web local.

Criada comparação de voz offline com `scripts/preview-quiz-voice.py`: original
Microsoft Maria preservada, candidata Piper pt_BR-faber-medium em ritmo normal e
pausado, com texto idêntico e metadados. Prévia depende da avaliação auditiva do
usuário; os 18 áudios registrados, seus hashes e referências não foram alterados.
As amostras não foram marcadas aprovadas nem incorporadas a quiz publicado.

Procedimentos e limites no [guia da prévia](docs/preview-mobile-catalogo-e-voz.md).
Não houve alteração em base existente, publicação editorial, envio real de e-mail
ou deploy. Este ambiente não comprova igualdade com o banco de produção.

Validação desta prévia: build da API, dry-run do seed, execução completa de
`preview:mobile:catalog -- --check` (login, simulados visíveis, quizzes ocultos e
limpeza), WAVs/imutabilidade e rejeição de porta inválida passaram. No emulador,
a lista oficial e a primeira questão de um simulado de 30 questões abriram; o
login da web foi validado separadamente do login nativo. As amostras de voz
continuam aguardando a preferência do usuário.


### Publicação do catálogo aprovado na prévia local — 14/10/2026

O runner agora aceita `--publish-reviewed` explícito e um checkout compilado
selecionado por `MOBILE_CATALOG_REPOSITORY`, permitindo validar o catálogo aprovado
e a nova narração sem usar bancos existentes. O padrão continua sendo DRAFT.
Quizzes pendentes continuam bloqueados pelo importador; a aprovação do responsável
foi registrada na alteração complementar do catálogo. Não houve deploy.

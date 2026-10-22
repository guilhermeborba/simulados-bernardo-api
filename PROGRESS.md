# Estado do Projeto — simulados-bernardo-api

> Atualizado em: 2026-10-19
> Atualizar este arquivo ao concluir cada fase ou iniciativa relevante.

## Status geral

As 6 fases do plano original do backend foram implementadas, e a **integração web/API já existe no código atual**. O foco passa a incluir quizzes, missões, recompensas, revisão de dificuldades e preparação do app mobile, mantendo a expansão de conteúdo. Os lotes 01 e 02 validam sessões, acervo e fluxos existentes com regressão automatizada e CI. O lote 03 acrescenta autoria, versões e snapshots privados de quiz; o lote 04 implementa confirmação, feedback imediato e resultado idempotente. O lote 05 entrega importação e mídia, com 45 quizzes preparados nas 15 faixas; revisão humana aprovada em 14/10/2026 e publicação por ambiente ainda necessária. O lote 06 implementa a jornada web de quiz, o BFF de mídia e preferências por conta. O lote 07 acrescenta missões semanais, XP transacional e Aprender hoje. O lote 08 acrescenta avatar, coleções e conquistas. O lote 09 acrescenta habilidades, evidências separadas e revisão de dificuldades. O lote 10 implementa acompanhamento por vínculos atuais e recuperação de senha com Resend. O lote 11 está em andamento com protótipo Expo e prova automatizada; o aceite em aparelhos reais continua pendente, assim como ativação de e-mail real e validação humana de uso. O responsável aprovou os 45 quizzes em 14/10/2026 e definiu o futuro redesign completo web/mobile.


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
| Editorial de quizzes | **45 quizzes / 213 perguntas aprovados pelo responsável em 14/10/2026**. Aprovação e hashes registrados; publicação pelo fluxo editorial, sem deploy presumido |
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
existente nem banco de produção. O acervo validado nessa primeira execução continha **588 simulados e
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
login da web foi validado separadamente do login nativo. As amostras Piper foram
posteriormente substituídas pela escolha Dora, registrada abaixo.


### Publicação do catálogo aprovado na prévia local — 14/10/2026

O runner agora aceita `--publish-reviewed` explícito e um checkout compilado
selecionado por `MOBILE_CATALOG_REPOSITORY`, permitindo validar o catálogo aprovado
e a nova narração sem usar bancos existentes. O padrão continua sendo DRAFT.
Quizzes pendentes continuam bloqueados pelo importador; a aprovação do responsável
foi registrada na alteração complementar do catálogo. Não houve deploy.

## Aprovação dos quizzes, voz Dora e direção visual — 14/10/2026

O responsável declarou que testou e aprovou os quizzes. Os 45 registros/213
perguntas têm APPROVED, data, responsável e hash. Os 18 áudios do Infantil usam
Dora pt-BR no ritmo mais lento escolhido (speed 0.86); seus seis quizzes passam
à v2. Arquivos antigos e transcrições foram preservados. As propostas de
habilidades/classificações e missões continuam PENDING; só seus vínculos com as
versões/hashes novos foram ajustados.

O layout atual permanece para validação funcional. Foi definida uma futura
**refação completa do design system para web + mobile**, incluindo fundações,
componentes, jornadas e migração. As estimativas anteriores de beta precisam
ser revistas para incorporar esse escopo; não houve redesign nesta entrega.

Referências: [aprovação e narração](docs/aprovacao-quizzes-e-voz-dora.md) e
[plano do design system](docs/superpowers/plans/2026-10-14-design-system-web-mobile.md).
A aprovação não representa publicação em produção, deploy ou aceite físico.

---

## Integração Giz: feedback confirmado, gabarito e temas — 17/10/2026

O responsável autorizou fechar os contratos necessários ao redesign Giz na web e no Expo. A API agora oferece feedback imediato de simulado por adesão explícita em `POST /simulations/:id/attempts` com `{ "immediateFeedback": true }`. A política é imutável por tentativa: omissão/`false` mantém o comportamento legado; uma tentativa já aberta conserva seu ID e sua política original. Não há conversão nem recorreção retroativa.

Tentativas novas nesse modo gravam snapshots privados de enunciado, alternativas, gabarito, textos pedagógicos, pontos e tema. A correção continua no servidor. Somente depois de confirmar uma questão são liberados `isCorrect`, `correctAnswer` canônico e explicação, com Dica de Ouro para erro/branco e curiosidade para acerto. Antes disso, a projeção não revela gabarito nem textos pedagógicos da questão futura. A exceção ao ADR 005 fica restrita à projeção autenticada documentada no [ADR 016](docs/decisions/016-feedback-confirmado-de-simulado-giz.md); não expõe o registro privado `QuestionAnswer` nem o snapshot bruto.

A confirmação exige seleção completa ou `{}` para branco. Reenvios canonicamente equivalentes retornam a confirmação original, inclusive depois da finalização; alterar a seleção confirmada retorna `409`. Finalizar é idempotente, confirma as questões restantes como branco e retorna a correção persistida. Bloqueios transacionais serializam início, confirmação e finalização; usuário ativo, disciplina e vínculo atual à turma continuam verificados. Os quatro tipos existentes de questão e os contratos legados são preservados.

`Question.theme` é opcional e editorial, com até 120 caracteres, congelado no snapshot da tentativa. O resultado agrega `topics: [{ theme, correct, total }]` e informa `unclassifiedQuestions`. Conteúdo sem tema permanece sem classificação: não houve inferência automática, seed de temas nem alteração de conteúdo publicado.

**Validação desta etapa:** 702 testes unitários e **410 casos reais Nest/PostgreSQL em 23 suítes** aprovados, incluindo quatro testes da migration sobre histórico sintético populado. Lint sem avisos, TypeScript, build Nest e Prisma validate aprovados. Os 15 passos da cadeia de migrations foram aplicados somente em PostgreSQL 16 descartável, inicializado em `/tmp` a partir de pacotes oficiais do Ubuntu porque o Docker não estava disponível; o runner externo manteve as proteções de URL/base vazia. Uma segunda base temporária isolada validou no navegador a jornada web/BFF/API de login, erro/acerto, retomada, resultado por tema e revisão. Nenhum teste reutilizou a URL de uma base existente. Isso não representa implantação nem aceite de aparelhos físicos.

A migration aditiva `20261017120000_simulation_immediate_feedback` define `immediateFeedback=false` para registros anteriores e adiciona campos de tema nulos. Aplicar migration e disponibilizar a API compatível antes de publicar clientes que enviam a nova opção: uma API antiga pode recusar esse campo. A ordem operacional e os formatos de resposta estão no [guia do feedback Giz](docs/guia-feedback-giz.md).

Não houve deploy, aplicação da migration em base existente, publicação editorial ou distribuição em lojas nesta etapa. Os registros históricos dos lotes anteriores foram preservados; o fechamento físico do mobile, a operação de e-mail e as decisões de marca/domínio continuam separados desta entrega local.

## Temas editoriais Giz — 19/10/2026 (E04 parcial)

Geografia do 3º ano foi integrada em api#225 (390 questões). Matemática do 3º ano foi integrada em api#226, com 389 temas: oito arquivos gerais (240 questões) e cinco privados da turma Bernardo (149). O legado `questoes-matematica.ts` permanece com 29 questões e os mesmos IDs; enunciados, alternativas, correção e demais campos foram preservados integralmente.

O vocabulário por disciplina/ano e seus critérios estão em [temas editoriais](docs/temas-editoriais.md). No dry-run do lote de Matemática, o acervo tinha 779 questões classificadas e 26 simulados com cobertura integral, em um total de 780 simulados/23.444 questões. Isso mede os arquivos versionados, sem afirmar importação em banco ou alteração de tentativas existentes. A E04 continua aberta para Ciências, História, Português e os demais anos. Seed em produção permanece com o responsável.

Validação do lote de Matemática: `npm run seed:dry-run` e inventário JSON aprovados (389/389 questões, 13/13 simulados); comparação exata confirma que apenas as linhas `theme` foram acrescentadas às questões. `npx jest --runInBand`: 713 testes em 40 suítes; `npm run test:e2e`: 418 testes em 23 suítes, com PostgreSQL descartável removido pelo runner. Não houve seed em base existente, deploy ou alteração de contrato.


### Ciências do 3º ano — E04

O lote de Ciências acrescenta 390 temas em 13 arquivos: oito gerais (240 questões) e cinco privados da turma Bernardo (150). Todos os demais campos foram preservados por comparação exata. Os temas incluem os conteúdos de animais e plantas, corpo humano, saúde, materiais, som/luz e solo, compartilhando o vocabulário de `docs/temas-editoriais.md`.

O inventário desta etapa confirma cobertura integral nas 13 entradas de Ciências do 3º ano. Somado a Geografia e Matemática já integradas (api#225 e api#226), o código passa a ter 1.169 questões com tema e 39 simulados integralmente classificados, em 780 simulados/23.444 questões. Restam História, Português e os demais anos. Não houve seed em banco existente nem publicação de conteúdo em produção.

Validação de Ciências: dry-run e inventário aprovados (390/390 questões e 13/13 simulados); vocabulário fechado, temas com 1–4 palavras e preservação exata de todos os campos anteriores. A conferência editorial também verificou que nenhum tema coincide literalmente com a alternativa correta. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, em PostgreSQL descartável removido ao final. Não houve alteração de contrato.


### História do 3º ano — E04

Ciências do 3º ano foi integrada em api#227. O lote de História acrescenta 390 temas em 13 arquivos: oito gerais (240 questões) e cinco privados da turma Bernardo (150). O vocabulário em `docs/temas-editoriais.md` reúne 24 temas e documenta os critérios para fontes históricas, memória, patrimônio, contribuições culturais, transformações sociais e trabalho. A leitura incluiu itens compostos e alternativas de enunciados genéricos.

O inventário confirma cobertura integral das 13 entradas de História do 3º ano. Com Geografia, Matemática e Ciências já integradas (api#225–227), são 1.559 questões com tema e 52 simulados integralmente classificados, em 780 simulados/23.444 questões. A E04 permanece parcial: o próximo lote é Português do 3º ano, seguido dos demais anos.

Validação de História: `npm run seed:dry-run` e inventário JSON aprovados (390/390 questões e 13/13 simulados, cinco da turma Bernardo); vocabulário fechado e temas de 1–4 palavras, com até 120 caracteres. Comparação exata com a base confirma que apenas as linhas `theme` foram acrescentadas às questões, sem alterar enunciados, alternativas, gabaritos, dicas, curiosidades ou outros campos. Nenhum tema coincide literalmente com a alternativa correta. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, com PostgreSQL descartável removido ao final.

A inconsistência preexistente na questão 5 de História B4/AV1 geral e a revisão do restante desse simulado foram registradas na [issue web #70](https://github.com/guilhermeborba/simulados-bernardo/issues/70). O gabarito foi preservado neste lote de temas. Não houve seed em base existente, publicação de conteúdo em produção ou alteração do contrato da API.


### Português do 3º ano — E04

História do 3º ano foi integrada em api#228. O lote de Português acrescenta 390 temas em 13 simulados distribuídos em nove arquivos: oito gerais (240 questões) e o legado `questoes-portugues.ts`, que reúne os cinco privados da turma Bernardo (150). Os exports aninhados, os IDs e todos os demais campos foram preservados exatamente. O vocabulário de 26 temas e os critérios de classificação estão em `docs/temas-editoriais.md`.

O inventário agora confirma cobertura integral de todos os 65 simulados/1.949 questões do 3º ano registrados no seed, incluindo as cinco disciplinas e seus simulados privados. Esse é também o total de questões com tema no acervo de 780 simulados/23.444 questões; os demais anos continuam pendentes na E04. A próxima prioridade editorial é o 4º ano, começando pelos oito simulados de Português (240 questões).

Validação de Português: `npm run seed:dry-run` e inventário JSON aprovados (390/390 questões, 13/13 simulados, nove arquivos, cinco simulados da turma Bernardo); temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. Comparação exata de fonte e dados por export confirma somente a adição de `theme`. Nenhum tema coincide literalmente com a alternativa correta. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, com PostgreSQL descartável removido ao final.

As alternativas corretas duplicadas nas questões 22 e 26 do B2/AV2 privado e os comandos incompletos nas questões 14 e 15 do B1/AV2 privado estão na [issue web #72](https://github.com/guilhermeborba/simulados-bernardo/issues/72), para revisão separada. O conteúdo foi preservado neste lote. Não houve seed em banco existente, deploy ou alteração de contrato.


### Português do 4º ano — E04

Português do 3º ano foi integrado em api#229, completando os temas das 65 entradas/1.949 questões do 3º ano no seed. O lote seguinte acrescenta 240 temas de Português do 4º ano em oito arquivos/simulados gerais (`questoes-portugues-4ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 24 temas e os critérios estão em `docs/temas-editoriais.md`.

O inventário confirma Português do 4º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 2.189 questões com tema e 73 simulados integralmente classificados, em 780 simulados/23.444 questões. O 4º ano tem 240/1.200 questões classificadas em 8/40 simulados; restam Matemática, Ciências, História e Geografia. Próximo lote sugerido: Matemática do 4º ano, oito arquivos/240 questões.

Validação editorial: dry-run e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. Comparação exata de fonte e dados por export confirma que apenas `theme` foi acrescentado às questões. Nenhum tema coincide literalmente com a alternativa correta. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, em PostgreSQL descartável removido ao final.

A inconsistência preexistente de gabarito na questão 13 de Português B4/AV2, sobre coesão textual, está na [issue web #74](https://github.com/guilhermeborba/simulados-bernardo/issues/74), para revisão separada. O gabarito e todos os campos de conteúdo foram preservados neste lote. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Matemática do 4º ano — E04

Português do 4º ano foi integrado em api#230. O lote de Matemática acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-matematica-4ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 21 temas e os critérios em `docs/temas-editoriais.md` reaproveitam os nomes de Matemática do 3º ano quando o conteúdo corresponde e incluem arredondamento, números decimais, ângulos, gráficos/tabelas e operações combinadas.

O inventário confirma Matemática do 4º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 2.429 questões com tema e 81 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo; o 4º ano tem 480/1.200 questões classificadas em 16/40 simulados, com Português e Matemática concluídos nos arquivos. Restam Ciências, História e Geografia do 4º ano e os demais anos. Próximo lote sugerido: Ciências do 4º ano, oito arquivos/240 questões.

Validação editorial: dry-run e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. Nenhum tema coincide literalmente com a alternativa correta. Para não antecipar classificações, a questão 1 de B3/AV2 usa Sistema de numeração, e as questões 1 e 11 de B4/AV1 usam Geometria. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido ao final.

Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura dos simulados foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Ciências do 4º ano — E04

Matemática do 4º ano foi integrada em api#231. O lote de Ciências acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-ciencias-4ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 20 temas e os critérios em `docs/temas-editoriais.md` cobrem materiais, relações alimentares, corpo humano, orientação, astronomia e ambiente, reaproveitando os nomes de Ciências do 3º ano quando o conteúdo corresponde.

O inventário confirma Ciências do 4º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 2.669 questões com tema e 89 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo; o 4º ano tem 720/1.200 questões classificadas em 24/40 simulados, com Português, Matemática e Ciências concluídos nos arquivos. Restam História e Geografia do 4º ano e os demais anos. Próximo lote sugerido: História do 4º ano, oito arquivos/240 questões.

Validação editorial: dry-run e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. As questões 4, 6, 8 e 10 de B1/AV1 usam Matéria e materiais, pois reconhecer a mistura é a tarefa. A identificação do Sistema Solar na questão 27 de B4/AV1 usa Astronomia. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido ao final.

Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura dos simulados foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### História do 4º ano — E04

Ciências do 4º ano foi integrada em api#232. O lote de História acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-historia-4ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 23 temas e os critérios em `docs/temas-editoriais.md` cobrem fontes históricas, cronologia, comunidades, formação do Brasil, culturas, trabalho, tecnologia, patrimônio e direitos das crianças, reaproveitando os nomes de História do 3º ano quando o conteúdo corresponde.

O inventário confirma História do 4º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 2.909 questões com tema e 97 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo; o 4º ano tem 960/1.200 questões classificadas em 32/40 simulados, com Português, Matemática, Ciências e História concluídos nos arquivos. Resta Geografia do 4º ano e os demais anos. Próximo lote sugerido: Geografia do 4º ano, oito arquivos/240 questões.

Validação editorial: dry-run e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. Para evitar antecipar classificações, as questões 9 e 24 do B1/AV2 usam Organização social e Transformações sociais; a questão 21 do B3/AV1 usa Formação do Brasil. B4/AV1 mantém um tema por estar concentrado em patrimônio; B4/AV2 revisa doze. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido ao final.

A inconsistência preexistente na questão 9 de História B2/AV1, que inclui “Brasil” entre palavras de origem indígena, foi registrada na [issue web #76](https://github.com/guilhermeborba/simulados-bernardo/issues/76), com fontes para uma revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura dos simulados foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Geografia do 4º ano — E04

História do 4º ano foi integrada em api#233. O lote de Geografia acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-geografia-4ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 23 temas e os critérios em `docs/temas-editoriais.md` cobrem território, regiões, aspectos naturais, população, campo e cidade, atividades econômicas e globalização, reaproveitando os nomes de Geografia do 3º ano quando o conteúdo corresponde.

O inventário confirma Geografia do 4º ano com cobertura de 240/240 questões e 8/8 simulados. Com este lote, o 4º ano fica completo nos arquivos: 1.200/1.200 questões em 40/40 simulados, nas cinco disciplinas. O 3º ano permanece completo com 1.949 questões em 65 simulados. No acervo total, são 3.149 questões com tema e 105 simulados integralmente classificados, em 780 simulados/23.444 questões. A E04 permanece parcial para os demais anos. Próximo lote sugerido: Português do 5º ano, oito arquivos/240 questões, seguindo a progressão após o 4º ano.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. Território brasileiro, Regiões do Brasil e Atividades econômicas evitam antecipar o estado, a capital, a região ou o setor solicitado. B4/AV2 revisa treze temas; os demais simulados têm de três a cinco. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido ao final e ausência do container confirmada.

As inconsistências preexistentes na alternativa sobre o Distrito Federal (B1/AV1, ID 29) e na associação de animais às regiões do litoral (B1/AV2, ID 29) foram registradas na [issue web #78](https://github.com/guilhermeborba/simulados-bernardo/issues/78), com evidências para revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura dos simulados foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Português do 5º ano — E04 (20/10/2026)

Geografia do 4º ano foi integrada em api#234, completando o 3º e o 4º ano nos arquivos. O lote de Português do 5º ano acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-portugues-5ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 22 temas e os critérios em `docs/temas-editoriais.md` cobrem gêneros, leitura, narrativas, classes de palavras, verbos, pontuação, concordância, relações entre letras e sons e figuras de linguagem. Os nomes dos anos anteriores foram reaproveitados quando o conteúdo corresponde; Cartas concentra a estrutura desse gênero no lote.

O inventário confirma Português do 5º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 3.389 questões com tema e 113 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo com 1.949 questões em 65 simulados, e o 4º ano, com 1.200 questões em 40 simulados. O 5º ano passa a ter 240/1.200 questões classificadas em 8/40 simulados; restam Matemática, Ciências, História e Geografia. Próximo lote: Matemática do 5º ano, oito arquivos/240 questões.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. A questão 19 de B1/AV2 usa Classes de palavras; a questão 22 de B3/AV2, Letras e sons; reconhecer gêneros usa Gêneros e tipos textuais. B3/AV1 mantém um tema por estar concentrado em concordância; B4/AV2 revisa treze. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido ao final e ausência do container confirmada.

A falta do texto-base nas perguntas de interpretação de B4/AV2 (IDs 1–10) foi registrada na [issue web #80](https://github.com/guilhermeborba/simulados-bernardo/issues/80), com evidências do conteúdo exportado e do seed. O tema Leitura e compreensão descreve o objetivo das questões, mas a recuperação do texto fica para revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Matemática do 5º ano — E04 (20/10/2026)

Português do 5º ano foi integrado em api#235. O lote de Matemática acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-matematica-5ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 26 temas e os critérios em `docs/temas-editoriais.md` cobrem numeração, operações, frações, decimais, geometria, medidas, porcentagem, gráficos, probabilidade e média, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde.

O inventário confirma Matemática do 5º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 3.629 questões com tema e 121 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo (1.949 questões/65 simulados), assim como o 4º (1.200/40). O 5º ano passa a ter Português e Matemática completos nos arquivos: 480/1.200 questões em 16/40 simulados. Restam Ciências, História e Geografia do 5º ano (720 questões/24 simulados), além dos demais anos. Próximo lote: Ciências do 5º ano, oito arquivos/240 questões.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. A identificação da própria grandeza em B3/AV2, IDs 21–23, e do perímetro em B4/AV1, ID 9, usa Grandezas e medidas. O reconhecimento de R$ 3,50 como decimal em B2/AV2, ID 19, usa Sistema monetário. B2/AV1 mantém um tema por estar concentrado em frações; B4/AV2 revisa oito. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido e ausência confirmada.

O gabarito preexistente de B1/AV1, ID 16, marca 4.578 como ímpar, embora o número seja par. A inconsistência foi registrada na [issue web #82](https://github.com/guilhermeborba/simulados-bernardo/issues/82). Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados no lote de temas. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Ciências do 5º ano — E04 (20/10/2026)

Matemática do 5º ano foi integrada em api#236. O lote de Ciências acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-ciencias-5ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 25 temas e os critérios em `docs/temas-editoriais.md` cobrem corpo humano, alimentação, saúde, vacinação, ecossistemas, água, astronomia, biomas, energia e ambiente, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde.

O inventário confirma Ciências do 5º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 3.869 questões com tema e 129 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo (1.949 questões/65 simulados), assim como o 4º (1.200/40). O 5º ano passa a ter Português, Matemática e Ciências completos nos arquivos: 720/1.200 questões em 24/40 simulados. Restam História e Geografia do 5º ano (480 questões/16 simulados), além dos demais anos. Próximo lote: História do 5º ano, oito arquivos/240 questões.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. A questão 28 do B1/AV2 usa Saúde e bem-estar para não antecipar Hábitos de higiene; a questão 29 do B2/AV2 usa Transformações da matéria; grupos de animais, níveis tróficos, processos e nomes de astros não são usados como rótulo da resposta. B1/AV1 revisa nove temas; os demais têm de três a seis. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido e ausência confirmada.

A confusão preexistente entre o período orbital da Lua e o ciclo de fases, na alternativa A e na curiosidade de B3/AV2, ID 2, foi registrada na [issue web #84](https://github.com/guilhermeborba/simulados-bernardo/issues/84), com fonte primária da NASA. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados no lote de temas. Não houve seed em base existente, deploy ou alteração do contrato da API.


### História do 5º ano — E04 (20/10/2026)

Ciências do 5º ano foi integrada em api#237. O lote de História acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-historia-5ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 18 temas e os critérios em `docs/temas-editoriais.md` cobrem formação do Brasil, culturas, escravidão e resistência, migrações, trabalho, direitos, Império e República. Os nomes dos anos anteriores foram reaproveitados quando o conteúdo corresponde; Brasil Império e Brasil República agrupam os períodos políticos, e Regiões do Brasil mantém o nome usado em Geografia para o mesmo conteúdo.

O inventário confirma História do 5º ano com cobertura de 240/240 questões e 8/8 simulados. No acervo total, são 4.109 questões com tema e 137 simulados integralmente classificados, em 780 simulados/23.444 questões. O 3º ano permanece completo (1.949 questões/65 simulados), assim como o 4º (1.200/40). O 5º ano passa a ter Português, Matemática, Ciências e História completos nos arquivos: 960/1.200 questões em 32/40 simulados. Resta Geografia do 5º ano (240 questões/oito simulados), além dos demais anos. Esse é o próximo lote.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. B2/AV2, ID 22, usa Transformações sociais para não antecipar a classificação de migração; B3/AV1, IDs 21 e 22, usa História do trabalho para preservar a identificação entre rural e urbano. A identificação do ECA usa Direitos e participação; nomes de governantes, povos e leis não são usados como rótulo da resposta. B3/AV2 tem dois temas por estar concentrado em direitos e cidadania; os demais variam de quatro a oito. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido e ausência confirmada.

As inconsistências preexistentes sobre idade mínima de trabalho/aprendizagem (B3/AV2, IDs 12 e 25) e cronologia do exílio de D. Pedro II (B4/AV1, ID 19) foram registradas na [issue web #86](https://github.com/guilhermeborba/simulados-bernardo/issues/86), com fontes oficiais para revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Geografia do 5º ano — E04 (20/10/2026)

História do 5º ano foi integrada em api#238. O lote de Geografia acrescenta 240 temas em oito arquivos/simulados gerais (`questoes-geografia-5ano-b*-av*.ts`). Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 21 temas e os critérios em `docs/temas-editoriais.md` cobrem território, regiões, população, cultura, urbanização, atividades econômicas, recursos, ambiente, cartografia e fusos. Os nomes de Geografia dos anos anteriores foram reaproveitados quando o conteúdo corresponde; Recursos naturais e Fusos horários agrupam as unidades específicas deste lote.

O inventário confirma Geografia do 5º ano com cobertura de 240/240 questões e 8/8 simulados. Com o lote, o 5º ano fica completo nos arquivos: 1.200 questões em 40 simulados, nas cinco disciplinas. O 3º ano continua completo com 1.949 questões/65 simulados, e o 4º, com 1.200/40. No acervo total, são 4.349 questões com tema e 145 simulados integralmente classificados, em 780 simulados/23.444 questões. A E04 permanece parcial para os demais anos. Próximo lote sugerido: Português do 6º ano, oito arquivos/240 questões sem temas no inventário atual, seguindo a progressão após o 5º ano.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. A comparação byte a byte da fonte e a comparação dos dados por export confirmam somente a adição de `theme`. A conferência do gabarito também desconsidera artigos iniciais e não encontra tema igual à alternativa correta. B3/AV1, IDs 21–23, usa Atividades econômicas para não antecipar a atividade ou o setor; B3/AV2, ID 24, usa Preservação ambiental para preservar a identificação da coleta seletiva. Elementos de mapa usam Representações cartográficas; nomes de países, capitais, regiões e horários não são usados como rótulo da resposta. B4/AV2 revisa onze temas; os demais têm de dois a sete. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, com PostgreSQL descartável removido e ausência confirmada.

As inconsistências preexistentes sobre quantidade de fusos e diferença Acre/Brasília (B4/AV2, IDs 4, 7, 21 e 24), além da precisão do enunciado sobre água doce e disponibilidade para consumo (B3/AV2, ID 4), foram registradas na [issue web #88](https://github.com/guilhermeborba/simulados-bernardo/issues/88), com fontes oficiais para revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados. Não houve seed em base existente, deploy ou alteração do contrato da API.


### Português do 6º ano — E04 (21/10/2026)

Geografia do 5º ano foi integrada em api#239, completando os temas do 3º, 4º e 5º anos nos arquivos. O responsável pediu para retomar a sequência editorial e deixar a conferência/publicação de quizzes (#90) para depois. Este lote acrescenta 240 temas em oito simulados gerais de Português do 6º ano (`questoes-portugues-6ano-b*-av*.ts`), sem entradas privadas adicionais. O vocabulário de 16 temas e os critérios estão em `docs/temas-editoriais.md`; os nomes dos anos anteriores foram reaproveitados, e Modos verbais reúne a comparação de indicativo, subjuntivo e imperativo. O lote altera somente `theme`: enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura permanecem idênticos à base.

O inventário confirma Português/6º ano com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter 240/1.920 questões com tema em 8/64 simulados; os demais lotes desse ano continuam pendentes. O acervo total passa a 4.589 questões com tema e 153 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º ano (1.949/65), 4º (1.200/40) e 5º (1.200/40) foi preservada. Próximo lote: Matemática do 6º ano, oito arquivos/240 questões sem tema no inventário.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras, até 120 caracteres, todos no vocabulário documentado. Comparação byte a byte das fontes sem as linhas `theme` e comparação dos dados por export aprovadas. Metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. Identificação de gêneros usa Gêneros e tipos textuais; nomear classes gramaticais usa Classes de palavras. B3/AV1 mantém um tema de pronomes e B3/AV2, um de pontuação; B4/AV2 revisa dez. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados, PostgreSQL descartável removido ao final e ausência confirmada.

As inconsistências anteriores de contagem de pronomes (B3/AV1, ID 16), correções de concordância que aceitam singular e plural (B4/AV1, IDs 12 e 16; B4/AV2, ID 25), descrição das classes da frase (B4/AV1, ID 14) e definição de substantivo concreto (B1/AV2, ID 4) estão na [issue web #92](https://github.com/guilhermeborba/simulados-bernardo/issues/92), para revisão separada. O conteúdo anterior foi preservado no lote de temas. Não houve mudança do contrato da API, seed em banco existente, publicação de quizzes, deploy ou operação em produção.


### Matemática do 6º ano — E04 (21/10/2026)

Português do 6º ano foi integrado em api#240, com registro em web#93. Este lote acrescenta 240 temas em oito simulados gerais de Matemática do 6º ano (`questoes-matematica-6ano-b*-av*.ts`), sem entradas privadas adicionais. O vocabulário de 16 temas e os critérios estão em `docs/temas-editoriais.md`; os nomes dos anos anteriores foram reaproveitados, e Múltiplos e divisores e MMC e MDC agrupam o estudo de divisibilidade. Apenas `theme` foi acrescentado às questões: todos os enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados.

O inventário confirma o lote com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter Português e Matemática completos nos arquivos: 480/1.920 questões com tema em 16/64 simulados. No acervo total, são 4.829 questões com tema e 161 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º (1.949/65), 4º (1.200/40) e 5º anos (1.200/40) foi preservada. Próximo lote: Ciências do 6º ano, oito arquivos/240 questões ainda sem tema no inventário.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras/até 120 caracteres, todos no vocabulário documentado. Comparação byte a byte das fontes sem as linhas `theme` e comparação dos dados por export aprovadas; metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. Identificar o conceito de MDC em B2/AV1, ID 24, usa Múltiplos e divisores. Contextos de altura e distância mantêm Números decimais quando o objetivo é a escrita ou a operação decimal. Simulados concentrados em numeração, frações ou porcentagem mantêm um tema; B4/AV2 revisa treze. `npx jest --runInBand`: 713 testes/40 suítes aprovados. `npm run test:e2e`: 418 testes/23 suítes aprovados; PostgreSQL descartável removido e ausência confirmada.

Os problemas anteriores de contagem de zeros/gabarito e contradição na votação (B1/AV1, IDs 28 e 29), comando sobre divisores (B2/AV1, ID 21), inclusão de zero na definição/listagem de múltiplos e distinção entre círculo e circunferência (B3/AV2, IDs 16 e 29) estão na [issue web #94](https://github.com/guilhermeborba/simulados-bernardo/issues/94), para revisão separada. Os conteúdos e gabaritos anteriores foram preservados. A conferência/publicação de quizzes (#90) continua adiada conforme orientação do responsável. Não houve mudança do contrato, seed em base existente, deploy ou operação em produção.


### Ciências do 6º ano — E04 (21/10/2026)

Matemática do 6º ano foi integrada em api#241, com registro em web#95. Este lote acrescenta 240 temas em oito simulados gerais de Ciências do 6º ano (`questoes-ciencias-6ano-b*-av*.ts`), sem entradas privadas adicionais. O vocabulário de 23 temas e os critérios estão em `docs/temas-editoriais.md`. Os nomes anteriores são reaproveitados; os conteúdos novos explicitam investigação, instrumentos e práticas científicas, células, organização dos seres vivos, solo e sua conservação, disponibilidade da água e relações entre calor e temperatura. Apenas `theme` foi acrescentado: enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

O inventário confirma o lote com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter Português, Matemática e Ciências completos nos arquivos: 720/1.920 questões com tema em 24/64 simulados. O acervo total passa a 5.069 questões com tema e 169 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º (1.949/65), 4º (1.200/40) e 5º anos (1.200/40) foi preservada. Próximo lote: História do 6º ano, oito arquivos/240 questões sem tema no inventário.

Validação editorial: dry-run e inventário JSON aprovados; temas de 1–4 palavras/até 120 caracteres, todos no vocabulário documentado. Comparações byte a byte das fontes sem `theme` e dos dados por export aprovadas; metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. Nomes de organelas, processos de separação e tipos de mudança de estado não são usados como rótulos da resposta. B2/AV2, ID 20, usa Resíduos e reciclagem para não antecipar a separação de materiais; os itens de tratamento de esgoto usam Saúde e bem-estar. B4/AV2 revisa treze temas. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, todos aprovados. PostgreSQL descartável removido e ausência confirmada.

Os problemas anteriores de ebulição, abrangência da parede celular, hipótese de uma Terra sem rotação, dicas sobre vapor visível, exemplo de manipulação infantil de naftalina, água doce/potabilidade e formulação de hipótese estão na [issue web #97](https://github.com/guilhermeborba/simulados-bernardo/issues/97), com referências OpenStax, NASA e CETESB para revisão separada. O lote de temas preserva o conteúdo e não declara essas afirmações cientificamente validadas. Quizzes (#90) continuam adiados conforme orientação do responsável. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.


### História do 6º ano — E04 (21/10/2026)

Ciências do 6º ano foi integrada em api#242, com registro em web#98. Este lote acrescenta 240 temas em oito simulados gerais de História do 6º ano (`questoes-historia-6ano-b*-av*.ts`), sem entradas privadas adicionais. O vocabulário de 17 temas e os critérios estão em `docs/temas-editoriais.md`. Os nomes anteriores são reaproveitados; os novos agrupam primeiras sociedades, produção de alimentos, civilizações antigas e filosofia. Apenas `theme` foi acrescentado: enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

O inventário confirma o lote com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter Português, Matemática, Ciências e História completos nos arquivos: 960/1.920 questões com tema em 32/64 simulados. O acervo total passa a 5.309 questões com tema e 177 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º (1.949/65), 4º (1.200/40) e 5º anos (1.200/40) foi preservada. Próximo lote: Geografia do 6º ano, oito arquivos/240 questões sem tema no inventário. Depois restam Arte, Educação Física e Inglês do 6º ano, além dos demais anos/públicos.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras/até 120 caracteres, todos no vocabulário documentado. Comparações byte a byte das fontes sem `theme` e dos dados por export aprovadas; metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. As questões que pedem identificar uma civilização não recebem seu nome como tema. A invenção da roda em B2/AV1, ID 9, usa Trabalho e tecnologia; identificar agricultura usa Primeiras sociedades humanas; democracia e cidadania mantêm Direitos e participação. B4/AV2 revisa dez temas. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, todos aprovados. PostgreSQL descartável removido e ausência confirmada.

A explicação anterior de cidadania e direitos políticos em Atenas (B3/AV1, IDs 4 e 24) está na [issue web #99](https://github.com/guilhermeborba/simulados-bernardo/issues/99), com fonte primária e critérios de revisão para distinguir local de nascimento, ascendência e período histórico. As alternativas e explicações foram preservadas no lote de temas. Quizzes (#90) continuam adiados conforme orientação do responsável. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.


### História do 7º ano — E04 (22/10/2026)

Lote de oito simulados gerais/240 questões, classificado individualmente com vocabulário fechado de 18 temas em `docs/temas-editoriais.md`. Somente `theme` foi acrescentado; fontes sem essas linhas e dados por export idênticos à main. Identificar sistemas administrativos, atividades econômicas, movimentos, povos, impostos ou líderes mantém um rótulo amplo. Pendências históricas de Sagres e da derrama registradas na [issue web #116](https://github.com/guilhermeborba/simulados-bernardo/issues/116), sem alterar os campos anteriores.

Este é um dos três lotes independentes autorizados no pacote História, Geografia e Arte/7º ano. Base integrada: api#250 (Ciências/7º ano), 6.989/23.444 questões com tema, 233/780 simulados completos. Este lote acrescenta 240 questões e oito simulados completos; após integrar os três, a expectativa conjunta é 7.709/23.444 e 257/780, com 1.440/1.920 questões do 7º ano em 48/64 simulados. E04 segue parcial; depois restam Educação Física e Inglês/7º ano e demais anos/públicos.

Validação do lote: `npm run seed:dry-run`, vocabulário, ausência de resposta literal, preservação byte a byte das fontes e comparação dos dados por export aprovados. Inventário e testes completos registrados no PR. Quizzes #90 continuam adiados. Sem mudança de contrato ou operação em produção.


### Geografia do 6º ano — E04 (21/10/2026)

História do 6º ano foi integrada em api#243, com registro em web#100. Este lote acrescenta 240 temas em oito simulados gerais de Geografia do 6º ano (`questoes-geografia-6ano-b*-av*.ts`), sem entradas privadas adicionais. O vocabulário de 16 temas e os critérios estão em `docs/temas-editoriais.md`. Todos os nomes são reaproveitados dos anos anteriores ou de Ciências para conteúdos correspondentes. Apenas `theme` foi acrescentado: enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

O inventário confirma o lote com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter Português, Matemática, Ciências, História e Geografia completos nos arquivos: 1.200/1.920 questões com tema em 40/64 simulados. O acervo total passa a 5.549 questões com tema e 185 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º (1.949/65), 4º (1.200/40) e 5º anos (1.200/40) foi preservada. Próximo lote: Arte do 6º ano, oito arquivos/240 questões sem tema no inventário. Depois restam Educação Física e Inglês do 6º ano, além dos demais anos/públicos.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras/até 120 caracteres, todos no vocabulário documentado. Comparações byte a byte das fontes sem `theme` e dos dados por export aprovadas; metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. Identificar direção, instrumento, representação, forma do relevo, bacia, clima, bioma ou movimento migratório mantém um rótulo amplo, sem antecipar a resposta. As avaliações concentradas em orientação/cartografia, relevo, clima ou biomas mantêm um ou dois temas; B4/AV2 revisa onze. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, todos aprovados. PostgreSQL descartável removido e ausência confirmada.

As formulações anteriores sobre bacia/rede hidrográfica, tempo e clima, intemperismo/erosão e orientação por sombras sem Sol estão na [issue web #101](https://github.com/guilhermeborba/simulados-bernardo/issues/101), com referências oficiais e critérios de revisão. Os campos anteriores foram preservados no lote; a classificação temática não equivale à validação científica dessas formulações. Quizzes (#90) continuam adiados conforme orientação do responsável. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.


### Geografia do 7º ano — E04 (22/10/2026)

Lote de oito simulados gerais/240 questões, classificado individualmente com vocabulário fechado de 17 temas em `docs/temas-editoriais.md`. Somente `theme` foi acrescentado; fontes sem essas linhas e dados por export idênticos à main. Regiões do Brasil, Clima e cotidiano, Biomas, Relevo e Hidrografia não antecipam o nome pedido. B1/AV2 e B2/AV1 mantêm um tema por concentrarem o conteúdo; B4/AV2 revisa treze. Divergências de gabaritos e conceitos anteriores registradas na [issue web #117](https://github.com/guilhermeborba/simulados-bernardo/issues/117), com roteiro inicial de 70 letras a revisar e observações sobre comandos, sem modificar os campos anteriores. Cobertura temática não certifica correção dos gabaritos.

Este é um dos três lotes independentes autorizados no pacote História, Geografia e Arte/7º ano. Base integrada: api#250 (Ciências/7º ano), 6.989/23.444 questões com tema, 233/780 simulados completos. Este lote acrescenta 240 questões e oito simulados completos; após integrar os três, a expectativa conjunta é 7.709/23.444 e 257/780, com 1.440/1.920 questões do 7º ano em 48/64 simulados. E04 segue parcial; depois restam Educação Física e Inglês/7º ano e demais anos/públicos.

Validação do lote: `npm run seed:dry-run`, inventário JSON, vocabulário, ausência de resposta literal, preservação byte a byte das fontes e comparação dos dados por export aprovados. Demais entradas, cobertura e metadados preservados; testes completos registrados no PR. Quizzes #90 continuam adiados. Sem mudança de contrato ou operação em produção.


### Arte do 6º ano — E04 (21/10/2026)

Geografia do 6º ano foi integrada em api#244, com registro em web#102. Este lote acrescenta 240 temas em oito simulados gerais de Arte do 6º ano (`questoes-arte-6ano-b*-av*.ts`), sem entradas privadas adicionais. É o primeiro lote de Arte da E04; o vocabulário fechado de 19 nomes e os critérios estão em `docs/temas-editoriais.md`. Cultura e identidade, Expressões artísticas, Patrimônio e preservação e Registros do passado reaproveitam nomes de História para conteúdos correspondentes. Apenas `theme` foi acrescentado: enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

O inventário confirma o lote com 240/240 questões e 8/8 simulados classificados. O 6º ano passa a ter Português, Matemática, Ciências, História, Geografia e Arte completos nos arquivos: 1.440/1.920 questões com tema em 48/64 simulados. O acervo total passa a 5.789 questões com tema e 193 simulados integralmente classificados, em 780 simulados/23.444 questões, sem inválidos. A cobertura integral do 3º (1.949/65), 4º (1.200/40) e 5º anos (1.200/40) foi preservada. Próximo lote: Educação Física do 6º ano, oito arquivos/240 questões sem tema no inventário. Depois resta Inglês do 6º ano, além dos demais anos/públicos.

Validação editorial: `npm run seed:dry-run` e inventário JSON aprovados; temas de 1–4 palavras/até 120 caracteres, todos no vocabulário documentado. Comparações byte a byte das fontes sem `theme` e dos dados por export aprovadas; metadados e cobertura das demais entradas preservados. Nenhum tema coincide literalmente com a alternativa do gabarito após normalizar acentos, pontuação e artigos. Identificar linguagens artísticas usa Expressões artísticas; identificar civilizações e arte rupestre usa Arte e história; reconhecer mosaicos usa Materiais e técnicas. Arte egípcia/grega/romana, Arquitetura e Escultura só são usados quando seu nome não resolve a tarefa. B4/AV2 revisa dez temas. `npx jest --runInBand`: 713 testes/40 suítes; `npm run test:e2e`: 418 testes/23 suítes, todos aprovados. PostgreSQL descartável removido e ausência confirmada.

As generalizações e os termos anteriores sobre espaços do teatro grego, realismo dos retratos romanos, comparação de materiais e desenvolvimento rupestre/egípcio estão na [issue web #103](https://github.com/guilhermeborba/simulados-bernardo/issues/103), com referências de museus/UNESCO e critérios para revisão separada. Os campos anteriores foram preservados; a classificação temática não valida essas formulações de história da arte. Quizzes (#90) continuam adiados conforme orientação do responsável. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.


### Educação Física do 6º ano — E04 (21/10/2026)

Arte do 6º ano foi integrada em api#245/web#104. Este lote acrescenta somente `theme` às 240 questões dos oito simulados gerais de Educação Física do 6º ano, sem entradas privadas adicionais. É o primeiro lote da disciplina na E04: 18 nomes e critérios em `docs/temas-editoriais.md`, reaproveitando Saúde e bem-estar de Ciências. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

Cobertura: lote 240/240 em 8/8 simulados; 6º ano 1.680/1.920 questões em 56/64 simulados. Total 6.029/23.444 questões com tema e 201/780 simulados completos, sem inválidos; demais lotes e metadados preservados. Próximo lote: Inglês do 6º ano, oito arquivos/240 questões sem tema, para completar as oito disciplinas desse ano. A E04 continua parcial para os demais anos/públicos.

Validação: dry-run e inventário JSON aprovados; 18 nomes documentados, de 1–4 palavras/até 120 caracteres; temas sem coincidência literal com o gabarito após normalização. Comparação byte a byte das fontes sem `theme` e dos dados por export aprovada. Nomes das capacidades, tipos de ginástica, aparelhos e valores solicitados não são usados como rótulos da resposta. Identificar esportes coletivos usa Modalidades esportivas. A revisão B4/AV2 mantém quinze temas das unidades. API: 713 testes/40 suítes unitárias e 418 testes/23 suítes de integração aprovados; PostgreSQL descartável removido e ausência confirmada.

As pendências anteriores sobre bloqueio/toques no voleibol e explicações de alongamento/recuperação estão na [issue web #105](https://github.com/guilhermeborba/simulados-bernardo/issues/105), para revisão separada; conteúdo preservado. Quizzes #90 seguem adiados. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.

### Inglês do 6º ano — E04 (21/10/2026)

Educação Física do 6º ano foi integrada em api#246/web#106. Este lote acrescenta somente `theme` às 240 questões dos oito simulados gerais de Inglês do 6º ano, sem entradas privadas adicionais. Primeiro lote da disciplina na E04: 17 nomes e critérios em `docs/temas-editoriais.md`. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

O 6º ano está completo nos arquivos: 1.920/1.920 questões com tema em 64/64 simulados, nas oito disciplinas. O lote tem 240/240 questões em 8/8 simulados. Total: 6.269/23.444 questões com tema e 209/780 simulados completos, sem inválidos; cobertura de 3º, 4º e 5º anos, demais lotes e metadados preservados. Próximo lote: Português do 7º ano, oito arquivos/240 questões sem tema no inventário. A E04 continua parcial para os demais anos/públicos.

Validação: dry-run e inventário JSON aprovados; 17 nomes documentados, de 1–4 palavras/até 120 caracteres; temas sem coincidência literal com o gabarito após normalização. Comparação byte a byte das fontes sem `theme` e dos dados por export aprovada. Classes de palavras evita antecipar as respostas nas questões de identificação gramatical; Uso do inglês agrupa as reflexões sobre a aprendizagem. Rotina diária trata o significado das ações; Presente simples trata as formas verbais. A revisão B4/AV2 mantém dezesseis temas das unidades. API: 713 testes/40 suítes unitárias e 418 testes/23 suítes de integração aprovados; PostgreSQL descartável removido e ausência confirmada.

As pendências anteriores sobre their, contraste de cores e convenção semanal estão na [issue web #107](https://github.com/guilhermeborba/simulados-bernardo/issues/107), para revisão separada; conteúdo preservado. Quizzes #90 seguem adiados. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.

### Português do 7º ano — E04 (21/10/2026)

Inglês do 6º ano foi integrado em api#247/web#108, completando os temas das oito disciplinas desse ano. Este lote acrescenta somente `theme` às 240 questões dos oito simulados gerais de Português do 7º ano, sem entradas privadas adicionais. Vocabulário fechado de 15 nomes e critérios em `docs/temas-editoriais.md`, reaproveitando os nomes de Português dos anos anteriores quando o conteúdo corresponde. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

Cobertura: lote 240/240 em 8/8 simulados; 7º ano 240/1.920 questões em 8/64 simulados. Total 6.509/23.444 questões com tema e 217/780 simulados completos, sem inválidos; cobertura integral de 3º, 4º, 5º e 6º anos, demais lotes e metadados preservados. Próximo lote: Matemática do 7º ano, oito arquivos/240 questões sem tema no inventário. A E04 segue parcial para os demais anos/públicos.

Validação: dry-run e inventário JSON aprovados; 15 nomes documentados, de 1–4 palavras/até 120 caracteres; nenhuma coincidência literal de tema com a alternativa do gabarito após normalização. Fontes sem `theme` comparadas byte a byte e dados por export preservados. Gêneros e tipos textuais evita antecipar o gênero solicitado e a finalidade dos anúncios; Organização textual evita antecipar Coesão/Coerência; Pronomes, Narrativas, Figuras de linguagem e Concordância mantêm os tipos no mesmo agrupamento. B4/AV2 revisa onze temas. API: 713 testes/40 suítes unitárias e 418 testes/23 suítes de integração aprovados; PostgreSQL descartável removido e ausência confirmada.

As pendências anteriores de pronomes, coerência e exemplos de concordância estão na [issue web #109](https://github.com/guilhermeborba/simulados-bernardo/issues/109), para revisão separada; conteúdo preservado. Quizzes #90 continuam adiados. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.

### Matemática do 7º ano — E04 (22/10/2026)

Português do 7º ano foi integrado em api#248/web#110. Este lote acrescenta somente `theme` às 240 questões dos oito simulados gerais de Matemática do 7º ano, sem entradas privadas adicionais. Vocabulário fechado de 12 nomes e critérios em `docs/temas-editoriais.md`, reaproveitando nomes dos anos anteriores quando o conteúdo corresponde. Números inteiros, Razão e proporção, Equações e Plano cartesiano agrupam os conteúdos introduzidos neste ano. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

Cobertura: lote 240/240 em 8/8 simulados; 7º ano 480/1.920 questões em 16/64 simulados. Total 6.749/23.444 questões com tema e 225/780 simulados completos, sem inválidos; cobertura integral de 3º, 4º, 5º e 6º anos, demais lotes e metadados preservados. Próximo lote: Ciências do 7º ano, oito arquivos/240 questões sem tema confirmados no inventário. A E04 segue parcial para os demais anos/públicos.

Validação: dry-run e inventário JSON aprovados; 12 nomes documentados, de 1–4 palavras/até 120 caracteres; nenhuma coincidência literal de tema com a alternativa do gabarito após normalização. Fontes sem `theme` comparadas byte a byte e dados por export preservados. Números inteiros mantém operações com sinais; MMC e MDC não destaca qual método usar; Figuras planas e Ângulos evitam o nome da classificação pedida; Equações mantém o foco algébrico mesmo em problemas de dinheiro ou medidas. B4/AV2 revisa nove temas. API: 713 testes/40 suítes unitárias e 418 testes/23 suítes de integração aprovados; PostgreSQL descartável removido e ausência confirmada.

As pendências anteriores de alternativas equivalentes em frações, generalizações em dicas/curiosidades e referência geográfica estão na [issue web #111](https://github.com/guilhermeborba/simulados-bernardo/issues/111), para revisão separada; conteúdo preservado. Quizzes #90 continuam adiados. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.

### Ciências do 7º ano — E04 (22/10/2026)

Matemática do 7º ano foi integrada em api#249/web#112. Este lote acrescenta somente `theme` às 240 questões dos oito simulados gerais de Ciências do 7º ano, sem entradas privadas adicionais. Vocabulário fechado de 22 nomes e critérios em `docs/temas-editoriais.md`, reaproveitando nomes dos anos anteriores quando o conteúdo corresponde. Planeta Terra, Atmosfera, Propriedades dos gases, Tempo e clima e Relações ecológicas detalham os conteúdos deste ano. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

Cobertura: lote 240/240 em 8/8 simulados; 7º ano 720/1.920 questões em 24/64 simulados. Total 6.989/23.444 questões com tema e 233/780 simulados completos, sem inválidos; cobertura integral de 3º, 4º, 5º e 6º anos, demais lotes e metadados preservados. Próximo lote: História do 7º ano, oito arquivos/240 questões sem tema confirmados no inventário. A E04 segue parcial para os demais anos/públicos.

Validação: dry-run e inventário JSON aprovados; 22 nomes documentados, de 1–4 palavras/até 120 caracteres; nenhuma coincidência literal de tema com a alternativa do gabarito após normalização. Fontes sem `theme` comparadas byte a byte e dados por export preservados. Planeta Terra evita antecipar a esfera solicitada; Água na natureza cobre a identificação do ciclo completo; Solo evita antecipar Conservação do solo; Relações ecológicas, Cadeias alimentares e Ecossistemas mantêm os tipos e papéis no mesmo agrupamento. B2/AV1 articula nove temas; B4/AV2 revisa doze. API: 713 testes/40 suítes unitárias e 418 testes/23 suítes de integração aprovados; PostgreSQL descartável removido e ausência confirmada.

As pendências anteriores de conceitos e dados estão na [issue web #113](https://github.com/guilhermeborba/simulados-bernardo/issues/113), para revisão separada; conteúdo preservado. Quizzes #90 continuam adiados. O checkout principal web com alterações de `giz/simulados-redesenho` foi preservado; o registro documental usa worktree separado. Não houve alteração de contrato, seed em banco existente, deploy ou operação em produção.

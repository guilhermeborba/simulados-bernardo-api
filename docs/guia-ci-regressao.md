# CI e regressão da base

Criado no lote 02 e atualizado após os lotes 03 a 10, em **13/10/2026**. O workflow `.github/workflows/ci.yml` executa em PRs, pushes na `main` e por acionamento manual. Usa Node 22, `npm ci`, geração Prisma, lint, unitários, build, dry-run/inventário de simulados e quizzes, validação de propostas de missões/habilidades e integração HTTP com PostgreSQL 16.

## Evidência atual — fechamento do lote 10

| Projeto | Última validação funcional |
|---|---|
| API | 688 unitários em 39 suítes; 395 testes de integração em 21 suítes |
| Web | 30 testes de sessão; 48 jornadas HTTP em 6 suítes; 78 testes Chromium desktop/mobile emulado |

Lint/build da API, build/typecheck da web, validação Prisma e dry-runs de simulados/quizzes/missões/habilidades passaram. As PRs [API #213](https://github.com/guilhermeborba/simulados-bernardo-api/pull/213) e [web #45](https://github.com/guilhermeborba/simulados-bernardo/pull/45) foram integradas em 13/10/2026 com [CI API aprovada](https://github.com/guilhermeborba/simulados-bernardo-api/actions/runs/38438311892) e [CI web aprovada](https://github.com/guilhermeborba/simulados-bernardo/actions/runs/38439597355). Os números das seções por lote abaixo são históricos, sem substituir este fechamento.

Testes não publicam conteúdo editorial, não comprovam deploy e não enviam e-mail externo. Revisão/publicação, ativação Resend, usabilidade humana, leitor de tela e aparelhos reais continuam pendentes. O lote 11 mobile ainda não foi iniciado.

## Rodar localmente

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run seed:dry-run
npm run seed:inventory
npm run --silent seed:inventory:json > /tmp/simulados-inventory.json
npm run seed:quizzes:dry-run
npm run --silent seed:quizzes:inventory:json > /tmp/quizzes-inventory.json
npm run seed:missions:dry-run
npm run seed:skills:dry-run
npm run test:integration
```

O inventário não conecta ao banco nem importa questões nele. O relatório JSON contém contagens e metadados; não inclui gabaritos. O catálogo publicado e o backlog editorial são explícitos: faltar arquivo no catálogo publicado é erro, mesmo quando existe conteúdo planejado para aquela faixa. Consulte [Inventário do acervo](inventario-acervo.md) para números, critérios e promoção de conteúdo.

`test:integration` e `test:e2e` executam a mesma suíte. Por padrão o runner cria um contêiner próprio, aleatório, com armazenamento em memória e porta aleatória em `127.0.0.1`; aplica as migrations versionadas; executa os testes; remove o contêiner ao terminar ou interromper. Ele exige Docker e a imagem `postgres:16-alpine` previamente disponível (`docker pull postgres:16-alpine`). Não usa o serviço do Compose, o banco da `.env` nem o seed editorial. `test:auth:integration` mantém o comando dedicado à rotação de refresh usando o mesmo isolamento.

Para usar um serviço de CI descartável já criado:

```bash
TEST_DATABASE_URL='postgresql://simulados_regression_test:synthetic-test-password@127.0.0.1:5432/simulados_regression_test?schema=public' npm run test:integration -- --external
```

A URL deve ser explícita, local e ter usuário e banco `simulados_regression_test`. O runner rejeita bancos contendo dados de aplicação e substitui `DATABASE_URL` por esse destino apenas nos subprocessos. O modo externo não remove o serviço: o executor da CI deve descartá-lo. Recrie-o antes de outro run se o anterior foi interrompido e deixou fixtures. As suítes também exigem `TEST_DATABASE_URL`; executar o Jest diretamente sem o destino de teste falha, em vez de informar sucesso com casos pulados.

## O que a regressão verifica

- Registro, login, convites e visibilidade do catálogo por usuário/turma; rascunhos e simulados privados não aparecem para quem não tem acesso.
- Início e retomada da mesma tentativa, persistência e edição de respostas antes da conclusão, resultado e histórico; tentativa concluída rejeita novas respostas.
- Correção real dos quatro tipos de questão, preservando a regra atual de tudo-ou-nada.
- Gabaritos ausentes nas respostas públicas e de aluno; perfis e vínculos de responsáveis não expõem `passwordHash`.
- Acesso somente ao próprio aluno, ao aluno ativo vinculado ao responsável ou ao aluno de turma atribuída ao docente, com registros públicos/dessas turmas; ADMIN mantém as consultas previstas.
- Rotação concorrente e rollback do refresh, revogação por logout e validação da configuração de banco de testes.
- Quiz: versões imutáveis/snapshots, criação/início concorrentes, confirmação/feedback e conclusão idempotentes, projeções sem gabarito e isolamento dos relatórios/ranking de simulados.
- Importação completa e repetida dos 45 quizzes em banco descartável, referências/versões, rollback e concorrência; catálogo real continua PENDING e não foi publicado.
- Mídia do snapshot: SVG/WAV, Range, autorização/revogação, digest e fallback textual sem bloquear confirmação/conclusão.
- Preferências da própria conta: defaults sem gravação, 15 faixas, roles, DTOs estritos e compatibilidade combinada, PATCH concorrente, status/subject do JWT, isolamento e constraints SQL.
- Missões/XP: calendário São Paulo, posições semanais, recibos idempotentes, teto diário, acesso atual, concorrência e rollback.
- Avatar/conquistas: concessões do servidor, propriedade/seleção, backfill com recibos válidos e ausência de bônus retroativo.
- Habilidades/REVIEW: classificação revisada, snapshots, primeiras respostas/repetições/revisões separadas, dificuldades recentes e ausência de recompensas em revisão.
- Acompanhamento/recuperação: vínculos atuais, proteção entre turmas, revogação de sessão, tokens de reset de uso único, transporte sintético e logs sem dados sensíveis.

Registro histórico do lote 02, em 12/10/2026: 120 testes unitários (incluindo 23 de inventário e 14 da configuração de banco), 43 testes de integração (35 de fluxos HTTP + 8 de refresh), lint, build, dry-run e relatório determinístico passaram.

As fixtures são sintéticas e criadas em PostgreSQL real. Testes passam pelos controllers, guards e validação da aplicação. Não substituem a revisão pedagógica das questões nem uma avaliação manual de acessibilidade em navegador/aparelho.

A web tem seu próprio workflow e regressão HTTP/browser com Next, API e PostgreSQL. O checkout da API nessa CI é fixado em um commit compatível para reproduzir os contratos; atualize essa referência ao integrar mudanças de contrato. No fechamento do lote 10, a referência é `e0b19669723de7d67c778fcc08a3f300b0003fa1`, já integrada à main pela PR #213. Uma alteração exclusivamente documental não exige trocar essa referência.

## Jornada web do lote 06

Execute no repositório web, apontando para um checkout da API com o contrato de preferências e migrations desta entrega:

```bash
npm run typecheck
npm run test:auth
npm run build
E2E_API_DIR=/caminho/do/checkout/api npm run test:e2e
E2E_API_DIR=/caminho/do/checkout/api npm run test:browser
```

Os harnesses iniciam Next de produção, API real e PostgreSQL descartável, com fixtures sintéticas. O catálogo, runner e histórico não importam/publicam o catálogo editorial em ambiente existente. A regressão HTTP cobre as jornadas de simulado e quiz, filtros nas 15 faixas, feedback/retomada/resultado, preferências por conta e bytes/Range/autorização do BFF. Testes de sessão verificam também isolamento/renovação e transporte binário controlado.

`test:browser` exige Chromium instalado para Playwright; a configuração recusa execução sem as URLs/fixtures do harness. Os projetos usam desktop e viewport mobile emulado, com um worker; cenários incluem teclado, mudanças de seleção, bloqueio após confirmar, perda de resposta HTTP, recarga/retomada, mídia com falha, preferências/conta e axe. A emulação não representa um aparelho Android/iOS real, e axe não substitui leitor de tela ou avaliação com pessoas.

Fechamento da validação do lote 06: **409 unitários e 214 integração API/PostgreSQL**, **30 testes de sessão e 16 jornadas HTTP web** passaram. Builds API/web, lint da API e Prisma validate passaram; **24 testes Chromium desktop/mobile emulado** passaram, incluindo os cinco segmentos, teclado, axe, fallback, perdas de resposta e troca de conta. Bundles de quiz foram inspecionados sem campos privados ou fixtures sintéticas. O catálogo 45/213 permanece PENDING; revisão editorial, publicação e sessões humanas/aparelhos/leitor de tela continuam pendentes. Nenhuma migration em banco existente, seed em produção ou deploy foi executado.

## Referências da CI

- [Serviço PostgreSQL no GitHub Actions](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers).
- [actions/checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) e [actions/setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), fixados por SHA no workflow.

## Habilidades e revisão — lote 09

`seed:skills:dry-run` valida offline as propostas e a cobertura integral das perguntas do catálogo de quizzes; o workflow executa esse gate sem publicar. `seed:skills:inventory:json` exporta somente metadados e contagens.

A integração testa classificação editorial explícita, snapshots imutáveis, todas as faixas, primeira resposta/repetição/revisão, versões, perguntas vistas primeiro em revisão, dificuldades recentes/resolvidas, acesso por turma e conta atual, inícios concorrentes por modo e ausência de XP/missão/itens em REVIEW. Testes de migration usam schema próprio populado anterior ao lote 09 e os importadores validam rascunhos e publicação com revisão explícita. Histórico sem classificação permanece sem classificação.

A web acrescenta `tests/e2e/progress-review-regression.test.mjs` e `tests/browser/progress-review.spec.ts`. As jornadas passam por Next/BFF/Nest/PostgreSQL, usando somente fixtures sintéticas. Builds devem terminar antes de iniciar os servidores do harness. Publicação editorial e avaliação com aparelhos/pessoas seguem pendentes.


## Lote 10 — vínculos e recuperação com transporte sintético

As suítes de supervisão verificam aluno ativo, responsável vinculado, atribuição docente, revogação, catálogos/convites/ranking restritos e ausência de outra turma privada nos relatórios. A migration é aplicada também sobre legado populado, preservando dados e inicializando authVersion=0. Guards validam claims/papel/status/versão atuais.

A suíte de recuperação inicia Resend local em loopback com credenciais e endereços sintéticos; não envia e-mails externos. Cobre resposta uniforme, cooldown concorrente, hash/expiração/uso único, links simultâneos, refresh concorrente, rollback da transação, falha de entrega/notificação, configuração desativada, limite por IP e senhas Unicode/72 bytes. A suíte de observabilidade passa tokens/senhas canário em query/body e exige que não apareçam em logs, auditoria ou path do erro. O reset precisa invalidar access/refresh tokens anteriores, inclusive quando refresh concorre com o reset.

O transporte real permanece desativado por padrão até configurar chave/remetente verificado no ambiente autorizado. O limite de 20/minuto considera o IP imediato observado pela API; navegadores via BFF compartilham o orçamento. Cooldown por conta continua coordenado no banco. Configuração de proxy/perímetro confiável e entrega real permanecem pendentes. Contratos no [guia de acesso e recuperação](guia-acesso-recuperacao.md); decisões no [ADR 014](decisions/014-acesso-docente-e-recuperacao.md).

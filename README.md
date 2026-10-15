# Simulados Bernardo API

Backend da plataforma educacional **Simulados Bernardo**, com simulados, quizzes, missões, recompensas, progresso por habilidade e acompanhamento autorizado. A web já consome a API por um BFF com cookies httpOnly; a correção, as permissões e a concessão de recompensas ficam no servidor.

## Estado atual — 13/10/2026

Os lotes 01 a 10 do [plano de evolução](docs/superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md) estão implementados tecnicamente. O lote 10 foi integrado à `main` nas PRs [API #213](https://github.com/guilhermeborba/simulados-bernardo-api/pull/213) e [web #45](https://github.com/guilhermeborba/simulados-bernardo/pull/45), com CI aprovada. Integração do código não comprova implantação em produção.

| Lotes | Entrega técnica |
|---|---|
| 01–02 | Sessões isoladas, rotação atômica de refresh, inventário do acervo e CI com PostgreSQL descartável |
| 03–04 | Quizzes versionados, snapshots privados, confirmação com feedback e conclusão idempotentes |
| 05–06 | Catálogo inicial, ilustrações modernas e narração Infantil, jornada web, retomada/histórico e preferências por conta |
| 07–08 | Aprender hoje, missões semanais, XP transacional, avatar, coleções e conquistas |
| 09 | Habilidades classificadas, evidências de primeira resposta/repetição/revisão e prática de dificuldades |
| 10 | Acompanhamento por vínculos de responsável/docente e recuperação de senha com Resend |

Os cinco segmentos estão contemplados: Educação Infantil, Fundamental I, Fundamental II, Ensino Médio e Enfermagem, totalizando 15 faixas. Ainda dependem de execução separada:

- Revisão humana e publicação dos **45 quizzes/213 perguntas**, **45 propostas de habilidade/213 classificações** e **30 rascunhos de missão**; o estado editorial continua `PENDING`.
- Configuração de chave/remetente verificado e entrega real de e-mail; Resend permanece desativado por padrão.
- Aplicação das migrations e implantação das versões compatíveis no ambiente operacional escolhido.
- Validação com pessoas, leitor de tela e aparelhos Android/iOS reais. Chromium mobile emulado não substitui esses testes.

O **lote 11 está em andamento**, com protótipo Expo, contratos públicos compartilhados, prova automatizada e plano preliminar; a validação física continua pendente. O app e o beta permanecem futuros. Consulte [PROGRESS.md](PROGRESS.md) para o registro consolidado de entregas e pendências.

## Stack e arquitetura

Node.js 22, NestJS, TypeScript, PostgreSQL, Prisma, JWT, Zod, Jest/Supertest e Docker. Fluxo de dados: `Controller → Service → PrismaService → PostgreSQL`.

```text
src/
  config/                         validação de ambiente
  common/                         guards, erros, logs e requestId
  database/prisma/                 PrismaService
  health/                         /health e /ready
  modules/
    auth/                         sessão e recuperação de senha
    users/, students/, guardians/ contas, perfis e vínculos
    teachers/, turmas/             atribuições docentes e acesso privado
    disciplines/, simulations/    catálogo e autoria de simulados
    questions/, attempts/          questões, execução e correção
    quizzes/                      versões, apresentação e mídia
    learning-preferences/          faixa, áudio e movimento por conta
    learning/                     missões e XP
    learning-skills/               habilidades, evidências e revisão
    collections/                  avatar e conquistas
    reports/, pontuacao/, audit/   relatórios, ranking e auditoria
prisma/
  schema.prisma                   modelo e relações
  migrations/                     cadeia de migrations versionadas
  seed-data/                      acervo de simulados
  quiz-data/                      catálogo editorial de quizzes
```

`Simulation` distingue `SIMULATION` e `QUIZ`; versões de quiz e snapshots de tentativa preservam o conteúdo usado na correção. Simulados mantêm os quatro tipos de questão; quizzes usam múltipla escolha. `Attempt.practiceMode` separa `NORMAL` de `REVIEW`. `TeacherTurma`, `GuardianStudent`, `LearningSkill`, `XpEvent`, recibos de conclusão e coleções completam o domínio; a fonte definitiva é o [schema Prisma](prisma/schema.prisma).

## Desenvolvimento local

Crie `.env` a partir de [.env.example](.env.example) e preencha os valores do ambiente local. São obrigatórios `DATABASE_URL`, `FRONTEND_URL`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`. Segredos reais não devem ser versionados. A porta padrão é 3333.

```bash
npm ci
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

`prisma:migrate` executa `prisma migrate dev`, destinado ao desenvolvimento. Produção usa `prisma migrate deploy`, conforme o [guia de deploy](docs/guia-deploy.md). Health checks: `GET /health` e `GET /ready`; Swagger: `GET /docs` quando `API_DOCS_ENABLED=true`.

## Contratos principais

| Área | Rotas principais |
|---|---|
| Sessão | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me` |
| Recuperação | `POST /auth/forgot-password`, `/auth/reset-password` |
| Simulados | `GET /simulations/available`; autoria ADMIN em `/simulations` e `/simulations/:id/questions` |
| Quizzes | `GET /quizzes/available`; autoria ADMIN em `/quizzes`; `POST /quizzes/:quizId/attempts` |
| Tentativas | `POST /simulations/:simulationId/attempts`; `GET /attempts/:id/questions`; envio em `/attempts/:id/questions/:questionId/answer`; conclusão em `/attempts/:id/finish`; `GET /attempts/:id/result` |
| Histórico | `GET /me/attempts`, `/me/quiz-attempts` |
| Preferências | `GET/PATCH /me/learning-preferences` |
| Jornada | `GET /me/learning-home`, `/me/missions`; autoria ADMIN em `/missions` |
| Coleções | `GET /me/achievements`, `/me/avatar`; `PATCH /me/avatar` |
| Progresso e revisão | `GET /me/learning-progress`; `POST /me/review-attempts`; autoria ADMIN em `/learning-skills` |
| Acompanhamento | `GET /me/oversight-students`, `/students/:id/learning-progress`, `/reports/student/:id/summary`, `/reports/student/:id/by-discipline` |
| Vínculos | Gestão ADMIN em `/guardians/students` e `/turmas/:id/teachers`; participação em `POST /me/turmas/join` |
| Ranking de simulados | `GET /me/pontuacao`, `/me/turmas/:turmaId/ranking` |

Os guias abaixo detalham DTOs, verbos e respostas. Preferências não alteram perfil escolar nem concedem acesso a turma. Responsáveis consultam alunos ativos vinculados; professores consultam alunos de turmas ativas atribuídas, com registros públicos e dessas turmas. Somente ADMIN gerencia vínculos docentes. Acompanhamento não permite executar atividades em nome do aluno.

## Conteúdo e importação

O seed de simulados usa **`prisma/seed-data`** por padrão; `FRONTEND_DATA_DIR` permite escolher outra origem. O inventário versionado valida 584 arquivos, 588 simulados publicáveis e 17.684 questões, com 192 simulados planejados no backlog editorial. Publicável no repositório não significa publicado no banco.

```bash
npm run seed:dry-run
npm run seed:inventory
npm run seed:quizzes:dry-run
npm run seed:missions:dry-run
npm run seed:skills:dry-run
```

Esses comandos validam sem importar dados. `npm run seed` grava simulados no banco explicitamente configurado. Quizzes têm importador separado: `seed:quizzes` cria rascunhos e exige `QUIZ_SEED_AUTHOR_EMAIL` de um ADMIN ativo existente; `seed:quizzes:publish-reviewed` exige revisão correspondente. Habilidades usam `seed:skills:drafts`, com autoria e fontes válidas. Missões são criadas/publicadas pelas rotas administrativas após curadoria. Nenhuma dessas operações decorre automaticamente de merge ou deploy.

## Regras de segurança e aprendizagem

- Rascunhos ficam fora do catálogo do aluno. Gabaritos e snapshots privados não são retornados nos contratos públicos.
- A correção acontece no servidor. Em quiz, confirmar grava e bloqueia a resposta; reenvios equivalentes e conclusão repetida preservam o resultado.
- Notas de simulados, evidências de quiz/revisão e XP têm propósitos separados. REVIEW não concede XP, progresso de missão ou novos itens.
- Uma conclusão NORMAL elegível concede 10 XP por quiz lógico/aluno/dia, até 50 XP/dia em `America/Sao_Paulo`; missões não concedem bônus extra.
- A API revalida conta, papel, versão da sessão e vínculos atuais. Redefinir a senha revoga os access/refresh tokens anteriores.
- Recuperação usa token aleatório de uso único, hash persistido e expiração de 30 minutos. Resend real exige ativação explícita.
- Soft delete preserva entidades com histórico. Logs e auditoria excluem corpo e query com dados sensíveis.

O limite da recuperação é 20 requisições/minuto por endpoint/IP observado pela API. Pelo BFF, os navegadores compartilham esse orçamento; o [guia de recuperação](docs/guia-acesso-recuperacao.md) explica a dependência de proxy/perímetro.

## Testes e CI

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run test:integration
```

`test:integration` e `test:e2e` usam o mesmo runner: API real, migrations e PostgreSQL descartável. Ele não utiliza o banco da `.env`, exige Docker e a imagem `postgres:16-alpine`. Há comando dedicado `test:auth:integration` para refresh. O workflow executa unitários, lint/build, dry-runs de simulados/quizzes/missões/habilidades e integração.

Última validação funcional do lote 10: **688 unitários/39 suítes e 395 testes de integração/21 suítes** na API; **30 testes de sessão, 48 jornadas HTTP e 78 testes Chromium desktop/mobile emulado** na web. Os testes usam fixtures sintéticas, transporte de e-mail local e bancos isolados. Veja escopo, execução e limitações no [guia de CI e regressão](docs/guia-ci-regressao.md).

## Documentação

| Documento | Uso |
|---|---|
| [PROGRESS.md](PROGRESS.md) | Estado atual, evidências e pendências |
| [Plano de evolução](docs/superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md) | Lotes 01–12, dependências e planejamento mobile |
| [Checklist de desenvolvimento](docs/checklist-desenvolvimento.md) | Implementação e aceite técnico |
| [Inventário do acervo](docs/inventario-acervo.md) e [seed/importação](docs/guia-seed-importacao.md) | Acervo de simulados e backlog |
| [Quizzes](docs/guia-quizzes.md) e [matriz editorial](docs/matriz-editorial-quizzes.md) | Contratos, catálogo, mídia e revisão |
| [Missões e XP](docs/guia-missoes-xp.md) | Curadoria semanal e recompensas |
| [Coleções e conquistas](docs/guia-colecoes-conquistas.md) | Avatar e itens cosméticos |
| [Habilidades e revisão](docs/guia-habilidades-revisao.md) | Classificação, evidências e prática |
| [Permissões](docs/guia-permissoes.md) e [acesso/recuperação](docs/guia-acesso-recuperacao.md) | Vínculos, sessão e Resend |
| [Prova mobile](docs/guia-prova-mobile.md) e [plano mobile/beta](docs/superpowers/plans/2026-10-13-mobile-proof-and-beta-plan.md) | Protótipo, sessão, matriz física e backlog preliminar |
| [CI/regressão](docs/guia-ci-regressao.md) e [deploy](docs/guia-deploy.md) | Validação isolada e operação |
| [ADRs](docs/decisions/) | Decisões arquiteturais e suas consequências |

Prévia local do [catálogo oficial e comparação de voz](docs/preview-mobile-catalogo-e-voz.md), com banco descartável, rascunhos por padrão e publicação local explícita do catálogo aprovado.

[Aprovação dos quizzes e perfil de voz Dora](docs/aprovacao-quizzes-e-voz-dora.md); [redesign futuro do design system web/mobile](docs/superpowers/plans/2026-10-14-design-system-web-mobile.md).

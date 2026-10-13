# Checklist de Desenvolvimento — Simulados Bernardo API

Atualizado em **13/10/2026**, após a implementação técnica dos lotes 01–10. As fases abaixo preservam a trilha original do backend; a evolução e os gates operacionais aparecem ao final. Itens técnicos marcados referem-se ao código e à validação com fixtures/serviços descartáveis, sem comprovar deploy, publicação editorial ou entrega de e-mail real. Veja [CI e regressão](guia-ci-regressao.md), [PROGRESS](../PROGRESS.md) e [plano de evolução](superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md).

## Fase 1 — Fundação do backend

Objetivo: preparar a base técnica para desenvolvimento seguro e incremental.

- [x] Criar estrutura inicial do projeto backend.
- [x] Configurar TypeScript.
- [x] Configurar NestJS.
- [x] Configurar validação de ambiente.
- [x] Criar `.env.example`.
- [x] Criar `docker-compose.yml` com PostgreSQL.
- [x] Configurar Prisma.
- [x] Criar schema inicial do domínio no Prisma.
- [x] Gerar migration SQL inicial em `prisma/migrations`.
- [x] Criar módulo de banco com `PrismaService`.
- [x] Criar `GET /health`.
- [x] Criar `GET /ready`.
- [x] Criar teste unitário inicial.
- [x] Instalar dependências com `npm install`.
- [x] Gerar Prisma Client com `npm run prisma:generate`.
- [x] Aplicar e validar a cadeia de migrations versionadas em PostgreSQL descartável.
- [x] Validar `npm run test`.
- [x] Validar `npm run build`.
- [x] Validar `npm run lint`.
- [x] Validar schema Prisma com `npx prisma validate`.

Critério de aceite:

- [x] API inicializa no harness real de integração.
- [x] Banco descartável conecta via `GET /ready`; `/health` também responde.
- [x] Migration inicial e migrations posteriores executam no banco isolado.
- [x] Testes unitários e de integração passam.

## Fase 2 — Autenticação e usuários

Objetivo: permitir acesso seguro com usuários e perfis.

- [x] Criar módulo `auth`.
- [x] Criar módulo `users`.
- [x] Implementar cadastro de usuário.
- [x] Implementar hash de senha com `bcrypt` ou `argon2`.
- [x] Implementar login.
- [x] Implementar JWT access token.
- [x] Implementar refresh token com rotação.
- [x] Implementar logout com invalidação de refresh token.
- [x] Implementar `GET /auth/me`.
- [x] Implementar recuperação com resposta uniforme, token de uso único e transporte Resend sintético.
- [x] Invalidar sessões anteriores após reset e bloquear emissão concorrente com senha antiga.
- [x] Implementar roles `STUDENT`, `GUARDIAN`, `TEACHER`, `ADMIN`.
- [x] Criar guard de autenticação.
- [x] Criar guard de autorização por role.
- [x] Criar testes unitários de autenticação.
- [x] Criar testes de integração de cadastro e login.

Critério de aceite:

- [x] Usuário consegue autenticar.
- [x] Rotas protegidas bloqueiam anônimos.
- [x] Rotas administrativas bloqueiam usuários sem permissão.

## Fase 3 — Disciplinas, simulados e questões

Objetivo: substituir a base local por dados persistidos.

- [x] Criar módulo `disciplines`.
- [x] Implementar CRUD de disciplinas.
- [x] Criar módulo `simulations`.
- [x] Implementar CRUD de simulados.
- [x] Implementar status `DRAFT`, `PUBLISHED`, `ARCHIVED`, `INACTIVE`.
- [x] Criar módulo `questions`.
- [x] Implementar CRUD de questões.
- [x] Implementar tipos `MULTIPLE_CHOICE`, `TRUE_FALSE_MULTIPLE`, `MATCHING`, `CLASSIFICATION`.
- [x] Implementar alternativas e gabaritos por questão.
- [x] Implementar reordenação de questões.
- [x] Implementar publicação e arquivamento de simulados.
- [x] Criar seed/importação dos dados atuais do front-end.
- [x] Garantir importação idempotente.
- [x] Implementar `GET /simulations/available`.
- [x] Criar testes de permissão para rotas administrativas.

Critério de aceite:

- [ ] Validar manualmente a autoria administrativa de um simulado completo no ambiente escolhido.
- [x] Aluno lista apenas simulados publicados.
- [x] Simulados em rascunho não aparecem para alunos.

## Fase 4 — Tentativas e correção

Objetivo: salvar simulados realizados e calcular resultados no backend.

- [x] Criar módulo `attempts`.
- [x] Implementar início de tentativa.
- [x] Salvar respostas em JSON.
- [x] Impedir alteração de tentativa finalizada.
- [x] Implementar finalização de tentativa.
- [x] Implementar correção de múltipla escolha.
- [x] Implementar correção de verdadeiro/falso múltiplo.
- [x] Implementar correção de associação de pares.
- [x] Implementar correção de classificação por categoria.
- [x] Calcular pontuação final.
- [x] Calcular percentual de aproveitamento.
- [x] Calcular acertos e erros.
- [x] Registrar duração da tentativa.
- [x] Retornar resultado detalhado após finalização.
- [x] Criar testes unitários da correção.
- [x] Criar testes de integração do fluxo de tentativa.

Critério de aceite:

- [x] Aluno finaliza um simulado.
- [x] Resultado bate com o gabarito.
- [x] Histórico fica salvo.
- [x] Tentativa finalizada não aceita novas respostas.

## Fase 5 — Perfil e relatórios

Objetivo: entregar acompanhamento de desempenho por aluno, responsável, professor e administrador.

- [x] Criar perfil do aluno.
- [x] Implementar vínculo responsável-aluno.
- [x] Implementar histórico de tentativas por aluno.
- [x] Implementar melhores notas por simulado.
- [x] Implementar desempenho por disciplina.
- [x] Implementar desempenho por bimestre.
- [x] Implementar relatório por simulado.
- [x] Implementar questões com maior taxa de erro.
- [x] Restringir responsável a alunos vinculados.
- [x] Restringir professor a alunos de turmas ativas atribuídas e aos registros públicos/dessas turmas.
- [x] Revalidar vínculo/status/papel e bloquear acesso após revogação.
- [x] Oferecer roster mínimo e progresso por habilidade para acompanhamento autorizado.
- [x] Criar testes de autorização dos relatórios.

Critério de aceite:

- [x] Aluno vê seu próprio histórico.
- [x] Responsável vê apenas alunos ativos vinculados.
- [x] Professor não recebe registros privados de outras turmas do mesmo aluno.
- [x] Administrador vê relatórios gerais.

## Fase 6 — Segurança, hardening e produção

Objetivo: preparar o backend para uso real.

- [x] Configurar rate limit em endpoints sensíveis.
- [x] Configurar CORS restrito.
- [x] Padronizar respostas de erro.
- [x] Adicionar filtro global de exceções.
- [x] Adicionar logs estruturados.
- [x] Adicionar `requestId`.
- [x] Adicionar auditoria administrativa.
- [x] Revisar logs para não expor dados sensíveis.
- [x] Documentar API com Swagger/OpenAPI.
- [x] Criar guia de seed/importação.
- [x] Criar guia de permissões por perfil.
- [x] Criar guia de deploy.
- [x] Executar revisão final de permissões.

Critério de aceite:

- [x] Endpoints sensíveis estão protegidos.
- [x] Erros seguem formato padronizado.
- [x] Logs não expõem dados sensíveis.
- [x] API está documentada para integração com o front-end.


## Evolução — lotes 01 a 10

- [x] Lote 01: isolar refresh por sessão no BFF, rotação atômica e logout com revogação dos sucessores.
- [x] Lote 02: inventário determinístico, integração HTTP real e CI nos dois repositórios.
- [x] Lote 03: quizzes versionados, catálogo autorizado e snapshots privados de tentativa.
- [x] Lote 04: confirmação/feedback persistidos e conclusão idempotente de quiz.
- [x] Lote 05: preparar 45 quizzes/213 perguntas e mídia acessível para as 18 perguntas infantis; implementar importação própria.
- [x] Lote 06: catálogo/runner/histórico web e preferências de faixa, áudio e movimento por conta.
- [x] Lote 07: Aprender hoje, missões semanais e XP transacional separado de notas.
- [x] Lote 08: avatar, seis itens cosméticos e cinco conquistas calculados pelo servidor.
- [x] Lote 09: habilidades, snapshots de classificação, evidências separadas e REVIEW sem recompensas.
- [x] Lote 10: acompanhamento por vínculo, recuperação Resend e revogação imediata de sessões após reset.

Última validação funcional: API **688 unitários/39 suítes e 395 integração/21 suítes**; web **30 testes de sessão, 48 jornadas HTTP e 78 testes Chromium desktop/mobile emulado**. As PRs [API #213](https://github.com/guilhermeborba/simulados-bernardo-api/pull/213) e [web #45](https://github.com/guilhermeborba/simulados-bernardo/pull/45) do lote 10 foram integradas à main em 13/10/2026 com CIs aprovadas. Contagens anteriores nos guias são registros históricos de cada lote.

## Gates pendentes de ativação e lançamento

- [ ] Concluir revisão editorial dos 45 quizzes/213 perguntas, incluindo conteúdo de Enfermagem e mídia Infantil.
- [ ] Revisar as 45 propostas de habilidade/213 classificações e publicar as definições aprovadas.
- [ ] Revisar os 30 rascunhos de missão e publicar a curadoria semanal após disponibilizar quizzes revisados.
- [ ] Aplicar migrations e implantar versões compatíveis no ambiente operacional, segundo o processo autorizado.
- [ ] Configurar Resend com chave e remetente verificado; validar entrega real de forma controlada.
- [ ] Definir proxy/perímetro confiável para o limite de recuperação, atualmente compartilhado pelos navegadores via BFF.
- [ ] Validar usabilidade por segmento, com adulto na Infantil, leitor de tela e aparelhos reais.
- [ ] Lote 11: executar prova e planejamento mobile; framework e escopo definitivo ainda não escolhidos.
- [ ] Lote 12: construir app e beta após a decisão técnica e os gates necessários.

Aceite técnico não publica conteúdo automaticamente. Os catálogos preparados permanecem `PENDING`, e nenhuma migration/seed/deploy em banco existente foi executada pelas validações descritas aqui.

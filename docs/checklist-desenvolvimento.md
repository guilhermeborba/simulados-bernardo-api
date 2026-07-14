# Checklist de Desenvolvimento — Simulados Bernardo API

Checklist baseado no plano de desenvolvimento anexado. Use este arquivo como trilha objetiva de implementação e aceite técnico.

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
- [ ] Executar primeira migration com `npm run prisma:migrate`.
- [x] Validar `npm run test`.
- [x] Validar `npm run build`.
- [x] Validar `npm run lint`.
- [x] Validar schema Prisma com `npx prisma validate`.

Critério de aceite:

- [ ] API sobe localmente com `npm run start:dev`.
- [ ] Banco conecta via `GET /ready`.
- [ ] Migration inicial executa sem erro.
- [ ] Testes iniciais passam.

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
- [ ] Implementar recuperação de senha sem enumeração de usuários.
- [x] Implementar roles `STUDENT`, `GUARDIAN`, `TEACHER`, `ADMIN`.
- [x] Criar guard de autenticação.
- [x] Criar guard de autorização por role.
- [x] Criar testes unitários de autenticação.
- [ ] Criar testes de integração de cadastro e login.

Critério de aceite:

- [ ] Usuário consegue autenticar.
- [ ] Rotas protegidas bloqueiam anônimos.
- [ ] Rotas administrativas bloqueiam usuários sem permissão.

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
- [ ] Criar testes de permissão para rotas administrativas.

Critério de aceite:

- [ ] Administrador cria um simulado completo.
- [ ] Aluno lista apenas simulados publicados.
- [ ] Simulados em rascunho não aparecem para alunos.

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
- [ ] Criar testes de integração do fluxo de tentativa.

Critério de aceite:

- [ ] Aluno finaliza um simulado.
- [ ] Resultado bate com o gabarito.
- [ ] Histórico fica salvo.
- [ ] Tentativa finalizada não aceita novas respostas.

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
- [ ] Restringir professor a alunos ou turmas autorizadas.
- [x] Criar testes de autorização dos relatórios.

Critério de aceite:

- [x] Aluno vê seu próprio histórico.
- [x] Responsável vê apenas alunos vinculados.
- [x] Administrador vê relatórios gerais.

## Fase 6 — Segurança, hardening e produção

Objetivo: preparar o backend para uso real.

- [ ] Configurar rate limit em endpoints sensíveis.
- [ ] Configurar CORS restrito.
- [ ] Padronizar respostas de erro.
- [ ] Adicionar filtro global de exceções.
- [ ] Adicionar logs estruturados.
- [ ] Adicionar `requestId`.
- [ ] Adicionar auditoria administrativa.
- [ ] Revisar logs para não expor dados sensíveis.
- [ ] Documentar API com Swagger/OpenAPI.
- [ ] Criar guia de seed/importação.
- [ ] Criar guia de permissões por perfil.
- [ ] Criar guia de deploy.
- [ ] Executar revisão final de permissões.

Critério de aceite:

- [ ] Endpoints sensíveis estão protegidos.
- [ ] Erros seguem formato padronizado.
- [ ] Logs não expõem dados sensíveis.
- [ ] API está documentada para integração com o front-end.

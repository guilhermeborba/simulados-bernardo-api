# CI e regressão da base

Lote 02 do plano de evolução, em 12/10/2026. O workflow `.github/workflows/ci.yml` executa em PRs, pushes na `main` e por acionamento manual. Usa Node 22, `npm ci`, geração Prisma, lint, unitários, build, dry-run do catálogo, inventário e integração HTTP com PostgreSQL 16.

## Rodar localmente

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run seed:dry-run
npm run seed:inventory
npm run --silent seed:inventory:json > /tmp/simulados-inventory.json
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
- Acesso somente ao próprio aluno ou ao aluno vinculado ao responsável, além das permissões administrativas previstas.
- Rotação concorrente e rollback do refresh, revogação por logout e validação da configuração de banco de testes.

Validação local em 12/10/2026: 120 testes unitários (incluindo 23 de inventário e 14 da configuração de banco), 43 testes de integração (35 de fluxos HTTP + 8 de refresh), lint, build, dry-run e relatório determinístico passaram.

As fixtures são sintéticas e criadas em PostgreSQL real. Testes passam pelos controllers, guards e validação da aplicação. Não substituem a revisão pedagógica das questões nem uma avaliação manual de acessibilidade em navegador/aparelho.

A web tem seu próprio workflow e regressão HTTP com Next, API e PostgreSQL. O checkout da API nessa CI é fixado em um commit da `main` para reproduzir os contratos; atualize essa referência ao integrar mudanças de contrato.

## Referências da CI

- [Serviço PostgreSQL no GitHub Actions](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers).
- [actions/checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) e [actions/setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), fixados por SHA no workflow.

# Guia de deploy

Procedimento operacional para um ambiente explicitamente escolhido. Código integrado, CI aprovada e migrations testadas em banco descartável não comprovam implantação. A atualização documental de 13/10/2026 não executa deploy, migrations, seed ou envio de e-mail.

## Pré-requisitos

- Node.js 22, lockfile do projeto e PostgreSQL compatível.
- Configuração de produção disponível no gerenciador de segredos do ambiente.
- Backup/recuperação e inspeção das migrations conforme o processo operacional da aplicação.
- Versão da API compatível com a web escolhida; aplicar migrations antes de servir tráfego que usa o schema novo.

Para quizzes, revisar a auditoria de tentativas abertas duplicadas no [guia de quizzes](guia-quizzes.md) antes de aplicar a cadeia em um banco existente. Não remover histórico para contornar constraints.

## Configuração

Valores de referência, sem credenciais reais:

```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgresql://...
FRONTEND_URL=https://frontend.example.com
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX=100
API_DOCS_ENABLED=false
PASSWORD_RESET_ENABLED=false
RESEND_API_URL=https://api.resend.com/emails
```

Use segredos JWT longos e aleatórios. A origem da web restringe CORS; quando recuperação estiver habilitada, precisa ser uma origem HTTPS canônica, sem caminho adicional, credenciais, query ou fragmento. Endpoints de banco e segredos devem vir do ambiente de execução, sem colocá-los em arquivos versionados ou logs.

## Build e migrations

Com a configuração do ambiente de produção carregada:

```bash
npm ci --include=dev
npm run prisma:generate
npm run build
npx prisma migrate deploy
```

A etapa de build instala também as dependências de desenvolvimento (`--include=dev`), pois o compilador Nest está nesse grupo mesmo quando `NODE_ENV=production`. O processo que serve a API mantém a configuração de produção.

`npm run prisma:migrate` chama `prisma migrate dev` e fica reservado ao desenvolvimento. Em produção, `prisma migrate deploy` aplica as migrations já versionadas; não gera novas migrations. Preserve a sequência e as constraints SQL. O runner de integração cobre a cadeia e migrations sobre dados legados sintéticos; isso não substitui a preparação do banco operacional escolhido.

A migration do lote 10, `20261013030000_access_password_recovery`, cria `TeacherTurma` e `PasswordResetToken` e inicializa `User.authVersion` em zero. Não atribui professores nem gera links de recuperação. As migrations anteriores incluem quizzes/snapshots, preferências, missões/XP, avatar/conquistas e habilidades/revisão.

## Ordem de implantação

1. Aplicar a cadeia de migrations no banco do ambiente escolhido.
2. Publicar a API compatível e conferir `/health` e `/ready`.
3. Publicar a web compatível e validar a jornada autenticada prevista para o ambiente.
4. Criar/revisar vínculos e conteúdos pelas operações administrativas correspondentes.
5. Ativar e verificar e-mail real somente após a configuração do transporte.

A execução da API usa:

```bash
npm run start:prod
```

Confirme que `NODE_ENV=production` e os demais valores estão presentes no processo iniciado. Atualizações da web dependem dos contratos da API; a CI web mantém um commit compatível fixado, conforme o [guia de regressão](guia-ci-regressao.md).

## Ativação de conteúdo e Resend

Merge ou deploy não aprova nem publica o catálogo. Os 45 quizzes/213 perguntas, 45 propostas de habilidade/213 classificações e 30 rascunhos de missão continuam `PENDING`. Importação, aprovação e publicação são ações separadas; siga os guias de [quizzes](guia-quizzes.md), [habilidades](guia-habilidades-revisao.md) e [missões](guia-missoes-xp.md). Mantenha o conteúdo privado de turma restrito.

Resend permanece desativado por padrão. Após verificar o domínio/remetente, configurar `RESEND_API_KEY`, `MAIL_FROM` e `PASSWORD_RESET_ENABLED=true` no gerenciador de segredos. Manter o endpoint oficial. Configuração habilitada inválida impede o bootstrap; aceite do provedor não comprova chegada na caixa postal. Validar um envio real controlado e o fluxo de redefinição; contratos e limites estão no [guia de acesso e recuperação](guia-acesso-recuperacao.md).

A recuperação limita 20 requisições/minuto por endpoint/IP imediato observado pela API, com cooldown persistente de 60 segundos por conta. Os navegadores que usam o BFF compartilham esse orçamento. Definir a proteção no proxy/perímetro real antes de ampliar uso; não confiar em `X-Forwarded-For` arbitrário. O código atual não encaminha o IP do navegador nem configura `trust proxy`.

## Verificação operacional

- `/health` deve responder; `/ready` deve confirmar acesso ao banco. Monitorar falhas de readiness.
- Manter `API_DOCS_ENABLED=false` em produção pública.
- Verificar permissões com contas e vínculos do ambiente, sem expor dados de alunos em relatórios públicos.
- Logs e auditoria omitem corpo/query sensíveis; não registrar tokens, links de reset, senhas ou credenciais.
- Conservar a separação entre notas de simulado, prática/revisão e XP. Testes com emulação mobile não constituem validação em aparelho real.

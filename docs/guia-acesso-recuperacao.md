# Acompanhamento e recuperação de senha — lote 10

Entrega técnica integrada à main em **13/10/2026**, nas PRs [API #213](https://github.com/guilhermeborba/simulados-bernardo-api/pull/213) e [web #45](https://github.com/guilhermeborba/simulados-bernardo/pull/45), com CI aprovada. Implantação e envio real não foram confirmados por essa integração. [ADR 014](decisions/014-acesso-docente-e-recuperacao.md) registra as decisões e limitações. A web compatível oferece `/acompanhamento`, `/esqueci-senha` e `/redefinir-senha`.

## Acesso aos alunos

| Conta | Alunos e registros disponíveis |
|---|---|
| STUDENT | Somente dados pessoais; sem roster de acompanhamento |
| GUARDIAN | Alunos ativos vinculados por `GuardianStudent` |
| TEACHER | Alunos ativos membros de turmas ativas atribuídas por `TeacherTurma`; registros públicos e dessas turmas |
| ADMIN | Alunos ativos e gestão dos vínculos |

Uma turma atribuída não autoriza registros privados de outra turma do mesmo aluno. Contas bloqueadas/excluídas ou com papel alterado não continuam autenticadas com JWT antigo. Remover participação, atribuição ou vínculo bloqueia consultas posteriores. Acompanhamento não permite realizar tentativa ou revisão em nome do aluno.

ADMIN usa `POST /turmas/:id/teachers` com `{ "teacherId": "id-da-conta-docente" }` para atribuir um professor ativo. A repetição preserva a atribuição existente. `DELETE /turmas/:id/teachers/:teacherId` remove-a e retorna 204. Esses endpoints não são liberados pelo BFF web de acompanhamento. Vínculos de responsáveis continuam usando o módulo `guardians`, exclusivamente ADMIN. Criar uma conta pelo registro público cria STUDENT; convite de participação não atribui papel TEACHER.

Professores listam somente turmas atribuídas e podem criar/revogar convites dessas turmas. Convite de estudante só é resgatado por estudante ativo. ADMIN conserva gestão completa.

Consultas autenticadas:

- `GET /me/oversight-students`: array de `{ id, name, schoolYear, turmas: [{ id, name, slug }] }`; sem e-mail ou segredo de conta.
- `GET /students/:id/learning-progress?schoolYear=3`: `{ schoolYear, unclassifiedQuestions, skills }`; evidências NORMAL/REVIEW separadas, sem sugestões de início, perguntas ou gabaritos.
- `GET /reports/student/:id/summary`: totais, médias e últimos simulados autorizados concluídos.
- `GET /reports/student/:id/by-discipline`: agrupamento de simulados por disciplina.

A web permite somente GET nas três consultas específicas de aluno/relatório, usa resposta privada sem cache e cancela respostas atrasadas quando muda aluno/conta. Simulados, primeiras respostas em quiz, repetições e revisões têm contagens distintas; XP/itens não são nota nem evidência de domínio.

## Recuperação

`POST /auth/forgot-password` recebe `{ "email": "conta@example.test" }`. Se o transporte está habilitado, retorna 202 com `Se houver uma conta ativa para este e-mail, enviaremos as instruções de recuperação.` para qualquer resultado válido. A ausência de envio não deve ser interpretada como confirmação de cadastro. Transporte desativado ou sem configuração retorna 503; falhas de entrega ou banco preservam a resposta genérica 202; DTO inválido retorna 400; excesso no limite de requisições retorna 429.

As duas rotas de recuperação têm limite de **20 requisições por minuto por endpoint/IP imediato observado pela API**, com cooldown persistente de 60 segundos por conta no banco. O BFF atual não encaminha o IP do navegador e a API não configura `trust proxy`: os navegadores que passam pelo mesmo BFF compartilham esse orçamento. Um ingresso/proxy pode introduzir compartilhamento adicional. Definir o perímetro e proxies confiáveis no ambiente real antes de ampliar o uso; não tratar `X-Forwarded-For` arbitrário como identidade confiável. O limite atual não garante orçamento individual por navegador.

O link enviado tem formato `https://origem-da-web/redefinir-senha#token=...`. O fragmento não viaja em requisições HTTP. A tela remove-o, mantém o valor só na memória e solicita confirmação da senha. Atualizar a página após a remoção exige abrir novamente o link do e-mail ou solicitar outro. Abrir outro link na mesma tela captura o novo fragmento e invalida o estado/respostas atrasadas do pedido anterior. Não registrar esse link em logs, capturas públicas ou ferramentas de suporte.

`POST /auth/reset-password` recebe `{ "token": "token-base64url-de-43-caracteres", "password": "nova-senha" }`. Sucesso retorna 200 `{ "success": true }`; token inválido, usado, sem aceite do transporte, expirado ou conta inativa retorna 400. Nova senha precisa de oito caracteres Unicode e no máximo 72 bytes UTF-8. Registro novo usa o mesmo limite; login de contas antigas não foi restringido retroativamente.

O token dura 30 minutos e somente seu hash é persistido. A primeira redefinição válida troca a senha, invalida links irmãos e revoga access/refresh tokens anteriores. O usuário precisa entrar novamente. A recuperação pública não altera os cookies de outra conta já aberta no navegador. Ambas as rotas BFF exigem a origem da própria web; nenhum GET troca senha.

## Ativação do Resend

Por padrão `PASSWORD_RESET_ENABLED=false`. Para ativar no ambiente escolhido, configurar pelo gerenciador de segredos, fora do chat:

- `PASSWORD_RESET_ENABLED=true`.
- `RESEND_API_KEY`: chave com permissão de envio.
- `MAIL_FROM`: endereço de remetente do domínio verificado no Resend.
- `FRONTEND_URL`: origem HTTPS da web em produção, sem caminho adicional, credenciais/query/fragmento.
- `RESEND_API_URL`: manter `https://api.resend.com/emails`.

A configuração habilitada sem chave/remetente ou com endpoint não permitido impede o bootstrap. Somente `NODE_ENV=test` aceita transporte HTTP em `127.0.0.1:<porta>/emails`; não usar essa opção em desenvolvimento/produção. Não colocar credenciais em arquivos versionados. API envia texto, com timeout de 750 ms e idempotência por token; aceite do Resend não comprova chegada na caixa postal. Falha de pedido mantém 202 e gera somente evento operacional genérico. Falha da notificação posterior não desfaz um reset concluído.

A entrega valida o contrato com servidor descartável e contas sintéticas. Configurar o domínio/chave, definir proteção adequada no proxy/perímetro e verificar entrega real de modo controlado continuam pendentes. Para instalar posteriormente: aplicar migrations com o processo de deploy autorizado, publicar a API compatível, publicar a web e configurar o transporte. Siga o [guia de deploy](guia-deploy.md), usando `prisma migrate deploy` com a configuração de produção carregada. Este documento não executa nem autoriza deploy.

## Validação

`npm run test:integration` cria PostgreSQL descartável e servidor Resend local sintético; cobre migração populada, escopos, revogação, consumo concorrente, reset/refresh simultâneos e rollback. A regressão web usa o mesmo transporte isolado, captura links em memória para os testes e nunca envia e-mails externos. Senha/token/endereço não são incluídos nos logs do transporte ou nos relatórios públicos. Testes em Chromium mobile emulado não substituem aparelho real nem validação com pessoas.

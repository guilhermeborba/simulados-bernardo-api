# ADR 014 — Acesso por vínculo e recuperação com Resend

Data: 2026-10-13. Status: implementado tecnicamente; ativação do e-mail real pendente de configuração.

Responsáveis e professores precisam acompanhar a aprendizagem sem obter acesso a todos os alunos ou aos gabaritos. A recuperação de senha precisa atender contas ativas sem confirmar publicamente se um endereço está cadastrado. O responsável pelo projeto escolheu Resend para esta entrega.

## Decisão

`TeacherTurma` representa uma atribuição administrativa, independente da participação do aluno. Somente ADMIN atribui/remove professores. Responsável exige `GuardianStudent`; professor exige atribuição e participação atual do aluno numa turma ativa. Todos exigem conta ativa, papel atual e aluno ativo. Docentes consultam atividades públicas e privadas das turmas atribuídas; atividades de outras turmas não entram nos históricos, médias ou evidências. Catálogos privados, ranking e gestão de convites seguem essa mesma atribuição. Convites de aluno não atribuem permissões docentes.

O painel usa um roster mínimo e três consultas de leitura: evidências por habilidade, resumo de simulados e agrupamento por disciplina. Quizzes e revisões não entram nas notas/médias de simulados. A consulta de habilidade não devolve perguntas, respostas, gabaritos ou ações para iniciar revisão. As permissões são verificadas no servidor a cada consulta; remover um vínculo não exige emitir outro JWT.

A recuperação aceita somente os DTOs previstos. O pedido devolve a mesma resposta 202 para endereço ausente, inativo, excluído, cooldown ou falha de entrega. Desativação/configuração indisponível retorna 503 antes de consultar contas. Há limite de 20 pedidos por minuto por endpoint/IP e cooldown de 60 segundos por conta, coordenado por lock no banco. O tempo mínimo da resposta é um segundo, com transporte limitado a 750 ms; dependências lentas ainda podem ultrapassar esse piso, que não promete tempo constante sob carga.

O token contém 32 bytes aleatórios; somente seu SHA-256 fica no banco. Expira em 30 minutos, exige aceite do transporte (`deliveredAt`) e pode ser consumido uma vez. Resend recebe uma mensagem de texto e uma chave de idempotência, com timeout, sem registrar destinatário, link, corpo de erro ou credenciais. Aceite do provedor não comprova recebimento na caixa postal. Falha invalida o token e mantém a resposta genérica. Novos pedidos não invalidam links já entregues; a primeira redefinição bem-sucedida invalida todos os outros links da conta.

A web recebe o token no fragmento da URL, remove-o ao montar e conserva-o só em memória. Uma visita ao link não consome o token; consumo ocorre no POST de redefinição. Não há login automático. O reset grava senha, consumo, incremento de `User.authVersion` e revogação dos refresh tokens numa transação. Uma notificação posterior não inclui senha/link; falha dessa notificação não desfaz a senha gravada.

Login, refresh, logout e reset usam a ordem de locks User → RefreshToken. Antes de emitir tokens, login revalida senha/versionamento/papel sob lock; um reset concorrente impede emitir sessão baseada na senha antiga. Guards conferem estado, papel e versão atuais no banco. JWTs anteriores à migration representam versão zero somente quando o campo está ausente; claims malformadas são rejeitadas. Tokens de acesso anteriores ao reset falham já na próxima requisição autenticada.

Novas senhas de registro/reset exigem oito caracteres Unicode e no máximo 72 bytes UTF-8, evitando truncamento do bcrypt. Login legado mantém sua validação para conservar contas existentes. Logs, resposta de erro e paths de auditoria excluem querystrings; auditoria também não persiste corpo/query da requisição.

## Consequências

A migration é aditiva: usuários existentes começam com versão zero; não cria atribuições ou links de recuperação. Os guards acrescentam uma consulta de conta por requisição autenticada para permitir revogação imediata. Integração deve aplicar a migration antes de publicar a API; depois publicar a web compatível. Nenhuma base existente ou e-mail real foi usado na validação desta entrega.

Resend fica desativado por padrão. A ativação exige chave, remetente verificado e origem HTTPS da web, configurados no ambiente de execução fora do chat. A configuração e os contratos estão no [guia de acesso e recuperação](../guia-acesso-recuperacao.md). A verificação do domínio e um envio real controlado continuam pendentes.

Referências: [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) orienta respostas uniformes, tokens de uso único e revogação de sessões; [Resend — Send Email](https://resend.com/docs/api-reference/emails/send-email) define o transporte utilizado.

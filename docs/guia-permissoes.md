# Guia de Permissões

## Perfis

- `STUDENT`: realiza simulados, consulta próprias tentativas e próprio desempenho.
- `GUARDIAN`: consulta apenas alunos vinculados.
- `TEACHER`: acompanha alunos de turmas ativas atribuídas por ADMIN em `TeacherTurma`; registros públicos e dessas turmas.
- `ADMIN`: gerencia usuários, disciplinas, simulados, questões, vínculos e relatórios administrativos.

## Regras principais

- Rotas administrativas exigem `ADMIN`.
- Aluno não acessa dados de outro aluno.
- Responsável só acessa alunos vinculados em `GuardianStudent`.
- Relatórios por aluno exigem aluno ativo e vínculo atual. Docente não recebe registros privados de outras turmas do mesmo aluno.
- Somente ADMIN atribui/remove professores; convite de participação não concede acesso docente.
- Guards exigem conta/papel/versão de sessão atuais. Reset invalida imediatamente tokens anteriores.
- Relatórios gerais exigem `ADMIN`.
- Tentativas só podem ser iniciadas por `STUDENT`.
- Tentativas finalizadas não aceitam novas respostas.

## Auditoria

Ações administrativas mutáveis (`POST`, `PATCH`, `DELETE`) são registradas em `AuditLog`.

O log de auditoria não grava corpo nem query da requisição. Paths de auditoria, logs HTTP e erros também excluem querystrings para evitar persistência de senha, token ou dados sensíveis.

Contratos e ativação do Resend no [guia de acesso e recuperação](guia-acesso-recuperacao.md).

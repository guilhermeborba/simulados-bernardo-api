# Guia de Permissões

## Perfis

- `STUDENT`: realiza simulados, consulta próprias tentativas e próprio desempenho.
- `GUARDIAN`: consulta apenas alunos vinculados.
- `TEACHER`: existe como papel, mas ainda não possui acesso amplo porque turma/vínculo docente não está modelado.
- `ADMIN`: gerencia usuários, disciplinas, simulados, questões, vínculos e relatórios administrativos.

## Regras principais

- Rotas administrativas exigem `ADMIN`.
- Aluno não acessa dados de outro aluno.
- Responsável só acessa alunos vinculados em `GuardianStudent`.
- Relatórios por aluno seguem a mesma regra de acesso do aluno.
- Relatórios gerais exigem `ADMIN`.
- Tentativas só podem ser iniciadas por `STUDENT`.
- Tentativas finalizadas não aceitam novas respostas.

## Auditoria

Ações administrativas mutáveis (`POST`, `PATCH`, `DELETE`) são registradas em `AuditLog`.

O log de auditoria não grava corpo da requisição para evitar persistência de senha, token ou dados sensíveis.

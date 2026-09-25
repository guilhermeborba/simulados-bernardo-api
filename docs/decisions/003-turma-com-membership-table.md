# ADR 003 — Turma usa tabela de membership, não role no usuário

**Data:** 2026-09-25
**Status:** vigente

## Contexto

Precisávamos de uma forma de restringir determinados simulados a um grupo fechado de alunos (a turma de uma escola específica). Havia duas opções:

1. Adicionar um campo `turmaId` no `User` — aluno pertence a uma turma no cadastro.
2. Criar uma tabela de associação `TurmaMembership` separada.

## Decisão

Optamos pela tabela de associação (`TurmaMembership`).

```prisma
model TurmaMembership {
  turmaId   String
  userId    String
  inviteId  String?   // rastreabilidade: por qual convite entrou
  // ...
  @@unique([turmaId, userId])
}
```

O acesso ao simulado é verificado em runtime: `SimulationsService.findAvailable()` consulta quais turmas o viewer tem acesso via `TurmasService.accessibleTurmaIds()`.

## Por que não um campo no User

- Um aluno pode pertencer a mais de uma turma (irmãos em anos diferentes, turma de reforço, etc.).
- Remover um aluno de uma turma seria um UPDATE no User — com tabela de associação é um DELETE em `TurmaMembership`, sem tocar no histórico do usuário.
- Rastrear por qual convite cada aluno entrou é trivial com o campo `inviteId` na tabela de associação.

## Convite como mecanismo de entrada

O token de convite viaja no link mas nunca é armazenado em texto: apenas o hash SHA-256 fica no banco (mesmo raciocínio do ADR 001). O convite pode ter:
- Data de expiração (`expiresAt`)
- Limite de usos (`maxUses`)
- Possibilidade de revogação (`revokedAt`)

O convite cria o `TurmaMembership`; é o membership — não a posse do link — que autoriza o acesso.

## Consequência

Queries de listagem de simulados precisam verificar membership, o que adiciona uma subconsulta. O impacto é controlado por índices em `TurmaMembership.userId` e `Simulation.turmaId`.

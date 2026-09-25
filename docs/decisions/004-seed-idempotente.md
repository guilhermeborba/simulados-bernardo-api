# ADR 004 — Seed idempotente (upsert), não truncate-and-rebuild

**Data:** 2026-09-25
**Status:** vigente

## Contexto

O banco já tem dados de produção (tentativas, usuários, histórico). Precisávamos de uma forma de adicionar novos simulados sem apagar o que existe. Havia duas abordagens:

1. Truncar as tabelas e recriar tudo a cada seed.
2. Fazer upsert: inserir se não existir, ignorar se já existir.

## Decisão

O seed usa upsert em todas as entidades, identificando duplicatas por chaves naturais:

- `Discipline`: pelo `slug`
- `Simulation`: por `(disciplineId, schoolYear, bimester, assessment)` — ou pelo `slug` quando explicitamente definido
- `Question`: por `(simulationId, sortOrder)`
- `QuestionOption`: por `(questionId, optionKey)`
- `QuestionAnswer`: por `(questionId, answerKey)`

O script pode ser executado quantas vezes quiser sem efeitos colaterais.

## Por que não truncar

Truncar apagaria tentativas (`Attempt`), respostas (`AttemptAnswer`) e o histórico de desempenho de alunos reais. Isso é inaceitável em produção — o histórico do aluno é o produto principal da plataforma.

## Validação sem gravar

```bash
SEED_DRY_RUN=true ts-node --transpile-only prisma/seed.ts
```

O dry-run lê e valida todos os arquivos de questões sem abrir transação no banco. Útil para CI ou para conferir um novo arquivo antes de subir.

## Usuário técnico do seed

O seed cria um usuário `seed-importer@simulados.local` com status `INACTIVE` para preencher o campo `createdById` dos simulados importados. Esse usuário nunca consegue fazer login (status INACTIVE bloqueia autenticação).

## Consequência

Alterar o enunciado ou as alternativas de uma questão já existente exige atualizar o arquivo seed **e** rodar o seed novamente — o upsert aplicará as mudanças. Isso é intencional: o arquivo de seed é a fonte de verdade do conteúdo pedagógico.

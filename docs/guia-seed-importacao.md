# Guia de Seed e Importação

## Objetivo

Importar os dados atuais do front-end para o banco do backend de forma idempotente.

## Origem dos dados

O seed usa `FRONTEND_DATA_DIR`.

Valor padrão:

```bash
../simulados-bernardo/data
```

## Validação sem banco

```bash
npm run seed:dry-run
```

Resultado esperado com a base atual:

```text
5 disciplinas, 15 simulados e 449 questões carregadas.
```

## Execução real

Com `DATABASE_URL` configurado e migrations aplicadas:

```bash
npm run seed
```

## Idempotência

- Disciplinas usam `slug`.
- Simulados usam `slug`.
- Questões usam `simulationId + sortOrder`.
- Alternativas e gabaritos são recriados por questão.
- Questões removidas da origem são marcadas como inativas com soft delete.

## Segurança

- Gabaritos são gravados em `QuestionAnswer`.
- Gabaritos não são retornados por endpoints públicos.
- O usuário técnico `seed-importer@simulados.local` é inativo.

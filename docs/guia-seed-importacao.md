# Guia de Seed e Importação

## Objetivo

Importar os dados atuais do front-end para o banco do backend de forma idempotente.

## Origem dos dados

O seed usa `FRONTEND_DATA_DIR`.

Valor padrão:

```bash
prisma/seed-data
```

## Validação sem banco

```bash
npm run seed:dry-run
```

Resultado verificado no commit base de 12/10/2026:

```text
19 disciplinas, 588 simulados e 17.684 questões carregadas.
Backlog editorial: 192 simulados não importados.
```

Para contagens por faixa, conteúdo pendente e critérios de promoção, consulte [inventário do acervo](inventario-acervo.md). `npm run seed:inventory` gera um resumo; `npm run --silent seed:inventory:json` gera metadados sem gabarito. A validação falha se um arquivo publicável estiver ausente ou inválido. Entradas explicitamente planejadas em `prisma/seed-backlog.ts` não são importadas, mesmo que seu arquivo esteja presente; exigem revisão e promoção manual.

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

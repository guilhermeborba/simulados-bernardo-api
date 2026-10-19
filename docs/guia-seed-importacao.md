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

Resultado verificado em 19/10/2026 (2EM e 3EM promovidos do backlog):

```text
Dry run concluído: 19 disciplinas, 780 simulados e 23444 questões carregadas. Backlog editorial: 0 simulados não importados. Temas: 0 de 23444 questões; 0 de 780 simulados com todas as questões classificadas.
```

A última frase mede a cobertura de temas (ver abaixo). `npm run --silent seed:inventory:json` traz a mesma contagem por simulado (`themedQuestionCount`) e por ano (`importableThemedQuestions`).

Para contagens por faixa, conteúdo pendente e critérios de promoção, consulte [inventário do acervo](inventario-acervo.md). `npm run seed:inventory` gera um resumo; `npm run --silent seed:inventory:json` gera metadados sem gabarito. A validação falha se um arquivo publicável estiver ausente ou inválido. Entradas explicitamente planejadas em `prisma/seed-backlog.ts` não são importadas, mesmo que seu arquivo esteja presente; exigem revisão e promoção manual.

## Tema das questões

Cada questão aceita `theme`, opcional: o assunto da questão, usado no resultado por tema do Giz. Texto de 1 a 120 caracteres; o seed recusa vazio, só espaços ou valor que não seja texto.

```ts
{
  id: 1,
  type: "multiple_choice",
  text: "Quanto é 1/2 + 1/4?",
  theme: "Frações",
  // ...
}
```

Use o vocabulário de [temas editoriais](temas-editoriais.md), para que o mesmo assunto tenha o mesmo nome em todos os simulados. Remover `theme` do arquivo **não** apaga o tema já gravado (mesma regra de `tip` e `funFact`); para trocar, grave o novo nome. Tentativas já iniciadas guardam o tema da época no snapshot e não mudam.

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

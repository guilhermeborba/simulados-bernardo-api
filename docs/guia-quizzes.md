# Quizzes — contratos e migração do lote 03

A API já oferece autoria ADMIN, versões, início/retomada e leitura de snapshots privados. Confirmar respostas, mostrar feedback e concluir o quiz são entregas do lote 04. Importação editorial/mídia são do lote 05 e telas/BFF web do lote 06. Não há catálogo de quizzes semeado nesta entrega.

## Rotas implementadas

Todas usam JWT. Gestão usa também RolesGuard/ADMIN; tentativas usam STUDENT.

| Rota | Comportamento |
|---|---|
| `GET /quizzes/available` | Metadados da última versão publicada e autorizada de cada chave lógica |
| `GET /quizzes` | ADMIN lista versões não excluídas |
| `POST /quizzes` | ADMIN cria versão 1 em DRAFT com questões aninhadas |
| `GET/PATCH/DELETE /quizzes/:id` | ADMIN consulta, edita rascunho nunca publicado ou faz soft delete |
| `PATCH /quizzes/:id/publish` | ADMIN valida conteúdo, referências e publica o rascunho |
| `PATCH /quizzes/:id/archive` | ADMIN retira a versão publicada do catálogo |
| `POST /quizzes/:id/versions` | ADMIN clona a fonte para próxima versão DRAFT |
| `POST /quizzes/:id/attempts` | STUDENT inicia ou retoma a tentativa aberta; aceita ID ou slug |
| `GET /attempts/:id` | Dono/ADMIN consulta metadados, sem snapshots privados |
| `GET /attempts/:id/questions` | Dono/ADMIN recebe enunciado, dica, opções e resposta própria a partir do snapshot |
| `GET /me/quiz-attempts` | STUDENT consulta seu histórico de prática separado de simulados |

Filtros de catálogo: `discipline` (slug), `schoolYear` (inteiro -2 a 12) e `topic`. Sentinelas atuais: -1 Infantil 4, -2 Infantil 5, 0 Enfermagem, 1–9 Fundamental e 10–12 Médio. Filtro de ano não é autorização de turma. Valores Decimal são serializados como strings, como no contrato existente de tentativas.

## Exemplo de criação

Use um `disciplineId` existente, sem criar novas disciplinas. Os IDs do exemplo são ilustrativos.

```json
{
  "activityKey": "quantidades-3ano-primeiros-passos",
  "disciplineId": "id-da-disciplina-existente",
  "schoolYear": 3,
  "topic": "Quantidades",
  "title": "Brincando com quantidades",
  "estimatedDurationMinutes": 5,
  "questions": [
    {
      "originKey": "soma-um-mais-um",
      "statement": "Quanto é um mais um?",
      "explanation": "Somamos uma unidade com outra e temos duas unidades.",
      "tip": "Conte as unidades.",
      "points": 1,
      "options": [
        { "optionKey": "A", "text": "Uma unidade" },
        { "optionKey": "B", "text": "Duas unidades" }
      ],
      "correctAnswer": "B"
    }
  ]
}
```

`correctAnswer` é apenas entrada administrativa, nunca resposta de API. A resposta ADMIN contém as questões e explicações sem gabarito; a resposta de catálogo contém apenas metadados. Antes de confirmação, o aluno não recebe explicação, curiosidade, mídia ou respostas oficiais.

São permitidas 1–50 perguntas com 2–8 alternativas, pontos positivos com duas casas decimais e soma até 9999,99. `originKey` deve ser único no quiz e preservado entre versões quando representa a mesma pergunta. Opções com chaves iguais desconsiderando maiúsculas/minúsculas são recusadas. O servidor calcula `totalQuestions`, `maxScore`, ordem, slug e versão. Campos desconhecidos, mídia, bimestre e AV são recusados; números do body JSON devem ser números, sem coerção de booleanos/string. Em PATCH de rascunho, `subtitle`, `turmaId` e `estimatedDurationMinutes` aceitam `null` para limpeza; campos obrigatórios não aceitam `null`. Substituir `questions` substitui o conjunto ativo do rascunho, mantendo os registros anteriores com soft delete.

Criar uma versão mantém a original. Após publicar, editar conteúdo exige `POST /quizzes/:id/versions`, PATCH no novo rascunho e publicação. Arquivar permite retomar uma tentativa aberta autorizada, mas impede criar uma nova naquela versão. Acesso atual à turma e disciplina é revalidado ao iniciar, retomar e ler questões. As rotas antigas de Simulation/Question não gerenciam quizzes.

## Auditoria e aplicação da migração

Antes de aplicar em um ambiente existente, execute a consulta somente de leitura no banco escolhido pelo operador:

```sql
SELECT "studentId", "simulationId", COUNT(*) AS open_attempts,
       ARRAY_AGG(id ORDER BY "createdAt") AS attempt_ids
FROM "Attempt"
WHERE status = 'IN_PROGRESS'
GROUP BY "studentId", "simulationId"
HAVING COUNT(*) > 1;
```

Resultado vazio permite prosseguir. Se houver duplicados, analise respostas, datas e histórico e registre a decisão de regularização. A migration não escolhe uma tentativa para descartar; não execute o script de limpeza automaticamente para contornar a auditoria. A aplicação bloqueia novas inserções enquanto audita/cria o índice e aborta integralmente se a condição persistir.

No ambiente autorizado, depois de auditoria e backup conforme o procedimento operacional existente:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

Se Prisma registrar essa migration como falha e o schema estiver comprovadamente sem alterações, após resolver a causa marque somente essa migration como revertida antes de repetir deploy:

```bash
npx prisma migrate resolve --rolled-back 20261012180000_quiz_versions_and_attempt_snapshots
npx prisma migrate deploy
```

Essa regularização é uma ação operacional explícita. Os testes aplicam migrations somente em PostgreSQL descartável; a implementação não aplicou migrations nem seed em nenhuma base existente. Preserve as constraints SQL e o índice parcial em futuras migrations.

## Verificação

```bash
npm run lint
npm run test -- --runInBand
npm run build
npm run seed:dry-run
npm run test:integration
```

O runner cria e remove um PostgreSQL próprio. A suíte inclui migração sobre legado populado, rollback/diagnóstico de duplicatas, criação e versão concorrentes, snapshots estáveis, rollback de falha ao gravar snapshots, isolamento de relatórios/ranking, turma/owner e regressão dos simulados. Uma suíte limita o pool a uma conexão para verificar início concorrente de simulado privado sem espera por uma segunda conexão. CI executa as mesmas suítes contra o serviço PostgreSQL de teste, com a guarda de URL do [guia de regressão](guia-ci-regressao.md).

# Operação de missões e XP

Atualizado em **13/10/2026**. O lote 07 implementou missões, saldo de XP por conta e Aprender hoje; o lote 08 acrescentou [avatar, coleções e conquistas](guia-colecoes-conquistas.md), e o lote 09 separou [prática NORMAL de REVIEW](guia-habilidades-revisao.md). Quizzes, habilidades e missões preparados não são automaticamente aprovados ou publicados. Os 30 rascunhos semanais continuam com revisão `PENDING`.

## Regra de XP

Uma conclusão completa de quiz em modo NORMAL concede 10 XP na primeira prática de cada activityKey por aluno/dia, até 50 XP/dia. O dia usa America/Sao_Paulo. Uma versão nova do mesmo quiz não concede outro XP no mesmo dia; uma nova prática no dia seguinte é elegível. Acertar ou errar afeta apenas o resultado do quiz. A missão não acrescenta bônus de XP neste piloto.

O resultado de quiz possui reward:

```json
{"xpAwarded":10,"reason":"AWARDED","day":"2026-10-12"}
```

reason pode ser AWARDED, ALREADY_REWARDED, DAILY_LIMIT, LEGACY ou REVIEW. O resultado mantém essa decisão quando finish é reenviado ou o resultado é consultado depois. LEGACY possui day nulo e zero XP para conclusões anteriores à feature. REVIEW também devolve day nulo e zero XP, sem registrar progresso de missão ou novos itens. Nenhum saldo é retirado por ficar sem praticar.

## Curadoria semanal nas 15 faixas

```bash
npm run seed:missions:dry-run
MISSION_WEEK_START=2026-10-12 npm run --silent seed:missions:inventory:json > /tmp/mission-drafts.json
```

A data precisa ser uma segunda-feira. Sem variável, o exportador considera a semana atual de São Paulo. A execução valida 30 rascunhos, duas posições por faixa, e 45 referências de quiz. Nenhum banco é consultado e nenhuma atividade é publicada. O inventário contém payloads para autoria, títulos e estado editorial dos quizzes, sem perguntas ou gabaritos.

Um ADMIN ativo revisa os textos/referências e utiliza POST /missions para criar DRAFT. Exemplo de corpo, após escolher referências reais do catálogo:

```json
{
  "title": "Explorar e descobrir",
  "description": "Observe as pistas e experimente uma ideia de cada vez. Você pode continuar depois.",
  "segment": "FUNDAMENTAL_I",
  "schoolYear": 3,
  "weekStart": "2026-10-12",
  "slot": 1,
  "activityKeys": ["fundamental-3-agua-em-viagem", "fundamental-3-grupos-e-partilhas"]
}
```

Segmentos: INFANTIL (-1/-2), FUNDAMENTAL_I (1–5), FUNDAMENTAL_II (6–9), MEDIO (10–12) e ENFERMAGEM (0). slot aceita 1 ou 2; cada missão contém de uma a cinco atividades distintas e ordenadas. turmaId é opcional: missão pública só aceita quizzes públicos; missão de turma pode reunir quizzes públicos e privados dessa mesma turma.

GET /missions consulta autoria. PATCH /missions/:id substitui campos de DRAFT, inclusive activityKeys. PATCH /missions/:id/publish verifica conteúdo e ocupa a posição semanal; rascunhos com quizzes indisponíveis falham. Publicar duas missões para a mesma posição retorna conflito, inclusive sob concorrência. PATCH /missions/:id/archive encerra a exposição e permite publicar um substituto. Missões publicadas são imutáveis e o histórico é conservado.

Cada semana abre segunda-feira 00:00 e encerra na seguinte 00:00 em São Paulo, com fim exclusivo. Publicar no meio da semana não contabiliza conclusões anteriores. Só conclusões NORMAL novas durante a janela e após a publicação registram progresso; REVIEW não completa etapas. Retirar acesso à turma ou tornar um quiz indisponível oculta a missão inteira; substituir conteúdo deve ocorrer antes da publicação ou por uma nova missão.

## Contratos do aluno

GET /me/learning-home e GET /me/missions exigem STUDENT ativo. Aceitam schoolYear opcional; prevalece ano da query, depois preferência e depois cadastro escolar. A primeira resposta inclui schoolYear resolvido, xp, inProgress, missions e suggestedQuiz. Missões têm estado AVAILABLE, IN_PROGRESS ou COMPLETED, contador de etapas e referências autorizadas para iniciar/rever o quiz. Na ausência de faixa, missões/sugestão ficam vazias; saldo e retomada continuam disponíveis.

Aprender hoje na home web consulta esses contratos pelo BFF. Alterações de faixa ficam salvas na conta. A web apresenta valores do servidor e limpa o progresso ao trocar de sessão; nenhuma concessão é calculada no navegador. XP é apresentado separado das notas e a interface permite pausar sem perder progresso.

## Validação e implantação

npm run test:integration valida a cadeia de migrations e os contratos com Nest/PostgreSQL descartável. A regressão inclui concorrência, virada UTC/São Paulo, versões, teto, rollback, autorização e curadoria. Na web, test:e2e e test:browser exercitam Next/BFF/API com fixtures sintéticas e banco isolado. O CI web fixa o commit compatível da API.

Aplicar migrations em ambiente existente e publicar conteúdo são operações separadas. As validações dos lotes 01–10 aplicaram migrations somente em bancos descartáveis, sem seed, aprovação editorial ou deploy em produção. Use `prisma migrate deploy` no procedimento operacional, conforme o [guia de deploy](guia-deploy.md). Consulte [ADR 011](decisions/011-missoes-semanais-e-xp-transacional.md) e o [plano de evolução](superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md).

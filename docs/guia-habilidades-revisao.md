# Habilidades, progresso e revisão

Na web, **Meu progresso** abre `/progresso`. Escolha ano/idade, consulte os três grupos de registros e use **Começar revisão**. A sessão tem até cinco perguntas; perguntas praticadas são identificadas. Pausar e retomar conserva as confirmações. O resultado informa revisão concluída e ausência de XP.

## Contratos

| Endpoint | Acesso | Comportamento |
|---|---|---|
| `GET /me/learning-progress?schoolYear=3` | Aluno ativo | Habilidades com primeiras respostas, repetições, revisões, evidência e até três sugestões autorizadas |
| `POST /me/review-attempts` | Aluno ativo | Corpo estrito `{ "quizId": "id" }`; seleção no servidor ou retomada de REVIEW aberto |
| `POST /learning-skills` | ADMIN ativo | Código interno, versão consecutiva, título, descrição, disciplina e faixa; cria DRAFT |
| `GET /learning-skills` | ADMIN ativo | Catálogo editorial, status e registros de revisão |
| `PATCH /learning-skills/:id/publish` | ADMIN ativo | Corpo obrigatório `{ "reviewConfirmed": true }`; registra revisor/data |
| `PATCH /learning-skills/:id/archive` | ADMIN ativo | Bloqueia classificação em novos inícios e novas sugestões; preserva histórico |

`schoolYear` aceita -2/-1 (Infantil 5/4 anos), 1–9, 10–12 (Médio), 0 (Enfermagem). Sem parâmetro, usa preferência e depois perfil; sem ambos não inventa faixa. Contagem sem classificação é histórica e geral. `inProgressReview` permite retomar a revisão autorizada mais recente.

O progresso não devolve respostas oficiais. `skills[].firstResponse`, `repeat` e `review` têm contagens separadas; `evidence` é INSUFFICIENT antes de cinco primeiras respostas distintas e OBSERVED depois. OBSERVED significa registros iniciais disponíveis, sem afirmar domínio. A identidade de pergunta inclui atividade e origem; outra versão/habilidade não reinicia a primeira observação. Uma pergunta vista primeiro em revisão conta como repetição quando reaparece em NORMAL.

Autoria de quiz aceita `questions[].skill: {code, version}`. A habilidade deve existir e ter a mesma disciplina/faixa. DRAFT permite preparar conteúdo; publicação exige todas as habilidades usadas publicadas e revistas. Clonar versão conserva os vínculos. Versões publicadas são imutáveis.

Tentativas retornam `practiceMode`. Perguntas públicas retornam `practicedBefore`; snapshots de habilidade permanecem privados. Confirmação, mídia, conclusão e resultado usam os endpoints existentes de tentativa. Revisão indisponível ou sem dificuldade elegível retorna 404; dados extras/tipos inválidos retornam 400. Conta desativada ou com papel divergente do JWT perde acesso à revisão existente.

## Preparação editorial offline

```bash
npm run seed:skills:dry-run
npm run --silent seed:skills:inventory:json > /tmp/habilidades-inventario.json
```

Esses comandos não conectam ao banco. Validam `prisma/learning-skill-data.json` contra o catálogo de quizzes: 45 propostas, 213 classificações, 15 faixas. O inventário não contém enunciados ou gabaritos. Propostas têm review PENDING; não representam aprovação curricular ou clínica.

Em um ambiente explicitamente autorizado, após importar os quizzes como rascunhos íntegros, `SKILL_SEED_AUTHOR_EMAIL` deve identificar um ADMIN ativo para `npm run seed:skills:drafts`. O importador exige hashes/conteúdo exatos e nunca reclassifica quiz publicado. É atômico e repetível enquanto definições e fontes continuam DRAFT sem alterações. Não executamos essa importação em banco existente nesta entrega.

Revisar títulos, objetivos e cada classificação antes de registrar aprovação com data/revisor/hash da proposta atual. O campo APPROVED do arquivo não publica a habilidade automaticamente: a importação continua gerando rascunhos; a publicação administrativa exige confirmação explícita de revisão. Publicar o catálogo de quizzes mantém o gate editorial próprio e verifica as habilidades já publicadas.

## Validação técnica

`npm run test`, `npm run test:integration`, `npm run lint` e `npm run build` verificam domínio e compatibilidade. A integração usa PostgreSQL descartável e conteúdo sintético, incluindo migration sobre histórico populado. Não usa banco existente nem o seed editorial. Testes web estão no guia de CI de cada repositório.

Consulte [ADR 013](decisions/013-habilidades-e-revisao.md). Visões de responsáveis/docentes e recuperação de senha são trabalho do lote 10. Publicação editorial, leitores de tela, pessoas e aparelhos reais continuam pendentes.

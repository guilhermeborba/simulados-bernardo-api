# ADR 013 — Habilidades e revisão

Data: 2026-10-13. Status: lote 09; propostas editoriais aguardam revisão.

## Contexto

Precisamos transformar dificuldades de quizzes em oportunidades de prática e mostrar os limites dos registros disponíveis. Repetir uma pergunta, ganhar XP e concluir um simulado representam eventos diferentes.

## Decisão

`LearningSkill` identifica um objetivo interno por código e versão, disciplina e faixa. O escopo permanece estável entre versões; texto publicado é imutável. `QuestionSkill` associa uma habilidade principal a cada pergunta. Publicar exige ADMIN ativo e confirmação explícita de revisão, com autor/data registrados. Autoria pode usar rascunhos; publicar um quiz classificado exige habilidades publicadas e revistas. O importador editorial de quizzes respeita a mesma regra.

O catálogo inicial propõe 45 habilidades e classifica as 213 perguntas dos 45 quizzes, nas 15 faixas. São objetivos internos amplos, sujeitos à revisão humana; não afirmam equivalência à BNCC. Os hashes vinculam proposta e classificação à versão exata do conteúdo. Todos permanecem PENDING. Importação explícita prepara somente rascunhos íntegros, em transação; não promove revisão ou publicação.

O início salva código, versão, título, disciplina e faixa da habilidade no snapshot privado. Somente classificação publicada, revista e compatível é registrada. Uma habilidade arquivada não classifica novos inícios; seu snapshot histórico permanece. Histórico sem classificação continua sem classificação, mesmo depois de catalogar a pergunta.

Progresso usa respostas confirmadas de tentativas FINISHED e separa primeira resposta NORMAL, repetição NORMAL e REVIEW. A identidade lógica é `activityKey + originKey`, compartilhada entre versões e modos. Uma pergunta vista primeiro em revisão ou sem classificação não vira primeira resposta ao reaparecer em uma rodada normal. Cinco primeiras respostas distintas permitem a mensagem de registros iniciais disponíveis; isso não afirma domínio. Abaixo disso, mostramos evidência insuficiente. Contadores de revisão e repetição não promovem esse estado.

Uma dificuldade usa a última confirmação de cada pergunta lógica nos últimos 30 dias. Uma resposta posterior correta resolve essa dificuldade, inclusive em revisão. A revisão escolhe no servidor até cinco perguntas de um único quiz atual publicado e autorizado, sobre a mesma habilidade revista e faixa. O quiz pode diferir daquele em que houve o erro. Perguntas nunca vistas nessa atividade têm prioridade, seguidas de outras perguntas praticadas e das perguntas erradas repetidas. O snapshot marca `practicedBefore`.

`Attempt.practiceMode` separa NORMAL de REVIEW. O índice permite uma tentativa aberta de cada modo por aluno/versão. Reenvio de início retoma a tentativa desse modo; snapshots e confirmação idempotente são compartilhados com o motor existente. Novos inícios exigem publicação atual; uma revisão já aberta pode terminar após arquivamento, enquanto acesso à atividade e turma continuam válidos. Leituras e escritas de revisão verificam status e papel atuais do usuário; um JWT de ADMIN antigo não conserva acesso após mudança de papel.

REVIEW nunca grava recibo de conclusão gamificada, XP, progresso de missão ou concessão de item. O resultado deriva a decisão estável `{xpAwarded:0, reason:'REVIEW', day:null}` do modo persistido. NORMAL conserva as regras anteriores. Relatórios, desempenho e ranking de avaliação continuam filtrando SIMULATION. O progresso pessoal preserva estatísticas históricas próprias sem expor perguntas, gabaritos ou sugestões privadas após revogação.

## Migração e limites

A migration `20261013020000_skills_review` acrescenta tabelas e campos, deixa tentativas existentes em NORMAL e snapshots sem habilidade. Não atribui classificação, XP ou revisão retroativa. A unicidade aberta inclui o modo; constraints exigem identidade para REVIEW e metadados de habilidade completos ou ausentes.

A primeira entrega agrega evidências na consulta; não há cache de domínio, diagnóstico pedagógico ou adaptação automática de dificuldade. Expandir a classificação de simulados exige outro lote editorial. Visões de responsável/professor e recuperação de senha pertencem ao lote 10. Revisão editorial e avaliação com pessoas, leitor de tela e aparelhos reais permanecem pendentes.

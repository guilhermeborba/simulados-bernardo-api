# ADR 007 — Quizzes versionados e snapshots privados

Data: 2026-10-12. Status: aceito e implementado no lote 03.

## Contexto

Os quizzes precisam de explicação pedagógica e conteúdo estável durante a prática. O sistema existente usa Simulation/Question/Attempt para avaliação e vários endpoints retornam Attempt diretamente. Acrescentar gabarito ao próprio Attempt exporia conteúdo oficial em históricos e relatórios. Uma mudança editorial também não pode mudar a atividade já iniciada.

## Decisão

Reutilizar as tabelas existentes e acrescentar `Simulation.activityKind`, com default `SIMULATION`. Quizzes têm tema, `activityKey` lógico e `contentVersion` positivo, sem bimestre/AV artificiais. Uma constraint SQL exige bimestre/avaliação em simulados, preservando os sentinelas existentes, e os proíbe em quizzes. Os contratos antigos continuam exigindo seus campos e filtram `SIMULATION`, inclusive em relatórios, ranking, contagens e ferramentas de seed/limpeza.

`QuizzesModule` controla rascunhos e publicações por ADMIN. A primeira versão é 1; `POST /quizzes/:id/versions` copia o conteúdo autorizado para uma nova versão DRAFT e preserva `originKey` das perguntas. A chave lógica não muda. Conteúdo que já teve `publishedAt` não pode ser editado nem republicado após arquivamento; uma correção editorial exige outra versão. O catálogo mostra a maior versão publicada autorizada por chave lógica; criar rascunho não esconde a versão publicada anterior.

No início do quiz, a mesma transação cria Attempt e `AttemptQuestionSnapshot`. Cada snapshot guarda identidade da pergunta, conteúdo, opções, ordem, pontos, dica, curiosidade, explicação e respostas oficiais. `Attempt.activityKey/contentVersion` identifica a prática; `maxScore` é a soma decimal dos pontos copiados. Os snapshots são privados: endpoints do aluno selecionam explicitamente campos permitidos e reconstroem opções JSON por uma lista de campos. Explicação, curiosidade, mídia e gabarito aguardam o contrato seguro de confirmação do lote 04.

Iniciar, editar, publicar, arquivar e excluir usam lock na linha da atividade. Retomar reutiliza a tentativa aberta e seus snapshots. Um índice parcial garante uma única tentativa `IN_PROGRESS` por aluno/versão de atividade, incluindo simulados. Versões diferentes possuem IDs diferentes e podem ter tentativas distintas; a futura elegibilidade de XP utilizará a identidade lógica. Alocar versões usa advisory lock por `activityKey`. Ler questões de quiz usa a mesma transação/conexão para checar visibilidade atual, turma e snapshots, com lock compartilhado na atividade.

## Acesso e limites desta entrega

Nova tentativa exige quiz publicado, disciplina ativa e acesso atual à turma. Um quiz arquivado admite retomada da tentativa aberta existente. Exclusão lógica do quiz/turma/disciplina, desativação da disciplina e perda de membership bloqueiam leitura e retomada sem apagar o histórico. Acesso a tentativa é do próprio aluno ou ADMIN; um resumo pessoal não concede acesso às questões. Professor precisa de membership para catálogo de quiz privado enquanto não existir o vínculo docente-turma previsto no plano. Conteúdo inacessível retorna 404; tentativa de outro aluno retorna 403.

O lote 03 aceita somente múltipla escolha, com explicação obrigatória, chaves de opções inequívocas e gabarito correspondente. O schema reserva `Question.media`, mas DTOs rejeitam mídia e publicação/início recusam conteúdo com mídia até a política de armazenamento e autorização do lote 05. Confirmação, feedback e conclusão de quiz são do lote 04: os endpoints antigos de resposta/finish/result rejeitam quizzes para impedir correção pelo conteúdo vivo da simulação.

## Migração e consequências

A migration usa um único bloco PostgreSQL `DO`: lock, auditoria e DDL são atômicos, e o erro original fica visível ao Prisma. Se já existirem tentativas abertas duplicadas, aborta antes de mudar o schema e informa a quantidade de grupos/tentativas. Nenhum registro é excluído ou abandonado automaticamente. O operador deve analisar os duplicados, decidir a regularização preservando evidências e somente então repetir a migração, conforme o [guia](../guia-quizzes.md).

Snapshots aumentam armazenamento para garantir estabilidade. Não há backfill de snapshots de simulados: seu comportamento e regra de correção atual permanecem. A unicidade parcial e as constraints condicionais são SQL adicional e precisam continuar presentes em migrations futuras; `prisma db push` não substitui essa cadeia. Nenhuma base existente ou deploy foi alterado pela implementação.

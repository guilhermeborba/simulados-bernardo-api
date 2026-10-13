# ADR 011 — Missões semanais e XP transacional

Data: 2026-10-13. Status: implementado no lote 07; validação editorial e de uso pendente.

## Contexto

Quizzes já possuem versões imutáveis, snapshots e conclusão idempotente. A plataforma precisa de prática orientada por segmento, ano e turma, com progresso entre dispositivos. XP deve registrar a prática sem modificar notas, médias ou ranking de simulados. Conteúdo preparado ainda está em revisão; a evolução técnica não autoriza sua publicação.

## Decisão

O módulo Learning organiza missões semanais e a concessão de XP. A primeira conclusão de um quiz lógico por aluno e dia concede 10 XP, até 50 XP por dia. O dia e a semana usam America/Sao_Paulo. Acertos não condicionam a concessão: a correção permanece independente. Uma versão nova conserva activityKey e não reinicia a elegibilidade diária. O piloto não concede bônus extra por terminar uma missão.

XpEvent guarda somente concessões positivas, com unicidade por aluno/atividade lógica/dia e por tentativa. QuizCompletionReward registra a decisão dessa conclusão, inclusive zero por repetição ou teto. finish e a consulta de resultado devolvem a mesma decisão gravada mesmo em outro dia. Tentativas concluídas antes desta entrega retornam LEGACY/zero; não existe backfill de XP.

A transação de finish valida o acesso, confirma que todas as respostas estão bloqueadas, calcula o resultado e serializa as concessões por aluno antes de consultar o teto. Resultado, ledger, decisão de recompensa e progresso das missões são gravados na mesma transação. O mutex usa `User FOR NO KEY UPDATE`, compatível com o `KEY SHARE` das chaves estrangeiras ao iniciar outra atividade; isso evita o ciclo de espera entre início e conclusão. As versões de todas as atividades da missão recebem `FOR SHARE` em ordem de ID, e a disponibilidade é reconsultada antes de registrar progresso. A escolha segue os [locks de linha do PostgreSQL](https://www.postgresql.org/docs/16/explicit-locking.html#LOCKING-ROWS). Conclusões simultâneas de quizzes diferentes não podem ultrapassar o teto. Falhas em qualquer gravação desfazem a conclusão inteira; repetir a requisição é seguro.

Mission define duas posições editoriais por segmento/ano/turma/semana. MissionActivity referencia a identidade lógica do quiz e sua ordem. MissionProgress e MissionActivityCompletion registram o progresso por aluno e por etapa, com unicidade própria e tentativa de origem. Uma conclusão pode avançar mais de uma missão vigente que contenha a atividade, sem conceder XP adicional.

As missões abrem na segunda-feira à meia-noite e encerram na segunda seguinte no fuso definido. Apenas conclusões posteriores à publicação e dentro dessa janela contam para a missão; nenhuma conclusão passada é importada. Quem entra durante a semana pode realizar as missões atuais. Após a janela, a prática continua regida pela disponibilidade do quiz e sua regra normal de XP, sem alterar a missão encerrada. Não há perda de saldo por ausência.

A autoria é exclusiva de ADMIN ativo. Rascunhos são editáveis; publicação valida segmento/ano, janela, turma e disponibilidade de todas as atividades. Conteúdo publicado é imutável: arquivar e publicar um substituto preserva o histórico. Índices parciais garantem uma missão publicada por posição, distinguindo público e turma mesmo com turmaId nulo. Uma missão com qualquer atividade indisponível fica inteira fora da projeção do aluno. Preferências escolhem a faixa e não concedem acesso a turma.

GET /me/learning-home retorna faixa resolvida, saldo total e diário, tentativa de quiz em andamento autorizada, missões e sugestão. GET /me/missions retorna a mesma projeção de missões. O ano explícito prevalece sobre preferências, que prevalecem sobre o perfil escolar. Sem faixa, missões e sugestão ficam vazias. Esses contratos exigem STUDENT ativo e nunca retornam gabaritos ou dados de outra conta.

## Curadoria e medição

O exportador offline propõe 30 rascunhos, dois para cada uma das 15 faixas, referenciando os 45 quizzes preparados. Todos permanecem PENDING. Ele não conecta ao banco nem publica; a equipe revisa textos e referências e cria as missões pelos contratos administrativos. A publicação exige que os quizzes já estejam publicados e disponíveis para o público da missão.

MissionProgress e suas conclusões permitem medir a primeira etapa realizada e a missão concluída; o ledger permite observar conclusões elegíveis e prática adicional pelas decisões de recompensa. Esses registros são internos, sem novo rastreamento externo nem conteúdo de respostas em logs. A intenção de iniciar pela missão não é registrada separadamente de uma prática livre do mesmo quiz. Avaliação de retorno, instrumentação de início, definição das métricas de produto e sessões com pessoas continuam pendentes. Avatar, coleções e conquistas pertencem ao lote 08.

## Consequências

A migration cria tabelas e relações adicionais, sem alterar pontuação histórica ou preencher recompensas. Testes usam PostgreSQL descartável e conteúdo sintético. O lançamento depende de curadoria, publicação e validação humana nas faixas previstas. Parâmetros do piloto estão centralizados no backend; mudar a regra requer preservar as decisões de conclusões já gravadas.

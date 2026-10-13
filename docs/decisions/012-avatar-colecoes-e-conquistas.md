# ADR 012 — Avatar, coleções e conquistas

Data: 2026-10-13. Status: lote 08; validação editorial e de uso pendente.

## Contexto

Missões e XP registram a prática em quizzes com conclusão transacional. Precisamos de personalização entre dispositivos, com apresentação adequada às 15 faixas e recompensas cosméticas que não alterem notas, ranking ou saldo de XP.

## Decisão

O catálogo é pequeno, versionado no código e servido pela API. São cinco conquistas: primeiro quiz lógico concluído; três temas distintos; cinco quizzes lógicos distintos; primeira missão concluída; 100 XP acumulados. Cada conquista libera um item. `inicio` é o item inicial disponível para todas as contas de aluno, mesmo antes de persistir uma seleção.

Uma conclusão conta quando possui `QuizCompletionReward`, inclusive quando registra zero XP por repetição ou teto. Cada `activityKey` conta uma vez; publicar outra versão não cria uma atividade adicional. O tema vem da primeira conclusão registrada daquela atividade, normalizado com trim e lowercase e combinado à identidade da disciplina. Nomes de temas privados, IDs de tentativas e conteúdo de respostas não aparecem no catálogo nem nas estatísticas da coleção. Acertos não condicionam concessões.

`UserAchievement` e `UserAvatarItem` têm unicidade por aluno e identificador de catálogo, data da concessão e referência opcional à tentativa de origem. Remover essa origem não remove o item ou a conquista. Ausência, troca de faixa, arquivamento de conteúdo e perda de acesso a turma não revogam concessões. A exclusão da conta remove seus registros dependentes.

A concessão acontece dentro da transação de conclusão do quiz, depois do progresso das missões, usando o mutex `User FOR NO KEY UPDATE` existente. Erros ao gravar conquistas ou itens desfazem também conclusão, XP e missão. Reenvios não duplicam concessões e preservam o contrato e a resposta de resultado do lote 07. Não há XP adicional por conquista ou item, compras ou gasto de saldo.

`UserAvatar` persiste a seleção e a apresentação `AUTO`, `MASCOT` ou `SEAL`. `GET /me/avatar` devolve seleção e itens com ownership; `PATCH /me/avatar` aceita somente item e/ou apresentação conhecidos. O servidor recusa itens não liberados. Escritas parciais usam o mesmo mutex por aluno para conservar mudanças concorrentes. `GET /me/achievements` devolve regras, progresso limitado à meta, datas de concessão e estatísticas agregadas. Os três contratos exigem aluno ativo e verificam o papel atual no banco.

Na web, `/colecao` permite selecionar itens liberados e salvar uma prévia. `AUTO` acompanha faixa/preferências: Bolinha no Infantil, Capelo no Fundamental I e selos nos segmentos mais velhos. Cada aluno pode escolher explicitamente mascote ou selo. A conta e a geração de sessão identificam requisições e estado; troca de conta cancela respostas pendentes e remove a coleção anterior.

## Histórico e migração

A migração é aditiva e preserva tentativas, notas, decisões de recompensa e XP. Faz backfill apenas de conquistas e itens sustentados por conclusões com recibo do lote 07, missões concluídas e ledger de XP existentes. Datas são derivadas dos registros que cumpriram os critérios. Tentativas anteriores sem recibo não geram progresso retroativo de quiz nem XP. Reaplicar a cadeia não duplica concessões. A seleção inicial permanece `inicio`/`AUTO` até a primeira escolha salva.

## Consequências

Novos itens ou regras exigem uma alteração explícita no catálogo e uma política de preservação das concessões existentes. A coleção oferece personalização individual e não um ranking público. Sua adaptação por faixa não restringe conteúdo ou muda autorização de turma.

A aprovação dos 45 quizzes e a curadoria dos 30 rascunhos de missão continuam pendentes. Testes utilizam conteúdo sintético e PostgreSQL descartável. Revisão com pessoas, leitor de tela e aparelhos reais permanece necessária antes do lançamento.

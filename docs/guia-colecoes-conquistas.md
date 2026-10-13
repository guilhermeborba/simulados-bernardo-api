# Coleção e conquistas — piloto

A coleção registra conquistas e personalização da conta de aluno. Todos os segmentos usam as mesmas regras de progresso; a apresentação se adapta à faixa escolhida.

| Conquista | Critério no servidor | Item liberado |
|---|---|---|
| `FIRST_QUIZ` | Primeiro quiz lógico concluído com recibo | `primeiro-passo` |
| `THREE_TOPICS` | Três temas distintos na primeira conclusão de atividades lógicas | `explorador` |
| `FIVE_QUIZZES` | Cinco atividades lógicas distintas concluídas | `constancia` |
| `FIRST_MISSION` | Primeira missão registrada como concluída | `missao` |
| `XP_100` | 100 XP acumulados no ledger | `horizonte` |

`inicio` está sempre disponível. Os itens são cosméticos e não acrescentam nem consomem XP. Concluir com respostas erradas também conta. Uma versão nova ou a repetição de um quiz não aumenta a quantidade de atividades distintas. Um tema combina disciplina e texto normalizado; a mesma atividade lógica conserva o tema de sua primeira conclusão registrada.

## Contratos

- `GET /me/achievements`: catálogo, regras, progresso, datas e contadores agregados da própria conta.
- `GET /me/avatar`: seleção, apresentações e catálogo de itens com `owned`/`unlockedAt`.
- `PATCH /me/avatar`: um ou ambos os campos `itemId` e `style`; aceita `AUTO`, `MASCOT`, `SEAL`.

Campos extras, nulos, IDs desconhecidos e patch vazio retornam 400. Selecionar item bloqueado retorna 403. Os contratos exigem aluno ativo; mudar a faixa não concede permissões de turma nem muda ownership.

Exemplo de personalização:

```json
{ "itemId": "primeiro-passo", "style": "SEAL" }
```

Na web, use **Minha coleção** em Aprender hoje ou **Ver minha coleção** no resultado do quiz. Escolha apresentação e item liberado, confira a prévia e use **Salvar personalização**. A alteração aparece após confirmação do servidor e permanece em outro navegador autenticado na mesma conta. `AUTO` usa Bolinha no Infantil, Capelo no Fundamental I e selos nos segmentos mais velhos. Pausas não retiram itens.

## Implantação e revisão

A cadeia de migrations inclui `20261013010000_avatar_achievements`. Ela cria tabelas novas e recupera concessões elegíveis dos recibos, missões concluídas e XP já registrados; não muda notas ou saldo e não cria XP retroativo. Tentativas antigas sem recibo ficam fora das contagens de quiz.

Validação local usa `npm run test`, `npm run test:integration`, `npm run lint` e `npm run build`. A regressão integrada web utiliza API compilada, Next de produção e PostgreSQL descartável, com conteúdo sintético. Não execute seeds ou publique conteúdo para validar a coleção.

Revisão editorial e publicação dos quizzes/missões, sessões com pessoas, leitor de tela e dispositivos reais continuam pendentes. Nenhuma compra, ranking público de coleção, envio de foto ou penalidade por ausência faz parte deste piloto.

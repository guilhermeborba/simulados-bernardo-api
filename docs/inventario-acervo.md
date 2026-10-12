# Inventário do acervo de simulados

## Diagnóstico de 12/10/2026

A execução original de `npm run seed:dry-run` na `main` falhou antes de acessar qualquer banco: a primeira referência do seed apontava para `questoes-matematica-3em-b4-av2.ts`, inexistente no repositório. O carregador anterior interrompia a execução nesse primeiro erro e não apresentava o conjunto das pendências.

O inventário agora diferencia conteúdo **publicável no repositório**, conteúdo **planejado** e referências **inválidas**. Publicável significa que arquivo, export, metadados e questões passaram pela validação; não significa que o conteúdo esteja publicado no banco ou em produção.

| Medida | Resultado verificado |
|---|---:|
| Disciplinas já registradas no seed | 19 |
| Arquivos de conteúdo rastreados na main | 584 |
| Referências planas em `seed.ts` | 775 |
| Simulados publicáveis | 588 |
| Questões publicáveis | 17.684 |
| Simulados planejados, excluídos da importação | 192 |

As 775 referências planas têm 583 arquivos disponíveis e 192 ausentes. O arquivo legado `questoes-portugues.ts` acrescenta **cinco** simulados: 1º bimestre AV2; 2º bimestre AV1 e AV2; 3º bimestre AV1 e AV2. Cada um tem 30 questões, conserva o 3º ano e a restrição à `turma-bernardo`. Assim, 584 arquivos produzem 588 simulados. Metadados, slugs explícitos, disciplinas e turmas existentes foram preservados.

| Faixa (`schoolYear`) | Simulados publicáveis | Questões | Planejados |
|---|---:|---:|---:|
| Infantil 4 e 5 (`-1`, `-2`) | 10 | 300 | 0 |
| Técnico / Enfermagem (`0`) | 1 | 75 | 0 |
| Fundamental I (`1` a `5`) | 225 | 6.749 | 0 |
| Fundamental II (`6` a `9`) | 256 | 7.680 | 0 |
| 1ª série EM (`10`) | 96 | 2.880 | 0 |
| 2ª série EM (`11`) | 0 | 0 | 96 |
| 3ª série EM (`12`) | 0 | 0 | 96 |

Na checkout original, em `/home/guilhermeborba/projects/simulados-bernardo-api`, foram encontrados **48 arquivos não rastreados da 2ª série do EM** em produção editorial. Os outros **144 arquivos planejados** ainda não existiam nem nessa checkout em 12/10/2026 (48 da 2ª série e 96 da 3ª). Esse é um retrato local daquela data, não uma consulta ao banco. Os arquivos do usuário foram somente identificados por nome e presença; não foram copiados, editados, adicionados à branch nem publicados.

## Backlog editorial explícito

Todos os 192 registros mantêm seus metadados em `prisma/seed.ts`. O manifesto [seed-backlog.ts](../prisma/seed-backlog.ts) registra cada arquivo pendente, com identificador estável `acervo:<nome-do-arquivo>` e motivo. O relatório JSON devolve o mesmo identificador, slug, export, disciplina, faixa, bimestre, avaliação, restrição de turma e presença de arquivo.

A exclusão da importação decorre desse registro explícito; o carregador **não** ignora automaticamente referências ausentes. Um arquivo publicável ausente é erro e impede o seed. Colocar um arquivo no diretório não promove um item planejado: ele continua `PLANNED`, com `questionCount: null`, fora dos totais e fora dos dados enviados ao banco.

Para promover um item:

1. Concluir autoria e revisão editorial, com conteúdo apropriado à faixa e disciplina já cadastrada.
2. Adicionar deliberadamente o arquivo de conteúdo à branch, preservando o export esperado e a visibilidade de turma.
3. Remover somente esse arquivo da lista `filesAwaitingContent` em `seed-backlog.ts`; os metadados existentes do seed permanecem.
4. Rodar inventário, dry-run e testes; atualizar este retrato quando as quantidades mudarem.
5. Revisar a alteração antes da publicação. Executar o seed real continua sendo uma operação separada.

Não há geração de questões substitutas, publicação de arrays vazios nem exclusão de metadados para esconder as pendências. O seed não arquiva ou remove simulados existentes no banco por estarem no backlog.

## Comandos e CI

```bash
npm run seed:inventory
npm run --silent seed:inventory:json > /tmp/inventario-acervo.json
npm run seed:dry-run
npm run test -- --runInBand prisma/seed-inventory.spec.ts
```

`seed:inventory:json` emite JSON com `schemaVersion: 1`, totais, cobertura por `schoolYear`, todos os registros publicáveis/planejados/inválidos e erros ordenados. A saída não inclui enunciados, dicas, curiosidades, alternativas, gabaritos, credenciais ou caminhos locais absolutos. A ordenação é determinística; nenhum horário de execução é inserido. O relatório contempla os arquivos do diretório explicitamente escolhido, sem depender de Git em tempo de execução. Na CI, ele roda na checkout limpa com somente os arquivos versionados.

`FRONTEND_DATA_DIR` permanece disponível para selecionar outro diretório. Sem essa variável, a origem é `prisma/seed-data` na raiz da execução. Usar um diretório alternativo não transforma conteúdo em publicação nem promove os registros do backlog.

Inventário e dry-run **não instanciam Prisma** e não usam `DATABASE_URL`. A validação ocorre também antes do seed real; qualquer erro impede a primeira escrita no banco. Nenhum seed real foi executado nesta tarefa.

O processo sai com código 1 quando encontra arquivo/export publicável ausente, TypeScript inválido, conteúdo vazio, tipo desconhecido, pontuação inválida, ordens ou alternativas duplicadas, gabarito incompleto/incompatível, slug duplicado, disciplina/turma desconhecida, referência inválida, arquivo/export sem registro ou inconsistência do backlog. Referências de entrada inválidas recebem `INVALID` e não entram nos totais publicáveis. Erros globais também reprovam a execução, mesmo que outras entradas sejam válidas.

A validação respeita os quatro tipos existentes. Em classificação, o servidor aceita mapas de respostas textuais; uma questão antiga do legado de Português usa esse formato. O runner web tem controles C/P e essa limitação de apresentação requer uma evolução própria: o inventário preserva o contrato atual do backend e não reescreve conteúdo editorial.

Os testes cobrem falhas relevantes, o legado, determinismo, promoção deliberada e a ausência de acesso ao banco. A CI gera o JSON em arquivo temporário e reprova falhas, sem rodar `npm run seed`. O relatório pode ser gerado localmente pelos comandos acima.

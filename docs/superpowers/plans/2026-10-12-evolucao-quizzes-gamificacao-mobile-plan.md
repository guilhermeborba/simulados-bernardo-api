# Plano de evolução — quizzes, aprendizagem lúdica e app mobile

Data do planejamento: 2026-10-12
Atualização do estado: 2026-10-13
Status: lotes 01 a 10 implementados e integrados à main; ativação de e-mail real, revisão/publicação editorial e validação humana pendentes; lote 11 em andamento — protótipo e prova automatizada, aceite físico pendente
Escopo confirmado: **todos os públicos desde o primeiro lançamento**.

## 1. Resultado esperado

Transformar o Simulados Bernardo em uma plataforma de prática e avaliação. O aluno escolhe entre um simulado e um desafio curto, recebe orientação para continuar aprendendo e acompanha seu progresso na web e, posteriormente, no app.

A primeira versão de quizzes deve atender Educação Infantil, Fundamental I, Fundamental II, Ensino Médio e Enfermagem. A mesma API sustenta experiências com linguagem e apresentação adequadas a cada segmento. O catálogo inicial terá cobertura mínima de todas as faixas; a ampliação para todas as disciplinas e temas será contínua.

Este documento define entregas, decisões propostas, dependências e critérios de aceite. Os lotes 01–10 registram a implementação técnica entregue; revisão/publicação editorial, ativação e validação humana ainda são critérios de lançamento. O lote 11 tem protótipo e prova automatizada, com aceite físico pendente; o lote 12 permanece planejado. Ele não autoriza deploy ou publicação em lojas.

## 2. Diagnóstico inicial e evolução verificada

O quadro abaixo preserva o diagnóstico inicial de 12/10/2026, anterior às entregas. Não representa pendências atuais: sessões, testes/CI, mídia, preferências de quizzes, vínculo docente e recuperação foram implementados nos lotes 01–10. O estado consolidado e os totais de regressão estão em [PROGRESS.md](../../../PROGRESS.md).

Repositórios inspecionados no início:

- Backend: /home/guilhermeborba/projects/simulados-bernardo-api.
- Web: /home/guilhermeborba/projects/simulados-bernardo.

| Área | Situação encontrada | Consequência para o plano |
|---|---|---|
| Web/API | Login, registro, BFF com cookies httpOnly, catálogo, execução, retomada, resultado, histórico, convite e ranking já existem | Validar e corrigir a integração existente |
| Questões da tentativa | GET /attempts/:id/questions já existe e recupera respostas salvas | Aproveitar a retomada; corrigir a pendência documental antiga |
| Correção | Servidor corrige ao finalizar; respostas podem ser alteradas antes disso | Criar fluxo específico para confirmação e feedback de quiz |
| Tipos de questão | Múltipla escolha, V/F, associação e classificação | Primeira entrega de quizzes usa múltipla escolha; demais tipos entram depois |
| Pontuação | Média da melhor tentativa por simulado, dias seguidos e ranking por turma | XP e recompensas terão regras próprias; quizzes não entram automaticamente nesse ranking |
| Aparência | Trilhas e estilos lúdico/jovem/exame, mascote Bolinha e selo de dias seguidos já existem | Evoluir esses recursos e criar as novas telas |
| Mídia | DTOs e runner atuais são textuais | Incluir imagem, texto alternativo e áudio para Infantil |
| Preferência de trilha | Guardada no localStorage por navegador | Persistir por usuário, especialmente em aparelhos compartilhados e no mobile |
| Sessão web | refreshPromise global sem chave por usuário em authenticatedBackendFetch.server.ts | Corrigir isolamento de sessão antes do lançamento |
| Conteúdo | Lote 02 valida 584 arquivos, 588 simulados e 17.684 questões; 192 entradas de 2ª/3ª série do Médio estão no backlog editorial | Publicar conteúdo pendente somente após revisão e promoção explícita |
| Qualidade | Testes unitários na API; configuração e2e sem suíte implementada; sem CI encontrado | Acrescentar integração real e verificações de regressão |
| Acesso docente | Role TEACHER sem vínculo restritivo completo por turma/aluno | Gestão inicial com ADMIN; liberar relatórios docentes após esse vínculo |
| Recuperação de senha | Ainda não implementada | Entregar antes do beta mobile e da ampliação de adoção |

A inspeção inicial do planejamento foi estática. A execução dos lotes 01 e 02 está registrada abaixo; dry-run do acervo e regressão HTTP das jornadas foram validados. O plano de integração de agosto contém caminhos macOS e um estado anterior ao código atual; não deve ser usado literalmente.

Fontes locais principais: [schema](../../../prisma/schema.prisma), [tentativas](../../../src/modules/attempts/attempts.service.ts), [correção](../../../src/modules/attempts/attempts-correction.service.ts), [pontuação](../../../src/modules/pontuacao/pontuacao.service.ts), [ADR do BFF](../../decisions/002-frontend-bff-com-cookies-httponly.md), [ADR do gabarito](../../decisions/005-gabarito-protegido-no-backend.md). No frontend: PROGRESS.md, components/SimuladoRunner.tsx, lib/questionMapper.ts, lib/trilha.ts, lib/authenticatedBackendFetch.server.ts e app/api/backend/[...path]/route.ts.

### Execução do lote 01 — 12/10/2026

Concluído localmente: isolamento de refresh no BFF por sessão, retenção para 401 tardio, preservação de cookies em falhas temporárias, rotação transacional da API e logout com revogação dos sucessores.

Validação: 25 testes web, 83 unitários da API e 8 testes reais com PostgreSQL descartável passaram. Smoke HTTP nas rotas Next compiladas confirmou isolamento de contas e coordenação entre bundles. Build da API passou; build web passou com fixture local de fontes, após falha do build comum no loader Google Fonts em código não alterado. Não houve deploy nem alteração de bancos/seed existentes.

O coordenador BFF pertence a um processo. Definir coordenação compartilhada ou recuperação de disputa antes de ampliar réplicas. Esse era o limite do lote 01; o lote 10 acrescenta verificação de status/papel/versão no banco e invalida o access antigo no próximo acesso após reset. Ver [ADR 006](../../decisions/006-rotacao-atomica-e-revogacao-de-sessao.md).

### Execução do lote 02 — 12/10/2026

- Inventário reprodutível sem Prisma/banco: 584 arquivos, 588 simulados e 17.684 questões, incluindo cinco simulados privados do legado Português. Catálogo publicável é validado integralmente; os 192 planejados conservam metadados e identidade de acompanhamento separados da importação. Produção local de questões em andamento foi preservada.
- API: regressão HTTP real com migrations e PostgreSQL isolado, cobrindo cadastro/login, convites, turmas, quatro tipos, retomada/edição/conclusão, histórico e autorização. Correção de exposição de hash de senha em perfis e vínculos de responsáveis encontrada pela regressão.
- Web: oito jornadas HTTP com Next de produção, BFF, API e banco real, além dos 25 testes de sessão. Build normal passa com as cinco famílias de fontes locais originais e licenciadas. A suíte HTTP não automatiza cliques, layout ou acessibilidade.
- CI nos dois repositórios, com Actions fixadas por SHA, lockfiles e bancos descartáveis. Guia: [CI e regressão](../../guia-ci-regressao.md); acervo: [inventário](../../inventario-acervo.md).

No fechamento do lote 02, a etapa 0 ainda exigia matriz/responsáveis. A matriz foi preparada no lote 05 e o usuário assumiu a revisão no lote 07; aprovação editorial, alinhamento final de textos e métricas permanecem pendentes. A produção/revisão dos 192 simulados planejados segue como trabalho editorial próprio; esta entrega não cria nem publica quizzes.

### Execução dos lotes 03 e 04 — 12/10/2026

O lote 03 implementa modelos aditivos, autoria ADMIN, versões imutáveis após publicação, catálogo autorizado e snapshots privados criados atomicamente com a tentativa. Mantém os códigos de ano e os fluxos de simulados; sua migration audita tentativas abertas duplicadas sem descartar histórico. Decisão: [ADR 007](../../decisions/007-quizzes-versionados-e-snapshots-privados.md).

O lote 04 confirma e corrige cada resposta de quiz usando o snapshot, persiste o feedback e bloqueia alterações. Reenvios equivalentes recuperam o feedback gravado e conclusão exige todas as questões confirmadas. Pontos/totais usam Decimal; confirmação, conclusão e leitura coordenam locks e acesso atual dentro da transação. Conclusões concorrentes retornam o mesmo resultado, sem novo cálculo ou gravação. Explicação e curiosidade só aparecem no feedback das questões confirmadas; gabaritos estruturados nunca aparecem nos contratos públicos. Decisão: [ADR 008](../../decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md).

Validação do lote 04: 278 unitários, 117 testes PostgreSQL e 8 jornadas HTTP web/Next/BFF/API, além de lint, build, validação Prisma e dry-run de 588 simulados/17.684 questões. Migrations somente em bancos descartáveis. Contratos e migração no [guia de quizzes](../../guia-quizzes.md). Naquele fechamento, catálogo editorial, mídia, telas de quiz e XP ainda eram entregas futuras; foram implementados nos lotes 05–07.

### Execução técnica do lote 05 — 12/10/2026

Catálogo preparado com 45 quizzes/213 perguntas, três quizzes nas 15 faixas, todos `PENDING`. Importador próprio validado, atômico e idempotente; cria DRAFT por padrão e preserva versões, tentativas, arquivados/excluídos e simulados. Publicação pelo importador exige responsável/data/hash da revisão efetivamente realizada. A [matriz editorial](../../matriz-editorial-quizzes.md) apresenta temas, fontes, responsáveis pendentes e prévia das ilustrações.

As 18 questões infantis têm SVGs originais modernizados, narração pt-BR, alt e transcrição. IDs/digests são fixados e copiados para snapshots; assets anteriores permanecem disponíveis. A rota de bytes exige dono/ADMIN e acesso atual, aceita Range e usa no-store. Falha de arquivo preserva texto e não impede confirmar/concluir pela API. Arquivos genéricos empacotados não são armazenamento confidencial de uploads privados.

Validação: 381 unitários, 162 testes PostgreSQL e 8 jornadas HTTP web/Next/BFF/API, além de lint, build, Prisma validate e dry-runs. Nenhuma base existente, publicação editorial ou deploy alterado. [ADR 009](../../decisions/009-catalogo-editorial-e-midia-versionada-de-quiz.md) e [guia](../../guia-quizzes.md). O aceite editorial do lote 05 continua pendente; o lote 06 pode avançar em paralelo à revisão, com lançamento condicionado a ela.

### Execução técnica do lote 06 — 12/10/2026

A web oferece `/quizzes`, `/quiz/[quizId]` e `/quizzes/historico`: filtros nas 15 faixas, disciplina/tema, escolha local antes de confirmar, feedback, resposta bloqueada após confirmação, recarga/retomada e resultado persistido. O runner/histórico exigem STUDENT; os demais perfis podem explorar o catálogo e salvar preferências. Estados vazios/erro permitem recuperar a consulta sem inventar quizzes publicados.

O BFF libera contratos de aluno de quiz e entrega mídia binária pela sessão existente, com cookies httpOnly, Range, MIME/tamanho controlados e no-store. URLs aceitas pertencem à tentativa, sem URL externa ou token na query. Falha de imagem/áudio conserva descrição/transcrição; áudio depende de ação e movimento pode ser reduzido por preferência ou sistema.

A API acrescenta `GET/PATCH /me/learning-preferences`, por conta ativa, com filtros nulos, áudio false e movimento true como defaults. Segmento/ano são compatíveis com os códigos existentes. PATCH trava o usuário, mescla o último estado e preserva alterações de campos distintos sob concorrência. A migration é aditiva, sem backfill; preferência não altera perfil escolar ou autorização de turma. A web invalida estado/respostas atrasadas quando a conta muda. Decisão: [ADR 010](../../decisions/010-preferencias-de-aprendizagem-por-conta.md).

Fechamento da validação do lote 06: **409 testes unitários e 214 de integração API/PostgreSQL**, **30 testes de sessão web e 16 jornadas HTTP Next/BFF/API/PostgreSQL** passaram. Builds API/web, lint da API e Prisma validate passaram; **24 testes Chromium desktop/mobile emulado** validaram os cinco segmentos, teclado, axe, fallback, retomada, perda de respostas e isolamento de sessão/preferências. Bundles de quiz foram inspecionados sem gabaritos, identificadores privados de mídia ou fixtures sintéticas; simulados e quizzes também passaram em dry-run. Não houve migration em banco existente, seed em produção, publicação editorial ou deploy.

Usabilidade com pessoas, leitor de tela e aparelhos reais, incluindo Infantil com adulto, permanece pendente. O catálogo de 45 quizzes/213 perguntas continua PENDING e não foi publicado. Naquele fechamento, a implementação técnica permitia avançar ao lote 07, entregue posteriormente; o lançamento nas 15 faixas continua condicionado à revisão/publicação e validação humana.

### Execução parcial do lote 11 — 13/10/2026

Protótipo Expo 57.0.28/RN 0.86.3/React 19.2.3 no repositório web, com dependências isoladas, sessão Bearer, storage/mídia nativos e telas conectadas. Os 39 tipos públicos agora são compartilhados em `packages/api-contracts`; não há imports de DTOs Nest/Prisma no bundle nem geração a partir do Swagger incompleto.

A prova automatizada tem 57 testes (34 núcleo, 20 adaptadores, 3 links), 7 de telas e 12 casos reais cliente/Nest/PostgreSQL, typecheck e compatibilidade SDK; bundles Android/iOS e projetos de prebuild foram gerados. Os fluxos de simulados permanecem na web neste protótipo, sem transferência de Bearer. Não foram criados APK/IPA assinados nem testados aparelhos físicos.

A decisão Expo é **provisória** e o lote 11 permanece aberto até a matriz física nas plataformas previstas. Android primeiro foi confirmado pelo usuário; disponibilidade dos aparelhos ainda aguarda resposta. O aceite físico prioriza Android, com validação iPhone antes do beta iOS. Backlog e estimativas preliminares do beta estão no [plano dedicado](2026-10-13-mobile-proof-and-beta-plan.md); execução/limites no [guia](../../guia-prova-mobile.md) e [ADR 015](../../decisions/015-prova-mobile-e-contratos-compartilhados.md). Não houve cloud build, publicação em loja, seed editorial ou deploy.

## 3. Experiência e catálogo inicial para todos os públicos

| Público | Experiência inicial | Cobertura mínima proposta |
|---|---|---|
| Infantil 4 e 5 | Missões com Bolinha, imagens, instruções curtas, áudio acionado pelo usuário e mediação de adulto | 3 quizzes para cada faixa, com 3 perguntas |
| Fundamental I — 1º ao 5º | Aventuras por tema, feedback acolhedor, estrelas e avatar | 3 quizzes por ano, com 5 perguntas |
| Fundamental II — 6º ao 9º | Desafios, coleções e metas com linguagem menos infantil | 3 quizzes por ano, com 5 perguntas |
| Ensino Médio — 1ª à 3ª série | Treino por assunto, explicação objetiva e metas de estudo | 3 quizzes por série, com 5 perguntas |
| Enfermagem | Casos e prática por assunto, com apresentação profissional | 3 quizzes iniciais, com 5 perguntas, revisados por responsável pelo conteúdo técnico |

**Primeiro catálogo preparado: 45 quizzes e 213 perguntas**, com revisão humana e publicação pendentes. São 15 faixas: 2 infantis + 9 anos do Fundamental + 3 séries do Médio + 1 segmento técnico. O conteúdo está versionado em `prisma/quiz-data/`, sem importação em banco existente.

Selecionar temas representativos do acervo atual e revisar adequação, enunciado, alternativas, explicação e mídia. O acervo ajuda a produzir o catálogo, mas as perguntas não devem ser selecionadas aleatoriamente sem revisão. Conteúdo privado de escola/turma conserva a mesma restrição; somente conteúdo permitido pode compor quizzes públicos. Manter as disciplinas controladas pelo seed.

A seleção do quiz usa segmento, ano e tema; bimestre e AV deixam de ser passos obrigatórios nesse fluxo. Preservar os códigos atuais de schoolYear: -1/-2 para Infantil, 0 para técnico, 1–9 para Fundamental e 10–12 para Médio.

### Jornada do aluno

1. Entrar e abrir “Aprender hoje”.
2. Escolher “Quiz rápido”, “Simulado” ou uma missão.
3. Iniciar ou retomar a atividade.
4. Marcar e confirmar uma resposta.
5. Ler o feedback e a explicação daquela questão; o áudio atual narra enunciado e alternativas quando disponíveis.
6. Continuar e concluir.
7. Ver progresso e, na etapa de gamificação, receber a recompensa elegível.
8. Escolher a próxima atividade ou revisar uma dificuldade.

Escolher uma alternativa não confirma a resposta: o aluno pode mudar antes de tocar em “Confirmar”. Depois de receber o feedback, a resposta fica registrada e bloqueada. Uma nova tentativa permite praticar novamente.

Não usar cronômetro obrigatório em quizzes. Som e animação são opcionais, com preferência persistida. Acerto, erro e progresso precisam ser compreensíveis sem depender apenas de cor, áudio ou movimento.

## 4. Sequência de entregas

Estimativas históricas do planejamento inicial para **um desenvolvedor full stack dedicado**, com apoio para design e revisão editorial. Os lotes técnicos 01–10 já foram entregues; estas faixas não são uma previsão atual de entrega. O lote 11 reestimará o trabalho mobile após a prova. As faixas não são datas prometidas; produção de áudio/imagens, validação editorial, disponibilidade de aparelhos e análise de lojas podem ampliar o calendário.

| Etapa | Entrega utilizável | Estimativa inicial | Dependência |
|---|---|---|---|
| 0 — Consolidar a base | Sessões isoladas, inventário validado e regressão automatizada | 1 semana | Início |
| 1 — Quizzes na web | Catálogo para todos os segmentos, feedback, mídia Infantil, retomada e histórico | 4–6 semanas | Etapa 0 |
| 2 — Missões e recompensas | “Aprender hoje”, missões, avatar/coleções, XP e conquistas | 2–4 semanas | Quiz estável |
| 3 — Revisão e progresso | Prática de dificuldades, habilidades e relatórios autorizados | 2–4 semanas | Dados de quizzes e conteúdo classificado |
| 4 — Plano técnico mobile | Protótipo em aparelhos, arquitetura e backlog do app | 1–2 semanas | Etapa 2 validada; etapa 3 pode seguir em paralelo |
| 5 — App e beta | App com o núcleo validado da web | 4–6 semanas | Aprovação das decisões técnicas da etapa 4 e gates funcionais |

No planejamento inicial, a projeção era **5–7 semanas** para quizzes e **7–11 semanas** para missões/recompensas, dadas as premissas acima. A execução totalmente sequencial soma cerca de **14–23 semanas**; o planejamento mobile pode acontecer em paralelo à etapa 3. Não esperar a implantação de todas as ideias futuras para começar o mobile.

### Etapa 0 — Consolidar e medir a base

- [x] Corrigir refreshPromise no BFF: compartilhar uma renovação somente entre requisições da mesma sessão; impedir que alunos diferentes recebam os mesmos tokens.
- [x] Testar dois usuários com access expirado e requisições simultâneas, duas requisições do mesmo usuário, refresh revogado e logout.
- [x] Tornar a rotação no backend atômica: uma única requisição consome o refresh anterior; definir recuperação do cliente quando outra renovação já ocorreu.
- [x] Validar registro/login, convite, início/retomada, envio, conclusão e histórico nos dois projetos.
- [x] Conferir consistência do seed de simulados em dry-run e reconciliar os arquivos de conteúdo ainda em produção; coordenar com a expansão em andamento.
- [x] Criar CI da API com build, lint e unitários; adicionar integração com PostgreSQL isolado para autorização e ciclo de tentativas.
- [x] Criar verificações da web para build, tipos e testes de sessão; acrescentar fluxo e2e crítico com API/banco de teste.
- [x] Corrigir documentação divergente: endpoint de questões já pronto, integração web concluída, refresh JWT com jti e correção atual tudo-ou-nada.
- [ ] Alinhar textos da home: feedback instantâneo e conquistas só devem ser anunciados quando disponíveis.
- [x] Preparar matriz editorial dos 45 quizzes e formatos de mídia Infantil.
- [x] Definir responsável pela revisão dos quizzes: o usuário assumiu a revisão em 13/10/2026.
- [ ] Concluir revisão humana por segmento, incluindo Enfermagem e mídia Infantil.
- [ ] Definir eventos e métricas com campos mínimos; respostas, tokens e dados sensíveis não entram nos logs.

**Aceite:** sessões de alunos distintos permanecem isoladas; fluxo atual passa em regressão; seed tem inventário validado; bases de testes não apontam para produção; matriz de conteúdo tem responsáveis.

### Etapa 1 — Quizzes na web

- [x] Criar migração aditiva para distinguir simulado de quiz e manter os dados existentes.
- [x] Acrescentar DTOs, catálogo, criação e publicação de quiz; gestão inicial por ADMIN.
- [x] Acrescentar explicação pedagógica obrigatória às questões de quiz.
- [x] Validar mídia opcional registrada, digest/snapshot e autorização de entrega na API.
- [ ] Implementar armazenamento privado de uploads caso o catálogo passe a exigir arquivos confidenciais de turma.
- [x] Implementar confirmação/correção imediata, leitura de feedback e finalização idempotentes.
- [x] Permitir conclusão de quiz somente quando todas as questões da tentativa estiverem confirmadas.
- [x] Congelar o conteúdo de cada tentativa de quiz em snapshots privados.
- [x] Garantir uma tentativa em andamento por aluno/versão da atividade/modo, inclusive em requisições concorrentes; NORMAL e REVIEW podem coexistir.
- [x] Criar importação própria de quizzes, com versão, chaves estáveis, validação e dry-run.
- [ ] Revisar e publicar o catálogo mínimo de todos os públicos; Infantil tem imagem com descrição e áudio com transcrição.
- [x] Criar /quizzes, /quiz/[quizId] e /quizzes/historico na web, com AuthContext, BFF e contratos próprios de quiz.
- [x] Acrescentar contratos de aluno de quiz à allowlist do proxy/apiClient e entrega binária autorizada de mídia.
- [x] Persistir preferência de segmento/ano, áudio e movimento por conta ativa, sem conceder acesso a turmas.
- [x] Concluir validação automatizada em navegador: teclado, mobile emulado, axe e fallback com mídia/áudio/movimento indisponíveis ou desativados.
- [ ] Validar com leitor de tela e aparelhos reais; ausência de mídia não deve impedir concluir.
- [ ] Observar ao menos uma sessão guiada por segmento, incluindo Infantil com adulto, e ajustar as dificuldades encontradas.

**Aceite:** todos os segmentos têm quizzes publicados e utilizáveis; resposta confirmada fica bloqueada; recarregar recupera resposta e feedback; reenvio não duplica resposta; versão/seed novos não alteram tentativa iniciada; conteúdo privado permanece privado; desempenho de simulados conserva a regra atual.

### Etapa 2 — Missões, avatar e conquistas

- [x] Criar “Aprender hoje”: atividade em andamento, missões disponíveis, quiz sugerido e acesso a simulados.
- [x] Implementar autoria/publicação e exportador offline de 30 rascunhos de missão, duas posições por cada uma das 15 faixas, com distribuição por ano/turma.
- [ ] Revisar e publicar as duas missões curadas por semana de cada faixa, após disponibilizar os quizzes correspondentes.
- [x] Persistir XP por eventos com chave única de concessão e aplicar teto diário no servidor.
- [x] Criar conquista de primeira conclusão, variedade de temas e progresso; regras verificadas no backend.
- [x] Criar catálogo simples de avatares/itens e o estado dos itens desbloqueados.
- [x] Aproveitar Bolinha no Infantil; usar coleções/selo de progresso como opção para Médio e Enfermagem.
- [x] Mostrar próxima atividade e progresso da missão; permitir encerrar a sessão sem pressão para continuar.
- [ ] Instrumentar conclusão e retorno para avaliar se as missões ajudam a manter a prática.

**Regra inicial implementada no lote 07:** 10 XP na primeira conclusão elegível de cada quiz lógico por dia, até 50 XP/dia; prática adicional é livre sem novo XP naquele dia. Esses números são parâmetros de piloto, ajustáveis após observação. XP não altera notas nem ranking de simulados. Itens são cosméticos, desbloqueados por progresso, sem compras.

A chave de elegibilidade usa aluno + atividade lógica + dia em America/Sao_Paulo, independente da versão publicada. Repetir finish devolve o resultado gravado. Eventos de missão e conquista têm unicidade própria; a transação de conclusão registra o progresso e a concessão elegível. Serializar a concessão por aluno/dia, com trava ou mecanismo equivalente, antes de verificar o teto: quizzes diferentes concluídos ao mesmo tempo também precisam respeitar 50 XP/dia.

Missões semanais abrem segunda-feira 00:00 e encerram na segunda seguinte no mesmo fuso. Quem entra durante a semana recebe as missões atuais. Conteúdo pode continuar disponível para prática após o vencimento; o registro de progresso da missão encerra na janela; o piloto não concede bônus de XP por missão. Missões com conteúdo indisponível devem ser substituídas antes da publicação. Não retirar itens adquiridos por faltar um dia.

**Aceite:** trocar de navegador/dispositivo preserva progresso e avatar; finalizações concorrentes não duplicam XP; versão nova não reinicia a elegibilidade do dia; teto diário funciona; cada segmento tem missões com linguagem adequada.

### Etapa 3 — Revisão de dificuldades e progresso por habilidade

- [x] Preparar propostas de catálogo de habilidades por disciplina e faixa: 45 objetivos internos PENDING, sem códigos curriculares presumidos.
- [ ] Concluir revisão editorial das habilidades/classificações; códigos curriculares só entram quando conferidos.
- [x] Preparar classificação inicial das 213 perguntas de quizzes e importação somente como rascunhos.
- [ ] Aprovar/publicar as classificações revistas e expandir o acervo por lotes.
- [x] Gerar sessão de revisão com até 5 perguntas sobre dificuldades recentes de um único quiz publicado e autorizado, marcada por Attempt.practiceMode=REVIEW. Esse recorte preserva o vínculo atual entre Question e Simulation; revisão que mistura atividades exige uma evolução própria.
- [x] Priorizar perguntas diferentes sobre a mesma habilidade; quando houver repetição, identificar como prática.
- [x] Registrar habilidade/versão no snapshot e distinguir primeira resposta, repetição e revisão nas métricas.
- [x] Mostrar progresso por tema com quantidade de evidências e mensagem de “evidência insuficiente” quando necessário.
- [x] Exibir histórico de prática separado de avaliação; não declarar domínio só porque o aluno repetiu a mesma questão.
- [x] Criar visão do responsável usando GuardianStudent.
- [x] Implementar vínculo docente-turma e verificações de acesso por conta/aluno/turma atuais.
- [x] Implementar recuperação com Resend escolhido, hash/expiração/uso único e testes com transporte sintético.
- [ ] Ativar chave/remetente verificado do Resend e validar entrega real no ambiente autorizado.

**Aceite:** revisão nunca recomenda conteúdo inacessível; relatório separa prática de avaliação; responsável só vê alunos vinculados; professor só vê turmas/alunos autorizados; progresso informa seus limites; recuperação de senha funciona. Recursos docentes podem ser entregues depois da revisão do aluno, mas antes de serem anunciados.

### Etapa 4 — Planejamento e prova técnica mobile

- [x] Priorizar Android no primeiro beta, conforme resposta do usuário; preparar arquitetura para ambos.
- [ ] Identificar aparelho Android real disponível e executar a matriz; reservar a validação iPhone antes do beta iOS.
- [x] Produzir protótipo nativo: login, Aprender hoje, catálogo, quiz/feedback, simulados com abertura na web, progresso, perfil, histórico e acompanhamento.
- [x] Preparar a candidata Expo/RN, validar tipos, bundles e prebuild; registrar decisão provisória no ADR 015.
- [ ] Confirmar/rever a decisão depois da prova em aparelhos reais.
- [x] Validar o cliente direto Bearer com a API real e implementar access em memória/refresh no adaptador SecureStore.
- [ ] Comprovar SecureStore/Keychain/Keystore e política de reinstalação/restauração nos aparelhos.
- [x] Testar protocolo de renovação única/rotação/logout, marcador de instalação, JSON/mídia limitados e isolamento com adaptadores controlados.
- [ ] Executar os cenários de suspensão/reabertura, storage e reinstalação no sistema real.
- [ ] Validar suspensão/reabertura do app, link de convite, retomada e perda de rede depois de confirmar e antes de receber feedback.
- [ ] Executar os fluxos críticos em aparelho real Android e iOS para as plataformas previstas no lançamento.
- [x] Extrair 39 tipos públicos independentes de plataforma e reexportá-los pela web; documentar limites do OpenAPI atual e telas nativas próprias.
- [ ] Completar especificação OpenAPI/validação de contrato para geração de SDK no beta.
- [x] Registrar opções de distribuição, requisitos e custos consultados; preparar backlog preliminar.
- [ ] Confirmar canal, titularidade de contas/assinatura e suporte; reestimar após a matriz física.

**Saída concreta:** ADR mobile, mapa de telas, resultados da prova de sessão/retomada, checklist de publicação e backlog estimado por plataforma. A web mantém seu BFF com cookies httpOnly; o app usa a mesma API e regras.

Referências verificadas em 12/10/2026: [Expo Router](https://docs.expo.dev/router/introduction/) oferece navegação para aplicações React Native em Android/iOS/web; [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) usa armazenamento protegido das plataformas e exige tratar ausência/invalidação de credenciais. [Acessibilidade no React Native](https://reactnative.dev/docs/accessibility) orienta a implementação e a verificação dos controles. A recomendação de Expo é uma inferência para este projeto; não implica migração da web.

### Etapa 5 — App inicial e beta

- [ ] Implementar login/registro/recuperação, Aprender hoje, quizzes, missões, avatar/progresso, simulados e histórico.
- [ ] Implementar mídia e preferências por segmento, sincronizadas com a API.
- [ ] Reutilizar todos os contratos de confirmação e recompensa idempotentes.
- [ ] Entregar estados de carregamento, erro e reconexão; responder e corrigir exige conexão na versão inicial.
- [ ] Testar conta compartilhada no aparelho, troca de conta, sessão expirada, convite e retomada entre web/mobile.
- [ ] Pilotar com representantes de todos os segmentos; medir falhas e dificuldades por plataforma.
- [ ] Preparar materiais e requisitos das lojas; publicar somente após os gates funcionais e a autorização de publicação.

**Aceite:** a mesma conta vê o mesmo progresso na web e no app; suspender/reabrir ou reenviar requisição não perde resposta confirmada nem duplica recompensa; não há bloqueador funcional nos aparelhos previstos; suporte e distribuição do beta estão definidos.

## 5. Arquitetura implementada para quizzes

### Persistência e compatibilidade

A implementação reutiliza Simulation, Question, Attempt e AttemptAnswer; QuizzesModule/QuizAttemptsService tratam a prática, enquanto AttemptsCorrectionService conserva a correção dos simulados. Não foi necessário renomear as tabelas existentes.

| Mudança | Regra |
|---|---|
| Simulation.activityKind | SIMULATION ou QUIZ; default SIMULATION para todos os registros existentes |
| Simulation.bimester / assessment | Nullable no banco para quiz; DTO/contrato de simulado continuam exigindo os campos |
| Simulation.topic | Tema do quiz, sem fabricar um bimestre ou uma AV |
| Simulation.activityKey / contentVersion | Identidade lógica estável e versão do quiz; usados na elegibilidade de XP e rastreabilidade |
| Question.explanation | Explicação pedagógica obrigatória para publicação de quiz; diferente de tip e funFact |
| Question.originKey | Identidade estável da pergunta entre versões; diferencia pergunta nova de repetição nas métricas |
| Question.media | Imagem/alt e áudio/transcrição opcionais, com DTO validado e sem gabarito; conteúdo de turma exige mídia privada autorizada |
| AttemptQuestionSnapshot | Conteúdo, opções, ordem, pontos, explicação e respostas oficiais da versão iniciada |
| Preferências do aluno | Segmento/ano e preferências de interação persistidos por usuário, com compatibilidade dos sentinelas |

A restrição condicional mantém bimester/assessment preenchidos em SIMULATION e valida o contrato de QUIZ. Preservar bimestre 0 e as séries sentinelas já usadas em Técnico/Infantil; essa migração não redefine esses dados.

Todos os caminhos antigos de catálogo/gestão, histórico, relatórios, students e pontuacao devem tratar SIMULATION explicitamente. Endpoints de quiz têm filtros próprios. Uma rota antiga de início de simulado deve rejeitar IDs de quiz. Proibir mudança de activityKind após publicação.

Na migração de unicidade de tentativa aberta, identificar duplicidades existentes antes de criar índice parcial; abortar sem alteração e exigir análise operacional explícita preservando o histórico. O lote 03 não implementa abandono automático. Não executar limpeza destrutiva como efeito de migração.

### Conteúdo da tentativa e feedback

O início do quiz cria snapshots na mesma transação; maxScore deriva dos pontos desse snapshot. Não colocar JSON de gabarito no modelo Attempt: hoje vários endpoints retornam esse modelo diretamente. Somente o serviço de correção lê os campos oficiais; DTOs públicos selecionam campos permitidos. A entrega de imagens/áudios do snapshot exige a sessão e o acesso atual, com URLs relativas à tentativa e no-store. Uploads confidenciais de turma continuam fora do escopo implementado; não há URLs assinadas neste fluxo.

A resposta confirmada produz somente o feedback daquela questão: isCorrect, pointsEarned, explanation e funFact. A leitura de retomada recupera esse feedback apenas das questões já confirmadas. Antes da confirmação, explicação e gabarito permanecem ausentes. Um reenvio equivalente devolve o feedback persistido; uma resposta diferente depois da confirmação retorna conflito.

A explicação pode ensinar como chegar à solução e permitir inferi-la; isso é intencional depois da confirmação em um quiz de prática. Nenhuma resposta oficial estruturada, correctAnswer ou QuestionAnswer deve ser entregue. A política está registrada nos [ADRs 007](../../decisions/007-quizzes-versionados-e-snapshots-privados.md) e [008](../../decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md), complementando o 005. O simulado conserva correção no encerramento e a política atual de proteção.

Validação por tipo impede alternativas inexistentes e mapas incompletos ou inválidos. A correção atual é tudo-ou-nada; pontuação parcial é uma mudança futura independente.

Confirmar, corrigir e bloquear a resposta é transacional. Finalizar registra status e resultado na mesma transação, com comparação do estado e trava/controle de concorrência. Quiz só finaliza após confirmar todas as questões do snapshot; tentativa incompleta falha sem conceder XP. Simulados conservam a possibilidade atual de concluir com questões em branco. Os lotes 07–09 acrescentam recibo de XP, progresso de missão, conquistas/itens e evidência nessa unidade atômica; REVIEW não concede XP, missão ou itens.

Quiz publicado tem versão editorial estável; alteração de conteúdo gera nova versão. Todos os caminhos de alteração, incluindo gestão de questões e seed, devem respeitar essa imutabilidade. Importação/publicação é atômica, e o início lê uma única versão coerente de enunciados, opções e gabaritos, mediante revisão imutável ou isolamento/trava coordenada. Snapshots preservam tentativas antigas mesmo após nova versão/seed. Arquivar bloqueia novos inícios e permite retomar sessões existentes quando o acesso continua válido. Revogar participação bloqueia a exposição de conteúdo privado; o resumo pessoal pode preservar estatísticas sem enunciados.

### Modelos acrescentados nos lotes 06–10

- Preferências: `LearningPreferences` por conta.
- Missões/XP: `Mission`, `MissionActivity`, `MissionProgress`, `MissionActivityCompletion`, `XpEvent` e `QuizCompletionReward`.
- Coleção: `UserAchievement`, `UserAvatarItem` e `UserAvatar`; regras e itens usam catálogos controlados no código.
- Habilidades: `LearningSkill`, `QuestionSkill` e metadados imutáveis no snapshot; progresso é agregado das respostas concluídas.
- Acesso/recuperação: `TeacherTurma`, `PasswordResetToken` e `User.authVersion`.

Contratos e limites estão nos guias de [missões/XP](../../guia-missoes-xp.md), [coleções](../../guia-colecoes-conquistas.md), [habilidades/revisão](../../guia-habilidades-revisao.md) e [acesso/recuperação](../../guia-acesso-recuperacao.md).

## 6. Contratos de API implementados

Os lotes 03 e 04 implementam autoria, catálogo, versões, início/retomada, confirmação, feedback, conclusão e resultado. O [guia de quizzes](../../guia-quizzes.md) lista os contratos disponíveis. Mídia está implementada na API no lote 05 e no BFF/jornada web no lote 06, junto com preferências por conta; missões, recompensas, progresso e acompanhamento abaixo foram entregues nos lotes 07–10. Rotas de aluno usam JwtAuthGuard; restrições por role acrescentam RolesGuard e a verificação de propriedade/vínculo no service.

| Rota | Uso e controle |
|---|---|
| GET /quizzes/available | Metadados do catálogo publicado e autorizado; sem perguntas/gabarito |
| POST /quizzes | ADMIN cria rascunho com questões/explicações validadas |
| GET/PATCH/DELETE /quizzes/:id | Gestão ADMIN; soft delete e versão editorial |
| PATCH /quizzes/:id/publish ou /archive | ADMIN publica/arquiva com validação de conteúdo |
| POST /quizzes/:id/versions | ADMIN copia conteúdo para próxima versão DRAFT, preservando a chave lógica |
| POST /quizzes/:id/attempts | STUDENT inicia/retoma, com checagem de turma e unicidade |
| GET /attempts/:id/questions | Snapshot público, mídia de instrução e resposta/feedback somente das questões confirmadas |
| GET /attempts/:id/questions/:questionId/media/:kind | Imagem/áudio autenticado do snapshot, com Range e autorização atual |
| POST /attempts/:id/questions/:questionId/answer | Reutilizado; quiz confirma/corrige/bloqueia, simulado conserva seu fluxo |
| POST /attempts/:id/finish e GET /attempts/:id/result | Resultado persistido; idempotência no quiz |
| GET /me/quiz-attempts | Histórico de prática do próprio aluno |
| GET/PATCH /me/learning-preferences | Escolhas de faixa/ano, áudio e movimento da própria conta ativa, sem conceder acesso |
| GET /me/learning-home e /me/missions | Próxima atividade e missões autorizadas — lote 07 |
| GET /me/achievements e GET/PATCH /me/avatar | Conquistas e personalização persistidas — lote 08 |
| GET /me/learning-progress e POST /me/review-attempts | Progresso e revisão autorizada — lote 09 |
| GET /students/:id/learning-progress | Leitura por responsável vinculado, ADMIN ou docente atribuído; recorte de turma — lote 10 |
| GET /me/oversight-students | Lista mínima dos alunos autorizados para acompanhamento — lote 10 |
| GET /reports/student/:id/summary ou /by-discipline | Avaliações SIMULATION, com vínculo atual e escopo docente — lote 10 |
| POST /turmas/:id/teachers e DELETE /turmas/:id/teachers/:teacherId | Somente ADMIN atribui/remove docente — lote 10 |
| POST /auth/forgot-password e /reset-password | Rotas públicas de recuperação com Resend; transporte real ainda desativado — lote 10 |

`seed-quizzes.ts` e scripts próprios de importação/dry-run/inventário estão implementados. A chave lógica e versão tornam a importação idempotente. O lote 06 acrescenta os contratos de aluno de quiz à allowlist do BFF e conserva o backend como fonte das regras; gestão ADMIN não foi liberada por esse caminho.

## 7. Lotes e estado da execução

| Lote | Trabalho | Arquivos/áreas principais | Pronto quando |
|---|---|---|---|
| 01 | Isolamento e rotação de sessão — concluído | Web lib/authenticatedBackendFetch.server.ts; API auth.service.ts e testes | Dois alunos simultâneos não compartilham tokens |
| 02 | Inventário, regressão e CI — concluído | Seed, testes de integração, fluxos web e documentação | Acervo validado e checks automatizados |
| 03 | Modelo e snapshots de quiz — concluído | prisma/schema.prisma, migrations, QuizzesModule e AttemptsService | Simulados conservam contratos e quiz tem conteúdo estável |
| 04 | Confirmação e resultado de quiz — concluído | QuizAttemptsService, projeções de feedback, migration e testes | Feedback seguro, retomada e concorrência validados |
| 05 | Catálogo e mídia — implementação técnica concluída, revisão/publicação pendentes | Importador, 45 quizzes/213 perguntas, mídia e matriz | Aceite editorial ainda pendente: 45 quizzes revisados e ativos nas 15 faixas |
| 06 | Jornada web de quiz — implementação técnica concluída; validação humana pendente | apiClient, BFF binário, catálogo/runner/histórico e LearningPreferences por conta | Automação valida contratos e retomada; uso com pessoas/leitor de tela/aparelhos reais continua pendente |
| 07 | Missões e XP — implementação técnica concluída; publicação editorial pendente | Novos módulos, transações, ledger e tela Aprender hoje | Regra de concessão única passa sob concorrência |
| 08 | Avatar, coleções e conquistas — implementado | Catálogos, ownership, UI por segmento | Personalização persistida sem afetar notas |
| 09 | Habilidades e revisão — implementado; revisão editorial pendente | Conteúdo classificado, serviços e relatórios | Revisão útil e evidências separadas |
| 10 | Acesso docente/responsável e recuperação — implementação técnica concluída | TeacherTurma, guards/services, painel e Resend | Relatórios restritos e recuperação validados localmente; ativação de e-mail real pendente |
| 11 | Prova mobile — protótipo/prova automatizada; aceite físico pendente | Protótipo, clientes de sessão, Android/iOS e ADR | Backlog mobile reestimado a partir de aparelhos reais |
| 12 | App/beta — não iniciado | Telas nativas, integração e testes | Paridade de progresso e critérios do beta atendidos |

Lotes 03 e 04 implementados: [ADR 007](../../decisions/007-quizzes-versionados-e-snapshots-privados.md), [ADR 008](../../decisions/008-confirmacao-e-resultado-idempotente-de-quiz.md) e [contratos/migração](../../guia-quizzes.md). A implementação técnica do lote 05 está validada no [ADR 009](../../decisions/009-catalogo-editorial-e-midia-versionada-de-quiz.md), com revisão/publicação pendentes. O lote 06 implementa jornada web e preferências ([ADR 010](../../decisions/010-preferencias-de-aprendizagem-por-conta.md)); os lotes 07–10 entregaram missões, XP, coleção, habilidades/revisão e acompanhamento/recuperação. Todas essas implementações estão integradas à main; o lote 11 está em andamento e mantém os gates físicos, humanos, editoriais e operacionais.

Lotes 03–06 formam a primeira entrega de quizzes; 07–08 formam a entrega de gamificação. Design e curadoria começam no lote 02 e seguem em paralelo ao backend. Planejamento mobile começa quando a experiência da etapa 2 estiver validada.

## 8. Métricas e critérios de lançamento

| Pergunta | Métrica |
|---|---|
| O aluno conclui a atividade? | Tentativas de quiz finalizadas / iniciadas, por segmento e plataforma |
| Onde encontra dificuldade? | Última etapa alcançada e falhas ao salvar/retomar/finalizar |
| Volta para praticar? | Retorno em outra semana, por coorte de início |
| A missão ajuda? | Missões elegíveis iniciadas/concluídas, separadas de prática livre |
| A revisão ajuda? | Revisões concluídas e acerto posterior em perguntas diferentes da mesma habilidade |
| A operação é confiável? | Falhas de sessão, respostas perdidas, concessões duplicadas e latência percebida |

Eventos sugeridos: quiz_started, answer_confirmed, quiz_finished, mission_completed e reward_granted; registrar plataforma, segmento, atividade/versão e identificadores mínimos. Emitir quiz_started apenas ao criar a tentativa e quiz_finished apenas na transição de conclusão; retomadas e reenvios não contam como novas tentativas ou conclusões. Distinguir nova pergunta, repetição e revisão. Não enviar conteúdo de resposta, senha ou token à telemetria.

Coletar uma linha de base antes de definir metas numéricas de engajamento. Para lançar, exigir todos os gates funcionais, cobertura editorial de todos os segmentos e correção dos bloqueadores de uso. Um grupo pequeno de teste identifica problemas de usabilidade; não prova melhoria de aprendizagem por si só.

## 9. Testes essenciais

- [x] Regressão de simulado: editar antes de concluir, correção ao final, retomada e histórico.
- [x] Catálogo antigo, média, ranking e relatórios de simulado excluem quizzes.
- [x] Quiz DRAFT/privado não aparece nem pode ser iniciado por link sem acesso.
- [x] Aluno não acessa tentativa ou feedback de outro aluno.
- [x] Recompensas e escolha de item respeitam ownership — lote 08.
- [x] DTOs da API não expõem gabaritos nem explicações de questões de quiz não confirmadas.
- [x] Verificar bundles e telas da jornada web de quiz na regressão automatizada — lotes 06–10.
- [x] Confirmação repetida é idempotente; resposta diferente depois do feedback falha.
- [x] Dois inícios simultâneos compartilham uma tentativa; dois finishes de quiz compartilham o resultado.
- [x] Finalizações concorrentes não duplicam XP, conquistas ou itens — lotes 07/08.
- [x] Nova versão e alteração da questão fonte não mudam questões, opções ou correção de tentativa iniciada.
- [x] Verificar a preservação de conteúdo, tentativas e respostas pelo importador de quizzes.
- [x] Verificar mídia do snapshot, Range, revogação de acesso e falha de bytes sem bloquear confirmação/conclusão na API.
- [x] Publicação concorrente com início não mistura enunciado, opções e gabarito de versões distintas.
- [x] Quiz incompleto não finaliza nem altera status/totais.
- [x] Quiz incompleto não concede XP.
- [x] Arquivamento e revogação de membership obedecem à política documentada.
- [x] XP respeita unicidade, versão lógica, teto e mudança de dia no fuso definido.
- [x] Conclusões simultâneas de quizzes diferentes respeitam o teto diário de XP.
- [x] Entrega de mídia pela API exige autorização atual e no-store; o BFF usa a sessão, sem URLs assinadas ou tokens na query.
- [x] Concluir regressão de mídia/autorização no BFF e navegador; uploads privados continuam fora deste lote.
- [x] Sessões web de contas distintas permanecem isoladas.
- [x] API mantém preferências isoladas por usuário, com PATCH concorrente e validação de conta ativa.
- [x] Validar troca de conta da jornada web e respostas atrasadas — lotes 06–10.
- [x] Reproduzir isolamento no cliente mobile com testes de sessão, adaptadores e API real.
- [ ] Comprovar esse isolamento nas instalações Android/iOS reais.
- [x] Infantil funciona com mídia indisponível e com áudio/movimento desativados em Chromium desktop/mobile emulado.
- [ ] Fluxos Android/iOS tratam suspensão, refresh, perda de rede, reinstalação e link de convite.
- [x] Relatórios de responsável/docente respeitam vínculos atuais e recorte de turmas.
- [x] Recuperação usa hash/expiração/uso único; reset invalida sessões e links irmãos, inclusive sob concorrência.
- [ ] Validar entrega real do Resend e definir limite de recuperação no perímetro/BFF antes de ampliar o uso.

Na implementação, usar unitários para regras, integração com PostgreSQL para índices/transações/concorrência e e2e para contratos críticos. Executar build/lint e dry-run apropriados aos arquivos alterados. Dados de teste e migrations devem ser validados em ambiente isolado.

## 10. Responsabilidades e decisões pendentes

| Papel/decisão | Necessidade |
|---|---|
| Produto — usuário | Validar prioridades de temas, linguagem por segmento, critérios do beta e plataforma inicial |
| Desenvolvimento | API/web, migrations, sessão, testes, observabilidade e app |
| Revisão editorial | Garantir conteúdo correto/adequado, incluindo Educação Infantil e Enfermagem |
| Design/mídia | Evoluir estilos atuais, definir itens/coleções e produzir/revisar imagem/áudio |
| Operação | Ambientes, e-mail de recuperação, armazenamento de mídia e distribuição mobile |
| Capacidade real | Informar disponibilidade para converter esforço em calendário |
| Mobile | Confirmar prioridade Android/iOS e meios de teste/distribuição no spike |

Escopo confirmado pelo usuário: todos os públicos desde o início. Catálogos e regra inicial de XP foram implementados conforme os lotes descritos; aprovação editorial e avaliação dos parâmetros dependem da revisão e do uso observado. As estimativas iniciais são históricas. Nenhuma dessas decisões impede concluir este planejamento.

## 11. Ideias posteriores ao primeiro app

Desafios cooperativos de turma, novas interações de questão, áudio ampliado, ferramentas de autoria para professor, notificações opcionais e prática offline podem entrar em novas etapas.

Offline exige estratégia de sincronização de respostas e recompensas com correção no servidor; não distribuir gabaritos para corrigir localmente. Novos tipos exigem correção backend, contrato de conteúdo e controle acessível antes da publicação. Competição em tempo real, loja paga e geração automática de questões ficam fora deste ciclo.

## 12. Próxima tarefa de implementação

Os lotes 01 a 04 estão concluídos; lotes 05 a 08 implementam tecnicamente catálogo/mídia, jornada web/preferências, missões, XP e coleção pessoal. O lote 08 acrescenta cinco conquistas verificadas no servidor, seis itens cosméticos e apresentação persistida AUTO/MASCOT/SEAL, com Bolinha no Infantil e selos nas faixas mais velhas. Concessões são atômicas e preservam notas, ranking e regras de XP; a migration recupera apenas progresso válido do lote 07. O lote 09 entrega progresso por habilidade e revisão orientada, separando primeiras respostas, repetições e revisões; REVIEW não concede XP, missões ou itens. O catálogo propõe 45 habilidades e classifica as 213 perguntas, ainda PENDING. O lote 10 entrega acompanhamento docente/responsável por vínculos atuais, relatórios restritos e recuperação com Resend/versão de sessão. Ativação real do e-mail segue pendente. O **lote 11: prova e planejamento mobile** está em andamento, com protótipo e prova automatizada. A matriz física ainda é necessária para confirmar a arquitetura e reestimar o beta; o lote 12 não foi iniciado. A revisão editorial segue pendente e tem responsável definido: o usuário assumiu a revisão dos quizzes preparados em 2026-10-13. Os 30 rascunhos de missão também dependem de curadoria/publicação; nenhuma aprovação editorial foi inferida dessa atribuição.

A revisão pedagógica/técnica dos 45 quizzes/213 perguntas e da mídia Infantil pode seguir em paralelo. Definir responsáveis, registrar somente aprovações reais e publicar no ambiente autorizado depois da revisão. O lançamento para todos os públicos continua condicionado a quizzes revisados/publicados e usabilidade validada com pessoas, leitor de tela e aparelhos reais; automação não encerra esses gates.


Fechamento técnico do lote 07: 479 unitários e 267 casos API/PostgreSQL; 30 testes de sessão, 23 jornadas HTTP e 38 Chromium desktop/mobile emulado passaram. Lint/builds/types/Prisma e exportadores offline passaram. A cobertura inclui teto sob concorrência, versões, snapshots de recompensa, rollback, mudança de dia/semana em São Paulo, migração sem backfill, arquivo de uma etapa concorrente e início de outra atividade sem ciclo de locks. Nenhum conteúdo editorial foi publicado. Operação: [guia de missões e XP](../../guia-missoes-xp.md).

Fechamento técnico do lote 08: 513 unitários e 309 casos API/PostgreSQL; 30 testes de sessão, 30 jornadas HTTP e 52 Chromium desktop/mobile emulado passaram. Lint/builds/types/Prisma passaram. A cobertura inclui histórico elegível, ownership durável, temas/versões, rollback de concessões, persistência em outra sessão, todas as faixas, teclado, Axe e troca de conta com GET/PATCH atrasados. Nenhuma publicação editorial ou alteração em banco existente. Operação: [guia de coleções](../../guia-colecoes-conquistas.md).


Fechamento técnico do lote 09: catálogo offline e hashes, autoria/revisão explícita de habilidades, snapshots imutáveis e sessões REVIEW de até cinco perguntas estão implementados. A web oferece /progresso, retomada, resultado e filtro de histórico. Uma pergunta vista em REVIEW ou sem classificação não passa a ser primeira resposta ao reaparecer em NORMAL. Nova versão não reinicia a identidade lógica. Perguntas diferentes da mesma habilidade podem vir de outro quiz autorizado; a sessão continua vinculada a um único quiz. As propostas 45/213 permanecem PENDING e não foram importadas/publicadas em base existente. Operação: [guia de habilidades e revisão](../../guia-habilidades-revisao.md) e [ADR 013](../../decisions/013-habilidades-e-revisao.md). Totais atuais de regressão estão em [PROGRESS.md](../../../PROGRESS.md).


Fechamento técnico do lote 10: roster mínimo e /acompanhamento separam simulados de evidências de prática. TeacherTurma é atribuído somente por ADMIN; filtros excluem atividades de outras turmas privadas e convites não conferem papel docente. Recuperação com Resend usa token aleatório/hash, expiração, cooldown, uso único e revogação atômica das sessões, com transporte sintético e sem login automático. Chave/remetente verificado e entrega real permanecem pendentes. Totais atuais estão em [PROGRESS.md](../../../PROGRESS.md). Operação: [guia de acesso e recuperação](../../guia-acesso-recuperacao.md) e [ADR 014](../../decisions/014-acesso-docente-e-recuperacao.md). Nenhuma base existente, publicação editorial ou deploy foi alterado.

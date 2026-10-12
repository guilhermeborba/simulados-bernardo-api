# Plano de evolução — quizzes, aprendizagem lúdica e app mobile

Data: 2026-10-12
Status: planejamento concluído; lotes 01 e 02 implementados e validados localmente; demais entregas pendentes
Escopo confirmado: **todos os públicos desde o primeiro lançamento**.

## 1. Resultado esperado

Transformar o Simulados Bernardo em uma plataforma de prática e avaliação. O aluno escolhe entre um simulado e um desafio curto, recebe orientação para continuar aprendendo e acompanha seu progresso na web e, posteriormente, no app.

A primeira versão de quizzes deve atender Educação Infantil, Fundamental I, Fundamental II, Ensino Médio e Enfermagem. A mesma API sustenta experiências com linguagem e apresentação adequadas a cada segmento. O catálogo inicial terá cobertura mínima de todas as faixas; a ampliação para todas as disciplinas e temas será contínua.

Este documento define entregas, decisões propostas, dependências e critérios de aceite. A seção de execução registra os lotes já validados; as demais features permanecem planejadas. Ele não autoriza deploy ou publicação em lojas.

## 2. Base verificada

Repositórios inspecionados em modo de leitura:

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

O coordenador BFF pertence a um processo. Definir coordenação compartilhada ou recuperação de disputa antes de ampliar réplicas. JWT de acesso já emitido mantém a duração atual. Ver [ADR 006](../../decisions/006-rotacao-atomica-e-revogacao-de-sessao.md).

### Execução do lote 02 — 12/10/2026

- Inventário reprodutível sem Prisma/banco: 584 arquivos, 588 simulados e 17.684 questões, incluindo cinco simulados privados do legado Português. Catálogo publicável é validado integralmente; os 192 planejados conservam metadados e identidade de acompanhamento separados da importação. Produção local de questões em andamento foi preservada.
- API: regressão HTTP real com migrations e PostgreSQL isolado, cobrindo cadastro/login, convites, turmas, quatro tipos, retomada/edição/conclusão, histórico e autorização. Correção de exposição de hash de senha em perfis e vínculos de responsáveis encontrada pela regressão.
- Web: oito jornadas HTTP com Next de produção, BFF, API e banco real, além dos 25 testes de sessão. Build normal passa com as cinco famílias de fontes locais originais e licenciadas. A suíte HTTP não automatiza cliques, layout ou acessibilidade.
- CI nos dois repositórios, com Actions fixadas por SHA, lockfiles e bancos descartáveis. Guia: [CI e regressão](../../guia-ci-regressao.md); acervo: [inventário](../../inventario-acervo.md).

A etapa 0 ainda exige curadoria/matriz e responsáveis, alinhamento de textos da home e métricas. A produção/revisão dos 192 simulados planejados segue como trabalho editorial próprio; esta entrega não cria nem publica quizzes.

## 3. Experiência e catálogo inicial para todos os públicos

| Público | Experiência inicial | Cobertura mínima proposta |
|---|---|---|
| Infantil 4 e 5 | Missões com Bolinha, imagens, instruções curtas, áudio acionado pelo usuário e mediação de adulto | 3 quizzes para cada faixa, com 3 perguntas |
| Fundamental I — 1º ao 5º | Aventuras por tema, feedback acolhedor, estrelas e avatar | 3 quizzes por ano, com 5 perguntas |
| Fundamental II — 6º ao 9º | Desafios, coleções e metas com linguagem menos infantil | 3 quizzes por ano, com 5 perguntas |
| Ensino Médio — 1ª à 3ª série | Treino por assunto, explicação objetiva e metas de estudo | 3 quizzes por série, com 5 perguntas |
| Enfermagem | Casos e prática por assunto, com apresentação profissional | 3 quizzes iniciais, com 5 perguntas, revisados por responsável pelo conteúdo técnico |

**Primeiro catálogo: 45 quizzes e 213 perguntas**, como meta de produção editorial. São 15 faixas: 2 infantis + 9 anos do Fundamental + 3 séries do Médio + 1 segmento técnico. Essas quantidades são propostas do plano, não conteúdo já existente.

Selecionar temas representativos do acervo atual e revisar adequação, enunciado, alternativas, explicação e mídia. O acervo ajuda a produzir o catálogo, mas as perguntas não devem ser selecionadas aleatoriamente sem revisão. Conteúdo privado de escola/turma conserva a mesma restrição; somente conteúdo permitido pode compor quizzes públicos. Manter as disciplinas controladas pelo seed.

A seleção do quiz usa segmento, ano e tema; bimestre e AV deixam de ser passos obrigatórios nesse fluxo. Preservar os códigos atuais de schoolYear: -1/-2 para Infantil, 0 para técnico, 1–9 para Fundamental e 10–12 para Médio.

### Jornada do aluno

1. Entrar e abrir “Aprender hoje”.
2. Escolher “Quiz rápido”, “Simulado” ou uma missão.
3. Iniciar ou retomar a atividade.
4. Marcar e confirmar uma resposta.
5. Ler/ouvir o feedback e a explicação daquela questão.
6. Continuar e concluir.
7. Ver progresso e, na etapa de gamificação, receber a recompensa elegível.
8. Escolher a próxima atividade ou revisar uma dificuldade.

Escolher uma alternativa não confirma a resposta: o aluno pode mudar antes de tocar em “Confirmar”. Depois de receber o feedback, a resposta fica registrada e bloqueada. Uma nova tentativa permite praticar novamente.

Não usar cronômetro obrigatório em quizzes. Som e animação são opcionais, com preferência persistida. Acerto, erro e progresso precisam ser compreensíveis sem depender apenas de cor, áudio ou movimento.

## 4. Sequência de entregas

Estimativas de esforço técnico para **um desenvolvedor full stack dedicado**, com apoio disponível para design e revisão editorial. Reestimar após a etapa 0. As faixas não são datas prometidas; produção de áudio/imagens, validação editorial, disponibilidade de aparelhos e análise de lojas podem ampliar o calendário.

| Etapa | Entrega utilizável | Estimativa inicial | Dependência |
|---|---|---|---|
| 0 — Consolidar a base | Sessões isoladas, inventário validado e regressão automatizada | 1 semana | Início |
| 1 — Quizzes na web | Catálogo para todos os segmentos, feedback, mídia Infantil, retomada e histórico | 4–6 semanas | Etapa 0 |
| 2 — Missões e recompensas | “Aprender hoje”, missões, avatar/coleções, XP e conquistas | 2–4 semanas | Quiz estável |
| 3 — Revisão e progresso | Prática de dificuldades, habilidades e relatórios autorizados | 2–4 semanas | Dados de quizzes e conteúdo classificado |
| 4 — Plano técnico mobile | Protótipo em aparelhos, arquitetura e backlog do app | 1–2 semanas | Etapa 2 validada; etapa 3 pode seguir em paralelo |
| 5 — App e beta | App com o núcleo validado da web | 4–6 semanas | Aprovação das decisões técnicas da etapa 4 e gates funcionais |

Quizzes podem chegar em aproximadamente **5–7 semanas** e missões/recompensas em **7–11 semanas**, dadas as premissas acima. A execução totalmente sequencial soma cerca de **14–23 semanas**; o planejamento mobile pode acontecer em paralelo à etapa 3. Não esperar a implantação de todas as ideias futuras para começar o mobile.

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
- [ ] Definir matriz editorial dos 45 quizzes, dono de revisão por segmento e os formatos de mídia Infantil.
- [ ] Definir eventos e métricas com campos mínimos; respostas, tokens e dados sensíveis não entram nos logs.

**Aceite:** sessões de alunos distintos permanecem isoladas; fluxo atual passa em regressão; seed tem inventário validado; bases de testes não apontam para produção; matriz de conteúdo tem responsáveis.

### Etapa 1 — Quizzes na web

- [x] Criar migração aditiva para distinguir simulado de quiz e manter os dados existentes.
- [x] Acrescentar DTOs, catálogo, criação e publicação de quiz; gestão inicial por ADMIN.
- [x] Acrescentar explicação pedagógica obrigatória às questões de quiz.
- [ ] Validar mídia opcional e sua autorização (schema reservado no lote 03; aceitação no lote 05).
- [ ] Implementar confirmação/correção imediata, leitura de feedback e finalização idempotentes.
- [ ] Permitir conclusão de quiz somente quando todas as questões da tentativa estiverem confirmadas.
- [x] Congelar o conteúdo de cada tentativa de quiz em snapshots privados.
- [x] Garantir uma tentativa em andamento por aluno/atividade, inclusive em requisições concorrentes.
- [ ] Criar importação própria de quizzes, com versão, chaves estáveis, validação e dry-run.
- [ ] Revisar e publicar o catálogo mínimo de todos os públicos; Infantil tem imagem com descrição e áudio com transcrição.
- [ ] Criar /quizzes, /quiz/[quizId] e histórico de quiz na web; aproveitar AuthContext, BFF e mapeamento existentes.
- [ ] Acrescentar quizzes à allowlist do proxy e os contratos correspondentes ao apiClient.
- [ ] Persistir preferência de segmento/ano, áudio e movimento por usuário; a preferência não concede acesso a turmas.
- [ ] Validar uso em celular, teclado e leitor de tela; imagem ou áudio com falha não deve impedir concluir a atividade.
- [ ] Observar ao menos uma sessão guiada por segmento, incluindo Infantil com adulto, e ajustar as dificuldades encontradas.

**Aceite:** todos os segmentos têm quizzes publicados e utilizáveis; resposta confirmada fica bloqueada; recarregar recupera resposta e feedback; reenvio não duplica resposta; versão/seed novos não alteram tentativa iniciada; conteúdo privado permanece privado; desempenho de simulados conserva a regra atual.

### Etapa 2 — Missões, avatar e conquistas

- [ ] Criar “Aprender hoje”: atividade em andamento, missões disponíveis, quiz sugerido e acesso a simulados.
- [ ] Criar duas missões curadas por semana para cada segmento; atividades selecionadas pela equipe, com distribuição por ano e turma.
- [ ] Persistir XP por eventos com chave única de concessão e aplicar teto diário no servidor.
- [ ] Criar conquista de primeira conclusão, variedade de temas e progresso; regras verificadas no backend.
- [ ] Criar catálogo simples de avatares/itens e o estado dos itens desbloqueados.
- [ ] Aproveitar Bolinha no Infantil; usar coleções/selo de progresso como opção para Médio e Enfermagem.
- [ ] Mostrar próxima atividade e progresso da missão; permitir encerrar a sessão sem pressão para continuar.
- [ ] Instrumentar conclusão e retorno para avaliar se as missões ajudam a manter a prática.

**Regras iniciais propostas:** 10 XP na primeira conclusão elegível de cada quiz lógico por dia, até 50 XP/dia; prática adicional é livre sem novo XP naquele dia. Esses números são parâmetros de piloto, ajustáveis após observação. XP não altera notas nem ranking de simulados. Itens são cosméticos, desbloqueados por progresso, sem compras.

A chave de elegibilidade usa aluno + atividade lógica + dia em America/Sao_Paulo, independente da versão publicada. Repetir finish devolve o resultado gravado. Eventos de missão e conquista têm unicidade própria; a transação de conclusão registra o progresso e a concessão elegível. Serializar a concessão por aluno/dia, com trava ou mecanismo equivalente, antes de verificar o teto: quizzes diferentes concluídos ao mesmo tempo também precisam respeitar 50 XP/dia.

Missões semanais abrem segunda-feira 00:00 e encerram na segunda seguinte no mesmo fuso. Quem entra durante a semana recebe as missões atuais. Conteúdo pode continuar disponível para prática após o vencimento; a recompensa da missão encerra no prazo. Missões com conteúdo indisponível devem ser substituídas antes da publicação. Não retirar itens adquiridos por faltar um dia.

**Aceite:** trocar de navegador/dispositivo preserva progresso e avatar; finalizações concorrentes não duplicam XP; versão nova não reinicia a elegibilidade do dia; teto diário funciona; cada segmento tem missões com linguagem adequada.

### Etapa 3 — Revisão de dificuldades e progresso por habilidade

- [ ] Definir catálogo de habilidades por disciplina e faixa, com revisão editorial; códigos curriculares só entram quando conferidos.
- [ ] Classificar primeiro as perguntas do catálogo de quizzes; expandir o acervo por lotes.
- [ ] Gerar sessão de revisão com até 5 perguntas sobre dificuldades recentes de um único quiz publicado e autorizado, marcada por Attempt.practiceMode=REVIEW. Esse recorte preserva o vínculo atual entre Question e Simulation; revisão que mistura atividades exige uma evolução própria.
- [ ] Priorizar perguntas diferentes sobre a mesma habilidade; quando houver repetição, identificar como prática.
- [ ] Registrar habilidade/versão no snapshot e distinguir primeira resposta, repetição e revisão nas métricas.
- [ ] Mostrar progresso por tema com quantidade de evidências e mensagem de “evidência insuficiente” quando necessário.
- [ ] Exibir histórico de prática separado de avaliação; não declarar domínio só porque o aluno repetiu a mesma questão.
- [ ] Criar visão do responsável usando GuardianStudent.
- [ ] Implementar vínculo docente-turma e as verificações de acesso antes de liberar visão do professor.
- [ ] Entregar recuperação de senha, com provedor de e-mail escolhido, token com hash/expiração/uso único e testes.

**Aceite:** revisão nunca recomenda conteúdo inacessível; relatório separa prática de avaliação; responsável só vê alunos vinculados; professor só vê turmas/alunos autorizados; progresso informa seus limites; recuperação de senha funciona. Recursos docentes podem ser entregues depois da revisão do aluno, mas antes de serem anunciados.

### Etapa 4 — Planejamento e prova técnica mobile

- [ ] Definir prioridade de lançamento Android/iOS conforme aparelhos dos usuários; preparar arquitetura para ambos.
- [ ] Produzir protótipo das telas: login, Aprender hoje, catálogo, quiz/feedback, simulados, progresso e perfil.
- [ ] Testar React Native + Expo como primeira opção, considerando o uso atual de React/TypeScript e a documentação oficial; registrar a decisão em ADR após a prova.
- [ ] Validar cliente direto da API com Bearer: access em memória e refresh em armazenamento seguro do dispositivo.
- [ ] Testar renovação serializada por sessão, rotação, logout e ausência de credencial após reinstalação/restauração.
- [ ] Validar suspensão/reabertura do app, link de convite, retomada e perda de rede depois de confirmar e antes de receber feedback.
- [ ] Executar os fluxos críticos em aparelho real Android e iOS para as plataformas previstas no lançamento.
- [ ] Definir DTOs/OpenAPI e tipos compartilháveis; componentes HTML/CSS da web precisam de implementação nativa.
- [ ] Definir distribuição de beta, contas de loja, suporte, requisitos de publicação e custos antes da construção completa.

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

## 5. Arquitetura proposta para quizzes

### Persistência e compatibilidade

Reutilizar Simulation, Question, Attempt, AttemptAnswer e AttemptsCorrectionService. Criar QuizzesModule como fachada de produto; não renomear tabelas nem criar um motor de correção paralelo.

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

Criar restrição condicional para manter bimester/assessment preenchidos em SIMULATION e validar o contrato de QUIZ. Preservar bimestre 0 e as séries sentinelas já usadas em Técnico/Infantil; essa migração não redefine esses dados.

Todos os caminhos antigos de catálogo/gestão, histórico, relatórios, students e pontuacao devem tratar SIMULATION explicitamente. Endpoints de quiz têm filtros próprios. Uma rota antiga de início de simulado deve rejeitar IDs de quiz. Proibir mudança de activityKind após publicação.

Na migração de unicidade de tentativa aberta, identificar duplicidades existentes antes de criar índice parcial; abortar sem alteração e exigir análise operacional explícita preservando o histórico. O lote 03 não implementa abandono automático. Não executar limpeza destrutiva como efeito de migração.

### Conteúdo da tentativa e feedback

Criar snapshots na mesma transação do início do quiz; maxScore deriva dos pontos desse snapshot. Não colocar JSON de gabarito no modelo Attempt: hoje vários endpoints retornam esse modelo diretamente. Somente o serviço de correção lê os campos oficiais; DTOs públicos selecionam campos permitidos. Imagens/áudios privados exigem acesso autorizado ou URL assinada com validade curta, respeitando a participação na turma.

A resposta confirmada produz somente o feedback daquela questão: isCorrect, pointsEarned, explanation e funFact. A leitura de retomada recupera esse feedback apenas das questões já confirmadas. Antes da confirmação, explicação e gabarito permanecem ausentes. Um reenvio equivalente devolve o feedback persistido; uma resposta diferente depois da confirmação retorna conflito.

A explicação pode ensinar como chegar à solução e permitir inferi-la; isso é intencional depois da confirmação em um quiz de prática. Nenhuma resposta oficial estruturada, correctAnswer ou QuestionAnswer deve ser entregue. Registrar a política em ADR complementar ao 005. O simulado conserva correção no encerramento e a política atual de proteção.

Validação por tipo impede alternativas inexistentes e mapas incompletos ou inválidos. A correção atual é tudo-ou-nada; pontuação parcial é uma mudança futura independente.

Confirmar, corrigir e bloquear a resposta é transacional. Finalizar registra status e resultado na mesma transação, com comparação do estado e trava/controle de concorrência. Quiz só finaliza após confirmar todas as questões do snapshot; tentativa incompleta falha sem conceder XP. Simulados conservam a possibilidade atual de concluir com questões em branco. Na etapa 2, acrescentar a atualização do progresso e o evento de XP nessa unidade atômica.

Quiz publicado tem versão editorial estável; alteração de conteúdo gera nova versão. Todos os caminhos de alteração, incluindo gestão de questões e seed, devem respeitar essa imutabilidade. Importação/publicação é atômica, e o início lê uma única versão coerente de enunciados, opções e gabaritos, mediante revisão imutável ou isolamento/trava coordenada. Snapshots preservam tentativas antigas mesmo após nova versão/seed. Arquivar bloqueia novos inícios e permite retomar sessões existentes quando o acesso continua válido. Revogar participação bloqueia a exposição de conteúdo privado; o resumo pessoal pode preservar estatísticas sem enunciados.

### Modelos posteriores

Etapa 2: Mission, MissionActivity, MissionProgress, XpEvent, Achievement, StudentAchievement, AvatarItem e StudentAvatarItem. Preferir catálogo enxuto e regras explícitas a uma plataforma genérica de gamificação.

Etapa 3: LearningSkill, QuestionSkill e TeacherTurma. Progresso inicialmente pode ser agregado a partir dos dados existentes; acrescentar cache/materialização somente se necessário.

## 6. Contratos de API propostos

O lote 03 implementa autoria, catálogo, versões, início/retomada e leitura de snapshots sem feedback. O [guia de quizzes](../../guia-quizzes.md) lista os contratos disponíveis; confirmação, resultado, mídia e demais rotas abaixo continuam planejados. Rotas de aluno usam JwtAuthGuard; restrições por role acrescentam RolesGuard e a verificação de propriedade/vínculo no service.

| Rota | Uso e controle |
|---|---|
| GET /quizzes/available | Metadados do catálogo publicado e autorizado; sem perguntas/gabarito |
| POST /quizzes | ADMIN cria rascunho com questões/explicações validadas |
| GET/PATCH/DELETE /quizzes/:id | Gestão ADMIN; soft delete e versão editorial |
| PATCH /quizzes/:id/publish ou /archive | ADMIN publica/arquiva com validação de conteúdo |
| POST /quizzes/:id/versions | ADMIN copia conteúdo para próxima versão DRAFT, preservando a chave lógica |
| POST /quizzes/:id/attempts | STUDENT inicia/retoma, com checagem de turma e unicidade |
| GET /attempts/:id/questions | Implementado com snapshots; feedback confirmado será acrescentado no lote 04 |
| POST /attempts/:id/questions/:questionId/answer | Reutilizado; quiz confirma/corrige/bloqueia, simulado conserva seu fluxo |
| POST /attempts/:id/finish e GET /attempts/:id/result | Resultado persistido; idempotência no quiz |
| GET /me/quiz-attempts | Histórico de prática do próprio aluno |
| GET /me/learning-home e /me/missions | Próxima atividade e missões, na etapa 2 |
| GET /me/achievements e GET/PATCH /me/avatar | Conquistas e personalização, na etapa 2 |
| GET /me/learning-progress e POST /me/review-attempts | Progresso e revisão autorizada, na etapa 3 |
| GET /students/:id/learning-progress | Responsável vinculado, ADMIN ou docente com vínculo implementado |

Criar seed-quizzes.ts e scripts próprios de importação/dry-run; estes ainda não existem. A chave lógica e versão tornam a importação idempotente. Acrescentar explicitamente os novos prefixos à allowlist do BFF e manter o backend como fonte das regras.

## 7. Backlog dos primeiros lotes

| Lote | Trabalho | Arquivos/áreas principais | Pronto quando |
|---|---|---|---|
| 01 | Isolamento e rotação de sessão | Web lib/authenticatedBackendFetch.server.ts; API auth.service.ts e testes | Dois alunos simultâneos não compartilham tokens |
| 02 | Inventário, regressão e CI | Seed, testes de integração, fluxos web e documentação | Acervo validado e checks automatizados |
| 03 | Modelo e snapshots de quiz | prisma/schema.prisma, migrations, QuizzesModule e AttemptsService | Simulados conservam contratos e quiz tem conteúdo estável |
| 04 | Confirmação e resultado de quiz | AttemptsService, correction service, DTOs e testes | Feedback seguro, retomada e concorrência validados |
| 05 | Catálogo e mídia em todos os segmentos | Seed de quizzes, metadados, revisão e armazenamento de mídia | 45 quizzes revisados e ativos nas 15 faixas |
| 06 | Jornada web de quiz | apiClient, BFF, novas páginas, QuizRunner e preferências | Todos os públicos conseguem concluir e retomar |
| 07 | Missões e XP | Novos módulos, transações, ledger e tela Aprender hoje | Regra de concessão única passa sob concorrência |
| 08 | Avatar, coleções e conquistas | Catálogos, ownership, UI por segmento | Personalização persistida sem afetar notas |
| 09 | Habilidades e revisão | Conteúdo classificado, serviços e relatórios | Revisão útil e evidências separadas |
| 10 | Acesso docente e recuperação | TeacherTurma, guards/services, auth e e-mail | Relatórios restritos e recuperação operacional |
| 11 | Prova mobile | Protótipo, clientes de sessão, Android/iOS e ADR | Backlog mobile reestimado a partir de aparelhos reais |
| 12 | App/beta | Telas nativas, integração e testes | Paridade de progresso e critérios do beta atendidos |

Lote 03 implementado: [ADR 007](../../decisions/007-quizzes-versionados-e-snapshots-privados.md) e [contratos/migração](../../guia-quizzes.md). Confirmação, feedback e resultado seguem para o lote 04.

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

- [ ] Regressão de simulado: editar antes de concluir, correção ao final, retomada e histórico.
- [ ] Catálogo antigo, média, ranking e relatórios de simulado excluem quizzes.
- [ ] Quiz DRAFT/privado não aparece nem pode ser iniciado por link sem acesso.
- [ ] Aluno não acessa tentativa, feedback ou recompensa de outro aluno.
- [ ] Gabaritos/explicações de questões não confirmadas não aparecem em nenhum DTO/bundle.
- [ ] Confirmação repetida é idempotente; resposta diferente depois do feedback falha.
- [ ] Dois inícios simultâneos compartilham uma tentativa; dois finishes compartilham resultado e recompensa.
- [ ] Novo seed/versão não altera questões, opções ou correção de tentativa iniciada.
- [ ] Publicação concorrente com início não mistura enunciado, opções e gabarito de versões distintas.
- [ ] Quiz incompleto não finaliza e não concede XP.
- [ ] Arquivamento e revogação de membership obedecem à política documentada.
- [ ] XP respeita unicidade, versão lógica, teto e mudança de dia no fuso definido.
- [ ] Conclusões simultâneas de quizzes diferentes respeitam o teto diário de XP.
- [ ] Mídias privadas exigem autorização, expiram quando assinadas e respeitam revogação de acesso.
- [ ] Troca de conta em aparelho/navegador limpa estado da conta anterior.
- [ ] Infantil funciona com mídia indisponível e com áudio/movimento desativados.
- [ ] Fluxos Android/iOS tratam suspensão, refresh, perda de rede, reinstalação e link de convite.
- [ ] Relatórios de responsável/docente respeitam os vínculos.

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

Escopo confirmado pelo usuário: todos os públicos desde o início. Quantidades de conteúdo, valores de XP e estimativas são propostas concretas, ajustáveis após a etapa 0. Nenhuma dessas decisões impede concluir este planejamento.

## 11. Ideias posteriores ao primeiro app

Desafios cooperativos de turma, novas interações de questão, áudio ampliado, ferramentas de autoria para professor, notificações opcionais e prática offline podem entrar em novas etapas.

Offline exige estratégia de sincronização de respostas e recompensas com correção no servidor; não distribuir gabaritos para corrigir localmente. Novos tipos exigem correção backend, contrato de conteúdo e controle acessível antes da publicação. Competição em tempo real, loja paga e geração automática de questões ficam fora deste ciclo.

## 12. Próxima tarefa de implementação

Os lotes 01 e 02 estão concluídos e validados localmente. A próxima tarefa técnica é o **lote 03: migração aditiva e contratos de quiz**. Em paralelo, fechar a matriz editorial dos 45 quizzes, responsáveis e as pendências de produto da etapa 0.

Detalhar a migração e os contratos do quiz a partir das decisões deste documento. A regressão atual protege o ciclo de simulados; o lote 03 deve manter esses checks e acrescentar cobertura específica de quiz.

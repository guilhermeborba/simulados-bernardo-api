# Lotes 11–12 — prova mobile e preparação do beta

Data: **13/10/2026**. Estado: **lote 11 em andamento; lote 12 não iniciado**. Este plano detalha a etapa mobile do [plano de evolução](2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md), sem substituir seus gates editoriais e operacionais. A decisão Expo permanece [provisória no ADR 015](../../decisions/015-prova-mobile-e-contratos-compartilhados.md).

## 1. Entradas e limite da entrega atual

A prova usa Expo 57.0.28, React Native 0.86.3, React 19.2.3, TypeScript e Expo Router no diretório `mobile/` do repositório web. Consome a mesma API diretamente com Bearer; a web conserva seu BFF e cookies httpOnly.

O usuário confirmou **Android primeiro** para o beta. A arquitetura e os bundles preparam ambas as plataformas. O aceite do lote 11 prioriza aparelho Android real; a matriz iPhone continua exigida antes de um beta iOS. Os aparelhos disponíveis ainda aguardam confirmação; disponibilidade de AVD, bundle ou prebuild não encerra o aceite físico. Os modelos, sistemas e builds devem ser registrados no [guia da prova](../../guia-prova-mobile.md).

Há cliente de sessão, adaptadores, telas de protótipo e testes automatizados. APK/IPA assinado, instalação física, contas de loja, associação de domínio e distribuição ainda não foram comprovados. Não há fila offline de respostas, push, correção local ou migração da web.

## 2. Mapa de telas e navegação

Os caminhos abaixo são do protótipo no repositório web, relativos a `mobile/app/`. Login fica no início `/`; não existe uma rota `/login` separada nesta prova.

| Caminho nativo | Papel no protótipo | Trabalho para o beta |
|---|---|---|
| `/` — `index.tsx` sem sessão | Login, restauração, erro de storage e nova tentativa de conexão | Registro nativo, validação/acessibilidade e cenários reais de instalação |
| `/` — `index.tsx` com STUDENT | Aprender hoje, XP, missões, sugestão e retomada | Refinar conteúdo/estados por segmento e validar retorno do background |
| `/quizzes` | Catálogo por faixa e entrada no runner | Filtros de disciplina/tema, apresentação final e estados vazios revisados |
| `/quiz/[id]` | NORMAL/REVIEW, seleção, confirmação, feedback, mídia e resultado na mesma tela | Verificar física de interação, fonte ampliada, perda de rede, interrupção e navegação de retorno |
| `/history` | Histórico de quizzes/revisões e retomada/resultado | Datas/estados finais, filtros e separação visível do histórico de avaliação |
| `/simulations` | Catálogo de simulados e **abertura da realização na web** | Runner nativo dos quatro tipos, correção final, retomada e histórico de avaliação |
| `/progress` | Evidências separadas e início/retomada REVIEW | Textos finais e observação por segmento, sem promessa de domínio |
| `/profile` | Preferências, itens da coleção, entrada manual de link e logout | Avatar/estilo e critérios de conquistas completos, experiência de conta e limpeza física |
| `/oversight` | Roster, resumo de avaliação e habilidades; entrada para GUARDIAN/TEACHER/ADMIN | Refinar ano/aluno, disciplinas e estados de vínculo revogado, sem mutações administrativas |
| `/recovery` | Solicitação de e-mail de recuperação | Entrega real no ambiente autorizado e estados de serviço/limite |
| `/entry` | Confirmação de convite ou reset a partir de segredo em memória | Recebimento HTTPS associado, abertura fria/quente e segundo link em voo |
| `+native-intent.tsx` | Validação de entrada e roteamento sem segredo nos parâmetros | Associação Android/iOS publicada e validada com assinatura do app |

Ao abrir simulado no navegador, o Bearer mobile **não é transferido** para URL ou cookies. O navegador pode exigir login próprio. O protótipo implementa o encaminhamento; a execução física continua pendente e paridade nativa de simulados é trabalho do lote 12.

## 3. Contratos e código reutilizável

`packages/api-contracts/src/index.ts` contém 39 declarações públicas de tipos, importadas/reexportadas pelo cliente web e consumidas por tipos no mobile. Isso evita copiar estruturas, sem levar DTOs Nest, Prisma, gabaritos ou fetch/cookies do BFF para o app. Não há geração automática de SDK: o OpenAPI atual precisa de projeções explícitas para descrever integralmente os contratos.

| Jornada | API preservada | Reuso / regra de aceite |
|---|---|---|
| Conta/sessão | `POST /auth/register`, `/login`, `/refresh`, `/logout`; `GET /auth/me` | Core mobile e tipos públicos; registro STUDENT; access em memória, refresh protegido e rotação serializada |
| Home/missões | `GET /me/learning-home`, `/me/missions` | Mesmas faixas/semana/recibos; consulta não inventa XP |
| Catálogo/início | `GET /quizzes/available`; `POST /quizzes/:id/attempts` | Última versão autorizada; início/retomada sem nova tentativa acidental |
| Confirmação/resultado | `GET /attempts/:id`, `/questions`, `/result`; `POST /questions/:id/answer`, `/finish` dentro da tentativa | Snapshot do servidor; comando equivalente recupera confirmação/resultado; 409 impede mudar resposta confirmada |
| REVIEW/progresso | `GET /me/learning-progress`; `POST /me/review-attempts {quizId}` | Seleção no servidor; NORMAL e REVIEW independentes; revisão sem XP/missão/itens |
| Preferências/coleção | `GET/PATCH /me/learning-preferences`, `/me/avatar`; `GET /me/achievements` | Mudança por conta, faixas compatíveis e somente itens liberados |
| Histórico | `GET /me/quiz-attempts`; `/me/attempts` para avaliação | Não misturar revisão/prática com nota de simulado |
| Simulado | Catálogo/início/questões/respostas/finish existentes | Quatro interações nativas; resposta editável antes de concluir; correção ao final |
| Acompanhamento | `GET /me/oversight-students`, `/students/:id/learning-progress`, `/reports/student/:id/summary` e `/by-discipline` | Somente vínculos atuais; nenhuma pergunta/gabarito ou outra turma privada |
| Convite/recuperação | `POST /me/turmas/join`; `/auth/forgot-password`, `/auth/reset-password` | Segredo não persiste em navegação; reset não troca automaticamente a conta aberta |
| Mídia | `GET /attempts/:id/questions/:questionId/media/:kind (image ou audio)` | Bearer, MIME/limites, Range e fallback textual; sem token em URL |

As notas Decimal continuam strings; datas são ISO no JSON. Anos são -1 Infantil 4, -2 Infantil 5, 0 Enfermagem, 1–9 Fundamental e 10–12 Médio. Os tipos compartilhados não substituem validação de runtime, autorização ou teste com a API real.

## 4. Trabalho necessário para encerrar o lote 11

| Ordem | Ação | Evidência exigida |
|---|---|---|
| 1 | Android primeiro confirmado; identificar aparelho e preparar build Android | Registrar modelo/OS; iPhone será validado antes do beta iOS |
| 2 | Finalizar checks da prova | Typecheck, 57 testes de sessão/adaptadores/links, 7 de telas, 12 integrações reais, bundles por plataforma e prebuild registrados |
| 3 | Preparar ambiente e development builds | API sintética/autorizada acessível pelo aparelho, build próprio assinado conforme plataforma; nenhum segredo em `EXPO_PUBLIC_*` |
| 4 | Executar a matriz em Android real; programar iPhone para a fase iOS | Instalação/reabertura/reinstalação, storage, suspensão, áudio/SVG, leitor de tela, troca de conta e retomada/perda de rede |
| 5 | Provar convite/reset no mecanismo atual de entrada manual | Origem incorreta, segredo inválido/usado/expirado e resposta atrasada de outro link; abertura automática pelo sistema fica explicitamente pendente para P6 |
| 6 | Classificar falhas e ajustar a decisão | Limitação reproduzível, correção ou decisão de escopo; ADR atualizado com resultados reais |
| 7 | Reestimar o lote 12 | Backlog abaixo revisado à luz dos aparelhos e distribuição escolhida |

**Com Android primeiro confirmado, o lote 11 só pode ser marcado concluído após os fluxos críticos executados em Android real, com evidências registradas. A matriz iPhone é exigida antes do beta iOS.** Sem aparelhos ou build adequado, registrar avanço parcial e a pendência. O fechamento deve identificar os limites do protótipo: simulados continuam na web e a associação automática HTTPS é trabalho de P6; testar entrada manual não aprova associação de domínio. A prioridade Android foi informada pelo usuário, não inferida do WSL.

No WSL é possível executar Metro e preparar Android com toolchain. iOS local exige macOS/Xcode; EAS é uma alternativa posterior, separada de executar Expo localmente. O comando `expo export` não gera APK/IPA e prebuild não instala nem comprova execução. Rede espelhada/portas/firewall e assinatura são dependências a resolver no ambiente autorizado, sem alterações automáticas. Procedimentos no [guia da prova](../../guia-prova-mobile.md).

## 5. Backlog preliminar do lote 12

Estimativa de **esforço para uma pessoa full stack**, em dias úteis de dedicação integral. É planejamento preliminar, não reestimativa baseada em teste físico e não compromisso de calendário. O quadro conserva a referência preliminar para ambas as plataformas e simulados nativos completos; Android será entregue primeiro e a parcela iOS será programada depois. Não apresentar a soma abaixo como calendário do primeiro beta Android; não inclui esperas por aparelhos, contas, domínio, revisão editorial ou análise de loja. O pacote P0 encerra o lote 11 e fica fora da soma do lote 12.

| Pacote | Dependências | Entrega e aceite concreto | Esforço preliminar |
|---|---|---|---|
| P0 — Fechamento da prova | Aparelhos e build por plataforma | Matriz física preenchida, decisão Expo confirmada/revista e limites classificados | 2–4 dias, condicionado à disponibilidade |
| P1 — Ambientes e builds próprios | P0 e definição de titularidade | Identificadores finais, ambientes separados, HTTPS, configuração pública sem segredos, build Android/iOS instalável e reproduzível | 3–5 dias |
| P2 — Conta e sessão de instalação | P1 | Registro/login/reset/convite, storage real, logout e troca de conta sem dados atrasados; reinstalação e falhas de storage verificadas | 2–3 dias |
| P3 — Jornada de quiz final | P2 | Home/catálogo com filtros, runner NORMAL/REVIEW, feedback/resultado/histórico; retomada após perda HTTP conserva resposta/XP e mídia tem fallback | 3–5 dias |
| P4 — Simulados nativos | P2 e contratos legados | Múltipla escolha, verdadeiro/falso, associação e classificação; edição antes do fim, correção no servidor, retomada e histórico de avaliação | 5–8 dias |
| P5 — Perfil, coleção e acompanhamento | P2/P3 | Preferências, estilo/itens/conquistas, evidências e relatórios por vínculo; mesma conta vê progresso consistente na web/app | 3–5 dias |
| P6 — Links associados | P1/P2, domínio e assinatura | App Links/Universal Links por HTTPS, fallback web, abertura fria/quente e tokens não persistidos em navegação/logs | 2–3 dias |
| P7 — Acessibilidade e uso por segmento | P3/P4/P5/P6 | TalkBack/VoiceOver, fonte ampliada, teclado, movimento e mídia; observação nos cinco segmentos, Infantil com adulto, sem bloqueador funcional | 3–5 dias |
| P8 — Operação e publicação preparada | P1/P7 e responsáveis definidos | Eventos mínimos sem respostas/segredos, canal de suporte, privacidade/dados/audiência, exclusão de conta e materiais de distribuição revisados | 3–5 dias |
| P9 — Beta e estabilização | P7/P8 e gates editoriais/operacionais | Builds assinados distribuídos pelo canal escolhido, instalação limpa/upgrade, piloto de todos os segmentos e bloqueadores corrigidos | 3–5 dias |

**Soma preliminar do lote 12: 27–44 dias úteis, aproximadamente 6–9 semanas para uma pessoa.** Os pacotes compartilham código entre plataformas, mas cada uma precisa de build, execução e aceite próprios. O fechamento da prova pode reduzir, ampliar ou mudar essa previsão; ela ainda não foi validada em aparelhos.

Sequência Android primeiro: P0 Android → P1 Android → P2 → P3/P4 → P5/P6 Android → P7 Android → P8 → P9 Android. A etapa iOS reaproveita o código e exige assinatura, links, execução e aceite próprios antes do seu beta. O quadro detalha dependências mínimas; havendo mais pessoas, algumas frentes podem ocorrer em paralelo. Curadoria e configuração operacional seguem com os responsáveis próprios, sem aprovação presumida.

## 6. Opções de distribuição a decidir

| Opção | Uso previsto | Condições e limite |
|---|---|---|
| Android APK interno | Testadores autorizados instalam uma build própria fora da loja | APK assinado, origem/distribuição controlada e procedimento de atualização; não exige presumir publicação Google Play |
| Android teste interno/fechado Play | Pilotar instalação/atualização pelo canal da loja | Conta titular, materiais e declarações; requisitos de produção dependem da modalidade da conta |
| iOS ad hoc | Grupo conhecido de aparelhos registrados | Conta Apple/assinatura, UDIDs e provisioning; incluir novo aparelho pode exigir nova build |
| iOS TestFlight | Beta por App Store Connect | Conta Apple, build assinada/processada e requisitos de revisão aplicáveis aos testadores externos |

Nenhuma opção foi executada ou contratada. EAS pode construir/distribuir builds próprios a partir do Windows, mas não é obrigatório para adotar Expo; não resolve sozinho conta Apple, assinatura ou uso real. [Distribuição interna Expo](https://docs.expo.dev/build/internal-distribution/), [TestFlight oficial](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

Valores consultados em **13/10/2026**: EAS Free anuncia até 15 builds Android e 15 iOS; Starter US$19/mês mais uso. Apple Developer US$99/ano ou valor local; Play Console US$25 de inscrição única. Consultar novamente ao decidir o canal e definir quem será titular das contas. [EAS](https://expo.dev/pricing), [Apple](https://developer.apple.com/programs/whats-included/), [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).

Para contas pessoais Play criadas após 13/11/2023, a solicitação de produção exige teste fechado com 12 participantes por 14 dias contínuos. Isso não é estimativa de esforço de desenvolvimento e não se presume aplicável à conta do projeto antes de conhecê-la. [Requisito oficial](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

## 7. Gates preservados para o beta

Os 45 quizzes/213 perguntas, 45 habilidades/213 classificações e 30 rascunhos de missão permanecem PENDING. Fixtures sintéticas da prova não aprovam nem publicam conteúdo. O usuário continua responsável pela revisão editorial já assumida.

Resend continua desativado por padrão; chave/remetente verificado, entrega real e limite de recuperação no perímetro/BFF permanecem pendentes. A decisão de distribuição mobile não altera esse estado.

Antes de ampliar o piloto, confirmar cobertura editorial das 15 faixas, gates de uso/acessibilidade, ambiente autorizado, suporte e critérios observáveis de estabilidade. Não houve deploy, migração em banco existente, e-mail externo ou publicação de loja nesta prova. A autorização de publicar é uma etapa final sobre um resultado concreto, depois da implementação e validação necessárias.


## Atualização de escopo — 14/10/2026

O responsável aprovou os quizzes preparados e a voz Dora mais lenta. Definiu
também a refação completa do **design system de web e mobile**, para uma próxima
etapa. O layout do protótipo não é aceite visual final. O [plano do design system](2026-10-14-design-system-web-mobile.md)
orienta fundações, componentes, jornadas e migração. P3/P5 e o aceite P7 devem
incorporar o novo sistema visual. As estimativas anteriores não incluem essa
refação e precisam ser revistas após o escopo visual ser definido.

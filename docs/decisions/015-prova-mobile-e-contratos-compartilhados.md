# ADR 015 — Prova mobile e contratos públicos compartilhados

- Data: 2026-10-13
- Estado: **provisório; protótipo e prova automatizada disponíveis, aceite em aparelhos pendente**
- Escopo: lote 11 do [plano de evolução](../superpowers/plans/2026-10-12-evolucao-quizzes-gamificacao-mobile-plan.md)

## Contexto

Os lotes 01–10 disponibilizam simulados, quizzes, missões/XP, coleção, evidências, revisão e acompanhamento na API/web. O primeiro lançamento continua destinado aos cinco segmentos e às 15 faixas existentes. O backend já aceita Bearer diretamente; o BFF Next é o limite de sessão do navegador, sem ser requisito do cliente nativo.

Precisamos testar navegação, sessão por instalação, mídia e retomada antes de estimar o app/beta do lote 12. Aprovar TypeScript, integração HTTP ou bundles não comprova funcionamento em Android/iPhone, armazenamento seguro nativo, acessibilidade ou distribuição.

## Decisão provisória

Construir a prova em `mobile/` do repositório web com **Expo 57.0.28, React Native 0.86.3, React 19.2.3 e TypeScript**, usando Expo Router e módulos compatíveis fixados no lockfile. A escolha aproveita o conhecimento React e os contratos existentes; React Native recomenda um framework para novos projetos. Expo e seus serviços EAS são escolhas separadas. [Orientação oficial do React Native](https://reactnative.dev/docs/environment-setup).

O usuário confirmou **Android primeiro** para o beta. A prova física Android é o critério prioritário de fechamento; iOS fica preparado e exige validação própria antes do beta iOS. A decisão será revista após a matriz física do [guia da prova](../guia-prova-mobile.md). O scaffold, seus identificadores `com.simuladosbernardo.proof` e o esquema `simuladosbernardoproof` são da prova. Não representam identificadores definitivos de loja, APK/IPA distribuído, app publicado ou aprovação de beta.

### Contratos e separação de plataformas

`packages/api-contracts/src/index.ts`, no repositório web, reúne **39 declarações públicas de tipos** extraídas do cliente existente. A web importa/reexporta esses tipos; o cliente HTTP web conserva o BFF e cookies httpOnly. Mobile usa as projeções por importação de tipos e um transporte próprio. Não compartilhar componentes HTML, contexto de cookies, DTOs Nest, enums gerados do Prisma ou gabaritos no bundle.

O Swagger atual descobre rotas, mas não descreve integralmente DTOs e respostas: faltam projeções e anotações explícitas. Portanto, **não gerar um SDK a partir do OpenAPI atual**. Os tipos compartilhados não são validadores de runtime nem uma garantia automática de compatibilidade. Testes contra respostas da API real verificam o contrato crítico; completar a especificação e automatizar sua consistência é um item posterior.

Decimais de nota/pontos máximos continuam strings no JSON; pontos ganhos no feedback são números. Manter `practiceMode`, `activityKey`, `originKey`, versão e os códigos de ano existentes, incluindo -1 Infantil 4, -2 Infantil 5 e 0 Enfermagem.

### Sessão direta e armazenamento

O núcleo `MobileSessionClient` não depende de bibliotecas nativas: recebe transporte e storage. Usa login/refresh/logout reais, access token apenas em memória e refresh persistido pelo adaptador SecureStore. O snapshot público expõe estado, usuário seguro e geração; não expõe credenciais. Renovação é única por geração; respostas e gravações atrasadas de outra conta/logout não podem restaurar a sessão anterior.

O adaptador nativo salva um registro versionado no SecureStore, com `WHEN_UNLOCKED_THIS_DEVICE_ONLY` no iOS. A configuração Android exclui SecureStore do backup. Um marcador sem segredo em `Paths.cache` invalida credencial retida quando o marcador desaparece, inclusive após reinstalação ou limpeza de cache pelo sistema: nesse caso, pedir login é o comportamento esperado. Esse mecanismo precisa de confirmação física; Keychain pode sobreviver à reinstalação, e cache não é um identificador permanente de instalação. [SecureStore — persistência e backup](https://docs.expo.dev/versions/latest/sdk/securestore/).

Falhas de leitura, gravação ou remoção do storage são explícitas. Rede, 5xx e limite temporário preservam o refresh para nova tentativa; refresh recusado ou repetição autenticada ainda recusada exige login. Logout remove o estado local e tenta revogar a cadeia no servidor; sem conexão, não se presume revogação remota. O access JWT já emitido pode permanecer válido até expirar; reset de senha invalida as sessões pela versão atual do usuário.

A rotação da API é de uso único. **Perda da resposta depois do commit não permite reconstruir o sucessor**; o cliente conserva a credencial até a próxima recusa e oferece novo login. O progresso já salvo continua no servidor. Também permanece uma lacuna anterior: o guard atual converte falha de banco durante a verificação em 401. A prova não promete distinguir todo 401 temporário de credencial inválida.

### Transporte, links e mídia

A origem da API é explícita; HTTPS é obrigatório na versão distribuída e HTTP exige desenvolvimento local. Credenciais não entram em URL, logs, parâmetros de navegação ou AsyncStorage. JSON tem orçamento de 2 MiB, timeout e cancelamento durante o consumo do corpo, inclusive depois dos headers. O adaptador usa **`expo/fetch` com `redirect: 'error'` e `credentials: 'omit'`**, sem fallback para fetch global do React Native. A inspeção do código instalado de Expo 57.0.28 verificou bloqueio do seguimento de redirects nos clientes Android/iOS; testes com doubles verificam o protocolo do adaptador, não sua execução no aparelho.

Preservar `/convite?token=...` e `/redefinir-senha#token=...` no domínio web autorizado. O parser aceita somente origem/path/formato esperados, sem duplicação ou parâmetros adicionais; os valores secretos ficam em memória. O esquema personalizado transporta somente navegação comum, sem token. Android App Links/iOS Universal Links requerem domínio controlado, associação publicada, assinatura e provas com app fechado/aberto; continuam pendentes, com fallback web preservado. [Estratégias de links e limites do Expo Go](https://docs.expo.dev/linking/overview/).

SVG/WAV são buscados com Bearer pelo cliente antes da renderização/reprodução, com MIME e limites verificados. A prova usa limites mais restritos de **128 KiB para SVG e 4 MiB para WAV**, enquanto a API aceita 2 MiB/8 MiB. SVG estático é renderizado com `react-native-svg`; narração usa `expo-audio`, sem permissão de microfone/gravação/background. Texto alternativo e transcrição continuam utilizáveis quando a mídia falha. Bytes de imagem ficam em memória; WAV temporário fica no cache privado e é descartado ao trocar de sessão/atividade ou ir para background. Limpeza interrompe operações pendentes; sua execução efetiva no sistema permanece sujeita ao teste físico. [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/).

Não há fila offline de respostas nem correção local. Escolher uma alternativa continua sendo estado transitório até confirmar. Confirmação e finish podem ser repetidos com o mesmo comando depois de perda HTTP, preservando o resultado/recibo do servidor; não aplicar retry automático genérico a todo POST.

## Evidências e consequência

Na construção do lote: **57 testes (34 núcleo, 20 adaptadores e 3 links) mais 7 de telas e 12 de integração real Nest/PostgreSQL** aprovados, além de tipos, compatibilidade SDK, bundles Android/iOS e geração dos projetos por prebuild. A integração usa fixtures sintéticas, schema aleatório descartável e captura Resend em loopback. Esses resultados não exercitam Keychain/Keystore, execução nativa, leitor de tela ou instalação. Bundles e prebuild têm registro próprio no guia e não equivalem a APK/IPA.

Não houve cloud build, conta de loja criada, envio externo de e-mail, deploy ou publicação editorial. Os 45 quizzes/213 perguntas, 45 habilidades/213 classificações e 30 rascunhos de missão continuam PENDING. O lote 11 permanece aberto até registrar a prova física, revisar esta decisão e reestimar o lote 12.

## Alternativas e distribuição futura

| Alternativa | Avaliação para esta prova |
|---|---|
| React Native sem framework | Reavaliar se surgir limitação concreta do Expo; exige manter mais infraestrutura nativa |
| WebView | Não comprova os requisitos nativos de mídia, storage e navegação definidos para o app |
| Apps Android/iOS separados | Aumentam o trabalho de interface e manutenção sem necessidade demonstrada hoje |

Windows/WSL permite CLI/Metro; build/simulador iOS local exige macOS/Xcode. EAS é uma possível alternativa de compilação/assinatura, ainda não acionada. Expo não oferece suporte oficial a EAS Build local no Windows/WSL. [Guia de builds locais](https://docs.expo.dev/build-reference/local-builds/).

Na consulta oficial de 13/10/2026, EAS Free anuncia até 15 builds Android e 15 iOS; Starter US$19/mês mais uso. Apple Developer custa US$99/ano ou preço local; Play Console, US$25 de inscrição única. Confirmar valores, titularidade e modalidades antes de contratar. Regras de testes e dados/audiência fazem parte do backlog de distribuição do lote 12, sem presumir contas existentes. [EAS](https://expo.dev/pricing), [Apple](https://developer.apple.com/programs/whats-included/), [Google Play](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).

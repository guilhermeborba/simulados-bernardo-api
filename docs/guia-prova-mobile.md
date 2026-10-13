# Prova mobile — execução e critérios de conclusão

Atualizado em **13/10/2026**. O lote 11 está em andamento: protótipo nativo e prova automatizada disponíveis; a validação física continua pendente. A escolha de Expo é provisória no [ADR 015](decisions/015-prova-mobile-e-contratos-compartilhados.md). O [plano dedicado](superpowers/plans/2026-10-13-mobile-proof-and-beta-plan.md) reúne o mapa de telas e o backlog preliminar; este guia não declara o app/beta do lote 12 concluído.

## Onde está a prova

O código mobile fica em `mobile/` do [repositório web](https://github.com/guilhermeborba/simulados-bernardo/tree/main/mobile). Seus tipos públicos compartilhados ficam em `packages/api-contracts/src/`; `lib/apiClient.ts` continua sendo o cliente web/BFF. A API é consumida diretamente com Bearer. A prova não exige mudanças de domínio, loja, banco existente ou deploy.

| Parte | Responsabilidade |
|---|---|
| `src/core/session.ts` | Geração de sessão, access em memória, refresh único, restauração, logout, JSON e bytes autenticados |
| `src/platform/secure-store.ts` | Registro versionado SecureStore e marcador de instalação em cache |
| `src/platform/native-fetch.ts` | Transporte Expo com redirects recusados e cookies omitidos |
| `src/platform/media.ts` | SVG estático, WAV PCM, limites, player e limpeza de cache |
| `src/navigation/links.ts` / `app/+native-intent.tsx` | Parser de origem/path/token; segredos somente em memória |
| `scripts/run-integration.mjs` | API real + schema PostgreSQL aleatório + e-mail sintético em loopback |

O núcleo não usa DTOs Nest/Prisma. Os 39 tipos compartilhados representam projeções públicas e não validam payloads automaticamente. O OpenAPI existente ainda está incompleto para geração confiável de SDK.

## Verificação local sem aparelho

Requisitos: Node 22.13+ (validado com 22.23.2), npm, checkout web com `mobile/package-lock.json`, checkout compatível da API e Docker com `postgres:16-alpine` disponível. Os comandos abaixo partem da raiz do checkout web escolhido para a prova; mantenha alterações pessoais em outro checkout.

```bash
npm ci --prefix mobile
npm run typecheck --prefix mobile
npm test --prefix mobile
npm run test:ui --prefix mobile

# Caminho explícito do checkout compatível da API; não usar uma URL/banco de produção.
MOBILE_PROOF_API_DIR=/home/guilhermeborba/.codex/worktrees/refresh-rotation/simulados-bernardo-api
npm ci --prefix "$MOBILE_PROOF_API_DIR"
npm run prisma:generate --prefix "$MOBILE_PROOF_API_DIR"
npm run build --prefix "$MOBILE_PROOF_API_DIR"
E2E_API_DIR="$MOBILE_PROOF_API_DIR" npm run test:integration --prefix mobile
```

O harness exige `E2E_API_DIR` explícito e o build da API; não depende de Next ou `.next`. Sem `TEST_DATABASE_URL`, cria container PostgreSQL próprio em porta loopback aleatória, aplica migrations em `mobile_regression_<sufixo>`, prepara fixtures sintéticas e remove schema/container ao terminar. A imagem Docker não é baixada implicitamente. Se usar serviço de CI, `TEST_DATABASE_URL` deve apontar somente para usuário/banco `simulados_regression_test` em loopback e porta explícita, sem query/fragmento; o schema da execução continua isolado.

O envio Resend da integração vai para um servidor HTTP local que aceita somente destinatários `@example.test`. Nenhum conteúdo editorial é importado e nenhum e-mail externo é necessário. Falta de configuração, serviço ou suite deve falhar, nunca pular silenciosamente a prova.

```bash
# Geram bundles JavaScript/assets por plataforma, não instaladores.
npm run export:android --prefix mobile
npm run export:ios --prefix mobile

# Gera projetos nativos locais; não compila APK/IPA nem publica um app.
npm run prebuild --prefix mobile
```

Registrar o resultado real no quadro de evidências. Diretórios `.proof`, `android` e `ios` gerados são artefatos locais; não precisam ser commitados para comprovar que o comando executou. Expo recomenda development builds para validar o aplicativo próprio e bibliotecas/configuração nativas. Expo Go não encerra o aceite de instalação, assinatura ou links associados. [Development builds](https://docs.expo.dev/develop/development-builds/introduction/).

## Ambiente Windows/WSL e execução em dispositivo

O projeto está no filesystem Linux do Ubuntu/WSL2. O executor Codex utiliza a alternativa registrada no `AGENTS.md` quando o sandbox falha antes de iniciar o comando. Isso resolve acesso para o trabalho autorizado; não modifica a rede do Windows.

Para Metro e API serem alcançados por telefone, configurar um endereço acessível na rede do aparelho. `127.0.0.1` no telefone é o próprio telefone; endereços internos 172.x do WSL podem não estar acessíveis. O guia oficial explica rede espelhada/encaminhamento de portas. Não alterar firewall, reiniciar WSL ou abrir tunnel automaticamente. [Expo no WSL](https://github.com/expo/fyi/blob/main/wsl.md).

`EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_WEB_ORIGIN` recebem apenas as origens públicas do ambiente de prova, sem path, usuário, senha, query ou fragmento. Não colocar chave, JWT, token de convite/reset nem credencial Resend em `EXPO_PUBLIC_*`. A configuração permite HTTP somente em desenvolvimento; versão distribuída exige HTTPS.

Depois de disponibilizar a API de prova e uma development build autorizada, iniciar Metro na pasta mobile com essas origens configuradas:

```bash
npm run start --prefix mobile
```

`npm run android --prefix mobile` depende de SDK/JDK/ADB e compila/instala localmente. `npm run ios --prefix mobile` exige macOS/Xcode; não funciona como build iOS local no WSL. Não há cloud build, assinatura ou registro de aparelho executado por estes scripts. EAS pode ser considerado depois de definir titularidade/credenciais e orçamento; seu build local não tem suporte oficial no Windows/WSL. [Builds locais Expo/EAS](https://docs.expo.dev/build-reference/local-builds/).

## Evidências disponíveis e limites

| Verificação | Estado registrado na construção do lote | Limite |
|---|---|---|
| Núcleo de sessão | 34 testes aprovados | Storage/transporte controlados; não Keychain/Keystore |
| Adaptadores de plataforma | 20 testes aprovados | Dependências nativas substituídas nos testes |
| Telas nativas com Jest Expo/RNTL | 7 testes aprovados | Renderização e interações com dependências controladas; sem aparelho |
| Parser de links | 3 testes aprovados | Origem/path/formato/duplicação e memória, sem associação de domínio |
| Integração cliente/API | 12 casos Nest/PostgreSQL aprovados | HTTP real, armazenamento em memória, sem UI/aparelho |
| TypeScript mobile / dependências | Aprovado; Expo install --check sem divergências | Compilação/compatibilidade estática |
| Bundles Android/iOS | Ambos aprovados, com Hermes/assets | Mesmo aprovados, não geram APK/IPA |
| Prebuild | Projetos Android e iOS gerados; plugins aplicados | Geração de projeto não comprova compilação/instalação |
| Android físico | Pendente; nenhum conectado na inspeção | Modelo/OS/build/resultados precisam ser preenchidos |
| iPhone físico | Pendente; nenhum conectado na inspeção | Exige build assinado e registro das mesmas evidências |
| Emulador | AVD Pixel_10a disponível, sem teste registrado | Pode ajudar no diagnóstico; não substitui aparelhos físicos |

Os 57 testes do núcleo/adaptadores/links, 7 testes de telas e as 12 integrações passaram sem casos ignorados. A inspeção dos projetos gerados confirmou referência às regras de backup do SecureStore e ausência de permissão de microfone/background de áudio. A auditoria de 40 SVGs/18 WAVs passou, sem comprovar renderização ou reprodução física. O job mobile da CI web repete tipos, testes, bundles, prebuild e a prova real da API.

A integração cobre as 15 faixas, Bearer sem cookies, restauração, 401 concorrentes/atrasados, refresh com resposta perdida após commit, troca de conta/logout com resposta pendente, confirmação/finish idempotentes, XP, REVIEW sem recompensa, Range/MIME/limites, vínculo docente revogado, status inativo e reset invalidando duas sessões. A captura sintética não comprova entrega real Resend.

## Matriz obrigatória em aparelhos

Preencher **uma coluna por plataforma** com data, responsável, modelo, versão do sistema, versão/commit do app e identificador do build. Usar contas/conteúdo sintéticos no ambiente autorizado; não registrar senha, token, nome/e-mail de criança ou URL secreta em vídeo/log.

| Cenário | Android — modelo/OS/build: a preencher | iPhone — modelo/iOS/build: a preencher |
|---|---|---|
| Instalar, entrar, encerrar processo e reabrir | Pendente | Pendente |
| Reinstalar/limpar cache e verificar pedido de login | Pendente | Pendente |
| Logout/troca de conta durante refresh, mídia e resposta pendentes | Pendente | Pendente |
| Queda de rede antes/depois de confirmar/finish; retomar sem duplicação | Pendente | Pendente |
| Perder resposta de refresh após commit; oferecer novo login | Pendente | Pendente |
| Mudança de status/vínculo/reset em outra sessão remove acesso atual | Pendente | Pendente |
| Infantil com imagem/áudio/texto alternativo; silêncio/interrupção/background | Pendente | Pendente |
| Fonte ampliada, teclado, leitor de tela e redução de movimento | TalkBack pendente | VoiceOver pendente |
| Sessão de uso nos cinco segmentos, Infantil acompanhado por adulto | Pendente | Pendente |
| Convite/reset pela entrada manual existente, sem guardar segredo | Pendente | Pendente |
| Abertura automática HTTPS com app fechado/aberto e fallback web | Pendente para P6 do lote 12 | Pendente para P6 do lote 12 |
| URL inesperada, token duplicado/expirado/usado e segundo link pendente | Pendente | Pendente |
| Catálogo de simulados/abertura na web e relatório/coleção/progresso sem misturar contas | Pendente | Pendente |

O marcador em cache força novo login se o sistema remover o marcador, mesmo conservando Keychain. WAV temporário deve parar e desaparecer ao sair/trocar conta/background; imagem/áudio devem conservar fallback textual se falharem. A prova não persiste fila offline de respostas. Sessão/seleção não pode ser restaurada de outra conta.

Links secretos usam domínio web autorizado, sem esquema personalizado. O parser não publica a associação Android/iOS: configurar `assetlinks.json`/associação Apple e assinatura é um trabalho posterior. Até lá, conservar o fallback web. [App Links/Universal Links](https://docs.expo.dev/linking/overview/).

## Para encerrar o lote 11 e planejar o beta

Encerrar somente após juntar comandos/logs dos checks, builds realmente gerados, matriz física dos fluxos implementados preenchida, limitações classificadas e atualização do ADR. Associação automática HTTPS e simulados nativos permanecem entregas específicas do lote 12; entrada manual e abertura de simulado na web não aprovam esses recursos futuros. Se uma plataforma não puder ser validada, registrar a pendência e revisar o escopo com o usuário; não transformar falta de aparelho em teste aprovado.

A seguir, reestimar o lote 12 em função das evidências: telas e acessibilidade finais, observabilidade sem dados sensíveis, ambientes, domínio/links, assinatura, instalação limpa/upgrade, distribuição e suporte. As 45 entradas de quiz/213 perguntas, 45 habilidades/213 classificações e 30 rascunhos de missão continuam PENDING; aprovação editorial e publicação não decorrem da prova técnica.

Não foram contratados serviços de build ou criadas contas de loja. Na consulta de 13/10/2026: EAS Free até 15 builds Android + 15 iOS; Starter US$19/mês mais uso; Apple Developer US$99/ano ou preço local; Google Play US$25 de inscrição única. Conferir valores e conta antes do beta. [EAS](https://expo.dev/pricing), [Apple](https://developer.apple.com/programs/whats-included/), [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).

Contas pessoais Google Play criadas após 13/11/2023 têm exigência específica de teste fechado com 12 participantes por 14 dias contínuos antes de solicitar produção; não presumir a modalidade da conta do projeto. A declaração de público/dados, inclusive crianças, e os fluxos de exclusão de conta entram no checklist de distribuição do lote 12 com os SDKs efetivamente escolhidos. [Público infantil](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en), [exclusão de conta](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en), [teste fechado oficial](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

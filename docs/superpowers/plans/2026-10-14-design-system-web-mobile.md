# Redesign do design system — web e mobile

Decisão do responsável em **14/10/2026**: refazer o design system completo da
plataforma, abrangendo web e mobile. O layout atual serve à validação funcional;
não é o layout final aprovado. Esta frente está planejada, sem implementação de
redesign nesta entrega.

## Escopo

- Identidade e fundamentos: tipografia, cores semânticas, espaçamento, grade,
  superfícies, bordas, elevação, iconografia, ilustrações e movimento.
- Tokens compartilhados e versionados, com adaptação para CSS/web e React Native.
  Compartilhar o contrato visual não exige compartilhar a implementação de todos
  os componentes.
- Componentes: botões, campos, seleção, navegação, cards, diálogos, estados de
  carregamento/vazio/erro/sucesso, feedback de resposta e controles de mídia.
- Padrões das jornadas: acesso/recuperação, home, catálogo, quiz, simulado,
  resultado, histórico, progresso, perfil e acompanhamento autorizado.
- Todos os públicos existentes: Infantil, Fundamental I/II, Médio e Enfermagem,
  com linguagem visual adequada à faixa e identidade reconhecível entre produtos.

## Sequência proposta

| Etapa | Resultado revisável |
|---|---|
| DS1 — Direção visual e inventário | Brief de identidade, inventário dos componentes web/mobile e exemplos das jornadas prioritárias |
| DS2 — Fundações | Tokens semânticos, escalas e regras de adaptação entre plataformas |
| DS3 — Componentes base | Biblioteca documentada com estados, foco, erros, fonte ampliada e contratos acessíveis |
| DS4 — Jornadas piloto | Acesso, catálogo, pergunta/feedback e resultado desenhados nas duas plataformas e nos públicos existentes |
| DS5 — Migração | Troca gradual dos componentes e telas, com regressão funcional e visual, sem perder dados ou controle de acesso |
| DS6 — Aceite | Contraste, teclado e leitores de tela na web; TalkBack/VoiceOver e aparelhos reais no mobile; revisão com usuários |

Critérios transversais: hierarquia legível, alvos de toque adequados, estados
claros, redução de movimento, contraste, zoom/fonte ampliada, sem depender só de
cor e sem transformar animação em obstáculo à resposta. Narração continua opcional,
com transcrição e controle explícito de reprodução.

## Relação com o plano mobile

A nova voz e a aprovação editorial não aprovam o layout atual. O redesign deve
anteceder o fechamento visual das jornadas finais e o aceite de uso do beta.
Provas de sessão, contratos, correção/XP, autoria e infraestrutura podem continuar.
As estimativas anteriores do beta não incluem o redesign completo: reestimar após
DS1/DS2, sem prometer uma data de lançamento a partir do plano anterior.

Não inclui nesta decisão mudança do modelo de autorização, troca de framework,
publicação em lojas ou refação do backend. Esses itens exigem necessidade própria.

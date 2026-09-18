const TEXTO_1 = "Texto: \"Era uma vez uma tartaruga e uma lebre. Elas resolveram fazer uma corrida. A lebre saiu correndo muito rápido, mas parou para descansar. A tartaruga foi devagar, sem parar, e venceu a corrida.\"\n\n";
const TEXTO_2 = "Texto: \"Léo foi ao parque com seu pai. Ele subiu no escorregador várias vezes. De repente, Léo perdeu seu boné no balanço. Ele procurou e procurou, até encontrar o boné embaixo do banco.\"\n\n";
const TEXTO_3 = "Texto: \"No sábado, a família de Sofia foi à praia. Sofia construiu um castelo de areia enorme. Depois, ela nadou no mar com o irmão. À noite, todos voltaram para casa, cansados e felizes.\"\n\n";
const TEXTO_4 = "Texto: \"Um dia, Tomás encontrou um filhote de passarinho caído do ninho. Ele colocou o passarinho numa caixa com um paninho macio. Tomás cuidou dele com muito carinho. Depois de alguns dias, o passarinho já conseguia voar e Tomás o soltou livre no céu.\"\n\n";

export const questoesPortugues1AnoB4Av2 = [
  {
    id: 1,
    type: "multiple_choice",
    text: TEXTO_1 + "Quais são os personagens dessa história?",
    tip: "Os personagens são quem participa da história. Releia a primeira frase e veja quem aparece.",
    funFact: "Essa história é uma fábula muito antiga, contada há mais de 2.500 anos por um contador de histórias grego chamado Esopo!",
    points: 1,
    options: [
      { id: "A", text: "Um gato e um rato" },
      { id: "B", text: "Uma tartaruga e uma lebre" },
      { id: "C", text: "Um cachorro e um gato" },
      { id: "D", text: "Uma menina e um menino" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: TEXTO_1 + "O que os dois animais decidiram fazer?",
    tip: "A segunda frase do texto conta exatamente o que elas combinaram fazer.",
    funFact: "Corridas entre animais diferentes, como na fábula, são usadas para ensinar lições importantes sobre a vida!",
    points: 1,
    options: [
      { id: "A", text: "Uma corrida" },
      { id: "B", text: "Uma festa" },
      { id: "C", text: "Uma viagem" },
      { id: "D", text: "Um jogo de bola" }
    ],
    correctAnswer: "A"
  },
  {
    id: 3,
    type: "multiple_choice",
    text: TEXTO_1 + "O que a lebre fez durante a corrida?",
    tip: "Releia a terceira frase: ela conta duas coisas que a lebre fez — uma no começo e outra depois.",
    funFact: "As lebres de verdade são realmente muito rápidas — elas podem correr a mais de 70 km por hora!",
    points: 1,
    options: [
      { id: "A", text: "Correu o tempo todo, sem parar" },
      { id: "B", text: "Saiu correndo rápido, mas parou para descansar" },
      { id: "C", text: "Nem começou a correr" },
      { id: "D", text: "Desistiu no começo" }
    ],
    correctAnswer: "B"
  },
  {
    id: 4,
    type: "multiple_choice",
    text: TEXTO_1 + "Como a tartaruga correu?",
    tip: "A última frase conta o jeitinho da tartaruga de correr — bem diferente da lebre.",
    funFact: "As tartarugas são mesmo bem lentas — algumas espécies andam a menos de 1 km por hora, bem devagarinho!",
    points: 1,
    options: [
      { id: "A", text: "Muito rápido, sem parar nunca" },
      { id: "B", text: "Devagar, mas sem parar" },
      { id: "C", text: "Ela nem participou da corrida" },
      { id: "D", text: "Ela desistiu no meio do caminho" }
    ],
    correctAnswer: "B"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: TEXTO_1 + "Quem venceu a corrida?",
    tip: "A última frase do texto conta bem claramente quem cruzou a linha de chegada primeiro.",
    funFact: "Essa fábula ensina uma lição famosa até hoje: devagar e sempre, sem desistir, também se pode vencer!",
    points: 1,
    options: [
      { id: "A", text: "A lebre" },
      { id: "B", text: "A tartaruga" },
      { id: "C", text: "As duas empataram" },
      { id: "D", text: "Nenhuma das duas" }
    ],
    correctAnswer: "B"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: TEXTO_1 + "Por que a lebre não venceu a corrida?",
    tip: "Pense no que aconteceu no meio da corrida, contado na terceira frase do texto.",
    funFact: "A palavra \"confiança demais\" combina bem com o que aconteceu com a lebre — ela achou que já tinha ganhado e relaxou!",
    points: 1,
    options: [
      { id: "A", text: "Porque ela era muito lenta" },
      { id: "B", text: "Porque ela parou para descansar" },
      { id: "C", text: "Porque ela não sabia correr" },
      { id: "D", text: "Porque a tartaruga trapaceou" }
    ],
    correctAnswer: "B"
  },
  {
    id: 7,
    type: "multiple_choice",
    text: TEXTO_1 + "Essa história tem começo, meio e fim. O que acontece no FIM da história?",
    tip: "Pense: o que é contado na última frase, fechando a história?",
    funFact: "Toda boa história tem começo (apresenta os personagens), meio (o que acontece) e fim (como termina) — isso se chama estrutura narrativa!",
    points: 1,
    options: [
      { id: "A", text: "Os personagens são apresentados" },
      { id: "B", text: "A corrida é combinada" },
      { id: "C", text: "A tartaruga vence a corrida" },
      { id: "D", text: "A lebre começa a correr" }
    ],
    correctAnswer: "C"
  },
  {
    id: 8,
    type: "multiple_choice",
    text: TEXTO_1 + "Essa é uma história real ou inventada?",
    tip: "Repare como o texto começa: \"Era uma vez...\" — essa expressão costuma abrir que tipo de história?",
    funFact: "\"Era uma vez\" é uma das aberturas mais famosas do mundo para contar histórias — ela avisa que o que vem a seguir é uma história inventada, cheia de imaginação!",
    points: 1,
    options: [
      { id: "A", text: "Real, aconteceu de verdade" },
      { id: "B", text: "Inventada, é uma fábula" },
      { id: "C", text: "É uma notícia de jornal" },
      { id: "D", text: "É uma lista de compras" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: TEXTO_2 + "Aonde Léo foi?",
    tip: "A primeira frase do texto já conta o lugar para onde Léo foi.",
    funFact: "Parques públicos existem para que todo mundo possa brincar e se divertir ao ar livre, de graça!",
    points: 1,
    options: [
      { id: "A", text: "Ao parque" },
      { id: "B", text: "À escola" },
      { id: "C", text: "Ao mercado" },
      { id: "D", text: "À praia" }
    ],
    correctAnswer: "A"
  },
  {
    id: 10,
    type: "multiple_choice",
    text: TEXTO_2 + "Com quem Léo foi ao parque?",
    tip: "Releia a primeira frase: ela conta quem acompanhou o Léo.",
    funFact: "Passar tempo em família em um parque é uma ótima forma de se divertir e ainda tomar um solzinho gostoso!",
    points: 1,
    options: [
      { id: "A", text: "Com a mãe" },
      { id: "B", text: "Com o pai" },
      { id: "C", text: "Sozinho" },
      { id: "D", text: "Com os amigos" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: TEXTO_2 + "O que Léo fez várias vezes no parque?",
    tip: "A segunda frase conta a brincadeira que ele repetiu várias vezes.",
    funFact: "Escorregadores existem em parquinhos desde o século 19 — já fazem mais de 150 anos que as crianças se divertem descendo por eles!",
    points: 1,
    options: [
      { id: "A", text: "Subiu no escorregador" },
      { id: "B", text: "Comeu sorvete" },
      { id: "C", text: "Dormiu no banco" },
      { id: "D", text: "Andou de bicicleta" }
    ],
    correctAnswer: "A"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: TEXTO_2 + "Qual foi o problema que aconteceu na história?",
    tip: "Toda história tem um probleminha no meio dela. Releia a terceira frase e veja o que deu errado.",
    funFact: "Em toda boa história, geralmente aparece um \"problema\" que o personagem precisa resolver — isso deixa a história mais interessante!",
    points: 1,
    options: [
      { id: "A", text: "Léo se machucou" },
      { id: "B", text: "Léo perdeu o boné" },
      { id: "C", text: "Léo brigou com o pai" },
      { id: "D", text: "Choveu muito forte" }
    ],
    correctAnswer: "B"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: TEXTO_2 + "Onde Léo perdeu o boné?",
    tip: "A terceira frase conta exatamente onde ele estava quando perdeu o boné.",
    funFact: "Balanços são uma das brincadeiras mais antigas dos parquinhos — a sensação de balançar no ar diverte crianças (e adultos!) desde sempre!",
    points: 1,
    options: [
      { id: "A", text: "No escorregador" },
      { id: "B", text: "No balanço" },
      { id: "C", text: "Em casa" },
      { id: "D", text: "No carro" }
    ],
    correctAnswer: "B"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: TEXTO_2 + "Onde Léo encontrou o boné, no final?",
    tip: "A última frase do texto conta exatamente onde ele achou o boné, depois de procurar bastante.",
    funFact: "Procurar com calma, olhando em vários lugares, é uma boa estratégia para encontrar objetos perdidos — e funcionou para o Léo!",
    points: 1,
    options: [
      { id: "A", text: "Em cima do escorregador" },
      { id: "B", text: "Dentro da mochila" },
      { id: "C", text: "Embaixo do banco" },
      { id: "D", text: "Na mão do pai" }
    ],
    correctAnswer: "C"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: TEXTO_2 + "Essa história tem um final:",
    tip: "Pense: no final, o probleminha do Léo foi resolvido ou não?",
    funFact: "Histórias com finais felizes, em que o problema é resolvido, são muito comuns e deixam quem lê com uma sensação boa!",
    points: 1,
    options: [
      { id: "A", text: "Triste, porque o boné sumiu para sempre" },
      { id: "B", text: "Feliz, porque Léo encontrou o boné" },
      { id: "C", text: "A história não tem final" },
      { id: "D", text: "Assustador" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: TEXTO_2 + "Qual é a ordem correta dos acontecimentos dessa história?",
    tip: "Releia o texto do começo ao fim e observe a ordem em que as coisas realmente aconteceram.",
    funFact: "Contar os fatos na ordem certa, um depois do outro, ajuda muito quem está lendo a entender a história direitinho!",
    points: 1,
    options: [
      { id: "A", text: "Léo perde o boné → vai ao parque → encontra o boné" },
      { id: "B", text: "Léo vai ao parque → perde o boné → encontra o boné" },
      { id: "C", text: "Léo encontra o boné → vai ao parque → perde o boné" },
      { id: "D", text: "Léo vai ao parque → encontra o boné → perde o boné" }
    ],
    correctAnswer: "B"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: TEXTO_3 + "Que dia da semana a família foi à praia?",
    tip: "O dia está dito logo na primeira palavra do texto.",
    funFact: "A praia é um dos passeios favoritos das famílias brasileiras, já que o Brasil tem mais de 7 mil quilômetros de litoral!",
    points: 1,
    options: [
      { id: "A", text: "Domingo" },
      { id: "B", text: "Sábado" },
      { id: "C", text: "Segunda-feira" },
      { id: "D", text: "Sexta-feira" }
    ],
    correctAnswer: "B"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: TEXTO_3 + "O que Sofia construiu na praia?",
    tip: "A segunda frase conta exatamente o que Sofia fez com a areia.",
    funFact: "Existem competições no mundo inteiro de esculturas de areia, com castelos gigantes e super detalhados!",
    points: 1,
    options: [
      { id: "A", text: "Uma casa de madeira" },
      { id: "B", text: "Um castelo de areia" },
      { id: "C", text: "Um barquinho de papel" },
      { id: "D", text: "Uma pipa" }
    ],
    correctAnswer: "B"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: TEXTO_3 + "Com quem Sofia nadou no mar?",
    tip: "A terceira frase conta quem acompanhou Sofia na hora de nadar.",
    funFact: "Nadar no mar é diferente de nadar em piscina, porque a água salgada ajuda o corpo a boiar mais facilmente!",
    points: 1,
    options: [
      { id: "A", text: "Com a mãe" },
      { id: "B", text: "Com o pai" },
      { id: "C", text: "Com o irmão" },
      { id: "D", text: "Sozinha" }
    ],
    correctAnswer: "C"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: TEXTO_3 + "Como a família estava ao voltar para casa, à noite?",
    tip: "A última frase do texto conta exatamente como todos estavam se sentindo no final do dia.",
    funFact: "Um dia cheio de brincadeiras ao ar livre realmente deixa a gente com sono e feliz ao mesmo tempo — é um cansaço bom!",
    points: 1,
    options: [
      { id: "A", text: "Tristes e bravos" },
      { id: "B", text: "Cansados e felizes" },
      { id: "C", text: "Com fome e sozinhos" },
      { id: "D", text: "Assustados" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: TEXTO_3 + "O que aconteceu primeiro nessa história?",
    tip: "Releia o texto desde o início: qual foi a primeira coisa que aconteceu, antes de tudo o mais?",
    funFact: "Prestar atenção na ordem dos fatos ajuda a entender melhor qualquer história que a gente lê ou ouve!",
    points: 1,
    options: [
      { id: "A", text: "A família voltou para casa" },
      { id: "B", text: "Sofia nadou no mar" },
      { id: "C", text: "A família foi à praia" },
      { id: "D", text: "Sofia construiu o castelo" }
    ],
    correctAnswer: "C"
  },
  {
    id: 22,
    type: "multiple_choice",
    text: TEXTO_3 + "Essa história aconteceu:",
    tip: "O texto todo conta coisas que aconteceram em um único lugar — releia e identifique qual é.",
    funFact: "O lugar onde uma história acontece se chama \"cenário\" — ele ajuda a gente a imaginar tudo com mais detalhes!",
    points: 1,
    options: [
      { id: "A", text: "Na casa de Sofia" },
      { id: "B", text: "Na escola" },
      { id: "C", text: "Na praia" },
      { id: "D", text: "No parque" }
    ],
    correctAnswer: "C"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: TEXTO_3 + "Quantos momentos diferentes do dia são contados no texto (por exemplo: de dia e à noite)?",
    tip: "O texto fala do dia (construindo castelo e nadando) e também de outro momento, dito na última frase. Quantos são?",
    funFact: "Contar uma história ao longo de um dia inteiro, do começo ao fim, ajuda a mostrar como o tempo passa!",
    points: 1,
    options: [
      { id: "A", text: "Um" },
      { id: "B", text: "Dois" },
      { id: "C", text: "Três" },
      { id: "D", text: "Quatro" }
    ],
    correctAnswer: "B"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: TEXTO_4 + "O que Tomás encontrou?",
    tip: "A primeira frase conta exatamente o que Tomás encontrou naquele dia.",
    funFact: "É importante saber que, na vida real, filhotes de pássaros geralmente devem ser levados a um adulto ou especialista, para receberem os cuidados certos!",
    points: 1,
    options: [
      { id: "A", text: "Um gatinho perdido" },
      { id: "B", text: "Um filhote de passarinho caído do ninho" },
      { id: "C", text: "Um brinquedo quebrado" },
      { id: "D", text: "Uma flor murcha" }
    ],
    correctAnswer: "B"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: TEXTO_4 + "Onde Tomás colocou o passarinho?",
    tip: "A segunda frase conta exatamente como Tomás preparou um lugar confortável para o passarinho.",
    funFact: "Deixar um lugar quentinho e macio ajuda muito filhotes de animais fracos ou machucados a se sentirem mais seguros!",
    points: 1,
    options: [
      { id: "A", text: "Numa gaiola" },
      { id: "B", text: "Numa caixa com um paninho macio" },
      { id: "C", text: "Direto no chão" },
      { id: "D", text: "Dentro da mochila" }
    ],
    correctAnswer: "B"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: TEXTO_4 + "Qual é o problema (ou desafio) dessa história?",
    tip: "Pense: o que estava \"errado\" no começo da história, e que precisava ser resolvido?",
    funFact: "Histórias sobre cuidar de animais ensinam muito sobre gentileza e responsabilidade!",
    points: 1,
    options: [
      { id: "A", text: "O passarinho estava caído do ninho e precisava de cuidado" },
      { id: "B", text: "Tomás estava com fome" },
      { id: "C", text: "Tomás não gostava de animais" },
      { id: "D", text: "O passarinho queria fugir" }
    ],
    correctAnswer: "A"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: TEXTO_4 + "Como termina essa história?",
    tip: "Releia a última frase: o que acontece com o passarinho depois de ficar bem cuidado?",
    funFact: "Devolver um animal silvestre para a natureza, quando ele já está saudável, é o final mais correto e feliz para essas histórias!",
    points: 1,
    options: [
      { id: "A", text: "O passarinho morre" },
      { id: "B", text: "O passarinho aprende a voar e é solto livre" },
      { id: "C", text: "Tomás perde o passarinho" },
      { id: "D", text: "O passarinho vira um animal de estimação para sempre" }
    ],
    correctAnswer: "B"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: TEXTO_4 + "O sentimento de Tomás ao cuidar do passarinho foi de:",
    tip: "A terceira frase do texto conta exatamente com que sentimento Tomás cuidou do bichinho.",
    funFact: "Cuidar de um ser vivo com carinho e paciência é uma das atitudes mais bonitas que podemos ter!",
    points: 1,
    options: [
      { id: "A", text: "Raiva" },
      { id: "B", text: "Carinho" },
      { id: "C", text: "Medo" },
      { id: "D", text: "Indiferença (sem se importar)" }
    ],
    correctAnswer: "B"
  },
  {
    id: 29,
    type: "multiple_choice",
    text: TEXTO_4 + "Quanto tempo o passarinho ficou sendo cuidado, segundo o texto?",
    tip: "Releia a última frase: ela dá uma pista sobre quanto tempo passou até o passarinho aprender a voar.",
    funFact: "Filhotes de pássaros geralmente aprendem a voar entre 2 e 3 semanas depois de nascer!",
    points: 1,
    options: [
      { id: "A", text: "Um ano" },
      { id: "B", text: "Alguns dias" },
      { id: "C", text: "Uma semana exata" },
      { id: "D", text: "O texto não fala sobre isso" }
    ],
    correctAnswer: "B"
  },
  {
    id: 30,
    type: "multiple_choice",
    text: TEXTO_4 + "Essa é uma história sobre:",
    tip: "Pense no assunto principal de toda a história: sobre o que ela conta, do início ao fim?",
    funFact: "Parabéns por terminar esse simulado! Você já sabe identificar personagens, problemas e finais de uma história — isso é ler com muita atenção!",
    points: 1,
    options: [
      { id: "A", text: "Uma corrida entre animais" },
      { id: "B", text: "Um passeio na praia" },
      { id: "C", text: "Um menino cuidando de um passarinho" },
      { id: "D", text: "Uma festa de aniversário" }
    ],
    correctAnswer: "C"
  }
];

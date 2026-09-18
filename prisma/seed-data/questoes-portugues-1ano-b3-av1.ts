const TEXTO_1 = "Texto: \"Bolinha é um gatinho branco. Ele gosta de dormir em cima do sofá. Todos os dias, Bolinha bebe leite pela manhã.\"\n\n";
const TEXTO_2 = "Texto: \"No sábado, Joãozinho fez uma festa. Ele convidou os amigos da escola. Todos comeram bolo de chocolate e brincaram muito no jardim.\"\n\n";
const TEXTO_3 = "Texto: \"Meu animal de estimação se chama Rex. Ele é um cachorro grande e peludo. Rex adora correr atrás da bola no quintal e late quando alguém bate na porta.\"\n\n";
const TEXTO_4 = "Texto: \"Hoje choveu o dia inteiro. As ruas ficaram molhadas e cheias de poças. Mariana pulou várias poças com suas botas amarelas e ficou muito feliz.\"\n\n";

export const questoesPortugues1AnoB3Av1 = [
  {
    id: 1,
    type: "multiple_choice",
    text: TEXTO_1 + "Qual é o nome do gatinho?",
    tip: "O nome dele está logo na primeira frase do texto. Releia o começo!",
    funFact: "Muitos gatos recebem nomes que combinam com a cor do pelo, como \"Bolinha\" para os bem branquinhos e redondinhos!",
    points: 1,
    options: [
      { id: "A", text: "Bolinha" },
      { id: "B", text: "Branquinho" },
      { id: "C", text: "Mimoso" },
      { id: "D", text: "Fofinho" }
    ],
    correctAnswer: "A"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: TEXTO_1 + "De que cor é o gatinho Bolinha?",
    tip: "A cor dele é dita bem no início, junto com o nome. Releia a primeira frase.",
    funFact: "Gatos totalmente brancos às vezes têm os olhos de cores diferentes, um azul e outro verde, por exemplo!",
    points: 1,
    options: [
      { id: "A", text: "Preto" },
      { id: "B", text: "Branco" },
      { id: "C", text: "Laranja" },
      { id: "D", text: "Cinza" }
    ],
    correctAnswer: "B"
  },
  {
    id: 3,
    type: "multiple_choice",
    text: TEXTO_1 + "Onde Bolinha gosta de dormir?",
    tip: "O texto conta exatamente o lugar preferido dele para tirar uma soneca. Releia a segunda frase.",
    funFact: "Os gatos dormem, em média, entre 12 e 16 horas por dia — quase o dobro do que uma pessoa dorme!",
    points: 1,
    options: [
      { id: "A", text: "Na cama" },
      { id: "B", text: "No jardim" },
      { id: "C", text: "Em cima do sofá" },
      { id: "D", text: "Debaixo da mesa" }
    ],
    correctAnswer: "C"
  },
  {
    id: 4,
    type: "multiple_choice",
    text: TEXTO_1 + "O que Bolinha bebe pela manhã?",
    tip: "A última frase do texto conta o que ele toma logo cedo. Releia com atenção.",
    funFact: "Na verdade, muitos gatos adultos não digerem bem o leite de vaca — mas na história, Bolinha adora!",
    points: 1,
    options: [
      { id: "A", text: "Suco" },
      { id: "B", text: "Água" },
      { id: "C", text: "Leite" },
      { id: "D", text: "Chá" }
    ],
    correctAnswer: "C"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: TEXTO_1 + "Esse texto fala sobre:",
    tip: "Pense no assunto principal: sobre qual bichinho o texto conta coisas do dia a dia dele?",
    funFact: "Textos que contam características e hábitos de alguém ou de algo se chamam \"textos descritivos\"!",
    points: 1,
    options: [
      { id: "A", text: "Um cachorro brincalhão" },
      { id: "B", text: "Um gatinho e seus hábitos" },
      { id: "C", text: "Uma festa de aniversário" },
      { id: "D", text: "Um passeio no parque" }
    ],
    correctAnswer: "B"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: TEXTO_1 + "Quantas vezes por dia Bolinha bebe leite, segundo o texto?",
    tip: "Releia a última frase: ela fala em qual momento do dia isso acontece.",
    funFact: "Muitos animais têm uma rotina bem certinha, repetindo os mesmos hábitos todos os dias — igual ao Bolinha!",
    points: 1,
    options: [
      { id: "A", text: "Duas vezes" },
      { id: "B", text: "Três vezes" },
      { id: "C", text: "Uma vez, pela manhã" },
      { id: "D", text: "O texto não diz" }
    ],
    correctAnswer: "C"
  },
  {
    id: 7,
    type: "multiple_choice",
    text: TEXTO_1 + "A palavra \"Bolinha\" nesse texto é:",
    tip: "Pense: essa palavra está identificando quem é o personagem da história.",
    funFact: "Dar nomes aos animais de estimação é uma tradição antiga — os egípcios já davam nomes carinhosos aos seus gatos há milhares de anos!",
    points: 1,
    options: [
      { id: "A", text: "O nome do gato" },
      { id: "B", text: "Uma cor" },
      { id: "C", text: "Um lugar" },
      { id: "D", text: "Uma comida" }
    ],
    correctAnswer: "A"
  },
  {
    id: 8,
    type: "multiple_choice",
    text: TEXTO_1 + "Esse tipo de texto, que conta como é um personagem, se chama:",
    tip: "Pense: o texto está descrevendo as características e os costumes do gatinho.",
    funFact: "Descrever bem um personagem ajuda o leitor a imaginar exatamente como ele é, como se estivesse vendo uma fotografia com palavras!",
    points: 1,
    options: [
      { id: "A", text: "Lista de compras" },
      { id: "B", text: "Texto descritivo" },
      { id: "C", text: "Receita de bolo" },
      { id: "D", text: "Convite de festa" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: TEXTO_2 + "Em que dia aconteceu a festa?",
    tip: "O dia da festa é dito logo na primeira palavra do texto. Releia o começo.",
    funFact: "O sábado e o domingo são chamados de \"fim de semana\" porque, há muito tempo, marcam o fim da semana de trabalho e o início do descanso!",
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
    id: 10,
    type: "multiple_choice",
    text: TEXTO_2 + "Quem Joãozinho convidou para a festa?",
    tip: "O texto diz exatamente quem recebeu o convite. Releia a segunda frase.",
    funFact: "Convidar amigos para comemorar momentos especiais é uma tradição em quase todas as culturas do mundo!",
    points: 1,
    options: [
      { id: "A", text: "Os vizinhos" },
      { id: "B", text: "Os primos" },
      { id: "C", text: "Os amigos da escola" },
      { id: "D", text: "Os professores" }
    ],
    correctAnswer: "C"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: TEXTO_2 + "Que tipo de bolo eles comeram?",
    tip: "A última frase conta o sabor do bolo que todos comeram. Releia com atenção.",
    funFact: "O bolo de chocolate é um dos sabores mais pedidos em festas de aniversário no Brasil inteiro!",
    points: 1,
    options: [
      { id: "A", text: "Bolo de cenoura" },
      { id: "B", text: "Bolo de chocolate" },
      { id: "C", text: "Bolo de fubá" },
      { id: "D", text: "Bolo de morango" }
    ],
    correctAnswer: "B"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: TEXTO_2 + "Onde as crianças brincaram?",
    tip: "O texto conta o lugar da brincadeira bem no finalzinho. Releia a última frase.",
    funFact: "Brincar ao ar livre, como num jardim, ajuda as crianças a se exercitarem e tomarem um solzinho saudável!",
    points: 1,
    options: [
      { id: "A", text: "Na sala" },
      { id: "B", text: "No jardim" },
      { id: "C", text: "Na cozinha" },
      { id: "D", text: "No quarto" }
    ],
    correctAnswer: "B"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: TEXTO_2 + "Esse texto conta sobre:",
    tip: "Pense no assunto principal: o texto todo gira em torno de um acontecimento especial de quem?",
    funFact: "Textos que contam um acontecimento, do início ao fim, se chamam \"textos narrativos\"!",
    points: 1,
    options: [
      { id: "A", text: "Uma receita de bolo" },
      { id: "B", text: "Uma festa de Joãozinho" },
      { id: "C", text: "Um dia de aula" },
      { id: "D", text: "Uma viagem de férias" }
    ],
    correctAnswer: "B"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: TEXTO_2 + "O que as crianças fizeram além de comer bolo?",
    tip: "A última frase fala em duas coisas que aconteceram: comer bolo e... o quê mais?",
    funFact: "Brincar é tão importante para as crianças que a ONU considera isso um direito de toda criança no mundo!",
    points: 1,
    options: [
      { id: "A", text: "Assistiram televisão" },
      { id: "B", text: "Brincaram muito" },
      { id: "C", text: "Dormiram" },
      { id: "D", text: "Estudaram" }
    ],
    correctAnswer: "B"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: TEXTO_2 + "Qual é o nome do aniversariante (personagem principal)?",
    tip: "O nome dele aparece logo na primeira frase, fazendo a festa.",
    funFact: "Nomes terminados em \"-inho\" ou \"-inha\" são chamados de \"diminutivos\" e mostram carinho, como um jeitinho afetuoso de chamar alguém!",
    points: 1,
    options: [
      { id: "A", text: "Pedrinho" },
      { id: "B", text: "Joãozinho" },
      { id: "C", text: "Marquinhos" },
      { id: "D", text: "Luizinho" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: TEXTO_2 + "Esse texto está contando um fato que:",
    tip: "Preste atenção na primeira palavra do texto: \"No sábado\" — isso já passou ou ainda vai acontecer?",
    funFact: "Quando contamos algo que já aconteceu, usamos palavras como \"fez\", \"comeram\" e \"brincaram\" — elas mostram uma ação no passado!",
    points: 1,
    options: [
      { id: "A", text: "Vai acontecer no futuro" },
      { id: "B", text: "Já aconteceu, no passado" },
      { id: "C", text: "Está acontecendo agora, nesse instante" },
      { id: "D", text: "Nunca aconteceu" }
    ],
    correctAnswer: "B"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: TEXTO_3 + "Qual é o nome do animal de estimação?",
    tip: "O nome do bichinho está logo na primeira frase do texto.",
    funFact: "\"Rex\" significa \"rei\" em latim — um nome bem forte e comum para cachorros grandes!",
    points: 1,
    options: [
      { id: "A", text: "Rex" },
      { id: "B", text: "Bolt" },
      { id: "C", text: "Totó" },
      { id: "D", text: "Max" }
    ],
    correctAnswer: "A"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: TEXTO_3 + "Que tipo de animal é Rex?",
    tip: "A segunda frase conta exatamente que bicho é o Rex. Releia com calma.",
    funFact: "Os cachorros foram os primeiros animais a serem domesticados pelos humanos, há mais de 15 mil anos!",
    points: 1,
    options: [
      { id: "A", text: "Um gato" },
      { id: "B", text: "Um cachorro" },
      { id: "C", text: "Um passarinho" },
      { id: "D", text: "Um peixe" }
    ],
    correctAnswer: "B"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: TEXTO_3 + "Como é o Rex, segundo o texto?",
    tip: "A descrição do tamanho e do pelo dele está bem na segunda frase.",
    funFact: "Cachorros de pelo grosso e peludo, como muitos Rex por aí, costumam se dar melhor em lugares mais frios!",
    points: 1,
    options: [
      { id: "A", text: "Pequeno e magro" },
      { id: "B", text: "Grande e peludo" },
      { id: "C", text: "Colorido e pequeno" },
      { id: "D", text: "Fino e liso" }
    ],
    correctAnswer: "B"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: TEXTO_3 + "O que Rex adora fazer no quintal?",
    tip: "A última frase conta a brincadeira favorita dele lá fora. Releia com atenção.",
    funFact: "Muitos cachorros adoram correr atrás de bolas porque isso lembra o instinto natural deles de perseguir e caçar!",
    points: 1,
    options: [
      { id: "A", text: "Dormir o dia todo" },
      { id: "B", text: "Correr atrás da bola" },
      { id: "C", text: "Comer flores" },
      { id: "D", text: "Cavar buracos" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: TEXTO_3 + "Quando Rex late, segundo o texto?",
    tip: "O finalzinho do texto conta exatamente o motivo do latido dele. Releia a última parte.",
    funFact: "O latido é uma das formas que os cachorros usam para \"conversar\" e avisar a família sobre coisas diferentes, como visitas chegando!",
    points: 1,
    options: [
      { id: "A", text: "Quando quer comer" },
      { id: "B", text: "Quando alguém bate na porta" },
      { id: "C", text: "Quando está com sono" },
      { id: "D", text: "Quando vê outro cachorro" }
    ],
    correctAnswer: "B"
  },
  {
    id: 22,
    type: "multiple_choice",
    text: TEXTO_3 + "Esse texto está descrevendo:",
    tip: "Pense: o texto conta como o Rex é e o que ele gosta de fazer — isso é uma descrição de quê?",
    funFact: "Descrever um animal de estimação com detalhes ajuda quem lê a \"conhecer\" o bichinho, mesmo sem vê-lo!",
    points: 1,
    options: [
      { id: "A", text: "Uma receita" },
      { id: "B", text: "As características de um cachorro" },
      { id: "C", text: "Um passeio na praia" },
      { id: "D", text: "Uma festa" }
    ],
    correctAnswer: "B"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: TEXTO_3 + "Quem é o dono do Rex, segundo o texto?",
    tip: "A primeira palavra do texto é \"Meu\" — isso mostra que quem está contando a história é o dono do cachorro.",
    funFact: "Quando alguém conta uma história usando \"eu\" ou \"meu\", dizemos que o texto está em \"primeira pessoa\"!",
    points: 1,
    options: [
      { id: "A", text: "Uma menina chamada Ana" },
      { id: "B", text: "A pessoa que está contando a história (\"Meu animal de estimação...\")" },
      { id: "C", text: "Um vizinho" },
      { id: "D", text: "O texto não fala sobre isso" }
    ],
    correctAnswer: "B"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: TEXTO_4 + "Como estava o tempo, segundo o texto?",
    tip: "A primeira frase já conta como estava o dia. Releia com atenção.",
    funFact: "As nuvens de chuva são formadas por gotinhas de água tão pequenas que ficam flutuando no ar até ficarem pesadas o bastante para cair!",
    points: 1,
    options: [
      { id: "A", text: "Ensolarado" },
      { id: "B", text: "Chovendo" },
      { id: "C", text: "Nevando" },
      { id: "D", text: "Ventando" }
    ],
    correctAnswer: "B"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: TEXTO_4 + "O que ficou nas ruas depois da chuva?",
    tip: "A segunda frase conta o que apareceu nas ruas molhadas.",
    funFact: "Pular em poças é uma das brincadeiras favoritas de crianças no mundo inteiro nos dias de chuva!",
    points: 1,
    options: [
      { id: "A", text: "Folhas secas" },
      { id: "B", text: "Poças de água" },
      { id: "C", text: "Neve" },
      { id: "D", text: "Vento forte" }
    ],
    correctAnswer: "B"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: TEXTO_4 + "De que cor eram as botas de Mariana?",
    tip: "A cor das botas está bem no finalzinho do texto. Releia a última frase.",
    funFact: "Botas de chuva amarelas são bem populares porque essa cor é fácil de enxergar, mesmo em dias cinzentos!",
    points: 1,
    options: [
      { id: "A", text: "Vermelhas" },
      { id: "B", text: "Azuis" },
      { id: "C", text: "Amarelas" },
      { id: "D", text: "Verdes" }
    ],
    correctAnswer: "C"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: TEXTO_4 + "Como Mariana se sentiu ao pular nas poças?",
    tip: "A última palavra do texto conta exatamente o sentimento dela. Releia o final.",
    funFact: "Brincar na chuva, com a roupa certa para não pegar frio, pode ser uma diversão e tanto — e ainda ajuda a extravasar energia!",
    points: 1,
    options: [
      { id: "A", text: "Triste" },
      { id: "B", text: "Com medo" },
      { id: "C", text: "Feliz" },
      { id: "D", text: "Com raiva" }
    ],
    correctAnswer: "C"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: TEXTO_4 + "Esse texto conta sobre:",
    tip: "Pense no assunto principal: quem é a personagem e o que ela fez durante o dia?",
    funFact: "Muitas histórias infantis usam dias de chuva como cenário para mostrar que até um dia \"ruim\" pode virar uma aventura divertida!",
    points: 1,
    options: [
      { id: "A", text: "Uma menina brincando num dia de chuva" },
      { id: "B", text: "Uma viagem de avião" },
      { id: "C", text: "Uma receita de bolo" },
      { id: "D", text: "Um jogo de futebol" }
    ],
    correctAnswer: "A"
  },
  {
    id: 29,
    type: "multiple_choice",
    text: TEXTO_4 + "Quem é a personagem principal desse texto?",
    tip: "O nome da menina que pula nas poças aparece na última frase do texto.",
    funFact: "Em histórias, a personagem principal é chamada de \"protagonista\" — é quem vive a aventura contada!",
    points: 1,
    options: [
      { id: "A", text: "Rex" },
      { id: "B", text: "Joãozinho" },
      { id: "C", text: "Mariana" },
      { id: "D", text: "Bolinha" }
    ],
    correctAnswer: "C"
  },
  {
    id: 30,
    type: "multiple_choice",
    text: TEXTO_4 + "O texto acontece durante:",
    tip: "Releia a primeira frase: ela já revela como estava o tempo naquele dia.",
    funFact: "No Brasil, a estação com mais chuvas costuma ser o verão, principalmente em dezembro, janeiro e fevereiro!",
    points: 1,
    options: [
      { id: "A", text: "Um dia de sol forte" },
      { id: "B", text: "Um dia de chuva" },
      { id: "C", text: "Uma noite de tempestade com trovões" },
      { id: "D", text: "Um dia de neve" }
    ],
    correctAnswer: "B"
  }
];

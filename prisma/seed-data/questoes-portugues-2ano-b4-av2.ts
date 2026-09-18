const BORBOLETAS = "Texto: \"As borboletas são insetos coloridos e muito bonitos. Elas começam a vida como pequenas lagartas, que comem bastante para crescer. Depois de um tempo, a lagarta forma um casulo, chamado de crisálida. Dentro dele, acontece uma grande transformação, até que, finalmente, uma linda borboleta sai voando.\"\n\n";
const BEATRIZ = "Texto: \"Beatriz adorava desenhar, mas sempre achava que seus desenhos não eram bons o suficiente. Um dia, sua professora organizou uma exposição de arte na escola. Com o coração acelerado, Beatriz decidiu participar, mesmo com medo do que os outros pensariam. Para sua surpresa, todos elogiaram muito seu desenho de um pôr do sol. Beatriz aprendeu que, às vezes, precisamos arriscar para descobrir do que realmente somos capazes.\"\n\n";

export const questoesPortugues2AnoB4Av2 = [
  {
    id: 1,
    type: "multiple_choice",
    text: BORBOLETAS + "Sobre o que fala esse texto?",
    tip: "Pense: qual é o assunto principal, repetido ao longo de todo o texto?",
    funFact: "As borboletas existem há milhões de anos, e há mais de 20 mil espécies diferentes catalogadas no mundo!",
    points: 1,
    options: [
      { id: "A", text: "Sobre as borboletas" },
      { id: "B", text: "Sobre os cachorros" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Sobre as plantas" }
    ],
    correctAnswer: "A"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: BORBOLETAS + "Como começa a vida de uma borboleta, segundo o texto?",
    tip: "Pense: a segunda frase do texto conta a primeira fase da vida da borboleta.",
    funFact: "As lagartas comem muitas folhas para conseguirem crescer e se transformar depois!",
    points: 1,
    options: [
      { id: "A", text: "Como uma pequena lagarta" },
      { id: "B", text: "Já como uma borboleta adulta" },
      { id: "C", text: "Como um ovo apenas, sem virar lagarta" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 3,
    type: "multiple_choice",
    text: BORBOLETAS + "O que a lagarta faz depois de crescer bastante?",
    tip: "Pense: a terceira frase do texto conta o que acontece depois que a lagarta cresce.",
    funFact: "O casulo protege a lagarta durante toda essa grande transformação que está acontecendo dentro dele!",
    points: 1,
    options: [
      { id: "A", text: "Forma um casulo (crisálida)" },
      { id: "B", text: "Vira uma borboleta instantaneamente, sem nenhum processo" },
      { id: "C", text: "Volta a ser um ovo" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 4,
    type: "multiple_choice",
    text: BORBOLETAS + "O que acontece dentro do casulo?",
    tip: "Pense: o texto conta que, dentro do casulo, acontece algo muito especial e importante.",
    funFact: "Esse processo de transformação é chamado de \"metamorfose\", uma das coisas mais incríveis da natureza!",
    points: 1,
    options: [
      { id: "A", text: "Uma grande transformação" },
      { id: "B", text: "Nada acontece" },
      { id: "C", text: "A lagarta dorme sem mudar nada" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: BORBOLETAS + "O que sai do casulo, no final do processo?",
    tip: "Pense: a última frase do texto conta o resultado final dessa grande transformação.",
    funFact: "Ver uma borboleta saindo do casulo é um dos espetáculos mais bonitos que a natureza pode oferecer!",
    points: 1,
    options: [
      { id: "A", text: "Uma borboleta" },
      { id: "B", text: "Outra lagarta igual" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Um ovo" }
    ],
    correctAnswer: "A"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: BORBOLETAS + "O nome do casulo formado pela lagarta é:",
    tip: "Pense: o texto usa uma palavra específica para nomear esse casulo. Releia com atenção.",
    funFact: "A palavra \"crisálida\" vem do grego e tem relação com a cor dourada que alguns casulos apresentam!",
    points: 1,
    options: [
      { id: "A", text: "Crisálida" },
      { id: "B", text: "Ninho" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Colmeia" }
    ],
    correctAnswer: "A"
  },
  {
    id: 7,
    type: "multiple_choice",
    text: BORBOLETAS + "Esse texto é do tipo:",
    tip: "Pense: esse texto está contando informações reais sobre um processo, ou inventando uma história com moral?",
    funFact: "Textos informativos são muito usados para explicar fatos e processos do mundo real, como a metamorfose das borboletas!",
    points: 1,
    options: [
      { id: "A", text: "Informativo, explicando um processo da natureza" },
      { id: "B", text: "Uma fábula com moral" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Uma lista de compras" }
    ],
    correctAnswer: "A"
  },
  {
    id: 8,
    type: "multiple_choice",
    text: BORBOLETAS + "Qual é a ordem correta do processo descrito no texto?",
    tip: "Pense na ordem em que o texto descreve cada etapa da vida da borboleta.",
    funFact: "Colocar as etapas em ordem ajuda a entender melhor esse processo tão especial da natureza!",
    points: 1,
    options: [
      { id: "A", text: "Lagarta → casulo → borboleta" },
      { id: "B", text: "Borboleta → lagarta → casulo" },
      { id: "C", text: "Casulo → borboleta → lagarta" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: "Esse processo de transformação da lagarta em borboleta é chamado de:",
    tip: "Essa é uma informação extra: esse processo tem um nome científico especial, usado para descrever grandes transformações na natureza.",
    funFact: "A metamorfose também acontece com outros animais, como os sapos, que começam como girinos!",
    points: 1,
    options: [
      { id: "A", text: "Metamorfose" },
      { id: "B", text: "Nenhuma das opções" },
      { id: "C", text: "Germinação" },
      { id: "D", text: "Fotossíntese" }
    ],
    correctAnswer: "A"
  },
  {
    id: 10,
    type: "multiple_choice",
    text: BORBOLETAS + "Depois de ler esse texto informativo, podemos concluir que ele serve para:",
    tip: "Pense em tudo que você aprendeu: lagarta, casulo, borboleta — esse texto ensina sobre o quê, de forma clara e organizada?",
    funFact: "Parabéns por interpretar esse texto informativo sobre as borboletas!",
    points: 1,
    options: [
      { id: "A", text: "Explicar, de forma clara, como acontece a vida das borboletas" },
      { id: "B", text: "Nenhuma finalidade específica" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Apenas divertir, sem nenhuma informação real" }
    ],
    correctAnswer: "A"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: "Sinônimos são palavras que:",
    tip: "Pense em \"feliz\" e \"alegre\" — elas têm significados parecidos ou opostos?",
    funFact: "Usar sinônimos ajuda a deixar os textos mais variados, evitando repetir sempre a mesma palavra!",
    points: 1,
    options: [
      { id: "A", text: "Têm significados parecidos" },
      { id: "B", text: "Têm significados opostos" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Sempre começam com a mesma letra" }
    ],
    correctAnswer: "A"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: "Antônimos são palavras que:",
    tip: "Pense em \"quente\" e \"frio\" — elas têm significados parecidos ou completamente opostos?",
    funFact: "Os antônimos ajudam a mostrar contrastes, como \"grande\" e \"pequeno\", ou \"dia\" e \"noite\"!",
    points: 1,
    options: [
      { id: "A", text: "Têm significados opostos" },
      { id: "B", text: "Têm significados parecidos" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Sempre têm o mesmo tamanho" }
    ],
    correctAnswer: "A"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: "Qual destas palavras é sinônimo de \"feliz\"?",
    tip: "Pense: qual dessas palavras tem um significado parecido com \"feliz\"?",
    funFact: "\"Alegre\" e \"feliz\" podem ser usadas quase da mesma forma em muitas frases!",
    points: 1,
    options: [
      { id: "A", text: "Alegre" },
      { id: "B", text: "Triste" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Bravo" }
    ],
    correctAnswer: "A"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: "Qual destas palavras é antônimo de \"grande\"?",
    tip: "Pense: qual dessas palavras tem o significado completamente oposto de \"grande\"?",
    funFact: "\"Pequeno\" é o antônimo perfeito de \"grande\", representando tamanhos opostos!",
    points: 1,
    options: [
      { id: "A", text: "Enorme" },
      { id: "B", text: "Pequeno" },
      { id: "C", text: "Gigante" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "B"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: "Qual destas palavras é sinônimo de \"bonito\"?",
    tip: "Pense: qual dessas palavras tem um significado bem parecido com \"bonito\"?",
    funFact: "\"Lindo\" e \"bonito\" podem ser usadas de forma bem parecida para elogiar algo!",
    points: 1,
    options: [
      { id: "A", text: "Feio" },
      { id: "B", text: "Lindo" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Triste" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: "Qual destas palavras é antônimo de \"quente\"?",
    tip: "Pense: qual dessas palavras representa uma temperatura completamente oposta à do \"quente\"?",
    funFact: "\"Frio\" e \"quente\" são antônimos muito usados para descrever temperaturas!",
    points: 1,
    options: [
      { id: "A", text: "Morno" },
      { id: "B", text: "Frio" },
      { id: "C", text: "Ardente" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "B"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: "Qual destas palavras é antônimo de \"rápido\"?",
    tip: "Pense: qual dessas palavras representa uma velocidade completamente oposta à de \"rápido\"?",
    funFact: "\"Devagar\" e \"rápido\" são antônimos que descrevem velocidades diferentes de movimento!",
    points: 1,
    options: [
      { id: "A", text: "Veloz" },
      { id: "B", text: "Ligeiro" },
      { id: "C", text: "Devagar" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "C"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: "Qual destas palavras é sinônimo de \"triste\"?",
    tip: "Pense: qual dessas palavras tem um significado parecido com \"triste\"?",
    funFact: "\"Chateado\" e \"triste\" podem descrever sentimentos parecidos de tristeza!",
    points: 1,
    options: [
      { id: "A", text: "Alegre" },
      { id: "B", text: "Chateado" },
      { id: "C", text: "Feliz" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "B"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: "Complete a frase usando um antônimo de \"noite\": \"De noite, ficamos em casa, mas de ___, saímos para brincar.\"",
    tip: "Pense: o antônimo (oposto) de \"noite\" é qual palavra?",
    funFact: "\"Dia\" e \"noite\" são antônimos que representam os dois principais períodos que se alternam ao longo de 24 horas!",
    points: 1,
    options: [
      { id: "A", text: "Dia" },
      { id: "B", text: "Nenhuma das opções" },
      { id: "C", text: "Manhã apenas" },
      { id: "D", text: "Tarde apenas" }
    ],
    correctAnswer: "A"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: "Depois de aprender sobre sinônimos e antônimos, podemos concluir que:",
    tip: "Pense em tudo que você aprendeu: \"feliz/alegre\" (sinônimos) e \"grande/pequeno\" (antônimos) — qual é a diferença entre esses dois conceitos?",
    funFact: "Parabéns por aprender sobre sinônimos e antônimos!",
    points: 1,
    options: [
      { id: "A", text: "Sinônimos são parecidos e antônimos são opostos" },
      { id: "B", text: "Sinônimos e antônimos são exatamente a mesma coisa" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Não existe diferença entre eles" }
    ],
    correctAnswer: "A"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: BEATRIZ + "O que Beatriz adorava fazer?",
    tip: "Pense: a primeira frase do texto conta a atividade favorita de Beatriz.",
    funFact: "O desenho é uma forma de arte que ajuda a expressar sentimentos e ideias de um jeito bem criativo!",
    points: 1,
    options: [
      { id: "A", text: "Desenhar" },
      { id: "B", text: "Cantar" },
      { id: "C", text: "Nadar" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 22,
    type: "multiple_choice",
    text: BEATRIZ + "Qual era o sentimento de Beatriz em relação aos próprios desenhos, no início da história?",
    tip: "Pense: a primeira frase do texto conta como Beatriz se sentia em relação à qualidade dos próprios desenhos.",
    funFact: "Muitas pessoas talentosas, às vezes, duvidam de suas próprias habilidades — isso é chamado de insegurança!",
    points: 1,
    options: [
      { id: "A", text: "Ela achava que não eram bons o suficiente" },
      { id: "B", text: "Ela achava que eram perfeitos" },
      { id: "C", text: "Ela não se importava com os desenhos" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: BEATRIZ + "O que a professora organizou na escola?",
    tip: "Pense: a segunda frase do texto conta o evento especial organizado pela professora.",
    funFact: "Exposições de arte são ótimas oportunidades para os alunos mostrarem seus talentos e criatividade!",
    points: 1,
    options: [
      { id: "A", text: "Uma exposição de arte" },
      { id: "B", text: "Uma prova de matemática" },
      { id: "C", text: "Um jogo de futebol" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: BEATRIZ + "Como Beatriz se sentia ao decidir participar da exposição?",
    tip: "Pense: o texto descreve um sentimento físico de nervosismo — \"coração acelerado\" representa o quê?",
    funFact: "Sentir o coração acelerado é uma reação comum quando estamos nervosos ou ansiosos por algo importante!",
    points: 1,
    options: [
      { id: "A", text: "Com o coração acelerado (nervosa/ansiosa)" },
      { id: "B", text: "Completamente calma, sem nenhum nervosismo" },
      { id: "C", text: "Sem nenhum sentimento especial" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: BEATRIZ + "O que aconteceu quando Beatriz mostrou seu desenho na exposição?",
    tip: "Pense: a parte final do texto conta a reação positiva e surpreendente das pessoas ao verem o desenho dela.",
    funFact: "Receber elogios por um trabalho que fizemos com dedicação é uma sensação muito boa!",
    points: 1,
    options: [
      { id: "A", text: "Todos elogiaram muito seu desenho" },
      { id: "B", text: "Todos criticaram o desenho" },
      { id: "C", text: "Ninguém percebeu o desenho" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: BEATRIZ + "O desenho de Beatriz retratava:",
    tip: "Pense: o texto conta especificamente qual era o tema do desenho elogiado.",
    funFact: "Pores do sol são um tema muito popular na arte, por causa das cores lindas que aparecem no céu!",
    points: 1,
    options: [
      { id: "A", text: "Um pôr do sol" },
      { id: "B", text: "Um cachorro" },
      { id: "C", text: "Uma casa" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: BEATRIZ + "Qual foi a lição que Beatriz aprendeu com essa experiência?",
    tip: "Pense: a última frase do texto conta exatamente a lição que Beatriz tirou dessa experiência.",
    funFact: "Essa é uma lição valiosa: enfrentar nossos medos pode nos levar a descobertas maravilhosas sobre nós mesmos!",
    points: 1,
    options: [
      { id: "A", text: "Que, às vezes, precisamos arriscar para descobrir do que somos capazes" },
      { id: "B", text: "Que nunca devemos tentar coisas novas" },
      { id: "C", text: "Que desenhar não vale a pena" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: "Coloque em ordem os acontecimentos da história: \"1) Beatriz mostra o desenho, 2) A professora organiza a exposição, 3) Todos elogiam o desenho, 4) Beatriz decide participar com medo\". A ordem correta é:",
    tip: "Pense na ordem lógica: primeiro a professora organiza o evento, depois Beatriz decide participar, então mostra o desenho, e por fim recebe os elogios.",
    funFact: "Organizar os acontecimentos em ordem ajuda a entender melhor a sequência de qualquer história!",
    points: 1,
    options: [
      { id: "A", text: "2, 4, 1, 3" },
      { id: "B", text: "1, 2, 3, 4" },
      { id: "C", text: "4, 3, 2, 1" },
      { id: "D", text: "3, 1, 4, 2" }
    ],
    correctAnswer: "A"
  },
  {
    id: 29,
    type: "multiple_choice",
    text: BEATRIZ + "Se você fosse escrever o início de uma continuação dessa história, qual seria uma boa ideia?",
    tip: "Pense: depois de ser elogiada e ganhar mais confiança, o que seria natural que Beatriz fizesse a seguir?",
    funFact: "Imaginar continuações de histórias é uma ótima forma de praticar a criatividade na escrita!",
    points: 1,
    options: [
      { id: "A", text: "Beatriz decide fazer mais desenhos, incentivada pelo sucesso" },
      { id: "B", text: "Nenhuma continuação faria sentido com a história" },
      { id: "C", text: "Beatriz nunca mais desenha" },
      { id: "D", text: "Nenhuma das opções" }
    ],
    correctAnswer: "A"
  },
  {
    id: 30,
    type: "multiple_choice",
    text: "Depois de tudo que você aprendeu neste bimestre sobre pontuação, tipos de frases e interpretação de textos, podemos concluir que:",
    tip: "Pense em tudo que você aprendeu ao longo do ano: ortografia, gêneros textuais, substantivos, adjetivos, pontuação, interpretação — tudo isso te ajudou a se tornar um leitor e escritor melhor!",
    funFact: "Parabéns por completar TODA a Língua Portuguesa do 2º ano! Você é um verdadeiro mestre das palavras!",
    points: 1,
    options: [
      { id: "A", text: "Ler e escrever bem envolve entender regras, mas também interpretar histórias e mensagens" },
      { id: "B", text: "Nenhuma das habilidades aprendidas tem alguma relação entre si" },
      { id: "C", text: "Nenhuma das opções" },
      { id: "D", text: "Interpretação de texto não tem nenhuma relação com gramática" }
    ],
    correctAnswer: "A"
  }
];

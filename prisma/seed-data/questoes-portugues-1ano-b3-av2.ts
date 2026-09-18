const BILHETE = "Bilhete: \"Mamãe, fui brincar na casa da Júlia. Volto às 17h. Beijos, Pedro.\"\n\n";
const LISTA = "Lista: \"Lista de compras: leite, pão, banana, ovos.\"\n\n";
const CONVITE = "Convite: \"Você está convidado para a festa da Laura! Dia: sábado. Horário: 15h. Local: Rua das Flores, 123.\"\n\n";

export const questoesPortugues1AnoB3Av2 = [
  {
    id: 1,
    type: "multiple_choice",
    text: BILHETE + "Quem escreveu esse bilhete?",
    tip: "Procure o nome no finalzinho do bilhete — quem assina é quem escreveu.",
    funFact: "Antes dos celulares existirem, os bilhetes eram a forma mais rápida de avisar alguém de algo, deixando um papel num lugar visível!",
    points: 1,
    options: [
      { id: "A", text: "A mamãe" },
      { id: "B", text: "Pedro" },
      { id: "C", text: "Júlia" },
      { id: "D", text: "A professora" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: BILHETE + "Para quem é esse bilhete?",
    tip: "A primeira palavra do bilhete já diz para quem ele está sendo endereçado.",
    funFact: "Os bilhetes geralmente começam com o nome de quem vai recebê-lo — é como dizer \"oi\" antes de contar a novidade!",
    points: 1,
    options: [
      { id: "A", text: "Para a Júlia" },
      { id: "B", text: "Para a mamãe" },
      { id: "C", text: "Para o Pedro" },
      { id: "D", text: "Para a vovó" }
    ],
    correctAnswer: "B"
  },
  {
    id: 3,
    type: "multiple_choice",
    text: BILHETE + "Onde Pedro foi?",
    tip: "O bilhete conta exatamente o lugar para onde ele foi. Releia a primeira frase.",
    funFact: "Avisar para onde vamos é uma forma de cuidado — assim, quem fica em casa sabe onde nos encontrar, se precisar!",
    points: 1,
    options: [
      { id: "A", text: "Para a escola" },
      { id: "B", text: "Para a casa da Júlia" },
      { id: "C", text: "Para o parque" },
      { id: "D", text: "Para o médico" }
    ],
    correctAnswer: "B"
  },
  {
    id: 4,
    type: "multiple_choice",
    text: BILHETE + "A que horas Pedro disse que ia voltar?",
    tip: "O horário está escrito bem no meio do bilhete. Releia com atenção.",
    funFact: "Combinar um horário de volta é um jeito de mostrar responsabilidade, mesmo sendo criança!",
    points: 1,
    options: [
      { id: "A", text: "15h" },
      { id: "B", text: "16h" },
      { id: "C", text: "17h" },
      { id: "D", text: "18h" }
    ],
    correctAnswer: "C"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: "Um bilhete serve para:",
    tip: "Pense: bilhetes costumam ser curtos ou longos? E o que eles avisam?",
    funFact: "A palavra \"bilhete\" vem do francês antigo e já foi usada até para pequenos papéis de sorte, parecidos com os biscoitos da sorte!",
    points: 1,
    options: [
      { id: "A", text: "Contar uma história longa" },
      { id: "B", text: "Dar um recado rápido para alguém" },
      { id: "C", text: "Fazer uma lista de compras" },
      { id: "D", text: "Convidar para uma festa grande" }
    ],
    correctAnswer: "B"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: BILHETE + "Qual destas é uma característica de um bilhete?",
    tip: "Pense no bilhete do Pedro: ele era bem grande ou bem curtinho e rápido de ler?",
    funFact: "Quanto mais direto e claro um bilhete for, mais fácil fica para quem recebe entender rapidinho o recado!",
    points: 1,
    options: [
      { id: "A", text: "É bem curtinho e direto" },
      { id: "B", text: "Tem sempre mais de 10 páginas" },
      { id: "C", text: "Precisa ter só desenhos, sem palavras" },
      { id: "D", text: "Só pode ser escrito por adultos" }
    ],
    correctAnswer: "A"
  },
  {
    id: 7,
    type: "multiple_choice",
    text: BILHETE + "No bilhete, a palavra \"Beijos\" antes da assinatura mostra:",
    tip: "Pense: quando alguém manda \"beijos\" para você, isso demonstra um sentimento bom ou ruim?",
    funFact: "Terminar um bilhete ou carta com uma palavra carinhosa é uma tradição bem antiga, para deixar uma mensagem mais gostosa de ler!",
    points: 1,
    options: [
      { id: "A", text: "Raiva" },
      { id: "B", text: "Carinho" },
      { id: "C", text: "Tristeza" },
      { id: "D", text: "Medo" }
    ],
    correctAnswer: "B"
  },
  {
    id: 8,
    type: "multiple_choice",
    text: "Se você fosse avisar sua mãe que foi à casa de um amigo, o texto ideal para isso seria:",
    tip: "Pense no bilhete do Pedro: ele fez exatamente isso — avisou rapidinho para onde foi.",
    funFact: "Mesmo hoje em dia, com celular, muita gente ainda deixa bilhetinhos na geladeira de casa — é um costume que não sai de moda!",
    points: 1,
    options: [
      { id: "A", text: "Uma lista de compras" },
      { id: "B", text: "Um bilhete" },
      { id: "C", text: "Uma receita" },
      { id: "D", text: "Um poema" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: BILHETE + "O bilhete do Pedro tem quantas informações principais (para onde foi, a que horas volta e quem escreveu)?",
    tip: "Conte: lugar que foi, horário de volta e assinatura — quantas coisas diferentes são essas?",
    funFact: "Bilhetes bem-organizados sempre respondem às perguntas \"o quê\", \"quando\" e \"quem\" — assim ninguém fica com dúvida!",
    points: 1,
    options: [
      { id: "A", text: "Uma" },
      { id: "B", text: "Duas" },
      { id: "C", text: "Três" },
      { id: "D", text: "Nenhuma" }
    ],
    correctAnswer: "C"
  },
  {
    id: 10,
    type: "multiple_choice",
    text: "Por que é importante deixar um bilhete antes de sair de casa sozinho?",
    tip: "Pense em como a família se sente quando sabe para onde você foi, comparado a quando não sabe de nada.",
    funFact: "Avisar para onde vamos é um hábito que os bombeiros e a polícia também recomendam para a segurança de todo mundo!",
    points: 1,
    options: [
      { id: "A", text: "Para ninguém saber de nada" },
      { id: "B", text: "Para avisar e deixar a família tranquila" },
      { id: "C", text: "Para enfeitar a casa" },
      { id: "D", text: "Para fazer bagunça" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: LISTA + "Essa lista serve para:",
    tip: "Pense: quando você vai ao mercado, o que ajuda a não esquecer nada?",
    funFact: "Fazer listas de compras existe há muito tempo — até os antigos egípcios já faziam listas em pedaços de papiro!",
    points: 1,
    options: [
      { id: "A", text: "Contar uma história" },
      { id: "B", text: "Lembrar o que comprar no mercado" },
      { id: "C", text: "Convidar para uma festa" },
      { id: "D", text: "Avisar um horário" }
    ],
    correctAnswer: "B"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: LISTA + "Quantos itens tem essa lista de compras?",
    tip: "Conte cada palavra separada por vírgula: leite, pão, banana, ovos.",
    funFact: "Fazer listas ajuda a organizar as ideias e economizar tempo — assim ninguém esquece nada importante no mercado!",
    points: 1,
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "5" }
    ],
    correctAnswer: "C"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: LISTA + "Qual destes itens NÃO está na lista?",
    tip: "Releia a lista com calma e procure cada uma das opções nela. Uma delas não aparece!",
    funFact: "Muita gente organiza as listas de compras por tipo de alimento, como \"frutas\", \"laticínios\" e \"padaria\", para facilitar ainda mais!",
    points: 1,
    options: [
      { id: "A", text: "Leite" },
      { id: "B", text: "Pão" },
      { id: "C", text: "Queijo" },
      { id: "D", text: "Banana" }
    ],
    correctAnswer: "C"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: LISTA + "Uma lista de compras geralmente é escrita:",
    tip: "Releia a lista do exemplo: ela tem frases grandes ou só palavrinhas rápidas?",
    funFact: "Esse jeito de escrever, com palavras soltas em vez de frases completas, deixa a leitura bem mais rápida na hora da pressa!",
    points: 1,
    options: [
      { id: "A", text: "Com frases bem longas e explicadas" },
      { id: "B", text: "Com palavras soltas, uma embaixo da outra ou separadas por vírgula" },
      { id: "C", text: "Só com desenhos" },
      { id: "D", text: "Em forma de poema" }
    ],
    correctAnswer: "B"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: "Se você quisesse lembrar de levar lápis, borracha e caderno para a escola, o melhor texto seria:",
    tip: "Pense: você precisa de uma história longa ou só de um lembrete rápido dos itens?",
    funFact: "Muitos alunos fazem listas de material escolar no início do ano, para organizar tudo que vão precisar!",
    points: 1,
    options: [
      { id: "A", text: "Um convite" },
      { id: "B", text: "Uma lista" },
      { id: "C", text: "Um poema" },
      { id: "D", text: "Uma receita" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: "Qual é a vantagem de fazer uma lista antes de ir ao mercado?",
    tip: "Pense: por que as pessoas escrevem as coisas de que precisam antes de sair de casa?",
    funFact: "Estudos mostram que quem faz lista de compras costuma gastar menos, porque compra só o que realmente precisa!",
    points: 1,
    options: [
      { id: "A", text: "Não esquecer nenhum item importante" },
      { id: "B", text: "Gastar mais dinheiro" },
      { id: "C", text: "Demorar mais tempo" },
      { id: "D", text: "Confundir mais as coisas" }
    ],
    correctAnswer: "A"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: LISTA + "Na lista \"leite, pão, banana, ovos\", qual item é uma fruta?",
    tip: "Pense em qual desses itens cresce em uma árvore e é doce.",
    funFact: "A banana é uma das frutas mais consumidas do mundo, e o Brasil é um dos países que mais produz esse alimento!",
    points: 1,
    options: [
      { id: "A", text: "Leite" },
      { id: "B", text: "Pão" },
      { id: "C", text: "Banana" },
      { id: "D", text: "Ovos" }
    ],
    correctAnswer: "C"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: LISTA + "As palavras de uma lista são separadas, geralmente, por:",
    tip: "Releia a lista de compras do exemplo e observe o sinalzinho entre cada palavra.",
    funFact: "A vírgula é um dos sinais de pontuação mais usados na escrita — ela ajuda a separar ideias e itens sem precisar de frases inteiras!",
    points: 1,
    options: [
      { id: "A", text: "Pontos de interrogação" },
      { id: "B", text: "Vírgulas" },
      { id: "C", text: "Pontos de exclamação" },
      { id: "D", text: "Travessões grandes" }
    ],
    correctAnswer: "B"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: "Uma lista de tarefas serve para:",
    tip: "Pense em quando você anota \"arrumar a mochila, escovar os dentes, fazer a lição\" — para que serve isso?",
    funFact: "Riscar cada tarefa da lista depois de fazê-la dá uma sensação boa de dever cumprido — psicólogos até têm um nome para essa alegria: \"efeito de progresso\"!",
    points: 1,
    options: [
      { id: "A", text: "Contar uma piada" },
      { id: "B", text: "Organizar o que precisa ser feito" },
      { id: "C", text: "Fazer um convite" },
      { id: "D", text: "Escrever uma carta" }
    ],
    correctAnswer: "B"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: "Qual destas é uma lista, e não um bilhete?",
    tip: "Pense: qual opção tem só itens soltos, sem contar uma história ou dar um recado?",
    funFact: "Reconhecer o tipo de texto pelo seu formato é uma habilidade muito útil — cada gênero textual tem um jeitinho próprio de ser escrito!",
    points: 1,
    options: [
      { id: "A", text: "\"Mãe, vou à casa da vovó. Volto logo.\"" },
      { id: "B", text: "\"Comprar: arroz, feijão, macarrão.\"" },
      { id: "C", text: "\"Querida Ana, venha à minha festa!\"" },
      { id: "D", text: "\"Era uma vez uma princesa...\"" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: CONVITE + "Esse texto é um(a):",
    tip: "Pense: esse texto está chamando alguém para participar de um evento — isso é um convite ou uma lista?",
    funFact: "Convites existem há séculos — reis e rainhas antigos já mandavam convites bem chiques para seus bailes e festas!",
    points: 1,
    options: [
      { id: "A", text: "Lista de compras" },
      { id: "B", text: "Bilhete" },
      { id: "C", text: "Convite" },
      { id: "D", text: "Receita" }
    ],
    correctAnswer: "C"
  },
  {
    id: 22,
    type: "multiple_choice",
    text: CONVITE + "De quem é a festa?",
    tip: "O nome da aniversariante aparece logo no início do convite.",
    funFact: "Muitas famílias guardam convites de festas especiais como lembrança, colando-os em álbuns de recordação!",
    points: 1,
    options: [
      { id: "A", text: "Da Laura" },
      { id: "B", text: "Da Júlia" },
      { id: "C", text: "Da Ana" },
      { id: "D", text: "Da Mariana" }
    ],
    correctAnswer: "A"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: CONVITE + "Em que dia da semana é a festa?",
    tip: "O convite tem uma parte escrita \"Dia:\" — releia o que vem logo depois dela.",
    funFact: "Sábados e domingos são os dias mais escolhidos para festas de aniversário, porque quase ninguém tem escola ou trabalho!",
    points: 1,
    options: [
      { id: "A", text: "Domingo" },
      { id: "B", text: "Sábado" },
      { id: "C", text: "Sexta-feira" },
      { id: "D", text: "Quarta-feira" }
    ],
    correctAnswer: "B"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: CONVITE + "A que horas a festa vai começar?",
    tip: "Procure no convite a palavra \"Horário:\" e veja o número escrito logo depois.",
    funFact: "Anotar o horário certinho em um convite evita que os convidados cheguem cedo demais ou atrasados!",
    points: 1,
    options: [
      { id: "A", text: "14h" },
      { id: "B", text: "15h" },
      { id: "C", text: "16h" },
      { id: "D", text: "17h" }
    ],
    correctAnswer: "B"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: CONVITE + "Qual informação é dita no convite para as pessoas saberem onde ir?",
    tip: "Pense: qual parte do convite fala especificamente da rua e do número da casa?",
    funFact: "Saber o endereço certinho é tão importante que hoje em dia muita gente até manda a localização pelo celular junto com o convite!",
    points: 1,
    options: [
      { id: "A", text: "O horário" },
      { id: "B", text: "O dia da semana" },
      { id: "C", text: "O endereço (local)" },
      { id: "D", text: "O nome da aniversariante" }
    ],
    correctAnswer: "C"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: CONVITE + "Um convite serve para:",
    tip: "Pense no convite da Laura: ele está chamando as pessoas para quê?",
    funFact: "A palavra \"convite\" vem do latim \"invitare\", que quer dizer justamente \"chamar alguém para vir\"!",
    points: 1,
    options: [
      { id: "A", text: "Lembrar itens de compra" },
      { id: "B", text: "Chamar alguém para participar de um evento" },
      { id: "C", text: "Contar como cuidar de uma planta" },
      { id: "D", text: "Explicar uma regra de jogo" }
    ],
    correctAnswer: "B"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: "Quais informações NÃO podem faltar em um bom convite de festa?",
    tip: "Pense: se faltasse o horário ou o endereço, as pessoas conseguiriam chegar direitinho na festa?",
    funFact: "Muitos convites também incluem um pedido de confirmação, chamado de \"RSVP\" — uma sigla em francês que significa \"responda, por favor\"!",
    points: 1,
    options: [
      { id: "A", text: "Só o nome do aniversariante" },
      { id: "B", text: "Dia, horário e local" },
      { id: "C", text: "Só a lista de comidas" },
      { id: "D", text: "Só o nome de quem vai" }
    ],
    correctAnswer: "B"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: "Se você quisesse chamar seus amigos para o seu aniversário, o texto certo para isso seria:",
    tip: "Pense no convite da Laura: ele serviu exatamente para isso — chamar as pessoas para a festa dela.",
    funFact: "Fazer o próprio convite à mão, com desenhos e cores, é uma atividade bem divertida e ainda deixa a festa mais especial!",
    points: 1,
    options: [
      { id: "A", text: "Uma lista de compras" },
      { id: "B", text: "Um convite" },
      { id: "C", text: "Uma receita de bolo" },
      { id: "D", text: "Um bilhete de recado rápido para a mãe" }
    ],
    correctAnswer: "B"
  },
  {
    id: 29,
    type: "multiple_choice",
    text: CONVITE + "A frase \"Você está convidado\" aparece:",
    tip: "Releia o convite desde o início — essa frase é a primeira coisa escrita.",
    funFact: "Começar um convite chamando a pessoa diretamente, como \"Você está convidado\", deixa o convite mais pessoal e caloroso!",
    points: 1,
    options: [
      { id: "A", text: "No meio do convite" },
      { id: "B", text: "No final do convite" },
      { id: "C", text: "No começo do convite" },
      { id: "D", text: "Não aparece no convite" }
    ],
    correctAnswer: "C"
  },
  {
    id: 30,
    type: "multiple_choice",
    text: "Comparando bilhete, lista e convite, qual é a diferença principal entre eles?",
    tip: "Pense em cada exemplo que você leu: o bilhete do Pedro, a lista de compras e o convite da Laura — cada um tinha um objetivo diferente!",
    funFact: "Saber identificar para que serve cada tipo de texto é uma habilidade que vai te ajudar a ler e escrever cada vez melhor!",
    points: 1,
    options: [
      { id: "A", text: "Todos servem exatamente para a mesma coisa" },
      { id: "B", text: "Cada um tem uma função diferente: avisar, lembrar itens ou chamar para um evento" },
      { id: "C", text: "Só o convite pode ser escrito por crianças" },
      { id: "D", text: "A lista sempre é mais longa que o convite" }
    ],
    correctAnswer: "B"
  }
];

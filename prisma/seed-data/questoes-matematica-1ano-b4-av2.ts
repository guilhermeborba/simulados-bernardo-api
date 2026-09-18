const PICTOGRAMA = "Pictograma: \"Frutas preferidas da turma — Maçã: 🍎🍎🍎🍎 | Banana: 🍌🍌🍌 | Uva: 🍇🍇🍇🍇🍇🍇\" (cada desenho representa 1 criança que escolheu aquela fruta)\n\n";
const GRAFICO_BARRAS = "Gráfico de barras: \"Animais de estimação da turma: Cachorro tem uma barra de tamanho 7. Gato tem uma barra de tamanho 5. Peixe tem uma barra de tamanho 2.\" (quanto maior a barra, mais crianças têm aquele animal)\n\n";

export const questoesMatematica1AnoB4Av2 = [
  {
    id: 1,
    type: "multiple_choice",
    text: "Numa pesquisa com a turma, perguntaram qual fruta cada criança prefere. Isso é um exemplo de:",
    tip: "Pense: perguntar e anotar as respostas de várias pessoas é chamado de quê?",
    funFact: "Coletar dados é o primeiro passo para fazer pesquisas, até as bem grandes feitas por cientistas!",
    points: 1,
    options: [
      { id: "A", text: "Uma receita" },
      { id: "B", text: "Uma coleta de dados" },
      { id: "C", text: "Um jogo de futebol" },
      { id: "D", text: "Um desenho livre" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: "Depois de coletar as respostas de uma pesquisa, o próximo passo é:",
    tip: "Pense: depois de perguntar para todo mundo, o que precisamos fazer com as respostas para entender o resultado?",
    funFact: "Organizar informações em tabelas ou listas ajuda muito a enxergar padrões, como qual fruta é a mais votada!",
    points: 1,
    options: [
      { id: "A", text: "Jogar tudo fora" },
      { id: "B", text: "Organizar as respostas, contando quantas escolheram cada opção" },
      { id: "C", text: "Ignorar os resultados" },
      { id: "D", text: "Fazer só um desenho colorido" }
    ],
    correctAnswer: "B"
  },
  {
    id: 3,
    type: "multiple_choice",
    text: "Numa turma, 5 crianças disseram que preferem maçã, e 3 disseram que preferem banana. Qual fruta foi mais escolhida?",
    tip: "Compare os números: 5 é maior ou menor que 3?",
    funFact: "Comparar quantidades é a base para entender qualquer gráfico ou tabela de pesquisa!",
    points: 1,
    options: [
      { id: "A", text: "Banana" },
      { id: "B", text: "Maçã" },
      { id: "C", text: "As duas empataram" },
      { id: "D", text: "Nenhuma das duas" }
    ],
    correctAnswer: "B"
  },
  {
    id: 4,
    type: "multiple_choice",
    text: "Numa tabela de animais de estimação da turma, cada linha representa:",
    tip: "Pense: numa tabela sobre \"animais de estimação\", o que cada linha costuma organizar?",
    funFact: "Tabelas são uma das formas mais antigas de organizar informações — os egípcios antigos já usavam tabelas para contar seus produtos!",
    points: 1,
    options: [
      { id: "A", text: "Uma cor diferente" },
      { id: "B", text: "Um tipo de animal e quantas crianças têm esse animal" },
      { id: "C", text: "O nome da escola" },
      { id: "D", text: "A hora do recreio" }
    ],
    correctAnswer: "B"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: "Se numa pesquisa 4 crianças escolheram \"cachorro\" e 4 crianças escolheram \"gato\", podemos dizer que:",
    tip: "Pense: se os dois números são iguais, o que isso significa na comparação?",
    funFact: "Empates acontecem quando duas opções recebem exatamente a mesma quantidade de votos ou escolhas!",
    points: 1,
    options: [
      { id: "A", text: "Cachorro foi mais escolhido" },
      { id: "B", text: "Gato foi mais escolhido" },
      { id: "C", text: "As duas opções empataram" },
      { id: "D", text: "Ninguém escolheu nenhuma das duas" }
    ],
    correctAnswer: "C"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: "Ao organizar uma coleção de figurinhas por tipo (animais, carros, super-heróis), você está fazendo o quê?",
    tip: "Pense: separar objetos parecidos em grupos diferentes é chamado de quê?",
    funFact: "Classificar objetos por características é uma habilidade usada até por cientistas para organizar plantas, animais e outras descobertas!",
    points: 1,
    options: [
      { id: "A", text: "Uma bagunça" },
      { id: "B", text: "Uma classificação (organização por grupos)" },
      { id: "C", text: "Um desenho" },
      { id: "D", text: "Uma soma" }
    ],
    correctAnswer: "B"
  },
  {
    id: 7,
    type: "multiple_choice",
    text: "Numa tabela com o nome dos dias da semana e quantas vezes choveu em cada um, essa tabela ajuda a:",
    tip: "Pense: uma tabela sobre chuva, organizada por dia, serve para enxergar melhor o quê?",
    funFact: "Meteorologistas de verdade usam tabelas e gráficos parecidos com esse para estudar o clima e prever a previsão do tempo!",
    points: 1,
    options: [
      { id: "A", text: "Saber a cor do céu" },
      { id: "B", text: "Organizar e visualizar quando choveu mais" },
      { id: "C", text: "Contar quantos alunos tem na escola" },
      { id: "D", text: "Saber o nome dos alunos" }
    ],
    correctAnswer: "B"
  },
  {
    id: 8,
    type: "multiple_choice",
    text: "Se você quer saber qual foi o brinquedo mais votado pela turma, o melhor jeito é:",
    tip: "Pense: para ter certeza de qual opção ganhou, é preciso contar tudo certinho e comparar os números.",
    funFact: "Contar e comparar resultados é exatamente o que acontece em eleições, quando as pessoas votam para escolher representantes!",
    points: 1,
    options: [
      { id: "A", text: "Adivinhar" },
      { id: "B", text: "Contar os votos de cada brinquedo e comparar" },
      { id: "C", text: "Perguntar só para uma criança" },
      { id: "D", text: "Não perguntar para ninguém" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: "Numa lista de animais preferidos, \"cachorro\" aparece 6 vezes e \"peixe\" aparece 2 vezes. Qual é a diferença entre as duas quantidades?",
    tip: "Subtraia: 6 - 2 é igual a quanto?",
    funFact: "Calcular a diferença entre quantidades é uma ótima forma de saber \"quanto a mais\" uma opção teve sobre a outra!",
    points: 1,
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "4" },
      { id: "C", text: "6" },
      { id: "D", text: "8" }
    ],
    correctAnswer: "B"
  },
  {
    id: 10,
    type: "multiple_choice",
    text: "Organizar informações em tabelas e gráficos serve para:",
    tip: "Pense: quando as informações estão bem organizadas, fica mais fácil ou mais difícil de entender?",
    funFact: "Tabelas e gráficos são usados até em jornais e noticiários, para explicar informações importantes de um jeito mais fácil de entender!",
    points: 1,
    options: [
      { id: "A", text: "Confundir as pessoas" },
      { id: "B", text: "Facilitar o entendimento das informações" },
      { id: "C", text: "Enfeitar o caderno apenas" },
      { id: "D", text: "Substituir a matemática" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: PICTOGRAMA + "Quantas crianças escolheram maçã?",
    tip: "Conte quantos desenhos de maçã aparecem na linha da maçã.",
    funFact: "Pictogramas usam desenhos em vez de números, o que deixa a leitura mais divertida e visual!",
    points: 1,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "4" },
      { id: "C", text: "5" },
      { id: "D", text: "6" }
    ],
    correctAnswer: "B"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: PICTOGRAMA + "Quantas crianças escolheram banana?",
    tip: "Conte quantos desenhos de banana aparecem na linha da banana.",
    funFact: "A banana é uma fruta bem popular entre crianças, principalmente por ser doce e fácil de comer!",
    points: 1,
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "5" }
    ],
    correctAnswer: "B"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: PICTOGRAMA + "Quantas crianças escolheram uva?",
    tip: "Conte quantos desenhos de uva aparecem na linha da uva.",
    funFact: "As uvas crescem em cachos, exatamente como aparecem organizadas nesse pictograma!",
    points: 1,
    options: [
      { id: "A", text: "4" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "7" }
    ],
    correctAnswer: "C"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: PICTOGRAMA + "Qual fruta foi a MAIS escolhida pela turma?",
    tip: "Compare as quantidades de cada fruta: qual delas tem o maior número de desenhos?",
    funFact: "Descobrir a opção \"mais votada\" é um dos objetivos principais de se fazer um gráfico ou pictograma!",
    points: 1,
    options: [
      { id: "A", text: "Maçã" },
      { id: "B", text: "Banana" },
      { id: "C", text: "Uva" },
      { id: "D", text: "Nenhuma" }
    ],
    correctAnswer: "C"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: PICTOGRAMA + "Qual fruta foi a MENOS escolhida pela turma?",
    tip: "Compare as quantidades de cada fruta: qual delas tem o menor número de desenhos?",
    funFact: "Saber qual opção teve menos votos ajuda tanto quanto saber qual teve mais — os dois dados são importantes!",
    points: 1,
    options: [
      { id: "A", text: "Maçã" },
      { id: "B", text: "Banana" },
      { id: "C", text: "Uva" },
      { id: "D", text: "Nenhuma" }
    ],
    correctAnswer: "B"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: PICTOGRAMA + "Quantas crianças, ao todo, participaram dessa pesquisa de frutas?",
    tip: "Some as três quantidades: 4 (maçã) + 3 (banana) + 6 (uva).",
    funFact: "Somar todos os grupos de um gráfico ou pictograma é uma boa forma de conferir o total de participantes de uma pesquisa!",
    points: 1,
    options: [
      { id: "A", text: "10" },
      { id: "B", text: "12" },
      { id: "C", text: "13" },
      { id: "D", text: "15" }
    ],
    correctAnswer: "C"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: PICTOGRAMA + "Qual é a diferença entre a quantidade de crianças que escolheram uva e as que escolheram banana?",
    tip: "Subtraia: 6 (uva) menos 3 (banana) é igual a quanto?",
    funFact: "Comparar diferenças entre categorias ajuda a entender melhor o quanto uma opção é mais popular que outra!",
    points: 1,
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "5" }
    ],
    correctAnswer: "B"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: PICTOGRAMA + "Se mais 2 crianças escolhessem banana, quantas crianças ao todo teriam escolhido banana?",
    tip: "Some a quantidade que já tinha (3) com as 2 crianças novas.",
    funFact: "Pictogramas podem ser atualizados sempre que novas informações aparecem — é só desenhar mais símbolos!",
    points: 1,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "4" },
      { id: "C", text: "5" },
      { id: "D", text: "6" }
    ],
    correctAnswer: "C"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: PICTOGRAMA + "Nesse pictograma, cada desenho de fruta representa:",
    tip: "Releia a explicação do pictograma: cada desenho representa quantas crianças?",
    funFact: "Em pictogramas mais avançados, às vezes um único desenho pode representar vários itens, como \"10 pessoas\" — mas para começar, é mais fácil usar 1 para 1!",
    points: 1,
    options: [
      { id: "A", text: "10 crianças" },
      { id: "B", text: "5 crianças" },
      { id: "C", text: "1 criança" },
      { id: "D", text: "Nenhuma criança" }
    ],
    correctAnswer: "C"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: "Esse tipo de gráfico, feito com desenhos, se chama:",
    tip: "Pense na palavra: \"picto\" lembra \"figura\" ou \"desenho\", e \"grama\" lembra \"gráfico\". Junte as duas ideias.",
    funFact: "A palavra \"pictograma\" vem do latim \"pictus\" (pintado) — ou seja, um gráfico feito de desenhinhos!",
    points: 1,
    options: [
      { id: "A", text: "Tabela numérica" },
      { id: "B", text: "Pictograma" },
      { id: "C", text: "Calendário" },
      { id: "D", text: "Régua" }
    ],
    correctAnswer: "B"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Qual animal tem a barra MAIOR no gráfico?",
    tip: "Compare os tamanhos das barras: 7, 5 e 2 — qual é o maior número?",
    funFact: "Quanto maior a barra num gráfico, mais fácil é perceber rapidamente qual opção é a mais comum!",
    points: 1,
    options: [
      { id: "A", text: "Cachorro" },
      { id: "B", text: "Gato" },
      { id: "C", text: "Peixe" },
      { id: "D", text: "Nenhum" }
    ],
    correctAnswer: "A"
  },
  {
    id: 22,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Qual animal tem a barra MENOR no gráfico?",
    tip: "Compare os tamanhos das barras: qual delas representa o menor número?",
    funFact: "Gráficos de barras são muito usados até em noticiários, para comparar rapidamente diferentes quantidades!",
    points: 1,
    options: [
      { id: "A", text: "Cachorro" },
      { id: "B", text: "Gato" },
      { id: "C", text: "Peixe" },
      { id: "D", text: "Nenhum" }
    ],
    correctAnswer: "C"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Quantas crianças têm cachorro, segundo o gráfico?",
    tip: "Releia a descrição: o tamanho da barra do cachorro representa quantas crianças?",
    funFact: "O cachorro costuma ser um dos animais de estimação mais escolhidos ao redor do mundo!",
    points: 1,
    options: [
      { id: "A", text: "5" },
      { id: "B", text: "7" },
      { id: "C", text: "2" },
      { id: "D", text: "9" }
    ],
    correctAnswer: "B"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Quantas crianças, ao todo, têm cachorro ou gato?",
    tip: "Some as quantidades de cachorro (7) e gato (5).",
    funFact: "Somar duas categorias de um gráfico é uma ótima forma de descobrir totais combinados!",
    points: 1,
    options: [
      { id: "A", text: "10" },
      { id: "B", text: "11" },
      { id: "C", text: "12" },
      { id: "D", text: "14" }
    ],
    correctAnswer: "C"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Qual é a diferença entre a quantidade de cachorros e a quantidade de peixes?",
    tip: "Subtraia: 7 (cachorro) menos 2 (peixe) é igual a quanto?",
    funFact: "Peixes são animais de estimação mais fáceis de cuidar, mas geralmente são escolhidos por menos famílias do que cães e gatos!",
    points: 1,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "4" },
      { id: "C", text: "5" },
      { id: "D", text: "7" }
    ],
    correctAnswer: "C"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Comparando gato e peixe, qual tem a barra maior?",
    tip: "Compare os números: 5 (gato) é maior ou menor que 2 (peixe)?",
    funFact: "Gatos são um dos animais de estimação mais populares do mundo, ficando atrás só dos cachorros em muitas pesquisas!",
    points: 1,
    options: [
      { id: "A", text: "Gato" },
      { id: "B", text: "Peixe" },
      { id: "C", text: "As duas são iguais" },
      { id: "D", text: "Não é possível saber" }
    ],
    correctAnswer: "A"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Quantas crianças, ao todo, participaram dessa pesquisa sobre animais de estimação?",
    tip: "Some as três quantidades: 7 (cachorro) + 5 (gato) + 2 (peixe).",
    funFact: "Somar todas as barras de um gráfico é uma boa forma de descobrir o total de pessoas que participaram da pesquisa!",
    points: 1,
    options: [
      { id: "A", text: "12" },
      { id: "B", text: "13" },
      { id: "C", text: "14" },
      { id: "D", text: "15" }
    ],
    correctAnswer: "C"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: GRAFICO_BARRAS + "Se 3 crianças a mais responderem que têm peixe, qual seria a nova quantidade de crianças com peixe?",
    tip: "Some a quantidade que já tinha (2) com as 3 novas crianças.",
    funFact: "Atualizar gráficos com novas informações é algo bem comum em pesquisas contínuas!",
    points: 1,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "4" },
      { id: "C", text: "5" },
      { id: "D", text: "6" }
    ],
    correctAnswer: "C"
  },
  {
    id: 29,
    type: "multiple_choice",
    text: "Em um gráfico de barras, quanto maior a barra, isso representa:",
    tip: "Pense: quando uma barra é bem grande e alta, ela costuma representar uma quantidade pequena ou grande?",
    funFact: "Essa é a ideia principal dos gráficos de barras — o tamanho da barra sempre representa a quantidade de algo!",
    points: 1,
    options: [
      { id: "A", text: "Uma quantidade menor" },
      { id: "B", text: "Uma quantidade maior" },
      { id: "C", text: "Nenhuma quantidade" },
      { id: "D", text: "Sempre o número 10" }
    ],
    correctAnswer: "B"
  },
  {
    id: 30,
    type: "multiple_choice",
    text: "Depois de aprender sobre tabelas, pictogramas e gráficos de barras, para que servem essas ferramentas?",
    tip: "Pense em tudo que você aprendeu: tabelas, pictogramas e gráficos ajudam a fazer o quê com as informações?",
    funFact: "Parabéns! Você completou toda a Matemática do 1º ano — números, contas, formas, medidas e agora gráficos. Você está arrasando nos estudos!",
    points: 1,
    options: [
      { id: "A", text: "Para confundir as pessoas" },
      { id: "B", text: "Para organizar e comparar informações de um jeito mais fácil de entender" },
      { id: "C", text: "Somente para fazer desenhos bonitos" },
      { id: "D", text: "Para nada, são apenas enfeites" }
    ],
    correctAnswer: "B"
  }
];

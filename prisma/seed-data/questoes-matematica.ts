export const questoesMathematica = [
  {
    id: 1,
    type: "multiple_choice",
    text: "Complete a sequência: 2 – 4 – 6 – ___ – ___",
    tip: "Está aumentando de 2 em 2. Depois do 6 vem 8, depois 10",
    points: 1,
    options: [
      {
        id: "a",
        text: "8 e 10"
      },
      {
        id: "b",
        text: "7 e 9"
      },
      {
        id: "c",
        text: "10 e 12"
      },
      {
        id: "d",
        text: "8 e 9"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 2,
    type: "multiple_choice",
    text: "Complete a sequência: 20 – 15 – 10 – ___ – ___",
    tip: "Está diminuindo de 5 em 5. 20 - 5 = 15, 15 - 5 = 10, 10 - 5 = 5, 5 - 5 = 0",
    points: 1,
    options: [
      {
        id: "a",
        text: "5 e 0"
      },
      {
        id: "b",
        text: "8 e 6"
      },
      {
        id: "c",
        text: "10 e 5"
      },
      {
        id: "d",
        text: "6 e 1"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 3,
    type: "true_false_multiple",
    text: "Observe a sequência e descubra o padrão: 5 – 11 – 17 – 23 – ___",
    tip: "Sempre veja a diferença entre os números. 11 - 5 = 6, 17 - 11 = 6, 23 - 17 = 6. Aumenta de 6 em 6!",
    points: 1,
    items: [
      {
        id: "1",
        text: "O próximo número é 29"
      },
      {
        id: "2",
        text: "Aumenta de 2 em 2"
      },
      {
        id: "3",
        text: "Aumenta de 6 em 6"
      },
      {
        id: "4",
        text: "Diminui de 5 em 5"
      }
    ],
    correctAnswer: {
      "1": "V",
      "2": "F",
      "3": "V",
      "4": "F"
    }
  },
  {
    id: 4,
    type: "multiple_choice",
    text: "Resolva: 35 + 12 = ?",
    tip: "Soma unidade com unidade (5 + 2 = 7) e dezena com dezena (30 + 10 = 40). 40 + 7 = 47",
    points: 1,
    options: [
      {
        id: "a",
        text: "45"
      },
      {
        id: "b",
        text: "47"
      },
      {
        id: "c",
        text: "50"
      },
      {
        id: "d",
        text: "48"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 5,
    type: "multiple_choice",
    text: "Resolva: 52 – 38 = ?",
    tip: "Se não dá pra tirar, \"empresta\" da dezena. 52 - 38: não dá 2 - 8, então empresta 10 do 50. Fica 12 - 8 = 4 (unidade) e 40 - 30 = 10 (dezena). Total: 14",
    points: 1,
    options: [
      {
        id: "a",
        text: "12"
      },
      {
        id: "b",
        text: "14"
      },
      {
        id: "c",
        text: "16"
      },
      {
        id: "d",
        text: "18"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 6,
    type: "multiple_choice",
    text: "Luana tinha 68 figurinhas e ganhou mais 47. Quantas figurinhas ela tem agora?",
    tip: "Palavras como \"ganhou\" = SOMA. 68 + 47 = 115",
    points: 1,
    options: [
      {
        id: "a",
        text: "105"
      },
      {
        id: "b",
        text: "110"
      },
      {
        id: "c",
        text: "115"
      },
      {
        id: "d",
        text: "120"
      }
    ],
    correctAnswer: "c"
  },
  {
    id: 7,
    type: "true_false_multiple",
    text: "Vera tinha 100 doces. Colocou 20 em cada caixa. Marque verdadeiro ou falso:",
    tip: "Cada caixa tira 20 → vai diminuindo. 100 - 20 = 80, 80 - 20 = 60, 60 - 20 = 40, 40 - 20 = 20 (depois de 4 caixas)",
    points: 1,
    items: [
      {
        id: "1",
        text: "Depois de 1 caixa, sobram 80 doces"
      },
      {
        id: "2",
        text: "Depois de 2 caixas, sobram 60 doces"
      },
      {
        id: "3",
        text: "Depois de 3 caixas, sobram 40 doces"
      },
      {
        id: "4",
        text: "Depois de 5 caixas, sobram 10 doces"
      }
    ],
    correctAnswer: {
      "1": "V",
      "2": "V",
      "3": "V",
      "4": "F"
    }
  },
  {
    id: 8,
    type: "multiple_choice",
    text: "Qual instrumento é correto para medir a massa de uma mochila?",
    tip: "Massa = peso → usa balança. Régua mede comprimento, relógio mede tempo, copo mede volume",
    points: 1,
    options: [
      {
        id: "a",
        text: "Régua"
      },
      {
        id: "b",
        text: "Balança"
      },
      {
        id: "c",
        text: "Relógio"
      },
      {
        id: "d",
        text: "Copo medidor"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 9,
    type: "multiple_choice",
    text: "1 metro equivale a quantos centímetros?",
    tip: "1 metro = 100 centímetros. Isso cai direto em prova! Memorize!",
    points: 1,
    options: [
      {
        id: "a",
        text: "10"
      },
      {
        id: "b",
        text: "100"
      },
      {
        id: "c",
        text: "1000"
      },
      {
        id: "d",
        text: "50"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 10,
    type: "multiple_choice",
    text: "Um ônibus tem 45 passageiros. Saíram 16 passageiros. Quantos ficaram?",
    tip: "\"Saíram\" = SUBTRAÇÃO. 45 - 16 = 29",
    points: 1,
    options: [
      {
        id: "a",
        text: "25"
      },
      {
        id: "b",
        text: "29"
      },
      {
        id: "c",
        text: "30"
      },
      {
        id: "d",
        text: "31"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 11,
    type: "multiple_choice",
    text: "Observe os números: 14 – 8 – 20 – 4 – 18 – 10. Organize em ordem crescente.",
    tip: "Organize os números do menor para o maior.",
    points: 1,
    options: [
      {
        id: "a",
        text: "4 – 8 – 10 – 14 – 18 – 20"
      },
      {
        id: "b",
        text: "20 – 18 – 14 – 10 – 8 – 4"
      },
      {
        id: "c",
        text: "10 – 8 – 4 – 14 – 18 – 20"
      },
      {
        id: "d",
        text: "8 – 4 – 10 – 14 – 18 – 20"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 12,
    type: "multiple_choice",
    text: "Observe os números: 35 – 50 – 15 – 25 – 40. Organize em ordem decrescente.",
    tip: "Organize os números do maior para o menor.",
    points: 1,
    options: [
      {
        id: "a",
        text: "50 – 40 – 35 – 25 – 15"
      },
      {
        id: "b",
        text: "15 – 25 – 35 – 40 – 50"
      },
      {
        id: "c",
        text: "35 – 50 – 15 – 25 – 40"
      },
      {
        id: "d",
        text: "40 – 35 – 25 – 15 – 50"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 13,
    type: "multiple_choice",
    text: "Qual objeto usamos para medir o tempo?",
    tip: "Relógio é usado para medir o tempo.",
    points: 1,
    options: [
      {
        id: "a",
        text: "Régua"
      },
      {
        id: "b",
        text: "Relógio"
      },
      {
        id: "c",
        text: "Balança"
      },
      {
        id: "d",
        text: "Copo medidor"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 14,
    type: "multiple_choice",
    text: "Qual instrumento mede massa?",
    tip: "Balança é usada para medir massa.",
    points: 1,
    options: [
      {
        id: "a",
        text: "Relógio"
      },
      {
        id: "b",
        text: "Termômetro"
      },
      {
        id: "c",
        text: "Balança"
      },
      {
        id: "d",
        text: "Régua"
      }
    ],
    correctAnswer: "c"
  },
  {
    id: 15,
    type: "multiple_choice",
    text: "Complete: 1 quilograma equivale a ______ gramas.",
    tip: "1 quilograma é igual a 1000 gramas.",
    points: 1,
    options: [
      {
        id: "a",
        text: "100"
      },
      {
        id: "b",
        text: "1000"
      },
      {
        id: "c",
        text: "10"
      },
      {
        id: "d",
        text: "500"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 16,
    type: "multiple_choice",
    text: "Complete: 1 grama equivale a ______ miligramas.",
    tip: "1 grama é igual a 1000 miligramas.",
    points: 1,
    options: [
      {
        id: "a",
        text: "100"
      },
      {
        id: "b",
        text: "1000"
      },
      {
        id: "c",
        text: "10"
      },
      {
        id: "d",
        text: "500"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 17,
    type: "multiple_choice",
    text: "Complete: 500 gramas equivalem a meio __________.",
    tip: "500 gramas é igual a meio quilograma.",
    points: 1,
    options: [
      {
        id: "a",
        text: "grama"
      },
      {
        id: "b",
        text: "quilograma"
      },
      {
        id: "c",
        text: "litro"
      },
      {
        id: "d",
        text: "miligrama"
      }
    ],
    correctAnswer: "b"
  },
  {
    id: 18,
    type: "multiple_choice",
    text: "Resolva: 324 + 145 =",
    tip: "Soma unidade com unidade, dezena com dezena e centena com centena.",
    points: 1,
    options: [
      {
        id: "a",
        text: "469"
      },
      {
        id: "b",
        text: "479"
      },
      {
        id: "c",
        text: "459"
      },
      {
        id: "d",
        text: "489"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 19,
    type: "multiple_choice",
    text: "Resolva: 587 − 243 =",
    tip: "Subtraia unidade com unidade, dezena com dezena e centena com centena.",
    points: 1,
    options: [
      {
        id: "a",
        text: "344"
      },
      {
        id: "b",
        text: "354"
      },
      {
        id: "c",
        text: "334"
      },
      {
        id: "d",
        text: "324"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 20,
    type: "multiple_choice",
    text: "Resolva: 456 + 222 =",
    tip: "Soma unidade com unidade, dezena com dezena e centena com centena.",
    points: 1,
    options: [
      {
        id: "a",
        text: "678"
      },
      {
        id: "b",
        text: "668"
      },
      {
        id: "c",
        text: "688"
      },
      {
        id: "d",
        text: "698"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 21,
    type: "multiple_choice",
    text: "Resolva: 900 − 375 =",
    tip: "Subtraia unidade com unidade, dezena com dezena e centena com centena.",
    points: 1,
    options: [
      {
        id: "a",
        text: "525"
      },
      {
        id: "b",
        text: "535"
      },
      {
        id: "c",
        text: "515"
      },
      {
        id: "d",
        text: "505"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 23,
    type: "multiple_choice",
    text: "Complete a sequência: 5 – 10 – 15 – ____ – ____ – 30",
    tip: "A sequência aumenta de 5 em 5.",
    points: 1,
    options: [
      {
        id: "a",
        text: "20 / 25"
      },
      {
        id: "b",
        text: "25 / 30"
      },
      {
        id: "c",
        text: "15 / 20"
      },
      {
        id: "d",
        text: "10 / 15"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 24,
    type: "multiple_choice",
    text: "Complete a sequência: 50 – 45 – 40 – ____ – ____ – 25",
    tip: "A sequência diminui de 5 em 5.",
    points: 1,
    options: [
      {
        id: "a",
        text: "35 / 30"
      },
      {
        id: "b",
        text: "40 / 35"
      },
      {
        id: "c",
        text: "30 / 25"
      },
      {
        id: "d",
        text: "25 / 20"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 25,
    type: "multiple_choice",
    text: "Complete: 200, 300, 400, ____, ____",
    tip: "A sequência aumenta de 100 em 100.",
    points: 1,
    options: [
      {
        id: "a",
        text: "500 / 600"
      },
      {
        id: "b",
        text: "400 / 500"
      },
      {
        id: "c",
        text: "600 / 700"
      },
      {
        id: "d",
        text: "300 / 400"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 26,
    type: "multiple_choice",
    text: "Caio tinha 120 figurinhas. Ganhou mais 35. Com quantas ficou?",
    tip: "Soma as figurinhas que ele já tinha com as que ele ganhou.",
    points: 1,
    options: [
      {
        id: "a",
        text: "155"
      },
      {
        id: "b",
        text: "165"
      },
      {
        id: "c",
        text: "175"
      },
      {
        id: "d",
        text: "185"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 27,
    type: "multiple_choice",
    text: "Ana tinha 250 lápis. Deu 80. Com quantos ficou?",
    tip: "Subtraia os lápis que ela deu dos que ela tinha.",
    points: 1,
    options: [
      {
        id: "a",
        text: "170"
      },
      {
        id: "b",
        text: "180"
      },
      {
        id: "c",
        text: "190"
      },
      {
        id: "d",
        text: "200"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 28,
    type: "multiple_choice",
    text: "Uma caixa pesa 2 quilogramas. Isso equivale a quantos gramas?",
    tip: "1 quilograma equivale a 1000 gramas.",
    points: 1,
    options: [
      {
        id: "a",
        text: "2000"
      },
      {
        id: "b",
        text: "200"
      },
      {
        id: "c",
        text: "20"
      },
      {
        id: "d",
        text: "20000"
      }
    ],
    correctAnswer: "a"
  },
  {
    id: 29,
    type: "true_false_multiple",
    text: "Marque V ou F: Relógio mede tempo. Régua mede comprimento. Balança mede temperatura. Termômetro mede temperatura.",
    tip: "Relógio mede tempo, régua mede comprimento, balança mede massa e termômetro mede temperatura.",
    points: 1,
    items: [
      {
        id: "1",
        text: "Relógio mede tempo."
      },
      {
        id: "2",
        text: "Régua mede comprimento."
      },
      {
        id: "3",
        text: "Balança mede temperatura."
      },
      {
        id: "4",
        text: "Termômetro mede temperatura."
      }
    ],
    correctAnswer: {
      "1": "V",
      "2": "V",
      "3": "F",
      "4": "V"
    }
  },
  {
    id: 30,
    type: "matching",
    text: "Ligue corretamente: Relógio → __________, Balança → __________, Régua → __________, Termômetro → __________",
    tip: "Relógio mede tempo, balança mede massa, régua mede comprimento e termômetro mede temperatura.",
    points: 1,
    pairs: [
      {
        left: {
          id: "1",
          text: "Relógio"
        },
        right: [
          {
            id: "a",
            text: "tempo"
          },
          {
            id: "b",
            text: "massa"
          },
          {
            id: "c",
            text: "comprimento"
          },
          {
            id: "d",
            text: "temperatura"
          }
        ]
      },
      {
        left: {
          id: "2",
          text: "Balança"
        },
        right: [
          {
            id: "a",
            text: "tempo"
          },
          {
            id: "b",
            text: "massa"
          },
          {
            id: "c",
            text: "comprimento"
          },
          {
            id: "d",
            text: "temperatura"
          }
        ]
      },
      {
        left: {
          id: "3",
          text: "Régua"
        },
        right: [
          {
            id: "a",
            text: "tempo"
          },
          {
            id: "b",
            text: "massa"
          },
          {
            id: "c",
            text: "comprimento"
          },
          {
            id: "d",
            text: "temperatura"
          }
        ]
      },
      {
        left: {
          id: "4",
          text: "Termômetro"
        },
        right: [
          {
            id: "a",
            text: "tempo"
          },
          {
            id: "b",
            text: "massa"
          },
          {
            id: "c",
            text: "comprimento"
          },
          {
            id: "d",
            text: "temperatura"
          }
        ]
      }
    ],
    correctAnswer: {
      "1": "a",
      "2": "b",
      "3": "c",
      "4": "d"
    }
  }
] as const;

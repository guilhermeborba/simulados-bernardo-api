export const questoesPortugues = {
  terceiro: {
    "1": {
      AV2: [
        {
          id: 1,
          type: "multiple_choice",
          text: "Leia o texto abaixo e responda: Antes de começar o jogo, todos dizem \"stop\" e mostram uma quantidade de dedos. Essa orientação indica:",
          tip: "Sempre pense: o \"stop\" com dedos serve pra definir algo antes do jogo começar → isso é a letra.",
          points: 1,
          options: [
            {
              id: "a",
              text: "O final do jogo"
            },
            {
              id: "b",
              text: "A escolha da letra"
            },
            {
              id: "c",
              text: "A contagem de pontos"
            },
            {
              id: "d",
              text: "A troca de jogadores"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 2,
          type: "multiple_choice",
          text: "Observe as palavras: quarto – queijo. Em qual palavra o U é pronunciado?",
          tip: "Em QU + A (qua) → o U aparece no som (quar-to). Em QUE / QUI → geralmente o U \"some\" (quei-jo)",
          points: 1,
          options: [
            {
              id: "a",
              text: "quarto"
            },
            {
              id: "b",
              text: "queijo"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 3,
          type: "true_false_multiple",
          text: "Marque V para verdadeiro e F para falso:",
          tip: "Guarda isso como regra rápida: CE, CI → S | CA, CO, CU → K | GE, GI → J",
          points: 1,
          items: [
            {
              id: "1",
              text: "A letra C tem som de S antes de E e I"
            },
            {
              id: "2",
              text: "A letra C tem som de K antes de A, O e U"
            },
            {
              id: "3",
              text: "A letra G tem som de J antes de A, O e U"
            },
            {
              id: "4",
              text: "A letra G tem som de J antes de E e I"
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
          id: 4,
          type: "matching",
          text: "Ligue corretamente as palavras com o mesmo som do C:",
          tip: "casa / copo → som de K | certo / cidade → som de S. Compare o som, não só a letra!",
          points: 1,
          pairs: [
            {
              left: {
                id: "casa",
                text: "casa"
              },
              right: [
                {
                  id: "cidade",
                  text: "cidade"
                },
                {
                  id: "copo",
                  text: "copo"
                }
              ]
            },
            {
              left: {
                id: "certo",
                text: "certo"
              },
              right: [
                {
                  id: "cidade",
                  text: "cidade"
                },
                {
                  id: "copo",
                  text: "copo"
                }
              ]
            }
          ],
          correctAnswer: {
            casa: "copo",
            certo: "cidade"
          }
        },
        {
          id: 5,
          type: "multiple_choice",
          text: "Qual das palavras tem som de J?",
          tip: "Se tiver GE ou GI, o som é de J. ge-lo = \"jelo\"",
          points: 1,
          options: [
            {
              id: "a",
              text: "gato"
            },
            {
              id: "b",
              text: "gelo"
            },
            {
              id: "c",
              text: "goma"
            },
            {
              id: "d",
              text: "galo"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 6,
          type: "classification",
          text: "Classifique em (C) comum ou (P) próprio:",
          tip: "Nome de pessoa ou lugar específico → próprio (maiúscula). O resto → comum",
          points: 1,
          items: [
            {
              id: "1",
              text: "cachorro"
            },
            {
              id: "2",
              text: "Brasil"
            },
            {
              id: "3",
              text: "escola"
            },
            {
              id: "4",
              text: "Maria"
            }
          ],
          correctAnswer: {
            "1": "C",
            "2": "P",
            "3": "C",
            "4": "P"
          }
        },
        {
          id: 7,
          type: "multiple_choice",
          text: "Qual palavra deve começar com letra maiúscula?",
          tip: "Nome de pessoa sempre começa com letra maiúscula. Se estiver minúsculo → já desconfia que está errado.",
          points: 1,
          options: [
            {
              id: "a",
              text: "cadeira"
            },
            {
              id: "b",
              text: "cidade"
            },
            {
              id: "c",
              text: "joão"
            },
            {
              id: "d",
              text: "bola"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 8,
          type: "multiple_choice",
          text: "\"O menino correu no parque.\" A palavra correu indica:",
          tip: "Pergunta mágica: \"O que está acontecendo?\" → correu = ação",
          points: 1,
          options: [
            {
              id: "a",
              text: "objeto"
            },
            {
              id: "b",
              text: "ação"
            },
            {
              id: "c",
              text: "lugar"
            },
            {
              id: "d",
              text: "pessoa"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 9,
          type: "multiple_choice",
          text: "Marque a alternativa que está no modo imperativo:",
          tip: "Imperativo = ordem, pedido ou conselho. Palavras comuns: faça, coma, estude, vá",
          points: 1,
          options: [
            {
              id: "a",
              text: "Eu estudo todos os dias"
            },
            {
              id: "b",
              text: "Ele brinca na rua"
            },
            {
              id: "c",
              text: "Faça a tarefa agora"
            },
            {
              id: "d",
              text: "Nós fomos ao parque"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 10,
          type: "multiple_choice",
          text: "Complete com C ou QU: (escolha a alternativa correta)",
          tip: "Antes de E e I → usa QU (que, qui). Antes de A, O, U → usa C (ca, co, cu)",
          points: 1,
          options: [
            {
              id: "a",
              text: "a) caderno, b) queijo, c) casa, d) quilo"
            },
            {
              id: "b",
              text: "a) quaderno, b) ceijo, c) quasa, d) quilo"
            },
            {
              id: "c",
              text: "a) caderno, b) quejo, c) casa, d) cilo"
            },
            {
              id: "d",
              text: "Todas estão corretas"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 11,
          type: "multiple_choice",
          text: "Marque a alternativa em que todas as palavras são substantivos próprios:",
          tip: "Substantivos próprios são nomes específicos de pessoas, países ou cidades (com iniciais maiúsculas).",
          points: 1,
          options: [
            {
              id: "a",
              text: "escola, rua, praça"
            },
            {
              id: "b",
              text: "Pedro, Brasil, Curitiba"
            },
            {
              id: "c",
              text: "cachorro, gato, cavalo"
            },
            {
              id: "d",
              text: "correr, brincar, estudar"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 12,
          type: "multiple_choice",
          text: "Marque a alternativa em que todas as palavras são substantivos comuns:",
          tip: "Substantivos comuns são nomes genéricos de coisas, sem necessidade de maiúscula.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Ana, João, Recife"
            },
            {
              id: "b",
              text: "livro, mochila, cadeira"
            },
            {
              id: "c",
              text: "Brasil, Paraná, Lucas"
            },
            {
              id: "d",
              text: "Maria, escola, mesa"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 13,
          type: "multiple_choice",
          text: "Leia a frase: \"Carlos estudou e depois brincou com seus amigos.\" Os verbos da frase são:",
          tip: "Verbos são palavras que indicam ações. \"estudou\" e \"brincou\" são ações!",
          points: 1,
          options: [
            {
              id: "a",
              text: "Carlos e amigos"
            },
            {
              id: "b",
              text: "estudou e brincou"
            },
            {
              id: "c",
              text: "depois e com"
            },
            {
              id: "d",
              text: "seus e amigos"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 14,
          type: "multiple_choice",
          text: "Complete com GU ou G:",
          tip: "GU usa-se antes de E (guerr...). G usa-se antes de E quando tem som de J (gel-o).",
          points: 1,
          options: [
            {
              id: "a",
              text: "Guerreiro"
            },
            {
              id: "b",
              text: "Guitarra"
            },
            {
              id: "c",
              text: "Guincho"
            },
            {
              id: "d",
              text: "Gelo"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 15,
          type: "multiple_choice",
          text: "Complete com C ou QU:",
          tip: "Antes de A, O, U → usa C. Antes de E, I → usa QU.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Quebra"
            },
            {
              id: "b",
              text: "Casa"
            },
            {
              id: "c",
              text: "Quilo"
            },
            {
              id: "d",
              text: "Quente"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 16,
          type: "multiple_choice",
          text: "Assinale a alternativa correta: O QU é usado antes das vogais:",
          tip: "Regra: QU + E ou I = som de \"k\". Ex: quero, quero.",
          points: 1,
          options: [
            {
              id: "a",
              text: "A e O"
            },
            {
              id: "b",
              text: "E e I"
            },
            {
              id: "c",
              text: "U e O"
            },
            {
              id: "d",
              text: "A e U"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 17,
          type: "multiple_choice",
          text: "Leia: \"Feche a porta e apague a luz.\" Os verbos estão no modo:",
          tip: "Imperativo é quando você dá uma ordem ou pedido: \"feche\", \"apague\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "infinitivo"
            },
            {
              id: "b",
              text: "passado"
            },
            {
              id: "c",
              text: "imperativo"
            },
            {
              id: "d",
              text: "futuro"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 18,
          type: "multiple_choice",
          text: "Marque três verbos no imperativo:",
          tip: "Verbos no imperativo são ordens: corra! pule! sente!",
          points: 1,
          options: [
            {
              id: "a",
              text: "corra, pule, sente"
            },
            {
              id: "b",
              text: "casa, cadeira, sofá"
            },
            {
              id: "c",
              text: "menino, escola, rua"
            },
            {
              id: "d",
              text: "bonito, alegre, feliz"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 19,
          type: "true_false_multiple",
          text: "Marque V para verdadeiro e F para falso:",
          tip: "Verbos = ação | Substantivos = nomear | Adjetivos = qualidade",
          points: 1,
          items: [
            {
              id: "1",
              text: "Verbos indicam ações"
            },
            {
              id: "2",
              text: "Substantivos nomeiam pessoas, lugares ou objetos"
            },
            {
              id: "3",
              text: "Adjetivos indicam ações"
            },
            {
              id: "4",
              text: "Palavras como \"correr\" e \"pular\" são verbos"
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
          id: 20,
          type: "multiple_choice",
          text: "Leia: \"A menina abriu a mochila e pegou o caderno.\" O que a menina fez?",
          tip: "A frase mostra duas ações: abriu e pegou.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Dormiu"
            },
            {
              id: "b",
              text: "Abriu a mochila e pegou o caderno"
            },
            {
              id: "c",
              text: "Comeu"
            },
            {
              id: "d",
              text: "Estudou"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 21,
          type: "multiple_choice",
          text: "Escreva os verbos da frase: \"Pedro correu, caiu e levantou.\"",
          tip: "Os verbos são as ações: correu, caiu, levantou.",
          points: 1,
          options: [
            {
              id: "a",
              text: "correu, caiu, levantou"
            },
            {
              id: "b",
              text: "Pedro, caiu, levantou"
            },
            {
              id: "c",
              text: "correu, Pedro, levantou"
            },
            {
              id: "d",
              text: "caiu, Pedro, correu"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 22,
          type: "multiple_choice",
          text: "Assinale a alternativa correta: A palavra escrita corretamente é:",
          tip: "QUEIJO = QU + E + I + J + O. Regra: antes de E e I usa QU.",
          points: 1,
          options: [
            {
              id: "a",
              text: "geijo"
            },
            {
              id: "b",
              text: "queijo"
            },
            {
              id: "c",
              text: "qeijo"
            },
            {
              id: "d",
              text: "queijoo"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 23,
          type: "multiple_choice",
          text: "Complete: A professora ________ o quadro.",
          tip: "A frase precisa de um verbo. \"apagou\" é a ação que a professora faz.",
          points: 1,
          options: [
            {
              id: "a",
              text: "apagou"
            },
            {
              id: "b",
              text: "cadeira"
            },
            {
              id: "c",
              text: "escola"
            },
            {
              id: "d",
              text: "azul"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 24,
          type: "multiple_choice",
          text: "Marque a alternativa que possui apenas palavras com GU:",
          tip: "GU aparece em: guerra, guitarra, guia.",
          points: 1,
          options: [
            {
              id: "a",
              text: "guerra, guitarra, guia"
            },
            {
              id: "b",
              text: "queijo, quero, quintal"
            },
            {
              id: "c",
              text: "casa, caderno, cachorro"
            },
            {
              id: "d",
              text: "gato, girafa, gelo"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 25,
          type: "multiple_choice",
          text: "Marque a alternativa que possui apenas palavras com QU:",
          tip: "QU aparece em: quarto, queijo, quintal.",
          points: 1,
          options: [
            {
              id: "a",
              text: "quarto, queijo, quintal"
            },
            {
              id: "b",
              text: "guerra, guia, guitarra"
            },
            {
              id: "c",
              text: "gato, girafa, gelo"
            },
            {
              id: "d",
              text: "casa, cavalo, cachorro"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 26,
          type: "multiple_choice",
          text: "Organize a frase corretamente: Lucas / para / escola / foi / cedo",
          tip: "Ordem correta: Quem fez → ação → para onde → quando.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Lucas foi para escola cedo"
            },
            {
              id: "b",
              text: "Escola foi para Lucas cedo"
            },
            {
              id: "c",
              text: "Cedo foi para escola Lucas"
            },
            {
              id: "d",
              text: "Para escola Lucas foi cedo"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 27,
          type: "multiple_choice",
          text: "Leia a receita: \"Misture os ingredientes. Coloque na forma. Leve ao forno.\" Os verbos sublinhados indicam:",
          tip: "Receitas usam verbos para dar instruções de como fazer algo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "nomes"
            },
            {
              id: "b",
              text: "ações e instruções"
            },
            {
              id: "c",
              text: "lugares"
            },
            {
              id: "d",
              text: "objetos"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 28,
          type: "multiple_choice",
          text: "No cartaz apareceu a palavra: \"QERIDO\". Escreva a palavra corretamente:",
          tip: "A palavra correta é QUERIDO (com QU antes de E).",
          points: 1,
          options: [
            {
              id: "a",
              text: "QUERIDO"
            },
            {
              id: "b",
              text: "CERIDO"
            },
            {
              id: "c",
              text: "GERIDO"
            },
            {
              id: "d",
              text: "QERIDO"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 29,
          type: "classification",
          text: "Escreva 3 substantivos próprios e 3 substantivos comuns:",
          tip: "Próprio = nome específico (maiúscula). Comum = nome genérico (minúscula).",
          points: 1,
          items: [
            {
              id: "1",
              text: "Substantivos próprios (ex: Bernardo, Brasil)"
            },
            {
              id: "2",
              text: "Substantivos comuns (ex: cadeira, cachorro)"
            }
          ],
          correctAnswer: {
            "1": "Bernardo,Brasil,Florianópolis",
            "2": "cadeira,cachorro,escola"
          }
        },
        {
          id: 30,
          type: "multiple_choice",
          text: "Leia o texto: \"João acordou cedo. Escovou os dentes. Tomou café e foi para a escola.\" Responda: Quem aparece no texto?",
          tip: "O texto fala sobre João: ele acordou, escovou, tomou café e foi para a escola.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Maria"
            },
            {
              id: "b",
              text: "João"
            },
            {
              id: "c",
              text: "Pedro"
            },
            {
              id: "d",
              text: "Carlos"
            }
          ],
          correctAnswer: "b"
        }
      ]
    },
    "2": {
      AV1: [
        {
          id: 1,
          type: "multiple_choice",
          text: "Uma campanha de conscientização serve para:",
          tip: "Campanhas de conscientização visam educar e alertar sobre temas importantes.",
          points: 1,
          options: [
            {
              id: "a",
              text: "vender produtos"
            },
            {
              id: "b",
              text: "divertir as pessoas"
            },
            {
              id: "c",
              text: "informar e orientar a população"
            },
            {
              id: "d",
              text: "decorar ambientes"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 2,
          type: "multiple_choice",
          text: "No cartaz sobre a dengue, o tema principal é:",
          tip: "Cartazes sobre dengue focam na prevenção da doença transmitida pelo mosquito.",
          points: 1,
          options: [
            {
              id: "a",
              text: "alimentação saudável"
            },
            {
              id: "b",
              text: "prevenção contra doenças"
            },
            {
              id: "c",
              text: "esportes"
            },
            {
              id: "d",
              text: "reciclagem"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 3,
          type: "multiple_choice",
          text: "O mosquito Aedes aegypti transmite:",
          tip: "O Aedes aegypti é o mosquito transmissor da dengue.",
          points: 1,
          options: [
            {
              id: "a",
              text: "gripe"
            },
            {
              id: "b",
              text: "dengue"
            },
            {
              id: "c",
              text: "sarampo"
            },
            {
              id: "d",
              text: "catapora"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 4,
          type: "multiple_choice",
          text: "O slogan \"Não crie seu maior inimigo em casa\" chama atenção para:",
          tip: "O slogan refere-se ao combate ao mosquito Aedes, evitando água parada.",
          points: 1,
          options: [
            {
              id: "a",
              text: "cuidar dos animais"
            },
            {
              id: "b",
              text: "evitar água parada"
            },
            {
              id: "c",
              text: "brincar no quintal"
            },
            {
              id: "d",
              text: "limpar o quarto"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 5,
          type: "multiple_choice",
          text: "O público-alvo dessa campanha é:",
          tip: "Campanhas de saúde pública visam toda a população.",
          points: 1,
          options: [
            {
              id: "a",
              text: "apenas médicos"
            },
            {
              id: "b",
              text: "apenas crianças"
            },
            {
              id: "c",
              text: "toda a população"
            },
            {
              id: "d",
              text: "apenas professores"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 6,
          type: "multiple_choice",
          text: "No cartaz sobre economia de água, a mensagem principal é:",
          tip: "Cartazes sobre água promovem o uso consciente e economia.",
          points: 1,
          options: [
            {
              id: "a",
              text: "gastar água"
            },
            {
              id: "b",
              text: "economizar água"
            },
            {
              id: "c",
              text: "comprar filtros"
            },
            {
              id: "d",
              text: "construir piscinas"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 7,
          type: "multiple_choice",
          text: "O objetivo de um cartaz de conscientização é:",
          tip: "Cartazes conscientizam sobre comportamentos positivos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ensinar atitudes responsáveis"
            },
            {
              id: "b",
              text: "vender brinquedos"
            },
            {
              id: "c",
              text: "fazer propaganda de roupas"
            },
            {
              id: "d",
              text: "ensinar matemática"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 8,
          type: "multiple_choice",
          text: "As imagens em um cartaz ajudam:",
          tip: "Imagens tornam o cartaz mais atrativo e compreensível.",
          points: 1,
          options: [
            {
              id: "a",
              text: "a decorar"
            },
            {
              id: "b",
              text: "a chamar atenção e explicar melhor"
            },
            {
              id: "c",
              text: "a ocupar espaço"
            },
            {
              id: "d",
              text: "a confundir o leitor"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 9,
          type: "multiple_choice",
          text: "A linguagem usada nesses cartazes costuma ser:",
          tip: "Cartazes usam linguagem clara para serem entendidos por todos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "complicada"
            },
            {
              id: "b",
              text: "difícil"
            },
            {
              id: "c",
              text: "simples e direta"
            },
            {
              id: "d",
              text: "secreta"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 10,
          type: "multiple_choice",
          text: "Uma campanha deve atingir:",
          tip: "Campanhas são eficazes quando alcançam muitas pessoas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "poucas pessoas"
            },
            {
              id: "b",
              text: "o maior número possível de pessoas"
            },
            {
              id: "c",
              text: "apenas adultos"
            },
            {
              id: "d",
              text: "apenas crianças"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 11,
          type: "multiple_choice",
          text: "Qual palavra apresenta encontro consonantal?",
          tip: "Encontro consonantal ocorre quando duas consoantes se encontram, como em \"prato\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "chuva"
            },
            {
              id: "b",
              text: "prato"
            },
            {
              id: "c",
              text: "ninho"
            },
            {
              id: "d",
              text: "queijo"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 12,
          type: "multiple_choice",
          text: "Na palavra \"prato\", o encontro consonantal é:",
          tip: "Em \"prato\", as consoantes \"p\" e \"r\" formam encontro consonantal.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ra"
            },
            {
              id: "b",
              text: "pr"
            },
            {
              id: "c",
              text: "to"
            },
            {
              id: "d",
              text: "at"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 13,
          type: "multiple_choice",
          text: "Qual palavra possui encontro consonantal?",
          tip: "\"Branco\" tem encontro consonantal \"br\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "branco"
            },
            {
              id: "b",
              text: "chave"
            },
            {
              id: "c",
              text: "milho"
            },
            {
              id: "d",
              text: "banho"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 14,
          type: "multiple_choice",
          text: "Em \"trator\", o encontro consonantal é:",
          tip: "\"Trator\" começa com encontro consonantal \"tr\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "tr"
            },
            {
              id: "b",
              text: "to"
            },
            {
              id: "c",
              text: "or"
            },
            {
              id: "d",
              text: "at"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 15,
          type: "multiple_choice",
          text: "Qual opção apresenta apenas encontros consonantais?",
          tip: "Prato (pr), branco (br), trem (tr) têm encontros consonantais.",
          points: 1,
          options: [
            {
              id: "a",
              text: "prato, branco, trem"
            },
            {
              id: "b",
              text: "chuva, banho, milho"
            },
            {
              id: "c",
              text: "queijo, chuva, ninho"
            },
            {
              id: "d",
              text: "banho, chave, telha"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 16,
          type: "multiple_choice",
          text: "Qual palavra possui dígrafo?",
          tip: "\"Chuva\" tem o dígrafo \"ch\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "prato"
            },
            {
              id: "b",
              text: "chuva"
            },
            {
              id: "c",
              text: "branco"
            },
            {
              id: "d",
              text: "trator"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 17,
          type: "multiple_choice",
          text: "Na palavra \"chuveiro\", o dígrafo é:",
          tip: "\"Chuveiro\" tem dígrafo \"ch\" no início.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ve"
            },
            {
              id: "b",
              text: "ro"
            },
            {
              id: "c",
              text: "ch"
            },
            {
              id: "d",
              text: "ei"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 18,
          type: "multiple_choice",
          text: "Qual palavra possui dígrafo?",
          tip: "\"Banho\" tem dígrafo \"nh\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "banho"
            },
            {
              id: "b",
              text: "prato"
            },
            {
              id: "c",
              text: "grama"
            },
            {
              id: "d",
              text: "flor"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 19,
          type: "multiple_choice",
          text: "Na palavra \"ninho\", o dígrafo é:",
          tip: "\"Ninho\" tem dígrafo \"nh\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "ni"
            },
            {
              id: "b",
              text: "nh"
            },
            {
              id: "c",
              text: "ho"
            },
            {
              id: "d",
              text: "in"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 20,
          type: "multiple_choice",
          text: "Qual alternativa apresenta apenas dígrafos?",
          tip: "Chuva (ch), banho (nh), ninho (nh) têm dígrafos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "chuva, banho, ninho"
            },
            {
              id: "b",
              text: "prato, branco, trem"
            },
            {
              id: "c",
              text: "flor, grama, clube"
            },
            {
              id: "d",
              text: "trator, prato, vidro"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 21,
          type: "multiple_choice",
          text: "A separação correta de \"chuveiro\" é:",
          tip: "Separação silábica: chu-vei-ro.",
          points: 1,
          options: [
            {
              id: "a",
              text: "chuv-ei-ro"
            },
            {
              id: "b",
              text: "chu-vei-ro"
            },
            {
              id: "c",
              text: "ch-uvei-ro"
            },
            {
              id: "d",
              text: "chuv-eiro"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 22,
          type: "multiple_choice",
          text: "A palavra \"banhos\" separa-se:",
          tip: "Separação: ba-nhos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ba-nhos"
            },
            {
              id: "b",
              text: "ban-hos"
            },
            {
              id: "c",
              text: "ba-nh-os"
            },
            {
              id: "d",
              text: "banho-s"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 23,
          type: "multiple_choice",
          text: "A separação correta de \"desperdício\" é:",
          tip: "Separação: des-per-dí-cio.",
          points: 1,
          options: [
            {
              id: "a",
              text: "des-per-dí-cio"
            },
            {
              id: "b",
              text: "de-sp-er-dí-cio"
            },
            {
              id: "c",
              text: "des-p-erdício"
            },
            {
              id: "d",
              text: "de-sper-dício"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 24,
          type: "multiple_choice",
          text: "Na frase \"água limpa\", a palavra \"limpa\" é:",
          tip: "\"Limpa\" descreve a qualidade da água, é adjetivo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "verbo"
            },
            {
              id: "b",
              text: "adjetivo"
            },
            {
              id: "c",
              text: "substantivo"
            },
            {
              id: "d",
              text: "pronome"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 25,
          type: "multiple_choice",
          text: "Adjetivos servem para:",
          tip: "Adjetivos qualificam substantivos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "nomear objetos"
            },
            {
              id: "b",
              text: "indicar ações"
            },
            {
              id: "c",
              text: "dar características"
            },
            {
              id: "d",
              text: "fazer perguntas"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 26,
          type: "multiple_choice",
          text: "Qual palavra é adjetivo?",
          tip: "\"Bonita\" descreve aparência, é adjetivo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "casa"
            },
            {
              id: "b",
              text: "correr"
            },
            {
              id: "c",
              text: "bonita"
            },
            {
              id: "d",
              text: "menino"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 27,
          type: "multiple_choice",
          text: "O plural de \"água limpa\" é:",
          tip: "Plural: águas limpas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "águas limpa"
            },
            {
              id: "b",
              text: "águas limpas"
            },
            {
              id: "c",
              text: "água limpas"
            },
            {
              id: "d",
              text: "água limpa"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 28,
          type: "multiple_choice",
          text: "O feminino de \"organizado\" é:",
          tip: "Feminino de organizado é organizada.",
          points: 1,
          options: [
            {
              id: "a",
              text: "organizada"
            },
            {
              id: "b",
              text: "organizade"
            },
            {
              id: "c",
              text: "organizoso"
            },
            {
              id: "d",
              text: "organizar"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 29,
          type: "multiple_choice",
          text: "O plural de \"consumo consciente\" é:",
          tip: "Plural: consumos conscientes.",
          points: 1,
          options: [
            {
              id: "a",
              text: "consumo conscientes"
            },
            {
              id: "b",
              text: "consumos consciente"
            },
            {
              id: "c",
              text: "consumos conscientes"
            },
            {
              id: "d",
              text: "consumo consciente"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 30,
          type: "multiple_choice",
          text: "Na frase \"campanha educativa\", \"educativa\" caracteriza:",
          tip: "\"Educativa\" descreve campanha.",
          points: 1,
          options: [
            {
              id: "a",
              text: "campanha"
            },
            {
              id: "b",
              text: "educativa"
            },
            {
              id: "c",
              text: "frase"
            },
            {
              id: "d",
              text: "escola"
            }
          ],
          correctAnswer: "a"
        }
      ],
      AV2: [
        {
          id: 1,
          type: "multiple_choice",
          text: "O texto sobre a Dona Aranha foi escrito principalmente para:",
          tip: "Textos de curiosidade científica servem para ensinar fatos reais.",
          points: 1,
          options: [
            {
              id: "a",
              text: "contar uma piada."
            },
            {
              id: "b",
              text: "ensinar uma brincadeira."
            },
            {
              id: "c",
              text: "informar curiosidades científicas sobre as aranhas."
            },
            {
              id: "d",
              text: "vender aranhas."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 2,
          type: "multiple_choice",
          text: "Segundo o texto, qual é uma das funções das aranhas na natureza?",
          tip: "Algumas aranhas ajudam a diminuir a quantidade de mosquitos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Produzir mel."
            },
            {
              id: "b",
              text: "Controlar a quantidade de insetos."
            },
            {
              id: "c",
              text: "Polinizar flores."
            },
            {
              id: "d",
              text: "Produzir leite."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 3,
          type: "multiple_choice",
          text: "O que significa biodiversidade?",
          tip: "Pense em quantos tipos diferentes de plantas e animais existem.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Variedade de seres vivos."
            },
            {
              id: "b",
              text: "Tipo de alimento."
            },
            {
              id: "c",
              text: "Nome de uma floresta."
            },
            {
              id: "d",
              text: "Instrumento científico."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 4,
          type: "multiple_choice",
          text: "As aranhas conseguem subir paredes?",
          tip: "Muitas aranhas sobem paredes para procurar alimento ou abrigo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Não."
            },
            {
              id: "b",
              text: "Apenas quando chove."
            },
            {
              id: "c",
              text: "Apenas quando estão com fome."
            },
            {
              id: "d",
              text: "Sim."
            }
          ],
          correctAnswer: "d"
        },
        {
          id: 5,
          type: "multiple_choice",
          text: "Por que algumas aranhas fazem teias em lugares altos?",
          tip: "Onde há mais insetos, há mais comida para elas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Porque gostam de brincar."
            },
            {
              id: "b",
              text: "Porque há mais insetos nesses locais."
            },
            {
              id: "c",
              text: "Porque têm medo do chão."
            },
            {
              id: "d",
              text: "Porque gostam do vento."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 6,
          type: "multiple_choice",
          text: "A chuva forte pode prejudicar as aranhas?",
          tip: "Muitas aranhas constroem abrigos para se proteger da chuva.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Sim."
            },
            {
              id: "b",
              text: "Não."
            },
            {
              id: "c",
              text: "Apenas no inverno."
            },
            {
              id: "d",
              text: "Apenas as pequenas."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 7,
          type: "multiple_choice",
          text: "Quando a teia é destruída, a aranha:",
          tip: "O texto mostra que as aranhas são persistentes.",
          points: 1,
          options: [
            {
              id: "a",
              text: "desiste."
            },
            {
              id: "b",
              text: "procura outro animal."
            },
            {
              id: "c",
              text: "faz uma nova teia."
            },
            {
              id: "d",
              text: "muda de espécie."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 8,
          type: "multiple_choice",
          text: "O texto considera as aranhas animais:",
          tip: "Persistência significa não desistir facilmente.",
          points: 1,
          options: [
            {
              id: "a",
              text: "preguiçosos."
            },
            {
              id: "b",
              text: "persistentes."
            },
            {
              id: "c",
              text: "perigosos."
            },
            {
              id: "d",
              text: "lentos."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 9,
          type: "multiple_choice",
          text: "Qual é o objetivo principal de um infográfico?",
          tip: "O infográfico mistura imagens e informações.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Confundir o leitor."
            },
            {
              id: "b",
              text: "Mostrar informações de forma visual e fácil."
            },
            {
              id: "c",
              text: "Contar histórias de fantasia."
            },
            {
              id: "d",
              text: "Fazer propagandas."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 10,
          type: "multiple_choice",
          text: "No infográfico, a Dona Aranha sobe paredes para:",
          tip: "Muitas aranhas sobem paredes usando estruturas especiais nas patas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "brincar."
            },
            {
              id: "b",
              text: "fugir de perigos e procurar alimento."
            },
            {
              id: "c",
              text: "dormir."
            },
            {
              id: "d",
              text: "tomar sol."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 11,
          type: "multiple_choice",
          text: "Qual informação aparece no infográfico?",
          tip: "Observe as informações resumidas do infográfico.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Aranhas fazem ninho de barro."
            },
            {
              id: "b",
              text: "Aranhas constroem teias em locais protegidos."
            },
            {
              id: "c",
              text: "Aranhas vivem somente em árvores."
            },
            {
              id: "d",
              text: "Aranhas não produzem teias."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 12,
          type: "multiple_choice",
          text: "Segundo o infográfico, a aranha ajuda a:",
          tip: "As aranhas fazem parte da cadeia alimentar.",
          points: 1,
          options: [
            {
              id: "a",
              text: "aumentar os mosquitos."
            },
            {
              id: "b",
              text: "manter o equilíbrio ambiental."
            },
            {
              id: "c",
              text: "destruir plantas."
            },
            {
              id: "d",
              text: "poluir rios."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 13,
          type: "multiple_choice",
          text: "Marque a palavra que possui til (~):",
          tip: "O til indica nasalização.",
          points: 1,
          options: [
            {
              id: "a",
              text: "casa"
            },
            {
              id: "b",
              text: "menino"
            },
            {
              id: "c",
              text: "pão"
            },
            {
              id: "d",
              text: "escola"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 14,
          type: "multiple_choice",
          text: "O til (~) é usado para indicar:",
          tip: "O til não é um acento.",
          points: 1,
          options: [
            {
              id: "a",
              text: "plural."
            },
            {
              id: "b",
              text: "nasalização."
            },
            {
              id: "c",
              text: "feminino."
            },
            {
              id: "d",
              text: "diminutivo."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 15,
          type: "multiple_choice",
          text: "Qual palavra apresenta a letra M indicando nasalidade?",
          tip: "Antes de P e B usamos M.",
          points: 1,
          options: [
            {
              id: "a",
              text: "tampa"
            },
            {
              id: "b",
              text: "casa"
            },
            {
              id: "c",
              text: "gato"
            },
            {
              id: "d",
              text: "flor"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 16,
          type: "multiple_choice",
          text: "Complete: Antes de P e B usamos a letra:",
          tip: "Exemplo: campo, bomba.",
          points: 1,
          options: [
            {
              id: "a",
              text: "R"
            },
            {
              id: "b",
              text: "N"
            },
            {
              id: "c",
              text: "M"
            },
            {
              id: "d",
              text: "L"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 17,
          type: "multiple_choice",
          text: "Qual palavra apresenta a letra N indicando nasalidade?",
          tip: "Antes de várias consoantes usamos N.",
          points: 1,
          options: [
            {
              id: "a",
              text: "canto"
            },
            {
              id: "b",
              text: "bola"
            },
            {
              id: "c",
              text: "mesa"
            },
            {
              id: "d",
              text: "livro"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 18,
          type: "multiple_choice",
          text: "Qual palavra possui nasalização?",
          tip: "Procure o som nasal.",
          points: 1,
          options: [
            {
              id: "a",
              text: "irmão"
            },
            {
              id: "b",
              text: "sapato"
            },
            {
              id: "c",
              text: "cadeira"
            },
            {
              id: "d",
              text: "lápis"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 19,
          type: "multiple_choice",
          text: "Substantivos são palavras usadas para:",
          tip: "Pessoas, animais e objetos possuem substantivos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "indicar ações."
            },
            {
              id: "b",
              text: "dar nomes aos seres, objetos e lugares."
            },
            {
              id: "c",
              text: "ligar frases."
            },
            {
              id: "d",
              text: "substituir nomes."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 20,
          type: "multiple_choice",
          text: "Na frase \"A chuva pode derrubar uma aranha\", os substantivos são:",
          tip: "Substantivos dão nome.",
          points: 1,
          options: [
            {
              id: "a",
              text: "pode e derrubar."
            },
            {
              id: "b",
              text: "chuva e aranha."
            },
            {
              id: "c",
              text: "uma e pode."
            },
            {
              id: "d",
              text: "derrubar e uma."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 21,
          type: "multiple_choice",
          text: "Qual palavra é um substantivo?",
          tip: "Escola é o nome de um lugar.",
          points: 1,
          options: [
            {
              id: "a",
              text: "correr"
            },
            {
              id: "b",
              text: "feliz"
            },
            {
              id: "c",
              text: "escola"
            },
            {
              id: "d",
              text: "rapidamente"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 22,
          type: "multiple_choice",
          text: "O plural de \"aranha\" é:",
          tip: "Basta acrescentar S.",
          points: 1,
          options: [
            {
              id: "a",
              text: "aranhas"
            },
            {
              id: "b",
              text: "aranhaes"
            },
            {
              id: "c",
              text: "aranhas"
            },
            {
              id: "d",
              text: "aranhos"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 23,
          type: "multiple_choice",
          text: "O plural de \"chuva\" é:",
          tip: "Muitas palavras terminadas em A formam plural com S.",
          points: 1,
          options: [
            {
              id: "a",
              text: "chuvaes"
            },
            {
              id: "b",
              text: "chuvas"
            },
            {
              id: "c",
              text: "chuvais"
            },
            {
              id: "d",
              text: "chuvases"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 24,
          type: "multiple_choice",
          text: "Qual palavra está no plural?",
          tip: "Observe a terminação da palavra.",
          points: 1,
          options: [
            {
              id: "a",
              text: "menino"
            },
            {
              id: "b",
              text: "casa"
            },
            {
              id: "c",
              text: "flores"
            },
            {
              id: "d",
              text: "gato"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 25,
          type: "multiple_choice",
          text: "O feminino de \"menino\" é:",
          tip: "O final da palavra muda.",
          points: 1,
          options: [
            {
              id: "a",
              text: "menine"
            },
            {
              id: "b",
              text: "menina"
            },
            {
              id: "c",
              text: "meninoa"
            },
            {
              id: "d",
              text: "meninao"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 26,
          type: "multiple_choice",
          text: "O feminino de \"professor\" é:",
          tip: "Algumas palavras mudam a terminação para formar o feminino.",
          points: 1,
          options: [
            {
              id: "a",
              text: "professora"
            },
            {
              id: "b",
              text: "professora"
            },
            {
              id: "c",
              text: "professoraa"
            },
            {
              id: "d",
              text: "professor"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 27,
          type: "multiple_choice",
          text: "Na expressão \"aranha fêmea\", a palavra \"fêmea\" indica:",
          tip: "Algumas palavras usam macho e fêmea.",
          points: 1,
          options: [
            {
              id: "a",
              text: "plural."
            },
            {
              id: "b",
              text: "masculino."
            },
            {
              id: "c",
              text: "feminino."
            },
            {
              id: "d",
              text: "diminutivo."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 28,
          type: "multiple_choice",
          text: "O diminutivo de \"aranha\" é:",
          tip: "O diminutivo indica algo menor.",
          points: 1,
          options: [
            {
              id: "a",
              text: "aranhona"
            },
            {
              id: "b",
              text: "aranhão"
            },
            {
              id: "c",
              text: "aranhinha"
            },
            {
              id: "d",
              text: "aranhas"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 29,
          type: "multiple_choice",
          text: "O aumentativo de \"chuva\" é:",
          tip: "O aumentativo indica algo maior.",
          points: 1,
          options: [
            {
              id: "a",
              text: "chuvinha"
            },
            {
              id: "b",
              text: "chuvinha"
            },
            {
              id: "c",
              text: "chuvão"
            },
            {
              id: "d",
              text: "chuvazinha"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 30,
          type: "multiple_choice",
          text: "Na frase \"As meninas estudam na escola\", qual é o artigo?",
          tip: "Os artigos acompanham os substantivos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "meninas"
            },
            {
              id: "b",
              text: "estudam"
            },
            {
              id: "c",
              text: "escola"
            },
            {
              id: "d",
              text: "as"
            }
          ],
          correctAnswer: "d"
        }
      ]
    },
    "3": {
      AV1: [
        {
          id: 1,
          type: "multiple_choice",
          text: "O diário é um texto usado principalmente para:",
          tip: "Pense no que uma pessoa costuma guardar em um diário sobre sua própria vida. Curiosidade: reler um diário depois de alguns anos pode ajudar a pessoa a perceber quanto ela mudou e cresceu.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ensinar uma receita."
            },
            {
              id: "b",
              text: "registrar acontecimentos, pensamentos e sentimentos."
            },
            {
              id: "c",
              text: "vender um produto."
            },
            {
              id: "d",
              text: "ensinar as regras de um jogo."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 2,
          type: "multiple_choice",
          text: "Qual alternativa apresenta uma característica comum do diário?",
          tip: "Imagine que você está escrevendo apenas para você mesmo. Curiosidade: muitos diários parecem uma conversa entre quem escreve e a própria folha de papel.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Linguagem sempre muito formal."
            },
            {
              id: "b",
              text: "Texto escrito somente em terceira pessoa."
            },
            {
              id: "c",
              text: "Escrita mais informal e pessoal."
            },
            {
              id: "d",
              text: "Presença obrigatória de desenhos."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 3,
          type: "multiple_choice",
          text: "Em um diário, é comum aparecer:",
          tip: "O diário pode ter uma organização parecida com a de uma carta. Curiosidade: algumas pessoas começam seus textos escrevendo expressões como \"Querido diário\".",
          points: 1,
          options: [
            {
              id: "a",
              text: "data, mensagem e, às vezes, saudação e despedida."
            },
            {
              id: "b",
              text: "somente título e preço."
            },
            {
              id: "c",
              text: "ingredientes e modo de preparo."
            },
            {
              id: "d",
              text: "personagens e falas obrigatoriamente."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 4,
          type: "multiple_choice",
          text: "No diário, os verbos costumam aparecer muitas vezes no passado porque:",
          tip: "Pense em alguém escrevendo à noite sobre o que fez durante o dia. Curiosidade: o passado também pode ser chamado de pretérito.",
          points: 1,
          options: [
            {
              id: "a",
              text: "contam fatos que ainda vão acontecer."
            },
            {
              id: "b",
              text: "contam acontecimentos que a pessoa já viveu."
            },
            {
              id: "c",
              text: "apresentam somente ordens."
            },
            {
              id: "d",
              text: "descrevem apenas o tempo."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 5,
          type: "multiple_choice",
          text: "No trecho de Diário de Pilar na África, Pilar queria aprender a tocar:",
          tip: "Esse instrumento também aparece em rodas de capoeira. Curiosidade: o berimbau é um instrumento muito ligado à capoeira brasileira.",
          points: 1,
          options: [
            {
              id: "a",
              text: "piano."
            },
            {
              id: "b",
              text: "violão."
            },
            {
              id: "c",
              text: "berimbau."
            },
            {
              id: "d",
              text: "flauta."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 6,
          type: "multiple_choice",
          text: "Por que Pilar ficou incomodada com a pergunta da diretora?",
          tip: "Pilar não queria simplesmente fazer aquilo que \"todo mundo\" fazia. Curiosidade: o texto também mostra a importância de respeitar os diferentes interesses das pessoas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Porque não queria aprender nenhum instrumento."
            },
            {
              id: "b",
              text: "Porque queria aprender berimbau e a diretora sugeriu piano ou violão."
            },
            {
              id: "c",
              text: "Porque queria abandonar a escola."
            },
            {
              id: "d",
              text: "Porque já sabia tocar todos os instrumentos."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 7,
          type: "multiple_choice",
          text: "Quem ajudou Pilar a tentar construir um berimbau?",
          tip: "É o amigo que acompanha Pilar em sua aventura. Curiosidade: Breno também aparece conversando com Pilar sobre instrumentos musicais.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Samba."
            },
            {
              id: "b",
              text: "A diretora."
            },
            {
              id: "c",
              text: "Breno."
            },
            {
              id: "d",
              text: "A professora de música."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 8,
          type: "multiple_choice",
          text: "Para tentar fazer o berimbau, Pilar e Breno usaram materiais como:",
          tip: "Eles improvisaram o instrumento com objetos encontrados em casa. Curiosidade: instrumentos podem ser construídos com diferentes materiais e formatos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "cabo de vassoura, arame e lata."
            },
            {
              id: "b",
              text: "papel, cola e tinta."
            },
            {
              id: "c",
              text: "plástico, tecido e barbante."
            },
            {
              id: "d",
              text: "pedra, areia e madeira."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 9,
          type: "multiple_choice",
          text: "Quando Pilar e Breno ouviram o som de um agogô, eles:",
          tip: "O som deixou os personagens curiosos. Curiosidade: o agogô é um instrumento de percussão formado geralmente por campânulas de metal.",
          points: 1,
          options: [
            {
              id: "a",
              text: "foram dormir."
            },
            {
              id: "b",
              text: "decidiram descobrir de onde vinha o som."
            },
            {
              id: "c",
              text: "começaram a estudar matemática."
            },
            {
              id: "d",
              text: "jogaram o instrumento fora."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 10,
          type: "multiple_choice",
          text: "Depois de entrarem na rede mágica, Pilar e os outros chegaram a um lugar com:",
          tip: "Relembre a descrição feita no final do trecho. Curiosidade: a descrição de um lugar ajuda o leitor a imaginar onde a história está acontecendo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "neve e prédios altos."
            },
            {
              id: "b",
              text: "mata rasteira, terreno seco e casas de barro com teto de palha."
            },
            {
              id: "c",
              text: "praias cheias de hotéis."
            },
            {
              id: "d",
              text: "uma grande cidade."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 11,
          type: "multiple_choice",
          text: "A palavra já é:",
          tip: "Fale a palavra devagar e conte quantas sílabas ela possui. Curiosidade: palavras formadas por apenas uma sílaba são chamadas de monossílabos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "monossílaba."
            },
            {
              id: "b",
              text: "dissílaba."
            },
            {
              id: "c",
              text: "trissílaba."
            },
            {
              id: "d",
              text: "polissílaba."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 12,
          type: "multiple_choice",
          text: "Qual das palavras abaixo é um monossílabo tônico acentuado?",
          tip: "Procure a palavra que possui somente uma sílaba. Curiosidade: monossílabos tônicos são pronunciados com força e podem receber acento dependendo de sua terminação.",
          points: 1,
          options: [
            {
              id: "a",
              text: "casa"
            },
            {
              id: "b",
              text: "pé"
            },
            {
              id: "c",
              text: "janela"
            },
            {
              id: "d",
              text: "escola"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 13,
          type: "multiple_choice",
          text: "Qual grupo apresenta somente monossílabos tônicos acentuados?",
          tip: "Todas as palavras escolhidas precisam ter apenas uma sílaba. Curiosidade: \"pé\", \"pó\" e \"nós\" seguem a regra de acentuação dos monossílabos tônicos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "pé – pó – nós"
            },
            {
              id: "b",
              text: "café – sofá – cipó"
            },
            {
              id: "c",
              text: "papel – anel – flor"
            },
            {
              id: "d",
              text: "casa – mesa – lata"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 14,
          type: "multiple_choice",
          text: "Os monossílabos tônicos podem ser acentuados quando terminam em:",
          tip: "Lembre-se dos exemplos: já, chás, pé, mês, pó, nós. Curiosidade: a mesma lista de terminações estudada no capítulo também aparece na regra das oxítonas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "-a, -as, -e, -es, -o, -os."
            },
            {
              id: "b",
              text: "apenas -r."
            },
            {
              id: "c",
              text: "apenas -l."
            },
            {
              id: "d",
              text: "qualquer letra."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 15,
          type: "multiple_choice",
          text: "Qual palavra está escrita corretamente?",
          tip: "Procure o monossílabo tônico terminado em -o. Curiosidade: o acento gráfico ajuda a representar corretamente a pronúncia de muitas palavras.",
          points: 1,
          options: [
            {
              id: "a",
              text: "pe"
            },
            {
              id: "b",
              text: "pó"
            },
            {
              id: "c",
              text: "mes"
            },
            {
              id: "d",
              text: "nos"
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 16,
          type: "multiple_choice",
          text: "Na palavra paraná, a sílaba pronunciada com mais força é:",
          tip: "Leia a palavra em voz alta: pa-ra-___. Curiosidade: quando a sílaba mais forte é a última, a palavra é chamada de oxítona.",
          points: 1,
          options: [
            {
              id: "a",
              text: "pa"
            },
            {
              id: "b",
              text: "ra"
            },
            {
              id: "c",
              text: "ná"
            },
            {
              id: "d",
              text: "todas têm a mesma força."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 17,
          type: "multiple_choice",
          text: "As palavras paraná e agogô são:",
          tip: "Observe onde está a sílaba tônica nas duas palavras. Curiosidade: \"paraná\" termina em -a, enquanto \"agogô\" termina em -o.",
          points: 1,
          options: [
            {
              id: "a",
              text: "paroxítonas."
            },
            {
              id: "b",
              text: "proparoxítonas."
            },
            {
              id: "c",
              text: "oxítonas."
            },
            {
              id: "d",
              text: "monossílabas."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 18,
          type: "multiple_choice",
          text: "Qual alternativa apresenta apenas palavras oxítonas acentuadas?",
          tip: "Nas oxítonas, a sílaba mais forte aparece no final da palavra. Curiosidade: \"café\", \"sofá\" e \"avó\" possuem mais de uma sílaba, diferentemente dos monossílabos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "café – sofá – avó"
            },
            {
              id: "b",
              text: "casa – mesa – escola"
            },
            {
              id: "c",
              text: "lápis – árvore – médico"
            },
            {
              id: "d",
              text: "pé – pó – nós"
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 19,
          type: "multiple_choice",
          text: "Qual palavra deve receber acento para ficar correta?",
          tip: "Leia as palavras em voz alta e procure a oxítona terminada em -a. Curiosidade: a escrita correta é sofá, com acento agudo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "papel"
            },
            {
              id: "b",
              text: "flor"
            },
            {
              id: "c",
              text: "sofa"
            },
            {
              id: "d",
              text: "anel"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 20,
          type: "multiple_choice",
          text: "Qual palavra NÃO precisa de acento?",
          tip: "Nem toda palavra oxítona recebe acento. Curiosidade: a palavra \"papel\" é oxítona, mas sua terminação não pertence à regra de acentuação estudada neste capítulo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "café"
            },
            {
              id: "b",
              text: "cipó"
            },
            {
              id: "c",
              text: "papel"
            },
            {
              id: "d",
              text: "robô"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 21,
          type: "multiple_choice",
          text: "Na frase \"Pilar e Breno martelaram um prego\", qual é o verbo?",
          tip: "Procure a palavra que indica aquilo que os personagens fizeram. Curiosidade: os verbos podem indicar ações realizadas por uma ou mais pessoas.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Pilar"
            },
            {
              id: "b",
              text: "Breno"
            },
            {
              id: "c",
              text: "martelaram"
            },
            {
              id: "d",
              text: "prego"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 22,
          type: "multiple_choice",
          text: "Na frase \"Pilar e Breno martelaram um prego\", quem realiza a ação?",
          tip: "Pergunte: \"Quem martelou?\". Curiosidade: em muitas frases, podemos descobrir quem pratica uma ação observando o verbo.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Um prego."
            },
            {
              id: "b",
              text: "Pilar e Breno."
            },
            {
              id: "c",
              text: "Somente o prego."
            },
            {
              id: "d",
              text: "A escola."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 23,
          type: "multiple_choice",
          text: "Qual das palavras abaixo indica uma ação?",
          tip: "Veja qual palavra mostra algo que alguém fez. Curiosidade: palavras como procuramos, pegamos, achamos e embarcamos são verbos de ação.",
          points: 1,
          options: [
            {
              id: "a",
              text: "apartamento"
            },
            {
              id: "b",
              text: "cabo"
            },
            {
              id: "c",
              text: "procuramos"
            },
            {
              id: "d",
              text: "ferramentas"
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 24,
          type: "multiple_choice",
          text: "Na frase \"A professora estava animada\", o verbo estava indica:",
          tip: "A professora não está realizando uma ação; a frase conta como ela se encontrava. Curiosidade: verbos como estar e ficar podem indicar estados.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ação."
            },
            {
              id: "b",
              text: "estado."
            },
            {
              id: "c",
              text: "fenômeno da natureza."
            },
            {
              id: "d",
              text: "lugar."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 25,
          type: "multiple_choice",
          text: "Em qual frase o verbo indica um fenômeno da natureza?",
          tip: "Procure algo que acontece naturalmente no ambiente. Curiosidade: chover, nevar e ventar são exemplos de verbos que podem indicar fenômenos da natureza.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Pedro correu no parque."
            },
            {
              id: "b",
              text: "Maria ficou contente."
            },
            {
              id: "c",
              text: "Ontem choveu muito."
            },
            {
              id: "d",
              text: "Ana desenhou uma flor."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 26,
          type: "multiple_choice",
          text: "Na frase \"Hoje ventou forte na praia\", a palavra ventou indica:",
          tip: "Ninguém precisa realizar essa ação para que ela aconteça. Curiosidade: o vento é provocado pelo movimento do ar na atmosfera.",
          points: 1,
          options: [
            {
              id: "a",
              text: "ação de uma pessoa."
            },
            {
              id: "b",
              text: "estado de alguém."
            },
            {
              id: "c",
              text: "fenômeno da natureza."
            },
            {
              id: "d",
              text: "nome de um lugar."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 27,
          type: "multiple_choice",
          text: "Na frase \"Ontem nós procuramos a vassoura\", o verbo está no:",
          tip: "A palavra ontem mostra quando o fato aconteceu. Curiosidade: no diário, encontramos muitos verbos no passado porque ele costuma registrar acontecimentos já vividos.",
          points: 1,
          options: [
            {
              id: "a",
              text: "passado."
            },
            {
              id: "b",
              text: "presente."
            },
            {
              id: "c",
              text: "futuro."
            },
            {
              id: "d",
              text: "infinitivo."
            }
          ],
          correctAnswer: "a"
        },
        {
          id: 28,
          type: "multiple_choice",
          text: "Na frase \"Eu adoro o meu violão\", o verbo adoro indica algo que acontece:",
          tip: "A pessoa está dizendo como se sente agora. Curiosidade: o presente é usado para falar de algo que acontece no momento da fala ou que é verdadeiro atualmente.",
          points: 1,
          options: [
            {
              id: "a",
              text: "no passado."
            },
            {
              id: "b",
              text: "no presente."
            },
            {
              id: "c",
              text: "no futuro."
            },
            {
              id: "d",
              text: "nunca."
            }
          ],
          correctAnswer: "b"
        },
        {
          id: 29,
          type: "multiple_choice",
          text: "Qual frase apresenta uma ação no futuro?",
          tip: "Procure a frase que fala de algo que ainda vai acontecer. Curiosidade: palavras como amanhã, depois e em breve podem ajudar a identificar ideias de futuro.",
          points: 1,
          options: [
            {
              id: "a",
              text: "Ontem joguei futebol."
            },
            {
              id: "b",
              text: "Agora faço a tarefa."
            },
            {
              id: "c",
              text: "Amanhã visitarei minha avó."
            },
            {
              id: "d",
              text: "Ontem visitei minha avó."
            }
          ],
          correctAnswer: "c"
        },
        {
          id: 30,
          type: "multiple_choice",
          text: "Leia: \"Ontem fomos ao parque. Hoje brincamos em casa. Amanhã iremos à escola.\" Qual é a ordem dos tempos indicados pelas três frases?",
          tip: "Observe especialmente as palavras ontem, hoje e amanhã. Curiosidade: os verbos podem mudar de forma para indicar se algo já aconteceu, está acontecendo ou ainda acontecerá.",
          points: 1,
          options: [
            {
              id: "a",
              text: "futuro – passado – presente"
            },
            {
              id: "b",
              text: "presente – futuro – passado"
            },
            {
              id: "c",
              text: "passado – presente – futuro"
            },
            {
              id: "d",
              text: "passado – futuro – presente"
            }
          ],
          correctAnswer: "c"
        }
      ]
    }
  }
} as const;

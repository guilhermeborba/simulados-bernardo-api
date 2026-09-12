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
          text: "Leia: \"Ontem fomos ao parque. Agora estamos brincando em casa. Amanhã iremos à escola.\" Qual é a ordem dos tempos indicados?",
          tip: "Observe os verbos fomos, estamos brincando e iremos — cada um marca um tempo diferente. Curiosidade: os verbos podem mudar de forma para indicar se algo já aconteceu, está acontecendo ou ainda acontecerá.",
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
      ],
      AV2: [
        {
          id: 1,
          type: "multiple_choice",
          text: "A notícia é um texto jornalístico que:",
          tip: "A notícia trata de fatos reais; o conto e a fábula tratam de fatos inventados. Curiosidade: a palavra \"notícia\" vem do latim notitia, que significa \"conhecimento\".",
          points: 1,
          options: [
            { id: "a", text: "conta uma história inventada, com personagens de ficção" },
            { id: "b", text: "informa sobre um assunto atual ou um acontecimento importante" },
            { id: "c", text: "ensina o passo a passo para fabricar um objeto" },
            { id: "d", text: "apresenta apenas a opinião de quem escreve" }
          ],
          correctAnswer: "b"
        },
        {
          id: 2,
          type: "multiple_choice",
          text: "A notícia costuma aparecer em:",
          tip: "Hoje a maior parte das notícias é lida na internet. Curiosidade: o Jornal Joca, citado no capítulo, é um jornal brasileiro feito especialmente para crianças e jovens.",
          points: 1,
          options: [
            { id: "a", text: "jornais, revistas e na internet" },
            { id: "b", text: "apenas em livros de receitas" },
            { id: "c", text: "somente em bilhetes e cartas" },
            { id: "d", text: "apenas em histórias em quadrinhos" }
          ],
          correctAnswer: "a"
        },
        {
          id: 3,
          type: "multiple_choice",
          text: "O título, também chamado de manchete, é:",
          tip: "A manchete precisa ser curta e chamar a atenção. Curiosidade: \"manchete\" vem de \"mancha\" — os títulos grandes formavam uma mancha escura na página do jornal.",
          points: 1,
          options: [
            { id: "a", text: "o último parágrafo da notícia" },
            { id: "b", text: "uma frase curta que resume o assunto da notícia" },
            { id: "c", text: "o nome do jornal em que a notícia foi publicada" },
            { id: "d", text: "a explicação do que aparece na foto" }
          ],
          correctAnswer: "b"
        },
        {
          id: 4,
          type: "multiple_choice",
          text: "O subtítulo, também chamado de linha fina, serve para:",
          tip: "A linha fina complementa o título. Curiosidade: o nome vem do fato de ela ser escrita com letras menores e mais finas que as do título.",
          points: 1,
          options: [
            { id: "a", text: "repetir exatamente as mesmas palavras do título" },
            { id: "b", text: "trazer mais informações sobre a notícia" },
            { id: "c", text: "indicar o preço do jornal" },
            { id: "d", text: "mostrar a data de nascimento do repórter" }
          ],
          correctAnswer: "b"
        },
        {
          id: 5,
          type: "multiple_choice",
          text: "O lide é o primeiro parágrafo da notícia e responde a perguntas como:",
          tip: "São as 6 perguntas do lide. Curiosidade: \"lide\" vem do inglês lead, que significa \"conduzir\" — é o parágrafo que conduz o leitor.",
          points: 1,
          options: [
            { id: "a", text: "Quanto custa? Quem vende? Onde comprar?" },
            { id: "b", text: "O que aconteceu? Onde? Quando? Com quem? Como? Por quê?" },
            { id: "c", text: "Qual é o final da história? Quem é o vilão?" },
            { id: "d", text: "Quais são os ingredientes e o modo de preparo?" }
          ],
          correctAnswer: "b"
        },
        {
          id: 6,
          type: "multiple_choice",
          text: "A parte da notícia que conta mais detalhes sobre o assunto é:",
          tip: "O corpo traz os detalhes que não cabem no lide. Dica: jornalistas escrevem em \"pirâmide invertida\" — o mais importante vem primeiro, para quem lê só o começo já entender o essencial.",
          points: 1,
          options: [
            { id: "a", text: "a manchete" },
            { id: "b", text: "a foto-legenda" },
            { id: "c", text: "o corpo da notícia" },
            { id: "d", text: "a fonte" }
          ],
          correctAnswer: "c"
        },
        {
          id: 7,
          type: "multiple_choice",
          text: "A foto-legenda é o elemento que:",
          tip: "Cuidado para não confundir imagem (a foto em si) com foto-legenda (o textinho que explica a foto).",
          points: 1,
          options: [
            { id: "a", text: "explica o que aparece na foto da notícia" },
            { id: "b", text: "mostra onde o texto foi publicado" },
            { id: "c", text: "resume o assunto em uma frase curta" },
            { id: "d", text: "responde às perguntas do lide" }
          ],
          correctAnswer: "a"
        },
        {
          id: 8,
          type: "multiple_choice",
          text: "Em uma notícia, a fonte mostra:",
          tip: "Atenção: aqui \"fonte\" não é o tipo de letra do computador! É a indicação de onde o texto foi publicado — como o endereço do site e a data de acesso.",
          points: 1,
          options: [
            { id: "a", text: "o tipo de letra usado pelo jornal" },
            { id: "b", text: "onde o texto foi publicado" },
            { id: "c", text: "quantas pessoas leram a notícia" },
            { id: "d", text: "quantas fotos a notícia tem" }
          ],
          correctAnswer: "b"
        },
        {
          id: 9,
          type: "multiple_choice",
          text: "Os critérios de noticiabilidade indicam:",
          tip: "São as \"perguntas-filtro\" que o jornalista faz antes de decidir se um fato vira notícia. Curiosidade: uma mesma notícia costuma atender a vários critérios ao mesmo tempo.",
          points: 1,
          options: [
            { id: "a", text: "quando um assunto ou acontecimento é importante para virar notícia" },
            { id: "b", text: "o tamanho que a notícia deve ter" },
            { id: "c", text: "a cor das letras usadas no jornal" },
            { id: "d", text: "quantas fotos a notícia precisa ter" }
          ],
          correctAnswer: "a"
        },
        {
          id: 10,
          type: "multiple_choice",
          text: "O critério da atualidade faz a pergunta:",
          tip: "Atualidade = recente. Dica: pense \"aconteceu agora ou faz pouco tempo?\".",
          points: 1,
          options: [
            { id: "a", text: "O acontecimento é recente?" },
            { id: "b", text: "É a primeira vez que isso acontece?" },
            { id: "c", text: "O acontecimento ocorreu perto de quem vai ler?" },
            { id: "d", text: "O acontecimento mostra problemas ou debates?" }
          ],
          correctAnswer: "a"
        },
        {
          id: 11,
          type: "multiple_choice",
          text: "\"É a primeira vez que esse acontecimento ocorre?\" Essa pergunta corresponde ao critério de:",
          tip: "\"Inédito\" significa \"nunca visto antes\". Curiosidade: por isso as primeiras vezes viram manchete — primeiro voo, primeira vacina, primeiro título.",
          points: 1,
          options: [
            { id: "a", text: "proximidade" },
            { id: "b", text: "ineditismo" },
            { id: "c", text: "relevância" },
            { id: "d", text: "conflito" }
          ],
          correctAnswer: "b"
        },
        {
          id: 12,
          type: "multiple_choice",
          text: "O critério da proximidade está presente quando:",
          tip: "Proximidade = perto de quem lê. Dica: uma chuva forte em Florianópolis interessa mais a quem mora aqui do que a quem mora em outro país.",
          points: 1,
          options: [
            { id: "a", text: "o acontecimento é muito antigo" },
            { id: "b", text: "o acontecimento ocorreu perto das pessoas que vão ler ou ouvir a notícia" },
            { id: "c", text: "o acontecimento mostra uma discussão" },
            { id: "d", text: "a notícia tem muitas fotos" }
          ],
          correctAnswer: "b"
        },
        {
          id: 13,
          type: "multiple_choice",
          text: "Quando um acontecimento é importante para a vida ou o dia a dia das pessoas, dizemos que ele tem:",
          tip: "Relevância = importa para a vida das pessoas. Dica: pense \"isso muda ou afeta o meu dia a dia?\".",
          points: 1,
          options: [
            { id: "a", text: "ineditismo" },
            { id: "b", text: "atualidade" },
            { id: "c", text: "relevância" },
            { id: "d", text: "conflito" }
          ],
          correctAnswer: "c"
        },
        {
          id: 14,
          type: "multiple_choice",
          text: "Uma notícia que emociona, inspira ou diverte, mostrando ações de solidariedade e histórias de superação, atende ao critério de:",
          tip: "Interesse humano é o critério das histórias que emocionam. Curiosidade: a notícia do cão Teddy atende bem a esse critério, por mostrar superação e vínculo.",
          points: 1,
          options: [
            { id: "a", text: "interesse humano" },
            { id: "b", text: "ineditismo" },
            { id: "c", text: "proximidade" },
            { id: "d", text: "atualidade" }
          ],
          correctAnswer: "a"
        },
        {
          id: 15,
          type: "multiple_choice",
          text: "O critério do conflito aparece quando o acontecimento:",
          tip: "Conflito não é só briga: também é debate de ideias ou um desafio a ser resolvido.",
          points: 1,
          options: [
            { id: "a", text: "é engraçado e diverte as pessoas" },
            { id: "b", text: "mostra problemas, desafios ou debate de ideias" },
            { id: "c", text: "aconteceu há muitos anos" },
            { id: "d", text: "foi publicado em uma revista" }
          ],
          correctAnswer: "b"
        },
        {
          id: 16,
          type: "multiple_choice",
          text: "A notícia sobre o cão Teddy foi escrita e publicada em 2025, no mesmo período em que o caso aconteceu. Isso mostra que ela atende principalmente ao critério de:",
          tip: "A notícia foi publicada logo após o fato — isso é atualidade. Dica: na questão 4 da atividade do livro, \"Sim. Ela foi escrita em 2025\" responde justamente à pergunta sobre atualidade.",
          points: 1,
          options: [
            { id: "a", text: "conflito" },
            { id: "b", text: "atualidade" },
            { id: "c", text: "relevância" },
            { id: "d", text: "ineditismo" }
          ],
          correctAnswer: "b"
        },
        {
          id: 17,
          type: "multiple_choice",
          text: "Segundo o texto \"Cães de assistência: heróis de quatro patas\", os cães-guia:",
          tip: "Cães-guia = olhos emprestados. Curiosidade: no Brasil, a lei garante que o cão-guia entre com seu dono em ônibus, lojas, escolas e hospitais.",
          points: 1,
          options: [
            { id: "a", text: "auxiliam pessoas cegas ou com baixa visão a se locomover com segurança" },
            { id: "b", text: "avisam sobre o toque do telefone e o alarme de incêndio" },
            { id: "c", text: "fazem equoterapia com crianças" },
            { id: "d", text: "trabalham somente dentro de hospitais" }
          ],
          correctAnswer: "a"
        },
        {
          id: 18,
          type: "multiple_choice",
          text: "Os cães ouvintes colaboram com pessoas com deficiência auditiva:",
          tip: "Cães ouvintes = ouvidos emprestados. Eles tocam a pessoa com a patinha para avisar sobre um som importante.",
          points: 1,
          options: [
            { id: "a", text: "puxando cadeiras de rodas" },
            { id: "b", text: "na percepção de sons importantes, como o toque do telefone ou o alarme de incêndio" },
            { id: "c", text: "ensinando a língua de sinais" },
            { id: "d", text: "levando remédios até a farmácia" }
          ],
          correctAnswer: "b"
        },
        {
          id: 19,
          type: "multiple_choice",
          text: "De acordo com o texto, os cães de serviço trabalham com pessoas que vivem com autismo, epilepsia, diabetes ou outras condições e podem:",
          tip: "Cães de serviço fazem várias tarefas. Curiosidade: alguns conseguem perceber mudanças no cheiro do corpo e alertar antes de uma crise acontecer.",
          points: 1,
          options: [
            { id: "a", text: "apenas brincar e passear" },
            { id: "b", text: "alertar para crises, acalmar a pessoa em momentos de estresse, buscar objetos ou acionar ajuda" },
            { id: "c", text: "substituir totalmente os médicos" },
            { id: "d", text: "dirigir carros e ônibus" }
          ],
          correctAnswer: "b"
        },
        {
          id: 20,
          type: "multiple_choice",
          text: "Na Terapia Assistida por Animais (TAA), os cavalos são usados:",
          tip: "Equoterapia é a terapia feita com cavalos. Curiosidade: \"equo\" vem do latim equus, que significa cavalo.",
          points: 1,
          options: [
            { id: "a", text: "em equoterapia, para ajudar no equilíbrio e na força física" },
            { id: "b", text: "para acalmar crianças internadas em hospitais" },
            { id: "c", text: "para reduzir a solidão em asilos e clínicas" },
            { id: "d", text: "para alertar sobre alarmes de incêndio" }
          ],
          correctAnswer: "a"
        },
        {
          id: 21,
          type: "multiple_choice",
          text: "Ainda sobre a TAA, os gatos e os coelhos podem:",
          tip: "Gatos e coelhos são pequenos e calmos, ideais para hospitais infantis. Atenção: quem reduz a solidão em asilos e clínicas são os cães.",
          points: 1,
          options: [
            { id: "a", text: "guiar pessoas cegas pelas ruas" },
            { id: "b", text: "acalmar crianças internadas em hospitais" },
            { id: "c", text: "ajudar no equilíbrio e na força física" },
            { id: "d", text: "perceber o toque do telefone" }
          ],
          correctAnswer: "b"
        },
        {
          id: 22,
          type: "multiple_choice",
          text: "Segundo o instrutor Fabiano Pereira, entrevistado pelo Jornal Joca, a base do trabalho dos cães de assistência está:",
          tip: "O treinamento é importante, mas a base é o vínculo. Curiosidade: esse treinamento é longo — pode durar cerca de dois anos.",
          points: 1,
          options: [
            { id: "a", text: "somente no treinamento, que dura poucos dias" },
            { id: "b", text: "no vínculo emocional criado para o cão ajudar a pessoa de quem gosta" },
            { id: "c", text: "na raça do cachorro" },
            { id: "d", text: "no tamanho do animal" }
          ],
          correctAnswer: "b"
        },
        {
          id: 23,
          type: "multiple_choice",
          text: "Na notícia \"Alunos de Santo André se destacam com projetos de robótica em evento nacional\", o texto:",
          tip: "A notícia relata o destaque de três estudantes. Curiosidade: Arthur (11 anos) criou um \"robô de garimpo\" para evitar riscos na mineração; Antônio (13) fez uma prótese de mão robótica com inteligência artificial e peças impressas em 3D; e Davi (13) desenvolveu entregas com drones autônomos.",
          points: 1,
          options: [
            { id: "a", text: "mostra como é o trabalho dos jurados em eventos de tecnologia" },
            { id: "b", text: "relata o destaque que três estudantes tiveram com seus projetos de robótica" },
            { id: "c", text: "explica por que a robótica é mais importante que outras áreas da ciência" },
            { id: "d", text: "ensina a montar um robô em casa" }
          ],
          correctAnswer: "b"
        },
        {
          id: 24,
          type: "multiple_choice",
          text: "Nas palavras depende, tratamento e como, as vogais e e o do final muitas vezes são pronunciadas como:",
          tip: "Falamos \"dependi\", \"tratamentu\", \"comu\" — mas escrevemos com e e o.",
          points: 1,
          options: [
            { id: "a", text: "-a e -e" },
            { id: "b", text: "-i e -u" },
            { id: "c", text: "-o e -a" },
            { id: "d", text: "-é e -ó" }
          ],
          correctAnswer: "b"
        },
        {
          id: 25,
          type: "multiple_choice",
          text: "Sobre essa mudança na pronúncia das vogais e e o no final das palavras, é correto afirmar que ela:",
          tip: "Dica de ouro para o ditado: a fala pode mudar, a escrita não. Por isso não se escreve \"bolu\" nem \"genti\".",
          points: 1,
          options: [
            { id: "a", text: "acontece na fala, mas não muda a forma como escrevemos as palavras" },
            { id: "b", text: "muda também a escrita das palavras" },
            { id: "c", text: "acontece só em palavras muito compridas" },
            { id: "d", text: "nunca acontece na língua portuguesa" }
          ],
          correctAnswer: "a"
        },
        {
          id: 26,
          type: "multiple_choice",
          text: "As palavras avô, até e você são oxítonas ou monossílabos acentuados. Nelas, as vogais e e o do final:",
          tip: "O acento \"segura\" o som original: avô, até, você.",
          points: 1,
          options: [
            { id: "a", text: "mantêm a pronúncia, ou seja, são faladas como se escrevem" },
            { id: "b", text: "são pronunciadas como -i e -u" },
            { id: "c", text: "não são pronunciadas" },
            { id: "d", text: "mudam de lugar dentro da palavra" }
          ],
          correctAnswer: "a"
        },
        {
          id: 27,
          type: "multiple_choice",
          text: "Leia: \"O cachorro latiu muito. Ele estava feliz.\" Nesse exemplo, a repetição foi evitada com o uso de:",
          tip: "Pronomes como ele, ela, isso e aquilo substituem palavras já ditas.",
          points: 1,
          options: [
            { id: "a", text: "um pronome" },
            { id: "b", text: "uma palavra mais geral" },
            { id: "c", text: "a omissão de uma parte da frase" },
            { id: "d", text: "uma palavra de sentido contrário" }
          ],
          correctAnswer: "a"
        },
        {
          id: 28,
          type: "multiple_choice",
          text: "Leia: \"O gato subiu na árvore. O animal estava fugindo de um cachorro.\" Nesse caso, a repetição foi evitada com o uso de:",
          tip: "\"Animal\" é uma palavra mais geral que \"gato\". Curiosidade: na gramática, essa palavra mais ampla é chamada de hiperônimo.",
          points: 1,
          options: [
            { id: "a", text: "um pronome" },
            { id: "b", text: "uma palavra mais geral" },
            { id: "c", text: "uma palavra de sentido contrário" },
            { id: "d", text: "a omissão de uma parte da frase" }
          ],
          correctAnswer: "b"
        },
        {
          id: 29,
          type: "multiple_choice",
          text: "Leia: \"Eu gosto de cachorros e você de gatos.\" Nessa frase, a repetição de \"gostar de\" foi evitada porque essa parte foi:",
          tip: "Quando a parte omitida é facilmente entendida, o texto fica mais leve. Curiosidade: esse recurso tem nome: elipse.",
          points: 1,
          options: [
            { id: "a", text: "repetida duas vezes" },
            { id: "b", text: "trocada por um pronome" },
            { id: "c", text: "omitida, já que pode ser facilmente entendida" },
            { id: "d", text: "escrita com outras letras" }
          ],
          correctAnswer: "c"
        },
        {
          id: 30,
          type: "multiple_choice",
          text: "Leia: \"Teddy é um cão de assistência. Teddy ajuda a garota a se desenvolver.\" Qual palavra ou expressão pode substituir o trecho destacado para evitar a repetição?",
          tip: "\"O cão\" e \"O cachorro\" servem; \"O menino\" não, porque Teddy é um cachorro, e \"A garota\" é outra personagem.",
          points: 1,
          options: [
            { id: "a", text: "O menino" },
            { id: "b", text: "O cão" },
            { id: "c", text: "A garota" },
            { id: "d", text: "O treinador" }
          ],
          correctAnswer: "b"
        }
      ]
    }
  }
} as const;

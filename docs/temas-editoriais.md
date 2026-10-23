# Temas editoriais

Vocabulário do campo `theme` das questões (`prisma/seed-data/`). O resultado do Giz agrupa os acertos por tema, então **o mesmo assunto precisa ter o mesmo nome** em todos os simulados de uma disciplina e ano. Como importar e validar: [guia do seed](guia-seed-importacao.md). O trabalho de preencher os temas é a etapa E04 do Giz (issue `guilhermeborba/simulados-bernardo#56`).

## Regras

- O tema descreve o conteúdo da questão, em 1 a 4 palavras, com inicial maiúscula: “Frações”, “Ciclo da água”, “Sistema solar”.
- O tema não revela a resposta e não descreve o formato da questão (“Interpretação de imagem” não é tema).
- Antes de criar um tema novo, procure um equivalente na tabela da disciplina e ano. Prefira o nome que já existe.
- Entre 3 e 8 temas por simulado de 30 questões costuma dar um resultado útil. Um tema por questão não ajuda o aluno.
- Não altere enunciado, alternativas, gabarito, dica ou curiosidade ao preencher temas.
- Classificação feita por pessoa ou agente, revisada no PR. Não há classificação automática.

## Vocabulário

Uma seção por disciplina e ano, preenchida conforme os lotes da E04 forem concluídos. Ordem de prioridade: 3º ano (turma-bernardo), 4º ano e depois os demais.

<!--
Modelo:

### Geografia — 3º ano

| Tema | Abrange |
|---|---|
| Paisagem | elementos naturais e culturais, transformações |
| Orientação | pontos cardeais, mapas, legenda |
-->

### Geografia — 3º ano

| Tema | Abrange |
|---|---|
| Agricultura | Cultivo, etapas da produção, máquinas e agricultura familiar e comercial. |
| Campo e cidade | Características dos espaços rural e urbano, interdependência e trabalho no município. |
| Clima e cotidiano | Tipos de clima, estações e relações com moradia, trabalho, vestuário e lazer. |
| Comércio | Compra, venda, consumidores, estabelecimentos e comércio pela internet. |
| Extrativismo | Retirada de recursos vegetais, animais e minerais. |
| Hidrografia | Rios, afluentes, nascente, foz e usos da água. |
| Indústria e matérias-primas | Origens de matérias-primas, transformação, agroindústria e trabalho nas fábricas. |
| Migração | Êxodo rural e motivos de deslocamento entre campo e cidade. |
| Transportes e circulação | Transporte de cargas, vias, transporte público, ciclovias e congestionamento. |
| Organização das cidades | Bairros, centro, periferia, crescimento, moradia e planejamento urbano. |
| Orientação e localização | Pontos de referência, trajetos, lateralidade, distâncias, GPS, bússola e pontos cardeais. |
| Paisagens | Elementos naturais e culturais e transformações da paisagem. |
| Pecuária | Criação de animais, modalidades extensiva e intensiva. |
| Pontos de vista | Visões vertical, frontal e oblíqua; fotografias aéreas. |
| Preservação ambiental | Desmatamento, erosão, poluição, conservação, reciclagem e equilíbrio ambiental. |
| Prestação de serviços | Trabalhos de serviços, serviços públicos e privados e setores de emprego. |
| Relevo | Montanhas, serras, planícies, planaltos, depressões e usos do relevo. |
| Representações cartográficas | Mapas, plantas, croquis, maquetes, legendas, símbolos, escala e título. |
| Saneamento e infraestrutura | Água, esgoto, resíduos, iluminação e infraestrutura dos bairros. |
| Vegetação | Florestas, Cerrado e relação da cobertura vegetal com o clima. |

Lote E04: 390 questões em 13 arquivos, incluindo os cinco simulados privados da `turma-bernardo` (150 questões) e os oito arquivos `questoes-geografia-3ano-b*-av*.ts` (240 questões). Todos compartilham este vocabulário. A quantidade de temas acompanha o conteúdo: não se subdividem artificialmente simulados concentrados em poucos assuntos.

O simulado B1/AV2 geral e o B2/AV1 da turma concentram dois temas; o B4/AV2 geral revisa nove temas do ano. Esses agrupamentos seguem o conteúdo existente, preservando os mesmos nomes ao longo do lote.

### Matemática — 3º ano

| Tema | Abrange |
|---|---|
| Adição | Somas, reagrupamento e situações de juntar ou acrescentar quantidades. |
| Adição e subtração | Situações e sínteses que articulam as duas operações na mesma questão. |
| Divisão | Repartição em partes iguais, formação de grupos, termos da divisão e relação inversa com a multiplicação. |
| Figuras planas | Polígonos, círculos, lados, vértices, quadriláteros e congruência. |
| Frações | Partes iguais de um todo ou quantidade: metade, terça parte, quarta parte e comparações. |
| Grandezas e medidas | Questões que articulam diferentes grandezas e seus instrumentos, incluindo temperatura. |
| Igualdades | Sinal de igual e equivalência de quantidades ou resultados de operações. |
| Matemática no cotidiano | Síntese sobre os usos de números, operações, frações, medidas e formas no dia a dia. |
| Medidas de capacidade | Instrumentos, recipientes, litro, mililitro e suas equivalências. |
| Medidas de comprimento | Instrumentos, escolha de unidades e equivalência entre metro e centímetro. |
| Medidas de massa | Instrumentos, escolha de unidades e equivalências entre quilograma, grama e miligrama. |
| Medidas de tempo | Relógios, duração, instrumentos de medição, calendário e equivalências entre unidades de tempo. |
| Multiplicação | Parcelas iguais, agrupamentos, tabuadas, dobro, triplo e cálculo por decomposição; inclui sequências de tabuadas. |
| Probabilidade | Eventos certos, possíveis, impossíveis, mais prováveis e menos prováveis. |
| Sequências numéricas | Regularidades em sequências crescentes e decrescentes e descoberta de padrões numéricos. |
| Sistema de numeração | Leitura e escrita, valor posicional, composição, decomposição e comparação de números; antecessor e sucessor. |
| Sistema monetário | Dinheiro, trocas, meios de pagamento, reais, centavos, compras e troco. |
| Subtração | Diferenças, reagrupamento e situações de retirar ou comparar quantidades. |
| Sólidos geométricos | Formas espaciais, poliedros, corpos redondos, faces, arestas e vértices. |
| Área | Medida de superfícies pela contagem de unidades na malha quadriculada. |

Lote E04: **389 questões em 13 arquivos**. Os oito arquivos `questoes-matematica-3ano-b*-av*.ts` têm 240 questões; os cinco privados da `turma-bernardo` têm 149. O arquivo `questoes-matematica.ts` já contém 29 questões (IDs 1–21 e 23–30); a ausência do ID 22 foi preservada, assim como todos os demais campos.

Arquivos privados do lote: `questoes-matematica.ts`, `questoes-matematica-av1.ts`, `questoes-matematica-av2.ts`, `questoes-matematica-3bim-av1.ts` e `questoes-matematica-3bim-av2.ts`. Compartilham o vocabulário com os oito gerais.

A classificação segue o conteúdo predominante. Sequências que treinam uma tabuada ficam em **Multiplicação**; sequências gerais, em **Sequências numéricas**. Questões com diferentes grandezas usam **Grandezas e medidas**, enquanto as específicas usam o respectivo tema. O grupo **Igualdades** trata equivalência entre expressões, não apenas a operação usada nelas.

Não se subdividem artificialmente simulados concentrados em um assunto: os dois de tabuada, o de divisão e o de frações gerais têm um tema cada; o AV1 de geometria da turma tem dois. O B4/AV2 geral revisa onze temas do ano. Todos os temas têm de uma a quatro palavras e não incluem resultados numéricos ou respostas literais.

### Ciências — 3º ano

| Tema | Abrange |
|---|---|
| Adaptações dos seres vivos | Características e comportamentos relacionados à sobrevivência no ambiente, como camuflagem, migração e proteção. |
| Alimentação dos animais | Hábitos alimentares, tipos de alimento e relações entre animais e sua alimentação. |
| Alimentação saudável | Variedade alimentar, nutrientes, hidratação e escolhas alimentares abordadas nas questões. |
| Ciclo de vida | Nascimento, crescimento, reprodução, desenvolvimento, metamorfose e fases da vida de plantas, animais e seres humanos. |
| Ciência no cotidiano | Síntese dos usos de Ciências para compreender seres vivos, ambientes, corpo humano e materiais. |
| Classificação dos animais | Critérios e características usados para comparar grupos de animais, incluindo vertebrados e invertebrados. |
| Composição do solo | Componentes, partículas e camadas do solo, incluindo matéria orgânica, ar, areia e argila. |
| Conservação do solo | Importância, fertilidade, adubação, compostagem, preservação e impactos da poluição do solo. |
| Corpo humano | Órgãos, funções e integração dos sistemas digestório, respiratório e circulatório. |
| Estados físicos | Características e exemplos dos estados sólido, líquido e gasoso. |
| Fenômenos sonoros | Produção, propagação e percepção de sons, intensidade, altura, materiais e tamanho das fontes sonoras. |
| Formação do solo | Origem do solo a partir das rochas, agentes e tempo de formação. |
| Habitat | Ambientes em que os seres vivos vivem, suas condições e importância da preservação desses ambientes. |
| Hábitos de higiene | Limpeza pessoal, dos alimentos e dos ambientes e cuidados para evitar contaminação. |
| Locomoção dos animais | Modos de deslocamento, como nadar, voar e rastejar. |
| Luz e visão | Passagem e reflexão da luz, formação de sombras e imagens e percepção visual dos objetos. |
| Matéria e materiais | Conceito de matéria e questões que articulam estados físicos e propriedades dos materiais. |
| Misturas | Combinação de materiais e distinção entre misturas homogêneas e heterogêneas. |
| Partes das plantas | Raiz, caule, folhas, flores, frutos e sementes: funções, relações e necessidades da planta. |
| Prevenção da dengue | Questões sobre o mosquito Aedes aegypti, seus criadouros e sua relação com a transmissão de doenças. |
| Propriedades dos materiais | Dureza, flexibilidade, transparência, translucidez, opacidade e escolha de materiais para diferentes usos. |
| Recursos minerais | Minerais presentes no solo, seus usos e formas de extração. |
| Reprodução dos animais | Formas de nascimento e desenvolvimento dos filhotes: oviparidade, viviparidade, ovoviviparidade e cuidados parentais. |
| Saúde e bem-estar | Cuidados gerais com a saúde, sono, atividades físicas, vacinação e acompanhamento de saúde. |
| Separação de misturas | Métodos e situações de separação, incluindo peneiração, filtração, decantação e evaporação. |
| Seres vivos | Distinção entre seres vivos e não vivos e características gerais dos seres vivos. |
| Tipos de solo | Comparação entre solos arenosos, argilosos e humíferos e suas características para o plantio. |
| Transformações da matéria | Mudanças de estado relacionadas ao aquecimento e ao resfriamento, com exemplos do cotidiano. |
| Vida no solo | Microrganismos e outros seres vivos presentes no solo e suas funções. |

Lote E04: **390 questões em 13 arquivos**, sendo oito gerais `questoes-ciencias-3ano-b*-av*.ts` (240 questões) e cinco privados da `turma-bernardo` (150 questões). Os privados são `questoes-ciencias.ts`, `questoes-ciencias-av1.ts`, `questoes-ciencias-av2.ts`, `questoes-ciencias-3bim-av1.ts` e `questoes-ciencias-3bim-av2.ts`.

Os temas seguem o conteúdo predominante de cada questão, incluindo os itens internos de verdadeiro/falso. **Ciclo de vida** vale para plantas, animais e seres humanos; **Reprodução dos animais** diferencia as formas de nascimento e os cuidados com filhotes. Questões compostas que misturam nascimento, metamorfose e o mosquito permanecem no agrupamento de ciclo de vida; as focadas nos criadouros ou na transmissão da dengue usam **Prevenção da dengue**.

As mesmas propriedades de transparência, translucidez e opacidade usam **Propriedades dos materiais** nos diferentes arquivos. Reflexos, sombras e percepção visual usam **Luz e visão**. Questões sobre o ambiente em que um animal vive usam **Habitat**; as que perguntam como ele se desloca ou se alimenta usam os respectivos temas.

Os nomes **Classificação dos animais** e **Corpo humano** não antecipam o grupo taxonômico, órgão ou sistema que pode ser a resposta da questão. Não se criam rótulos com nomes de alternativas corretas, métodos específicos ou substâncias para entregar o gabarito.

Não se subdividem artificialmente unidades concentradas: B2/AV1 geral (classificação dos animais) e B3/AV1 geral (corpo humano) têm um tema cada; B1/AV1, B1/AV2 e B2/AV2 gerais têm dois. B4/AV2 geral revisa dez temas do ano. Enunciados, alternativas, gabaritos, dicas, curiosidades e todos os demais campos foram preservados.

Quando o tema coincidir literalmente com a alternativa correta, usa-se uma categoria mais ampla: a questão 21 de `questoes-ciencias-3bim-av2.ts`, que pede o nome do ciclo de vida, usa **Seres vivos**. O conceito específico continua em **Ciclo de vida** nas questões sobre suas etapas e transformações.

### História — 3º ano

| Tema | Abrange |
|---|---|
| Alimentação e costumes | Comidas, ingredientes, hábitos de refeição e contribuições culturais relacionadas à alimentação. |
| Campo e cidade | Características, rotinas, diferenças e relações entre os espaços rural e urbano. |
| Cidadania e respeito | Convivência respeitosa, acolhimento, valorização das diferenças e responsabilidade com o lugar onde se vive. |
| Cultura e identidade | Costumes, línguas, saberes, contribuições culturais, identidades regionais e diversidade cultural. |
| Direitos e participação | Direitos dos povos, conquistas sociais e trabalhistas, proteção da infância e enfrentamento das desigualdades. |
| Educação e família | Mudanças e permanências na educação, nos vínculos familiares e nos cuidados entre gerações. |
| Escravidão e resistência | Escravização, tráfico, formas de resistência, comunidades livres e abolição. |
| Expressões artísticas | Música e danças, suas características e influências culturais. |
| Festas e tradições | Comemorações, festas populares e tradições transmitidas entre gerações. |
| Formação do Brasil | Participação de diferentes populações na formação histórica das comunidades e do povo brasileiro. |
| História do trabalho | Atividades, profissões, condições e importância do trabalho em diferentes períodos históricos. |
| História e memória | Estudo da História, memória local, compreensão do passado e relações entre passado e presente. |
| Lazer e brincadeiras | Brincadeiras, esportes, descanso e atividades de lazer em diferentes lugares e épocas. |
| Migrações | Deslocamentos de pessoas, motivos das mudanças e imigração para o Brasil. |
| Mobilidade e acessibilidade | Transporte coletivo, circulação, acessibilidade e cuidado com outros usuários do transporte. |
| Moradias e cotidiano | Materiais, formas de morar, arquitetura e transformações das habitações ao longo do tempo. |
| Patrimônio e preservação | Patrimônio material e imaterial, bens culturais, museus, restauração e transmissão de conhecimentos tradicionais. |
| Registros do passado | Fontes escritas, visuais, orais e materiais, pesquisa histórica, nomes de lugares e registros da memória local. |
| Serviços e espaços públicos | Uso e funções de espaços coletivos, instituições e serviços públicos. |
| Trabalho e tecnologia | Industrialização, mecanização, automação e mudanças nas profissões e atividades por novas tecnologias. |
| Trabalho nas cidades | Atividades e trabalhadores da indústria, comércio e serviços no espaço urbano. |
| Trabalho no campo | Atividades, profissionais e formas de produção e subsistência no meio rural. |
| Transformações sociais | Mudanças e permanências na organização social, nos espaços e nas relações entre pessoas. |
| Vida em comunidade | Convívio, organização e relações entre as pessoas de uma comunidade. |

Lote E04: **390 questões em 13 arquivos**, sendo oito gerais `questoes-historia-3ano-b*-av*.ts` (240 questões) e cinco privados da `turma-bernardo` (150 questões). Os privados são `questoes-historia.ts`, `questoes-historia-av1.ts`, `questoes-historia-av2.ts`, `questoes-historia-3bim-av1.ts` e `questoes-historia-3bim-av2.ts`.

Os temas seguem o conteúdo predominante, incluindo os itens internos de verdadeiro/falso e as alternativas dos enunciados genéricos. **Registros do passado** reúne os suportes usados para conhecer a história; **História e memória**, a função desse conhecimento. **Patrimônio e preservação** reúne tanto bens materiais quanto imateriais, sem antecipar qual tipo é a resposta.

Questões sobre a origem específica de pratos, palavras ou manifestações usam os grupos de conteúdo (como **Alimentação e costumes** e **Expressões artísticas**), sem usar o povo ou país que pode ser a resposta como rótulo. Características gerais das culturas e identidades usam **Cultura e identidade**; deslocamentos de pessoas e seus motivos usam **Migrações**.

**História do trabalho** cobre atividades e condições em diferentes épocas; mudanças ligadas a ferramentas, máquinas, informática ou internet usam **Trabalho e tecnologia**. Questões sobre ocupações no campo ou na cidade usam os respectivos temas. Direitos e desigualdades são tratados separadamente em **Direitos e participação**.

Não se subdivide artificialmente o B3/AV1 geral, concentrado em patrimônio, que tem um tema. O B4/AV2 geral revisa onze temas do ano. Todos os demais campos foram preservados exatamente. A inconsistência preexistente de gabarito na questão 5 do B4/AV1 geral foi registrada na [issue web #70](https://github.com/guilhermeborba/simulados-bernardo/issues/70), sem correção de gabarito neste lote.

### Português — 3º ano

| Tema | Abrange |
|---|---|
| Adjetivos | Palavras que caracterizam os substantivos e seu uso na descrição de seres, objetos e lugares. |
| Artigos | Identificação dos artigos que acompanham substantivos nas frases. |
| Classes de palavras | Comparação e identificação de classes gramaticais, incluindo questões que articulam substantivos, adjetivos e verbos. |
| Coesão textual | Retomadas e formas de evitar repetições usando pronomes, expressões mais gerais e omissão de termos recuperáveis. |
| Construção de frases | Organização das palavras, identificação de quem realiza a ação e reconhecimento de afirmações, negações, perguntas, exclamações e ordens. |
| Dígrafos | Reconhecimento de grupos de duas letras que representam um só som e identificação dessas letras nas palavras. |
| Encontros consonantais | Reconhecimento de consoantes vizinhas e das letras que compõem seus encontros nas palavras. |
| Encontros vocálicos | Reconhecimento de vogais vizinhas e das letras que compõem seus encontros nas palavras. |
| Fábulas | Características, personagens, autores, interpretação e ensinamentos das fábulas. |
| Flexão das palavras | Masculino e feminino, singular e plural e graus aumentativo e diminutivo nas palavras e expressões. |
| Gêneros textuais | Finalidades, características e escolha de bilhetes, convites, receitas, listas, cartas, manuais, quadrinhos, diários, campanhas e infográficos. |
| Leitura e compreensão | Localização de informações, identificação de participantes e ações e compreensão de mensagens nos textos estudados. |
| Leitura e escrita | Síntese dos recursos da língua e sua importância para organizar e comunicar ideias em textos. |
| Letras e sons | Comparação e classificação de encontros vocálicos, encontros consonantais e dígrafos sem antecipar qual grupo é a resposta. |
| Notícias | Função e estrutura da notícia, manchete, linha fina, lide, fonte, foto-legenda e critérios de noticiabilidade. |
| Ordem alfabética | Ordenação de palavras e nomes, consulta ao dicionário e organização de listas. |
| Ortografia | Grafia e relações entre letras e sons: C/QU, G/GU, M/N, nasalidade e til, SS, X/CH e escrita correta de palavras. |
| Poesia | Versos, estrofes, rimas, ritmo, parlendas e recursos de expressão em poemas. |
| Pontuação | Uso de ponto final, interrogação, exclamação e vírgula para expressar sentidos e organizar o texto. |
| Pronúncia das palavras | Relação entre fala e escrita e pronúncia das vogais finais, com e sem acento gráfico. |
| Separação silábica | Divisão das palavras em sílabas, incluindo palavras com encontros consonantais e dígrafos. |
| Sinônimos e antônimos | Palavras de sentido semelhante ou contrário e substituição de palavras em frases e textos. |
| Sílabas e acentuação | Monossílabos, sílaba tônica, oxítonas e regras de acentuação nos exemplos estudados. |
| Substantivos | Nomes de seres, objetos e lugares, substantivos comuns e próprios e uso de maiúscula em nomes próprios. |
| Tempos verbais | Presente, passado e futuro: reconhecimento, usos e transformação das formas verbais. |
| Verbos | Identificação de verbos, ações, estados e fenômenos da natureza; emprego do imperativo em ordens e instruções. |

Lote E04: **390 questões em 13 simulados, distribuídos em nove arquivos**. Os oito gerais `questoes-portugues-3ano-b*-av*.ts` têm 240 questões. Os cinco privados da `turma-bernardo` compartilham o arquivo `questoes-portugues.ts`, com 150 questões nos exports `questoesPortugues.terceiro.1.AV2`, `.2.AV1`, `.2.AV2`, `.3.AV1` e `.3.AV2`. A estrutura aninhada e os IDs repetidos entre simulados foram preservados.

A classificação considera o objetivo da questão, incluindo todos os itens de verdadeiro/falso, associação e classificação. Os textos sobre aranhas, campanhas, Pilar e animais de assistência usam **Leitura e compreensão** nas perguntas de conteúdo; não recebem temas de Ciências ou História. Finalidade e escolha de um tipo de texto usam **Gêneros textuais**. Questões sobre estrutura e critérios jornalísticos usam **Notícias**; as focadas em versos e rimas ou em ensinamentos de fábulas usam **Poesia** e **Fábulas**, respectivamente.

**Substantivos**, **Adjetivos** e **Verbos** agrupam seus usos específicos; **Classes de palavras** reúne comparações entre classes e as perguntas em que o nome da própria classe seria a resposta. Por exemplo, a questão 24 do B2/AV1 privado pede a classe de “limpa” e usa **Classes de palavras**, sem antecipar “adjetivo”. Formas de passado, presente e futuro usam **Tempos verbais**; ordens e instruções verbais permanecem em **Verbos**.

Questões que pedem reconhecer um encontro vocálico, consonantal ou um dígrafo usam o tema correspondente quando o grupo já está nomeado no enunciado. Quando descobrir o nome do grupo é a tarefa, usa-se **Letras e sons**: questões 28 e 29 do B3/AV1 geral e 25 do B4/AV2 geral. Esse tema também cobre a síntese comparativa da questão 30 do B3/AV1. **Ortografia** reúne as escolhas de grafia e suas relações com os sons; **Pronúncia das palavras** trata a diferença entre vogais finais na fala e na escrita.

**Flexão das palavras** reúne gênero, número e grau sem antecipar a forma correta. **Construção de frases** reúne ordem das palavras, participantes da ação e tipos de frase; **Pontuação** concentra o emprego dos sinais. **Coesão textual** cobre retomadas e repetições, sem usar como tema o pronome ou o recurso específico que pode ser a resposta. **Leitura e escrita** fica nas sínteses que articulam diferentes conteúdos e sua função na comunicação.

Não se subdividem artificialmente os simulados concentrados: B2/AV2 geral tem um tema (sinônimos e antônimos), B3/AV2 geral tem um (ortografia), e B2/AV1 geral tem dois (verbos e tempos verbais). O B4/AV2 geral revisa onze temas. Todos os demais campos foram preservados exatamente. As alternativas duplicadas de B2/AV2 privado e os comandos incompletos de B1/AV2 privado foram registrados na [issue web #72](https://github.com/guilhermeborba/simulados-bernardo/issues/72), sem correção de conteúdo neste lote.

### Português — 4º ano

| Tema | Abrange |
|---|---|
| Adjetivos | Características, adjetivos pátrios ou gentílicos, adjetivos compostos e locuções adjetivas. |
| Artigos | Reconhecimento e emprego de artigos definidos e indefinidos, conforme gênero e número dos substantivos. |
| Coerência textual | Relações lógicas entre as ideias e construção de sentidos compatíveis no texto. |
| Coesão textual | Retomadas por pronomes e expressões, conectivos e recursos que ligam as partes de um texto. |
| Concordância | Relações de gênero e número entre nomes, artigos e adjetivos e concordância do verbo com o sujeito, incluindo questões que articulam ambas. |
| Estrutura textual | Organização de parágrafos e encadeamento de introdução, desenvolvimento e conclusão ou desfecho. |
| Fábulas | Características, interpretação de personagens, crítica e ensinamentos das fábulas. |
| Flexão das palavras | Formas de singular e plural dos substantivos, incluindo terminações e formas invariáveis. |
| Formação de palavras | Palavras primitivas e derivadas, prefixos, sufixos, composição e famílias de palavras. |
| Gêneros e tipos textuais | Finalidades, características e reconhecimento de gêneros e tipos de texto, incluindo cartas, bilhetes, receitas, quadrinhos, anúncios e textos descritivos, informativos e dissertativos. |
| Leitura e compreensão | Localização de informações, inferências, intenção do autor e identificação da ideia principal nos textos estudados. |
| Leitura e escrita | Síntese sobre o papel da leitura e dos recursos da língua na comunicação e na compreensão do mundo. |
| Narrativas | Personagens, enredo, tempo, espaço, narrador, sequência cronológica e introdução das histórias. |
| Notícias | Função informativa, características e objetivos das notícias. |
| Ortografia | Escolha da grafia correta das palavras e emprego das letras nos exemplos estudados. |
| Poesia | Versos, rimas, escolhas de palavras e efeitos de sentido em poemas. |
| Pontuação | Usos de ponto final, interrogação, exclamação, vírgula, dois-pontos, travessão e reticências. |
| Preposições | Emprego de preposições e suas contrações com artigos em relações como lugar, destino, posse, material, companhia, assunto e causa. |
| Pronomes | Reconhecimento e emprego de pronomes pessoais dos casos reto e oblíquo em frases. |
| Sinônimos e antônimos | Reconhecimento de palavras com sentidos semelhantes ou opostos. |
| Substantivos | Reconhecimento de substantivos próprios, comuns, concretos e abstratos. |
| Substantivos coletivos | Palavras que nomeiam conjuntos de seres ou objetos. |
| Tempos verbais | Reconhecimento e conjugação no presente, passado e futuro, incluindo pretéritos perfeito e imperfeito. |
| Verbos | Identificação de verbos de ação e reconhecimento e emprego de modos verbais. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-portugues-4ano-b*-av*.ts`. Não há entradas privadas de Português do 4º ano registradas no seed. Todos compartilham este vocabulário de 24 temas, reaproveitando nomes do 3º ano quando representam o mesmo conteúdo.

**Gêneros e tipos textuais** reúne finalidades e identificação de formas de texto, sem antecipar o gênero ou tipo que o aluno deve descobrir. Quando o gênero já é dado e a questão trabalha seus recursos específicos, usam-se **Notícias**, **Poesia** ou **Fábulas**. **Narrativas** reúne elementos e organização das histórias, incluindo narrador, enredo e ordem dos acontecimentos. **Leitura e compreensão** cobre informações, inferências e ideia principal; textos sobre hortas, receitas ou florestas não recebem temas de outras disciplinas.

**Formação de palavras** reúne prefixos, sufixos, composição e famílias, sem indicar o prefixo, sufixo ou processo específico que pode ser a resposta. **Substantivos coletivos** fica nas palavras que nomeiam conjuntos; os outros tipos estudados ficam em **Substantivos**. **Flexão das palavras** cobre singular e plural. **Adjetivos** inclui locuções adjetivas, origem e adjetivos compostos.

A escolha de formas que concordam usa **Concordância**, tanto nominal quanto verbal, incluindo as questões que articulam as duas. A identificação e o emprego de pronomes em frases usam **Pronomes**; a retomada de referentes entre frases e os conectivos usam **Coesão textual**. Reconhecimento de modos e verbos de ação usa **Verbos**; reconhecimento e conjugação de presente, passado e futuro usam **Tempos verbais**.

**Estrutura textual** cobre parágrafos e a organização das partes do texto; **Coesão textual**, as ligações e retomadas; **Coerência textual**, as relações lógicas entre ideias. **Artigos**, **Preposições**, **Pontuação**, **Ortografia** e **Sinônimos e antônimos** mantêm os mesmos nomes nos diferentes simulados. A síntese sobre a função da leitura e da comunicação usa **Leitura e escrita**.

A quantidade de temas acompanha o conteúdo: B1/AV2 reúne nove temas em uma revisão que alterna leitura e formação de palavras; os demais têm de cinco a oito temas. Todos os campos anteriores foram preservados exatamente. A inconsistência preexistente de gabarito na questão 13 de B4/AV2 foi registrada na [issue web #74](https://github.com/guilhermeborba/simulados-bernardo/issues/74), sem correção do conteúdo neste lote.

### Matemática — 4º ano

| Tema | Abrange |
|---|---|
| Adição | Somas, termos, propriedades, reagrupamento e problemas de juntar ou acrescentar quantidades. |
| Adição e subtração | Problemas e sínteses que articulam adição e subtração na mesma questão. |
| Arredondamento | Aproximação de números naturais para a centena ou o milhar mais próximo. |
| Ângulos | Ângulo reto, agudo e obtuso, medidas em graus e identificação em figuras e objetos. |
| Divisão | Partilha, formação de grupos, termos, quociente e resto, divisões exatas e não exatas e relação inversa com a multiplicação. |
| Figuras planas | Polígonos, círculos, lados, vértices e propriedades de triângulos, quadriláteros e outros polígonos. |
| Frações | Partes iguais de um todo ou quantidade, numerador e denominador, leitura, comparação, equivalência, simplificação e frações de quantidades sucessivas. |
| Geometria | Comparação e classificação geral de figuras e síntese sobre formas e ângulos, sem antecipar se a figura é plana ou espacial. |
| Gráficos e tabelas | Organização, leitura e comparação de dados de pesquisas e registros, somas de frequências e diferenças entre quantidades. |
| Matemática no cotidiano | Síntese sobre prática, revisão e uso de problemas do dia a dia para aprender Matemática. |
| Medidas de capacidade | Escolha de unidades e equivalência entre litro e mililitro. |
| Medidas de comprimento | Escolha de unidades e equivalências entre quilômetro, metro e centímetro. |
| Medidas de massa | Escolha de unidades e equivalência entre quilograma e grama. |
| Medidas de tempo | Equivalências entre horas, minutos e dias. |
| Multiplicação | Parcelas iguais, fatores, produto, propriedades, tabuadas, multiplicação por 10, 100 e 1.000 e cálculo com um ou dois algarismos. |
| Números decimais | Parte inteira e decimal, décimos e centésimos, escrita, comparação, adição e subtração de números com vírgula. |
| Operações combinadas | Problemas que articulam diferentes grupos de operações, como multiplicar e descontar, dividir e acrescentar ou calcular uma fração e somar novas quantidades. |
| Sistema de numeração | Leitura, escrita, composição, decomposição, valor posicional, comparação e ordenação de números; antecessor, sucessor e reconhecimento de representações numéricas. |
| Sistema monetário | Reais e centavos, cédulas, moedas, escrita decimal de preços, compras, troco, comparação e cálculo com valores em dinheiro. |
| Sólidos geométricos | Cubos, esferas, cones, cilindros e pirâmides; faces, arestas, vértices e relações com objetos do cotidiano. |
| Subtração | Diferenças, termos, reagrupamento, prova real e problemas de retirar, comparar ou completar quantidades. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-matematica-4ano-b*-av*.ts`. Não há entradas privadas de Matemática do 4º ano registradas no seed. Todos usam este vocabulário de 21 temas, reaproveitando os nomes de Matemática do 3º ano quando o conteúdo corresponde.

**Sistema de numeração** cobre valor posicional, leitura, composição e comparação; **Arredondamento** fica nas aproximações. Problemas que pedem a diferença ou quanto falta usam **Subtração**, mesmo quando aparecem no simulado de numeração. **Adição e subtração** reúne as questões que articulam essas duas operações; **Operações combinadas** fica nas que misturam outros grupos, como multiplicar e descontar o estoque ou dividir e acrescentar uma quantidade.

**Frações** inclui o cálculo de partes de quantidades e frações sucessivas do restante, como na questão 29 do B3/AV1. Cálculos e comparações de números com vírgula, sem contexto monetário, usam **Números decimais**. Preços, cédulas, moedas, compras e trocos usam **Sistema monetário**, incluindo a escrita decimal dos valores. A questão 1 do B3/AV2 usa **Sistema de numeração**, pois descobrir que “3,5” é um número decimal é a tarefa; o tema não antecipa essa classificação.

**Figuras planas**, **Sólidos geométricos** e **Ângulos** reúnem as propriedades e relações específicas. Quando a tarefa é descobrir a própria classificação plana ou espacial, usa-se **Geometria**: questões 1 e 11 do B4/AV1. Esse tema também cobre a síntese que articula figuras e ângulos na questão 30. Os temas não recebem nomes de figuras, elementos geométricos ou tipos de ângulo que possam ser a resposta.

As medidas usam o tema da grandeza trabalhada. Questões sobre frequências, totais e diferenças em pesquisas e registros usam **Gráficos e tabelas**, pois o foco é compreender e comparar os dados apresentados. A síntese sobre prática e revisão usa **Matemática no cotidiano**.

A quantidade de temas acompanha o conteúdo. O B3/AV1 tem um tema (frações); B2/AV1 e B2/AV2 têm dois cada, com uma questão de operações combinadas em cada simulado. B1/AV1, B1/AV2 e B3/AV2 têm três; B4/AV1 tem quatro. O B4/AV2 é uma revisão de quinze temas do ano, sem juntar artificialmente assuntos distintos. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas e curiosidades.

### Ciências — 4º ano

| Tema | Abrange |
|---|---|
| Alimentação dos animais | Classificação de hábitos alimentares conforme os alimentos consumidos pelos animais. |
| Alimentação saudável | Variedade de alimentos, nutrientes, hidratação e escolhas alimentares nos exemplos estudados. |
| Astronomia | Características e relações entre Sol, Terra, Lua e planetas, tipos de astros, luz e representação do Sistema Solar. |
| Cadeias alimentares | Produtores, consumidores, decompositores, fluxo de energia, equilíbrio e relações entre cadeias e teias alimentares. |
| Ciência no cotidiano | Síntese sobre observar, compreender e cuidar da natureza e do próprio corpo e sobre as relações entre os conteúdos do ano. |
| Corpo humano | Integração entre partes do corpo e reconhecimento de sistemas a partir de suas funções e descrições. |
| Digestão | Órgãos, funções e percurso dos alimentos no sistema digestório, mastigação e absorção dos nutrientes. |
| Lua e suas fases | Observação da Lua, iluminação, fases e período de seu movimento ao redor da Terra. |
| Matéria e materiais | Conceitos gerais sobre materiais, suas combinações e reconhecimento de classificações. |
| Misturas | Combinação de materiais, suas características e reconhecimento de misturas homogêneas e heterogêneas. |
| Movimentos da Terra | Rotação e translação, sucessão de dias e noites e duração do ano. |
| Músculos | Funções e ação dos músculos, contração e relaxamento e músculos voluntários e involuntários. |
| Orientação e localização | Pontos cardeais e colaterais, mapas, posições relativas e orientação por Sol, estrelas e bússola. |
| Ossos e articulações | Funções, tipos e identificação de ossos, proteção dos órgãos e articulações. |
| Preservação ambiental | Poluição, desmatamento, impactos nos seres vivos, extinção e áreas protegidas. |
| Resíduos e reciclagem | Redução, reutilização, reciclagem, separação de resíduos, cores da coleta e compostagem. |
| Saúde e bem-estar | Hábitos e cuidados com ossos, músculos, postura e atividade física abordados nas questões. |
| Separação de misturas | Métodos e instrumentos para separar componentes conforme as características dos materiais. |
| Sustentabilidade | Uso responsável de recursos, economia de água e energia e escolhas sustentáveis no cotidiano. |
| Transformações da matéria | Mudanças de estado físico nos exemplos estudados, incluindo a passagem da água para vapor. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-ciencias-4ano-b*-av*.ts`. Não há entradas privadas de Ciências do 4º ano registradas no seed. Todos compartilham este vocabulário de 20 temas, reaproveitando os nomes de Ciências do 3º ano quando o conteúdo corresponde.

**Misturas** cobre suas características e classificação, sem usar “homogênea” ou “heterogênea” como rótulo. Quando reconhecer a própria combinação como uma mistura é a tarefa, usa-se **Matéria e materiais**: questões 4, 6, 8 e 10 do B1/AV1, cujas alternativas corretas são “Mistura” ou “Uma mistura”. **Separação de misturas** reúne métodos e instrumentos, incluindo a questão 22 desse arquivo. A questão 17 do B1/AV2, sobre o que acontece com a água de uma poça, usa **Transformações da matéria**, sem antecipar a evaporação como resposta.

**Cadeias alimentares** inclui relações de alimentação, fluxo de energia, produtores, consumidores, decompositores e teias. As questões focadas nos hábitos alimentares dos animais usam **Alimentação dos animais**. Não se criam temas com o nome do produtor, do consumidor ou do processo que pode ser a resposta.

**Ossos e articulações**, **Músculos** e **Digestão** reúnem os conteúdos anatômicos e funcionais específicos. **Corpo humano** cobre a integração entre partes e a identificação de um sistema a partir da descrição, como na questão 23 do B4/AV2, que pede o nome do sistema formado pelos ossos. Cuidados gerais com o corpo ficam em **Saúde e bem-estar**; nutrientes, hidratação e escolhas de alimentos, em **Alimentação saudável**.

**Orientação e localização** reúne pontos cardeais e colaterais, mapas e orientação por astros e bússola. **Astronomia** fica nas características e relações gerais dos astros, sem usar como tema o tipo de astro ou o nome do Sistema Solar que pode ser a resposta. **Lua e suas fases** concentra observação, iluminação e fases lunares; **Movimentos da Terra** reúne as relações entre movimentos, dias, noites e ano, sem antecipar “rotação” ou “translação”.

**Preservação ambiental** cobre impactos e proteção dos ambientes e seres vivos. **Resíduos e reciclagem** inclui os 3 Rs, separação e aproveitamento de resíduos, sem usar “compostagem” como tema nas questões que pedem esse nome. **Sustentabilidade** cobre o uso responsável de recursos e escolhas do cotidiano. As sínteses que articulam os conteúdos do ano usam **Ciência no cotidiano**.

A quantidade de temas acompanha o conteúdo: B3/AV2 tem um tema; B1/AV2, B2/AV1 e B3/AV1 têm dois; B1/AV1 e B4/AV1 têm três; B2/AV2 tem quatro; B4/AV2 revisa oito. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas e curiosidades.

### História — 4º ano

| Tema | Abrange |
|---|---|
| Alimentação e costumes | Comidas, ingredientes e contribuições culturais relacionadas à alimentação. |
| Campo e cidade | Características e localização de comunidades urbanas e rurais. |
| Cidadania e respeito | Convivência, regras, acolhimento, valorização das diferenças e combate ao preconceito. |
| Comunicação e tecnologia | Cartas, correio, telegramas, telefone e internet e mudanças na comunicação a distância. |
| Cultura e identidade | Costumes, línguas, saberes, expressões culturais e diversidade dos povos e comunidades. |
| Direitos e participação | Direitos e proteção das crianças, direitos territoriais e enfrentamento das desigualdades. |
| Educação e família | Relações familiares, gerações, árvores genealógicas e valorização da aprendizagem. |
| Escravidão e resistência | Escravização, tráfico, trabalho forçado, quilombos, resistência e abolição. |
| Expressões artísticas | Origem e influências culturais da música, dança e capoeira. |
| Festas e tradições | Origem e influências culturais das festas populares. |
| Formação do Brasil | Participação de diferentes populações na formação histórica e cultural do Brasil. |
| História do trabalho | Atividades, profissões e formas de trabalhar no passado e importância de conhecer essa história. |
| História e memória | Estudo da História, compreensão do passado, memória coletiva e relações com o presente. |
| Migrações | Deslocamentos de pessoas, imigração para o Brasil, destinos e motivos das mudanças. |
| Moradias e cotidiano | Habitações tradicionais e organização dos espaços de moradia. |
| Organização social | Grupos sociais, comunidades, famílias e escolas na vida em sociedade. |
| Patrimônio e preservação | Bens materiais e imateriais, museus, proteção, restauração e transmissão de conhecimentos tradicionais. |
| Registros do passado | Fontes escritas, visuais, orais e materiais e uso de documentos, relatos e objetos em pesquisas. |
| Tempo histórico | Cronologia, linha do tempo, passado, presente, futuro, décadas e séculos. |
| Trabalho e tecnologia | Ferramentas, máquinas, informática e eletrodomésticos e seus efeitos no trabalho e nas tarefas domésticas. |
| Trabalho no campo | Agricultura, técnicas de cultivo e ferramentas usadas no meio rural. |
| Transformações sociais | Mudanças nas experiências e nos modos de vida entre passado e presente. |
| Transportes e viagens | Meios de transporte e mudanças na duração e nas condições das viagens ao longo do tempo. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-historia-4ano-b*-av*.ts`. Não há entradas privadas de História do 4º ano registradas no seed. Todos compartilham este vocabulário de 23 temas, reaproveitando os nomes de História do 3º ano quando o conteúdo corresponde.

A classificação considera o conteúdo predominante e as alternativas dos enunciados genéricos. **Registros do passado** reúne os suportes e as atividades de pesquisa; **História e memória**, a função desse conhecimento. **Tempo histórico** cobre cronologia e unidades de tempo. Relações familiares e gerações ficam em **Educação e família**; mudanças nos modos de viver, em **Transformações sociais**.

**Organização social** reúne os grupos sociais e as comunidades. É um rótulo amplo para a questão 9 do B1/AV2, que pede reconhecer uma comunidade. A questão 24 desse arquivo, que pede o nome do deslocamento de uma família, usa **Transformações sociais**. **Migrações** cobre os deslocamentos quando o nome não é a resposta. A questão 21 do B3/AV1, que pede reconhecer a imigração na história de uma família, usa **Formação do Brasil**. Assim, não se antecipa a classificação solicitada.

Questões sobre a origem específica de palavras, pratos, festas ou manifestações usam os grupos de conteúdo (**Cultura e identidade**, **Alimentação e costumes**, **Festas e tradições** e **Expressões artísticas**), sem usar como rótulo o povo ou país que pode ser a resposta. As questões 17 e 23 do B1/AV2 usam **Cultura e identidade**, pois pedem reconhecer uma tradição ou um patrimônio cultural. **Patrimônio e preservação** cobre bens materiais e imateriais sem antecipar qual tipo é a resposta.

**Formação do Brasil** reúne a participação histórica dos diferentes povos; **Escravidão e resistência** concentra escravização, trabalho forçado, quilombos e abolição. **Cidadania e respeito** inclui convivência, valorização das diferenças e combate ao preconceito; **Direitos e participação** cobre direitos e proteção das crianças, direitos territoriais e desigualdades após a abolição.

**História do trabalho** reúne atividades e condições no passado; mudanças ligadas às ferramentas, máquinas e eletrodomésticos usam **Trabalho e tecnologia**. Questões específicas sobre agricultura usam **Trabalho no campo**. **Comunicação e tecnologia** cobre as mudanças nos meios de comunicação; **Transportes e viagens**, as mudanças nos deslocamentos e na duração das viagens.

A quantidade de temas acompanha o conteúdo: B1/AV1 tem seis; B2/AV1 e B3/AV2, sete; B1/AV2, B2/AV2 e B3/AV1, nove. Não se subdivide artificialmente o B4/AV1, concentrado em patrimônio, que tem um tema. O B4/AV2 revisa doze temas. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

A inclusão indevida de “Brasil” entre as palavras de origem indígena na questão 9 do B2/AV1 foi registrada na [issue web #76](https://github.com/guilhermeborba/simulados-bernardo/issues/76), com fontes para a revisão editorial. Enunciado e gabarito foram preservados no lote de temas.

### Geografia — 4º ano

| Tema | Abrange |
|---|---|
| Atividades econômicas | Produção, distribuição e consumo, setores primário, secundário e terciário, agronegócio, trabalho e relações entre atividades. |
| Campo e cidade | Características, diferenças e interdependência dos espaços rural e urbano, origem dos alimentos e qualidade de vida. |
| Clima e cotidiano | Tipos de clima do Brasil, temperaturas, chuvas, estações, secas e fatores da diversidade climática. |
| Comércio | Compra e venda, exportação, importação, produtos brasileiros e relações comerciais com outros países. |
| Cultura e identidade | Origens dos povos, manifestações culturais, diversidade étnica, história regional e valorização das diferenças. |
| Geografia do Brasil | Sínteses que articulam território, natureza, população, cultura e economia e a importância de estudar o país. |
| Globalização | Conexões entre países, blocos econômicos, intercâmbio cultural e econômico, comunicação e tecnologia no cenário internacional. |
| Hidrografia | Rios, bacias, escoamento, cheias, recursos hídricos, usos da água e geração de energia. |
| Indústria e matérias-primas | Localização e concentração industrial, fábricas, produtos e importância dos polos industriais. |
| Migração | Êxodo rural, deslocamentos internos, motivos das mudanças e oportunidades nas cidades. |
| Organização das cidades | Urbanização, metrópoles, crescimento, moradia, planejamento, desafios e participação na vida urbana. |
| Orientação e localização | Coordenadas geográficas, linhas imaginárias e localização nos hemisférios. |
| Paisagens | Integração de elementos naturais, relações entre relevo e água, diversidade natural e condições para a ocupação humana. |
| Pecuária | Criação de animais e importância da produção e exportação de carne. |
| População brasileira | Quantidade e distribuição de habitantes, densidade, censos, faixas etárias, envelhecimento e planejamento de serviços. |
| Preservação ambiental | Poluição dos rios, desmatamento, impactos no clima e na biodiversidade, conservação da água e proteção dos ambientes. |
| Prestação de serviços | Turismo, geração de empregos e valorização de atrações naturais e culturais. |
| Regiões do Brasil | Divisão regional, estados, localização, características, diferenças e potencialidades das cinco regiões. |
| Relevo | Planaltos, planícies, depressões, serras, altitudes, formação e usos das formas do terreno. |
| Representações cartográficas | Mapas políticos e recursos cartográficos usados para estudar estados e capitais. |
| Saneamento e infraestrutura | Redes de água, esgoto, energia e transporte e desigualdades de acesso à infraestrutura e às áreas verdes. |
| Território brasileiro | Localização do Brasil, fronteiras, oceano, estados, capitais, Distrito Federal e dimensões do território. |
| Vegetação | Formações vegetais, biomas brasileiros, biodiversidade, características dos ambientes e relações com clima e água. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-geografia-4ano-b*-av*.ts`. Não há entradas privadas de Geografia do 4º ano registradas no seed. Todos compartilham este vocabulário de 23 temas, reaproveitando os nomes de Geografia do 3º ano quando o conteúdo corresponde.

A classificação considera o conteúdo predominante e as alternativas dos enunciados genéricos. **Território brasileiro** reúne a localização do país, estados, capitais e Distrito Federal; **Regiões do Brasil**, a divisão regional e as comparações entre regiões. Não se usa como tema o nome do estado, da capital ou da região que pode ser a resposta. **Orientação e localização** cobre coordenadas e hemisférios; **Representações cartográficas**, os mapas e os recursos usados para estudar o território.

**Relevo** cobre as formas do terreno; **Hidrografia**, os rios, suas dinâmicas, usos e relações com o relevo. **Paisagens** reúne as sínteses sobre a integração de elementos naturais, como na questão 30 do B2/AV1 e na questão 26 do B4/AV2. **Clima e cotidiano** concentra temperaturas, chuvas, estações e tipos de clima. **Vegetação** inclui as características e a biodiversidade dos biomas, sem antecipar qual bioma é a resposta. Poluição, desmatamento, impactos e ações de conservação ficam em **Preservação ambiental**.

**População brasileira** reúne censos, quantidade e distribuição de habitantes, densidade, faixas etárias e envelhecimento. **Cultura e identidade** trata das origens, contribuições culturais, diversidade e valorização das diferenças; **Migração**, dos deslocamentos e seus motivos. **Campo e cidade** cobre características e interdependência; **Organização das cidades**, urbanização e planejamento. Redes de serviços e desigualdade no acesso à infraestrutura usam **Saneamento e infraestrutura**.

**Atividades econômicas** reúne os setores e suas relações. É o rótulo amplo nas questões que pedem reconhecer atividades ou o setor correspondente, sem antecipar “primário”, “secundário”, “terciário” ou a atividade que é a resposta. Questões específicas sobre localização industrial, criação de animais, compra e venda e turismo usam **Indústria e matérias-primas**, **Pecuária**, **Comércio** e **Prestação de serviços**, respectivamente. **Comércio** também cobre exportações e importações; **Globalização**, as conexões internacionais mais amplas, os blocos econômicos e a aproximação por comunicação e tecnologia.

As sínteses que articulam vários conteúdos do ano usam **Geografia do Brasil**. A quantidade de temas acompanha o conteúdo: B1/AV1, B2/AV1, B2/AV2 e B3/AV2 têm quatro; B1/AV2 e B4/AV1, cinco; B3/AV1, três; B4/AV2 revisa treze. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

As inconsistências preexistentes na alternativa sobre o Distrito Federal (B1/AV1, questão 29) e na associação entre animais e regiões do litoral (B1/AV2, questão 29) foram registradas na [issue web #78](https://github.com/guilhermeborba/simulados-bernardo/issues/78), com evidências para revisão separada. Enunciados, alternativas, gabaritos, dicas e curiosidades foram preservados neste lote de temas.

### Português — 5º ano

| Tema | Abrange |
|---|---|
| Adjetivos | Identificação, características, função e grau comparativo dos adjetivos nas frases. |
| Cartas | Finalidade, estrutura, local e data, saudação, corpo do texto, despedida e assinatura de cartas. |
| Classes de palavras | Comparação entre substantivos e adjetivos e identificação da classe gramatical sem antecipar seu nome. |
| Concordância | Concordância nominal de artigos e adjetivos com substantivos e concordância verbal com o sujeito. |
| Dígrafos | Grupos de duas letras que representam um som e reconhecimento das letras desses grupos nas palavras. |
| Encontros consonantais | Consoantes vizinhas com sons próprios e identificação desses encontros nas palavras. |
| Encontros vocálicos | Ditongos, hiatos, tritongos e relações entre vogais e divisão silábica. |
| Fábulas | Características, personagens, interpretação e ensinamentos das fábulas. |
| Figuras de linguagem | Comparação, metáfora, personificação e onomatopeia e seus efeitos expressivos. |
| Gêneros e tipos textuais | Finalidades, características, reconhecimento e comparação de gêneros e tipos, incluindo narrativas, notícias, receitas, poemas, anúncios e cartas. |
| Leitura e compreensão | Localização de informações, personagens, acontecimentos, relações de causa e interpretação das mensagens dos textos. |
| Leitura e escrita | Síntese sobre recursos da língua e o papel de ler, escrever e expressar ideias e sentimentos. |
| Letras e sons | Nasalidade indicada pelo til, comparação de encontros e dígrafos e sínteses sobre escrita e pronúncia. |
| Narrativas | Personagens, narrador, enredo, conflito, desfecho, tempo, espaço e organização dos acontecimentos. |
| Notícias | Caráter informativo e relação das notícias com os fatos reais. |
| Poesia | Poemas, versos, estrofes, rimas e reconhecimento desses recursos nos exemplos estudados. |
| Pontuação | Funções e emprego de ponto final, interrogação, exclamação, vírgula e dois-pontos. |
| Sinônimos e antônimos | Palavras de significado semelhante ou oposto e seu uso para variar a escrita e construir contrastes. |
| Sílabas e acentuação | Sílaba tônica, oxítonas, paroxítonas, proparoxítonas, sinais gráficos e acentuação nos exemplos estudados. |
| Substantivos | Nomes de seres, lugares, objetos e sentimentos e substantivos próprios, comuns, simples, compostos e coletivos. |
| Tempos verbais | Reconhecimento, emprego e transformação de formas no presente, passado e futuro. |
| Verbos | Identificação, ações, estados, fenômenos da natureza, infinitivo e grupos de conjugação. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-portugues-5ano-b*-av*.ts`. Não há entradas privadas de Português do 5º ano registradas no seed. Todos compartilham este vocabulário de 22 temas, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde.

**Gêneros e tipos textuais** reúne a identificação, finalidade e comparação das formas de texto. Não se usa como tema o nome do gênero ou tipo que o aluno deve descobrir: questões 1, 7, 8 e 18 do B1/AV1 e 11 e 21 do B4/AV2, por exemplo. Quando o gênero já é dado e a questão trabalha recursos específicos, usam-se **Fábulas**, **Notícias**, **Poesia** ou **Cartas**. **Cartas** concentra as seis questões de estrutura desse gênero em B4/AV1 e sua retomada em B4/AV2. Elementos e organização das histórias ficam em **Narrativas**.

**Substantivos** reúne os tipos estudados, incluindo coletivos, sem antecipar a classificação solicitada. **Adjetivos** cobre identificação, características e graus; **Classes de palavras** reúne comparações entre substantivos e adjetivos e as perguntas em que o nome da classe é a resposta, como a questão 19 do B1/AV2. O ajuste entre artigo, substantivo e adjetivo e entre sujeito e verbo usa **Concordância**, incluindo as lacunas de artigo e verbo em B3/AV1.

**Verbos** reúne identificação, funções, infinitivo e conjugação; **Tempos verbais**, reconhecimento e transformação de presente, passado e futuro. **Pontuação** cobre sinais e seus usos; **Sinônimos e antônimos**, as relações de significado e a variação das palavras nos textos, sem escolher no rótulo qual das duas relações é a resposta.

**Sílabas e acentuação** reúne tonicidade, classificação e sinais gráficos. A nasalidade indicada pelo til fica em **Letras e sons**, que também cobre a comparação entre encontros e dígrafos e as sínteses sobre escrita e pronúncia. **Encontros vocálicos** inclui ditongo, hiato e tritongo sem antecipar qual tipo é a resposta; **Encontros consonantais** e **Dígrafos** concentram seus conteúdos específicos quando o grupo já está nomeado na pergunta. A questão 22 do B3/AV2 pede reconhecer um dígrafo e usa **Letras e sons**, preservando a classificação como tarefa do aluno.

**Figuras de linguagem** reúne comparação, metáfora, personificação e onomatopeia, sem usar o nome da figura como tema. **Leitura e compreensão** cobre as perguntas de interpretação da história em B4/AV2; elas não recebem temas de Ciências sobre vento ou materiais da pipa. **Leitura e escrita** fica nas sínteses sobre recursos da língua e sua importância para a comunicação.

A quantidade de temas acompanha o conteúdo: B1/AV1 e B1/AV2 têm quatro; B2/AV1 e B2/AV2, dois; B3/AV1 concentra um; B3/AV2 e B4/AV1 têm cinco; B4/AV2 revisa treze. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

A falta do texto-base da história nas questões 1–10 do B4/AV2 foi registrada na [issue web #80](https://github.com/guilhermeborba/simulados-bernardo/issues/80), com evidências do conteúdo exportado e do seed. O tema **Leitura e compreensão** descreve o objetivo das perguntas; a recuperação do contexto fica para revisão editorial separada. Os enunciados e os gabaritos foram preservados neste lote.

### Matemática — 5º ano

| Tema | Abrange |
|---|---|
| Adição | Somas, parcelas, propriedade comutativa e problemas de juntar ou acrescentar quantidades. |
| Adição e subtração | Problemas que articulam juntar e retirar quantidades na mesma situação. |
| Arredondamento | Aproximação de números naturais para a dezena ou a centena mais próxima, incluindo valores em dinheiro. |
| Área | Medida de superfícies, contagem de unidades quadradas e cálculo de áreas de quadrados e retângulos. |
| Divisão | Partilha, termos, quociente, resto, divisões exatas e relação inversa com a multiplicação. |
| Figuras planas | Polígonos, círculos, lados, triângulos, quadriláteros e reconhecimento de formas planas. |
| Frações | Partes de um todo, numerador, denominador, leitura, tipos, equivalência, simplificação e comparação. |
| Geometria | Sínteses que articulam figuras planas e sólidos e seu reconhecimento nos objetos do cotidiano. |
| Gráficos e tabelas | Organização, leitura e comparação de dados, linhas, colunas, barras, títulos, legendas e quantidades. |
| Grandezas e medidas | Comparação e identificação de grandezas, relações entre perímetro e área e sínteses que articulam diferentes medidas. |
| Matemática no cotidiano | Sínteses sobre o uso de diferentes conceitos para contar, medir, comparar e resolver problemas do dia a dia. |
| Medidas de capacidade | Litro, mililitro, instrumentos de medição de líquidos e equivalências entre unidades. |
| Medidas de comprimento | Metro, centímetro, quilômetro, instrumentos de medição e conversão entre unidades. |
| Medidas de massa | Quilograma, grama, balança e equivalências entre unidades de massa. |
| Medidas de tempo | Horas, minutos, segundos, calendário, dias, semanas, meses e anos. |
| Média aritmética | Conceito e cálculo da média de números e notas pela soma dividida pela quantidade de valores. |
| Multiplicação | Fatores, produto, propriedade comutativa, parcelas iguais e cálculo de quantidades em grupos. |
| Números decimais | Parte inteira e decimal, décimos e centésimos, leitura, escrita, equivalência com frações, comparação, adição e subtração. |
| Operações combinadas | Problemas que articulam diferentes operações e sínteses sobre as funções e os usos das quatro operações. |
| Perímetro | Medida do contorno, unidades e soma dos lados de quadrados, retângulos e triângulos. |
| Porcentagem | Partes por cem, símbolo %, relação com metade e quarta parte e porcentagens de quantidades. |
| Probabilidade | Eventos certos, possíveis e impossíveis, chances em dados e moedas e comparação de resultados mais prováveis. |
| Sistema de numeração | Valor posicional, ordens, leitura, escrita, decomposição, comparação, ordenação, símbolos, antecessor, sucessor e paridade. |
| Sistema monetário | Preços, reais e centavos, compras, gastos, troco e comparação de valores em dinheiro. |
| Sólidos geométricos | Poliedros e corpos redondos, faces, arestas, vértices e relações com objetos do cotidiano. |
| Subtração | Diferenças, minuendo, subtraendo, prova real e problemas de retirar ou completar quantidades. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-matematica-5ano-b*-av*.ts`. Não há entradas privadas de Matemática do 5º ano registradas no seed. Todos compartilham este vocabulário de 26 temas, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde.

A classificação considera o objetivo da questão e as alternativas dos enunciados genéricos. **Sistema de numeração** cobre valor posicional, comparação, ordenação e paridade; **Arredondamento**, as aproximações, inclusive a questão 23 do B1/AV1 com dinheiro. Comparações de preços, compras e trocos usam **Sistema monetário**. A ordenação das distâncias na questão 24 do B1/AV1 usa **Sistema de numeração**, pois o objetivo é ordenar números.

**Adição**, **Subtração**, **Multiplicação** e **Divisão** reúnem seus termos, propriedades, cálculos e aplicações. **Adição e subtração** reúne a situação de juntar e retirar da questão 9 do B1/AV2. **Operações combinadas** cobre o problema com várias operações da questão 25 e as sínteses sobre as funções e os usos das quatro operações no fim desse simulado.

**Frações** reúne os tipos, equivalências e comparações sem antecipar qual tipo ou resultado é a resposta. **Números decimais** cobre leitura, comparação, equivalência com frações e operações com vírgula. O reconhecimento de R$ 3,50 como número decimal na questão 19 do B2/AV2 usa **Sistema monetário**, sem antecipar a classificação; a conversão de 1,45 m em metros e centímetros na questão 23 usa **Medidas de comprimento**.

**Figuras planas** e **Sólidos geométricos** reúnem formas, propriedades e elementos sem usar como rótulo a figura, a face, a aresta ou o vértice que pode ser a resposta. **Geometria** fica nas sínteses que articulam figuras planas e espaciais. Os temas das medidas seguem a grandeza específica quando ela já está identificada. As questões 21–23 do B3/AV2, que pedem reconhecer a própria grandeza, usam **Grandezas e medidas**. Esse tema também cobre comparações e sínteses de medidas e a identificação do perímetro como cálculo necessário na questão 9 do B4/AV1.

**Perímetro** concentra contorno e soma dos lados; **Área**, superfícies, unidades quadradas e cálculo de quadrados e retângulos. A comparação entre os dois conceitos na questão 19 do B4/AV1 usa **Grandezas e medidas**. **Porcentagem** reúne partes por cem, metade, quarta parte e cálculo de quantidades. **Gráficos e tabelas** cobre a apresentação e leitura de dados; **Média aritmética**, seu cálculo; **Probabilidade**, eventos e chances. As sínteses que articulam vários conteúdos usam **Matemática no cotidiano**.

A quantidade de temas acompanha o conteúdo: B1/AV1, B2/AV2 e B3/AV1 têm três; B1/AV2, sete; B2/AV1 concentra um; B3/AV2 e B4/AV1 têm cinco; B4/AV2 revisa oito. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

O gabarito preexistente da questão 16 do B1/AV1 classifica 4.578 como ímpar, embora o número seja par. A inconsistência foi registrada na [issue web #82](https://github.com/guilhermeborba/simulados-bernardo/issues/82), sem alteração do gabarito neste lote de temas.

### Ciências — 5º ano

| Tema | Abrange |
|---|---|
| Alimentação dos animais | Hábitos alimentares e reconhecimento de herbívoros, carnívoros e onívoros conforme os alimentos consumidos. |
| Alimentação saudável | Nutrientes, proteínas, carboidratos, vitaminas, variedade e equilíbrio da alimentação. |
| Astronomia | Sistema Solar, estrelas, planetas, satélites, galáxias, universo, gravidade, eclipses, observação e exploração espacial. |
| Biomas | Características, vegetação, fauna, clima e localização dos biomas brasileiros. |
| Cadeias alimentares | Produtores, consumidores, decompositores, predadores, presas, cadeias, teias e transferência de energia. |
| Ciclo da água | Circulação da água, formação de nuvens, etapas do ciclo, ação do Sol e renovação da água doce. |
| Classificação dos animais | Características e comparação de vertebrados, invertebrados e grupos de vertebrados, incluindo regulação da temperatura corporal. |
| Corpo humano | Órgãos e funções dos sistemas respiratório, circulatório, nervoso, imunológico, urinário e locomotor. |
| Digestão | Órgãos, dentes, funções e processos do sistema digestório, incluindo absorção de nutrientes e formação das fezes. |
| Ecossistemas | Interações entre seres vivos e ambiente, fatores bióticos e abióticos, biodiversidade, equilíbrio e relações ecológicas. |
| Estados físicos | Características e exemplos dos estados sólido, líquido e gasoso. |
| Fontes de energia | Energias renováveis e não renováveis, fontes solar e eólica, biogás e combustíveis fósseis. |
| Hábitos de higiene | Lavagem das mãos, banho, escovação, limpeza das unhas, cuidados com ferimentos e prevenção da transmissão de germes. |
| Lua e suas fases | Fases, iluminação, órbita, rotação, proximidade da Lua e observação de sua aparência. |
| Movimentos da Terra | Rotação, translação, eixo terrestre, dias, noites, estações, solstícios, equinócios e posição na órbita. |
| Músculos | Contrações e ação conjunta de músculos e ossos na produção de movimentos. |
| Orientação e localização | Linha do Equador e localização do Brasil nos hemisférios. |
| Ossos e articulações | Sustentação, proteção de órgãos e outras funções dos ossos no corpo humano. |
| Preservação ambiental | Poluição, clima, desmatamento, ameaças à biodiversidade, proteção dos ambientes e reflorestamento. |
| Resíduos e reciclagem | Reciclagem, compostagem, biodegradação, lixo eletrônico, coleta seletiva e os 3 Rs. |
| Saúde e bem-estar | Defesas do organismo, doenças, epidemias, saneamento e sínteses sobre higiene, vacinação e prevenção. |
| Seres vivos | Microrganismos e processos de obtenção de alimento pelas plantas, incluindo fotossíntese. |
| Sustentabilidade | Economia de água, consumo consciente, manejo dos recursos e objetivos de desenvolvimento sustentável. |
| Transformações da matéria | Mudanças de estado físico, aquecimento, resfriamento e reconhecimento desses processos no cotidiano. |
| Vacinação | Finalidade das vacinas, prevenção de doenças, campanhas, carteira, calendário e profissionais de vacinação. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-ciencias-5ano-b*-av*.ts`. Não há entradas privadas de Ciências do 5º ano registradas no seed. Todos compartilham este vocabulário de 25 temas, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde.

**Corpo humano** reúne os sistemas e suas funções, sem usar como tema o órgão ou sistema que o aluno deve identificar. Os conteúdos específicos de alimentação, digestão, ossos e músculos usam **Alimentação saudável**, **Digestão**, **Ossos e articulações** e **Músculos**. **Seres vivos** cobre microrganismos e a produção de alimento pelas plantas; não se usa “Fotossíntese” como rótulo da questão 27 do B4/AV1.

**Vacinação** concentra vacinas, campanhas, carteira e calendário. **Hábitos de higiene** cobre os cuidados específicos, incluindo ferimentos; **Saúde e bem-estar**, as defesas do organismo e as sínteses sobre prevenção. A questão 28 do B1/AV2 pede reconhecer os próprios hábitos de higiene e usa **Saúde e bem-estar**, preservando a classificação como tarefa do aluno. Doenças, saneamento e epidemias também ficam nesse tema amplo.

**Ecossistemas** cobre as relações entre seres vivos e ambiente, fatores bióticos e abióticos, biodiversidade e equilíbrio, incluindo mutualismo e parasitismo. **Cadeias alimentares** reúne produtores, consumidores, decompositores, predadores, presas e teias, sem antecipar o ser vivo ou o nível trófico da resposta. **Alimentação dos animais** diferencia hábitos alimentares; **Classificação dos animais** reúne critérios e grupos sem antecipar o grupo solicitado. **Biomas** cobre as formações brasileiras, sem usar o nome do bioma que pode ser a resposta.

**Estados físicos** reúne características e exemplos; **Transformações da matéria**, as mudanças e sua identificação nos exemplos, sem usar “Fusão”, “Solidificação” ou outro processo como tema. **Ciclo da água** concentra as etapas e suas relações no ambiente. A poça que evapora, o espelho embaçado, o congelamento e o derretimento ficam em **Transformações da matéria**; chuva e infiltração no jardim ficam em **Ciclo da água**. A questão 29 do B2/AV2 pede reconhecer a mudança de estado físico e usa **Transformações da matéria**. A economia de água usa **Sustentabilidade**.

**Astronomia** reúne tipos e características dos astros, eclipses, gravidade e exploração, sem antecipar o planeta, astro ou conceito que pode ser a resposta. **Lua e suas fases** concentra a observação e os movimentos lunares, incluindo perigeu e apogeu. **Movimentos da Terra** abrange dias, noites, estações, eixo e órbita sem antecipar “rotação”, “translação” ou o nome da estação solicitada. Equador e hemisférios usam **Orientação e localização**.

**Preservação ambiental** reúne impactos, clima, proteção e conservação; **Resíduos e reciclagem**, destinação e aproveitamento dos resíduos. **Fontes de energia** compara fontes renováveis e não renováveis sem usar o nome da fonte específica como resposta no rótulo. **Sustentabilidade** também cobre consumo, manejo de recursos e Agenda 2030.

A quantidade de temas acompanha o conteúdo: B1/AV1 revisa nove; B1/AV2, B2/AV1 e B3/AV1 têm três; B2/AV2 e B3/AV2, quatro; B4/AV1, seis; B4/AV2, cinco. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

A confusão preexistente entre o período orbital da Lua e o ciclo de fases, na alternativa A e na curiosidade da questão 2 do B3/AV2, foi registrada na [issue web #84](https://github.com/guilhermeborba/simulados-bernardo/issues/84), com fonte primária para revisão separada. O conteúdo original foi preservado neste lote de temas.

### História — 5º ano

| Tema | Abrange |
|---|---|
| Alimentação e costumes | Alimentos cultivados e contribuições indígenas, africanas e de imigrantes para a culinária brasileira e regional. |
| Brasil Império | Independência, regências, Segundo Reinado, modernização, Guerra do Paraguai e exílio de D. Pedro II. |
| Brasil República | Proclamação, governos, organização política, eleições, economia, industrialização e acontecimentos do Brasil republicano. |
| Cidadania e respeito | Convivência, deveres, valorização das diferenças, atitudes cidadãs e respeito aos povos e às culturas. |
| Cultura e identidade | Línguas, conhecimentos, costumes, religiões, identidades e diversidade cultural dos povos e das regiões brasileiras. |
| Direitos e participação | Direitos territoriais, ensino das culturas, proteção da infância, Constituição, ECA, direitos humanos e trabalhistas e participação democrática. |
| Escravidão e resistência | Escravização, tráfico, condições de trabalho, quilombos, líderes, resistência, movimento abolicionista e abolição. |
| Expressões artísticas | Capoeira, música, instrumentos e Semana de Arte Moderna. |
| Festas e tradições | Comemorações, Consciência Negra, festas populares e suas origens e influências culturais. |
| Formação do Brasil | Primeiros habitantes, presença africana, imigração, composição da população e participação dos povos na formação do país. |
| História do trabalho | Importância e valorização das profissões, relações entre trabalhos rurais e urbanos e reconhecimento dessas atividades. |
| Migrações | Imigração, deslocamentos internos, êxodo rural, origens, destinos e motivos das mudanças de população. |
| Organização social | Organização coletiva das aldeias e compartilhamento de tarefas na vida em comunidade. |
| Regiões do Brasil | Divisão regional e identificação das cinco regiões brasileiras. |
| Trabalho e tecnologia | Ferramentas, máquinas agrícolas, industrialização e mudanças nas formas de trabalhar. |
| Trabalho nas cidades | Profissões e atividades da indústria, do comércio e dos serviços no meio urbano. |
| Trabalho no campo | Agricultura, pecuária, extrativismo, trabalhadores rurais e importância da produção de alimentos. |
| Transformações sociais | Mudanças de lugar e seus efeitos nas famílias e na sociedade, incluindo reconhecimento de deslocamentos no contexto apresentado. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-historia-5ano-b*-av*.ts`. Não há entradas privadas de História do 5º ano registradas no seed. Todos compartilham este vocabulário de 18 temas, reaproveitando os nomes dos anos anteriores quando o conteúdo corresponde. **Brasil Império** e **Brasil República** agrupam os períodos políticos abordados neste ano; **Regiões do Brasil** reaproveita o nome usado em Geografia para o mesmo conteúdo.

A classificação considera o objetivo das questões e as alternativas dos enunciados genéricos. **Formação do Brasil** reúne os primeiros habitantes, a presença africana e as contribuições dos diferentes povos para a composição da população. **Cultura e identidade** concentra línguas, saberes, costumes, religiões e diversidade. A organização coletiva das tarefas na questão 6 do B1/AV1 usa **Organização social**. Contribuições culinárias usam **Alimentação e costumes**; música, capoeira e modernismo, **Expressões artísticas**; comemorações e festas, **Festas e tradições**. Não se usa como rótulo o povo ou o país de origem que o aluno deve identificar.

**Escravidão e resistência** reúne tráfico, trabalho forçado, quilombos, lideranças, abolicionismo e leis de abolição, sem antecipar a lei ou o líder solicitado. **Direitos e participação** cobre direitos territoriais, ensino da história e cultura dos povos, proteção da infância, ECA, Constituição, direitos humanos e trabalhistas e conquistas democráticas. A identificação do ECA na questão 27 do B3/AV2 permanece nesse tema amplo, sem usar a sigla ou o nome da lei como rótulo. **Cidadania e respeito** cobre deveres, convivência e atitudes de valorização da diversidade.

**Migrações** concentra origens, destinos, motivos e condições dos deslocamentos. A questão 22 do B2/AV2 pede reconhecer uma migração interna e usa **Transformações sociais**, seguindo o critério do 4º ano para não antecipar a própria classificação como resposta. **Regiões do Brasil** fica na divisão regional; as diferenças históricas, linguísticas e culturais entre regiões ficam em **Cultura e identidade**. A mistura de origens familiares na questão 24 do B2/AV2 usa **Formação do Brasil**, sem antecipar “miscigenação”.

**Trabalho no campo** e **Trabalho nas cidades** reúnem as atividades específicas quando o espaço já é dado. **Trabalho e tecnologia** cobre mudanças ligadas às máquinas e à industrialização. **História do trabalho** concentra valorização, interdependência e reconhecimento dos tipos de atividade: as questões 21 e 22 do B3/AV1 usam esse tema amplo, sem entregar “trabalho rural” ou “trabalho urbano”.

**Brasil Império** reúne independência, regências, Segundo Reinado e exílio; **Brasil República**, acontecimentos, governos e transformações políticas e econômicas desde a proclamação. Esses temas não usam o nome do governante, da capital ou do movimento que pode ser a resposta. Questões que pedem identificar Getúlio Vargas em B4/AV2, por exemplo, usam **Brasil República**, preservando a identificação como tarefa do aluno. Direitos trabalhistas, direitos das mulheres, redemocratização e Constituição usam **Direitos e participação** quando esse é o conteúdo predominante; imigração, escravidão e manifestações artísticas mantêm seus temas específicos nas revisões históricas.

A quantidade de temas acompanha o conteúdo: B1/AV1, B2/AV1 e B4/AV1 têm seis; B1/AV2 e B2/AV2, oito; B3/AV1, cinco; B3/AV2, dois; B4/AV2, quatro. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

A apresentação do limite de idade para trabalho e aprendizagem no B3/AV2 (IDs 12 e 25) e a contradição entre alternativa e curiosidade sobre o exílio de D. Pedro II no B4/AV1 (ID 19) foram registradas na [issue web #86](https://github.com/guilhermeborba/simulados-bernardo/issues/86), com fontes oficiais para revisão separada. Nenhum conteúdo anterior foi corrigido no lote de temas.

### Geografia — 5º ano

| Tema | Abrange |
|---|---|
| Agricultura | Cultivos, produtos agrícolas, café, cana-de-açúcar e produção de alimentos. |
| Atividades econômicas | Agropecuária, produção, setores da economia, reconhecimento de atividades e relações entre os setores. |
| Campo e cidade | Características e identificação dos espaços rural e urbano e sua interdependência. |
| Comércio | Exportações brasileiras e produtos vendidos a outros países. |
| Cultura e identidade | Línguas, colonização, origens dos povos, miscigenação, diversidade étnica e religiosa e respeito às diferenças. |
| Extrativismo | Retirada de recursos vegetais e minerais, exemplos, produtos e áreas de extração. |
| Fusos horários | Divisão dos horários, referência de Greenwich, rotação, dia e noite e comparações de horários entre localidades. |
| Geografia do Brasil | Sínteses que articulam território, organização regional, população, cultura e importância de estudar Geografia. |
| Globalização | Relações entre países vizinhos, cooperação e integração pelo Mercosul. |
| Indústria e matérias-primas | Transformação de matérias-primas, importância e concentração regional das indústrias. |
| Migração | Imigração, movimentos internos, êxodo rural, motivos, destinos e oportunidades de trabalho. |
| Organização das cidades | Urbanização, metrópoles, conurbação, moradia, planejamento e desafios do crescimento urbano. |
| Orientação e localização | Hemisférios, localização no globo, pontos cardeais e colaterais, rosa dos ventos, bússola e GPS. |
| Pecuária | Criação de animais e produtos dessa atividade. |
| População brasileira | Censo, IBGE, densidade, quantidade e distribuição da população e planejamento de serviços. |
| Preservação ambiental | Desmatamento, queimadas, poluição, erosão, extinção, conservação dos recursos, economia de água e reciclagem. |
| Recursos naturais | Água, solo, florestas, atmosfera, minerais e reconhecimento de recursos renováveis e não renováveis. |
| Regiões do Brasil | Divisão regional, composição, localização, comparação das regiões e localização de seus ambientes naturais. |
| Representações cartográficas | Mapas, globos, tipos de mapas, título, legenda, escala, símbolos, cores e leitura de representações. |
| Saneamento e infraestrutura | Água tratada, esgoto, resíduos e sua importância para a saúde e a qualidade de vida. |
| Território brasileiro | Dimensões, localização, fronteiras, países vizinhos, litoral, estados, capitais e Distrito Federal. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-geografia-5ano-b*-av*.ts`. Não há entradas privadas de Geografia do 5º ano registradas no seed. Todos compartilham este vocabulário de 21 temas, reaproveitando os nomes de Geografia dos anos anteriores quando o conteúdo corresponde. **Recursos naturais** e **Fusos horários** agrupam as unidades específicas deste lote.

A classificação considera o objetivo das questões e as alternativas dos enunciados genéricos. **Território brasileiro** reúne dimensões, fronteiras, litoral, estados e capitais, sem usar como rótulo o país, estado, capital ou tipo de fronteira que pode ser a resposta. **Regiões do Brasil** cobre divisão, composição e comparações regionais. A localização da Amazônia e do Pantanal em regiões, no B1/AV2, permanece nesse tema porque o objetivo é identificar a região. Hemisférios e posição no globo usam **Orientação e localização**. **Globalização** reúne cooperação e Mercosul; idioma, colonização e origens culturais ficam em **Cultura e identidade**.

**População brasileira** cobre censos, densidade e distribuição territorial, incluindo planejamento de serviços com base nesses dados. **Cultura e identidade** cobre etnias, línguas, religiões, miscigenação e valorização das diferenças, sem usar como rótulo o nome da origem ou da classificação solicitada. **Migração** concentra deslocamentos internos e internacionais, êxodo rural e seus motivos. **Campo e cidade** reúne características e identificação dos espaços; **Organização das cidades**, urbanização, metrópoles, conurbação e planejamento, sem antecipar qual processo é a resposta. A questão 17 do B2/AV2 usa **Saneamento e infraestrutura**, por tratar dos serviços de água, esgoto e resíduos.

**Atividades econômicas** reúne os setores e suas relações. As questões 21–23 do B3/AV1, que pedem reconhecer pecuária, setor secundário e extrativismo mineral, usam esse tema amplo. Não se usa o nome da atividade ou setor que o aluno deve descobrir como tema. Conteúdos específicos já identificados no enunciado usam **Agricultura**, **Pecuária**, **Indústria e matérias-primas** ou **Extrativismo**; as exportações de carne e soja usam **Comércio**. Impactos e cuidados com a produção ficam em **Preservação ambiental**.

**Recursos naturais** cobre tipos, exemplos, renovabilidade e usos de água, solo, florestas, atmosfera e minerais, sem antecipar “renovável”, “não renovável” ou o recurso que pode ser a resposta. **Preservação ambiental** reúne desmatamento, queimadas, poluição, erosão, conservação, economia de água e resíduos. Reconhecer a coleta seletiva na questão 24 do B3/AV2 usa esse tema amplo, sem antecipar o nome da prática.

**Representações cartográficas** concentra leitura e elementos dos mapas, sem usar “Legenda” ou “Escala” como tema nas questões que pedem identificar o elemento. **Orientação e localização** cobre direções, rosa dos ventos, bússola e GPS. **Fusos horários** reúne a unidade sobre diferenças de horário, incluindo a relação com rotação, dia e noite; não se usa o nome do horário ou a diferença numérica que pode ser a resposta. As sínteses que articulam diferentes conteúdos e a importância de estudar a disciplina usam **Geografia do Brasil**.

A quantidade de temas acompanha o conteúdo: B1/AV1 e B2/AV2 têm seis; B1/AV2 e B2/AV1, quatro; B3/AV1, sete; B3/AV2 e B4/AV1, dois; B4/AV2 revisa onze. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura.

As inconsistências preexistentes sobre quantidade de fusos e diferença Acre/Brasília (B4/AV2, IDs 4, 7, 21 e 24), além da precisão do enunciado sobre água doce e disponibilidade para consumo (B3/AV2, ID 4), foram registradas na [issue web #88](https://github.com/guilhermeborba/simulados-bernardo/issues/88), com fontes oficiais para revisão separada. Nenhum conteúdo anterior foi corrigido no lote de temas.

### Português — 6º ano

| Tema | Abrange |
|---|---|
| Adjetivos | Reconhecimento, função descritiva, características e locuções adjetivas nos exemplos estudados. |
| Classes de palavras | Comparação entre classes gramaticais e identificação do nome da classe sem antecipar a resposta. |
| Concordância | Ajustes de número e pessoa entre sujeito e verbo e de gênero e número entre substantivos, artigos e adjetivos. |
| Fábulas | Características, animais personificados, comparação com contos e função do ensinamento final. |
| Gêneros e tipos textuais | Características, finalidades, reconhecimento e comparação de contos, fábulas, lendas, crônicas, notícias, receitas e tipos de texto. |
| Leitura e escrita | Síntese sobre a aprendizagem dos recursos da língua e seu papel na leitura, escrita e comunicação. |
| Modos verbais | Indicativo, subjuntivo e imperativo: reconhecimento, diferenças e expressão de fatos, desejos, possibilidades, pedidos e ordens. |
| Narrativas | Narrador, primeira e terceira pessoa, onisciência, personagens, enredo, conflito, espaço e tempo. |
| Notícias | Definição, características e finalidade informativa de notícias sobre fatos reais. |
| Ortografia | Escolha e usos de mas/mais e por que/porque e sínteses sobre grafia, acentuação e clareza do texto. |
| Pontuação | Funções e usos de ponto final, interrogação, exclamação, vírgula, dois-pontos, reticências, aspas e travessão. |
| Pronomes | Pronomes pessoais, possessivos, demonstrativos, indefinidos e de tratamento: reconhecimento, referência e emprego em frases. |
| Sílabas e acentuação | Tonicidade, oxítonas, paroxítonas, proparoxítonas, regras de acentuação e grafia acentuada dos exemplos estudados. |
| Substantivos | Reconhecimento, definição e classificação em próprios, comuns, concretos, abstratos e coletivos. |
| Tempos verbais | Presente, passado e futuro: reconhecimento, uso nas frases e localização das ações no tempo. |
| Verbos | Identificação, ações, estados, fenômenos, grupos de conjugação e síntese sobre flexões de tempo e modo. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-portugues-6ano-b*-av*.ts`. Não há entradas privadas desse ano/disciplina no seed. Os 16 temas reaproveitam os nomes de Português dos anos anteriores quando o conteúdo corresponde. **Modos verbais** separa a comparação entre indicativo, subjuntivo e imperativo, concentrada neste ano, da localização temporal das ações.

**Gêneros e tipos textuais** reúne a definição e comparação de formas de texto e as perguntas em que o aluno precisa identificar o gênero ou tipo. Não se usa o nome da resposta como tema: B1/AV1, IDs 21 e 23–25, e B4/AV2, IDs 7, 13, 20, 21 e 26, por exemplo. **Fábulas** e **Notícias** concentram características de gêneros já dados no enunciado. **Narrativas** cobre os elementos e a organização das histórias, incluindo os tipos de narrador, sem antecipar suas classificações.

**Substantivos** e **Adjetivos** agrupam seus usos e classificações específicos. **Classes de palavras** reúne as comparações entre eles e as perguntas em que o nome da classe seria a resposta: B1/AV2, IDs 20, 25, 26 e 30, e B4/AV2, IDs 22 e 23. Também cobre o reconhecimento da ausência de adjetivo em B4/AV1, ID 14. **Concordância** reúne os ajustes nominais e verbais, inclusive as lacunas em que artigo, adjetivo ou forma verbal precisa acompanhar o restante da frase.

**Verbos** reúne identificação, função e grupos de conjugação; **Tempos verbais**, presente, passado e futuro; **Modos verbais**, indicativo, subjuntivo e imperativo. A síntese de tempo e modo em B2/AV1, ID 30, permanece em **Verbos**, sem escolher uma só das duas dimensões. **Pronomes** reúne os tipos estudados, sem usar como tema o tipo que deve ser identificado na resposta.

**Sílabas e acentuação** reúne tonicidade, classificação e regras dos sinais gráficos. **Ortografia** cobre a distinção de mas/mais e por que/porque; a síntese que articula essas grafias e a acentuação em B2/AV2, ID 30, usa esse tema mais amplo. **Pontuação** agrupa os sinais e seus efeitos, sem nomear no rótulo o sinal pedido. A síntese final de vários conteúdos em B4/AV2, ID 30, usa **Leitura e escrita**.

A quantidade de temas acompanha o conteúdo: B1/AV1 e B1/AV2 têm quatro; B2/AV1, três; B2/AV2, dois; B3/AV1 concentra pronomes; B3/AV2, pontuação; B4/AV1 tem dois temas; B4/AV2 revisa dez. Não se subdividem artificialmente os simulados concentrados em um conteúdo.

As inconsistências preexistentes de contagem de pronomes (B3/AV1, ID 16), correções ambíguas de concordância (B4/AV1, IDs 12 e 16; B4/AV2, ID 25), descrição das classes na frase (B4/AV1, ID 14) e definição de substantivo concreto (B1/AV2, ID 4) estão na [issue web #92](https://github.com/guilhermeborba/simulados-bernardo/issues/92), para revisão editorial separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs e estrutura foram preservados exatamente neste lote.

### Matemática — 6º ano

| Tema | Abrange |
|---|---|
| Adição | Somas de naturais, reagrupamento, parcelas e problemas de juntar quantidades. |
| Ângulos | Ângulos retos, rasos, agudos e obtusos, medidas em graus, identificação no cotidiano e soma dos ângulos internos de triângulos. |
| Divisão | Partilhas iguais, termos da divisão, quociente, resto e cálculos com números naturais. |
| Figuras planas | Polígonos, lados, quadrados, retângulos, triângulos, círculo e reconhecimento e comparação das formas. |
| Frações | Partes iguais de um todo, numerador, denominador, leitura, equivalência, simplificação, comparação e adição e subtração. |
| Geometria | Síntese que articula figuras planas, triângulos, ângulos e perímetro em situações do cotidiano. |
| Matemática no cotidiano | Síntese da aprendizagem de numeração, operações, divisibilidade, frações, decimais, geometria e porcentagem. |
| MMC e MDC | Listas de múltiplos e divisores comuns, cálculo do mínimo múltiplo comum e do máximo divisor comum e problemas de encontros periódicos. |
| Múltiplos e divisores | Definições, divisibilidade, listas, agrupamentos iguais, paridade e classificação de naturais pela quantidade de divisores. |
| Multiplicação | Produtos de naturais, tabuada, grupos iguais e cálculo de quantidades repetidas. |
| Números decimais | Partes inteira e decimal, décimos e centésimos, leitura, escrita, equivalência, ordenação, comparação, adição e subtração. |
| Perímetro | Contorno, soma dos lados e perímetros de quadrados e retângulos, incluindo cercas e terrenos. |
| Porcentagem | Partes por cem, símbolo %, equivalências com frações e decimais, porcentagens de quantidades e descontos. |
| Sistema de numeração | Algarismos, ordens, valor posicional, leitura, escrita, decomposição, comparação e ordenação de números naturais. |
| Sistema monetário | Quantias em reais e centavos, preços, compras, gastos, economia e cálculo de valores restantes. |
| Subtração | Diferenças de naturais e problemas de retirar quantidades ou calcular o que sobra. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-matematica-6ano-b*-av*.ts`. Não há entradas privadas desse ano/disciplina no seed. O vocabulário de 16 temas reaproveita os nomes dos anos anteriores quando o conteúdo corresponde; **Múltiplos e divisores** e **MMC e MDC** agrupam o estudo de divisibilidade introduzido neste lote.

**Sistema de numeração** reúne o primeiro simulado e as retomadas de naturais em B4/AV2. A escrita por extenso de R$ 89 sem centavos, em B1/AV1, ID 23, trabalha a representação do natural e permanece nesse tema. **Adição**, **Subtração**, **Multiplicação** e **Divisão** reúnem cálculos e aplicações das operações. **Sistema monetário** concentra os valores de dinheiro em B1/AV2, IDs 22, 25 e 29, e preços, compras e troco em B3/AV1, IDs 23–25.

**Múltiplos e divisores** cobre relações de divisibilidade e a classificação em primos e compostos a partir da quantidade de divisores, sem usar a classificação correta como rótulo. A pergunta que pede o nome de MDC em B2/AV1, ID 24, também usa esse tema amplo. **MMC e MDC** concentra o cálculo e as listas de comuns em B2/AV1, IDs 11–14, 25 e 26, e B4/AV2, ID 18, sem antecipar o valor procurado.

**Frações** reúne o B2/AV2, incluindo operações com denominadores iguais, equivalência e simplificação. **Números decimais** cobre o valor posicional, leitura e cálculo mesmo quando o contexto é uma altura, distância ou duração; não se criam temas de grandezas quando o objetivo é a escrita ou a operação decimal. Em B3/AV1, ID 21, identificar a parte decimal do preço permanece nesse tema; comparar preços ou calcular gastos e troco usa **Sistema monetário**. A representação dos décimos em uma altura, retomada em B4/AV2, ID 25, continua em **Números decimais**.

**Figuras planas** reúne formas, lados e tipos de triângulo; **Ângulos**, medidas, tipos, contagem e soma de ângulos; **Perímetro**, soma do contorno. Nenhum tema recebe o nome do polígono, do tipo de triângulo ou do tipo de ângulo que pode ser a resposta. A síntese do B3/AV2, ID 30, usa **Geometria**. **Porcentagem** reúne todo o B4/AV1, incluindo o preço final após o desconto da questão anterior no ID 23. A síntese geral em B4/AV2, ID 30, usa **Matemática no cotidiano**.

A quantidade de temas acompanha o conteúdo: B1/AV1 concentra numeração; B1/AV2 tem cinco; B2/AV1, dois; B2/AV2 concentra frações; B3/AV1 tem dois; B3/AV2, quatro; B4/AV1 concentra porcentagem; B4/AV2 revisa treze. Não se subdividem artificialmente os simulados concentrados em um assunto.

As inconsistências anteriores de gabarito/contagem de zeros e contradição na votação (B1/AV1, IDs 28 e 29), comando sobre divisores (B2/AV1, ID 21), inclusão de zero na definição/listagem de múltiplos (B2/AV1, IDs 1, 3 e 13; B4/AV2, ID 3) e distinção entre círculo e circunferência (B3/AV2, IDs 16 e 29) estão na [issue web #94](https://github.com/guilhermeborba/simulados-bernardo/issues/94), para revisão separada. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados neste lote.

### Ciências — 6º ano

| Tema | Abrange |
|---|---|
| Água na natureza | Importância da água para a vida, cobertura da superfície terrestre, oceanos e distribuição de água doce e salgada. |
| Astronomia | Astros, órbita da Lua e alinhamentos do Sol, Terra e Lua nos eclipses. |
| Células | Unidade celular, estruturas, funções, membrana, citoplasma, núcleo, parede celular, cloroplastos e mitocôndrias. |
| Ciência no cotidiano | Síntese da aprendizagem de investigação científica, matéria, células, misturas, solo, água e movimentos da Terra. |
| Ciclo da água | Circulação entre superfície, solo e atmosfera, evaporação, condensação, precipitação e águas subterrâneas. |
| Conservação do solo | Erosão, raízes, desmatamento, contaminação, rotação de culturas e manutenção da fertilidade. |
| Estados físicos | Características, partículas e reconhecimento dos estados sólido, líquido e gasoso nos exemplos estudados. |
| Instrumentos científicos | Identificação e funções de microscópio e termômetro e observação de estruturas muito pequenas. |
| Investigação científica | Observação, perguntas, hipóteses, variáveis, grupos, experimentos, coleta e registro de dados, evidências, repetição e comunicação. |
| Lua e suas fases | Mudanças da aparência da Lua conforme a posição relativa entre Sol, Terra e Lua. |
| Misturas | Composição, classificação e comparação de misturas homogêneas e heterogêneas, incluindo materiais dissolvidos e misturas gasosas. |
| Movimentos da Terra | Rotação, translação, eixo, dias, noites, duração do ano, estações e variação da iluminação. |
| Organização dos seres vivos | Organismos unicelulares e multicelulares, especialização das células e organização em tecidos, órgãos e sistemas. |
| Orientação e localização | Direções gerais do nascer e do pôr do Sol e pontos cardeais. |
| Práticas de laboratório | Procedimentos e equipamentos de proteção nos experimentos descritos. |
| Preservação ambiental | Poluição das águas, descarte de lixo e esgoto e efeitos sobre os seres vivos. |
| Resíduos e reciclagem | Separação de recicláveis, reaproveitamento e compostagem de matéria orgânica para produzir adubo. |
| Saúde e bem-estar | Tratamento de água e esgoto, prevenção de doenças e riscos da água contaminada. |
| Separação de misturas | Filtração, decantação, evaporação, destilação, catação, peneiramento, imantação e aplicações cotidianas. |
| Solo | Formação, intemperismo, horizontes, composição, húmus, texturas, retenção de água e suporte à vida. |
| Sustentabilidade | Economia, reutilização, consumo consciente e responsabilidade pelo cuidado da água. |
| Temperatura e calor | Aquecimento, resfriamento, energia e comportamento das partículas, incluindo a discussão de ebulição. |
| Transformações da matéria | Mudanças de estado físico, reconhecimento dos processos e influência de temperatura e pressão. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-ciencias-6ano-b*-av*.ts`. Não há entradas privadas desse ano/disciplina no seed. Os 23 temas reaproveitam os nomes dos anos anteriores quando o conteúdo corresponde; investigação, instrumentos, práticas, células, organização dos seres vivos, solo, sua conservação, disponibilidade de água e relações entre calor e temperatura explicitam os novos conteúdos deste ano.

**Investigação científica** reúne o raciocínio, as etapas e as evidências das pesquisas, sem dar como tema o nome da etapa ou do grupo solicitado. **Instrumentos científicos** concentra identificação e função de microscópio e termômetro, inclusive B2/AV1, ID 7. **Práticas de laboratório** reúne os itens de proteção do B1/AV1, IDs 10 e 26; o rótulo não antecipa a finalidade pedida na alternativa.

**Estados físicos** cobre as características e o reconhecimento dos estados, inclusive o estado final após congelamento em B1/AV2, ID 18. **Transformações da matéria** reúne nomes e condições dos processos de mudança de estado; não se usam Fusão, Condensação ou Sublimação como rótulos da resposta. Aquecer/resfriar partículas usa **Temperatura e calor** em B1/AV2, IDs 16, 17 e 29. Os IDs 20 e 28 desse simulado perguntam as condições de uma transformação e permanecem em **Transformações da matéria**, sem antecipar temperatura como resposta.

**Células** concentra estruturas e funções; **Organização dos seres vivos** reúne quantidade de células, especialização e níveis célula–tecido–órgão–sistema. Os temas não usam o nome da organela ou a classificação unicelular/multicelular que deve ser identificada. O reconhecimento do sistema circulatório em B2/AV1, ID 29, permanece na organização dos sistemas, sem antecipar seu nome.

**Misturas** reúne composição e tipos. **Separação de misturas** cobre os métodos, suas propriedades e seus usos; os rótulos não usam o método específico procurado. O B2/AV2, ID 20, pede identificar a separação como parte da reciclagem e usa **Resíduos e reciclagem**, que também cobre a finalidade da separação de recicláveis e a compostagem no B3/AV1. **Solo** reúne formação, textura e húmus; **Conservação do solo** cobre erosão, contaminação, raízes e rotação de culturas sem antecipar qual fenômeno ou prática é a resposta.

**Água na natureza** reúne importância e distribuição; **Ciclo da água**, as etapas e relações entre os reservatórios; **Saúde e bem-estar**, contaminação, tratamento de água e esgoto. Reconhecer o tratamento de esgoto em B3/AV2, ID 21, e B4/AV2, ID 26, usa esse tema amplo. **Preservação ambiental** cobre a poluição e seus efeitos; **Sustentabilidade**, economia, reuso e responsabilidade no consumo. A chuva no B1/AV2, ID 26, trabalha o nome de uma mudança de estado e fica em **Transformações da matéria**; no B3/AV2, as mudanças integram expressamente o ciclo e usam **Ciclo da água**.

**Movimentos da Terra** reúne rotação e translação, sem usar como tema o movimento ou a estação que deve ser identificado. **Orientação e localização** cobre as direções gerais do nascer e pôr do Sol; **Lua e suas fases**, a aparência lunar; **Astronomia**, astro e eclipses. A síntese que reúne conteúdos de todo o ano em B4/AV2, ID 30, usa **Ciência no cotidiano**.

A quantidade de temas acompanha o conteúdo: B1/AV1, B1/AV2, B2/AV1, B2/AV2 e B3/AV1 têm três cada; B3/AV2 tem cinco; B4/AV1, quatro; B4/AV2 revisa treze. Os campos anteriores foram preservados exatamente.

Os problemas anteriores de ebulição, exclusividade da parede celular, hipótese de ausência de rotação, vapor visível, exemplo infantil com naftalina, água doce/potabilidade e redação de hipótese estão na [issue web #97](https://github.com/guilhermeborba/simulados-bernardo/issues/97), com referências para revisão editorial separada. Este lote de temas não corrige nem valida cientificamente essas afirmações: apenas as classifica e preserva o conteúdo anterior.

### História — 6º ano

| Tema | Abrange |
|---|---|
| Cultura e identidade | Crenças, deuses, mitos, práticas funerárias, espetáculos e heranças linguísticas das sociedades antigas. |
| Direitos e participação | Participação política, democracia ateniense, limites da cidadania e conquistas de direitos na sociedade romana. |
| Egito Antigo | Localização, rio Nilo, monumentos, arquitetura funerária e sínteses da civilização egípcia. |
| Expressões artísticas | Teatro grego, suas funções e relações com deuses, heróis e sociedade. |
| Festas e tradições | Jogos da Antiguidade, celebrações religiosas, atletas, trégua e relações com os jogos atuais. |
| Filosofia | Significado, reflexão, questionamento, filósofos e legado do pensamento grego. |
| Grécia Antiga | Pólis, autonomia das cidades, Atenas e Esparta, formação militar e sínteses da civilização grega. |
| História e memória | Objeto de estudo da História e transformações humanas ao longo do tempo. |
| Mesopotâmia | Localização, rios, cidades, zigurates e sínteses da civilização mesopotâmica. |
| Organização social | Divisão de tarefas, leis, códigos, autoridades, governos, instituições e hierarquias sociais. |
| Primeiras sociedades humanas | Modos de vida, nomadismo, sedentarização, agricultura, aldeias e mudanças entre os primeiros grupos humanos. |
| Produção de alimentos | Cultivo, domesticação, recursos dos animais, excedentes e condições de irrigação e fertilidade. |
| Registros do passado | Fontes históricas, vestígios, pinturas rupestres, escrita, suportes e profissionais dos registros. |
| Roma Antiga | Localização, lenda da fundação e sínteses das contribuições da civilização romana. |
| Sociedades da Antiguidade | Comparações entre civilizações, reconhecimento de sua localização ou de seus vestígios e sínteses de legados comuns. |
| Tempo histórico | Contagem, organização do tempo, periodização e linhas do tempo presentes no conteúdo. |
| Trabalho e tecnologia | Ferramentas, domínio do fogo, cerâmica, roda, engenharia, construções e infraestrutura. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-historia-6ano-b*-av*.ts`. Não há entradas privadas adicionais desse ano/disciplina no seed. O vocabulário de 17 temas reaproveita os nomes dos anos anteriores quando o objetivo corresponde; os nomes novos agrupam as primeiras sociedades, a produção de alimentos, as civilizações antigas e a filosofia.

A classificação considera o objetivo e as alternativas de cada questão. **Primeiras sociedades humanas** reúne modos de vida e suas transformações, sem usar como rótulo o nome do período, do nomadismo, da sedentarização ou da agricultura que pode ser a resposta. A identificação da agricultura em B1/AV2, ID 21, e B4/AV2, ID 2, usa esse tema amplo. **Produção de alimentos** concentra recursos animais, cultivos, excedentes, água e condições das plantações; a especialização de tarefas decorrente dos excedentes usa **Organização social**. Ferramentas, fogo, cerâmica e obras públicas mantêm **Trabalho e tecnologia**.

**Registros do passado** reúne fontes e escrita, incluindo as pinturas rupestres e a atividade dos escribas. **Tempo histórico** descreve o objetivo das perguntas de periodização e linha do tempo; a classificação não valida a precisão histórica das formulações anteriores. **Direitos e participação** cobre democracia e cidadania, sem antecipar o nome do sistema político. **Organização social** cobre leis, governos, autoridades e grupos sociais, sem usar como tema o nome do código, governante ou instituição solicitado.

Os nomes **Mesopotâmia**, **Egito Antigo**, **Grécia Antiga** e **Roma Antiga** só são usados quando a civilização já é dada pelo enunciado ou o nome não resolve a tarefa. A invenção da roda em B2/AV1, ID 9, usa **Trabalho e tecnologia**, pois a alternativa correta identifica o povo mesopotâmico. Na revisão B4/AV2, identificar a civilização dos rios (IDs 3 e 4), do código (ID 7), dos monumentos (IDs 8 e 23), dos jogos (ID 24) e da lenda e dos legados romanos (IDs 25 e 29) usa **Sociedades da Antiguidade**, preservando a identificação como tarefa do aluno. A escrita em argila no ID 22 mantém **Registros do passado**; reconhecer a origem da democracia no ID 28 mantém **Direitos e participação**.

**Cultura e identidade** cobre crenças e mitos, práticas funerárias e herança linguística. O teatro mantém **Expressões artísticas**; as celebrações e competições, **Festas e tradições**; reflexão e pensadores, **Filosofia**. Os temas não recebem o nome do deus, herói, local, evento ou filósofo que o aluno precisa identificar.

A quantidade de temas acompanha o conteúdo: B1/AV1 e B2/AV1 têm cinco; B1/AV2 e B3/AV1, quatro; B2/AV2, sete; B3/AV2, cinco; B4/AV1, seis; B4/AV2 revisa dez. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura dos simulados.

A definição anterior de cidadania ateniense em B3/AV1, IDs 4 e 24, que associa os direitos políticos a homens livres nascidos na cidade sem delimitar ascendência, idade e período histórico, foi registrada na [issue web #99](https://github.com/guilhermeborba/simulados-bernardo/issues/99), com fonte primária para revisão separada. As alternativas e explicações foram preservadas no lote de temas.

### História — 7º ano

| Tema | Abrange |
|---|---|
| Administração colonial | Capitanias, Governo-Geral, donatários, sedes, governos de ocupação e controle fiscal, sem antecipar nomes solicitados. |
| Colonização do Brasil | Chegada portuguesa, primeiros contatos, trocas, conflitos e impactos demográficos. |
| Conflitos coloniais | Contestações internas, revoltas, disputas nas minas, repressão, líderes e comparações entre movimentos. |
| Cultura e identidade | Diversidade de línguas, costumes, conhecimentos e organizações dos povos indígenas e diferenças culturais. |
| Direitos e participação | Liberdade, dignidade e análise da escravidão à luz dos direitos humanos. |
| Disputas territoriais | Tratados, ocupações francesas e holandesas, defesa, expansão e formação do território. |
| Economia colonial | Pau-brasil, açúcar, engenhos, mineração, comércio, distribuição da produção e relações entre economia e sociedade. |
| Escravidão e resistência | Escravização indígena e africana, tráfico, trabalho forçado, quilombos, lideranças e luta por liberdade. |
| Expressões artísticas | Relação entre a riqueza das minas e a produção de igrejas, esculturas e arquitetura. |
| Filosofia | Ideias iluministas e sua circulação e influência nas contestações coloniais. |
| Formação do Brasil | Populações, história anterior a 1500 e sínteses das heranças econômicas, sociais e culturais da colonização. |
| História do trabalho | Atividades de subsistência indígenas e comparação com os interesses comerciais portugueses. |
| Migrações | Origens, deslocamentos e atração populacional para as áreas mineradoras. |
| Navegações marítimas | Reinos, navegadores, rotas, destinos, motivações comerciais e condições da expansão marítima europeia. |
| Registros do passado | Carta de Caminha, relatos, arqueologia, tradição oral e diversidade das perspectivas históricas. |
| Tempo histórico | Organização cronológica de viagens, invasões e movimentos coloniais. |
| Terra e propriedade | Sesmarias, distribuição e concentração de terras e comparações com as capitanias. |
| Trabalho e tecnologia | Embarcações, instrumentos, conhecimentos náuticos, orientação e aperfeiçoamento das viagens. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-historia-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 18 nomes; os nomes já consolidados são reaproveitados quando o conteúdo corresponde. Leitura e classificação individual de todas as questões, sem classificação automática por palavras-chave.

**Administração colonial** mantém em aberto a identificação de capitanias, Governo-Geral, governadores, impostos e instituições. **Economia colonial** evita antecipar açúcar, mineração ou a corrida do ouro em B3/AV2, ID 2; perguntas sobre os deslocamentos, quando o fenômeno já é dado, usam **Migrações**. **Conflitos coloniais** abrange a identificação dos movimentos em B4/AV1, ID 1, e B4/AV2, ID 9, sem usar a categoria ou o nome solicitado como rótulo. A identificação do Iluminismo usa **Filosofia**. **Escravidão e resistência** não nomeia o quilombo ou a liderança que se deve reconhecer. **Formação do Brasil** inclui a identificação dos primeiros habitantes em B1/AV2, ID 2, sem fornecer seu nome.

Os temas acompanham os conteúdos: B1/AV1 tem cinco; B1/AV2, seis; B2/AV1 e B2/AV2, três cada; B3/AV1, quatro; B3/AV2, sete; B4/AV1, quatro; B4/AV2, sete. Enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente. Os temas não atestam a precisão histórica das formulações anteriores sobre a Escola de Sagres e a derrama; revisão separada na [issue web #116](https://github.com/guilhermeborba/simulados-bernardo/issues/116).

### História — 8º ano

| Tema | Abrange |
|---|---|
| Trabalho e tecnologia | Mecanização, produção artesanal, fábricas, invenções, energia e industrialização. |
| História do trabalho | Condições, jornadas, trabalho infantil, classes, organização e reivindicações dos trabalhadores. |
| Migrações | Deslocamentos do campo para as cidades e busca por trabalho industrial. |
| Organização das cidades | Crescimento urbano, moradias, poluição e problemas de infraestrutura. |
| Revolução Francesa | Causas, episódios, fases, personagens e transformações da revolução, quando o processo já é dado. |
| Organização social | Grupos, hierarquias, governos, poder, códigos e instituições, sem nomear a revolução pedida. |
| Filosofia | Iluminismo, razão, soberania popular, separação de poderes e pensadores. |
| Direitos e participação | Declarações, direitos, liberdade, igualdade, fraternidade e circulação de ideais. |
| Tempo histórico | Ordenação e comparação cronológica de eventos e períodos. |
| Independência dos Estados Unidos | Treze colônias, impostos, protestos, guerra, lideranças e formação política dos EUA. |
| Europa no século XIX | Ascensão, governo e queda de Napoleão e suas relações com a Revolução Francesa, sem antecipar seu nome. |
| Disputas territoriais | Guerras, bloqueios, campanhas, congressos, restauração, fronteiras e equilíbrio europeu. |
| Formação do Brasil | Transferência da corte portuguesa e consequências políticas para o Brasil. |
| Independência do Brasil | Ruptura com Portugal, marcos, personagens, reconhecimento e organização inicial do país. |
| Independências americanas | Haiti e América espanhola, lideranças, emancipações, novas nações e comparações entre independências. |
| Brasil Império | Primeiro Reinado, Constituição, abdicação, regências, maioridade e sucessão monárquica. |
| Revoltas no Império | Confederação do Equador, Cabanagem, Farroupilha e causas/efeitos dos conflitos internos do Império. |

Lote E04: **240 questões em oito simulados gerais** `questoes-historia-8ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 17 nomes, com leitura individual dos enunciados e alternativas. Reaproveitados os nomes anteriores quando o conteúdo corresponde, incluindo Trabalho e tecnologia, História do trabalho, Migrações, Organização das cidades, Organização social, Filosofia, Direitos e participação, Tempo histórico, Disputas territoriais, Formação do Brasil e Brasil Império. Somente `theme` foi acrescentado; todos os campos anteriores e a estrutura foram preservados exatamente.

Trabalho e tecnologia cobre industrialização sem fornecer Revolução Industrial na revisão. Organização social cobre B4/AV2, IDs 2 e 22, sem fornecer Revolução Francesa. Europa no século XIX evita antecipar Napoleão nas perguntas de identificação. Independências americanas cobre B4/AV2, IDs 3 e 23, que pedem o país do episódio de Boston, sem nomear os EUA no tema; também mantém em aberto Haiti, países, lideranças e formas de governo da América espanhola. Filosofia evita antecipar Iluminismo. Brasil Império não fornece o nome do período regencial ou da maioridade; Revoltas no Império não nomeia a revolta solicitada.

Os oito simulados têm, na ordem B1/AV1 a B4/AV2, 4, 5, 4, 5, 3, 2, 3, 11 temas. A revisão anual articula os diferentes processos do ano; não se cria um nome para cada pergunta.

Cronologia, coroação/maioridade, sucessão/governo, início da campanha russa e alternativas sobre ajuda europeia registrados na [issue web #128](https://github.com/guilhermeborba/simulados-bernardo/issues/128), com fontes para revisão separada. Conteúdo anterior preservado; os temas não certificam a precisão histórica ou pedagógica do legado.

### Geografia — 6º ano

| Tema | Abrange |
|---|---|
| Biomas | Características, vegetação, fauna, biodiversidade, clima, localização e funções ambientais dos biomas brasileiros. |
| Campo e cidade | Características dos espaços rural e urbano e atividades que os distinguem. |
| Clima e cotidiano | Tempo e clima, elementos e fatores climáticos, massas de ar, tipos climáticos do Brasil e relações com a vegetação, a agricultura e o cotidiano. |
| Fontes de energia | Aproveitamento da força da água e identificação de usinas na geração de energia elétrica. |
| Geografia do Brasil | Sínteses do estudo de relevo, clima, vegetação, rios e população e das relações entre esses conteúdos. |
| Hidrografia | Rios, nascentes, foz, afluentes, margens, leito, bacias, cheias, secas, abastecimento e usos da água. |
| Migração | Deslocamentos internos e internacionais, êxodo rural, imigração, emigração e relações com o crescimento urbano. |
| Organização das cidades | Concentração urbana, trânsito, moradias e desafios de infraestrutura das grandes cidades. |
| Orientação e localização | Pontos cardeais e colaterais, rosa dos ventos, bússola, Sol, sombras, estrelas, hemisférios e GPS. |
| Paisagens | Elementos naturais e humanos, paisagens naturais e transformadas e mudanças por fenômenos naturais ou ação humana. |
| População brasileira | Densidade, quantidade e distribuição da população, Censo, IBGE, idade, expectativa de vida, crescimento e planejamento de serviços. |
| Preservação ambiental | Proteção dos rios e biomas, matas ciliares, poluição, desmatamento, queimadas, economia de água e consumo consciente. |
| Relevo | Formas do terreno, agentes internos e externos, unidades brasileiras, erosão, mudanças e relações com ocupação, plantio, obras e riscos. |
| Representações cartográficas | Mapas, globos, croquis, atlas, plantas, legendas, escalas e seus usos. |
| Solo | Camada superficial da terra e sua relação com o crescimento das plantas. |
| Transportes e circulação | Uso dos rios para deslocamento de pessoas e mercadorias. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-geografia-6ano-b*-av*.ts`. Não há entradas privadas adicionais desse ano/disciplina no seed. Todos compartilham este vocabulário de 16 temas. Os nomes dos anos anteriores são reaproveitados; **Biomas** e **Fontes de energia** mantêm os nomes de Ciências do 5º ano, e **Solo**, o de Ciências do 6º, para conteúdos correspondentes.

A classificação segue o objetivo de cada questão. **Orientação e localização** reúne direções e instrumentos, sem usar como rótulo a direção, o instrumento ou a linha imaginária que pode ser a resposta. **Representações cartográficas** agrupa elementos e modelos de representação, sem antecipar legenda, escala, globo, croqui, atlas ou planta. **Paisagens** cobre a distinção entre elementos e transformações; as características específicas de rural e urbano em B1/AV2, IDs 11 e 12, usam **Campo e cidade**. Formas do terreno mantêm **Relevo**, sem usar o nome da forma solicitada.

**Hidrografia** reúne a estrutura, a distribuição e os usos dos rios e das bacias. Não se usa como tema o nome da bacia, da parte do rio ou do regime de água solicitado. A proteção da qualidade da água e das margens usa **Preservação ambiental**; a geração hidrelétrica mantém **Fontes de energia**, inclusive quando o aluno identifica o tipo de usina em B2/AV2, ID 25. O transporte fluvial em B2/AV2, ID 16, usa **Transportes e circulação**. O rótulo de hidrografia descreve o objetivo e não valida as definições anteriores de bacia.

**Clima e cotidiano** reúne a unidade de tempo, clima e diversidade climática, sem usar o tipo climático ou o fator geográfico solicitado como rótulo. **Biomas** cobre reconhecimento, características, biodiversidade e funções ambientais; desmatamento, queimadas, consumo e proteção usam **Preservação ambiental**. Não se usa como tema o nome do bioma que é a resposta.

**População brasileira** concentra distribuição, indicadores e instrumentos de estudo demográfico. Pirâmide etária mantém esse tema por seu objetivo demográfico, mesmo quando aparece em um gráfico. **Migração** reúne os diferentes deslocamentos, sem antecipar o tipo solicitado; desafios de trânsito e moradia em B4/AV1, ID 17, usam **Organização das cidades**. A síntese de relações entre natureza e população em B4/AV2, ID 30, usa **Geografia do Brasil**.

A quantidade de temas acompanha o conteúdo: B1/AV1, B2/AV1 e B3/AV2 têm dois; B1/AV2 e B2/AV2, quatro; B3/AV1 concentra clima; B4/AV1 tem três; B4/AV2 revisa onze. Não se subdividem artificialmente as avaliações concentradas em uma unidade. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura dos simulados.

As formulações anteriores sobre bacia/rede hidrográfica (B2/AV2, IDs 5 e 24; B4/AV2, ID 9), tempo e clima (B3/AV1, ID 29), intemperismo/erosão (B2/AV1, ID 4) e orientação por sombras sem Sol (B1/AV1, ID 18) estão na [issue web #101](https://github.com/guilhermeborba/simulados-bernardo/issues/101), com referências oficiais e critérios para revisão separada. O lote de temas preserva o conteúdo e não declara essas definições cientificamente validadas.

### Geografia — 7º ano

| Tema | Abrange |
|---|---|
| Biomas | Distribuição, características, fauna, vegetação, diversidade, adaptações e relações entre biomas. |
| Clima e cotidiano | Tipos, fatores e massas de ar, temperatura, precipitação, altitude, maritimidade e relações com agricultura e escolhas cotidianas. |
| Economia brasileira | Industrialização, concentração econômica, empregos e fatores históricos da economia regional. |
| Fontes de energia | Usinas e condições do aproveitamento hidrelétrico dos rios brasileiros. |
| Formação territorial | Tratados, bandeiras, missões, ocupação colonial, mineração, fronteiras, diplomacia e integração territorial. |
| Geografia do Brasil | Sínteses das relações entre clima, relevo, hidrografia, biomas, população e ação humana. |
| Geologia | Escudos cristalinos, bacias sedimentares, recursos minerais e posição tectônica. |
| Hidrografia | Rios, bacias, nascentes, foz, afluentes, regimes, águas subterrâneas, vazão, usos e relações com as comunidades. |
| Migração | Êxodo rural e urbano, deslocamentos internos, origens, destinos e motivos das mudanças. |
| Organização das cidades | Metrópoles, hierarquia, conurbação, planejamento, moradia, desigualdade e problemas sociais e ambientais urbanos. |
| População brasileira | Densidade, quantidade e distribuição da população, urbanização e concentração no território. |
| Preservação ambiental | Conservação dos biomas e rios, biodiversidade, desmatamento, queimadas, assoreamento, matas ciliares e riscos em encostas. |
| Regiões do Brasil | Divisão regional, instituições responsáveis, localização, estados, características, contrastes internos e planejamento regional. |
| Relevo | Formas, unidades, localização, processos e relações do terreno com agricultura, ocupação e construções. |
| Saneamento e infraestrutura | Abastecimento, esgoto, resíduos e relações com saúde, qualidade de vida e ambiente urbano. |
| Tempo histórico | Ordenação dos eventos abordados na formação territorial. |
| Transportes e circulação | Rios como caminhos de deslocamento e ocupação e transporte público no espaço urbano. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-geografia-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 17 nomes, com reaproveitamento dos anos anteriores quando o conteúdo corresponde. Classificação individual, sem inferência automática por palavras-chave.

**Regiões do Brasil** agrupa a divisão regional e suas características, sem antecipar o nome de uma região, estado, clima ou bioma solicitado. O simulado B1/AV2 mantém esse único tema por concentrar a comparação regional; B2/AV1 mantém **Clima e cotidiano**. Não se criam subdivisões artificiais para atingir a recomendação de três temas. **Biomas**, **Relevo** e **Hidrografia** mantêm em aberto a identificação de biomas, formas do terreno, rios e bacias. **Formação territorial** não antecipa um tratado, sistema ou instrumento diplomático específico. **Organização das cidades** permite reconhecer planejamento, conurbação, hierarquia e ilhas de calor sem usar a resposta como rótulo. **Migração** reúne o reconhecimento e as causas dos diferentes deslocamentos, sem fornecer êxodo rural ou urbano como tema. **Preservação ambiental** cobre danos, proteção e prevenção; a identificação de usinas mantém **Fontes de energia**.

Distribuição: B1/AV1 tem três temas; B1/AV2 e B2/AV1, um cada; B2/AV2, três; B3/AV1 e B3/AV2, quatro cada; B4/AV1, oito; B4/AV2 revisa treze. Todos os campos anteriores foram preservados exatamente, incluindo gabaritos. A leitura encontrou divergências de letras e formulações conceituais, documentadas com um roteiro manual de revisão na [issue web #117](https://github.com/guilhermeborba/simulados-bernardo/issues/117). Preencher `theme` não corrige nem certifica esses conteúdos.

### Arte — 6º ano

| Tema | Abrange |
|---|---|
| Arquitetura | Templos, colunas, arcos, espaços de apresentação, aquedutos, pontes e seus usos, estrutura e influência. |
| Arte e história | Relações entre arte e períodos históricos, comparações entre culturas e identificação de civilizações e formas de arte do passado. |
| Arte egípcia | Características da representação, hieróglifos e estética, arte funerária, crenças, obras e legados do Egito Antigo. |
| Arte grega | Características, cerâmica, temas representados, legados e relações entre formas artísticas na Grécia Antiga. |
| Arte romana | Influências culturais, obras, mosaicos e seus registros, legados e relações entre arte, arquitetura e engenharia romana. |
| Arte rupestre | Suportes, temas, sítios arqueológicos, possíveis funções, crenças e expressão dos primeiros grupos humanos. |
| Artes indígenas | Grafismos, cestaria, arte plumária, materiais, técnicas, saberes e continuidade das criações dos diferentes povos indígenas. |
| Artes visuais | Volume, diferenças entre pintura e escultura, percepção e reconhecimento de formas visuais sem antecipar seu nome. |
| Cores | Cores primárias e secundárias, misturas de tintas, escala de cinza e sensações associadas às cores. |
| Cultura e identidade | Diversidade, origens e contribuições culturais, crenças, rituais e sentidos das expressões artísticas dos diferentes povos. |
| Dança | Corpo e expressão na linguagem da dança, quando essa linguagem já está indicada no enunciado. |
| Escultura | Representação do corpo e do rosto, proporção, naturalismo, idealização, retratos e usos das estátuas. |
| Expressões artísticas | Arte como expressão, reconhecimento e articulação das linguagens visuais, musicais, da dança e do teatro. |
| Linguagem visual | Ponto, linha, forma, textura, contorno, composição e combinação de elementos visuais. |
| Materiais e técnicas | Ferramentas, pigmentos, suportes, conservação de materiais, modos de produção e mosaicos. |
| Música | Percepção e audição na linguagem musical, quando essa linguagem já está indicada no enunciado. |
| Patrimônio e preservação | Valor da arte rupestre como patrimônio e memória da humanidade. |
| Registros do passado | Obras como fontes para estudar costumes, modos de vida, imagens, escrita e personagens históricos. |
| Teatro | Elementos cênicos, atores e apresentação ao público, quando a linguagem teatral já está indicada. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-arte-6ano-b*-av*.ts`. Não há entradas privadas adicionais desse ano/disciplina no seed. Este é o primeiro lote de Arte da E04. O vocabulário fechado de 19 nomes reaproveita **Cultura e identidade**, **Expressões artísticas**, **Patrimônio e preservação** e **Registros do passado**, já usados em História para conteúdos correspondentes, e acrescenta os grupos próprios da disciplina.

A classificação considera o objetivo e as alternativas de cada questão. **Linguagem visual** reúne ponto, linha, forma, textura e composição, sem usar como rótulo o elemento que precisa ser identificado. **Cores** reúne classificação, misturas e sensações. Reconhecer o conjunto de elementos em B1/AV1, ID 19, e sua presença em diferentes culturas em B4/AV2, ID 28, usa **Artes visuais**, sem antecipar a expressão “linguagem visual” da alternativa correta. **Materiais e técnicas** cobre ferramentas, pigmentos, suportes e processos; reconhecer a técnica do mosaico, por exemplo, mantém esse tema amplo.

**Expressões artísticas** agrupa o reconhecimento das linguagens e as sínteses sobre expressão e criatividade. Perguntas cuja resposta é música, dança, teatro, artes visuais ou escultura não recebem esse nome como rótulo. **Dança**, **Música** e **Teatro** são usados quando a linguagem já está dada e o objetivo é sua forma de expressão, percepção ou seus elementos. **Artes visuais** cobre volume e a comparação entre pintura e escultura e também o reconhecimento da escultura monumental da Esfinge, sem antecipar o nome da modalidade. Os itens de B1/AV2, ID 25, e B4/AV2, ID 16, cuja resposta inclui escultura/artes visuais, usam **Expressões artísticas**. Identificar a linguagem “visual” em B4/AV2, ID 11, também usa esse tema amplo.

**Arte rupestre** reúne características e contextos quando a manifestação já é dada. Identificá-la em B2/AV1, IDs 1 e 21, ou reconhecer o período em B4/AV2, IDs 3 e 21, usa **Arte e história**. O estudo das pinturas como fonte usa **Registros do passado**; seu valor como patrimônio, **Patrimônio e preservação**. Comparações entre épocas e sínteses históricas usam **Arte e história**, sem validar as generalizações anteriores sobre evolução ou desenvolvimento das artes.

**Arte egípcia**, **Arte grega** e **Arte romana** cobrem características e contextos quando a civilização já está indicada. Perguntas que pedem identificar a civilização, como B4/AV2, IDs 4, 22, 24 e 29, usam **Arte e história**. A influência grega na arte romana em B3/AV2, IDs 1 e 27, mantém **Arte romana**, preservando a identificação da origem como tarefa do aluno. **Escultura** cobre representação, estilos e retratos; **Arquitetura**, estruturas e funções quando o tipo já é dado. Identificar arquitetura como resposta em B3/AV1, ID 8, e B3/AV2, IDs 3, 13 e 21, mantém o tema da respectiva civilização. B4/AV2, ID 19, usa **Arte e história**.

**Artes indígenas** reúne criações, materiais, técnicas e continuidade dos saberes sem reduzir os diferentes povos a uma única tradição. **Cultura e identidade** cobre diversidade, origens e significados culturais, incluindo as manifestações afro-brasileiras e a identificação da arte indígena em B4/AV2, ID 25. As perguntas sobre os significados da pintura corporal em B4/AV1, ID 4, e B4/AV2, ID 18, mantêm **Artes indígenas**, sem antecipar identidade e cultura na resposta. A origem do maracatu e do jongo não aparece como rótulo da resposta. As comparações de materiais entre culturas em B4/AV1, IDs 17 e 28, usam **Materiais e técnicas**.

A quantidade de temas acompanha o conteúdo: B1/AV1 tem quatro; B4/AV1, três; B1/AV2 e B2/AV2, seis; B2/AV1 e B3/AV1, cinco; B3/AV2, sete; B4/AV2 revisa dez. Todos os campos anteriores foram preservados exatamente, incluindo enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura dos simulados.

As generalizações e a terminologia anteriores sobre espaços do teatro grego, realismo dos retratos romanos, comparação de materiais entre culturas e desenvolvimento rupestre/egípcio estão na [issue web #103](https://github.com/guilhermeborba/simulados-bernardo/issues/103), com referências e critérios para revisão separada. Os conteúdos e gabaritos foram preservados; a classificação não valida essas formulações de história da arte.


### Arte — 7º ano

| Tema | Abrange |
|---|---|
| Cores | Modelo de mistura de tintas adotado no conteúdo, cores primárias e secundárias, misturas, círculo cromático, temperatura e escala de cinza. |
| Cultura e identidade | Reconhecimento do conjunto de bens e práticas herdados por uma sociedade e do conceito de tradições populares, sem fornecer os termos solicitados. |
| Dança | Corpo, movimento, espaço, tempo, coreografia, improvisação, treino e origens das práticas de dança. |
| Danças brasileiras | Frevo, carimbó, samba de roda, jongo, maracatu e pau de fitas: características, origens e contextos. |
| Expressões artísticas | Integração das linguagens visuais, musicais, da dança e do teatro no Carnaval. |
| Festas e tradições | Narrativas e personagens do folclore, Bumba Meu Boi, Folia de Reis e congado. |
| Instrumentos musicais | Famílias, mecanismos sonoros, classificação, execução e instrumentos presentes nas tradições musicais. |
| Linguagem visual | Ponto, linha, forma, textura, volume, espaço, composição, luz, sombra e percepção dos elementos visuais. |
| Literatura e oralidade | Suportes e reconhecimento da literatura de cordel no contexto das tradições culturais. |
| Música | Ritmo, timbre, melodia, harmonia, altura, intensidade, andamento, dinâmica, escalas, intervalos, oitavas e acordes. |
| Música brasileira | Gêneros, movimentos, artistas, origens, influências, regiões, contextos históricos e produção musical brasileira. |
| Notação musical | Pausas, compasso, clave e indicações de execução na partitura. |
| Patrimônio e preservação | Bens materiais e imateriais, reconhecimento, instituições, transmissão dos saberes e exemplos de patrimônio. |
| Práticas vocais | Beatbox, canto a cappella e organização das vozes em duplas. |
| Teatro | Atores, personagens, textos, equipe, espaços, recursos cênicos, ensaios, gêneros, interpretação e improvisação. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-arte-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 15 nomes; Linguagem visual, Cores, Música, Teatro, Dança, Cultura e identidade, Expressões artísticas e Patrimônio e preservação reaproveitam os nomes do 6º ano. Festas e tradições mantém o nome já usado em História para o conteúdo correspondente. Classificação individual, sem associação automática por palavras-chave.

**Linguagem visual** inclui o reconhecimento dos elementos ponto, linha, forma, textura, cor e volume, sem fornecer esses nomes como tema quando são a resposta. **Cores** reúne a identificação das cores e de suas classes, sem antecipar o resultado da mistura ou a classe pedida. **Música**, **Instrumentos musicais** e **Notação musical** não fornecem o elemento, família, instrumento ou sinal solicitado. A nomenclatura ampla também foi mantida no ID 19 de B2/AV1, cujo gabarito anterior precisa de revisão. **Teatro** e **Dança** são usados em questões cujo contexto já indica a linguagem; não antecipam ator, cenário, figurino, sonoplastia, palco, coreografia ou improvisação. **Danças brasileiras** mantém em aberto a dança, o estado ou a origem cultural solicitada.

O reconhecimento de patrimônio cultural em B4/AV1, ID 1, e B4/AV2, ID 6, usa **Cultura e identidade**, para não fornecer o conceito como rótulo. A classificação em material/imaterial usa **Patrimônio e preservação**, sem antecipar o tipo. Personagens do folclore usam **Festas e tradições**; identificar cordel usa **Literatura e oralidade**, sem nomear o gênero antes da resposta.

B1/AV1, B1/AV2 e B3/AV1 mantêm um tema cada, por serem concentrados em linguagem visual, cores e teatro; B2/AV1 tem quatro; B2/AV2, quatro; B3/AV2, dois; B4/AV1, cinco; B4/AV2 revisa dez. A recomendação de três a oito temas não obriga subdivisões artificiais nem limita a revisão anual. Todos os campos anteriores foram preservados exatamente. O gabarito de compasso e a precisão de comandos sobre patrimônio e uma narrativa folclórica estão na [issue web #118](https://github.com/guilhermeborba/simulados-bernardo/issues/118), para revisão separada.

### Educação Física — 6º ano

| Tema | Abrange |
|---|---|
| Alongamento | Conceito, execução e finalidades dos alongamentos. |
| Basquete | Objetivo, jogadores, cesta, pontuação, fundamentos e faltas. |
| Capacidades físicas | Força, resistência, velocidade, agilidade, equilíbrio, coordenação e flexibilidade. |
| Capoeira | História, roda, ginga, instrumentos, música, cultura e patrimônio. |
| Consciência corporal | Percepção dos movimentos, tensões e sensações do próprio corpo. |
| Futebol | Objetivo, jogadores, goleiro, áreas, reinícios, faltas e impedimento. |
| Ginástica | Tipos, origens, aparelhos, movimentos e apresentações. |
| Handebol | Objetivo, jogadores, mãos, área de gol, goleiro, infrações e estratégias. |
| Jogos e brincadeiras | Tradição, acessibilidade, materiais, adaptações, cooperação e benefícios. |
| Lutas | Modalidades, origens, cumprimentos, valores e diferença entre luta e briga. |
| Modalidades esportivas | Comparações, categorias, cooperação e características compartilhadas dos esportes. |
| Postura | Posições, pausas, uso de telas, mochila e distribuição do peso. |
| Práticas corporais | Variedade de atividades, interesses e aprendizagens da Educação Física. |
| Preparação e segurança | Aquecimento, proteção, supervisão, progressão e cuidados na prática. |
| Regras e convivência | Regras, justiça, segurança coletiva, disciplina, respeito e esportividade. |
| Relaxamento | Tensão, respiração calma e concentração. |
| Saúde e bem-estar | Cuidados combinados, hábitos e bem-estar corporal. |
| Voleibol | Objetivo, jogadores, toques, saque, rede, rodízio e fundamentos. |

Primeiro lote de Educação Física da E04: **240 questões em oito simulados gerais**, em `questoes-educacao-fisica-6ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 18 nomes; Saúde e bem-estar reaproveita o nome usado em Ciências. Somente `theme` foi acrescentado; demais campos e estrutura foram preservados.

A classificação segue o objetivo e as alternativas. Capacidades físicas não antecipa a capacidade solicitada. Identificar esportes como coletivos ou comparar modalidades usa Modalidades esportivas; os nomes dos esportes só aparecem quando não resolvem a tarefa. B2/AV2, ID 22, mantém o tema amplo, sem pressupor no rótulo o esporte da pergunta anterior.

Ginástica não antecipa o tipo ou aparelho solicitado; Preparação e segurança permite identificar aquecimento sem entregar o nome. Em B3/AV2, IDs 21, 22, 25, 26 e 30, Saúde e bem-estar evita antecipar a prática ou o conceito pedido. No B4/AV2, ID 25, Lutas evita entregar o valor solicitado; ID 27 usa Práticas corporais. Capoeira não antecipa o movimento, instrumento ou origem.

B1/AV1, B2/AV2 e B3/AV1 têm três temas; B1/AV2, dois; B2/AV1, quatro; B3/AV2 e B4/AV1, cinco. B4/AV2 retoma quinze temas das unidades, incluindo as quatro modalidades, preservando os nomes na revisão.

As formulações anteriores sobre toques do voleibol e alongamento/recuperação estão na [issue web #105](https://github.com/guilhermeborba/simulados-bernardo/issues/105), para revisão separada. Os conteúdos e gabaritos foram preservados; os temas não validam essas formulações.

### Educação Física — 7º ano

| Tema | Abrange |
|---|---|
| Alimentação saudável | Variedade alimentar, nutrientes, moderação, hidratação e reposição de líquidos nas situações propostas. |
| Atletismo | Corridas, saltos, lançamentos, arremessos, revezamentos, técnicas e reação à largada. |
| Capacidades físicas | Força, resistência, flexibilidade, coordenação e ritmo nas atividades. |
| Capoeira | Origem, roda, ginga, instrumentos, música e dimensões culturais da prática. |
| Ginástica | Tipos, finalidades, aparelhos, solo, acrobacias e apresentações participativas. |
| Handebol | Jogadores, posições, fundamentos, posse, passos, área e estratégias. |
| Jogos e brincadeiras | Brincadeiras tradicionais, materiais, nomes, regras, transmissão e patrimônio cultural. |
| Lutas | Judô, técnicas, espaços, graduação, princípios, regras, valores e diferença entre luta e briga. |
| Modalidades esportivas | Reconhecimento e comparação de características esportivas quando a modalidade não pode ser presumida pelo comando. |
| Postura | Posições corporais, coluna e pausas em atividades sentadas. |
| Práticas de aventura | Modalidades, ambientes naturais e urbanos, técnica, equilíbrio e relações com a natureza. |
| Preparação e segurança | Aquecimento, desaquecimento, limites, avaliação dos riscos, equipamentos, supervisão e cuidados. |
| Regras e convivência | Estratégias coletivas, cooperação e colaboração em jogos. |
| Saúde e bem-estar | Benefícios das práticas, hábitos combinados, sedentarismo, desenvolvimento e qualidade de vida. |
| Sono e descanso | Recuperação, energia, concentração e consequências da privação de sono. |
| Voleibol | Jogadores, rede, fundamentos, recepção, levantamento, ataque e pontuação. |

Lote E04: **240 questões em oito simulados gerais**, em `questoes-educacao-fisica-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 16 temas; os nomes do 6º ano foram reaproveitados quando o conteúdo corresponde. Alimentação saudável mantém o nome de Ciências. Atletismo, Práticas de aventura e Sono e descanso agrupam os novos conteúdos. Classificação individual por mapa manual; somente `theme` foi acrescentado.

Os nomes das modalidades são usados quando o contexto já as fornece e não resolvem a tarefa. B1/AV1, ID 14, combina o nome handebol com a descrição de bloqueio junto à rede; usa **Modalidades esportivas**, sem corrigir ou presumir a modalidade. Identificar provas mantém **Atletismo**; reconhecer capacidades mantém **Capacidades físicas**; identificar práticas como escalada, rapel ou slackline mantém **Práticas de aventura**. **Preparação e segurança** não antecipa aquecimento, gestão de risco ou o equipamento solicitado. B2/AV1, ID 4, usa **Saúde e bem-estar**, sem fornecer alongamento; os momentos finais dos IDs 19 e 27 usam o grupo amplo de preparação e cuidados. Perguntas sobre tipos de patrimônio, cooperação ou nomes de brincadeiras mantêm grupos amplos.

B1/AV1 tem três temas; B1/AV2 concentra um; B2/AV1, quatro; B2/AV2 e B3/AV1, três cada; B3/AV2, dois; B4/AV1, cinco; B4/AV2 revisa onze. A quantidade acompanha o conteúdo, sem subdivisões artificiais. Todos os campos anteriores e a estrutura foram preservados exatamente.

As formulações de regras, atletismo, bets/futebol de botão e alongamento estão na [issue web #120](https://github.com/guilhermeborba/simulados-bernardo/issues/120), para revisão separada, incluindo continuação dos conceitos já registrados na #105. A classificação temática não valida essas formulações nem constitui orientação clínica.

### Inglês — 6º ano

| Tema | Abrange |
|---|---|
| Adjetivos possessivos | Uso de my, your, his, her, our e their em frases que indicam posse. |
| Alimentos e bebidas | Nomes de comidas e bebidas, pedidos e vocabulário das refeições. |
| Animais | Nomes de animais e identificação por características ou contexto. |
| Classes de palavras | Reconhecimento de categorias gramaticais sem indicar no tema a classe solicitada. |
| Cores | Nomes de cores e seu uso na descrição de objetos e situações. |
| Descrições em inglês | Vocabulário de tamanho, velocidade, força e aparência, incluindo opostos. |
| Dias da semana | Nomes, sequência e uso dos dias em calendários e agendas. |
| Existência e quantidade | Uso de there is/there are com singular, plural e substantivos incontáveis. |
| Família | Nomes de parentes, apresentações da família e árvore genealógica. |
| Materiais escolares | Nomes e funções dos objetos usados na escola. |
| Números | Contagem, sequência, quantidades e operações simples com números em inglês. |
| Presente simples | Concordância, formas verbais e perguntas sobre hábitos e rotina. |
| Pronomes pessoais | Escolha de pronomes e referências a pessoas em frases e apresentações. |
| Rotina diária | Significado de verbos e expressões das atividades do dia a dia. |
| Saudações e apresentações | Cumprimentos, despedidas, apresentação pessoal e perguntas iniciais de uma conversa. |
| Uso do inglês | Reflexão sobre os conteúdos aprendidos e suas aplicações na comunicação cotidiana. |
| Verbo to be | Escolha de am/is/are e composição de frases no presente. |

Lote E04: 240 questões em oito arquivos gerais `questoes-ingles-6ano-b*-av*.ts`, sem entradas privadas adicionais. Primeiro lote de Inglês da E04, com vocabulário fechado de 17 nomes. Só `theme` foi acrescentado; enunciados, alternativas, gabaritos, dicas, curiosidades, IDs, exports e estrutura foram preservados exatamente.

A tarefa determina o agrupamento: escolher um pronome usa Pronomes pessoais; completar am/is/are usa Verbo to be; completar uma forma verbal para concordar com o sujeito usa Presente simples. Quando as alternativas são verbos de significados distintos e a tarefa pede a atividade, usa Rotina diária. Substantivos de contexto, como animais e alimentos, não substituem o tema gramatical quando o foco é concordância.

B1/AV2, ID 30, e B3/AV2, ID 29, pedem reconhecer uma classe gramatical. Usam Classes de palavras para não antecipar as respostas Adjetivos possessivos/Adjetivos. Descrições em inglês mantém juntas as palavras que descrevem tamanho, velocidade, força e aparência, sem rotular valores específicos que sejam o gabarito. Existência e quantidade não antecipa a escolha entre is e are.

As questões que resumem a aprendizagem usam Uso do inglês, sem destacar no tema a combinação correta de conteúdos entre as alternativas: B1/AV1, ID 30; B2/AV1, IDs 29–30; B2/AV2, ID 30; B3/AV1, ID 30; B3/AV2, ID 30; B4/AV1, ID 30; B4/AV2, ID 29. Os sete primeiros simulados agrupam três ou quatro temas cada; B4/AV2 revisa dezesseis temas do ano, mantendo os mesmos nomes das unidades.

As formulações anteriores sobre uso singular de their, branco/preto na roda de cores e convenção do primeiro dia da semana estão na [issue web #107](https://github.com/guilhermeborba/simulados-bernardo/issues/107), com fontes e critérios para revisão separada. A classificação temática não valida essas explicações; o conteúdo foi preservado neste lote.

### Inglês — 7º ano

| Tema | Abrange |
|---|---|
| Comparações em inglês | Comparativos, superlativos, formas regulares e irregulares, sufixos, more/most e relações com than. |
| Descrições em inglês | Adjetivos, opostos, aparência, personalidade, idade, tamanho, preço, clima e posição do adjetivo na descrição. |
| Estruturas verbais | Escolha de formas verbais quando o contexto temporal anterior não permite pressupor um único tempo. |
| Existência e quantidade | Contáveis e incontáveis, there is/are, some/any, much/many, quantidades e perguntas sobre disponibilidade. |
| Família | Parentes, conjunto dos familiares e vocabulário de parentesco. |
| Futuro em inglês | Planos, previsões, promessas e decisões, com will e be going to. |
| Passado simples | Formas regulares e irregulares, was/were, afirmações, negações e perguntas com referência ao passado. |
| Presente simples | Hábitos, concordância, terceira pessoa, formas verbais e negação com auxiliar. |
| Rotina diária | Verbos e expressões de atividades, horários, frequência e vocabulário do cotidiano. |
| Saudações e apresentações | Cumprimentos, despedidas, nomes, idade, origem, residência e diálogos de apresentação. |
| Verbo to be | Concordância com am/is/are, perguntas e respostas, inclusive como auxiliar de be going to. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-ingles-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 11 nomes; os conteúdos correspondentes mantêm os nomes do 6º ano. Classificação individual por mapa manual; somente `theme` foi acrescentado e todos os demais campos e a estrutura foram preservados exatamente.

A tarefa determina o tema: familiares no contexto não substituem **Presente simples** quando a escolha é concordância; reconhecer ações e expressões usa **Rotina diária**. Completar am/is/are usa **Verbo to be**, inclusive em B4/AV1, IDs 2, 5, 8 e 20, e B4/AV2, ID 14. Quando a escolha compara will e going to, mantém **Futuro em inglês**, sem antecipar a construção pretendida. **Existência e quantidade** não antecipa contável/incontável nem o quantificador específico; **Comparações em inglês** não fornece o grau ou a forma solicitada. **Descrições em inglês** cobre o vocabulário e sua organização nas frases, inclusive B2/AV1, ID 13.

B3/AV1, IDs 15 e 17, usa **Estruturas verbais**: os comandos anteriores não oferecem contexto suficiente para excluir formas do presente. Usar Passado simples como rótulo nesses itens induziria a escolha antes de corrigir o comando. Nas demais questões com referência ao passado, mantém-se o tema da unidade.

B1/AV1 tem dois temas; B1/AV2, três; B2/AV1 e B2/AV2 concentram um cada; B3/AV1, dois; B3/AV2 concentra um; B4/AV1, dois; B4/AV2 revisa sete. A quantidade acompanha os objetivos, sem subdivisões artificiais.

Sete divergências de letras, variantes e contextos insuficientes e lacunas com duplicação de verbos estão na [issue web #121](https://github.com/guilhermeborba/simulados-bernardo/issues/121), para revisão separada. Nenhum gabarito foi corrigido neste lote; a cobertura de temas não certifica os campos anteriores.

### Português — 7º ano

| Tema | Abrange |
|---|---|
| Coerência textual | Definição, lógica, contradições e construção de sentido no texto. |
| Coesão textual | Conectivos, relações de adição, oposição, causa e conclusão e ligação entre as partes do texto. |
| Concordância | Concordância verbal e nominal, sujeitos simples e compostos, expressões partitivas e revisão de frases. |
| Crônicas | Características, cotidiano, reflexão e humor em textos já identificados como crônicas. |
| Figuras de linguagem | Metáfora, comparação, personificação, hipérbole e seus efeitos expressivos, sem usar a figura pedida como rótulo. |
| Gêneros e tipos textuais | Definição, finalidades, reconhecimento e comparação de gêneros e tipos, incluindo cartas, bilhetes, receitas, bulas e anúncios. |
| Leitura e escrita | Síntese sobre os recursos da língua e seu papel na leitura, escrita e comunicação. |
| Modos verbais | Indicativo, subjuntivo e imperativo: reconhecimento, usos e diferenças. |
| Narrativas | Narrador, personagens, enredo, conflito, clímax, desfecho, tempo, espaço e características dos contos estudados. |
| Notícias | Finalidade informativa e características de textos já identificados como notícias. |
| Organização textual | Comparação entre coesão e coerência e análise da ligação e do sentido das ideias sem antecipar a categoria solicitada. |
| Pronomes | Funções, reconhecimento e emprego de pronomes pessoais, possessivos, demonstrativos e de tratamento. |
| Tempos verbais | Presente, pretérito e futuro: reconhecimento e localização das ações no tempo. |
| Textos de opinião | Ponto de vista, argumentos e finalidade de textos já identificados como opinativos ou argumentativos. |
| Verbos | Definição, conjugação, regularidade, infinitivo e sínteses que articulam tempo e modo. |

Lote E04: 240 questões em oito arquivos gerais `questoes-portugues-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 15 nomes; os conteúdos correspondentes reaproveitam os temas de Português dos anos anteriores. Crônicas e Textos de opinião individualizam gêneros já nomeados no enunciado; Organização textual permite tratar coesão e coerência juntas sem destacar qual delas é a resposta. Somente `theme` foi acrescentado; todos os campos anteriores e a estrutura foram preservados exatamente.

Gêneros e tipos textuais cobre os comandos que pedem identificar o gênero ou tipo: B1/AV1, IDs 6, 11, 15, 19, 22, 23, 25 e 27; B4/AV2, ID 21. A finalidade dos anúncios em B1/AV1, IDs 17 e 26, também usa esse tema amplo, sem antecipar a intenção persuasiva. Crônicas, Notícias, Narrativas e Textos de opinião detalham características de gêneros já informados no enunciado.

Narrativas, Pronomes, Figuras de linguagem e Concordância mantêm os tipos e subcategorias no mesmo agrupamento: o tema não revela primeira/terceira pessoa, protagonista/antagonista, a classe de pronome, a figura de linguagem nem concordância nominal/verbal. Verbos cobre conjugações e irregularidade; Tempos verbais localiza as ações; Modos verbais distingue os modos. A síntese de tempo e modo de B2/AV2, ID 30, fica em Verbos.

Coesão textual reúne os conectivos e seus sentidos, sem rotular a relação específica pedida. Coerência textual trata a definição e os problemas de sentido quando esse conceito já aparece no enunciado. Organização textual cobre a comparação dos dois conceitos e os comandos em que escrever Coesão/Coerência no tema anteciparia a resposta: B3/AV2, IDs 7, 15, 17–19 e 25–30. Leitura e escrita reúne a síntese de vários conteúdos em B4/AV2, IDs 28–30.

B1/AV1 agrupa cinco temas; B1/AV2, B2/AV1, B3/AV1 e B4/AV1 concentram um tema cada, respectivamente Narrativas, Pronomes, Figuras de linguagem e Concordância. B2/AV2 e B3/AV2 têm três temas cada. B4/AV2 revisa onze temas das unidades. Não se subdividem artificialmente os simulados concentrados em um assunto.

As pendências anteriores sobre análise de dela, coerência da frase do jogo sob chuva e exemplos de concordância estão na [issue web #109](https://github.com/guilhermeborba/simulados-bernardo/issues/109), com referências e critérios para revisão separada. Os campos anteriores foram preservados; a classificação temática não valida essas formulações.

### Matemática — 7º ano

| Tema | Abrange |
|---|---|
| Ângulos | Medidas, classificação, somas internas e externas, complementares, suplementares e relações entre paralelas e transversais. |
| Equações | Incógnita, igualdade, resolução e verificação de equações do primeiro grau e modelagem de problemas. |
| Figuras planas | Polígonos, número de lados, regularidade, convexidade e classificação de triângulos. |
| Frações | Numerador, denominador, equivalência, comparação, números mistos, operações, frações de quantidades e conversão para decimal. |
| MMC e MDC | Cálculo, fatoração, propriedades, encontros periódicos e divisão em grupos iguais. |
| Múltiplos e divisores | Divisibilidade, critérios, divisores, fatoração e classificação em primos e compostos sem antecipar o tipo pedido. |
| Números decimais | Leitura, operações e problemas com quantidades escritas na forma decimal. |
| Números inteiros | Positivos, negativos, zero, reta numérica, módulo, opostos, comparação, propriedades e operações em situações do cotidiano. |
| Plano cartesiano | Eixos, origem, pares ordenados, quadrantes, alinhamentos, localização e aplicações de coordenadas. |
| Porcentagem | Partes por cem, equivalências, porcentagens de quantidades, descontos e aumentos. |
| Razão e proporção | Comparação entre quantidades, igualdade de razões, escalas, proporcionalidade direta e regra de três. |
| Sistema monetário | Gastos e partilhas de valores positivos em reais e centavos. |

Lote E04: 240 questões em oito arquivos gerais `questoes-matematica-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 12 nomes; os conteúdos correspondentes reaproveitam os temas de Matemática dos anos anteriores. Números inteiros, Razão e proporção, Equações e Plano cartesiano agrupam os conteúdos introduzidos neste ano. Somente `theme` foi acrescentado; todos os campos anteriores e a estrutura foram preservados exatamente.

Números inteiros mantém juntas comparação, módulo, opostos e operações com sinais, inclusive temperaturas, elevadores, pontuações e saldos. Não se divide esse estudo entre os nomes das operações. Múltiplos e divisores cobre reconhecimento e classificação em primos e compostos sem antecipar qual deles é a resposta. MMC e MDC reúne cálculo, propriedades e aplicações de ambos, sem escolher no rótulo o método necessário ao problema.

Frações inclui conversão para decimal e comparação entre representações. Números decimais trata leitura e operações entre decimais mesmo em problemas de comprimento ou distância. Os gastos e partilhas em reais e centavos de B2/AV1, IDs 23, 27 e 28, usam Sistema monetário. Saldos com sinais de B1/AV1 ficam em Números inteiros. Porcentagem mantém descontos e aumentos, inclusive o preço final em B2/AV2, ID 12. Razão e proporção cobre escala e preço unitário quando o foco é a relação proporcional.

Equações agrupa todo o B3/AV1, inclusive a medida do lado do quadrado no ID 15 e os problemas de dinheiro: nesses casos, o foco é montar e resolver a igualdade. Plano cartesiano agrupa todo o B3/AV2, incluindo a analogia com coordenadas geográficas e tabuleiros; não se usam os nomes de eixos ou quadrantes pedidos como tema. Figuras planas mantém os tipos de polígonos e triângulos no mesmo agrupamento. Ângulos trata suas medidas, classificações e relações, sem revelar o tipo de ângulo solicitado.

A quantidade de temas acompanha o conteúdo: B1/AV1, B3/AV1 e B3/AV2 concentram um tema cada; B1/AV2, B2/AV2 e B4/AV1 têm dois; B2/AV1 tem três; B4/AV2 revisa nove temas das unidades. Não se subdividem artificialmente os simulados concentrados em um assunto.

As pendências anteriores de alternativas equivalentes em frações, generalizações em dicas/curiosidades e referência a São Joaquim estão na [issue web #111](https://github.com/guilhermeborba/simulados-bernardo/issues/111), com demonstrações e referências para revisão separada. Os campos anteriores foram preservados; a classificação temática não valida essas formulações.

### Ciências — 7º ano

| Tema | Abrange |
|---|---|
| Água na natureza | Distribuição, reservatórios, hidrosfera já nomeada, oceanos, águas subterrâneas e identificação do ciclo hidrológico. |
| Atmosfera | Composição, camadas, ozônio, proteção da vida, efeito estufa e sua intensificação. |
| Biomas | Características e comparação dos biomas citados nos exemplos de biodiversidade e solo. |
| Cadeias alimentares | Produtores, consumidores, decompositores, níveis tróficos, teias e fluxo de energia. |
| Ciclo da água | Etapas, circulação da água, energia solar, transpiração e efeitos do desmatamento sobre as chuvas. |
| Conservação do solo | Erosão, compactação, assoreamento, cobertura vegetal, calagem e práticas de proteção e recuperação. |
| Ecossistemas | Fatores bióticos e abióticos, habitats, nichos, biodiversidade, serviços ecossistêmicos e capacidade de suporte. |
| Estados físicos | Estados da água e composição física das nuvens. |
| Planeta Terra | Esferas terrestres e camadas internas, sem antecipar o nome da esfera solicitada. |
| Preservação ambiental | Poluição, contaminação, desmatamento, áreas protegidas, espécies invasoras e extinção. |
| Propriedades dos gases | Pressão atmosférica, altitude, circulação do ar e formação dos ventos. |
| Propriedades dos materiais | Propriedades da água, como solvente, tensão superficial, densidade e turbidez, e identificação de fenômenos envolvendo gases. |
| Relações ecológicas | Mutualismo, parasitismo, predatismo, comensalismo e amensalismo, sem nomear no rótulo a relação pedida. |
| Resíduos e reciclagem | Coleta seletiva, reciclagem e compostagem de matéria orgânica. |
| Saúde e bem-estar | Tratamento e qualidade da água, saneamento, fluoretação e prevenção de doenças. |
| Seres vivos | Fotossíntese, respiração e trocas gasosas nos exemplos estudados. |
| Solo | Formação, intemperismo, horizontes, composição, textura, cor, fertilidade e propriedades. |
| Sustentabilidade | Consumo, economia e reuso da água, gestão de recursos hídricos e práticas ambientais duradouras. |
| Temperatura e calor | Aquecimento, densidade do ar e influência da temperatura nas propriedades da água. |
| Tempo e clima | Umidade, nuvens, precipitação, orvalho, previsão meteorológica, clima e efeitos urbanos. |
| Transformações da matéria | Mudanças de estado físico, temperaturas de fusão/ebulição e expansão da água ao congelar. |
| Vida no solo | Organismos do solo, decomposição e papel de fungos, bactérias e minhocas. |

Lote E04: 240 questões em oito arquivos gerais `questoes-ciencias-7ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 22 nomes, reaproveitando os temas de Ciências dos anos anteriores quando o conteúdo corresponde. Planeta Terra, Atmosfera, Propriedades dos gases, Tempo e clima e Relações ecológicas detalham conteúdos deste ano. Somente `theme` foi acrescentado; todos os campos anteriores e a estrutura foram preservados exatamente.

Planeta Terra cobre a identificação da atmosfera em B1/AV1, IDs 1 e 30, e B4/AV2, ID 2, da hidrosfera em B2/AV1, ID 1, e das camadas internas em B4/AV2, ID 1. Atmosfera detalha composição, camadas, ozônio e efeito estufa sem usar o nome da camada ou do fenômeno que pode ser a resposta. Propriedades dos gases cobre pressão, altitude e ventos. B1/AV1, ID 22, pede reconhecer o campo de estudo do fenômeno e usa Propriedades dos materiais para não antecipar Pressão dos gases. Temperatura e calor cobre o ar aquecido e a relação entre temperatura e oxigênio dissolvido em B2/AV2, ID 28.

Tempo e clima reúne os tipos de precipitação, nuvens, umidade e a comparação entre tempo meteorológico e clima; não usa como rótulo o fenômeno solicitado. As transformações isoladas de B1/AV2, IDs 2, 3, 21 e 22, usam Transformações da matéria; as etapas explicitamente articuladas ao ciclo usam Ciclo da água. Quando o aluno precisa dar o nome do ciclo inteiro, B1/AV2, ID 25, e B2/AV1, ID 10, usam Água na natureza para não antecipar a resposta.

Água na natureza também reúne reservatórios e disponibilidade; Estados físicos cobre os estados da água e a composição das nuvens. Propriedades dos materiais reúne solvente, densidade, tensão superficial e turbidez, sem usar a propriedade pedida como rótulo específico. Saúde e bem-estar agrupa tratamento, saneamento, qualidade e doenças, sem antecipar a etapa de tratamento. Preservação ambiental cobre impactos e contaminação; Sustentabilidade, consumo, reuso e gestão. A coleta seletiva e a compostagem reaproveitam Resíduos e reciclagem.

Solo reúne formação, textura, horizontes e fertilidade; Vida no solo, organismos e decomposição; Conservação do solo, práticas e processos de degradação/recuperação. B3/AV1, ID 30, pede identificar a própria conservação e usa Solo para não antecipar a resposta. Biomas cobre as comparações de florestas e outros ambientes. Ecossistemas agrupa fatores, nicho, diversidade e capacidade de suporte; Cadeias alimentares, papéis tróficos e energia; Relações ecológicas, interações sem nomear o tipo solicitado. Seres vivos reúne fotossíntese, respiração e trocas gasosas, inclusive a identificação do processo em B4/AV2, ID 28.

Os simulados têm, na ordem B1/AV1 a B4/AV2, sete, seis, nove, sete, cinco, quatro, cinco e doze temas. B2/AV1 articula disponibilidade, estados, propriedades, transformações e uso da água, mantendo nove agrupamentos. B4/AV2 revisa doze temas das unidades. A quantidade de rótulos acompanha o conteúdo, sem criar um nome para cada questão.

As pendências anteriores sobre pressão, formação da neve, ciclo da água, percentuais, dados de saúde e horizontes do solo estão na [issue web #113](https://github.com/guilhermeborba/simulados-bernardo/issues/113), com referências e critérios para revisão separada. O conteúdo anterior foi preservado; a classificação temática não valida cientificamente essas formulações nem os dados quantitativos sem fonte/ano.

### Português — 8º ano

| Tema | Abrange |
|---|---|
| Análise sintática | Núcleo e tipos de sujeito e identificação de funções na oração. |
| Concordância | Relações entre sujeito e verbo e entre substantivos, artigos e adjetivos, incluindo coletivos, partitivos e estruturas passivas. |
| Conjunções | Reconhecimento, valores e funções dos conectores e relações de adição, oposição, alternativa, conclusão e explicação. |
| Crônicas | Características, cotidiano, reflexão e humor em textos já identificados como crônicas. |
| Figuras de linguagem | Comparação, metáfora, personificação, hipérbole, onomatopeia, antítese, eufemismo, ironia e metonímia. |
| Formas de discurso | Discurso direto, indireto e indireto livre, transposição, falas, vozes, referências e efeitos narrativos. |
| Gêneros e tipos textuais | Definição, funções, características, comparação e reconhecimento de gêneros, incluindo cartas, bilhetes e receitas. |
| Histórias em quadrinhos | Definição, sequência de imagens, balões, diálogos e articulação entre texto e imagem quando o gênero já é fornecido. |
| Leitura e escrita | Sínteses dos recursos e conceitos da língua, suas finalidades e reconhecimento sem antecipar a categoria pedida. |
| Narrativas | Características dos contos e função do narrador em textos já identificados como narrativas. |
| Notícias | Características e finalidade informativa quando o gênero já é dado pelo comando. |
| Período composto | Orações, relações de coordenação e subordinação e articulação das estruturas, sem fornecer a relação solicitada. |
| Poesia | Características, versos, estrofes e musicalidade em textos já identificados como poemas. |
| Pontuação | Marcação de falas e emprego da vírgula com conectores. |
| Textos de opinião | Defesa de pontos de vista, argumentos e circulação dos artigos de opinião já nomeados no enunciado. |
| Variação linguística | Diversidade regional, social, histórica e situacional, gírias, jargões, registros, norma padrão, adequação e preconceito. |
| Verbos | Impessoalidade e ausência de sujeito nos exemplos de haver e fenômenos naturais. |
| Vozes verbais | Voz ativa, passiva analítica e sintética, sujeito, agente, transposição e efeitos de ênfase. |

Lote E04: **240 questões em oito simulados gerais**, nos arquivos `questoes-portugues-8ano-b*-av*.ts`, sem entradas privadas adicionais. Vocabulário fechado de 18 nomes, reaproveitando os nomes dos anos anteriores quando o objetivo corresponde. Classificação individual por mapa manual; somente `theme` foi acrescentado e todos os demais campos e a estrutura foram preservados exatamente.

**Gêneros e tipos textuais** cobre o reconhecimento de gêneros sem fornecer notícia, crônica, carta, bilhete, receita, poema ou HQ como rótulo. Os temas específicos só aparecem quando o gênero já está dado. **Figuras de linguagem** não antecipa a figura pedida. **Leitura e escrita** reúne sínteses e os comandos que pedem reconhecer a própria categoria: B1/AV1, ID 30 (gênero textual); B1/AV2, ID 30 (figuras de linguagem); B2/AV2, ID 30 (concordância); B4/AV2, IDs 28–30. O tema não fornece o nome que completa a frase.

**Variação linguística** mantém juntos os registros e tipos de variação e não antecipa informalidade, regionalismo, jargão ou preconceito. **Análise sintática** cobre sujeito simples/composto em B2/AV2, IDs 5–6, e o sujeito paciente em B3/AV2, ID 10. As questões sobre impessoalidade em B2/AV2, IDs 12, 14 e 23, usam **Verbos**; as perguntas sobre por que haver não varia e sobre concordância nas passivas mantêm **Concordância**. B3/AV2, IDs 15 e 28, têm como tarefa a concordância, mesmo no contexto de vozes verbais.

**Formas de discurso** não antecipa direto, indireto ou indireto livre; **Vozes verbais** não fornece ativa ou passiva. **Período composto** mantém em aberto a relação de coordenação/subordinação; **Conjunções** não fornece a classe ou o sentido do conector pedido. A pontuação constitui um objetivo próprio nos itens correspondentes.

Distribuição: B1/AV1 tem oito temas; B1/AV2, dois; B2/AV1 concentra um; B2/AV2, quatro; B3/AV1, dois; B3/AV2 e B4/AV1, três cada; B4/AV2 revisa oito. Não se subdividem artificialmente as unidades concentradas.

Os exemplos anteriores de antítese/ironia e as relações entre orações estão na [issue web #122](https://github.com/guilhermeborba/simulados-bernardo/issues/122), para revisão separada. A classificação não valida os exemplos nem modifica seus gabaritos.

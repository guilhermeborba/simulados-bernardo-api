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

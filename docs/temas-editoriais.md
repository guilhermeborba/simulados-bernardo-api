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

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

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

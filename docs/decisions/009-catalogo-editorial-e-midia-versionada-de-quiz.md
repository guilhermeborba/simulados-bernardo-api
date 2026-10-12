# ADR 009 — Catálogo editorial e mídia versionada de quiz

Data: 2026-10-12. Status: implementado tecnicamente no lote 05; revisão editorial e publicação do catálogo pendentes.

## Contexto

Quizzes precisam cobrir todos os públicos desde o lançamento e oferecer instruções visuais e sonoras para o Infantil. Reimportar conteúdo ou trocar um arquivo de imagem não pode alterar uma tentativa iniciada. A importação também precisa preservar os simulados, as versões publicadas e as restrições de turma.

## Catálogo e revisão

`prisma/quiz-data/` contém 45 quizzes originais com 213 questões, três quizzes em cada uma das 15 faixas. Todas as entradas começam com revisão `PENDING`, sem atribuir uma aprovação humana. A matriz registra temas, públicos e revisão a definir; validação automatizada não equivale a revisão pedagógica ou técnica.

`quiz-catalog.ts` valida estritamente metadados, disciplinas existentes, faixa, chaves, alternativas, gabarito único, explicação, pontos, mídia e cobertura inicial. `seed-quizzes.ts` oferece dry-run e inventário sem criar PrismaClient ou conectar ao banco. O inventário contém contagens, identidades, status editorial e hash, sem perguntas, alternativas, transcrições ou gabaritos.

A importação exige um ADMIN ativo existente em `QUIZ_SEED_AUTHOR_EMAIL` e cria rascunhos por padrão. Publicação pelo importador é uma opção explícita: todas as entradas fornecidas precisam ter revisão `APPROVED`, responsável, data ISO e hash correspondente ao conteúdo normalizado, incluindo os digests dos assets. Mudar o conteúdo invalida a aprovação. Esse controle protege o caminho de importação; a publicação administrativa da API continua sendo uma ação ADMIN explícita com validação de conteúdo, sem presumir que o arquivo editorial foi revisado.

## Imutabilidade e atomicidade

A identidade é `activityKey` + `contentVersion`; `originKey` conserva a identidade pedagógica da pergunta. Reimportar a mesma versão exige conteúdo idêntico e preserva IDs, datas, snapshots e respostas. Divergência da mesma versão falha e exige nova versão consecutiva. Arquivados e excluídos não são reativados pela importação.

O lote inteiro usa uma transação. O importador valida as referências e o plano completo antes da primeira gravação. Bloqueia linhas existentes de quiz em ordem determinística antes dos advisory locks por chave lógica, conservando a ordem usada pela criação de versões da API. Revalida o conjunto após adquirir as travas e repete a transação quando uma versão apareceu durante a aquisição ou ocorreu conflito transacional. Autor, disciplina e turma são verificados sob locks compartilhados na mesma conexão.

A criação inclui questões, alternativas, gabaritos e publicação opcional atomicamente. Uma falha reverte o lote. O seed de simulados continua separado; colisão com um slug existente não converte um simulado em quiz.

## Mídia e armazenamento

Assets instrucionais desta entrega ficam empacotados com a API: SVG estático e WAV PCM. `manifest.json` registra ID, tipo, arquivo, MIME, tamanho e SHA-256. O DTO aceita somente ID registrado e descrição/transcrição obrigatória. Não aceita URL, caminho arbitrário, script, upload ou arquivo não validado. O registro limita tamanho, valida formatos e recusa links simbólicos. O build Nest copia o diretório para `dist/src/modules/quizzes/media/assets`.

Ao salvar, o servidor fixa ID e digest. Publicação e início validam disponibilidade; o início copia também a mídia para o snapshot privado. Revisar uma imagem ou gravação exige novo ID/arquivo e nova versão do quiz se já publicado. Assets antigos continuam no pacote enquanto forem referenciados por tentativas; a regeneração do manifest recusa alteração de qualquer ID já registrado.

As 18 ilustrações atuais foram desenhadas como SVGs originais. As 18 narrações de instruções em português foram geradas localmente com a voz Microsoft Maria Desktop e têm transcrição textual. A reprodução futura depende somente dos arquivos empacotados, sem serviço de síntese em produção. A qualidade e adequação do conjunto ainda dependem da revisão humana.

## Projeção pública e autorização

Questões e resultados expõem somente `media.image.{url,alt}` e `media.audio.{url,transcript}`. As URLs são relativas à tentativa e à pergunta. Não expõem caminhos de disco, IDs do registro, digests ou gabaritos. A mídia apresenta o enunciado antes da confirmação; explicação e curiosidade continuam restritas ao feedback confirmado.

`GET /attempts/:attemptId/questions/:questionId/media/:kind` exige JWT e dono STUDENT ou ADMIN. Verifica snapshot e acesso atual ao quiz, disciplina e turma antes de ler os bytes ou avaliar Range. Recebe o digest privado do snapshot e recusa arquivo ausente ou divergente. Respostas usam MIME controlado, `nosniff`, CSP restritiva e `Cache-Control: private, no-store`. Áudio e imagem aceitam um intervalo HTTP válido, com 206; intervalo inválido retorna 416 depois da autorização.

Alt e transcrição são lidos do snapshot sem consultar os arquivos. Falha de entrega dos bytes não impede ler o texto, confirmar respostas ou concluir. Dados JSON malformados são recusados com erro genérico, sem devolver o conteúdo privado.

Os arquivos empacotados são instruções genéricas sem dados de crianças, pacientes ou escolas. A autorização da rota controla acesso pela API e pela tentativa; ela não torna arquivos versionados no Git confidenciais. Upload e armazenamento de arquivos privados de professores/turmas não foram implementados; conteúdo que exija sigilo de arquivo precisa de armazenamento privado próprio antes de ser oferecido. O BFF binário, a apresentação de fallback, reprodução opcional e validação em navegador/aparelho ficam no lote 06.

## Verificação

Testes unitários verificam validação, revisão vinculada ao hash, IDs/digests, DTOs e formatos de arquivo. Testes reais Nest/PostgreSQL cobrem importação integral e repetida, rollback, versões e importações concorrentes, preservação de tentativas, mídia do snapshot, revogação de acesso, Range e falha de arquivo sem impedir confirmação/conclusão. A regressão existente de simulados continua passando. Nenhum catálogo foi importado em banco existente ou publicado em produção.

Contratos e operação: [guia de quizzes](../guia-quizzes.md). Conteúdo para revisão: [matriz editorial](../matriz-editorial-quizzes.md). Continuidade: [ADR 007](007-quizzes-versionados-e-snapshots-privados.md) e [ADR 008](008-confirmacao-e-resultado-idempotente-de-quiz.md).

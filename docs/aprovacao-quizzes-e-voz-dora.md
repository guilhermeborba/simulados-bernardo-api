# Aprovação editorial e narração Dora

Em **14/10/2026**, o responsável declarou no chat: “sobre os quizzes eu testei e
estao aprovados”. A declaração foi aplicada ao catálogo preparado de **45 quizzes /
213 perguntas**. Os registros JSON passam a APPROVED, com identificação do
responsável, data da declaração e hash determinístico do conteúdo normalizado.
Isto registra a revisão declarada pelo usuário, não uma revisão pedagógica feita
pelo agente. Habilidades/classificações e missões mantêm revisão separada PENDING.

Na mesma conversa, foi escolhida a voz feminina brasileira Dora, leitura
acolhedora, com velocidade reduzida. Perfil técnico versionado em
`scripts/quiz-voice-profile.json`: `pf_dora`, pt-br, speed 0.86, pausa entre frases
0.32 s, pausa entre orações 0.1 s. A amostra aceita era a versão 03 mais lenta.

## Aplicação

Os 18 áudios da Educação Infantil recebem IDs novos com sufixo `.dora-v2`.
A transcrição de cada pergunta é preservada exatamente: as frases adicionais
usadas nas amostras de comparação não são adicionadas às questões. Os seis quizzes
com mídia passam à versão 2 para evitar divergência com versões já importadas.
Versões antigas e seus arquivos permanecem disponíveis para snapshots existentes.

A aprovação do perfil de voz não é um registro de escuta individual dos 18 novos
arquivos. Conferência técnica valida estrutura e limites; observar pronúncia e
clareza nas próximas sessões de uso. A autorização editorial do conteúdo vem da
declaração do responsável acima.

## Reproduzir a autoria

O modelo é uma ferramenta de autoria, fora do runtime da API/web/mobile.
Instale `scripts/requirements-quiz-voice.txt` em ambiente Python separado e
forneça os modelos do release registrado no perfil. Os hashes são verificados
antes de gerar arquivos. Para uma nova gravação, use IDs novos: o gerador recusa
sobrescrever assets existentes ou registrados.

```bash
python scripts/generate-quiz-audio-kokoro.py --model /caminho/kokoro-v1.0.onnx --voices /caminho/voices-v1.0.bin
python scripts/build-quiz-media-manifest.py
npm run seed:quizzes:dry-run
```

O gerador entrega WAV mono PCM16/16 kHz, com reamostragem anti-alias a partir de
24 kHz, conforme o contrato existente. Nenhuma chave ou serviço pago é necessário
para a síntese local. Fonte e licenças: [motor ONNX](https://github.com/thewh1teagle/kokoro-onnx)
e [modelo/vozes Kokoro](https://huggingface.co/hexgrad/Kokoro-82M).

Aprovação de JSON não executa deploy ou publicação em produção. A prévia local
pode importar e publicar o catálogo aprovado pelo fluxo de seed; em outro ambiente,
é necessário usar o processo operacional de publicação já existente.

O usuário também definiu um [redesign completo para web/mobile](superpowers/plans/2026-10-14-design-system-web-mobile.md).
Essa decisão futura não altera o layout nesta entrega.

## Instalação e atualização do catálogo

O seed instala a versão atual como baseline para atividades sem qualquer versão no banco (`bootstrapLatestVersions`). Assim, um banco novo recebe diretamente os seis quizzes Infantil v2 e os outros 39 v1. Não são criadas versões históricas fictícias. O importador exige esse modo explicitamente; por padrão, começa na v1. Para atividades já existentes, continuam obrigatórias versões consecutivas, conteúdo imutável e importação transacional. Arquivos antigos de áudio continuam disponíveis para tentativas e versões anteriores.

## Validação desta entrega

- 688 testes unitários (39 suítes) e 396 testes Nest/PostgreSQL (21 suítes) passaram; lint e build passaram.
- Integração cobre bootstrap explícito da versão atual, rejeição de saltos posteriores, imutabilidade e rollback do lote.
- 45 quizzes/213 questões aprovados no dry-run; textos, alternativas e gabaritos comparados com a base e preservados.
- 18 novos WAVs PCM16 mono/16 kHz conferidos; os 58 registros anteriores do manifest foram preservados.
- Banco de integração descartável removido pelo runner; nenhuma publicação em produção.
- Prévia descartável validada com 588 simulados/17.684 questões e 45 quizzes publicados. Login local, imagem Infantil e botão de narração exercitados no emulador Android; o AudioTrack do processo do app iniciou e encerrou reprodução em 16 kHz sem mensagem de erro de mídia. O WAV servido por HTTP conferiu com o hash de um asset `.dora-v2`. Isso confirma funcionamento técnico, não escuta humana de todos os arquivos nem teste físico.

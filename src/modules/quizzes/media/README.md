# Mídia instrucional de quizzes

`assets/manifest.json` registra SVGs e WAVs genéricos do Infantil, sem dados pessoais. A API entrega bytes somente pela rota autenticada da tentativa; o Git contém os arquivos originais e não é armazenamento confidencial de uploads.

- Ilustrações: SVGs originais produzidos por `scripts/generate-quiz-images.py`, com formas estáticas, descrições e cenas do catálogo.
- Áudio atual: Dora feminina pt-BR, perfil acolhedor aprovado pelo usuário, speed 0.86 e pausas 0.32/0.1 s. Autoria offline por `scripts/generate-quiz-audio-kokoro.py`; WAV mono PCM16/16 kHz com transcrição original. Microsoft Maria/System.Speech permanece apenas nas gravações anteriores.
- Registro: `scripts/build-quiz-media-manifest.py` calcula digests/tamanhos e preserva todas as versões existentes. IDs registrados são imutáveis.

O catálogo usa 18 imagens atuais e 18 áudios. O manifest mantém 22 SVGs anteriores e os 18 WAVs Maria anteriores para preservar referências; há 76 assets registrados (40 SVGs e 36 WAVs). Uma revisão exige ID novo, novo registro e, para quiz publicado, nova versão editorial. A síntese local é necessária somente na autoria (Python + modelo; veja `scripts/requirements-quiz-voice.txt`); build e entrega funcionam no Linux com os arquivos já presentes.

O responsável aprovou o conteúdo dos quizzes e o perfil de voz em 14/10/2026. A aprovação não declara escuta individual de cada novo arquivo; observar pronúncia nas próximas sessões de uso. Instruções de revisão e importação no [guia](../../../../docs/guia-quizzes.md); prévia na [matriz](../../../../docs/matriz-editorial-quizzes.md).

# Mídia instrucional de quizzes

`assets/manifest.json` registra SVGs e WAVs genéricos do Infantil, sem dados pessoais. A API entrega bytes somente pela rota autenticada da tentativa; o Git contém os arquivos originais e não é armazenamento confidencial de uploads.

- Ilustrações: SVGs originais produzidos por `scripts/generate-quiz-images.py`, com formas estáticas, descrições e cenas do catálogo.
- Áudio: narração pt-BR local com System.Speech/Microsoft Maria Desktop, gerada por `scripts/generate-quiz-audio.ps1`; WAV mono PCM 16 bits/16 kHz, enunciado e alternativas com transcrição no catálogo.
- Registro: `scripts/build-quiz-media-manifest.py` calcula digests/tamanhos e preserva todas as versões existentes. IDs registrados são imutáveis.

O catálogo usa 18 imagens atuais e 18 áudios. O manifest mantém também 22 SVGs anteriores para preservar referências; há 58 assets registrados. Uma revisão exige ID novo, novo registro e, para quiz publicado, nova versão editorial. A síntese de áudio só é necessária na autoria em Windows; build e entrega funcionam no Linux com os arquivos já presentes.

Revisão de cores, quantidades, cenas, pronúncia, transcrição e adequação infantil está pendente. Instruções de revisão e importação no [guia](../../../../docs/guia-quizzes.md); prévia na [matriz](../../../../docs/matriz-editorial-quizzes.md).

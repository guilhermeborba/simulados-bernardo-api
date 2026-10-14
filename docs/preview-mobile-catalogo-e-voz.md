# Catálogo local do mobile e comparação de narração

O teste de protocolo usa fixtures sintéticas. Para explorar o conteúdo do projeto,
`npm run preview:mobile:catalog` cria outro PostgreSQL descartável, importa o seed
oficial do checkout e inicia a API em loopback na porta 3336. Requer dependências,
Prisma gerado, build da API, Docker ativo e imagem `postgres:16-alpine` disponível.

O runner não aceita DATABASE_URL externa: gera container, credencial e endereço
próprios. `MOBILE_CATALOG_PORT` escolhe a porta da API; no WSL,
`MOBILE_PREVIEW_DOCKER_BINARY` pode apontar para o docker.exe do Windows. As contas
locais e senhas aleatórias ficam somente no arquivo temporário 0600 cujo caminho
é mostrado. Ctrl+C encerra a API e remove container e credenciais temporárias.

`npm run preview:mobile:catalog -- --check` verifica login, acesso aos simulados,
ausência de quizzes não revisados no catálogo do aluno e limpeza dos recursos.
Use outra porta quando uma prévia interativa já estiver rodando.

## Conteúdo

Os simulados importados são os arquivos e registros oficiais do repositório, não
uma consulta ao banco de produção. O seed preserva as regras de publicação e de
turma. Um aluno local com faixa 3 é vinculado apenas à turma Bernardo desta base.
Os 45 quizzes editoriais entram como DRAFT, sem aprovação ou publicação presumida.
Por isso o catálogo de quizzes do aluno permanece vazio até a revisão autorizada.
Habilidades e missões não são publicadas automaticamente.

No mobile, configure EXPO_PUBLIC_API_URL=http://127.0.0.1:3336 e
EXPO_PUBLIC_WEB_ORIGIN=http://127.0.0.1:3000 antes de reiniciar Metro. Encaminhe
3336, 3000 e 8081 com `adb reverse` no ADB que detecta o emulador. A aplicação web
local usa BACKEND_API_URL=http://127.0.0.1:3336. Os simulados abrem na web; o
protótipo ainda não tem seu runner nativo, e o navegador exige login próprio.

## Comparar a voz

A narração registrada usa Microsoft Maria Desktop/System.Speech, WAV PCM16 mono
16 kHz. O player mobile reproduz esse arquivo; mudar apenas o app não troca a voz.
A amostra candidata usa Piper 1.8.0 e o modelo pt_BR-faber-medium, processados
localmente. O modelo tem taxa nativa 22050 Hz; os WAVs de comparação mantêm essa
taxa, aceita pelo adaptador mobile. Não são substitutos registrados no manifest.

Fonte do modelo: [repositório da voz](https://huggingface.co/rhasspy/piper-voices/tree/c10ece1aade47bb51c153c893d14e5bf8e5b7117/pt/pt_BR/faber/medium).
O MODEL_CARD declara dataset CC0. O motor é uma ferramenta de autoria GPL-3.0,
executada fora da aplicação; não foi incluído no app ou nas dependências Node.
[CLI oficial](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md).

Em um ambiente Python separado, instale piper-tts==1.8.0 e disponibilize o modelo
ONNX com seu .onnx.json adjacente. Gere uma comparação com:

```bash
python scripts/preview-quiz-voice.py --model /caminho/pt_BR-faber-medium.onnx --output-dir .local-preview/voz
```

O script copia a voz atual e sintetiza o mesmo texto em ritmo normal e pausado,
sem rede, sem sobrescrever arquivos e sem alterar assets registrados. Metadados
incluem versão do motor, hash do modelo, transcrição e parâmetros. As prévias ficam
fora do Git. Avaliar pronúncia, ritmo e clareza antes de escolher; o script não
marca a amostra como aprovada. Depois da escolha, criar IDs novos, adequar ao
formato de entrega e versionar referências preservando snapshots existentes.

param([string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$quizRows = Get-Content -Raw -Encoding UTF8 (Join-Path $RepositoryRoot 'prisma/quiz-data/infantil.json') | ConvertFrom-Json
$quizAssets = Join-Path $RepositoryRoot 'src/modules/quizzes/media/assets'
New-Item -ItemType Directory -Force -Path $quizAssets | Out-Null
$quizSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $quizSynth.SelectVoice('Microsoft Maria Desktop')
  $quizSynth.Rate = -1
  $quizFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  $quizCount = 0
  foreach ($quiz in $quizRows) {
    foreach ($question in $quiz.questions) {
      $quizTarget = Join-Path $quizAssets ($question.media.audio.assetId + '.wav')
      if (Test-Path $quizTarget) { throw "Asset already exists; use a new ID for a new recording: $($question.media.audio.assetId)" }
      $quizSynth.SetOutputToWaveFile($quizTarget, $quizFormat)
      $quizSynth.Speak($question.media.audio.transcript)
      $quizSynth.SetOutputToNull()
      $quizCount += 1
    }
  }
  Write-Output "Generated $quizCount Portuguese instruction audio files."
} finally { $quizSynth.Dispose() }

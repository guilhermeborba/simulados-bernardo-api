"""Generate local narration comparisons without changing registered quiz assets."""
import argparse
import hashlib
import importlib.metadata
import json
import shutil
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    model = args.model.resolve(strict=True)
    model_config = Path(str(model) + '.json')
    if not model_config.is_file():
        parser.error('The model requires its adjacent .onnx.json configuration.')
    output = args.output_dir.resolve()
    assets = ROOT / 'src/modules/quizzes/media/assets'
    if output == assets or assets in output.parents:
        parser.error('Preview output must not modify registered assets.')
    output.mkdir(parents=True, exist_ok=False)
    question = json.loads((ROOT / 'prisma/quiz-data/infantil.json').read_text())[0]['questions'][0]
    media = question['media']['audio']
    transcript = media['transcript']
    original = assets / (media['assetId'] + '.wav')
    shutil.copyfile(original, output / '01-voz-atual.wav')
    (output / 'transcript.txt').write_text(transcript + '\n')
    samples = []
    for file, pace, silence in [('02-neural-normal.wav', 1.0, 0.25), ('03-neural-pausada.wav', 1.12, 0.45)]:
        subprocess.run([sys.executable, '-m', 'piper', '-m', str(model),
                        '-f', str(output / file), '--length-scale', str(pace),
                        '--sentence-silence', str(silence), '--', transcript], check=True)
        with wave.open(str(output / file)) as audio:
            if audio.getnchannels() != 1 or audio.getsampwidth() != 2:
                raise ValueError('Expected mono PCM16 for the mobile comparison.')
            samples.append({'file': file, 'lengthScale': pace, 'sentenceSilence': silence,
                            'sampleRate': audio.getframerate(), 'durationSeconds': audio.getnframes() / audio.getframerate()})
    (output / 'comparison.json').write_text(json.dumps({
        'engine': 'piper-tts', 'engineVersion': importlib.metadata.version('piper-tts'),
        'model': model.name, 'modelSha256': hashlib.sha256(model.read_bytes()).hexdigest(),
        'originalAssetId': media['assetId'], 'transcript': transcript,
        'samples': samples, 'status': 'AWAITING_LISTENING_REVIEW',
    }, ensure_ascii=False, indent=2) + '\n')
    print('Narration comparison ready:', output)


if __name__ == '__main__':
    main()

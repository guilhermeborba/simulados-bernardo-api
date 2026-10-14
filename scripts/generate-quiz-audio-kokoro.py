"""Author approved Dora recordings using immutable, versioned asset IDs."""
import argparse
import hashlib
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUFFIX = '.dora-v2'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', type=Path, required=True)
    parser.add_argument('--voices', type=Path, required=True)
    args = parser.parse_args()
    profile = json.loads((ROOT/'scripts/quiz-voice-profile.json').read_text())
    for file, key in [(args.model, 'modelSha256'), (args.voices, 'voicesSha256')]:
        if hashlib.sha256(file.read_bytes()).hexdigest() != profile[key]:
            parser.error('Model digest differs from the approved voice profile.')
    quizzes = json.loads((ROOT/'prisma/quiz-data/infantil.json').read_text())
    assets = ROOT/'src/modules/quizzes/media/assets'
    previous = {entry['id'] for entry in json.loads((assets/'manifest.json').read_text())}
    jobs = []
    for quiz in quizzes:
        for question in quiz['questions']:
            audio = question['media']['audio']
            asset = audio['assetId']
            target = asset if asset.endswith(SUFFIX) else asset + SUFFIX
            output = assets/(target + '.wav')
            if target in previous or output.exists():
                parser.error('Recording already exists; immutable assets require a new ID.')
            jobs.append((output, audio['transcript']))
    # Dependencies are authoring-only; the API and mobile never load this model.
    import numpy as np
    from scipy.signal import resample_poly
    from kokoro_onnx import Kokoro
    engine = Kokoro(str(args.model), str(args.voices))
    for index, (output, transcript) in enumerate(jobs, 1):
        audio, rate = engine.create(transcript, voice=profile['voice'], lang=profile['locale'],
                                   speed=profile['speed'], sentence_pause=profile['sentencePause'],
                                   clause_pause=profile['clausePause'])
        if rate != 24000 or not len(audio) or not np.isfinite(audio).all():
            raise ValueError('Invalid generated audio.')
        audio = resample_poly(audio, 2, 3)  # Anti-aliased conversion from 24 kHz to the 16 kHz delivery contract.
        pcm = (np.clip(audio, -1, 1)*32767).astype('<i2')
        if len(pcm)*2+44 > 4*1024*1024:
            raise ValueError('Recording exceeds the mobile audio limit.')
        with output.open('xb') as stream, wave.open(stream, 'wb') as file:
            file.setnchannels(1)
            file.setsampwidth(2)
            file.setframerate(profile['sampleRate'])
            file.writeframes(pcm.tobytes())
        print(f'Generated {index}/{len(jobs)}: {output.name}', flush=True)
    print('Recordings generated. Update catalog IDs/version and manifest before assigning review hashes.')


if __name__ == '__main__':
    main()

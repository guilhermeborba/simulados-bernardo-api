"""Register packaged instruction assets without adding solutions or credentials."""
import hashlib
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'src/modules/quizzes/media/assets'
previous = json.loads((ASSETS/'manifest.json').read_text()) if (ASSETS/'manifest.json').exists() else []
previous_by_id = {entry['id']: entry for entry in previous}
assert len(previous_by_id) == len(previous), 'Duplicate registered asset IDs'
manifest = []
for quiz in json.loads((ROOT/'prisma/quiz-data/infantil.json').read_text()):
    for question in quiz['questions']:
        for kind, extension, mime in [('image','svg','image/svg+xml'),('audio','wav','audio/wav')]:
            asset_id = question['media'][kind]['assetId']
            file = ASSETS/(asset_id+'.'+extension)
            data = file.read_bytes()
            if kind == 'audio':
                with wave.open(str(file)) as audio:
                    assert audio.getnchannels() == 1 and audio.getsampwidth() == 2 and audio.getframerate() == 16000
            entry = {'id':asset_id, 'kind':kind, 'file':file.name, 'mimeType':mime, 'sha256':hashlib.sha256(data).hexdigest(), 'byteLength':len(data)}
            if asset_id in previous_by_id:
                assert entry == previous_by_id[asset_id], 'Registered assets are immutable; use a new ID'
            manifest.append(entry)
active_ids = {entry['id'] for entry in manifest}
for entry in previous:
    if entry['id'] not in active_ids:
        data = (ASSETS/entry['file']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == entry['sha256'], 'Registered assets are immutable'
        manifest.append(entry)
(ASSETS/'manifest.json').write_text(json.dumps(sorted(manifest,key=lambda x:x['id']),ensure_ascii=False,indent=2)+'\n')
print(f'Registered {len(manifest)} assets ({sum(x["byteLength"] for x in manifest)} bytes).')

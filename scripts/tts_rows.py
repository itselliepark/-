"""Make Adam (ElevenLabs) clips for each voice group and write rows.json for vo_schedule.py.

Usage: python3 -I scripts/tts_rows.py <groups.json> <out_dir> [cache_dir ...]

Clips are cached by an md5 of the text, so unchanged lines are never re-generated.
The ElevenLabs key is injected by the session proxy; never put a real key here.
"""
import hashlib, json, os, subprocess, sys, urllib.request

groups_path, out = sys.argv[1], sys.argv[2]
caches = [out] + sys.argv[3:]
os.makedirs(out, exist_ok=True)
# Pronunciation fixes for the voice only (captions keep the original spelling).
SAY = {'Big Way': '빅웨이'}
URL = 'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB?output_format=mp3_44100_128'

rows = json.load(open(groups_path, encoding='utf-8'))
for r in rows:
    v = r.get('voText') or ''
    for a, b in SAY.items():
        v = v.replace(a, b)
    r['voText'] = v
    if not v:
        r['voOn'] = False
        continue
    txt = v.replace('...', '… ').replace('..', '… ')
    h = hashlib.md5(txt.encode()).hexdigest()[:10]
    mp3 = next((os.path.join(d, h + '.mp3') for d in caches if os.path.exists(os.path.join(d, h + '.mp3'))), os.path.join(out, h + '.mp3'))
    if not os.path.exists(mp3):
        body = json.dumps({'text': txt, 'model_id': 'eleven_multilingual_v2',
                           'voice_settings': {'stability': 0.45, 'similarity_boost': 0.75, 'speed': 1.15}}).encode()
        req = urllib.request.Request(URL, data=body, headers={'xi-api-key': 'proxy-injected', 'Content-Type': 'application/json'})
        open(mp3, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
        print('new VO:', v)
    wav = os.path.join(out, h + '.wav')
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', mp3, '-af', trim, '-ar', '48000', '-ac', '1', wav], check=True)
    r['wav'] = wav
    r['nosplit'] = True
json.dump(rows, open(os.path.join(out, 'rows.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(rows), 'rows')

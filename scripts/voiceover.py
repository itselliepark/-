"""Generate an ElevenLabs voiceover track from the `vo` lines of an edit spec and mix it over the ambient audio.
Each line starts at its caption time; a line longer than its window is sped up (atempo, max 1.3x).
The ambient bed is ducked under the voice; the final mix is normalized to -14 LUFS.
usage: python3 -I scripts/voiceover.py <spec.ts> <ambient_audio> <work_dir> <out.m4a> [voice_id]
The API key is injected by the session's network proxy (no env var needed)."""
import json, re, subprocess, sys, os, urllib.request
spec, amb, work, out = sys.argv[1:5]
voice = sys.argv[5] if len(sys.argv) > 5 else 'pNInz6obpgDQGcFmaJgB'  # ElevenLabs premade "Adam"
src = open(spec, encoding='utf-8').read()
lines = [(float(t), vo) for t, vo in re.findall(r"\{t: ([\d.]+),[^\n]*?vo: '([^']*)'", src) if vo]
dur = float(re.search(r"duration: ([\d.]+)", src).group(1))
os.makedirs(work, exist_ok=True)
def probe(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
clips = []
for i, (t, text) in enumerate(lines):
    mp3 = f'{work}/vo_{i:02d}.mp3'
    if not os.path.exists(mp3):
        body = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2',
                           'voice_settings': {'stability': 0.45, 'similarity_boost': 0.75, 'speed': 1.1}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128', data=body,
                                     headers={'xi-api-key': 'proxy-injected', 'Content-Type': 'application/json'})
        open(mp3, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    # trim leading/trailing silence
    wav = f'{work}/vo_{i:02d}.wav'
    subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',mp3,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse','-ar','48000','-ac','1',wav],check=True)
    nxt = lines[i + 1][0] if i + 1 < len(lines) else dur
    win = nxt - t - 0.12
    d = probe(wav); tempo = 1.0
    if d > win:
        tempo = min(d / win, 1.3)
        fit = f'{work}/vo_{i:02d}_fit.wav'
        subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',wav,'-af',f'atempo={tempo:.3f}',fit],check=True); wav = fit
    clips.append((t, wav)); print(f'{t:6.2f}s  {d:4.2f}s / window {win:4.2f}s  tempo {tempo:.2f}{"  STILL LONG" if d/tempo > win + 0.05 else ""}  {text}')
args = ['ffmpeg','-nostdin','-loglevel','error','-y','-i',amb]
fc = []
for k, (t, w) in enumerate(clips, start=1):
    args += ['-i', w]; ms = int(t * 1000); fc.append(f'[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay={ms}|{ms}[v{k}]')
fc.append(''.join(f'[v{k}]' for k in range(1, len(clips) + 1)) + f'amix=inputs={len(clips)}:normalize=0:duration=longest,apad,atrim=0:{dur},volume=2.0,asplit=2[vo][sc]')
fc.append('[0:a]aformat=sample_rates=48000:channel_layouts=mono[amb];[amb][sc]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=350[duck]')
fc.append('[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[o]', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', out], check=True)
print('voiceover mix ->', out)

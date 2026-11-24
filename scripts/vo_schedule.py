"""Schedule voiceover lines (anchors fixed to scenes, others flow after the previous line),
split long captions into on-screen chunks timed to the voice, and build the VO mix.
usage: python3 -I scripts/vo_schedule.py <rows.json> <ambient> <out.m4a> <out_schedule.json> <tempo_plan.json>"""
import json, subprocess, sys, re
rows_f, amb, out, sched_f, plan_f = sys.argv[1:6]
rows = json.load(open(rows_f, encoding='utf-8')); plan = json.load(open(plan_f))
DUR = plan['duration']; anchors = set(plan['anchors']); tempo = {float(k): v for k, v in plan['tempo'].items()}
def probe(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
GAP = plan.get('gap', 0.03); MAXT = plan.get('max_tempo', 1.3)
def tight(src):  # squeeze pauses inside a line (ElevenLabs pauses at commas / ellipses)
    dst = src.replace('.wav', '_tight.wav')
    subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',src,'-af','silenceremove=stop_periods=-1:stop_duration=0.12:stop_threshold=-40dB:stop_silence=0.08',dst],check=True)
    return dst
end = 0.0
vo_rows = [r for r in rows if r['voOn']]
for idx, r in enumerate(rows):
    if not r['voOn']:
        r['start'] = r['t']; r['vo_len'] = 0.0; continue
    base = tight(r['wav'].split('_x')[0].replace('_tight', '').replace('.wav', '') + '.wav')
    d0 = probe(base)
    start = max(r['t'], end + GAP)
    nxt = next((x['t'] for x in rows[idx+1:] if x['voOn']), DUR)
    room = nxt - start - GAP
    f = min(max(d0 / room, tempo.get(r['t'], 1.0), 1.0), MAXT) if room > 0 else MAXT
    wav = base
    if f > 1.001:
        wav = base.replace('.wav', f'_x{f:.2f}.wav')
        subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',base,'-af',f'atempo={f:.3f}',wav],check=True)
    d = probe(wav); r['wav'] = wav; r['tempo'] = round(f, 2)
    r['start'] = round(start, 2); r['vo_len'] = round(d, 2); end = start + d
def chunks(text, limit):
    words = text.split(' '); out = []; cur = ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > limit: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    if cur: out.append(cur)
    return out
subs = []
for i, r in enumerate(rows):
    if not r['text']: continue
    nxt = next((x['start'] for x in rows[i+1:] if x['text'] or x['voOn']), DUR)
    span = (r['vo_len'] if r['vo_len'] else nxt - r['start'])
    limit = 14 if r['style'] != 'normal' else 17
    parts = chunks(r['text'], limit)
    total = sum(len(p) for p in parts); t = r['start']
    for k, p in enumerate(parts):
        e = dict(t=round(t, 2), text=p)
        if r['style'] != 'normal': e['style'] = r['style']
        if k == 0 and r.get('label'): e['label'] = r['label']
        subs.append(e); t += span * len(p) / total
json.dump({'rows': [{k: r[k] for k in ('t','start','vo_len','text','voText','voOn')} for r in rows], 'subs': subs}, open(sched_f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
clips = [(r['start'], r['wav']) for r in rows if r['voOn']]
args = ['ffmpeg','-nostdin','-loglevel','error','-y','-i',amb]; fc = []
for k, (t, w) in enumerate(clips, 1):
    args += ['-i', w]; ms = int(t*1000); fc.append(f'[{k}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay={ms}|{ms}[v{k}]')
fc.append(''.join(f'[v{k}]' for k in range(1, len(clips)+1)) + f'amix=inputs={len(clips)}:normalize=0:duration=longest,apad,atrim=0:{DUR},volume=2.0,asplit=2[vo][sc]')
fc.append('[0:a]aformat=sample_rates=48000:channel_layouts=mono[amb];[amb][sc]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=350[duck]')
fc.append('[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[o]', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', out], check=True)
for r in rows: print(f"{r['t']:5} -> {r['start']:6.2f} (late {r['start']-r['t']:+.2f})  vo {r['vo_len']:5.2f}  x{r.get('tempo',1):.2f}  {(r['voText'] if r['voOn'] else r['text'])[:30]}")

"""Mix voice + SFX for an Elli edit and normalize to -16 LUFS (BGM is added later by Elli).
usage: python3 -I scripts/mix_audio.py <raw_video> <spec.ts> <sfx_dir> <out.m4a>"""
import re, subprocess, sys, json
raw, spec, sfxdir, out = sys.argv[1:5]
src = open(spec, encoding='utf-8').read()
block = src[src.index('sfx:'):]
cues = [(float(t), k) for t, k in re.findall(r"\{t:\s*([\d.]+),\s*kind:\s*'(\w+)'\}", block)]
args = ['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', raw]
fc, labels = [], []
for i, (t, k) in enumerate(cues, start=1):
    args += ['-i', f'{sfxdir}/{k}.wav']
    ms = int(t * 1000)
    fc.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.32,adelay={ms}|{ms}[s{i}]')
    labels.append(f'[s{i}]')
fc.append(f"[0:a]aformat=sample_rates=44100:channel_layouts=stereo[v];[v]{''.join(labels)}amix=inputs={len(cues)+1}:normalize=0:duration=first[m]")
# two-pass loudnorm to -16 LUFS / -1.5 dBTP
probe = subprocess.run([a if a != 'error' else 'info' for a in args] + ['-filter_complex', ';'.join(fc) + ';[m]loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(args + ['-filter_complex', ';'.join(fc) + f';[m]{ln},aresample=48000[o]', '-map', '[o]', '-c:a', 'aac', '-b:a', '192k', out], check=True)
print(f'{len(cues)} sfx cues mixed ->', out)

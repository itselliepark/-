"""Master the voice track so it stays clear under background music added later.
Chain: 85 Hz rumble cut -> soft expander (room tails) -> light 1.8:1 compression -> small presence lift / mud cut
-> two-pass loudness to -14 LUFS, true peak -1.5 dB -> safety limiter.
usage: python3 -I scripts/voice_master.py <raw_video_or_audio> <out.m4a>"""
import json, subprocess, sys, tempfile, os
src, out = sys.argv[1:3]
pre = os.path.join(tempfile.mkdtemp(), 'pre.wav')
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', src, '-vn', '-af',
    # gentle chain: a soft expander keeps room tails down, light compression without big makeup gain
    # (heavier 3:1 + makeup lifted the room reverb and made the voice sound echoey)
    'highpass=f=85,agate=threshold=0.012:ratio=2:range=0.3:attack=5:release=120,'
    'acompressor=threshold=-16dB:ratio=1.8:attack=15:release=200:makeup=1,'
    'equalizer=f=3000:t=q:w=1.4:g=1.2,equalizer=f=280:t=q:w=1.0:g=-2', '-ar', '48000', pre], check=True)
probe = subprocess.run(['ffmpeg', '-nostdin', '-i', pre, '-af',
    'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
      "alimiter=limit=0.84:level=false,aresample=48000")
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', pre, '-af', ln, '-c:a', 'aac', '-b:a', '192k', out], check=True)
print('mastered ->', out)

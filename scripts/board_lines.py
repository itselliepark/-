"""Turn the feedback board's caption editor lines into VO rows and caption subs.

Usage: python3 -I scripts/board_lines.py <lines_dir> <version> <out_dir>

<lines_dir> holds the board's `lines` docs as JSON files (ArtifactData read with out_dir).
Each line is one on-screen caption chunk: {v, t, text, style, label, vo, voText?, voLen?, voTextAtLen?}.
vo: 'same' (read the caption), 'join' (continue the previous line's sentence),
'custom' (read voText instead), 'off' (no voice).

Writes <out_dir>/groups.json (one VO sentence per group, starting at its first line's time)
and <out_dir>/subs.json (captions exactly at Elli's times, for the EditSpec).
"""
import json, os, re, sys

src, ver, out = sys.argv[1:4]
lines = []
for root, _, files in os.walk(src):
    for f in files:
        if f.endswith('.json'):
            d = json.load(open(os.path.join(root, f), encoding='utf-8'))
            d = d.get('data', d)
            if d.get('v') == ver:
                lines.append(d)
lines.sort(key=lambda d: (d['t'], d.get('order', 0)))


def clean(s):
    s = re.sub(r'[\U0001F000-\U0001FAFF☀-➿]️?', '', s or '')
    return re.sub(r'\s+', ' ', s.replace('(', '').replace(')', '')).strip()


groups = []
for d in lines:
    if d.get('vo') == 'join' and groups:
        groups[-1]['rows'].append(d)
    else:
        groups.append({'head': d, 'rows': [d]})

rows = []
for g in groups:
    h = g['head']
    mode = h.get('vo', 'same')
    if mode in ('off', 'join'):
        vo = ''
    elif mode == 'custom':
        vo = (h.get('voText') or '').strip()
    else:
        vo = ' '.join(x for x in (clean(r['text']) for r in g['rows']) if x)
    rows.append({'t': h['t'], 'text': ' '.join(r['text'] for r in g['rows'] if r['text']),
                 'style': h.get('style', 'normal'), 'label': h.get('label', ''),
                 'voOn': bool(vo), 'voText': vo, 'chunks': [r['text'] for r in g['rows'] if r['text']] or None})

subs = [{k: v for k, v in {'t': round(d['t'], 2), 'text': d['text'], 'style': d.get('style') if d.get('style') not in (None, 'normal') else None,
         'label': d.get('label') or None}.items() if v is not None} for d in lines if d.get('text')]
os.makedirs(out, exist_ok=True)
json.dump(rows, open(os.path.join(out, 'groups.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(subs, open(os.path.join(out, 'subs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(lines)} lines -> {len(rows)} voice groups, {len(subs)} captions')

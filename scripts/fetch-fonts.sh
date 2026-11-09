#!/usr/bin/env bash
# Fetches the subtitle fonts from the GitHub mirrors found in Nov 2026 and converts them to TTF.
#   BMkkubulim.ttf     배달의민족 꾸불림체  (red emphasis)    projectnoonnu/2410-1 (noonnu webfont mirror)
#   Cafe24Anemone.ttf  카페24 아네모네     (mint emphasis)   codestates-seb/seb43_main_006 (unofficial copy)
#   Neujoh-*.ttf       느좋체 (OFL 1.1)    (alternate mint)  parkse0eum/parkse0eum.github.io
# The BM and Cafe24 fonts are free for commercial use but may not be redistributed, so fonts/ is gitignored.
set -e
cd "$(dirname "$0")/.."
T="$(mktemp -d)"; mkdir -p fonts
get(){ git clone -q --filter=blob:none --no-checkout --depth 1 "https://github.com/$1.git" "$T/$2" && git -C "$T/$2" checkout -q HEAD -- "$3"; }
get projectnoonnu/2410-1 a BMkkubulimTTF-Regular.woff2
get codestates-seb/seb43_main_006 b client/src/assets/fonts/Cafe24Anemone.ttf
get parkse0eum/parkse0eum.github.io c "public/fonts/Neujoh-Regular.woff2"
pip3 install -q fonttools brotli
python3 -I - "$T" fonts <<'PY'
import sys
from fontTools.ttLib import TTFont
T,F=sys.argv[1],sys.argv[2]
for out,p in {'BMkkubulim':'a/BMkkubulimTTF-Regular.woff2','Cafe24Anemone':'b/client/src/assets/fonts/Cafe24Anemone.ttf','Neujoh-Regular':'c/public/fonts/Neujoh-Regular.woff2'}.items():
    f=TTFont(f'{T}/{p}'); f.flavor=None; f.save(f'{F}/{out}.ttf'); print('ok', out)
PY
rm -rf "$T"

#!/usr/bin/env bash
# Installs the video toolkit: yt-dlp, whisper.cpp (+ base model), and npm deps
# for the Remotion / HyperFrames projects. FFmpeg comes with the base image.
# Run from the repository root:  bash scripts/setup-video-tools.sh
set -e
W="${WHISPER_DIR:-/opt/whisper}"
pip3 install -q -U "yt-dlp[default]"
mkdir -p ~/.config/yt-dlp && echo "--js-runtimes node" > ~/.config/yt-dlp/config
if [ ! -x "$W/whisper.cpp/build/bin/whisper-cli" ]; then
  mkdir -p "$W" && rm -rf "$W/whisper.cpp"
  git clone -q --depth 1 https://github.com/ggml-org/whisper.cpp.git "$W/whisper.cpp"
  cmake -S "$W/whisper.cpp" -B "$W/whisper.cpp/build" -DCMAKE_BUILD_TYPE=Release >/dev/null
  cmake --build "$W/whisper.cpp/build" -j"$(nproc)" --config Release >/dev/null
fi
ln -sf "$W/whisper.cpp/build/bin/whisper-cli" /usr/local/bin/whisper-cli
[ -f "$W/whisper.cpp/models/ggml-base.bin" ] || sh "$W/whisper.cpp/models/download-ggml-model.sh" base
(cd remotion && npm ci --no-audit --no-fund)
(cd hyperframes && npm ci --no-audit --no-fund)
(cd hyperframes/test-video && npm ci --no-audit --no-fund)

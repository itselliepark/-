# 영상 편집 툴킷

| 도구 | 용도 | 위치 / 실행 |
|---|---|---|
| Remotion 4.0.541 | React 코드로 영상 만들기 | `remotion/` → `npx remotion render src/index.ts HelloTitle out/hello.mp4` |
| HyperFrames 0.9.25 | HTML + GSAP로 영상 만들기 | `hyperframes/test-video/` → `npx hyperframes render -o renders/test.mp4` |
| FFmpeg 6.1.1 | 자르기·합치기·자막·인코딩 | `ffmpeg` (기본 이미지에 포함) |
| whisper.cpp | 음성 → 자막(SRT) | `whisper-cli -m /opt/whisper/whisper.cpp/models/ggml-base.bin -f in.wav -l ko -osrt` |
| yt-dlp | 영상 다운로드 | `yt-dlp <URL>` |

## 새 세션에서 설치

```bash
bash scripts/setup-video-tools.sh
```

## 참고

- 클라우드 환경에서는 Chromium 경로를 지정해야 함: Remotion은 `--browser-executable=/opt/pw-browsers/chromium`,
  HyperFrames는 `PRODUCER_HEADLESS_SHELL_PATH=/opt/pw-browsers/chromium`.
- HyperFrames 컴포지션은 GSAP를 CDN 대신 `vendor/gsap.min.js`에서 불러옴 (jsDelivr가 네트워크 정책에서 막혀 있음).
- 한글 자막 번인: `subtitles=file.srt:force_style='FontName=WenQuanYi Zen Hei'`.
- YouTube는 클라우드 IP에서 봇 확인(로그인)을 요구하므로 쿠키 파일(`--cookies`)이 필요할 수 있음.

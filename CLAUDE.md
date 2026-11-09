# 엘리모멘토 영상 편집 작업 공간

이 저장소에서 영상을 편집할 때는 항상 승인된 편집 가이드 `docs/elli-style-guide.md`를 따른다.
가이드와 다르게 하려면 먼저 엘리에게 확인받고, 바뀐 규칙은 가이드에 반영한다.

- 새 세션 준비: `bash scripts/setup-video-tools.sh` 후 `bash scripts/fetch-fonts.sh`, 그리고 `cp fonts/*.ttf remotion/public/fonts/` 및 Pretendard(`remotion/node_modules/pretendard/dist/public/static/`)를 같은 폴더에 복사.
- Remotion 렌더 시 `--browser-executable=/opt/pw-browsers/chromium`.
- 원본 영상·폰트·렌더 결과물은 커밋하지 않는다(.gitignore).

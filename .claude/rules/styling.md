---
paths:
  - "quartz/styles/**"
  - "quartz.config.yaml"
---

# 스타일 수정 규칙

## 어디에 쓰나

- 모든 커스텀 스타일은 `quartz/styles/custom.scss`에만 쓴다. 테마 원본이나 `callouts.scss`는 건드리지 않는다.
- 테마는 `quartz-themes`의 **things** (`quartz.config.yaml`). Obsidian 테마를 웹용으로 옮긴 거라 웹에 불필요한 스타일이 섞여 있다.

## 덮어쓰기 방법

- 테마 셀렉터 특이도가 높아서 `:root:root:root article ...`로 덮는다.
- 왜 덮었는지 주석을 남긴다. 기존 규칙들이 그렇게 되어 있다.
- 색은 하드코딩보다 변수 우선: `--text-normal`, `--secondary`, callout은 `--color`
- 라이트/다크가 다르면 `[saved-theme="light"]` / `[saved-theme="dark"]`로 나눈다.

## 이미 정리한 테마 문제 (되돌리지 않기)

- 제목 색: h3~h6을 `--text-normal`로 통일
- 제목 위 여백: h2 3rem, h3 2.25rem, h4~h6 1.75rem / 제목 바로 뒤 하위 제목은 1rem
- 제목 앵커 아이콘: 노란 배경 제거, 세로 가운데 정렬
- 굵게·기울임 등에 붙은 `cursor: grab` 제거
- 본문 이미지 `box-shadow` 제거
- 인용문은 핑크 왼쪽 선, callout은 타입 색의 둥근 박스 (info는 파랑)

## 확인

- `npm run dev` 후 브라우저에서 실제로 본다. 가능하면 computed style 값으로 확인한다.
- 라이트/다크 둘 다 확인한다.

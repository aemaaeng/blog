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
- 글 제목↔태그 간격: 숨겨진 속성 표(`.note-properties-table`)의 margin-top 제거, 제목 아래 10px
- 검색 모달: 테마가 `.search-space` 하위 배경을 전부 transparent로 덮어씀 → 불투명 카드. 결과 카드 여백·제목 크기, 미리보기에서 사이트 머리글·breadcrumb 숨김, 홈(index) 결과 숨김
- 코드 블록: `pre`·`code` 이중 패딩과 줄(`[data-line]`)별 배경 제거, 줄번호는 6줄 이상 블록만(작고 흐리게), 우상단 언어 라벨(모바일은 코드와 겹쳐 숨김)
- 글 상세 하단 목록(`body:not([data-slug='index'])`): 64px 여백 + 1px 구분선, 제목 16px·요약 1줄, 최근 5개, `현재 글` 뱃지(`.is-current`). 홈 목록은 별도 스타일
- 백링크: 글 목록과 같은 작은 회색 라벨 + 목록 형식, 들여쓰기 제거. 제목 문구는 `Head.tsx`에서 "이 글을 언급한 글"로 교체
- 구분선 색은 `--divider`(글자색 20%). 테마 `--lightgray`(#f6f7f8)는 흰 배경과 거의 같아 선·테두리로 쓰면 안 보인다
- 헤더: 사이트 이름↔breadcrumb 20px, breadcrumb 13.6px 회색(현재 글만 진하게, hover 시 강조색)
- 그래프: 글 하단 로컬 그래프 대신 헤더 툴바 아이콘 → 전체 그래프 모달(카드). things 테마가 버튼 자체에 mask-image를 씌우므로 풀고 `::before` 마스크로 아이콘을 그린다
- 모바일(≤800px): 상단 여백 24px, breadcrumb 한 줄 말줄임, 목록 제목 축소, 본문 목록 들여쓰기 단계당 1.4rem, 푸터 우측 "맨 위로" 버튼(`Head.tsx`에서 주입)

## 유지하기로 한 결정

- 본문 `word-break`는 `normal` 그대로. `keep-all`로 바꾸면 모바일에서 오른쪽 여백이 크게 남아 일부러 되돌린 것이다.
- 본문 `text-wrap: pretty`는 Safari에서만 끈다(`@supports (hanging-punctuation: first)`). Safari는 문단 전체를 다시 배분해 한국어 줄을 일찍 끊어서 오른쪽 여백이 크게 남는다.
- 글 하단 목록 라벨은 "글 목록" 유지 (현재 글도 목록에 남기 때문에 "다른 글"은 맞지 않음).
- 본문 링크 hover 팝오버는 끔(`enablePopovers: false`). 검색 결과 미리보기는 켬.

## 확인

- `npm run dev` 후 브라우저에서 실제로 본다. 가능하면 computed style 값으로 확인한다.
- PC, 모바일(390px), 다크모드 세 가지를 확인한다.
- CSS는 새로고침으로 반영되지만, `quartz.config.yaml`을 바꾸면 개발 서버를 재시작해야 한다.

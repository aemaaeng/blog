---
paths:
  - "src/styles/**"
  - "src/components/**"
  - "src/layouts/**"
---

# 스타일 수정 규칙

## 어디에 쓰나

- 색 변수·기본 요소·본문(마크다운)·코드 블록: `src/styles/global.css`
- 헤더·목록 같은 UI: 각 컴포넌트의 `<style>` (Astro 스코프 CSS)
- 스크립트가 만드는 요소(검색 결과, 오노추 패널, 복사 버튼)는 스코프 속성이 붙지 않는다 → `:global(...)`이나 `<style is:global>`
- 왜 그렇게 했는지 주석을 남긴다. 기존 규칙들이 그렇게 되어 있다.

## 색

- 하드코딩보다 변수 우선: `--text`, `--text-body`, `--gray`, `--accent`, `--tag`, `--divider`, `--bg-hover`, `--code-bg` 등 (`global.css` 맨 위)
- 다크 모드는 `:root[data-theme="dark"]`에서 변수만 바꾼다. 테마 값은 `localStorage.theme`(Quartz 시절과 같은 키)
- 구분선·테두리는 `--divider`(글자색 20%). 거의 흰 회색은 흰 배경에서 안 보인다

## 유지하기로 한 결정 (되돌리지 않기)

- 본문 `word-break`는 `normal` 그대로. `keep-all`로 바꾸면 모바일에서 오른쪽 여백이 크게 남아 일부러 되돌린 것이다.
- 본문 `text-wrap: pretty`는 Safari에서만 끈다(`@supports (hanging-punctuation: first)`). Safari는 문단 전체를 다시 배분해 한국어 줄을 일찍 끊어서 오른쪽 여백이 크게 남는다.
- 글 하단 목록 라벨은 "글 목록" 유지 (현재 글도 목록에 남기 때문에 "다른 글"은 맞지 않음). 글 하단은 최근 5개, 홈은 전체
- 본문 위키링크(`a.internal`)는 연한 노란 배경. 색만으로 링크를 구분하지 않게 한다(접근성)
- 제목 위 여백: h2 3rem, h3 2.25rem, h4 1.75rem / 제목 바로 뒤 하위 제목은 1rem
- 인용문은 핑크 왼쪽 선, callout은 타입 색의 둥근 박스 (info는 파랑)
- 코드 블록: 줄번호는 6줄 이상만(작고 흐리게), 우상단 언어 라벨은 마우스를 올리면 복사 버튼으로 바뀐다. 모바일은 라벨 숨김
- 모바일(≤800px): 상단 여백 24px, breadcrumb 한 줄 말줄임, 본문 목록 들여쓰기 단계당 1.4rem, 푸터 오른쪽 "맨 위로" 버튼
- 본문 링크 hover 미리보기(팝오버)는 없다. 검색 결과 미리보기는 있다(PC)

## 확인

- `npm run dev` 후 브라우저에서 실제로 본다. 가능하면 computed style 값으로 확인한다.
- PC, 모바일(390px), 다크 모드 세 가지를 확인한다. Safari도 본다(줄바꿈이 다르다).
- 검색 모달은 개발 서버에서 결과가 안 나온다 → `npm run build && npm run preview`

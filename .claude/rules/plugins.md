---
paths:
  - "quartz/**"
  - "quartz.config.yaml"
  - "plugins/**"
---

# 플러그인 동작 변경 규칙

## `.quartz/`는 고치지 않는다

- `.quartz/plugins/`는 `quartz.config.yaml`의 `github:quartz-community/*` 소스를 빌드마다 설치하는 곳이고 `.gitignore`에 들어 있다.
- 여기를 고치면 로컬에서는 바뀌어 보여도 **배포에 반영되지 않는다**. 코드를 읽어 원인을 찾는 용도로만 쓴다.

## 바꾸는 방법 (위에서부터 시도)

1. **설정 옵션**: 플러그인 `src/components/*.tsx`의 Options나 README를 먼저 본다.
   - 예: 검색 미리보기 `enablePreview`, 본문 링크 팝오버 `configuration.enablePopovers`, 빈 백링크 `hideWhenEmpty`
2. **`quartz/components/Head.tsx` 인라인 스크립트**: 렌더 결과 DOM을 조금 손보는 정도면 여기서 한다.
   - SPA 이동마다 다시 돌도록 `nav` 이벤트에도 건다.
   - 예: 홈 목록 한 줄 요약 주입, 글 하단 목록 `.is-current` 표시
3. **로컬 플러그인**: `plugins/<이름>`으로 두고 config에서 `./plugins/<이름>`으로 참조한다 (예: `plugins/date-badge`). upstream 업데이트를 자동으로 따라가지 않으니 최후 수단.
4. **upstream 기여**: 버그면 `quartz-community/<플러그인>`에 이슈 → PR. 반영되면 로컬 우회를 걷어낸다.

## 알려진 upstream 문제

- `quartz-community/search`: 한글을 글자 단위로 색인해서 "배포" 검색에 "배"·"포"가 떨어져 있는 글도 걸린다. 미리보기 하이라이트는 붙은 문자열만 칠해서 결과와 어긋난다. (같은 encoder 문제: 이슈 #1 하이픈 단어)

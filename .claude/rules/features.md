---
paths:
  - "src/**"
  - "astro.config.mjs"
  - "scripts/**"
---

# 마크다운 처리·기능 수정 규칙

## 마크다운 (`src/markdown/`)

- Astro 7 기본 처리기(Sätteri)는 remark 플러그인을 받지 않는다. `astro.config.mjs`에서 `@astrojs/markdown-remark`의 `unified()`로 플러그인을 건다.
- 순서가 중요하다. callout은 첫 줄바꿈으로 제목/본문을 나누므로 `remark-breaks`보다 먼저 돈다.
- 플러그인이 글마다 계산한 값(링크한 글 `links`, 읽는 시간 `minutesRead`)은 `file.data.astro.frontmatter`에 넣고 `render(post).remarkPluginFrontmatter`로 읽는다.
- 위키링크 대상 글이 없거나 `![[임베드]]`를 쓰면 빌드를 실패시킨다. 깨진 링크가 배포되지 않게 하려는 것이니 경고로 바꾸지 않는다.
- `astro.config.mjs`나 `src/markdown/`을 바꾸면 개발 서버를 재시작해야 반영된다.

## 주소

- 글 주소는 Quartz와 같은 slug 규칙(`src/lib/slug.ts`). 바꾸면 외부 링크·RSS 구독이 깨진다.
- RSS 주소 `/index.xml`은 구독자 때문에 바꾸지 않는다.
- Quartz가 만들던 대소문자 주소(`/Streaming-SSR`)는 `_redirects`로 넘긴다. Astro는 `_`로 시작하는 페이지 파일을 무시해서 `src/pages/[redirects].ts`로 만든다.

## 브라우저 스크립트

- 페이지 이동은 `<ClientRouter />`(새로고침 없음)라서 스크립트는 처음 한 번만 실행된다.
  - 이벤트는 `document`에 한 번만 걸고 위임한다 (요소에 직접 걸면 이동 후 사라진다)
  - 페이지마다 할 일(버튼 붙이기 등)은 `astro:page-load`에서 한다
  - 이동하면 `<html>` 속성이 새 문서 것으로 바뀐다 → 테마는 `astro:after-swap`에서 다시 정한다 (`Base.astro`)
- 오노추: 개발 서버에서는 `/api/song`이 없어 MOCK 곡을 쓴다. 실제 사이트에서 API가 실패하면 버튼을 숨긴다. 미리보기 배포에는 Spotify Secret이 없어서 숨겨지는 게 정상이다.
- Spotify Secret, `.dev.vars`는 읽거나 커밋하지 않는다.

## 커밋 전 확인

```bash
npm run build
npx astro check                 # 타입 오류 0
node scripts/check-urls.mjs     # docs/urls.txt의 기존 주소가 모두 있는지
node scripts/check-links.mjs    # 내부 링크·앵커가 모두 이어지는지
```

- Cloudflare는 없는 주소에 404 페이지를 돌려주므로, 주소 검증은 배포된 사이트가 아니라 빌드 결과로 한다.

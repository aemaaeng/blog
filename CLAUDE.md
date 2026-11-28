# hyemin.dev 블로그

Astro 7 기반 개인 블로그. 글은 Obsidian으로 `content/`에 쓰고, `main`에 push하면 Cloudflare Pages가 배포한다.

- 사이트: https://hyemin.dev (`hyemin-jardin.pages.dev`는 Bulk Redirect로 301)
- 정적 파일(이미지 등): https://static.hyemin.dev (R2 버킷 `hyemin-dev-blog-images`)
- Node 24 (`nvm use 24`). Astro 7은 22.23 이상이 필요하다
- 로컬 확인: `npm run dev` → http://localhost:4321
- 검색(Pagefind)은 빌드 결과에서만 동작: `npm run build && npm run preview`
- 빌드 출력은 `public/`(Cloudflare 설정), 정적 파일 입력은 `static/`
- 이사 기록: `docs/astro-migration.md`

답변은 한국어로 한다.

## 폴더

| 위치              | 내용                                                        |
| ----------------- | ----------------------------------------------------------- |
| `content/`        | 글 (Obsidian이 관리. 형식 정리 외에는 건드리지 않는다)      |
| `src/markdown/`   | Obsidian 문법 remark/rehype 플러그인 (위키링크, callout 등) |
| `src/pages/`      | 페이지와 RSS·sitemap·OG 이미지·`_redirects` 엔드포인트      |
| `src/components/` | 헤더 버튼(검색·다크 모드·오노추), 글 목록, 백링크 등        |
| `src/styles/`     | `global.css` (색 변수, 본문, 코드 블록)                     |
| `functions/api/`  | 오노추 API (Cloudflare Pages Function, Spotify Secret 사용) |
| `scripts/`        | 빌드 결과 검사 (`check-urls.mjs`, `check-links.mjs`)        |

## 규칙

| 작업                                      | 문서                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| 글 작성·수정 (frontmatter, 태그, callout) | [.claude/rules/writing.md](.claude/rules/writing.md)     |
| 이미지·파일 업로드 (R2)                   | [.claude/rules/images.md](.claude/rules/images.md)       |
| 이전 블로그(티스토리) 글 이관             | [.claude/rules/migration.md](.claude/rules/migration.md) |
| 스타일 수정                               | [.claude/rules/styling.md](.claude/rules/styling.md)     |
| 마크다운 처리·기능 수정                   | [.claude/rules/features.md](.claude/rules/features.md)   |
| 커밋                                      | [.claude/rules/git.md](.claude/rules/git.md)             |

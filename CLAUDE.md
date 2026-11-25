# hyemin.dev 블로그

Quartz v5 기반 개인 블로그. 글은 Obsidian으로 `content/`에 쓰고, `main`에 push하면 Cloudflare Pages가 배포한다.

- 사이트: https://hyemin.dev (`hyemin-jardin.pages.dev`는 Bulk Redirect로 301)
- 정적 파일(이미지 등): https://static.hyemin.dev (R2 버킷 `hyemin-dev-blog-images`)
- 로컬 확인: `npm run dev` → http://localhost:8080
- 설정: `quartz.config.yaml` · 커스텀 스타일: `quartz/styles/custom.scss`

## 규칙

| 작업                                      | 문서                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| 글 작성·수정 (frontmatter, 태그, callout) | [.claude/rules/writing.md](.claude/rules/writing.md)     |
| 이미지·파일 업로드 (R2)                   | [.claude/rules/images.md](.claude/rules/images.md)       |
| 이전 블로그(티스토리) 글 이관             | [.claude/rules/migration.md](.claude/rules/migration.md) |
| 스타일 수정 (테마 덮어쓰기)               | [.claude/rules/styling.md](.claude/rules/styling.md)     |
| 커밋                                      | [.claude/rules/git.md](.claude/rules/git.md)             |

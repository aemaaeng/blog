---
paths:
  - "content/**/*.md"
---

# 글 작성 규칙

## frontmatter

```yaml
---
title: 글 제목
description: 한 문장 요약. "~를 정리합니다." 톤
date: 2026-05-25
tags:
  - frontend
  - React
---
```

- `title`, `date`, `description`은 필수. 빠지거나 형식이 틀리면 빌드가 실패한다(`src/content.config.ts`).
- `date`는 `YYYY-MM-DD`. 목록 정렬·RSS·OG 이미지가 이 값을 쓴다.
- `description`은 글 목록 요약·OG 카드·RSS에 쓰인다. 본문 첫 줄과 같은 문장이면 본문 쪽을 뺀다.
- 공개하지 않을 글은 `draft: true`.

## 태그

- 새 태그를 만들기 전에 기존 글의 태그부터 확인한다: `grep -h -A8 '^tags:' content/*.md`
- 고유명사는 원래 표기: `React`, `Next.js`, `Vite`, `Astro`
- 일반 단어는 소문자: `frontend`, `ai`, `infrastructure`, `retrospect`, `article`
- 태그 주소와 표시 이름은 소문자 slug다(`Next.js` → `/tags/next.js`). 대소문자만 다른 태그는 같은 태그로 묶인다.
- 글 하나에만 붙을 태그(`환경변수`, `process.env` 등)는 만들지 않는다. 태그는 여러 글을 묶을 때 의미가 있다.

## 본문

- Obsidian callout 사용 가능: `> [!info] 제목` (스타일은 `styling.md` 참고)
- 위키링크 `[[글 제목]]`, `[[글 제목|별칭]]`, `[[글 제목#^블록id]]`, `[[글 제목#제목]]` 사용 가능. 대상은 파일 이름으로 찾는다. 없는 글을 가리키면 빌드가 실패한다.
- `![[임베드]]`는 지원하지 않는다(빌드 실패).
- 본문 `@YYYY-MM-DD`는 "추가" 날짜 뱃지가 된다.
- 이미지는 레포에 넣지 않는다 → `images.md`
- 사용자가 쓴 문장은 고치지 않는다. 형식 정리(깨진 마크다운, 코드 블록 언어 등)만 하고, 문장을 바꾸고 싶으면 제안만 한다.
- 업무 관련 내용: 실제 식별자(버킷명·도메인·계정 ID·내부 도구명), 운영 수치, 사내 화면 캡처는 넣지 않는다. 일반화된 예시(`my-bucket`, `static.example.com`)는 괜찮다.

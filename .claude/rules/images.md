# 이미지·파일 업로드 규칙

이미지는 git에 커밋하지 않는다. 전부 R2에 올리고 본문에는 URL만 쓴다.

## 위치

- 버킷: `hyemin-dev-blog-images` (공개 도메인 `static.hyemin.dev`)
- 경로: `images/YYYY/MM/<글 주제>-<설명>.<ext>` — YYYY/MM은 글의 `date` 기준
  - 예: `images/2026/03/static-404-load-balancer.webp`
- 이미지 외 파일(PDF 등)은 `files/` 아래
- 이 버킷은 공개다. 비공개 파일은 올리지 않는다. `r2.dev` 공개 URL은 꺼둔 상태를 유지한다.

## 변환

- PNG/JPG → webp: `cwebp -q 85 -quiet in.png -o out.webp`
- SVG는 그대로 올린다. 올리기 전에 `<script`, `on*=`, `javascript:`, `foreignObject`가 없는지 확인한다.

## 업로드

```bash
wrangler r2 object put hyemin-dev-blog-images/images/2026/03/name.webp \
  --file ./name.webp --content-type image/webp --remote
```

- `--remote`를 빼면 로컬 개발용 저장소에 올라간다. 반드시 붙인다.
- 업로드 후 확인: `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://static.hyemin.dev/<경로>`
- 교체는 같은 경로에 덮어쓴다. 본문 수정이 필요 없다. (현재 엣지 캐시 `DYNAMIC`이라 바로 반영됨)

## 본문

```markdown
![무엇을 보여주는 그림인지](https://static.hyemin.dev/images/2026/03/name.webp)
```

- alt 텍스트를 비우지 않는다.

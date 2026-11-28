// Quartz(@quartz-community/utils slugifyPath)와 같은 규칙으로 글 주소를 만든다.
// 주소가 바뀌면 외부 링크·검색·RSS가 깨지므로 docs/urls.txt와 비교해 검증한다.
export function slugify(path: string): string {
  return path
    .normalize("NFC")
    .replace(/\.md$/, "")
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, "")
        .toLowerCase(),
    )
    .join("/")
    .replace(/\/$/, "")
}

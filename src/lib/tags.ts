import type { CollectionEntry } from "astro:content"
import { slugify } from "./slug"

// 태그 주소와 표시 이름은 Quartz처럼 slug 규칙을 따른다 (Next.js → next.js)
export const tagSlug = (tag: string) => slugify(tag)

// slug별로 글을 모은다. 대소문자만 다른 태그(React/react)는 같은 태그로 본다.
export function groupByTag(posts: CollectionEntry<"posts">[]) {
  const groups = new Map<string, CollectionEntry<"posts">[]>()
  for (const post of posts) {
    for (const tag of new Set(post.data.tags.map(tagSlug))) {
      groups.set(tag, [...(groups.get(tag) ?? []), post])
    }
  }
  return new Map([...groups].sort(([a], [b]) => a.localeCompare(b)))
}

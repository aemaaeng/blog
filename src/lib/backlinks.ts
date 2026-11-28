import { render, type CollectionEntry } from "astro:content"

// 위키링크 플러그인이 frontmatter.links에 남긴 링크를 모아 "이 글을 언급한 글"을 만든다.
export async function getBacklinks(posts: CollectionEntry<"posts">[]) {
  const backlinks = new Map<string, CollectionEntry<"posts">[]>()
  for (const post of posts) {
    const { remarkPluginFrontmatter } = await render(post)
    const links: string[] = remarkPluginFrontmatter.links ?? []
    for (const target of links) {
      if (target === post.id) continue
      backlinks.set(target, [...(backlinks.get(target) ?? []), post])
    }
  }
  return backlinks
}

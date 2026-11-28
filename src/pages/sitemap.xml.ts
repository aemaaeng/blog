// sitemap. 홈, 글, 태그 목록, 태그 페이지 (Quartz 시절과 같은 범위)
import type { APIContext } from "astro"
import { getPosts } from "../lib/posts"
import { groupByTag } from "../lib/tags"

export async function GET(context: APIContext) {
  const posts = await getPosts()
  const url = (path: string) => new URL(path, context.site).href
  const entries: { loc: string; lastmod?: Date }[] = [
    { loc: url("/"), lastmod: posts[0]?.data.date },
    ...posts.map((post) => ({ loc: url(`/${post.id}`), lastmod: post.data.date })),
    { loc: url("/tags/") },
    ...[...groupByTag(posts).keys()].map((tag) => ({ loc: url(`/tags/${tag}`) })),
  ]
  const body = entries
    .map(
      ({ loc, lastmod }) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}</url>`,
    )
    .join("")
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  )
}

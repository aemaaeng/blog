// RSS. 주소 /index.xml은 Quartz 시절 그대로 둔다(구독자가 이 주소를 쓴다).
import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { getPosts } from "../lib/posts"
import { tagSlug } from "../lib/tags"

export async function GET(context: APIContext) {
  const posts = await getPosts()
  return rss({
    title: "Hyemin Kim",
    description: "hyemin.dev의 새 글",
    site: context.site!,
    // 글 주소는 끝에 /가 없다. 기본값(true)이면 일부 링크에 /가 붙는다
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      link: `/${post.id}`,
      pubDate: post.data.date,
      description: post.data.description,
      categories: [...new Set(post.data.tags.map(tagSlug))],
    })),
  })
}

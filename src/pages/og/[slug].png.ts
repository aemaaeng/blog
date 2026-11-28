// 글마다 공유 미리보기 이미지 /og/<slug>.png, 홈·목록 페이지용 /og/index.png
import type { APIContext } from "astro"
import { getEntry, render } from "astro:content"
import { renderOg, type OgInput } from "../../lib/og"
import { formatDate, getPosts } from "../../lib/posts"
import { tagSlug } from "../../lib/tags"

export async function getStaticPaths() {
  const posts = await getPosts()
  const home = await getEntry("home", "index")
  const pages: { params: { slug: string }; props: OgInput }[] = [
    {
      params: { slug: "index" },
      props: { title: "Hyemin Kim", description: home?.data.description },
    },
  ]
  for (const post of posts) {
    const { remarkPluginFrontmatter } = await render(post)
    pages.push({
      params: { slug: post.id },
      props: {
        title: post.data.title,
        description: post.data.description,
        meta: `${formatDate(post.data.date)} · ${remarkPluginFrontmatter.minutesRead} min read`,
        tags: [...new Set(post.data.tags.map(tagSlug))],
      },
    })
  }
  return pages
}

export async function GET({ props }: APIContext<OgInput>) {
  return new Response(await renderOg(props), { headers: { "Content-Type": "image/png" } })
}

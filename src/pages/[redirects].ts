// Cloudflare Pages 리다이렉트 목록(public/_redirects).
// Quartz는 파일 이름의 대소문자를 살린 주소(/Streaming-SSR)도 소문자 주소로 넘겨줬다.
// 예전에 그 주소로 걸린 링크가 깨지지 않게 같은 주소를 301로 넘긴다.
// (파일로 만들면 대소문자를 구분하지 않는 macOS에서 streaming-ssr.html과 이름이 부딪혀서 _redirects로 한다)
// Astro는 _로 시작하는 파일을 페이지로 만들지 않아서, 동적 경로로 파일 이름을 넘긴다.
import { basename } from "node:path"
import { getPosts } from "../lib/posts"
import { slugify } from "../lib/slug"

export function getStaticPaths() {
  return [{ params: { redirects: "_redirects" } }]
}

export async function GET() {
  const lines: string[] = []
  for (const post of await getPosts()) {
    const name = basename(post.filePath!)
    const cased = slugify(name, { keepCase: true })
    if (cased === post.id) continue
    const from = encodeURI(`/${cased}`)
    const to = encodeURI(`/${post.id}`)
    lines.push(`${from} ${to} 301`)
  }
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain" } })
}

// Obsidian 위키링크 [[글 제목]], [[글 제목|별칭]], [[글 제목#^블록id]], [[글 제목#제목]] → 일반 링크
// 글은 파일 이름으로 찾는다(Obsidian처럼 대소문자 무시). 못 찾으면 빌드를 실패시켜 깨진 링크를 막는다.
// 링크한 글 slug 목록은 frontmatter.links에 남겨 백링크를 만들 때 쓴다(render()의 remarkPluginFrontmatter).
import { readdirSync } from "node:fs"
import GithubSlugger from "github-slugger"
import type { Link, PhrasingContent, Root, Text } from "mdast"
import type { VFile } from "vfile"
import { visit } from "unist-util-visit"
import { slugify } from "../lib/slug"

const WIKILINK = /(!?)\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g

function postIndex(dir: string) {
  const index = new Map<string, string>()
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md") || file === "index.md") continue
    const name = file.normalize("NFC").replace(/\.md$/, "")
    index.set(name.toLowerCase(), slugify(file))
  }
  return index
}

// #^abc123 → #abc123 (Quartz와 같은 블록 id), #제목 → 제목 앵커
function anchorOf(hash: string | undefined) {
  if (!hash) return ""
  const value = hash.slice(1).trim()
  if (value.startsWith("^")) return "#" + value.slice(1)
  return "#" + new GithubSlugger().slug(value)
}

export default function remarkWikilinks({ dir = "./content" } = {}) {
  const index = postIndex(dir)
  return (tree: Root, file: VFile) => {
    const links = new Set<string>()
    visit(tree, "text", (node: Text, i, parent) => {
      if (!parent || i === undefined || !node.value.includes("[[")) return
      const out: PhrasingContent[] = []
      let last = 0
      for (const m of node.value.matchAll(WIKILINK)) {
        const [whole, embed, rawTarget, hash, alias] = m
        if (embed)
          throw new Error(`${file.path}: 임베드(![[...]])는 아직 지원하지 않습니다: ${whole}`)
        const target = rawTarget.trim().normalize("NFC")
        const slug = index.get(target.toLowerCase())
        if (!slug) throw new Error(`${file.path}: 위키링크 대상 글을 찾을 수 없습니다: ${whole}`)
        links.add(slug)
        if (m.index > last) out.push({ type: "text", value: node.value.slice(last, m.index) })
        const link: Link = {
          type: "link",
          url: `/${slug}${anchorOf(hash)}`,
          children: [{ type: "text", value: (alias ?? target).trim() }],
          data: { hProperties: { className: ["internal"] } },
        }
        out.push(link)
        last = m.index + whole.length
      }
      if (!out.length) return
      if (last < node.value.length) out.push({ type: "text", value: node.value.slice(last) })
      parent.children.splice(i, 1, ...out)
      return i + out.length
    })
    file.data.astro ??= {}
    file.data.astro.frontmatter = { ...file.data.astro.frontmatter, links: [...links] }
  }
}

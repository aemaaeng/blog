// 링크 후처리 (rehype)
// - 외부 링크: 새 탭 + 바깥 화살표 아이콘 (Quartz와 같은 모양)
// - 제목: id가 없으면 붙이고(Astro와 같은 github-slugger 규칙), 오른쪽에 # 앵커 링크 아이콘
//   블록 참조(^id)로 이미 id가 있는 제목은 그대로 둔다. Astro의 heading id 단계는 있는 id를 유지한다.
import GithubSlugger from "github-slugger"
import type { Element, ElementContent, Root } from "hast"
import { visit } from "unist-util-visit"

const SITE = "hyemin.dev"

const externalIcon: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    ariaHidden: "true",
    className: ["external-icon"],
    style: "max-width:0.8em;max-height:0.8em",
    viewBox: "0 0 512 512",
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: {
        d: "M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z",
      },
      children: [],
    },
  ],
}

const anchorIcon: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  children: [
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
    "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  ].map((d) => ({ type: "element", tagName: "path", properties: { d }, children: [] })),
}

function isExternal(href: string) {
  if (!/^https?:\/\//.test(href)) return false
  return new URL(href).hostname !== SITE
}

function textOf(nodes: ElementContent[]): string {
  return nodes
    .map((n) => (n.type === "text" ? n.value : n.type === "element" ? textOf(n.children) : ""))
    .join("")
}

export default function rehypeLinks() {
  return (tree: Root) => {
    const slugger = new GithubSlugger()
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a") {
        const href = String(node.properties.href ?? "")
        if (isExternal(href)) {
          node.properties.className = ["external"]
          node.properties.target = "_blank"
          node.properties.rel = ["noopener"]
          node.children.push(structuredClone(externalIcon))
        }
        return
      }
      if (/^h[1-6]$/.test(node.tagName)) {
        if (typeof node.properties.id !== "string")
          node.properties.id = slugger.slug(textOf(node.children))
        node.children.push({
          type: "element",
          tagName: "a",
          properties: {
            className: ["anchor"],
            href: `#${node.properties.id}`,
            ariaHidden: "true",
            tabIndex: -1,
          },
          children: [structuredClone(anchorIcon)],
        })
      }
    })
  }
}

// Obsidian callout (> [!info] 제목) → Quartz와 같은 구조의 HTML
// <blockquote class="callout info" data-callout="info">
//   <div class="callout-title"><div class="callout-icon"></div><div class="callout-title-inner">제목</div></div>
//   <div class="callout-content">본문</div>
// </blockquote>
// remark-breaks보다 먼저 돌아야 한다 (제목과 본문을 첫 줄바꿈으로 나누므로).
import type { Blockquote, Paragraph, PhrasingContent, Root } from "mdast"
import { visit } from "unist-util-visit"

const HEAD = /^\[!([\w-]+)\]([+-]?)[ \t]*/

// 첫 문단의 자식들을 첫 "\n" 기준으로 제목/나머지로 나눈다
function splitFirstLine(children: PhrasingContent[]) {
  const title: PhrasingContent[] = []
  const rest: PhrasingContent[] = []
  let found = false
  for (const child of children) {
    if (found) {
      rest.push(child)
      continue
    }
    if (child.type === "text" && child.value.includes("\n")) {
      const at = child.value.indexOf("\n")
      if (at > 0) title.push({ type: "text", value: child.value.slice(0, at) })
      const after = child.value.slice(at + 1)
      if (after) rest.push({ type: "text", value: after })
      found = true
      continue
    }
    title.push(child)
  }
  return { title, rest }
}

export default function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const first = node.children[0]
      if (first?.type !== "paragraph") return
      const head = first.children[0]
      if (head?.type !== "text") return
      const m = head.value.match(HEAD)
      if (!m) return

      const type = m[1].toLowerCase()
      head.value = head.value.slice(m[0].length)
      const { title, rest } = splitFirstLine(first.children)
      const titleText = title.length
        ? title
        : [{ type: "text" as const, value: type[0].toUpperCase() + type.slice(1) }]

      const body = node.children.slice(1)
      if (rest.length) body.unshift({ type: "paragraph", children: rest } as Paragraph)

      node.data = {
        hName: "blockquote",
        hProperties: { className: ["callout", type], dataCallout: type },
      }
      node.children = [
        {
          type: "paragraph",
          data: { hName: "div", hProperties: { className: ["callout-title"] } },
          children: [
            {
              type: "text",
              value: "",
              data: { hName: "div", hProperties: { className: ["callout-icon"] } },
            },
            {
              type: "emphasis",
              data: { hName: "div", hProperties: { className: ["callout-title-inner"] } },
              children: titleText,
            },
          ],
        },
        {
          type: "blockquote",
          data: { hName: "div", hProperties: { className: ["callout-content"] } },
          children: body,
        },
      ] as Blockquote["children"]
    })
  }
}

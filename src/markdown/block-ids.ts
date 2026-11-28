// Obsidian 블록 참조 id (^abc123)를 요소의 id로 바꾼다. Quartz와 같은 규칙:
// - 문단 끝의 " ^abc123" → 그 문단의 id
// - "^abc123"만 있는 문단 → 바로 앞 블록(주로 제목)의 id, 문단은 제거
import type { Parent, Root, RootContent, Text } from "mdast"
import { visit } from "unist-util-visit"

const TRAILING = /\s*\^([\w-]+)\s*$/
const ALONE = /^\^([\w-]+)$/

function setId(node: RootContent, id: string) {
  // mdast 타입은 노드마다 data 모양이 달라서, remark-rehype가 읽는 hProperties만 넓게 다룬다
  const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> }
  data.hProperties = { ...data.hProperties, id }
}

export default function remarkBlockIds() {
  return (tree: Root) => {
    visit(tree, (parent) => {
      const children = (parent as Parent).children
      if (!children) return
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (node.type !== "paragraph") continue
        const last = node.children.at(-1)
        if (!last || last.type !== "text") continue
        const text = last as Text
        if (node.children.length === 1 && ALONE.test(text.value.trim())) {
          const id = text.value.trim().slice(1)
          if (i > 0) {
            setId(children[i - 1], id)
            children.splice(i, 1)
            i--
          }
          continue
        }
        const m = text.value.match(TRAILING)
        if (!m) continue
        text.value = text.value.slice(0, m.index)
        setId(node, m[1])
      }
    })
  }
}

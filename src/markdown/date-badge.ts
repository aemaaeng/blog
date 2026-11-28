// 본문의 @YYYY-MM-DD → "YYYY.MM.DD 추가" 뱃지 (Quartz 시절 plugins/date-badge를 옮김)
import type { Root, RootContent, Text } from "mdast"

// 앞이 글자/숫자면 이메일·패키지명 일부로 보고 건너뜀
const DATE_MENTION = /(^|[^\p{L}\p{N}_@.])@(\d{4})-(\d{2})-(\d{2})(?!\d)/gu
// 코드 블록·인라인 코드는 별도 노드라 text만 보면 자동으로 제외된다
const SKIP = new Set(["link", "linkReference"])

function badge(y: string, m: string, d: string): Text {
  const value = `${y}.${m}.${d} 추가`
  return {
    type: "text",
    value,
    data: {
      hName: "span",
      hProperties: { className: ["date-badge"] },
      hChildren: [{ type: "text", value }],
    },
  }
}

function split(value: string) {
  const out: Text[] = []
  let last = 0
  for (const m of value.matchAll(DATE_MENTION)) {
    const [whole, lead, y, mo, d] = m
    const start = m.index + lead.length
    if (start > last) out.push({ type: "text", value: value.slice(last, start) })
    out.push(badge(y, mo, d))
    last = m.index + whole.length
  }
  if (!out.length) return null
  if (last < value.length) out.push({ type: "text", value: value.slice(last) })
  return out
}

function walk(node: Root | RootContent) {
  if (!("children" in node) || SKIP.has(node.type)) return
  const next: RootContent[] = []
  for (const child of node.children as RootContent[]) {
    if (child.type === "text") {
      const parts = split(child.value)
      if (parts) {
        next.push(...parts)
        continue
      }
    } else {
      walk(child)
    }
    next.push(child)
  }
  ;(node as { children: RootContent[] }).children = next
}

export default function remarkDateBadge() {
  return (tree: Root) => walk(tree)
}

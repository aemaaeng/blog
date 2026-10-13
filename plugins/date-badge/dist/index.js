// 빌드 단계 없이 로더가 바로 import 하도록 dist/ 에 순수 JS로 둔다.
// 외부 import 도 두지 않는다 (로더가 dist 의 외부 의존성을 검사함).

export const manifest = {
  name: "date-badge",
  displayName: "Date Badge",
  category: "transformer",
}

// 앞이 글자/숫자면 이메일·패키지명 일부로 보고 건너뜀
const DATE_MENTION = /(^|[^\p{L}\p{N}_@.])@(\d{4})-(\d{2})-(\d{2})(?!\d)/gu

// 코드 블록·인라인 코드는 별도 노드라 text 만 보면 자동으로 제외된다
const SKIP_PARENTS = new Set(["link", "linkReference"])

function badge(y, m, d) {
  return {
    type: "text",
    value: `${y}.${m}.${d} 추가`,
    data: {
      hName: "span",
      hProperties: { className: ["date-badge"] },
      hChildren: [{ type: "text", value: `${y}.${m}.${d} 추가` }],
    },
  }
}

function splitText(value) {
  const out = []
  let last = 0
  for (const match of value.matchAll(DATE_MENTION)) {
    const [whole, lead, y, m, d] = match
    const start = match.index + lead.length
    if (start > last) out.push({ type: "text", value: value.slice(last, start) })
    out.push(badge(y, m, d))
    last = match.index + whole.length
  }
  if (out.length === 0) return null
  if (last < value.length) out.push({ type: "text", value: value.slice(last) })
  return out
}

function walk(node) {
  if (!node.children || SKIP_PARENTS.has(node.type)) return
  const next = []
  for (const child of node.children) {
    if (child.type === "text") {
      const parts = splitText(child.value)
      if (parts) {
        next.push(...parts)
        continue
      }
    } else {
      walk(child)
    }
    next.push(child)
  }
  node.children = next
}

export default function DateBadge() {
  return {
    name: "DateBadge",
    markdownPlugins() {
      return [() => (tree) => walk(tree)]
    },
  }
}

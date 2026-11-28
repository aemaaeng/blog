// 코드 블록(pre)을 div.code-block으로 감싼다 (rehype).
// 복사 버튼을 pre 바깥 기준으로 띄우려고: pre 안에 두면 가로 스크롤할 때 버튼이 같이 밀린다.
// 빌드할 때 감싸 두면 페이지가 뜬 뒤 레이아웃이 바뀌지 않는다. 버튼은 CodeCopy.astro가 붙인다.
import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

export default function rehypeCodeBlock() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, i, parent) => {
      if (node.tagName !== "pre" || !parent || i === undefined) return
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block"] },
        children: [node],
      }
      parent.children.splice(i, 1, wrapper)
      return "skip"
    })
  }
}

// 읽는 시간("6 min read"). Quartz처럼 본문 텍스트로 계산해 올림한다.
// render()의 remarkPluginFrontmatter.minutesRead로 꺼내 쓴다.
import type { Root } from "mdast"
import { toString } from "mdast-util-to-string"
import getReadingTime from "reading-time"
import type { VFile } from "vfile"

export default function remarkReadingTime() {
  return (tree: Root, file: VFile) => {
    const minutes = Math.ceil(getReadingTime(toString(tree, { includeHtml: false })).minutes)
    file.data.astro ??= {}
    file.data.astro.frontmatter = { ...file.data.astro.frontmatter, minutesRead: minutes }
  }
}

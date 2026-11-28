// @ts-check
import { unified } from "@astrojs/markdown-remark"
import { defineConfig } from "astro/config"
import remarkBreaks from "remark-breaks"
import remarkBlockIds from "./src/markdown/block-ids"
import remarkCallouts from "./src/markdown/callouts"
import remarkDateBadge from "./src/markdown/date-badge"
import rehypeLinks from "./src/markdown/links"
import remarkWikilinks from "./src/markdown/wikilinks"

export default defineConfig({
  site: "https://hyemin.dev",
  // Cloudflare Pages 출력 폴더가 public이라 빌드 결과를 public에 둔다.
  // 그래서 Astro의 정적 파일 입력 폴더는 static으로 바꾼다.
  outDir: "./public",
  publicDir: "./static",
  // Quartz와 같은 주소 형식: 글은 <slug>.html(/<slug>), 태그 목록은 tags/index.html(/tags/)
  build: { format: "preserve" },
  trailingSlash: "ignore",
  markdown: {
    // Obsidian 문법을 remark/rehype 플러그인으로 처리하므로 unified 처리기를 쓴다
    // (Astro 7 기본 처리기 Sätteri는 remark 플러그인을 받지 않음)
    processor: unified({
      remarkPlugins: [
        remarkCallouts, // 줄바꿈으로 제목/본문을 나누므로 remark-breaks보다 먼저
        remarkWikilinks,
        remarkBlockIds,
        remarkDateBadge,
        remarkBreaks, // Obsidian처럼 한 줄 줄바꿈 = <br>
      ],
      rehypePlugins: [rehypeLinks],
    }),
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [
        {
          // 6줄 이상 코드 블록만 줄번호 표시 (스타일은 CSS에서 data-line-numbers로)
          pre(node) {
            const lines = this.source.replace(/\n$/, "").split("\n").length
            if (lines >= 6) node.properties["data-line-numbers"] = ""
          },
        },
      ],
    },
  },
})

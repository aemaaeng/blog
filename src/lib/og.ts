// 공유 미리보기 이미지(1200×630)를 빌드할 때 만든다. satori로 SVG를 그리고 resvg로 PNG로 바꾼다.
// 글꼴은 Pretendard를 직접 넣는다. 안 넣으면 한글이 네모(□)로 나온다(Quartz 시절 이미지가 그랬다).
import { readFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"
import satori from "satori"

const fontDir = "./node_modules/pretendard/dist/public/static"
const fonts = [
  { name: "Pretendard", weight: 400 as const, file: "Pretendard-Regular.otf" },
  { name: "Pretendard", weight: 700 as const, file: "Pretendard-Bold.otf" },
].map(({ file, ...font }) => ({
  ...font,
  data: readFileSync(`${fontDir}/${file}`),
  style: "normal" as const,
}))

const icon = `data:image/svg+xml;base64,${readFileSync("./static/icon.svg").toString("base64")}`

// satori는 React 요소 모양의 객체를 받는다. JSX 없이 쓰려고 작은 도우미를 둔다
type Node = { type: string; props: Record<string, unknown> }
function h(type: string, style: Record<string, unknown>, children?: unknown, props = {}): Node {
  return { type, props: { style, children, ...props } }
}

const color = { bg: "#f8f8f9", text: "#222", body: "#555e68", meta: "#8a9099", divider: "#e3e5e8" }

export interface OgInput {
  title: string
  description?: string
  /** 아래쪽 왼쪽 줄 (예: "2026년 7월 21일 · 6 min read") */
  meta?: string
  tags?: string[]
}

export async function renderOg({ title, description, meta, tags = [] }: OgInput) {
  const page = h(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      // satori는 padding을 width 바깥에 더하므로 캔버스에서 padding을 뺀 크기를 직접 준다
      width: 1200 - 64 * 2,
      height: 630 - 56 * 2,
      margin: "56px 64px",
      fontFamily: "Pretendard",
      color: color.text,
    },
    [
      h("div", { display: "flex", alignItems: "center", gap: 16 }, [
        h("img", { width: 48, height: 48 }, undefined, { src: icon, width: 48, height: 48 }),
        h("span", { fontSize: 30, color: color.meta }, "hyemin.dev"),
      ]),
      h(
        "div",
        {
          marginTop: 40,
          fontSize: title.length > 24 ? 60 : 72,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "-0.02em",
          wordBreak: "keep-all",
          // 너무 긴 제목은 세 줄까지만
          display: "block",
          lineClamp: 3,
        },
        title,
      ),
      description
        ? h(
            "div",
            {
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.5,
              color: color.body,
              wordBreak: "keep-all",
              display: "block",
              lineClamp: 2,
            },
            description,
          )
        : null,
      h("div", { flex: 1 }),
      !meta
        ? null
        : h(
            "div",
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 28,
              borderTop: `2px solid ${color.divider}`,
              fontSize: 26,
              color: color.meta,
            },
            [
              h("span", {}, meta ?? ""),
              h(
                "div",
                { display: "flex", gap: 12 },
                tags.map((tag) =>
                  h(
                    "span",
                    {
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: "#eceef1",
                      color: color.body,
                    },
                    `#${tag}`,
                  ),
                ),
              ),
            ],
          ),
    ],
  )

  const tree = h("div", { display: "flex", width: 1200, height: 630, background: color.bg }, [page])
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts })
  return new Resvg(svg).render().asPng()
}

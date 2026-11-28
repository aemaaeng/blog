#!/usr/bin/env node
// 이사 검증: docs/urls.txt(Quartz 시절 주소)가 Astro 빌드 결과(public/)에 모두 있는지 확인한다.
// 사용법: npm run build && node scripts/check-urls.mjs
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = "public"
const expected = readFileSync("docs/urls.txt", "utf8").split("\n").filter(Boolean)

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// 파일 → 주소 (Cloudflare Pages 규칙: a.html → /a, a/index.html → /a/)
const actual = new Set(
  walk(OUT).map((file) => {
    const rel = "/" + relative(OUT, file).normalize("NFC")
    if (rel === "/index.html") return "/"
    if (rel.endsWith("/index.html")) return rel.slice(0, -"index.html".length)
    if (rel.endsWith(".html")) return rel.slice(0, -".html".length)
    return rel
  }),
)

const missing = expected.filter((url) => !actual.has(url))
console.log(`주소 ${expected.length}개 중 ${expected.length - missing.length}개 일치`)
if (missing.length) {
  console.log("없는 주소:")
  for (const url of missing) console.log("  " + url)
  process.exit(1)
}

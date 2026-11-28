#!/usr/bin/env node
// 빌드 결과(public/)의 내부 링크가 모두 실제 페이지·앵커로 이어지는지 확인한다.
// 사용법: npm run build && node scripts/check-links.mjs
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = "public"
const SITE = "https://hyemin.dev"

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// 주소 → 파일 (Cloudflare Pages 규칙: /a → a.html, /a/ → a/index.html)
function fileOf(pathname) {
  const p = decodeURIComponent(pathname).normalize("NFC")
  const candidates = p.endsWith("/")
    ? [join(OUT, p, "index.html")]
    : [join(OUT, p + ".html"), join(OUT, p), join(OUT, p, "index.html")]
  return candidates.find((c) => existsSync(c) && statSync(c).isFile())
}

const idsCache = new Map()
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, "utf8")
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1])))
  }
  return idsCache.get(file)
}

const pages = walk(OUT).filter((f) => f.endsWith(".html"))
const broken = []
let count = 0
for (const page of pages) {
  const html = readFileSync(page, "utf8")
  const base = new URL("/" + relative(OUT, page).replace(/(index)?\.html$/, ""), SITE)
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
    const url = new URL(href.replaceAll("&amp;", "&"), base)
    if (url.origin !== SITE) continue
    count++
    const target = fileOf(url.pathname)
    const hash = decodeURIComponent(url.hash.slice(1)).normalize("NFC")
    if (!target) broken.push(`${page}: ${href} (페이지 없음)`)
    else if (hash && !idsOf(target).has(hash)) broken.push(`${page}: ${href} (앵커 없음)`)
  }
}

console.log(`페이지 ${pages.length}개, 내부 링크 ${count}개 확인`)
if (broken.length) {
  console.log(`깨진 링크 ${broken.length}개:`)
  for (const b of broken) console.log("  " + b)
  process.exit(1)
}
console.log("깨진 링크 0개")

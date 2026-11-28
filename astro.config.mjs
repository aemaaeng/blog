// @ts-check
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://hyemin.dev",
  // Cloudflare Pages 출력 폴더가 public이라 빌드 결과를 public에 둔다.
  // 그래서 Astro의 정적 파일 입력 폴더는 static으로 바꾼다.
  outDir: "./public",
  publicDir: "./static",
  // Quartz와 같은 주소 형식: /<slug> 가 <slug>.html 로 나온다
  build: { format: "file" },
  trailingSlash: "never",
})

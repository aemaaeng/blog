#!/usr/bin/env node
// Spotify refresh token 발급 스크립트 (오노추 위젯용)
//
// 사용법 (일반 터미널에서 실행. Claude Code 안에서 `!`로 돌리면 토큰이 대화 기록에 남는다):
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-token.mjs
//
// 1. 127.0.0.1:8888에 잠깐 서버를 띄우고 Spotify 로그인 페이지를 연다.
// 2. 로그인·허용하면 /callback으로 돌아온 code를 토큰으로 바꾼다.
// 3. refresh token을 터미널에 출력하고, 좋아요 곡 수를 한 번 조회해 동작을 확인한다.
//
// 요청 권한은 user-library-read(좋아요 목록 읽기) 하나뿐이다.
// refresh token은 6개월 뒤 만료된다. 만료되면 이 스크립트를 다시 실행해 Cloudflare 값을 교체한다.

import http from "node:http"
import crypto from "node:crypto"
import { exec } from "node:child_process"

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const PORT = 8888
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`
const SCOPE = "user-library-read"

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET 환경변수가 필요합니다.")
  console.error(
    "예: SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-token.mjs",
  )
  process.exit(1)
}

const state = crypto.randomBytes(16).toString("hex")
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPE,
    redirect_uri: REDIRECT_URI,
    state,
  })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  if (url.pathname !== "/callback") {
    res.writeHead(404).end()
    return
  }

  const finish = (status, msg) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(msg)
    server.close()
  }

  if (url.searchParams.get("state") !== state) return finish(400, "state 불일치. 다시 실행하세요.")
  const error = url.searchParams.get("error")
  if (error) return finish(400, `Spotify 인증 실패: ${error}`)

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: url.searchParams.get("code"),
        redirect_uri: REDIRECT_URI,
      }),
    })
    const token = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(JSON.stringify(token))

    // 동작 확인: 좋아요 곡 수 조회
    const libRes = await fetch("https://api.spotify.com/v1/me/tracks?limit=1", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const lib = await libRes.json()

    console.log("\n✅ 발급 완료\n")
    console.log("SPOTIFY_REFRESH_TOKEN =")
    console.log(token.refresh_token)
    console.log(
      libRes.ok
        ? `\n좋아요 곡 ${lib.total}개 조회 확인. 위 값을 Cloudflare Pages Secret에 넣으세요.`
        : `\n⚠️ 좋아요 목록 조회 실패 (${libRes.status}): ${JSON.stringify(lib)}`,
    )
    finish(200, "발급 완료. 터미널을 확인하고 이 창은 닫아도 됩니다.")
  } catch (e) {
    console.error("토큰 교환 실패:", e.message)
    finish(500, "토큰 교환 실패. 터미널 로그를 확인하세요.")
  }
})

server.listen(PORT, "127.0.0.1", () => {
  console.log("브라우저에서 Spotify 로그인 창을 엽니다. 안 열리면 아래 주소로 접속하세요:\n")
  console.log(authUrl + "\n")
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"
  exec(`${opener} "${authUrl}"`)
})

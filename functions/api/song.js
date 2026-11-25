// GET /api/song — 오노추 위젯용 곡 묶음 (요청마다 무작위)
// Cloudflare Pages Function. 비밀 값은 Pages 환경변수(Secret)에만 있다:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//
// 동작
// 1. 좋아요 목록 "전체"를 하루 한 번(다음 KST 자정까지) 엣지에 캐시한다.
//    캐시가 비었을 때만 refresh token → access token → /me/tracks를 50곡씩 끝까지 읽는다.
// 2. 요청마다 그 전체 목록에서 무작위로 20곡을 골라 내려준다(이 응답은 캐시하지 않음).
//    → 누가 언제 눌러도 전체 좋아요 목록에서 랜덤. Spotify 호출은 캐시가 빌 때만 일어나서
//      방문자·클릭 수가 늘어도 호출 수는 늘지 않는다(개발자 모드 호출 한도 보호).
//
// Spotify 약관: 곡 정보·커버는 원래 곡 링크와 함께 보여줘야 하고(위젯에서 링크),
// 성능을 위한 임시 캐시만 허용된다 → 위젯에 필요한 최소 필드만, 하루 지나면 버리고 새로 읽는다.

const POOL_SIZE = 20
const PAGE_SIZE = 50
const CONCURRENCY = 5

export async function onRequestGet(context) {
  try {
    const library = await getLibrary(context)
    const tracks = sample(library, POOL_SIZE)
    return json({ tracks }, 200, "no-store")
  } catch (e) {
    // 토큰 만료 등. 위젯은 실패하면 스스로 숨는다. 실패는 캐시하지 않는다.
    console.error("api/song:", e.message)
    return json({ error: "unavailable" }, 503, "no-store")
  }
}

// 좋아요 목록 전체(최소 필드). 날짜를 키에 넣어 KST 자정이 지나면 새로 읽는다.
async function getLibrary(context) {
  const { request, env } = context
  const cache = caches.default
  const key = new Request(new URL(`/api/song/library?d=${kstDate()}`, request.url).toString())

  const hit = await cache.match(key)
  if (hit) return hit.json()

  const token = await accessToken(env)
  const first = await savedTracks(token, 0)
  const total = first.total || 0
  if (!total) throw new Error("no saved tracks")

  const offsets = []
  for (let o = PAGE_SIZE; o < total; o += PAGE_SIZE) offsets.push(o)
  const pages = [first]
  for (let i = 0; i < offsets.length; i += CONCURRENCY) {
    const batch = offsets.slice(i, i + CONCURRENCY)
    pages.push(...(await Promise.all(batch.map((o) => savedTracks(token, o)))))
  }

  const seen = new Set()
  const library = []
  for (const page of pages) {
    for (const item of page.items || []) {
      const t = item.track
      if (!t || !t.id || t.is_local || seen.has(t.id)) continue
      seen.add(t.id)
      library.push({
        name: t.name,
        artist: (t.artists || []).map((a) => a.name).join(", "),
        url: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
        // 300px 커버(가운데 크기)가 있으면 그것, 없으면 첫 번째
        image: (t.album?.images?.[1] || t.album?.images?.[0])?.url || null,
      })
    }
  }
  if (!library.length) throw new Error("empty library")

  const res = json(library, 200, `public, max-age=${secondsUntilKstMidnight()}`)
  context.waitUntil(cache.put(key, res))
  return library
}

async function accessToken(env) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    throw new Error("missing Spotify env vars")
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`token ${res.status} ${data.error || ""}`)
  return data.access_token
}

async function savedTracks(token, offset) {
  const url = `https://api.spotify.com/v1/me/tracks?limit=${PAGE_SIZE}&offset=${offset}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`me/tracks ${res.status}`)
  return res.json()
}

// 겹치지 않게 n개 무작위 추출 (부분 Fisher–Yates)
function sample(arr, n) {
  const a = arr.slice()
  const k = Math.min(n, a.length)
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k)
}

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  })
}

// KST(UTC+9) 기준 날짜 YYYY-MM-DD
function kstDate() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}
function secondsUntilKstMidnight() {
  const nowKst = Date.now() + 9 * 3600 * 1000
  const next = Math.ceil((nowKst + 1) / 86400000) * 86400000
  return Math.max(60, Math.floor((next - nowKst) / 1000))
}

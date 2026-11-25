// GET /api/song — 오노추 위젯용 곡 묶음 (요청마다 무작위)
// Cloudflare Pages Function. 비밀 값은 Pages 환경변수(Secret)에만 있다:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//
// 동작: 요청마다 좋아요 목록의 "무작위 구간 2개"(50곡씩)를 읽어 그중 20곡을 무작위로 고른다.
// - 구간 위치가 매번 달라서 목록 전체(약 2,000곡)의 어느 곡이든 뽑힐 수 있다.
// - 목록 전체를 읽지 않는 이유: 무료 플랜은 요청당 CPU 10ms·외부 호출 50개 제한이 있어
//   2,000곡(수 MB JSON)을 매번/매일 파싱하면 한도를 넘는다. 100곡만 읽으면 넉넉하다.
// - Spotify 호출은 요청당 토큰 1번 + 구간 2번. 곡 수(total)만 엣지에 캐시해 재사용한다.
//   access token은 캐시하지 않는다(엣지 캐시 키가 사이트 URL이라 만에 하나 외부로 노출될 여지를 없앰).
// - 위젯은 받은 20곡을 그날 브라우저에 보관하므로, 방문자 1명당 하루 1번만 호출된다.
//
// Spotify 약관: 곡 정보·커버는 원래 곡 링크와 함께 보여줘야 하고(위젯에서 링크),
// 성능을 위한 임시 캐시만 허용된다 → 곡 정보는 저장하지 않고, 곡 수만 짧게 캐시한다.

const POOL_SIZE = 20
const PAGE_SIZE = 50
const WINDOWS = 2

export async function onRequestGet(context) {
  try {
    const token = await accessToken(context)
    const total = await libraryTotal(context, token)

    // 겹치지 않는 시작점 2개 (목록이 작으면 그만큼만)
    const maxStart = Math.max(0, total - PAGE_SIZE)
    const starts = new Set()
    const want = Math.min(WINDOWS, Math.ceil(total / PAGE_SIZE))
    for (let i = 0; i < 10 && starts.size < want; i++) {
      starts.add(Math.floor(Math.random() * (maxStart + 1)))
    }

    const pages = await Promise.all([...starts].map((s) => savedTracks(token, s)))
    const seen = new Set()
    const candidates = []
    for (const page of pages) {
      for (const item of page.items || []) {
        const t = item.track
        if (!t || !t.id || t.is_local || seen.has(t.id)) continue
        seen.add(t.id)
        candidates.push(t)
      }
    }
    if (!candidates.length) throw new Error("no tracks")

    const tracks = sample(candidates, POOL_SIZE).map((t) => ({
      name: t.name,
      artist: (t.artists || []).map((a) => a.name).join(", "),
      url: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
      // 300px 커버(가운데 크기)가 있으면 그것, 없으면 첫 번째
      image: (t.album?.images?.[1] || t.album?.images?.[0])?.url || null,
    }))
    return json({ tracks }, 200, "no-store")
  } catch (e) {
    // 토큰 만료 등. 위젯은 실패하면 스스로 숨는다. 실패는 캐시하지 않는다.
    console.error("api/song:", e.message)
    return json({ error: "unavailable" }, 503, "no-store")
  }
}

// ── 엣지 캐시 헬퍼 (데이터센터 단위, 내부용 가짜 URL을 키로 씀) ──
function cacheKey(request, name) {
  return new Request(new URL(`/api/song/__cache/${name}`, request.url).toString())
}
async function cached(context, name) {
  const hit = await caches.default.match(cacheKey(context.request, name))
  return hit ? hit.json() : null
}
function store(context, name, value, ttl) {
  const res = json(value, 200, `public, max-age=${ttl}`)
  context.waitUntil(caches.default.put(cacheKey(context.request, name), res))
}

async function accessToken(context) {
  const { env } = context
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

// 좋아요 곡 수: 자주 안 바뀌므로 6시간 캐시
async function libraryTotal(context, token) {
  const hit = await cached(context, "total")
  if (hit) return hit.total

  const first = await savedTracks(token, 0, 1)
  const total = first.total || 0
  if (!total) throw new Error("no saved tracks")
  store(context, "total", { total }, 6 * 3600)
  return total
}

async function savedTracks(token, offset, limit = PAGE_SIZE) {
  const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`
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

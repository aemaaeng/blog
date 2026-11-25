// 오노추(오늘의 노래 추천) 위젯
// 헤더 툴바에 "오노추?" 버튼을 넣고, 누르면 팝오버: [노래 추천받기] → 커버가 슬롯처럼 돌다가 한 곡 공개.
// 곡 데이터는 /api/song(Cloudflare Pages Function)에서 받는다.
// 로컬 개발 서버(API 없음)에서는 MOCK을 쓰고, 실제 사이트에서 API가 실패하면(토큰 만료 등) 위젯을 아예 숨긴다.
// Quartz SPA는 이동할 때 head 스크립트를 다시 실행하므로 전역 플래그로 한 번만 초기화한다.
;(function () {
  if (window.__onochu) return
  window.__onochu = true

  var MOCK = [
    {
      name: "Uchida 1",
      artist: "GINTA & Odakei",
      url: "https://open.spotify.com/",
      color: "#c9b79c",
    },
    { name: "Supernova", artist: "aespa", url: "https://open.spotify.com/", color: "#8fb3d9" },
    { name: "Ditto", artist: "NewJeans", url: "https://open.spotify.com/", color: "#b9d3c2" },
    { name: "Love wins all", artist: "IU", url: "https://open.spotify.com/", color: "#d9a7b0" },
    { name: "Hype Boy", artist: "NewJeans", url: "https://open.spotify.com/", color: "#e3d08f" },
    { name: "밤양갱", artist: "비비 (BIBI)", url: "https://open.spotify.com/", color: "#a99bd1" },
  ]

  var DEV = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
  var tracks = null
  var loading = null
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // 오늘 뽑기 상태: 곡 순서를 섞어 겹치지 않게 하나씩 꺼내고, 다 꺼내면 끝.
  // 브라우저에 그날 하루만 저장(새로고침·페이지 이동해도 이어짐, 날짜가 바뀌면 초기화).
  var KEY = "onochu"
  var deck = null // 섞인 곡 인덱스
  var pos = 0 // 다음에 꺼낼 위치 = 지금까지 뽑은 개수

  function today() {
    var d = new Date()
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
  }
  // 저장 형식: { date, tracks(그날 받은 20곡), deck, pos }
  // /api/song은 요청마다 다른 20곡을 주므로, 그날은 처음 받은 묶음을 그대로 이어 쓴다.
  function save() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ date: today(), tracks: tracks, deck: deck, pos: pos }),
      )
    } catch (e) {}
  }
  function stored() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null")
      if (s && s.date === today() && s.tracks && s.tracks.length) return s
    } catch (e) {}
    return null
  }
  function fresh() {
    deck = tracks.map(function (_, i) {
      return i
    })
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var t = deck[i]
      deck[i] = deck[j]
      deck[j] = t
    }
    pos = 0
    save()
  }

  function load() {
    if (loading) return loading
    var s = stored()
    if (s) {
      tracks = s.tracks
      deck = s.deck
      pos = s.pos
      loading = Promise.resolve(tracks)
      return loading
    }
    loading = fetch("/api/song")
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then(function (d) {
        if (!d || !d.tracks || !d.tracks.length) throw new Error("empty")
        tracks = d.tracks
      })
      .catch(function () {
        tracks = DEV ? MOCK : null
      })
      .then(function () {
        if (tracks) fresh()
        return tracks
      })
    return loading
  }

  function drawn() {
    return deck.slice(0, pos).map(function (i) {
      return tracks[i]
    })
  }
  function draw() {
    var t = tracks[deck[pos]]
    pos++
    save()
    return t
  }

  function cover(t) {
    var el = document.createElement("div")
    el.className = "onochu-cover"
    if (t.image) {
      var img = document.createElement("img")
      img.src = t.image
      img.alt = ""
      el.appendChild(img)
    } else {
      el.style.background = t.color || "var(--lightgray)"
    }
    return el
  }

  function trackLink(t, cls) {
    var row = document.createElement("a")
    row.className = cls
    row.href = t.url
    row.target = "_blank"
    row.rel = "noopener"
    row.appendChild(cover(t))
    var meta = document.createElement("div")
    meta.className = "onochu-meta"
    var name = document.createElement("strong")
    name.textContent = t.name
    var artist = document.createElement("span")
    artist.textContent = t.artist
    meta.append(name, artist)
    row.appendChild(meta)
    return row
  }

  function button(text, act, ghost) {
    var b = document.createElement("button")
    b.type = "button"
    b.className = "onochu-btn" + (ghost ? " onochu-btn-ghost" : "")
    b.dataset.act = act
    b.textContent = text
    return b
  }

  function render(panel, state, t) {
    panel.innerHTML = ""
    panel.dataset.state = state
    if (state === "idle") {
      panel.innerHTML =
        '<p class="onochu-title">오늘의 노래 추천</p>' +
        '<p class="onochu-sub">제 좋아요 리스트에서 골라드려요</p>'
      panel.appendChild(button("노래 추천받기", "roll"))
      return
    }
    if (state === "rolling") {
      var slot = document.createElement("div")
      slot.className = "onochu-slot"
      panel.appendChild(slot)
      var n = 0
      var timer = setInterval(function () {
        slot.innerHTML = ""
        slot.appendChild(cover(tracks[n++ % tracks.length]))
      }, 80)
      setTimeout(function () {
        clearInterval(timer)
        render(panel, "result", draw())
      }, 900)
      return
    }
    if (state === "result") {
      var row = trackLink(t, "onochu-track")
      var listen = document.createElement("span")
      listen.className = "onochu-listen"
      listen.textContent = "Spotify에서 듣기 ↗"
      row.querySelector(".onochu-meta").appendChild(listen)
      panel.appendChild(row)
      var left = deck.length - pos
      panel.appendChild(
        button(left > 0 ? "다른 곡" : "오늘의 마지막 곡이에요", left > 0 ? "roll" : "end", true),
      )
      return
    }
    if (state === "end") {
      panel.innerHTML =
        '<p class="onochu-title">오늘 준비한 곡은 여기까지예요</p>' +
        '<p class="onochu-sub">내일 새 곡으로 채워둘게요 ♪︎</p>'
      panel.appendChild(button("추천받은 곡 보기 (" + pos + ")", "list"))
      return
    }
    // list: 오늘 추천받은 곡 (최근 것부터)
    var head = document.createElement("p")
    head.className = "onochu-title onochu-list-title"
    head.textContent = "오늘 추천받은 곡 " + pos
    panel.appendChild(head)
    var list = document.createElement("div")
    list.className = "onochu-list"
    drawn()
      .reverse()
      .forEach(function (x) {
        list.appendChild(trackLink(x, "onochu-list-item"))
      })
    panel.appendChild(list)
  }

  // 패널을 열 때 보여줄 화면: 다 뽑은 날이면 끝 화면, 아니면 처음 화면
  function entry(panel) {
    load().then(function () {
      if (pos >= deck.length) render(panel, "end")
      else if (!panel.dataset.state || panel.dataset.state === "end") render(panel, "idle")
    })
  }

  function roll(panel) {
    load().then(function () {
      if (pos >= deck.length) return render(panel, "end")
      if (reduce) render(panel, "result", draw())
      else render(panel, "rolling")
    })
  }

  function mount() {
    var bar = document.querySelector(".page-header .flex-component")
    if (!bar || bar.querySelector(".onochu")) return
    var wrap = document.createElement("div")
    wrap.className = "onochu"
    var trigger = document.createElement("button")
    trigger.type = "button"
    trigger.className = "onochu-trigger"
    trigger.setAttribute("aria-expanded", "false")
    trigger.textContent = "\u266A\uFE0E 오노추?" // ♪ + 텍스트 표기 선택자(이모지로 안 그려지게)
    var panel = document.createElement("div")
    panel.className = "onochu-panel"
    panel.hidden = true
    wrap.append(trigger, panel)
    bar.insertBefore(wrap, bar.firstChild)

    trigger.addEventListener("click", function (e) {
      e.stopPropagation()
      var open = panel.hidden
      panel.hidden = !open
      trigger.setAttribute("aria-expanded", String(open))
      if (open) entry(panel)
    })
    panel.addEventListener("click", function (e) {
      e.stopPropagation()
      var act = e.target.closest("[data-act]")
      if (!act) return
      if (act.dataset.act === "roll") roll(panel)
      else if (act.dataset.act === "end") render(panel, "end")
      else if (act.dataset.act === "list") render(panel, "list")
    })
  }

  // 바깥 클릭·Esc로 닫기 (페이지 이동마다 위젯이 새로 붙으므로 문서 단위로 한 번만 건다)
  function closeAll() {
    document.querySelectorAll(".onochu-panel").forEach(function (p) {
      p.hidden = true
    })
    document.querySelectorAll(".onochu-trigger").forEach(function (b) {
      b.setAttribute("aria-expanded", "false")
    })
  }
  document.addEventListener("click", closeAll)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll()
  })

  // 곡을 못 받으면(실제 사이트에서 API 실패) 버튼 자체를 만들지 않는다
  function init() {
    load().then(function (t) {
      if (t) mount()
    })
  }
  document.addEventListener("DOMContentLoaded", init)
  document.addEventListener("nav", init)
  init()
})()

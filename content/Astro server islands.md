---
title: Astro server islands
description: 왜 만들어졌고 어떤 점이 Streaming SSR과 다른지 살펴봅니다.
date: 2026-07-21
tags:
  - frontend
---

- [[Streaming SSR]]과는 무엇이 다른지?
- server islands는 왜 만들어진 건지?

server islands는 지정된 fallback을 먼저 받고 `/_server-islands/`로 단독 요청을 보내 응답을 받아와 렌더링하는 방식. `server:defer` 지시자로 사용할 수 있음.

### Streaming SSR과는 무엇이 다른지?
https://docs.astro.build/en/recipes/streaming-improve-page-performance/

Astro에서는 기본적으로 스트리밍을 제공함.
위 문서에서 말하는 내용은 frontmatter에서 await으로 데이터를 다 기다리면 그만큼 렌더링이 지연될 수 있으니, promise 자체를 템플릿 내부로 옮기거나 자식 컴포넌트로 분리하라는 것. 

Streaming SSR은 하나의 응답을 chunk로 쪼개 보내는 기법이고, server islands는 응답 자체가 분리되어 있다. 
> Conceptually this is similar to the concept of Suspense in React, Solid, etc. but with the key difference that the deferred island is rendered as a separate HTTP request.
> https://astro.build/blog/future-of-astro-server-islands/

### server islands는 왜 만들어진 건지?
astro에서 기본으로 적용되는 스트리밍은 in-order 방식이다. 응답을 chunk로 쪼개 보내서 TTFB와 첫 페인트는 전체 렌더 시간과는 분리된다. 하지만 위-아래 순서를 바꿀 수는 없기 때문에 위쪽의 느린 컴포넌트가 아래 컴포넌트 응답을 막아버릴 수 있다.
Next.js Suspense는 fallback을 먼저 보내고 콘텐츠가 준비되면 하나의 응답 안에서 순서를 바꿔 보여주는 방식이라면, Astro는 응답 자체를 분리해버리는 방식이다.

단일 응답에서 chunk로 분리하는 방식은 cdn 캐싱을 어렵게 만들 수 있다. server islands는 html로부터 별개의 리소스로 분리되기 때문에 캐싱이 가능해진다. html 문서를 캐싱해두고 개인화 영역만 server islands로 만들어 매번 요청하는 조합도 가능하다. 
[[Streaming SSR#^702051|Streaming SSR과 html 캐싱을 동시에 적용할 수 있는지?]]

여담: `/_server-islands` 요청을 크롤러가 읽어가 구글 서치콘솔에서 미색인 url로 잡히는 이슈가 있었는데, 응답에 X-Robots-Tag noindex를 붙이는 방식으로 해결되었다. 애초에 안 긁어가게 하려면 robots.txt에도 추가하면 좋을 듯
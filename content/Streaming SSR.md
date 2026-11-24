---
title: Streaming SSR
description: 일반 SSR과의 차이, SEO 영향, 적용 시 주의할 점을 정리합니다.
date: 2026-07-21
tags:
  - frontend
  - Next.js
  - Astro
---

https://nextjs.org/docs/app/guides/streaming

궁금했던 것
- Streaming SSR이 무엇인지, SSR과는 뭐가 다른지?
- SEO에 영향을 주는지?
	- 청크로 받은 콘텐츠가 source html에 포함되어 크롤러도 읽어갈 수 있게 되는 건지?
- (2026-07-24 추가) Streaming SSR과 html 캐싱을 동시에 적용할 수도 있는지?
- (2026-07-29 추가) 구현만 하면 알아서 잘 적용되는 걸까?

### 무엇인지?
일반 SSR에서는 서버에서 HTML을 다 만들어서 보내주기 때문에 하나의 느린 API 응답이 HTML 응답 자체를 지연시킬 수 있음. 
chunked transfer encoding을 활용해 준비되는대로 응답을 보내는 방식이 Streaming SSR (=하나의 응답을 chunk로 쪼갠다)

서버가 나머지를 만드는 동안 HTML 렌더링은 시작됨 
full HTML을 한 번에 다 받는 대신 헤더, 푸터 등의 레이아웃을 먼저 그려두고 동적인 콘텐츠를 나중에 불러올 수 있음. 

### SEO에 영향이 있는지?
아래는 Next.js 기준으로 찾아본 내용. 
프레임워크에 따라 구현 방식이 다르기 때문에 단정지어 말할 수는 없음. 

- [vercel blog 글](https://vercel.com/kb/guide/does-streaming-affect-seo)

vercel 블로그에서는 200으로 html이 응답되니 seo에 영향이 없다고 말하고 있다. 

- [Next.js Github Discussion](https://github.com/vercel/next.js/discussions/50829)

자바스크립트를 지원하는 크롤러에서는 대부분 괜찮음. 단, Probably OK라 확신할 수는 없음. 
구글은 크롤링과 렌더링 큐가 별도로 있음. html을 먼저 받고 나서 렌더링하려고 다시 돌아온다. html보다 자바스크립트 실행이 더 비싸기 때문. 
-> (처음 이해한 내용) 자주 바뀌는 데이터에 streaming을 적용한다면 SEO에 영향이 있을 수도 있다고 이해함. 크롤링 큐에 넣어서 html만 받아두고 렌더링이 아직 안 된 상태에서 그 사이에 콘텐츠 변경이 일어날 수도 있기 때문
지연된 컴포넌트는 숨겨진 div에 렌더링되기 때문에 context에서 벗어남. 시맨틱이 깨질 수도 있다. 
Disable JavaScript로 확인하면 로딩 ui가 뜨기 때문에 SEO에 영향 있을 것이라는 의견도 있다. 
-> (2026-07-27 추가) Next.js의 Suspense는 원래 콘텐츠가 들어가야 할 자리를 fallback이 차지하는 건 맞음. 하지만 hidden div이더라도 크롤러는 읽어갈 수 있기 때문에 콘텐츠가 아예 안 담기는 것은 아니다. document의 순서가 깨져버리는 것이 문제다. 

[[Astro server islands]]는 응답 자체가 분리되어 있기 때문에 Disable JavaScript를 했을 때 fallback만 뜨는 것이 맞다. 
### Streaming SSR과 html 캐싱을 동시에 적용할 수도 있는지?
^702051

응답 전체를 캐싱하는 것은 가능한데, 결국은 하나의 응답이기 때문에 응답 중 일부만 캐싱하는 것은 불가능하다. 

- 응답을 나눈다 → 조각마다 독립 URL이라 각자 캐싱 가능. [[Astro server islands]]
- 응답 안에서 조립한다 → Next.js PPR(Partial Prerendering, 찾아보고 추가할 예정) 

### 구현만 하면 알아서 잘 적용되는 걸까?
(2026-08-08 추가)
스트리밍을 코드상 잘 구현했다면, 인프라상에도 html 요청이 전송되고 응답이 오기까지 중간에 스트리밍을 방해하는 요소가 없어야 비로소 스트리밍의 효과를 볼 수 있다. 
서버로 nginx를 사용하고 있다면 nginx 버퍼링 설정이 꺼져있는지 확인해봐야 한다. 
nginx 버퍼링은 백엔드와 느린 클라이언트를 분리하기 위한 용도이다. 클라이언트가 느려서 서버의 응답을 받지 못하는 상황일 때 서버는 클라이언트를 기다리며 커넥션과 메모리를 소진할 수 있다. 이 때 응답을 버퍼에 담아두고, 서버는 다음 응답을 처리하기 위한 용도로 버퍼링 옵션이 사용된다. 
스트리밍을 쓰려면 이 버퍼링 옵션이 꺼져 있어야 하는데, 두 방법이 있다. 
1. `nginx.conf`에서 `proxy_buffering` 옵션 비활성화
	- 전역 server 옵션에 켤수도 있지만, 스트리밍을 적용하지 않을 페이지에도 영향이 갈 수 있기 때문에 location 블록으로 특정 경로에만 한정지어 적용할 수도 있다.
2. html 응답 헤더에 `X-Accel-Buffering: no`를 지정

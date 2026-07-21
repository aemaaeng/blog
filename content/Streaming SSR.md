---
title: Streaming SSR
date: 2026-07-21
tags:
  - frontend
---

https://nextjs.org/docs/app/guides/streaming

궁금했던 것
- Streaming SSR이 무엇인지, SSR과는 뭐가 다른지?
- SEO에 영향을 주는지?
	- 청크로 받은 콘텐츠가 source html에 포함되어 크롤러도 읽어갈 수 있게 되는 건지?

### 무엇인지?
일반 SSR에서는 서버에서 HTML을 다 만들어서 보내주기 때문에 하나의 느린 API 응답이 HTML 응답 자체를 지연시킬 수 있음. 
chunked transfer encoding을 활용해 준비되는대로 응답을 보내는 방식이 Streaming SSR

서버가 나머지를 만드는 동안 HTML 렌더링은 시작됨 
full HTML을 한 번에 다 받는 대신 헤더, 푸터 등의 레이아웃을 먼저 그려두고 동적인 콘텐츠를 나중에 불러올 수 있음. 

### SEO에 영향이 있는지?
아래는 Next.js 기준으로 찾아본 내용. 
프레임워크에 따라 구현 방식이 다르기 때문에 단정지어 말할 수는 없음. (Astro에서는 또 다른 방식인 걸로 알고 있다. 찾아보고 노트 추가 예정)

- [vercel blog 글](https://vercel.com/kb/guide/does-streaming-affect-seo)

vercel 블로그에서는 200으로 html이 응답되니 seo에 영향이 없다고 말하고 있다. 

- [Next.js Github Discussion](https://github.com/vercel/next.js/discussions/50829)

자바스크립트를 지원하는 크롤러에서는 대부분 괜찮음. 단, Probably OK라 확신할 수는 없음. 
구글은 크롤링과 렌더링 큐가 별도로 있음. html을 먼저 받고 나서 렌더링하려고 다시 돌아온다. html보다 자바스크립트 실행이 더 비싸기 때문. 
-> 자주 바뀌는 데이터에 streaming을 적용한다면 SEO에 영향이 있을 수도 있다고 이해함. 크롤링 큐에 넣어서 html만 받아두고 렌더링이 아직 안 된 상태에서 그 사이에 콘텐츠 변경이 일어날 수도 있기 때문
지연된 컴포넌트는 숨겨진 div에 렌더링되기 때문에 context에서 벗어남. 시맨틱이 깨질 수도 있다. 
Disable JavaScript로 확인하면 로딩 ui가 뜨기 때문에 SEO에 영향 있을 것이라는 의견도 있다. 

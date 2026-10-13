---
title: 잘 쓰고 있는 ai 워크플로우
draft: false
description: 업무에 활용 중인 스킬, mcp를 정리해봅니다.
tags:
  - ai
  - frontend
date: 2026-08-30
---
점검 차원에서 정리해본다.
스킬은 주로 입맛에 맞게 만들어서 사용하고 있다.
또 유용한 걸 알게되면 추가할 예정이다.

## Skills

1. PR 생성 - `커스텀 스킬`
	- 인자로 PR 생성할 base 브랜치를 넣으면 PR을 만든다. 프로젝트 컨벤션에 맞게 PR body 작성, label 부착, Assignee 지정을 해준다.
	- 스킬이라는 걸 처음 알게 됐을 때 이걸 가장 먼저 만들었다.
	- 처음에는 PR 내용을 처음 보는 사람이 이해하기 어려울 정도로 너무 자세하게 기재해버려서 무엇을 위해 어떤 부분을 수정했는지 현상 위주로 요약해서 쓰도록 지침을 추가했다.
	- 예전에는 github 웹 들어가서 브랜치 지정하고, PR 제목 쓰고 내용 쓰느라 시간이 꽤나 들었었는데 이제는 커맨드 하나로 뚝딱이다. 아마 다들 자신만의 PR 생성 스킬은 쓰고 있지 않을까?
2. PR 리뷰 - `커스텀 스킬`
	- PR을 리뷰하고 결과를 보고하는 스킬이다. 어떤 목적의 PR인지, 구현상 이슈가 있는지, 이슈가 있다면 심각도는 어느 정도인지, PR 내용과 diff는 일치하는지 정리해서 보고한다.
	- 회사 레포에 AI 리뷰봇도 연동이 되어있어서 봇이 단 코멘트가 유효한 지적인지 아닌지도 포함하도록 했다.
	- 주로 바쁠 땐 diff를 하나하나 볼 수가 없다보니 PR이 올라오면 먼저 리뷰 스킬을 돌려놓고 다른 일 하다가 스킬이 끝난 후에 본격적으로 리뷰를 하는 편이다.
3. [explain-diff](https://gist.github.com/geoffreylitt/a29df1b5f9865506e8952488eac3d524)
	- 큰 변경이거나 복잡한 작업일 때 리뷰하는 팀원들의 이해를 돕기 위해 쓰고 있다. 
		- [[2026년 상반기 간단히 돌아보기#^b92abd|회고]]에서도 언급했던 스킬
4. [claude-video](https://github.com/bradautomates/claude-video)
	- 동영상을 붙여넣으면 프레임별로 분석해주는 스킬이다.
	- 주로 QA에서 나온 이슈 영상을 분석하는데 쓰고 있다. 음성 분석 기능도 있는데 이건 아직 필요없어서 안 쓰고 있다. 
 5. checkpoint - `커스텀 스킬`
	- ai에게 작업을 시키고 난 후 수많은 diff가 생겨났을 때 diff를 커밋 단위로 나눈 후 스스로 코드리뷰까지 거쳐 보고하도록 하는 스킬이다.
	- 리뷰는 레포지토리에 정의된 리뷰 스킬이 있다면 그걸 사용하고, 아니라면 Claude 내장 code-review를 사용하도록 에스컬레이션해두었다.
	- 리뷰 결과는 Critical, Warning, Good으로 나눠서 제공한다.
	- 커밋은 직접 하고 있어서 레포 컨벤션에 맞게 커밋 메시지까지 제안하도록 하고 있다.
6. change-tree - `커스텀 스킬`
	- 작업 착수 전 어떤 디렉토리의 어떤 파일에 변경이 일어나게 될 예정인지 트리 구조로 그려서 보여주는 스킬이다. ai를 쓰려면 수많은 텍스트를 소화해내야 하다보니 이렇게 시각화된 결과물이 효율을 높여줄 때가 있어서 종종 사용하고 있다. 
7. comment-diet - `커스텀 스킬`
	- ai 산출물에서 주석이 장황하게 만들어졌을 때 코드로 충분히 파악 가능한 내용은 주석에서 제외하고, 맥락으로 파악하기 어려운 것들만 남기도록 하는 스킬이다. 작업 지침과 유저 CLAUDE.md에 아무리 추가해도 말을 안 듣길래 그냥 전용 스킬을 하나 만들어버렸다.
8. work-mode - `커스텀 스킬` @2026-10-13
	- 한 세션과 연관된 어떤 다른 작업을 진행하고 싶을 때 서브에이전트, 브랜치, 포크, 세션 분리(세션 간 메시징), `dx:clone` 중 어떤 방법으로 진행하는 게 효율적인지 판단해주는 스킬이다.
		- ex. 뭔가를 개발하다가 슬랙 히스토리를 조사시키고 싶을 때, 관련 레포지토리 코드를 조사하고 싶을 때 등
	- 가끔 세션에서 작업 하나를 다 시켜버려서 컨텍스트를 낭비하는 경우가 있는데 그때마다 위 방법 중 뭘 쓸지 판단하는 데에도 은근 고민될 때가 있어서 만들었다.

## MCP, CLI

1. [Notion mcp](https://www.notion.com/ko/help/notion-mcp)
	- 작업 카드에 작업 관련 메모를 모두 적어놓고 source of truth처럼 사용하고 있다. 
	- 문서 초안 작성할 때 좋다. 
2. [Slack mcp](https://slack.com/intl/ko-kr/help/articles/48855576908307-Slack%EC%9D%98-%EB%AA%A8%EB%8D%B8-%EC%BD%98%ED%85%8D%EC%8A%A4%ED%8A%B8-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B0%80%EC%9D%B4%EB%93%9C)
	- 비교적 최근부터 사용하기 시작했다. 모든 논의가 슬랙에서 이루어지다보니 논의 내용 요약, 맥락 주입, 커뮤니케이션 피드백 등등 아주 유용하게 쓰고 있다. 
	- 어떤 이슈가 있을 때 사내 다른 프로젝트에서 비슷한 이슈가 생긴 적이 있었는지 찾아볼 때 요긴하다. 
	- 나는 그날그날 업무 내용을 개인 DM에 모두 메모해두는 편인데, 주말이나 저녁에 정리할 때에도 유용하게 쓰고 있다. @2026-10-13
3. [Figma mcp](https://www.figma.com/ko-kr/mcp-catalog/)
4. [Chrome devtools mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
	- 작업물 검증, 디버깅에 유용하게 사용하고 있다. 
	- 비슷한 툴로 [agent-browser](https://github.com/vercel-labs/agent-browser)도 있는데 아직 둘의 차이를 잘 모르겠다
5. [Grafana mcp](https://github.com/grafana/mcp-grafana)
	- 서비스 장애 및 성능 모니터링할 때 사용하고 있다.
6. [aws cli](https://aws.amazon.com/ko/cli/)
	- 인프라 작업에 사용한다. 조회성 작업에만 쓰고 Create, Update, Delete성 작업은 수행 못하도록 하고 있다. 
	- [aws login 커맨드](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html#cli-configure-sign-in-login-command)로 aws 콘솔 로그인 후에 세션 연동해서 사용하고 있다. 
	- 서버 상태가 안 좋을 때, Cloudfront 트래픽 계산 시 사용
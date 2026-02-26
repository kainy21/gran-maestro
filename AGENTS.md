## AGENTS.md instructions

이 프로젝트의 기본 지침입니다.

### OMx 트리거 자동 분기 규칙

- 사용자 메시지에 트리거(`/prompts:...`, `$...`)가 명시되지 않으면 기본은 **`/prompts:executor`** 모드로 처리한다.
- 아래 조건에서 모드 분기를 수행한다.
  - 아키텍처 설계, 시스템 분할, 인터페이스/데이터 흐름 같은 요청이 있으면 **`/prompts:architect`**
  - 프로젝트 전체 계획, 일정, 우선순위, 범위/의존성 정리가 필요하면 **`/prompts:planner`**
- 아래 스킬 트리거가 메시지에 명시되면 우선 적용한다:  
  `$analyze`, `$autopilot`, `$build-fix`, `$code-review`, `$deepsearch`, `$front...`(관련 키워드), `$security-review`, `$ultraqa`, `$ultrawork`, `$swarm`
- 요청이 모호할수록, 먼저 실행 가능한 가장 짧은 단위로 진행 후 중간점검한다.


---
name: dashboard
description: "로컬 대시보드 서버를 시작하거나 엽니다. 사용자가 '대시보드', '대시보드 열어', '모니터링'을 말하거나 /mst:dashboard를 호출할 때 사용. CLI 터미널 상태 확인에는 /mst:list 또는 /mst:inspect를 사용."
user-invocable: true
argument-hint: "[--port {포트}] [--stop] [--hub]"
---

# maestro:dashboard

Gran Maestro 로컬 대시보드 서버를 시작하고 브라우저에서 엽니다.
워크플로우 그래프, 에이전트 활동 스트림, 문서 브라우저를 제공합니다.

## 요구사항

- **Deno**: 런타임 필수. 미설치 시 https://deno.land 에서 설치 안내

## 실행 프로토콜

### 1. 플러그인 루트 경로 확인
스킬의 베이스 디렉토리는 컨텍스트에 "Base directory for this skill"로 제공됩니다.
플러그인 루트는 스킬 베이스 디렉토리에서 2단계 상위 디렉토리입니다.
패턴: 베이스 디렉토리가 `{X}/skills/md`이면 플러그인 루트는 `{X}`입니다.

### 2. 워크트리 `.gran-maestro/` 디렉토리 확인
```bash
mkdir -p .gran-maestro
```

### 3. Deno 설치 확인
```bash
deno --version
```
실패 시: 사용자에게 https://deno.land 설치 안내 후 종료

### 4. 인자 파싱
- `--stop`: 서버 중지 플래그
- `--port <N>`: 포트 번호 (기본값: 3847)
- `--hub`: 허브 모드 플래그

### 5. `--stop` 처리
```bash
lsof -ti :<port> | xargs kill
```
허브 모드(`--hub`)에서는:
```bash
HUB_PID=$(cat ~/.gran-maestro-hub/hub.pid 2>/dev/null)
if [ -n "$HUB_PID" ]; then kill $HUB_PID; fi
```
성공 시 사용자에게 중지 확인 메시지 출력 후 종료

### 6. 포트 사용 중 확인
```bash
lsof -i :<port>
```
- 레거시: 이미 실행 중이면 9단계(토큰 URL 파싱)로 건너뛰고 브라우저 열기
- 허브 모드(`--hub`): 포트 사용 중이면 허브 서버가 이미 실행 중인 것으로 판단하고 9-hub(프로젝트 등록)로 건너뜀

### 7. 서버 시작 (백그라운드)
```bash
deno run --allow-net --allow-read --allow-write --allow-env "{plugin_root}/src/server.ts" > /tmp/gran-maestro-dashboard.log 2>&1 &
```
PID를 기록하고 `.gran-maestro/dashboard.pid` 파일에 저장
허브 모드(`--hub`):
```bash
# 허브 모드
mkdir -p ~/.gran-maestro-hub
deno run --allow-net --allow-read --allow-write --allow-env "{plugin_root}/src/server.ts" --hub > /tmp/gran-maestro-hub.log 2>&1 &
```
허브 모드에서는 PID가 `~/.gran-maestro-hub/hub.pid`에 자동 기록됨

### 8. 서버 시작 대기 및 검증
2초 대기 후:
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:<port>/favicon.ico
```
HTTP 200 응답 확인. 실패 시 로그(`/tmp/gran-maestro-dashboard.log`) 출력 후 에러 보고

### 9. 토큰 URL 파싱
서버 stdout에서 토큰 URL 추출 (로그 파일에서 읽기):
패턴: `Dashboard: http://localhost:<PORT>?token=<TOKEN>`
- 레거시: 위와 같이 토큰 추출 유지
- 허브 모드(`--hub`):
```bash
HUB_TOKEN=$(cat ~/.gran-maestro-hub/hub.token)
```

### 9-hub. 프로젝트 등록
허브 모드에서 프로젝트를 등록한다.
```bash
PROJECT_PATH="$(pwd)/.gran-maestro"
PROJECT_NAME="$(basename $(pwd))"
HUB_TOKEN=$(cat ~/.gran-maestro-hub/hub.token)
REGISTER_RESULT=$(curl -s -X POST "http://127.0.0.1:<port>/api/projects" \
  -H "Authorization: Bearer $HUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$PROJECT_NAME\", \"path\": \"$PROJECT_PATH\"}")
PROJECT_ID=$(echo $REGISTER_RESULT | jq -r '.id')
```

### 10. 브라우저 실행
- macOS: `open "http://localhost:<port>?token=<token>"`
- Linux: `xdg-open "http://localhost:<port>?token=<token>"`
- 허브 모드(`--hub`):
  - macOS: `open "http://localhost:<port>?project=<projectId>&token=<hubToken>"`
  - Linux: `xdg-open "http://localhost:<port>?project=<projectId>&token=<hubToken>"`

### 11. 사용자 안내
```
Gran Maestro Dashboard running at http://localhost:<port>
Browser opened with authentication token
PID: <pid> (saved to .gran-maestro/dashboard.pid)
```
허브 모드(`--hub`):
```
Gran Maestro Hub Dashboard running at http://localhost:<port>
Project registered: <PROJECT_NAME> (ID: <PROJECT_ID>)
Browser opened with project token
```

## 대시보드 뷰

| 뷰 | 설명 |
|---|------|
| Workflow Graph | Phase 간 전환 노드-엣지 그래프, 실행 중 노드 애니메이션 |
| Agent Stream | 에이전트 프롬프트/결과 실시간 스트리밍 |
| Documents | .gran-maestro/ 하위 MD/JSON 마크다운 렌더링 |
| Dependency Graph | 요청 간 blockedBy/blocks 관계 시각화 |
| Settings | config.json 웹 수정 |

## 비교 (레거시 모드 / 허브 모드)

| 항목 | 레거시 모드 | 허브 모드 |
|------|------------|----------|
| PID 파일 | .gran-maestro/dashboard.pid | ~/.gran-maestro-hub/hub.pid |
| 토큰 | 서버 stdout에서 추출 | ~/.gran-maestro-hub/hub.token |
| 로그 | /tmp/gran-maestro-dashboard.log | /tmp/gran-maestro-hub.log |

## 옵션

- `--port {N}`: 포트 변경 (기본: 3847)
- `--stop`: 실행 중인 대시보드 서버 중지
- `--hub`: 허브 모드로 서버 시작. 하나의 서버 인스턴스에서 여러 프로젝트를 관리

## 예시

```
/mst:dashboard              # 대시보드 시작/열기
/mst:dashboard --stop       # 대시보드 중지
/mst:dashboard --port 8080  # 커스텀 포트
/mst:dashboard --hub        # 허브 모드 시작
/mst:dashboard --hub --stop # 허브 모드 중지
```

## 문제 해결

- "Deno를 찾을 수 없음" → `deno --version`으로 설치 확인. https://deno.land 에서 설치
- "포트가 이미 사용 중" → 기존 대시보드가 실행 중일 수 있음. `/mst:dashboard --stop`으로 중지 후 재시작. 또는 `--port`로 다른 포트 사용
- "서버 시작 실패" → `/tmp/gran-maestro-dashboard.log` 로그 파일 확인. Deno 권한 문제 시 `--allow-net` 등 플래그 확인
- "브라우저가 열리지 않음" → 토큰 URL을 수동으로 복사하여 브라우저에 입력
- "허브 서버가 시작되지 않음" → `~/.gran-maestro-hub/` 디렉토리 권한 확인
- "프로젝트 등록 실패" → 현재 프로젝트 루트에 `.gran-maestro/` 디렉토리가 있는지 확인
- "허브 토큰을 찾을 수 없음" → `~/.gran-maestro-hub/hub.token` 파일 존재 여부 확인

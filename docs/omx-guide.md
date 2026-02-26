# OMX (oh-my-codex) 가이드

## OMX란?

oh-my-codex(OMX)는 Codex CLI를 위한 **프롬프트 라우팅·스킬 트리거 시스템**입니다.

- 사용자 메시지에 포함된 트리거(`/prompts:*`, `$...`)를 감지해 적절한 실행 모드로 자동 분기합니다.
- 트리거가 없으면 기본 모드(`/prompts:executor`)로 처리하고, 요청 성격에 따라 `architect` 또는 `planner` 모드로 전환합니다.
- `AGENTS.md` 파일을 프로젝트에 주입해 분기 규칙과 스킬 트리거를 적용합니다.

**Gran Maestro와의 관계:** `/mst:setup-omx` 스킬이 OMX 설치·초기화·gitignore 등록·AGENTS.md 주입의 4단계를 한 번에 자동 처리합니다.

---

## Gran Maestro에서 OMX 설정하기

### /mst:setup-omx 사용법 — 4단계 자동화

`/mst:setup-omx`는 다음 4단계를 순서대로 자동 실행합니다:

**Step 1: oh-my-codex 전역 설치**

- `--skip-install` 옵션이 없으면 `npm install -g oh-my-codex`를 실행합니다.
- `--skip-install`이 있으면 이 단계를 건너뛰고 Step 2로 이동합니다.

**Step 2: OMX 초기화**

- `--dir {path}` 옵션이 있으면 해당 경로를, 없으면 현재 디렉토리를 대상으로 사용합니다.
- 대상 디렉토리가 존재하지 않으면 에러 메시지를 출력하고 중단합니다.
- `omx setup && omx doctor`를 실행해 초기화합니다.

**Step 3: .gitignore에 .omx 등록**

- 대상 디렉토리의 `.gitignore` 파일을 확인합니다.
- `.gitignore`가 없으면 `.omx` 항목을 포함한 새 파일을 생성합니다.
- `.gitignore`가 있고 `.omx` 항목이 없으면 파일 끝에 `.omx`를 추가합니다.
- `.omx` 항목이 이미 존재하면 스킵합니다(중복 방지).

**Step 4: AGENTS.md 주입**

- Gran Maestro 플러그인의 `AGENTS.md` 내용을 읽어 대상 디렉토리의 `AGENTS.md`에 추가합니다.
- 대상 디렉토리에 `AGENTS.md`가 이미 존재하고 OMX 트리거 규칙이 포함되어 있으면 스킵합니다(중복 방지).
- 주입 전 사용자 확인 단계를 거칩니다(건너뛰기 선택 가능).

### 옵션

| 옵션 | 설명 |
|------|------|
| `--dir {경로}` | 대상 프로젝트 디렉토리 지정 (기본: 현재 디렉토리). 상대경로는 현재 작업 디렉토리 기준 |
| `--skip-install` | OMX 전역 설치(Step 1)를 건너뜀. OMX가 이미 설치된 경우 사용 |

### 사용 예시

```
# 현재 디렉토리에 OMX 설정
/mst:setup-omx

# 특정 프로젝트 경로에 OMX 설정
/mst:setup-omx --dir ./my-codex-project

# 설치 단계 건너뛰고 초기화만
/mst:setup-omx --skip-install

# 특정 경로에 설치 단계 건너뛰고 설정
/mst:setup-omx --dir /path/to/project --skip-install
```

---

## AGENTS.md 이해하기

Gran Maestro가 주입하는 `AGENTS.md`에는 **OMx 트리거 자동 분기 규칙**이 포함됩니다.

### 기본 모드 분기 규칙

- 사용자 메시지에 트리거(`/prompts:...`, `$...`)가 명시되지 않으면 기본은 **`/prompts:executor`** 모드로 처리합니다.
- 아래 조건에서 모드 분기를 수행합니다:
  - **아키텍처 설계, 시스템 분할, 인터페이스/데이터 흐름** 관련 요청 → `/prompts:architect`
  - **프로젝트 전체 계획, 일정, 우선순위, 범위/의존성** 정리 요청 → `/prompts:planner`

### 수동 트리거 우선 적용

스킬 트리거(`$analyze`, `$autopilot` 등)가 메시지에 명시되면 자동 분기보다 우선 적용됩니다. 즉, 트리거를 직접 지정하면 분기 규칙을 무시하고 해당 스킬이 바로 실행됩니다.

---

## OMX 스킬 트리거

`AGENTS.md`에 등록된 스킬 트리거 목록과 용도입니다.

| 트리거 | 용도 |
|--------|------|
| `$analyze` | 코드·시스템 분석 |
| `$autopilot` | 자율 실행 모드 |
| `$build-fix` | 빌드 오류 자동 수정 |
| `$code-review` | 코드 리뷰 수행 |
| `$deepsearch` | 심층 검색·조사 |
| `$security-review` | 보안 취약점 검토 |
| `$ultraqa` | 고품질 QA 실행 |
| `$ultrawork` | 집중 작업 모드 |
| `$swarm` | 다중 에이전트 협업 |
| `$plan` | 계획 수립 및 정리 |

---

## 루트 공통 템플릿 (AGENTS_TEMPLATE_COMMON.md)

`AGENTS_TEMPLATE_COMMON.md`는 여러 프로젝트에 공통 OMX 규칙을 적용하기 위한 템플릿입니다.

### 적용 방법

- 이 파일을 `mygit` 루트(예: `/Users/brandev/mygit/AGENTS.md`)에 배치하면, 해당 디렉토리와 **모든 하위 디렉토리**에 공통 규칙이 적용됩니다.
- 더 깊은 하위 폴더에 별도 `AGENTS.md`가 있으면 하위 파일의 규칙이 상위 규칙보다 우선합니다.
- 시스템/개발자/사용자 지침이 충돌할 경우 해당 지침이 우선합니다.

### 공통 템플릿 주요 내용

- **OMx 트리거 우선 적용**: 메시지에 `/prompts:*` 또는 `$...` 트리거가 있으면 해당 트리거를 우선합니다.
- **기본 모드 전환**: 아키텍처 요청 시 `/prompts:architect`, 일정·우선순위·범위 정리 요청 시 `/prompts:planner`로 자동 전환합니다.
- **허용 스킬 우선순위**: `$analyze`, `$autopilot`, `$build-fix`, `$code-review`, `$deepsearch`, `$security-review`, `$ultraqa`, `$ultrawork`, `$swarm`, `$plan`을 명시 시 최우선 적용합니다.
- **실행 원칙**: 사용자의 의도를 빠르게 분해해 가장 짧은 실행 단위로 진행하고, 애매한 경우 확인 질문을 최소 한 번 제안합니다.

---

## 문제 해결

| 증상 | 해결 방법 |
|------|-----------|
| `omx: command not found` | `--skip-install` 없이 재실행하거나 `npm install -g oh-my-codex`를 직접 실행 |
| `대상 디렉토리를 찾을 수 없음` | `--dir` 경로 확인 (상대경로는 현재 작업 디렉토리 기준) |
| `AGENTS.md 소스 파일 없음` | 플러그인을 재설치하거나 `{PLUGIN_ROOT}/AGENTS.md` 존재 여부 확인 |

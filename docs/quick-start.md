[← README로 돌아가기](../README.md)

# Quick Start

## 0. 사전 요구사항

Gran Maestro는 Codex CLI와 Gemini CLI를 외부 실행 에이전트로 사용합니다. 플러그인 설치 전에 두 CLI를 먼저 설치해 주세요.

```bash
# Codex CLI
npm install -g @openai/codex

# Gemini CLI
npm install -g @google/gemini-cli
```

**Gran Maestro는 각 CLI를 직접 호출합니다.** 별도 서버를 경유하거나 API를 중간에서 가로채지 않으며, 여러분이 직접 터미널에서 실행하는 것과 완전히 동일하게 동작합니다. 인증 정보와 데이터는 각 CLI와 해당 서비스 사이에서만 오가므로 Gran Maestro를 신뢰할 필요 없이 Codex/Gemini를 신뢰하는 것으로 충분합니다.

### 각 CLI 설정이 그대로 적용됩니다

Gran Maestro는 CLI의 기능을 그대로 활용하기 때문에, 각 에이전트에 맞게 설정한 내용이 Gran Maestro 실행 중에도 동일하게 적용됩니다.

- **Codex**: 프로젝트 루트의 `AGENTS.md`, `CODEX.md` 등 에이전트 지시 파일이 Codex 호출 시 그대로 반영됩니다.
- **Gemini**: `GEMINI.md` 또는 `.gemini/` 하위 설정 파일이 Gemini 호출 시 그대로 반영됩니다.

각 CLI의 개성(모델 설정, 시스템 프롬프트, 금지 동작 등)을 잘 조율해 두면 Gran Maestro 내에서도 동일한 품질과 일관성이 유지됩니다.

### 설치 후 반드시 한 번 직접 실행하세요

설치 후 **각 CLI를 직접 한 번 실행해 보세요.** 첫 실행 시 인증 플로우(로그인, API 키 등록 등)가 대화형으로 진행되며, 이 과정을 완료하지 않으면 Gran Maestro가 내부에서 CLI를 비대화형으로 호출할 때 인증 오류가 발생합니다.

```bash
codex   # 첫 실행 — 인증 플로우 완료
gemini  # 첫 실행 — Google 계정 로그인 완료
```

인증 방법:

- Codex: 첫 실행 시 대화형 로그인 또는 `OPENAI_API_KEY` 환경변수 설정
- Gemini: 첫 실행 시 Google 계정 OAuth 로그인 또는 `GEMINI_API_KEY` 환경변수 설정

> **Tip.** 설치 후 `which codex`, `which gemini` 명령으로 PATH에 정상 등록되었는지도 확인하세요.

## 1. 설치

Claude Code에서 (v1.0.33 이상 필요):

```bash
# Step 1: 마켓플레이스 등록
/plugin marketplace add myrtlepn/gran-maestro

# Step 2: 플러그인 설치
/plugin install mst@gran-maestro
```

또는 `/plugin` 명령으로 UI를 열어 **Discover** 탭에서 직접 설치할 수도 있습니다.

### 업데이트

```bash
/plugin marketplace update gran-maestro
```

### 삭제

```bash
/plugin uninstall mst@gran-maestro
```

## Stitch MCP 설정 (선택)

`/mst:stitch`로 UI 목업을 생성하려면 Claude Code에 Stitch MCP를 먼저 추가해야 합니다.

Stitch는 Google의 UI 설계 도구입니다. `/mcp add` 명령 또는 Claude Code MCP 설정을 통해 추가한 뒤, Gran Maestro에서 활성화합니다:

```
/mst:settings stitch.enabled true
```

> **Tip.** Gran Maestro 기본값은 `stitch.enabled: true`입니다. Stitch MCP만 추가하면 별도 설정 없이 바로 사용할 수 있습니다.

## 2. 시작

```
/mst:request "JWT 기반 사용자 인증 기능을 추가해줘"
```

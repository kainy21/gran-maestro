# Changelog

모든 주요 변경사항을 이 파일에 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따릅니다.

---

## [0.36.0] — 2026-02-27

### 새 기능

- **대시보드 PlansView** — Overview / Design 2탭 분리, `design.md` 렌더링 지원 (REQ-167)
- **pending_dependency 자동 활성화** — `accept` Step 5.5 추가, `approve` 필터 개선, `mst.py` plan sync 연동 (REQ-168)
- **mst:stitch PLN 컨텍스트 감지** — 활성 PLN 세션 자동 감지 후 `design.md` 생성 (REQ-165)
- **AGENTS.md + 공통 템플릿** — 분기 규칙 및 실행 원칙 명확화, 에이전트 초기 컨텍스트 표준화 (REQ-165)
- **Stitch MCP 직접 호출 방지** — `mst:stitch` 스킬 경유 강제, 일관된 PLN 연동 보장 (REQ-166)
- **Codex 위임 확대** — agent 배정 기준 명확화, 호출 일관성 개선, Step 5b 검토 강화 (REQ-171)

### 개선

- **mst:debug 리팩토링** — 개별 에이전트 취합 방식에서 PM 중앙 취합 방식으로 전환 (REQ-162)
- **SKILL.md 프롬프트 압축** — Phase 1: 설명 문장 압축 + 예시 섹션 축소 (27개 스킬), Phase 2: 오류 처리 희귀 케이스 정리 (REQ-163, REQ-164)
- **OMX 가이드 문서 추가** — `docs/omx-guide.md`: oh-my-codex 설치, AGENTS.md 커스터마이징, 트리거 레퍼런스 (REQ-170)
- **README Stitch 사용자 가이드 추가** — 요청 유형별 동작 표, PLN 연동 사례 정리 (REQ-169)

### 버그 수정

- **mst:stitch pending 즉시 삭제 버그** — `stale_at(5분)` 유지 방식으로 교체, 조기 삭제 방지 (REQ-161)

---

## [0.35.4] — 2026-02-26

### 개선

- **mst:stitch 타임아웃 복구 메커니즘** — 생성 도중 타임아웃 시 pending 상태 보존 및 재시도 가이드 (REQ-159)

### 버그 수정

- **대시보드 탭 미표시 문제 수정** — DBG-021: 특정 조건에서 탭이 렌더링되지 않던 문제 해결 (REQ-160)

---

## [0.35.3] — 2026-02-26

### 새 기능

- **mst:setup-omx 스킬 추가** — Codex CLI 프로젝트에 oh-my-codex 설치·초기화·gitignore 등록·AGENTS.md 주입을 4단계로 자동화 (REQ-158)

---

## [0.35.2] — 2026-02-26

### 개선

- **Spec Pre-review Pass** — 구현 에이전트가 스펙 승인 전 사전 Q&A를 수행해 모호성 제거 (REQ-156)
- **mst:request 설명 문구 개선** — 스펙 작성 의도 및 approve 분리 흐름 명확화 (REQ-157)

---

## [0.35.1] — 2026-02-25

### 새 기능

- **mst:explore 스킬 추가** — 에이전트들이 코드베이스를 백그라운드로 자율 탐색해 원하는 정보를 찾아오는 스킬 (REQ-155)

### 변경

- **mst:start → mst:request 이름 변경** — 스킬 이름을 의도에 맞게 변경, `mst:start`는 deprecated 래퍼로 유지 (REQ-154)

### 문서

- `docs/best-practices.md` 설명 문구 간소화

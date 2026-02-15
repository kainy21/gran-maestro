---
name: mst
description: "특정 요청의 상세 상태를 표시합니다. 사용자가 '상세 상태', '자세히 보여줘', '상태 확인'을 말하거나 /mst를 호출할 때 사용. 전체 목록은 /ml을 사용."
user-invocable: true
argument-hint: "{REQ-ID}"
---

# maestro:status

특정 요청의 상세 상태를 터미널에 표시합니다. Phase 진행 상황, 태스크 상태,
에이전트 활동, 피드백 라운드 이력 등을 포함합니다.

## 실행 프로토콜

1. `$ARGUMENTS`에서 REQ ID 파싱
2. `.gran-maestro/requests/{REQ-ID}/request.json` 읽기
3. 각 태스크의 `status.json` 읽기
4. 상세 상태 포맷팅 및 출력

## 출력 형식

```
Gran Maestro — REQ-001 상세 상태
═══════════════════════════════════════

요청: "사용자 인증 기능 추가"
Phase: 2 (외주 실행)
생성: 2026-02-14 10:00
경과: 2h 30m

Phase 진행:
  [1] PM 분석    ████████████ 완료 (45m)
  [2] 외주 실행  ████████░░░░ 진행중
  [3] PM 리뷰    ░░░░░░░░░░░░ 대기
  [5] 수락/완료  ░░░░░░░░░░░░ 대기

태스크:
  01: JWT 미들웨어 구현
      Agent: codex-dev | Status: executing (45m)
      Worktree: .gran-maestro/worktrees/REQ-001-01
  02: 로그인 UI 구현
      Agent: gemini-dev | Status: pending
      blockedBy: REQ-001-01
  03: 유저 모델 테스트
      Agent: codex-dev | Status: completed (38s)

종속성:
  blockedBy: []
  blocks: [REQ-002]
```

## 예시

```
/mst REQ-001
/mst REQ-003
```

## 문제 해결

- "REQ-ID를 찾을 수 없음" → ID 형식이 `REQ-NNN`인지 확인. `/ml`로 현재 요청 목록 조회
- `request.json` 읽기 실패 → 파일 손상 가능. `.gran-maestro/requests/{REQ-ID}/` 디렉토리 내용 확인

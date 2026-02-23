---
name: cancel
description: "요청 또는 태스크를 취소하고 worktree를 정리합니다. 사용자가 '취소', '중단', '그만'을 말하거나 /mst:cancel을 호출할 때 사용."
user-invocable: true
argument-hint: "{REQ-ID} [--force]"
---

# maestro:cancel

진행 중인 요청 또는 태스크를 취소하고 관련 리소스를 정리합니다.

## 실행 프로토콜

1. `$ARGUMENTS`에서 REQ ID 파싱
2. 해당 요청의 활성 태스크 확인
3. 취소 확인 프롬프트 (--force가 아닌 경우)
4. 취소 처리:
   - 실행 중인 에이전트/CLI 프로세스 종료
   - Git worktree 삭제
   - 임시 브랜치 정리
   - `request.json` 상태를 `cancelled`로 변경
4.5. **Plan 상태 동기화**:
   - 취소된 `request.json`의 `source_plan` 필드 확인
   - `source_plan`이 있으면: `python3 {PLUGIN_ROOT}/scripts/mst.py plan sync {source_plan}` 실행
     (취소로 인해 linked_requests 중 미완료가 생겼으므로 sync는 대부분 no-op)
   - `source_plan`이 없으면 스킵
5. `.gran-maestro/requests/*/request.json`을 스캔하여 모든 요청이 terminal 상태(`done`, `completed`, `cancelled`, `failed`)이고 `auto_deactivate: true`이면 → Maestro 모드 자동 비활성화

## 옵션

- `--force`: 확인 없이 즉시 취소

## 예시

```
/mst:cancel REQ-001         # REQ-001 취소 (확인 요청)
/mst:cancel REQ-001 --force # REQ-001 즉시 취소
/mst:cancel REQ-002-01      # 특정 태스크만 취소
```

## 문제 해결

- "해당 요청을 찾을 수 없음" → REQ ID 형식 확인. `/mst:list`로 활성 요청 목록 조회
- "활성 프로세스 종료 실패" → worktree 경로에서 수동으로 프로세스 확인. `--force`로 강제 취소 시도
- "worktree 삭제 실패" → `.gran-maestro/worktrees/` 디렉토리에서 해당 worktree 수동 정리. `git worktree list`로 상태 확인

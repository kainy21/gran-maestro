---
name: approve
description: "스펙을 승인하거나 최종 결과물을 수락합니다. 사용자가 '승인', '진행해', 'OK 진행'을 말하거나 /mst:approve를 호출할 때 사용. Gran Maestro 워크플로우 내에서만 의미 있으며, 일반적인 확인 응답에는 사용하지 않음."
user-invocable: true
argument-hint: "{REQ-ID} [--final]"
---

# maestro:approve

PM이 작성한 구현 스펙을 승인하거나, 완료된 결과물을 최종 수락합니다.

## 실행 프로토콜

### 스펙 승인 (Phase 1 → Phase 2)

1. `$ARGUMENTS`에서 REQ ID 파싱
2. `.gran-maestro/requests/{REQ-ID}/` 하위 spec.md 파일 확인
3. 스펙 요약을 사용자에게 표시
4. 승인 시:
   - `request.json`의 `current_phase`를 2로 변경
   - 각 태스크에 대해 git worktree 생성
   - Phase 2 (외주 실행) 진입

### 최종 수락 (Phase 3 → Phase 5)

`--final` 옵션 사용 시:

1. 리뷰 리포트가 PASS인지 확인
2. 최종 요약 리포트 생성
3. Worktree → main 브랜치 rebase + squash merge
4. Worktree 삭제 + 브랜치 정리
5. Phase 5 완료 처리

## 옵션

- `--final`: 최종 결과물 수락 (Phase 5 진입)

## 예시

```
/mst:approve REQ-001        # 스펙 승인 → Phase 2 진입
/mst:approve REQ-001 --final  # 최종 수락 → Phase 5 완료
```

## 문제 해결

- "승인할 스펙이 없음" → 해당 요청이 Phase 1(PM 분석) 완료 상태인지 확인. `/mst:status {REQ-ID}`로 상태 조회
- "이미 승인됨" → 해당 요청이 이미 Phase 2 이후에 있음. `/mst:status {REQ-ID}`로 현재 Phase 확인
- "리뷰가 PASS가 아님" (--final 사용 시) → 리뷰 리포트에서 미충족 수락조건 확인. 피드백 루프를 먼저 완료

---
name: mf
description: "Gran Maestro 워크플로우 내에서 수동 피드백을 제공합니다 (Phase 4). 사용자가 진행 중인 요청에 대해 '피드백'을 말하거나 /mf를 호출할 때 사용. 일반적인 코드 수정 요청이나 워크플로우 외부의 '수정해줘', '변경해줘'에는 사용하지 않음."
user-invocable: true
argument-hint: "{REQ-ID} {피드백 내용}"
---

# maestro:feedback

사용자가 직접 피드백을 제공하여 Phase 4 (피드백 루프)를 트리거합니다.
자동 리뷰와 별개로 사용자의 수동 관찰/요구사항을 전달할 때 사용합니다.

## 실행 프로토콜

1. `$ARGUMENTS`에서 REQ ID와 피드백 내용 파싱
2. Feedback Composer 에이전트 활성화 (`gran-maestro:feedback-composer`)
3. 사용자 피드백을 구조화된 피드백 문서로 변환
4. `.gran-maestro/requests/{REQ-ID}/tasks/NN/feedback-RN.md` 저장
5. 실패 유형 분류:
   - 구현 오류 → Phase 2 재실행
   - 스펙 불충분 → Phase 1 보완
6. 피드백 라운드 카운터 증가
7. 최대 피드백 횟수(기본 5회) 초과 시 사용자 개입 요청

## 예시

```
/mf REQ-001 "JWT 토큰 만료 시간이 너무 짧아요, 24시간으로 변경해주세요"
/mf REQ-002 "로그인 버튼 위치를 오른쪽 상단으로 이동해주세요"
```

## 문제 해결

- "해당 요청을 찾을 수 없음" → REQ ID 형식 확인. `/ml`로 활성 요청 목록 조회
- "최대 피드백 횟수 초과" → `/mcf workflow.max_feedback_rounds`로 현재 설정 확인. 필요 시 값 증가 또는 스펙 재작성(`/ms`)
- "활성 태스크 없음" → 해당 요청이 Phase 2~3 사이에 있는지 `/mst {REQ-ID}`로 확인

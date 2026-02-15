---
name: ideation
description: "3 AI(Codex/Gemini/Claude) 의견을 병렬 수집하고 종합 토론합니다. 사용자가 '아이디어', '브레인스토밍', '의견 수렴'을 말하거나 /mst:ideation을 호출할 때 사용. 구현 전 다각도 분석이 필요할 때 독립적으로 실행."
user-invocable: true
argument-hint: "{주제} [--focus {architecture|ux|performance|security|cost}]"
---

# maestro:ideation

3개 AI(Codex, Gemini, Claude)의 의견을 병렬 수집하고 PM이 종합하여 인터랙티브 토론을 진행합니다.
이 스킬은 모드에 관계없이 사용 가능합니다 (OMC 모드, Maestro 모드 모두).
Gran Maestro 워크플로우(REQ)와 독립적으로 실행됩니다.

## 실행 프로토콜

### Step 1: 초기화

1. `.gran-maestro/ideation/` 디렉토리 존재 확인, 없으면 생성
2. 새 세션 ID 채번 (IDN-NNN):
   - `.gran-maestro/ideation/` 하위의 기존 IDN-* 디렉토리를 스캔
   - 최대 번호를 찾아 +1 (첫 세션이면 IDN-001)
3. `.gran-maestro/ideation/IDN-NNN/` 디렉토리 생성
4. `session.json` 작성:
   ```json
   {
     "id": "IDN-NNN",
     "topic": "{사용자 주제}",
     "focus": "{focus 옵션 또는 null}",
     "status": "collecting",
     "created_at": "ISO-timestamp",
     "opinions": {
       "codex": { "status": "pending" },
       "gemini": { "status": "pending" },
       "claude": { "status": "pending" }
     }
   }
   ```

### Step 2: 병렬 의견 수집

3개 AI에 **동시에** 질문합니다. 각 AI에 고유 관점을 부여하여 비중복성을 확보합니다.
각 의견은 800자 이내로 제한합니다.

`--focus` 옵션이 지정된 경우, 해당 분야에 집중하도록 프롬프트에 명시합니다.

**Codex** (`mcp__plugin_oh-my-claudecode_x__ask_codex`, agent_role: `architect`):
- 관점: **기술 실현성 분석**
- 프롬프트 지침:
  - 구현 옵션을 열거하고 각 옵션의 복잡도를 평가
  - 아키텍처 트레이드오프 분석 (성능, 유지보수성, 확장성)
  - 기술 스택 적합성 판단
  - "전략/창의 분석과 비판적 평가는 다른 AI가 담당하므로, 기술 실현성에만 집중할 것"
- 결과 저장: `opinion-codex.md`
- `session.json`의 `opinions.codex.status`를 `"done"` 또는 `"failed"`로 업데이트

**Gemini** (`mcp__plugin_oh-my-claudecode_g__ask_gemini`, agent_role: `planner`):
- 관점: **전략/창의 분석**
- 프롬프트 지침:
  - 대안적 접근법 제시 (통상적이지 않은 해법 포함)
  - 생태계 트렌드와 업계 사례 참조
  - 장기적 영향과 확장 가능성 분석
  - "기술 실현성 분석과 비판적 평가는 다른 AI가 담당하므로, 전략/창의 분석에만 집중할 것"
- 결과 저장: `opinion-gemini.md`
- `session.json`의 `opinions.gemini.status`를 `"done"` 또는 `"failed"`로 업데이트

**Claude** (Task, subagent_type: `oh-my-claudecode:critic`, model: `opus`):
- 관점: **비판적 평가**
- 프롬프트 지침:
  - 숨은 가정과 전제 조건 식별
  - 엣지 케이스와 실패 시나리오 도출
  - 리스크 요인과 완화 전략
  - 반론(devil's advocate) 제시
  - "기술 실현성 분석과 전략/창의 분석은 다른 AI가 담당하므로, 비판적 평가에만 집중할 것"
- 결과 저장: `opinion-claude.md`
- `session.json`의 `opinions.claude.status`를 `"done"` 또는 `"failed"`로 업데이트

### Step 3: PM 종합

수집된 의견을 PM이 종합 분석합니다:

1. **수렴점 추출**: 3개 AI가 공통으로 동의하는 부분
2. **발산점 추출**: 의견이 갈리는 부분과 그 이유
3. **핵심 인사이트 도출**: 각 AI의 고유 기여 중 가장 가치 있는 통찰
4. **추천 방향 순위화**: 종합 근거에 기반한 우선순위 제시 (트레이드오프 명시)

결과를 `synthesis.md`에 저장합니다. 포맷:

```markdown
# Ideation Synthesis — IDN-NNN

## 주제
{사용자 주제}

## 수렴점 (3자 합의)
- ...

## 발산점 (의견 차이)
| 논점 | Codex | Gemini | Claude |
|------|-------|--------|--------|
| ... | ... | ... | ... |

## 핵심 인사이트
1. ...
2. ...
3. ...

## 추천 방향 (우선순위)
1. **{방향 A}** — {근거 요약} ★ 추천
2. **{방향 B}** — {근거 요약}
3. **{방향 C}** — {근거 요약}

## 리스크 및 고려사항
- ...
```

`session.json`의 `status`를 `"synthesized"`로 업데이트합니다.

### Step 4: 인터랙티브 토론

1. 종합 결과를 사용자에게 표시합니다
2. 사용자와 자유 토론을 진행합니다:
   - 특정 방향에 대한 심층 분석 요청 가능
   - 추가 질문이나 관점 변경 가능
   - 특정 AI의 의견에 대한 반박/확장 가능
3. 토론 내용을 `discussion.md`에 append합니다
4. 사용자가 `/mst:start`를 호출하면 구현 워크플로우로 전환 가능

`session.json`의 `status`를 `"discussing"`으로 업데이트합니다.
토론 종료 시 `"completed"`로 업데이트합니다.

## 에러 처리

| 상황 | 대응 |
|------|------|
| 1개 AI 실패 | 경고 표시 + 나머지 2개로 종합 진행 |
| 2개 AI 실패 | 경고 표시 + 1개 의견 + PM 자체 분석으로 보완 |
| 3개 AI 실패 | 에러 메시지 출력 + 재시도 안내 |
| MCP 미설치 | 해당 AI 스킵, 사용 가능한 AI로만 진행 |

## 옵션

- `--focus {architecture|ux|performance|security|cost}`: 분석 범위를 특정 분야로 제한. 지정하지 않으면 전체 범위 분석

## 세션 파일 구조

```
.gran-maestro/ideation/IDN-NNN/
├── session.json          # 메타데이터 (id, topic, focus, status, opinions 상태)
├── opinion-codex.md      # Codex 의견 (기술 실현성)
├── opinion-gemini.md     # Gemini 의견 (전략/창의)
├── opinion-claude.md     # Claude 의견 (비판적 평가)
├── synthesis.md          # PM 종합 결과
└── discussion.md         # 토론 기록 (append-only)
```

## 예시

```
/mst:ideation "마이크로서비스 vs 모놀리식 아키텍처"
/mst:ideation --focus architecture "이벤트 소싱 도입 여부"
/mst:ideation --focus security "OAuth2 vs 자체 인증 시스템"
/mst:ideation "React vs Vue vs Svelte 프론트엔드 프레임워크 선택"
/mst:ideation --focus cost "서버리스 vs 컨테이너 배포 전략"
```

## 문제 해결

- `.gran-maestro/ideation/` 디렉토리 생성 실패 → 현재 디렉토리가 git 저장소인지 확인. 쓰기 권한 확인
- Codex MCP 호출 실패 → `mcp__plugin_oh-my-claudecode_x__ask_codex` 도구 사용 가능 여부 확인. Codex CLI가 설치되어 있는지 확인
- Gemini MCP 호출 실패 → `mcp__plugin_oh-my-claudecode_g__ask_gemini` 도구 사용 가능 여부 확인. Gemini CLI가 설치되어 있는지 확인
- 기존 세션 ID 충돌 → `.gran-maestro/ideation/` 디렉토리를 확인하고 중복 IDN 폴더가 없는지 검증
- 종합 결과 품질 저하 → `--focus` 옵션으로 분석 범위를 좁혀서 재시도

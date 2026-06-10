---
aliases:
  - "Planning Document Refinement Overview"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - source
  - worklog
type: project-document
project: NightCaretaker
category: source-worklog
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# Planning Document Refinement Overview

> [!summary] 문서 목적
> Clarify the game's player-facing purpose and content structure across the planning documents.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningDocRefinement_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Status | 주요 섹션 |
| Completed | 주요 섹션 |
| Remaining | 주요 섹션 |
| Risks | 주요 섹션 |
| Validation | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

Clarify the game's player-facing purpose and content structure across the planning documents.

## Scope

- Review current planning documents in `Document`.
- Refine `NightCaretaker_307_GDD.md` to better explain player goals, allowed actions, required actions, and content purpose.
- Refine `NightCaretaker_307_DevelopmentPlan.md` so production units match the refined gameplay intent.
- Add one easy-to-read gameplay/content guide for fast onboarding.

## Current Status

- Completed.
- GDD updated.
- Development plan updated.
- New gameplay/content guide added.

## Completed

- Reviewed `NightCaretaker_307_GDD.md`.
- Reviewed `NightCaretaker_307_DevelopmentPlan.md`.
- Added a new readable guide: `NightCaretaker_Gameplay_Content_Guide.md`.
- Refined the GDD so a reader can quickly identify:
  - what the player can do,
  - what the player must do,
  - what the player should not expect,
  - what the short/mid/long-term objectives are,
  - how complaints and anomalies support progression.
- Refined the development plan so production units now map more directly to player-facing goals.

## Remaining

- None for this pass.

## Risks

- Future edits should keep the new guide aligned with the GDD and development plan.
- If chapter scope expands later, complaint/anomaly packaging rules should be updated together.

## Validation

- Confirmed that the planning set now exposes:
  - player role,
  - player actions,
  - required progression actions,
  - content categories,
  - chapter purpose,
  - demo communication goals.

## Update Log

- 2026-03-29: Work item created. Review completed and edit plan defined.
- 2026-03-29: GDD updated with player-purpose, chapter-purpose, complaint, anomaly, and demo-clarity sections.
- 2026-03-29: Development plan updated with production-facing gameplay goals and content packaging rules.
- 2026-03-29: New gameplay/content guide added for quick onboarding.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

---
aliases:
  - "Planning Master Consolidation - Detail"
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

# Planning Master Consolidation - Detail

> [!summary] 문서 목적
> 이번 작업은 `Document` 폴더를 "많은 산출물 모음"에서 "읽을 문서와 보관 문서가 분리된 구조"로 정리하는 것이다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningMasterConsolidation_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Purpose | 주요 섹션 |
| Inputs | 주요 섹션 |
| Consolidation Rules | 주요 섹션 |
| Target Top-Level Structure | 주요 섹션 |
| Files To Archive | 주요 섹션 |
| Planning Master Rewrite Shape | 주요 섹션 |
| Validation Plan | 주요 섹션 |
| Implementation Notes | 주요 섹션 |
| Planning Master Rewrite | 세부 기준 |
| Companion Archive | 세부 기준 |
| Planning Master HTML/CSS View | 세부 기준 |
| Validation Results | 주요 섹션 |
| Follow-Up Recommendation | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Purpose

이번 작업은 `Document` 폴더를 "많은 산출물 모음"에서 "읽을 문서와 보관 문서가 분리된 구조"로 정리하는 것이다.
동시에 `NightCaretaker_Planning_Master.md`는 긴 원문 병합본이 아니라, 실제 게임 기획 결정과 수직 슬라이스 제작 기준을 빠르게 확인할 수 있는 문서로 바꾼다.

## Inputs

- `Document/Source/GameDesignDocumentationResearch_Overview.md`
- `Document/Source/GameDesignDocumentationResearch_Detail.md`
- `Document/NightCaretaker_Planning_Master.md`
- `Document/README.md`
- Existing companion docs in `Document/`

## Consolidation Rules

| Rule | Decision |
| --- | --- |
| Preserve content | 기존 문서는 삭제하지 않고 Archive로 이동하거나 기존 Archive 원본을 참조한다. |
| Active docs | 최상위 `Document`에는 README와 Master 문서만 남긴다. |
| Planning role | Planning Master는 제품 방향, 플레이 루프, 콘텐츠 규칙, 수직 슬라이스 기준을 담당한다. |
| Detail role | 세부 다이어그램, HTML 보드, 상세 매트릭스는 Archive companion으로 둔다. |
| Source role | `Document/Source`는 작업 기록과 의사결정 이력으로 유지한다. |

## Target Top-Level Structure

| File | Role |
| --- | --- |
| `README.md` | 문서 허브와 읽기 순서 |
| `NightCaretaker_Planning_Master.md` | 활성 기획 기준서 |
| `NightCaretaker_Development_Master.md` | 활성 개발 기준서 |
| `NightCaretaker_Art_Master.md` | 활성 아트 기준서 |

## Files To Archive

다음 파일은 `Document/Archive/Companion`으로 이동한다.

- `NightCaretaker_GameFlow_Diagrams.md`
- `NightCaretaker_GameFlow_Visual.html`
- `NightCaretaker_UIUX_Detail.md`
- `NightCaretaker_UIUX_Diagrams.md`
- `NightCaretaker_UIUX_Wireframes.html`
- `NightCaretaker_Sound_Detail.md`
- `NightCaretaker_Sound_Diagrams.md`
- `NightCaretaker_Sound_Matrix.html`
- `NightCaretaker_ComplaintAnomaly_Detail.md`
- `NightCaretaker_ComplaintAnomaly_Diagrams.md`
- `NightCaretaker_ComplaintAnomaly_Matrix.html`
- `NightCaretaker_LevelSpace_Detail.md`
- `NightCaretaker_LevelSpace_Diagrams.md`
- `NightCaretaker_LevelSpace_Matrix.html`
- `NightCaretaker_VerticalSlice_Detail.md`
- `NightCaretaker_VerticalSlice_Diagrams.md`
- `NightCaretaker_VerticalSlice_Checklist.html`
- `NightCaretaker_ProjectRestart_PMPlan.html`
- `NightCaretaker_P0Development_WorkCards.html`
- `NightCaretaker_DocTheme.css`

## Planning Master Rewrite Shape

The rewritten Planning Master should contain:

1. Document control and source references.
2. One-page game brief.
3. Product identity and non-goals.
4. Design pillars with implementation rules.
5. Player role and player verbs.
6. Core gameplay loop and state model.
7. Complaint/anomaly content model.
8. Room 307 escalation.
9. Level/space requirements.
10. UX, art, sound, and technical planning hooks.
11. Vertical slice acceptance criteria.
12. Production scope, milestones, risks, and open questions.

## Validation Plan

- Confirm top-level `Document` file count is reduced.
- Confirm archived companion files exist.
- Confirm `Document/README.md` no longer points to moved companion docs as active files.
- Confirm `NightCaretaker_Planning_Master.md` includes concrete player verbs, loop, data fields, validation criteria, and archived reference links.

## Implementation Notes

### Planning Master Rewrite

`NightCaretaker_Planning_Master.md` was rewritten as an active planning source of truth with these sections:

- Document control and source references.
- One-page game brief.
- Product identity and non-goals.
- Design pillars.
- Player verbs.
- Core loop and state axes.
- Complaint/anomaly model.
- Room 307 escalation.
- Level/space plan.
- UX, art, sound, and technical hooks.
- Vertical slice acceptance criteria.
- Production scope, risks, open questions, archive references.

The previous consolidated planning master was preserved at:

`Document/Archive/Planning/NightCaretaker_Planning_Master_PreConsolidation_20260526.md`

### Companion Archive

The top-level `Document` directory was reduced from 24 files to 4 files:

- `README.md`
- `NightCaretaker_Planning_Master.md`
- `NightCaretaker_Development_Master.md`
- `NightCaretaker_Art_Master.md`

The following companion files were moved to `Document/Archive/Companion`:

- Flow diagrams and HTML board.
- UI/UX detail, diagrams, and wireframes.
- Sound detail, diagrams, and matrix.
- Complaint/anomaly detail, diagrams, and matrix.
- Level/space detail, diagrams, and matrix.
- Vertical slice detail, diagrams, and checklist.
- PM plan HTML and P0 work cards HTML.
- Shared HTML CSS theme.

`Document/README.md` now points readers to active Master documents first and treats Archive materials as reference-only.

### Planning Master HTML/CSS View

Added a companion HTML/CSS view for the rewritten Planning Master:

- `Document/Archive/Companion/NightCaretaker_Planning_Master_View.html`
- `Document/Archive/Companion/NightCaretaker_Planning_Master_View.css`

This view is not the source of truth.
The Markdown Planning Master remains the active planning document, and the HTML view should be updated when the Markdown source changes.

## Validation Results

| Check | Result |
| --- | --- |
| Top-level `Document` file count | Reduced from 24 files to 4 files. |
| Active top-level files | `README.md`, `NightCaretaker_Planning_Master.md`, `NightCaretaker_Development_Master.md`, `NightCaretaker_Art_Master.md` |
| Companion archive | 20 moved files plus `README.md` confirmed in `Document/Archive/Companion`. |
| Planning HTML view | `NightCaretaker_Planning_Master_View.html` and `.css` added to `Document/Archive/Companion`. |
| Old active companion references | No stale companion filename references found in active Master documents. |
| Planning Master structure | Headings confirmed from document control through maintenance rule. |

## Follow-Up Recommendation

`NightCaretaker_Development_Master.md` and `NightCaretaker_Art_Master.md` still retain older long-form integrated structures.
They should be compressed in a later pass using the same principle:

- Keep current implementation/production decisions.
- Move historical explanation to Archive.
- Make the first page the operational source of truth.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

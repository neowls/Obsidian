---
aliases:
  - "Planning Detail Expansion Overview"
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

# Planning Detail Expansion Overview

> [!summary] 문서 목적
> Expand the planning documents from direction-level guidance into production-ready flow specifications, starting with the game flow part.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningDetailExpansion_Overview.md` |
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

Expand the planning documents from direction-level guidance into production-ready flow specifications, starting with the game flow part.

## Scope

- Detail the full player flow in `Document/NightCaretaker_Planning_Master.md`.
- Add implementation-facing state and event boundaries to `Document/NightCaretaker_Development_Master.md`.
- Add flow-based lighting and sound mood gates to `Document/NightCaretaker_Art_Master.md`.
- Add companion visualization documents:
  - `Document/NightCaretaker_GameFlow_Diagrams.md`
  - `Document/NightCaretaker_GameFlow_Visual.html`
- Add companion UI/UX documents:
  - `Document/NightCaretaker_UIUX_Detail.md`
  - `Document/NightCaretaker_UIUX_Wireframes.html`
- Add companion sound documents:
  - `Document/NightCaretaker_Sound_Detail.md`
  - `Document/NightCaretaker_Sound_Diagrams.md`
  - `Document/NightCaretaker_Sound_Matrix.html`
- Add companion complaint/anomaly documents:
  - `Document/NightCaretaker_ComplaintAnomaly_Detail.md`
  - `Document/NightCaretaker_ComplaintAnomaly_Diagrams.md`
  - `Document/NightCaretaker_ComplaintAnomaly_Matrix.html`
- Add companion level/space documents:
  - `Document/NightCaretaker_LevelSpace_Detail.md`
  - `Document/NightCaretaker_LevelSpace_Diagrams.md`
  - `Document/NightCaretaker_LevelSpace_Matrix.html`
- Add companion vertical slice documents:
  - `Document/NightCaretaker_VerticalSlice_Detail.md`
  - `Document/NightCaretaker_VerticalSlice_Diagrams.md`
  - `Document/NightCaretaker_VerticalSlice_Checklist.html`

## Current Status

- Game flow pass completed.
- UI/UX pass completed.
- Sound detail pass completed.
- Complaint/anomaly 20-pack expansion completed.
- Level/space production detail pass completed.
- Demo vertical slice production checklist completed.
- Next sequential part is implementation kickoff or P0 runtime task execution.

## Completed

- Added a production-level game flow specification covering:
  - full session flow,
  - one-complaint work loop,
  - chapter gates,
  - state transition axes,
  - failure and recovery flow,
  - demo / vertical slice flow.
- Added UI hooks required by the flow pass.
- Added sound hooks required by the flow pass.
- Added development state/event contract guidance.
- Added visual Markdown diagrams and a standalone HTML/CSS flow board.
- Added UI/UX detailed specification covering:
  - HUD,
  - interaction prompt,
  - complaint board,
  - report form,
  - notebook,
  - document viewer,
  - pause/settings,
  - UI corruption rules.
- Added UI/UX companion documents:
  - `Document/NightCaretaker_UIUX_Detail.md`
  - `Document/NightCaretaker_UIUX_Wireframes.html`
- Added a production-level sound specification covering:
  - sound categories,
  - room-by-room ambience,
  - complaint/domain SFX cues,
  - UI sound,
  - failure pressure sound,
  - Room 307 stage exposure,
  - forbidden sound rules.
- Added MetaSound/Audio implementation contract guidance using only existing state axes and tags:
  - `ENCShiftPhase`,
  - `ENCComplaintRuntimeState`,
  - `PowerState`,
  - `TensionStage`,
  - `Room307Stage`,
  - `DomainTags`,
  - `Evidence.Audio`.
- Added sound companion documents:
  - `Document/NightCaretaker_Sound_Detail.md`
  - `Document/NightCaretaker_Sound_Diagrams.md`
  - `Document/NightCaretaker_Sound_Matrix.html`
- Added a production-level complaint/anomaly expansion covering:
  - UI exposure,
  - field scene beats,
  - evidence tags,
  - sound cues,
  - anomaly links,
  - report result handling,
  - failure pressure,
  - Room 307 escalation,
  - validation criteria.
- Added complaint/anomaly companion documents:
  - `Document/NightCaretaker_ComplaintAnomaly_Detail.md`
  - `Document/NightCaretaker_ComplaintAnomaly_Diagrams.md`
  - `Document/NightCaretaker_ComplaintAnomaly_Matrix.html`
- Added a production-level level/space specification covering:
  - space roles,
  - `LocationId` mapping,
  - `AccessState` / `PowerState` / `TensionStage` / `Room307Stage` hooks,
  - required props,
  - lighting/audio anchors,
  - revisit variations,
  - vertical slice route validation.
- Added level/space companion documents:
  - `Document/NightCaretaker_LevelSpace_Detail.md`
  - `Document/NightCaretaker_LevelSpace_Diagrams.md`
  - `Document/NightCaretaker_LevelSpace_Matrix.html`
- Added a demo vertical slice production checklist covering:
  - 10-step route,
  - implementation ticket groups,
  - P0 task dependencies,
  - UI/audio/lighting/interaction checkpoints,
  - smoke-test pass criteria.
- Added vertical slice companion documents:
  - `Document/NightCaretaker_VerticalSlice_Detail.md`
  - `Document/NightCaretaker_VerticalSlice_Diagrams.md`
  - `Document/NightCaretaker_VerticalSlice_Checklist.html`

## Remaining

- Implementation kickoff:
  - decide first P0 runtime ticket,
  - create or wire required runtime assets/classes,
  - verify route smoke-test incrementally.

## Risks

- Flow terminology must remain aligned across planning, development, and art documents.
- Future implementation passes should reuse the flow, UI, sound, complaint/anomaly, level/space, and vertical slice hooks created here instead of inventing new runtime states.
- Companion visualization files are explanatory documents; the Master documents remain the source of truth.

## Validation

- Markdown and HTML files are static documentation only.
- Mermaid diagrams use standard `flowchart`, `sequenceDiagram`, and `stateDiagram-v2` blocks.
- The HTML files are standalone and can be opened directly in a browser.
- Sound terms were checked against the existing state axes and tag names used by the planning/development documents.
- Complaint/anomaly terms were checked against existing `CMP_...`, `ANM_...`, `Evidence.*`, `Progression.*`, and `DomainTags` usage.
- Level/space terms were checked against existing `LocationId`, `AccessState`, `PowerState`, `TensionStage`, `Room307Stage`, and vertical slice route usage.
- Vertical slice terms were checked against existing `CMP_...`, `LocationId`, state hooks, and route validation criteria.

## Update Log

- 2026-04-26: Work item created. Game flow specification, development contract, art mood gates, and visualization documents added.
- 2026-04-26: UI/UX pass completed. Master UI section, development UI contract, art UI direction, and companion wireframe documents added.
- 2026-04-26: Sound detail pass completed. Master sound sections, MetaSound/Audio implementation contract, art sound mood expansion, and companion sound documents added.
- 2026-04-26: Complaint/anomaly 20-pack expansion completed. Master production criteria, development authoring contract, art scene criteria, and companion complaint/anomaly documents added.
- 2026-04-26: Level/space production detail pass completed. Master space criteria, development Location/Access contract, art blockout criteria, and companion level/space documents added.
- 2026-04-26: Demo vertical slice production checklist completed. Master checklist, implementation ticket structure, art P0 pass, and companion vertical slice documents added.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

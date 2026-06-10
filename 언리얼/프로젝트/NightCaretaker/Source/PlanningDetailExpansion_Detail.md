---
aliases:
  - "Planning Detail Expansion Detail"
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

# Planning Detail Expansion Detail

> [!summary] 문서 목적
> The current planning set already defines the concept, tone, core systems, 307 escalation, and 20 complaint seeds. The missing layer is a production-facing game flow speci...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningDetailExpansion_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Documents Updated | 주요 섹션 |
| Planning Master Changes | 주요 섹션 |
| Development Master Changes | 주요 섹션 |
| Art Master Changes | 주요 섹션 |
| Visualization Documents | 주요 섹션 |
| UI/UX Pass Changes | 주요 섹션 |
| Sound Pass Changes | 주요 섹션 |
| Complaint/Anomaly Pass Changes | 주요 섹션 |
| Level/Space Pass Changes | 주요 섹션 |
| Vertical Slice Pass Changes | 주요 섹션 |
| Design Boundaries | 주요 섹션 |
| Handoff Notes | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

The current planning set already defines the concept, tone, core systems, 307 escalation, and 20 complaint seeds. The missing layer is a production-facing game flow specification that tells designers, developers, UI authors, level artists, and sound designers exactly how a player session advances from one actionable state to the next.

This work item expands the planning set in sequential passes. Game flow and UI/UX are already complete. The current pass adds the production-facing sound layer without changing code or assets.

## Documents Updated

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`
- `Document/NightCaretaker_GameFlow_Diagrams.md`
- `Document/NightCaretaker_GameFlow_Visual.html`
- `Document/NightCaretaker_UIUX_Detail.md`
- `Document/NightCaretaker_UIUX_Wireframes.html`
- `Document/NightCaretaker_Sound_Detail.md`
- `Document/NightCaretaker_Sound_Diagrams.md`
- `Document/NightCaretaker_Sound_Matrix.html`
- `Document/NightCaretaker_ComplaintAnomaly_Detail.md`
- `Document/NightCaretaker_ComplaintAnomaly_Diagrams.md`
- `Document/NightCaretaker_ComplaintAnomaly_Matrix.html`
- `Document/NightCaretaker_LevelSpace_Detail.md`
- `Document/NightCaretaker_LevelSpace_Diagrams.md`
- `Document/NightCaretaker_LevelSpace_Matrix.html`
- `Document/NightCaretaker_VerticalSlice_Detail.md`
- `Document/NightCaretaker_VerticalSlice_Diagrams.md`
- `Document/NightCaretaker_VerticalSlice_Checklist.html`

## Planning Master Changes

The planning master now contains a production-level game flow section under the play loop area.

Added details include:

- full session flow from start menu to ending aftermath,
- one-complaint work loop with UI and sound hook requirements,
- chapter gate table with start conditions, mandatory actions, world unlocks, failure pressure, and next transition,
- state transition axes for shift phase, complaint state, power state, tension stage, Room 307 stage, access, and records,
- failure and recovery loop rules,
- vertical slice flow,
- authoring checklist for new flow beats.

This keeps the player-facing design in the planning document while making the loop concrete enough for implementation and content authoring.

## Development Master Changes

The development master now has a state and event contract subsection in the core gameplay structure.

The section defines:

- current code-facing state axes,
- owner system for each axis,
- transition triggers,
- expected consumers,
- event boundaries for UI, audio, lighting, save, and level scripting.

This is not a code implementation. It is a contract that future C++ and Blueprint work should follow so UI, sound, lighting, complaint data, and level scripts do not invent competing flow state.

## Art Master Changes

The art master now maps the game flow to visual and audio mood gates.

Added guidance clarifies:

- what each phase should look and sound like,
- which repeated spaces are responsible for carrying the emotional transition,
- how lighting and sound should support flow readability without becoming pure decoration.

## Visualization Documents

`NightCaretaker_GameFlow_Diagrams.md` provides Mermaid diagrams for:

- overall campaign flow,
- one-complaint sequence,
- runtime state model,
- failure recovery flow,
- vertical slice route.

`NightCaretaker_GameFlow_Visual.html` provides a standalone browser-readable board with:

- chapter timeline,
- complaint loop,
- state matrix,
- failure lanes,
- vertical slice route,
- next-detail-pass checklist.

## UI/UX Pass Changes

The UI/UX pass expands the planning master from a short UI direction into a screen-level specification.

Added UI details include:

- runtime HUD constraints,
- interaction prompt wording rules,
- complaint board layout and state handling,
- report form result mapping,
- notebook tabs and limits,
- document viewer behavior,
- pause/settings requirements,
- UI corruption rules,
- recommended Blueprint widget names.

The development master now clarifies how the UI should extend the current minimal widget framework:

- keep `UNCUISubsystem` as local-player UI lifetime owner,
- keep `WBP_NCPlayerHUD` as the single runtime HUD,
- use `ENCWidgetInputPolicy` for input mode decisions,
- route board/report actions through `UNCComplaintRuntimeSubsystem`,
- avoid reintroducing generic widget source/listener plumbing.

The art master now includes UI visual direction so screens remain grounded in office paper, complaint board, report form, notebook, and worn management-space materials instead of becoming a generic horror-game HUD.

`NightCaretaker_UIUX_Detail.md` gives a screen-by-screen production reference.

`NightCaretaker_UIUX_Wireframes.html` gives a standalone browser-readable wireframe board.

## Sound Pass Changes

The sound pass expands the planning master from direction-level audio notes into a production sound specification.

Added sound details include:

- sound category contract for `AMB`, `SFX`, `UI`, `MS`, and `STG`,
- room-by-room ambience loop intent,
- complaint/domain SFX mapping,
- UI sound boundaries for board, report, notebook, document viewer, pause, and settings,
- failure pressure sound rules,
- Room 307 sound exposure stages,
- forbidden sound rules that prevent over-explaining the threat.

The development master now contains a MetaSound/Audio implementation contract. The contract keeps audio driven by existing state and tag inputs only:

- `ENCShiftPhase`
- `ENCComplaintRuntimeState`
- `PowerState`
- `TensionStage`
- `Room307Stage`
- `DomainTags`
- `Evidence.Audio`

The contract also defines event naming conventions, Blueprint trigger boundaries, state subscription rules, and P0 implementation scope. It intentionally does not create a new gameplay state machine for audio.

The art master now describes how lighting and sound should share responsibility. It adds space-by-space visual anchors, sound sources, ambiguity rules, and review criteria so a sound cue is supported by the level without fully explaining its cause.

`NightCaretaker_Sound_Detail.md` gives the detailed production reference for ambience, SFX, UI sound, MetaSound layers, Room 307 exposure, and validation.

`NightCaretaker_Sound_Diagrams.md` gives Mermaid diagrams for audio state flow, Room 307 staging, complaint audio sequence, and Blueprint trigger ownership.

`NightCaretaker_Sound_Matrix.html` gives a standalone browser-readable matrix for spaces, states, complaint domains, UI surfaces, and P0 audio scope.

## Complaint/Anomaly Pass Changes

The complaint/anomaly pass expands the existing 20 complaint seeds into production-facing content references.

Added planning details include:

- UI exposure per complaint,
- field scene beats,
- evidence and anomaly links,
- sound cue intent,
- report result handling,
- failure pressure,
- Room 307 stage impact,
- validation criteria.

The development master now contains a Complaint/Anomaly production authoring contract. It clarifies how to use existing data fields without inventing new runtime state:

- `LinkedAnomalies`
- `RequiredEvidenceTags`
- `EvidenceTagsGranted`
- `AllowedReportResults`
- `DefaultCanonicalResult`
- `ActivationTags`
- `CompletionTags`
- `ConsequenceTags`

The art master now contains complaint/anomaly scene criteria by chapter and domain. It explains which visual anchors, props, lighting changes, and ambiguity rules each complaint domain should use.

`NightCaretaker_ComplaintAnomaly_Detail.md` gives the detailed production reference for all 20 complaints and their linked anomaly intent.

`NightCaretaker_ComplaintAnomaly_Diagrams.md` gives Mermaid diagrams for chapter flow, one-complaint sequence, evidence/report flow, Room 307 escalation, and failure pressure.

`NightCaretaker_ComplaintAnomaly_Matrix.html` gives a standalone browser-readable matrix for complaint ids, UI, evidence, sound, world state, and validation.

## Level/Space Pass Changes

The level/space pass turns the existing flow, UI, sound, and complaint/anomaly hooks into production-facing space requirements.

Added planning details include:

- space roles and mandatory traversal responsibilities,
- representative `LocationId` mapping,
- vertical slice route validation,
- required props and interaction anchors,
- revisit variation rules,
- P0 blockout priority.

The development master now contains a level/space implementation contract for:

- `LocationId`
- `AccessState`
- `PowerState`
- `TensionStage`
- `Room307Stage`
- `Progression.*`

The art master now contains blockout and asset-facing criteria for management office, lobby/mailbox, 2F hallway, 3F hallway, stair/elevator, 4F/CCTV, basement electrical room, and Room 307 interior.

`NightCaretaker_LevelSpace_Detail.md` gives the detailed production reference for spaces, required props, state hooks, revisit variations, and vertical slice checks.

`NightCaretaker_LevelSpace_Diagrams.md` gives Mermaid diagrams for building route, vertical slice sequence, access state flow, revisit variation, and Room 307 convergence.

`NightCaretaker_LevelSpace_Matrix.html` gives a standalone browser-readable dark low-saturation matrix for spaces, `LocationId`, complaints, state hooks, required assets, and validation.

## Vertical Slice Pass Changes

The vertical slice pass converts the route and production requirements into implementation-ready tickets and smoke-test criteria.

Added planning details include:

- 10-step route checklist,
- required implementation ticket groups,
- UI, audio, lighting, interaction, and complaint runtime checkpoints,
- failure pressure and completion criteria,
- smoke-test pass criteria.

The development master now contains a vertical slice implementation ticket structure with fixed groups:

- `VS-BLOCKOUT`
- `VS-INTERACTION`
- `VS-COMPLAINT`
- `VS-UI`
- `VS-AUDIO`
- `VS-LIGHTING`
- `VS-QADEBUG`

The art master now contains the demo P0 art pass checklist covering office, 2F hallway, 3F hallway, basement, 307 door, connector spaces, and final polish.

`NightCaretaker_VerticalSlice_Detail.md` gives the detailed production checklist for the 10-step demo route and implementation tickets.

`NightCaretaker_VerticalSlice_Diagrams.md` gives Mermaid diagrams for the route, ticket dependency flow, state gates, smoke-test loop, and ownership boundaries.

`NightCaretaker_VerticalSlice_Checklist.html` gives a standalone browser-readable dark low-saturation checklist for route steps, ticket groups, and smoke-test pass criteria.

## Design Boundaries

- This work item does not alter code, assets, or runtime data.
- The sound pass specifies production intent, naming, and state contracts, but it does not create Unreal assets or MetaSound graphs.
- The complaint/anomaly pass specifies content production intent, but it does not create Data Assets, Blueprint actors, MetaSound graphs, or level sequences.
- The level/space pass specifies blockout, asset, and hook requirements, but it does not create maps, actors, assets, or level scripts.
- The vertical slice pass specifies implementation tickets and validation gates, but it does not execute those tickets.

## Handoff Notes

The next sequential part should be Implementation Kickoff or P0 Runtime Task Execution.

Start from the flow, UI, sound, complaint/anomaly, level/space, and vertical slice hooks now defined:

- `ENCShiftPhase`
- `ENCComplaintRuntimeState`
- `PowerState`
- `TensionStage`
- `Room307Stage`
- `DomainTags`
- `Evidence.Audio`
- `Evidence.Document`
- `Evidence.Records`
- `Evidence.Visual`
- `Evidence.Environmental`
- `Progression.*`
- `LocationId`
- `AccessState`
- `VS-BLOCKOUT`
- `VS-INTERACTION`
- `VS-COMPLAINT`
- `VS-UI`
- `VS-AUDIO`
- `VS-LIGHTING`
- `VS-QADEBUG`

The next pass should pick the first P0 runtime ticket and implement it incrementally. It should not add new gameplay states unless the state already exists in planning or implementation contracts.

## Update Log

- 2026-04-26: Initial game flow expansion completed.
- 2026-04-26: UI/UX detailed pass completed.
- 2026-04-26: Sound detail pass completed.
- 2026-04-26: Complaint/anomaly 20-pack expansion completed.
- 2026-04-26: Level/space production detail pass completed.
- 2026-04-26: Demo vertical slice production checklist completed.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

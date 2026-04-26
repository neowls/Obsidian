# Planning Detail Expansion Overview

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

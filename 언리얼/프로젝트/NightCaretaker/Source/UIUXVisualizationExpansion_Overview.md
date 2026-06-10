---
aliases:
  - "UIUX Visualization Expansion Overview"
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

# UIUX Visualization Expansion Overview

> [!summary] 문서 목적
> Expand the UI/UX companion documentation so designers and Unreal implementers can review widget contracts, UMG construction rules, data ownership, input policy, and devel...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/UIUXVisualizationExpansion_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Status | 주요 섹션 |
| Completed Work | 주요 섹션 |
| Remaining Work | 주요 섹션 |
| Blockers | 주요 섹션 |
| Risks | 주요 섹션 |
| Validation State | 주요 섹션 |
| Latest Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

Expand the UI/UX companion documentation so designers and Unreal implementers can review widget contracts, UMG construction rules, data ownership, input policy, and developer diagrams without changing runtime code or assets.

## Scope

- Extend `Document/NightCaretaker_UIUX_Detail.md` with Unreal widget implementation contracts, UMG style rules, widget tree specifications, data/event ownership, and P0/P1 split.
- Add `Document/NightCaretaker_UIUX_Diagrams.md` as a Mermaid companion document.
- Extend `Document/NightCaretaker_UIUX_Wireframes.html` with style tokens, widget tree cards, developer flow notes, and input policy references.
- Add only shared UI/UX documentation CSS hooks to `Document/NightCaretaker_DocTheme.css`.
- Add the new diagram document to `Document/README.md`.

## Current Status

Complete.

## Completed Work

- Confirmed this pass is documentation/HTML/CSS only.
- Confirmed existing runtime UI structure uses `ANCPlayerControllerBase`, `UNCUISubsystem`, `UNCUserWidget`, `UNCPlayerHUDWidget`, `ENCWidgetInputPolicy`, and `FNCHUDState`.
- Confirmed `Config/DefaultGame.ini` contains CommonUI settings, while the searched runtime code path does not depend on CommonUI.
- Created task-level tracking documents for this work item.
- Expanded `NightCaretaker_UIUX_Detail.md` with implementation contracts, style guide, widget trees, ownership rules, and P0/P1 split.
- Added `NightCaretaker_UIUX_Diagrams.md` with class, flow, sequence, state, corruption, and priority Mermaid diagrams.
- Expanded `NightCaretaker_UIUX_Wireframes.html` with style tokens, widget trees, developer flow cards, input policy matrix, and UML notes while preserving existing screen examples.
- Added UI/UX documentation CSS hooks to `NightCaretaker_DocTheme.css`.
- Added the new UI/UX diagram document to `Document/README.md`.

## Remaining Work

- None for this documentation expansion pass.

## Blockers

- None.

## Risks

- The worktree already contains many modified and untracked documentation files; this pass must avoid reverting or normalizing unrelated files.
- `WBP_NCPlayerHUD` binding notes must preserve the existing `ReticleImage` optional binding name.
- CommonUI must be described only as a future candidate, not as the current runtime UI base.

## Validation State

Passed.

- Confirmed `NightCaretaker_UIUX_Diagrams.md` is linked from `Document/README.md` and referenced by `NightCaretaker_UIUX_Detail.md`.
- Confirmed `classDiagram`, `sequenceDiagram`, `stateDiagram-v2`, and `flowchart` blocks exist in `NightCaretaker_UIUX_Diagrams.md`.
- Confirmed `ReticleImage`, `UNCUISubsystem`, `ENCWidgetInputPolicy`, `WBP_NCComplaintBoard`, and `WBP_NCReportForm` are reflected in the detail/diagram docs.
- Confirmed no inline `<style>` block or old bright palette values were introduced in the UI/UX HTML/CSS files.
- Confirmed no trailing whitespace in the edited README, UI/UX docs, HTML, CSS, and task tracking docs.
- `git diff --check` passed with only existing line-ending warnings on already-modified documentation files.

## Latest Update Log

- 2026-04-26: Started the UI/UX visualization expansion. Inspected current UI/UX docs, shared CSS, document hub, existing diagram style, and runtime UI classes.
- 2026-04-26: Completed documentation/HTML/CSS implementation and started validation.
- 2026-04-26: Completed validation. This pass is finished.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

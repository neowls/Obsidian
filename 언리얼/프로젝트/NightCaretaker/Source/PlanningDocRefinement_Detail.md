---
aliases:
  - "Planning Document Refinement Detail"
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

# Planning Document Refinement Detail

> [!summary] 문서 목적
> The current planning set already establishes the game's tone, platform, scope, and system pillars. The main weakness is not lack of ideas, but lack of direct player-facin...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningDocRefinement_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Documents In Scope | 주요 섹션 |
| Implemented Changes | 주요 섹션 |
| GDD Changes | 세부 기준 |
| Development Plan Changes | 세부 기준 |
| New Guide | 세부 기준 |
| Document Role Separation | 주요 섹션 |
| Validation Outcome | 주요 섹션 |
| Notes | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

The current planning set already establishes the game's tone, platform, scope, and system pillars. The main weakness is not lack of ideas, but lack of direct player-facing explanation. Important information exists, but it is spread across multiple sections. A reader can understand the mood of the game while still not being able to quickly answer what the player actually does each minute, what must be reported, what counts as progress, and why each chapter matters.

This task refined the planning docs with three documentation goals:

1. Make the gameplay purpose legible from a player perspective.
2. Translate atmosphere-heavy planning into actionable content structures.
3. Connect narrative escalation to repeatable production units.

## Documents In Scope

- `Document/NightCaretaker_307_GDD.md`
- `Document/NightCaretaker_307_DevelopmentPlan.md`
- `Document/NightCaretaker_Gameplay_Content_Guide.md`

## Implemented Changes

### GDD Changes

The GDD was updated to make player purpose visible near the top of the gameplay structure.

Added or expanded:

- player role and work principles,
- player action boundaries,
- required progression behavior,
- short/mid/long-term objective framing,
- reward framing,
- chapter-purpose summaries,
- complaint categories and gameplay purpose,
- anomaly categories and escalation logic,
- demo communication goals.

This keeps the full GDD as the master vision document while making it easier to read from a player-experience perspective.

### Development Plan Changes

The development plan was updated to convert abstract gameplay intent into production units.

Added or expanded:

- player objective hierarchy,
- complaint authoring requirements,
- chapter-by-chapter content obligations,
- content package definitions for complaints, anomalies, discoveries, and world-state changes,
- stronger playtest questions about clarity of player purpose.

This makes the document more useful as a scope-control and production reference.

### New Guide

A new guide was added to provide the fastest onboarding path for the concept.

`NightCaretaker_Gameplay_Content_Guide.md` focuses on:

- what the game is,
- what the player does,
- what the player must do,
- what they should not expect,
- why the player keeps moving forward,
- how content is organized,
- what each chapter must communicate,
- what the demo must prove.

## Document Role Separation

- `NightCaretaker_307_GDD.md`: full vision and comprehensive design reference.
- `NightCaretaker_307_DevelopmentPlan.md`: execution, scope, and production guidance.
- `NightCaretaker_Gameplay_Content_Guide.md`: fast communication document for gameplay intent and content structure.

## Validation Outcome

After the edits, a new reader should be able to answer these questions much faster than before:

- Who is the player in this game?
- What actions are actually available?
- What must be done to progress?
- How are complaints and anomalies supposed to function?
- Why does the player keep going back into danger?
- What does each chapter need to achieve?

## Notes

The `apply_patch` tool was unavailable in this session due to a sandbox setup error, so the documentation files were written through PowerShell file writes instead.

## Update Log

- 2026-03-29: Initial analysis and change plan recorded.
- 2026-03-29: GDD and development plan revised.
- 2026-03-29: New gameplay/content guide added.
- 2026-03-29: Work item closed after verification pass.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

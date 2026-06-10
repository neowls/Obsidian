---
aliases:
  - "Widget Source Removal Detail"
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

# Widget Source Removal Detail

> [!summary] 문서 목적
> 이 문서는 NightCaretaker 프로젝트의 제작 판단과 후속 작업을 지원하기 위한 자료다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/WidgetSourceRemoval_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Removed Source Area | 주요 섹션 |
| External Dependency Cleanup | 주요 섹션 |
| Verification Result | 주요 섹션 |
| Follow-Up Impact | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent
- The current task is a hard reset of the C++ widget layer so a new structure can be designed from a clean baseline.
- This removal targets code in `Source`, not a redesign yet.

## Removed Source Area
- Deleted all files that previously lived under `Source/NightCaretaker/Widget`.

## External Dependency Cleanup
- `Source/NightCaretaker/System/NCPlayerControllerBase.*`
  - Removed HUD widget class ownership.
  - Removed HUD widget source object ownership.
  - Removed runtime HUD spawn path from `BeginPlay`.
- `Source/NightCaretaker/Character/NCPlayerCharacter.*`
  - Removed HUD widget source include and helper access.
  - Removed reticle/HUD-targeting update function and associated opacity properties.
  - Kept door/prop interaction flow and sprint blocking intact.
- `Source/NightCaretaker/System/Complaint/NCComplaintRuntimeSubsystem.*`
  - Removed `INCWidgetSource` inheritance.
  - Removed widget listener registration, unregistration, and refresh broadcast plumbing.
  - Kept complaint progression and achievement submission flow intact.
- `Source/NightCaretaker/System/Shift/NCShiftStateComponent.*`
  - Removed `INCWidgetSource` inheritance.
  - Removed widget listener storage and refresh broadcasts.
  - Kept shift/chapter/focused-complaint/progression-tag state management intact.
- `Source/NightCaretaker/NightCaretaker.Build.cs`
  - Removed `UMG` from public module dependencies because no remaining source file requires the old widget layer.

## Verification Result
- No remaining references were found in `Source` for:
  - `NCUISubsystem`
  - `NCUserWidget`
  - `NCWidget*`
  - `FNCWidgetContext`
  - `INCWidgetSource`
  - `NCPlayerHUDWidget*`
- The widget source directory itself no longer exists.

## Follow-Up Impact
- Any Blueprint or content-side references to deleted widget C++ classes now need replacement.
- A new UI architecture can be rebuilt without carrying the old listener/context/subsystem design.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

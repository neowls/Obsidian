---
aliases:
  - "Master Docs Operational Refresh - Detail"
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

# Master Docs Operational Refresh - Detail

> [!summary] 문서 목적
> 이번 작업은 남아 있는 장문 마스터 문서를 실행 가능한 작업 문서로 바꾸는 것이다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/MasterDocsOperationalRefresh_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Purpose | 주요 섹션 |
| Inputs | 주요 섹션 |
| Current Code/Content Snapshot | 주요 섹션 |
| C++ Systems | 세부 기준 |
| Content | 세부 기준 |
| Rewrite Rules | 주요 섹션 |
| Expected Output | 주요 섹션 |
| Validation Plan | 주요 섹션 |
| Backup Paths | 주요 섹션 |
| Implementation Notes | 주요 섹션 |
| Development Master | 세부 기준 |
| Art Master | 세부 기준 |
| HTML Companion Views | 세부 기준 |
| Validation Results | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Purpose

이번 작업은 남아 있는 장문 마스터 문서를 실행 가능한 작업 문서로 바꾸는 것이다.
기획 문서는 이미 플레이어 행동, 시스템 반응, 구현 단위, 검증 기준 중심으로 정리되었으므로, 개발/아트 문서도 같은 규칙을 따른다.

## Inputs

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`
- `Source/NightCaretaker`
- `Content/NightCaretaker`
- `Config/DefaultGameplayTags.ini`

## Current Code/Content Snapshot

### C++ Systems

| Area | Existing Types |
| --- | --- |
| Player/Camera | `ANCPlayerCharacter`, `UNCPlayerCharacterMovementComponent`, `UNCRealityCameraComponent` |
| Interaction | `UNCPropInteractorComponent`, `UNCPhysicsCarryTargetComponent`, `ANCDoorActor` |
| Runtime State | `ANCGameStateBase`, `UNCShiftStateComponent`, `UNCComplaintRuntimeComponent`, `UNCComplaintRuntimeSubsystem` |
| Data | `UNCComplaintDefinition`, `UNCAnomalyDefinition`, `UNCAchievementDefinition`, `FNCChapterComplaintRow` |
| UI | `UNCUISubsystem`, `UNCPlayerHUDWidget`, `UNCUserWidget` |
| Debug | `UNCDebugCheatManager` |

### Content

| Area | Current Assets |
| --- | --- |
| Levels | `DevLevel`, `Level`, `Prop_Pallet` |
| Player | `BP_NCCharacter` |
| System BPs | `BP_NCGameMode`, `BP_NCGameState`, `BP_NCPlayerController`, `BP_NCPlayerState` |
| Data | `DA_Complaint`, `DA_Anomaly`, `DA_Achievement`, `DT_ChapterComplaint` |
| Props | `BP_NCDoor`, `BP_NCDoorBase`, `BP_PhysicalPropBase`, `BP_PhysicalPropCube` |
| Modules | `SM_Floor_01A`, `SM_Wall_01A`, `SM_Wall_01B`, `SM_Wall_02A`, wall textures/materials |
| UI | `WBP_NCPlayerHUD` |

## Rewrite Rules

| Rule | Application |
| --- | --- |
| Source of truth | Planning Master defines game intent. Development/Art define execution. |
| Practical first | Every section should answer what to build, in what order, with what pass criteria. |
| Archive details | Old long explanations stay in Archive backups. |
| Current reality | Development Master must reflect current C++ APIs instead of idealized future systems. |
| Production order | Art Master must list reference work, mockups, P0 asset order, and review gates. |

## Expected Output

1. Development Master rewritten as:
   - current implementation snapshot,
   - architecture contract,
   - P0 feature backlog,
   - milestone order,
   - smoke-test and validation steps.

2. Art Master rewritten as:
   - visual target,
   - reference board requirements,
   - P0 asset/mockup deliverables,
   - production order,
   - review and acceptance criteria.

## Validation Plan

- Confirm both master documents are shorter and structured around executable tasks.
- Confirm references to Planning Master and Archive backups are present.
- Confirm README still points to the three active master documents.
- Confirm no companion files need to return to the top-level `Document` folder.

## Backup Paths

- `Document/Archive/Development/NightCaretaker_Development_Master_PreOperationalRefresh_20260526.md`
- `Document/Archive/Art/NightCaretaker_Art_Master_PreOperationalRefresh_20260526.md`

## Implementation Notes

### Development Master

The new Development Master focuses on:

- P0 vertical slice target.
- Current implementation snapshot.
- State and data contract using existing C++ types.
- P0 feature backlog from shift bootstrap to smoke-test debug commands.
- Milestones and acceptance criteria.

The document explicitly maps Planning's large phase concepts to the current implementation:

- `CurrentChapterId`
- `ENCShiftPhase`
- `ProgressionTags`

This avoids expanding enums before the P0 loop proves the need.

### Art Master

The new Art Master focuses on:

- Visual target and production pillars.
- P0 reference board requirements.
- Current content snapshot.
- P0 visual route.
- Required mockups.
- P0 asset backlog.
- Production order and review criteria.

The art document avoids generic mood language unless it leads to a concrete reference, mockup, asset, or review gate.

### HTML Companion Views

Added:

- `Document/Archive/Companion/NightCaretaker_Development_Master_View.html`
- `Document/Archive/Companion/NightCaretaker_Art_Master_View.html`

These views reuse the existing master view CSS:

- `Document/Archive/Companion/NightCaretaker_Planning_Master_View.css`

The Markdown master documents remain the source of truth.

## Validation Results

| Check | Result |
| --- | --- |
| Development Master structure | Operational sections confirmed from target through maintenance rule. |
| Art Master structure | Operational sections confirmed from art target through maintenance rule. |
| Top-level `Document` files | Still limited to `README.md` and the three Master documents. |
| Backups | Development/Art pre-refresh backups confirmed in Archive. |
| HTML views | Planning/Development/Art companion views confirmed in `Archive/Companion`. |
| CSS references | Development/Art HTML views link to `NightCaretaker_Planning_Master_View.css`. |

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

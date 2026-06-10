---
aliases:
  - "Simple Widget Framework Overview"
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

# Simple Widget Framework Overview

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
| 파일 경로 | `Source/SimpleWidgetFramework_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Summary | 주요 섹션 |
| Scope | 주요 섹션 |
| Completed | 주요 섹션 |
| Remaining | 주요 섹션 |
| Risks | 주요 섹션 |
| Validation | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Summary
- Work item: Rebuild the widget layer with a small local-player HUD framework.
- Status: Completed
- Started: 2026-03-28
- Last Updated: 2026-03-28

## Scope
- Reintroduce a minimal `Widget` source folder with `NCUserWidget`, `NCUISubsystem`, `NCPlayerHUDWidget`, and shared HUD/widget types.
- Restore `UMG` dependency required for `UUserWidget`-based types.
- Auto-spawn a HUD widget from the local player controller through the local-player UI subsystem.
- Push only simple reticle visibility and focus state from player interaction code into the HUD.
- Leave menu widgets, complaint/report widgets, and generic widget-source/listener plumbing out of scope.

## Completed
- Recreated the core widget type definitions for input policy and HUD state.
- Reintroduced a lightweight `NCUserWidget` base with only shared subsystem access and input policy.
- Added a local-player `NCUISubsystem` that owns HUD lifetime and cached HUD state.
- Added `NCPlayerHUDWidget` with `BindWidgetOptional` caching support for a reticle image.
- Reconnected `NCPlayerControllerBase` so local begin play spawns the configured HUD class through the subsystem.
- Reconnected `NCPlayerCharacter` so door/prop targeting updates HUD reticle focus state.
- Verified the new native widget layer compiles against the project's configured UE 5.7 environment.

## Remaining
- Open the editor and resave `WBP_NCPlayerHUD` if the asset needs designer-side reticle binding cleanup.

## Risks
- Existing widget Blueprint bindings may still expect old fields that were intentionally not restored.
- If the HUD Blueprint uses a different reticle widget name than `ReticleImage`, the optional cache will stay null and visual updates will rely only on exposed state variables.

## Validation
- UE 5.7 editor build: succeeded.
- `rg -a` asset string scan: `WBP_NCPlayerHUD` still references `NCPlayerHUDWidget`, `NCUserWidget`, `bShowReticle`, and `bHasReticleFocus`.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

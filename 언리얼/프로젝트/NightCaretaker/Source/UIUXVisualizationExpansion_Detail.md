---
aliases:
  - "UIUX Visualization Expansion Detail"
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

# UIUX Visualization Expansion Detail

> [!summary] 문서 목적
> The requested implementation is a documentation-only UI/UX expansion. It must not modify C++ source, Blueprint assets, maps, or Unreal editor assets.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/UIUXVisualizationExpansion_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Work Item | 주요 섹션 |
| Verified Runtime Baseline | 주요 섹션 |
| CommonUI Position | 주요 섹션 |
| Documentation Ownership | 주요 섹션 |
| Implementation Notes | 주요 섹션 |
| Validation Plan | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Work Item

The requested implementation is a documentation-only UI/UX expansion. It must not modify C++ source, Blueprint assets, maps, or Unreal editor assets.

## Verified Runtime Baseline

Runtime UI code currently centers on a minimal UMG structure:

- `Source/NightCaretaker/System/NCPlayerControllerBase.*`
  - Owns `PlayerHUDWidgetClass`.
  - Calls `ShowRuntimeHUD()` from `BeginPlay()`.
  - For local controllers, resolves the `ULocalPlayer` and asks `UNCUISubsystem` to show the configured HUD widget.
- `Source/NightCaretaker/Widget/NCUISubsystem.*`
  - `ULocalPlayerSubsystem` that owns the runtime HUD widget instance.
  - Caches `FNCHUDState`.
  - Exposes `ShowPlayerHUD`, `HidePlayerHUD`, `GetPlayerHUDWidget`, `GetHUDState`, `SetHUDState`, `SetReticleVisible`, and `SetReticleFocus`.
  - Pushes state into `UNCPlayerHUDWidget::ApplyHUDState`.
- `Source/NightCaretaker/Widget/NCUserWidget.*`
  - Shared widget base.
  - Exposes `GetNCUISubsystem()` and `GetInputPolicy()`.
  - Stores `InputPolicy` as an `EditDefaultsOnly` Blueprint-readable setting.
- `Source/NightCaretaker/Widget/NCPlayerHUDWidget.*`
  - Runtime HUD native parent intended for `WBP_NCPlayerHUD`.
  - Uses transient Blueprint-readable `bShowReticle` and `bHasReticleFocus`.
  - Uses optional UMG binding `ReticleImage`.
  - Applies default/focus tint to the reticle when the binding exists.
- `Source/NightCaretaker/Widget/NCWidgetTypes.h`
  - Defines `ENCWidgetInputPolicy`: `GameOnly`, `GameAndUI`, `UIOnly`.
  - Defines `FNCHUDState`: `bShowReticle`, `bHasReticleFocus`.

## CommonUI Position

`Config/DefaultGame.ini` includes CommonUI settings, but the searched runtime UI code path uses project UMG classes directly. The documentation will therefore keep CommonUI as a future review candidate for menu/settings work only.

## Documentation Ownership

- `NightCaretaker_UIUX_Detail.md` owns the implementer-facing written contract.
- `NightCaretaker_UIUX_Diagrams.md` owns Mermaid class, flow, sequence, state, and corruption-stage diagrams.
- `NightCaretaker_UIUX_Wireframes.html` owns static visual review examples and compact production reference cards.
- `NightCaretaker_DocTheme.css` owns reusable visual classes for HTML documentation.
- `Document/README.md` owns discovery links.

## Implementation Notes

- `NightCaretaker_UIUX_Detail.md` now preserves the existing screen-level guidance and adds:
  - Unreal widget implementation contract.
  - UMG style guide.
  - Widget tree specifications for HUD, complaint board, report form, notebook, document viewer, pause/settings, and toast.
  - Data binding and event ownership rules.
  - P0/P1 split.
- `NightCaretaker_UIUX_Diagrams.md` now includes:
  - `classDiagram` for runtime/widget boundaries.
  - `flowchart` for widget stack transitions.
  - `sequenceDiagram` blocks for HUD focus, complaint accept, evidence registration, report submit, and document read.
  - `stateDiagram-v2` for input policy states.
  - `flowchart` for `RecordIntegrity` corruption and P0/P1 split.
- `NightCaretaker_UIUX_Wireframes.html` keeps the existing HUD/board/report/notebook/settings examples and adds:
  - Style token cards.
  - Widget tree cards.
  - Runtime contract cards.
  - Developer flow lanes.
  - Input policy matrix.
  - UML notes linking to the new Mermaid document.
- `NightCaretaker_DocTheme.css` now owns the additional classes used by the expanded UI/UX HTML.
- `Document/README.md` now links to `NightCaretaker_UIUX_Diagrams.md`.

## Validation Plan

Completed.

| Check | Result |
| --- | --- |
| `NightCaretaker_UIUX_Diagrams` link/reference search | Passed |
| Mermaid block search for `classDiagram`, `sequenceDiagram`, `stateDiagram-v2`, `flowchart` | Passed |
| Unreal contract keyword search | Passed |
| Inline `<style>` / old bright palette search | Passed, no matches |
| Trailing whitespace search on edited files | Passed, no matches |
| `git diff --check` | Passed with line-ending warnings only |

## Update Log

- 2026-04-26: Captured verified runtime UI baseline and implementation constraints before editing the companion documents.
- 2026-04-26: Completed document, HTML, CSS, and README edits. Validation is now in progress.
- 2026-04-26: Validation completed. No whitespace errors or forbidden HTML/CSS patterns were found in the edited files.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

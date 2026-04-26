# UIUX Visualization Expansion Detail

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

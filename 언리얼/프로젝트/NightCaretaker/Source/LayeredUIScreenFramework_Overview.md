# Layered UI Screen Framework Overview

## Summary
- Work item: Extend the local-player UI subsystem from HUD-only ownership into a small layered screen manager.
- Status: Completed
- Started: 2026-04-26
- Last Updated: 2026-04-26

## Scope
- Keep `UNCUserWidget` as the minimal shared base for passive view and element widgets.
- Add a dedicated `UNCScreenWidget` base for widgets that own screen lifetime, input policy, focus, and layer behavior.
- Extend `UNCUISubsystem` so it owns HUD, screen, modal, and overlay layer widgets for the local player.
- Preserve the existing passive HUD state path used by `ANCPlayerCharacter`.
- Avoid inventory/journal/pause gameplay implementation until concrete gameplay requirements exist.

## Completed
- Existing HUD and widget code paths inspected.
- Existing `SimpleWidgetFramework` documentation reviewed to avoid duplicate scope.
- Added `ENCUILayer` and `FNCScreenWidgetOptions` to `NCWidgetTypes.h`.
- Added `UNCScreenWidget` as the dedicated top-level screen base.
- Extended `UNCUISubsystem` with `ShowScreen`, `ShowScreenWithOptions`, `HideScreen`, `HideScreenWidget`, `HideAllScreens`, and active-screen query APIs.
- Added per-layer viewport Z order defaults: HUD 0, Screen 100, Modal 200, Overlay 300.
- Added input mode refresh from the highest-priority active input-owning screen.
- Preserved the existing passive HUD state and reticle update flow.
- Added explicit `Slate` and `SlateCore` module dependencies for direct focus/Slate widget usage.
- Added thin top-level screen native parent classes:
  - `UNCComplaintBoardWidget`
  - `UNCReportFormWidget`
  - `UNCNotebookWidget`
  - `UNCDocumentViewerWidget`
  - `UNCPauseMenuWidget`
  - `UNCSettingsMenuWidget`
  - `UNCConfirmPromptWidget`
- Synced the UI/UX companion documents with the layered screen contract:
  - `Document/NightCaretaker_UIUX_Detail.md`
  - `Document/NightCaretaker_UIUX_Diagrams.md`
  - `Document/NightCaretaker_UIUX_Wireframes.html`

## Remaining
- Create Blueprint screen assets for Inventory, Journal, Pause, Settings, and modal prompts as needed.
- Wire gameplay-specific commands through presenter/coordinator functions rather than making widgets authoritative state owners.
- When existing Blueprint top-level screens are migrated, make them inherit from their dedicated `UNC*Widget` parent instead of `UNCUserWidget`.

## Risks
- Blueprint screen assets will need to inherit from `UNCScreenWidget` to participate in subsystem-managed screen lifetime.
- Existing controller input setup could conflict if another system also writes input mode after the UI subsystem.
- Modal stacking is intentionally minimal; it supports one active screen per layer for now.

## Validation
- UE 5.7 Editor Win64 Development build: succeeded.
- Build warning: Visual Studio 2026 compiler is not Epic's preferred version for this engine install, but compilation and linking succeeded.
- UI/UX documentation was updated to reflect `HUD`, `Screen`, `Modal`, and `Overlay` layer ownership.

## Update Log
- 2026-04-26: Created initial task documents and selected a minimal layered screen manager approach.
- 2026-04-26: Implemented `UNCScreenWidget`, layered screen APIs, input mode handling, and build validation.
- 2026-04-26: Updated UI/UX detail, diagram, and wireframe documents to match the new layered screen framework.
- 2026-04-26: Added thin top-level screen native parent classes for board, report, notebook, document viewer, pause, settings, and confirm prompt screens.

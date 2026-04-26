# Layered UI Screen Framework Detail

## Design Intent
- The project already has the right base split for passive HUD rendering:
  - gameplay computes state
  - `UNCUISubsystem` owns local-player UI lifetime
  - `UNCPlayerHUDWidget` receives state and renders it
- This work extends only the screen ownership side of that model.
- The key responsibility boundary is input and screen lifetime ownership, not whether a child widget can receive mouse events.

## Target Responsibility Split
- `UNCUserWidget`
  - Minimal shared base for all project UMG widgets.
  - Passive views and interactive elements can inherit from this directly.
  - It does not add viewport ownership or gameplay state authority.
- `UNCScreenWidget`
  - Dedicated base for inventory, journal, pause menu, settings, modal prompts, and similar top-level screens.
  - Owns metadata that the UI subsystem needs to decide layer, input mode, and focus.
  - Exposes native and Blueprint lifecycle hooks for screen activation/deactivation.
- `UNCUISubsystem`
  - Local-player coordinator.
  - Owns HUD lifetime and cached HUD state.
  - Owns screen instances per UI layer.
  - Applies player-controller input mode according to the highest-priority active screen.

## Planned Data Model
- `ENCUILayer`
  - `HUD`
  - `Screen`
  - `Modal`
  - `Overlay`
- `ENCWidgetInputPolicy`
  - Existing enum kept as the input mode policy.
  - `GameOnly` means gameplay remains the active input owner.
  - `GameAndUI` means mouse/UI focus can coexist with gameplay input.
  - `UIOnly` means the screen owns input focus.
- `FNCScreenWidgetOptions`
  - Small option struct passed when showing a screen:
    - `bUseWidgetDefaultLayer`
    - `LayerOverride`
    - `ZOrderOverride`

## Implemented Files
- `Source/NightCaretaker/Widget/NCWidgetTypes.h`
  - Added `ENCUILayer`.
  - Added `FNCScreenWidgetOptions`.
  - Kept `ENCWidgetInputPolicy` as the shared input policy for widgets that can affect controller input mode.
- `Source/NightCaretaker/Widget/NCScreenWidget.h`
  - Added `UNCScreenWidget`.
  - Intended for input-owning screens only, not passive HUD/view/element widgets.
  - Key defaults:
    - `InputPolicy = GameAndUI`
    - root widget focusable at construction
    - `UILayer = Screen`
    - `ZOrderOverride = INDEX_NONE`
    - `bShowMouseCursorWhenOpen = true`
  - Exposes:
    - `GetUILayer`
    - `GetZOrderOverride`
    - `GetDesiredFocusWidget`
    - `ShouldShowMouseCursorWhenOpen`
    - `RequestClose`
  - Provides native and Blueprint lifecycle hooks:
    - `NativeOnScreenOpened`
    - `NativeOnScreenClosed`
    - `BP_OnScreenOpened`
    - `BP_OnScreenClosed`
- `Source/NightCaretaker/Widget/NCScreenWidget.cpp`
  - Implements screen defaults.
  - `RequestClose` routes closure back through `UNCUISubsystem::HideScreenWidget`.
  - `GetDesiredFocusWidget` returns `InitialFocusWidget` when bound, otherwise the screen root.
- `Source/NightCaretaker/Widget/NCUISubsystem.h`
  - Added managed screen API surface:
    - `ShowScreen`
    - `ShowScreenWithOptions`
    - `HideScreen`
    - `HideScreenWidget`
    - `HideAllScreens`
    - `GetActiveScreen`
    - `HasActiveScreen`
  - Added transient `ActiveScreens` map keyed by `ENCUILayer`.
- `Source/NightCaretaker/Widget/NCUISubsystem.cpp`
  - Keeps the existing HUD lifetime path.
  - Uses HUD layer default Z order for `ShowPlayerHUD`.
  - Opens one active screen per managed layer: `Screen`, `Modal`, `Overlay`.
  - Rejects `HUD` as a screen layer because HUD remains the passive HUD path.
  - Applies input mode from priority order: Overlay, Modal, Screen.
  - Restores `GameOnly` and hides the cursor when no input-owning screen is active.
- `Source/NightCaretaker/NightCaretaker.Build.cs`
  - Added private `Slate` and `SlateCore` dependencies because the subsystem directly focuses Slate widgets through UMG.
- Top-level screen native parent files:
  - `NCComplaintBoardWidget.h/.cpp`
  - `NCReportFormWidget.h/.cpp`
  - `NCNotebookWidget.h/.cpp`
  - `NCDocumentViewerWidget.h/.cpp`
  - `NCPauseMenuWidget.h/.cpp`
  - `NCSettingsMenuWidget.h/.cpp`
  - `NCConfirmPromptWidget.h/.cpp`
  - Each class is intentionally thin and only sets `UILayer`, `InputPolicy`, and cursor visibility defaults.

## Top-Level Screen Defaults

| Class | Layer | Input Policy | Cursor |
| --- | --- | --- | --- |
| `UNCComplaintBoardWidget` | `Screen` | `GameAndUI` | Visible |
| `UNCReportFormWidget` | `Screen` | `GameAndUI` | Visible |
| `UNCNotebookWidget` | `Screen` | `GameAndUI` | Visible |
| `UNCDocumentViewerWidget` | `Screen` | `GameAndUI` | Visible |
| `UNCPauseMenuWidget` | `Screen` | `UIOnly` | Visible |
| `UNCSettingsMenuWidget` | `Modal` | `UIOnly` | Visible |
| `UNCConfirmPromptWidget` | `Overlay` | `UIOnly` | Visible |

## Planned Flow
- Gameplay or controller code asks `UNCUISubsystem` to show a screen class.
- The subsystem creates or reuses the layer's active `UNCScreenWidget`.
- The subsystem adds the screen to the viewport using the layer Z order.
- The screen receives a native/Blueprint opened notification.
- The subsystem applies input mode and focus from the highest-priority active input-owning screen.
- When hidden, the screen receives a native/Blueprint closed notification and the subsystem restores input mode from the next active screen or GameOnly.

## HUD Compatibility
- `ShowPlayerHUD`, `HidePlayerHUD`, `SetHUDState`, and the current character reticle flow remain stable.
- HUD is treated as passive and should not request UI input ownership.
- The existing `UNCPlayerHUDWidget` remains a view widget rather than a screen widget.

## Runtime Data Flow
- Passive HUD:
  - `ANCPlayerCharacter::RefreshHUDState`
  - `UNCUISubsystem::SetHUDState`
  - `UNCPlayerHUDWidget::ApplyHUDState`
- Input-owning screen:
  - Controller/gameplay/Blueprint calls `UNCUISubsystem::ShowScreen` or `ShowScreenWithOptions`.
  - `UNCUISubsystem` resolves the target layer and creates/reuses the screen.
  - `UNCScreenWidget::NotifyScreenOpened` runs native and Blueprint open hooks.
  - `UNCUISubsystem::RefreshInputMode` chooses the highest-priority active screen whose `InputPolicy` is not `GameOnly`.
  - Closing routes through `HideScreen`, `HideScreenWidget`, or `HideAllScreens`, then input mode is restored from the next active input-owning screen or `GameOnly`.

## Edge Cases
- Local player or player controller can be unavailable during teardown; subsystem functions must return safely at ownership boundaries.
- If a screen class changes on the same layer, the old instance should close and be removed before creating the new one.
- If a screen asks for focus but no focus widget is provided, focusing the screen root is acceptable.
- If no screen is active, the subsystem must restore `GameOnly` and hide the mouse cursor.
- If Blueprint accidentally requests `HUD` as a screen layer, the subsystem rejects the request and logs a warning.
- If the active screen is externally removed from the viewport, a subsequent show call can re-add and re-open the subsystem-owned instance.

## Validation Result
- Command:
  - `C:\Program Files\Epic Games\UE_5.7\Engine\Build\BatchFiles\Build.bat NightCaretakerEditor Win64 Development D:\UnrealProjects\NightCaretaker\NightCaretaker.uproject -WaitMutex -NoHotReloadFromIDE`
- Result:
  - Succeeded.
- UHT:
  - Processed `NightCaretakerEditor` successfully.
- C++:
  - Compiled `NCScreenWidget.cpp` and `NCUISubsystem.cpp`.
  - Linked `UnrealEditor-NightCaretaker.dll`.
- Non-blocking warning:
  - The installed Visual Studio 2026 compiler is not the preferred compiler version for the engine install.

## Follow-Up Guidance
- Inventory or future screen families should get their own thin `UNCScreenWidget`-derived native parent when they need stable Blueprint inheritance.
- Board, Report, Notebook, Document Viewer, Pause, Settings, and confirm dialog Blueprints should inherit from the dedicated `UNC*Widget` class listed above.
- Slot, row, tab, tooltip, and reticle widgets should keep inheriting from `UNCUserWidget` or feature-specific view/element widgets.
- Button clicks in child widgets should emit intent to the parent screen; the screen or coordinator should call gameplay components, and gameplay state should flow back into UI state.

## UI/UX Documentation Sync
- `Document/NightCaretaker_UIUX_Detail.md`
  - Updated the implementation contract from HUD-only ownership to `UNCUISubsystem`-owned `HUD`, `Screen`, `Modal`, and `Overlay` layers.
  - Marked Board, Report, Notebook, Document Viewer, Pause, Settings, and confirm prompts as dedicated `UNC*Widget` top-level screens.
  - Kept HUD child widgets, rows, tabs, prompt, and toast as `UNCUserWidget` or `UUserWidget` passive/element widgets.
- `Document/NightCaretaker_UIUX_Diagrams.md`
  - Added `UNCScreenWidget`, `ENCUILayer`, `FNCScreenWidgetOptions`, and the new `UNCUISubsystem` screen API surface to the class diagram.
  - Updated screen transition and input state diagrams around layer priority: Overlay, Modal, Screen, then GameOnly HUD.
- `Document/NightCaretaker_UIUX_Wireframes.html`
  - Updated the browser-facing implementation notes and widget table to show native parent, layer, and input policy.
  - Added the default layer/Z-order reference for HUD 0, Screen 100, Modal 200, and Overlay 300.

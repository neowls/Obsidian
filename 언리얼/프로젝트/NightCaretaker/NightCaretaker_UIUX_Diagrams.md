# NightCaretaker UI/UX Diagrams

## 목적

이 문서는 UI/UX 상세 문서를 구현자가 빠르게 검토할 수 있도록 만든 Mermaid companion 문서다. 런타임 기준은 현재 프로젝트의 UMG 구조이며, C++ 코드와 Blueprint asset은 이 문서 작업에서 변경하지 않는다.

## Widget / Runtime Class Boundary

```mermaid
classDiagram
    class ANCPlayerControllerBase {
        +PlayerHUDWidgetClass
        +BeginPlay()
        +ShowRuntimeHUD()
    }

    class UNCUISubsystem {
        -PlayerHUDWidget
        -HUDState
        +ShowPlayerHUD(InWidgetClass)
        +HidePlayerHUD()
        +GetHUDState()
        +SetHUDState(NewState)
        +SetReticleVisible(bVisible)
        +SetReticleFocus(bFocused)
    }

    class UNCUserWidget {
        #InputPolicy
        +GetNCUISubsystem()
        +GetInputPolicy()
    }

    class UNCPlayerHUDWidget {
        #bShowReticle
        #bHasReticleFocus
        #ReticleImage
        +ApplyHUDState(InHUDState)
    }

    class FNCHUDState {
        +bShowReticle
        +bHasReticleFocus
    }

    class ENCWidgetInputPolicy {
        GameOnly
        GameAndUI
        UIOnly
    }

    class WBP_NCPlayerHUD
    class WBP_NCComplaintBoard
    class WBP_NCReportForm
    class WBP_NCNotebook
    class WBP_NCDocumentViewer
    class WBP_NCPauseMenu
    class WBP_NCSettingsMenu
    class ComplaintRuntimeOwner {
        +AcceptComplaint()
        +RegisterEvidence()
        +SubmitReport()
        +GetSnapshot()
    }

    ANCPlayerControllerBase ..> UNCUISubsystem : local player lookup
    ANCPlayerControllerBase ..> UNCPlayerHUDWidget : PlayerHUDWidgetClass
    UNCUISubsystem o-- UNCPlayerHUDWidget : owns runtime HUD
    UNCUISubsystem o-- FNCHUDState : caches
    UNCPlayerHUDWidget --|> UNCUserWidget
    WBP_NCPlayerHUD --|> UNCPlayerHUDWidget
    WBP_NCComplaintBoard --|> UNCUserWidget
    WBP_NCReportForm --|> UNCUserWidget
    WBP_NCNotebook --|> UNCUserWidget
    WBP_NCDocumentViewer --|> UNCUserWidget
    WBP_NCPauseMenu --|> UNCUserWidget
    WBP_NCSettingsMenu --|> UNCUserWidget
    UNCUserWidget ..> ENCWidgetInputPolicy : configured per widget
    WBP_NCComplaintBoard ..> ComplaintRuntimeOwner : request only
    WBP_NCReportForm ..> ComplaintRuntimeOwner : request only
    WBP_NCNotebook ..> ComplaintRuntimeOwner : read snapshot
```

## Widget Stack / Screen Transition

```mermaid
flowchart TD
    Start["Local Player BeginPlay"] --> HUDClass{"PlayerHUDWidgetClass set?"}
    HUDClass -- No --> NoHUD["No runtime HUD"]
    HUDClass -- Yes --> UISub["UNCUISubsystem.ShowPlayerHUD"]
    UISub --> RuntimeHUD["WBP_NCPlayerHUD<br/>GameOnly"]

    RuntimeHUD --> Focus{"Focused interaction target?"}
    Focus -- No --> RuntimeHUD
    Focus -- Yes --> Prompt["Interaction Prompt<br/>GameOnly"]

    Prompt --> Target{"Target type"}
    Target --> Board["WBP_NCComplaintBoard<br/>GameAndUI"]
    Target --> Report["WBP_NCReportForm<br/>GameAndUI"]
    Target --> Document["WBP_NCDocumentViewer<br/>GameAndUI"]
    Target --> WorldUse["World interaction"]
    RuntimeHUD --> Notebook["WBP_NCNotebook<br/>GameAndUI"]
    RuntimeHUD --> Pause["WBP_NCPauseMenu<br/>UIOnly"]
    Pause --> Settings["WBP_NCSettingsMenu<br/>UIOnly"]

    Board --> RuntimeHUD
    Report --> RuntimeHUD
    Document --> RuntimeHUD
    Notebook --> RuntimeHUD
    Settings --> Pause
    Pause --> RuntimeHUD
    WorldUse --> RuntimeHUD
```

## HUD Focus Update Sequence

```mermaid
sequenceDiagram
    participant PC as ANCPlayerControllerBase
    participant Char as Player Character / Trace Owner
    participant UI as UNCUISubsystem
    participant HUD as WBP_NCPlayerHUD
    participant Reticle as ReticleImage

    PC->>UI: ShowPlayerHUD(WBP_NCPlayerHUD)
    Char->>Char: Detect focus target
    Char->>UI: SetReticleFocus(true/false)
    UI->>UI: Update FNCHUDState
    UI->>HUD: ApplyHUDState(HUDState)
    HUD->>Reticle: SetVisibility / SetColorAndOpacity
```

## Complaint Accept Sequence

```mermaid
sequenceDiagram
    participant Player as Player
    participant Board as WBP_NCComplaintBoard
    participant Controller as Controller Wrapper
    participant Runtime as ComplaintRuntimeOwner
    participant UI as UNCUISubsystem

    Player->>Board: Click Accept
    Board->>Controller: RequestAcceptComplaint(ComplaintId)
    Controller->>Runtime: AcceptComplaint(ComplaintId)
    Runtime-->>Controller: Updated snapshot
    Controller-->>Board: Refresh board view data
    Board->>UI: SetReticleVisible(true) on close
```

## Evidence Registration Sequence

```mermaid
sequenceDiagram
    participant Player as Player
    participant Target as World Interaction Target
    participant Controller as Controller Wrapper
    participant Runtime as ComplaintRuntimeOwner
    participant Notebook as WBP_NCNotebook
    participant Toast as WBP_NCToast

    Player->>Target: Interact / Inspect
    Target->>Controller: RequestRegisterEvidence(EvidenceTag)
    Controller->>Runtime: RegisterEvidence(EvidenceTag)
    Runtime-->>Controller: Evidence snapshot changed
    Controller-->>Notebook: Mark summary dirty
    Controller-->>Toast: Queue "단서 기록" notice
```

## Report Submit Sequence

```mermaid
sequenceDiagram
    participant Player as Player
    participant Report as WBP_NCReportForm
    participant Controller as Controller Wrapper
    participant Runtime as ComplaintRuntimeOwner
    participant Board as WBP_NCComplaintBoard
    participant World as World State Owner

    Player->>Report: Select result and submit
    Report->>Controller: RequestSubmitReport(ComplaintId, Result)
    Controller->>Runtime: Validate allowed result
    Runtime-->>Controller: Report accepted / rejected
    Controller->>World: Apply approved world state change
    Controller-->>Board: Refresh complaint state
    Controller-->>Report: Close or show validation message
```

## Document Read Sequence

```mermaid
sequenceDiagram
    participant Player as Player
    participant DocTarget as World Document Target
    participant Viewer as WBP_NCDocumentViewer
    participant Runtime as ComplaintRuntimeOwner
    participant Notebook as WBP_NCNotebook

    Player->>DocTarget: Read
    DocTarget-->>Viewer: Open document snapshot
    Viewer->>Runtime: NotifyDocumentRead(DocumentId)
    Runtime-->>Notebook: Add short summary if relevant
    Player->>Viewer: Back / Close
    Viewer-->>Player: Return to GameAndUI caller or GameOnly HUD
```

## Input Policy State Machine

```mermaid
stateDiagram-v2
    [*] --> GameOnlyRuntime

    GameOnlyRuntime: Runtime HUD / Prompt / Toast
    GameAndUIScreen: Board / Report / Notebook / Document Viewer
    UIOnlyMenu: Pause / Settings

    GameOnlyRuntime --> GameAndUIScreen: Interact board/report/document or open notebook
    GameAndUIScreen --> GameOnlyRuntime: Back / close / submit accepted
    GameOnlyRuntime --> UIOnlyMenu: Pause input
    UIOnlyMenu --> GameOnlyRuntime: Resume
    UIOnlyMenu --> UIOnlyMenu: Open settings / change tab
    GameAndUIScreen --> UIOnlyMenu: Pause allowed only if caller supports modal pause
    UIOnlyMenu --> [*]: Quit to menu
```

## RecordIntegrity UI Corruption Flow

```mermaid
flowchart LR
    Clean["Clean<br/>정상 문구와 정렬"] --> Typo["Typo<br/>호수/이름 작은 오탈자"]
    Typo --> Conflict["Conflict<br/>보드/명부 정보 불일치"]
    Conflict --> Reprinted["Reprinted<br/>닫은 민원이 새 접수처럼 재출력"]
    Reprinted --> Collapsed["Collapsed<br/>307 관련 행이 여러 기록에 침투"]

    Clean -.허용.-> SafeA["입력/닫기 정상"]
    Typo -.허용.-> SafeB["문구만 변조"]
    Conflict -.허용.-> SafeC["보고 판단에 영향"]
    Reprinted -.허용.-> SafeD["새 목표 생성"]
    Collapsed -.허용.-> SafeE["최종 접근 유도"]

    Typo -.금지.-> BadA["진행 버튼 숨김"]
    Conflict -.금지.-> BadB["Back 입력 무시"]
    Collapsed -.금지.-> BadC["필수 정보 판독 불가"]
```

## P0 / P1 Implementation Split

```mermaid
flowchart TD
    P0["P0 UI"] --> HUD["WBP_NCPlayerHUD<br/>ReticleImage binding"]
    P0 --> Prompt["Interaction Prompt"]
    P0 --> Board["WBP_NCComplaintBoard"]
    P0 --> Report["WBP_NCReportForm"]
    P0 --> Notebook["WBP_NCNotebook"]
    P0 --> Pause["WBP_NCPauseMenu"]
    P0 --> Settings["WBP_NCSettingsMenu"]

    P0Link["P0 connected, simple presentation"] --> Viewer["WBP_NCDocumentViewer"]
    P0Link --> Toast["WBP_NCToast"]

    P1["P1 polish"] --> Corruption["RecordIntegrity visual variants"]
    P1 --> Reopen["Document reread mutation"]
    P1 --> ToastQueue["Toast queue polish"]
    P1 --> CommonUICandidate["CommonUI review for menus only"]
```

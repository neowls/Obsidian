# NightCaretaker Vertical Slice Diagrams

## 목적

이 문서는 데모 수직 슬라이스 제작 체크리스트를 빠르게 검토하기 위한 Mermaid companion 문서다. 구현 기준은 Master 문서와 `NightCaretaker_VerticalSlice_Detail.md`를 우선한다.

## Vertical Slice Route

```mermaid
flowchart LR
    A["1 Office Handoff"] --> B["2 OfficeLightBuzz"]
    B --> C["3 203WaterAtDoor"]
    C --> D["4 IntercomStatic"]
    D --> E["5 3F EmergencyLight"]
    E --> F["6 302 TVHum"]
    F --> G["7 Power Outage"]
    G --> H["8 BasementPumpAlarm"]
    H --> I["9 BasementPanelMislabel"]
    I --> J["10 307PackageAtDoor"]

    J --> K["Demo End<br/>307 curiosity"]
```

## Ticket Dependency Flow

```mermaid
flowchart TD
    B1["VS-BLOCKOUT-01"] --> B2["VS-BLOCKOUT-02"]
    B1 --> I1["VS-INTERACTION-01"]
    I1 --> I2["VS-INTERACTION-02"]
    B2 --> C1["VS-COMPLAINT-01"]
    C1 --> C2["VS-COMPLAINT-02"]
    C1 --> U1["VS-UI-01"]
    U1 --> U2["VS-UI-02"]
    B1 --> A1["VS-AUDIO-01"]
    C2 --> A2["VS-AUDIO-02"]
    B1 --> L1["VS-LIGHTING-01"]
    L1 --> L2["VS-LIGHTING-02"]
    C1 --> Q1["VS-QADEBUG-01"]
    C2 --> Q2["VS-QADEBUG-02"]
    U2 --> Q2
    A2 --> Q2
    L2 --> Q2
```

## State Gate Sequence

```mermaid
stateDiagram-v2
    [*] --> BoardReview
    BoardReview --> OfficeLight: CMP_PRO_OfficeLightBuzz
    OfficeLight --> Investigating2F: CMP_PRO_203_WaterAtDoor
    Investigating2F --> AudioEvidence: CMP_CH1_2F_IntercomStatic
    AudioEvidence --> ThirdFloorUnstable: CMP_CH1_3F_EmergencyLight
    ThirdFloorUnstable --> RecordConflict: CMP_CH2_302_TVHum
    RecordConflict --> Outage: PowerState FloorOutage
    Outage --> BasementAccess: AccessState TemporaryUnlocked
    BasementAccess --> BasementPowerLinked: CMP_CH3_BasementPanelMislabel
    BasementPowerLinked --> DoorStay: CMP_CH4_307_PackageAtDoor
    DoorStay --> [*]
```

## Ownership Boundary

```mermaid
flowchart TD
    Runtime["Runtime Subsystems / State Owners"] --> Events["State Events"]
    Events --> UI["UI Widgets"]
    Events --> Level["Level Actors / BP"]
    Events --> Audio["Audio Layer"]
    Events --> Lighting["Lighting Actors"]

    UI --> Request["Subsystem API calls"]
    Level --> Express["Expression only"]
    Audio --> Cues["Cue / layer updates"]
    Lighting --> Presets["Preset apply"]

    Level -.-> No1["No progression tag mutation"]
    Audio -.-> No2["No evidence registration by cue only"]
    UI -.-> No3["No direct GameState array edit"]
```

## Smoke-Test Loop

```mermaid
flowchart LR
    Start["Start route step"] --> Action["Perform player action"]
    Action --> Evidence["Register evidence / state"]
    Evidence --> Report["Submit report or state gate"]
    Report --> Check{"Pass criterion met?"}
    Check -- Yes --> Next["Next route step"]
    Check -- No --> Fix["Fix ticket group"]
    Fix --> Start
```

## Smoke-Test Criteria

```mermaid
flowchart TB
    S["Smoke Test Pass"] --> A["5 min role / board / tools understood"]
    S --> B["15-20 min normal vs anomaly understood"]
    S --> C["Office / hallway / unit front / basement connected"]
    S --> D["Loop works without sound"]
    S --> E["Sound + lighting raise tension"]
    S --> F["307 curiosity at demo end"]
```

## P0 Art / Implementation Split

```mermaid
flowchart TD
    P0["Vertical Slice P0"] --> Office["Office"]
    P0 --> Hall2["2F Hallway"]
    P0 --> Hall3["3F Hallway"]
    P0 --> Basement["Basement"]
    P0 --> Door307["307 Door Front"]
    P0 --> Connector["Stair / Elevator Connector"]

    Office --> UI["Board / Report / Tools"]
    Hall2 --> Interactions["203 / Intercom"]
    Hall3 --> Audio["Emergency light / TV hum"]
    Basement --> Lighting["Outage / breaker"]
    Door307 --> Hook["307 package tease"]
```

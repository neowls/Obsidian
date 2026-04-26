# NightCaretaker Sound Diagrams

## 목적

이 문서는 사운드 제작 명세를 빠르게 검토하기 위한 Mermaid companion 문서다. 구현 기준은 Master 문서와 `NightCaretaker_Sound_Detail.md`를 우선한다.

## Audio State Input Flow

```mermaid
flowchart TD
    A["Runtime State Events"] --> B["Audio Expression Layer"]
    B --> C["AMB Space Loops"]
    B --> D["SFX One-Shots"]
    B --> E["UI Work Sounds"]
    B --> F["MS Reactive Layers"]
    B --> G["STG Progress Stingers"]

    S1["ENCShiftPhase"] --> B
    S2["ENCComplaintRuntimeState"] --> B
    S3["PowerState"] --> B
    S4["TensionStage"] --> B
    S5["Room307Stage"] --> B
    S6["DomainTags"] --> B
    S7["Evidence.Audio"] --> B

    F --> P1["Electric Hum"]
    F --> P2["Life Noise Distance"]
    F --> P3["Static / Silence"]
    F --> P4["Low Frequency Pressure"]
```

## Complaint Audio Sequence

```mermaid
sequenceDiagram
    participant Player
    participant Board as Complaint Board UI
    participant Runtime as Complaint Runtime
    participant Audio as Audio Layer
    participant World as World Actors

    Player->>Board: Select complaint
    Board->>Runtime: AcceptComplaint
    Runtime-->>Audio: OnComplaintStateChanged Accepted
    Audio-->>Player: UI_Board_AcceptComplaint
    Runtime-->>World: Activate target context
    World-->>Audio: DomainTags available
    Player->>World: Investigate source
    Runtime-->>Audio: OnEvidenceDiscovered Evidence.Audio
    Audio-->>Player: SFX evidence confirmation
    Runtime-->>Board: AwaitingReport
    Board->>Runtime: SubmitReport
    Runtime-->>Audio: OnReportSubmitted
    Audio-->>Player: UI_Report_SubmitStamp + short static
    Runtime-->>Audio: OnWorldStateChanged
    Audio-->>Player: MS layer update
```

## PowerState Audio State

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> PartialOutage: lighting complaint / failure pressure
    PartialOutage --> FloorOutage: chapter gate / breaker fault
    FloorOutage --> EmergencyOnly: emergency lighting active
    EmergencyOnly --> BasementIndependent: basement power route
    BasementIndependent --> PartialOutage: breaker restored
    PartialOutage --> Normal: report resolved

    Normal: stable electric hum
    PartialOutage: fixture buzz and short dropouts
    FloorOutage: static and distant building sound
    EmergencyOnly: emergency hum and narrow band pressure
    BasementIndependent: pump / panel low frequency
```

## Room 307 Sound Exposure

```mermaid
stateDiagram-v2
    [*] --> Absent
    Absent --> NumberTrace: number appears
    NumberTrace --> RecordIntrusion: record mismatch
    RecordIntrusion --> ThirdFloorUnstable: third floor cues
    ThirdFloorUnstable --> DoorStay: complaint requires door check
    DoorStay --> Threshold: final approach
    Threshold --> Interior: enter / confirm

    Absent: no dedicated 307 sound
    NumberTrace: paper / electric micro cue
    RecordIntrusion: board timing offset
    ThirdFloorUnstable: corridor low-end and vague life noise
    DoorStay: door lock and inside low activity
    Threshold: static and reflection delay
    Interior: residual life trace and report silence
```

## TensionStage Layer Direction

```mermaid
flowchart LR
    T0["Stage0_Normal<br/>traceable sources"] --> T1["Stage1_Discomfort<br/>slight location drift"]
    T1 --> T2["Stage2_RecordConflict<br/>paper / intercom timing offset"]
    T2 --> T3["Stage3_SpaceBreak<br/>distance and reverb contamination"]
    T3 --> T4["Stage4_Room307Focus<br/>building-wide convergence"]

    T0 -.-> A0["Do not over-layer"]
    T4 -.-> A1["Do not reveal entity identity"]
```

## Blueprint Trigger Ownership

```mermaid
flowchart TD
    I["Interaction Actor"] --> O["SFX_ one-shot only"]
    U["UI Widget"] --> Q["UI_ request after runtime result"]
    R["Runtime Subsystem / State Component"] --> V["State events"]
    V --> A["Audio BP or Audio Component"]
    A --> AMB["AMB_ loop routing"]
    A --> MS["MS_ parameter update"]
    A --> STG["STG_ controlled stinger"]
    L["Level Sequence"] --> STG

    I -.-> MS
    U -.-> V
    A -.-> G["Gameplay state mutation"]
```

## P0 Sound Scope

```mermaid
flowchart TB
    P0["P0 Audio Scope"] --> Office["Office ambience + board/report UI"]
    P0 --> Hallway["Hallway ambience + power layers"]
    P0 --> Basement["Basement pump / panel layer"]
    P0 --> Complaint["Lighting / water / intercom / life noise / record SFX"]
    P0 --> Failure["Failure pressure cue set"]
    P0 --> Room307["Room307 Absent to Threshold exposure"]

    P0 -.-> Ex1["No full audio state machine"]
    P0 -.-> Ex2["No text parsing for cue selection"]
    P0 -.-> Ex3["No monster identity sound"]
```

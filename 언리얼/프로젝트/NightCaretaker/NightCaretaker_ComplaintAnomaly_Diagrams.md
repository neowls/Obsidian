# NightCaretaker Complaint/Anomaly Diagrams

## 목적

이 문서는 20개 민원과 이상 현상 흐름을 빠르게 검토하기 위한 Mermaid companion 문서다. 구현 기준은 Master 문서와 `NightCaretaker_ComplaintAnomaly_Detail.md`를 우선한다.

## Chapter Complaint Flow

```mermaid
flowchart TD
    PRO["Prologue<br/>OfficeLightBuzz -> 203WaterAtDoor"] --> CH1["Chapter 1<br/>Intercom -> Mailbox -> EmergencyLight -> Odor -> Stair"]
    CH1 --> CH2["Chapter 2<br/>TVHum -> Nameplate -> CCTV -> Elevator -> ReopenedLight"]
    CH2 --> CH3["Chapter 3<br/>BasementPump -> 306Door -> ExitDepth -> PanelMislabel"]
    CH3 --> CH4["Chapter 4<br/>307Package -> 307LifeNoise -> Record307 -> FinalCheck307"]
    CH4 --> END["Final Report / Ending"]

    PRO -.-> R1["Room307Stage: NumberTrace"]
    CH1 -.-> R2["Room307Stage: RecordIntrusion / ThirdFloorUnstable"]
    CH2 -.-> R3["TensionStage: RecordConflict"]
    CH3 -.-> R4["TensionStage: SpaceBreak"]
    CH4 -.-> R5["Room307Stage: DoorStay / Threshold / Interior"]
```

## One Complaint Production Sequence

```mermaid
sequenceDiagram
    participant Player
    participant UI as Board / Report UI
    participant Runtime as Complaint Runtime
    participant Level as Level Actors
    participant Audio as Audio Layer
    participant Records as Notebook / Records

    Player->>UI: Select complaint
    UI->>Runtime: AcceptComplaint
    Runtime-->>Audio: OnComplaintStateChanged Accepted
    Runtime-->>Level: Activate location context
    Player->>Level: Inspect scene beats
    Level-->>Runtime: Register evidence tag
    Runtime-->>Records: Add discovered evidence
    Runtime-->>Audio: OnEvidenceDiscovered
    Runtime-->>UI: AwaitingReport when evidence threshold met
    Player->>UI: Submit report result
    UI->>Runtime: SubmitReport
    Runtime-->>Level: Apply world / anomaly result
    Runtime-->>Audio: OnReportSubmitted / OnWorldStateChanged
```

## Evidence To Report Flow

```mermaid
flowchart LR
    A["Scene Beat"] --> B["Evidence Tag"]
    B --> C{"RequiredEvidenceTags met?"}
    C -- "No" --> D["Notebook updates only<br/>Report blocked"]
    C -- "Yes" --> E["ENCComplaintRuntimeState<br/>AwaitingReport"]
    E --> F["Report Form"]
    F --> G["Resolved"]
    F --> H["NoAnomaly"]
    F --> I["NeedsFollowUp"]
    G --> J["CompletionTags"]
    H --> K["Failure or uncertainty pressure"]
    I --> L["ConsequenceTags / next complaint"]
```

## Anomaly Link Model

```mermaid
flowchart TD
    CMP["Complaint Definition"] --> LA["LinkedAnomalies"]
    LA --> ANM["Anomaly Definition"]
    ANM --> ETG["EvidenceTagsGranted"]
    CMP --> RET["RequiredEvidenceTags"]
    ETG --> MATCH{"Overlaps required evidence?"}
    RET --> MATCH
    MATCH -- "Yes" --> VALID["Valid production link"]
    MATCH -- "No" --> FIX["Fix authoring contract"]

    CMP --> ART["Scene / Prop / Lighting"]
    CMP --> UI["Board / Report / Notebook"]
    CMP --> AUD["Sound cue / MetaSound layer"]
```

## Room 307 Escalation By Complaint

```mermaid
stateDiagram-v2
    [*] --> NumberTrace: CMP_PRO_OfficeLightBuzz
    NumberTrace --> RecordIntrusion: CMP_CH1_1F_MailboxMisdelivery
    RecordIntrusion --> ThirdFloorUnstable: CMP_CH1_3F_EmergencyLight
    ThirdFloorUnstable --> RecordConflict: CMP_CH2_ReopenedLightCase
    RecordConflict --> SpaceBreak: CMP_CH3_ExitSignDepth
    SpaceBreak --> DoorStay: CMP_CH4_307_PackageAtDoor
    DoorStay --> Threshold: CMP_CH4_307_LifeNoise / RecordResident307
    Threshold --> Interior: CMP_CH4_FinalCheck307

    NumberTrace: 숫자 흔적
    RecordIntrusion: 기록 침투
    ThirdFloorUnstable: 3층 불안
    RecordConflict: 기록 불신
    SpaceBreak: 공간 신뢰 붕괴
    DoorStay: 307호 문 앞 체류
    Threshold: 문턱
    Interior: 내부 확인
```

## Failure Pressure Loop

```mermaid
flowchart TD
    A["Wrong report / missed evidence"] --> B["OnFailurePressureApplied"]
    B --> C["TensionStage or PowerState pressure"]
    B --> D["RecordIntegrity pressure"]
    B --> E["Audio / ambience contamination"]
    C --> F["Next complaint feels less stable"]
    D --> F
    E --> F
    F --> G["Player re-checks board / space / records"]
    G --> H["Complaint loop continues"]

    B -.-> X["No full chapter restart"]
    B -.-> Y["No input sabotage"]
```

## P0 Authoring Validation

```mermaid
flowchart TB
    V["Complaint row ready?"] --> A["Has UI exposure"]
    V --> B["Has 3+ scene beats"]
    V --> C["Has RequiredEvidenceTags"]
    V --> D["Has LinkedAnomalies"]
    V --> E["Has sound cue intent"]
    V --> F["Has report result handling"]
    V --> G["Has failure pressure"]
    V --> H["Has validation note"]

    A --> READY["Ready for Data Asset / BP authoring"]
    B --> READY
    C --> READY
    D --> READY
    E --> READY
    F --> READY
    G --> READY
    H --> READY
```

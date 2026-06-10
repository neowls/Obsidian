---
aliases:
  - "NightCaretaker Level/Space Diagrams"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - archive
  - companion
type: project-document
project: NightCaretaker
category: archive-companion
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# NightCaretaker Level/Space Diagrams

> [!summary] 문서 목적
> 이 문서는 레벨/공간 제작 기준을 빠르게 검토하기 위한 Mermaid companion 문서다. 구현 기준은 Master 문서와 `NightCaretaker_LevelSpace_Detail.md`를 우선한다.

## 핵심 결론

- 이 문서는 보조 시각화 또는 세부 자료이며, 활성 기준은 루트 Master 문서를 우선한다.
- 다이어그램, 매트릭스, 와이어프레임은 현재 판단의 근거로 사용할 수 있지만 그대로 구현 기준이 되지는 않는다.
- 필요 시 본문의 항목을 Planning/Development/Art Master로 승격한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 보조 시각화/동반 자료 |
| 파일 경로 | `Archive/Companion/NightCaretaker_LevelSpace_Diagrams.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 목적 | 주요 섹션 |
| Building Space Flow | 주요 섹션 |
| Vertical Slice Route | 주요 섹션 |
| Access State Flow | 주요 섹션 |
| State Consumers Per Space | 주요 섹션 |
| Revisit Variation Model | 주요 섹션 |
| Room 307 Spatial Convergence | 주요 섹션 |
| P0 Blockout Scope | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 목적

이 문서는 레벨/공간 제작 기준을 빠르게 검토하기 위한 Mermaid companion 문서다. 구현 기준은 Master 문서와 `NightCaretaker_LevelSpace_Detail.md`를 우선한다.

## Building Space Flow

```mermaid
flowchart TD
    Office["관리실<br/>Board / Report / Tools"] --> Lobby["1층 로비 / 우편함"]
    Office --> Hall2["2층 복도<br/>203 / Intercom / 204 / 205"]
    Hall2 --> Stairs["계단실 / 엘리베이터"]
    Stairs --> Hall3["3층 복도<br/>302 / 306 / 307"]
    Stairs --> CCTV["4층 CCTV 구역"]
    Office --> Basement["지하 전기실<br/>Pump / Panel"]
    Hall3 --> Room307Door["307호 앞"]
    Room307Door --> Room307Interior["307호 내부"]

    Hall2 -.-> Office
    Hall3 -.-> Office
    Basement -.-> Office
```

## Vertical Slice Route

```mermaid
flowchart LR
    R1["1 Office Handoff"] --> R2["2 Office Light"]
    R2 --> R3["3 203 Water"]
    R3 --> R4["4 Intercom Static"]
    R4 --> R5["5 3F Emergency Light"]
    R5 --> R6["6 302 TV Hum"]
    R6 --> R7["7 Power Outage"]
    R7 --> R8["8 Basement Pump"]
    R8 --> R9["9 Basement Panel"]
    R9 --> R10["10 307 Package Tease"]

    R2 -.-> S1["PowerState baseline"]
    R5 -.-> S2["Room307Stage ThirdFloorUnstable"]
    R6 -.-> S3["TensionStage RecordConflict"]
    R8 -.-> S4["AccessState TemporaryUnlocked"]
    R10 -.-> S5["Room307Stage DoorStay"]
```

## Access State Flow

```mermaid
stateDiagram-v2
    [*] --> Locked
    Locked --> Restricted: chapter visible / no key
    Restricted --> TemporaryUnlocked: complaint accepted / required tool
    TemporaryUnlocked --> Unlocked: report completed / progression tag
    Unlocked --> Sealed: final lockout / ending route
    Sealed --> [*]

    Locked: no prompt or locked prompt
    Restricted: visible but not enterable
    TemporaryUnlocked: active complaint access
    Unlocked: normal revisit access
    Sealed: story-controlled closure
```

## State Consumers Per Space

```mermaid
flowchart TD
    State["Runtime State Events"] --> Office["Office props / board / records"]
    State --> Doors["Doors / elevator / basement gate"]
    State --> Lights["Lighting presets"]
    State --> Audio["Audio source placement"]
    State --> Room307["307 door / threshold / interior"]

    LID["LocationId"] --> Office
    Access["AccessState"] --> Doors
    Power["PowerState"] --> Lights
    Tension["TensionStage"] --> Audio
    R307["Room307Stage"] --> Room307
    Prog["Progression.*"] --> Doors
```

## Revisit Variation Model

```mermaid
flowchart LR
    First["First Visit<br/>stable landmark"] --> Return["Return Visit<br/>one changed element"]
    Return --> Pressure["Failure / tension pressure"]
    Pressure --> Recheck["Player re-checks board / space / records"]

    Return --> V1["Lighting tone"]
    Return --> V2["Door state"]
    Return --> V3["Sound position"]
    Return --> V4["Sign / label"]
    Return --> V5["Floor stain"]
```

## Room 307 Spatial Convergence

```mermaid
flowchart TD
    N1["NumberTrace<br/>office note / labels"] --> N2["RecordIntrusion<br/>mailbox / board / logs"]
    N2 --> N3["ThirdFloorUnstable<br/>3F emergency light"]
    N3 --> N4["DoorStay<br/>package / door gap"]
    N4 --> N5["Threshold<br/>lock / silence / reflection"]
    N5 --> N6["Interior<br/>living trace / records / final report"]

    N1 -.-> S1["No dedicated 307 room audio"]
    N4 -.-> S2["Door front becomes production focus"]
    N6 -.-> S3["Do not close interpretation"]
```

## P0 Blockout Scope

```mermaid
flowchart TB
    P0["P0 Vertical Slice Blockout"] --> Office["Office"]
    P0 --> Hall2["2F Hallway"]
    P0 --> Hall3["3F Hallway"]
    P0 --> Basement["Basement Electrical"]
    P0 --> Stairs["Stair / Elevator connector"]
    P0 --> Door307["307 Door Front"]

    Office --> C1["Board / Tools / Report"]
    Hall2 --> C2["203 / Intercom / evidence"]
    Hall3 --> C3["302 / emergency light / 307 path"]
    Basement --> C4["Pump / Panel / labels"]
    Door307 --> C5["Package / nameplate / door gap"]
```

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

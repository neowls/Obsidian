---
aliases:
  - "P0 Runtime Kickoff Detail"
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

# P0 Runtime Kickoff Detail

> [!summary] 문서 목적
> `P0RuntimeKickoff`는 vertical slice companion 문서의 티켓을 구현 착수 가능한 wave로 재정렬한다. 이 문서는 구현 자체가 아니라 첫 runtime 작업자가 따라야 할 실행 순서, 선행 조건, 입력 문서, 완료 기준, 검증 방법을 고정한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/P0RuntimeKickoff_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Source Documents | 주요 섹션 |
| Runtime Contract | 주요 섹션 |
| Ticket Queue | 주요 섹션 |
| Development Work Cards | 주요 섹션 |
| Card Acceptance Checklist | 세부 기준 |
| Wave 0: Repo, Docs, Contracts | 주요 섹션 |
| Wave 1: Route And Base Interaction | 주요 섹션 |
| Wave 2: Complaint Runtime, Evidence, Report Loop | 주요 섹션 |
| Wave 3: HUD, Board, Report, Notebook UI | 주요 섹션 |
| Wave 4: Audio, Lighting, Debug Smoke-Test | 주요 섹션 |
| First Smoke-Test Loop | 주요 섹션 |
| Explicit Non-Goals | 주요 섹션 |
| Validation Commands | 주요 섹션 |
| 추가 섹션 1 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

`P0RuntimeKickoff`는 vertical slice companion 문서의 티켓을 구현 착수 가능한 wave로 재정렬한다. 이 문서는 구현 자체가 아니라 첫 runtime 작업자가 따라야 할 실행 순서, 선행 조건, 입력 문서, 완료 기준, 검증 방법을 고정한다.

작업 원칙은 다음과 같다.

- 기존 `VS-*` 티켓을 그대로 사용한다.
- 새 runtime state나 새 용어 체계를 만들지 않는다.
- P0는 route, interaction, complaint runtime, UI, audio/lighting/debug smoke-test 순서로 좁게 검증한다.
- 코드, Blueprint asset, map, Data Asset은 이 작업에서 수정하지 않는다.

## Source Documents

| Document | Usage |
| --- | --- |
| `Document/NightCaretaker_Planning_Master.md` | 상태 축, 10단계 route, smoke-test 합격 기준 확인 |
| `Document/NightCaretaker_Development_Master.md` | `VS-*` 구현 티켓, runtime owner/event boundary 확인 |
| `Document/NightCaretaker_Art_Master.md` | P0 공간, 조명, 사운드 anchor 확인 |
| `Document/NightCaretaker_LevelSpace_Detail.md` | `LocationId`, 접근 gate, 공간별 역할 확인 |
| `Document/NightCaretaker_ComplaintAnomaly_Detail.md` | 민원 row, evidence, report result 의도 확인 |
| `Document/NightCaretaker_UIUX_Detail.md` | Board, Report, Notebook, HUD prompt P0 연결 기준 확인 |
| `Document/NightCaretaker_Sound_Detail.md` | `Evidence.Audio`, ambience, state layer 기준 확인 |
| `Document/NightCaretaker_VerticalSlice_Detail.md` | 10단계 route, 티켓 의존성, smoke-test 기준의 직접 입력 |
| `Document/Source/P0DevelopmentWorkCards_Overview.md` | 기존 `CARD-P0-*`를 실제 `DEV-P0-*` 구현 카드로 세분화한 기준 확인 |
| `Document/Source/P0DevelopmentWorkCards_Detail.md` | 카드별 owner/API, 산출물, 완료 기준, 검증 절차 확인 |

## Runtime Contract

P0 구현자는 다음 상태 축을 기존 계약대로만 사용한다.

| Axis | P0 Usage | Owner Boundary |
| --- | --- | --- |
| `ENCShiftPhase` | `BoardReview`, `Investigating`, `Reporting` 흐름 표시 | UI, audio, save는 phase를 소비하고 재계산하지 않는다 |
| `ENCComplaintRuntimeState` | `Accepted -> Investigating -> AwaitingReport -> Closed` 민원 루프 | Board/Report UI는 runtime subsystem 상태를 따른다 |
| `PowerState` | 관리실/복도/지하 조명 preset, 정전 이벤트 | Lighting/Audio는 상태를 별도 저장하지 않는다 |
| `TensionStage` | 기록 충돌과 공간 압박의 단계적 반응 | UI/audio/level actor는 같은 stage를 소비한다 |
| `Room307Stage` | 3층 불안정, 307호 앞 맛보기, 문 앞 체류 | 초반 P0에서는 307호 내부를 열지 않는다 |
| `RecordIntegrity` | 보드/명부/보고 기록 충돌 표현 | P0에서는 기존 기록 축을 참조하고 별도 corruption state를 만들지 않는다 |

지원 식별자와 태그는 `LocationId`, `AccessState`, `Progression.*`, `Evidence.Audio`, `Evidence.Document`, `Evidence.Records`, `Evidence.Visual`, `Evidence.Environmental`, `DomainTags`를 기존 문서 의미 그대로 사용한다.

## Ticket Queue

| Queue | Ticket | Dependency | Kickoff Reason |
| --- | --- | --- | --- |
| 1 | `VS-BLOCKOUT-01` | 없음 | 모든 P0 검증은 route가 있어야 재현 가능하다 |
| 2 | `VS-BLOCKOUT-02` | `VS-BLOCKOUT-01` | complaint row와 UI가 `LocationId`/gate에 기대야 한다 |
| 3 | `VS-INTERACTION-01` | `VS-BLOCKOUT-01` | 보드, 도구, 보고 위치가 첫 5분 이해도를 결정한다 |
| 4 | `VS-COMPLAINT-01` | `VS-BLOCKOUT-02` | P0 민원 row와 progression chain이 vertical slice의 중심 루프다 |
| 5 | `VS-UI-01` | `VS-COMPLAINT-01` | Board/Report/Notebook은 실제 complaint state를 표시해야 한다 |
| 6 | `VS-AUDIO-01` | `VS-BLOCKOUT-01` | 공간 ambience는 route 검증과 병렬로 붙일 수 있다 |
| 7 | `VS-LIGHTING-01` | `VS-BLOCKOUT-01` | `PowerState` preset은 route readability를 해치지 않아야 한다 |
| 8 | `VS-QADEBUG-01` | `VS-COMPLAINT-01` | 10단계 시작 상태 재현은 runtime loop가 생긴 뒤 고정한다 |

## Development Work Cards

| Card | Status | Ticket | Why Now | Done |
| --- | --- | --- | --- | --- |
| `CARD-P0-001 Route Skeleton` | Ready | `VS-BLOCKOUT-01` | 모든 runtime/UI/audio 검증은 이동 가능한 route가 먼저 있어야 한다 | `LOC_OFFICE_MAIN`, 2층 복도, 3층 복도, 지하 전기실, 307호 앞이 플레이어 이동으로 연결된다 |
| `CARD-P0-002 Location Gates` | Blocked by `CARD-P0-001` | `VS-BLOCKOUT-02` | 민원, UI, debug가 같은 위치 기준을 써야 임시 분기가 줄어든다 | 주요 route 지점에 `LocationId` marker와 접근 gate가 배치되고 step별 판정이 가능하다 |
| `CARD-P0-003 Office Interactions` | Blocked by `CARD-P0-001` | `VS-INTERACTION-01` | 첫 5분 이해도는 관리실 보드/도구/보고 위치가 결정한다 | 민원 보드, 공구함, 손전등, 보고 위치 interaction이 prompt와 함께 최소 동작한다 |
| `CARD-P0-004 Complaint Seed Loop` | Blocked by `CARD-P0-002` | `VS-COMPLAINT-01` | 수직 슬라이스의 중심은 민원 상태 루프다 | 최소 1개 민원이 `Accepted -> Investigating -> AwaitingReport -> Closed`를 통과하고 10단계 row 확장 기준이 정해진다 |
| `CARD-P0-005 Board Report UI` | Blocked by `CARD-P0-004` | `VS-UI-01` | UI는 mock data가 아니라 실제 complaint runtime state를 보여줘야 한다 | Board, Report, Notebook이 현재 민원, 단서, 보고 가능 상태를 표시한다 |
| `CARD-P0-006 Route Prompts` | Blocked by `CARD-P0-005` | `VS-UI-02` | route별 다음 행동을 알려야 smoke-test가 막히지 않는다 | HUD prompt와 document viewer text가 각 route step의 interaction과 연결된다 |
| `CARD-P0-007 Baseline Mood` | Blocked by `CARD-P0-001` | `VS-AUDIO-01`, `VS-LIGHTING-01` | 사운드/조명은 route readability를 해치지 않는 선에서 초기에 검증해야 한다 | 관리실/복도/지하 ambience와 `PowerState` lighting preset이 적용되고 길찾기가 유지된다 |
| `CARD-P0-008 Debug Smoke Loop` | Blocked by `CARD-P0-004` | `VS-QADEBUG-01` | 각 step을 독립 재현해야 이후 UI/audio/lighting 회귀를 빠르게 잡는다 | 10단계 시작 상태 재현 command 또는 체크리스트가 있고 pass/fail 기준이 기록된다 |

`CARD-P0-*`는 PM/티켓 레벨 이름이고, 실제 개발 착수는 `P0DevelopmentWorkCards`의 `DEV-P0-*` 카드를 기준으로 진행한다.

### Card Acceptance Checklist

| Card | Acceptance Check |
| --- | --- |
| `CARD-P0-001` | 플레이어가 관리실에서 307호 앞까지 막힘 없이 이동할 수 있다 |
| `CARD-P0-002` | 현재 위치/route step 판정이 문서의 `LocationId`와 일치한다 |
| `CARD-P0-003` | 보드, 도구, 보고 위치를 5분 안에 이해할 수 있다 |
| `CARD-P0-004` | 사운드 없이도 보드 -> 현장 -> 단서 -> 보고 루프가 성립한다 |
| `CARD-P0-005` | UI가 다음 행동은 보여주지만 공포 원인이나 정답을 설명하지 않는다 |
| `CARD-P0-006` | prompt가 대상명과 행동을 한 줄로 표시하고 닫기/복귀가 막히지 않는다 |
| `CARD-P0-007` | 조명과 ambience를 켜도 길찾기가 무너지지 않는다 |
| `CARD-P0-008` | smoke-test 실패 시 어느 route step에서 깨졌는지 재현 가능하다 |

## Wave 0: Repo, Docs, Contracts

| Item | Details |
| --- | --- |
| Purpose | 구현 전에 대상 map, 현재 C++/Blueprint runtime owner, 기존 widget/complaint subsystem 상태를 확인한다. |
| Input Documents | `Planning_Master`, `Development_Master`, `VerticalSlice_Detail`, `LevelSpace_Detail` |
| Prerequisites | 코드/asset 변경 전 현재 작업트리와 기존 구현 범위를 확인한다. |
| Tickets Covered | 티켓 구현 전 준비 작업이며 새 `VS-*` 티켓을 만들지 않는다. |
| Completion Criteria | P0 대상 map, route 기준 공간, interaction owner, complaint runtime owner, UI owner, lighting/audio owner가 확인된다. |
| Validation | `rg`로 `UNCComplaintRuntimeSubsystem`, `UNCUISubsystem`, `WBP_NCPlayerHUD`, `LocationId`, `ENCShiftPhase`, `ENCComplaintRuntimeState` 존재와 사용처를 확인한다. |

Wave 0 체크리스트:

- 현재 프로젝트가 UE 5.7.4 기준인지 확인한다.
- P0 blockout을 새 map으로 만들지 기존 map에서 진행할지 결정한다.
- `Document/NightCaretaker_VerticalSlice_Detail.md`의 10단계 route를 구현 순서 기준으로 다시 읽는다.
- `Document/NightCaretaker_Development_Master.md`의 `VS-*` ticket dependency를 구현 task board에 그대로 옮긴다.
- 새 상태 축, 새 enum, 새 manager class가 필요하다는 판단이 나오면 먼저 기존 계약으로 해결 가능한지 검토한다.

## Wave 1: Route And Base Interaction

| Item | Details |
| --- | --- |
| Purpose | 관리실에서 시작해 2층, 3층, 지하 전기실, 307호 앞까지 이어지는 P0 route와 첫 상호작용 기준점을 만든다. |
| Input Documents | `VerticalSlice_Detail`, `LevelSpace_Detail`, `UIUX_Detail` |
| Prerequisites | Wave 0 owner 확인, P0 대상 map 결정 |
| Primary Tickets | `VS-BLOCKOUT-01`, `VS-BLOCKOUT-02`, `VS-INTERACTION-01` |
| Follow-up Tickets | `VS-INTERACTION-02` |
| Completion Criteria | route가 끊기지 않고, `LocationId` marker/gate가 존재하며, 민원 보드/공구함/손전등/보고 위치 interaction이 최소 동작한다. |
| Validation | 플레이어가 5분 안에 보드, 도구, 보고 위치를 이해한다. route step별 위치 재현이 가능하다. |

Implementation handoff:

- `VS-BLOCKOUT-01`부터 시작한다.
- `VS-BLOCKOUT-02`는 route가 이어진 뒤 `LocationId` marker와 접근 gate만 붙인다.
- `VS-INTERACTION-01`은 기본 prompt와 action만 연결하고, 형광등/인터폰/배전반/택배 같은 세부 조사물은 `VS-INTERACTION-02`로 미룬다.
- 이 wave에서 `PowerState`, `TensionStage`, `Room307Stage`를 새 actor local 변수로 복제하지 않는다.

## Wave 2: Complaint Runtime, Evidence, Report Loop

| Item | Details |
| --- | --- |
| Purpose | 수직 슬라이스 10단계 민원 row와 evidence/report loop를 runtime에서 검증한다. |
| Input Documents | `VerticalSlice_Detail`, `ComplaintAnomaly_Detail`, `Planning_Master`, `Development_Master` |
| Prerequisites | `VS-BLOCKOUT-02` 완료, route step별 `LocationId`/gate 확인 |
| Primary Tickets | `VS-COMPLAINT-01`, `VS-COMPLAINT-02` |
| Completion Criteria | 최소 P0 row가 `Accepted -> Investigating -> AwaitingReport -> Closed`로 흐르고, evidence threshold와 report result가 progression chain에 반영된다. |
| Validation | 사운드 없이도 보드 -> 현장 -> 단서 -> 보고 루프가 성립한다. 정상 민원과 이상 민원의 차이가 15~20분 안에 드러난다. |

P0 row priority:

| Route Step | Complaint/Beat | Required Hook |
| --- | --- | --- |
| 1 | 관리실 인수인계 | `ENCShiftPhase::BoardReview`, board/report 위치 |
| 2 | `CMP_PRO_OfficeLightBuzz` | `PowerState=Normal`, 보드 활성화, `3F 07` 흔적 |
| 3 | `CMP_PRO_203_WaterAtDoor` | `LOC_2F_203_DOOR`, `Evidence.Visual` 또는 `Evidence.Environmental` |
| 4 | `CMP_CH1_2F_IntercomStatic` | `LOC_2F_INTERCOM`, `Evidence.Audio` |
| 5 | `CMP_CH1_3F_EmergencyLight` | `LOC_3F_EMERGENCY_LIGHT`, `Room307Stage=ThirdFloorUnstable` |
| 6 | `CMP_CH2_302_TVHum` | `LOC_3F_302_DOOR`, `TensionStage=Stage2_RecordConflict` |
| 7 | 정전 이벤트 | `PowerState=FloorOutage` 또는 `EmergencyOnly` |
| 8 | `CMP_CH3_BasementPumpAlarm` | `LOC_BSMT_PUMP`, `AccessState=TemporaryUnlocked` |
| 9 | `CMP_CH3_BasementPanelMislabel` | `LOC_BSMT_PANEL`, `Progression.Story.BasementPowerLinked` |
| 10 | `CMP_CH4_307_PackageAtDoor` 맛보기 | `LOC_3F_307_DOOR`, `Room307Stage=DoorStay` |

Implementation handoff:

- `VS-COMPLAINT-01`은 10단계 row와 progression chain 존재 검증까지를 우선한다.
- `VS-COMPLAINT-02`는 evidence threshold와 report result 처리의 실제 판정 안정화에 집중한다.
- report result가 상태를 바꿔야 할 때는 기존 `ENCComplaintRuntimeState`, `PowerState`, `TensionStage`, `Room307Stage`, `RecordIntegrity`, `Progression.*`만 사용한다.

## Wave 3: HUD, Board, Report, Notebook UI

| Item | Details |
| --- | --- |
| Purpose | 실제 complaint runtime state를 Board, Report, Notebook, HUD prompt에 표시한다. |
| Input Documents | `UIUX_Detail`, `VerticalSlice_Detail`, `Development_Master` |
| Prerequisites | `VS-COMPLAINT-01` 완료, 최소 P0 row의 state transition 확인 |
| Primary Tickets | `VS-UI-01`, `VS-UI-02` |
| Completion Criteria | Board에서 현재 민원과 보고 가능 상태를 확인하고, Report에서 결과를 제출하며, Notebook에서 확보 단서를 확인한다. |
| Validation | UI가 다음 행동은 보여주지만 공포 원인이나 정답을 직접 설명하지 않는다. |

Implementation handoff:

- `VS-UI-01`은 Board, Report, Notebook P0 화면만 연결한다.
- `VS-UI-02`는 route별 HUD prompt와 document viewer text를 붙인다.
- UI는 `ENCComplaintRuntimeState`를 직접 계산하지 않고 complaint runtime owner의 상태를 표시한다.
- `RecordIntegrity` 표현은 기존 문서 계약에 맞춰 보드/명부/보고 기록의 충돌로 제한하고, P0에서 입력 방해형 UI 오염은 만들지 않는다.

## Wave 4: Audio, Lighting, Debug Smoke-Test

| Item | Details |
| --- | --- |
| Purpose | route readability를 유지하면서 ambience, `PowerState` lighting preset, debug 재현 루프를 붙인다. |
| Input Documents | `Sound_Detail`, `Art_Master`, `VerticalSlice_Detail`, `Development_Master` |
| Prerequisites | `VS-BLOCKOUT-01` 완료, `VS-COMPLAINT-01` 완료 후 debug 시작 |
| Primary Tickets | `VS-AUDIO-01`, `VS-LIGHTING-01`, `VS-QADEBUG-01` |
| Follow-up Tickets | `VS-AUDIO-02`, `VS-LIGHTING-02`, `VS-QADEBUG-02` |
| Completion Criteria | 관리실/복도/지하 ambience와 기본 lighting preset이 route를 방해하지 않고, 10단계 시작 상태를 독립 재현할 수 있다. |
| Validation | 사운드와 조명을 켰을 때 긴장 상승이 분명하며, 정전/비상등 상태에서도 길찾기가 유지된다. |

Implementation handoff:

- `VS-AUDIO-01`은 공간 기본 layer부터 연결한다.
- `VS-AUDIO-02`는 인터폰, TV hum, 펌프, 307 문틈 cue와 `Evidence.Audio` 연결로 좁힌다.
- `VS-LIGHTING-01`은 관리실/복도/지하 `PowerState` preset부터 붙인다.
- `VS-LIGHTING-02`는 정전 이벤트와 비상등 route 검증으로 분리한다.
- `VS-QADEBUG-01`은 10단계 시작 상태 재현 command/checklist를 만들고, `VS-QADEBUG-02`에서 pass/fail 기록표를 고정한다.

## First Smoke-Test Loop

첫 smoke-test는 모든 polish가 아니라 다음 최소 루프 통과만 확인한다.

| Check | Pass Criteria |
| --- | --- |
| Route | 관리실, 2층 복도, 3층 복도, 지하 전기실, 307호 앞이 기능적으로 연결된다 |
| Onboarding | 5분 안에 보드, 도구, 보고 위치를 이해한다 |
| Complaint Loop | 보드 -> 현장 -> 단서 -> 보고가 사운드 없이도 성립한다 |
| State Feedback | `ENCComplaintRuntimeState`와 `ENCShiftPhase` 변화가 UI/interaction에 반영된다 |
| World Feedback | `PowerState`, `TensionStage`, `Room307Stage`, `RecordIntegrity`가 각자 기존 책임 범위에서만 표현된다 |
| Readability | 정전/비상등 상태에서도 길찾기가 무너지지 않는다 |
| 307 Memory | 307호를 열지 않아도 다음 목표로 기억된다 |

## Explicit Non-Goals

- 이번 작업에서 C++ class, Blueprint graph, map, Data Asset, MetaSound graph를 수정하지 않는다.
- 새 runtime state, 새 enum, 새 global manager, 새 ticket namespace를 만들지 않는다.
- `Document/README.md`에는 이 작업 문서를 추가하지 않는다.
- vertical slice route를 늘려 플레이타임을 확보하지 않는다.
- 307호 내부 구현은 P0 맛보기 범위에 포함하지 않는다.

## Validation Commands

문서 작성 후 다음 명령으로 정적 검증한다.

```powershell
rg --line-number "P0RuntimeKickoff" Document/Source
rg --line-number "P0DevelopmentWorkCards|DEV-P0-010" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md Document/Source/P0DevelopmentWorkCards_Overview.md Document/Source/P0DevelopmentWorkCards_Detail.md
rg --line-number "VS-BLOCKOUT-01|VS-INTERACTION-01|VS-COMPLAINT-01|VS-UI-01" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md
rg --line-number "ENCShiftPhase|ENCComplaintRuntimeState|PowerState|TensionStage|Room307Stage" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md
rg --line-number "[ \t]+$" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md Document/Source/P0DevelopmentWorkCards_Overview.md Document/Source/P0DevelopmentWorkCards_Detail.md
git diff --check
```

`rg --line-number "[ \t]+$"`는 match가 없어야 한다. `rg` exit code `1`은 이 경우 trailing whitespace 없음으로 해석한다.

## Update Log

- 2026-04-26: P0 runtime kickoff detail created. Existing vertical slice tickets were reordered into Wave 0 through Wave 4 with prerequisites, completion criteria, and validation gates.
- 2026-04-26: Added development work cards and acceptance checks for the current P0 implementation stage.
- 2026-05-25: Linked `P0DevelopmentWorkCards` as the detailed `DEV-P0-*` implementation card breakdown for each existing P0 kickoff card.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

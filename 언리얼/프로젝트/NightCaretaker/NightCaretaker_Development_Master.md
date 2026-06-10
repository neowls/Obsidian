---
aliases:
  - "야간 관리인: 307호의 민원 - 개발 마스터"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - development
  - active-doc
type: project-document
project: NightCaretaker
category: active-development
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# 야간 관리인: 307호의 민원 - 개발 마스터

> [!summary] 문서 목적
> 이 문서는 구현자가 바로 다음 작업을 결정하기 위한 개발 기준서다.

## 핵심 결론

- 구현 판단은 P0 수직 슬라이스와 현재 C++/Blueprint 소유권을 기준으로 한다.
- 새 상태 축을 만들기 전에 기존 Shift, Complaint Runtime, GameplayTag 계약으로 해결 가능한지 확인한다.
- 각 기능은 완료 기준과 smoke-test 경로를 함께 가져야 한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 활성 개발 기준서 |
| 파일 경로 | `NightCaretaker_Development_Master.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 문서 정보 | 주요 섹션 |
| 1. Development Target | 주요 섹션 |
| P0 목표 | 세부 기준 |
| 개발 원칙 | 세부 기준 |
| 2. Current Implementation Snapshot | 주요 섹션 |
| C++ 골격 | 세부 기준 |
| 현재 자산 | 세부 기준 |
| 3. State And Data Contract | 주요 섹션 |
| 현재 코드 기준 진행 상태 | 세부 기준 |
| 민원 런타임 상태 | 세부 기준 |
| P0 GameplayTags | 세부 기준 |
| 4. P0 Feature Backlog | 주요 섹션 |
| DEV-P0-01 Shift Bootstrap | 세부 기준 |
| DEV-P0-02 Complaint Data Normalization | 세부 기준 |
| 추가 섹션 15 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 문서 역할 | 활성 개발 기준서 |
| 상태 | Operational Draft |
| 갱신일 | 2026-05-26 |
| 엔진/플랫폼 기준 | Unreal Engine 5.7.4, Win64 우선 |
| 기획 기준 | `Document/NightCaretaker_Planning_Master.md` |
| 이전 장문 백업 | `Document/Archive/Development/NightCaretaker_Development_Master_PreOperationalRefresh_20260526.md` |
| 원본 상세 보관 | `Document/Archive/Development` |

이 문서는 구현자가 바로 다음 작업을 결정하기 위한 개발 기준서다.
긴 설명보다 현재 구현 상태, 다음 기능, 구현 순서, 완료 기준을 우선한다.

## 1. Development Target

### P0 목표

P0 개발 목표는 `15~20분 수직 슬라이스`를 실제 플레이 가능한 상태로 만드는 것이다.
플레이어는 관리실에서 민원을 접수하고, 도구를 챙기고, 현장으로 이동해 단서를 확인하고, 조치 후 관리실에 보고해야 한다.

| 항목 | P0 결정 |
| --- | --- |
| 핵심 루프 | 접수 -> 도구 선택 -> 현장 이동 -> 단서 확인 -> 정상/이상 판정 -> 조치 -> 보고 |
| P0 민원 | `CMP_PRO_OfficeLightBuzz`, `CMP_CH1_203_WaterAtDoor`, `CMP_CH2_302_TVHum` |
| P0 공간 | 관리실, 로비/계단 연결, 2층 일부, 3층 일부, 307 문 앞 |
| P0 시스템 | Shift 상태, 민원 런타임, 상호작용, 증거 태그, 보고 UI, 307 Stage, 최소 저장/디버그 |
| 제외 | 전투, NPC 대화 트리, 복잡 퍼즐, 랜덤 이벤트, 본편 전체 세이브 구조 |

### 개발 원칙

- Planning Master의 플레이어 행동과 검증 기준을 우선한다.
- C++는 상태, 데이터, 런타임 규칙을 담당하고 Blueprint는 배치, 연출, UI 조립을 담당한다.
- 민원/이상 현상은 데이터 기반으로 작성하고 레벨 하드코딩을 피한다.
- UI, 사운드, 레벨은 `ShiftState`, `ComplaintRuntime`, `GameplayTag`를 통해 느슨하게 연결한다.
- 불명확한 소유권에는 `IsValid` 남발보다 명확한 생성/보유 구조와 fail-fast 검증을 둔다.
- Tick은 플레이어 카메라/물리 상호작용처럼 필요한 시스템에 한정하고, 민원 상태 감시는 이벤트 기반으로 처리한다.

## 2. Current Implementation Snapshot

### C++ 골격

| 영역 | 현재 타입 | 현재 역할 | 다음 연결 |
| --- | --- | --- | --- |
| Player | `ANCPlayerCharacter`, `UNCPlayerCharacterMovementComponent` | 이동, 스프린트, 입력 골격 | 민원 상호작용 프롬프트, 도구 상태, 조사 입력 연결 |
| Camera | `UNCRealityCameraComponent` | 1인칭 procedural 카메라, precision interaction damping | 조사/보고/문 조작 시 카메라 강도 조절 |
| Physics Interaction | `UNCPropInteractorComponent`, `UNCPhysicsCarryTargetComponent` | 물리 프랍 잡기/놓기 | 도구/단서 프랍과 구분되는 상호작용 레이어 필요 |
| Door | `ANCDoorActor` | 물리 문, 래치/잠금/그랩 | 민원/AccessState와 잠금 상태 연결 |
| Shift | `UNCShiftStateComponent` | ChapterId, ShiftPhase, FocusedComplaintId, ProgressionTags | Planning의 큰 진행 단계를 ChapterId/ProgressionTag로 표현 |
| Complaint Runtime | `UNCComplaintRuntimeComponent`, `UNCComplaintRuntimeSubsystem` | 민원 등록, 접수, 조사, 보고, 종료, 증거 태그 | UI/레벨 상호작용/보고 흐름 연결 |
| Data | `UNCComplaintDefinition`, `UNCAnomalyDefinition`, `UNCAchievementDefinition`, `FNCChapterComplaintRow` | DataAsset/DataTable 기반 저작 | P0 민원 3개 정규화 |
| UI | `UNCUISubsystem`, `UNCPlayerHUDWidget` | HUD 표시와 간단 상태 전달 | 민원 보드, 상호작용 프롬프트, 보고 UI 추가 |
| Debug | `UNCDebugCheatManager` | 개발용 상태 조작 | P0 smoke-test 명령 정리 |

### 현재 자산

| 영역 | 현재 위치 |
| --- | --- |
| 레벨 | `Content/NightCaretaker/Level/DevLevel.umap`, `Level.umap`, `Prop_Pallet.umap` |
| 캐릭터 | `Content/NightCaretaker/Character/BP_NCCharacter.uasset` |
| 데이터 | `Content/NightCaretaker/Data/Complaint/DA_Complaint.uasset`, `Data/Anomaly/DA_Anomaly.uasset`, `Data/DT_ChapterComplaint.uasset` |
| 입력 | `Content/NightCaretaker/Input/Actions`, `IMC_Default`, `IMC_MouseLook` |
| 프랍/문 | `Content/NightCaretaker/Props/BP_NCDoor.uasset`, `BP_PhysicalPropBase.uasset`, `BP_PhysicalPropCube.uasset` |
| UI | `Content/NightCaretaker/Widget/WBP_NCPlayerHUD.uasset` |

## 3. State And Data Contract

### 현재 코드 기준 진행 상태

현재 `ENCShiftPhase`는 큰 챕터 enum이 아니라 루프 상태 enum이다.
Planning Master의 `Prologue`, `NormalDuty`, `UncertainDuty`, `Room307` 같은 큰 단계는 `CurrentChapterId`와 `ProgressionTags`로 표현한다.

| Planning 개념 | 현재 구현 표현 |
| --- | --- |
| Prologue | `CurrentChapterId = CH_Prologue`, `Progression.Chapter.Prologue` |
| NormalDuty | `CurrentChapterId = CH_01`, `Progression.Chapter.One` |
| UncertainDuty | `CurrentChapterId = CH_02`, `Progression.Chapter.Two` |
| InfrastructureFailure | `CurrentChapterId = CH_03`, `Progression.Chapter.Three`, `Progression.Area.BasementUnlocked` |
| Room307 | `CurrentChapterId = CH_04`, `Progression.Chapter.Four`, `Progression.Story.Room307*` |
| Board/Investigate/Report | `ENCShiftPhase::BoardReview`, `Investigating`, `Reporting` |

P0에서는 새 enum을 먼저 늘리지 않는다.
기존 `ShiftPhase + ChapterId + ProgressionTags`로 충분한지 검증한 뒤 확장한다.

### 민원 런타임 상태

| 상태 | 사용 시점 | 다음 상태 |
| --- | --- | --- |
| `Available` | 민원 보드에 노출 가능 | `Accepted` |
| `Accepted` | 플레이어가 민원을 선택함 | `Investigating` |
| `Investigating` | 현장 조사 중 | `AwaitingReport` |
| `AwaitingReport` | 보고 가능 | `Closed` |
| `Closed` | 보고 후 완료 | 후속 progression tag 부여 |

### P0 GameplayTags

| 축 | 사용할 태그 |
| --- | --- |
| 도메인 | `Complaint.Domain.Lighting`, `Water`, `TVNoise`, `Record` |
| 도구 | `Complaint.RequiredTool.Flashlight`, `Screwdriver`, `Notebook` |
| 증거 | `Evidence.Visual`, `Evidence.Audio`, `Evidence.Document`, `Evidence.Environmental`, `Evidence.Records` |
| 진행 | `Progression.Chapter.Prologue`, `Progression.Chapter.One`, `Progression.Chapter.Two` |
| 307 | `Progression.Story.Room307Clue`, `Room307DoorReached`, `Room307LifeNoise`, `Room307RecordConflict` |

## 4. P0 Feature Backlog

### DEV-P0-01 Shift Bootstrap

| 항목 | 내용 |
| --- | --- |
| 목적 | PIE 시작 시 현재 챕터, 루프 단계, 초기 민원 상태를 안정적으로 만든다. |
| 작업 | `BP_NCGameMode`/`BP_NCGameState`에서 `UNCShiftStateComponent`, `UNCComplaintRuntimeComponent` 존재 확인. `CurrentChapterId`, `ShiftPhase`, 초기 progression tag 설정. |
| 구현 단계 | 1. DevLevel 시작 시 GameState 컴포넌트 검증. 2. `SetCurrentChapter(CH_Prologue)` 호출. 3. `SetShiftPhase(BoardReview)` 호출. 4. P0 민원 등록. |
| 완료 기준 | 디버그 출력으로 Chapter, Phase, FocusedComplaintId, 등록 민원 3개를 확인할 수 있다. |

### DEV-P0-02 Complaint Data Normalization

| 항목 | 내용 |
| --- | --- |
| 목적 | Planning Master의 P0 민원 3개를 현재 DataAsset/DataTable 구조에 맞춰 실제 자산으로 만든다. |
| 작업 | `UNCComplaintDefinition`, `UNCAnomalyDefinition`, `DT_ChapterComplaint`를 P0 필드 기준으로 채운다. |
| 구현 단계 | 1. P0 민원 3개 DataAsset 생성/정리. 2. RequiredEvidenceTags와 AllowedReportResults 설정. 3. Chapter DataTable에 순서 등록. 4. debug command로 로드 확인. |
| 완료 기준 | 런타임에서 민원 3개가 `Available` 또는 조건부 locked 상태로 조회된다. |

### DEV-P0-03 Complaint Board UI

| 항목 | 내용 |
| --- | --- |
| 목적 | 플레이어가 관리실에서 현재 민원을 접수할 수 있게 한다. |
| 작업 | `UNCUISubsystem`을 통해 보드 위젯을 열고, `UNCComplaintRuntimeSubsystem::AcceptComplaint`를 호출한다. |
| 구현 단계 | 1. 임시 `WBP_ComplaintBoard` 생성. 2. Available 민원 목록 바인딩. 3. 선택 시 FocusedComplaintId 설정. 4. UI 닫고 ShiftPhase를 `Investigating`으로 전환. |
| 완료 기준 | 첫 민원을 UI에서 선택하면 HUD 목표와 FocusedComplaintId가 갱신된다. |

### DEV-P0-04 Interaction Prompt And Evidence Actors

| 항목 | 내용 |
| --- | --- |
| 목적 | 현장 단서 확인을 데이터와 연결한다. |
| 작업 | 라인트레이스 기반 상호작용 대상 인터페이스 또는 컴포넌트를 추가하고, 상호작용 시 `AddEvidenceTag`를 호출한다. |
| 구현 단계 | 1. `BPI` 또는 C++ 인터페이스 결정. 2. EvidenceTag, ComplaintId, prompt text 필드 정의. 3. HUD reticle focus 연결. 4. 단서 2~3개 배치. |
| 완료 기준 | 203호/302호 현장에서 증거 태그가 민원 런타임 데이터에 누적된다. |

### DEV-P0-05 Tool Selection

| 항목 | 내용 |
| --- | --- |
| 목적 | 도구 선택이 동선과 민원 해결 조건에 영향을 주게 한다. |
| 작업 | P0에서는 복잡한 인벤토리 대신 현재 보유 도구 태그 세트만 구현한다. |
| 구현 단계 | 1. Player 또는 lightweight component에 HeldToolTags 추가. 2. 도구함 상호작용 UI/프롬프트 구현. 3. 민원 RequiredToolTags와 비교. 4. 현장 조치 가능 여부에 반영. |
| 완료 기준 | 렌치/드라이버 같은 P0 도구가 없으면 조치가 막히고, 관리실로 돌아가 선택하면 진행된다. |

### DEV-P0-06 Report UI And Result Flow

| 항목 | 내용 |
| --- | --- |
| 목적 | 민원 완료가 단순 버튼이 아니라 플레이어 판정으로 남게 한다. |
| 작업 | 보고 위젯에서 `ENCReportResult`를 선택하고 `SubmitReport`, `CloseComplaint`를 호출한다. |
| 구현 단계 | 1. `WBP_ReportPanel` 생성. 2. FocusedComplaintId의 RequiredEvidenceTags 표시. 3. AllowedReportResults 표시. 4. 결과 제출 시 progression tag 부여. |
| 완료 기준 | 보고 결과에 따라 다음 민원 availability와 307 관련 progression tag가 달라진다. |

### DEV-P0-07 Room 307 Stage Runtime

| 항목 | 내용 |
| --- | --- |
| 목적 | 307호 노출을 민원 결과와 연결한다. |
| 작업 | P0에서는 별도 복잡한 매니저보다 progression tag 기반 Stage 계산을 우선한다. |
| 구현 단계 | 1. Stage 0~3를 progression tag 조합으로 정의. 2. 307 문 앞 액터/사운드/조명 BP가 Stage를 조회. 3. 보고 후 Stage 변화 확인. |
| 완료 기준 | 203/302 민원 보고 후 307호 앞 사운드/표기/조명 변화가 단계적으로 발생한다. |

### DEV-P0-08 Lighting And Sound Hooks

| 항목 | 내용 |
| --- | --- |
| 목적 | 공포 연출을 민원 상태와 분리하지 않고 runtime state에 연결한다. |
| 작업 | Level Blueprint 하드코딩을 최소화하고, BP actor가 progression tag 또는 complaint state를 구독/조회한다. |
| 구현 단계 | 1. P0 조명 actor BP에 상태 적용 함수 작성. 2. 307 문 앞 사운드 actor BP에 Stage 적용. 3. 보고 이벤트 후 갱신 호출. |
| 완료 기준 | 민원 보고 결과 없이 임의로 공포 연출이 발생하지 않는다. |

### DEV-P0-09 Save Checkpoint

| 항목 | 내용 |
| --- | --- |
| 목적 | P0 테스트 반복을 빠르게 하기 위한 최소 저장을 제공한다. |
| 작업 | 본편 저장 구조가 아니라 보고 단위 임시 SaveGame을 만든다. |
| 구현 단계 | 1. SaveGame class 생성. 2. ChapterId, ShiftPhase, ProgressionTags, ComplaintRuntimeData 저장. 3. Dev menu/debug restore 제공. |
| 완료 기준 | 에디터 재시작 후 P0 민원 진행 상태를 복원할 수 있다. |

### DEV-P0-10 Smoke-Test Debug Commands

| 항목 | 내용 |
| --- | --- |
| 목적 | 반복 테스트 시간을 줄이고 상태 버그를 빠르게 찾는다. |
| 작업 | `UNCDebugCheatManager`에 P0 전용 명령을 정리한다. |
| 구현 단계 | 1. Register/Accept/Begin/Report/Close command 확인. 2. AddEvidenceTag command 추가/정리. 3. 307 Stage progression tag toggle 추가. |
| 완료 기준 | 콘솔 명령만으로 P0 민원 3개를 각 단계로 이동시킬 수 있다. |

## 5. Implementation Milestones

| Milestone | 목표 | 완료 조건 |
| --- | --- | --- |
| M0. Baseline Verify | 현재 프로젝트가 빌드되고 DevLevel에서 플레이어가 움직인다. | Editor build 성공, DevLevel PIE, 이동/카메라/Grab/문 조작 확인 |
| M1. Runtime State | Shift/Complaint 상태가 초기화되고 디버그 조회 가능하다. | 민원 3개 등록, BoardReview/Investigating/Reporting 전환 |
| M2. Data Authoring | P0 DataAsset/DataTable이 실제 민원 루프에 들어간다. | P0 민원 3개가 UI 또는 debug에서 조회됨 |
| M3. Board-To-Field | 보드에서 민원 접수 후 현장 목표가 열린다. | FocusedComplaintId와 HUD 목표 갱신 |
| M4. Evidence-To-Report | 현장 단서가 증거 태그로 누적되고 보고 가능 상태가 된다. | RequiredEvidenceTags 충족 시 `AwaitingReport` |
| M5. Report-To-307 | 보고 결과가 progression tag와 307 Stage를 바꾼다. | 307 문 앞 변화가 민원 결과 후 발생 |
| M6. P0 Route Polish | 15~20분 수직 슬라이스를 처음부터 끝까지 돈다. | smoke-test 체크리스트 통과 |

## 6. P0 Smoke-Test Route

1. Editor Development 빌드.
2. `DevLevel` 또는 P0 테스트 레벨에서 PIE 시작.
3. 관리실 HUD/HUD reticle 표시 확인.
4. ShiftPhase가 `BoardReview`인지 확인.
5. 보드에서 `CMP_PRO_OfficeLightBuzz` 접수.
6. 관리실 형광등 단서 확인, 조치, 보고.
7. `CMP_CH1_203_WaterAtDoor` 접수.
8. 도구함에서 필요한 도구 선택.
9. 203호 앞 단서 확인, 조치, 보고.
10. 307 관련 progression tag 또는 Stage 변화 확인.
11. `CMP_CH2_302_TVHum` 접수.
12. 302호/3층 단서 확인, 307호 쪽 잔류 사운드 확인.
13. 관리실 보고 후 데모 종료 상태 진입.

## 7. Development Acceptance Criteria

| 기준 | 통과 신호 |
| --- | --- |
| 상태 흐름 | 민원은 `Available -> Accepted -> Investigating -> AwaitingReport -> Closed`로 이동한다. |
| 데이터 주도 | P0 민원 3개는 DataAsset/DataTable 변경으로 순서와 조건을 조정할 수 있다. |
| UI 분리 | UI는 런타임 상태를 표시하고 subsystem/API를 호출하며 게임 상태를 직접 소유하지 않는다. |
| 레벨 분리 | 레벨 배치 액터는 ComplaintId, EvidenceTag, ProgressionTag로 연결된다. |
| 307 연결 | 307 변화는 민원 결과 또는 progression tag 없이 독립 발생하지 않는다. |
| 디버그 | 주요 단계는 콘솔/디버그 명령으로 강제 전환 가능하다. |
| 성능 | P0 루프는 불필요한 Tick 감시 없이 이벤트/상호작용 중심으로 동작한다. |

## 8. Immediate Next Tasks

| 순서 | 작업 | 파일/자산 |
| --- | --- | --- |
| 1 | 현재 빌드 확인 | `NightCaretakerEditor`, `DevLevel` |
| 2 | P0 민원 3개 DataAsset 정규화 | `Content/NightCaretaker/Data/Complaint` |
| 3 | Chapter DataTable 정리 | `Content/NightCaretaker/Data/DT_ChapterComplaint` |
| 4 | 민원 보드 임시 UI 제작 | `Content/NightCaretaker/Widget/WBP_ComplaintBoard` |
| 5 | Evidence interaction component/interface 추가 | `Source/NightCaretaker/Interaction` |
| 6 | 보고 UI 제작 | `Content/NightCaretaker/Widget/WBP_ReportPanel` |
| 7 | 307 Stage progression tag 연결 | `Source/NightCaretaker/System` 또는 BP helper |
| 8 | P0 smoke-test debug command 정리 | `UNCDebugCheatManager` |

## 9. Risks

| 리스크 | 대응 |
| --- | --- |
| Planning의 큰 단계와 현재 `ENCShiftPhase`가 다름 | P0에서는 `ChapterId + ProgressionTags`로 큰 단계를 표현하고 enum 증설은 보류한다. |
| UI가 Blueprint에서 상태를 직접 소유함 | UI는 `UNCComplaintRuntimeSubsystem`과 `UNCUISubsystem`만 호출하게 제한한다. |
| 민원 단서가 레벨 하드코딩됨 | 상호작용 액터에 `ComplaintId`, `EvidenceTag` 필드를 둔다. |
| 도구 시스템이 과해짐 | P0는 tag set 기반 보유 도구만 구현한다. |
| 307 연출이 독립 이벤트로 흩어짐 | 307 변화는 progression tag 기반으로만 발생시킨다. |
| Save 구조가 본편 규모로 커짐 | P0는 보고 단위 임시 체크포인트까지만 한다. |

## 10. Open Questions

| 질문 | 현재 기본값 |
| --- | --- |
| P0 레벨은 기존 `DevLevel`을 쓸지 별도 `LV_P0VerticalSlice`를 만들지 | 별도 P0 레벨 권장 |
| Evidence interaction을 C++ 인터페이스로 만들지 ActorComponent로 만들지 | 재사용성과 BP 배치를 위해 ActorComponent 우선 |
| 도구 보유 위치를 PlayerCharacter에 둘지 subsystem에 둘지 | P0는 PlayerCharacter/Component, 본편 확장 시 inventory subsystem 검토 |
| 307 Stage를 별도 enum으로 만들지 tag 계산으로 둘지 | P0는 tag 계산 |
| 저장을 P0에 넣을지 debug restore로 대체할지 | 반복 테스트를 위해 최소 SaveGame 권장 |

## 11. Maintenance Rule

개발 문서의 새 항목은 다음 형식으로만 본문에 넣는다.

```text
기능은 [플레이어 행동]을 가능하게 하기 위해 필요하다.
구현은 [C++ 타입/Blueprint/자산]에서 담당한다.
완료 기준은 [PIE에서 관찰 가능한 결과]다.
```

이 형식으로 쓸 수 없는 내용은 Archive 또는 Source 작업 문서에 둔다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

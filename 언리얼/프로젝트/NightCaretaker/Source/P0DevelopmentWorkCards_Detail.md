---
aliases:
  - "P0 Development Work Cards Detail"
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

# P0 Development Work Cards Detail

> [!summary] 문서 목적
> 이 문서는 P0 데모 구현을 실제 개발자가 하나씩 집을 수 있는 작업카드로 세분화한다. 각 카드는 기존 `CARD-P0-*`, `VS-*` 티켓과 연결되며, Unreal Editor 작업, Blueprint 연결, Data Asset 작성, C++ 확장 필요 여부를 명확히 구분한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/P0DevelopmentWorkCards_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Existing Owner Map | 주요 섹션 |
| Card Template | 주요 섹션 |
| DEV-P0-000 Build And PIE Baseline | 주요 섹션 |
| DEV-P0-010 P0 Route Skeleton | 주요 섹션 |
| DEV-P0-020 Location Marker And Gate Contract | 주요 섹션 |
| DEV-P0-030 Office Interaction Shell | 주요 섹션 |
| DEV-P0-040 Complaint Seed Data | 주요 섹션 |
| DEV-P0-050 Complaint Runtime Loop | 주요 섹션 |
| DEV-P0-060 Board Report Notebook UI Bridge | 주요 섹션 |
| DEV-P0-070 HUD Prompt And Route Guidance | 주요 섹션 |
| DEV-P0-080 Baseline Lighting State | 주요 섹션 |
| DEV-P0-090 Baseline Audio Cue | 주요 섹션 |
| DEV-P0-100 Debug Smoke Commands | 주요 섹션 |
| 추가 섹션 3 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

이 문서는 P0 데모 구현을 실제 개발자가 하나씩 집을 수 있는 작업카드로 세분화한다. 각 카드는 기존 `CARD-P0-*`, `VS-*` 티켓과 연결되며, Unreal Editor 작업, Blueprint 연결, Data Asset 작성, C++ 확장 필요 여부를 명확히 구분한다.

작성 원칙은 다음과 같다.

- 기존 owner/API를 먼저 사용한다.
- 새 subsystem이나 새 상태 축은 마지막 선택지로 둔다.
- 각 카드는 PIE에서 확인 가능한 결과를 완료 기준으로 삼는다.
- 아트 산출물이 없어도 blockout/placeholder로 검증 가능한 흐름을 먼저 만든다.

## Existing Owner Map

| Owner | Current Responsibility | Development Card Usage |
| --- | --- | --- |
| `UNCComplaintRuntimeSubsystem` | complaint state mutation entry point | `RegisterComplaint`, `AcceptComplaint`, `BeginInvestigation`, `AddEvidenceTag`, `SubmitReport`, `CloseComplaint` 호출 기준 |
| `UNCShiftStateComponent` | current chapter, phase, focused complaint, progression tags | route/board/report phase와 debug state 확인 |
| `UNCComplaintRuntimeComponent` | live complaint runtime data storage | state/evidence/report result dump와 UI 표시 source |
| `UNCUISubsystem` | local HUD lifetime and HUD state cache | HUD 표시, reticle focus, prompt bridge 확장 기준 |
| `UNCPlayerHUDWidget` | runtime HUD base widget | reticle/prompt UI 연결 기준 |
| `ANCPlayerControllerBase` | HUD setup and cheat manager owner | UI entry point와 debug command 실행 context |
| `UNCDebugCheatManager` | existing exec debug commands | smoke setup, complaint state dump, regression 확인 |
| `UNCComplaintDefinition` | complaint Data Asset schema | first complaint seed authoring |
| `FNCChapterComplaintRow` | chapter DataTable row | P0 route row ordering and unlock conditions |

## Card Template

각 카드 구현 전 아래 항목이 채워져 있어야 한다.

| Field | Required Meaning |
| --- | --- |
| Goal | 플레이어 또는 개발자가 확인할 수 있는 변화 |
| Owner | C++/Blueprint/Data/Map 책임 경계 |
| Inputs | 사용해야 할 기존 문서, class, asset, tag |
| Output | repo에 남아야 하는 산출물 |
| Done | PIE 또는 debug command로 확인 가능한 완료 조건 |
| Do Not | 이 카드에서 하지 않을 일 |

## DEV-P0-000 Build And PIE Baseline

| Field | Details |
| --- | --- |
| Maps To | Week 0 restart setup |
| Goal | 현재 `develop-0.1` 기준으로 C++ build와 `DevLevel` PIE 가능 여부를 확인한다. |
| Owner | Dev |
| Inputs | `NightCaretaker.uproject`, `Config/DefaultEngine.ini`, `Source/NightCaretaker`, `Content/NightCaretaker/Level/DevLevel.umap` |
| Existing API | `ANCGameMode`, `ANCGameInstance`, `ANCPlayerControllerBase`, `ANCPlayerCharacter` |
| Output | build/PIE 결과, 실패 시 원인과 재현 로그 |
| Done | `DevLevel`에서 플레이어 spawn, 이동, look, HUD 표시, console command 사용 가능 여부가 확인된다. |
| Do Not | build 실패 원인을 우회하기 위해 기본 map이나 GameMode를 임의 변경하지 않는다. |

Implementation notes:

- `DefaultEngine.ini`의 default map은 현재 `DevLevel`이다.
- `ANCPlayerControllerBase`는 `UNCDebugCheatManager`를 cheat class로 사용한다.
- build 실패가 C++ compile error인지 asset load 문제인지 분리해서 기록한다.

Validation:

- Editor 실행 또는 command-line build 성공.
- `DevLevel` PIE 시작.
- 이동/look/grab/reticle 확인.
- `NCDumpShiftState`, `NCDumpComplaints` console command 실행 가능 여부 확인.

## DEV-P0-010 P0 Route Skeleton

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-001`, `VS-BLOCKOUT-01` |
| Dependency | `DEV-P0-000` |
| Goal | 관리실에서 2층 복도, 3층 복도, 지하 전기실, 307호 앞까지 이동 가능한 blockout route를 만든다. |
| Owner | Map/Level + Dev |
| Inputs | `DevLevel`, `Document/NightCaretaker_VerticalSlice_Detail.md`, `Document/NightCaretaker_LevelSpace_Detail.md` |
| Existing API | player movement, door actor if needed, collision/channel defaults |
| Output | P0 route blockout map state, route screenshot/capture |
| Done | 플레이어가 관리실에서 307호 앞까지 막힘 없이 이동한다. |
| Do Not | route를 늘려 플레이타임을 확보하지 않는다. 307호 내부는 열지 않는다. |

Implementation notes:

- route는 기능 검증이 우선이며 art pass를 기다리지 않는다.
- 2층과 3층은 같은 모듈을 쓰더라도 방향감과 기준점을 다르게 둔다.
- 지하는 실제 완성 공간이 아니라 전기실 목표가 읽히는 최소 구조면 된다.

Validation:

- 시작 지점에서 307호 앞까지 직접 이동.
- 계단/엘리베이터/지하 접근에 collision 막힘이 없는지 확인.
- route capture 1개를 PM review 자료로 남긴다.

## DEV-P0-020 Location Marker And Gate Contract

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-002`, `VS-BLOCKOUT-02` |
| Dependency | `DEV-P0-010` |
| Goal | 민원, UI, debug가 같은 위치 기준을 쓰도록 `LocationId`와 gate 계약을 고정한다. |
| Owner | Map/Blueprint + Dev |
| Inputs | `UNCComplaintDefinition.LocationId`, `FNCChapterComplaintRow`, route checklist |
| Existing API | `FName LocationId`, gameplay tags, `UNCShiftStateComponent` progression tags |
| Output | P0 `LocationId` 목록, marker/gate 배치 기준, route step 판정 기준 |
| Done | 주요 route step에서 현재 위치 판정 또는 gate 조건이 재현 가능하다. |
| Do Not | actor마다 임시 문자열을 따로 만들지 않는다. 새 enum을 만들지 않는다. |

Required `LocationId` defaults:

| Id | Purpose |
| --- | --- |
| `LOC_OFFICE_MAIN` | 시작, board, report, tool pickup |
| `LOC_2F_203_DOOR` | 첫 물/시각 evidence |
| `LOC_2F_INTERCOM` | intercom static evidence |
| `LOC_3F_EMERGENCY_LIGHT` | 3층 불안 시작 |
| `LOC_3F_302_DOOR` | TV hum and record conflict |
| `LOC_BSMT_PUMP` | basement pump route |
| `LOC_BSMT_PANEL` | power/label misdirection |
| `LOC_3F_307_DOOR` | 307 door memory |

Validation:

- 각 location에 도달했을 때 route step debug 또는 onscreen marker 확인.
- 민원 data의 `LocationId`와 배치 marker 이름이 일치하는지 확인.
- gate 실패 시 이유가 PM review에서 설명 가능해야 한다.

## DEV-P0-030 Office Interaction Shell

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-003`, `VS-INTERACTION-01` |
| Dependency | `DEV-P0-010` |
| Goal | 관리실에서 민원 보드, 공구함, 손전등, 보고 위치를 5분 안에 이해 가능한 interaction shell로 만든다. |
| Owner | Blueprint/Widget/Map + Dev |
| Inputs | `UNCUISubsystem`, `UNCPlayerHUDWidget`, office blockout, input setup |
| Existing API | `UNCUISubsystem::SetReticleFocus`, HUD state, player grab/interaction input |
| Output | interactable placeholders, prompt text, basic UI open/close route |
| Done | 보드 확인, 도구 준비, 보고 위치가 한 화면 흐름으로 이해된다. |
| Do Not | full board/report UI를 이 카드에서 완성하지 않는다. |

Implementation notes:

- 상호작용 대상은 처음에 Blueprint actor 또는 placed placeholder로 충분하다.
- prompt는 `대상명 - 입력 행동` 한 줄을 유지한다.
- 공구함/손전등은 실제 inventory가 없어도 P0 진행 flag 또는 placeholder pickup으로 검증한다.

Validation:

- 새 플레이어가 관리실에서 5분 안에 보드, 도구, 보고 위치를 찾을 수 있는지 확인.
- prompt가 길어 화면을 가리지 않는지 확인.
- 보드/보고 화면 열기와 닫기 후 입력이 복귀하는지 확인.

## DEV-P0-040 Complaint Seed Data

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-004`, `VS-COMPLAINT-01` |
| Dependency | `DEV-P0-020` |
| Goal | 첫 P0 민원 루프에 필요한 complaint data, evidence, report result, progression 기준을 고정한다. |
| Owner | Data Asset/DataTable + Dev |
| Inputs | `UNCComplaintDefinition`, `FNCChapterComplaintRow`, `DefaultGameplayTags.ini` |
| Existing API | `ComplaintId`, `LocationId`, `RequiredEvidenceTags`, `AllowedReportResults`, `CompletionTags` |
| Output | 첫 P0 민원 seed data와 10단계 확장 기준 |
| Done | 최소 1개 민원이 board에 노출될 수 있고 evidence/report 기준이 문서와 일치한다. |
| Do Not | 10개 민원을 모두 완성하려고 첫 루프 검증을 지연하지 않는다. |

Recommended first complaint:

| Field | Value |
| --- | --- |
| ComplaintId | `CMP_PRO_203_WaterAtDoor` |
| TemplateType | `Inspection` |
| LocationId | `LOC_2F_203_DOOR` |
| Evidence | `Evidence.Visual`, `Evidence.Environmental` |
| Report Result | `Resolved`, `NeedsFollowUp` |
| Completion | `Progression.Chapter.Prologue` or P0-specific progression tag if already defined |

Validation:

- Data Asset/DataTable row에서 ID, location, evidence, report result를 확인.
- invalid gameplay tag 경고가 없는지 확인.
- debug command로 complaint runtime entry 생성 가능 여부 확인.

## DEV-P0-050 Complaint Runtime Loop

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-004`, `VS-COMPLAINT-01` |
| Dependency | `DEV-P0-040` |
| Goal | 첫 민원이 `Accepted -> Investigating -> AwaitingReport -> Closed` 흐름을 통과하게 만든다. |
| Owner | Blueprint/Runtime + Dev |
| Inputs | `UNCComplaintRuntimeSubsystem`, first complaint data, office/field/report interactions |
| Existing API | `RegisterComplaint`, `AcceptComplaint`, `BeginInvestigation`, `AddEvidenceTag`, `SubmitReport`, `CloseComplaint` |
| Output | board-to-report runtime loop |
| Done | 사운드 없이도 보드 -> 현장 -> 단서 -> 보고 -> 종료가 성립한다. |
| Do Not | UI에서 runtime state를 직접 계산하지 않는다. |

Implementation notes:

- `AcceptComplaint`는 focused complaint와 shift phase를 `Investigating`으로 바꾼다.
- `SubmitReport`는 runtime state를 `AwaitingReport`, shift phase를 `Reporting`으로 바꾼다.
- `CloseComplaint`는 runtime state를 `Closed`, shift phase를 `BoardReview`로 되돌린다.
- evidence 획득은 `AddEvidenceTag`로만 누적한다.

Validation:

```text
NCRegisterComplaint CMP_PRO_203_WaterAtDoor
NCAcceptComplaint CMP_PRO_203_WaterAtDoor
NCBeginInvestigation CMP_PRO_203_WaterAtDoor
NCAddComplaintEvidence CMP_PRO_203_WaterAtDoor Evidence.Visual
NCSubmitComplaintReport CMP_PRO_203_WaterAtDoor 0
NCCloseComplaint CMP_PRO_203_WaterAtDoor
NCDumpComplaints
NCDumpShiftState
```

Pass criteria:

- dump에서 complaint state가 `Closed`로 보인다.
- focused complaint가 clear된다.
- shift phase가 board review 계열로 돌아온다.

## DEV-P0-060 Board Report Notebook UI Bridge

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-005`, `VS-UI-01` |
| Dependency | `DEV-P0-050` |
| Goal | Board, Report, Notebook이 runtime state와 evidence를 표시하게 만든다. |
| Owner | Widget/Blueprint + Dev |
| Inputs | `UNCUISubsystem`, `UNCComplaintRuntimeSubsystem`, `UNCComplaintRuntimeComponent` |
| Existing API | `GetComplaintRuntimeComponent`, `GetAllComplaintRuntimeData`, HUD show/hide path |
| Output | P0 board/report/notebook UI bridge |
| Done | UI가 현재 민원, 발견 evidence, 보고 가능 상태를 표시한다. |
| Do Not | mock array를 기준으로 P0 UI를 완성하지 않는다. |

Implementation notes:

- Board는 available/accepted complaint를 보여준다.
- Report는 `AllowedReportResults`와 discovered evidence summary를 보여준다.
- Notebook은 정답지가 아니라 현재 확보 단서 요약만 보여준다.
- UI corruption은 P0에서 입력 방해가 아니라 문구/정렬/기록 충돌 표현으로 제한한다.

Validation:

- runtime debug로 evidence를 추가하면 UI가 갱신되는지 확인.
- report submit 후 state 변화가 Board/Report에 반영되는지 확인.
- UI를 닫은 뒤 player input이 정상 복귀하는지 확인.

## DEV-P0-070 HUD Prompt And Route Guidance

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-006`, `VS-UI-02` |
| Dependency | `DEV-P0-030`, `DEV-P0-060` |
| Goal | route별 다음 행동을 HUD prompt와 document viewer text로 최소 안내한다. |
| Owner | Widget/Blueprint + Dev |
| Inputs | `UNCUISubsystem`, `UNCPlayerHUDWidget`, route markers, interaction shell |
| Existing API | `FNCHUDState`, `SetReticleVisible`, `SetReticleFocus` |
| Output | prompt routing, focus state, route guidance text |
| Done | 각 route step에서 대상명과 행동이 한 줄로 표시된다. |
| Do Not | 큰 quest marker, mini map, 정답 설명 UI를 추가하지 않는다. |

Prompt defaults:

| Context | Prompt |
| --- | --- |
| Board | `민원 보드 - E 확인` |
| Toolbox | `공구함 - E 챙기기` |
| Report | `보고서 - E 작성` |
| Evidence | `젖은 타일 - E 확인` |
| Door307 | `307호 문 앞 - E 확인` |

Validation:

- prompt text가 모든 해상도에서 읽히고 겹치지 않는지 확인.
- reticle focus가 interactable 대상에서만 바뀌는지 확인.
- route prompt가 공포 원인이나 정답을 설명하지 않는지 확인.

## DEV-P0-080 Baseline Lighting State

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-007`, `VS-LIGHTING-01` |
| Dependency | `DEV-P0-010` |
| Goal | 관리실, 복도, 지하의 placeholder lighting state를 route readability 중심으로 연결한다. |
| Owner | Level/Lighting + Dev |
| Inputs | route blockout, `PowerState` design contract, Art Master lighting guide |
| Existing API | 기존 runtime state 소비 원칙. 새 lighting subsystem은 만들지 않음. |
| Output | normal, flicker, emergency/basement lighting preset placeholders |
| Done | 조명을 켜도 길찾기와 interaction target 판독이 유지된다. |
| Do Not | 완성 lighting polish를 목표로 삼지 않는다. |

Validation:

- normal 상태에서 route 기준점이 읽힌다.
- emergency 상태에서 길찾기가 유지된다.
- 307호 앞은 특별한 세트처럼 과노출되지 않는다.

## DEV-P0-090 Baseline Audio Cue

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-007`, `VS-AUDIO-01` |
| Dependency | `DEV-P0-010` |
| Goal | route, evidence, tension feedback을 위한 최소 ambience/cue를 배치한다. |
| Owner | Audio/Level + Dev |
| Inputs | Sound detail, route step, evidence tags |
| Existing API | `Evidence.Audio` tag, level audio actors or Blueprint placeholders |
| Output | 관리실 hum, 복도 ambience, 인터폰 static, TV hum, pump/panel hum, 307 door cue placeholders |
| Done | 사운드가 길찾기를 방해하지 않고 긴장 단계와 위치 정보를 보조한다. |
| Do Not | 음악 중심으로 분위기를 해결하지 않는다. |

Validation:

- 소리 발생원이 화면 중앙에서 직접 설명되지 않는다.
- `Evidence.Audio`를 얻는 민원에서 cue와 evidence가 연결된다.
- 반복 loop가 피로하게 크지 않은지 확인한다.

## DEV-P0-100 Debug Smoke Commands

| Field | Details |
| --- | --- |
| Maps To | `CARD-P0-008`, `VS-QADEBUG-01` |
| Dependency | `DEV-P0-050` |
| Goal | P0 route와 민원 상태를 독립 재현할 수 있는 debug 기준을 만든다. |
| Owner | Debug/C++ or Blueprint + Dev |
| Inputs | `UNCDebugCheatManager`, route step list, complaint ids |
| Existing API | `NCSetChapter`, `NCSetShiftPhase`, `NCSetFocusedComplaint`, `NCRegisterComplaint`, `NCAcceptComplaint`, `NCBeginInvestigation`, `NCAddComplaintEvidence`, `NCSubmitComplaintReport`, `NCCloseComplaint`, `NCDumpShiftState`, `NCDumpComplaints` |
| Output | smoke command checklist and optional helper commands |
| Done | 각 route step의 시작 상태를 1분 안에 재현할 수 있다. |
| Do Not | debug command에 shipping gameplay dependency를 만들지 않는다. |

Implementation notes:

- 기존 command 조합으로 충분하면 새 command를 만들지 않는다.
- 반복 setup이 너무 길면 `NCStartP0Step <StepIndex>` 같은 helper command를 후속 후보로 기록한다.
- helper command를 만들 경우 내부에서는 기존 subsystem API를 호출해야 한다.

Validation:

- complaint loop state dump가 예상과 일치한다.
- progression tag 추가/제거가 예상대로 동작한다.
- smoke-test 실패 시 route step과 state dump를 함께 기록한다.

## DEV-P0-110 P0 End-To-End Smoke Pass

| Field | Details |
| --- | --- |
| Maps To | Demo lock |
| Dependency | `DEV-P0-070`, `DEV-P0-080`, `DEV-P0-090`, `DEV-P0-100` |
| Goal | 30-45분 데모 흐름을 처음부터 307호 앞 맛보기까지 통과시킨다. |
| Owner | PM/Dev |
| Inputs | all P0 cards, route checklist, smoke criteria |
| Existing API | debug dump commands, runtime state, UI prompt, route gates |
| Output | smoke pass/fail 기록표, top blockers, next iteration priority |
| Done | 외부 테스트 후보 빌드를 만들 수 있다. |
| Do Not | smoke pass 전 신규 기능을 추가하지 않는다. |

Pass matrix:

| Check | Pass |
| --- | --- |
| Route | 관리실 -> 2층 -> 3층 -> 지하 -> 307호 앞 이동 가능 |
| Onboarding | 5분 안에 board/tool/report 이해 |
| Complaint | 첫 민원 report close 완료 |
| UI | runtime state와 evidence 표시 |
| Lighting | 정전/비상등 상태에서도 길찾기 유지 |
| Audio | ambience/cue가 tension과 evidence를 보조 |
| Debug | 실패 step 재현 가능 |
| 307 | 문을 열지 않아도 다음 목표로 기억 |

## Validation Commands

문서 작성 후 다음 명령으로 정적 검증한다.

```powershell
rg --line-number "DEV-P0-010|UNCComplaintRuntimeSubsystem|UNCDebugCheatManager" Document/Source/P0DevelopmentWorkCards_Overview.md Document/Source/P0DevelopmentWorkCards_Detail.md
rg --line-number "doc-p0-dev-cards|DEV-P0-110" Document/NightCaretaker_P0Development_WorkCards.html Document/NightCaretaker_DocTheme.css
rg --line-number "[ \t]+$" Document/Source/P0DevelopmentWorkCards_Overview.md Document/Source/P0DevelopmentWorkCards_Detail.md Document/NightCaretaker_P0Development_WorkCards.html Document/NightCaretaker_DocTheme.css
git diff --check
```

`rg --line-number "[ \t]+$"`의 exit code `1`은 trailing whitespace가 없다는 의미로 해석한다.

## Update Log

- 2026-05-25: P0 development work cards detail created. Existing runtime owners, APIs, dependencies, card outputs, done criteria, validation steps, and non-goals were documented for P0 demo implementation.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

---
aliases:
  - "Project Restart PM Plan Detail"
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

# Project Restart PM Plan Detail

> [!summary] 문서 목적
> `ProjectRestartPMPlan`은 장기간 중단 후 NightCaretaker를 다시 진행하기 위한 PM 실행 기준이다. 기존 문서들은 이미 수직 슬라이스의 구현 티켓과 게임 방향을 정의하고 있으므로, 이 문서는 새 기획을 추가하지 않고 **무엇부터, 누가, 언제, 어떤 완료 기준으로 진행할지**...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/ProjectRestartPMPlan_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Source Inputs | 주요 섹션 |
| Current Project Read | 주요 섹션 |
| Git History Read | 세부 기준 |
| Runtime Read | 세부 기준 |
| Content Read | 세부 기준 |
| Operating Model | 주요 섹션 |
| Weekly Cadence | 세부 기준 |
| Review Rules | 세부 기준 |
| 8-Week Execution Plan | 주요 섹션 |
| Week 0: Restart Setup | 세부 기준 |
| Week 1-2: Route Skeleton And Gates | 세부 기준 |
| Week 3-4: Complaint Seed Loop | 세부 기준 |
| Week 5-6: Demo Chain And Mood Baseline | 세부 기준 |
| 추가 섹션 15 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

`ProjectRestartPMPlan`은 장기간 중단 후 NightCaretaker를 다시 진행하기 위한 PM 실행 기준이다. 기존 문서들은 이미 수직 슬라이스의 구현 티켓과 게임 방향을 정의하고 있으므로, 이 문서는 새 기획을 추가하지 않고 **무엇부터, 누가, 언제, 어떤 완료 기준으로 진행할지**를 고정한다.

이 작업의 핵심 판단은 다음과 같다.

- 첫 목표는 본편이 아니라 `30-45분 P0 데모`다.
- 사용자는 시간 여유가 있으므로 개발, 기획, PM, FX, 사운드 placeholder, integration을 집중적으로 담당한다.
- 아트 담당자는 평일 저녁 중심의 주 8-12시간 작업자로 계획한다.
- 아트 담당자는 Unreal Editor에서 직접 레벨/프랍 배치까지 수행한다.
- 구현은 `Document/Source/P0RuntimeKickoff_Overview.md`와 `Document/Source/P0RuntimeKickoff_Detail.md`의 카드 순서를 따른다.

## Source Inputs

| Input | PM Usage |
| --- | --- |
| `git log` | 2026년 3-5월 작업 흐름과 최근 중단 지점을 확인 |
| `Document/Source/P0RuntimeKickoff_*` | P0 구현 티켓 순서와 runtime 계약 확인 |
| `Document/Source/P0DevelopmentWorkCards_*` | P0 기능/구조별 실제 개발 작업카드 확인 |
| `Document/NightCaretaker_Planning_Master.md` | 데모 목표, MVP 합격 기준, 금지 범위 확인 |
| `Document/NightCaretaker_Development_Master.md` | 시스템 우선순위, 현재 구현/미구현 항목 확인 |
| `Document/NightCaretaker_Art_Master.md` | P0 아트 티켓, 공간 우선순위, 제작 순서 확인 |
| `Document/NightCaretaker_ProjectRestart_PMPlan.html` | PM 계획을 빠르게 검토하기 위한 HTML companion |
| `Source/NightCaretaker` | 현재 C++ runtime owner 확인 |
| `Content/NightCaretaker` | 현재 map, Data Asset, widget, production content 확인 |

## Current Project Read

### Git History Read

- `2026-03-22` 첫 프로젝트 커밋 이후 localization, 문서, 문, 데이터 framework, achievement, character movement, interaction 기반이 추가됐다.
- `2026-03-29` 전후로 widget framework, basement floor, art asset branch merge가 진행됐다.
- `2026-04-05` 문서 총합본이 추가되며 planning/development/art 기준이 정리됐다.
- `2026-04-11` 기본 level 설정과 widget branch merge가 있었다.
- `2026-04-21`부터 `2026-04-23`까지 art asset branch에서 Deko/office/prop 계열 asset이 대량 추가됐다.
- `2026-04-26`에는 P0 runtime kickoff work card 문서가 작성됐다.
- `2026-05-03` 마지막 커밋은 HUD reticle texture와 `WBP_NCPlayerHUD` 업데이트다.

### Runtime Read

- `UNCComplaintRuntimeSubsystem`은 complaint loop의 WorldSubsystem entry point다.
- `UNCComplaintRuntimeComponent`는 complaint runtime data를 `GameState`에 붙는 component로 관리한다.
- `UNCShiftStateComponent`는 chapter, phase, focused complaint, progression tag를 관리한다.
- `UNCUISubsystem`은 local player HUD lifetime과 reticle state만 관리하는 최소 UI layer다.
- `ANCPlayerCharacter`는 RealityCam, prop interactor, physics handle, sprint, grab/door interaction을 이미 갖고 있다.
- 즉, 새 대형 시스템보다 map/Blueprint/UI 연결과 data authoring이 우선이다.

### Content Read

- 현재 주요 map은 `Content/NightCaretaker/Level/DevLevel.umap`, `Level.umap`, `Prop_Pallet.umap`이다.
- `DefaultEngine.ini`의 기본 map은 `DevLevel`이다.
- Data Asset은 achievement, anomaly, complaint, chapter complaint table이 최소 형태로 존재한다.
- `Content/NO_COOKING`과 `Content/Deko_MatrixDemo`에는 재사용 후보 asset이 있지만 production 기준 경로는 `Content/NightCaretaker`로 둔다.

## Operating Model

### Weekly Cadence

| Day | Owner | Action |
| --- | --- | --- |
| Monday | PM | 이번 주 목표 3개 이하로 잠금, 전주 gate 실패 항목 정리 |
| Tuesday-Wednesday | Dev/Art | 각자 작업, 중간 screenshot 또는 PIE 영상 공유 |
| Thursday | PM | scope creep 검사, 금요일 통합 가능 범위로 축소 |
| Friday | Dev | 통합, redirector/참조 확인, 짧은 PIE smoke-test |
| Weekend | PM/Art | 리뷰, 아트 배치 보완, 다음 주 blockers 기록 |

### Review Rules

- 리뷰는 말보다 화면 기준으로 한다. map screenshot, 30-90초 capture, PIE 재현 순서를 우선한다.
- 아트 리뷰는 "예쁜가"보다 "route, 기능, 공포 정보가 읽히는가"를 먼저 본다.
- 개발 리뷰는 "시스템이 확장 가능한가"보다 "첫 민원 1건이 끝까지 닫히는가"를 먼저 본다.
- 매주 범위를 늘리지 않고 미완료 항목을 다음 주 첫 blocker로 넘긴다.

## 8-Week Execution Plan

### Week 0: Restart Setup

기간: `2026-05-25` - `2026-05-31`

목표:

- `develop-0.1` 기준 build/PIE 가능 여부를 확인한다.
- P0 대상 map을 결정한다. 기본값은 `DevLevel`이다.
- 아트 담당자에게 P0 범위와 금지선을 공유한다.
- `Content/NO_COOKING`, `Content/Deko_MatrixDemo`, `Content/NightCaretaker`의 재사용 후보를 표로 정리한다.

완료 기준:

- C++ build 성공 또는 실패 원인 기록.
- `DevLevel` PIE 실행 성공 또는 실패 원인 기록.
- `CARD-P0-001 Route Skeleton` 착수 가능 여부 확인.
- 아트 담당자가 첫 2주 동안 맡을 asset kit가 결정됨.

### Week 1-2: Route Skeleton And Gates

기간: `2026-06-01` - `2026-06-14`

개발 목표:

- `VS-BLOCKOUT-01`: 관리실, 2층 복도, 3층 복도, 지하 전기실, 307호 앞 route blockout.
- `VS-BLOCKOUT-02`: 주요 route 지점의 `LocationId` marker/gate.
- route step별 debug start 또는 재현 기준 초안.

아트 목표:

- `ART-P0-01 Corridor Modular Kit`.
- `ART-P0-02 Apartment Door and Nameplate Set`.
- `ART-P0-03 Corridor Lighting and Electrical Fixture Set`.

완료 기준:

- 플레이어가 관리실에서 307호 앞까지 막힘 없이 이동한다.
- 2층과 3층 복도가 같은 kit 기반이어도 기능적으로 구분된다.
- `LocationId` 판정이 민원, UI, debug에서 쓸 수 있는 형태로 존재한다.

### Week 3-4: Complaint Seed Loop

기간: `2026-06-15` - `2026-06-28`

개발 목표:

- `VS-INTERACTION-01`: 민원 보드, 공구함, 손전등, 보고 위치 interaction.
- `VS-COMPLAINT-01`: 최소 1건 민원 state transition.
- `VS-UI-01`: Board/Report/Notebook P0 화면을 실제 runtime state에 연결 시작.

아트 목표:

- `ART-P0-05 Management Office Gameplay Kit`.
- 2층 203호 앞 기준점, 젖은 타일, 인터폰 패널, 문패/환기구.
- 관리실 보드, 보고 위치, 공구함의 기능적 배치.

완료 기준:

- 첫 민원이 `Accepted -> Investigating -> AwaitingReport -> Closed`로 닫힌다.
- 사운드 없이도 보드 -> 현장 -> 단서 -> 보고 루프가 성립한다.
- 플레이어가 5분 안에 보드, 도구, 보고 위치를 이해한다.

### Week 5-6: Demo Chain And Mood Baseline

기간: `2026-06-29` - `2026-07-12`

개발 목표:

- 10단계 route checklist의 민원/progression chain 연결.
- 정전 이벤트, 지하 전기실 접근, 307호 앞 맛보기 연결.
- `VS-AUDIO-01`, `VS-LIGHTING-01` placeholder baseline.

아트 목표:

- `ART-P0-06 Mailbox Intercom Bulletin Set`.
- `ART-P0-07 Living Trace Prop Pack`.
- `ART-P0-08 Leak Mold Repair Decal Pack`.
- 지하 전기실과 307호 앞은 P0에 필요한 최소 밀도만 배치.

완료 기준:

- 30-45분 데모 흐름을 처음부터 끝까지 진행할 수 있다.
- 정전/비상등 상태에서도 길찾기가 무너지지 않는다.
- 307호를 열지 않아도 다음 목표로 기억된다.

### Week 7: Demo Lock

기간: `2026-07-13` - `2026-07-19`

개발 목표:

- `VS-QADEBUG-01`: 10단계 시작 상태 재현.
- 최소 checkpoint 저장 또는 debug recovery 기준.
- critical bug fix.

아트 목표:

- route readability pass.
- 조명 tone, 오염, 라벨, 소리 원인 포인트 정리.
- 새로운 공간/자산 추가 금지, polish만 허용.

완료 기준:

- 외부 테스트 후보 빌드를 만들 수 있다.
- smoke-test 실패 시 어느 route step에서 깨졌는지 기록 가능하다.
- 새 기능 없이 bug/polish만 남은 상태다.

### Week 8: External Test And Decision

기간: `2026-07-20` - `2026-07-26`

목표:

- 외부 테스트 3-5명.
- 테스트당 첫 5분 이해도, completion time, 307호 기억 여부, 길찾기 실패 지점 기록.
- 다음 단계가 demo polish인지, 본편 제작 전환인지, scope 축소인지 판정한다.

완료 기준:

- 테스트 기록표가 있다.
- 반복 실패 지점 top 3가 있다.
- 이후 4주 계획의 첫 priority가 결정된다.

## Workstream Breakdown

### PM And Production

- 모든 작업은 `CARD-P0-001`부터 `CARD-P0-008`까지의 work card로 묶는다.
- 매주 완료 기준은 "작업량"이 아니라 "PIE에서 재현 가능한 결과"로 둔다.
- 아트 담당자에게는 단일 이벤트용 asset이 아니라 최소 2개 complaint 이상에서 쓰일 kit를 배정한다.
- 일정이 밀리면 신규 민원 수를 줄이고, route와 첫 민원 루프는 유지한다.

### Development

- 새 subsystem보다 기존 `UNCComplaintRuntimeSubsystem`, `UNCShiftStateComponent`, gameplay tag, HUD framework를 연결한다.
- `DevLevel`을 기본 P0 검증 map으로 사용한다. 별도 map이 필요하면 Week 0에서만 결정한다.
- UI는 mock data로 오래 유지하지 않는다. Board/Report/Notebook은 complaint runtime state를 소비해야 한다.
- 저장/로드는 Week 7 전까지 full save가 아니라 최소 checkpoint/debug recovery로 제한한다.

### Art

- 1순위는 corridor modular kit, door/nameplate, lighting fixture다.
- 2순위는 management office gameplay kit다.
- 3순위는 living trace, leak/mold decal, 307 door front다.
- P0에서는 307호 내부를 제작하지 않는다.
- `NO_COOKING` asset은 임시 참조로만 사용하고, production asset은 `Content/NightCaretaker` 아래로 정리한다.

### FX And Sound

- sound는 late polish가 아니라 route 이해와 tension stage feedback을 위한 placeholder부터 붙인다.
- P0 baseline은 형광등 buzz, 환풍기/배관, 인터폰 static, TV hum, 펌프/배전반 hum, 307 문틈 저활동 소리다.
- FX는 정전, 비상등, 물기/오염, 문틈/도어락 cue처럼 route와 evidence에 직접 연결되는 것만 우선한다.

## Ticket Mapping

| PM Card | Runtime Ticket | Art Ticket | First Owner | Gate |
| --- | --- | --- | --- | --- |
| `CARD-P0-001 Route Skeleton` | `VS-BLOCKOUT-01` | `ART-P0-01`, `ART-P0-02`, `ART-P0-03` | Dev | route end-to-end 이동 |
| `CARD-P0-002 Location Gates` | `VS-BLOCKOUT-02` | `ART-P0-02` | Dev | `LocationId` 판정 |
| `CARD-P0-003 Office Interactions` | `VS-INTERACTION-01` | `ART-P0-05` | Dev | 보드/도구/보고 위치 이해 |
| `CARD-P0-004 Complaint Seed Loop` | `VS-COMPLAINT-01` | `ART-P0-05`, 2F props | Dev | 첫 민원 report close |
| `CARD-P0-005 Board Report UI` | `VS-UI-01` | UI texture/office board support | Dev | runtime state 표시 |
| `CARD-P0-006 Route Prompts` | `VS-UI-02` | signage/readability support | Dev | route prompt 연결 |
| `CARD-P0-007 Baseline Mood` | `VS-AUDIO-01`, `VS-LIGHTING-01` | lighting/decal/living trace | Dev/Art | 길찾기 유지 |
| `CARD-P0-008 Debug Smoke Loop` | `VS-QADEBUG-01` | 없음 | Dev | step 재현 |

## Acceptance Gates

### P0 Demo Gate

- 30-45분 안에 시작부터 307호 앞 맛보기까지 진행 가능.
- 5분 안에 "민원 처리 공포" 콘셉트 이해.
- 정상 민원과 이상 민원 차이가 한 세션 안에서 체감됨.
- 괴물 직접 노출 없이 긴장 유지.
- 플레이어가 307호 내부를 다음 목표로 기억.

### Cut Rules

- route가 불안하면 민원 수를 줄인다.
- 첫 민원 루프가 불안하면 UI polish를 줄인다.
- 아트가 밀리면 신규 공간보다 corridor/office/door kit 완성도를 올린다.
- 사운드가 밀리면 음악보다 환경 loop와 interaction cue를 우선한다.
- 저장/로드가 밀리면 demo build에서는 debug checkpoint로 대체한다.

## Documentation Cadence

- 이 문서들은 PM 계획의 기준 문서다.
- 읽기용 시각화 문서는 `Document/NightCaretaker_ProjectRestart_PMPlan.html`로 유지한다.
- 실제 개발 착수는 `Document/Source/P0DevelopmentWorkCards_Overview.md`와 `Document/Source/P0DevelopmentWorkCards_Detail.md`의 `DEV-P0-*` 카드를 기준으로 진행한다.
- 실제 구현 착수 시 각 feature work item은 별도 `Document/Source/<WorkItem>_Overview.md`와 `<WorkItem>_Detail.md`를 만든다.
- 매주 gate 결과는 `ProjectRestartPMPlan_Overview.md`의 `Update Log`에 짧게 남기고, 상세 원인/결정은 이 Detail 문서의 해당 주차 섹션에 반영한다.

## Immediate Next Steps

1. UE 5.7.4로 project build와 `DevLevel` PIE 실행을 확인한다.
2. P0 대상 map을 `DevLevel`로 확정하거나 별도 P0 map 생성 사유를 기록한다.
3. `DEV-P0-000 Build And PIE Baseline`과 `DEV-P0-010 P0 Route Skeleton`을 순서대로 착수한다.
4. 아트 담당자에게 `ART-P0-01`, `ART-P0-02`, `ART-P0-03`을 첫 2주 범위로 전달한다.
5. 첫 주 금요일에 route screenshot/capture 기준으로 PM review를 진행한다.

## Validation Commands

문서 작성 후 다음 명령으로 정적 검증한다.

```powershell
rg --line-number "ProjectRestartPMPlan" Document/Source
rg --line-number "doc-project-restart-pm|Project Restart PM Dashboard|CARD-P0-001" Document/NightCaretaker_ProjectRestart_PMPlan.html Document/NightCaretaker_DocTheme.css
rg --line-number "P0DevelopmentWorkCards|DEV-P0-010|doc-p0-dev-cards" Document/Source Document/NightCaretaker_P0Development_WorkCards.html Document/NightCaretaker_DocTheme.css
rg --line-number "CARD-P0-001|VS-BLOCKOUT-01|ART-P0-01|2026-07-26" Document/Source/ProjectRestartPMPlan_Overview.md Document/Source/ProjectRestartPMPlan_Detail.md
rg --line-number "[ \t]+$" Document/Source/ProjectRestartPMPlan_Overview.md Document/Source/ProjectRestartPMPlan_Detail.md Document/NightCaretaker_ProjectRestart_PMPlan.html Document/NightCaretaker_P0Development_WorkCards.html Document/NightCaretaker_DocTheme.css
git diff --check
```

`rg --line-number "[ \t]+$"`의 exit code `1`은 trailing whitespace가 없다는 의미로 해석한다.

## Update Log

- 2026-05-25: Created project restart PM detail. Captured repository read, current runtime/content state, 8-week schedule, weekly operating model, workstream split, acceptance gates, and immediate next steps.
- 2026-05-25: Added `NightCaretaker_ProjectRestart_PMPlan.html` and `doc-project-restart-pm` CSS styling. The HTML reorganizes the PM plan into snapshot, milestone, weekly detail, cadence, role split, ticket mapping, gates, and immediate next steps.
- 2026-05-25: Linked `P0DevelopmentWorkCards` as the concrete `DEV-P0-*` implementation card layer under the PM schedule.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

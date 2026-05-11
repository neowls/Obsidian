# Git Commit 기반 기술경력서 정리

작성일: 2026-05-05

## 분석 기준

- 저장소: `D:\UnrealProjects\BackroomCompany`
- 기준 명령: `git log --all --no-merges`
- 대상 작성자/계정군:
  - `KwunHyeongJin <hj.kwun@hypercent.co.kr>`
  - `Max <hj.kwun@hypercent.co.kr>`
  - `KwunHyeongJin <kh.kwun@hypercent.co.kr>`
  - `Kwun Hyeong Jin <neo4130@gmail.com>`
- 제외 기준:
  - Git merge commit 제외
  - 메시지상 명백한 merge/index 커밋 2건 추가 제외
- 주의:
  - 요청에 포함된 `neowls` 문자열은 author/committer/commit message에서 직접 발견되지 않았다.
  - `Kwun Hyeong Jin <neo4130@gmail.com>` 1건은 별칭 후보로 포함했다. 실제 `neowls`가 별도 Git 계정이라면 추가 매핑 확인이 필요하다.
  - `Negev`, `Negev2000`, `modforge2`, `박태호` 계정군은 서로 다른 이메일/작성자명으로 확인되어 본 문서의 본문 대상에서 제외했다.

## 정량 요약

| 항목 | 내용 |
| --- | --- |
| 분석 대상 커밋 수 | 528건 |
| 기간 | 2025-09-22 ~ 2026-05-04 |
| 주요 작성자 | `KwunHyeongJin`, `Max` |
| 주요 변경 영역 | UE5 C++ gameplay code, Blueprint assets, UI widgets, network audio, creature/side mission logic, static room/spec mesh, tech tree/crafting, release/debug config |
| 주의할 통계 | Unreal asset/ExternalActors 변경이 많아 LOC/파일 수는 이력서 지표로 부적합 |

작성자별 집계:

| 작성자 | 이메일 | 커밋 수 | 기간 |
| --- | --- | ---: | --- |
| KwunHyeongJin | `hj.kwun@hypercent.co.kr` | 515 | 2025-09-22 ~ 2026-04-30 |
| Max | `hj.kwun@hypercent.co.kr` | 11 | 2026-04-15 ~ 2026-05-04 |
| KwunHyeongJin | `kh.kwun@hypercent.co.kr` | 1 | 2025-09-26 |
| Kwun Hyeong Jin | `neo4130@gmail.com` | 1 | 2025-09-24 |

월별 활동량:

| 월 | 커밋 수 |
| --- | ---: |
| 2025-09 | 20 |
| 2025-10 | 74 |
| 2025-11 | 66 |
| 2025-12 | 31 |
| 2026-01 | 89 |
| 2026-02 | 82 |
| 2026-03 | 118 |
| 2026-04 | 47 |
| 2026-05 | 1 |

상위 커밋 메시지 prefix:

| Prefix | 커밋 수 | 해석 |
| --- | ---: | --- |
| Debug | 174 | QA/크래시/런타임 오류 수정, 검증 코드 추가 |
| Version | 49 | 빌드/패키징 버전 관리 |
| CustomVoice | 47 | 커스텀 음성 채팅 및 네트워크 오디오 |
| QA | 27 | QA 이슈 대응 |
| SideMissionPool | 25 | 사이드 미션/풀 스테이지 로직 |
| StaticRoom | 20 | 정적 룸/스테이지/크리처 배치 |
| SpecMesh | 14 | 관전/미니맵용 특수 메시 렌더링 |
| Modal | 13 | 오류/리더보드/메뉴 모달 UI |
| TechTree | 12 | 테크트리 프레임워크/데이터/디버그 |
| Partygoer | 11 | Partygoer 크리처/미니게임/사이드 미션 |

## 이력서용 한 줄 요약

UE5 기반 멀티플레이 협동 공포 게임에서 네트워크 음성 채팅, 크리처/사이드 미션, 정적 룸/관전 시각화, 테크트리/제작/부활 등 핵심 gameplay 시스템을 C++/Blueprint로 구현하고, 라이브 QA 대응과 패키징 안정화까지 수행.

## 핵심 기술 키워드

- Unreal Engine 5 C++, Blueprint, UMG, DataTable, GameplayTag
- Multiplayer replication, RPC, NetMulticast, client/server state flow
- Custom VOIP, audio capture/decode, jitter buffer, radio/proximity voice effect
- AI/creature state machine, side mission flow, static room encounter
- UI/UX systems: modal, leaderboard, medal, nameplate, minimap, tech tree
- Asset pipeline: SpecMesh, EUW icon generator, DLC skin/fullbody skin setup
- Live QA stabilization, crash prevention, packaging/version/config management

## 주요 업무 정리

### 1. 커스텀 VOIP 및 네트워크 오디오 시스템

커밋 메시지와 변경 파일 기준으로 `PlayerVoiceSubsystem`, `PlayerVoiceSpeakComponent`, `PlayerVoiceSynthComponent`, `PlayerVoiceSoundGenerator`, `WidgetSettingAudio` 등 음성 입출력과 재생 경로를 지속적으로 수정했다.

이력서용 정리:

- UE5 C++ 기반 커스텀 음성 채팅 서브시스템을 구현하고, 음성 캡처/디코드/재생 컴포넌트 흐름을 분리해 네트워크 음성 송수신 구조를 구축.
- 근접 음성/무전기 음성 효과, push-to-talk, 입력 볼륨/민감도 옵션, 오디오 이펙트 체인, 메가폰/소음 발생 이벤트 등 gameplay와 연결되는 음성 기능을 확장.
- ping 기반 jitter buffer, 네트워크 전송 빈도 조정, reliable NetMulticast 전환, client-side mute RPC 차단 등 멀티플레이 환경의 음성 안정성과 동기화를 개선.
- 마이크 hot-plug, fallback device, threshold option, race condition, forced exit crash 등 실제 QA에서 발생한 런타임/디바이스 이슈를 수정.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `1775857d45` | 2025-11-12 | Custom voice wave/actor/component 추가 |
| `5fb76bad4b` | 2025-11-11 | CustomVoice subsystem 추가 |
| `c9b6233e88` | 2025-11-14 | Radio/proximity voice 기능 추가 |
| `36677b8295` | 2026-01-12 | ping 기반 jitter buffer 조정 |
| `cce0f50e5b` | 2026-03-18 | VOIP NetMulticast reliable 변경 |

### 2. 크리처, 사이드 미션, 정적 룸 gameplay

`StaticRoomModule`, `StaticRoomCreatureState`, `SideMission`, `CreatureStates` 관련 C++ 파일과 크리처 Blueprint/Animation asset 변경이 많다. 특히 Helena, Partygoer, HandRoach, Slime, Smiley, MothSwarm 등 encounter 안정화가 반복적으로 보인다.

이력서용 정리:

- 정적 룸 기반 크리처 encounter와 사이드 미션 흐름을 구현/개선하고, stage state, room restriction, item deployer, relic spawn, dialogue/subtitle 실패 처리까지 gameplay 흐름을 연결.
- Partygoer 사이드 미션용 controller/state flow, 미니게임 상태, reward/failed dialogue, combat/perception/turning animation, 사운드 이벤트를 구현 및 안정화.
- Helena story encounter의 추적/타겟팅/피격/동결/체력/애니메이션 이슈를 QA 기반으로 수정하고, story school stage room flow를 정리.
- HandRoach, Slime, Roach, Turret, Smiley 등 크리처별 예외 처리와 animation/ABP/asset 누락 문제를 해결.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `3b0dabc91f` | 2025-09-22 | Story Helena state/PT phase |
| `68b4b258a9` | 2026-03-15 | Partygoer flow state 추가 |
| `5efedc0d06` | 2026-03-16 | SideMissionControllerPartygoer 추가 |
| `402bd356ab` | 2026-03-19 | SideMission dialogue 및 all-dead 처리 |
| `af69e861af` | 2026-03-20 | Partygoer reward exit crash 수정 및 미니게임 종료 이벤트 |

### 3. SpecMesh, RoomVisit, Minimap, Repeater 시각화

`SpecMeshManager`, `RoomVisitManager`, minimap/repeater 관련 커밋은 관전/미니맵/방문 룸 시각화와 연결된다. RoomVisit BFS, visited state 기반 SpecMesh 전환, icon capture 도구화가 확인된다.

이력서용 정리:

- 관전/미니맵 표시를 위한 SpecMesh 시스템을 리팩터링하고, RoomVisitManager와 BFS 기반 reveal logic을 추가해 방문 룸/미방문 룸 시각 상태를 관리.
- Repeater/Minimap manager를 개선해 revive 이후 binding 문제, large minimap nickname 위치, repeater minimap material 문제를 수정.
- Editor Utility Widget 기반 icon generator와 captured SpecMesh static texture 생성 흐름을 구축해 데이터/시각 asset 제작 반복 작업을 자동화.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `392e022b7b` | 2026-03-09 | SpecMesh refactor |
| `82fc513202` | 2026-03-10 | RoomVisitManager 추가 |
| `7c8c9e199c` | 2026-03-11 | reveal/BFS logic을 SpecMeshManager로 이동 |
| `a50bf2feb7` | 2026-04-22 | Minimap manager component logic 추가 |
| `c3f5579fc8` | 2026-04-21 | EUW icon generator 추가 |

### 4. 테크트리, 제작, 저장소, gameplay UI/데이터

2026년 3~4월 커밋에서 TechTree, Storage, Crafting, Revive, Difficulty, SkinSelect 관련 작업이 확인된다.

이력서용 정리:

- GameplayTag/DataTable 기반 테크트리 프레임워크를 구성하고, int id 의존도를 GameplayTag로 대체해 데이터 주도형 unlock 구조로 전환.
- 테크트리 RPC router, NetMulticast delegate, widget debug, unlocked state restore, node/effect 연동을 추가해 멀티플레이 unlock state 동기화 기반을 구축.
- Hub storage/crafting 초기 프레임워크와 item info struct/required item widget을 추가하고, recipe requirement/debug/naming 이슈를 수정.
- revive manager component를 추가해 기존 revive flow를 재구성하고, revive 이후 minimap binding/interact issue를 수정.
- fullbody skin select와 Partygoer DLC fullbody skin logic을 구성하고, upgraded crowbar 등 데이터 테이블을 갱신.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `0f5e6d5b10` | 2026-03-25 | Tech tree framework 구성 |
| `7ed2e71a2f` | 2026-03-25 | Tech tree id를 GameplayTag로 교체 |
| `158072fdde` | 2026-03-27 | Tech tree RPC router function 추가 |
| `a1f76391e3` | 2026-04-07 | Crafting system framework 추가 |
| `ab860364c5` | 2026-04-29 | Revival manager component 추가 및 revive rework |

### 5. 라이브 서비스형 UI, SIK, 리더보드/메달/모달

NamePlate, Modal, ErrorModal, Medal, Leaderboard, SIK 관련 커밋이 2025년 9~10월과 2026년 1~4월에 걸쳐 보인다.

이력서용 정리:

- 네트워크 nameplate/ID card render target 동기화와 client visibility 문제를 디버그하고, UI validation/logging을 추가.
- leader board, medal, error modal, SIK failure modal 등 라이브 서비스형 UI 흐름을 PlayerController/GameInstance/Widget 계층에 연결.
- SIK request ranking, audio BP 설정, cooking/setup 오류, enum redirect 정리 등 Steam Integration Kit 연동 이슈를 수정.
- disconnect/error modal focus, response callback, widget focus 등 UX 안정성을 QA 기반으로 개선.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `6a6678124f` | 2025-09-25 | NamePlate widget/log/render target material network sync |
| `2522f5ccf7` | 2025-10-01 | Modal logic을 PlayerController로 이동 |
| `642d63e916` | 2025-10-21 | Medal feature update |
| `91be916030` | 2025-10-30 | Client-side anticheat 추가 |
| `ed9bece43f` | 2026-04-29 | SIK setup 수정 |

### 6. 안정화, QA, 패키징/릴리즈 관리

`Debug`, `QA`, `Version`, `LightBuild`, `Config`, `LFS` prefix가 많은 편이다. 단순 로그성 커밋도 포함되어 있지만, shipping/packaging, crash, config, QA 이슈 대응의 비중이 높다.

이력서용 정리:

- 실제 QA 이슈를 기반으로 crash 방지 validation, weak pointer/lifetime 이슈, Blueprint compile/package error, missing asset, enum redirect, focus 문제를 반복적으로 해결.
- build/packaging version 관리와 Zen crash/config, LFS/gitignore 정리, DebugGameEngine net emulation ini, FSR3 reactive mask/denoiser 설정 등 개발/릴리즈 환경 안정화 작업을 수행.
- light build/static hotel GPU lighting, missing asset staging, external actor/asset 데이터 갱신 등 Unreal asset pipeline과 레벨 빌드 산출물을 관리.

대표 커밋:

| Hash | Date | 내용 |
| --- | --- | --- |
| `b05a350618` | 2026-01-06 | packaging version 변경 |
| `9f771fa5f0` | 2026-03-20 | sublevel open crash config setup 수정 |
| `50e1edb0c3` | 2026-03-06 | LFS/gitignore 수정 |
| `ac2a5bad5f` | 2026-04-24 | Zen setup crash 수정 |
| `b6524d8729` | 2026-04-24 | packaging error 수정 |

## 기술경력서 문장 초안

아래 문장은 이력서/경력기술서에 바로 옮겨 쓸 수 있는 형태로 압축한 버전이다.

- UE5 C++ 기반 멀티플레이 협동 공포 게임에서 커스텀 VOIP 시스템을 개발하여 음성 capture/decode/playback pipeline, proximity/radio voice effect, push-to-talk, jitter buffer, audio device fallback, mute/RPC 제어를 구현하고 QA 기반 안정화까지 수행.
- Static room encounter와 creature state machine을 중심으로 Helena, Partygoer, HandRoach, Slime 등 주요 크리처의 combat/perception/animation/side mission flow를 구현 및 개선하고, stage/room/item deployer/dialogue/subtitle 흐름과 연동.
- SpecMesh/RoomVisit/Minimap/Repeater 시스템을 개선하여 관전 및 미니맵 시각화를 위한 room reveal, visited-state rendering, revive 이후 binding 복구, editor utility 기반 icon generation workflow를 구축.
- GameplayTag/DataTable 기반 TechTree framework, storage/crafting framework, required item widget, revive manager, difficulty reset flow, DLC fullbody skin select 등 hub progression 및 gameplay UI 시스템을 구현.
- Leaderboard/medal/error modal/nameplate/SIK 연동 이슈를 해결하고, client/server focus, render target sync, request/ranking/debug flow 등 라이브 서비스형 UI 안정성을 개선.
- Shipping/packaging/build version, LFS/gitignore, Zen/config, missing asset, Blueprint compile error, crash validation 등 Unreal 라이브 프로젝트 운영 과정의 빌드/QA 안정화 업무를 지속 수행.

## 면접에서 설명하기 좋은 포인트

- Custom VOIP는 단순 UI 기능이 아니라 네트워크 전송, 오디오 디바이스, gameplay effect chain, UX 옵션, QA crash handling이 모두 얽힌 시스템으로 설명 가능하다.
- Partygoer/Helena/StaticRoom 작업은 AI 상태 전이, stage flow, side mission fail/success, animation event, level/static room 배치까지 연결되는 end-to-end gameplay feature로 설명하기 좋다.
- SpecMesh/RoomVisit/Minimap 작업은 "플레이어가 탐색한 공간을 어떻게 관전/지도/리피터에 보여줄 것인가"라는 gameplay visualization 문제를 데이터와 manager 구조로 푼 사례다.
- TechTree/Crafting/Storage 작업은 데이터 주도형 progression 구조와 멀티플레이 unlock state 동기화 관점에서 설명할 수 있다.
- Debug/QA 커밋 비중이 높으므로 "라이브 QA 재현, 원인 추적, 안정화, 패키징 검증" 역량을 강조하기 좋다.

## 검증 필요 항목

- `neowls`가 정확히 어떤 Git author/email을 의미하는지 추가 확인 필요.
- 본 문서는 commit message와 변경 경로 기반 분석이므로, 실제 구현 세부 책임 범위는 PR/이슈/리뷰 기록과 대조하면 더 정확해진다.
- Unreal binary asset 변경은 Git diff만으로 기능 내용을 해석하기 어렵다. 대표 기능은 커밋 메시지와 C++ 변경 파일명을 함께 근거로 삼았다.

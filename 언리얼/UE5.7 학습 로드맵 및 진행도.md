# UE5.7 학습 로드맵 및 진행도

- 작성일: 2026-04-12
- 대상 엔진: `UE 5.7.4`
- 설치 경로: `C:\Program Files\Epic Games\UE_5.7\Engine`
- Build 정보:
  - `MajorVersion: 5`
  - `MinorVersion: 7`
  - `PatchVersion: 4`
  - `BranchName: ++UE5+Release-5.7`
  - `Changelist: 51494982`

## 이 파일의 목적

이 파일은 앞으로 공부를 이어갈 때 기준점으로 쓰는 문서다.
목표는 세 가지다.

1. 지금 무엇을 이미 이해하고 있는지 유지한다.
2. 아직 비어 있는 엔진 영역을 계획적으로 메운다.
3. 다음에 이 파일을 다시 보여주면, 이전 맥락 없이도 바로 이어서 학습을 진행할 수 있게 만든다.

## 현재 세션 원칙

- 현재 활성 프로젝트 맥락은 NightCaretaker로 인식한다.
- 다만 이 세션에서는 프로젝트 구현 분석보다 언리얼 엔진 학습만 진행한다.
- 따라서 이후 학습 순서와 진척도는 특정 프로젝트 기능이 아니라 UE 5.7 엔진 시스템 이해 기준으로 기록한다.
- 프로젝트 문서는 엔진 개념을 떠올리는 예시로만 최소한 사용한다.

## 현재 베이스라인

### 이미 강한 영역

- `GAS` 구조 이해와 실전 적용
- 액션 캐릭터 구현
- 애니메이션 블루프린트/몽타주/레이어드 애니메이션
- 행동 트리 기반 AI 상태 설계
- `UMG + ASC + 입력 분리` 기반 UI 설계
- `GameplayTag`, `DataAsset`, `DataTable` 기반 데이터 드리븐 구조
- 실무용 기술 문서 작성

근거 문서:

- [[언리얼 학습 색인 및 정리]]
- [[GAS Documentation]]
- [[어빌리티 리팩토링]]
- [[캐릭터 윈도우]]
- [[HubTechTreeCoreFramework]]
- [[언리얼 네트워킹]]
- [[Replication]]
- [[RPC]]

### 아직 약한 영역

현재 노트 기준으로 거의 없거나 매우 약한 영역:

- `Networking / Replication / RPC` 실전 적용
- `World Partition / Data Layer / Level Streaming`
- `PCG`
- `Audio / Sound`
- `Online`
- `Packaging / Cook / Build Pipeline`
- `Automation / Test`
- `Niagara` 심화
- `Subsystem / Module / Plugin` 엔진 구조 정리
- `Camera Framework` 심화
- `MassEntity`, `StateTree`, `SmartObject` 같은 UE5 계열 확장 시스템

## 로컬 UE 5.7 설치본에서 보이는 큰 구조

### 엔진 상위 폴더

- `Binaries`: 실행 파일과 플랫폼별 바이너리
- `Build`: 빌드 설정, 버전 정보
- `Config`: 엔진 기본 설정
- `Content`: 엔진 기본 콘텐츠
- `Documentation`: 내장 문서 리소스
- `Plugins`: 기능별 플러그인 집합
- `Programs`: 보조 프로그램
- `Shaders`: 셰이더
- `Source`: 엔진 소스

### Source 상위 범주

- `Runtime`: 실제 게임 런타임 시스템
- `Editor`: 에디터 기능
- `Developer`: 개발 도구성 모듈
- `Programs`: 별도 프로그램
- `ThirdParty`: 외부 라이브러리

### Runtime에서 특히 지금 공부하기 좋은 모듈

- `AIModule`
- `AssetRegistry`
- `GameplayTags`
- `GameplayTasks`
- `NavigationSystem`
- `UMG`
- `Slate`, `SlateCore`
- `MovieScene`, `LevelSequence`
- `Online`
- `AudioMixer`
- `Renderer`
- `TraceLog`
- `MassEntity`

### Plugins에서 특히 지금 눈여겨볼 영역

- `EnhancedInput`
- `Cameras`
- `AI`
- `Animation`
- `PCG`
- `Online`
- `NNE`
- `VirtualProduction`
- `Experimental`

## 학습 우선순위

### 1순위: 현재 프로젝트 역량을 한 단계 올리는 영역

#### A. Networking / Replication

왜 필요한가:
- 현재 GAS 학습은 좋지만, GAS의 강점은 결국 멀티플레이/복제 맥락에서 더 크게 드러난다.
- 실전 프로젝트가 커질수록 `Authority`, `RPC`, `Prediction`, `Replication`, `Owner/Avatar`, `NetUpdateFrequency` 이해가 필요하다.

로컬 엔진 시작점:
- `Engine\Source\Runtime\Engine`
- `Engine\Source\Runtime\Net`
- `Engine\Source\Runtime\Networking`
- `Engine\Source\Runtime\NetworkReplayStreaming`

현재 상태: `[~]`

#### B. Build / Cook / Packaging

왜 필요한가:
- 구현을 많이 했더라도 배포 파이프라인이 약하면 프로젝트 운영력이 낮아진다.
- 현재 노트에는 빌드 관련 흔적이 있지만 체계적인 `Cook`, `Packaging`, `Build Config`, `Crash`, `Pipeline Cache` 정리는 부족하다.

로컬 엔진 시작점:
- `Engine\Build`
- `Engine\Programs`
- `Engine\Source\Developer`

현재 상태: `[ ]`

#### C. Subsystem / Module / Plugin 구조

왜 필요한가:
- 현재는 기능 구현은 잘하지만 시스템 경계를 엔진 친화적으로 자르는 공부가 더 필요하다.
- 실무 문서화 능력이 있으므로 이 영역을 배우면 설계 수준이 한 단계 올라간다.

로컬 엔진 시작점:
- `Engine\Source\Runtime\DeveloperSettings`
- `Engine\Plugins`
- 기존 노트의 `Asset Manager`, `HubTechTreeCoreFramework`

현재 상태: `[ ]`

### 2순위: UE5 계열에서 꼭 알아둘 확장 시스템

#### D. World Partition / Data Layer / Level Streaming

왜 필요한가:
- 현재 노트는 캐릭터/전투 중심이다.
- 맵 규모가 커지면 월드 관리가 병목이 된다.

로컬 엔진 시작점:
- `Engine\Source\Runtime\Engine`
- `Engine\Source\Editor\LevelEditor`
- `Engine\Source\Editor\DataLayerEditor`

현재 상태: `[ ]`

#### E. PCG

왜 필요한가:
- UE5 이후 월드 제작과 반복 배치 자동화에서 매우 중요하다.
- 현재 노트에는 거의 흔적이 없다.

로컬 엔진 시작점:
- `Engine\Plugins\PCG`

현재 상태: `[ ]`

#### F. Camera Framework

왜 필요한가:
- 현재는 카메라 쉐이크와 락온 수준의 구현은 있지만, 카메라 자체를 시스템으로 보는 정리는 약하다.
- 액션 게임에서는 카메라가 조작감의 핵심이다.

로컬 엔진 시작점:
- `Engine\Plugins\Cameras`
- `Engine\Source\Runtime\CinematicCamera`

현재 상태: `[ ]`

### 3순위: 품질과 운영을 올리는 영역

#### G. Audio / Sound

왜 필요한가:
- 현재 프로젝트 문서 대부분은 시각/행동 중심이다.
- 사운드는 피드백 품질을 크게 좌우하지만 학습 흔적이 적다.

로컬 엔진 시작점:
- `Engine\Source\Runtime\AudioMixer`
- `Engine\Source\Runtime\SignalProcessing`
- `Engine\Plugins\AudioGameplay`

현재 상태: `[ ]`

#### H. Niagara / Material 심화

왜 필요한가:
- 디졸브, 히트 이펙트, 머티리얼 단서는 있지만 전체 VFX 파이프라인 관점은 약하다.
- 액션 게임 완성도를 올리는 데 중요하다.

로컬 엔진 시작점:
- `Engine\Plugins\FX`
- `Engine\Source\Runtime\Renderer`

현재 상태: `[~]`

#### I. Automation / Test

왜 필요한가:
- 기능 수가 많아질수록 회귀가 생긴다.
- 지금 구조에서는 테스트 자동화가 붙으면 유지보수 효율이 크게 오른다.

로컬 엔진 시작점:
- `Engine\Source\Runtime\AutomationTest`
- `Engine\Source\Runtime\AutomationWorker`
- `Engine\Source\Editor\Documentation`

현재 상태: `[ ]`

## 권장 학습 순서

1. `Networking / Replication`
2. `Build / Cook / Packaging`
3. `Subsystem / Module / Plugin`
4. `World Partition / Data Layer / Level Streaming`
5. `Camera Framework`
6. `PCG`
7. `Niagara / Material`
8. `Audio / Sound`
9. `Automation / Test`
10. `MassEntity / StateTree / SmartObject`

## 주제별 진행도 보드

| 상태 | 주제 | 현재 판단 | 다음 액션 | 완료 기준 |
| --- | --- | --- | --- | --- |
| `[x]` | GAS 기초 | 이론/실전 둘 다 강함 | 기존 문서 유지보수 | ASC/GA/GE/GC/AT를 프로젝트에 독립적으로 적용 가능 |
| `[x]` | 액션 캐릭터 구현 | 매우 강함 | 문서 체계화 | 이동/전투/피격/타겟팅/레벨업 구조를 설명 가능 |
| `[~]` | 애니메이션 최적화 | 개념 좋음, 운영 심화 필요 | URO/Anim Budget/Thread Safe 사례 추가 정리 | 프로젝트 기준 최적화 규칙을 스스로 정리 가능 |
| `[x]` | 행동 트리 | BT/Blackboard/AIController/Debugger 런타임 흐름 정리 완료 | 기존 문서 유지보수, EQS/Perception은 별도 주제로 분리 | BT + Blackboard + AIController 런타임 흐름 설명 가능 |
| `[~]` | AI Perception | 핵심 런타임 흐름 정리 완료, EQS 연결까지 확보 | Stimulus -> Perception -> EQS/Blackboard 연결 유지보수 | Perception 입력이 BT/EQS로 어떻게 이어지는지 설명 가능 |
| `[~]` | EQS | 핵심 런타임 구조 정리 완료, Navigation 실행 계층까지 연결 | QueryFilter/Context/Navigation 연계 유지보수 | Query Request -> Manager -> Instance -> Result 흐름과 이동 계층 연결 설명 가능 |
| `[~]` | Navigation / PathFollowing | 핵심 MoveTo 런타임 흐름 정리 완료, Area/Filter/Recast/Crowd/NavLink 계층까지 연결 | Networking 권한/소유/연결, Navigation Invoker/active tiles 유지보수 | MoveTo -> FindPath -> RequestMove -> FollowPathSegment 흐름 설명 가능 |
| `[~]` | Custom Navigation Areas / Query Filters | area cost / exclude / meta filter 구조 정리 완료, Crowd 계층 연결 완료 | AreaFlags, meta filter, querier별 필터 선택 유지보수 | NavArea -> QueryFilter -> FindPath 흐름 설명 가능 |
| `[~]` | Custom Recast / Navigation Data | `ANavigationData`, `ARecastNavMesh`, `FRecastNavMeshGenerator`, dirty area/tile rebuild 흐름 정리 완료 | Navigation Invoker/active tiles, Networking 권한/소유/연결 | NavData -> Generator -> DirtyArea -> DirtyTile -> Query 흐름 설명 가능 |
| `[~]` | CrowdFollowing / RVO / Avoidance | Detour Crowd와 CharacterMovement RVO 분리 구조 및 런타임 흐름 정리 완료 | Navigation Invoker/active tiles, crowd tuning/debug 유지보수 | CrowdFollowing과 RVO의 계산 주체와 갱신 경로 차이를 설명 가능 |
| `[~]` | NavLink / Smart Link | simple link / smart link / custom move 전환 구조 정리 완료 | custom reach condition, broadcasting, runtime rebuild 상황 유지보수 | PathFollowing -> StartUsingCustomLink -> ResumePathFollowing 흐름 설명 가능 |
| `[~]` | UI 구조/최적화 | 강한 편 | Common UI/입력 계층/Slate 심화 | UI 구조와 성능 문제를 분리해서 설명 가능 |
| `[~]` | Networking / Replication | 기본 개념은 `언리얼 네트워킹` 허브로 통합했고, `Replication`과 `RPC`는 내부 경로까지 포함한 단일 문서로 재정리 완료 | Iris/ReplicationGraph, Subsystem/Module/Plugin | GAS/Character/UI의 네트워크 동작 차이를 엔진 문맥으로 설명 가능 |
| `[~]` | Fast Array / Component / Subobject | `FastArraySerializer.h`, `ActorComponent.h/.cpp`, `Actor.h`, `ActorReplication.cpp`, `DataChannel.cpp` 기준 dirty/delta/component/subobject 흐름 정리 완료 | CharacterMovement/Prediction, Iris/ReplicationGraph | Fast Array와 registered subobject list를 일반 property replication과 구분해서 설명 가능 |
| `[~]` | CharacterMovement / Prediction | `Character.cpp`, `CharacterMovementComponent.cpp`, `FSavedMove_Character`, `FNetworkPredictionData_Client/Server_Character` 기준 prediction/correction/smoothing 흐름 정리 완료 | Iris/ReplicationGraph, custom movement prediction 심화 | 소유 클라이언트 예측과 simulated proxy smoothing 경로를 분리해서 설명 가능 |
| `[ ]` | Build / Cook / Packaging | 약함 | 빌드 타입, Cook, Packaging, Crash 대응 문서화 | 개발/테스트/배포 파이프라인을 스스로 운영 가능 |
| `[ ]` | Subsystem / Module / Plugin | 약함 | 엔진 구조 문서 작성 | 기능을 적절한 계층에 배치할 수 있음 |
| `[ ]` | World Partition / Data Layer | 거의 없음 | 개념 + 실습 문서 작성 | 대규모 맵 관리 흐름 설명 가능 |
| `[ ]` | PCG | 없음 | 플러그인 구조 확인 + 샘플 실습 | PCG 그래프와 사용처 설명 가능 |
| `[ ]` | Camera Framework | 약함 | Cameras 플러그인 조사 | 액션 게임 카메라 시스템 설계 가능 |
| `[ ]` | Audio / Sound | 거의 없음 | Audio Mixer / Sound Cue 정리 | 피드백 구조를 시각과 함께 설계 가능 |
| `[~]` | Niagara / Material | 일부 기능 위주로 학습 | 히트/VFX 파이프라인 문서화 | 전투 VFX를 시스템 관점에서 정리 가능 |
| `[ ]` | Automation / Test | 없음 | 테스트 유형과 자동화 진입점 정리 | 회귀 테스트 전략을 세울 수 있음 |

## 가장 먼저 보강할 기존 문서

아래 문서는 파일은 있으나 내용이 거의 없거나 아직 얕다.

- [모션 워핑(Motion Warping)](</C:/Users/DAMO/Documents/Obsidian/언리얼/학습/애니메이션(Animation)/모션 워핑(Motion Warping).md>)
- [프로젝트/ProjectKY/캐릭터/모션 매칭.md](</C:/Users/DAMO/Documents/Obsidian/언리얼/프로젝트/ProjectKY/캐릭터/모션 매칭.md>)
- [프로젝트/ProjectKY/캐릭터/벽잡기.md](</C:/Users/DAMO/Documents/Obsidian/언리얼/프로젝트/ProjectKY/캐릭터/벽잡기.md>)
- [프로젝트/ProjectKY/스프린트.md](</C:/Users/DAMO/Documents/Obsidian/언리얼/프로젝트/ProjectKY/스프린트.md>)

## 네트워킹 다음 학습 순서

이번 세션 기준으로는 `프로젝트 적용`보다 `엔진 내부 구조`를 먼저 본다.

1. 완료: 기본 개념은 `언리얼 네트워킹` 허브로 통합했다.
핵심 파일:
- `Engine\Source\Runtime\Engine\Classes\GameFramework\Actor.h`
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
- `Engine\Source\Runtime\Engine\Private\PlayerController.cpp`
- `Engine\Source\Runtime\Engine\Private\Pawn.cpp`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\NetDriver.cpp`
- `Engine\Source\Runtime\Engine\Private\DataChannel.cpp`
- `Engine\Source\Runtime\Engine\Private\NetworkObjectList.cpp`

현재 결과:
- `HasAuthority`, `GetNetOwner`, `GetNetOwningPlayer`, `GetNetConnection`, `UpdateOwningNetConnection` 관계를 허브 문서에서 바로 설명 가능
- `IsNetRelevantFor`, `GetNetPriority`, `NetUpdateFrequency`, `Dormancy`를 별도 기본 문서 없이 허브 문서에서 바로 따라갈 수 있음

2. 완료: `Replication` 문서에 등록 -> 필터링 -> 수신 -> `RepNotify` 흐름을 통합했다.
핵심 파일:
- `Engine\Source\Runtime\Engine\Public\Net\UnrealNetwork.h`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\RepLayout.cpp`

현재 결과:
- `GetLifetimeReplicatedProps` -> `FRepLayout` -> `ReceiveProperties` -> `CallRepNotifies` 흐름 설명 가능
- property registration 문제와 전송 조건 문제를 구분해서 설명 가능

3. 완료: `RPC` 문서에 callspace -> 전송 -> 수신 경로를 통합했다.
핵심 파일:
- `Engine\Source\Runtime\CoreUObject\Public\UObject\Script.h`
- `Engine\Source\Runtime\CoreUObject\Private\UObject\ScriptCore.cpp`
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
- `Engine\Source\Runtime\Engine\Private\NetDriver.cpp`
- `Engine\Source\Runtime\Engine\Private\DataReplication.cpp`

현재 결과:
- `GetFunctionCallspace` -> `CallRemoteFunction` -> `ProcessRemoteFunction` -> `ReceivedRPC` -> `ProcessEvent` 흐름 설명 가능
- `Server / Client / NetMulticast` 규칙과 엔진 내부 callspace 분기를 한 문서에서 같이 볼 수 있음

4. 별도 심화: `Fast Array / Component / Subobject`, `CharacterMovement / Prediction`은 독립 문서로 유지한다.
핵심 파일:
- `Engine\Source\Runtime\Net\Core\Classes\Net\Serialization\FastArraySerializer.h`
- `Engine\Source\Runtime\Engine\Classes\Components\ActorComponent.h`
- `Engine\Source\Runtime\Engine\Private\Components\ActorComponent.cpp`
- `Engine\Source\Runtime\Engine\Classes\GameFramework\Character.h`
- `Engine\Source\Runtime\Engine\Private\Character.cpp`
- `Engine\Source\Runtime\Engine\Private\Components\CharacterMovementComponent.cpp`

현재 결과:
- Fast Array dirty/delta/callback 흐름과 registered subobject list를 일반 property replication과 구분해서 설명 가능
- `CharacterMovement`의 prediction/correction/smoothing을 일반 actor 이동 복제와 분리해서 설명 가능

5. 다음 1순위: `Iris / Replication Graph`
핵심 파일:
- `Engine\Source\Runtime\IrisCore`
- `Engine\Source\Runtime\Experimental\Iris`
- `Engine\Plugins\Runtime\ReplicationGraph`

다음 목표:
- classic replication path와 Iris path가 어디서 갈라지는지 정리
- replication graph가 relevancy/scheduling 문제를 어떻게 구조적으로 바꾸는지 정리
- 현재 정리된 `Replication`, `RPC`, `Fast Array`, `CharacterMovement` 문서와 연결점 만들기

## 다음 학습 세션 템플릿

### 오늘 공부한 것

- 날짜:
- 주제:
- 참고한 문서:
- 엔진 경로/모듈:
- 직접 실습한 내용:

### 이해한 것

- 

### 아직 애매한 것

- 

### 다음에 이어서 할 것

- 

## 주간 회고 로그

| 날짜 | 공부 주제 | 이해한 핵심 | 아직 막히는 점 | 다음 액션 |
| --- | --- | --- | --- | --- |
| 2026-04-12 | 베이스라인 정리 | 현재 강점은 GAS/액션/AI/UI | 엔진 운영 계층, 네트워크, 빌드 파이프라인 | 1순위부터 문서 생성 |
| 2026-04-13 | 행동 트리 문서 재정리 | Behavior Tree/Composite/Decorator/Service/Task를 엔진 코드 기준으로 재작성 | Blackboard, AIController, 디버거 축은 추가 보강 필요 | 다음 배치는 BT-Blackboard 연결 또는 엔진 운영 계층 |
| 2026-04-13 | Blackboard/Debugger 문서 추가 | Blackboard, AIController/BrainComponent, BT Debugger 문서 작성 | Behavior Tree 주제는 핵심 런타임 흐름 정리 완료 | 다음 배치는 EQS/Perception 또는 Networking 엔진 구조 |
| 2026-04-13 | AI Perception 문서 추가 | AIPerceptionSystem, AIPerceptionComponent, UAISense, FAIStimulus, StimuliSource 흐름 정리 | EQS, Navigation, Blackboard 연계 심화 필요 | 다음 배치는 EQS 또는 Navigation / PathFollowing |
| 2026-04-13 | EQS 문서 추가 | UEnvQuery, FEnvQueryRequest, UEnvQueryManager, FEnvQueryInstance, UBTTask_RunEQSQuery 흐름 정리 | Navigation / PathFollowing, NavSystem 연계는 아직 비어 있음 | 다음 배치는 Navigation / PathFollowing 또는 이동 실행 계층 |
| 2026-04-13 | Navigation / PathFollowing 문서 추가 | UNavigationSystemV1, FAIMoveRequest, AAIController::MoveTo, UPathFollowingComponent 흐름 정리 | QueryFilter, NavLink, CrowdFollowing, Avoidance는 아직 비어 있음 | 다음 배치는 Custom Navigation Areas / Query Filters 또는 CrowdFollowing |
| 2026-04-13 | Custom Navigation Areas / Query Filters 문서 추가 | UNavArea, FNavigationFilterArea, UNavigationQueryFilter, GetQueryFilter(), InitializeFilter() 흐름 정리 | CrowdFollowing, Avoidance, NavLink, meta area agent 분기 심화는 아직 비어 있음 | 다음 배치는 CrowdFollowing / RVO / Avoidance 또는 NavLink |
| 2026-04-13 | CrowdFollowing / RVO / Avoidance 문서 추가 | ADetourCrowdAIController, UCrowdFollowingComponent, UCrowdManager, UCharacterMovementComponent, UAvoidanceManager 흐름 정리 | NavLink / Smart Link, Custom Recast, crowd tuning/debug 실전 감각은 아직 비어 있음 | 다음 배치는 NavLink / Smart Link 또는 네트워킹 권한/소유/연결 |
| 2026-04-13 | NavLink / Smart Link 문서 추가 | INavLinkCustomInterface, UNavLinkCustomComponent, ANavLinkProxy, StartUsingCustomLink, ResumePathFollowing 흐름 정리 | Custom Recast, custom reach condition 운영 규칙, 브로드캐스트 실전 사용은 아직 비어 있음 | 다음 배치는 Custom Recast / Navigation Data 또는 네트워킹 권한/소유/연결 |
| 2026-04-13 | Custom Recast / Navigation Data 문서 추가 | ANavigationData, ARecastNavMesh, FRecastNavMeshGenerator, dirty area/tile rebuild 흐름 정리 | Navigation Invoker/active tiles, World Partition nav, Networking 권한/소유/연결은 아직 비어 있음 | 다음 배치는 Networking 권한/소유/연결 또는 Subsystem / Module / Plugin |
| 2026-04-13 | Authority / Ownership / Connection 문서 추가 | HasAuthority, GetNetOwner, GetNetOwningPlayer, GetNetConnection, UpdateOwningNetConnection, GetFunctionCallspace 구조 정리 | Replication 등록/필터링/수신 후처리, RPC 전송 경로, relevancy/dormancy는 아직 비어 있음 | 다음 배치는 Replication 등록 -> 필터링 -> 수신 후처리 또는 RPC callspace/전송 경로 |
| 2026-04-13 | Replication Registration / Filtering / PostReceive 문서 추가 | GetLifetimeReplicatedProps, DOREPLIFETIME, FDoRepLifetimeParams, FRepLayout::InitFromClass, RebuildConditionalProperties, ReceiveProperties, CallRepNotifies 흐름 정리 | RPC callspace/전송 경로, relevancy/dormancy, FastArray/subobject 심화는 아직 비어 있음 | 다음 배치는 RPC callspace/전송 경로 또는 Relevancy/Priority/Frequency/Dormancy |
| 2026-04-13 | RPC Callspace / Transmission Path 문서 추가 | FunctionCallspace::Type, UObject::CallFunction, AActor::GetFunctionCallspace, CallRemoteFunction, UNetDriver::ProcessRemoteFunction, FObjectReplicator::ReceivedRPC 흐름 정리 | Relevancy/Priority/Frequency/Dormancy, FastArray/Component/Subobject, CharacterMovement prediction은 아직 비어 있음 | 다음 배치는 Relevancy/Priority/Frequency/Dormancy 또는 Fast Array / Component / Subobject |
| 2026-04-13 | Relevancy / Priority / Frequency / Dormancy 문서 추가 | AActor::IsNetRelevantFor, AActor::GetNetPriority, NetUpdateFrequency, ShouldActorGoDormant, UActorChannel::BecomeDormant, FNetworkObjectList::MarkDormant 흐름 정리 | FastArray/Component/Subobject, CharacterMovement prediction, Iris/ReplicationGraph는 아직 비어 있음 | 다음 배치는 Fast Array / Component / Subobject 또는 CharacterMovement / Prediction |
| 2026-04-13 | Fast Array / Component / Subobject 문서 추가 | FFastArraySerializerItem, MarkItemDirty, FastArrayDeltaSerialize_DeltaSerializeStructs, UActorComponent::SetIsReplicated, AddReplicatedSubObject, ReplicateRegisteredSubObjects 흐름 정리 | CharacterMovement prediction, Iris/ReplicationGraph, subobject delete/tearoff 운영 규칙은 아직 비어 있음 | 다음 배치는 CharacterMovement / Prediction 또는 Iris / Replication Graph |
| 2026-04-13 | CharacterMovement / Prediction 문서 추가 | ControlledCharacterMove, ReplicateMoveToServer, FSavedMove_Character, ServerMove_HandleMoveData, ClientAdjustPosition, ClientUpdatePositionAfterServerUpdate, SmoothCorrection 흐름 정리 | Iris/ReplicationGraph, custom movement prediction, root motion 심화는 아직 비어 있음 | 다음 배치는 Iris / Replication Graph 또는 Subsystem / Module / Plugin |
| 2026-04-13 | 네트워킹 문서 통합 정리 | 기본 개념은 `언리얼 네트워킹` 허브로 흡수하고, `Replication`과 `RPC`는 내부 경로까지 포함한 단일 문서로 병합 | Iris/ReplicationGraph, custom movement/root motion 심화는 아직 비어 있음 | 다음 배치는 Iris / Replication Graph |

## 나중에 이 파일을 다시 보여줄 때 같이 말하면 좋은 문장

아래 문장을 그대로 써도 된다.

```text
이 파일 기준으로 내 현재 UE5.7 학습 상태를 이어서 정리해줘.
이번에 공부한 주제는 [주제]이고, 특히 [막힌 부분]이 헷갈린다.
기존 노트와 엔진 구조를 같이 보면서 다음 공부 순서를 제안해줘.
```

## 다음 액션 제안

가장 먼저 할 일은 아래 셋 중 하나다.

1. Iris / Replication Graph 계층으로 내려간다.
2. Subsystem / Module / Plugin으로 엔진 구조 계층을 보강한다.
3. Build / Cook / Packaging으로 엔진 운영 계층을 보강한다.

개인적으로는 현재 흐름상 1 -> 2 -> 3 순서를 권장한다.

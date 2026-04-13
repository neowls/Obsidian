[Navigation System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-system-in-unreal-engine) | [UCrowdFollowingComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Navigation/UCrowdFollowingComponent) | [UCharacterMovementComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/GameFramework/UCharacterMovementComponent) | [UAvoidanceManager::GetAvoidanceVelocityForComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/AI/Navigation/UAvoidanceManager/GetAvoidanceVelo-/1)

## 개요
**CrowdFollowing과 RVO 회피(CrowdFollowing / RVO Avoidance)** 는 다중 에이전트가 서로를 피하면서 이동할 때 쓰이는 런타임 계층입니다.
겉으로 보면 둘 다 "회피"처럼 보이지만, 엔진 코드 기준으로는 계산 주체와 갱신 경로가 완전히 다릅니다.

| 시스템 | 핵심 클래스 | 계산 주체 | 성격 |
| --- | --- | --- | --- |
| CrowdFollowing | `UCrowdFollowingComponent`, `UCrowdManager` | `AIModule`의 Detour Crowd 파이프라인 | 경로 corridor와 navmesh를 알고 있는 군중 이동 확장 |
| RVO Avoidance | `UCharacterMovementComponent`, `UAvoidanceManager` | `Engine`의 movement 기반 RVO 계산 | 현재 속도를 국소적으로 조정하는 로컬 회피 |

즉 CrowdFollowing은 `PathFollowing`의 확장이고, RVO는 `CharacterMovement`의 확장입니다.
같은 "avoidance"라는 단어로 묶이지만 엔진 내부에서는 서로 다른 층에서 동작합니다.

> [!info]
> `[[네비게이션과 PathFollowing(Navigation)]]` 이 목적지까지의 기본 이동 실행 계층이라면, 이 문서는 여러 AI가 서로 간섭하는 상황에서 그 이동을 어떻게 보정하는지를 다룹니다.
> `[[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]` 가 pathfinding 정책 계층이라면, 이 문서는 pathfinding 이후의 군중 이동과 국소 회피 계층입니다.

## 핵심 구성
| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| Crowd용 path following | `UCrowdFollowingComponent` | `UPathFollowingComponent`를 확장해 Detour Crowd와 연결 |
| Crowd 관리자 | `UCrowdManager` | agent 등록, corridor/steering/avoidance 업데이트, 속도 적용 |
| Crowd 진입용 컨트롤러 | `ADetourCrowdAIController` | 기본 `PathFollowingComponent`를 `UCrowdFollowingComponent`로 교체 |
| RVO 적용 주체 | `UCharacterMovementComponent` | 프레임 중 `CalcAvoidanceVelocity()`로 속도 보정 |
| RVO 관리자 | `UAvoidanceManager` | 회피 대상 등록, cone 기반 회피 속도 계산, 디버그/토글 제공 |
| 공통 인터페이스 | `IRVOAvoidanceInterface` | RVO 그룹, UID, 반경, 속도 같은 회피 데이터 제공 |

## CrowdFollowing 진입점
`ADetourCrowdAIController` 생성자를 보면 아래 한 줄이 핵심입니다.

```cpp
Super(ObjectInitializer.SetDefaultSubobjectClass<UCrowdFollowingComponent>(TEXT("PathFollowingComponent")))
```

즉 CrowdFollowing은 별도의 독립 시스템이 아니라, `AAIController`가 쓰는 기본 path following 컴포넌트를 `UCrowdFollowingComponent`로 바꿔 끼우는 방식으로 진입합니다.
이 지점 때문에 CrowdFollowing은 처음부터 `MoveTo`, path corridor, custom link 흐름과 강하게 결합됩니다.

## CrowdFollowing 런타임 흐름
엔진 코드 기준으로 CrowdFollowing은 대략 아래 순서로 움직입니다.

1. `AAIController::MoveTo()`가 path request를 만든다.
2. controller의 path following이 `UCrowdFollowingComponent`라면 crowd 경로로 들어간다.
3. `Initialize()`에서 `RegisterCrowdAgent()`를 시도하고, 필요하면 `OnNavigationInitDone`까지 대기한다.
4. `OnPathfindingQuery()`가 crowd simulation 중이면 `SkipStringPulling` 플래그를 켠다.
5. `SetMoveSegment()`가 일반 path point 대신 `FNavMeshPath::PathCorridor`를 기준으로 현재 path part를 잡는다.
6. `UCrowdManager::Tick()`가 agent 위치/속도, corridor, steering, avoidance, smart link 상태를 업데이트한다.
7. `UCrowdManager::ApplyVelocity()`가 계산된 속도를 `UCrowdFollowingComponent::ApplyCrowdAgentVelocity()`로 넘긴다.
8. `ApplyCrowdAgentVelocity()`가 movement component에 `RequestPathMove()` 또는 `RequestDirectMove()`를 보낸다.
9. 이동 완료 시 `OnPathFinished()`가 `UCrowdManager::ClearAgentMoveTarget()`을 호출해 타깃을 정리한다.

> [!tip]
> CrowdFollowing은 일반 `PathPoints` 중심 추종이 아닙니다. crowd simulation이 켜져 있으면 `OnPathfindingQuery()`에서 string pulling을 끄고, `SetMoveSegment()`도 `PathCorridor`를 기준으로 path part를 자릅니다.

## `UCrowdFollowingComponent`에서 중요한 지점
### 1. Crowd simulation state
헤더에는 `ECrowdSimulationState::Enabled`, `ObstacleOnly`, `Disabled` 세 가지 상태가 있습니다.
`SetCrowdSimulationState()`는 `Idle` 상태에서만 성공하며, 상태 변화에 따라 `UCrowdManager::RegisterAgent()` 또는 `UnregisterAgent()`를 호출합니다.

### 2. 기본 동작 플래그
생성자 기준으로 눈에 띄는 기본값은 다음과 같습니다.

| 항목 | 기본 경향 |
| --- | --- |
| `bEnableObstacleAvoidance` | 켜짐 |
| `bEnableSeparation` | 꺼짐 |
| `bAffectFallingVelocity` | 꺼짐 |

즉 기본 crowd는 장애물 회피는 적극 사용하지만, separation과 낙하 중 속도 반영은 보수적으로 시작합니다.

### 3. `SetMoveSegment()`는 Recast/NavMeshPath 전제다
`SetMoveSegment()`는 crowd simulation이 켜져 있으면 `FNavMeshPath`와 `ARecastNavMesh`를 강하게 기대합니다.
또한 path corridor를 길게 한 번에 쓰지 않고, 기본적으로 `15` 폴리 단위의 path part로 잘라 처리합니다.
이건 코드 주석대로 local minimum 문제와 crowd 최적화 충돌을 줄이기 위한 구조입니다.

### 4. `ApplyCrowdAgentVelocity()`는 movement component 모드에 맞춰 호출한다
`UseAccelerationForPathFollowing()`이면 `RequestPathMove()`를, 아니면 `RequestDirectMove()`를 호출합니다.
즉 crowd 결과는 결국 movement component의 입력 형식에 맞게 다시 번역됩니다.

### 5. Smart Link와 moving goal까지 관여한다
`FinishUsingCustomLink()`, `OnNavNodeChanged()`, `ShouldTrackMovingGoal()` 같은 override 때문에 CrowdFollowing은 단순 회피기가 아니라 nav link와 moving goal을 포함한 path following 확장입니다.

## `UCrowdManager`에서 중요한 지점
### 1. 실제 계산 주체는 `UCrowdManager`
`UCrowdFollowingComponent`가 직접 모든 회피를 계산하는 게 아니라, `UCrowdManager`에 agent를 등록하고 tick 결과를 받아옵니다.
중요 멤버는 다음과 같습니다.

| 항목 | 의미 |
| --- | --- |
| `MaxAgents` | 기본 최대 agent 수 (`50`) |
| `MaxAgentRadius` | 기본 agent 반경 상한 (`100.0f`) |
| `AvoidanceConfig` | Low/Medium/Good/High 품질별 샘플링 설정 |
| `bResolveCollisions` | 최종 위치 보정까지 할지 여부 |

### 2. Tick 파이프라인이 분리돼 있다
`UCrowdManager::Tick()`는 한 덩어리 계산이 아니라 아래 단계로 나뉩니다.

1. `PrepareAgentStep()`로 현재 위치/속도/max speed 반영
2. `updateStepCorridor()`
3. `updateStepPaths()`
4. `updateStepProximityData()`
5. `updateStepNextMovePoint()`
6. `updateStepSteering()`
7. `updateStepAvoidance()`
8. 필요 시 `updateStepMove()`
9. `UpdateAgentPaths()`로 smart link/poly 변경 반영
10. `ApplyVelocity()`로 결과를 각 crowd component에 전달

즉 crowd는 "회피만 하는 시스템"이 아니라 corridor, steering, avoidance, nav link를 하나의 프레임 파이프라인으로 묶은 구조입니다.

### 3. Smart Link도 crowd tick 안에서 연결된다
`UpdateAgentPaths()`는 off-mesh animation 상태를 보고 `StartUsingCustomLink()`를 호출합니다.
즉 crowd 이동은 Smart Link와도 런타임 레벨에서 직접 연결됩니다.

### 4. 디버그 훅이 이미 풍부하다
코드상에서 `ai.crowd.DrawDebugCorners`, `ai.crowd.DrawDebugPath`, `ai.crowd.DrawDebugVelocityObstacles`, `ai.crowd.DrawDebugNeighbors`, `ai.crowd.DrawDebugBoundaries` 같은 CVar를 볼 수 있습니다.
Selected Actor 기준으로 corner/path/velocity obstacle/neighbors를 그리도록 준비돼 있습니다.

## RVO Avoidance 런타임 흐름
RVO는 CrowdFollowing과 달리 `UCharacterMovementComponent` 안에서 돌고, entry point도 다릅니다.

1. `OnRegister()`에서 `NM_Client`이면 `bUseRVOAvoidance`를 끈다.
2. `SetUpdatedComponent()` 또는 `SetAvoidanceEnabled()`가 `UAvoidanceManager::RegisterMovementComponent()`로 자신을 등록한다.
3. movement tick 중 `bUseRVOAvoidance`면 `CalcAvoidanceVelocity()`가 호출된다.
4. 이 함수는 `ROLE_Authority`가 아니면 바로 리턴한다.
5. 조건이 맞으면 `UAvoidanceManager::GetAvoidanceVelocityForComponent(this)`로 새 속도를 질의한다.
6. 속도가 바뀌면 avoidance lock을 걸고, 아니면 clean lock을 건다.
7. 마지막에 `AvoidanceManager->UpdateRVO(this)`로 현재 프레임 결과를 다시 매니저에 반영한다.
8. 이번 프레임에 avoidance 계산이 없었으면 `UpdateDefaultAvoidance()`가 최소 갱신만 수행한다.

> [!caution]
> RVO 쪽은 코드에 authority 가드가 분명합니다. `OnRegister()`에서 클라이언트는 비활성화되고, `CalcAvoidanceVelocity()`도 `GetLocalRole() != ROLE_Authority`면 바로 반환합니다.

## `UCharacterMovementComponent::CalcAvoidanceVelocity()`에서 중요한 지점
### 1. 항상 도는 게 아니다
아래 조건이 맞아야 실제 계산이 일어납니다.

- `bUseRVOAvoidance == true`
- `AvoidanceWeight < 1.0f`
- `GetWorld()->GetAvoidanceManager()`가 존재
- `ROLE_Authority`
- `Velocity`가 0이 아님
- `IsMovingOnGround()`
- 캡슐 컴포넌트가 존재

즉 RVO는 "캐릭터가 움직이기만 하면 자동"이 아니라, 권한/이동 모드/속도 조건이 모두 맞아야 개입합니다.

### 2. 계산 결과는 속도 보정이다
RVO는 path corridor를 다시 만들지 않습니다.
`NewVelocity = AvoidanceManager->GetAvoidanceVelocityForComponent(this)` 결과를 받아 현재 velocity를 수정하는 쪽입니다.
따라서 path planning보다 local steering 성격이 훨씬 강합니다.

### 3. lock 시간이 중요하다
속도가 바뀐 경우 `LockTimeAfterAvoid`, 바뀌지 않은 경우 `LockTimeAfterClean`을 사용합니다.
코드 주석 기준으로 이 lock은 이번 프레임의 회피 선택을 잠깐 유지해 다른 객체가 자신을 VO로 취급하도록 돕습니다.

## `UAvoidanceManager`에서 중요한 지점
### 1. 등록 시 UID와 가중치를 부여한다
`RegisterMovementComponent()`는 새 `AvoidanceUID`를 만들고, `SetRVOAvoidanceUID()`와 `SetRVOAvoidanceWeight()`를 호출한 뒤 바로 `UpdateRVO_Internal()`로 초기 데이터를 넣습니다.
즉 등록만 해도 매니저 내부의 avoidance object 테이블에 참여합니다.

### 2. `GetAvoidanceVelocity_Internal()`가 실제 계산 중심이다
이 함수는 현재 객체와 다른 `AvoidanceObjects`를 순회하면서 fast reject를 하고, cone 기반으로 안전한 속도 후보를 계산합니다.
중요 필터는 다음과 같습니다.

- 만료된 object 제외
- group mask 기준 무시 대상 제외
- test radius 바깥 object 제외
- 너무 느린 경우 원래 속도 유지

즉 RVO는 navmesh corridor보다 "현재 프레임에서 누가 내 앞을 막는가"에 더 가깝습니다.

### 3. 상태 갱신과 계산이 분리돼 있다
`GetAvoidanceVelocityForComponent()`는 속도를 계산하고, `UpdateRVO()`는 현재 프레임의 위치/속도/반경 데이터를 테이블에 갱신합니다.
이 분리 때문에 디버깅할 때는 "새 속도를 계산한 시점"과 "manager에 자신을 다시 등록한 시점"을 따로 봐야 합니다.

### 4. 디버그와 토글 명령이 있다
`Exec_Dev()`를 보면 `AvoidanceDisplayAll`, `AvoidanceSystemToggle` 명령을 처리합니다.
즉 RVO도 crowd와 마찬가지로 엔진 내부에 기본 디버그 진입점이 이미 있습니다.

## CrowdFollowing과 RVO를 어떻게 구분해서 봐야 하는가
### 1. CrowdFollowing은 path-aware, RVO는 velocity-aware다
CrowdFollowing은 `PathCorridor`, smart link, nav poly 전환을 알고 있습니다.
RVO는 현재 속도와 주변 회피 객체를 기준으로 local velocity만 보정합니다.

### 2. CrowdFollowing은 `AIModule`, RVO는 `Engine`에 있다
이건 단순 모듈 차이가 아니라 설계 차이입니다.
CrowdFollowing은 AI path following 확장이고, RVO는 movement 계층 확장입니다.

### 3. CrowdFollowing은 Recast 의존성이 강하다
`SetMoveSegment()`와 `UCrowdManager` 코드를 보면 `FNavMeshPath`, `ARecastNavMesh`, `dtCrowd` 전제가 강합니다.
따라서 crowd는 navmesh/Recast 중심 시스템으로 보는 편이 정확합니다.

### 4. RVO는 authority-only 제약이 명확하다
이건 엔진 코드에서 바로 드러납니다.
멀티플레이에서 RVO 동작을 이해할 때는 pathfinding보다 먼저 authority 제약을 확인해야 합니다.

### 5. 둘은 같은 단어를 쓰지만 같은 시스템이 아니다
같은 캐릭터에 둘을 동시에 연결할 수는 있어도, 엔진은 둘을 하나의 통합 파이프라인으로 계산하지 않습니다.
이 문장은 코드 구조를 바탕으로 한 실무적 해석입니다.
즉 둘을 섞을 때는 "내 주 시스템이 Crowd인지 RVO인지"를 먼저 정해 두는 편이 디버깅에 유리합니다.

## Navigation 학습 흐름 안에서의 위치
- `[[네비게이션과 PathFollowing(Navigation)]]`: 이동 실행의 기본 런타임
- `[[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]`: pathfinding 정책 계층
- `[[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]`: 다중 에이전트 회피와 군중 이동 계층
- `[[NavLink와 Smart Link(NavLink Smart Link)]]`: 특수 이동 세그먼트와 custom move 계층
- 다음 단계 후보:
  - `Custom Recast / Navigation Data`
  - `네트워킹 권한/소유/연결`
  - `Subsystem / Module / Plugin`

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\DetourCrowdAIController.h`
- `Engine\Source\Runtime\AIModule\Private\DetourCrowdAIController.cpp`
- `Engine\Source\Runtime\AIModule\Classes\Navigation\CrowdFollowingComponent.h`
- `Engine\Source\Runtime\AIModule\Private\Navigation\CrowdFollowingComponent.cpp`
- `Engine\Source\Runtime\AIModule\Classes\Navigation\CrowdManager.h`
- `Engine\Source\Runtime\AIModule\Private\Navigation\CrowdManager.cpp`
- `Engine\Source\Runtime\Engine\Classes\GameFramework\CharacterMovementComponent.h`
- `Engine\Source\Runtime\Engine\Private\Components\CharacterMovementComponent.cpp`
- `Engine\Source\Runtime\Engine\Classes\AI\Navigation\AvoidanceManager.h`
- `Engine\Source\Runtime\Engine\Private\AI\Navigation\AvoidanceManager.cpp`
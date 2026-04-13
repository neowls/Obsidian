[Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine?application_version=5.6) | [Navigation System in Unreal Engine](https://dev.epicgames.com/documentation/es-es/unreal-engine/navigation-system-in-unreal-engine?application_version=5.6) | [UPathFollowingComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Navigation/UPathFollowingComponent) | [FAIMoveRequest::SetProjectGoalLocation](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/FAIMoveRequest/SetProjectGoalLocation)

## 개요
**네비게이션과 PathFollowing(Navigation / PathFollowing)** 은 AI가 목적지를 실제 경로 탐색과 이동으로 실행하는 계층입니다.
에디터에서는 `NavMesh Bounds Volume`, `RecastNavMesh`, `AI Move To` 정도로 보이지만, 엔진 코드 기준으로는 아래 구조가 핵심입니다.

| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 네비게이션 시스템 | `UNavigationSystemV1` | NavData 선택, 경로 탐색, 위치 투영, 랜덤 포인트 질의 |
| 네비게이션 데이터 | `ANavigationData` 및 구현체 | 실제 pathfinding과 navmesh 질의 수행 |
| 이동 요청 | `FAIMoveRequest` | 목표, acceptance radius, pathfinding, partial path, filter 같은 이동 옵션 묶음 |
| 경로 쿼리 | `FPathFindingQuery` | start, goal, nav data, filter를 포함한 pathfinding 입력 데이터 |
| 경로 추종기 | `UPathFollowingComponent` | 경로 수락, 상태 전이, 세그먼트 이동, 도착 판정, 완료 통지 |
| 이동 진입점 | `AAIController` | `MoveToActor`, `MoveToLocation`, `MoveTo`, `RequestMove` 제공 |

즉 EQS나 블랙보드가 목적지를 선택하는 계층이라면, Navigation / PathFollowing은 그 목적지를 실제 이동 요청으로 바꾸고 끝까지 추종하는 실행 계층입니다.

> [!info]
> `[[환경 쿼리 시스템(EQS)]]` 이 "어디로 갈지"를 고른다면, `네비게이션과 PathFollowing(Navigation)` 은 "그곳까지 어떻게 갈지"를 담당합니다.

## 핵심 구성
### `UNavigationSystemV1`
`UNavigationSystemV1`는 월드의 네비게이션 질의 진입점입니다.
문서보다 엔진 코드에서 먼저 보이는 중요한 역할은 다음과 같습니다.

| 기능 | 의미 |
| --- | --- |
| `FindPathSync()` | path query를 받아 동기 경로 계산 수행 |
| `ProjectPointToNavigation()` | 월드 좌표를 navmesh 위 유효 위치로 투영 |
| `GetRandomReachablePointInRadius()` | 도달 가능한 랜덤 포인트 질의 |
| `GetRandomPointInNavigableRadius()` | navigable 랜덤 포인트 질의 |
| `GetNavDataForProps()` | agent props에 맞는 nav data 선택 |

`FindPathSync()`는 `Query.NavData`가 비어 있으면 agent properties나 default nav data를 기준으로 nav data를 채운 뒤, `FindPath()` 또는 `FindHierarchicalPath()`로 실제 계산을 위임합니다.
즉 navigation system은 pathfinding 알고리즘 자체라기보다, 적절한 nav data를 골라 질의를 전달하는 상위 조정자에 가깝습니다.

### `FAIMoveRequest`
`FAIMoveRequest`는 AI 이동 요청을 담는 얇은 데이터 구조입니다.
핵심은 단순히 목표 위치만 들고 있지 않다는 점입니다.

| 옵션 | 의미 |
| --- | --- |
| `SetUsePathfinding()` | navmesh를 이용할지, 직선 이동으로 볼지 결정 |
| `SetAllowPartialPath()` | 목표까지 완전 도달 불가해도 부분 경로를 허용할지 |
| `SetProjectGoalLocation()` | 목표를 navigation 위로 투영할지 |
| `SetNavigationFilter()` | query filter 지정 |
| `SetAcceptanceRadius()` | 도착 판정 반경 |
| `SetReachTestIncludesAgentRadius()` | 도착 판정에 agent 반지름 포함 |
| `SetReachTestIncludesGoalRadius()` | 도착 판정에 goal 반지름 포함 |
| `SetCanStrafe()` | 이동 중 strafing 허용 |
| `SetStartFromPreviousPath()` | 기존 경로 끝에서 새 경로를 이어붙일지 |

즉 `FAIMoveRequest`는 "목표 하나"가 아니라, pathfinding과 도착 판정 정책 전체를 포함한 이동 계약입니다.

### `UPathFollowingComponent`
`UPathFollowingComponent`는 실제 경로 추종 런타임입니다.
`AAIController`는 요청을 만들지만, 실제 상태 전이와 경로 소비는 이 컴포넌트가 담당합니다.

| 상태/결과 | 의미 |
| --- | --- |
| `EPathFollowingStatus::Idle` | 현재 요청 없음 |
| `Waiting` | 경로가 아직 완전히 준비되지 않음 |
| `Paused` | 일시 정지 상태 |
| `Moving` | 현재 경로를 추종 중 |
| `EPathFollowingResult::Success` | 목적지 도달 |
| `Blocked` | 이동이 막힘 |
| `OffPath` | 경로 이탈 |
| `Aborted` | 중단됨 |
| `Invalid` | 요청 자체가 유효하지 않음 |

또한 `FPathFollowingResultFlags`에는 `NewRequest`, `ForcedScript`, `AlreadyAtGoal`, `InvalidPath`, `MovementStop` 같은 세부 종료 이유가 별도로 붙습니다.

## 런타임 처리 흐름
엔진 코드 기준으로 AI 이동은 대략 아래 순서로 진행됩니다.

1. `AAIController::MoveToActor()` 또는 `MoveToLocation()` 호출
2. 함수가 `FAIMoveRequest`를 구성하고, 기존 script 이동이 있으면 `AbortMove()`
3. `AAIController::MoveTo(const FAIMoveRequest&)`로 진입
4. 필요 시 `ProjectPointToNavigation()`으로 목표 투영
5. `PathFollowingComponent->HasReached(MoveRequest)`로 즉시 도착 여부 판정
6. 아니면 `BuildPathfindingQuery()`로 `FPathFindingQuery` 생성
7. `FindPathForMoveRequest()`가 `UNavigationSystemV1::FindPathSync()` 경로로 실제 경로 계산
8. `RequestMove()`가 `UPathFollowingComponent::RequestMove()`에 경로 전달
9. path following이 상태를 `Moving`으로 바꾸고 세그먼트 이동 시작
10. `TickComponent()`가 `UpdatePathSegment()`와 `FollowPathSegment()`를 반복
11. 도착 또는 실패 시 `OnPathFinished()`
12. 마지막으로 `AAIController::OnMoveCompleted()` 브로드캐스트

> [!tip]
> 실제 이동의 중심은 `AAIController`가 아니라 `UPathFollowingComponent`입니다. `AI Move To` 같은 노드는 진입점일 뿐이고, 프레임 단위 추종과 완료 판정은 path following이 담당합니다.

## `AAIController::MoveTo` 흐름
### `MoveToActor()` / `MoveToLocation()`
두 함수는 먼저 현재 script 이동이 있으면 `ForcedScript | NewRequest` 플래그로 `AbortMove()`를 호출합니다.
그 뒤 각각 actor 또는 location 기반 `FAIMoveRequest`를 세팅하고 `MoveTo()`로 넘깁니다.

### `MoveTo(const FAIMoveRequest&)`
이 함수가 실질적 메인 진입점입니다.
엔진 코드 기준 중요 포인트는 다음과 같습니다.

- request validity 검사
- `PathFollowingComponent` 존재 검사
- location 기반 요청이면 NaN / invalid location 검사
- `IsProjectingGoal()`이면 `UNavigationSystemV1::ProjectPointToNavigation()` 수행
- `HasReached(MoveRequest)`면 경로 생성 없이 즉시 success finish
- 아니면 `BuildPathfindingQuery()` -> `FindPathForMoveRequest()` -> `RequestMove()` 순서로 진행

특히 `bProjectDestinationToNavigation`은 blueprint에서 가볍게 보이지만, 실제로는 목표 좌표가 navmesh 위에 놓이도록 사전 정규화하는 중요한 옵션입니다.

> [!caution]
> 목표 위치가 navmesh 위가 아니고 `ProjectGoalLocation`도 꺼져 있으면, pathfinding 이전 단계에서 바로 실패할 수 있습니다.

## `BuildPathfindingQuery()`와 `FindPathSync()`
`AAIController::BuildPathfindingQuery()`는 `FAIMoveRequest`, start location, nav agent properties를 기반으로 `FPathFindingQuery`를 만듭니다.
그 다음 `FindPathForMoveRequest()`는 실제 탐색을 수행합니다.

엔진 코드 기준 핵심은 이 부분입니다.

- `MoveRequest.ShouldStartFromPreviousPath()`면 현재 경로 끝을 새 시작점으로 사용 가능
- query가 유효하면 nav system이 nav data를 선택
- `UNavigationSystemV1::FindPathSync()`는 `FindPath()` 또는 `FindHierarchicalPath()` 호출
- 생성된 path가 있으면 `RequestMove()`로 전달

즉 pathfinding은 controller 안에서 끝나는 것이 아니라, controller가 query를 만들고 navigation system이 nav data에 위임하는 구조입니다.

## `UPathFollowingComponent::RequestMove()`
이 함수부터는 실제 경로 추종 런타임입니다.
중요한 처리 순서는 다음과 같습니다.

1. resource lock 검사
2. acceptance radius 유효성 검사
3. movement component 확보 (`UpdateMovementComponent()`)
4. 기존 요청이 있으면 `OnPathFinished(Aborted, NewRequest)`로 정리
5. request id 갱신
6. path observer 등록
7. goal actor/location, navigation filter, acceptance data 저장
8. `OnPathUpdated()` 호출
9. 상태를 `Waiting` 또는 `Moving`으로 진행

즉 path following은 단순히 path point를 읽는 것이 아니라, request lifecycle 전체를 관리하는 상태 기계입니다.

## Tick과 세그먼트 추종
`UPathFollowingComponent::TickComponent()`는 매우 단순하지만 핵심 구조를 보여줍니다.

1. `Status == Moving`이면 `UpdatePathSegment()`
2. 여전히 `Moving`이면 `FollowPathSegment(DeltaTime)`

이 구조 때문에 path following은 “현재 세그먼트 갱신”과 “실제 이동 입력 적용”이 분리되어 있습니다.
`SetMoveSegment()`는 어느 path segment를 추종할지 정하고, `FollowPathSegment()`는 실제 이동 방향과 속도를 movement component에 전달합니다.

## 도착 판정과 Acceptance Radius
도착 여부는 `UPathFollowingComponent::HasReached(const FAIMoveRequest&)`가 판단합니다.
여기서 중요한 것은 `AcceptanceRadius`가 그대로 쓰이지 않는다는 점입니다.
reach mode에 따라 다음이 합쳐질 수 있습니다.

| ReachMode | 의미 |
| --- | --- |
| `ExactLocation` | acceptance radius만 사용 |
| `OverlapAgent` | acceptance radius + agent 반지름 |
| `OverlapGoal` | acceptance radius + goal 반지름 |
| `OverlapAgentAndGoal` | 둘 다 포함 |

즉 blueprint에서 `StopOnOverlap`이나 actor goal 여부에 따라 실제 도착 판정 반경은 생각보다 크게 달라질 수 있습니다.

> [!info]
> `AlreadyAtGoal`은 pathfinding 전에 판정될 수 있습니다. 따라서 `MoveTo`를 호출했다고 해서 항상 path query가 발생하는 것은 아닙니다.

## 자주 쓰는 네비게이션 질의
`UNavigationSystemV1`는 pathfinding 외에도 AI가 자주 쓰는 질의 API를 제공합니다.

| API | 의미 |
| --- | --- |
| `ProjectPointToNavigation()` | 월드 좌표를 navmesh 위 안전한 위치로 보정 |
| `GetRandomReachablePointInRadius()` | 현재 위치에서 실제 도달 가능한 랜덤 포인트 |
| `GetRandomPointInNavigableRadius()` | navigable 공간 안 랜덤 포인트 |
| `FindPathToLocationSynchronously()` | 동기 경로 계산 helper |
| `FindPathToActorSynchronously()` | goal actor 추적 가능한 동기 경로 helper |

`GetRandomReachablePointInRadius()`와 `GetRandomPointInNavigableRadius()`는 비슷해 보여도 의미가 다릅니다.
전자는 "도달 가능성"이 더 강하고, 후자는 "navigable 공간 내부"에 초점이 있습니다.

## 실무 관점에서 꼭 알아둘 점
### 1. `MoveTo`는 pathfinding 호출 그 자체가 아니다
중간에 목표 투영, 즉시 도착 판정, partial path 허용 여부, 이전 경로 병합 여부가 모두 개입합니다.

### 2. 경로 계산과 경로 추종은 다른 계층이다
`UNavigationSystemV1`가 경로를 계산하고, `UPathFollowingComponent`가 그 결과를 따라갑니다.
둘을 한 덩어리로 보면 디버깅이 어려워집니다.

### 3. movement component가 없으면 path following은 시작조차 못 한다
`RequestMove()`는 `UpdateMovementComponent()` 실패 시 바로 invalid request를 반환합니다.
즉 navmesh가 있어도 실제 이동 컴포넌트가 없으면 움직이지 않습니다.

### 4. actor goal은 location goal과 동작이 완전히 같지 않다
actor goal은 이동 중 목표 actor 위치가 바뀔 수 있고, goal radius와 reach test가 섞입니다.
그래서 `MoveToActor`는 단순 위치 이동보다 상태 변화가 많습니다.

### 5. partial path와 invalid path를 구분해야 한다
partial path는 실패가 아니라 "끝까지는 못 가지만 중간까지는 간다"는 의미입니다.
반면 invalid path는 아예 usable path를 만들지 못한 상태에 가깝습니다.

## AI 스택 안에서의 위치
- `[[AI 지각(AI Perception)]]`: 자극 수집
- `[[환경 쿼리 시스템(EQS)]]`: 후보 위치/대상 평가
- `[[블랙보드(Blackboard)]]`: 선택 결과 저장
- `[[비헤이비어 트리(Behavior Tree)]]`: 의사결정 흐름 제어
- `[[네비게이션과 PathFollowing(Navigation)]]`: 선택된 목적지를 실제 이동으로 실행

## 연결해서 볼 문서
- [[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]: area cost, exclude, include/exclude flags, meta filter 정책 계층
- [[RecastNavMesh와 Navigation Data(Custom Recast Navigation Data)]]: `ANavigationData`, `ARecastNavMesh`, `FRecastNavMeshGenerator`, dirty area/tile rebuild, runtime generation 계층
- [[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]: Detour Crowd와 CharacterMovement RVO의 분리 구조, 군중 이동과 국소 회피 계층
- [[NavLink와 Smart Link(NavLink Smart Link)]]: simple link, smart link, custom move, ResumePathFollowing 흐름

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\NavigationSystem\Public\NavigationSystem.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavigationSystem.cpp`
- `Engine\Source\Runtime\AIModule\Classes\AITypes.h`
- `Engine\Source\Runtime\AIModule\Private\AITypes.cpp`
- `Engine\Source\Runtime\AIModule\Classes\AIController.h`
- `Engine\Source\Runtime\AIModule\Private\AIController.cpp`
- `Engine\Source\Runtime\AIModule\Classes\Navigation\PathFollowingComponent.h`
- `Engine\Source\Runtime\AIModule\Private\Navigation\PathFollowingComponent.cpp`

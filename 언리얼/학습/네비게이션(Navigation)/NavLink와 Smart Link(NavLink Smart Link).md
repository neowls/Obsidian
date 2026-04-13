[Navigation System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-system-in-unreal-engine) | [ANavLinkProxy](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Navigation/ANavLinkProxy) | [UNavLinkCustomComponent::OnLinkMoveStarted](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/UNavLinkCustomComponent/OnLinkMoveStarted) | [UPathFollowingComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Navigation/UPathFollowingComponent)

## 개요
**NavLink와 Smart Link(NavLink / Smart Link)** 는 navmesh가 직접 이어지지 않는 구간을 pathfinding과 path following에 연결하는 계층입니다.
엔진 코드 기준으로는 단순히 "점프 포인트" 하나가 아니라, 아래 세 층이 함께 맞물립니다.

| 층 | 엔진 요소 | 역할 |
| --- | --- | --- |
| 링크 데이터 | `FNavigationLink`, `FNavigationSegmentLink`, `INavLinkCustomInterface` | 경로에 삽입될 link 정의와 pathfinding 규칙 |
| 링크 호스트 | `ANavLinkProxy`, `UNavLinkCustomComponent` | simple/smart link 보관, 동적 enable/disable, 도달 이벤트 브로드캐스트 |
| 이동 전환 | `UPathFollowingComponent` | 현재 세그먼트가 custom link인지 판정하고, custom move 시작/종료를 제어 |

즉 NavLink는 "경로 중간에 끼는 특수 이동 세그먼트"이고, Smart Link는 그 세그먼트를 런타임에서 동적으로 제어하고 커스텀 이동 로직까지 연결하는 확장입니다.

> [!info]
> `[[네비게이션과 PathFollowing(Navigation)]]` 이 일반 path segment를 추종하는 기본 런타임이라면, 이 문서는 그 경로 중간에 사다리, 점프, 문 통과 같은 특수 구간이 끼었을 때 path following이 어떻게 전환되는지를 다룹니다.
> `[[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]` 문서와도 직접 연결됩니다. crowd tick 안에서도 smart link 진입과 종료가 별도로 처리됩니다.

## Simple Link와 Smart Link의 차이
| 구분 | Simple Link | Smart Link |
| --- | --- | --- |
| 주 저장 위치 | `ANavLinkProxy::PointLinks`, `SegmentLinks` | `ANavLinkProxy::SmartLinkComp`, `UNavLinkCustomComponent` |
| 개수 | 프록시 하나에 여러 개 가능 | 프록시 하나에 최대 하나 |
| 주 성격 | 정적인 link 데이터 | 동적 enable/disable, 커스텀 이동, 브로드캐스트 |
| 런타임 콜백 | 없음 | `OnLinkMoveStarted`, `ReceiveSmartLinkReached`, `ResumePathFollowing` |
| area class 변경 | 보통 정적 | enabled/disabled area를 런타임에서 변경 가능 |

핵심은 simple link는 "경로를 이어 주는 데이터"에 가깝고, smart link는 "특수 이동 구간을 런타임에서 제어하는 시스템"에 가깝다는 점입니다.

## 핵심 구성
| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 링크 인터페이스 | `INavLinkCustomInterface` | pathfinding 허용 여부, area class, custom move 시작/종료, custom reach condition 정의 |
| 스마트 링크 컴포넌트 | `UNavLinkCustomComponent` | custom link id 생성/등록, enable/disable, moving agent 추적, 브로드캐스트 |
| 링크 프록시 | `ANavLinkProxy` | simple links + smart link를 한 액터에서 호스팅 |
| 경로 추종기 | `UPathFollowingComponent` | 현재 세그먼트가 custom link인지 판정하고 `StartUsingCustomLink()` 호출 |
| 네비게이션 시스템 | `UNavigationSystemV1` | `GetCustomLink()`, `UpdateCustomLink()`, custom link 등록/해제 처리 |

## `INavLinkCustomInterface`가 정의하는 것
헤더 주석 기준으로 custom nav link는 세 가지 역할을 가집니다.

1. navmesh rebuild 없이 pathfinding 요청에 영향을 줄 수 있다.
2. area class를 런타임에서 바꿀 수 있다.
3. ladder 같은 custom movement를 위한 훅을 제공한다.

실제 중요한 함수는 다음과 같습니다.

| 함수 | 의미 |
| --- | --- |
| `IsLinkPathfindingAllowed()` | 현재 querier가 이 링크를 pathfinding에 사용할 수 있는지 |
| `OnLinkMoveStarted()` | agent가 링크 사용을 시작할 때 호출, `true`면 custom move 진입 |
| `OnLinkMoveFinished()` | 링크 사용 종료 알림 |
| `IsLinkUsingCustomReachCondition()` | 링크 시작점 도달 판정을 기본 규칙 대신 커스텀할지 |
| `HasReachedLinkStart()` | custom reach condition을 쓸 때 실제 판정 함수 |
| `GetLinkAreaClass()` | 현재 링크가 경로상에서 어떤 area로 보일지 |

즉 Smart Link는 path following 콜백만 있는 것이 아니라, pathfinding 규칙까지 런타임에서 바꾸는 인터페이스입니다.

## `UPathFollowingComponent`에서의 NavLink 처리 흐름
엔진 코드 기준으로 custom link 전환은 `SetMoveSegment()`와 `StartUsingCustomLink()`에서 닫힙니다.

1. `SetMoveSegment()`가 현재 start/end path point를 잡는다.
2. 다음 path point(`PathPt1`)에 `CustomNavLinkId`가 있으면 `GetCustomLink()`로 링크를 조회한다.
3. 링크가 있으면 `MoveSegmentCustomLinkOb`를 캐시하고, `IsLinkUsingCustomReachCondition()` 결과를 저장한다.
4. acceptance radius도 일반 path point와 nav link용 값을 다르게 쓴다.
5. 현재 path point(`PathPt0`)에 `CustomNavLinkId`가 있으면 `StartUsingCustomLink(CustomNavLink, SegmentEnd)`를 호출한다.
6. `StartUsingCustomLink()`는 `OnLinkMoveStarted()`를 호출한다.
7. 이 함수가 `true`를 반환하면 path following은 custom move 상태로 남고, 이후 `FinishUsingCustomLink()`가 호출될 때까지 그 링크를 사용 중이라고 본다.
8. `FinishUsingCustomLink()`가 호출되면 `OnLinkMoveFinished()`를 호출하고 `CurrentCustomLinkOb`를 비운다.

> [!tip]
> `PathPt1.CustomNavLinkId`는 "다음 세그먼트의 링크 시작 도달 규칙"을 캐시하는 쪽이고, `PathPt0.CustomNavLinkId`는 "지금 이 링크를 실제 사용 시작하는 지점"입니다. 둘을 같은 타이밍으로 보면 디버깅이 꼬입니다.

## `StartUsingCustomLink()` / `FinishUsingCustomLink()`의 의미
### `StartUsingCustomLink()`
이 함수는 이전 custom link가 남아 있으면 먼저 강제로 `OnLinkMoveFinished()`를 호출해 정리합니다.
그 다음 새 링크에 대해 `OnLinkMoveStarted()`를 호출합니다.

- 반환값이 `false`면 단순 notify만 하고 `CurrentCustomLinkOb`를 비웁니다.
- 반환값이 `true`면 진짜 custom move로 들어가고, path following은 그 링크가 끝날 때까지 기다립니다.

즉 Smart Link에서 중요한 것은 링크 존재 자체가 아니라, `OnLinkMoveStarted()`가 `true`를 반환했는지 여부입니다.

### `FinishUsingCustomLink()`
현재 사용 중인 링크와 같은 객체일 때만 `OnLinkMoveFinished()`를 호출하고 상태를 해제합니다.
따라서 custom move를 직접 제어할 때는 최종적으로 이 함수를 반드시 거쳐야 path following이 정상 복귀합니다.

> [!caution]
> `ReceiveSmartLinkReached()`나 커스텀 점프/사다리 로직에서 이동을 직접 제어했다면, 마지막에 `ResumePathFollowing()` 또는 `FinishUsingCustomLink()`를 호출해야 합니다. 그렇지 않으면 AI는 custom link 사용 상태에 머문 채 다음 세그먼트로 넘어가지 못합니다.

## `UNavLinkCustomComponent`에서 중요한 지점
### 1. `CustomLinkId` 생성과 등록
`OnRegister()`는 `CustomLinkId`를 만들고 `UNavigationSystemV1::RequestCustomLinkRegistering(*this, this)`를 호출합니다.
에디터에서는 `AuxiliaryCustomLinkId + ActorInstanceGuid` 조합으로 결정적 ID를 만들고, 런타임 전용 스폰 경로에서는 새 GUID 기반 ID를 생성합니다.

즉 Smart Link는 단순 컴포넌트가 아니라 navigation system에 등록되는 식별 가능한 링크 객체입니다.

### 2. pathfinding 규칙을 런타임에서 바꾼다
`SetEnabledArea()`, `SetDisabledArea()`, `SetEnabled()`는 모두 `UNavigationSystemV1::UpdateCustomLink(this)`를 호출합니다.
즉 Smart Link는 navmesh 전체 rebuild 없이도 enabled/disabled area와 pathfinding 가능 상태를 다시 반영할 수 있습니다.

### 3. `OnLinkMoveStarted()`는 moving agent를 추적한다
`OnLinkMoveStarted()`는 `MovingAgents`에 path component를 넣고, `OnMoveReachedLink` delegate가 바인딩돼 있으면 실행한 뒤 `true`를 반환합니다.
반대로 delegate가 없으면 `false`를 반환합니다.

이 말은 곧, Smart Link에서 custom movement를 활성화하는 가장 직접적인 스위치가 delegate binding 여부라는 뜻입니다.

### 4. broadcast 훅이 있다
`SetBroadcastData()`, `SendBroadcastWhenEnabled()`, `SendBroadcastWhenDisabled()`, `CollectNearbyAgents()`, `BroadcastStateChange()`를 보면, 링크 상태 변화를 주변 agent에게 알리는 경로가 이미 준비돼 있습니다.
즉 Smart Link는 단순 이동 포인트를 넘어서 "주변 AI에게 상태 변화를 알리는 런타임 객체"입니다.

### 5. `HasMovingAgents()`로 현재 사용 중 여부를 알 수 있다
링크를 잠그거나 상태를 바꾸기 전에 이미 누가 타고 있는지 확인할 때 핵심입니다.

## `ANavLinkProxy`에서 중요한 지점
### 1. 한 액터에 simple link와 smart link를 함께 둘 수 있다
헤더 주석 그대로 프록시 하나에 여러 simple link를 둘 수 있고, smart link는 최대 하나 둘 수 있습니다.
둘은 동시에 켜 둘 수도 있고, 하나만 쓸 수도 있습니다.

### 2. 생성자에서 smart link 콜백을 연결한다
생성자에서 아래 연결이 들어갑니다.

```cpp
SmartLinkComp->SetMoveReachedLink(this, &ANavLinkProxy::NotifySmartLinkReached);
```

즉 proxy는 smart link component의 move reached delegate를 받아 blueprint/native 이벤트로 다시 노출하는 브리지입니다.

### 3. `NotifySmartLinkReached()`가 pawn 기준 이벤트로 바꿔 준다
이 함수는 `PathingAgent`를 `UPathFollowingComponent`로 받아서, owner가 controller면 pawn으로 변환한 뒤 `ReceiveSmartLinkReached()`와 `OnSmartLinkReached.Broadcast()`를 호출합니다.
따라서 blueprint 쪽에서는 path component가 아니라 실제 pawn 기준으로 이벤트를 받게 됩니다.

### 4. `ResumePathFollowing()`는 결국 `FinishUsingCustomLink()`를 부른다
`ResumePathFollowing(AActor* Agent)`는 actor나 controller에서 `UPathFollowingComponent`를 찾아 `FinishUsingCustomLink(SmartLinkComp)`를 호출합니다.
즉 blueprint에서 보이는 resume 함수는 결국 path following custom-link 상태 해제의 래퍼입니다.

### 5. `GetNavigationLinksArray()`는 simple + smart를 함께 export한다
smart link가 navigation relevant이면 `SmartLinkComp->GetLinkModifier()`도 pathfinding용 링크 배열에 추가됩니다.
즉 smart link는 이벤트 객체이면서 동시에 pathfinding modifier이기도 합니다.

## 실무 관점에서 꼭 알아둘 점
### 1. Smart Link는 "이벤트"가 아니라 pathfinding 규칙과 이동 전환까지 같이 가진다
area class, enable/disable, broadcast, custom move를 모두 같이 봐야 합니다.

### 2. custom reach condition은 link 시작점 판정까지 바꾼다
`IsLinkUsingCustomReachCondition()`와 `HasReachedLinkStart()`는 링크를 타기 직전의 판정 자체를 override합니다.
사다리나 특정 정렬이 필요한 이동은 여기서부터 달라집니다.

### 3. simple link와 smart link는 경쟁 관계가 아니라 역할 분담이다
정적인 경로 연결은 simple link, 런타임 제어와 커스텀 이동은 smart link 쪽이 더 적합합니다.

### 4. `HasMovingAgents()` 없이 상태를 바꾸면 링크 위의 AI를 깨뜨릴 수 있다
링크를 끄거나 area를 바꾸는 시점에 이미 사용 중인 agent가 있는지 먼저 보는 편이 안전합니다.

### 5. crowd와도 직접 연결된다
`[[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]` 문서에서 본 것처럼 crowd tick의 `UpdateAgentPaths()`는 smart link animation 상태를 보고 `StartUsingCustomLink()`를 호출합니다.
즉 NavLink는 일반 path following과 crowd following 둘 다의 공통 연결점입니다.

## Navigation 학습 흐름 안에서의 위치
- `[[네비게이션과 PathFollowing(Navigation)]]`: 일반 이동 실행 계층
- `[[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]`: pathfinding 정책 계층
- `[[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]`: 군중 이동과 국소 회피 계층
- `[[NavLink와 Smart Link(NavLink Smart Link)]]`: 특수 이동 세그먼트와 custom move 계층
- 다음 단계 후보:
  - `Custom Recast / Navigation Data`
  - `네트워킹 권한/소유/연결`
  - `Subsystem / Module / Plugin`

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\Navigation\PathFollowingComponent.h`
- `Engine\Source\Runtime\AIModule\Private\Navigation\PathFollowingComponent.cpp`
- `Engine\Source\Runtime\NavigationSystem\Public\NavLinkCustomInterface.h`
- `Engine\Source\Runtime\NavigationSystem\Public\NavLinkCustomComponent.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavLinkCustomComponent.cpp`
- `Engine\Source\Runtime\AIModule\Classes\Navigation\NavLinkProxy.h`
- `Engine\Source\Runtime\AIModule\Private\Navigation\NavLinkProxy.cpp`
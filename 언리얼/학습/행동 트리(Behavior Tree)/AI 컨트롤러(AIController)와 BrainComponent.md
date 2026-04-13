[AAIController::RunBehaviorTree](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/AAIController/RunBehaviorTree) | [AAIController::UseBlackboard](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/AAIController/UseBlackboard) | [UBrainComponent API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/UBrainComponent)

## 개요
비헤이비어 트리 실행의 진짜 출발점은 보통 `AAIController`입니다.
그리고 그 중간 추상화 계층이 `UBrainComponent`입니다.

즉 런타임 구조를 단순화하면 다음과 같습니다.

| 계층 | 엔진 클래스 | 역할 |
|---|---|---|
| 소유자 | `AAIController` | Pawn 제어, Blackboard/Brain/PathFollowing/GameplayTasks 연결 |
| 논리 계층 | `UBrainComponent` | AI 로직 시작/중지/메시지/리소스 락 추상화 |
| BT 구현체 | `UBehaviorTreeComponent` | 실제 비헤이비어 트리 실행 |
| 상태 저장소 | `UBlackboardComponent` | AI 지식 저장 |

> [!info]
> `BrainComponent`는 곧 `BehaviorTreeComponent`가 아닙니다. `BehaviorTreeComponent`는 BrainComponent의 한 구현체일 뿐입니다.

## AAIController가 하는 일
`AAIController`는 단순히 입력 없는 Controller가 아니라, AI 관련 하위 시스템의 조정자입니다.

중요 필드:
- `BrainComponent`
- `Blackboard`
- `PathFollowingComponent`
- `CachedGameplayTasksComponent`

즉 실제 액션 수행은 다른 컴포넌트가 하더라도, 이들을 묶는 소유자는 보통 `AAIController`입니다.

## UBrainComponent는 어떤 계층인가?
`UBrainComponent`는 AI 로직 실행 계층의 공통 인터페이스입니다.

핵심 책임:
- `StartLogic()` / `RestartLogic()` / `StopLogic()`
- `PauseLogic()` / `ResumeLogic()`
- `HandleMessage()`
- Blackboard 캐시 보관
- AI 리소스 락 처리
- 디버그/Visual Log 연결

하지만 base class 구현을 보면:
- `StartLogic()` 비어 있음
- `RestartLogic()` 비어 있음
- `StopLogic()` 비어 있음
- `IsRunning()` false 반환

입니다.

> [!caution]
> 즉 `UBrainComponent` 자체는 실행 로직을 거의 가지지 않습니다. 실제 동작은 `UBehaviorTreeComponent` 같은 하위 클래스가 구현합니다.

## Blackboard와 Brain의 연결
`UBrainComponent::InitializeComponent()`는 owner에서 `UBlackboardComponent`를 찾아 캐시하고, 블랙보드 쪽에도 `CacheBrainComponent(*this)`를 호출합니다.

이 연결 덕분에:
- Brain은 현재 Blackboard를 바로 참조할 수 있고
- Blackboard는 자신이 속한 Brain을 알 수 있으며
- 서비스/데코레이터/태스크가 간접적으로 Blackboard와 Brain을 함께 활용할 수 있습니다.

## 메시지 시스템
`UBrainComponent`는 AI 메시지 큐를 가집니다.

관련 구조:
- `FAIMessage`
- `FAIMessageObserver`
- `UBrainComponent::HandleMessage()`
- `UBrainComponent::TickComponent()`

메시지는 즉시 처리되지 않고 `MessagesToProcess`에 쌓였다가 틱에서 observer들에게 전달됩니다.

대표 메시지 이름:
- `AIMessage_MoveFinished`
- `AIMessage_RepathFailed`
- `AIMessage_QueryFinished`

> [!tip]
> `UBTTaskNode::WaitForMessage()`가 결국 기대하는 메시지 경로도 이 시스템입니다. 즉 BT 태스크의 비동기 완료는 BrainComponent의 메시지 모델과 직접 연결됩니다.

## 리소스 락과 Pause/Resume
`UBrainComponent`는 `IAIResourceInterface`를 구현합니다.
핵심은 `ResourceLock`입니다.

동작 흐름:
- `LockResource()` -> 처음 잠기면 `PauseLogic()`
- `ClearResourceLock()` -> 모두 해제되면 `ResumeLogic()`
- `RequestLogicRestartOnUnlock()` -> 락 해제 시 재시작 예약

`AAIController::OnGameplayTaskResourcesClaimed()`는 `UAIResource_Logic` 리소스를 기준으로 Brain을 lock/unlock 합니다.

즉 GameplayTask가 논리 리소스를 점유하면 AI 로직 자체가 일시 중단될 수 있습니다.

## Possess 시점 흐름
`AAIController::OnPossess()`에서 중요한 흐름은 다음과 같습니다.

1. Pawn의 `GameplayTasksComponent` 준비
2. 이미 Blackboard가 있으면 현재 자산 기준으로 재초기화
3. `bStartAILogicOnPossess`가 켜져 있고 `BrainComponent`가 있으면 `StartLogic()` 호출

또한 `SetPawn()`에서는 블랙보드의 `Self` 키를 현재 Pawn으로 갱신합니다.

> [!info]
> 즉 `Self` 키는 에디터에서 그냥 장식용 예약 키가 아니라, Controller가 Pawn을 바꿀 때 실제로 갱신되는 런타임 참조입니다.

## UseBlackboard의 실제 의미
`AAIController::UseBlackboard()`는 다음을 수행합니다.

- `UBlackboardComponent`가 없으면 생성
- 있더라도 자산이 다르면 재초기화
- 성공 시 out parameter로 사용 중인 BlackboardComponent 반환

이 함수는 말 그대로 "블랙보드 에셋을 Controller의 런타임 BlackboardComponent에 연결하는 진입점"입니다.

## RunBehaviorTree의 실제 의미
`AAIController::RunBehaviorTree()`는 다음 순서로 동작합니다.

1. BTAsset null 검사
2. 트리에 Blackboard가 필요하면 `UseBlackboard()` 호출
3. `BrainComponent`가 `UBehaviorTreeComponent`인지 확인
4. 아니면 새 `UBehaviorTreeComponent` 생성 및 등록
5. `BrainComponent`를 새 BT 컴포넌트로 교체
6. `StartTree(*BTAsset, EBTExecutionMode::Looped)` 호출

즉 이 함수는 단순 helper가 아니라:
- Blackboard 보장
- Brain 구현체 보장
- BT 실행 시작

을 한 번에 묶는 진입점입니다.

## 디버그 관점
`AAIController::GetDebugIcon()`은 Brain이 실행 중인지 여부에 따라 아이콘을 바꿉니다.
또한 Visual Logger와 Gameplay Debugger 계열에서도 Controller는 중심 앵커 역할을 합니다.

즉 디버그에서 AI를 볼 때도 기준점은 대개 Controller입니다.

## 실전에서 어떻게 이해하면 좋은가?
- Controller는 "AI의 몸을 조종하는 상위 소유자"
- BrainComponent는 "AI 논리의 공통 인터페이스"
- BehaviorTreeComponent는 "그 인터페이스의 BT 구현체"
- BlackboardComponent는 "논리가 읽고 쓰는 상태 저장소"

이렇게 나눠서 이해하면 구조가 훨씬 명확해집니다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\AIController.h`
- `Engine\Source\Runtime\AIModule\Private\AIController.cpp`
  - `OnPossess()`
  - `SetPawn()`
  - `RunBehaviorTree()`
  - `UseBlackboard()`
  - `ShouldSyncBlackboardWith()`
  - `OnGameplayTaskResourcesClaimed()`
- `Engine\Source\Runtime\AIModule\Classes\BrainComponent.h`
- `Engine\Source\Runtime\AIModule\Private\BrainComponent.cpp`
  - `InitializeComponent()`
  - `TickComponent()`
  - `HandleMessage()`
  - `LockResource()`
  - `ResumeLogic()`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTTaskNode.cpp`
  - `WaitForMessage()`
  - `OnMessage()`

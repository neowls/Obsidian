---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/behavior-tree
  - type/learning
---

# AI 컨트롤러(AIController)와 BrainComponent

> [!summary] 요약
> AI 컨트롤러(AIController)와 BrainComponent은 AIController, BrainComponent, Blackboard, Behavior Tree 노드가 함께 만드는 AI 의사결정 주제다.
> AI가 선택한 행동이 왜 실행되거나 중단되는지 추적할 때 사용한다.
> 핵심은 Blackboard 값 변화, decorator 조건, abort 범위, task 종료 신호를 같은 흐름에서 보는 것이다.

## 핵심 결론

- Behavior Tree는 노드 배치보다 Blackboard key와 observer/abort 조건 설계가 먼저다.
- task는 반드시 성공, 실패, 진행 중 상태를 명확히 끝내야 한다.
- 문제가 생기면 AIController possession, BrainComponent 실행 상태, Blackboard 값, decorator abort 로그를 확인한다.

## 참고 자료

[AAIController::RunBehaviorTree](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/AAIController/RunBehaviorTree) | [AAIController::UseBlackboard](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/AAIController/UseBlackboard) | [UBrainComponent API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/UBrainComponent)

## 개요
비헤이비어 트리(Behavior Tree) 실행의 진짜 출발점은 보통 `AAIController`입니다.
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

## 왜 필요한가

AI 문제는 눈에 보이는 task가 아니라 그 task에 도달하기 전의 조건 평가에서 자주 발생한다. AI 컨트롤러(AIController)와 BrainComponent을 볼 때는 실행 중인 노드만 보지 말고 Blackboard 변경과 재선택 조건까지 추적해야 한다.

## 작동 모델

AIController가 pawn을 소유하고 BrainComponent가 Behavior Tree를 구동한다. Blackboard는 의사결정 상태를 저장하고, Composite는 탐색 순서, Decorator는 조건, Service는 주기적 갱신, Task는 실제 행동을 담당한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| `AAIController` | pawn 소유와 AI 실행 시작점 | possess, `RunBehaviorTree` |
| `UBrainComponent` | AI 로직 실행/정지 관리 | start/stop/restart 상태 |
| `UBehaviorTreeComponent` | 트리 탐색과 노드 실행 | active node, execution index |
| `UBlackboardComponent` | 의사결정 데이터 저장 | key type, 값 갱신 시점 |
| Task/Decorator/Service | 행동, 조건, 주기 갱신 | finish, abort, tick interval |

## 실행 흐름

1. AIController가 pawn을 possess하고 Blackboard/Behavior Tree를 초기화한다.
2. Composite가 child 순서를 따라 실행 후보를 고른다.
3. Decorator가 Blackboard와 조건을 검사하고 observer abort를 등록한다.
4. Service가 주기적으로 key를 갱신하고 Task가 실제 행동을 시작한다.
5. Task 완료, 실패, abort, key 변경이 다음 선택 흐름을 만든다.

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
`UBrainComponent::InitializeComponent()`는 owner에서 `UBlackboardComponent`를 찾아 캐시하고, 블랙보드(Blackboard) 쪽에도 `CacheBrainComponent(*this)`를 호출합니다.

이 연결 덕분에:
- Brain은 현재 Blackboard를 바로 참조할 수 있고
- Blackboard는 자신이 속한 Brain을 알 수 있으며
- 서비스(Service)/데코레이터(Decorator)/태스크(Task)가 간접적으로 Blackboard와 Brain을 함께 활용할 수 있습니다.

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

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 트리 모양만 맞으면 AI가 의도대로 움직인다. | Blackboard key 타입, 초기값, 갱신 주기를 함께 검증한다. |
| Task는 실행 함수만 구현하면 된다. | `FinishLatentTask` 또는 종료 신호가 모든 경로에서 호출되는지 확인한다. |
| Decorator 조건은 한 번만 검사된다. | observer abort 설정과 Blackboard 변경 알림 범위를 같이 본다. |

## 디버깅 체크리스트

- [ ] AIController가 pawn을 정상 possess했고 Behavior Tree를 실행했다.
- [ ] Blackboard asset과 Behavior Tree가 같은 key 정의를 사용한다.
- [ ] 현재 active node, selected branch, abort 원인을 Behavior Tree debugger에서 확인했다.
- [ ] Task가 success/fail/in progress 상태를 명확히 반환한다.
- [ ] Service tick interval과 Decorator observer abort 설정이 의도와 맞다.

## 관련 문서

- [[데코레이터(Decorator)]]
- [[블랙보드(Blackboard)]]
- [[비헤이비어 트리 디버거(Behavior Tree Debugger)]]
- [[비헤이비어 트리(Behavior Tree)]]
- [[서비스(Service)]]
- [[컴포짓(Composite)]]

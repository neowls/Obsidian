[Behavior Tree Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview) | [Behavior Tree User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide)

## 개요
![[Pasted image 20250122154328.png]]
언리얼의 비헤이비어 트리(Behavior Tree)는 단순한 에디터 그래프가 아니라, `UBehaviorTree` 에셋과 `UBehaviorTreeComponent` 런타임이 함께 구성하는 AI 의사결정 시스템입니다.

엔진 코드 기준으로 보면 다음 구조가 핵심입니다.

| 구성 요소 | 엔진 클래스 | 역할 |
|---|---|---|
| 비헤이비어 트리 에셋 | `UBehaviorTree` | 루트 컴포짓, 블랙보드, 루트 데코레이터를 보관하는 데이터 컨테이너 |
| 블랙보드 | `UBlackboardData`, `UBlackboardComponent` | 의사결정에 필요한 상태 저장소 |
| 실행기 | `UBehaviorTreeComponent` | 트리 시작, 탐색, 태스크 실행, 보조 노드 틱을 담당 |
| 분기 루트 | `UBTCompositeNode` | 자식 선택 규칙과 분기 생명주기를 담당 |
| 조건/관찰자 | `UBTDecorator` | 분기 진입 가능 여부와 Abort를 제어 |
| 백그라운드 갱신 | `UBTService` | 분기 활성 중 주기적으로 지식 업데이트 |
| 실제 액션 | `UBTTaskNode` | 이동, 대기, EQS, 애니메이션 등 실제 행동 수행 |

![[Pasted image 20250122154533.png]]

## 런타임 구조
엔진은 비헤이비어 트리를 다음 경로로 실행합니다.

1. `AAIController::RunBehaviorTree()`
2. 필요 시 `UseBlackboard()`로 `UBlackboardComponent` 준비
3. `UBehaviorTreeComponent` 생성 또는 재사용
4. `UBehaviorTreeComponent::StartTree()` 호출
5. `ProcessPendingInitialize()`에서 인스턴스 스택 초기화 후 트리 push
6. `RequestExecution()` / `ProcessExecutionRequest()`로 다음 태스크 탐색
7. 최종적으로 `WrappedExecuteTask()`를 통해 리프 태스크 실행

> [!info] 엔진 코드 기준 해석
> `Behavior Tree`는 스스로 실행되는 에셋이 아닙니다. 실제 실행 주체는 `UBehaviorTreeComponent`이며, 에셋은 이 컴포넌트가 소비하는 실행 데이터입니다.

## 기본 동작 방식
비헤이비어 트리는 왼쪽에서 오른쪽, 위에서 아래 순서로 탐색됩니다.
실제 자식 선택은 `UBTCompositeNode::FindChildToExecute()`가 수행하며, 각 자식에 대해 `DoDecoratorsAllowExecution()`로 데코레이터를 먼저 검사합니다.

![[Pasted image 20250122154541.png]]

이 구조 때문에 언리얼의 행동 트리는 다음처럼 읽는 편이 맞습니다.

- [[블랙보드(Blackboard)]]: 상태 저장소와 observer 모델
- [[컴포짓(Composite)]]: 분기 선택 규칙
- [[데코레이터(Decorator)]]: 분기 진입 조건 + 관찰자
- [[서비스(Service)]]: 분기 활성 중 백그라운드 갱신
- [[태스크(Task)]]: 실제 액션
- [[AI 컨트롤러(AIController)와 BrainComponent]]: 실행 주체와 논리 계층
- [[AI 지각(AI Perception)]]: 외부 자극이 블랙보드로 들어오기 전 입력 계층
- [[환경 쿼리 시스템(EQS)]]: 주변 후보를 평가해 블랙보드에 넣는 질의 계층
- [[비헤이비어 트리 디버거(Behavior Tree Debugger)]]: 런타임 스냅샷과 에디터 디버깅 경로

## AIController와의 연결
일반적으로 폰 또는 캐릭터는 AIController에 의해 제어되고, AIController가 비헤이비어 트리를 시작합니다.

![[Pasted image 20250122155201.png]]
![[Pasted image 20250122155209.png]]

엔진 코드 기준으로 `AAIController::RunBehaviorTree()`는 다음을 보장합니다.

- 블랙보드가 필요하면 먼저 초기화
- `BrainComponent`가 `UBehaviorTreeComponent`를 가리키도록 구성
- 기본 실행 모드로 `EBTExecutionMode::Looped`를 사용

즉, 실무에서 “비헤이비어 트리를 실행한다”는 말은 사실상 “AIController가 BehaviorTreeComponent를 통해 루프 실행을 시작한다”는 뜻입니다.

## 언리얼 비헤이비어 트리의 핵심 차이점
### 1. 이벤트 주도형(Event-Driven)
![[Pasted image 20250122155259.png]]
언리얼의 비헤이비어 트리는 매 프레임 전체 트리를 재평가하는 방식보다, 조건 변화가 생겼을 때 필요한 분기만 다시 평가하는 방향에 가깝습니다.

이때 핵심이 되는 것이:
- 블랙보드 값 변경
- 데코레이터의 `FlowAbortMode`
- `ConditionalFlowAbort()`를 통한 분기 재평가 요청

입니다.

> [!tip]
> “이벤트 주도형”은 트리가 아예 틱을 안 돈다는 뜻이 아닙니다. 서비스와 일부 태스크는 여전히 틱될 수 있습니다. 핵심은 "전체 트리를 무의미하게 매 프레임 다시 걷지 않도록 설계되어 있다"는 점입니다.

### 2. 조건을 리프 태스크가 아니라 데코레이터로 둠
![[Pasted image 20250122155524.png]]
언리얼은 조건식을 태스크보다 데코레이터에 두는 쪽을 기본 철학으로 잡고 있습니다.
이는 다음 장점이 있습니다.

- 어떤 분기가 닫혀 있는지 그래프에서 바로 보임
- 액션 태스크와 조건이 시각적으로 분리됨
- 데코레이터가 관찰자 역할을 수행하면서 Abort를 처리하기 쉬움

### 3. 복잡한 병렬 노드 대신 Simple Parallel + Service 사용
전통적인 병렬 노드를 일반화하지 않고:
- `Simple Parallel`
- `Service`
- `Decorator Observer Aborts`

조합으로 동시성 요구를 해결합니다.

이 방식은 `BehaviorTreeComponent`의 탐색/Abort 로직을 최적화하기 쉽고, 디버깅도 더 단순합니다.

## 엔진 코드 관점에서 꼭 알아둘 점
### NodeMemory와 인스턴싱
모든 노드는 UObject지만, 런타임 상태를 무조건 UObject 멤버에 저장하는 구조가 아닙니다.
기본적으로 템플릿 노드는 여러 AI가 공유하므로, 런타임 상태는 `NodeMemory`에 저장해야 합니다.

- 공통 베이스: `UBTNode`
- 인스턴싱 여부: `bCreateNodeInstance`
- 메모리 접근: `GetNodeMemory<T>()`
- 인스턴스별 UObject가 필요하면 `ForceInstancing(true)` 또는 블루프린트 기반 노드 사용

> [!caution]
> 인스턴싱되지 않은 노드에서 UObject 프로퍼티를 런타임 중 변경하면 같은 트리를 공유하는 다른 AI에게까지 상태가 섞일 수 있습니다.

### 실행 중인 것은 트리가 아니라 컴포넌트
실제 틱과 탐색은 `UBehaviorTreeComponent::TickComponent()`에서 일어납니다.
이 함수는:
- 활성 보조 노드 틱
- 누적된 실행 요청 처리
- 다음 틱 시간 스케줄링
- 태스크 실행 및 Abort 처리

를 담당합니다.

## 학습 포인트
> [!info] 지금 문서를 읽을 때 잡아야 할 질문
> - 왜 `BehaviorTree`는 에셋인데 실행은 `BehaviorTreeComponent`가 담당할까?
> - 왜 조건은 태스크보다 데코레이터에 두는가?
> - 왜 서비스는 결과를 반환하지 않고 블랙보드를 갱신하는 쪽으로 설계되었는가?
> - 왜 런타임 상태를 UObject 멤버가 아니라 `NodeMemory`에 저장하라고 하는가?

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\AIController.h`
- `Engine\Source\Runtime\AIModule\Private\AIController.cpp`
  - `AAIController::RunBehaviorTree()`
  - `AAIController::UseBlackboard()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BehaviorTree.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BehaviorTreeComponent.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BehaviorTreeComponent.cpp`
  - `StartTree()`
  - `ProcessPendingInitialize()`
  - `RequestExecution()`
  - `ProcessExecutionRequest()`
  - `TickComponent()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTNode.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTAuxiliaryNode.h`



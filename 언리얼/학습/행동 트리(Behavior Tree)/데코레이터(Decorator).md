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

# 데코레이터(Decorator)

> [!summary] 요약
> 데코레이터(Decorator)는 AIController, BrainComponent, Blackboard, Behavior Tree 노드가 함께 만드는 AI 의사결정 주제다.
> AI가 선택한 행동이 왜 실행되거나 중단되는지 추적할 때 사용한다.
> 핵심은 Blackboard 값 변화, decorator 조건, abort 범위, task 종료 신호를 같은 흐름에서 보는 것이다.

## 핵심 결론

- Behavior Tree는 노드 배치보다 Blackboard key와 observer/abort 조건 설계가 먼저다.
- task는 반드시 성공, 실패, 진행 중 상태를 명확히 끝내야 한다.
- 문제가 생기면 AIController possession, BrainComponent 실행 상태, Blackboard 값, decorator abort 로그를 확인한다.

## 참고 자료

[Behavior Tree Node Reference: Decorators](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators) | [Behavior Tree Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

## 개요
**데코레이터(Decorator)** 는 [[컴포짓(Composite)]] 또는 [[태스크(Task)]]에 붙는 보조 노드이며, 분기 또는 단일 노드가 실행 가능한지 판정하고 필요하면 실행 흐름을 중단(Abort)시킵니다.

엔진 코드 기준으로 데코레이터는 `UBTDecorator : UBTAuxiliaryNode`이며, 단순 조건문이 아니라 **실행 흐름을 바꾸는 관찰자(Observer)** 역할까지 수행합니다.

## 왜 필요한가

AI 문제는 눈에 보이는 task가 아니라 그 task에 도달하기 전의 조건 평가에서 자주 발생한다. 데코레이터(Decorator)를 볼 때는 실행 중인 노드만 보지 말고 Blackboard 변경과 재선택 조건까지 추적해야 한다.

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

## 핵심 역할
| 역할 | 엔진 기준 | 설명 |
|---|---|---|
| 조건 평가 | `CalculateRawConditionValue()` | 원시 조건 계산 |
| 실제 실행 판정 | `WrappedCanExecute()` | 인버스 조건과 인스턴싱을 반영한 최종 판정 |
| 분기 Abort | `ConditionalFlowAbort()` | 조건 변화 시 트리 재평가 요청 |
| 활성/비활성 통지 | `OnNodeActivation()`, `OnNodeDeactivation()` | 분기 생명주기 후킹 |
| 처리 후 가공 | `OnNodeProcessed()` | 노드 결과 수정 또는 후처리 |

## 런타임 관점에서의 해석
데코레이터는 child link 위에서 실행됩니다.
즉 "리프에서 조건을 검사한다"기보다, **분기 입구에서 문지기처럼 동작**합니다.

`UBTCompositeNode::DoDecoratorsAllowExecution()`는 child에 붙은 데코레이터들을 검사해:
- 단순 AND 평가를 하거나
- 복합 데코레이터 그래프(`FBTDecoratorLogic`)를 따라 논리식을 평가합니다.

> [!info]
> 언리얼이 조건을 태스크보다 데코레이터로 권장하는 이유는 그래프 가독성 때문만이 아닙니다. 데코레이터가 observer/abort 경로에 직접 연결되기 때문에 이벤트 주도형 구조와 더 잘 맞습니다.

## Observer Aborts와 FlowAbortMode
에디터에서 보이는 `Observer Aborts`는 엔진 코드에서 `FlowAbortMode`로 관리됩니다.

| 값 | 의미 |
|---|---|
| `None` | 조건 변화가 생겨도 자동 Abort 없음 |
| `Self` | 현재 자신이 감싸는 분기 중단 |
| `LowerPriority` | 자신보다 우선순위가 낮은 분기 중단 |
| `Both` | `Self + LowerPriority` |

`ConditionalFlowAbort()`는 조건이 false가 되면 `RequestBranchDeactivation()`을, true가 되면 `RequestBranchActivation()`을 요청합니다.
이게 언리얼 Behavior Tree의 이벤트 반응성 핵심입니다.

## 핵심 프로퍼티
| 프로퍼티 | 의미 |
|---|---|
| `FlowAbortMode` | 조건 변화 시 어느 범위를 다시 평가할지 |
| `bInverseCondition` | 결과 반전 여부 |
| `bNotifyActivation` | 활성화 콜백 사용 여부 |
| `bNotifyDeactivation` | 비활성화 콜백 사용 여부 |
| `bNotifyProcessed` | 처리 완료 후 콜백 사용 여부 |
| `bAllowAbortLowerPri` | lower priority abort 허용 여부 |
| `bAllowAbortChildNodes` | self abort 허용 여부 |

> [!tip]
> 커스텀 데코레이터를 만들 때 notify 계열 함수를 오버라이드한다면 `INIT_DECORATOR_NODE_NOTIFY_FLAGS()`를 같이 보는 편이 좋습니다. 그렇지 않으면 오버라이드한 함수가 실제로 호출되지 않을 수 있습니다.

## 인스턴싱과 NodeMemory
데코레이터도 기본적으로는 템플릿 노드입니다.
즉 런타임 상태를 UObject 멤버에 저장하면 안 되고, 필요하면 `NodeMemory` 또는 인스턴싱을 사용해야 합니다.

엔진 헤더의 주석도 이 점을 강하게 경고합니다.

- 기본: 템플릿 노드 공유
- 상태 저장: `GetInstanceMemorySize()` + `NodeMemory`
- AI별 UObject 상태 필요: `bCreateNodeInstance`

## 대표 기본 제공 데코레이터
엔진 코드 기준 기본 제공 데코레이터는 다음과 같습니다.

| 클래스 | 용도 |
|---|---|
| `UBTDecorator_Blackboard` | 블랙보드(Blackboard) 값 비교 |
| `UBTDecorator_CompareBBEntries` | 두 블랙보드 엔트리 비교 |
| `UBTDecorator_DoesPathExist` | 경로 존재 여부 |
| `UBTDecorator_IsAtLocation` | 특정 위치 도달 여부 |
| `UBTDecorator_Cooldown` | 시간 기반 쿨다운 |
| `UBTDecorator_TimeLimit` | 일정 시간 제한 |
| `UBTDecorator_CheckGameplayTagsOnActor` | 액터 GameplayTag 검사 |
| `UBTDecorator_ForceSuccess` | 결과 강제 성공 |
| `UBTDecorator_Loop`, `UBTDecorator_LoopUntil` | 반복 제어 |

## 언제 데코레이터를 쓰는가?
- 어떤 분기가 지금 실행 가능한지 판정할 때
- 블랙보드 값 변화에 반응해 분기를 끊고 싶을 때
- 우선순위 높은 분기로 즉시 갈아타고 싶을 때
- 시간 제한, 쿨다운, 태그 조건 같은 메타 규칙을 붙일 때

## 주의할 점

> [!caution]
> 데코레이터는 "상태를 갱신하는 노드"가 아니라 "실행 가능성과 흐름을 제어하는 노드"에 가깝습니다. 상태 갱신은 보통 서비스(Service)나 태스크 쪽이 더 적합합니다.

> [!tip]
> 조건을 매 프레임 폴링하는 습관보다, 블랙보드 갱신 + 데코레이터 abort 조합으로 사고하는 편이 언리얼 엔진 구조에 맞습니다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTDecorator.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTDecorator.cpp`
  - `WrappedCanExecute()`
  - `ConditionalFlowAbort()`
  - `GetStaticDescription()`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTCompositeNode.cpp`
  - `DoDecoratorsAllowExecution()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Decorators\BTDecorator_Blackboard.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Decorators\BTDecorator_CompareBBEntries.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Decorators\BTDecorator_Cooldown.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Decorators\BTDecorator_TimeLimit.h`

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

- [[블랙보드(Blackboard)]]
- [[비헤이비어 트리 디버거(Behavior Tree Debugger)]]
- [[비헤이비어 트리(Behavior Tree)]]
- [[서비스(Service)]]
- [[컴포짓(Composite)]]
- [[태스크(Task)]]

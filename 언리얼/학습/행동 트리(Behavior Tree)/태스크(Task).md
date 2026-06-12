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

# 태스크(Task)

> [!summary] 요약
> 태스크(Task)는 AIController, BrainComponent, Blackboard, Behavior Tree 노드가 함께 만드는 AI 의사결정 주제다.
> AI가 선택한 행동이 왜 실행되거나 중단되는지 추적할 때 사용한다.
> 핵심은 Blackboard 값 변화, decorator 조건, abort 범위, task 종료 신호를 같은 흐름에서 보는 것이다.

## 핵심 결론

- Behavior Tree는 노드 배치보다 Blackboard key와 observer/abort 조건 설계가 먼저다.
- task는 반드시 성공, 실패, 진행 중 상태를 명확히 끝내야 한다.
- 문제가 생기면 AIController possession, BrainComponent 실행 상태, Blackboard 값, decorator abort 로그를 확인한다.

## 참고 자료

[Behavior Tree Node Reference: Tasks](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-tasks) | [Behavior Tree User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide)

## 개요
**태스크(Task)** 는 비헤이비어 트리(Behavior Tree)의 리프(Leaf) 노드이며, 실제 액션을 수행하는 노드입니다.

엔진 코드 기준으로 `UBTTaskNode`는:
- 이동
- 대기
- 애니메이션 재생
- 사운드 재생
- EQS 실행
- 하위 Behavior Tree 실행

같은 실제 행동을 담당합니다.

즉 태스크는 "조건을 검사하는 노드"가 아니라 **실제로 무언가를 하는 노드**입니다.

## 왜 필요한가

AI 문제는 눈에 보이는 task가 아니라 그 task에 도달하기 전의 조건 평가에서 자주 발생한다. 태스크(Task)를 볼 때는 실행 중인 노드만 보지 말고 Blackboard 변경과 재선택 조건까지 추적해야 한다.

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

## 핵심 결과값
`ExecuteTask()`는 다음 중 하나를 반환합니다.

| 반환값 | 의미 |
|---|---|
| `Succeeded` | 즉시 성공 |
| `Failed` | 즉시 실패 |
| `InProgress` | 비동기/지속형 작업, 나중에 직접 종료 필요 |

`AbortTask()`는:
- `Aborted`
- `InProgress`

를 반환할 수 있습니다.

> [!info]
> `InProgress`를 반환했다면, 엔진이 자동으로 끝내주지 않습니다. 나중에 `FinishLatentTask()` 또는 `FinishLatentAbort()`를 호출해야 합니다.

## 런타임 생명주기
대표 흐름은 다음과 같습니다.

1. `UBehaviorTreeComponent::ExecuteTask` 단계에서 `WrappedExecuteTask()` 호출
2. 실제 구현체의 `ExecuteTask()` 수행
3. 즉시 끝나면 `OnTaskFinished()` 경로로 정리
4. `InProgress`면 active task로 유지
5. 필요 시 `TickTask()` 또는 메시지 대기
6. 완료 시 `FinishLatentTask()` 호출
7. Abort 중이면 `FinishLatentAbort()` 호출

## 핵심 API
| 함수 | 의미 |
|---|---|
| `ExecuteTask()` | 태스크 시작 |
| `AbortTask()` | 태스크 중단 |
| `TickTask()` | 지속형 태스크 틱 |
| `OnTaskFinished()` | 완료 시 후처리 |
| `WaitForMessage()` | AI 메시지 대기 |
| `StopWaitingForMessages()` | 메시지 대기 해제 |
| `FinishLatentTask()` | 비동기 태스크 완료 |
| `FinishLatentAbort()` | 비동기 Abort 완료 |

## 메시지 기반 완료
언리얼 태스크는 단순 틱 기반뿐 아니라 **메시지 기반 완료**도 지원합니다.

`WaitForMessage()`를 사용하면 특정 `FAIMessage`를 기다릴 수 있고, 메시지가 오면 `ReceivedMessage()` -> `OnMessage()` 경로로 들어갑니다.
기본 구현은:
- 활성 상태면 성공/실패로 `FinishLatentTask()`
- Abort 상태면 `FinishLatentAbort()`

를 호출합니다.

이 구조는 `MoveTo`, GameplayTask 기반 태스크 같은 비동기 작업과 잘 맞습니다.

## 핵심 프로퍼티
| 프로퍼티 | 의미 |
|---|---|
| `bIgnoreRestartSelf` | 이미 실행 중인 동일 태스크 재선택 시 재시작 무시 |
| `bNotifyTick` | `TickTask()` 사용 여부 |
| `bNotifyTaskFinished` | `OnTaskFinished()` 사용 여부 |
| `bTickIntervals` | 틱 간격 제어용 특수 메모리 사용 여부 |
| `Services` | 태스크에 붙은 서비스(Service) 목록 |

> [!tip]
> 커스텀 태스크에서 `TickTask()` 또는 `OnTaskFinished()`를 오버라이드한다면 `INIT_TASK_NODE_NOTIFY_FLAGS()`를 같이 확인해야 합니다.

## NodeMemory와 인스턴싱
태스크 역시 기본적으로 템플릿 노드 공유 방식입니다.
그래서 런타임 상태는 `NodeMemory`에 두는 것이 기본입니다.

또한 `bTickIntervals`가 켜지면 `FBTTaskMemory`를 사용해:
- `NextTickRemainingTime`
- `AccumulatedDeltaTime`

를 관리합니다.

> [!caution]
> 태스크가 인스턴싱되지 않았는데 UObject 멤버에 런타임 상태를 저장하면, 같은 트리를 공유하는 여러 AI 사이에서 상태가 섞일 수 있습니다.

## 대표 기본 제공 태스크
엔진 코드 기준 기본 제공 태스크는 다음과 같습니다.

| 클래스 | 용도 |
|---|---|
| `UBTTask_MoveTo` | 내비게이션 이동 |
| `UBTTask_MoveDirectlyToward` | 직접 이동 |
| `UBTTask_Wait` | 일정 시간 대기 |
| `UBTTask_WaitBlackboardTime` | 블랙보드(Blackboard) 기반 대기 |
| `UBTTask_PlayAnimation` | 애니메이션 재생 |
| `UBTTask_PlaySound` | 사운드 재생 |
| `UBTTask_RunBehavior` | 다른 Behavior Tree 실행 |
| `UBTTask_RunBehaviorDynamic` | 런타임 서브트리 교체 |
| `UBTTask_RunEQSQuery` | EQS 쿼리 실행 |
| `UBTTask_SetKeyValue` | 블랙보드 값 설정 |
| `UBTTask_RotateToFaceBBEntry` | 블랙보드 대상을 향하도록 회전 |
| `UBTTask_FinishWithResult` | 강제 결과 반환 |

## 태스크에 서비스가 붙는 이유
컴포짓(Composite)뿐 아니라 태스크에도 서비스가 붙을 수 있습니다.
즉, 특정 액션이 수행되는 동안에만 의미 있는 백그라운드 갱신을 태스크 범위로 제한할 수 있습니다.

예를 들어:
- `MoveTo`가 실행되는 동안만 타겟 시야를 갱신
- 채널링 중에만 특정 상태를 주기적으로 검사

같은 설계가 가능합니다.

## 학습 포인트
> [!info] 꼭 이해해야 하는 것
> - 태스크의 핵심은 `ExecuteTask()`의 반환값과 `InProgress` 처리 방식이다.
> - 비동기 태스크는 `FinishLatentTask()`를 직접 호출해야 한다.
> - 메시지 기반 완료 모델은 틱 기반보다 더 언리얼스럽다.
> - 태스크도 기본은 템플릿 공유이므로 `NodeMemory` 감각이 중요하다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTTaskNode.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTTaskNode.cpp`
  - `WrappedExecuteTask()`
  - `WrappedAbortTask()`
  - `WrappedTickTask()`
  - `OnMessage()`
  - `FinishLatentTask()`
  - `WaitForMessage()`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BehaviorTreeComponent.cpp`
  - 태스크 실행 구간
  - Abort 처리 구간
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Tasks\BTTask_MoveTo.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Tasks\BTTask_RunBehavior.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Tasks\BTTask_RunEQSQuery.h`

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

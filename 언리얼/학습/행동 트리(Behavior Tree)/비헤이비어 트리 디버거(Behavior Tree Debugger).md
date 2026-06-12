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

# 비헤이비어 트리(Behavior Tree) 디버거(Behavior Tree Debugger)

> [!summary] 요약
> 비헤이비어 트리 디버거(Behavior Tree Debugger)는 AIController, BrainComponent, Blackboard, Behavior Tree 노드가 함께 만드는 AI 의사결정 주제다.
> AI가 선택한 행동이 왜 실행되거나 중단되는지 추적할 때 사용한다.
> 핵심은 Blackboard 값 변화, decorator 조건, abort 범위, task 종료 신호를 같은 흐름에서 보는 것이다.

## 핵심 결론

- Behavior Tree는 노드 배치보다 Blackboard key와 observer/abort 조건 설계가 먼저다.
- task는 반드시 성공, 실패, 진행 중 상태를 명확히 끝내야 한다.
- 문제가 생기면 AIController possession, BrainComponent 실행 상태, Blackboard 값, decorator abort 로그를 확인한다.

## 참고 자료

[Gameplay Debugger](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-debugger?application_version=4.27) | [Behavior Tree User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide)

## 개요
언리얼의 비헤이비어 트리 디버깅은 크게 두 층으로 나뉩니다.

| 층 | 엔진 클래스/도구 | 역할 |
|---|---|---|
| 런타임 기록 | `UBehaviorTreeComponent` | 실행 스텝, 경로, 런타임 설명, 블랙보드(Blackboard) 값을 저장 |
| 에디터 시각화 | `FBehaviorTreeDebugger` | 저장된 데이터를 Behavior Tree Editor UI에 표시 |
| 런타임 오버레이 | `Gameplay Debugger` | 게임 화면 위에 BT/Blackboard 정보를 보여줌 |

이 문서는 그중 **Behavior Tree Editor 내부의 BT Debugger**를 중심으로 봅니다.

> [!info]
> BT 디버거는 "디버그 데이터를 계산하는 시스템"과 "그 데이터를 보여주는 에디터 도구"가 분리되어 있습니다. 런타임이 기록하고, 에디터가 소비합니다.

## 왜 필요한가

AI 문제는 눈에 보이는 task가 아니라 그 task에 도달하기 전의 조건 평가에서 자주 발생한다. 비헤이비어 트리 디버거(Behavior Tree Debugger)를 볼 때는 실행 중인 노드만 보지 말고 Blackboard 변경과 재선택 조건까지 추적해야 한다.

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

## 런타임 쪽: UBehaviorTreeComponent가 저장하는 것
런타임 디버그 데이터의 중심은 `DebuggerSteps`입니다.

관련 구조:
- `FBehaviorTreeDebuggerInstance`
- `FBehaviorTreeExecutionStep`

`FBehaviorTreeExecutionStep`는 다음을 가집니다.

| 필드 | 의미 |
|---|---|
| `InstanceStack` | 현재 트리/서브트리 스택 정보 |
| `BlackboardValues` | 해당 시점의 블랙보드 값 스냅샷 |
| `TimeStamp` | 월드 시간 |
| `ExecutionStepId` | 스텝 식별자 |
| `bIsExecutionPaused` | 이 스텝에서 실행이 일시정지 상태였는지 |

`FBehaviorTreeDebuggerInstance`는 다음을 가집니다.

| 필드 | 의미 |
|---|---|
| `TreeAsset` | 현재 인스턴스가 가리키는 트리 에셋 |
| `RootNode` | 현재 인스턴스 루트 노드 |
| `ActivePath` | 현재 활성 노드의 execution index 경로 |
| `AdditionalActiveNodes` | active aux/service/parallel task 등 추가 활성 노드 |
| `PathFromPrevious` | 직전 상태 대비 탐색/재시작 흐름 |
| `RuntimeDesc` | execution index별 런타임 설명 문자열 |

## 스냅샷은 어떻게 쌓이는가?
핵심 함수는 `UBehaviorTreeComponent::StoreDebuggerExecutionStep()`입니다.

이 함수는:
- 현재 pause 상태
- execution step id
- timestamp
- blackboard snapshot
- instance stack별 debugger instance
- removed instance

를 묶어 하나의 스텝으로 저장합니다.

이 과정에서 추가로:
- `StoreDebuggerSearchStep()`
- `StoreDebuggerRestart()`
- `StoreDebuggerRuntimeValues()`
- `StoreDebuggerBlackboard()`

가 사용됩니다.

> [!tip]
> 즉 디버거에 보이는 “현재 active path”, “검색 실패 경로”, “runtime description”, “blackboard 값”은 전부 런타임에 미리 수집된 데이터입니다.

## 디버그 데이터는 항상 쌓이나?
아닙니다.
`UBehaviorTreeComponent::IsDebuggerActive()`가 true일 때만 유의미한 수집이 일어납니다.

조건은 대략 두 가지입니다.
- 실제 활성 debugger가 존재
- 또는 에디터 설정에서 always gather 옵션이 켜져 있음

그리고 저장 스텝 수는 `UBehaviorTreeManager::MaxDebuggerSteps`에 의해 제한됩니다.

> [!caution]
> 즉 오래 실행한 세션이라도 모든 히스토리가 무한정 남는 것은 아닙니다. 오래된 step은 잘립니다.

## 에디터 쪽: FBehaviorTreeDebugger
`FBehaviorTreeDebugger`는 `BehaviorTreeEditor` 모듈(Module) 쪽 클래스입니다.
핵심 책임은 다음과 같습니다.

| 함수 | 역할 |
|---|---|
| `Setup()` | 에셋/에디터 연결 초기화 |
| `Refresh()` | 현재 상태 강제 갱신 |
| `Tick()` | 실시간 디버거 업데이트 |
| `OnBeginPIE()` / `OnEndPIE()` | PIE 생명주기 연결 |
| `OnObjectSelected()` | 선택된 액터 기준 디버그 대상 전환 |
| `OnTreeStarted()` | 트리가 시작될 때 해당 인스턴스 추적 |
| `UpdateDebuggerInstance()` | 현재 에셋에 대응하는 subtree stack 선택 |
| `UpdateAssetFlags()` | 그래프 노드 활성/이전 활성/트리거 플래그 반영 |
| `UpdateAssetRuntimeDescription()` | 노드별 런타임 설명 문자열 반영 |

## 어떻게 디버그 대상을 찾는가?
디버거는 여러 방법으로 대상 `UBehaviorTreeComponent`를 잡습니다.

- 현재 선택된 액터에서 찾기
- `OnTreeStarted` 이벤트를 통해 새로 시작된 트리 추적
- `FindMatchingTreeInstance()`로 현재 `UBehaviorTreeManager`의 active component 중 matching asset 찾기

즉 디버거가 보는 대상은 단순히 "열어둔 에셋"이 아니라, **실제로 그 에셋을 돌리고 있는 런타임 인스턴스**입니다.

## 브레이크포인트와 스텝 이동
디버거는 에셋 그래프에 설정된 브레이크포인트를 `CollectBreakpointsFromAsset()`로 execution index 목록으로 바꿉니다.

그리고 일시정지 상태에서 다음 이동을 지원합니다.

- `StepForwardInto()`
- `StepForwardOver()`
- `StepBackInto()`
- `StepBackOver()`
- `StepOut()`
- `OpenSubtree()`
- `OpenParentTree()`

이 기능들은 `AreAllGameWorldPaused()`가 true일 때만 활성화됩니다.

> [!tip]
> 즉 BT 디버거의 step 기능은 “PIE가 멈춰 있어야” 제대로 쓸 수 있습니다. 재생 중에는 실시간 추적 쪽이 중심이고, step은 pause 상태 도구입니다.

## 서브트리 디버깅
Behavior Tree는 `RunBehavior`, `RunBehaviorDynamic` 등으로 서브트리를 push할 수 있습니다.
그래서 디버거는 단일 트리만 보는 것이 아니라 instance stack을 봅니다.

이 때문에:
- 현재 보고 있는 에셋과 실제 active subtree가 다를 수 있고
- `OpenSubtree()` / `OpenParentTree()`가 필요하며
- `UpdateDebuggerInstance()`가 현재 tree asset과 matching되는 stack index를 다시 계산합니다.

## 런타임 설명 문자열은 어디서 오나?
`StoreDebuggerRuntimeValues()`는 트리의 모든 노드를 순회하면서 `DescribeRuntimeValues()`를 수집합니다.
그 후 에디터 쪽 `SetNodeRuntimeDescription()` / `SetCompositeDecoratorRuntimeDescription()`가 이를 그래프 노드에 붙입니다.

즉 각 노드 위에 보이는 디버그 텍스트는 결국 노드 클래스가 구현한 `DescribeRuntimeValues()`의 결과입니다.

## Blackboard 값은 어떻게 보이나?
현재 값은 `UpdateDebuggerViewOnTick()`에서 `TreeInstance->StoreDebuggerBlackboard(CurrentValues)`를 호출해 갱신됩니다.
과거 step 값은 `FBehaviorTreeExecutionStep.BlackboardValues`에서 읽습니다.

즉 디버거는:
- 현재 실시간 Blackboard
- 과거 특정 execution step의 Blackboard snapshot

둘 다 볼 수 있습니다.

## Behavior Tree Debugger와 Gameplay Debugger의 차이
| 도구 | 성격 |
|---|---|
| Behavior Tree Debugger | BT 에셋 그래프 위에서 step/history/runtime desc를 보는 정밀 디버거 |
| Gameplay Debugger | 게임 화면 위에서 BT/Blackboard/EQS/Perception을 오버레이로 보는 현장 디버거 |

둘은 경쟁 관계가 아니라 용도가 다릅니다.

- 그래프 단위 원인 분석: BT Debugger
- 실제 플레이 중 상태 확인: Gameplay Debugger

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BehaviorTreeTypes.h`
  - `FBehaviorTreeDebuggerInstance`
  - `FBehaviorTreeExecutionStep`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BehaviorTreeComponent.h`
  - `DebuggerSteps`
  - `StoreDebuggerInstance()`
  - `StoreDebuggerRuntimeValues()`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BehaviorTreeComponent.cpp`
  - `StoreDebuggerExecutionStep()`
  - `StoreDebuggerSearchStep()`
  - `StoreDebuggerRestart()`
  - `StoreDebuggerRuntimeValues()`
  - `StoreDebuggerBlackboard()`
  - `IsDebuggerActive()`
- `Engine\Source\Editor\BehaviorTreeEditor\Private\BehaviorTreeDebugger.h`
- `Engine\Source\Editor\BehaviorTreeEditor\Private\BehaviorTreeDebugger.cpp`
  - `Setup()`
  - `Refresh()`
  - `Tick()`
  - `OnBeginPIE()`
  - `OnObjectSelected()`
  - `OnTreeStarted()`
  - `UpdateDebuggerInstance()`
  - `CollectBreakpointsFromAsset()`
  - `StepForwardInto()`
  - `StepBackInto()`
  - `UpdateDebuggerViewOnTick()`

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
- [[비헤이비어 트리(Behavior Tree)]]
- [[서비스(Service)]]
- [[컴포짓(Composite)]]
- [[태스크(Task)]]

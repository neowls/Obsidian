[Gameplay Debugger](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-debugger?application_version=4.27) | [Behavior Tree User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide)

## 개요
언리얼의 비헤이비어 트리 디버깅은 크게 두 층으로 나뉩니다.

| 층 | 엔진 클래스/도구 | 역할 |
|---|---|---|
| 런타임 기록 | `UBehaviorTreeComponent` | 실행 스텝, 경로, 런타임 설명, 블랙보드 값을 저장 |
| 에디터 시각화 | `FBehaviorTreeDebugger` | 저장된 데이터를 Behavior Tree Editor UI에 표시 |
| 런타임 오버레이 | `Gameplay Debugger` | 게임 화면 위에 BT/Blackboard 정보를 보여줌 |

이 문서는 그중 **Behavior Tree Editor 내부의 BT Debugger**를 중심으로 봅니다.

> [!info]
> BT 디버거는 "디버그 데이터를 계산하는 시스템"과 "그 데이터를 보여주는 에디터 도구"가 분리되어 있습니다. 런타임이 기록하고, 에디터가 소비합니다.

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
`FBehaviorTreeDebugger`는 `BehaviorTreeEditor` 모듈 쪽 클래스입니다.
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

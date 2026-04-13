[Behavior Tree Node Reference: Composites](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-composites) | [Behavior Tree Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

## 개요
**컴포짓(Composite)** 노드는 분기의 루트이자, 어떤 자식을 다음에 실행할지를 결정하는 노드입니다.
엔진 코드 기준으로 `UBTCompositeNode`는 자식 노드 배열, 데코레이터 배열, 서비스 배열, 그리고 분기 실행용 메모리를 함께 소유합니다.

컴포짓은 단순히 "자식들을 묶는 그룹"이 아니라, 실제 탐색 루프에서 **다음 실행 후보를 선택하는 규칙 객체**입니다.

## 핵심 구조
| 항목 | 엔진 기준 | 의미 |
|---|---|---|
| 자식 배열 | `TArray<FBTCompositeChild> Children` | 각 자식의 태스크/하위 컴포짓/데코레이터 묶음 |
| 서비스 배열 | `TArray<UBTService*> Services` | 컴포짓 분기 활성 중 같이 살아있는 보조 노드 |
| 런타임 메모리 | `FBTCompositeMemory` | 현재 자식 인덱스, override 자식 인덱스 저장 |
| 데코레이터 검사 | `DoDecoratorsAllowExecution()` | 자식 진입 가능 여부 판정 |
| 자식 선택 | `GetNextChildHandler()` | Selector/Sequence/Simple Parallel의 핵심 차이 지점 |
| 데코레이터 스코프 | `bApplyDecoratorScope` | 분기를 벗어날 때 하위 데코레이터 제거 여부 |

> [!info]
> 루트(Root) 아래에 바로 붙을 수 있는 것은 컴포짓뿐입니다. 실제 `UBehaviorTree`도 `RootNode`를 `UBTCompositeNode`로 보관합니다.

## 런타임에서 무엇을 하나?
`UBTCompositeNode::FindChildToExecute()`는 다음 순서로 동작합니다.

1. 현재 자식 기준으로 다음 후보 child index 계산
2. 해당 자식의 데코레이터를 평가
3. 통과하면 `OnChildActivation()` 호출
4. 실패하면 다음 자식으로 이동
5. 더 이상 실행할 자식이 없으면 부모로 복귀

즉, 컴포짓은 "자식을 순회하는 컨테이너"가 아니라, **탐색(Search)의 핵심 제어 노드**입니다.

## 종류
### Selector
![[Pasted image 20250122155701.png]]
엔진 클래스는 `UBTComposite_Selector`입니다.

핵심 로직은 `GetNextChildHandler()`에 있으며:
- 처음 진입 시 첫 번째 자식부터 시작
- 현재 자식이 `Failed`일 때 다음 자식으로 이동
- 어떤 자식이든 `Succeeded`하면 즉시 종료

즉, **성공할 때까지 왼쪽에서 오른쪽으로 시도**합니다.

| 프로퍼티 | 설명 |
|---|---|
| `Apply Decorator Scope` | 분기를 떠날 때 하위 데코레이터 정리 여부 |
| `Node Name` | 그래프 표시 이름 |

### Sequence
![[Pasted image 20250122155723.png]]
엔진 클래스는 `UBTComposite_Sequence`입니다.

핵심 로직은:
- 처음 진입 시 첫 번째 자식부터 시작
- 현재 자식이 `Succeeded`일 때 다음 자식으로 이동
- 어떤 자식이든 `Failed`하면 즉시 종료

즉, **실패할 때까지 순서대로 수행**합니다.

| 프로퍼티 | 설명 |
|---|---|
| `Apply Decorator Scope` | 분기를 떠날 때 하위 데코레이터 정리 여부 |
| `Node Name` | 그래프 표시 이름 |

> [!tip]
> 엔진 코드에서 `UBTComposite_Sequence::CanAbortLowerPriority()`는 `false`입니다. 즉 시퀀스는 본질적으로 "순서 보장"이 중요하므로, lower priority abort와는 잘 맞지 않습니다.

### Simple Parallel
![[Pasted image 20250122155738.png]]
엔진 클래스는 `UBTComposite_SimpleParallel`입니다.

구조적으로:
- 메인 자식 1개는 반드시 태스크
- 보조 자식 1개는 전체 서브트리 가능
- 런타임 메모리로 `FBTParallelMemory`를 사용
- `FinishMode`에 따라 메인 태스크 종료 후 보조 트리 처리 방식을 결정

| 프로퍼티 | 설명 |
|---|---|
| `Finish Mode` | `Immediate(AbortBackground)`: 메인 종료 시 보조 트리 중단 / `Delayed(WaitForBackground)`: 보조 트리 완료까지 대기 |
| `Node Name` | 그래프 표시 이름 |

> [!info]
> 언리얼은 복잡한 일반 병렬 노드 대신 `Simple Parallel + Service + Decorator Abort` 조합을 기본 병행 처리 모델로 사용합니다.

## 데코레이터와 서비스는 어디에 붙는가?
컴포짓의 각 child link는 다음을 함께 가질 수 있습니다.

- 데코레이터: 자식 진입/Abort 제어
- 서비스: 분기 활성 중 지식 갱신
- 자식 노드: 태스크 또는 하위 컴포짓

즉 컴포짓은 실제로 "분기 메타데이터의 집합"을 관리합니다.

## Apply Decorator Scope의 의미
`bApplyDecoratorScope`가 켜져 있으면, 실행이 해당 분기를 떠날 때 **그 아래에서 활성화된 데코레이터를 정리**합니다.

이 옵션은 특히:
- 관찰 중인 데코레이터를 분기 단위로 깔끔하게 해제하고 싶을 때
- 분기 전환 시 하위 데코레이터 상태를 명확하게 리셋하고 싶을 때

의미가 있습니다.

## 엔진 코드 기준으로 보면 중요한 함수
| 함수 | 의미 |
|---|---|
| `FindChildToExecute()` | 다음 실행 child 결정 |
| `DoDecoratorsAllowExecution()` | child link의 데코레이터 논리 평가 |
| `OnChildActivation()` | child 진입 처리 |
| `OnChildDeactivation()` | child 종료 처리 및 서비스/데코레이터 정리 |
| `SetChildOverride()` | 특정 child로 다음 실행 강제 |
| `GetChildExecutionIndex()` | 디버깅/우선순위 계산용 실행 인덱스 계산 |

## 학습 포인트
> [!info] 이 문서에서 꼭 잡아야 할 것
> - Selector와 Sequence의 차이는 사실상 `GetNextChildHandler()` 규칙 차이이다.
> - 컴포짓은 자식 노드뿐 아니라 데코레이터/서비스 묶음을 함께 관리한다.
> - Simple Parallel만 별도 메모리와 병행 실행 규칙을 가진다.
> - `Apply Decorator Scope`는 에디터 옵션이 아니라 런타임 정리 범위를 바꾸는 플래그다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTCompositeNode.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTCompositeNode.cpp`
  - `FindChildToExecute()`
  - `DoDecoratorsAllowExecution()`
  - `OnChildActivation()`
  - `OnChildDeactivation()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Composites\BTComposite_Selector.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\Composites\BTComposite_Selector.cpp`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Composites\BTComposite_Sequence.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\Composites\BTComposite_Sequence.cpp`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Composites\BTComposite_SimpleParallel.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\Composites\BTComposite_SimpleParallel.cpp`

---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/ue-systems
  - type/learning
---

# StateTree, MassEntity, SmartObjects

> [!summary] 요약
> StateTree, MassEntity, SmartObjects은 큰 월드, 런타임 시스템, 데이터 계층, procedural generation, 대규모 AI 객체가 함께 동작하는 월드 관리 주제다.
> 스트리밍, 생성, 활성화, 대량 객체 처리 결과가 예상과 다를 때 확인한다.
> 핵심은 editor-time 데이터와 runtime 활성 상태, persistent 객체와 streaming 객체를 구분하는 것이다.

## 핵심 결론

- World Partition, Data Layer, PCG, Mass/SmartObjects는 로드 상태와 활성 상태를 분리해서 봐야 한다.
- 큰 월드 시스템은 actor reference, streaming cell, runtime generation source가 엇갈리면 문제가 생긴다.
- 문제가 생기면 cell/layer 상태, generation source, subsystem 등록, persistent collection을 순서대로 확인한다.

## 참고 자료

[StateTree in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/state-tree-in-unreal-engine?application_version=5.7) | [Mass Entity in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/pt-br/unreal-engine/mass-entity-in-unreal-engine?application_version=5.7) | [Smart Objects Overview | Unreal Engine 5.7 Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/smart-objects-in-unreal-engine---overview?application_version=5.7)

## 개요
`StateTree`, `MassEntity`, `SmartObjects`는 UE5 계열에서 AI/대규모 시뮬레이션/상호작용을 더 데이터 지향적으로 다루기 위한 확장 시스템이다.
기존 `Behavior Tree + Blackboard`만으로 모든 AI를 처리하기보다, 상태 전이, 군중 처리, 월드 상호작용 예약을 각각 분리해서 볼 수 있다.

## 왜 필요한가

월드 관리 문제는 객체가 "없다"기보다 아직 로드되지 않았거나 활성화되지 않은 상태일 때가 많다. StateTree, MassEntity, SmartObjects을 볼 때는 데이터가 존재하는 위치와 런타임에 활성화되는 시점을 구분해야 한다.

## 작동 모델

World Partition은 월드를 cell 단위로 나누고 streaming source를 기준으로 로드한다. Data Layer와 PCG, SmartObjects, MassEntity 같은 시스템은 로드된 world 상태 위에서 별도의 활성화, generation, registration 절차를 수행한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| World Partition / Cell | 월드 스트리밍 단위 | grid, loading range, spatially loaded |
| Data Layer | actor 묶음의 활성/로드 상태 | asset, instance, runtime state |
| PCG Component / Graph | 절차적 생성 실행 | generation source, partitioned mode |
| SmartObject / Mass | 대량 상호작용/엔티티 관리 | registration, persistent collection |
| Subsystem | 월드 단위 시스템 상태 | init, tick, runtime data |

## 실행 흐름

1. 에디터에서 actor, graph, layer, smart object 데이터가 저장된다.
2. cook 또는 world open 시 descriptor와 registry가 런타임 데이터를 준비한다.
3. streaming source와 runtime state가 어떤 cell/layer를 로드하거나 활성화할지 결정한다.
4. PCG, SmartObject, Mass 같은 시스템이 로드된 객체를 등록하거나 생성한다.
5. streaming 변화와 상태 전환에 맞춰 참조, navigation, AI, save data를 갱신한다.

## 세 시스템의 역할
| 시스템 | 핵심 역할 | 기존 시스템과의 관계 |
| --- | --- | --- |
| StateTree | hierarchical state machine + selector + transition | Behavior Tree보다 상태 전이 표현이 직접적 |
| MassEntity | fragment/processor 기반 대량 entity 처리 | actor 중심보다 데이터 지향적 |
| SmartObjects | 월드 상호작용 지점의 검색/예약/사용 | AI가 사용할 world affordance 제공 |

## StateTree
StateTree는 상태, 조건, evaluator, task, transition으로 동작을 구성한다.
AI뿐 아니라 일반 gameplay state에도 쓸 수 있지만, task가 월드 오브젝트와 연결될 때 lifetime과 ownership을 명확히 해야 한다.

| 요소 | 역할 |
| --- | --- |
| `UStateTree` | StateTree asset |
| `UStateTreeComponent` | gameplay actor에서 StateTree 실행 |
| `UStateTreeAIComponent` | AI/BrainComponent 계층과 연결된 실행 컴포넌트 |
| `UStateTreeSchema` | 어떤 context/task/evaluator를 허용할지 제한 |
| `FStateTreeExecutionContext` | runtime execution context |

## MassEntity
MassEntity는 많은 개체를 actor 하나씩 tick하지 않고 fragment와 processor로 처리하는 시스템이다.
NPC 군중, crowd, traffic, swarm처럼 수가 많고 동질적인 업데이트가 필요한 곳에 맞다.

| 요소 | 역할 |
| --- | --- |
| `FMassEntityHandle` | entity 식별자 |
| Fragment | entity가 가진 데이터 조각 |
| Tag | 상태를 나타내는 marker |
| Processor | query에 맞는 entity batch를 처리 |
| `FMassEntityManager` | entity 생성, fragment 구성, query 실행 기반 |
| `UMassEntitySubsystem` | world subsystem 진입점 |

## SmartObjects
SmartObject는 월드 안의 상호작용 지점을 검색하고 예약하는 시스템이다.
SmartObject 자체는 행동 실행 로직을 담기보다, 어떤 agent가 어떤 slot을 사용할 수 있는지와 필요한 data를 제공한다.

| 요소 | 역할 |
| --- | --- |
| `USmartObjectSubsystem` | 검색, claim, use, release를 담당 |
| `USmartObjectComponent` | actor를 smart object로 등록 |
| `USmartObjectDefinition` | slot, tag, behavior definition 같은 immutable data |
| Persistent Collection | streaming 상태와 별개로 유지할 smart object 묶음 |
| Claim Handle | slot 예약 결과 |

## 함께 쓰는 흐름 예시
1. Mass agent가 주변 SmartObject를 query한다.
2. SmartObjectSubsystem이 조건과 tag에 맞는 free slot을 반환한다.
3. agent가 slot을 claim한다.
4. StateTree가 `Approach -> Use -> Release` 상태 전이를 관리한다.
5. 사용이 끝나거나 중단되면 claim handle을 release한다.

> [!caution]
> SmartObject slot은 반드시 release되어야 한다. StateTree task 중단, agent death, streaming unload 같은 예외 경로에서 release가 빠지면 slot이 점유된 상태로 남을 수 있다.

## 엔진 소스 참고 포인트
- `Engine\Plugins\Runtime\StateTree\Source\StateTreeModule\Public\StateTree.h`: `UStateTree` asset.
- `Engine\Plugins\Runtime\GameplayStateTree\Source\GameplayStateTreeModule\Public\Components\StateTreeComponent.h`: runtime component.
- `Engine\Source\Runtime\MassEntity\Public\MassEntityManager.h`: entity manager.
- `Engine\Source\Runtime\MassEntity\Public\MassEntitySubsystem.h`: Mass world subsystem.
- `Engine\Plugins\Runtime\SmartObjects\Source\SmartObjectsModule\Public\SmartObjectSubsystem.h`: search/claim/use/release 중심.
- `Engine\Plugins\Runtime\SmartObjects\Source\SmartObjectsModule\Public\SmartObjectComponent.h`: actor 등록 component.
- `Engine\Plugins\Runtime\SmartObjects\Source\SmartObjectsModule\Public\SmartObjectDefinition.h`: definition asset.

## 2026-05-12 심화 보강: StateTree, MassEntity, SmartObjects를 함께 쓰는 사고방식

### 학습 목표

- StateTree, MassEntity, SmartObjects가 각각 어떤 문제를 해결하는지 구분한다.
- 대규모 NPC, 상호작용 지점, AI 상태 전환을 한 시스템처럼 설계하는 방법을 익힌다.
- 엔진 소스 구조를 기준으로 상태 평가, 엔티티 처리, 스마트 오브젝트(Smart Object) claim/use 흐름을 이해한다.

### 세 시스템의 역할

StateTree는 AI나 게임플레이 상태를 계층적인 상태와 transition으로 표현한다. Behavior Tree보다 데이터 중심 상태 머신에 가깝고, 조건, evaluator, task를 조합해 현재 무엇을 해야 하는가를 결정한다.

MassEntity는 많은 수의 개체를 Actor 하나하나로 관리하지 않고 fragment/tag/processor 기반으로 처리하는 대량 엔티티 시스템이다. 군중, 교통, 야생동물, 단순 NPC처럼 수백~수천 개체를 다룰 때 적합하다.

SmartObjects는 월드의 사용 가능한 상호작용 지점을 표현한다. 의자, 엄폐물, 작업대, 문, 상점 카운터처럼 AI가 가서 사용할 수 있는 슬롯을 제공한다.

### 함께 쓰는 대표 패턴

도시 NPC를 예로 들면 세 시스템은 다음처럼 나눌 수 있다.

- MassEntity: NPC 군중의 위치, 이동 목표, 간단한 상태 fragment를 대량 처리한다.
- SmartObjects: 벤치, 상점, 버스 정류장 같은 사용 지점을 제공한다.
- StateTree: 개별 NPC가 이동, 대기, 대화, 도망, 작업 같은 상태를 전환한다.

이렇게 나누면 모든 NPC를 무거운 Actor AI로 돌리는 구조를 피할 수 있다. 가까운 NPC나 상호작용 중인 NPC만 Actor로 승격하고, 멀리 있는 군중은 Mass로 가볍게 처리하는 설계도 가능하다.

### StateTree 사용 흐름

1. StateTree Asset을 만든다.
2. Evaluator에서 현재 월드 정보나 Blackboard 비슷한 입력 데이터를 갱신한다.
3. State에 조건을 붙여 진입 가능 여부를 정한다.
4. Task에서 실제 동작을 수행한다.
5. Transition으로 성공, 실패, 이벤트, 시간 조건에 따른 다음 상태를 정의한다.

예를 들어 경비병 AI는 다음 구조로 만들 수 있다.

- Root
- Patrol: 순찰 지점으로 이동한다.
- Investigate: 소음 위치를 확인한다.
- Chase: 플레이어를 추격한다.
- Search: 마지막 목격 지점 주변을 탐색한다.
- Return: 원래 순찰 경로로 복귀한다.

Task는 상태에 들어갔을 때 시작하고, Tick에서 진행하며, 완료/실패를 반환하는 작은 동작 단위로 설계한다. 하나의 Task가 이동, 공격, 대화, 애니메이션까지 모두 처리하면 재사용성이 떨어진다.

### StateTree Task 예시

```cpp
USTRUCT()
struct FMoveToSmartObjectTask : public FStateTreeTaskCommonBase
{
    GENERATED_BODY()

    using FInstanceDataType = FMoveToSmartObjectTaskInstanceData;

    virtual EStateTreeRunStatus EnterState(FStateTreeExecutionContext& Context, const FStateTreeTransitionResult& Transition) const override;
    virtual EStateTreeRunStatus Tick(FStateTreeExecutionContext& Context, const float DeltaTime) const override;
    virtual void ExitState(FStateTreeExecutionContext& Context, const FStateTreeTransitionResult& Transition) const override;
};
```

핵심은 Task 내부에서 장기 소유권(Ownership)을 잡는 리소스를 사용했다면 `ExitState`에서 반드시 정리하는 것이다. SmartObject slot을 claim한 상태에서 StateTree가 다른 상태로 넘어갔는데 release하지 않으면 다른 AI가 그 슬롯을 영원히 못 쓰는 문제가 생긴다.

### SmartObject 사용 흐름

SmartObject는 보통 다음 순서로 사용한다.

1. AI가 주변에서 조건에 맞는 SmartObject slot을 검색한다.
2. 사용할 slot을 claim한다.
3. 해당 위치로 이동한다.
4. 도착 후 use를 시작한다.
5. 사용이 끝나면 release한다.

의자 예시로 보면 slot은 앉을 위치와 방향, 사용 가능한 조건, 행동 정의를 담는다. AI는 의자 Actor를 직접 소유하지 않고 SmartObject Subsystem을 통해 slot 사용권을 얻는다.

```cpp
// 의사 코드: 실제 API 이름은 프로젝트의 SmartObjects 버전 헤더에 맞춰 확인한다.
FSmartObjectClaimHandle Claim = SmartObjectSubsystem->Claim(SlotHandle, UserActor);
if (Claim.IsValid())
{
    MoveTo(SmartObjectSubsystem->GetSlotTransform(Claim));
    SmartObjectSubsystem->Use(Claim, UserActor);
}
```

### MassEntity의 동작 원리

Mass는 UObject/Actor 중심이 아니라 데이터 조각 중심으로 동작한다.

- Fragment: 위치, 속도, 목표, 체력 같은 데이터 조각.
- Tag: 특정 상태를 나타내는 빈 표식.
- Processor: 특정 fragment 조합을 가진 entity chunk를 순회하며 처리하는 시스템.
- Archetype: 같은 fragment 구성을 가진 entity 묶음.

Actor 1,000개가 각자 Tick을 도는 구조와 달리, Mass Processor는 같은 데이터 구성을 가진 entity chunk를 모아서 처리한다. 이 방식은 CPU cache locality가 좋아지고, 반복 처리 비용이 줄어든다. 대신 Actor처럼 개별 객체에 자유롭게 포인터를 붙이고 이벤트를 난사하는 방식과는 사고방식이 다르다.

### Mass Processor 예시

```cpp
void UMoveToTargetProcessor::ConfigureQueries()
{
    EntityQuery.AddRequirement<FTransformFragment>(EMassFragmentAccess::ReadWrite);
    EntityQuery.AddRequirement<FMoveTargetFragment>(EMassFragmentAccess::ReadOnly);
}

void UMoveToTargetProcessor::Execute(FMassEntityManager& EntityManager, FMassExecutionContext& Context)
{
    EntityQuery.ForEachEntityChunk(EntityManager, Context, [this](FMassExecutionContext& Context)
    {
        const TArrayView<FTransformFragment> Transforms = Context.GetMutableFragmentView<FTransformFragment>();
        const TConstArrayView<FMoveTargetFragment> Targets = Context.GetFragmentView<FMoveTargetFragment>();

        for (int32 Index = 0; Index < Context.GetNumEntities(); ++Index)
        {
            // 현재 위치를 목표 위치 쪽으로 이동시킨다.
        }
    });
}
```

이 예시는 Mass의 핵심을 보여준다. Processor는 개별 entity 객체를 직접 들고 있는 것이 아니라, fragment view를 받아 배열처럼 처리한다.

### 사례: 군중 NPC가 벤치에 앉기

1. Mass Processor가 휴식 필요 fragment를 가진 군중 entity를 찾는다.
2. 가까운 벤치 SmartObject slot을 검색한다.
3. slot을 claim하면 entity에 `ReservedSmartObjectFragment`를 붙인다.
4. 가까운 거리까지 이동하면 해당 NPC를 Actor로 승격하거나 animation representation을 전환한다.
5. StateTree가 SitDown, Idle, StandUp 상태를 실행한다.
6. 끝나면 SmartObject claim을 release하고 Mass entity 상태를 이동 상태로 되돌린다.

이 사례의 핵심은 대량 처리와 정교한 상호작용을 같은 레벨의 Actor AI로 처리하지 않는다는 점이다. 멀리 있는 NPC는 Mass로, 가까운 상호작용은 SmartObject와 StateTree로 처리한다.

### 자주 막히는 문제

- StateTree가 상태를 빠져나오지 않는다: Transition 조건, Task 반환값, external event 수신 여부를 확인한다.
- SmartObject slot이 계속 점유된다: 실패/중단/상태 전환 경로에서 release했는지 확인한다.
- Mass Processor가 실행되지 않는다: Processing Phase, Query requirement, fragment/tag 구성을 확인한다.
- Actor와 Mass entity 상태가 어긋난다: Actor 승격/강등 시 데이터 동기화 지점을 명확히 한다.
- 디버깅이 어렵다: Mass Debugger, StateTree Debugger, SmartObject Debug draw를 함께 사용한다.

### 실습 과제

1. StateTree로 단순 Patrol/Investigate/Return 경비병을 만든다.
2. 의자 SmartObject를 만들고 AI가 claim/use/release하는 흐름을 디버그한다.
3. Mass entity 500개를 만들어 목표 지점으로 이동시키고 Actor 500개 Tick 방식과 비교한다.
4. 군중 중 일부만 Actor로 승격해 SmartObject 상호작용을 수행하게 만든다.

### 부가 자료

- 공식 문서: StateTree, MassEntity, Smart Objects.
- 엔진 소스: `Engine\Plugins\Runtime\StateTree`.
- 엔진 소스: `Engine\Plugins\Runtime\MassEntity`.
- 엔진 소스: `Engine\Plugins\Runtime\SmartObjects`.
- 디버깅 도구: StateTree Debugger, Mass Debugger, SmartObject debug visualization.

## 2026-05-12 심화 보강 보완: 기본 절차 요약

### 기본 사용 절차 요약

1. 많은 개체를 가볍게 처리해야 하는지 먼저 판단하고, 그렇다면 MassEntity fragment/tag/processor 설계를 잡는다.
2. 월드에 AI가 사용할 수 있는 지점이 필요하면 SmartObject Asset과 slot을 만든다.
3. 개별 행동의 상태 전환이 필요하면 StateTree Asset을 만들고 evaluator, condition, task, transition을 나눈다.
4. SmartObject를 claim한 Task는 성공, 실패, 중단 경로에서 모두 release하도록 작성한다.
5. Mass entity와 Actor 표현을 섞는 경우 승격/강등 시점과 데이터 동기화 방향을 문서화한다.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 에디터에 배치된 actor는 런타임에 항상 존재한다. | streaming cell과 Data Layer runtime state를 확인한다. |
| 로드 상태와 활성 상태는 같다. | loaded, activated, generated, registered 상태를 분리한다. |
| 대규모 시스템은 actor 참조로 직접 연결해도 된다. | descriptor, subsystem, registry 기반 연결을 우선 검토한다. |

## 디버깅 체크리스트

- [ ] streaming source, loading range, runtime cell 상태를 확인했다.
- [ ] Data Layer asset/instance와 runtime state가 의도대로 전환된다.
- [ ] PCG generation source와 partitioned mode 설정을 확인했다.
- [ ] SmartObject/Mass/AI 등록이 streaming 변화 후 다시 갱신된다.
- [ ] packaged build에서 editor-only reference나 uncooked data에 의존하지 않는다.

## 관련 문서

- 관련 문서가 아직 정리되지 않았다.

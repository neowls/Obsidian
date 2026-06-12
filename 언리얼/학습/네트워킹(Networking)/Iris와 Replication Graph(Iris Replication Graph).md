---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/networking
  - type/learning
---

# Iris와 Replication Graph(Iris Replication Graph)

> [!summary] 요약
> Iris와 Replication Graph는 많은 actor와 복제(Replication) 데이터를 다룰 때 replication filtering, serialization, relevancy 계산을 확장하는 Unreal 네트워킹 시스템이다.
> 대규모 월드, 많은 actor, 복잡한 relevancy 조건 때문에 기본 복제 비용이 커질 때 검토한다.
> 핵심은 무엇을 누구에게 보낼지 결정하는 필터링 계층과 실제 데이터를 직렬화하는 복제 계층을 분리해서 보는 것이다.

## 핵심 결론

- Replication Graph는 actor를 connection별로 어떤 노드/공간/조건을 통해 보낼지 최적화한다.
- Iris는 최신 replication framework로 state descriptor, replication state, filtering/condition 구조를 통해 복제를 관리한다.
- 복제 누락이나 비용 문제가 있으면 relevancy 노드, dormancy, frequency, connection filter, Iris enable 상태를 확인한다.

## 참고 자료

[Iris Replication System in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/iris-replication-system-in-unreal-engine?application_version=5.7) | [Replication Graph overview and proper replication methods](https://www.unrealengine.com/en-US/tech-blog/replication-graph-overview-and-proper-replication-methods)

## 개요
`Iris`와 `Replication Graph`는 둘 다 복제 부하를 줄이기 위한 네트워킹 확장 축이다.
다만 해결하는 층이 다르다. `Replication Graph`는 어떤 액터를 어떤 connection에 고려할지 정하는 relevancy/scheduling 구조이고, `Iris`는 replicated object의 상태를 분리된 replication system이 관리하도록 바꾸는 복제 백엔드에 가깝다.

기존 문서 `[[언리얼 네트워킹]]`, `[[Replication]]`, `[[RPC]]`, `[[Fast Array, Component, Subobject(FastArray Component Subobject)]]`를 읽은 뒤 이 문서를 보는 것이 좋다.

> [!info]
> UE 5.7 설치본 기준 Iris 소스는 계획 문서에 적혀 있던 `Runtime\IrisCore`가 아니라 `Engine\Source\Runtime\Net\Iris`와 `Engine\Source\Runtime\Engine\Private\Net\Iris`에 있다.

## 왜 필요한가

네트워크 버그는 기능 코드가 틀려서보다 실행 위치와 복제 조건을 잘못 가정해서 생기는 경우가 많다. Iris와 Replication Graph(Iris Replication Graph)을 볼 때는 "서버의 사실", "클라이언트의 요청", "복제로 전달되는 상태"를 분리해야 한다.

## 작동 모델

서버가 게임 상태의 기준을 갖고, 클라이언트는 입력을 요청하거나 복제된 결과를 받는다. actor channel, relevancy, dormancy, update frequency는 어떤 객체가 언제 어떤 클라이언트에 전달되는지를 결정한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| `AActor` | 복제 대상의 기본 단위 | `bReplicates`, relevancy, dormancy |
| `UNetDriver` / `UNetConnection` | 연결과 패킷 흐름 관리 | client connection, channel 상태 |
| Owner / `PlayerController` | Client RPC 호출 가능 여부 결정 | owning connection 존재 여부 |
| Replicated Property | 오래 남는 상태 동기화 | RepNotify, 조건, 초기값 |
| RPC | 순간 요청 또는 이벤트 전달 | 호출 위치, reliable 여부, 대상 |

## 실행 흐름

1. 서버가 actor를 생성하거나 상태를 변경한다.
2. NetDriver가 relevancy와 priority를 기준으로 actor channel을 갱신한다.
3. 변경된 property가 조건에 맞는 클라이언트로 복제된다.
4. RPC는 호출 주체와 owner connection 조건을 통과할 때만 원격 실행된다.
5. 클라이언트는 OnRep, prediction correction, visual update 순서로 결과를 반영한다.

## 핵심 구분
| 항목 | Classic Replication | Replication Graph | Iris |
| --- | --- | --- | --- |
| 주된 관심사 | actor channel, property layout, RPC | connection별 actor list 구성 | replicated object 상태, fragment, handle, filtering/prioritization |
| 스케일링 포인트 | actor를 connection마다 검사 | graph node가 actor list를 캐시/분배 | replication state를 게임 객체와 분리하고 connection별 상태를 관리 |
| 대표 진입점 | `UNetDriver`, `UActorChannel`, `FObjectReplicator` | `UReplicationGraph`, `UReplicationGraphNode` | `UReplicationSystem`, `UObjectReplicationBridge`, `FNetRefHandle` |
| 적용 감각 | 기본값 | 대규모 actor relevancy 최적화 | 새로운 복제 시스템 opt-in |

## Replication Graph
`Replication Graph`는 전통적인 복제의 relevancy 계산을 프로젝트 규칙에 맞게 재구성하는 플러그인(Plugin)이다.
핵심 아이디어는 모든 actor를 모든 connection에 매번 검사하지 않고, persistent graph node가 actor list를 유지하면서 connection별 replication list를 만든다는 점이다.

## 주요 노드
| 노드 | 역할 |
| --- | --- |
| `UReplicationGraph` | replication driver 본체 |
| `UReplicationGraphNode` | replication list를 만드는 기본 노드 |
| `UReplicationGraphNode_ActorList` | 단순 actor list 보관 |
| `UReplicationGraphNode_GridSpatialization2D` | 월드 공간을 2D grid로 나누어 actor를 분배 |
| `UReplicationGraphNode_AlwaysRelevant` | 항상 relevant한 actor 처리 |
| `UReplicationGraphNode_AlwaysRelevant_ForConnection` | connection별 always relevant actor 처리 |
| `UReplicationGraphNode_DormancyNode` | dormant actor list 최적화 |

## 실무 해석
- player state, game state처럼 전체가 봐야 하는 actor는 always relevant 계층으로 둔다.
- pawn, projectile, pickup처럼 공간 relevance가 강한 actor는 spatial node에 넣는다.
- actor 종류별로 frequency bucket을 나누면 매 프레임 고려량을 줄일 수 있다.
- 작은 프로젝트에서는 기본 복제가 더 단순하다. Replication Graph는 대규모 connection/actor 수에서 의미가 크다.

## Iris
Iris는 replicated state를 게임 객체와 직접 묶어 처리하던 전통 경로를 더 분리한다.
객체는 `NetRefHandle`로 식별되고, 실제 복제 가능한 상태는 `ReplicationFragment`와 `ReplicationStateDescriptor` 같은 구조로 표현된다.

## 주요 요소
| 요소 | 역할 |
| --- | --- |
| `UReplicationSystem` | Iris replication의 상위 시스템 |
| `UReplicationBridge` | 게임 객체와 Iris replicated object 사이의 다리 |
| `UObjectReplicationBridge` | `UObject` 계열 객체 복제를 위한 bridge 구현 |
| `FNetRefHandle` | Iris가 replicated object를 식별하는 핸들 |
| `FReplicationFragment` | 객체 상태 일부를 replication state에 바인딩 |
| `FReplicationStateDescriptor` | 어떤 상태를 어떤 serializer로 보낼지 설명하는 메타데이터 |
| `FNetObjectFilter` | connection별 복제 필터 |
| `FNetObjectPrioritizer` | 무엇을 먼저 보낼지 결정하는 우선순위 계층 |

## 기존 문서와의 연결
`Fast Array` 문서에서 정리한 `FFastArraySerializer`는 Iris에서도 별도 연결점이 있다.
UE 5.7 소스에는 `IrisFastArraySerializer.cpp`, `FastArrayReplicationFragment.cpp`, `FastArraySerializerImplementation.h`가 존재한다.
즉 Fast Array는 classic replication만의 기술이 아니라 Iris 경로에서도 별도 fragment/serializer로 다뤄진다.

## 디버깅 체크리스트
- Iris를 켰는지부터 확인한다. 문법이 호환되어도 프로젝트가 자동으로 Iris 경로를 타는 것은 아니다.
- property가 등록되지 않은 문제인지, Iris fragment가 구성되지 않은 문제인지 구분한다.
- object가 `NetRefHandle`을 받았는지 확인한다.
- connection filter에서 빠지는지, prioritizer에서 밀리는지 분리해서 본다.
- Fast Array 문제가 있으면 classic 경로와 Iris 경로를 따로 재현한다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Net\Iris\Public\Iris\ReplicationSystem\ReplicationSystem.h`: `UReplicationSystem` 정의.
- `Engine\Source\Runtime\Net\Iris\Public\Iris\ReplicationSystem\ObjectReplicationBridge.h`: `UObjectReplicationBridge`와 object bridge 구조.
- `Engine\Source\Runtime\Net\Iris\Public\Iris\ReplicationSystem\NetRefHandle.h`: Iris object 식별 핸들.
- `Engine\Source\Runtime\Net\Iris\Public\Iris\ReplicationState\ReplicationStateDescriptor.h`: state descriptor 구조.
- `Engine\Source\Runtime\Net\Iris\Private\Iris\ReplicationSystem\FastArrayReplicationFragment.cpp`: Iris Fast Array 연결점.
- `Engine\Plugins\Runtime\ReplicationGraph\Source\Public\ReplicationGraph.h`: Replication Graph 노드와 driver 정의.

## 2026-05-12 심화 보강: 실제 프로젝트에서 복제 설계를 세우는 법

### 학습 목표

- `bReplicates = true`만으로 끝나는 복제와 Replication Graph/Iris가 필요한 복제의 차이를 구분한다.
- 월드에 존재하는 액터 수, 연결 수, 액터 중요도에 따라 어떤 액터를 어떤 클라이언트에게 보낼지 설계한다.
- 엔진 코드 기준으로 Replication Graph가 액터 목록을 만들고, Iris가 객체 상태를 기술하고 전송하는 흐름을 이해한다.

### 언제 필요한가

일반적인 소규모 협동 게임은 액터의 `bReplicates`, `NetCullDistanceSquared`, `NetUpdateFrequency`, `COND_OwnerOnly` 같은 기본 설정만으로 충분할 수 있다. 그러나 플레이어 수가 늘어나고 월드에 복제 액터가 많아지면 서버는 매 네트워크 틱마다 모든 액터를 모든 연결에 대해 검사하는 비용을 감당해야 한다. Replication Graph는 이 비용을 줄이기 위해 액터를 노드에 분류해두고, 연결마다 필요한 노드만 조회하게 만든다.

예를 들어 오픈월드 PvE에서 몬스터 4,000마리, 아이템 10,000개, 플레이어 80명이 있다고 가정한다. 모든 플레이어에게 모든 몬스터를 검사하면 네트워크 틱마다 수십만 단위의 relevance 검사가 발생한다. 이때 몬스터는 2D Grid 노드, 전역 보스 알림 액터는 AlwaysRelevant 노드, 플레이어 전용 퀘스트 액터는 AlwaysRelevantForConnection 노드에 넣으면 클라이언트별 후보 액터 수가 크게 줄어든다.

### 기본 사용 절차

1. 복제 정책을 먼저 표로 나눈다.
   - 전역 액터: GameState, MatchState, 보스 체력 UI처럼 모든 클라이언트가 알아야 하는 액터.
   - 공간 액터: 몬스터, 투사체, 드랍 아이템처럼 위치 기반으로 가까운 클라이언트에게만 필요한 액터.
   - 소유자 액터: 인벤토리, 개인 퀘스트, 입력 예측 보조 액터처럼 특정 연결에만 필요한 액터.
2. `UReplicationGraph` 파생 클래스를 만들고 전역 노드, 연결별 노드, 공간 노드를 초기화한다.
3. 액터 클래스별로 어떤 노드에 들어갈지 `RouteAddNetworkActorToNodes`에서 분기한다.
4. 실제 플레이어 수와 액터 수를 넣고 Network Profiler, Stat Net, RepGraph 로그로 후보 액터 수와 대역폭을 확인한다.

### Replication Graph 최소 예시

```cpp
// MyReplicationGraph.h
UCLASS(transient, config=Engine)
class UMyReplicationGraph : public UReplicationGraph
{
    GENERATED_BODY()

public:
    virtual void InitGlobalGraphNodes() override;
    virtual void InitConnectionGraphNodes(UNetReplicationGraphConnection* ConnectionManager) override;
    virtual void RouteAddNetworkActorToNodes(const FNewReplicatedActorInfo& ActorInfo, FGlobalActorReplicationInfo& GlobalInfo) override;

private:
    UPROPERTY()
    TObjectPtr<UReplicationGraphNode_GridSpatialization2D> GridNode;

    UPROPERTY()
    TObjectPtr<UReplicationGraphNode_ActorList> AlwaysRelevantNode;
};
```

```cpp
void UMyReplicationGraph::InitGlobalGraphNodes()
{
    GridNode = CreateNewNode<UReplicationGraphNode_GridSpatialization2D>();
    GridNode->CellSize = 10000.f;
    GridNode->SpatialBias = FVector2D(-500000.f, -500000.f);
    AddGlobalGraphNode(GridNode);

    AlwaysRelevantNode = CreateNewNode<UReplicationGraphNode_ActorList>();
    AddGlobalGraphNode(AlwaysRelevantNode);
}

void UMyReplicationGraph::RouteAddNetworkActorToNodes(const FNewReplicatedActorInfo& ActorInfo, FGlobalActorReplicationInfo& GlobalInfo)
{
    AActor* Actor = ActorInfo.Actor;

    if (Actor->IsA(AGameStateBase::StaticClass()) || Actor->IsA(AMyBossStateActor::StaticClass()))
    {
        AlwaysRelevantNode->NotifyAddNetworkActor(ActorInfo);
        return;
    }

    GridNode->AddActor_Dormancy(ActorInfo, GlobalInfo);
}
```

설정은 프로젝트 버전과 NetDriver 구성에 따라 달라질 수 있지만, 핵심은 게임 NetDriver가 이 Graph 클래스를 사용하게 만드는 것이다. 설정 후에는 첫 접속 시 `UReplicationGraph::InitForNetDriver`가 호출되어 Graph가 NetDriver에 연결된다.

### 엔진에서 실제로 일어나는 흐름

`Engine\Plugins\Runtime\ReplicationGraph\Source\Private\ReplicationGraph.cpp`를 기준으로 보면 흐름은 다음과 같다.

1. NetDriver가 Graph를 초기화할 때 `UReplicationGraph::InitForNetDriver`가 호출된다.
2. 복제 대상 액터가 생기면 `UReplicationGraph::AddNetworkActor`가 호출된다.
3. Graph는 `RouteAddNetworkActorToNodes`로 액터를 적절한 노드에 넣는다.
4. 서버 네트워크 틱에서 `ServerReplicateActors`가 연결별 복제 후보 목록을 만든다.
5. 각 연결은 `GatherActorListsForConnection`을 통해 전역 노드, 공간 노드, 연결별 노드에서 후보 액터를 받는다.
6. 후보 액터는 relevance, dormancy, priority, frequency 판단을 거쳐 `ReplicateSingleActor` 단계로 들어간다.

이 구조의 핵심은 액터를 매번 전부 훑지 않고 미리 분류된 노드에서 후보만 꺼낸다는 점이다. 그래서 Graph 설계가 좋으면 서버 CPU와 대역폭을 동시에 줄일 수 있고, 설계가 나쁘면 기본 복제보다 복잡하기만 하고 효과가 없다.

### Iris의 역할과 Replication Graph와의 차이

Replication Graph는 누구에게 보낼 것인가를 정하는 쪽에 가깝고, Iris는 무엇을 어떤 상태 기술로 보내고 추적할 것인가에 가깝다. UE5.7 엔진 소스에서는 Iris 관련 코드가 `Engine\Source\Runtime\Net\Iris` 아래에 있으며, 대표적으로 다음 개념을 확인할 수 있다.

- `NetRefHandle`: 네트워크 복제 시스템 안에서 객체를 식별하는 핸들.
- `ObjectReplicationBridge`: UObject/Actor 세계와 Iris 복제 시스템 사이의 연결 계층.
- `ReplicationStateDescriptor`: 복제할 상태의 구조를 기술하는 메타데이터.
- `FastArrayReplicationFragment`: Fast Array 계열 데이터가 Iris에서 조각 단위로 복제될 때 쓰이는 경로.

Iris를 이해할 때는 기존 ActorChannel 중심 모델과 비교하면 쉽다. 전통적인 복제는 ActorChannel을 중심으로 액터 프로퍼티를 추적하고 직렬화한다. Iris는 객체를 NetRef로 등록하고, 상태를 descriptor/fragment 단위로 다루며, 필터와 prioritizer를 통해 전송 대상을 더 체계적으로 제어하려는 방향이다.

### 사례: 오픈월드 전투 지역

전투 지역이 여러 개 있고 플레이어가 지역을 이동한다고 가정한다.

- 플레이어 캐릭터: 공간 노드에 넣되 owner 관련 정보는 owner-only 조건을 사용한다.
- 몬스터: 공간 노드에 넣고 Dormancy를 적극적으로 사용한다. 장시간 비전투 상태이면 dormancy로 전환한다.
- 보스 페이즈 상태: AlwaysRelevant 노드에 넣는다. 모든 플레이어 UI가 알아야 하기 때문이다.
- 개인 루팅 상자: 연결별 AlwaysRelevant 노드 또는 owner 조건을 사용한다.
- 투사체: 수명이 짧고 수가 많으므로 복제 빈도, relevancy 거리, 예측/로컬 표현 여부를 별도로 검토한다.

이 설계에서 가장 중요한 테스트는 클라이언트 한 명이 전투 지역 밖에 있을 때 그 클라이언트의 후보 액터 목록에 몬스터와 투사체가 들어오지 않는지 확인하는 것이다. 들어온다면 Graph 분류가 틀렸거나 액터가 AlwaysRelevant 쪽에 잘못 들어간 것이다.

### 자주 막히는 문제

- 액터가 아예 보이지 않는다: `bReplicates`, NetDriver Graph 설정, `RouteAddNetworkActorToNodes` 경로를 확인한다.
- 너무 멀리 있는 액터가 계속 복제된다: AlwaysRelevant 노드에 잘못 넣었거나 cull distance/frequency가 맞지 않을 수 있다.
- 소유자 전용 데이터가 다른 클라이언트에도 보인다: 프로퍼티 replication condition과 Graph 노드 분류를 함께 확인한다.
- FastArray가 가끔 누락된다: 서버에서 `MarkItemDirty`, `MarkArrayDirty` 호출 여부와 구조체의 NetSerialize/replication 조건을 확인한다.
- Graph를 켰는데 성능이 나빠졌다: 셀 크기가 너무 작거나 액터가 너무 자주 셀을 이동하면 관리 비용이 커진다.

### 실습 과제

1. 단순 Actor 복제로 몬스터 500개를 배치하고 `stat net`, `stat game`을 기록한다.
2. 같은 맵에서 Replication Graph Grid 노드를 적용하고 같은 위치/플레이어 수로 다시 기록한다.
3. 몬스터를 AlwaysRelevant로 잘못 넣은 버전도 만들어 성능 차이를 비교한다.
4. 결과를 `후보 액터 수`, `서버 GameThread`, `송신 대역폭`, `클라이언트 actor count` 기준으로 표로 정리한다.

### 부가 자료

- 공식 문서: Replication Graph, Iris Replication System, Actor Replication, Network Profiler.
- 엔진 소스: `Engine\Plugins\Runtime\ReplicationGraph\Source\Private\ReplicationGraph.cpp`.
- 엔진 소스: `Engine\Source\Runtime\Net\Iris\Public\Iris\ReplicationSystem`.
- 실험 명령: `stat net`, `net pktlag`, `net pktloss`, Network Insights.

## 2026-05-12 심화 보강 보완: 원리 요약

### 동작 원리 요약

Replication Graph의 원리는 복제 대상 액터를 매 프레임 무차별 검사하지 않고, 미리 구성한 노드에 분류해 연결별 후보 목록을 빠르게 만드는 것이다. Grid 노드는 위치 기반 액터를 셀로 나누고, Always Relevant 노드는 모든 연결에 필요한 액터를 보관하며, Connection Graph Node는 특정 플레이어에게만 필요한 액터를 다룬다.

Iris의 원리는 객체를 NetRef로 식별하고, 복제 상태를 descriptor와 fragment 단위로 기술한 뒤, 필터와 우선순위 판단을 거쳐 필요한 연결에 전송하는 것이다. Replication Graph가 "어떤 액터 후보를 볼 것인가"에 가깝다면, Iris는 "그 객체 상태를 어떻게 추적하고 직렬화할 것인가"에 가깝다.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| `HasAuthority()`가 true면 항상 서버 전용 코드다. | authority, net mode, local control, owner를 각각 확인한다. |
| Client RPC는 아무 actor에서나 호출할 수 있다. | owning connection이 있는 actor인지 먼저 확인한다. |
| 모든 이벤트를 RPC로 보내면 된다. | 남아야 하는 값은 replicated property와 RepNotify로 처리한다. |

## 관련 문서

- [[언리얼 네트워킹]]
- [[CharacterMovement와 예측(CharacterMovement Prediction)]]
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]
- [[Replication]]
- [[RPC]]

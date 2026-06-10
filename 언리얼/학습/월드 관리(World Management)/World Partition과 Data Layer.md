[World Partition in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine?application_version=5.7)

# 개요
`World Partition`은 큰 월드를 하나의 persistent level처럼 다루면서 내부적으로 cell 단위 streaming을 수행하는 시스템이다.
`Data Layer`는 actor 묶음을 조건에 따라 보이거나 로드되게 만드는 계층이다.
둘은 자주 같이 쓰이지만 역할이 다르다.

# 핵심 구분
| 개념 | 역할 |
| --- | --- |
| `World Partition` | 월드를 grid/cell로 나누고 streaming source 기준으로 로드/언로드 |
| `Runtime Cell` | 런타임에 로드되는 최소 streaming 단위 |
| `Streaming Source` | 플레이어, 카메라, 지정 위치처럼 cell 로딩 기준이 되는 정보 |
| `Data Layer Asset` | 데이터 레이어의 에셋 정의 |
| `Data Layer Instance` | 특정 world 안에서 실제로 쓰이는 레이어 인스턴스 |
| `World Data Layers` | world가 보유한 data layer instance 목록 |
| `HLOD` | unloaded cell의 원거리 대체 표현 |

# World Partition 흐름
1. 월드의 actor가 actor descriptor로 기록된다.
2. streaming generation 단계에서 actor가 runtime cell로 배치된다.
3. 플레이 중 streaming source가 활성 cell을 결정한다.
4. 필요한 cell의 level streaming object가 생성/로드된다.
5. HLOD는 멀리 있는 unloaded cell을 대체 표시한다.

# Data Layer 흐름
Data Layer는 단순 visibility group이 아니다.
runtime에서는 loaded/activated 상태가 actor streaming과 연결된다.
특히 Level Instance, external actor, WorldDataLayers 목록이 섞이면 actor descriptor가 예상과 다르게 갱신될 수 있다.

> [!caution]
> actor detail panel에서 data layer asset만 직접 넣는 방식은 Level Instance나 sub-level 맥락에서 문제가 생길 수 있다. 해당 level의 `WorldDataLayers`에 레이어가 들어 있는지 같이 확인해야 한다.

# 디버깅 체크리스트
- actor가 spatially loaded인지 확인한다.
- target actor가 어떤 runtime cell에 들어갔는지 확인한다.
- Data Layer가 world 또는 level instance의 `WorldDataLayers`에 존재하는지 확인한다.
- loaded 상태와 activated 상태를 구분한다.
- runtime data layer 변경 후 navigation, PCG, replay 같은 다른 시스템이 갱신되는지 확인한다.
- cook/build에서는 editor에서만 보이는 actor reference에 의존하지 않는다.

# 관련 시스템
| 시스템 | 연결점 |
| --- | --- |
| Navigation | runtime data layer 로드 후 navmesh dirty/update 여부 |
| PCG | partitioned PCG와 runtime generation source |
| Replay | streaming level visibility와 replay 진행 조건 |
| SmartObjects | persistent collection과 streaming lifetime |
| HLOD | unloaded cell의 원거리 표현 |

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Public\WorldPartition\WorldPartition.h`: `UWorldPartition` 본체.
- `Engine\Source\Runtime\Engine\Public\WorldPartition\WorldPartitionSubsystem.h`: 월드 단위 tick/streaming subsystem.
- `Engine\Source\Runtime\Engine\Public\WorldPartition\WorldPartitionRuntimeCell.h`: runtime cell 기본 구조.
- `Engine\Source\Runtime\Engine\Public\WorldPartition\WorldPartitionRuntimeHash.h`: cell generation과 runtime hash.
- `Engine\Source\Runtime\Engine\Public\WorldPartition\DataLayer\DataLayerSubsystem.h`: data layer runtime subsystem.
- `Engine\Source\Runtime\Engine\Public\WorldPartition\DataLayer\WorldDataLayers.h`: world의 data layer container.
- `Engine\Source\Runtime\Engine\Classes\Engine\LevelStreaming.h`: 전통 level streaming의 기준 클래스.

## 2026-05-12 심화 보강: World Partition과 Data Layer를 실제 월드 제작에 쓰는 법

### 학습 목표

- World Partition이 레벨 스트리밍을 자동화하는 방식과 기존 수동 서브레벨 방식의 차이를 이해한다.
- Data Layer를 이용해 같은 공간 안에서 퀘스트 상태, 시간대, 이벤트 상태를 전환하는 방법을 익힌다.
- 엔진 소스 기준으로 Streaming Source가 셀 로딩 상태를 바꾸는 원리를 이해한다.

### World Partition의 핵심 개념

World Partition은 큰 월드를 격자 셀로 나누고, 플레이어와 스트리밍 소스 위치를 기준으로 필요한 셀만 로드한다. 과거에는 디자이너가 Persistent Level과 Streaming Level을 직접 나눠야 했다면, World Partition은 액터의 위치와 설정을 바탕으로 런타임 셀을 만든다.

중요한 점은 World Partition이 액터를 그냥 숨겼다 보였다 하는 기능이 아니라는 것이다. 로드되지 않은 셀의 액터는 월드에 존재하지 않거나 최소한 런타임 액터로 활성화되어 있지 않다. 그래서 참조, BeginPlay 타이밍, AI 스폰, 저장 시스템에서 이 사실을 고려해야 한다.

### 기본 사용 절차

1. Open World 템플릿 또는 World Partition 활성화 맵을 사용한다.
2. 월드의 Runtime Grid 크기와 Loading Range를 프로젝트 이동 속도에 맞춘다.
3. 항상 존재해야 하는 액터는 `Is Spatially Loaded`를 끄거나 별도 관리한다.
4. 퀘스트/시간대/이벤트별로 Data Layer Asset을 만든다.
5. Data Layer Outliner에서 액터를 적절한 Layer에 배치한다.
6. 플레이 중 Blueprint 또는 C++로 Data Layer Runtime State를 바꾼다.

### Data Layer 사용 예시

같은 마을을 낮/밤 상태로 바꾼다고 가정한다.

- `DL_Town_Day`: 낮 NPC, 낮 조명, 상점 간판, 평화 상태 프랍.
- `DL_Town_Night`: 밤 NPC, 밤 조명, 잠긴 상점 문, 적대 이벤트 프랍.
- 항상 필요한 액터: 지형, 주요 충돌, 퀘스트 매니저, PlayerStart.

Blueprint에서는 `Set Data Layer Runtime State` 노드로 Data Layer를 `Activated`, `Loaded`, `Unloaded` 상태로 바꿀 수 있다. `Loaded`는 메모리에 로드하지만 활성화하지 않는 상태이고, `Activated`는 실제로 액터가 활성 상태가 되는 단계로 이해하면 된다.

C++에서는 프로젝트 API 버전에 맞게 `UDataLayerManager` 또는 `UDataLayerSubsystem` 경로를 사용한다. UE5.7 소스에는 `UDataLayerManager::SetDataLayerInstanceRuntimeState`와 `UDataLayerSubsystem::SetDataLayerRuntimeState`가 존재한다.

```cpp
UWorld* World = GetWorld();
UDataLayerSubsystem* DataLayerSubsystem = World ? World->GetSubsystem<UDataLayerSubsystem>() : nullptr;
if (DataLayerSubsystem)
{
    DataLayerSubsystem->SetDataLayerRuntimeState(DayLayerAsset, EDataLayerRuntimeState::Unloaded);
    DataLayerSubsystem->SetDataLayerRuntimeState(NightLayerAsset, EDataLayerRuntimeState::Activated);
}
```

프로젝트에서 사용하는 정확한 오버로드는 엔진 버전과 Data Layer Asset/Instance 사용 방식에 맞춰 헤더를 확인해야 한다. 중요한 원리는 Data Layer의 런타임 상태가 바뀌고, 그 상태가 World Partition 셀의 활성 조건에 반영된다는 점이다.

### 엔진에서 Streaming Source가 동작하는 원리

`Engine\Source\Runtime\Engine\Private\WorldPartition` 아래 코드를 보면 다음 흐름을 확인할 수 있다.

1. 월드가 준비될 때 `UWorldPartition::GenerateStreaming` 계열 로직이 액터 디스크립터와 런타임 해시를 바탕으로 셀을 구성한다.
2. 플레이 중에는 플레이어, 카메라, 등록된 Streaming Source Provider가 streaming source를 제공한다.
3. `UWorldPartition::GetStreamingSources`는 현재 월드에서 사용할 소스 목록을 만든다.
4. Runtime Hash는 source 위치와 범위를 기준으로 어떤 셀이 로드/활성화 대상인지 계산한다.
5. `UWorldPartitionRuntimeHashSet::ForEachStreamingCellsSources`는 source별 셀 판단을 수행한다.
6. Data Layer 상태, grid 조건, priority에 따라 실제 로드/활성화할 셀이 결정된다.
7. `IsStreamingCompleted`는 필요한 셀이 목표 상태에 도달했는지 확인한다.

그래서 로딩이 늦게 보이는 문제는 단순히 디스크 속도 문제가 아닐 수 있다. Loading Range가 너무 짧거나, 빠른 이동 수단에 맞는 예측 source가 없거나, Data Layer가 활성화되지 않았거나, 셀에 너무 많은 액터가 묶여 있을 수도 있다.

### 사례: 던전 입구에서 내부로 순간 이동

플레이어가 월드 바깥에서 던전 내부로 순간 이동한다면 일반적인 플레이어 위치 기반 스트리밍만으로는 도착 직후 셀이 비어 보일 수 있다. 해결 방향은 다음과 같다.

- 순간 이동 전에 목적지 주변을 로드하는 Streaming Source를 잠시 등록한다.
- `IsStreamingCompleted`로 필요한 셀이 준비될 때까지 페이드 화면을 유지한다.
- 던전 내부의 필수 충돌/바닥은 별도의 always loaded 정책을 검토한다.
- 내부 장식이나 몬스터는 Data Layer/Cell로 나누어 단계적으로 활성화한다.

이 방식은 텔레포트 후 팝인을 줄이고, 플레이어가 낙하하거나 AI가 비어 있는 공간에서 스폰되는 문제를 예방한다.

### 사례: 퀘스트 진행에 따른 마을 파괴 상태

마을 파괴 전/후를 별도 맵으로 만들면 참조와 저장 상태가 복잡해진다. Data Layer를 사용하면 같은 좌표계에서 상태를 전환할 수 있다.

- `DL_Town_Normal`: 정상 건물, NPC 일상 루틴.
- `DL_Town_Destroyed`: 파괴된 건물, 화재 FX, 부상 NPC.
- Quest SaveGame에는 현재 활성 Data Layer 상태를 저장한다.
- 로드 시 Data Layer 상태를 먼저 복원하고, 그 다음 퀘스트 액터를 초기화한다.

주의할 점은 전환되는 두 Layer에 충돌이 겹치면 안 된다는 것이다. `Activated` 상태가 겹치는 짧은 순간에도 플레이어가 끼거나 NavMesh가 잘못 갱신될 수 있다.

### 자주 막히는 문제

- 멀리 있는 액터를 직접 참조했는데 null이다: 셀이 로드되지 않았을 수 있다. Soft Object Path, Data Registry, Manager 경유 참조를 검토한다.
- PIE에서는 보이는데 패키지에서 안 보인다: cook 대상, Data Layer Asset 참조, World Partition build data를 확인한다.
- Data Layer를 바꿨는데 액터가 안 사라진다: `Loaded`와 `Activated`의 차이를 확인한다.
- 이동 중 팝인이 심하다: grid size, loading range, HLOD, streaming source priority를 같이 조정한다.
- 런타임 스폰 액터가 저장되지 않는다: World Partition의 One File Per Actor와 런타임 생성 액터 저장 정책은 별도 시스템으로 다뤄야 한다.

### 실습 과제

1. 작은 오픈월드 맵을 만들고 Runtime Grid 크기를 3가지로 바꿔 셀 로딩 느낌을 비교한다.
2. 같은 위치에 낮/밤 Data Layer를 만들고 Blueprint 버튼으로 전환한다.
3. 플레이어를 순간 이동시키며 `IsStreamingCompleted` 대기 유무에 따른 팝인을 비교한다.
4. 항상 로드되어야 하는 매니저 액터와 spatially loaded 액터를 의도적으로 섞어 문제를 재현한다.

### 부가 자료

- 공식 문서: World Partition, Data Layers, One File Per Actor, HLOD.
- 엔진 소스: `Engine\Source\Runtime\Engine\Private\WorldPartition\WorldPartition.cpp`.
- 엔진 소스: `Engine\Source\Runtime\Engine\Private\WorldPartition\WorldPartitionRuntimeHashSet.cpp`.
- 엔진 소스: `Engine\Source\Runtime\Engine\Private\WorldPartition\DataLayer`.

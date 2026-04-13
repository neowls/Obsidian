[Navigation System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-system-in-unreal-engine?application_version=5.6) | [Modifying the Navigation Mesh](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-how-to-modify-the-navigation-mesh-in-unreal-engine?application_version=5.6) | [ANavigationData::SetRebuildingSuspended](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/ANavigationData/SetRebuildingSuspended) | [ARecastNavMesh::ProjectPoint](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/NavMesh/ARecastNavMesh/ProjectPoint)

## 개요
**RecastNavMesh와 Navigation Data(Custom Recast / Navigation Data)** 는 네비게이션 시스템에서 실제 nav data가 어떻게 보관되고, 언제 generator가 생성되며, dirty area가 어떻게 tile rebuild로 이어지는지를 설명하는 계층입니다.
위의 `MoveTo`, `PathFollowing`, `QueryFilter`, `NavLink`, `CrowdFollowing`은 모두 결국 이 계층이 제공하는 nav data와 query 결과 위에서 동작합니다.

엔진 코드 기준 핵심 구조는 아래와 같습니다.

| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 추상 네비게이션 데이터 | `ANavigationData` | nav data 공통 인터페이스, config 보관, generator 수명 관리, dirty area 재빌드 조정 |
| Recast 기반 nav data | `ARecastNavMesh` | 실제 navmesh query, pathfinding, projection, random point 질의 수행 |
| navmesh generator | `FRecastNavMeshGenerator` | bounds 계산, tiled navmesh 생성, dirty tile 마킹, 비동기 빌드 수행 |
| 실제 recast/detour 저장소 | `dtNavMesh` 및 recast impl | 생성된 타일과 polygon 데이터 보관, pathfinding/투영 질의의 최종 실행체 |

즉 `UNavigationSystemV1`가 적절한 nav data를 고르는 상위 조정자라면, 이 문서는 "그 nav data 자체가 무엇이고 어떻게 유지되는가"를 설명하는 런타임/빌드 계층입니다.

> [!info]
> `[[네비게이션과 PathFollowing(Navigation)]]` 이 `MoveTo -> FindPath -> FollowPathSegment` 흐름을 설명하는 문서라면, 이 문서는 그 아래에서 `FindPath`가 실제로 위임되는 `ARecastNavMesh`와 타일 재생성을 담당하는 generator 계층을 설명합니다.

## 핵심 구성
### `ANavigationData`
`ANavigationData`는 구체적인 알고리즘보다 nav data 공통 수명 주기와 generator 협력을 정의하는 기반 클래스입니다.

| 핵심 요소 | 의미 |
| --- | --- |
| `FNavDataConfig NavDataConfig` | agent 크기, 기본 속성 등 nav data 설정 보관 |
| `RuntimeGeneration` | 런타임 재생성 가능 여부와 정책 축 |
| `NavDataGenerator` | 실제 빌드를 담당하는 generator 포인터 |
| `RebuildAll()` | 전체 nav data 재생성 진입점 |
| `RebuildDirtyAreas()` | dirty area 기반 부분 재빌드 진입점 |
| `SetRebuildingSuspended()` | dirty area 처리를 일시 중단하고 재개할지 제어 |
| `OnNavigationBoundsChanged()` | bounds 변경 시 generator에 재빌드 요구 전달 |

핵심은 `ANavigationData`가 pathfinding 알고리즘 클래스가 아니라, nav data와 generator 사이의 조정층이라는 점입니다.

### `ARecastNavMesh`
`ARecastNavMesh`는 기본 nav data의 구체 구현체입니다.
엔진 코드 기준으로 아래 책임이 중요합니다.

| 책임 | 의미 |
| --- | --- |
| query 실행 | `ProjectPoint`, `GetRandomReachablePointInRadius`, `FindPath` 같은 질의를 recast impl에 위임 |
| config 반영 | `SetConfig()`로 agent 설정을 recast mesh 파라미터에 복사 |
| generator 생성 | `CreateGeneratorInstance()`가 `FRecastNavMeshGenerator` 생성 |
| runtime generation 판단 | `SupportsRuntimeGeneration()`으로 static 여부 판단 |
| build 완료 후 정리 | `EnsureBuildCompletion()` 이후 default filter 재생성 |

즉 `ARecastNavMesh`는 "nav data 객체"이면서 동시에 recast/detour 쿼리의 실제 진입점입니다.

### `FRecastNavMeshGenerator`
generator는 타일 생성 백엔드입니다.
중요한 것은 nav data와 generator가 분리되어 있다는 점입니다.

| 핵심 함수 | 의미 |
| --- | --- |
| `Init()` | config, bounds, voxel cache, link area, task 수 초기화 |
| `UpdateNavigationBounds()` | 실제 빌드 대상 bounds 집계 |
| `ConstructTiledNavMesh()` | `dtNavMesh` 초기화 및 타일 구조 생성 |
| `RebuildAll()` | 전체 navmesh 초기화 후 모든 bounds를 dirty 처리 |
| `RebuildDirtyAreas()` | dirty area를 dirty tile로 변환 |
| `MarkDirtyTiles()` | bounds를 tile 단위 dirty 목록으로 변환 |
| `TickAsyncBuild()` | 비동기 빌드 진행, 완료 시 navmesh generation finished 통지 |
| `EnsureBuildCompletion()` | 남은 tile task를 강제로 마무리 |

generator는 단순 계산기라기보다, navmesh의 공간 분할과 타일 갱신을 유지하는 장기 실행 관리자에 가깝습니다.

## 런타임 처리 흐름
엔진 코드 기준으로 Recast nav data는 대략 아래 순서로 동작합니다.

1. `UNavigationSystemV1`가 agent props에 맞는 `ANavigationData`를 선택
2. 실제 구현체가 `ARecastNavMesh`라면 query와 rebuild를 이 객체로 위임
3. 전체 재빌드가 필요하면 `ANavigationData::RebuildAll()` 진입
4. `LoadBeforeGeneratorRebuild()` -> `PostLoadPreRebuild()` -> `ConditionalConstructGenerator()` 순으로 준비
5. `FRecastNavMeshGenerator::RebuildAll()`이 `dtNavMesh`를 새로 만들고 nav bounds 전체를 dirty 처리
6. 이후 dirty bounds는 tile 단위로 쪼개져 task로 빌드됨
7. 부분 변경이면 `RebuildDirtyAreas()`가 dirty area만 generator에 전달
8. generator가 dirty tile만 다시 만들고 완료 시 `OnNavMeshGenerationFinished()` 경로로 후처리
9. query 시점에는 `ARecastNavMesh::FindPath`, `ProjectPoint`, `GetRandomReachablePointInRadius`가 recast impl에 위임

즉 navmesh는 "한 번 만들어 놓고 끝"이 아니라, nav data 객체와 generator가 계속 dirty 상태와 타일 갱신을 협력하며 유지하는 구조입니다.

> [!tip]
> Navigation 디버깅에서 중요한 질문은 "pathfinding이 실패했는가"만이 아닙니다. "현재 nav data가 최신 상태인가", "generator가 존재하는가", "dirty area가 누적된 상태인가"도 같이 봐야 합니다.

## `ANavigationData` 관점에서 봐야 할 것
### `RebuildAll()`
`ANavigationData::RebuildAll()`은 단순히 generator의 rebuild 호출 한 줄이 아닙니다.
엔진 코드 기준으로 아래 준비가 먼저 들어갑니다.

1. `LoadBeforeGeneratorRebuild()`
2. `FAssetCompilingManager::Get().FinishAllCompilation()`
3. `PostLoadPreRebuild()`
4. `ConditionalConstructGenerator()`
5. `NavDataGenerator->RebuildAll()`

즉 전체 재빌드는 빌드 전처리, generator 구성, 실제 rebuild의 세 덩어리로 나뉩니다.

### `SetRebuildingSuspended()`
이 함수는 dirty area 재생성을 일시 정지하는 핵심 API입니다.
중요한 동작은 두 가지입니다.

| 상황 | 결과 |
| --- | --- |
| suspend 상태에서 `RebuildDirtyAreas()` 호출 | dirty area를 즉시 빌드하지 않고 큐에 누적 |
| 너무 많은 dirty area가 누적된 뒤 resume | 개별 dirty area replay 대신 `RebuildAll()`로 승격 가능 |

공식 API 문서도 이 점을 설명하지만, 엔진 코드에서 보면 실제로 suspended dirty area 수가 한계를 넘으면 전체 재빌드로 전환됩니다.

> [!caution]
> navigation rebuilding을 오래 suspend하면 "부분 갱신이 모여 결국 전체 rebuild"가 될 수 있습니다. 문제를 잠깐 숨기는 용도로만 봐야지, 장기 정지 상태로 두면 안 됩니다.

### `OnNavigationBoundsChanged()`
bounds가 바뀌면 `ANavigationData`는 generator가 없을 경우 먼저 구성한 뒤, 그 변경을 generator에 전달합니다.
즉 bounds 변경은 에디터용 이벤트가 아니라 generator 존재 여부를 보장하는 런타임 진입점이기도 합니다.

## `ARecastNavMesh` 관점에서 봐야 할 것
### query API는 대부분 recast impl 위임이다
아래 함수들은 이름은 `ARecastNavMesh`에 있지만, 실제 질의는 내부 recast 구현체로 내려갑니다.

| API | 의미 |
| --- | --- |
| `ProjectPoint()` | 월드 좌표를 navmesh polygon 위 유효 위치로 투영 |
| `GetRandomReachablePointInRadius()` | origin에서 실제 도달 가능한 랜덤 포인트 찾기 |
| `GetRandomPointInNavigableRadius()` | navigable 공간 기준 랜덤 포인트 찾기 |
| `FindPath()` | pathfinding 쿼리를 recast/detour에 위임 |

즉 `ARecastNavMesh`는 public API와 recast impl 사이의 어댑터 계층 역할도 함께 합니다.

### `SetConfig()`
`SetConfig()`는 단순 저장이 아니라 nav agent 설정을 실제 recast runtime 필드에 복사합니다.
예를 들면 아래 값들이 이 시점에 반영됩니다.

- `AgentRadius`
- `AgentHeight`
- step height 계열 설정
- nav agent props

즉 프로젝트에서 navmesh 설정을 바꾸는 것은 editor 값 하나만 바꾸는 일이 아니라, 실제 recast 빌드 파라미터를 다시 쓰는 행위입니다.

### `ConditionalConstructGenerator()`
이 함수는 runtime generation 지원 여부와 월드 상태를 보고 generator 생성 필요성을 판단합니다.
핵심 포인트는 다음과 같습니다.

- 기존 generator가 있으면 먼저 취소
- runtime generation을 지원하거나, 게임 월드가 아니면 generator 필요
- 새 generator를 만들면 `Init()` 호출
- nav system 정책에 따라 active tiles 제한을 함께 반영 가능

즉 `ARecastNavMesh`는 generator를 한 번 영구 보관하는 것이 아니라, 상황에 따라 재구성할 수 있습니다.

### `EnsureBuildCompletion()`
이 함수는 super 호출 뒤 `RecreateDefaultFilter()`를 다시 호출합니다.
의미는 분명합니다.

- 빌드 완료 이후 navmesh 내부 상태가 바뀌었을 수 있음
- query filter 캐시와 default filter가 낡을 수 있음
- 따라서 build completion 이후 필터를 안전하게 재생성

경로는 만들어졌는데 필터 쪽이 꼬이는 문제를 볼 때 이 지점이 중요합니다.

## `FRecastNavMeshGenerator` 관점에서 봐야 할 것
### `Init()`
generator 초기화는 생각보다 많은 일을 합니다.

- nav regen time-slice manager 획득
- `ConfigureBuildProperties(Config)` 수행
- bbox growth 계산
- cached data 구성
- generated link area 해석
- `UpdateNavigationBounds()` 호출
- worker thread 수를 바탕으로 task 수 결정
- voxel cache 초기화 가능

즉 generator는 생성 직후 바로 "빌드 가능한 상태"로 세팅됩니다.

### `ConstructTiledNavMesh()`
이 함수는 Recast 계층을 이해할 때 가장 중요합니다.
여기서 실제 `dtNavMesh`가 생성되고, tile 기반 navmesh의 전역 파라미터가 결정됩니다.

핵심 설정은 다음과 같습니다.

- origin
- tile size
- max tiles
- max polys
- walkable 관련 파라미터
- resolution 관련 값

즉 navmesh는 거대한 단일 메쉬가 아니라, tile 단위 저장소를 가진 detour mesh입니다.

### `MarkDirtyTiles()`
dirty area가 바로 geometry rebuild 되는 것이 아니라, 먼저 tile 단위 dirty 목록으로 바뀝니다.
이 함수에서 중요한 점은 다음과 같습니다.

- dirty area bounds를 tile 좌표로 변환
- 기존 pending tile과 merge 가능
- static game navmesh 여부에 따라 rebuild 범위 차등 처리
- dynamic modifier만 반영할지, geometry까지 다시 볼지 결정에 영향

즉 runtime generation 비용은 "더티 영역이 몇 개인가"보다 "결국 몇 개 tile을 다시 건드리느냐"가 더 직접적인 기준입니다.

### `TickAsyncBuild()`와 `EnsureBuildCompletion()`
generator는 항상 동기 빌드만 하지 않습니다.
task가 남아 있으면 tick마다 진행하고, 모두 끝나면 `DestNavMesh->OnNavMeshGenerationFinished()`를 호출합니다.

따라서 navmesh가 갱신되지 않는 문제를 볼 때는:

1. dirty area가 생성됐는지
2. dirty tile로 변환됐는지
3. task가 실제로 돌았는지
4. 완료 통지가 왔는지

순서로 잘라 보는 게 맞습니다.

## 런타임 재빌드 관점에서 정리
공식문서는 editor UI 기준으로 `Static`, `Dynamic`, `Dynamic Modifiers Only`를 설명합니다.
엔진 코드 기준으로 더 중요한 분기점은 아래입니다.

| 관점 | 엔진 코드에서 중요한 해석 |
| --- | --- |
| `SupportsRuntimeGeneration()` | `RuntimeGeneration != Static` 인가 |
| generator 존재 여부 | game world에서 runtime generation을 지원하지 않으면 generator가 불필요할 수 있음 |
| dirty area 누적 방식 | suspend 상태면 즉시 빌드하지 않고 큐잉 |
| active tiles 제한 | nav system 정책에 따라 빌드 범위를 더 줄일 수 있음 |

즉 editor의 generation mode 이름을 외우는 것보다, 실제로 generator가 생성되는지와 dirty area가 tile rebuild로 이어지는지를 보는 편이 런타임 디버깅에 더 직접적입니다.

> [!info]
> 여기서 `Dynamic Modifiers Only` 같은 editor 옵션은 공식문서가 설명을 잘 해주지만, 엔진 코드 관점에서는 "어떤 변화가 dirty area를 만들고, 그 dirty area가 geometry rebuild까지 가는가"로 다시 읽는 편이 좋습니다. 이 문서에서는 구현 기준점을 `ANavigationData`와 `FRecastNavMeshGenerator`에 둡니다.

## 실무 관점에서 꼭 알아둘 점
### 1. `ANavigationData`와 `ARecastNavMesh`를 같은 개념으로 보면 안 된다
`ANavigationData`는 수명 주기와 rebuild 관리의 기반 클래스이고, `ARecastNavMesh`는 그 구체 구현체입니다.
`FindPath` 실패 원인과 dirty area 누적 원인을 같은 층위에서 보면 디버깅이 섞입니다.

### 2. pathfinding query와 navmesh build는 다른 경로다
`ProjectPoint`, `FindPath`, `GetRandomReachablePointInRadius`는 query 경로이고, `RebuildAll`, `RebuildDirtyAreas`, `TickAsyncBuild`는 build 경로입니다.
문제를 볼 때 어느 경로가 막혔는지 먼저 분리해야 합니다.

### 3. 타일 단위 사고가 중요하다
runtime navmesh 비용은 월드 전체가 아니라 tile 단위로 터집니다.
dirty area가 작아 보여도 tile 경계를 많이 건드리면 비용이 커질 수 있습니다.

### 4. suspend/resume는 공짜가 아니다
dirty area를 잠깐 모으는 건 유효하지만, 오래 모으면 결국 전체 rebuild로 돌아갈 수 있습니다.

### 5. 필터는 build와 완전히 독립이 아니다
`EnsureBuildCompletion()` 이후 default filter를 다시 만드는 경로가 있는 만큼, query filter 캐시는 navmesh 상태와 무관한 순수 상수 계층이 아닙니다.

## 네비게이션 스택 안에서의 위치
- `[[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]`: 어떤 polygon을 얼마나 선호할지 결정하는 정책 계층
- `[[RecastNavMesh와 Navigation Data(Custom Recast Navigation Data)]]`: 실제 nav data 저장, dirty tile rebuild, query 실행 계층
- `[[네비게이션과 PathFollowing(Navigation)]]`: nav query 결과를 이동 실행으로 바꾸는 계층
- `[[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]`: 계산된 경로 위에서 군중 이동과 국소 회피를 덧씌우는 계층
- `[[NavLink와 Smart Link(NavLink Smart Link)]]`: 분리된 navmesh 구간을 연결하거나 custom move로 이행하는 계층

## 연결해서 볼 문서
- [[네비게이션과 PathFollowing(Navigation)]]: `MoveTo`, `FindPathSync`, `RequestMove`, `FollowPathSegment` 흐름
- [[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]: query 시점의 area/filter 정책 적용
- [[CrowdFollowing과 RVO 회피(CrowdFollowing RVO Avoidance)]]: 계산된 path 위에서의 crowd steering과 avoidance
- [[NavLink와 Smart Link(NavLink Smart Link)]]: custom link를 통한 경로 세그먼트 전환

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\NavigationSystem\Public\NavigationData.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavigationData.cpp`
- `Engine\Source\Runtime\NavigationSystem\Public\NavMesh\RecastNavMesh.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavMesh\RecastNavMesh.cpp`
- `Engine\Source\Runtime\NavigationSystem\Private\NavMesh\RecastNavMeshGenerator.cpp`
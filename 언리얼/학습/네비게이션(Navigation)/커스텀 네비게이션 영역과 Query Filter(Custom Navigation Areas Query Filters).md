[Custom Navigation Areas and Query Filters in Unreal Engine](https://dev.epicgames.com/documentation/es-mx/unreal-engine/custom-navigation-areas-and-query-filters-in-unreal-engine?application_version=5.6) | [UNavArea](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/NavAreas/UNavArea) | [UNavigationQueryFilter::GetQueryFilter](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/NavFilters/UNavigationQueryFilter/GetQueryFilter/3) | [UNavArea_Default](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/NavigationSystem/NavAreas/UNavArea_Default)

## 개요
**커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas / Query Filters)** 는 navmesh 위의 특정 구역에 비용과 통과 규칙을 부여하고, pathfinding 시점에 어떤 구역을 선호하거나 배제할지를 결정하는 계층입니다.
엔진 코드 기준으로는 아래 구조가 핵심입니다.

| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 네비게이션 영역 | `UNavArea` | 특정 area의 이동 비용, 진입 비용, agent 지원 여부, 플래그 정의 |
| 기본 영역 | `UNavArea_Default` | 별도 override가 없을 때 기본으로 적용되는 area |
| 차단 영역 | `UNavArea_Null` | 사실상 누구도 통과할 수 없는 area |
| area override 데이터 | `FNavigationFilterArea` | 특정 area의 cost override 또는 exclude 설정 |
| 필터 플래그 | `FNavigationFilterFlags` | include/exclude 비트 플래그 |
| 쿼리 필터 | `UNavigationQueryFilter` | area override와 flag 조건을 조합해 path query 정책 생성 |
| 런타임 필터 | `FNavigationQueryFilter` | 실제 pathfinding에 쓰이는 네이티브 필터 |

즉 `NavArea`는 "이 구역의 기본 성질"을 정의하고, `Query Filter`는 "이번 pathfinding에서 그 구역을 어떻게 취급할지"를 결정합니다.

> [!info]
> `[[네비게이션과 PathFollowing(Navigation)]]` 이 경로를 계산하고 추종하는 실행 계층이라면, 이 문서는 그 pathfinding이 어떤 구역을 더 선호하거나 피하는지를 정의하는 정책 계층입니다.

## 핵심 구성
### `UNavArea`
`UNavArea`는 navigation polygon에 붙는 area 정의 클래스입니다.
중요 필드는 다음과 같습니다.

| 필드 | 의미 |
| --- | --- |
| `DefaultCost` | 해당 area를 통과할 때 곱해지는 travel cost |
| `FixedAreaEnteringCost` | area에 진입할 때 한 번 추가되는 고정 비용 |
| `DrawColor` | navigation 시각화 색상 |
| `SupportedAgents` | 어떤 nav agent가 이 area를 지원하는지 |
| `AreaFlags` | navigation data와 함께 저장되는 area 비트 플래그 |

핵심은 `UNavArea`가 path를 막거나 열어 주는 단순 태그가 아니라, path cost 계산에 직접 영향을 주는 데이터라는 점입니다.

### `UNavArea_Default`와 `UNavArea_Null`
두 기본 클래스는 개념을 이해할 때 가장 중요합니다.

| 클래스 | 의미 |
| --- | --- |
| `UNavArea_Default` | 특별한 override가 없을 때 기본 area |
| `UNavArea_Null` | 기본적으로 누구도 지나갈 수 없다고 보는 area |

따라서 커스텀 area를 만들 때는 보통 이 둘 사이 어딘가를 설계한다고 보면 됩니다.
즉 완전 차단이 필요한지, 우회만 유도할지, 특정 agent만 허용할지를 정하는 문제입니다.

### `FNavigationFilterArea`
`UNavigationQueryFilter` 안의 area override 한 줄을 나타내는 데이터입니다.

| 필드 | 의미 |
| --- | --- |
| `AreaClass` | 어떤 `UNavArea`에 대한 설정인지 |
| `TravelCostOverride` | 이동 비용 override |
| `EnteringCostOverride` | 진입 비용 override |
| `bIsExcluded` | 이 area를 경로 계산에서 배제할지 |
| `bOverrideTravelCost` | travel cost override 사용 여부 |
| `bOverrideEnteringCost` | entering cost override 사용 여부 |

즉 필터는 area 자체를 수정하는 것이 아니라, 특정 area를 이번 query에서 다르게 해석합니다.

### `UNavigationQueryFilter`
`UNavigationQueryFilter`는 실제 pathfinding에 적용할 정책 묶음입니다.
핵심 필드는 다음과 같습니다.

| 필드 | 의미 |
| --- | --- |
| `Areas` | area override 목록 |
| `IncludeFlags` | 반드시 포함되어야 하는 nav flag |
| `ExcludeFlags` | 경로에서 배제해야 하는 nav flag |
| `bInstantiateForQuerier` | querier별 개별 인스턴스를 만들지 여부 |
| `bIsMetaFilter` | meta filter로 동작할지 여부 |

즉 query filter는 area cost override + include/exclude flags + querier별 변형 가능성까지 묶는 상위 정책 객체입니다.

## 런타임 처리 흐름
엔진 코드 기준으로 area/filter는 대략 다음 순서로 pathfinding에 개입합니다.

1. navmesh polygon은 어떤 `UNavArea`를 area id로 들고 있음
2. `AAIController::MoveTo()`가 `FAIMoveRequest`를 생성
3. `FAIMoveRequest::SetNavigationFilter()` 또는 controller 기본 필터가 결정됨
4. `BuildPathfindingQuery()`가 `FPathFindingQuery`를 생성
5. `UNavigationQueryFilter::GetQueryFilter()`가 실제 `FNavigationQueryFilter`를 준비
6. `InitializeFilter()`가 `Areas`, `IncludeFlags`, `ExcludeFlags`를 네이티브 필터에 반영
7. `UNavigationSystemV1::FindPathSync()`가 이 필터를 사용해 pathfinding 수행
8. 결과적으로 특정 area는 더 비싸지거나, 완전히 제외되거나, 특정 flag 조건에서만 통과 가능해짐

> [!tip]
> pathfinding에서 중요한 것은 "area 클래스가 존재한다"는 사실이 아니라, 그 area가 현재 query filter에서 어떤 비용과 제외 규칙으로 해석되는가입니다.

## `UNavArea`의 의미
### `DefaultCost`
가장 기본적인 통과 비용 multiplier입니다.
같은 길이라도 특정 area의 `DefaultCost`가 높으면 경로 탐색은 그 구간을 덜 선호합니다.

### `FixedAreaEnteringCost`
area 진입 시 한 번 더해지는 비용입니다.
즉 길이 자체보다 "이 구역에 들어가는 것"을 꺼리게 만들고 싶을 때 의미가 있습니다.

### `SupportedAgents`
area를 모든 agent가 쓰는 것이 아니라, 특정 agent 타입에만 허용하거나 제한하고 싶을 때 중요합니다.
즉 area는 월드 공통 정보처럼 보이지만, 실제로는 agent 지원 여부를 함께 가질 수 있습니다.

### `AreaFlags`
area는 단순 cost만 가지는 것이 아니라 flags도 가집니다.
이 flags는 나중에 query filter의 include/exclude 조건과 연결됩니다.

## `UNavigationQueryFilter::GetQueryFilter()`
이 함수가 필터의 실제 런타임 중심입니다.
엔진 코드 기준 동작은 다음과 같습니다.

1. `bIsMetaFilter`이고 querier가 있으면 `GetSimpleFilterForAgent()`로 실제 필터 클래스 결정 시도
2. meta가 아니면 nav data의 캐시에서 현재 필터 클래스에 대응하는 `FSharedConstNavQueryFilter` 조회
3. 캐시에 없으면 `NavData.GetDefaultQueryFilter()->GetCopy()`로 기본 필터 복사
4. `InitializeFilter()`로 area override와 flags 반영
5. `bInstantiateForQuerier`가 아니면 nav data에 캐시 저장

즉 필터는 매번 새로 계산되는 객체일 수도 있고, nav data에 캐시되는 공유 객체일 수도 있습니다.

> [!caution]
> `bInstantiateForQuerier`가 꺼져 있으면 querier별로 다른 상태를 가진 필터를 기대하면 안 됩니다. 이 경우 필터는 nav data 캐시에 저장되어 재사용됩니다.

## `InitializeFilter()`가 실제로 하는 일
`UNavigationQueryFilter::InitializeFilter()`는 문서보다 엔진 코드에서 보는 편이 훨씬 명확합니다.
실제로는 아래 두 가지를 합니다.

### 1. Area override 적용
각 `FNavigationFilterArea`에 대해:

- `NavData.GetAreaID(AreaClass)`로 area id 조회
- `bIsExcluded`면 `Filter.SetExcludedArea()` 호출
- 아니면 `bOverrideTravelCost`일 때 `Filter.SetAreaCost()` 호출
- `bOverrideEnteringCost`일 때 `Filter.SetFixedAreaEnteringCost()` 호출

즉 query filter는 클래스 이름이 아니라 최종적으로 `area id` 기준으로 runtime filter를 세팅합니다.

### 2. Include / Exclude flags 적용
마지막에:

- `Filter.SetIncludeFlags(IncludeFlags.Packed)`
- `Filter.SetExcludeFlags(ExcludeFlags.Packed)`

를 호출합니다.
즉 area override와 flag 조건은 별개가 아니라, 하나의 runtime query filter 안에 함께 들어갑니다.

## Include / Exclude Flags
`FNavigationFilterFlags`는 `bNavFlag0 ~ bNavFlag15`의 비트 필드입니다.
중요한 점은 플래그 이름 자체가 의미를 갖는 게 아니라, 프로젝트나 navigation setup이 그 비트에 어떤 의미를 부여하느냐입니다.

문서 주석에도 나와 있듯이 user-friendly name은 `UNavigationSystemV1.DescribeFilterFlags()`로 설명을 붙이는 쪽이 전제입니다.
즉 이 플래그는 "사다리 가능", "위험 지역", "소형 에이전트 전용" 같은 프로젝트 규칙을 bitmask로 표현하는 도구라고 보는 편이 정확합니다.

## Meta Filter
`UNavigationQueryFilter`에는 `bIsMetaFilter`와 `GetSimpleFilterForAgent()`가 있습니다.
이건 중요한 확장 포인트입니다.

의미는 다음과 같습니다.

- 외부에서는 하나의 filter class처럼 보임
- 실제 pathfinding 직전에는 querier를 보고 다른 단순 필터 클래스로 바꿀 수 있음
- agent별, 상황별로 필터 클래스를 고르는 라우터 역할을 함

즉 meta filter는 path cost를 직접 정하는 객체라기보다, 어떤 실제 filter를 쓸지 결정하는 상위 선택기입니다.

## 캐시와 에디터 변경
`PostEditChangeProperty()`를 보면, filter 변경 시 모든 월드 컨텍스트의 `UNavigationSystemV1`를 돌며 `ResetCachedFilter(GetClass())`를 호출합니다.
이 말은 곧:

- 필터는 nav data 캐시에 저장될 수 있음
- 에디터에서 수정하면 그 캐시를 무효화해야 함
- 따라서 query filter는 단순 데이터 에셋이 아니라 runtime cache와 연결된 객체임

## 실무 관점에서 꼭 알아둘 점
### 1. Area와 Filter를 혼동하면 안 된다
`UNavArea`는 월드 쪽 기본 성질이고, `UNavigationQueryFilter`는 이번 query의 정책입니다.
같은 area라도 필터에 따라 싼 길이 될 수도, 비싼 길이 될 수도, 아예 제외될 수도 있습니다.

### 2. 우회 유도와 완전 차단은 다르다
우회시키고 싶으면 cost를 올리는 쪽이고, 절대 지나가면 안 되면 `bIsExcluded` 또는 `UNavArea_Null` 같은 차단 개념이 더 맞습니다.
둘을 섞으면 pathfinding 결과가 과하게 불안정해질 수 있습니다.

### 3. `DefaultCost`와 `EnteringCost`는 체감이 다르다
긴 구역 전체를 싫어하게 만들지, 진입 자체를 꺼리게 만들지가 다릅니다.
짧은 좁은 구역에서는 entering cost가 훨씬 강하게 작동할 수 있습니다.

### 4. querier별 동적 정책이 필요하면 캐시 모델을 먼저 생각해야 한다
querier마다 다른 판단을 하고 싶으면 meta filter 또는 `bInstantiateForQuerier` 관점으로 봐야 합니다.
공유 캐시 필터에 런타임 상태를 기대하면 설계가 꼬입니다.

### 5. 결국 pathfinding은 area class가 아니라 area id와 runtime filter를 본다
디버깅할 때는 블루프린트에서 만든 area 이름보다, nav data가 area id를 어떻게 인식했고 filter가 어떤 cost/exclude를 넣었는지 보는 쪽이 정확합니다.

## Navigation 학습 흐름 안에서의 위치
- `[[네비게이션과 PathFollowing(Navigation)]]`: 이동 실행 계층
- `[[커스텀 네비게이션 영역과 Query Filter(Custom Navigation Areas Query Filters)]]`: pathfinding 정책 계층
- 다음 단계 후보:
  - `CrowdFollowing / RVO / Avoidance`
  - `NavLink / Smart Link`
  - `Custom Recast / Navigation Data`

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\NavigationSystem\Public\NavAreas\NavArea.h`
- `Engine\Source\Runtime\NavigationSystem\Public\NavAreas\NavArea_Default.h`
- `Engine\Source\Runtime\NavigationSystem\Public\NavAreas\NavArea_Null.h`
- `Engine\Source\Runtime\NavigationSystem\Public\NavFilters\NavigationQueryFilter.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavFilters\NavigationQueryFilter.cpp`
- `Engine\Source\Runtime\NavigationSystem\Public\NavigationSystem.h`
- `Engine\Source\Runtime\NavigationSystem\Private\NavigationSystem.cpp`
- `Engine\Source\Runtime\AIModule\Classes\AITypes.h`
- `Engine\Source\Runtime\AIModule\Private\AIController.cpp`
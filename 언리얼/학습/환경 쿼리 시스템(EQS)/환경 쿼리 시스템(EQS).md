[Environment Query System in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/environment-query-system-in-unreal-engine) | [FEnvQueryRequest](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/EnvironmentQuery/FEnvQueryRequest) | [UEnvQuery::CollectQueryParams](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/EnvironmentQuery/UEnvQuery/CollectQueryParams) | [UBTTask_RunEQSQuery](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/UBTTask_RunEQSQuery)

## 개요
**환경 쿼리 시스템(EQS)** 은 AI가 현재 환경에 대해 질문을 던지고, 후보 아이템을 생성한 뒤 필터링과 점수화를 통해 결과를 고르는 런타임 질의 시스템입니다.
에디터에서는 `Generator/Test/Context` 그래프로 보이지만, 엔진 코드 기준으로는 아래 구조가 핵심입니다.

| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 쿼리 에셋 | `UEnvQuery` | 옵션, 제너레이터, 테스트 구성을 담는 데이터 에셋 |
| 요청 래퍼 | `FEnvQueryRequest` | 쿼리 템플릿, owner, world, named param을 묶어 실행 요청 생성 |
| 관리자 | `UEnvQueryManager` | 쿼리 인스턴스 생성, 캐시, 시간 분할 틱, 완료 delegate 처리 |
| 실행 인스턴스 | `FEnvQueryInstance` | 실제 아이템 목록, 컨텍스트 캐시, 테스트 진행 상태, 결과를 보관 |
| 제너레이터 | `UEnvQueryGenerator` | Actor 또는 Point 후보 아이템 생성 |
| 테스트 | `UEnvQueryTest` | 후보를 필터링하거나 점수화 |
| 컨텍스트 | `UEnvQueryContext` | Querier, Target 같은 기준점을 제공 |
| 아이템 타입 | `UEnvQueryItemType` | 결과 아이템의 실제 데이터 해석 방식 정의 |
| BT 연결 | `UBTTask_RunEQSQuery` | EQS를 실행하고 결과를 블랙보드에 저장 |

즉 EQS는 `기억(memory)` 계층이 아니라, 현재 시점의 후보들을 평가해서 결과를 뽑는 `질의(query)` 계층으로 보는 편이 정확합니다.

> [!info]
> `[[AI 지각(AI Perception)]]` 이 자극을 수집하는 입력 계층이라면, EQS는 그 입력과 현재 월드 상태를 바탕으로 "지금 가장 적절한 위치/대상은 무엇인가"를 계산하는 평가 계층입니다.

## 핵심 구성
### `UEnvQuery`
`UEnvQuery`는 `UDataAsset` 기반 에셋입니다.
핵심 필드는 단순합니다.

| 필드 | 의미 |
| --- | --- |
| `QueryName` | 쿼리 식별 이름 |
| `Options` | 실제 실행 가능한 `UEnvQueryOption` 목록 |

중요한 점은 `UEnvQuery`가 스스로 실행되는 객체가 아니라는 점입니다.
실행 시점에는 `UEnvQueryManager`가 이 에셋을 기반으로 `FEnvQueryInstance`를 만듭니다.
또한 `CollectQueryParams()`는 query owner를 기준으로 제너레이터/테스트가 요구하는 named param을 수집합니다.

### `FEnvQueryRequest`
`FEnvQueryRequest`는 C++ 코드에서 EQS를 실행할 때 가장 먼저 만나는 래퍼입니다.

| 항목 | 의미 |
| --- | --- |
| `QueryTemplate` | 실행할 `UEnvQuery` |
| `Owner` | querier 역할을 하는 UObject |
| `World` | owner가 world를 주지 못할 때 사용할 override |
| `NamedParams` | 쿼리에 전달할 동적 파라미터 |

주요 API는 다음과 같습니다.

- `SetFloatParam()`
- `SetIntParam()`
- `SetBoolParam()`
- `SetNamedParams()`
- `SetDynamicParam()`
- `Execute()`

`SetDynamicParam()`은 `FAIDynamicParam`이 블랙보드에서 값을 읽도록 설정돼 있으면 `UBlackboardComponent`를 받아 동적으로 값을 채웁니다.
즉 EQS는 파라미터가 고정된 정적 에셋이 아니라, 실행 시점에 블랙보드나 코드 값으로 보정되는 질의 템플릿입니다.

### `UEnvQueryManager`
`UEnvQueryManager`는 `UAISubsystem` 기반 관리자입니다.
쿼리를 즉시 처리하거나, 여러 프레임에 나눠 시간 분할 방식으로 처리합니다.

| 설정 | 의미 |
| --- | --- |
| `MaxAllowedTestingTime` | 한 틱에서 EQS에 허용하는 최대 시간 |
| `bTestQueriesUsingBreadth` | breadth 방식으로 여러 쿼리를 교차 실행할지 여부 |
| `QueryCountWarningThreshold` | 쿼리 개수 경고 임계치 |
| `ExecutionTimeWarningSeconds` | 쿼리 실행 시간 경고 임계치 |
| `HandlingResultTimeWarningSeconds` | 완료 delegate 처리 시간 경고 임계치 |

`RunQuery()`는 내부적으로 `PrepareQueryInstance()`를 통해 owner, world, named params, query id를 세팅한 뒤 `RunningQueries`에 넣습니다.
`RunInstantQuery()`는 `ExecuteOneStep()`를 반복 호출해 즉시 끝까지 수행합니다.

### `FEnvQueryInstance`
실제 쿼리 실행 상태는 `FEnvQueryInstance`가 보관합니다.

| 필드 | 의미 |
| --- | --- |
| `Options` | 정렬된 테스트를 포함한 option instance 목록 |
| `Items` | 현재 후보 아이템 목록 |
| `ItemDetails` | 각 아이템의 유효/무효 상태와 스코어 관련 정보 |
| `ContextCache` | 계산된 context 결과 캐시 |
| `NamedParams` | 실행 시점에 주입된 파라미터 |
| `CurrentTest` | 현재 실행 중인 테스트 인덱스 |
| `CurrentTestStartingItem` | 현재 테스트의 시작 아이템 인덱스 |
| `NumValidItems` | 현재 살아남은 아이템 수 |
| `ValueSize` | 아이템 타입이 쓰는 raw data 크기 |

`FEnvQueryResult`는 최종 결과 묶음이며, `GetItemAsLocation()`, `GetItemAsActor()`, `GetAllAsLocations()`, `GetAllAsActors()` 같은 해석 API를 제공합니다.

## 런타임 처리 흐름
엔진 코드 기준으로 EQS는 대략 아래 순서로 실행됩니다.

1. `FEnvQueryRequest` 또는 `FEQSParametrizedQueryExecutionRequest`가 쿼리 실행 요청 생성
2. `UEnvQueryManager::RunQuery()`가 `PrepareQueryInstance()` 호출
3. manager가 `CreateQueryInstance()`와 `CreateOptionInstance()`로 실행용 데이터 준비
4. `FEnvQueryInstance::ExecuteOneStep()`가 generator를 먼저 돌려 초기 아이템 생성
5. 이후 각 `UEnvQueryTest::RunTest()`가 아이템을 필터링/점수화
6. 모든 테스트가 끝나면 `FinalizeQuery()`에서 run mode에 맞는 결과 확정
7. finish delegate 또는 BT task가 결과를 소비

> [!tip]
> EQS는 기본적으로 한 프레임에 모든 일을 끝내는 구조가 아닙니다. `UEnvQueryManager::Tick()`이 `MaxAllowedTestingTime` 안에서 `ExecuteOneStep()`를 돌리며, 큰 쿼리는 다음 프레임으로 넘어갈 수 있습니다.

## Generator / Test / Context / ItemType
### Generator
`UEnvQueryGenerator`는 후보 아이템을 만듭니다.
대표적으로:

| 클래스 | 의미 |
| --- | --- |
| `UEnvQueryGenerator_SimpleGrid` | 특정 context 주변에 포인트 격자를 생성 |
| `UEnvQueryGenerator_PerceivedActors` | perception에 감지된 액터들을 후보로 사용 |

generator는 후보를 만들고 끝나는 계층이지, 최종 답을 고르는 계층은 아닙니다.
후보 선택은 테스트 단계에서 이루어집니다.

### Test
`UEnvQueryTest`는 각 후보를 평가합니다.
핵심 개념은 다음과 같습니다.

| 항목 | 의미 |
| --- | --- |
| `TestPurpose` | Filter, Score, FilterAndScore |
| `FilterType` | Minimum, Maximum, Range, Match |
| `ScoringEquation` | Linear, Square, InverseLinear, SquareRoot, Constant |
| `Cost` | Low, Medium, High |

대표 예시:

| 클래스 | 의미 |
| --- | --- |
| `UEnvQueryTest_Distance` | 거리 기반 필터/점수화 |
| `UEnvQueryTest_Trace` | 가시성/충돌 여부 확인 |

엔진은 option instance 생성 시 테스트를 cost 기준으로 정렬할 수 있습니다.
특히 `bAutoSortTests`가 켜진 generator와 `SingleResult` 실행에서는 비싼 필터 테스트를 뒤로 미루는 최적화가 들어갑니다.

### Context
`UEnvQueryContext`는 “무엇을 기준으로 비교할 것인가”를 제공합니다.
대표적인 기본 컨텍스트는 `UEnvQueryContext_Querier`입니다.
`FEnvQueryInstance::PrepareContext()`는 계산 결과를 `ContextCache`에 저장하므로, 같은 컨텍스트를 테스트마다 반복 계산하지 않습니다.

### ItemType
아이템 타입은 결과 raw data를 어떻게 해석할지 결정합니다.
대표적으로:

| 클래스 | 의미 |
| --- | --- |
| `UEnvQueryItemType_Point` | 위치 벡터 결과 |
| `UEnvQueryItemType_Actor` | 액터 결과 |

이 타입 정보는 나중에 블랙보드 저장이나 blueprint wrapper 해석 시 그대로 사용됩니다.

## RunMode와 결과 해석
`EEnvQueryRunMode::Type`은 최종 결과를 어떻게 고를지 결정합니다.

| RunMode | 의미 |
| --- | --- |
| `SingleResult` | 최상위 결과 하나 선택 |
| `RandomBest5Pct` | 상위 5% 안에서 랜덤 선택 |
| `RandomBest25Pct` | 상위 25% 안에서 랜덤 선택 |
| `AllMatching` | 살아남은 모든 결과 반환 |

`FinalizeQuery()`는 이 run mode에 따라 정렬, 정규화, 랜덤 선택, 전체 반환을 다르게 처리합니다.
특히 `AllMatching`은 C++/Blueprint 결과에서는 여러 아이템을 유지할 수 있지만, `UBTTask_RunEQSQuery`가 블랙보드에 저장할 때는 결국 블랙보드 키 하나에 맞는 단일 값만 기록합니다.

> [!caution]
> BT의 `Run EQS Query`에서 `AllMatching`을 썼다고 해서 블랙보드에 배열이 저장되는 것은 아닙니다. 블랙보드 저장 단계에서는 item type에 맞는 단일 actor/vector/object 값으로 축약됩니다.

## 블랙보드와 비헤이비어 트리 연결
`UBTTask_RunEQSQuery`는 EQS를 BT에 연결하는 핵심 태스크입니다.
핵심 필드는 다음과 같습니다.

| 필드 | 의미 |
| --- | --- |
| `EQSRequest` | query template, run mode, query config를 묶은 실행 요청 |
| `bUseBBKey` | query template을 블랙보드에서 가져올지 여부 |
| `bUpdateBBOnFail` | 실패 시 블랙보드 값을 갱신할지 여부 |
| `QueryFinishedDelegate` | 비동기 완료 delegate |

런타임 흐름은 다음과 같습니다.

1. `ExecuteTask()`에서 owner를 확인
2. owner가 `AAIController`면 가능하면 pawn으로 querier를 맞춤
3. `FEQSParametrizedQueryExecutionRequest::Execute()` 호출
4. task는 `WaitForMessage()`로 `AIMessage_QueryFinished`를 기다림
5. `OnQueryFinished()`에서 `FEnvQueryResult`를 읽음
6. item type CDO를 통해 블랙보드에 actor/vector/object 값을 기록
7. 성공/실패에 따라 `FinishLatentTask()` 호출

즉 BT 기준 EQS는 “노드 안에서 즉시 계산하는 함수”가 아니라, 비동기 질의를 던지고 결과 메시지를 받아 블랙보드를 갱신하는 태스크입니다.

## Blueprint와 디버깅
### `UEnvQueryInstanceBlueprintWrapper`
Blueprint에서 EQS 결과를 다루는 얇은 래퍼입니다.

- `OnQueryFinishedEvent`
- `GetQueryResultsAsActors()`
- `GetQueryResultsAsLocations()`
- `SetNamedParam()`

즉 C++ 없이도 결과를 받을 수 있지만, 실제 실행과 상태 관리는 여전히 manager와 instance가 담당합니다.

### 디버깅 경로
엔진에는 EQS 디버깅용 코드가 따로 있습니다.

| 구성 | 의미 |
| --- | --- |
| `EQSTestingPawn` | 에디터에서 쿼리 결과를 직접 시각화 |
| `GameplayDebuggerCategory_EQS` | 런타임 디버거 카테고리 |
| `USE_EQS_DEBUGGER` | shipping/test가 아닐 때 디버깅 데이터 수집 |

`EnvQueryTypes.h`를 보면 디버깅과 통계용 `STAT_AI_EQS_*` 항목이 별도로 정의돼 있습니다.
즉 EQS는 에디터용 그래프 기능만 있는 것이 아니라, 런타임 성능과 디버그 스냅샷을 위한 계측 경로를 갖고 있습니다.

## 실무 관점에서 꼭 알아둘 점
### 1. EQS는 기억이 아니라 평가기다
`PerceptualData`처럼 상태를 오래 들고 있는 시스템이 아닙니다.
감지 결과를 장기 기억하려면 perception이나 blackboard와 함께 써야 합니다.

### 2. 비싼 테스트를 무심코 쌓으면 곧바로 비용이 오른다
`Trace`, `Pathfinding` 계열은 `EEnvTestCost::High`로 분류될 수 있는 대표 예시입니다.
먼저 값싼 필터로 후보를 줄이고, 비싼 테스트는 뒤에 두는 편이 안전합니다.

### 3. Context와 ItemType이 맞지 않으면 결과 해석이 꼬인다
포인트를 기대하는 블랙보드 키에 actor 기반 결과를 넣거나, 반대로 actor를 기대하는데 point를 생성하면 BT 저장 단계에서 의도와 다른 결과가 나옵니다.

### 4. Perception 기반 generator는 upstream 입력이 먼저 준비돼 있어야 한다
예를 들어 `PerceivedActors` generator는 perception 쪽 데이터가 비어 있으면 후보를 만들지 못합니다.
즉 `[[AI 지각(AI Perception)]] -> EQS -> [[블랙보드(Blackboard)]]` 순서가 실제로 맞물립니다.

### 5. 시간 분할을 전제로 생각해야 한다
EQS는 무조건 즉시 응답한다고 가정하면 안 됩니다.
manager tick, finish delegate, BT message 흐름까지 포함해서 생각해야 실제 런타임과 맞습니다.

## AI 스택 안에서의 위치
- [[AI 지각(AI Perception)]] : 외부 자극을 수집
- [[환경 쿼리 시스템(EQS)]] : 후보 위치/대상을 평가
- [[비헤이비어 트리(Behavior Tree)]] : 의사결정 흐름 제어 
- [[네비게이션과 PathFollowing(Navigation)]] : 선택된 목적지를 실제 이동 요청과 경로 추종으로 실행
- [[블랙보드(Blackboard)]] : 선택된 결과를 저장해 다른 노드와 공유

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\EnvironmentQuery\EnvQuery.h`
- `Engine\Source\Runtime\AIModule\Classes\EnvironmentQuery\EnvQueryManager.h`
- `Engine\Source\Runtime\AIModule\Classes\EnvironmentQuery\EnvQueryTypes.h`
- `Engine\Source\Runtime\AIModule\Private\EnvironmentQuery\EnvQueryManager.cpp`
- `Engine\Source\Runtime\AIModule\Private\EnvironmentQuery\EnvQueryTypes.cpp`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Tasks\BTTask_RunEQSQuery.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\Tasks\BTTask_RunEQSQuery.cpp`
- `Engine\Source\Runtime\AIModule\Private\GameplayDebugger\GameplayDebuggerCategory_EQS.cpp`
- `Engine\Source\Runtime\AIModule\Private\EnvironmentQuery\EQSTestingPawn.cpp`
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

# 블랙보드(Blackboard)

> [!summary] 요약
> 블랙보드(Blackboard)는 AIController, BrainComponent, Blackboard, Behavior Tree 노드가 함께 만드는 AI 의사결정 주제다.
> AI가 선택한 행동이 왜 실행되거나 중단되는지 추적할 때 사용한다.
> 핵심은 Blackboard 값 변화, decorator 조건, abort 범위, task 종료 신호를 같은 흐름에서 보는 것이다.

## 핵심 결론

- Behavior Tree는 노드 배치보다 Blackboard key와 observer/abort 조건 설계가 먼저다.
- task는 반드시 성공, 실패, 진행 중 상태를 명확히 끝내야 한다.
- 문제가 생기면 AIController possession, BrainComponent 실행 상태, Blackboard 값, decorator abort 로그를 확인한다.

## 참고 자료

[Behavior Tree User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide) | [UBlackboardComponent API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/BehaviorTree/UBlackboardComponent) | [AAIController::UseBlackboard](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/AAIController/UseBlackboard)

## 개요
**블랙보드(Blackboard)** 는 비헤이비어 트리(Behavior Tree)가 읽고 쓰는 상태 저장소입니다.
다만 엔진 코드 기준으로 보면 단순한 `TMap`이 아니라:

- 키 정의를 담는 `UBlackboardData`
- 실제 런타임 값을 담는 `UBlackboardComponent`
- 각 키의 타입 동작을 정의하는 `UBlackboardKeyType`

조합으로 이루어진 typed memory system에 가깝습니다.

> [!info]
> 비헤이비어 트리는 의사결정을 직접 저장하지 않습니다. 의사결정에 필요한 상태를 블랙보드에 저장하고, 데코레이터(Decorator)/서비스(Service)/태스크(Task)가 이를 읽고 갱신합니다.

## 왜 필요한가

AI 문제는 눈에 보이는 task가 아니라 그 task에 도달하기 전의 조건 평가에서 자주 발생한다. 블랙보드(Blackboard)를 볼 때는 실행 중인 노드만 보지 말고 Blackboard 변경과 재선택 조건까지 추적해야 한다.

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

## 핵심 구성
| 구성 요소 | 엔진 클래스 | 역할 |
|---|---|---|
| 블랙보드 에셋 | `UBlackboardData` | 키 정의, 부모 체인, 동기화 키 설정 보관 |
| 런타임 저장소 | `UBlackboardComponent` | 실제 값 메모리, observer, 디버그 출력 보관 |
| 키 타입 | `UBlackboardKeyType` | 값 크기, 비교 방식, 설명 문자열, 필터 지원 |
| 엔트리 정의 | `FBlackboardEntry` | `EntryName`, `KeyType`, `bInstanceSynced` 묶음 |

## UBlackboardData: 키 정의 에셋
`UBlackboardData`는 `UDataAsset`이며, 부모 블랙보드 체인을 가질 수 있습니다.

핵심 필드는 다음과 같습니다.

| 필드 | 의미 |
|---|---|
| `Parent` | 상위 블랙보드 에셋 |
| `Keys` | 이 에셋이 직접 정의한 키 목록 |
| `FirstKeyID` | 부모 키를 포함한 전체 키 체인에서 이 에셋의 시작 인덱스 |
| `bHasSynchronizedKeys` | 인스턴스 동기화 키 존재 여부 |

`FBlackboardEntry`는 각 키에 대해:
- `EntryName`
- `KeyType`
- `bInstanceSynced`

를 가집니다.

> [!tip]
> 블랙보드 키(Blackboard Key)는 단순 이름 목록이 아니라 타입이 강하게 붙는 엔트리입니다. 즉 `TargetActor`와 `TargetLocation`은 이름만 다른 것이 아니라, 내부적으로 다른 `UBlackboardKeyType` 규칙을 가집니다.

## UBlackboardComponent: 런타임 값 저장소
`UBlackboardComponent`는 실제 값을 메모리 블록에 보관합니다.

핵심 필드는 다음과 같습니다.

| 필드 | 의미 |
|---|---|
| `ValueMemory` | 모든 키 값을 담는 raw byte array |
| `ValueOffsets` | 각 KeyID의 메모리 오프셋 |
| `KeyInstances` | 인스턴스화된 키 타입 객체 저장 |
| `BrainComp` | 연결된 `UBrainComponent` 캐시 |
| `BlackboardAsset` | 현재 사용하는 블랙보드 에셋 |

즉 블랙보드 값은 UObject 프로퍼티 배열이 아니라, **키 타입 정의에 따라 packing된 메모리**에 저장됩니다.

## InitializeBlackboard의 실제 동작
`UBlackboardComponent::InitializeBlackboard()`는 대략 다음 순서로 동작합니다.

1. 동일한 에셋이면 재초기화하지 않고 바로 반환
2. 기존 synchronized key 등록이 있으면 `UAISystem`에서 해제
3. 부모 체인을 따라 key ID 갱신
4. 각 키의 `ValueSize`와 인스턴싱 여부를 수집
5. 메모리 크기 기준으로 정렬해 `ValueMemory`를 packing
6. `ValueOffsets` 계산
7. 각 `UBlackboardKeyType::InitializeKey()` 호출
8. synchronized key가 있으면 `PopulateSynchronizedKeys()` 수행

> [!info]
> 이 설계 때문에 블랙보드는 "키 이름으로 해시 조회하는 컨테이너"보다 "미리 정의된 슬롯 기반 메모리 시스템"에 더 가깝습니다.

## UBlackboardKeyType: 타입 시스템
`UBlackboardKeyType`은 각 키 타입의 런타임 동작을 정의합니다.

| 항목 | 의미 |
|---|---|
| `ValueSize` | 이 타입이 차지하는 메모리 크기 |
| `SupportedOp` | 데코레이터 비교 연산 지원 범위 |
| `bCreateKeyInstance` | 키 타입 객체를 인스턴스화할지 |
| `WrappedDescribeValue()` | 디버그 문자열 생성 |
| `WrappedTestBasicOperation()` | 데코레이터 비교 평가 |
| `WrappedGetLocation()/Rotation()` | 위치/회전 추출 |

즉 블랙보드의 비교, 설명, clear, copy 같은 동작은 값 자체가 아니라 **키 타입 클래스가 수행**합니다.

## Observer 모델
블랙보드의 중요한 축은 값 저장보다도 **변경 알림(observer)** 입니다.

핵심 API:
- `RegisterObserver()`
- `UnregisterObserver()`
- `UnregisterObserversFrom()`
- `PauseObserverNotifications()`
- `ResumeObserverNotifications()`
- `NotifyObservers()`

이 구조 덕분에:
- 데코레이터는 블랙보드 값 변화를 관찰하고 Abort를 요청할 수 있고
- 서비스는 블랙보드 값을 갱신해 트리 재평가를 유도할 수 있습니다.

> [!tip]
> 언리얼 Behavior Tree가 이벤트 주도형이라고 할 때, 실제로 그 기반이 되는 축 중 하나가 블랙보드 observer 모델입니다.

## Instance Synced Key
`FBlackboardEntry::bInstanceSynced`가 켜진 키는 `PopulateSynchronizedKeys()`를 통해 같은 블랙보드 자산을 공유하는 다른 컴포넌트와 초기값을 맞출 수 있습니다.

다만 이것은 네트워크 replication이 아닙니다.

> [!caution]
> `bInstanceSynced`는 멀티플레이 네트워크 동기화 기능이 아닙니다. 이는 로컬 AI 시스템 내부에서 관련 블랙보드 인스턴스끼리 값을 맞추는 기능입니다.

동기화 가능 여부는 `AAIController::ShouldSyncBlackboardWith()` 경로를 통해 판단됩니다.

## 값 접근 방식
일반적으로는 다음 API를 사용합니다.

- `GetValueAsObject/Int/Float/Bool/Vector ...`
- `SetValueAsObject/Int/Float/Bool/Vector ...`
- `ClearValue()`
- `CompareKeyValues()`
- `DescribeKeyValue()`

템플릿 버전 `GetValue<T>() / SetValue<T>()`도 있지만, 공통 원칙은 같습니다.

> [!caution]
> `GetKeyRawData()`는 가능하면 마지막 수단으로 보는 편이 좋습니다. 일반적인 게임 코드에서는 `SetValue* / GetValue*`를 사용하는 쪽이 observer와 타입 규칙을 덜 깨뜨립니다.

## 디버깅과 로그
블랙보드는 디버깅 친화적으로 설계되어 있습니다.

| 함수 | 역할 |
|---|---|
| `GetDebugInfoString()` | 문자열 기반 블랙보드 덤프 |
| `DescribeKeyValue()` | 키별 디버그 설명 |
| `DescribeSelfToVisLog()` | Visual Logger용 스냅샷 생성 |
| `StoreDebuggerBlackboard()` | `BehaviorTreeComponent`가 BT 디버거용 현재 값 저장 |

즉 BT 디버거에서 보이는 Blackboard 값은 결국 이 경로로 구성됩니다.

## 실전에서 어떻게 생각해야 하나?
- 블랙보드는 AI의 장기/단기 상태를 담는 슬롯 기반 메모리다.
- 조건 판단은 데코레이터, 상태 갱신은 서비스/태스크, 저장은 블랙보드가 담당한다.
- 블랙보드 값 변화는 단순 데이터 변경이 아니라 트리 재평가 트리거가 될 수 있다.
- 키 타입이 비교/설명/clear를 쥐고 있으므로, 키의 "타입"이 설계에서 매우 중요하다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BlackboardComponent.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BlackboardComponent.cpp`
  - `InitializeBlackboard()`
  - `PopulateSynchronizedKeys()`
  - `RegisterObserver()`
  - `NotifyObservers()`
  - `GetDebugInfoString()`
  - `DescribeSelfToVisLog()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BlackboardData.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BlackboardData.cpp`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Blackboard\BlackboardKeyType.h`
- `Engine\Source\Runtime\AIModule\Classes\AIController.h`
  - `ShouldSyncBlackboardWith()`

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
- [[비헤이비어 트리 디버거(Behavior Tree Debugger)]]
- [[비헤이비어 트리(Behavior Tree)]]
- [[서비스(Service)]]
- [[컴포짓(Composite)]]
- [[태스크(Task)]]

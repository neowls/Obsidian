[Behavior Tree Node Reference: Services](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-services) | [Behavior Tree Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview)

## 개요
**서비스(Service)** 는 [[컴포짓(Composite)]] 또는 [[태스크(Task)]]에 붙는 보조 노드이며, 분기가 활성화되어 있는 동안 일정 주기로 실행됩니다.

엔진 코드 기준으로 `UBTService : UBTAuxiliaryNode`이며, 서비스는 직접 성공/실패를 반환하지 않습니다. 대신 블랙보드 갱신, 포커스 설정, EQS 실행처럼 **지식을 업데이트하는 백그라운드 작업**에 가깝습니다.

## 핵심 역할
| 역할            | 엔진 기준                | 설명                                             |
| ------------- | -------------------- | ---------------------------------------------- |
| 검색 진입 시 초기 검사 | `OnSearchStart()`    | 분기 진입 직전 필요한 즉시 계산                             |
| 주기적 실행        | `TickNode()`         | 일정 간격으로 상태 갱신                                  |
| 활성화 알림        | `OnBecomeRelevant()` | 분기 진입 시 상태 세팅                                  |
| 비활성화 알림       | `OnCeaseRelevant()`  | 분기 종료 시 정리                                     |
| 다음 틱 예약       | `ScheduleNextTick()` | `Interval +/- RandomDeviation` 범위로 다음 호출 시간 계산 |

## 런타임 생명주기
서비스는 분기 활성화와 함께 살아납니다.

대표 흐름은 다음과 같습니다.

1. 부모 분기 활성화
2. `NotifyParentActivation()` 호출
3. 필요 시 `OnSearchStart()` 호출
4. 옵션이 켜져 있으면 Search Start 시점에 `TickNode()` 1회 호출
5. 이후 `Interval`에 따라 반복 틱
6. 분기 종료 시 `OnCeaseRelevant()`

> [!info]
> 서비스는 분기 안에서 계속 돌지만, 실행 흐름을 직접 바꾸지는 않습니다. 흐름 변경은 보통 "서비스가 블랙보드를 갱신 -> 데코레이터가 그 변화를 감지 -> Abort" 구조로 이어집니다.

## 핵심 프로퍼티
| 프로퍼티                            | 의미                            |
| ------------------------------- | ----------------------------- |
| `Interval`                      | 기본 실행 간격                      |
| `RandomDeviation`               | 간격에 랜덤 편차 추가                  |
| `bCallTickOnSearchStart`        | 분기 탐색 진입 시 `TickNode()` 즉시 호출 |
| `bRestartTimerOnEachActivation` | 분기 재활성화 시 타이머 재시작             |
| `bNotifyOnSearch`               | `OnSearchStart()` 사용 여부       |

기본값 기준으로 `UBTService`는:
- `bNotifyTick = true`
- `bNotifyOnSearch = true`
- `Interval = 0.5f`
- `RandomDeviation = 0.1f`

를 갖습니다.

## OnSearchStart는 왜 따로 있나?
엔진 주석이 강조하듯, `OnSearchStart()`는 "이 분기에 들어갈 수 있는지 판정하기 전에 필요한 즉시 계산" 용도입니다.
즉, 데코레이터가 바로 아래에서 검사할 블랙보드 값을 서비스가 미리 세팅해야 할 때 유용합니다.

> [!caution]
> `OnSearchStart()`에서 무거운 계산을 넣는 것은 좋지 않습니다. 엔진 주석도 여기서는 instantaneous check를 권장합니다.

## 대표 기본 제공 서비스
엔진 코드 기준 기본 제공 서비스는 많지 않지만 용도가 분명합니다.

| 클래스 | 용도 |
|---|---|
| `UBTService_DefaultFocus` | AIController의 포커스 액터 지정 |
| `UBTService_RunEQS` | 주기적으로 EQS 실행 후 블랙보드 갱신 |
| `UBTService_BlackboardBase` | 블랙보드 키 기반 서비스 베이스 |
| `UBTService_BlueprintBase` | 블루프린트 서비스 베이스 |

## 언제 서비스를 쓰는가?
- 현재 타겟을 주기적으로 갱신할 때
- 시야, 거리, 태그 같은 주변 정보를 블랙보드에 반영할 때
- EQS를 주기적으로 돌려 최적 위치/대상 후보를 찾을 때
- 분기 활성 시 상태 플래그를 세우고 종료 시 해제할 때

## 서비스와 태스크의 차이
| 항목 | 서비스 | 태스크 |
|---|---|---|
| 목적 | 지식/상태 갱신 | 실제 액션 수행 |
| 결과값 | 없음 | `Succeeded / Failed / InProgress` |
| 생존 시간 | 분기 활성 동안 | 선택된 액션 실행 동안 |
| 전형적 출력 | 블랙보드 값 변경 | 이동, 대기, EQS 실행, 애니메이션 재생 |

## 학습 포인트
> [!tip]
> 언리얼 Behavior Tree에서 서비스는 "병렬 액션"보다 "병렬 상태 갱신"에 가깝습니다. 즉 서비스를 태스크 대용으로 쓰기보다, 데코레이터가 읽을 값을 준비하는 백그라운드 센서라고 생각하는 편이 맞습니다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTService.h`
- `Engine\Source\Runtime\AIModule\Private\BehaviorTree\BTService.cpp`
  - `NotifyParentActivation()`
  - `OnSearchStart()`
  - `ScheduleNextTick()`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\BTAuxiliaryNode.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Services\BTService_DefaultFocus.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Services\BTService_RunEQS.h`
- `Engine\Source\Runtime\AIModule\Classes\BehaviorTree\Services\BTService_BlueprintBase.h`

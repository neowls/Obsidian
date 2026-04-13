[AI Components in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-components-in-unreal-engine?application_version=5.6) | [UAIPerceptionComponent](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Perception/UAIPerceptionComponent) | [UAIPerceptionSystem](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/Perception/UAIPerceptionSystem) | [FAIStimulus](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AIModule/FAIStimulus)

## 개요
**AI 지각(AI Perception)** 은 AI가 월드에서 들어오는 자극을 감지하고, 이를 런타임 기억으로 관리하는 시스템입니다.
에디터에서는 단순히 `AIPerceptionComponent`와 `Sight/Hearing Config`를 붙이는 기능처럼 보이지만, 엔진 코드 기준으로는 다음 세 층이 핵심입니다.

| 구성 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| 시스템 | `UAIPerceptionSystem` | listener, source, sense 인스턴스를 관리하고 틱을 돌림 |
| 리스너 | `UAIPerceptionComponent` | 실제 지각 결과를 `PerceptualData`에 저장하고 delegate를 브로드캐스트 |
| 감각 | `UAISense` 및 파생 클래스 | sight, hearing 같은 실제 감지 규칙과 update 로직 담당 |
| 설정 | `UAISenseConfig` 및 파생 클래스 | 각 sense의 설정값 보관 |
| 자극 원본 | `UAIPerceptionStimuliSourceComponent` | 액터를 특정 sense의 자극 source로 등록 |
| 자극 데이터 | `FAIStimulus` | 감지 성공/실패, 위치, 강도, 만료 시간 등의 단위 데이터 |
| 타깃별 기억 | `FActorPerceptionInfo` | 한 액터에 대한 sense별 마지막 자극 묶음 |

즉 AI Perception은 "AI가 무엇을 봤는가"를 즉시 반환하는 함수라기보다, `sense -> stimulus -> listener memory -> gameplay response` 흐름을 가진 런타임 입력 계층으로 보는 편이 정확합니다.

> [!info]
> 비헤이비어 트리와 블랙보드는 의사결정 계층이고, AI Perception은 그 앞단에서 외부 자극을 수집하는 입력 계층입니다.

## 핵심 구성
### `UAIPerceptionSystem`
`UAIPerceptionSystem`은 `UAISubsystem` 기반의 AI 서브시스템입니다.
핵심 필드는 다음과 같습니다.

| 필드 | 의미 |
| --- | --- |
| `ListenerContainer` | 등록된 perception listener 목록 |
| `Senses` | 현재 월드에서 활성화된 `UAISense` 인스턴스들 |
| `RegisteredStimuliSources` | 현재 source로 등록된 액터들 |
| `DelayedStimuli` | 일정 시간 뒤 전달할 자극 큐 |
| `PerceptionAgingRate` | 자극 노화 주기 |
| `SourcesToRegister` | 다음 틱에 등록할 source 대기열 |

`UAIPerceptionSystem::Tick()`은 실제로 다음 순서로 동작합니다.

1. `SourcesToRegister`가 있으면 source 등록 수행
2. `NextStimuliAgingTick`이 되면 `AgeStimuli()`로 자극 나이 갱신
3. 각 `UAISense`에 대해 `ProgressTime()` 확인
4. 업데이트가 필요한 sense만 `Tick()` 호출
5. `DeliverDelayedStimuli()`로 지연 자극 전달
6. 새 자극이 있는 listener마다 `ProcessStimuli()` 호출

즉 perception의 중심 틱은 `AIPerceptionComponent`가 아니라 `AIPerceptionSystem`입니다.

### `UAIPerceptionComponent`
`UAIPerceptionComponent`는 owner 액터를 perception listener로 등록하는 컴포넌트입니다.

| 필드 | 의미 |
| --- | --- |
| `SensesConfig` | 이 listener가 사용할 감각 설정 목록 |
| `DominantSense` / `DominantSenseID` | 위치 해석에서 우선권을 갖는 감각 |
| `PerceptualData` | 타깃별 감지 기억 저장소 |
| `StimuliToProcess` | 이번 프레임에 처리할 자극 큐 |
| `MaxActiveAge` | sense별 자극 활성 유지 시간 |
| `PerceptionFilter` | 코드 주석 기준으로는 사실상 allow list |
| `bForgetStaleActors` | 오래된 기억을 완전히 지울지 여부 |

`OnRegister()`에서 `SensesConfig`를 등록하고, `UAIPerceptionSystem::UpdateListener(*this)`를 호출해 listener 등록을 시작합니다.

### `UAISense`
`UAISense`는 모든 감각의 공통 베이스입니다.

| 항목 | 의미 |
| --- | --- |
| `NotifyType` | `OnEveryPerception` 또는 `OnPerceptionChange` |
| `bWantsNewPawnNotification` | 새 pawn 등장 알림 필요 여부 |
| `bAutoRegisterAllPawnsAsSources` | 모든 pawn을 자동 source로 등록할지 |
| `bNeedsForgettingNotification` | forget 이벤트가 필요할지 |
| `ProgressTime()` | 이번 프레임 업데이트가 필요한지 계산 |
| `Tick()` | 내부적으로 `Update()`를 호출 |

> [!tip]
> AI Perception은 sense마다 "매 프레임 같은 비용"으로 도는 구조가 아닙니다. `UAISense::ProgressTime()`과 `Update()`를 통해 sense별 업데이트 타이밍을 조절합니다.

## 런타임 처리 흐름
### 1. Listener 등록
`UAIPerceptionComponent::OnRegister()`가 실행되면:

1. `SensesConfig`를 기반으로 각 sense config 등록
2. `UAIPerceptionSystem::UpdateListener(*this)` 호출
3. 시스템이 새 listener라면 `FPerceptionListenerID`를 발급하고 `ListenerContainer`에 추가
4. 기존 listener라면 캐시 위치와 속성을 갱신

### 2. Source 등록
source 등록은 크게 두 경로가 있습니다.

| 경로 | 설명 |
| --- | --- |
| 자동 등록 | sense가 `bAutoRegisterAllPawnsAsSources`를 켜 두었으면 pawn이 자동 source가 됨 |
| 명시적 등록 | `UAIPerceptionStimuliSourceComponent` 또는 `RegisterPerceptionStimuliSource()` 사용 |

`UAISense_Sight`는 생성자에서:
- `NotifyType = EAISenseNotifyType::OnPerceptionChange`
- `bAutoRegisterAllPawnsAsSources = true`
- `bNeedsForgettingNotification = true`

를 기본으로 둡니다.

즉 시야는 기본적으로 "상태 변화 중심으로 알림"을 보내고, 모든 pawn을 source 후보로 자동 등록하는 편입니다.

### 3. Stimulus 생성과 전달
sense는 내부 규칙에 따라 `FAIStimulus`를 만들어 listener에게 전달합니다.

예를 들어 hearing은 `UAISense_Hearing::ReportNoiseEvent()` 또는 `UAIPerceptionSystem::MakeNoiseImpl()` 경로로 이벤트를 쌓고, 필요하면 `DelayedStimuli`를 통해 나중에 전달할 수 있습니다.

### 4. `ProcessStimuli()`
`UAIPerceptionComponent::ProcessStimuli()`는 perception의 핵심 처리 함수입니다.

대략 다음 순서로 진행됩니다.

1. `StimuliToProcess`를 로컬 배열로 이동
2. source 액터별 `FActorPerceptionInfo` 조회 또는 신규 생성
3. sense ID에 맞는 `LastSensedStimuli` 슬롯 확보
4. 성공한 자극이면 `ConditionallyStoreSuccessfulStimulus()`로 저장
5. 실패/만료 자극이면 `MarkNoLongerSensed()` 또는 `HandleExpiredStimulus()` 처리
6. 필요하면 `UpdatedActors`에 추가
7. `OnTargetPerceptionUpdated` / `OnTargetPerceptionInfoUpdated` 브로드캐스트
8. `AAIController::ActorsPerceptionUpdated()` 호출
9. `OnPerceptionUpdated` 브로드캐스트
10. stale actor는 `ForgetActor()` 또는 데이터 제거

> [!info]
> 즉 perception은 sense가 곧바로 블랙보드를 만지는 구조가 아닙니다. 먼저 `PerceptualData`에 sense별 자극이 저장되고, 그 결과를 gameplay 쪽이 delegate나 조회 API로 소비합니다.

## `FAIStimulus`와 타깃 기억
### `FAIStimulus`
`FAIStimulus`는 한 번의 감지 결과를 나타내는 데이터 구조입니다.

| 필드 | 의미 |
| --- | --- |
| `Age` | 현재 자극의 나이 |
| `ExpirationAge` | 활성 상태로 유지할 최대 시간 |
| `Strength` | 자극 강도 |
| `StimulusLocation` | 자극이 발생한 위치 |
| `ReceiverLocation` | listener가 받은 위치 |
| `Tag` | 자극 식별용 태그 |
| `Type` | 어떤 sense에서 생성된 자극인지 |
| `bSuccessfullySensed` | 현재 감지 성공 상태 |
| `bExpired` | 만료 여부 |

핵심 메서드:
- `AgeStimulus()`
- `WasSuccessfullySensed()`
- `IsActive()`
- `IsExpired()`
- `MarkNoLongerSensed()`
- `MarkExpired()`

### `FActorPerceptionInfo`
`FActorPerceptionInfo`는 "한 액터를 각 감각이 마지막으로 어떻게 감지했는가"를 보관합니다.

| 필드 | 의미 |
| --- | --- |
| `Target` | 감지 대상 액터 |
| `LastSensedStimuli` | sense ID별 마지막 자극 배열 |
| `DominantSense` | 위치 해석 우선 sense |
| `bIsHostile`, `bIsFriendly` | 팀 태도 캐시 |

핵심 차이는 다음과 같습니다.

| 조회 기준 | 의미 |
| --- | --- |
| `HasAnyCurrentStimulus()` | 지금도 살아 있는 자극이 있는가 |
| `HasAnyKnownStimulus()` | 현재는 사라졌어도 아직 기억이 남아 있는가 |
| `GetLastStimulusLocation()` | 가장 적절한 마지막 자극 위치를 반환 |

> [!caution]
> `DominantSense`는 "무엇을 감지할 수 있는가"를 바꾸는 옵션이 아닙니다. 여러 자극이 있을 때 어떤 sense의 위치를 더 우선해서 마지막 위치로 볼지 결정하는 우선순위입니다.

## 감각 설정(Sense Config)
### `UAISenseConfig_Sight`
시야 설정에서 자주 보는 항목은 다음과 같습니다.

| 항목 | 의미 |
| --- | --- |
| `SightRadius` | 새 타깃을 인지할 수 있는 최대 거리 |
| `LoseSightRadius` | 이미 보던 타깃을 놓치기 전까지 유지하는 거리 |
| `PeripheralVisionAngleDegrees` | 반각 기준 시야 각도 |
| `DetectionByAffiliation` | 적/중립/아군 중 누구를 볼지 |
| `AutoSuccessRangeFromLastSeenLocation` | 마지막으로 본 위치 근처면 자동 성공 처리 |
| `PointOfViewBackwardOffset` | 시야 콘 계산 기준점 보정 |
| `NearClippingRadius` | 근거리 인식 보정 |

`UAISense_Sight::FDigestedSightProperties`는 이 값을 runtime-friendly 형태로 다시 계산합니다.
예를 들어 시야 반경은 제곱 거리, 시야각은 cosine 값으로 보관됩니다.

### `UAISenseConfig_Hearing`

| 항목 | 의미 |
| --- | --- |
| `HearingRange` | 청각 감지 거리 |
| `DetectionByAffiliation` | 적/중립/아군 필터 |
| `ReportNoiseEvent()` | 청각 이벤트 생성 진입점 |

코드 기준으로 `LoSHearingRange`, `bUseLoSHearing`는 deprecated 상태입니다.

### `FAISenseAffiliationFilter`
팀 기반 감지는 `FAISenseAffiliationFilter`가 담당합니다.

| 옵션 | 의미 |
| --- | --- |
| `bDetectEnemies` | 적 탐지 |
| `bDetectNeutrals` | 중립 탐지 |
| `bDetectFriendlies` | 아군 탐지 |

실제 판정은 `FGenericTeamId::GetAttitude()`와 결합됩니다.

## Stimuli Source 등록
`UAIPerceptionStimuliSourceComponent`는 owner 액터를 자극 source로 등록하는 전용 컴포넌트입니다.

| 항목 | 의미 |
| --- | --- |
| `bAutoRegisterAsSource` | 등록 시 자동 등록 여부 |
| `RegisterAsSourceForSenses` | 어떤 sense에 대해 source가 될지 |
| `RegisterWithPerceptionSystem()` | 등록 수행 |
| `RegisterForSense()` | 특정 sense 하나만 등록 |
| `UnregisterFromPerceptionSystem()` | 전체 해제 |

`OnRegister()`에서 `bAutoRegisterAsSource`가 켜져 있으면 자동 등록을 시도합니다.

> [!tip]
> pawn 기반 sight는 자동 등록 경로가 이미 강하게 잡혀 있으므로, `StimuliSourceComponent`는 비-pawn 액터, hearing, custom sense, 명시적 등록 제어가 필요할 때 더 의미가 큽니다.

## 블루프린트와 런타임 API
### 자주 쓰는 조회 API

| API | 의미 |
| --- | --- |
| `GetCurrentlyPerceivedActors()` | 지금 active한 자극이 있는 액터만 가져옴 |
| `GetKnownPerceivedActors()` | 현재는 놓쳤어도 기억이 남은 액터까지 가져옴 |
| `GetActorsPerception()` | 특정 액터의 전체 perception info 조회 |
| `SetSenseEnabled()` | sense on/off |
| `RequestStimuliListenerUpdate()` | listener 속성 재계산 요청 |

### Delegate 차이

| Delegate | 특징 |
| --- | --- |
| `OnPerceptionUpdated` | 여러 액터를 묶어서 알려주는 배치 이벤트 |
| `OnTargetPerceptionUpdated` | 액터 + stimulus 단위 이벤트 |
| `OnTargetPerceptionInfoUpdated` | source actor가 무효여도 `TargetId` 기반으로 이벤트 유지 |
| `OnTargetPerceptionForgotten` | 모든 자극이 사라지거나 explicit forget 시 호출 |

`OnTargetPerceptionUpdated`와 `OnTargetPerceptionInfoUpdated`의 차이는 실전에서 중요합니다.

> [!caution]
> source actor가 처리 시점에 이미 무효가 되었을 수 있습니다. 이런 경우 bookkeeping이 중요하면 `OnTargetPerceptionUpdated`보다 `OnTargetPerceptionInfoUpdated`가 더 안전합니다.

> [!caution]
> `OnTargetPerceptionForgotten`이 항상 자동으로 오는 것은 아닙니다. 주석에도 적혀 있듯 `AIPerceptionSystem.bForgetStaleActors`가 활성화되어 있어야 stale actor를 완전히 잊습니다.

## Behavior Tree / Blackboard와의 연결
AI Perception은 비헤이비어 트리와 자동으로 직결되지 않습니다.
보통은 다음 구조로 연결합니다.

1. `UAIPerceptionComponent` delegate 수신
2. `GetActorsPerception()` 또는 `FAIStimulus` 확인
3. 블랙보드 키 갱신
4. 데코레이터 observer abort 또는 서비스 갱신
5. 비헤이비어 트리 재평가

예를 들면:
- sight 성공 -> `TargetActor` 키 설정
- sight 상실 -> `TargetActor` clear 또는 `LastKnownLocation` 갱신
- hearing 성공 -> `InvestigateLocation` 설정

> [!info]
> "AI가 적을 봤다"는 사실 자체는 perception memory에 먼저 저장됩니다. 블랙보드는 그 결과를 의사결정용 데이터로 옮겨 담는 2차 저장소입니다.

## 디버깅 포인트
AI Perception은 코드 차원에서 gameplay debugger와 visual logger를 염두에 두고 설계되어 있습니다.

확인 포인트:
- `UAIPerceptionComponent::DescribeSelfToGameplayDebugger()`
- `UAIPerceptionSystem::DescribeSelfToGameplayDebugger()`
- `FAIStimulus::GetDebugDescription()`
- `GetActorsPerception()` 결과

실전 디버깅에서는 아래를 먼저 구분하는 편이 빠릅니다.

| 질문 | 확인할 것 |
| --- | --- |
| 아예 감지가 안 되는가 | source 등록, sense enabled, affiliation |
| 감지되는데 금방 사라지는가 | `MaxAge`, `LoseSightRadius`, 실패 자극 처리 |
| 기억은 남는데 행동이 안 바뀌는가 | 블랙보드 갱신, 데코레이터 abort, BT 연결 |

## 일반 팁
- perception은 "즉시 액션"보다 "입력 메모리"로 이해하면 구조가 단순해진다.
- `GetCurrentlyPerceivedActors()`와 `GetKnownPerceivedActors()`를 구분하지 않으면 BT 조건이 쉽게 꼬인다.
- 시야 기반 추적은 `TargetActor`와 `LastKnownLocation`을 분리해 저장하는 편이 안전하다.
- custom sense를 만들더라도 시스템 구조는 동일하다. 결국 `UAISense::Update()`가 자극을 만들고 listener가 이를 처리한다.
- perception은 네트워크 복제가 아니다. 멀티플레이 게임에서는 서버와 클라이언트 중 누가 perception을 돌리는지 먼저 정해야 한다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AIModule\Classes\Perception\AIPerceptionComponent.h`
  - listener API, delegate, 지각 메모리 구조
- `Engine\Source\Runtime\AIModule\Private\Perception\AIPerceptionComponent.cpp`
  - `ConfigureSense()`, `RegisterStimulus()`, `ProcessStimuli()`, `AgeStimuli()`
- `Engine\Source\Runtime\AIModule\Classes\Perception\AIPerceptionSystem.h`
  - listener/source/sense 전체 관리 구조
- `Engine\Source\Runtime\AIModule\Private\Perception\AIPerceptionSystem.cpp`
  - `Tick()`, `DeliverDelayedStimuli()`, source 등록 경로
- `Engine\Source\Runtime\AIModule\Classes\Perception\AISense.h`
  - 모든 sense의 공통 베이스와 update 모델
- `Engine\Source\Runtime\AIModule\Classes\Perception\AIPerceptionTypes.h`
  - `FAIStimulus`, `FAISenseAffiliationFilter`, `FPerceptionListener`
- `Engine\Source\Runtime\AIModule\Classes\Perception\AISenseConfig_Sight.h`
  - sight 설정값
- `Engine\Source\Runtime\AIModule\Classes\Perception\AISenseConfig_Hearing.h`
  - hearing 설정값
- `Engine\Source\Runtime\AIModule\Classes\Perception\AIPerceptionStimuliSourceComponent.h`
  - source 등록 컴포넌트 API

## 정리
AI Perception을 한 줄로 줄이면 다음과 같습니다.

1. `UAIPerceptionSystem`이 sense를 틱한다.
2. sense가 `FAIStimulus`를 만든다.
3. `UAIPerceptionComponent`가 이를 `PerceptualData`에 저장한다.
4. gameplay 쪽이 이를 블랙보드와 행동 로직으로 연결한다.

즉 앞으로 `EQS`, `Navigation`, `StateTree`를 공부하더라도, 그 앞단 입력 계층은 결국 이 perception 구조 위에 놓인다고 이해하면 됩니다.
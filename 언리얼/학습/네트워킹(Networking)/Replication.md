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

# Replication

> [!summary] 요약
> Replication은 서버의 actor/property 상태를 관련 클라이언트에 보내 동기화하는 Unreal 네트워킹의 상태 전파 시스템이다.
> 체력, 점수, 문 열림 상태, 인벤토리처럼 현재 상태가 클라이언트에도 유지되어야 할 때 사용한다.
> 핵심은 서버에서 바뀐 상태가 actor channel, relevancy, condition, RepNotify 흐름을 거쳐 클라이언트에 반영된다는 점이다.

## 핵심 결론

- Replication은 과거 이벤트 기록이 아니라 현재 상태 동기화이므로 late joiner에게도 상태를 설명할 수 있어야 한다.
- `Replicated`, `RepNotify`, lifetime property 등록, condition, relevancy가 모두 맞아야 값이 전달된다.
- 값이 안 오면 서버에서 실제 변경됐는지, actor가 relevant한지, dormancy/frequency/condition에 막혔는지 확인한다.

## 참고 자료

[Replicate Actor Properties in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine) | [Replicating UObjects in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicating-uobjects-in-unreal-engine) | [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine)

## 개요
`Replication`은 서버가 가진 상태를 클라이언트에 동기화하는 기능이다.
언리얼 엔진의 멀티플레이는 기본적으로 `server-authoritative` 모델이므로, 복제(Replication)의 출발점은 항상 서버다.

이 문서는 복제 규칙뿐 아니라, 실제 UE 5.7 엔진 코드 기준 `등록 -> 런타임 메타데이터화 -> connection별 필터링 -> 수신 -> RepNotify / PostReceive` 경로까지 한 번에 정리한다.

## 왜 필요한가

네트워크 버그는 기능 코드가 틀려서보다 실행 위치와 복제 조건을 잘못 가정해서 생기는 경우가 많다. Replication을 볼 때는 "서버의 사실", "클라이언트의 요청", "복제로 전달되는 상태"를 분리해야 한다.

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

## 함께 볼 로컬 문서
- [[언리얼 네트워킹]]
- [[RPC]]
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]
- [[CharacterMovement와 예측(CharacterMovement Prediction)]]

## 전제조건
- 멀티플레이 환경에서 상태의 진실은 서버가 가진다.
- 액터가 복제되려면 보통 `bReplicates = true`가 필요하다.
- 복제할 프로퍼티는 `UPROPERTY(Replicated)` 또는 `UPROPERTY(ReplicatedUsing=...)`로 선언한다.
- 복제 목록은 `GetLifetimeReplicatedProps()`에서 등록한다.
- 액터가 특정 클라이언트에게 `relevant`해야 실제 전송된다.

## 핵심 개념

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 프로퍼티 복제란 무엇인가
- 서버에서 값이 변경된다.
- 언리얼은 복제 대상으로 등록된 프로퍼티를 검사한다.
- 변경된 값만 각 클라이언트로 전송한다.
- 클라이언트는 자신의 로컬 액터 복사본에 값을 적용한다.

즉 `Replication`의 본질은 `현재 상태 동기화`다.

## 프로퍼티 복제 방식

| 방식 | 설명 | 언제 쓰는가 |
| --- | --- | --- |
| `Replicated` | 값만 동기화한다 | 후처리 없이 상태만 맞추면 될 때 |
| `ReplicatedUsing` | 값 동기화 후 `RepNotify`를 호출한다 | UI, 연출, 로컬 후처리가 필요할 때 |
| `NotReplicated` | 복제 구조체 내부에서 특정 필드를 제외한다 | 복제 구조 안에 예외 필드가 있을 때 |

> [!info]
> `Replicated`와 `ReplicatedUsing`을 고를 때는 "상태만 맞출 것인가"와 "수신 후처리가 필요한가"를 먼저 구분하면 된다.

## 등록과 선언

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 가장 기본적인 설정
```cpp
UCLASS()
class ADerivedActor : public AActor
{
    GENERATED_BODY()

public:
    UPROPERTY(Replicated)
    uint32 Health;

    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
};
```

```cpp
#include "Net/UnrealNetwork.h"

ADerivedActor::ADerivedActor()
{
    bReplicates = true;
}

void ADerivedActor::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME(ADerivedActor, Health);
}
```

## `ReplicatedUsing`와 `OnRep`
```cpp
UPROPERTY(ReplicatedUsing=OnRep_HealthUpdate)
uint32 Health;

UFUNCTION()
void OnRep_HealthUpdate();
```

대표 사용처:
- 체력바 갱신
- 장비 교체 연출
- 상태 이상 아이콘 갱신
- 로컬 사운드/이펙트 반응

> [!caution]
> `OnRep`는 서버에서 값을 대입했다고 자동으로 서버에서 호출되는 함수가 아니다. 보통은 클라이언트가 복제 값을 수신했을 때 반응하는 함수로 보는 편이 안전하다.

## 조건부 복제

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 자주 쓰는 조건

| 조건 | 설명 | 실무 해석 |
| --- | --- | --- |
| `COND_None` | 값이 바뀌면 누구에게나 보낸다 | 기본 상태 복제 |
| `COND_InitialOnly` | 초기 번들에서만 보낸다 | 초깃값, 설정값 |
| `COND_OwnerOnly` | 액터 owner에게만 보낸다 | 개인 UI 정보 |
| `COND_SkipOwner` | owner를 제외한 나머지에게 보낸다 | owner는 이미 알고 있는 값 |
| `COND_SimulatedOnly` | simulated actor에게 보낸다 | 보정용 상태 |
| `COND_AutonomousOnly` | autonomous actor에게만 보낸다 | 자율 프록시 전용 데이터 |
| `COND_InitialOrOwner` | 초기 번들이거나 owner일 때 보낸다 | 초기값 + owner 유지 |
| `COND_Custom` | 커스텀 조건으로 켜고 끈다 | 고급 제어 |
| `COND_Dynamic` | 런타임에 조건을 바꾼다 | 동적 정책 변경 |
| `COND_Never` | 절대 복제하지 않는다 | 등록은 유지하되 전송 차단 |

```cpp
DOREPLIFETIME_CONDITION(ADerivedActor, Health, COND_OwnerOnly);
```

## `FDoRepLifetimeParams`
등록 시점 정책 묶음은 `FDoRepLifetimeParams`가 담당한다.

| 필드 | 의미 |
| --- | --- |
| `Condition` | `ELifetimeCondition`, 어떤 connection에서 보낼지 |
| `RepNotifyCondition` | `REPNOTIFY_OnChanged` 또는 `REPNOTIFY_Always` |
| `bIsPushBased` | push model 여부 |
| `CreateAndRegisterReplicationFragmentFunction` | Iris fragment 등록용 함수 |

## 내부 파이프라인

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 전체 흐름

| 단계 | 핵심 함수/파일 | 의미 |
| --- | --- | --- |
| 사용자 등록 | `GetLifetimeReplicatedProps()`, `DOREPLIFETIME*` | 어떤 프로퍼티를 어떤 조건으로 등록할지 지정 |
| 메타데이터 빌드(Build) | `FRepLayout::InitFromClass()` | condition, repnotify, serialization 메타데이터 구성 |
| 활성/조건 필터링 | `GetReplicatedCustomConditionState()`, `RebuildConditionalProperties()` | 이번 connection에서 실제로 보낼지 결정 |
| 송신 | `CompareProperties()`, `FilterChangeList()`, `SendProperties()` | 변경된 프로퍼티만 직렬화 |
| 수신 | `ReceiveProperties()` | bunch를 읽어 object/shadow buffer 갱신 |
| 후처리 | `CallRepNotifies()`, `OnRep_*`, `PostNetReceive*` | 로컬 후처리 실행 |

## `FRepLayout::InitFromClass()`
이 함수는 registration list를 받아 실제 런타임 메타데이터를 만든다.

핵심으로 정리되는 정보:
- `Condition`
- `RepNotifyCondition`
- `RepNotifyNumParams`
- push model 여부
- custom delta / netserialize 플래그

즉 `GetLifetimeReplicatedProps()`는 선언적 등록이고, 실제 송수신 파이프라인은 `FRepLayout`이 만든 메타데이터를 기준으로 동작한다.

## 등록 누락의 의미
엔진은 `Replicated` 선언은 되어 있는데 등록이 빠진 프로퍼티를 정상 상태로 보지 않는다.
`UE::Net::bAutoRegisterReplicatedProperties` 설정과 `DISABLE_REPLICATED_PROPERTY` 경로가 따로 존재하는 이유도 그 때문이다.

> [!caution]
> 복제하지 않을 생각이라면 등록을 빼먹기보다 의도를 드러내는 방식으로 처리하는 편이 낫다.

## `AActor::GetLifetimeReplicatedProps()`가 보여주는 엔진 기본 패턴
`ActorReplication.cpp`를 보면 엔진 자신도 프로퍼티마다 같은 규칙을 쓰지 않는다.

예:
- `Role`, `RemoteRole`, `Owner`, `Instigator`
- `AttachmentReplication` -> `COND_Custom`, `REPNOTIFY_Always`
- `ReplicatedMovement` -> `COND_SimulatedOrPhysics`, `REPNOTIFY_Always`

즉 movement/attachment 같은 핵심 필드는 일반 gameplay 변수처럼 다루지 않는다.

## 필터링 단계
`FRepLayout::RebuildConditionalProperties()`는 현재 connection의 `RepFlags`를 받아 condition map을 만든다.
그리고 각 parent property에 대해 이번 connection에서 inactive인지 계산한다.

핵심 축:
- `BuildConditionMapFromRepFlags(RepFlags)`
- `COND_Dynamic`
- `RepChangedPropertyTracker`
- custom active state

즉 `ELifetimeCondition`은 선언적 enum이지만, 실제 전송 여부는 connection별 런타임 필터 단계에서 결정된다.

## 송신 단계
전체 구조상 아래 함수들이 한 묶음이다.

- `CompareProperties()`
- `FilterChangeList()`
- `SendProperties()`

역할은 다음과 같다.
- shadow state와 현재 object state 비교
- 바뀐 property handle만 change list 구성
- condition/custom active/dynamic condition으로 재필터링
- 살아남은 property만 직렬화

## 수신 단계
`FRepLayout::ReceiveProperties()`는 다음 순서로 동작한다.

1. object data buffer 생성
2. `RepNotifies` 활성 여부 확인
3. `ReadPropertyHandle()`
4. `ReceiveProperties_r()` 재귀로 실제 데이터 읽기
5. terminator handle 검사

`ReceiveProperties_r()`는 array, dynamic array, custom delta, object reference, unmapped GUID를 함께 처리한다.

## `RepNotify`와 수신 후처리
`FRepLayout::CallRepNotifies()`는 큐에 쌓인 `RepNotifies`를 순회하며 실제 `OnRep`를 호출한다.

중요한 점:
- `0`개 파라미터 `OnRep`
- `1`개 파라미터 `OnRep`
- `2`개 파라미터 `OnRep`
- `REPNOTIFY_OnChanged`
- `REPNOTIFY_Always`

즉 `OnRep` 호출 여부는 단순히 복제 값을 받았는가가 아니라, local/shadow 비교와 repnotify 조건까지 포함한 결과다.

## actor 특화 후처리
movement 같은 엔진 핵심 필드는 일반 `OnRep` 하나로 끝나지 않는다.

예:
- `OnRep_ReplicatedMovement`
- `PostNetReceiveLocationAndRotation()`
- `PostNetReceiveVelocity()`
- `PostNetReceivePhysicState()`

> [!info]
> movement 같은 필드는 `OnRep`가 곧 최종 처리라는 보장이 없다. 실제 적용은 `PostNetReceive*` 계열에서 이어질 수 있다.

## 오브젝트 레퍼런스와 서브오브젝트

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 복제 가능한 레퍼런스
네트워크에서 오브젝트 레퍼런스는 `FNetworkGUID` 기반으로 처리된다.

대표 대상:
- 복제되는 액터
- 안정적인 이름을 가진 비복제 액터
- 복제되는 컴포넌트
- 안정적인 이름을 가진 비복제 컴포넌트
- 로드된 패키지의 비액터 `UObject`

## 안정적인 이름(Stably Named Objects)
서버와 클라이언트 양쪽에 존재하고 이름이 동일한 객체라면 네트워크 참조가 가능하다.

대표 예:
- 패키지에서 직접 로드된 액터
- C++ 생성자에서 이름이 고정된 컴포넌트
- `SetNetAddressable`로 명시한 컴포넌트

## 서브오브젝트 복제

| 방식 | 설명 | 특징 |
| --- | --- | --- |
| `ReplicateSubobjects()` | 기존 방식 | 하위 호환용 |
| `AddReplicatedSubObject()` | 등록 리스트 방식 | 최신 방식, Iris 호환 |

> [!tip]
> UObject/서브오브젝트 심화는 [[Fast Array, Component, Subobject(FastArray Component Subobject)]] 문서에서 별도로 본다.

## 실무 해석

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## Replication으로 푸는 문제
- 체력
- 탄약 수치
- 문이 열려 있는 상태
- 현재 장착 무기 ID
- 점수
- 라운드 상태

## RPC와의 경계
- `ServerTryOpenDoor()`는 RPC
- `bIsDoorOpen`은 Replication
- `OnRep_IsDoorOpen()`에서 문 애니메이션 재생

## 일반 팁
- 개인 정보인지 공용 정보인지 먼저 구분하면 조건 선택이 쉬워진다.
- 상태를 남겨야 하는가를 먼저 보면 `Replication`과 `RPC`를 덜 헷갈린다.
- 값이 안 가는 문제는 `등록 누락`과 `전송 누락`을 먼저 분리해서 본다.
- 큰 데이터 묶음은 일반 property replication보다 별도 구조가 더 적합할 수 있다.

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Public\Net\UnrealNetwork.h`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\RepLayout.cpp`
- `Engine\Source\Runtime\Engine\Classes\Components\ActorComponent.h`
- `Engine\Source\Runtime\Net\Core\Classes\Net\Serialization\FastArraySerializer.h`

## 정리
복제는 `서버 상태를 클라이언트에 맞춘다`는 기준으로 보면 가장 단순해진다.

이때 실제 설계는 아래 순서로 생각하면 된다.

1. 이 정보가 현재 상태인가
2. 누가 이 값을 봐야 하는가
3. owner 전용인가, 모두가 알아야 하는가
4. 프로퍼티 복제로 충분한가
5. 수신 후처리가 필요한가
6. 서브오브젝트나 별도 구조로 분리할 가치가 있는가

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| `HasAuthority()`가 true면 항상 서버 전용 코드다. | authority, net mode, local control, owner를 각각 확인한다. |
| Client RPC는 아무 actor에서나 호출할 수 있다. | owning connection이 있는 actor인지 먼저 확인한다. |
| 모든 이벤트를 RPC로 보내면 된다. | 남아야 하는 값은 replicated property와 RepNotify로 처리한다. |

## 디버깅 체크리스트

- [ ] 대상 actor의 `bReplicates`, relevancy, dormancy 설정을 확인했다.
- [ ] RPC 호출 actor에 owning connection이 있다.
- [ ] 서버/클라이언트 양쪽에서 net mode와 role 로그를 찍었다.
- [ ] RepNotify가 초기 복제, 변경 복제, late join 상황에서 기대대로 호출된다.
- [ ] Net update frequency, dormancy 해제, relevancy 거리 때문에 누락되지 않는다.

## 관련 문서

- [[언리얼 네트워킹]]
- [[CharacterMovement와 예측(CharacterMovement Prediction)]]
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]
- [[Iris와 Replication Graph(Iris Replication Graph)]]
- [[RPC]]

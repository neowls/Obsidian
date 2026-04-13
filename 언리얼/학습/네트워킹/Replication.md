[Replicate Actor Properties in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine)

# 개요
`Replication`은 서버가 가진 상태를 클라이언트에 동기화하는 기능이다.
언리얼 엔진의 멀티플레이는 기본적으로 `server-authoritative` 모델이므로, 복제의 출발점은 항상 서버다.

즉, 클라이언트가 임의로 상태를 확정하는 것이 아니라 서버가 상태를 바꾸고, 언리얼이 그 결과를 각 클라이언트의 로컬 복사본에 적용한다.
이 문서는 공식문서의 `Replicate Actor Properties` 내용을 중심으로, 실무에서 바로 구분해야 하는 복제 규칙과 사용 기준을 정리한 노트다.

## 함께 보면 좋은 공식문서
- [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine)
- [Replicating UObjects in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicating-uobjects-in-unreal-engine)
- [Replication 등록, 필터링, 수신 후처리(Replication Registration Filtering PostReceive)](<Replication 등록, 필터링, 수신 후처리(Replication Registration Filtering PostReceive).md>)
- [Remote Procedure Calls in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine)

## 전제조건
- 멀티플레이 환경에서 상태의 진실은 서버가 가진다.
- 액터가 복제되려면 보통 `bReplicates = true`가 필요하다.
- 복제할 프로퍼티는 `UPROPERTY(Replicated)` 또는 `UPROPERTY(ReplicatedUsing=...)`로 선언한다.
- 복제 목록은 `GetLifetimeReplicatedProps()`에서 등록한다.
- 액터가 특정 클라이언트에게 `relevant`해야 실제 전송된다.

# 핵심 개념

## 프로퍼티 복제란 무엇인가
공식문서 기준으로 액터 프로퍼티 복제는 다음 의미를 가진다.

- 서버에서 값이 변경된다.
- 언리얼은 복제 대상으로 등록된 프로퍼티를 검사한다.
- 변경된 값만 각 클라이언트로 전송한다.
- 클라이언트는 자신의 로컬 액터 복사본에 값을 적용한다.

즉 `Replication`의 본질은 `함수 호출`이 아니라 `현재 상태 동기화`다.

## 프로퍼티 복제 방식
| 방식 | 설명 | 언제 쓰는가 |
| --- | --- | --- |
| `Replicated` | 값만 동기화한다. | 후처리 없이 상태만 맞추면 될 때 |
| `ReplicatedUsing` | 값 동기화 후 `RepNotify`를 호출한다. | UI, 연출, 로컬 후처리가 필요할 때 |
| `NotReplicated` | 복제 구조체 내부에서 특정 필드를 제외한다. | 복제 구조 안에 예외 필드가 있을 때 |

> [!info]
> 공식문서에서도 `Replicated`와 `ReplicatedUsing`을 기본 선택지로 둔다. 실무에서는 "상태만 맞출 것인가"와 "수신 후처리가 필요한가"를 먼저 구분하면 된다.

# 액터 프로퍼티 복제

## 가장 기본적인 복제 설정
공식문서의 기본 흐름은 다음과 같다.

1. 헤더에서 프로퍼티를 `Replicated`로 지정한다.
2. 생성자에서 액터를 복제 가능하게 설정한다.
3. `GetLifetimeReplicatedProps()`에서 `DOREPLIFETIME`으로 등록한다.

```cpp
// DerivedActor.h
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
// DerivedActor.cpp
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

## `ReplicatedUsing`와 RepNotify
특정 값이 복제될 때마다 클라이언트에서 추가 동작이 필요하면 `ReplicatedUsing`을 쓴다.

```cpp
UPROPERTY(ReplicatedUsing=OnRep_HealthUpdate)
uint32 Health;

UFUNCTION()
void OnRep_HealthUpdate();
```

이 방식은 다음 경우에 특히 유용하다.

- 체력바 갱신
- 장비 교체 연출
- 상태 이상 아이콘 갱신
- 로컬 사운드/이펙트 재생 트리거

> [!caution]
> `OnRep`는 서버에서 값을 대입했다고 자동으로 서버에서 호출되는 함수가 아니다. 보통은 클라이언트가 복제 값을 수신했을 때 반응하는 함수로 이해하는 편이 안전하다.

# 조건부 복제

## 왜 조건이 필요한가
공식문서에서도 복제 조건(`Conditional Replication`)을 중요하게 다룬다.
모든 값을 모든 클라이언트에게 보내는 것은 대역폭과 CPU 측면에서 비효율적이기 때문이다.

## 자주 쓰는 복제 조건
| 조건 | 설명 | 실무 해석 |
| --- | --- | --- |
| `COND_None` | 값이 바뀌면 누구에게나 보낸다. | 기본 상태 복제 |
| `COND_InitialOnly` | 초기 번들에서만 보낸다. | 초깃값, 설정값 |
| `COND_OwnerOnly` | 액터 owner에게만 보낸다. | 개인 UI 정보 |
| `COND_SkipOwner` | owner를 제외한 나머지에게 보낸다. | owner는 이미 알고 있는 값 |
| `COND_SimulatedOnly` | simulated actor에게 보낸다. | 보정용 상태 |
| `COND_AutonomousOnly` | autonomous actor에게만 보낸다. | 자율 프록시 전용 데이터 |
| `COND_InitialOrOwner` | 초기 번들이거나 owner일 때 보낸다. | 초기값 + owner 유지 |
| `COND_Custom` | 커스텀 조건으로 켜고 끈다. | 고급 제어 |
| `COND_Dynamic` | 런타임에 조건을 바꾼다. | 동적 정책 변경 |
| `COND_Never` | 절대 복제하지 않는다. | 등록은 유지하되 전송 차단 |

공식문서에 나온 대표 예시는 `DOREPLIFETIME_CONDITION` 매크로를 통해 등록한다.

```cpp
DOREPLIFETIME_CONDITION(ADerivedActor, Health, COND_OwnerOnly);
```

## 커스텀 조건
공식문서 기준으로 프로퍼티를 한 번 등록하면 객체 수명 동안 등록 상태는 유지된다.
대신 `COND_Custom`, `COND_Dynamic`, 활성 오버라이드 계열 매크로를 사용해 실제 전송 여부를 제어한다.

> [!tip]
> 실무에서는 먼저 `COND_OwnerOnly`, `COND_SkipOwner`, `COND_InitialOnly` 같은 기본 조건으로 해결 가능한지 본 뒤, 꼭 필요할 때만 커스텀 조건으로 내려가는 편이 디버깅이 쉽다.

# 오브젝트 레퍼런스 복제

## 복제 가능한 레퍼런스
공식문서 기준으로 오브젝트 레퍼런스는 네트워크에서 `FNetworkGUID` 기반으로 처리된다.
즉 단순 포인터 복사가 아니라, 네트워크에서 식별 가능한 객체 참조로 다뤄진다.

복제 가능한 대표 대상:
- 복제되는 액터
- 안정적인 이름을 가진 비복제 액터
- 복제되는 컴포넌트
- 안정적인 이름을 가진 비복제 컴포넌트
- 로드된 패키지의 비액터 `UObject`

## 안정적인 이름(Stably Named Objects)
공식문서에서는 `Stably Named Objects`를 따로 설명한다.
서버와 클라이언트 양쪽에 존재하고, 이름이 동일한 객체라면 네트워크 참조가 가능하다.

대표 예:
- 패키지에서 직접 로드된 액터
- C++ 생성자에서 이름이 고정된 컴포넌트
- `SetNetAddressable`로 명시한 컴포넌트

# UObject / 서브오브젝트 복제

## 왜 필요한가
공식문서 `Replicating UObjects in Unreal Engine`는 액터보다 더 가벼운 `UObject`를 서브오브젝트로 복제하는 방법을 설명한다.
이건 인벤토리 항목, 능력 인스턴스, 상태 데이터 묶음처럼 액터로 만들기엔 무거운 데이터를 분리할 때 유용하다.

## 두 가지 방식
| 방식 | 설명 | 특징 |
| --- | --- | --- |
| `ReplicateSubobjects()` | 기존 방식 | 하위 호환용, 수동 관리 |
| `AddReplicatedSubObject()` | 등록 리스트 방식 | 최신 방식, Iris 호환 |

공식문서 기준으로 `Iris`를 쓰는 경우 등록 리스트 방식이 필요하다.

## Default Subobject와 Dynamic Subobject
| 종류 | 생성 시점 | 특징 |
| --- | --- | --- |
| Default Subobject | 생성자 | 서버/클라이언트 모두 자기 인스턴스를 만든다 |
| Dynamic Subobject | 런타임 | 서버가 생성하고, 클라이언트는 복제 시점에 매핑된다 |

## UObject 복제 준비
공식문서에서 공통으로 요구하는 핵심 항목은 아래다.

- `IsSupportedForNetworking()` 구현
- `GetLifetimeReplicatedProps()` 구현
- owning actor도 복제
- 필요 시 object reference도 replicated property로 선언
- 실제 서브오브젝트 등록 수행

> [!caution]
> 공식문서에서도 서브오브젝트를 reference만 복제하고 실제 등록을 하지 않으면 문제가 생길 수 있다고 경고한다. 즉 포인터만 복제하는 것과 서브오브젝트 자체를 복제 대상으로 등록하는 것은 다른 단계다.

# 실무 해석

## Replication으로 푸는 문제
다음은 기본적으로 `Replication`으로 생각하는 편이 맞다.

- 체력
- 탄약 수치
- 문이 열려 있는 상태
- 현재 장착 무기 ID
- 점수
- 라운드 상태
- 플레이어별 공개 정보

## RPC와의 경계
`Replication`은 현재 상태를 맞추는 수단이다.
반대로 요청, 응답, 순간 이벤트는 보통 `RPC`가 더 적합하다.

예시:
- `ServerTryOpenDoor()`는 RPC
- `bIsDoorOpen`은 Replication
- `OnRep_IsDoorOpen()`에서 문 애니메이션 재생

## owner 기반 조건의 대표 사례
- 개인 HUD 탄약 수치 -> `COND_OwnerOnly`
- owner는 이미 알고 있는 조준 보정값 -> `COND_SkipOwner`
- 초기에만 필요한 설정값 -> `COND_InitialOnly`

# 주의사항

> [!caution]
> 복제는 "서버가 값을 바꿔서 보낸다"는 구조다. 클라이언트에서 replicated 변수를 바꿔도 서버 상태는 바뀌지 않는다.

> [!caution]
> `UPROPERTY(Replicated)`만 붙이고 `GetLifetimeReplicatedProps()`에 등록하지 않으면 실제로는 복제가 되지 않는다.

> [!caution]
> 액터가 relevant하지 않거나 dormancy 상태라면 값이 기대한 시점에 안 갈 수 있다. 복제 설정과 전송 조건은 따로 봐야 한다.

# 일반 팁

- 개인 정보인지 공용 정보인지 먼저 구분하면 조건 선택이 쉬워진다.
- 상태를 남겨야 하는가를 먼저 보면 `Replication`과 `RPC`를 덜 헷갈린다.
- 큰 데이터 묶음은 무작정 프로퍼티를 늘리기보다 서브오브젝트나 별도 구조로 나누는 편이 관리가 쉽다.
- `Iris`를 쓸 가능성이 있다면 서브오브젝트는 등록 리스트 방식에 익숙해지는 편이 좋다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Public\Net\UnrealNetwork.h`
  - `DOREPLIFETIME` 계열 매크로와 `FDoRepLifetimeParams`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
  - 액터 기본 복제 필드와 전송 조건 흐름
- `Engine\Source\Runtime\Engine\Private\RepLayout.cpp`
  - RepNotify와 프로퍼티 복제 레이아웃 처리
- `Engine\Source\Runtime\Engine\Classes\Components\ActorComponent.h`
  - 컴포넌트 복제와 서브오브젝트 등록 API
- `Engine\Source\Runtime\Net\Core\Classes\Net\Serialization\FastArraySerializer.h`
  - 큰 배열 복제의 심화 경로

## 정리
복제는 "서버 상태를 클라이언트에 맞춘다"는 기준으로 보면 가장 단순해진다.
이때 실제 설계는 아래 순서로 생각하면 된다.

1. 이 정보가 현재 상태인가
2. 누가 이 값을 봐야 하는가
3. owner 전용인가, 모두가 알아야 하는가
4. 프로퍼티 복제로 충분한가
5. 서브오브젝트나 오브젝트 레퍼런스로 분리할 가치가 있는가

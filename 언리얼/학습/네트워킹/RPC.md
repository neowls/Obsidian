[Remote Procedure Calls in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine)

# 개요
`RPC(Remote Procedure Calls)`는 네트워크 너머의 다른 머신에서 함수를 실행하게 만드는 기능이다.
언리얼 엔진 네트워크 모델에서 `Replication`이 상태 동기화라면, `RPC`는 요청, 응답, 순간 이벤트 전달에 해당한다.

공식문서 기준으로 RPC는 `로컬에서 호출되지만 원격에서 실행되는 함수`이며, 네트워크 연결과 ownership에 의해 실제 실행 위치가 결정된다.
즉 RPC는 단순 문법이 아니라 `누가 누구에게 호출할 수 있는가`를 먼저 이해해야 제대로 쓸 수 있다.

## 함께 보면 좋은 공식문서
- [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine)
- [Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine)
- [Actor Role and Remote Role in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-role-and-remote-role-in-unreal-engine)

## 함께 볼 엔진 내부 문서
- [[권한, 소유, 연결(Authority Ownership Connection)]]
- [[RPC callspace와 전송 경로(RPC Callspace Transmission Path)]]

## 전제조건
- RPC는 액터 또는 액터 컴포넌트에서 호출하는 것이 기본이다.
- RPC를 쓰려면 관련 액터와 필요한 컴포넌트가 복제 가능해야 한다.
- ownership이 맞지 않으면 `Server`, `Client` RPC는 기대한 대상에게 전달되지 않는다.
- RPC는 상태 저장 수단이 아니라 원격 함수 실행 수단이다.

# 핵심 개념

## RPC의 역할
공식문서 기준으로 RPC의 주요 용도는 아래와 같다.

- 사운드 재생
- 파티클 생성
- 애니메이션 재생
- 입력 의도 전달
- 서버 요청
- owner 전용 응답

즉 `현재 상태`보다 `한 번 발생하는 동작` 쪽이 RPC의 본래 용도다.

## RPC와 Replication의 차이
| 구분 | Replication | RPC |
| --- | --- | --- |
| 본질 | 상태 동기화 | 원격 함수 실행 |
| 대표 용도 | 체력, 점수, 문 열림 상태 | 발사 요청, UI 응답, 순간 연출 |
| late joiner 대응 | 현재 상태를 받을 수 있다 | 과거 호출 이력은 받지 못한다 |
| 반환값 | 해당 없음 | 사용할 수 없다 |

> [!info]
> 공식문서도 RPC는 `replicated properties`를 보완하는 메커니즘이라고 설명한다. 즉 둘은 대체 관계보다 역할 분담 관계로 보는 것이 맞다.

# RPC 종류

공식문서 기준 RPC는 네 가지 메타데이터 타입을 가진다.

| 타입 | 설명 | 실무 해석 |
| --- | --- | --- |
| `Client` | 이 액터의 owning client에서 실행 | owner 전용 응답 |
| `Server` | 서버에서 실행 | 클라이언트의 요청 |
| `Remote` | 연결의 반대편 원격에서 실행 | `Client`/`Server`의 혼합 개념, 특수 용도 |
| `NetMulticast` | 서버와 relevant한 모든 클라이언트에서 실행 | 공용 순간 연출 |

## `Client`
서버가 특정 owning client에게 보내는 RPC다.
대표적으로 개인 HUD 갱신, 히트마커, 개인 메시지, owner 전용 카메라 반응 등에 맞다.

## `Server`
클라이언트가 서버에게 보내는 RPC다.
대표적으로 발사 요청, 상호작용 요청, 장착 변경 요청처럼 `판정은 서버가 해야 하는 행동`에 사용한다.

## `Remote`
공식문서 기준으로 `Remote`는 연결의 반대편 원격에서만 실행된다.
실무에서는 `Client`와 `Server`를 더 자주 쓰므로 상대적으로 드물지만, 공식문서 기준 타입으로는 존재한다.

## `NetMulticast`
서버와 현재 연결된 relevant 클라이언트들에서 실행된다.
공식문서도 `NetMulticast`는 서버에서 호출하는 것을 전제로 설명한다.
클라이언트가 호출한 `NetMulticast`는 로컬에서만 실행된다.

> [!caution]
> `NetMulticast`는 "무조건 모든 클라이언트"가 아니라 `현재 relevant한 클라이언트`가 기준이다.

# RPC 선언과 구현

## 기본 구조
공식문서 기준으로 RPC는 두 부분으로 구성된다.

1. 헤더에 선언한 기본 함수
2. 소스 파일에 정의한 `_Implementation()` 함수

```cpp
// DerivedActor.h
UFUNCTION(Client)
void ClientRPC();
```

```cpp
// DerivedActor.cpp
void ADerivedActor::ClientRPC_Implementation()
{
}
```

언리얼의 리플렉션과 네트워크 시스템이 중간 처리를 담당하지만, 개발자는 이 두 조각을 직접 작성해야 한다.

## 대표 선언 예시
```cpp
UFUNCTION(Server, Reliable)
void ServerTryFire();

UFUNCTION(Client, Reliable)
void ClientShowHitMarker();

UFUNCTION(NetMulticast, Unreliable)
void MulticastPlayExplosionFX();
```

# Reliability

공식문서는 RPC가 기본적으로 `unreliable`이며, 필요할 때만 `Reliable`을 붙이라고 설명한다.

| 종류 | 설명 | 실행 순서 보장 |
| --- | --- | --- |
| `Reliable` | 수신 확인될 때까지 재전송 | 순서 보장 |
| `Unreliable` | 패킷이 유실되면 실행되지 않을 수 있음 | 순서 보장 없음 |

## `Reliable`
놓치면 안 되는 요청이나 응답에 사용한다.
예:
- 문 열기 요청
- 구매 요청
- 라운드 종료 통지
- 장비 변경 확정

## `Unreliable`
자주 오고, 일부 유실되어도 큰 문제가 없는 호출에 사용한다.
예:
- 경량 코스메틱 반응
- 빈번한 연출 호출
- 비핵심 트랜지언트 이벤트

> [!caution]
> 공식문서도 `Reliable RPCs require additional bandwidth`라고 명시한다. 즉 reliable은 습관적으로 붙이는 옵션이 아니라, 정말 잃으면 안 되는 호출에만 제한적으로 써야 한다.

# Send Policy

공식문서는 `ERemoteFunctionSendPolicy`를 통해 RPC 전송 정책을 명시적으로 줄 수 있다고 설명한다.

| 값 | 설명 |
| --- | --- |
| `Default` | 즉시 bunch에 직렬화되고, 다음 net update 때 전송 |
| `ForceSend` | 특정 조건에서 프레임 끝이 아니라 더 빠르게 전송 |
| `ForceQueue` | net update 끝에서 대역폭이 남을 때 전송 |

실무 해석:
- 대부분은 `Default`로 충분하다.
- `ForceSend`는 지연을 줄이는 특수 최적화다.
- `ForceQueue`는 낮은 우선순위 호출에 가깝게 이해하면 된다.

# Ownership과 RPC

## 왜 ownership이 중요한가
공식문서에서도 RPC를 설명하기 전에 `Actor Owner and Owning Connection` 문서를 먼저 이해하라고 안내한다.
그 이유는 `어느 연결에 RPC를 보낼지`가 액터의 owner와 owning connection에 의해 결정되기 때문이다.

## owner와 owning connection
| 개념 | 의미 |
| --- | --- |
| `Owner` | 이 액터를 소유하는 상위 액터 |
| `Owning Connection` | 이 액터의 owning player controller와 연결된 네트워크 연결 |

대표 관계:
- 서버에 클라이언트가 접속하면 서버 쪽에 `PlayerController`가 생성된다.
- 그 `PlayerController`가 `Pawn`을 소유한다.
- 따라서 `Pawn`의 owning connection은 그 플레이어의 연결이다.
- 인벤토리 아이템이나 소유 컴포넌트도 같은 연결을 따를 수 있다.

## 실무적으로 RPC 진입점으로 많이 쓰는 클래스
- `PlayerController`
- possessed `Pawn` / `Character`
- 그들의 replicated `ActorComponent`

이 세 위치는 ownership이 분명해서 `Server RPC`와 `Client RPC`의 대상이 비교적 명확하다.

> [!tip]
> 월드에 그냥 놓인 일반 액터에 클라이언트가 직접 `Server RPC`를 거는 방식은 ownership 문제로 자주 막힌다. 보통은 플레이어가 소유한 액터를 통해 서버에 요청하고, 서버가 대상 월드 액터를 조작하는 흐름이 더 안전하다.

# Server RPC Validation

공식문서는 `Server RPC Validation`을 별도 섹션으로 설명한다.
서버는 클라이언트가 보낸 정보를 신뢰하되, 항상 게임 규칙에 맞는지 검증해야 한다는 관점이다.

## `WithValidation`
서버 RPC에 `WithValidation`을 붙이면 `_Validate()` 함수를 구현할 수 있다.

```cpp
UFUNCTION(Server, Reliable, WithValidation)
void ServerEquipSlot(int32 Slot);

bool AMyCharacter::ServerEquipSlot_Validate(int32 Slot)
{
    return Slot >= 0 && Slot < MaxSlots;
}

void AMyCharacter::ServerEquipSlot_Implementation(int32 Slot)
{
    EquipSlotInternal(Slot);
}
```

## 무엇을 검증해야 하는가
- 인덱스 범위
- 음수 수량
- 비정상적으로 큰 값
- null이면 안 되는 참조
- 명백히 불가능한 입력

> [!caution]
> `_Validate()`는 네트워크 경계에서의 기본 검증이다. 실제 게임 규칙 검사, 예를 들면 거리, 자원, 쿨다운, 소유 여부 등은 여전히 `_Implementation()` 쪽에서도 확인하는 편이 안전하다.

# 설계 기준

## 정석 패턴
언리얼 네트워크 설계에서 가장 자주 쓰는 흐름은 다음과 같다.

1. 클라이언트 입력
2. `Server RPC`로 요청
3. 서버가 검증
4. 서버가 authoritative state 변경
5. 결과는 `Replication`
6. 필요하면 `Client` 또는 `NetMulticast` RPC로 연출

## 예시
### 총 발사
- 입력 -> `ServerTryFire()`
- 서버 판정 -> 탄약 감소, 피해 처리
- `Ammo`, `Health`는 Replication
- 총구 이펙트, 사운드는 RPC 연출

### 문 열기
- 입력 -> `ServerTryOpenDoor()`
- 서버 판정 -> `bIsOpen = true`
- 현재 상태는 Replication
- 문 열림 연출은 `OnRep` 또는 RPC

### owner 전용 UI 응답
- 서버가 결과 계산
- `Client RPC`로 해당 owner에게만 알림

# 주의사항

> [!caution]
> RPC는 과거 호출 이력을 늦게 들어온 플레이어에게 재생하지 않는다. 따라서 영속적인 결과는 결국 상태 복제로 남겨야 한다.

> [!caution]
> 공식문서 기준 RPC는 단방향 호출이다. 실무적으로도 일반 함수처럼 `return value`나 `out parameter`를 기대하면 안 된다.

> [!caution]
> `NetMulticast`는 클라이언트가 호출한다고 서버를 통해 전체 브로드캐스트되는 기능이 아니다. 클라이언트 호출 시에는 로컬 실행처럼 보이는 경우가 많다.

# 일반 팁

- 요청은 `Server RPC`, 결과는 `Replication`으로 분리하면 구조가 안정적이다.
- owner 전용 정보는 `Client RPC`가 자연스럽다.
- 모든 사람에게 보이는 일회성 연출은 `NetMulticast`가 맞지만, 상태를 대신하면 안 된다.
- RPC가 안 갈 때는 함수 선언보다 ownership과 connection부터 확인하는 편이 빠르다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\CoreUObject\Public\UObject\ObjectMacros.h`
  - `Server`, `Client`, `NetMulticast`, `Reliable`, `Unreliable`, `WithValidation`
- `Engine\Source\Runtime\CoreUObject\Public\UObject\Script.h`
  - `FunctionCallspace::Type`, RPC 관련 함수 플래그
- `Engine\Source\Runtime\CoreUObject\Private\UObject\ScriptCore.cpp`
  - `GetFunctionCallspace()` 결과가 실제 `CallRemoteFunction()` / `Invoke()` 분기로 이어지는 지점
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
  - `AActor::GetFunctionCallspace()`, `CallRemoteFunction()`
- `Engine\Source\Runtime\Engine\Private\NetDriver.cpp`
  - `ProcessRemoteFunction()`, `ProcessRemoteFunctionForChannelPrivate()`
- `Engine\Source\Runtime\Engine\Private\DataReplication.cpp`
  - `ReceivedRPC()`, `ReceivePropertiesForRPC()`, `CallProcessEventForReceivedRPC()`
- `Engine\Source\Runtime\Engine\Private\PlayerController.cpp`
  - owning connection 관련 흐름
- `Engine\Source\Runtime\Engine\Private\Pawn.cpp`
  - possessed pawn의 연결 경로
- [[RPC callspace와 전송 경로(RPC Callspace Transmission Path)]]
  - `FunctionCallspace`에서 `ProcessEvent`까지 이어지는 내부 경로

## 정리
RPC는 `원격 함수 실행`이고, Replication은 `상태 동기화`다.
이 둘을 섞지 않고 역할을 분리하면 네트워크 설계가 훨씬 단순해진다.

즉, 다음 순서로 생각하면 된다.

1. 이 정보가 상태인가, 요청인가, 연출인가
2. 누가 이 호출을 보낼 수 있는가
3. 누가 이 호출을 받아야 하는가
4. reliable이 필요한가
5. 결과를 다시 상태로 남겨야 하는가

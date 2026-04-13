[Remote Procedure Calls in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine) | [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine) | [Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine)

# 개요
`RPC(Remote Procedure Calls)`는 네트워크 너머의 다른 머신에서 함수를 실행하게 만드는 기능이다.
언리얼 엔진 네트워크 모델에서 `Replication`이 상태 동기화라면, `RPC`는 요청, 응답, 순간 이벤트 전달에 해당한다.

이 문서는 RPC의 사용 규칙뿐 아니라, 실제 UE 5.7 엔진 코드 기준 `callspace 판단 -> remote 전환 -> bunch 직렬화 -> 수신 복호화 -> ProcessEvent 실행` 경로까지 한 번에 정리한다.

## 함께 볼 로컬 문서
- [[언리얼 네트워킹]]
- [[Replication]]
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]
- [[CharacterMovement와 예측(CharacterMovement Prediction)]]

## 전제조건
- RPC는 액터 또는 액터 컴포넌트에서 호출하는 것이 기본이다.
- RPC를 쓰려면 관련 액터와 필요한 컴포넌트가 복제 가능해야 한다.
- ownership이 맞지 않으면 `Server`, `Client` RPC는 기대한 대상에게 전달되지 않는다.
- RPC는 상태 저장 수단이 아니라 원격 함수 실행 수단이다.

# 핵심 개념

## RPC와 Replication의 차이

| 구분 | Replication | RPC |
| --- | --- | --- |
| 본질 | 상태 동기화 | 원격 함수 실행 |
| 대표 용도 | 체력, 점수, 문 열림 상태 | 발사 요청, UI 응답, 순간 연출 |
| late joiner 대응 | 현재 상태를 받을 수 있다 | 과거 호출 이력은 받지 못한다 |
| 반환값 | 해당 없음 | 사용할 수 없다 |

> [!info]
> RPC는 `replicated properties`를 보완하는 메커니즘이다. 둘은 대체 관계가 아니라 역할 분담 관계로 보는 편이 맞다.

# RPC 종류

| 타입 | 설명 | 실무 해석 |
| --- | --- | --- |
| `Client` | 이 액터의 owning client에서 실행 | owner 전용 응답 |
| `Server` | 서버에서 실행 | 클라이언트의 요청 |
| `Remote` | 연결의 반대편 원격에서 실행 | 특수 용도 |
| `NetMulticast` | 서버와 relevant한 모든 클라이언트에서 실행 | 공용 순간 연출 |

## `NetMulticast`에서 특히 중요한 점
- 서버에서 호출하면 보통 `Local | Remote`
- 클라이언트에서 호출하면 서버 브로드캐스트가 아니라 로컬 실행에 가깝다
- relevant한 클라이언트에게만 전송된다

> [!caution]
> `NetMulticast`는 "무조건 모든 클라이언트"가 아니라 `현재 relevant한 클라이언트`가 기준이다.

# 선언과 구현

## 기본 구조
```cpp
UFUNCTION(Server, Reliable)
void ServerTryFire();

UFUNCTION(Client, Reliable)
void ClientShowHitMarker();

UFUNCTION(NetMulticast, Unreliable)
void MulticastPlayExplosionFX();
```

```cpp
void AMyActor::ServerTryFire_Implementation()
{
}
```

## `Reliable` / `Unreliable`

| 종류 | 설명 | 실행 순서 보장 |
| --- | --- | --- |
| `Reliable` | 수신 확인될 때까지 재전송 | 순서 보장 |
| `Unreliable` | 유실될 수 있음 | 순서 보장 없음 |

## Send Policy

| 값 | 설명 |
| --- | --- |
| `Default` | 일반 경로 |
| `ForceSend` | 가능한 한 빨리 전송 |
| `ForceQueue` | 낮은 우선순위 queue 경로 |

> [!caution]
> 큰 파라미터를 reliable RPC에 싣는 습관은 비용이 크다. UE 5.7 코드에서도 reliable overflow는 연결 종료로 이어질 수 있다.

# Server RPC Validation

## `WithValidation`
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
- 비정상적으로 큰 값
- null이면 안 되는 참조
- 명백히 불가능한 입력
- 거리, 소유권, 자원, 쿨다운 같은 게임 규칙

# RPC 내부 경로

## 전체 파이프라인

| 단계 | 핵심 함수/파일 | 의미 |
| --- | --- | --- |
| 호출 직전 분기 | `UObject::CallFunction()`, `UObject::ProcessEvent()`, `ScriptCore.cpp` | `Local`, `Remote`, `Absorbed` 판단 |
| callspace 계산 | `FunctionCallspace::Type`, `AActor::GetFunctionCallspace()` | ownership, role, net mode 기반 실행 공간 계산 |
| remote 전환 | `CallRemoteFunction()` | active net driver로 넘김 |
| 전송 | `UNetDriver::ProcessRemoteFunction()` | connection 선택, multicast relevancy 검사 |
| 채널/직렬화 | `ProcessRemoteFunctionForChannelPrivate()` | actor channel 확보, RPC 파라미터 직렬화 |
| 수신 | `FObjectReplicator::ReceivedRPC()` | 파라미터 복호화, 권한 검사 |
| 실행 | `CallProcessEventForReceivedRPC()` | 최종적으로 `ProcessEvent()` 호출 |

## `FunctionCallspace::Type`

| 값 | 비트 | 의미 |
| --- | --- | --- |
| `Absorbed` | `0x0` | 로컬 실행도 하지 않고 원격 전송도 하지 않음 |
| `Remote` | `0x1` | 원격 전송 |
| `Local` | `0x2` | 현재 머신에서 실행 |
| `Local | Remote` | `0x3` | 로컬 실행과 원격 전송 둘 다 수행 |

> [!info]
> `Absorbed`는 오류가 아니라, 엔진이 전송 조건을 만족하지 못한다고 보고 호출을 흡수한 정상 분기다.

## `ScriptCore.cpp`에서의 실제 분기
`UObject::CallFunction()`과 `UObject::ProcessEvent()`는 먼저 `GetFunctionCallspace()`를 호출한다.

- `Remote` 비트가 있으면 `CallRemoteFunction()`
- `Local` 비트가 있으면 현재 머신에서 함수 실행
- `Local`이 없으면 파라미터를 건너뛰고 종료

즉 RPC는 선언만 보고 곧바로 `NetDriver`로 가지 않는다.
항상 local runtime이 먼저 해석한다.

## `AActor::GetFunctionCallspace()`가 보는 것
핵심 판단은 아래 축을 같이 본다.

- 함수 플래그 (`FUNC_Net`, `FUNC_NetMulticast`, `FUNC_BlueprintCosmetic` 등)
- 현재 net mode
- local role
- owner / owning player / net connection
- `RemoteRole`

대표적인 실무 해석은 아래와 같다.

| 상황 | 대표 callspace |
| --- | --- |
| 서버가 player-owned actor에서 `Client RPC` 호출 | `Remote` |
| 서버가 AI actor에서 `Client RPC` 호출 | 자주 `Local` |
| 서버가 replicated actor에서 `NetMulticast` 호출 | `Local | Remote` |
| 클라이언트가 owned actor에서 `Server RPC` 호출 | `Remote` |
| 클라이언트가 non-owned actor에서 `Server RPC` 호출 | 자주 `Absorbed` |

> [!caution]
> RPC가 안 가는 가장 흔한 이유는 선언이 아니라 `owner 없음`, `connection 없음`, `RemoteRole == ROLE_None` 같은 callspace 흡수 조건이다.

## `CallRemoteFunction()` 이후
`AActor::CallRemoteFunction()`은 active net driver들을 순회하면서 `ProcessRemoteFunction()`을 호출한다.

### `UNetDriver::ProcessRemoteFunction()`
이 함수는 다음을 담당한다.

- actor/channel 상태 빠른 거절
- Iris replication system 사용 시 그 경로로 위임
- replication driver 훅 처리
- 기본 net driver 경로로 fallback

### multicast일 때
- `ClientConnections`를 순회
- connection별 `IsNetRelevantFor(...)` 검사
- relevant한 connection에만 전송

### 일반 RPC일 때
- `Actor->GetNetConnection()` 조회
- 클라이언트면 `ServerConnection` 사용
- connection이 없으면 warning 후 종료

## 채널과 bunch 직렬화
실제 bunch 작성은 `ProcessRemoteFunctionForChannelPrivate()`가 맡는다.

핵심 순서는 다음과 같다.

1. actor channel 확보
2. 필요 시 actor 초기 복제 강제 수행
3. `FOutBunch` 생성
4. reliable이면 `Bunch.bReliable = 1`
5. `GetFunctionRepLayout(Function)` 조회
6. `RepLayout->SendPropertiesForRPC(...)`로 파라미터 직렬화
7. send policy에 따라 queue 또는 immediate send

> [!tip]
> RPC 파라미터 직렬화도 결국 `FRepLayout` 계층을 재사용한다. property replication과 완전히 별도 시스템으로 보면 안 된다.

## 수신 경로
수신의 중심은 `FObjectReplicator::ReceivedRPC()`다.

핵심 순서는 다음과 같다.

1. `FieldCache`에서 function 조회
2. `FindFunction()`
3. `FUNC_Net` 및 access rights 확인
4. `ShouldCallRemoteFunction(...)` 검사
5. `ReceivePropertiesForRPC()`로 파라미터 복호화
6. `CallProcessEventForReceivedRPC()`
7. 최종적으로 `Object->ProcessEvent(Function, Params)`

즉 수신 측도 `_Implementation()`을 바로 치는 것이 아니라, 정상적인 `ProcessEvent()` 경로를 다시 통과한다.

# 설계 기준

## 정석 패턴
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
- `Ammo`, `Health`는 `Replication`
- 총구 이펙트, 사운드는 RPC 연출

### 문 열기
- 입력 -> `ServerTryOpenDoor()`
- 서버 판정 -> `bIsOpen = true`
- 현재 상태는 `Replication`
- 문 열림 연출은 `OnRep` 또는 RPC

# 일반 팁
- 요청은 `Server RPC`, 결과는 `Replication`으로 분리하면 구조가 안정적이다.
- owner 전용 정보는 `Client RPC`가 자연스럽다.
- 모든 사람에게 보이는 일회성 연출은 `NetMulticast`가 맞지만, 상태를 대신하면 안 된다.
- RPC가 안 갈 때는 함수 선언보다 ownership과 connection부터 확인하는 편이 빠르다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\CoreUObject\Public\UObject\ObjectMacros.h`
- `Engine\Source\Runtime\CoreUObject\Public\UObject\Script.h`
- `Engine\Source\Runtime\CoreUObject\Private\UObject\ScriptCore.cpp`
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
- `Engine\Source\Runtime\Engine\Private\NetDriver.cpp`
- `Engine\Source\Runtime\Engine\Private\DataReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\PlayerController.cpp`
- `Engine\Source\Runtime\Engine\Private\Pawn.cpp`

## 정리
RPC는 `원격 함수 실행`이고, Replication은 `상태 동기화`다.
이 둘을 섞지 않고 역할을 분리하면 네트워크 설계가 훨씬 단순해진다.

즉, 다음 순서로 생각하면 된다.

1. 이 정보가 상태인가, 요청인가, 연출인가
2. 누가 이 호출을 보낼 수 있는가
3. 누가 이 호출을 받아야 하는가
4. reliable이 필요한가
5. 결과를 다시 상태로 남겨야 하는가

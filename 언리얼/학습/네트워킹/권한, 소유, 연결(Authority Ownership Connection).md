[Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine) | [Actor Role and Remote Role in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-role-and-remote-role-in-unreal-engine) | [Remote Procedure Calls in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine)

## 개요
**권한, 소유, 연결(Authority / Ownership / Connection)** 은 언리얼 네트워킹에서 `누가 상태를 확정하는가`, `이 액터가 어느 플레이어 연결에 속하는가`, `RPC를 어디로 보낼 수 있는가`를 결정하는 가장 바닥의 규칙입니다.

엔진 코드 기준으로 가장 먼저 분리해야 하는 질문은 아래입니다.

| 질문 | 대표 함수/개념 | 의미 |
| --- | --- | --- |
| 누가 진짜 상태를 확정하는가 | `HasAuthority()` | 현재 인스턴스가 authoritative한가 |
| 이 액터의 owner는 누구인가 | `GetOwner()` | 일반 actor owner 체인 |
| 네트워크 문맥에서 책임 actor는 누구인가 | `GetNetOwner()` | replication/RPC 문맥의 net owner |
| 어느 player가 이 액터를 소유하는가 | `GetNetOwningPlayer()` | owning player 반환 |
| 어느 연결로 RPC/owner 조건이 묶이는가 | `GetNetConnection()` | 실제 `UNetConnection` 반환 |
| 이 액터가 네트워크 owner를 가졌는가 | `HasNetOwner()` | owner chain 끝에 player controller/beacon 같은 특수 owner가 있는가 |

핵심은 `Authority`, `Owner`, `NetOwner`, `OwningPlayer`, `NetConnection`이 모두 같은 말이 아니라는 점입니다.

> [!info]
> `HasAuthority()`는 상태 확정 권한이고, `GetNetConnection()`은 전송 대상 연결입니다. 둘은 자주 같이 등장하지만 같은 의미가 아닙니다.

## 엔진 계약
### `AActor::HasAuthority()`
`Actor.h` 기준으로 `HasAuthority()`는 매우 단순합니다.

```cpp
inline bool AActor::HasAuthority() const
{
    return (GetLocalRole() == ROLE_Authority);
}
```

즉 엔진 레벨 의미는 `로컬 role이 ROLE_Authority인가`입니다.
`owner가 누구인가`, `로컬 플레이어인가`, `입력을 받는가`와는 다른 질문입니다.

### `Actor.h`가 정의하는 네트워크 소유 계약
`Actor.h`에는 아래 계약이 명시돼 있습니다.

- `GetNetOwner()`: replication 책임 actor. 보통 player controller
- `GetNetOwningPlayer()`: owning `UPlayer` 반환
- `GetNetConnection()`: client/server 간 통신에 쓰이는 `UNetConnection`
- `UpdateOwningNetConnection()`: owning connection을 replication system에 밀어 넣는 함수

즉 엔진은 단순히 `Owner` 포인터 하나로 모든 걸 해결하지 않고, networking 전용 accessor들을 별도로 둡니다.

## `AActor` 기본 동작
### 기본 `GetNetOwner()`
`Actor.h` inline 구현에서 기본 `GetNetOwner()`는 그냥 `Owner`를 반환합니다.

```cpp
inline const AActor* AActor::GetNetOwner() const
{
    return Owner;
}
```

즉 평범한 actor는 owner chain을 따라 network 문맥을 위임합니다.

### 기본 `GetNetConnection()` / `GetNetOwningPlayer()`
`Actor.cpp` 기준 기본 actor는 직접 connection을 들고 있지 않습니다.

- `GetNetConnection()` -> `Owner ? Owner->GetNetConnection() : nullptr`
- `GetNetOwningPlayer()` -> authority일 때만 owner chain을 따라 owning player 조회
- `GetNetOwningPlayerAnyRole()` -> role 조건 없이 owner chain 따라 조회

핵심은 평범한 actor가 자기 혼자서는 client RPC 대상 연결을 만들 수 없고, owner chain을 통해 올라가야 한다는 점입니다.

### `HasNetOwner()`
`Actor.cpp`의 `HasNetOwner()`는 아래 식으로 동작합니다.

1. owner가 없으면 `false`
2. owner chain을 끝까지 따라 top owner를 찾음
3. `TopOwner->HasNetOwner()` 재귀 호출

즉 일반 actor는 owner chain 끝에 `APlayerController` 같은 특수 actor가 있어야 비로소 네트워크 owner를 가진 것으로 취급됩니다.

> [!caution]
> owner가 없는 일반 actor는 server authority를 가질 수는 있어도, client RPC를 보낼 owning connection은 없을 수 있습니다.

## `APlayerController`는 왜 특별한가
`PlayerController.cpp` 기준으로 player controller는 ownership 체인의 종착점입니다.

| 함수 | 구현 의미 |
| --- | --- |
| `GetNetOwner()` | `return this;` |
| `GetNetOwningPlayer()` | `return Player;` |
| `GetNetOwningPlayerAnyRole()` | `return Player;` |
| `HasNetOwner()` | 항상 `true` |
| `GetNetConnection()` | `Player != NULL ? NetConnection : NULL` |

즉 player controller는 자기 자신이 net owner이고, player와 connection을 직접 들고 있는 actor입니다.

또한 `APlayerController::SetPlayer()`에서는 `NetConnection->OwningActor = this;` 후 `UpdateOwningNetConnection()`을 호출합니다.
즉 controller가 player/connection에 바인딩되는 순간, owning connection 정보가 replication system으로 밀려 들어갑니다.

## `APawn`은 왜 RPC 진입점으로 자주 쓰이는가
`Pawn.cpp`를 보면 possession 시점에 네트워크 문맥이 정리됩니다.

### `PossessedBy()` 흐름
중요한 순서는 다음과 같습니다.

1. `SetOwner(NewController)`
2. `SetController(NewController)`
3. `ForceNetUpdate()`
4. `UpdateOwningNetConnection()`
5. 필요 시 `SetReplicates(true)`
6. remote player controller이면 `SetAutonomousProxy(true)`

즉 pawn은 possession 순간에 owner/controller/owning connection/autonomous proxy 조건이 한 번에 다시 계산됩니다.

### Pawn의 networking accessor
`Pawn.cpp` 기준 구현은 아래처럼 조금 특이합니다.

| 함수 | 구현 의미 |
| --- | --- |
| `GetNetConnection()` | controller가 있으면 `GetController()->GetNetConnection()` |
| `GetNetOwner()` | `return this;` |
| `GetNetOwningPlayer()` | authority일 때 controller가 player controller면 `PC->Player` 반환 |
| `GetNetOwningPlayerAnyRole()` | role 조건 없이 controller의 `PC->Player` 반환 |

여기서 중요한 포인트는 두 가지입니다.

- pawn의 `GetNetOwner()`는 pawn 자신을 반환한다.
- 하지만 실제 owning player와 net connection은 controller를 따라 올라간다.

즉 `NetOwner`, `OwningPlayer`, `NetConnection`은 항상 같은 객체를 가리키는 단일 개념이 아닙니다.

> [!tip]
> 실무에서 `PlayerController`와 possessed `Pawn`이 RPC 진입점으로 자주 쓰이는 이유는 이 두 클래스가 player/connection 체인과 직접 연결되기 때문입니다.

## `UNetConnection`의 위치
`NetConnection.h`에는 `OwningActor` 필드에 대해 `Reference to controlling actor (usually PlayerController)`라고 주석이 붙어 있습니다.
즉 connection은 단순 socket wrapper가 아니라, 어떤 controlling actor와 연결되는지를 알고 있습니다.

`PlayerController::SetPlayer()`가 `NetConnection->OwningActor = this;`를 설정하는 이유도 여기 있습니다.
권한 actor와 실제 네트워크 연결 사이를 묶는 접점이 `UNetConnection`입니다.

## `UpdateOwningNetConnection()`가 실제로 하는 일
`ActorReplication.cpp`의 구현이 이 주제의 핵심입니다.

1. replication system과 replication bridge를 가져온다.
2. `GetNetConnection()`으로 새 owning connection을 구한다.
3. connection이 있으면 `ParentConnectionId`를 꺼낸다.
4. 자기 자신과 모든 child actor를 순회한다.
5. replicated actor마다 `SetOwningNetConnection()`을 호출한다.
6. `ROLE_AutonomousProxy`이면 `RoleAutonomous` 조건 필터도 같이 갱신한다.

즉 owning connection 변화는 actor 하나만 바뀌는 게 아니라, child actor까지 propagation됩니다.

이 함수가 다음 타이밍에 호출되는 것도 중요합니다.

- `AActor::SetOwner()` 직후
- `APawn::PossessedBy()` / `UnPossessed()`
- `APlayerController::SetPlayer()`
- `AActor::SetReplicates()` 이후 actor가 이미 replication 중일 때
- `AActor::OnReplicationStartedForIris()`

즉 ownership은 단순 metadata가 아니라, replication system의 connection filter를 직접 바꾸는 런타임 상태입니다.

## `UActorComponent`는 왜 자연스럽게 RPC 진입점이 되는가
`ActorComponent.cpp`를 보면 컴포넌트는 networking 판단을 owner actor에 위임합니다.

### `GetFunctionCallspace()`
```cpp
AActor* MyOwner = GetOwner();
return (MyOwner ? MyOwner->GetFunctionCallspace(Function, Stack) : FunctionCallspace::Local);
```

### `CallRemoteFunction()`
컴포넌트는 owner actor를 기준으로 `ShouldReplicateFunction()`을 검사하고,
`ProcessRemoteFunction(MyOwner, Function, Parameters, OutParms, Stack, this)`로 전송합니다.

즉 컴포넌트 RPC는 독립적인 별도 채널이 아니라, owner actor의 network 문맥을 따라갑니다.

또한 `IsSupportedForNetworking()`도 기본적으로 `GetIsReplicated() || IsNameStableForNetworking()`로 판단합니다.
즉 컴포넌트는 스스로 네트워크 객체가 되더라도, owner actor와 분리된 문맥으로 동작하는 것이 아닙니다.

## `GetFunctionCallspace()`로 보는 실제 RPC 판단
`AActor::GetFunctionCallspace()`는 RPC가 `local`, `remote`, `local + remote`, `absorbed` 중 어디로 갈지를 결정하는 핵심 함수입니다.
문서 관점보다 엔진 코드 관점에서 중요한 분기점은 아래입니다.

### 1. 네트워크 함수가 아니면 local
`FUNC_Net`이 없으면 네트워크 전송 판단 없이 local callspace로 끝납니다.

### 2. standalone, cosmetic, authority-only 같은 빠른 흡수 조건
- standalone에서 client가 server RPC를 부르면 absorbed 가능
- dedicated server에서 cosmetic 함수는 absorbed
- authority only 함수는 client에서 absorbed 가능

### 3. authority 측에서 owning connection이 있는가
authority actor가 remote call을 보내려 할 때,

- `GetNetConnection()`이 있으면 계속 진행
- 없더라도 `GetNetOwningPlayer()`가 local player면 local 처리
- `HasNetOwner()`는 있는데 현재 owning player가 없으면 absorbed
- owner 자체가 없는 remote function이면 absorbed/error

즉 client RPC는 단순히 `UFUNCTION(Client)`라고 끝나는 게 아니라, 현재 actor가 실제로 어느 connection에 묶여 있는지가 결정적입니다.

### 4. `RemoteRole == ROLE_None`면 remote 불가
마지막 단계에서 actor가 실제로 replicate되지 않는 상태면 remote call은 absorbed됩니다.

즉 RPC는 함수 플래그만으로 정해지지 않고 아래 축이 모두 필요합니다.

- function flags
- net mode
- local role
- owning player / net connection
- remote role

> [!info]
> `absorbed`는 "실패해서 예외가 났다"가 아니라, 엔진이 전송 조건을 만족하지 못한다고 보고 호출을 네트워크로 보내지 않은 상태입니다.

## `CallRemoteFunction()`가 실제 전송하는 경로
`AActor::CallRemoteFunction()`은 현재 world context의 active net driver들을 순회하면서,
`NetDriver->ShouldReplicateFunction(this, Function)`을 통과한 driver에 대해 `ProcessRemoteFunction()`을 호출합니다.

즉 `GetFunctionCallspace()`가 "보낼 수 있는가"를 정하고, `CallRemoteFunction()`이 "어느 net driver로 보낼 것인가"를 실제로 수행합니다.

컴포넌트도 이 경로를 재사용하지만, owner actor를 기준으로 호출한다는 점이 차이입니다.

## 실무 관점에서 꼭 알아둘 점
### 1. `HasAuthority()`와 `IsLocalController()`는 다른 질문이다
전자는 authoritative state 여부이고, 후자는 이 머신의 로컬 입력 주체인가를 묻습니다.
listen server에서는 둘이 동시에 참일 수 있어 더 헷갈립니다.

### 2. `Owner`와 `NetConnection`은 같은 것이 아니다
`Owner`는 actor 관계이고, `NetConnection`은 전송 대상 연결입니다.
중간에 `PlayerController`, `Pawn`, `UPlayer` 계층이 끼어듭니다.

### 3. 일반 actor는 owner chain이 없으면 client RPC 대상이 없다
서버에 존재하는 actor라고 해서 항상 특정 클라이언트에게 `Client RPC`를 보낼 수 있는 것은 아닙니다.

### 4. possession은 네트워크 문맥 재설정 이벤트다
pawn possession 시 `SetOwner`, `UpdateOwningNetConnection`, `SetAutonomousProxy`가 함께 움직입니다.
즉 조종권 변화는 단순 gameplay 이벤트가 아니라 networking 이벤트입니다.

### 5. component RPC는 owner actor 문맥을 탄다
컴포넌트가 RPC 진입점으로 보이더라도, 실제 callspace와 remote function 처리는 owner actor를 기준으로 이뤄집니다.

## 네트워킹 스택 안에서의 위치
- `[[권한, 소유, 연결(Authority Ownership Connection)]]`: authority/owner/connection/callspace의 바닥 규칙
- `[[Replication]]`: property 등록, lifetime condition, OnRep 흐름
- `[[RPC]]`: RPC 종류, reliable/unreliable, validation, send policy
- `[[언리얼 네트워킹]]`: 위 개념들을 한 흐름으로 묶는 통합 노트

## 연결해서 볼 문서
- [[언리얼 네트워킹]]: 권한, role, replication, RPC를 묶은 상위 개요
- [[Replication]]: `GetLifetimeReplicatedProps`, `DOREPLIFETIME`, `RepNotify` 정리
- [[RPC]]: `Server`, `Client`, `NetMulticast`, reliability, validation 정리

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Classes\GameFramework\Actor.h`
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\PlayerController.cpp`
- `Engine\Source\Runtime\Engine\Private\Pawn.cpp`
- `Engine\Source\Runtime\Engine\Classes\Engine\NetConnection.h`
- `Engine\Source\Runtime\Engine\Private\Components\ActorComponent.cpp`
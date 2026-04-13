[Remote Procedure Calls in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine) | [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine) | [Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine)

## 개요
**RPC callspace와 전송 경로(RPC Callspace / Transmission Path)** 는 RPC가 단순히 `UFUNCTION(Server)` 같은 선언만으로 네트워크로 나가는 것이 아니라, 먼저 `FunctionCallspace` bitmask로 `Local`, `Remote`, `Absorbed` 여부를 판단하고, 그다음 `NetDriver`를 통해 bunch로 직렬화되어, 반대편에서 다시 `ProcessEvent()`로 실행되는 과정을 설명하는 문서입니다.

이 문서는 기존 `[[RPC]]`의 사용 규칙보다 한 단계 아래로 내려가서, 실제 UE 5.7 엔진 코드 기준 호출 경로를 봅니다.

엔진 코드 기준 핵심 경로는 아래입니다.

| 단계 | 핵심 함수/파일 | 의미 |
| --- | --- | --- |
| 호출 직전 분기 | `UObject::CallFunction()`, `UObject::ProcessEvent()`, `ScriptCore.cpp` | 이 호출이 `Local`, `Remote`, `Local | Remote`, `Absorbed` 중 무엇인지 결정 |
| callspace 판단 | `FunctionCallspace::Type`, `AActor::GetFunctionCallspace()` | ownership, role, net mode, `RemoteRole` 기준으로 실제 실행 공간 계산 |
| remote 전환 | `CallRemoteFunction()` | active net driver를 찾아 RPC 전송 경로로 넘김 |
| 전송 | `UNetDriver::ProcessRemoteFunction()` | connection 선택, multicast relevancy 검사, replication system/driver 훅 처리 |
| 채널 직렬화 | `InternalProcessRemoteFunctionPrivate()`, `ProcessRemoteFunctionForChannelPrivate()` | actor channel 확보, `FRepLayout`로 파라미터 직렬화, bunch 송신 |
| 수신 | `FObjectReplicator::ReceivedRPC()` | 함수 검증, access rights 확인, RPC 파라미터 복호화 |
| 실행 | `CallProcessEventForReceivedRPC()` | 최종적으로 `Object->ProcessEvent()` 호출 |

즉 RPC의 실제 수명은 `callspace 판단 -> remote 전환 -> bunch 직렬화 -> 수신 복호화 -> ProcessEvent 실행`입니다.

> [!info]
> `FunctionCallspace`는 bitmask입니다. 그래서 `NetMulticast`처럼 한 번의 호출이 `Local`과 `Remote`를 동시에 가질 수 있습니다.

## 1. `FunctionCallspace::Type`
`Script.h`의 `FunctionCallspace::Type`는 아래 세 값을 가집니다.

| 값 | 비트 | 의미 |
| --- | --- | --- |
| `Absorbed` | `0x0` | 로컬 실행도 하지 않고, 원격 전송도 하지 않음 |
| `Remote` | `0x1` | 원격 전송 경로로 보냄 |
| `Local` | `0x2` | 현재 머신에서 바로 실행 |
| `Local | Remote` | `0x3` | 로컬 실행과 원격 전송 둘 다 수행 |

중요한 점은 `Absorbed`가 오류 코드가 아니라, 엔진이 의도적으로 RPC를 흡수하는 정상 분기라는 것입니다.
예를 들면 owner가 없거나, `RemoteRole == ROLE_None`이거나, dedicated server에서 cosmetic 함수가 호출되는 경우가 대표적입니다.

## 2. `ScriptCore.cpp`에서 실제 호출 직전 어떻게 갈라지는가
RPC callspace는 `AActor`에서만 쓰이는 보조 함수가 아니라, 실제 함수 호출 직전에 `ScriptCore.cpp`에서 소비됩니다.

### `UObject::CallFunction()`
native function 호출 경로를 보면 아래 순서입니다.

1. `bNetFunction` 여부 계산
2. `GetFunctionCallspace(Function, &Stack)` 호출
3. `Remote` 비트가 있으면 파라미터 버퍼를 별도로 구성해서 `CallRemoteFunction()` 호출
4. `Local` 비트가 있으면 `Function->Invoke()`로 현재 머신에서 실행
5. `Local` 비트가 없으면 `SkipFunction()`으로 남은 파라미터 소비 후 종료

즉 callspace는 "보낼지 말지"만 결정하는 게 아니라, **현재 머신에서 실행할지까지 함께 결정**합니다.

### `UObject::ProcessEvent()`
`ProcessEvent()`도 같은 패턴을 따릅니다.

- `Remote` 비트가 있으면 `CallRemoteFunction()`
- `Local` 비트가 있으면 로컬 `ProcessLocalScriptFunction()`
- `Local`이 없으면 return value를 비우고 종료

이 구조 때문에 서버의 `NetMulticast`는 `Local | Remote`가 되고,
클라이언트에서 owner 없이 막힌 `Server RPC`는 `Absorbed`가 될 수 있습니다.

> [!tip]
> RPC는 "함수 선언이 네트워크 함수인가"보다 먼저, `ScriptCore.cpp`에서 `FunctionCallspace`를 어떻게 해석했는지가 중요합니다.

## 3. `AActor::GetFunctionCallspace()`가 실제로 보는 것
`AActor::GetFunctionCallspace()`는 RPC의 가장 중요한 바닥 함수입니다.
핵심 판단 순서는 아래처럼 볼 수 있습니다.

### 빠른 early exit
- 에디터에서 스크립트 실행 허용 중이면 `Local`
- static 함수이거나 `World == nullptr`면 `GEngine->GetGlobalFunctionCallspace()` 위임
- 클라이언트에서 `FUNC_BlueprintAuthorityOnly`면 기본 callspace를 `Absorbed`로 시작
- `FUNC_NetRequest`면 즉시 `Remote`
- `FUNC_NetResponse`는 `RPCId > 0`일 때 `Local`, 아니면 `Absorbed`
- `NM_Standalone`에서 클라이언트가 `Server RPC`를 부르면 `Absorbed`
- dedicated server에서 `FUNC_BlueprintCosmetic`이면 `Absorbed`
- `FUNC_Net`이 아니면 현재 callspace 그대로 반환

### `NetMulticast`
최상위 super function까지 올린 뒤 `FUNC_NetMulticast`를 보면 아래처럼 갈립니다.

| 상황 | 결과 |
| --- | --- |
| 서버 + `RemoteRole != ROLE_None` | `Local | Remote` |
| 서버 + `RemoteRole == ROLE_None` | `Local` |
| 클라이언트 | 현재 callspace(`Local` 또는 `Absorbed`) |

즉 서버 multicast는 "자기 자신도 실행하고, remote로도 보낸다"가 기본입니다.
반대로 클라이언트에서 multicast를 호출해도 서버 브로드캐스트가 되지 않는 이유가 여기 있습니다.

### `Server` / `Client` / `Remote`
단방향 RPC는 현재 머신이 서버인지 클라이언트인지에 따라 먼저 걸러집니다.

- 서버가 `Server RPC`를 호출하면 굳이 remote로 보낼 이유가 없으므로 `Local`
- 클라이언트가 `Client RPC`를 호출하면 굳이 remote로 보낼 이유가 없으므로 `Local`
- `Remote` specifier 함수는 수신 중인 remote RPC 모드일 때 bi-directional로 받아들여질 수 있음

### owning connection / owner / role 검사
그다음은 실제 remote 가능성 검사입니다.

- authority 객체인데 `GetNetConnection()`도 없고 `GetNetOwningPlayer()`도 없으면 owner/connection 상황에 따라 `Absorbed` 또는 `Local`
- connection은 있지만 `Driver`나 `World`가 없으면 `Absorbed`
- `RemoteRole == ROLE_None`이면 최종적으로 `Absorbed`
- 위 조건을 통과하면 `Remote`

대표적인 실무 해석은 아래와 같습니다.

| 상황 | 대표 callspace |
| --- | --- |
| 서버가 player-owned actor에서 `Client RPC` 호출 | `Remote` |
| 서버가 AI-owned actor에서 `Client RPC` 호출 | 보통 `Local` |
| 서버가 replicated actor에서 `NetMulticast` 호출 | `Local | Remote` |
| 클라이언트가 owned actor에서 `Server RPC` 호출 | `Remote` |
| 클라이언트가 non-owned actor에서 `Server RPC` 호출 | 자주 `Absorbed` |

> [!caution]
> RPC가 안 가는 가장 흔한 이유는 선언이 아니라 `owner 없음`, `connection 없음`, `RemoteRole == ROLE_None` 같은 callspace 흡수 조건입니다.

## 4. `CallRemoteFunction()`에서 `UNetDriver`로 넘어가는 단계
`AActor::CallRemoteFunction()`은 현재 월드의 active net driver들을 순회하면서, `ShouldReplicateFunction(this, Function)`를 통과한 driver에 대해 `ProcessRemoteFunction()`을 호출합니다.

즉 actor 입장에서는 "어느 driver가 이 함수를 네트워크에 올릴지"만 넘기고, 실제 connection 선택과 송신은 `UNetDriver`가 담당합니다.

### `UNetDriver::ProcessRemoteFunction()`
이 함수는 실제 전송 진입점입니다.
먼저 아래 상황을 빠르게 거절합니다.

- actor가 destroy 중
- torn-off actor이고 `bDiscardTornOffActorRPCs`가 켜짐
- game thread가 아님
- networking 불가능한 object

그다음 분기는 크게 세 갈래입니다.

### 1. Iris replication system 경로
- 서버 multicast면 `ReplicationSystem->SendRPC(Actor, SubObject, Function, Parameters)`
- 일반 RPC면 actor의 connection handle 기준 `SendRPC(...)`
- Iris 사용 시 여기서 성공하면 기존 path로 fallback하지 않음

### 2. Replication driver 훅
`ReplicationDriver->ProcessRemoteFunction(...)`가 처리하면 기본 구현으로 내려가지 않습니다.

### 3. 기본 NetDriver 경로
이 경로가 일반적으로 우리가 추적하는 classic path입니다.

#### multicast
서버 multicast는 `ClientConnections`를 순회하면서 connection별로 검사합니다.

- `FNetViewer` 생성
- child connection이면 parent connection으로 승격
- `Actor->IsNetRelevantFor(...)` 확인
- 예외적으로 reliable multicast는 관련 cvar + 살아 있는 actor channel이 있으면 non-relevant channel에도 보낼 수 있음
- `RepLayout->BuildSharedSerializationForRPC()` 후 connection별 `InternalProcessRemoteFunctionPrivate()` 호출
- 마지막에 `ClearSharedSerializationForRPC()` 호출

즉 multicast는 "그냥 전체 브로드캐스트"가 아니라 **connection별 relevancy 검사 후 순회 전송**입니다.

#### 일반 RPC
일반 RPC는 아래 흐름입니다.

1. `Actor->GetNetConnection()` 조회
2. 클라이언트면 `ServerConnection`으로 치환
3. `InternalProcessRemoteFunction(...)` 호출
4. connection이 없으면 warning을 남기고 종료

## 5. 채널과 bunch 직렬화
실제 bunch 작성은 `InternalProcessRemoteFunctionPrivate()`와 `ProcessRemoteFunctionForChannelPrivate()`가 담당합니다.

### `InternalProcessRemoteFunctionPrivate()`
이 단계에서 하는 일은 아래와 같습니다.

- 최상위 super function으로 정규화
- unreliable + non-multicast이고 `Connection->IsNetReady()`가 아니면 즉시 drop
- child connection이면 parent connection으로 변환
- closing / closed connection 거부
- null world 거부
- `ClassNetCache`, `FieldNetCache` 조회
- actor channel 탐색
- 서버라면 필요 시 channel 생성 시도

즉 "callspace가 remote였다"와 "실제로 보낼 channel이 준비됐다"는 다른 문제입니다.

### `ProcessRemoteFunctionForChannelPrivate()`
이 함수는 실제 RPC bunch를 만드는 곳입니다.

핵심 순서는 아래입니다.

1. channel이 닫히는 중인지 확인
2. initial channel replication이 아직 없으면 강제로 actor replication 수행
3. `FOutBunch` 생성
4. `FUNC_NetReliable`면 `Bunch.bReliable = 1`
5. `GetFunctionRepLayout(Function)`로 함수 파라미터 layout 조회
6. `RepLayout->SendPropertiesForRPC(Function, Ch, TempWriter, Parms)`로 파라미터 직렬화
7. send policy에 따라 queue 또는 immediate send 결정
8. `SendBunch()` 또는 `QueueRemoteFunctionBunch()` 실행

### send policy와 queue 동작
코드 기준 분기는 아래와 같습니다.

| 정책 | 동작 |
| --- | --- |
| `Default` | unreliable multicast만 queue, 나머지는 즉시 send |
| `ForceQueue` | 강제로 queue |
| `ForceSend` | 강제로 즉시 send |

즉 공식문서의 send policy 설명은 실제 코드에서 `QueueRemoteFunctionBunch()` 여부로 연결됩니다.

### 주의할 점
- reliable buffer overflow는 connection close로 이어질 수 있음
- 파라미터가 너무 크면 RPC bunch overflow가 날 수 있음
- 아직 actor channel 초기 복제가 안 된 상태에서 RPC를 보내면, 먼저 actor replication을 강제로 태움

> [!caution]
> 큰 파라미터를 reliable RPC에 싣는 습관은 비용이 큽니다. UE 5.7 코드에서도 reliable overflow는 단순 경고가 아니라 연결 종료로 이어질 수 있습니다.

## 6. 수신 경로
RPC 수신의 중심은 `FObjectReplicator::ReceivedRPC()`입니다.

### `ReceivedRPC()`
핵심 순서는 아래입니다.

1. `FieldCache`에서 function name 추출
2. object에서 `FindFunction()`
3. `FUNC_Net` 여부 확인
4. 서버/클라이언트 access rights 확인
5. 필요하면 RPC DoS detection 적용
6. `ShouldCallRemoteFunction(Object, Function, RepFlags)`로 실행 가능 여부 확인
7. `GetFunctionRepLayout(LayoutFunction)` 조회
8. `ReceivePropertiesForRPC()`로 파라미터 복호화
9. unmapped GUID 상황이면 reliable RPC를 pending local RPC로 미룰 수 있음
10. `ForwardRemoteFunction()` 호출
11. `CallProcessEventForReceivedRPC()`로 최종 실행

### `ShouldCallRemoteFunction()`
기본 구현은 매우 단순합니다.

- `(!IsServer() || RepFlags.bNetOwner) && !RepFlags.bIgnoreRPCs`

즉 서버가 받은 RPC는 결국 `bNetOwner` 문맥이 중요하고,
수신 측에서도 "받았으니 무조건 실행"이 아니라 한 번 더 필터를 거칩니다.

### `ReceivePropertiesForRPC()`
흥미로운 점은 RPC 파라미터도 property replication과 같은 `FRepLayout` 계열 코드를 써서 복호화된다는 것입니다.
즉 RPC는 "함수 호출"이지만, 파라미터 직렬화/역직렬화는 replication layout 체계를 재사용합니다.

### 최종 실행
`CallProcessEventForReceivedRPC()`는 아래 두 scope를 건 뒤 최종적으로 `Object->ProcessEvent(Function, Params)`를 호출합니다.

- `UE::Net::FScopedNetContextRPC`
- `UE::Net::Private::FScopedRemoteRPCMode Receiving`

즉 수신 측은 그냥 직접 `_Implementation()`을 호출하는 것이 아니라,
**정상적인 `ProcessEvent()` 경로로 다시 들어가면서 현재가 remote RPC 수신 중이라는 컨텍스트를 세팅**합니다.

## 7. 실무적으로 꼭 기억할 점
### 1. RPC는 먼저 local runtime이 해석한다
RPC는 선언만 보고 곧바로 `NetDriver`로 가지 않습니다.
`ScriptCore.cpp`가 먼저 `GetFunctionCallspace()`를 물어보고, 그 결과에 따라 local/remote/absorbed가 갈립니다.

### 2. `Local | Remote`는 실제로 자주 나온다
서버 `NetMulticast`가 대표적입니다.
서버는 연출을 자기 자신도 실행해야 하므로 local, 클라이언트들에게도 보내야 하므로 remote가 동시에 켜집니다.

### 3. `Remote`가 나와도 전송 성공은 별개다
callspace가 remote여도, connection 없음 / closed channel / serialization overflow / relevancy 문제로 결국 못 갈 수 있습니다.

### 4. RPC 수신도 `FRepLayout`을 쓴다
property replication과 RPC가 완전히 분리된 시스템처럼 보이지만, 파라미터 직렬화/복호화에서는 같은 `RepLayout` 계층을 공유합니다.

### 5. late joiner 문제는 여전히 상태 복제로 해결해야 한다
RPC가 아무리 잘 가도 과거 호출 이력 자체는 저장되지 않습니다.
영속적인 결과는 결국 replicated state로 남겨야 합니다.

## 네트워킹 스택 안에서의 위치
- `[[권한, 소유, 연결(Authority Ownership Connection)]]`: owner / owning connection / net owner 바닥 규칙
- `[[Replication 등록, 필터링, 수신 후처리(Replication Registration Filtering PostReceive)]]`: property replication 내부 경로
- `[[RPC callspace와 전송 경로(RPC Callspace Transmission Path)]]`: RPC 호출 직전 분기와 송수신 내부 경로
- `[[RPC]]`: RPC의 사용 규칙과 설계 기준
- `[[언리얼 네트워킹]]`: 네트워킹 통합 노트

## 연결해서 볼 문서
- [[RPC]]: `Server / Client / NetMulticast`, reliability, validation 규칙
- [[권한, 소유, 연결(Authority Ownership Connection)]]: 왜 owner 없는 actor에서 RPC가 자주 막히는지 설명하는 바닥 문서
- [[Replication 등록, 필터링, 수신 후처리(Replication Registration Filtering PostReceive)]]: property replication 파이프라인과 비교할 문서
- [[언리얼 네트워킹]]: 전체 네트워크 개념 통합

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\CoreUObject\Public\UObject\Script.h`
- `Engine\Source\Runtime\CoreUObject\Private\UObject\ScriptCore.cpp`
- `Engine\Source\Runtime\Engine\Private\Actor.cpp`
- `Engine\Source\Runtime\Engine\Private\NetDriver.cpp`
- `Engine\Source\Runtime\Engine\Private\DataReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\Components\ActorComponent.cpp`
[Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine) | [Replicating UObjects in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicating-uobjects-in-unreal-engine) | [Actor Owner and Owning Connection in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/actor-owner-and-owning-connection-in-unreal-engine)

## 개요
**Replication 등록, 필터링, 수신 후처리(Replication Registration / Filtering / Post-Receive)** 는 replicated property가 단순히 `UPROPERTY(Replicated)`로 끝나지 않고, 엔진 내부에서 어떤 메타데이터로 등록되고, 어떤 connection 조건으로 걸러지며, 수신 후 어떤 `OnRep`/후처리 경로를 타는지를 설명하는 문서입니다.

이 문서는 기존 `[[Replication]]`의 규칙 설명보다 한 단계 아래로 내려가서, 실제 엔진 코드 흐름을 기준으로 봅니다.

엔진 코드 기준 핵심 경로는 아래입니다.

| 단계 | 핵심 함수/파일 | 의미 |
| --- | --- | --- |
| 사용자 등록 | `GetLifetimeReplicatedProps()`, `DOREPLIFETIME*` | 어떤 프로퍼티를 어떤 조건으로 lifetime 등록할지 지정 |
| 메타데이터 빌드 | `FRepLayout::InitFromClass()` | 등록 결과를 `Condition`, `RepNotifyCondition`, `RepNotifyNumParams` 등으로 정리 |
| 활성/조건 필터링 | `GetReplicatedCustomConditionState()`, `RebuildConditionalProperties()` | 이번 프레임/이번 연결에서 실제 보낼지 결정 |
| 송신 경로 | `CompareProperties()`, `FilterChangeList()`, `SendProperties()` | 변경된 프로퍼티만 직렬화해 bunch로 작성 |
| 수신 경로 | `ReceiveProperties()` | 수신 bunch를 읽어 object data와 shadow buffer 갱신 |
| 후처리 | `CallRepNotifies()`, `OnRep_*`, `PostNetReceive*` | 로컬 반응 및 actor 특화 후처리 실행 |

즉 replicated property의 실제 수명은 `등록 -> 런타임 메타데이터화 -> connection별 필터링 -> 수신 -> 후처리`입니다.

> [!info]
> `UPROPERTY(Replicated)`는 선언 표시일 뿐입니다. 실제 replication 파이프라인에 들어가려면 `GetLifetimeReplicatedProps()` 등록과 `FRepLayout` 구성이 뒤따라야 합니다.

## 1. 등록 단계
### `GetLifetimeReplicatedProps()`
사용자 코드가 replication에 개입하는 가장 기본 진입점은 `GetLifetimeReplicatedProps()`입니다.
`UnrealNetwork.h`의 매크로들은 결국 이 함수 안에서 `OutLifetimeProps`에 `FLifetimeProperty`를 추가합니다.

기본 매크로 구조를 보면 다음이 핵심입니다.

- `DOREPLIFETIME_WITH_PARAMS_FAST()`
- `DOREPLIFETIME_WITH_PARAMS()`
- `DOREPLIFETIME_CONDITION()`
- `DOREPLIFETIME_CONDITION_NOTIFY()`

매크로는 최종적으로 `RegisterReplicatedLifetimeProperty(..., OutLifetimeProps, Params)`를 호출합니다.
즉 매크로의 본질은 "프로퍼티 descriptor + lifetime params를 등록 리스트에 넣는 것"입니다.

### `FDoRepLifetimeParams`
`UnrealNetwork.h`의 `FDoRepLifetimeParams`는 등록 시점에 붙는 정책 묶음입니다.

| 필드 | 의미 |
| --- | --- |
| `Condition` | `ELifetimeCondition`, 어떤 connection에서 보낼지 |
| `RepNotifyCondition` | `REPNOTIFY_OnChanged` 또는 `REPNOTIFY_Always` |
| `bIsPushBased` | push model 여부 |
| `CreateAndRegisterReplicationFragmentFunction` | Iris/fragment 등록용 함수 |

즉 `DOREPLIFETIME`는 단순 등록이고, `DOREPLIFETIME_WITH_PARAMS` 계열은 등록 + 정책 부여입니다.

### 등록 누락의 의미
`FRepLayout::InitFromClass()`를 보면 CDO에 대해 `GetLifetimeReplicatedProps(LifetimeProps)`를 호출한 뒤,
등록되지 않은 replicated property를 다시 검사합니다.

중요한 동작은 다음과 같습니다.

- 등록되지 않은 property는 기본 `FLifetimeProperty`로 채워짐
- `UE::Net::bAutoRegisterReplicatedProperties`가 꺼져 있으면 `COND_Never` 처리
- `bEnsureForMissingProperties`가 켜져 있으면 ensure 발생
- 의도적으로 빼려면 `DISABLE_REPLICATED_PROPERTY`를 쓰는 경로가 제공됨

즉 엔진은 "replicated라고 표시됐는데 등록되지 않은 프로퍼티"를 그냥 정상 상태로 보지 않습니다.

> [!caution]
> replicated property를 일부러 안 보낼 생각이라면 등록을 빼먹는 대신 `DISABLE_REPLICATED_PROPERTY`처럼 의도를 드러내는 편이 엔진 경고와 유지보수 양쪽에서 낫습니다.

## 2. `FRepLayout`가 등록 정보를 런타임 메타데이터로 바꾸는 단계
`FRepLayout::InitFromClass()`는 registration list를 받아 실제 런타임 메타데이터를 만듭니다.
이 단계에서 중요한 것이 `FRepParentCmd`입니다.

`RepLayout.cpp`를 보면 각 replicated parent property마다 아래 정보가 채워집니다.

- `Condition`
- `RepNotifyCondition`
- `RepNotifyNumParams`
- lifetime/custom delta 여부
- push model 여부
- object/netserialize 관련 플래그

즉 `GetLifetimeReplicatedProps()`는 선언적 등록이고, 실제 송수신 파이프라인은 `FRepLayout`이 만든 `Parents/Cmds` 메타데이터를 기준으로 동작합니다.

### `RepNotifyNumParams`
`InitFromClass()`는 property에 연결된 `RepNotifyFunc`를 찾아 parameter 개수도 기록합니다.
이 값 때문에 이후 `CallRepNotifies()`에서 0개/1개/2개 parameter case를 나눠 처리할 수 있습니다.

즉 `OnRep`는 단순 이름 매칭이 아니라, layout 빌드 시점에 이미 호출 시그니처 정보가 정리됩니다.

## 3. actor 기본 예제로 보는 등록과 커스텀 조건
`ActorReplication.cpp`의 `AActor::GetLifetimeReplicatedProps()`는 엔진 기본 예제 역할을 합니다.

핵심 등록을 보면 아래가 보입니다.

- `Role`, `RemoteRole`, `Owner`, `Instigator` 등은 shared push params로 등록
- `AttachmentReplication`은 `COND_Custom`, `REPNOTIFY_Always`
- `ReplicatedMovement`는 `COND_SimulatedOrPhysics`, `REPNOTIFY_Always`

즉 엔진 자체도 프로퍼티마다 같은 규칙을 쓰지 않습니다.
movement/attachment 같은 핵심 필드는 custom condition이나 특수 notify 정책으로 별도 취급합니다.

### `GetReplicatedCustomConditionState()`
같은 파일의 `AActor::GetReplicatedCustomConditionState()`는 아래처럼 active state를 켭니다.

- `AttachmentReplication` -> `IsReplicatingMovement()`
- `ReplicatedMovement` -> `RootComponent && !RootComponent->GetIsReplicated()`

즉 `COND_Custom`이나 custom active 상태는 declaration 한 번으로 끝나는 것이 아니라, 프레임 단위 상태에 따라 켜고 꺼집니다.

> [!tip]
> replicated property의 전송 여부는 `Condition` 하나로만 결정되지 않습니다. `GetReplicatedCustomConditionState()`와 같은 활성 상태 함수까지 봐야 실제 동작이 보입니다.

## 4. 필터링 단계
### `RebuildConditionalProperties()`
`RepLayout.cpp`의 `FRepLayout::RebuildConditionalProperties()`는 현재 connection의 `RepFlags`를 받아 condition map을 만듭니다.
그리고 각 parent property에 대해 이번 connection에서 inactive인지 계산합니다.

핵심 로직은 다음과 같습니다.

- `BuildConditionMapFromRepFlags(RepFlags)`로 condition map 구성
- `COND_Dynamic`이면 `RepChangedPropertyTracker`에서 동적 condition 조회
- 아니면 `Parents[...].Condition`을 그대로 사용
- 결과를 `InactiveParents` bit에 기록

즉 `ELifetimeCondition`은 선언적 enum이지만, 실제 전송 여부는 connection별 `RepFlags`와 비교되는 런타임 필터 단계에서 결정됩니다.

### change list와 shadow state
`RepLayout.cpp`에는 `CompareProperties()`, `FilterChangeList()`, `SendProperties()` 계열 함수가 연속으로 존재합니다.
코드 구조상 이들은 아래 역할을 이룹니다.

- shadow state와 현재 object state 비교
- 바뀐 property handle만 change list로 구성
- condition/custom active/dynamic condition으로 재필터링
- 살아남은 property만 직렬화해 송신

이 부분은 직접 한 함수에서 전부 끝나지 않지만, 함수 분해 자체가 replication send path를 잘 보여줍니다.

## 5. 수신 단계
### `FRepLayout::ReceiveProperties()`
수신 경로의 중심은 `FRepLayout::ReceiveProperties()`입니다.
이 함수는 아래 순서로 동작합니다.

1. object data buffer 생성
2. `EReceivePropertiesFlags::RepNotifies`를 확인해 repnotify 활성 여부 결정
3. `FReceivePropertiesSharedParams`와 `FReceivePropertiesStackParams` 구성
4. `ReadPropertyHandle()` 호출
5. `ReceiveProperties_r()` 재귀로 실제 데이터 읽기
6. terminator handle 검사
7. 성공 시 true 반환

즉 수신도 단순히 메모리에 memcpy하는 구조가 아니라,
`Cmds/Parents` 메타데이터를 기준으로 property handle을 읽으며 재귀적으로 object/shadow state를 갱신하는 구조입니다.

### `ReceiveProperties_r()`가 하는 일
파일 전체 구조를 보면 이 함수는 다음 역할을 맡습니다.

- 현재 handle이 가리키는 property parent/cmd를 찾음
- array/dynamic array/netserialize/custom delta를 구분
- object data와 shadow data를 갱신
- 필요하면 `RepNotifies` 배열에 property를 큐잉
- unmapped GUID와 checksum도 함께 처리

즉 replicated property 수신은 property type과 parent flags에 따라 분기되는 해석기(interpreter)에 가깝습니다.

## 6. `RepNotify`와 수신 후처리
### `CallRepNotifies()`
`FRepLayout::CallRepNotifies()`는 큐에 쌓인 `RepNotifies`를 순회하며 실제 `OnRep`를 호출합니다.
중요한 점은 이 함수가 parameter 개수에 따라 호출 방식을 다르게 처리한다는 것입니다.

- `0`개 파라미터: `ProcessEvent(RepNotifyFunc, nullptr)`
- `1`개 파라미터: shadow buffer의 이전 값 전달 가능
- `2`개 파라미터: custom delta metadata 등 추가 정보 전달 경로 존재

또한 `RepNotifyCondition`이 `REPNOTIFY_OnChanged`일 때는 값이 동일하면 notify를 건너뛸 수 있고,
`REPNOTIFY_Always`면 매번 호출됩니다.

즉 `OnRep` 호출 여부는 단순히 replicated property를 받았는가가 아니라,
`RepNotifyCondition`과 local/shadow 비교 결과까지 포함한 판단입니다.

### actor 특화 후처리
모든 수신 후처리가 `OnRep_*` 하나로 끝나는 것도 아닙니다.
`ActorReplication.cpp`를 보면 movement 수신 후 아래 경로가 존재합니다.

- `OnRep_ReplicatedMovement`
- `PostNetReceiveLocationAndRotation()`
- `PostNetReceiveVelocity()`
- `PostNetReceivePhysicState()`

특히 `ReplicatedMovement`는 `REPNOTIFY_Always`로 등록되어 있고,
후처리 안에서 실제 root component transform/velocity/physics target을 적용합니다.

즉 replicated property는 "값 복사"와 "수신 반응"이 분리될 수 있고,
핵심 엔진 필드는 후처리 경로가 일반 gameplay `OnRep`보다 더 깊을 수 있습니다.

> [!info]
> movement 같은 필드는 `OnRep`가 곧 최종 처리라는 보장이 없습니다. 실제 적용은 `PostNetReceive*` 계열에서 이어질 수 있습니다.

## 7. 실무 관점에서 꼭 알아둘 점
### 1. declaration, registration, runtime metadata는 다른 단계다
`UPROPERTY(Replicated)`만으로는 부족합니다.
`GetLifetimeReplicatedProps()` 등록과 `FRepLayout` 빌드까지 가야 실제 파이프라인에 들어갑니다.

### 2. 전송 조건은 매크로 한 줄로 끝나지 않는다
`DOREPLIFETIME_CONDITION`은 시작일 뿐이고,
실제 전송 여부는 `RepFlags`, dynamic condition, custom active state까지 거쳐서 결정됩니다.

### 3. `OnRep`는 수신 그 자체가 아니다
값을 수신해도 `REPNOTIFY_OnChanged` 조건이면 notify가 스킵될 수 있습니다.
반대로 `REPNOTIFY_Always`면 변경 여부와 무관하게 반응할 수 있습니다.

### 4. 핵심 엔진 필드는 일반 gameplay property와 다르게 취급된다
`ReplicatedMovement`, `AttachmentReplication`처럼 엔진 핵심 필드는 condition/notify/post-receive 경로가 별도 설계돼 있습니다.
일반 변수를 같은 감각으로 보면 안 됩니다.

### 5. 등록 누락과 전송 누락은 다른 문제다
값이 안 간다고 해서 항상 relevancy나 dormancy 문제가 아닙니다.
아예 등록이 빠졌거나 `COND_Never`로 처리됐을 수도 있습니다.

## 네트워킹 스택 안에서의 위치
- `[[권한, 소유, 연결(Authority Ownership Connection)]]`: 이 프로퍼티가 어느 connection 문맥에 속하는지 결정
- `[[Replication 등록, 필터링, 수신 후처리(Replication Registration Filtering PostReceive)]]`: 프로퍼티 registration/filter/receive 내부 흐름
- `[[Replication]]`: 복제 규칙과 사용 기준 정리
- `[[RPC]]`: 이벤트/요청 전달 경로
- `[[언리얼 네트워킹]]`: 전체 통합 노트

## 연결해서 볼 문서
- [[Replication]]: 복제 규칙과 조건 사용 기준
- [[권한, 소유, 연결(Authority Ownership Connection)]]: owner/connection/callspace 바닥 규칙
- [[RPC]]: property replication과 이벤트 전송의 경계
- [[언리얼 네트워킹]]: 네트워크 개념 전체 요약

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Public\Net\UnrealNetwork.h`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\RepLayout.cpp`
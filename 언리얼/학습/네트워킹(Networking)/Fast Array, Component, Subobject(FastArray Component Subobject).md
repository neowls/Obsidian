[Replicating UObjects in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicating-uobjects-in-unreal-engine) | [Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine)

## 개요
`Fast Array`, `replicated component`, `replicated subobject`는 모두 "actor 하나만 복제한다" 수준을 넘어서, actor 내부의 동적 데이터와 하위 object까지 네트워크에 태우는 계층입니다.

| 축 | 핵심 타입/함수 | 의미 |
| --- | --- | --- |
| Fast Array | `FFastArraySerializer`, `FFastArraySerializerItem`, `MarkItemDirty()`, `MarkArrayDirty()` | 동적 배열을 일반 property diff보다 더 가볍게 관리하기 위한 custom net delta path |
| Replicated Component | `UActorComponent::SetIsReplicated()`, `ReadyForReplication()` | actor의 하위 component를 actor channel 위에서 함께 복제 |
| Legacy Subobject | `ReplicateSubobjects()`, `UActorChannel::ReplicateSubobject()` | 가상 함수 안에서 직접 subobject를 밀어 넣는 오래된 방식 |
| Registered Subobject List | `AddReplicatedSubObject()`, `ReplicateRegisteredSubObjects()` | actor/component가 subobject registry를 만들고 channel이 이를 순회하는 현대 방식 |

> [!info]
> 이 주제의 핵심은 "actor가 무엇을 복제할까"가 아니라 `UActorChannel`이 actor, component, subobject를 어떤 순서와 규칙으로 흘려보내는가입니다.

## 1. Fast Array가 필요한 이유
`FastArraySerializer.h` 상단 주석은 일반 replication과 dynamic property replication의 차이를 아주 직접적으로 설명합니다.

- 일반 atomic property는 channel의 flat `Recent` buffer 비교로 dirty 판단 가능
- `TArray` 같은 dynamic property는 내부 데이터가 flat buffer에 그대로 들어가지 않음
- 그래서 `NetDeltaSerialize`가 base state와 current state를 비교하면서 diff와 full state를 같이 관리
- `Fast Array`는 이 delta serialization을 `ID -> ReplicationKey` 중심으로 특화한 경량 경로

즉 `Fast Array`는 "배열 전체를 매 프레임 비교해서 보내는 기능"이 아니라, 배열 원소의 identity와 dirty 상태를 직접 관리하는 custom delta serializer입니다.

## 2. Fast Array 기본 구조
| 타입 | 역할 |
| --- | --- |
| `FFastArraySerializerItem` | 각 원소의 `ReplicationID`, `ReplicationKey`, `MostRecentArrayReplicationKey` 보유 |
| `FFastArraySerializer` | 배열 전체의 `ItemMap`, `ArrayReplicationKey`, `IDCounter` 관리 |
| `FNetFastTArrayBaseState` | 이전 전송 기준의 `IDToCLMap`, `ArrayReplicationKey` 저장 |

`FFastArraySerializerItem`의 세 필드는 `UPROPERTY(NotReplicated)`지만, Fast Array 내부 알고리즘에서는 핵심 상태입니다.

- `ReplicationID`: 원소의 네트워크 식별자
- `ReplicationKey`: 해당 원소가 몇 번 dirty 되었는지
- `MostRecentArrayReplicationKey`: 클라이언트가 마지막으로 본 배열 버전

> [!warning]
> `ReplicationID`와 `ReplicationKey`는 게임플레이 의미의 데이터가 아니라 delta serialization bookkeeping입니다. 이 값 자체를 게임 로직 판단 기준으로 쓰면 안 됩니다.

## 3. Dirty 표시 규칙
`FFastArraySerializer::MarkItemDirty()`와 `MarkArrayDirty()`가 사실상 Fast Array 사용의 핵심 계약입니다.

### `MarkItemDirty()`
- 새 원소면 `ReplicationID`를 부여
- 해당 원소의 `ReplicationKey` 증가
- 내부적으로 `MarkArrayDirty()` 호출

### `MarkArrayDirty()`
- `ItemMap.Reset()`
- `IncrementArrayReplicationKey()`
- cached item count 무효화
- push model이면 `MARK_PROPERTY_DIRTY_UNSAFE(OwningObject, RepIndex)`까지 호출

정리하면:
- 원소 추가/수정: `MarkItemDirty()`
- 원소 삭제: `MarkArrayDirty()`

> [!tip]
> 삭제 시 `MarkItemDirty()`가 아니라 `MarkArrayDirty()`가 필요한 이유는, 삭제는 "어느 원소가 사라졌는지"를 배열 레벨에서 다시 계산해야 하기 때문입니다. 헤더 주석의 warning도 이 점을 직접 말합니다.

## 4. Fast Array 직렬화 흐름
### 서버 쓰기 경로
`FFastArraySerializer::FastArrayDeltaSerialize()` 또는 `FastArrayDeltaSerialize_DeltaSerializeStructs()`가 호출되면:

1. `ConditionalRebuildItemMap()`
2. 이전 base state의 `IDToCLMap`과 현재 상태 비교
3. `BuildChangedAndDeletedBuffers()`로 변경/삭제 목록 생성
4. `FFastArraySerializerHeader` 작성
5. `NetDeltaSerializeForFastArray()`로 changed items와 deleted IDs 전송
6. 새 `FNetFastTArrayBaseState`를 다음 비교 기준으로 저장

### 클라이언트 읽기 경로
클라이언트는:

1. header 읽기
2. `ReplicationID -> local index` 매핑 재구성
3. 새 원소 생성 또는 기존 원소 갱신
4. 삭제 원소 제거
5. `PostReceiveCleanup()` 수행
6. item/serializer callback 호출

기본 callback 지점은 아래와 같습니다.

| 위치 | callback |
| --- | --- |
| item 삭제 직전 | `PreReplicatedRemove()` |
| item 신규 추가 후 | `PostReplicatedAdd()` |
| item 변경 후 | `PostReplicatedChange()` |
| 수신 완료 후 serializer 레벨 | `PostReplicatedReceive()` |

또한 struct-delta path에서는 `ReceivedItem()` helper가 `ReplicationID`, `MostRecentArrayReplicationKey`, `ReplicationKey`를 수신 측 item에 맞춰 갱신합니다.

## 5. Fast Array와 일반 배열 복제의 차이
| 비교 항목 | 일반 배열 복제 | Fast Array |
| --- | --- | --- |
| dirty 추적 주체 | property/struct diff | item ID + replication key |
| 삭제 처리 | 전체 배열 비교에 의존 | deleted index/id 목록을 별도 전송 |
| 콜백 | `RepNotify` 중심 | item/serializer callback 중심 |
| 적합한 데이터 | 단순 소형 배열 | 인벤토리, 버프 목록, 상태 목록처럼 원소 identity가 중요한 배열 |

엔진 주석 기준으로 현재는 inner struct delta serialization도 기본 활성화되어 있으므로, dirty된 원소 안에서도 changed property만 보내는 경로를 탈 수 있습니다.

## 6. Replicated Component
`UActorComponent`는 actor 바깥의 독립 채널을 갖지 않고, actor의 channel 위에서 subobject처럼 전송됩니다.

핵심 함수는 아래입니다.

- `SetIsReplicated()`
- `SetIsReplicatedByDefault()`
- `ReadyForReplication()`
- `ReplicateSubobjects()`

### `SetIsReplicated()`
`UActorComponent::SetIsReplicated()`는:

- `bReplicates` 변경
- `MARK_PROPERTY_DIRTY_FROM_NAME(UActorComponent, bReplicates, this)`
- owner actor의 `UpdateReplicatedComponent(this)` 호출

즉 component replication on/off는 component 내부 플래그만 바꾸는 게 아니라 owner actor의 replicated component 목록과 연결됩니다.

### `ReadyForReplication()`
`ReadyForReplication()`은 component가 실제로 network serialization에 들어갈 준비가 되었음을 표시합니다.

`AActor::AddComponentForReplication()`와 `BuildReplicatedComponentsInfo()`를 보면:
- component가 replicated list에 들어갈 때
- 아직 `IsReadyForReplication()`이 false면
- actor가 `ReadyForReplication()`을 먼저 호출

> [!info]
> `ReadyForReplication()`은 "component 생성 완료"가 아니라 "이제 channel 위에서 복제해도 되는 시점"에 가깝습니다.

## 7. Legacy 방식과 Registered List 방식
### Legacy: `ReplicateSubobjects()`
actor나 component가 virtual `ReplicateSubobjects()`를 override해서 직접 `Channel->ReplicateSubobject()`를 호출하는 방식입니다.

`AActor::ReplicateSubobjects()` 기본 구현은:

1. `ReplicatedComponents` 순회
2. 각 component의 `ReplicateSubobjects()` 먼저 호출
3. 그 다음 `Channel->ReplicateSubobject(ActorComp, ...)`로 component 자체 전송

즉 legacy path에서도 "component의 subobject -> component 본체" 순서가 유지됩니다.

### Registered List: `AddReplicatedSubObject()`
현대 경로는 actor/component가 subobject registry를 만들고, `UActorChannel::ReplicateRegisteredSubObjects()`가 이를 순회하는 방식입니다.

`AActor::AddReplicatedSubObject()`의 핵심 제약:
- invalid pointer 금지
- `RF_ArchetypeObject | RF_ClassDefaultObject` 금지
- `bReplicateUsingRegisteredSubObjectList`가 true여야 함

component 쪽 `AddReplicatedSubObject()`는 실제로 owner actor의 `AddActorComponentReplicatedSubObject()`로 위임됩니다.

여기서 추가 제약도 걸립니다.
- component 자체가 replicated여야 함
- component subobject는 `COND_Custom` 불가

## 8. Channel에서 실제로 보내는 순서
`UActorChannel::DoSubObjectReplication()`은 actor가 registered list를 쓰는지에 따라 갈립니다.

### actor가 registered list를 쓰는 경우
`ReplicateRegisteredSubObjects()`가 실행되고 순서는 아래입니다.

1. actor 소유 subobject 작성
2. replicated component 순회
3. 각 component의 subobject 작성
4. 마지막에 component 본체 작성

엔진 코드 주석도 `SubObjects have to be created before the component on the receiving end.`라고 못 박고 있습니다. 즉 수신 측에서 참조가 안전하게 연결되도록 creation order를 보장하는 것입니다.

### actor가 legacy path를 쓰는 경우
`Actor->ReplicateSubobjects()`가 호출됩니다.

이때 component가 registered list를 쓰는 특수 경우에는 `UActorChannel::ReplicateSubobject(UActorComponent*)`가 따로 component subobject registry를 써서 처리합니다.

> [!tip]
> 요약하면 UE 5.7의 방향은 가능하면 registered subobject list로 몰고, legacy virtual method는 호환용으로 남겨두는 쪽입니다.

## 9. 삭제와 정리
subobject를 리스트에서 빼는 것과 클라이언트에서 즉시 제거시키는 것은 다릅니다.

| 함수 | 의미 |
| --- | --- |
| `RemoveReplicatedSubObject()` | registry에서 제거, authority면 replication system 중지 |
| `DestroyReplicatedSubObjectOnRemotePeers()` | remote peer에 delete 요청 전송 |
| `TearOffReplicatedSubObjectOnRemotePeers()` | tear-off 형태로 분리 |

`UActorChannel::UpdateDeletedSubObjects()`는 invalid/destroyed/dormant-flushed subobject를 훑으면서 delete content block을 reliable로 보냅니다.

## 10. 실무 해석
- 인벤토리, 버프, 슬롯 목록처럼 원소 identity가 중요한 배열은 `Fast Array`가 맞다.
- 단순 배열 몇 개를 가볍게 보내는 수준이면 일반 property replication이 더 단순할 수 있다.
- component는 독립 채널이 아니라 actor channel의 일부다.
- subobject replication은 객체 레퍼런스가 복제된다는 것과 해당 객체 상태를 실제로 보내고 있다는 것을 구분해서 봐야 한다.
- UE 5.7 기준으로는 registered subobject list를 기본 경로로 이해하는 편이 안전하다.

## 네트워킹 스택 안에서의 위치
- [[언리얼 네트워킹]]
- [[Replication]]
- [[RPC]]
- [[CharacterMovement와 예측(CharacterMovement Prediction)]]

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Net\Core\Classes\Net\Serialization\FastArraySerializer.h`
- `Engine\Source\Runtime\Engine\Classes\Components\ActorComponent.h`
- `Engine\Source\Runtime\Engine\Private\Components\ActorComponent.cpp`
- `Engine\Source\Runtime\Engine\Classes\GameFramework\Actor.h`
- `Engine\Source\Runtime\Engine\Private\ActorReplication.cpp`
- `Engine\Source\Runtime\Engine\Private\DataChannel.cpp`

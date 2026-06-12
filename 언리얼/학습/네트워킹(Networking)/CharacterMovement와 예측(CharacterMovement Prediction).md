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

# CharacterMovement와 예측(CharacterMovement Prediction)

> [!summary] 요약
> CharacterMovement 예측은 클라이언트가 입력 결과를 먼저 보여주고 서버 결과로 보정하는 Unreal 캐릭터 이동 동기화 모델이다.
> 플레이어 이동이 지연되거나 튕기거나 서버와 클라이언트 위치가 어긋날 때 확인한다.
> 핵심은 입력 전송, 서버 검증, 클라이언트 재시뮬레이션, 보정이 CharacterMovementComponent 안에서 반복된다는 점이다.

## 핵심 결론

- Autonomous Proxy는 입력을 모아 서버로 보내고, 서버는 authoritative movement 결과를 확정한다.
- SavedMove와 prediction data가 커스텀 이동 상태를 제대로 담지 못하면 보정이나 desync가 발생한다.
- 이동 문제가 있으면 movement mode, compressed flags, saved move combine, network smoothing, correction 로그를 확인한다.

## 참고 자료

[Setting Up Character Movement](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-character-movement?application_version=5.6) | [Replicate Actor Properties in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/replicate-actor-properties-in-unreal-engine) | [Remote Procedure Calls in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/remote-procedure-calls-in-unreal-engine)

## 개요
`CharacterMovement` 네트워킹은 일반 actor의 `ReplicatedMovement`만 보는 경로가 아닙니다. `AutonomousProxy`는 입력 기반 prediction과 replay를 하고, 서버는 move를 다시 수행한 뒤 correction을 보내며, `SimulatedProxy`는 replicated movement와 based movement를 받아 smoothing 합니다.

| 역할 | 핵심 경로 | 의미 |
| --- | --- | --- |
| AutonomousProxy 클라이언트 | `ControlledCharacterMove()` -> `ReplicateMoveToServer()` -> local `PerformMovement()` | 입력을 즉시 로컬 예측하고 move를 서버에 보고 |
| Authority 서버 | `ServerMove_HandleMoveData()` -> `ServerMove_PerformMovement()` | 서버가 진짜 이동 결과를 계산하고 correction 여부 결정 |
| SimulatedProxy | `OnRep_ReplicatedMovement()`, `OnRep_ReplicatedBasedMovement()`, `SmoothCorrection()` | 서버 상태를 받아 시각적으로 부드럽게 보간 |

> [!info]
> 핵심은 `ACharacter`가 단순히 transform 한 벌만 복제(Replication)받는 actor가 아니라, 입력 예측과 재시뮬레이션이 이미 내장된 특수 네트워크 actor라는 점입니다.

## 왜 필요한가

네트워크 버그는 기능 코드가 틀려서보다 실행 위치와 복제 조건을 잘못 가정해서 생기는 경우가 많다. CharacterMovement와 예측(CharacterMovement Prediction)을 볼 때는 "서버의 사실", "클라이언트의 요청", "복제로 전달되는 상태"를 분리해야 한다.

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

## 1. 왜 일반 actor movement replication과 다른가
일반 actor는 대체로 서버가 `ReplicatedMovement`를 보내고 클라이언트가 이를 적용하는 구조입니다. 반면 `ACharacter`는 role별 경로가 다릅니다.

- `AutonomousProxy`: 자신의 입력을 바로 적용하고 서버에 move를 보낸다.
- `Authority`: 클라이언트가 보낸 move를 검증하고 다시 수행한다.
- `SimulatedProxy`: 서버가 보낸 movement mode, based movement, transform update를 보고 smoothing 한다.

`ACharacter::GetLifetimeReplicatedProps()`를 보면 `ReplicatedBasedMovement`, `ReplicatedMovementMode`, `ReplicatedGravityDirection`, `ReplicatedServerLastTransformUpdateTimeStamp`, `RepRootMotion` 등이 대부분 `COND_SimulatedOnly`로 복제됩니다.

즉 소유 클라이언트는 단순 replicated transform 소비자가 아니라 prediction 참여자이고, 비소유 클라이언트가 주로 서버의 movement replication을 소비합니다.

## 2. Tick 진입점
`UCharacterMovementComponent::TickComponent()`는 role에 따라 큰 갈래를 나눕니다.

### `AutonomousProxy` 클라이언트
- `bUpdatePosition`이 켜져 있으면 `ClientUpdatePositionAfterServerUpdate()`로 correction replay 먼저 수행
- 그 다음 `ControlledCharacterMove()`로 입력 기반 move 진행

### 서버 authority 또는 listen server local character
- `ControlledCharacterMove()`에서 바로 `PerformMovement()` 수행
- listen server가 remote autonomous proxy를 볼 때는 `ServerAutonomousProxyTick()`과 `SmoothClientPosition()`도 함께 사용

### `SimulatedProxy`
- `SimulatedTick()` 경로로 들어가고
- replicated movement/based movement를 기반으로 보간

## 3. AutonomousProxy 예측 경로
`ControlledCharacterMove()`는 먼저 `CheckJumpInput()`과 acceleration 계산을 수행합니다.

그 다음 분기는 단순합니다.
- authority면 `PerformMovement()`
- `ROLE_AutonomousProxy && NM_Client`면 `ReplicateMoveToServer()`

`ReplicateMoveToServer()` 내부 흐름은 다음과 같습니다.

1. controller 동기화 확인 (`AcknowledgedPawn`, `Player`)
2. `FNetworkPredictionData_Client_Character::UpdateTimeStampAndDeltaTime()`
3. `OldMove` 탐색
4. 새 `FSavedMove_Character` 생성 후 `SetMoveFor()` 호출
5. 필요하면 `PendingMove`와 `CanCombineWith()` / `CombineWith()`로 결합
6. 클라이언트에서 먼저 `PerformMovement()` 수행
7. `PostUpdate(PostUpdate_Record)`
8. `SavedMoves`에 push
9. `CallServerMovePacked()` 또는 `CallServerMove()` 전송

> [!tip]
> 중요한 점은 클라이언트가 서버 응답을 기다렸다가 움직이는 것이 아니라, 먼저 움직이고 나중에 서버와 맞추는 구조라는 점입니다.

## 4. Prediction Data와 SavedMove

### `FNetworkPredictionData_Client_Character`
클라이언트 prediction data는 대략 아래 역할을 가집니다.

- `SavedMoves`: 아직 서버에 완전히 ack되지 않은 move 목록
- `PendingMove`: 잠시 묶어서 보내기 위해 보류한 move
- `LastAckedMove`: 서버가 마지막으로 인정한 move
- `CurrentTimeStamp`: move timestamp 관리
- `bUpdatePosition`: correction 후 replay가 필요함을 표시

`UpdateTimeStampAndDeltaTime()`는 클라이언트 물리를 완전히 자유롭게 두지 않고, 서버와 큰 차이가 나지 않게 delta time을 맞추는 역할도 합니다.

### `FSavedMove_Character`
`FSavedMove_Character`는 단순 위치 저장체가 아닙니다.

- acceleration
- compressed flags (`Jump`, `Crouch`, custom flags)
- 시작/종료 base 정보
- movement mode
- control rotation
- root motion 관련 상태
- capsule 크기, attach 상태 등

`CanCombineWith()`를 보면 move 결합이 매우 보수적입니다. acceleration 방향, jump/crouch flag, movement base, attach parent, movement mode, capsule 크기 등이 다르면 결합하지 않습니다.

## 5. 서버 authoritative 경로
클라이언트가 보낸 move는 `CallServerMovePacked()` 또는 `CallServerMove()`로 서버에 전달됩니다.

서버 쪽 핵심 흐름은 아래입니다.

1. `ServerMove_HandleMoveData()`
2. 필요 시 old/pending/new move 순서대로 처리
3. `ServerMove_PerformMovement()`에서 실제 authoritative movement 수행

이 과정에서 서버는:
- `VerifyClientTimeStamp()`
- `ProcessClientTimeStampForTimeDiscrepancy()`
- `FNetworkPredictionData_Server_Character::GetServerMoveDeltaTime()`

같은 경로로 timestamp와 delta time을 제어합니다.

즉 서버는 단순히 클라이언트 좌표를 복사하지 않고, 클라이언트 입력 기반 move를 다시 시뮬레이션합니다.

## 6. Correction과 replay
서버가 클라이언트와 다르다고 판단하면 `ClientAdjustPosition()` 계열 RPC가 내려옵니다.

`ClientAdjustPosition_Implementation()`의 핵심은 아래입니다.

1. timestamp로 해당 saved move 찾기
2. `AckMove()` 호출
3. 서버 위치/속도/이동 모드를 신뢰하고 현재 상태 갱신
4. floor/base/location 저장 갱신
5. 마지막에 `ClientData->bUpdatePosition = true`

그 다음 프레임 초입에서 `TickComponent()`가 `bUpdatePosition`을 보고 `ClientUpdatePositionAfterServerUpdate()`를 실행합니다.

`ClientUpdatePositionAfterServerUpdate()`는:
- `SavedMoves`를 순회
- 각 move마다 `PrepMoveFor()` 호출
- `MoveAutonomous()`로 다시 시뮬레이션
- `PostUpdate(PostUpdate_Replay)` 수행

즉 correction은 끝이 아니라, 서버가 인정한 위치로 되돌아간 뒤 아직 ack되지 않은 입력을 다시 재생하는 시작점입니다.

> [!warning]
> 여기서 `SavedMoves` replay가 있기 때문에, movement 코드를 커스텀할 때 입력/상태가 `FSavedMove_Character`에 제대로 저장되지 않으면 prediction desync가 바로 발생합니다.

## 7. SimulatedProxy와 smoothing
비소유 클라이언트는 prediction replay 대신 replicated movement를 부드럽게 적용합니다.

중요한 진입점은:
- `ACharacter::PostNetReceive()`
- `ACharacter::OnRep_ReplicatedMovement()`
- `ACharacter::OnRep_ReplicatedBasedMovement()`
- `UCharacterMovementComponent::SmoothCorrection()`
- `UCharacterMovementComponent::SmoothClientPosition()`

`OnRep_ReplicatedBasedMovement()`를 보면:
- base 변경 여부 확인
- relative location/rotation을 world transform으로 변환
- `bNetworkSmoothingComplete = false`
- `SmoothCorrection()` 호출

즉 simulated proxy는 서버 업데이트를 즉시 teleport처럼 확정하기보다, correction과 visual smoothing 사이에서 절충합니다.

## 8. Root Motion은 별도 경로를 가진다
`ACharacter::OnRep_ReplicatedMovement()`는 networked root motion 중이면 일반 correction path를 건너뜁니다.

또한 root motion은:
- `RepRootMotion`
- `ClientAdjustRootMotionPosition()`
- `ClientAdjustRootMotionSourcePosition()`
- `SimulatedRootMotionPositionFixup()`

같은 별도 경로를 가집니다.

즉 root motion 캐릭터는 단순 movement prediction만 보면 안 되고, montage track position과 root motion source 재시뮬레이션까지 같이 봐야 합니다.

## 9. 일반 actor 이동 복제와의 차이 요약
| 항목 | 일반 actor | CharacterMovement |
| --- | --- | --- |
| 소유 클라이언트 동작 | 서버 transform 수신 대기 | 입력 기반 local prediction 후 서버 보고 |
| 서버 처리 | 상태 복제 위주 | move 재시뮬레이션과 timestamp 검증 |
| 불일치 해결 | RepNotify 또는 transform overwrite | `ClientAdjustPosition()` 후 `SavedMoves` replay |
| 비소유 클라이언트 | replicated transform 적용 | `SmoothCorrection()`과 `SmoothClientPosition()` 사용 |

## 10. 실무 해석
- `ACharacter` 이동 문제를 일반 replication 문제처럼 보면 항상 설명이 반쯤 틀립니다.
- 소유 클라이언트 문제는 `ReplicatedMovement`보다 `SavedMoves`, `AckMove`, correction replay를 먼저 봐야 합니다.
- 비소유 클라이언트 문제는 `OnRep_ReplicatedBasedMovement()`와 smoothing을 먼저 봐야 합니다.
- movement mode, gravity direction, root motion은 단순 위치 외의 중요한 네트워크 상태입니다.
- 커스텀 movement를 넣을 때는 `FSavedMove_Character`, compressed flags, replay 친화성을 같이 설계해야 합니다.

## 네트워킹 스택 안에서의 위치
- [[언리얼 네트워킹]]
- [[Replication]]
- [[RPC]]
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]

## 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Classes\GameFramework\Character.h`
- `Engine\Source\Runtime\Engine\Private\Character.cpp`
- `Engine\Source\Runtime\Engine\Private\Components\CharacterMovementComponent.cpp`

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
- [[Fast Array, Component, Subobject(FastArray Component Subobject)]]
- [[Iris와 Replication Graph(Iris Replication Graph)]]
- [[Replication]]
- [[RPC]]

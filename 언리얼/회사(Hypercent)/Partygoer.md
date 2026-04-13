# StaticRoomCreaturePartygoer 정규화 명세 (AI-Readable) v1  
  
- 문서 목적: `StaticRoomCreaturePartygoer` 기획을 구현 가능한 요구사항 단위로 정규화하고, 코드 엔트리 포인트에 매핑한다.  
- 기준 엔진: UE 5.5  
- 기준 플랫폼: Win64  
- 작성일: 2026-02-25  
- 상태: Draft (코드 수정 전 정리본)  
  
## 0) 핵심 원칙  
  
- `Peace/Rampage`, `PatrolPattern`, `LockedTarget`, 표정/TV 표시 등은 **별도 FSM 추가 없이 Partygoer 클래스 멤버/런타임 데이터로 관리**한다.  
- `Idle/Chase/MiniGame/Combat/Wait` 상태 클래스는 이동/추격/전투/미니게임의 실행 단위로만 사용한다.  
- 권한 분리: 판정(정답/실패, Phase 전환, 타깃 고정)은 서버 authoritative.  
  
## 1) 용어/데이터 모델  
  
### 1.1 용어  
  
- `Mood`: Partygoer 기분 상태 (`Peace`, `Rampage`)  
- `BehaviorPattern`:  
  - `PeaceMiniGameThenPermanentRampage` (패턴 A)  
  - `PeaceDetectThenTemporaryRampage` (패턴 B)  
- `PatrolPattern`:  
  - `SharedSpawnPatrol`  
  - `DedicatedRoomPatrol`  
  
### 1.2 런타임 소유 데이터(Partygoer)  
  
- `CurrentPhase : EPartygoerPhase` (`StaticRoomCreaturePartygoer.h`)  
- `CurrentFaceState : EPartygoerFaceState`  
- `LockedRampageTarget : AActor*`  
- `SpawnOrigin : FVector`  
- `TuningData : UStaticRoomPartygoerTuningData*`  
  
## 2) 행동 패턴 요약  
  
### 2.1 패턴 A: 전용 구역 평화 순찰 -> 미니게임 -> 실패 시 영구 분노  
  
- 평화 상태에서 유저 인지 시 `Chase(MiniGame 목적)`.  
- 근접/가시 조건 충족 시 `MiniGame`.  
- 성공 시 `Peace + Idle` 복귀.  
- 실패 시 `Rampage` 전환 + 대상 고정 + `Combat/AttackChase`.  
- 대상이 로커에 숨으면 `Wait` 상태로 로커 앞 대기.  
- 대상 사망 시 `Idle` 복귀 + 미니게임 진행도 리셋.  
  
### 2.2 패턴 B: 평화 순찰 중 유저 인지 즉시 임시 분노 추격  
  
- 유저 감지 시 `Rampage` 전환 후 `Chase(Attack 목적)`.  
- 시야 상실/로커 숨기 등 추격 중단 조건 충족 시 `Peace + Idle` 복귀.  
- 영구 잠금 추격이 아니라 일시적 분노 패턴.  
  
## 3) 요구사항 ID  
  
## 3.1 Runtime/State 요구사항 (`R-*`)  
  
- `R-01` Idle에서 유효 유저 감지 시 Chase 진입.  
- `R-02` 패턴 B에서는 감지 즉시 Rampage 전환 후 Chase.  
- `R-03` Chase 목적은 `MiniGame` 또는 `Attack` 중 하나로 결정.  
- `R-04` `DedicatedRoomPatrol` + MiniGame 추격은 원점 leash 반경 밖이면 취소.  
- `R-05` MiniGame 목적 추격에서 근접+LineTrace 가시 시 MiniGame 진입.  
- `R-06` Attack 목적 추격에서 공격 가능 거리면 Combat 진입.  
- `R-07` 평화 상태에서 피격 시 Rampage 전환 + 공격자 우선 추격.  
- `R-08` 영구 분노는 `LockedRampageTarget`을 우선 타깃으로 유지.  
- `R-09` 영구 분노 타깃이 로커 숨기 시 로커 앞 `Wait` 대기.  
- `R-10` 영구 분노 타깃 사망 시 `Idle` 복귀, 미니게임 시퀀스 리셋.  
- `R-11` 해당 스테이지에서 미니게임을 이미 수행한 유저는 재대상 제외.  
- `R-12` 표정은 Phase/결과에 맞춰 즉시 반영(웃음/초록성공/빨강분노).  
  
## 3.2 MiniGame 요구사항 (`M-*`)  
  
- `M-01` 최초 시퀀스 길이는 1.  
- `M-02` 성공 시 다음 대상 시퀀스 길이 +1, 최대 4.  
- `M-03` 실패 시 시퀀스 길이/진행도 1로 리셋.  
- `M-04` 5번째 이후 대상도 길이 4 유지.  
- `M-05` 입력 제한 시간 10초(튜닝값), 초과 시 실패.  
- `M-06` 정답 입력 경로는 UI 제출 또는 제스처 이벤트 모두 허용.  
- `M-07` TV 표시 텍스처는 DisplayTag 기반으로 머터리얼 파라미터에 주입.  
- `M-08` 감정표현 왜곡(상하반전/하단노이즈)은 확률 기반 연출로 적용.  
- `M-09` 다른 미니게임 진행 중인 플레이어는 타깃 선정에서 제외.  
  
## 3.3 연출/입력 제어 요구사항 (`T-*`)  
  
- `T-01` 조우 시작 시 3인칭 강제, 파티고어를 보게 고정, 입력 봉쇄.  
- `T-02` 5초 인트로 후 1인칭 전환 + 카메라/이동 제한 유지.  
- `T-03` 배 화면 카운트다운(3,2,1) 후 감정표현 + 소형 카운트다운 표시.  
- `T-04` 선택 완료 및 제스처 종료 후 제어권 복구.  
- `T-05` 성공 시 초록 표정 5초.  
- `T-06` 실패 시 빨강 표정 5초 후 공격 추격 전환.  
  
## 3.4 네트워크/권한 요구사항 (`N-*`)  
  
- `N-01` 정답 판정/성공실패/Phase 전환은 서버에서 수행.  
- `N-02` 표정/TV 표시는 복제 또는 Multicast로 모든 클라 동기화.  
- `N-03` UI 입력은 클라 -> 서버 RPC -> 서버 상태 객체 처리.  
  
## 4) 요구사항-코드 매핑표 (현재 코드 기준)  
  
| Req | 주요 소유/실행 | 코드 엔트리 포인트 | 현재 상태 | 비고 |  
|---|---|---|---|---|  
| R-01 | Idle -> Chase | `UStaticRoomCreatureStateIdlePartygoer::OnPerceptionUpdate` | 구현됨 | 대상 필터 포함 |  
| R-02 | 패턴B 감지 즉시 분노 | `OnPerceptionUpdate` + `Tuning->BehaviorPattern` | 구현됨 | Temporary Rampage 분기 |  
| R-03 | 추격 목적 결정 | `UStaticRoomCreatureStateChasePartygoer::ResolveChasePurpose` | 구현됨 | Phase/이전상태 기반 |  
| R-04 | 전용 룸 leash | `IsChaseCandidate` + `PeaceLeashRadiusFromSpawn` | 구현됨 | DedicatedRoomPatrol에서만 적용 |  
| R-05 | 미니게임 진입 | `CanEnterMiniGameWithTarget`, `CheckTransitionCondition` | 구현됨 | 거리+LoS 검사 |  
| R-06 | 전투 진입 | `CheckTransitionCondition`, `AttackComponent->IsAttackable` | 구현됨 | Combat 전환 |  
| R-07 | 피격 시 분노 | `AStaticRoomCreaturePartygoer::ChangeStateWhenDamaged` | 구현됨 | 공격자 추정 로직은 단순 |  
| R-08 | 타깃 고정 추격 | `LockedRampageTarget`, `S_SetPartygoerPhase`, Chase Enter | 구현됨 | 분노 시 고정 타깃 우선 |  
| R-09 | 로커 대기 | Chase/Combat에서 `Wait` 전환 + `UStaticRoomCreatureStateWaitPartygoer` | 구현됨 | 타깃이 나오면 재추격 |  
| R-10 | 타깃 사망 리셋 | `UStaticRoomCreatureStateCombatPartygoer::Tick` | 구현됨 | MiniGame 진행도 리셋 |  
| R-11 | 재대상 제외 | `CompletedPlayers`, Idle/Chase 필터 | 구현됨 | Perception에서도 제거 |  
| R-12 | 표정 제어 | `S_SetFaceState`, `ApplyFaceStateLocal` | 구현됨 | 복제 포함 |  
| M-01 | 시퀀스 길이 1 시작 | `CurrentSequenceLength = 1`, `BuildSequenceFromProgress` | 구현됨 |  |  
| M-02 | 성공 시 +1 (최대) | `HandleSuccess` | 구현됨 | `MaxSequenceLength` 적용 |  
| M-03 | 실패 시 리셋 | `HandleFailure -> ResetMiniGameProgress` | 구현됨 |  |  
| M-04 | 최대 4 고정 | `MaxSequenceLength` 튜닝 | 구현됨(튜닝 의존) | 4는 데이터로 보장 |  
| M-05 | 제한시간 실패 | `StartInputPhase -> GameTimer` | 구현됨 | 기본 10초 |  
| M-06 | UI/제스처 입력 | `OnPlayerSubmittedAnswer`, `OnTargetGestureStartedWithInfo` | 구현됨 | 둘 다 서버 판정 |  
| M-07 | TV 텍스처 표시 | `S_ShowMiniGame*`, `Multicast_SetMiniGameDisplayTag` | 구현됨 | DisplayTag->Texture 맵 |  
| M-08 | 왜곡 확률 연출 | `FlipVerticalProbability`, `BottomNoiseProbability` | 미구현 | 데이터만 존재, 사용처 없음 |  
| M-09 | 미니게임 중복 방지 | `IsPlayerBusyInMiniGame` | 구현됨 | 타깃 선택에서 제외 |  
| T-01 | 조우 인트로/입력봉쇄 | `ForceApplyInputBlockToTarget(true)` + `StartBeginMiniGame` | 부분구현 | 강제 제스처 애니는 별도 연결 필요 |  
| T-02 | 5초 후 1인칭 | `IntroDuration`, `StartInputPhase -> ChangePOVToFirst` | 구현됨 |  |  
| T-03 | 카운트다운 표시 | `S_ShowMiniGameCountdownDisplay` | 부분구현 | 3/2/1 숫자 분리 표시는 BP/머터리얼 설계 필요 |  
| T-04 | 종료 시 제어권 복구 | `ForceApplyInputBlockToTarget(false)` + `EndMiniGame` | 구현됨 |  |  
| T-05 | 성공 5초 표정 | `HandleSuccess` + `ResultFaceDuration` | 구현됨 | 기본 5초 |  
| T-06 | 실패 5초 후 공격 | `HandleFailure(true)` + `ResolveMiniGameResult` | 구현됨 | Combat 진입 |  
| N-01 | 서버 판정 | Partygoer/State `Server_` 함수들 | 구현됨 | authoritative |  
| N-02 | 화면/표정 동기화 | `ReplicatedUsing`, `NetMulticast` | 구현됨 |  |  
| N-03 | 입력 RPC 파이프라인 | `UFirstPersonMiniGameComponent::Server_SubmitPartygoerMiniGameAnswer` | 구현됨 | 서버에서 상태 처리 |  
  
## 5) 명시적 갭/결정 필요 항목 (`X-*`)  
  
- `X-01` 조우 중 대상 플레이어 무적: 현재 Partygoer 본체 무적은 적용되나, 대상 플레이어 무적은 명시 구현 확인 필요.  
- `X-02` 조우 중 “다른 크리처가 파티고어/대상을 인식하지 않음”: 현재 코드에 직접 제어 지점이 없음.  
- `X-03` 감정표현 왜곡 연출(`M-08`): 튜닝값은 존재하나 머터리얼/UMG 반영 로직 없음.  
- `X-04` “조우 즉시 강제 춤(양손 흔들기 5초)”은 입력 봉쇄/시점 고정과 분리된 애니메이션 트리거 설계가 필요.  
- `X-05` TV의 “중앙 대형 3/2/1 숫자”가 현재 단일 `Countdown` 태그 텍스처 체계로 충분한지 아트 파이프라인 합의 필요.  
- `X-06` `PatrolPattern`은 현재 튜닝 데이터 소유. 런타임 변환 필요 시 Partygoer 멤버 캐시 도입 여부 결정 필요.  
  
## 6) 구현 우선순위(권장)  
  
1. `X-03` 왜곡 연출 구현 (`MiniGameDisplay` 파이프라인에 확률 적용).  
2. `X-01`, `X-02` 조우 중 무적/비인식 규칙의 서버 권한 처리 추가.  
3. `X-04`, `X-05` 강제 춤 및 카운트다운 시각화를 BP/UMG/머터리얼과 계약 확정.  
4. 필요 시 `X-06` 런타임 패트롤 타입 캐시를 `AStaticRoomCreaturePartygoer` 멤버에 명시화.  
  
## 7) 참고 파일  
  
- `Source/BackroomCompany/Public/StaticRoomModule/Creature/StaticRoomCreaturePartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomModule/Creature/StaticRoomCreaturePartygoer.cpp`  
- `Source/BackroomCompany/Public/StaticRoomCreatureState/StaticRoomCreatureStateIdlePartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomCreatureStates/StaticRoomCreatureStateIdlePartygoer.cpp`  
- `Source/BackroomCompany/Public/StaticRoomCreatureState/StaticRoomCreatureStateChasePartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomCreatureStates/StaticRoomCreatureStateChasePartygoer.cpp`  
- `Source/BackroomCompany/Public/StaticRoomCreatureState/StaticRoomCreatureStateMiniGamePartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomCreatureState/StaticRoomCreatureStateMiniGamePartygoer.cpp`  
- `Source/BackroomCompany/Public/StaticRoomCreatureState/StaticRoomCreatureStateCombatPartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomCreatureStates/StaticRoomCreatureStateCombatPartygoer.cpp`  
- `Source/BackroomCompany/Public/StaticRoomCreatureState/StaticRoomCreatureStateWaitPartygoer.h`  
- `Source/BackroomCompany/Private/StaticRoomCreatureState/StaticRoomCreatureStateWaitPartygoer.cpp`  
- `Source/BackroomCompany/Public/DataAsset/StaticRoomPartygoerTuningData.h`  
- `Source/BackroomCompany/Public/GestureComponent.h`  
- `Source/BackroomCompany/Public/FirstPersonMiniGameComponent.h`  
- `Source/BackroomCompany/Public/PlayerKeyboardInputManager.h`  
- `Source/BackroomCompany/Public/PlayerMouseInputManager.h`  
- `Source/BackroomCompany/Public/CrowdControlInfoContainer.h`
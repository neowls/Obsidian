---
type: unreal-learning
status: draft
migration_status: needs-content
updated: 2026-06-10
tags:
  - unreal
  - unreal/gas
  - type/learning
---

# 게임플레이 어빌리티(GA)

> [!summary] 요약
> 게임플레이 어빌리티(Gameplay Ability)는 입력이나 이벤트로 시작되어 비용, 쿨다운, 태그 조건을 검사한 뒤 게임플레이 행동을 실행하는 GAS의 행동 단위다.
> 스킬, 공격, 회피, 상호작용처럼 실행 흐름과 취소/종료 조건이 있는 기능을 만들 때 사용한다.
> 핵심은 ability class 자체보다 activation 조건, instancing policy, ability task, Commit/End 흐름을 함께 보는 것이다.

## 핵심 결론

- GA는 `CanActivateAbility()`와 tag/cost/cooldown 조건을 통과해야 실행된다.
- 실행 중 대기, montage, target data, delay 같은 비동기 흐름은 Ability Task로 분리하는 편이 안전하다.
- 문제가 생기면 ASC 초기화, spec 부여, NetExecutionPolicy, instancing policy, `EndAbility()` 호출 여부를 확인한다.

## 개요

게임플레이 어빌리티(Gameplay Ability)는 입력이나 이벤트로 시작되어 비용, 쿨다운, 태그 조건을 검사한 뒤 게임플레이 행동을 실행하는 GAS의 행동 단위다.

- 줄여서 GA(Gameplay Ability)로 불린다.
- ASC에 등록되어 발동시킬 수 있는 액션 명령이다.
	- 공격, 마법, 특수 공격 등
	- 간단한 액션 뿐만 아니라 상황에 따른 복잡한 액션도 수행이 가능하다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 어빌리티(GA)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

## 작동 모델

ASC는 상태와 실행 요청의 중심이고, GA는 행동의 절차, GE는 수치/상태 변화, Tag는 조건과 차단, AttributeSet은 계산 대상이다. Ability Task는 대기와 비동기 이벤트를 GA 바깥의 작은 실행 단위로 나누며, Gameplay Cue는 효과의 표현 계층으로 본다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| `AbilitySystemComponent` | 어빌리티, 이펙트, 태그, 예측 상태의 중심 | 초기화, owner/avatar, replication mode |
| `GameplayAbility` | 입력이나 이벤트로 시작되는 행동 절차 | activation 조건, commit, end/cancel |
| `GameplayEffect` | attribute, tag, modifier, duration 변화 | 적용 대상, stacking, duration policy |
| `GameplayTag` | 상태 표현, 차단, 요구 조건 | blocked/required tag와 loose tag |
| `AttributeSet` | 수치 상태와 변경 지점 | `PreAttributeChange`, `PostGameplayEffectExecute` |

## 실행 흐름

1. Actor가 ASC를 초기화하고 owner/avatar 정보를 맞춘다.
2. 서버가 ability spec을 부여하고 입력 또는 이벤트가 activation을 요청한다.
3. ASC가 tag, cost, cooldown, prediction 조건을 검사한다.
4. GA가 commit 후 GE, Ability Task, Gameplay Cue를 통해 실제 행동을 실행한다.
5. 종료 또는 취소 시 active task와 effect 상태를 정리하고 필요한 값만 복제(Replication)한다.

## GA 발동 과정
- ASC에 어빌리티를 등록 : ASC의 GiveAbility 함수에 발동할 GA의 타입을 전달한다.
	- 발동할 GA 타입 정보를 **게임플레이 어빌리티 스펙(GameplayAbilitySpec)** 이라고 한다.
- ASC에게 어빌리티를 발동하라고 명령 : ASC의 TryActivateAbility 함수에 발동할 GA의 타입을 전달
		- ASC에 등록된 타입이면 GA의 인스턴스가 생성된다.
- 발동된 GA에는 발동한 액터와 실행 정보가 기록된다.
		- SpecHandle : 발동된 어빌리티에 대한 핸들
		- ActorInfo : 어빌리티의 소유자와 아바타 정보
		- ActivationInfo : 발동 방식에 대한 정보

## GA의 주요 함수
- CanActivateAbility : 어빌리티가 발동될 수 있는지 파악
- ActivateAbility : 어빌리티가 발동될 때 호출
- CancelAbility : 어빌리티가 취소될 때 호출
- EndAbility : 스스로 어빌리티를 마무리 할 때 호출

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| GA 안에서 모든 타이밍과 상태를 직접 처리한다. | 대기, montage, target data, delay는 Ability Task로 분리한다. |
| 태그는 단순 분류용 문자열이다. | activation 조건, 차단, 상태 표현, cue 연결까지 포함한 제어 신호로 본다. |
| 클라이언트에서 보이면 서버 상태도 맞다. | 예측 결과와 서버 확정 결과를 구분하고 prediction key와 권한(Authority)을 확인한다. |

## 디버깅 체크리스트

- [ ] ASC가 올바른 owner/avatar로 초기화되었다.
- [ ] ability spec이 서버에서 부여되었고 입력 binding 또는 event tag가 연결되었다.
- [ ] required/blocked tag, cost, cooldown 조건이 activation을 막지 않는다.
- [ ] `CommitAbility()`와 `EndAbility()` 호출 경로가 누락되지 않았다.
- [ ] prediction key, replication mode, Gameplay Cue 실행 주체를 확인했다.

## 관련 문서

- [[게임플레이 어빌리티 스펙(Spec)]]
- [[게임플레이 어빌리티 시스템(GAS)]]
- [[게임플레이 어빌리티 타겟 액터(TA)]]
- [[게임플레이 어빌리티(GA)의 인스턴싱 옵션]]
- [[게임플레이 이펙트(GE)]]
- [[게임플레이 이펙트의 생성 과정]]

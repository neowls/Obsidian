---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/gas
  - type/learning
---

# 게임플레이 이펙트(GE)

> [!summary] 요약
> 게임플레이 이펙트(Gameplay Effect)는 Attribute, GameplayTag, GameplayCue, 지속 시간, 주기 실행을 통해 상태 변화를 표현하는 GAS의 데이터 단위다.
> 데미지, 힐, 버프, 디버프, 쿨다운, 비용처럼 수치나 상태를 적용할 때 사용한다.
> 핵심은 GE가 행동을 직접 실행하기보다 ASC에 적용되어 값과 태그 상태를 바꾸는 규칙이라는 점이다.

## 핵심 결론

- Instant, Duration, Infinite 타입에 따라 Attribute 반영과 active effect 유지 방식이 달라진다.
- Modifier, Granted Tag, Application Tag Requirement, Stacking 규칙을 함께 확인해야 결과를 예측할 수 있다.
- 효과가 적용되지 않으면 target ASC, tag requirement, immunity/block 조건, prediction/replication 상태를 먼저 확인한다.

## 개요

게임플레이 이펙트(Gameplay Effect)는 Attribute, GameplayTag, GameplayCue, 지속 시간, 주기 실행을 통해 상태 변화를 표현하는 GAS의 데이터 단위다.

- 줄여서 GE(Gameplay Effect)로 불린다.
- GAS는 게임에 영향을 주는 객체를 별도로 분리해서 관리한다.
- 게임에 영향을 준다는 것은 대부분 게임 데이터를 변경한다는 것을 의미한다.
- 따라서 대부분 게임플레이 이펙트와 ==어트리뷰트==는 함께 동작하도록 구성되어 있다.
- GAS 시스템에서 가장 많은 기능을 제공하는 클래스이다.
- 아래 세 가지 타입 중 하나를 선택할 수 있다.
	- Instant : 어트리뷰트에 즉각적으로 적용되는 게임플레이 이펙트. 한 프레임에 실행된다.
	- Duration : 지정한 시간 동안 동작하는 게임플레이 이펙트.
	- Infinite : 명시적으로 종료하지 않으면 계속 동작하는 게임플레이 이펙트.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 이펙트(GE)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 게임플레이 이펙트 모디파이어(Modifier)
- GE에서 어트리뷰트의 변경 방법을 지정한 설정을 모디파이어라고 한다.
- 모디파이어의 사용 방법
	- 적용할 어트리뷰트의 지정
	- 적용 방식의 설정 : 더하기, 곱하기, 나누기, 덮어쓰기
- 모디파이어의 계산 방법
	- ScalableFloat : 실수 (데이터 테이블과 연동 가능)
	- AttributeBased : 특정 어트리뷰트에 기반
	- CustomCalculationClass : 계산을 담당하는 전용 클래스의 활용
	- SetByCaller : 데이터 태그를 활용한 데이터 전달
- 모디파이어 없이 자체 계산 로직을 만드는 것도 가능하다.(GameplayEffectExecutionCalculation)

## ==C++로 설정하기에는 문법이 복잡하기 때문에, 블루프린트로 제작하는 것을 권장한다.==

``` C++
UProjectGE_AttackDamage::UProjectGE_AttackDamage()
{
	DurationPolicy = EGameplayEffectDurationType::Instant // 적용 기간 설정

	FGameplayModifierInfo HealthModifier;
	HealthModifier.Attribute = FGameplayAttribute(FindFieldChecked<FPropery>(UCharacterAttributeSet::StaticClass(), GET_MEMBER_NAME_CHECKED(UCharacterAttributeSet, Health))); // friend class 지정 필요
	HealthModifier.ModifierOp = EGameplayModOp::Additive // 계산 방법 설정

	FScalableFloat DamageAmount(-30.0f) // 값 지정
	FGameplayEffectModifierMagnitude ModMagnitude(DamageAmount); // 적용될 실제 값

	HealthModifier.ModifierMagnitude = ModMagnitude; // 실제값 반영
	Modifier.Add(HealthModifier);

}

```

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
- [[게임플레이 어빌리티(GA)]]
- [[게임플레이 어빌리티(GA)의 인스턴싱 옵션]]
- [[게임플레이 이펙트의 생성 과정]]

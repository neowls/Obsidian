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

# 어트리뷰트 세트(Attribute Set)

> [!summary] 요약
> 어트리뷰트 세트(Attribute Set)는 체력, 마나, 공격력 같은 Gameplay Attribute를 모아 ASC에 연결하는 데이터 컨테이너다.
> 캐릭터 수치가 GE에 의해 바뀌고 네트워크로 동기화되어야 할 때 사용한다.
> 핵심은 Attribute 값 변경 자체보다 clamp, replication, pre/post callback에서 게임 규칙을 적용하는 위치를 이해하는 것이다.

## 핵심 결론

- AttributeSet은 ASC가 소유하며 GE modifier와 execution calculation의 대상이 된다.
- BaseValue와 CurrentValue, Instant/Duration effect 반영 방식을 구분해야 수치 변화를 해석할 수 있다.
- 값이 이상하면 RepNotify, `PreAttributeChange`, `PostGameplayEffectExecute`, clamp 규칙, Meta Attribute 처리를 확인한다.

## 개요

어트리뷰트 세트(Attribute Set)는 체력, 마나, 공격력 같은 Gameplay Attribute를 모아 ASC에 연결하는 데이터 컨테이너다.

- 단일 어트리뷰트 데이터 묶음
- GameplayAttributeData 는 하나의 값이 아닌 두 가지 값으로 구성되어 있다.
	- BaseValue : 기본 값. 영구히 적용되는 고정 스탯 값을 관리하는데 사용된다.
	- CurrentValue : 변동 값. 버프(Buff) 등으로 임시적으로 변동된 값을 관리하는데 사용된다. (BaseValue + GE에 의한 값)
- 어트리뷰트 세트 접근자 매크로
	- 많이 수행되는 기능에 대해 매크로를 만들어 제공한다.
- ASC는 초기화 될 때 같은 액터에 있는 UAttributeSet 타입 객체를 찾아서 등록한다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 어트리뷰트 세트(Attribute Set)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 어트리뷰트 세트의 주요 함수
- PreAttributeChange : 어트리뷰트 변경 전에 호출
- PostAttributeChange : 어트리뷰트 변경 후에 호출
- PreGameplayEffectExecute : 게임플레이 이펙트(Gameplay Effect) 적용 전에 호출
- PostGameplayEffectExecute : 게임플레이 이펙트 적용 후에 호출

## 어트리뷰트
FGameplayAttributeData 구조체로 정의된 float 값
일반적으로 [[게임플레이 이펙트(GE)]]에 의해서만 수정되어야 ASC가 변경사항을 예측할 수 있다.

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
- [[게임플레이 이펙트(GE)]]

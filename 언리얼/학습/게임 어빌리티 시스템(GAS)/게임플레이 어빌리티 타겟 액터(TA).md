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

# 게임플레이 어빌리티(Gameplay Ability) 타겟 액터(TA)

> [!summary] 요약
> 게임플레이 어빌리티 타겟 액터(Target Actor)는 ability가 적용할 대상 위치나 actor 집합을 수집하고 TargetData로 넘기는 보조 객체다.
> 조준, 범위 선택, 마우스 위치 선택, 서버 검증이 필요한 ability에서 사용한다.
> 핵심은 대상 선택 UI/트레이스(Trace)와 실제 ability 적용을 분리하고, 최종 결과를 TargetData로 ASC에 전달하는 것이다.

## 핵심 결론

- Target Actor는 대상 수집을 담당하고, ability는 TargetData를 받아 비용/쿨다운/효과 적용을 이어간다.
- 클라이언트 예측 조준을 쓰더라도 서버에서 TargetData 검증 경로를 고려해야 한다.
- 대상이 비정상적이면 trace channel, collision, confirm/cancel 입력, replication/prediction 흐름을 먼저 확인한다.

## 개요

게임플레이 어빌리티 타겟 액터(Target Actor)는 ability가 적용할 대상 위치나 actor 집합을 수집하고 TargetData로 넘기는 보조 객체다.

- 줄여서 TA라고 한다.
- 게임플레이 어빌리티에서 대상에 대한 판정(주로 물리 판정)을 구현할 때 사용하는 특수한 액터
- AGameplayAbilityTargetActor 클래스를 상속받아서 구현한다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 어빌리티 타겟 액터(TA)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 왜 타겟 액터(TA)가 필요한가?
- 타겟을 설정하는 다양한 방법이 있다.
- Trace를 사용해 즉각적으로 타겟을 검출하는 방법
- 사용자의 최종 확인을 한번 더 거치는 방법
- 공격 범위 확인을 위한 추가 시각화 (시각화를 수행하는 액터를 월드레티클(WorldReticle)이라고 한다.)

## 주요 함수
- StartTargeting : 타겟팅을 시작
- ConfirmTargetingAndContinue : 타겟팅을 확정하고 이후 남은 프로세스를 진행
- ConfirmTargeting : 태스크(Task) 진행 없이 타겟팅만 확정
- CancelTargeting : 타겟팅을 취소

## 게임플레이 어빌리티 타겟 데이터(Target Data)
- 타겟 액터에서 판정한 결과를 담은 데이터
- 다음의 속성을 가지고 있다.
	- Trace Hit 결과 (HitResult)
	- 판정된 다수의 액터 포인터
	- 시작 지점
	- 끝 지점
- 타겟 데이터를 여러 개 묶어 전송하는 것이 일반적인데 이를 **타겟 데이터 핸들**이라고 한다.

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
- [[게임플레이 어빌리티(GA)]]
- [[게임플레이 어빌리티(GA)의 인스턴싱 옵션]]
- [[게임플레이 이펙트(GE)]]
- [[게임플레이 이펙트의 생성 과정]]

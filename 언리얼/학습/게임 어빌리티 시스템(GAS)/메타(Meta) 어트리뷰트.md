---
type: unreal-learning
status: review
migration_status: merge-candidate
updated: 2026-06-10
tags:
  - unreal
  - unreal/gas
  - type/learning
---

# 메타(Meta) 어트리뷰트

> [!summary] 요약
> 메타 어트리뷰트는 Damage처럼 최종 Attribute에 바로 저장하지 않고 계산/전달 중간값으로 쓰는 임시 Attribute다.
> 데미지 계산, 방어력 적용, 실드/체력 분배처럼 후처리가 필요한 수치를 전달할 때 사용한다.
> 핵심은 Meta Attribute를 영구 상태로 보지 않고 `PostGameplayEffectExecute` 같은 처리 지점에서 실제 Attribute로 반영하는 것이다.

## 핵심 결론

- Meta Attribute는 보통 복제(Replication)하거나 장기 저장하는 값이 아니라 실행 계산의 전달 매개체다.
- Damage를 Health에 바로 빼지 않고 중간값으로 받으면 방어/실드/무적 처리를 한곳에 모을 수 있다.
- 값이 누적되거나 남아 보이면 처리 후 초기화, execution calculation, AttributeSet 콜백 흐름을 확인한다.

## 개요

메타 어트리뷰트는 Damage처럼 최종 Attribute에 바로 저장하지 않고 계산/전달 중간값으로 쓰는 임시 Attribute다.

- 어트리뷰트의 설정을 위해 사전에 미리 설정하는 임시 어트리뷰트
- 예) 체력을 바로 깎지 않고, 대미지를 통해 체력을 감소하도록 설정한다.
	- 체력은 일반 어트리뷰트, 대미지는 메타 어트리뷰트
- 대미지를 사용하는 경우 기획 추가에 유연한 대처가 가능하다.
	- 무적 기능의 추가 (대미지를 0으로 처리)
	- 실드 기능의 추가 (실드 값을 토대로 실드 값만큼 대미지를 처리)
	- 콤보 진행시 공격력 보정 기능 추가(콤보 증가시 대미지를 보정하도록 구현)
- 메타 어트리뷰트는 적용 후 바로 0으로 값을 초기화하도록 설정한다.
- 메타 어트리뷰트는 리플리케이션(Replication)에서 제외시키는 것이 일반적이다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 메타(Meta) 어트리뷰트을 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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
5. 종료 또는 취소 시 active task와 effect 상태를 정리하고 필요한 값만 복제한다.

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

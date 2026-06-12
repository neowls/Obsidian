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

# 어빌리티 태스크(AT)의 제작 규칙

> [!summary] 요약
> 어빌리티 태스크(Ability Task) 제작 규칙은 custom Ability Task를 만들 때 factory 함수, activation, delegate, 종료 처리를 어떻게 구성할지 정리한 기준이다.
> 기본 task로 표현하기 어려운 대기 조건, 입력, target data, 외부 이벤트 흐름을 ability에 붙일 때 사용한다.
> 핵심은 task가 ability의 비동기 보조 객체라는 수명 규칙을 지키고, 완료/취소 경로를 명확히 만드는 것이다.

## 핵심 결론

- task 생성은 보통 static factory 함수로 하고, 실제 시작 로직은 `Activate()`에 둔다.
- Blueprint delegate는 성공/실패/취소처럼 호출 조건이 분명해야 ability 그래프가 꼬이지 않는다.
- 메모리나 콜백 문제가 보이면 task 소유 ability, delegate unbind, `EndTask()`, prediction 지원 여부를 확인한다.

## 개요

어빌리티 태스크(Task) 제작 규칙은 custom Ability Task를 만들 때 factory 함수, activation, delegate, 종료 처리를 어떻게 구성할지 정리한 기준이다.

- AT는 UAbilityTask 클래스를 상속받아 제작한다.
- AT 인스턴스를 생성해 반환하는 static 함수를 선언해 구현한다.
- AT가 종료되면 GA에 알려줄 델리게이트를 선언한다.
- 시작과 종료 처리를 위해 Activate 와 OnDestroy 함수를 재정의(override)해 구현한다.
- 일정 시간이 지난 후 AT를 종료하고자 한다면, 활성화시 SetWaitingOnAvatar 함수를 호출해 Waiting 상태로 설정한다.
- 만일 Tick을 활성화하고 싶다면 bTickingTask 값을 true로 설정한다.
- AT가 종료되면 델리게이트를 브로드캐스팅한다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 어빌리티 태스크(AT)의 제작 규칙을 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

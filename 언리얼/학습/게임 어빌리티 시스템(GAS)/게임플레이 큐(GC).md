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

# 게임플레이 큐(GC)

> [!summary] 요약
> 게임플레이 큐(Gameplay Cue)는 GameplayTag 기반으로 이펙트, 사운드, 카메라 흔들림 같은 시각/청각 반응을 실행하는 GAS 연출 계층이다.
> 데미지 숫자, 피격 이펙트, 버프 시작/종료 연출처럼 상태 변화에 따른 표현을 분리할 때 사용한다.
> 핵심은 게임플레이 판정은 GE/GA가 담당하고, GC는 그 결과를 표시하는 반응 계층이라는 점이다.

## 핵심 결론

- GameplayCue는 tag 이름 규칙과 cue notify 등록이 맞아야 실행된다.
- Instant/Duration/Looping 성격에 따라 `Execute`, `Add`, `Remove` 흐름을 구분한다.
- 연출이 안 보이면 cue tag, GameplayCueManager 로딩, target actor, replication/prediction 경로를 확인한다.

## 개요

게임플레이 큐(Gameplay Cue)는 GameplayTag 기반으로 이펙트, 사운드, 카메라 흔들림 같은 시각/청각 반응을 실행하는 GAS 연출 계층이다.

- 줄여서 GC라고 부른다.
- 시각 이펙트나 사운드와 같은 게임 로직과 무관한 시각적, 청각적 기능을 담당한다.
- 데디케이티드 서버에서는 사용할 필요가 없다.
- 두 종류의 게임플레이 큐가 있다.
	- 스태틱 게임플레이 큐 : 일시적으로 발생하는 특수효과. Execute 이벤트 발동
	- 액터 게임플레이 큐 : 일정 기간동안 발생하는 특수효과. Add/Remove 이벤트 발동
- C++로도 구현할 수 있지만, 블루프린트로 제작하는 것이 더 생산적이다.
- 게임플레이 이펙트(Gameplay Effect)에서 자동으로 GC와 연동할 수 있도록 기능을 제공하고 있다.
- 게임플레이 큐의 재생은 GameplayCueManager가 관리한다.( 다른 시스템과 분리된 구조)
- 게임플레이 태그(Gameplay Tag)를 사용해 쉽게 발동시킬 수 있다.
	- **이 떄 반드시 GameplayCue로 시작하는 게임플레이 태그를 사용해야 한다.**

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 큐(GC)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

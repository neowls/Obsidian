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

# 어빌리티 태스크(AT)

> [!summary] 요약
> 어빌리티 태스크(Ability Task)는 GA 실행 중 montage, delay, target data, event 대기처럼 비동기 흐름을 노드/객체로 분리하는 GAS 도구다.
> ability 안에서 시간이 걸리는 작업을 기다리거나 이벤트 결과를 받아 다음 단계로 넘길 때 사용한다.
> 핵심은 ability 본문을 블로킹하지 않고 task가 delegate를 통해 완료/취소/이벤트를 ability로 돌려준다는 점이다.

## 핵심 결론

- Ability Task는 owning ability의 수명에 묶이므로 ability 종료 시 task 정리도 함께 고려해야 한다.
- 네트워크 예측이 필요한 task는 prediction window와 server confirm/cancel 흐름을 확인해야 한다.
- task가 콜백을 주지 않으면 activation, delegate binding, external cancel, `EndTask()`/`EndAbility()` 호출 순서를 본다.

## 개요

어빌리티 태스크(Ability Task)는 GA 실행 중 montage, delay, target data, event 대기처럼 비동기 흐름을 노드/객체로 분리하는 GAS 도구다.

어빌리티 태스크(Task)는 줄여서 AT라고 한다.
- 게임플레이 어빌리티(GA)의 실행(Activation)은 한 프레임에서 이루어진다.
- 게임플레이 어빌리티(GA)가 시작되면 EndAbility 함수가 호출되기 까지는 끝나지 않는다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 어빌리티 태스크(AT)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 애니메이션 재생 같이 시간이 소요되고 상태를 관리해야 하는 어빌리티의 구현 방법
- 비동기적으로 작업을 수행하고 끝나면 결과를 통보받는 형태로 구현한다.
- 이를 위해 GAS는 **어빌리티 태스크(AT)**를 제공하고 있다.

## 어빌리티 태스크(AT)의 활용 패턴
1. 어빌리티 태스크에 작업이 끝나면 브로드캐스팅 되는 종료 델리게이트를 선언한다.
2. GA는 AT를 생성한 후 바로 종료 델리게이트를 구독한다.
3. GA의 구독 설정이 완료되면 AT를 구동한다. - ReadyForActivation 함수를 호출
4. AT의 작업이 끝나면 델리게이트를 구독한 GA의 콜백 함수가 호출된다.
5. GA의 콜백함수가 호출되면 GA의 EndAbility 함수를 호출해 GA를 종료한다.

## GA는 필요에 따라 다수의 AT를 사용해 복잡한 액션 로직을 설계할 수 있다.
 [[어빌리티 태스크(AT)의 제작 규칙]]

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

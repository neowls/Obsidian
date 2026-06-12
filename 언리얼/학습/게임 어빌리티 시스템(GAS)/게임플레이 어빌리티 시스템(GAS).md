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

# 게임플레이 어빌리티(Gameplay Ability) 시스템(GAS)

> [!summary] 요약
> 게임플레이 어빌리티 시스템(GAS)은 능력, 속성, 효과, 태그, 큐를 ASC 중심으로 묶어 전투/스킬 로직을 구성하는 프레임워크다.
> 캐릭터 능력, 버프/디버프, 쿨다운, 비용, 예측 실행이 필요한 게임플레이 시스템에 사용한다.
> 핵심은 입력에서 ability 실행, GameplayEffect 적용, Attribute/Tag/Cue 변화가 ASC를 통해 연결된다는 점이다.

## 핵심 결론

- GAS의 중심 객체는 ASC이며 ability, effect, attribute, tag 상태를 관리하고 복제(Replication)한다.
- GA는 행동, GE는 수치/상태 변화, AttributeSet은 값 저장, GameplayTag는 조건과 상태 표현을 담당한다.
- 문제가 생기면 ASC 초기화, owner/avatar actor, ability 부여, cost/cooldown, replication mode를 분리해 확인한다.

## 개요
- 액터가 소유하고 발동할 수 있는 어빌리티 및 액터간의 인터랙션 기능을 제공하는 프레임워크
- RPG, 액션 어드벤처, MOBA 장르의 제작을 쉽게하기 위한 도구이며 대부분의 게임제작에 활용 가능하다.

- 장점
	- 유연성과 확장성 : 다양하고 복잡한 게임 제작에 대응할 수 있도록 범용적으로 설계됨.
	- 모듈(Module)러 시스템 : 각 기능에 대한 의존성이 최소화되도록 설계됨.
	- 네트워크 지원 : 네트워크 멀티플레이어 게임에서도 활용가능하도록 설계됨.
	- 데이터 기반 설계 : 데이터를 기반으로 동작하도록 설계됨.
	- 완성도 : 포트나이트 게임 서비스(Service)를 통해서 실효성이 검증됨.
- 단점
	- 배우는 학습 비용 : 구성 요소가 많아서 학습하는 비용이 꽤 큼.
	- 오버헤드 : 작은 규모의 프로젝트에는 복잡한 구조가 오히려 부담될 수 있음.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 어빌리티 시스템(GAS)을 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 핵심 구성 요소
- 어빌리티 시스템 컴포넌트(ASC)
	- [[어빌리티 시스템 컴포넌트(ASC)]]
- 게임플레이 태그(Tag)
	- [[게임플레이 태그(Tag)]]
	- 게임플레이 태그(Gameplay Tag) 컨테이너
- 게임플레이 어빌리티(GA)
	- [[게임플레이 어빌리티(GA)]]
	- [[게임플레이 어빌리티 스펙(Spec)]]
	- [[어빌리티 태스크(AT)]]
	- 게임플레이 이벤트
- 게임플레이 이펙트(GE)
	- [[게임플레이 이펙트(GE)]]
	- 이펙트 실행 계산
	- 장식 이펙트 게임플레이 큐(Gameplay Cue)
- 어트리뷰트(Attribute)
	- 게임플레이 어트리뷰트 데이터
	- [[어트리뷰트 세트(Attribute Set)]]

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
- [[게임플레이 어빌리티 타겟 액터(TA)]]
- [[게임플레이 어빌리티(GA)]]
- [[게임플레이 어빌리티(GA)의 인스턴싱 옵션]]
- [[게임플레이 이펙트(GE)]]
- [[게임플레이 이펙트의 생성 과정]]

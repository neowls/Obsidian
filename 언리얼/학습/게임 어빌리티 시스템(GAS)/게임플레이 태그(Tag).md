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

# 게임플레이 태그(Tag)

> [!summary] 요약
> 게임플레이 태그(Gameplay Tag)는 계층형 이름으로 게임플레이 상태, 조건, 분류를 표현하는 Unreal의 태그 시스템이다.
> ability 차단, 상태 부여, 입력 분류, effect 조건, cue 실행처럼 여러 시스템이 같은 상태 언어를 공유해야 할 때 사용한다.
> 핵심은 문자열 비교가 아니라 중앙 등록된 계층형 태그로 조건과 상태를 안정적으로 표현하는 것이다.

## 핵심 결론

- 태그는 `State.Stunned`, `Ability.Attack`처럼 계층을 설계해야 검색과 조건 구성이 쉬워진다.
- GAS에서는 activation block/require/cancel, GE granted tag, GameplayCue tag에 직접 연결된다.
- 태그 조건이 이상하면 실제 ASC에 붙은 owned tag, blocked tag, required tag, loose tag를 구분해 확인한다.

## 개요

게임플레이 태그(Gameplay Tag)는 계층형 이름으로 게임플레이 상태, 조건, 분류를 표현하는 Unreal의 태그 시스템이다.

- FName으로 관리되는 경량의 표식 데이터
	- 액터나 컴포넌트에 지정했던 태그와 다른 데이터
- 프로젝트 설정에서 별도로 게임플레이 태그를 생성하고 관리할 수 있다.
	- 결과는 DefaultGameplayTags.ini 파일에 저장된다.
- 계층 구조로 구성되어 있어 체계적인 관리가 가능하다.
	- Actor.Action.Rotate : 행동에 대한 태그
	- Actor.State.IsRotating : 상태에 대한 태그
- 게임플레이 태그들의 저장소 - GameplayTagContainer
	- 계층 구조를 지원하는 검색 기능 제공
	- HasTagExact : 컨테이너에 A.1 태그가 있는 상황에서 A로 찾으면 false
	- HasAny : 컨테이너에 A.1 태그가 있는 상황에서 A와 B로 찾으면 true
	- HasAnyExact : 컨테이너에 A.1 태그가 있는 상황에서 A와 B로 찾으면 false
	- HasAll : 컨테이너에 A.1 태그와 B.1 태그가 있는 상황에서 A와 B로 찾으면 true
	- HasAllExact : 컨테이너에 A.1 태그와 B.1 태그가 있는 상황에서 A와 B로 찾으면 false
- 게임플레이 어빌리티(Gameplay Ability) 시스템과 독립적으로 사용 가능하다.

- 게임플레이 어빌리티에 부착한 태그
	- 어빌리티에 지정한 태그(AbilityTags 태그 컨테이너)
- 게임플레이 어빌리티에 대해 다양한 실행 조건의 설정
	- 태그로 어빌리티 취소(CancelAbilitiesWithTag) - 여기에 등록한 태그들을 AbilityTags로 가진 어빌리티들을 취소한다.
	- 태그로 어빌리티 차단(BlockAbilitiesWithTag)
	- 어빌리티 실행시 태그 설정(ActivationOwnedTags)
	- 태그가 있어야만 어빌리티 실행(ActivationRequiredTags)
	- 태그가 있으면 어빌리티 실행 차단(ActivationBlockedTags)
	- 시전자가 태그가 있어야 어빌리티 실행(SourceRequiredTags)
	- 시전자에 태그가 있으면 어빌리티 차단(SourceBlockedTags)
	- 시전 대상에 태그가 있어야 어빌리티 실행(TargetRequiredTags)
	- 시전 대상에 태그가 있으면 어빌리티 차단(TargetBlockedTags)

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 게임플레이 태그(Tag)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

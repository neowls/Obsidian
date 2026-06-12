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

# 어빌리티 시스템 컴포넌트(ASC)

> [!summary] 요약
> 어빌리티 시스템 컴포넌트(ASC)는 GAS의 중심 컴포넌트로 ability, effect, attribute, tag, prediction, replication 상태를 관리한다.
> GAS를 쓰는 actor가 능력을 부여받고 효과를 적용받으며 네트워크에서 상태를 동기화할 때 반드시 확인한다.
> 핵심은 ASC의 OwnerActor, AvatarActor, ActorInfo 초기화가 맞아야 ability 활성화와 복제(Replication)가 정상 동작한다는 점이다.

## 핵심 결론

- ASC는 ability spec, active gameplay effect, owned tag, attribute set을 연결하는 런타임 허브다.
- PlayerState에 둘지 Character에 둘지에 따라 respawn, persistence, NetUpdateFrequency 문제가 달라진다.
- 문제가 생기면 `InitAbilityActorInfo()`, owner/avatar actor, replication mode, input binding, prediction key를 순서대로 확인한다.

## 참고 자료

[AbilitySystemComponent | Unreal Python 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/AbilitySystemComponent.html?application_version=5.7) | [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/using-gameplay-abilities-in-unreal-engine)

## 개요
`ASC(Ability System Component)`는 Gameplay Ability System의 중심 컴포넌트다.
어빌리티 부여/활성화, GameplayEffect 적용, GameplayTag 집계, AttributeSet 접근, prediction/replication의 많은 진입점이 ASC를 통과한다.

## 왜 필요한가

GAS 문제는 단일 클래스 하나보다 여러 객체의 책임 경계가 어긋날 때 발생한다. 어빌리티 시스템 컴포넌트(ASC)를 볼 때는 "누가 상태를 소유하는가", "어느 시점에 서버와 클라이언트가 합의하는가", "실패했을 때 어디서 되돌아가는가"를 먼저 분리해야 한다.

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

## 핵심 책임
| 책임 | 대표 개념 |
| --- | --- |
| 어빌리티 보관 | `FGameplayAbilitySpecContainer`, `FGameplayAbilitySpec` |
| 어빌리티 활성화 | `TryActivateAbility`, `ActivateAbility`, input binding |
| 이펙트 적용 | `ApplyGameplayEffectSpecToSelf/Target`, active gameplay effect |
| 어트리뷰트 관리 | `UAttributeSet`, `FGameplayAttributeData` |
| 태그 관리 | owned tag, blocked tag, loose gameplay tag |
| 네트워크 | replication mode, prediction key, minimal gameplay cue |
| 디버깅 | gameplay debugger, ability system log |

## Owner Actor와 Avatar Actor
ASC를 이해할 때 가장 중요한 구분은 owner와 avatar다.

| 용어 | 의미 | 예시 |
| --- | --- | --- |
| Owner Actor | ASC를 소유하고 영속 상태를 들고 있는 actor | `PlayerState` |
| Avatar Actor | 실제 월드에서 ability를 수행하는 actor | `Character` |
| Instigator | 효과를 일으킨 주체 | 공격자 |
| Target | 효과를 받는 대상 | 피격자 |

PlayerState에 ASC를 두면 respawn 이후에도 attribute와 ability 상태를 유지하기 쉽다.
Character에 ASC를 두면 접근은 단순하지만 사망/교체/재생성 때 상태 이전을 직접 고려해야 한다.

## 어빌리티 보관과 복제
ASC는 부여된 ability를 `FGameplayAbilitySpecContainer`에 보관한다.
`FGameplayAbilitySpec`은 `FFastArraySerializerItem`이고, container는 `FFastArraySerializer` 기반이다.
따라서 ability grant/remove/change는 일반 replicated property보다 Fast Array delta 복제 관점으로 보는 것이 맞다.

## 활성화 흐름
1. 서버가 `GiveAbility()`로 ability spec을 부여한다.
2. 클라이언트 입력 또는 gameplay code가 activation을 요청한다.
3. ASC가 tag requirement, cooldown, cost, blocking 상태를 검사한다.
4. prediction이 가능한 ability면 prediction key 범위 안에서 클라이언트가 선실행할 수 있다.
5. 서버가 결과를 확정하고 필요한 GameplayEffect/GameplayCue/replicated state를 전파한다.

## Replication Mode
| 모드 | 감각 |
| --- | --- |
| `Full` | active gameplay effect를 자세히 복제 |
| `Mixed` | owner에게 자세히, simulated proxy에는 제한적으로 |
| `Minimal` | 최소 정보만 복제 |

멀티플레이 액션 게임에서는 owner가 보는 UI/입력 반응과 다른 클라이언트가 보는 연출 정보를 분리해야 한다.

> [!caution]
> ASC가 있다고 해서 클라이언트가 마음대로 GameplayEffect를 적용할 수 있는 것은 아니다. 상태 확정은 여전히 서버 권한(Authority)을 기준으로 설계해야 한다.

## 디버깅 체크리스트
- ASC가 owner/avatar 중 어디에 붙어 있는지 확인한다.
- `InitAbilityActorInfo()`가 possession/respawn 시점에 다시 호출되는지 확인한다.
- attribute replication과 ability spec replication을 분리해서 본다.
- GameplayTag가 loose tag인지 GameplayEffect tag인지 확인한다.
- input pressed/released가 spec handle과 맞게 들어오는지 본다.
- prediction 실패와 서버 거부를 구분한다.

## 엔진 소스 참고 포인트
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\AbilitySystemComponent.h`: ASC 본체.
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Private\AbilitySystemComponent_Abilities.cpp`: ability grant/activation 흐름.
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\GameplayAbilitySpec.h`: ability spec과 fast array container.
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\Abilities\GameplayAbility.h`: ability lifecycle.
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\GameplayEffect.h`: GameplayEffect spec/application 데이터.
- `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Public\GameplayPrediction.h`: prediction key와 prediction window.

## 2026-05-12 심화 보강: 실제 ASC 구성과 활성화 원리

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 학습 목표
ASC는 GAS의 “중앙 처리 장치”라는 말만으로는 부족하다.
아래를 설명할 수 있어야 실제로 쓸 수 있다.

- 왜 `OwnerActor`와 `AvatarActor`를 나누는지
- `GiveAbility()`가 단순 배열 추가가 아니라 replicated spec 추가인 이유
- `TryActivateAbility()`가 클라이언트, 서버, prediction을 어떻게 나누는지
- GameplayEffect 적용과 GameplayCue/Attribute/Tag 변화가 어떻게 연결되는지

## 사용법 1: Character에 ASC를 두는 가장 단순한 구조
초기 학습은 Character에 ASC와 AttributeSet을 직접 두는 것이 쉽다.

```cpp
AMyCharacter::AMyCharacter()
{
    AbilitySystemComponent = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("ASC"));
    AbilitySystemComponent->SetIsReplicated(true);

    AttributeSet = CreateDefaultSubobject<UMyAttributeSet>(TEXT("AttributeSet"));
}

UAbilitySystemComponent* AMyCharacter::GetAbilitySystemComponent() const
{
    return AbilitySystemComponent;
}

void AMyCharacter::BeginPlay()
{
    Super::BeginPlay();
    AbilitySystemComponent->InitAbilityActorInfo(this, this);
}
```

이 구조는 이해하기 쉽지만 respawn이나 possessed pawn 교체가 들어가면 ASC 상태가 같이 사라질 수 있다.

## 사용법 2: PlayerState에 ASC를 두는 구조
멀티플레이 플레이어 캐릭터에서는 PlayerState가 owner, Character가 avatar인 구성이 자주 쓰인다.

```cpp
void AMyCharacter::PossessedBy(AController* NewController)
{
    Super::PossessedBy(NewController);

    AMyPlayerState* PS = GetPlayerState<AMyPlayerState>();
    if (PS && PS->GetAbilitySystemComponent())
    {
        ASC = PS->GetAbilitySystemComponent();
        ASC->InitAbilityActorInfo(PS, this);
    }
}

void AMyCharacter::OnRep_PlayerState()
{
    Super::OnRep_PlayerState();

    AMyPlayerState* PS = GetPlayerState<AMyPlayerState>();
    if (PS && PS->GetAbilitySystemComponent())
    {
        ASC = PS->GetAbilitySystemComponent();
        ASC->InitAbilityActorInfo(PS, this);
    }
}
```

서버는 `PossessedBy()`에서, 클라이언트는 `OnRep_PlayerState()`에서 actor info를 초기화하는 패턴이 중요하다.
초기화가 빠지면 ability는 있는데 avatar가 없어 montage, task, targeting이 실패할 수 있다.

## 사용법 3: 서버에서 어빌리티 부여하기
```cpp
void AMyPlayerState::GiveStartupAbilities()
{
    if (!HasAuthority() || !ASC)
    {
        return;
    }

    for (TSubclassOf<UGameplayAbility> AbilityClass : StartupAbilities)
    {
        ASC->GiveAbility(FGameplayAbilitySpec(AbilityClass, 1, INDEX_NONE));
    }
}
```

어빌리티 부여는 서버 권한에서 수행하는 것이 기본이다.
부여된 ability spec은 `FGameplayAbilitySpecContainer`를 통해 복제된다.
클라이언트에서 spec이 추가되면 `FGameplayAbilitySpec::PostReplicatedAdd()` 경로를 통해 ASC의 `OnGiveAbility()`가 호출될 수 있다.

## 활성화 원리
`TryActivateAbility()`의 실제 흐름은 단순히 `ActivateAbility()` 호출이 아니다.

1. spec handle로 `FGameplayAbilitySpec`을 찾는다.
2. 로컬에서 실행 가능한지, 원격 활성화가 필요한지 판단한다.
3. 필요하면 `CallServerTryActivateAbility()`로 서버 RPC를 보낸다.
4. `InternalTryActivateAbility()`가 tag requirement, cooldown, cost, net execution policy를 검사한다.
5. instancing policy에 맞춰 ability instance를 준비한다.
6. prediction이 필요한 경우 prediction key 범위 안에서 실행한다.
7. `ActivateAbility()`가 호출되고, ability task와 gameplay effect가 이어진다.

즉 activation 실패는 여러 원인으로 나뉜다.
handle이 틀린 경우, tag 조건이 막은 경우, cooldown/cost가 실패한 경우, 네트워크 실행 정책이 맞지 않는 경우를 따로 봐야 한다.

## GameplayEffect 적용 원리
`ApplyGameplayEffectSpecToSelf()`는 effect spec을 active gameplay effect container에 넣고, modifier/attribute/tag/gameplay cue 처리를 이어간다.
instant effect는 즉시 attribute base value를 바꿀 수 있고, duration/infinite effect는 active 상태로 남아 current value와 tag에 영향을 준다.

prediction 문맥에서는 predictive instant GE를 infinite duration처럼 다루는 특수한 설명이 `GameplayPrediction.h`에 남아 있다.
이 말은 클라이언트가 먼저 보여준 결과를 서버 확정 결과와 나중에 맞춰야 한다는 뜻이다.

## 실패 사례와 원인

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## ability가 부여됐는데 발동이 안 된다
- `InitAbilityActorInfo()`가 호출되지 않았다.
- input id 또는 enhanced input binding이 spec과 연결되지 않았다.
- `ActivationBlockedTags` 또는 cooldown tag가 남아 있다.
- `CanActivateAbility()`가 cost/cooldown 실패 tag를 반환한다.

## 서버에서는 되는데 클라이언트에서 안 된다
- owner connection이 없는 actor에서 Server RPC를 시도했다.
- ASC가 PlayerState에 있는데 Character에서 잘못된 ASC를 참조하고 있다.
- ability의 `NetExecutionPolicy`와 호출 위치가 맞지 않는다.

## respawn 후 ability task가 실패한다
- ASC는 PlayerState에 남아 있지만 avatar actor가 이전 pawn을 가리킨다.
- `OnRep_PlayerState()`에서 actor info 재초기화가 빠졌다.
- montage task가 새 skeletal mesh/anim instance를 찾지 못한다.

## 실전 설계 팁
- 플레이어의 장기 상태는 PlayerState ASC가 유리하다.
- 적 AI처럼 respawn/소유 연결이 단순하면 Character ASC도 충분하다.
- UI에 보여줄 값은 attribute replication과 OnRep, gameplay tag event를 분리해서 설계한다.
- ability input은 “입력 발생”과 “ability spec handle 전달”을 분리해서 디버깅한다.

## 2026-05-12 심화 보강 보완: 점검과 추가 학습

### 자주 막히는 문제

- Ability가 활성화되지 않는다: ASC 초기화, AvatarActor/OwnerActor, 입력 바인딩, tag block 조건을 확인한다.
- 클라이언트 예측이 어긋난다: PredictionKey, server authority, ability commit 시점을 확인한다.
- Attribute가 UI에 갱신되지 않는다: AttributeSet 복제, delegate binding, GameplayEffect 적용 위치를 확인한다.
- Respawn 후 Ability가 사라진다: ASC를 Character에 둘지 PlayerState에 둘지 수명 주기 기준으로 다시 판단한다.

### 실습 과제

1. Character ASC와 PlayerState ASC 두 구조를 모두 만들어 respawn 상황을 비교한다.
2. Cost/Cooldown이 있는 Dash Ability를 만들고 실패 이유를 UI에 출력한다.
3. GameplayEffect로 체력을 변경하고 Attribute delegate로 UI를 갱신한다.

### 부가 자료

- 공식 문서: Gameplay Ability System.
- 엔진 소스: `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Private\AbilitySystemComponent_Abilities.cpp`.
- 엔진 소스: `Engine\Plugins\Runtime\GameplayAbilities\Source\GameplayAbilities\Private\AbilitySystemComponent.cpp`.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| GA 안에서 모든 타이밍과 상태를 직접 처리한다. | 대기, montage, target data, delay는 Ability Task로 분리한다. |
| 태그는 단순 분류용 문자열이다. | activation 조건, 차단, 상태 표현, cue 연결까지 포함한 제어 신호로 본다. |
| 클라이언트에서 보이면 서버 상태도 맞다. | 예측 결과와 서버 확정 결과를 구분하고 prediction key와 권한을 확인한다. |

## 관련 문서

- [[게임플레이 어빌리티 스펙(Spec)]]
- [[게임플레이 어빌리티 시스템(GAS)]]
- [[게임플레이 어빌리티 타겟 액터(TA)]]
- [[게임플레이 어빌리티(GA)]]
- [[게임플레이 어빌리티(GA)의 인스턴싱 옵션]]
- [[게임플레이 이펙트(GE)]]

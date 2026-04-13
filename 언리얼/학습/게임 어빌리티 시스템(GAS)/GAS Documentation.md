---
cssclasses:
  - width-100
---

# 1. GameplayAbilitySystem Plugin 소개

---

>Gameplay Ability System(GAS)은 RPG 또는 MOBA 타이틀에서 볼 수 있는 능력과 속성을 구축하기 위한 매우 유연한 프레임워크입니다. 게임에서 캐릭터가 사용할 액션이나 패시브 능력을 구축하고, 이러한 액션의 결과로 다양한 속성을 강화하거나 약화시키는 상태 효과를 구현하고, 이러한 액션의 사용을 규제하기 위해 "쿨다운" 타이머 또는 리소스 비용을 구현하고, 각 레벨에서 능력과 효과의 레벨을 변경하고, 파티클 또는 사운드 효과를 활성화하는 등의 작업을 수행할 수 있습니다. 간단히 말해, 이 시스템은 최신 RPG 또는 MOBA 타이틀에서 좋아하는 캐릭터의 능력 세트만큼 복잡한 게임 내 능력을 설계, 구현 및 효율적으로 네트워크화하는 데 도움이 될 수 있습니다.

GameplayAbilitySystem 플러그인은 Epic Games에서 개발했으며 Paragon 및 Fortnite와 같은 AAA 상업용 게임에서 테스트를 거쳤습니다.
   
이 플러그인은 싱글 플레이어 및 멀티플레이어 게임에서 다음과 같은 기본 기능을 제공합니다.
- 레벨 기반 캐릭터 능력 또는 선택적 비용과 재사용 대기시간이 있는 스킬 구현 (GameplayAbilities)
- 액터에 속하는 수치 속성 조작 (Attributes)
- 액터에 상태 효과 적용 (GameplayEffects)
- 액터에 GameplayTag 적용 (GameplayTags)
- 시각 또는 사운드 효과 생성 (GameplayCues)
- 위에서 언급한 모든 항목의 복제

**멀티플레이어 게임에서 GAS는 다음에 대한 클라이언트 측 예측을 지원합니다.**

- 능력 활성화
- 애니메이션 몽타주 재생
- 속성 변경
- GameplayTag 적용
- GameplayCue 생성
- CharacterMovementComponent에 연결된 RootMotionSource 함수를 통한 이동

GAS는 C++로 설정해야 하지만 GameplayAbilities 및 GameplayEffects는 디자이너가 블루프린트에서 만들 수 있습니다.

**GAS의 현재 문제점:**

- GameplayEffect 지연 시간 조정 (높은 지연 시간을 가진 플레이어는 낮은 지연 시간을 가진 플레이어에 비해 낮은 재사용 대기시간 능력에 대한 발사 속도가 낮아짐)
- GameplayEffect 제거 예측 불가 (역 효과로 GameplayEffect를 추가하여 효과적으로 제거할 수 있지만 항상 적절하거나 실현 가능한 것은 아니며 여전히 문제로 남아 있음)
- 상용구 템플릿, 멀티플레이어 예제 및 문서 부족

# 2. 샘플 프로젝트

이 문서에는 GameplayAbilitySystem 플러그인을 처음 접하는 사람들을 위해 멀티플레이어 슈팅 게임 샘플 프로젝트가 포함되어 있습니다. C++, 블루프린트, UMG, 복제 및 기타 UE의 중급 주제에 익숙한 사용자를 대상으로 합니다.

이 프로젝트는 플레이어/AI가 조작하는 영웅 클래스의 PlayerState 클래스와 AI가 조작하는 미니언의 Character 클래스에 AbilitySystemComponent(ASC)를 사용하여 기본적인 멀티플레이어 슈팅 게임 프로젝트를 설정하는 방법의 예를 제공합니다. 목표는 GAS 기본 사항을 보여주고 일반적으로 요청되는 능력을 잘 설명된 코드로 시연하는 것입니다. 초보자 중심이기 때문에 프로젝트는 발사체 예측과 같은 고급 주제를 다루지 않습니다.

**개념 데모:**

- PlayerState와 Character에서 ASC 사용
- 복제된 속성
- 복제된 애니메이션 몽타주
- GameplayTags
- GameplayAbilities 내부 및 외부에서 GameplayEffect 적용 및 제거
- 캐릭터의 체력을 변경하기 위해 방어력에 의해 완화된 피해 적용
- GameplayEffectExecutionCalculations
- 기절 효과
- 죽음과 부활
- 서버의 능력에서 액터(발사체) 생성
- 조준 및 질주를 통해 로컬 플레이어의 속도를 예측적으로 변경
- 질주하기 위해 지구력을 지속적으로 소모
- 능력을 사용하기 위해 마나 사용
- 패시브 능력
- GameplayEffect 스택
- 액터 타겟팅
- 블루프린트로 생성된 GameplayAbilities
- C++로 생성된 GameplayAbilities
- 액터별로 인스턴스화된 GameplayAbilities
- 인스턴스화되지 않은 GameplayAbilities (점프)
- 정적 GameplayCues (FireGun 발사체 충돌 파티클 효과)
- 액터 GameplayCues (질주 및 기절 파티클 효과)

**영웅 클래스에는 다음과 같은 능력이 있습니다.**

| 능력         | 입력 바인딩     | 예측  | C++ / 블루프린트 | 설명                                                                      |
| :--------- | :--------- | :-- | :---------- | :---------------------------------------------------------------------- |
| 점프         | 스페이스 바     | 예   | C++         | 영웅을 점프하게 합니다.                                                           |
| 총          | 마우스 왼쪽 버튼  | 아니요 | C++         | 영웅의 총에서 발사체를 발사합니다. 애니메이션은 예측되지만 발사체는 예측되지 않습니다.                        |
| 조준         | 마우스 오른쪽 버튼 | 예   | 블루프린트       | 버튼을 누르고 있는 동안 영웅은 더 느리게 걷고 카메라가 확대되어 총으로 더 정확한 사격을 할 수 있습니다.            |
| 질주         | 왼쪽 Shift   | 예   | 블루프린트       | 버튼을 누르고 있는 동안 영웅은 더 빨리 달리고 지구력을 소모합니다.                                  |
| 앞으로 돌진     | Q          | 예   | 블루프린트       | 영웅은 지구력을 소모하여 앞으로 돌진합니다.                                                |
| 패시브 방어구 스택 | 패시브        | 아니요 | 블루프린트       | 4초마다 영웅은 최대 4 스택까지 방어구 스택을 얻습니다. 피해를 받으면 방어구 스택이 하나 제거됩니다.              |
| 유성         | R          | 아니요 | 블루프린트       | 플레이어는 적에게 유성을 떨어뜨려 피해를 입히고 기절시킬 위치를 지정합니다. 타겟팅은 예측되지만 유성 생성은 예측되지 않습니다. |

GameplayAbilities는 C++ 또는 블루프린트에서 생성되는지는 중요하지 않습니다. 여기서는 각 언어로 구현하는 방법의 예를 위해 두 가지를 혼합하여 사용했습니다.

미니언에는 미리 정의된 GameplayAbilities가 제공되지 않습니다. 빨간색 미니언은 체력 재생력이 더 높고 파란색 미니언은 시작 체력이 더 높습니다.

GameplayAbility 이름 지정의 경우 접미사 `_BP`를 사용하여 GameplayAbility의 로직이 블루프린트에서 생성되었음을 나타냅니다. 접미사가 없으면 로직이 C++에서 생성되었음을 의미합니다.

**블루프린트 에셋 이름 지정 접두사**

|접두사|에셋 유형|
|:--|:--|
|GA_|GameplayAbility|
|GC_|GameplayCue|
|GE_|GameplayEffect|

# 3. GAS를 사용하는 프로젝트 설정

GAS를 사용하는 프로젝트를 설정하는 기본 단계:

1. 에디터에서 GameplayAbilitySystem 플러그인 활성화
2. `YourProjectName.Build.cs`를 편집하여 `PrivateDependencyModuleNames`에 "GameplayAbilities", "GameplayTags", "GameplayTasks" 추가
3. Visual Studio 프로젝트 파일 새로 고침/재생성
4. 4.24부터 5.2까지 TargetData를 사용하려면 `UAbilitySystemGlobals::Get().InitGlobalData()`를 호출해야 합니다. 샘플 프로젝트에서는 `UAssetManager::StartInitialLoading()`에서 이를 수행합니다. 5.3부터는 자동으로 호출됩니다.

GAS를 활성화하려면 위 단계를 수행하면 됩니다. 여기에서 Character 또는 PlayerState에 ASC와 AttributeSet을 추가하고 GameplayAbilities 및 GameplayEffects를 만들 수 있습니다!

# 4. GAS 개념

## 4.1 Ability System Component

AbilitySystemComponent(ASC)는 GAS의 핵심입니다. 시스템과의 모든 상호 작용을 처리하는 UActorComponent(UAbilitySystemComponent)입니다. GameplayAbilities를 사용하거나 속성을 갖거나 GameplayEffect를 받으려는 모든 액터에는 ASC가 하나씩 연결되어 있어야 합니다. 이러한 객체는 모두 ASC 내부에 있으며 ASC에 의해 관리되고 복제됩니다(속성은 AttributeSet에 의해 복제됨). 개발자는 이 클래스를 서브클래싱할 것으로 예상되지만 필수는 아닙니다.

ASC가 연결된 액터를 ASC의 OwnerActor라고 합니다. ASC의 물리적 표현 액터를 AvatarActor라고 합니다. OwnerActor와 AvatarActor는 MOBA 게임의 단순한 AI 미니언의 경우처럼 동일한 액터일 수 있습니다. MOBA 게임에서 OwnerActor가 PlayerState이고 AvatarActor가 영웅의 Character 클래스인 플레이어가 조작하는 영웅의 경우처럼 다른 액터일 수도 있습니다. 대부분의 액터는 자체적으로 ASC를 갖습니다. 액터가 리스폰되고 리스폰 간에 속성 또는 GameplayEffect의 지속성이 필요한 경우(MOBA의 영웅처럼) ASC의 이상적인 위치는 PlayerState입니다.

참고: ASC가 PlayerState에 있는 경우 PlayerState의 NetUpdateFrequency를 늘려야 합니다. PlayerState에서 매우 낮은 값으로 기본 설정되어 있으며 클라이언트에서 속성 및 GameplayTag와 같은 항목이 변경되기 전에 지연 또는 지연이 발생할 수 있습니다. Adaptive Network Update Frequency를 활성화해야 합니다. Fortnite는 이를 사용합니다.

OwnerActor와 AvatarActor(다른 액터인 경우)는 모두 IAbilitySystemInterface를 구현해야 합니다. 이 인터페이스에는 ASC에 대한 포인터를 반환하는 `UAbilitySystemComponent* GetAbilitySystemComponent() const`를 재정의해야 하는 함수가 하나 있습니다. ASC는 이 인터페이스 함수를 찾아 시스템 내부에서 서로 상호 작용합니다.

ASC는 현재 활성 GameplayEffect를 `FActiveGameplayEffectsContainer ActiveGameplayEffects`에 보관합니다.

ASC는 부여된 Gameplay Abilities를 `FGameplayAbilitySpecContainer ActivatableAbilities`에 보관합니다. `ActivatableAbilities.Items`를 반복할 때마다 루프 위에 `ABILITYLIST_SCOPE_LOCK();`를 추가하여 목록이 변경되지 않도록 잠가야 합니다(능력 제거로 인해). 범위 내의 모든 `ABILITYLIST_SCOPE_LOCK();`는 `AbilityScopeLockCount`를 증가시킨 다음 범위를 벗어나면 감소합니다. `ABILITYLIST_SCOPE_LOCK();` 범위 내에서 능력을 제거하지 마십시오. (clear ability 함수는 `AbilityScopeLockCount`를 내부적으로 확인하여 목록이 잠겨 있는 경우 능력 제거를 방지합니다.)

### 4.1.1 복제 모드

ASC는 GameplayEffect, GameplayTag 및 GameplayCue를 복제하기 위한 세 가지 복제 모드(전체, 혼합 및 최소)를 정의합니다. 속성은 AttributeSet에 의해 복제됩니다.

|복제 모드|사용 시기|설명|
|:--|:--|:--|
|전체|싱글 플레이어|모든 GameplayEffect가 모든 클라이언트에 복제됩니다.|
|혼합|멀티플레이어, 플레이어가 조작하는 액터|GameplayEffect는 소유하는 클라이언트에만 복제됩니다. GameplayTag 및 GameplayCue만 모든 사람에게 복제됩니다.|
|최소|멀티플레이어, AI가 조작하는 액터|GameplayEffect는 누구에게도 복제되지 않습니다. GameplayTag 및 GameplayCue만 모든 사람에게 복제됩니다.|

Sheets로 내보내기

참고: 혼합 복제 모드에서는 OwnerActor의 Owner가 Controller가 될 것으로 예상합니다. PlayerState의 Owner는 기본적으로 Controller이지만 Character는 그렇지 않습니다. OwnerActor가 PlayerState가 아닌 혼합 복제 모드를 사용하는 경우 유효한 Controller를 사용하여 OwnerActor에서 `SetOwner()`를 호출해야 합니다. 4.24부터 `PossessedBy()`는 이제 Pawn의 소유자를 새 Controller로 설정합니다.

### 4.1.2 설정 및 초기화

ASC는 일반적으로 OwnerActor의 생성자에서 생성되고 명시적으로 복제로 표시됩니다. 이 작업은 C++에서 수행해야 합니다.

```C++
AGDPlayerState::AGDPlayerState()
{
  // 능력 시스템 구성 요소를 만들고 명시적으로 복제되도록 설정합니다.
  AbilitySystemComponent = CreateDefaultSubobject<UGDAbilitySystemComponent>(TEXT("AbilitySystemComponent"));
  AbilitySystemComponent->SetIsReplicated(true);
  // ...
}
```

ASC는 서버와 클라이언트 모두에서 OwnerActor 및 AvatarActor로 초기화해야 합니다. Pawn의 Controller가 설정된 후(점유 후) 초기화해야 합니다. 싱글 플레이어 게임은 서버 경로만 걱정하면 됩니다.

ASC가 Pawn에 있는 플레이어가 조작하는 캐릭터의 경우 일반적으로 Pawn의 `PossessedBy()` 함수에서 서버를 초기화하고 PlayerController의 `AcknowledgePossession()` 함수에서 클라이언트를 초기화합니다.

```C++
void APACharacterBase::PossessedBy(AController * NewController)
{
  Super::PossessedBy(NewController);

  if (AbilitySystemComponent)
  {
    AbilitySystemComponent->InitAbilityActorInfo(this, this);
  }

  // ASC MixedMode 복제에는 ASC Owner의 Owner가 Controller여야 합니다.
  SetOwner(NewController);
}

void APAPlayerControllerBase::AcknowledgePossession(APawn* P)
{
  Super::AcknowledgePossession(P);

  APACharacterBase* CharacterBase = Cast<APACharacterBase>(P);
  if (CharacterBase)
  {
    CharacterBase->GetAbilitySystemComponent()->InitAbilityActorInfo(CharacterBase, CharacterBase);
  }

  // ...
}
```

ASC가 PlayerState에 있는 플레이어가 조작하는 캐릭터의 경우 일반적으로 Pawn의 `PossessedBy()` 함수에서 서버를 초기화하고 Pawn의 `OnRep_PlayerState()` 함수에서 클라이언트를 초기화합니다. 이렇게 하면 PlayerState가 클라이언트에 있는지 확인합니다.

```C++
// 서버 전용
void AGDHeroCharacter::PossessedBy(AController * NewController)
{
  Super::PossessedBy(NewController);

  AGDPlayerState* PS = GetPlayerState<AGDPlayerState>();
  if (PS)
  {
    // 서버에서 ASC를 설정합니다. 클라이언트는 OnRep_PlayerState()에서 이를 수행합니다.
    AbilitySystemComponent = Cast<UGDAbilitySystemComponent>(PS->GetAbilitySystemComponent());
    // AI에는 PlayerController가 없으므로 여기에서 다시 초기화하여 확인할 수 있습니다.
    // PlayerController가 있는 영웅의 경우 두 번 초기화해도 문제가 없습니다.
    PS->GetAbilitySystemComponent()->InitAbilityActorInfo(PS, this);
  }
  
  // ...
}

// 클라이언트 전용
void AGDHeroCharacter::OnRep_PlayerState()
{
  Super::OnRep_PlayerState();

  AGDPlayerState* PS = GetPlayerState<AGDPlayerState>();
  if (PS)
  {
    // 클라이언트의 ASC를 설정합니다. 서버는 PossessedBy에서 이를 수행합니다.
    AbilitySystemComponent = Cast<UGDAbilitySystemComponent>(PS->GetAbilitySystemComponent());
    // 클라이언트의 ASC 액터 정보를 초기화합니다. 서버는 새 액터를 점유할 때 ASC를 초기화합니다.
    AbilitySystemComponent->InitAbilityActorInfo(PS, this);
  }

  // ...
}
```

"LogAbilitySystem: Warning: Can't activate LocalOnly or LocalPredicted ability %s when not local!" 오류 메시지가 표시되면 클라이언트에서 ASC를 초기화하지 않은 것입니다.

## 4.2 Gameplay Tags

FGameplayTags는 GameplayTagManager에 등록된 Parent.Child.Grandchild... 형식의 계층적 이름입니다. 이러한 태그는 객체의 상태를 분류하고 설명하는 데 매우 유용합니다. 예를 들어, 캐릭터가 기절하면 기절 기간 동안 State.Debuff.Stun GameplayTag를 지정할 수 있습니다. 이전에 부울 또는 열거형으로 처리했던 것을 GameplayTag로 바꾸고 객체에 특정 GameplayTag가 있는지 여부에 대한 부울 로직을 수행하게 됩니다. 객체에 태그를 지정할 때 일반적으로 GAS가 태그와 상호 작용할 수 있도록 ASC에 태그를 추가합니다. UAbilitySystemComponent는 소유된 GameplayTag에 액세스하기 위한 함수를 제공하는 IGameplayTagAssetInterface를 구현합니다.

여러 GameplayTag를 FGameplayTagContainer에 저장할 수 있습니다. GameplayTagContainers는 효율성 마법을 제공합니다. GameplayTagContainers는 프로젝트 설정에서 빠른 복제가 활성화된 경우 복제를 위해 효율적으로 함께 압축될 수 있습니다. 빠른 복제를 사용하려면 서버와 클라이언트의 GameplayTag 목록이 동일해야 합니다. 일반적으로 문제가 되지 않으므로 이 옵션을 활성화해야 합니다. GameplayTagContainers는 반복을 위해 `TArray<FGameplayTag>`를 반환할 수도 있습니다.

`FGameplayTagCountContainer`에 저장된 GameplayTag에는 해당 GameplayTag의 인스턴스 수가 저장되는 TagMap이 있습니다. `FGameplayTagCountContainer`에 GameplayTag가 있더라도 `TagMapCount`는 0일 수 있습니다. ASC에 GameplayTag가 있는 경우 디버깅하는 동안 이 문제가 발생할 수 있습니다. `HasTag()` 또는 `HasMatchingTag()` 또는 유사한 함수는 `TagMapCount`를 확인하고 GameplayTag가 없거나 `TagMapCount`가 0이면 false를 반환합니다.

GameplayTag는 `DefaultGameplayTags.ini`에서 미리 정의해야 합니다. Unreal Engine 에디터는 개발자가 `DefaultGameplayTags.ini`를 수동으로 편집할 필요 없이 GameplayTag를 관리할 수 있도록 프로젝트 설정에서 인터페이스를 제공합니다. GameplayTag 에디터는 GameplayTag를 생성, 이름 변경, 참조 검색 및 삭제할 수 있습니다.

GameplayTag 참조를 검색하면 GameplayTag를 참조하는 모든 에셋을 보여주는 에디터의 친숙한 참조 뷰어 그래프가 나타납니다. 그러나 이것은 GameplayTag를 참조하는 C++ 클래스를 표시하지 않습니다.

GameplayTag의 이름을 바꾸면 원래 GameplayTag를 참조하는 에셋이 새 GameplayTag로 리디렉션될 수 있도록 리디렉션이 생성됩니다. 리디렉션을 생성하지 않으려면 새 GameplayTag를 생성하고 모든 참조를 새 GameplayTag로 수동으로 업데이트한 다음 이전 GameplayTag를 삭제하는 것이 좋습니다.

빠른 복제 외에도 GameplayTag 에디터에는 일반적으로 복제되는 GameplayTag를 채워 더 최적화하는 옵션이 있습니다.

GameplayTag는 GameplayEffect에서 추가된 경우 복제됩니다. ASC를 사용하면 복제되지 않고 수동으로 관리해야 하는 LooseGameplayTags를 추가할 수 있습니다. 샘플 프로젝트는 소유 클라이언트가 체력이 0으로 떨어졌을 때 즉시 응답할 수 있도록 State.Dead에 LooseGameplayTag를 사용합니다. 리스폰은 TagMapCount를 0으로 다시 설정합니다. LooseGameplayTags로 작업할 때만 TagMapCount를 수동으로 조정합니다.

UAbilitySystemComponent::AddLooseGameplayTag() 및 UAbilitySystemComponent::RemoveLooseGameplayTag() 함수를 사용하는 것이 TagMapCount를 수동으로 조정하는 것보다 좋습니다.

C++에서 GameplayTag에 대한 참조를 가져오는 방법:

```C++
FGameplayTag::RequestGameplayTag(FName("Your.GameplayTag.Name"))
```

부모 또는 자식 GameplayTags 가져오기와 같은 고급 GameplayTag 조작의 경우 GameplayTagManager에서 제공하는 함수를 살펴보세요.

GameplayTagManager에 액세스하려면 GameplayTagManager.h를 포함하고 UGameplayTagManager::Get().FunctionName으로 호출합니다.

GameplayTagManager는 실제로 GameplayTag를 관계형 노드(부모, 자식 등)로 저장하여 지속적인 문자열 조작 및 비교보다 빠르게 처리합니다.

GameplayTags 및 GameplayTagContainers는 블루프린트의 태그를 필터링하여 GameplayCue의 부모 태그가 있는 GameplayTag만 표시하는 선택적 UPROPERTY 지정자 Meta = (Categories = "GameplayCue")를 가질 수 있습니다.

GameplayTag 또는 GameplayTagContainer 변수가 GameplayCues에만 사용되어야 한다는 것을 알고 있을 때 유용합니다.

또는 FGameplayTag를 캡슐화하고 블루프린트의 GameplayTag를 자동으로 필터링하여 GameplayCue의 부모 태그가 있는 태그만 표시하는 FGameplayCueTag라는 별도의 구조체가 있습니다.

함수에서 GameplayTag 매개변수를 필터링하려면 UFUNCTION 지정자 Meta = (GameplayTagFilter = "GameplayCue")를 사용합니다.

함수의 GameplayTagContainer 매개변수는 필터링할 수 없습니다. 이를 허용하도록 엔진을 편집하려면 Engine\Plugins\Editor\GameplayTagsEditor\Source\GameplayTagsEditor\Private\SGameplayTagGraphPin.cpp의 SGameplayTagGraphPin::ParseDefaultValueData()가 FilterString = UGameplayTagsManager::Get().GetCategoriesMetaFromField(PinStructType)를 호출하는 방법을 살펴보세요.

그리고 SGameplayTagGraphPin::GetListContent()에서 SGameplayTagWidget에 FilterString을 전달합니다. Engine\Plugins\Editor\GameplayTagsEditor\Source\GameplayTagsEditor\Private\SGameplayTagContainerGraphPin.cpp에 있는 이러한 함수의 GameplayTagContainer 버전은 메타 필드 속성을 확인하지 않고 필터를 따라 전달합니다.

샘플 프로젝트는 GameplayTag를 광범위하게 사용합니다.

### 4.2.1 Gameplay Tags의 변경 사항에 응답

ASC는 GameplayTag가 추가되거나 제거될 때 대한 대리자를 제공합니다.

EGameplayTagEventType를 사용하면 GameplayTag가 추가/제거될 때 또는 GameplayTag의 TagMapCount가 변경될 때만 실행되도록 지정할 수 있습니다.


```C++
AbilitySystemComponent->RegisterGameplayTagEvent(FGameplayTag::RequestGameplayTag(FName("State.Debuff.Stun")), EGameplayTagEventType::NewOrRemoved).AddUObject(this, &AGDPlayerState::StunTagChanged);
```

콜백 함수에는 GameplayTag 및 새 TagCount에 대한 매개변수가 있습니다.


```C++
virtual void StunTagChanged(const FGameplayTag CallbackTag, int32 NewCount);
```

### 4.2.2 플러그인 .ini 파일에서 Gameplay Tags 로드

GameplayTag가 있는 자체 .ini 파일이 있는 플러그인을 만드는 경우 플러그인의 StartupModule() 함수에서 해당 플러그인의 GameplayTag .ini 디렉터리를 로드할 수 있습니다.

예를 들어, Unreal Engine과 함께 제공되는 CommonConversation 플러그인은 다음과 같이 수행합니다.


```C++
void FCommonConversationRuntimeModule::StartupModule()
{
  TSharedPtr<IPlugin> ThisPlugin = IPluginManager::Get().FindPlugin(TEXT("CommonConversation"));
  check(ThisPlugin.IsValid());
  UGameplayTagsManager::Get().AddTagIniSearchPath(ThisPlugin->GetBaseDir() / TEXT("Config") / TEXT("Tags"));

  //...
}
```

플러그인이 활성화된 경우 엔진이 시작될 때 Plugins\CommonConversation\Config\Tags 디렉터리를 찾고 GameplayTag가 있는 .ini 파일을 프로젝트에 로드합니다.

## 4.3 Attributes

### 4.3.1 Attribute 정의

Attributes는 FGameplayAttributeData 구조체에 의해 정의된 float 값입니다. 이러한 값은 캐릭터의 체력량에서 캐릭터의 레벨, 포션의 충전 횟수에 이르기까지 무엇이든 나타낼 수 있습니다. 액터에 속하는 게임 플레이 관련 숫자 값인 경우 속성을 사용하는 것이 좋습니다. 속성은 일반적으로 ASC가 변경 사항을 예측할 수 있도록 GameplayEffect에 의해서만 수정되어야 합니다. 속성은 AttributeSet에 의해 정의되고 AttributeSet에 있습니다. AttributeSet은 복제용으로 표시된 속성을 복제합니다. 속성을 정의하는 방법은 AttributeSet 섹션을 참조하세요.

팁: 속성이 에디터의 속성 목록에 표시되지 않도록 하려면 Meta = (HideInDetailsView) 속성 지정자를 사용할 수 있습니다.

### 4.3.2 BaseValue 대 CurrentValue

속성은 BaseValue와 CurrentValue의 두 가지 값으로 구성됩니다. BaseValue는 속성의 영구 값이고 CurrentValue는 BaseValue에 GameplayEffect의 임시 수정 사항을 더한 값입니다. 예를 들어, 캐릭터의 이동 속도 속성의 BaseValue가 600단위/초일 수 있습니다. 아직 이동 속도를 수정하는 GameplayEffect가 없으므로 CurrentValue도 600u/s입니다. 임시 50u/s 이동 속도 버프를 받으면 BaseValue는 600u/s로 유지되고 CurrentValue는 이제 600 + 50으로 총 650u/s가 됩니다. 이동 속도 버프가 만료되면 CurrentValue는 600u/s의 BaseValue로 되돌아갑니다. 종종 GAS를 처음 접하는 사람들은 BaseValue를 속성의 최대 값과 혼동하고 그렇게 취급하려고 합니다. 이것은 잘못된 접근 방식입니다. 변경될 수 있거나 능력 또는 UI에서 참조되는 속성의 최대 값은 별도의 속성으로 취급해야 합니다. 하드 코딩된 최대 값과 최소 값의 경우 FAttributeMetaData가 있는 DataTable을 정의하여 최대 값과 최소 값을 설정할 수 있는 방법이 있지만 구조체 위의 Epic의 주석에서는 이를 "진행 중인 작업"이라고 합니다. 자세한 내용은 AttributeSet.h를 참조하세요. 혼동을 피하기 위해 능력 또는 UI에서 참조할 수 있는 최대 값은 별도의 속성으로 만들고 속성을 클램핑하는 데만 사용되는 하드 코딩된 최대 값과 최소 값은 AttributeSet에서 하드 코딩된 float로 정의하는 것이 좋습니다. 속성의 클램핑은 CurrentValue의 변경 사항에 대해서는 PreAttributeChange()에서, GameplayEffect의 BaseValue 변경 사항에 대해서는 PostGameplayEffectExecute()에서 설명합니다. BaseValue의 영구적인 변경은 즉시 GameplayEffect에서 발생하는 반면 지속 시간 및 무한 GameplayEffect는 CurrentValue를 변경합니다. 주기적 GameplayEffect는 즉시 GameplayEffect처럼 취급되고 BaseValue를 변경합니다.

### 4.3.3 메타 속성

일부 속성은 속성과 상호 작용하기 위한 임시 값의 자리 표시자로 취급됩니다. 이를 메타 속성이라고 합니다. 예를 들어, 일반적으로 피해를 메타 속성으로 정의합니다. GameplayEffect가 체력 속성을 직접 변경하는 대신 피해라는 메타 속성을 자리 표시자로 사용합니다. 이렇게 하면 GameplayEffectExecutionCalculation에서 버프와 디버프를 사용하여 피해 값을 수정할 수 있으며, 예를 들어 최종적으로 체력 속성에서 나머지를 빼기 전에 현재 보호막 속성에서 피해를 빼는 등 AttributeSet에서 추가로 조작할 수 있습니다. 피해 메타 속성은 GameplayEffect 간에 지속성이 없으며 모든 속성에 의해 재정의됩니다. 메타 속성은 일반적으로 복제되지 않습니다.

메타 속성은 "얼마나 많은 피해를 입혔습니까?"와 "이 피해로 무엇을 합니까?" 사이의 피해와 치유와 같은 것들에 대해 좋은 논리적 분리를 제공합니다. 이 논리적 분리는 Gameplay Effect 및 Execution Calculations가 대상이 피해를 처리하는 방법을 알 필요가 없음을 의미합니다. 피해 예를 계속해서 살펴보면 Gameplay Effect는 피해량을 결정한 다음 AttributeSet은 해당 피해로 무엇을 할지 결정합니다. 모든 캐릭터가 동일한 속성을 갖는 것은 아니며, 특히 서브클래싱된 AttributeSet을 사용하는 경우에는 더욱 그렇습니다. 기본 AttributeSet 클래스에는 체력 속성만 있을 수 있지만 서브클래싱된 AttributeSet에는 보호막 속성이 추가될 수 있습니다. 보호막 속성이 있는 서브클래싱된 AttributeSet은 기본 AttributeSet 클래스와 다르게 받은 피해를 분배합니다. 메타 속성은 좋은 디자인 패턴이지만 필수는 아닙니다. 모든 피해 인스턴스에 대해 하나의 Execution Calculation만 사용하고 모든 캐릭터가 하나의 Attribute Set 클래스를 공유하는 경우 Execution Calculation 내에서 체력, 보호막 등에 대한 피해 분배를 수행하고 해당 속성을 직접 수정해도 괜찮습니다. 유연성만 희생하게 되지만 괜찮을 수도 있습니다.

### 4.3.4 속성 변경에 응답

UI 또는 기타 게임 플레이를 업데이트하기 위해 속성이 변경될 때를 수신하려면 UAbilitySystemComponent::GetGameplayAttributeValueChangeDelegate(FGameplayAttribute Attribute)를 사용합니다. 이 함수는 속성이 변경될 때마다 자동으로 호출되는 바인딩할 수 있는 대리자를 반환합니다. 대리자는 NewValue, OldValue 및 FGameplayEffectModCallbackData가 있는 FOnAttributeChangeData 매개변수를 제공합니다. 참고: FGameplayEffectModCallbackData는 서버에서만 설정됩니다.


```C++
AbilitySystemComponent->GetGameplayAttributeValueChangeDelegate(AttributeSetBase->GetHealthAttribute()).AddUObject(this, &AGDPlayerState::HealthChanged);
virtual void HealthChanged(const FOnAttributeChangeData& Data);
```

샘플 프로젝트는 HUD를 업데이트하고 체력이 0에 도달하면 플레이어 사망에 응답하기 위해 GDPlayerState에서 속성 값 변경 대리자에 바인딩합니다. 이를 ASyncTask로 래핑하는 사용자 지정 블루프린트 노드가 샘플 프로젝트에 포함되어 있습니다. UI_HUD UMG 위젯에서 체력, 마나 및 지구력 값을 업데이트하는 데 사용됩니다. 이 AsyncTask는 UMG 위젯의 Destruct 이벤트에서 수행하는 EndTask()를 수동으로 호출할 때까지 영원히 지속됩니다. AsyncTaskAttributeChanged.h/cpp를 참조하세요.

속성 변경 수신 BP 노드

#### 4.3.5 파생 속성

하나 이상의 다른 속성에서 파생된 값의 일부 또는 전부를 갖는 속성을 만들려면 하나 이상의 속성 기반 또는 MMC 수정자가 있는 무한 GameplayEffect를 사용합니다. 파생 속성은 종속된 속성이 업데이트될 때 자동으로 업데이트됩니다. 파생 속성에 대한 모든 수정자의 최종 공식은 수정자 집계자에 대한 공식과 동일합니다. 계산이 특정 순서로 발생해야 하는 경우 MMC 내부에서 모두 수행합니다.

```
((CurrentValue + Additive) * Multiplicitive) / Division
```

참고: PIE에서 여러 클라이언트로 플레이하는 경우 에디터 기본 설정에서 단일 프로세스에서 실행을 비활성화해야 합니다. 그렇지 않으면 파생 속성이 첫 번째 클라이언트 이외의 클라이언트에서 업데이트될 때 독립 속성이 업데이트되지 않습니다.

이 예에서는 TestAttrA = (TestAttrA + TestAttrB) * (2 * TestAttrC) 공식에서 속성 TestAttrB 및 TestAttrC에서 TestAttrA 값을 파생하는 무한 GameplayEffect가 있습니다. TestAttrA는 속성이 값을 업데이트할 때마다 자동으로 값을 다시 계산합니다.

파생 속성 예

## 4.4 Attribute Set

### 4.4.1 Attribute Set 정의

AttributeSet은 속성에 대한 변경 사항을 정의, 보유 및 관리합니다. 개발자는 UAttributeSet에서 서브클래싱해야 합니다. OwnerActor의 생성자에서 AttributeSet을 생성하면 ASC에 자동으로 등록됩니다. 이것은 C++에서 수행해야 합니다.
 

### 4.4.2 AttributeSet 설계

ASC는 하나 혹은 여러 개의 AttributeSet을 가질 수 있습니다. AttributeSet은 메모리 오버헤드가 미미하기 때문에 얼마나 많은 AttributeSet을 사용할지는 사용자의 조직적인 결정에 달려있습니다.  
   
게임 내 모든 액터가 공유하는 하나의 큰 모놀리식 AttributeSet을 사용하고, 필요한 Attribute만 사용하는 방식도 가능합니다. 이 경우 사용되지 않는 Attribute는 무시합니다.

또는 Attribute들을 그룹화하여 여러 개의 AttributeSet을 만들어 Actor에 필요한 것만 선택적으로 추가할 수도 있습니다. 예를 들어, 체력 관련 Attribute를 위한 AttributeSet, 마나 관련 Attribute를 위한 AttributeSet을 만들 수 있습니다. MOBA 게임에서 영웅은 마나를 필요로 하지만 미니언은 필요하지 않다면, 영웅은 마나 관련 AttributeSet을, 미니언은 이를 제외한 AttributeSet을 가지게 하면 됩니다.

  
또한 AttributeSet은 서브 클래싱할 수 있기 때문에, 이를 통해 Actor가 가질 Attribute를 선택적으로 결정할 수 있습니다. Attribute들은 내부적으로 AttributeSetClassName.AttributeName 형식으로 참조되는데, AttributeSet을 서브 클래싱했을 경우에도 부모 클래스의 Attribute들은 똑같이 부모 클래스의 이름을 접두사로 사용하게 됩니다.

여러 개의 AttributeSet을 가질 수는 있지만, 동일한 클래스의 AttributeSet은 하나만 ASC에 포함시킬 수 있습니다. 동일한 클래스의 AttributeSet을 두 개 이상 추가할 경우 ASC가 어느 AttributeSet을 사용할지 알지 못하고, 그냥 그 중 하나를 선택하게 됩니다.

#### 4.4.2.1 개별 Attribute를 가진 서브 컴포넌트

Pawn에 여러 개의 피해를 입을 수 있는 컴포넌트가 있을 경우(예: 각기 다른 갑옷 부위별 피해 계산), 최대 수의 피해를 입을 수 있는 컴포넌트를 알고 있다면, 하나의 AttributeSet에 여러 개의 Attribute(예: DamageableCompHealth0, DamageableCompHealth1 등)를 정의하여 각 슬롯에 해당하는 피해 컴포넌트를 나타낼 수 있습니다. 그런 다음, 피해를 입을 각 컴포넌트의 인스턴스에서 슬롯 번호를 지정하여 GameplayAbility나 실행(Execution)에서 어떤 Attribute에 피해를 적용할지 알 수 있도록 합니다.

만약 Pawn이 가진 피해 컴포넌트가 최대 피해 슬롯 수보다 적거나 아예 없더라도, 동작하는 데에 큰 문제는 없습니다. AttributeSet에 Attribute가 있다고 해서 반드시 사용해야 하는 것은 아닙니다. 사용되지 않는 Attribute는 미미한 양의  메모리만 차지합니다.

하지만 서브 컴포넌트가 많은 Attribute를 가질 경우 서브 컴포넌트가 너무 많거나, 서브 컴포넌트가 분리되어 다른 플레이어와 공유되거나, 기타 이유로 이 방식이 적합하지 않다면 Attribute 대신 컴포넌트에서 일반적인 float 값을 저장하는 방식으로 변경하는 것이 좋습니다. 이 경우 [Item Attribute](https://github.com/tranek/GASDocumentation?tab=readme-ov-file#concepts-as-design-itemattributes)를 참고해보세요.

#### 4.4.2.2 런타임에 AttributeSet 추가 및 제거하기

AttributeSet은 런타임에 ASC에서 추가 및 제거할 수 있지만, 다소 위험할 수 있습니다. 예를 들어, 클라이언트에서 서버보다 먼저 AttributeSet을 제거한 후 서버에서 Attribute 값 변경이 클라이언트로 리플리케이트되면 클라이언트에서는 Attribute가 해당 AttributeSet을 찾지 못해 게임이 크래시가 일어날 수 있습니다.  
  
예시) 무기를 인벤토리에 추가할 때:


```C++
AbilitySystemComponent->GetSpawnedAttributes_Mutable().AddUnique(WeaponAttributeSetPointer);
AbilitySystemComponent->ForceReplication();
```

   
예시) 무기를 인벤토리에서 제거할 때:  

```C++
AbilitySystemComponent->GetSpawnedAttributes_Mutable().Remove(WeaponAttributeSetPointer);
AbilitySystemComponent->ForceReplication();
```

  
#### 4.4.2.3 아이템 Attribute (무기 탄약)  

Attribute를 가진 장착 가능한 아이템(무기 탄약, 방어구 내구도 등)을 구현하는 방법은 여러 가지가 있습니다. 이 모든 접근 방식은 아이템에 직접 값을 저장하며, 이는 여러 플레이어가 아이템을 장착할 수 있는 경우 필수적입니다.

> 1. 아이템에 float 사용(권장)  
> 2. 아이템에 별도의 AttributeSet 사용  
> 3. 아이템에 별도의 ASC 사용

##### 4.4.2.3.1 아이템에 일반 float 사용  

Attribute를 사용하는 대신, 아이템 클래스 인스턴스에 일반 float 값을 저장해보세요. 포트나이트와 GASShooter는 해당 방식으로 총기의 탄약을 관리합니다. 예를 들어, 총기의 경우 최대 탄창 크기, 현재 탄창 내 탄약, 보유 탄약 등을 총기 인스턴스에 COND_OwnerOnly로 리플리케이트된 float 값으로 직접 저장합니다. 무기가 보유 탄약을 공유한다면, 보유 탄약을 캐릭터의 Attribute로 옮겨 공유되는 탄약 AttributeSet에 저장할 수 있습니다(재장전 어빌리티는 Cost GE를 사용해 보유 탄약에서 탄창 내 탄약으로 이동시킬 수 있습니다). 현재 탄창 내 탄약을 Attribute로 사용하지 않기 때문에, UGameplayAbility의 일부 함수를 재정의하여 총기에서 float 값을 기준으로 비용을 확인하고 적용해야 합니다. GamepalyAbility를 부여할 때  총기를 GameplayAbilitySpec의 SourceObject로 설정하면, 어빌리티 내부에서 해당 어빌리티를 부여한 총기에 접근할 수 있습니다.

자동 사격 중 로컬 탄약 수가 리플리케이트되어 클라이언트 측 탄약 수가 서버의 탄약 수로 덮어씌워지지 않도록 하려면, PreReplication()에서 IsFiring GameplayTag가 있는 동안에는 리플리케이트를 비활성화하면 됩니다. 이로써 자체적으로 로컬 예측을 수행하게 됩니다. 


```C++
void AGSWeapon::PreReplication(IRepChangedPropertyTracker& ChangedPropertyTracker)
{
    Super::PreReplication(ChangedPropertyTracker);

    DOREPLIFETIME_ACTIVE_OVERRIDE(AGSWeapon, PrimaryClipAmmo, (IsValid(AbilitySystemComponent) && !AbilitySystemComponent->HasMatchingGameplayTag(WeaponIsFiringTag)));
    DOREPLIFETIME_ACTIVE_OVERRIDE(AGSWeapon, SecondaryClipAmmo, (IsValid(AbilitySystemComponent) && !AbilitySystemComponent->HasMatchingGameplayTag(WeaponIsFiringTag)));
}
```


장점:  
1. AttributeSet 사용의 제한을 피할 수 있습니다. (아래 참조)

한계:  
1. 기존 GameplayEffect 워크플로를 사용할 수 없음. (탄약 소모에 대한 Cost GE 등)  
2. UGameplayAbility의 주요 함수를 오버라이드하여 총기의 float 값에 대해 탄약 비용을 확인하고 적용해야 합니다.

  
##### 4.4.2.3.2 아이템의 AttributeSet

플레이어의 인벤토리에 아이템을 추가할 때 플레이어의 ASC에 추가되는 아이템에 별도의 AttributeSet을 사용하면 작동할 수 있지만 몇 가지 주요 제한사항이 있습니다. 제 경우 GASShooter 초기 버전에서 무기의 탄약 시스템에서 해당 방식을 사용한 적이 있습니다. 무기는 최대 탄창 크기, 현재 탄창에 있는 탄약, 예비 탄약 등과 같은 Attribute를 무기 클래스에 있는 AttributeSet에 저장합니다. 만약 무기가 예비 탄약을 공유하는 경우, 예비 탄약을 캐릭터의 공유 탄약 AttributeSet으로 이동시키는 것이 좋습니다. 무기가 서버에서 플레이어의 인벤토리에 추가되면, 무기는 자신의 AttributeSet을 플레이어의 ASC::SpawnedAttributes에 추가합니다. 그러면 서버는 이를 클라이언트에 리플리케이트합니다. 무기가 인벤토리에서 제거되면, 무기의 AttributeSet도 ASC::SpawnedAttributes에서 제거됩니다.  
  
AttributeSet이 소유자 액터가 아닌 다른 곳(예: 무기)에 있는 경우, 처음에는 AttributeSet에서 컴파일 오류가 발생할 수 있습니다. 이를 해결하려면 AttributeSet을 생성할 때 생성자 대신 BeginPlay()에서 생성하고 무기에IAbilitySystemInterface(플레이어 인벤토리에 무기를 추가할 때 ASC에 대한 포인터를 설정)를 구현하면 됩니다.


```C++
void AGSWeapon::BeginPlay()
{
    if (!AttributeSet)
    {
        AttributeSet = NewObject<UGSWeaponAttributeSet>(this);
    }
    //...
}
```

이 부분은 GASShooter의 이전 버전을 통해 확인할 수 있습니다.  
  
장점:  
1. 기존 GameplayAbility 및 GameplayEffect 워크플로를 사용할 수 있습니다. (탄약 사용에 대한 Cost GE 등)  
2. 아이템이 매우 적은 경우 설정이 간단합니다.

제한 사항:  
1. 모든 무기 유형에 대해 새로운 AttributeSet 클래스를 만들어야 합니다. Attribute를 변경하면 ASC의 SpawnedAttributes 배열에서 해당 AttributeSet 클래스의 첫 번째 인스턴스를 찾기 때문에 ASC는 기능적으로 한 클래스의 AttributeSet 인스턴스를 하나만 가질 수 있습니다. 동일한 AttributeSet 클래스의 인스턴스를 추가할 경우 무시됩니다. 플레이어의 인벤토리에는 각 유형의 무기가 하나씩만 지닐 수 있는데, 이는 앞서 설명한 AttributeSet 클래스당 하나의 AttributeSet 인스턴스만 허용하기 때문이었습니다.

2. AttributeSet을 제거하는 것은 위험합니다. GASShooter에서 플레이어가 로켓으로 자폭한 경우, 플레이어는 즉시 인벤토리에서 로켓 발사기를 제거(ASC에서 해당 AttributeSet 포함)합니다. 서버가 로켓 발사기의 탄약 Attribute 변경을 클라이언트에 리플리케이트할 때 해당 AttributeSet가 클라이언트의 ASC에 더 이상 존재하지 않게 되어 게임이 크래시합니다.

  
##### 4.4.2.3.3 아이템의 ASC

각 아이템에 AbilitySystemComponent를 전체적으로 넣는 것은 극단적인 접근 방식입니다. 저는 개인적으로 이 작업을 해본 적도 없고 본 적도 없습니다. 이렇게 작동하려면 많은 엔지니어링이 필요할 것입니다

> 질문: 여러 개의 AbilitySystemComponent를 동일한 소유자에게 두고, 서로 다른 아바타(예: pawn, 무기/아이템/투사체)에 대해 사용하려는 경우가 가능할까요? (소유자는 PlayerState로 설정)  
>   
> 
> 답변: 여기서 첫 번째로 보이는 문제는 소유자 액터에 IGameplayTagAssetInterface와 IAbilitySystemInterface를 구현하는 것입니다. 첫 번째는 가능할 수도 있습니다: 모든 ASC에서 태그를 집합으로 모은 후, HasAllMatchingGameplayTags를 각 ASC에 호출하고 결과를 OR 연산으로 합치는 방식으로 해결할 수 있습니다. 그러나 후자는 더 어려운 문제입니다: 어느 ASC가 권위 있는 것인가요? 누군가 GameplayEffect를 적용하려고 할 때, 어떤 ASC가 받아야 할까요? 이 문제는 해결할 수 있을지도 모르지만, 가장 어려운 부분이 될 것입니다. 소유자는 여러 개의 ASC를 갖게 됩니다. 그러나 pawn과 무기에 별도의 ASC를 사용하는 것은 그 자체로 의미가 있을 수 있습니다. 예를 들어, 무기를 설명하는 태그와 소유한 pawn을 설명하는 태그를 구분할 수 있습니다. 무기에게 부여된 태그가 소유자에게도 적용되며, 다른 객체에는 적용되지 않는 것이 의미 있을 수 있습니다(예: 속성과 GameplayEffect는 독립적이지만, 소유자는 위에서 설명한 대로 소유한 태그를 집합으로 모은다). 이것은 확실히 작동할 수 있습니다. 그러나 동일한 소유자에게 여러 개의 ASC를 사용하는 것은 문제가 될 수 있습니다.

[커뮤니티 질문에 대한 에픽 게임즈의 데이브 라티 답변](https://epicgames.ent.box.com/s/m1egifkxv3he3u3xezb9hzbgroxyhx89)  
  
장점:  
1. 기존 GameplayAbility 및 GameplayEffect 워크플로를 사용할 수 있습니다(탄약 사용에 대한 cost GE 등).  
2. AttributeSet 클래스 재사용 가능(각 무기의 ASC에 하나씩).  
   
제한 사항:  
1. 엔지니어링 비용이 어느 정도일지 알 수 없음.  
2. 이게 과연 가능한가?

  
### 4.4.3 Attribute 정의

Attribute는 AttributeSet의 헤더 파일에서 C++로만 정의할 수 있습니다. 이 매크로 블록을 모든 AttributeSet 헤더 파일의 맨 위에 추가하는 것이 좋습니다. **그러면 Attribute에 대한 게터 및 세터 함수가 자동으로 생성됩니다.**


```C++
// AttributeSet.h의 매크로 사용
#define ATTRIBUTE_ACCESSORS(ClassName, PropertyName) \
	GAMEPLAYATTRIBUTE_PROPERTY_GETTER(ClassName, PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_GETTER(PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_SETTER(PropertyName) \
	GAMEPLAYATTRIBUTE_VALUE_INITTER(PropertyName)
```

  
리플리케이트된 생명력 Attribute는 다음과 같이 정의할 수 있습니다:

```C++
UPROPERTY(BlueprintReadOnly, Category = "Health", ReplicatedUsing = OnRep_Health)
FGameplayAttributeData Health;
ATTRIBUTE_ACCESSORS(UGDAttributeSetBase, Health)
```

  
또한 헤더에 OnRep 함수를 정의합니다:


```C++
UPROPERTY(BlueprintReadOnly, Category = "Health", ReplicatedUsing = OnRep_Health)
FGameplayAttributeData Health;
ATTRIBUTE_ACCESSORS(UGDAttributeSetBase, Health)
```

   
AttributeSet의 .cpp 파일은 예측 시스템에서 사용하는 GAMEPLAYATTRIBUTE_REPNOTIFY 매크로로 OnRep 함수를 채워야 합니다:


```C++
void UGDAttributeSetBase::OnRep_Health(const FGameplayAttributeData& OldHealth)
{
    GAMEPLAYATTRIBUTE_REPNOTIFY(UGDAttributeSetBase, Health, OldHealth);
}
```

  
마지막으로, Attribute를 GetLifetimeReplicatedProps에 추가해야 합니다:


```C++
void UGDAttributeSetBase::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    DOREPLIFETIME_CONDITION_NOTIFY(UGDAttributeSetBase, Health, COND_None, REPNOTIFY_Always);
}
```

  
REPNOTIFY_Always는 (예측으로 인해) 로컬 값이 서버에서 내려오는 값과 이미 같은 경우 OnRep 함수가 트리거되도록 지시합니다. 기본적으로 로컬 값이 서버에서 피드백되는 값과 동일한 경우 OnRep 함수가 트리거되지 않습니다.  
  
Attribute가 Mata Attribute처럼 리플리케이트되지 않는 경우 OnRep 및 GetLifetimeReplicatedProps 단계를 건너뛸 수 있습니다.

  
### 4.4.4 Attribute 초기화하기

Attribute를 초기화하는 방법에는 여러 가지가 있습니다 (BaseValue와 그에 따른 CurrentValue를 초기값으로 설정하는 방법). 에픽 게임즈는 Instant GameplayEffect 사용을 권장합니다. 샘플 프로젝트에서도 이 방법을 사용했습니다.  
  
Attribute를 초기화하는 인스턴트 GameplayEffect를 만드는 방법은 샘플 프로젝트의 GE_HeroAttributes 블루프린트 문서를 참고하세요. 이 GameplayEffect의 적용은 C++에서 이루어집니다.  
  
Attribute를 정의할 때 ATTRIBUTE_ACCESSORS 매크로를 사용한 경우, 각 Attribute에 대한 초기화 함수가 각 AttributeSet에 자동으로 생성되어 C++에서 마음대로 호출할 수 있습니다.  
  


```C++
// InitHealth(float InitialValue)는 `ATTRIBUTE_ACCESSORS` 매크로로 정의된 Attribute 'Health'에 대해 자동으로 생성되는 함수입니다.
AttributeSet->InitHealth(100.0f);
```

> 💡 **NOTE**: PIE에서 여러 클라이언트를 사용하는 경우 Editor Preferences에서 Run Under One Process(하나의 프로세스 아래에서 실행)를 비활성화해야 합니다. 그렇지 않으면 파생 Attributes가 첫 번째 클라이언트가 아닌 다른 클라이언트에서 업데이트될 때 업데이트되지 않습니다.

  
### 4.4.5 PreAttributeChange()

PreAttributeChange(const FGameplayAttribute& Attribute, float& NewValue)는 변경이 일어나기 전에 Attribute의 CurrentValue 변경에 대응하는 AttributeSet의 주요 함수 중 하나입니다. 이 함수는 참조 매개변수 NewValue를 통해 들어오는 변경 사항을 CurrentValue에 클램핑하기에 이상적인 곳입니다.  
  
예를 들어 이동 속도 수정자를 클램프하려면 샘플 프로젝트에서 다음과 같이 합니다:


```C++
if (Attribute == GetMoveSpeedAttribute())
{
    // 150 units/s 미만으로 감속할 수 없고 1000 units/s 이상으로 부스트할 수 없습니다.
    NewValue = FMath::Clamp<float>(NewValue, 150, 1000);
}
```

  
이 함수는 AttributeSet.h (Definig Attritbute)의 매크로 블록에 정의된 Attribute Setter를 사용하든 GameplayEffect를 사용하든, Attribute을 변경할 때 트리거됩니다.  
  
참고: 여기서 발생하는 클램핑은 ASC의 모디파이어를 영구적으로 변경하지 않습니다. 모디파이어 쿼리에서 반환된 값만 변경합니다. 즉, GameplayEffectExecutionCalculations 및 ModifierMagnitudeCalculations와 같은 모든 모디파이어에서 CurrentValue 를 재계산하는 것은 클램핑을 다시 구현해야 한다는 뜻이죠.

> 💡 **NOTE**: 에픽 게임즈의 PreAttributeChange() 코멘트에 따르면 GameplayEvent에는 사용하지 말고 클램핑에 주로 사용하라고 합니다. Attribute 변경에 대한 GameplayEvent에 권장되는 위치는 UAbilitySystemComponent::GetGameplayAttributeValueChangeDelegate(FGameplayAttribute Attribute) (Attribute 변경에 대응하기)입니다.

   
### 4.4.6 PostGameplayEffectExecute()

PostGameplayEffectExecute(const FGameplayEffectModCallbackData & Data)는 인스턴트GameplayEffect로부터 Attribute의 베이스값이 변경된 이후에만 발동됩니다. GameplayEffect에서 Attribute가 변경될 때 더 많은 조작을 하기에 적합한 곳입니다.  
  
예를 들어, 샘플 프로젝트에서는 여기서 생명력 Attribute에서 최종 피해 Meta Attribute를 뺍니다. 보호막 Attribute가 있다면, 먼저 보호막 Attribute에서 데미지를 뺀 다음 나머지 데미지를 체력에서 뺄 것입니다. 샘플 프로젝트에서는 이 위치를 사용하여 타격 리액트 애니메이션을 적용하고, 플로팅 데미지 숫자를 표시하고, 킬러에게 경험치와 골드 현상금을 할당합니다. 설계 상 데미지 Meta Attribute는 항상 즉각적인 GameplayEffect를 통해 전달되며 Attribute Setter가 전달되지 않습니다.  
  
마나나 스태미나처럼 인스턴트 GameplayEffect를 통해서만 베이스값이 변경되는 다른 Attribute도 여기에서 최대값에 해당하는 Attribute에 클램핑할 수 있습니다.

> 💡 **NOTE**: PostGameplayEffectExecute()가 호출될 때 Attribute 변경은 이미 일어났지만, 아직 클라이언트에 리플리케이트되지 않았으므로 여기에 값을 클램핑해도 클라이언트에 두 번의 네트워크 업데이트가 일어나지 않습니다. 클라이언트는 클램핑 후에만 업데이트를 수신합니다.

  
### 4.4.7 OnAttributeAggregatorCreated()

OnAttributeAggregatorCreated(const FGameplayAttribute& Attribute, FAggregator* NewAggregator)는 해당 Set의 Attribute에 대한 Aggregator가 생성될 때 발동합니다. 이 함수를 통해 FAggregatorEvaluateMetaData를 커스텀 설정할 수 있습니다. AggregatorEvaluateMetaData는 Aggregator가 Attribute에 적용된 모든 모디파이어를 기반으로 Attribute의 현재값을 평가할 때 사용됩니다. 기본적으로 AggregatorEvaluateMetaData는 모든 긍정적인 모디파이어는 허용하지만 부정적인 모디파이어는 가장 부정적인 모디파이어로만 제한하는 MostNegativeMod_AllPositiveMods의 예를 사용하여 어떤 모디파이어가 자격이 있는지 결정하는 데만 Aggregator에서 사용됩니다. 파라곤에서는 모든 이동 속도 버프를 적용하면서 동시에 플레이어의 이동 속도 둔화 효과 수에 관계없이 가장 부정적인 이동 속도 둔화 효과만 적용하도록 허용하는 데 이 방법을 사용했습니다. 적용되지 않는 수식어는 여전히 ASC에 존재하지만, 최종 현재 값에 합산되지 않을 뿐입니다. 가장 마이너스인 모디파이어가 만료되면 다음으로 가장 마이너스인 모디파이어(존재하는 경우)가 자격을 얻는 경우와 같이 조건이 변경되면 나중에 자격을 얻을 수 있습니다.  
  
가장 마이너스인 모디파이어만 허용하고 모든 플러스적 모디파이어를 허용하는 예제에서 AggregatorEvaluateMetaData를 사용하려면 다음과 같아야 합니다.:


```C++
virtual void OnAttributeAggregatorCreated(const FGameplayAttribute& Attribute, FAggregator* NewAggregator) const override;
```


```C++
void UGSAttributeSetBase::OnAttributeAggregatorCreated(const FGameplayAttribute& Attribute, FAggregator* NewAggregator) const
{
	Super::OnAttributeAggregatorCreated(Attribute, NewAggregator);

	if (!NewAggregator)
	{
		return;
	}

	if (Attribute == GetMoveSpeedAttribute())
	{
		NewAggregator->EvaluationMetaData = &FAggregatorEvaluateMetaDataLibrary::MostNegativeMod_AllPositiveMods;
	}
}
```

   
한정자에 대한 커스텀 AggregatorEvaluateMetaData는 정적 변수로  
FAggregatorEvaluateMetaDataLibrary에 추가해야 합니다.


## 4.5 Gameplay Effect

### 4.5.1 Gameplay Effect 정의  

GameplayEffect(GameplayEffect, GE)는 Ability가 자신을 포함한 다른 객체의 Attribute 및 GameplayTag를 변경하기 위한 수단입니다. 즉각적인 Attribute 변화를 일으킬 수 있으며(예: 피해나 치유) 이동 속도 증가나 기절과 같은 장기적인 상태 버프/디버프를 적용할 수도 있습니다. UGameplayEffect 클래스는 단일 GameplayEffect를 정의하는 데이터 전용 클래스입니다. 추가적인 로직은 GameplayEffect에 포함되지 않아야 합니다. 보통 디자이너는 UGameplayEffect의 여러 블루프린트 자식 클래스를 생성하여 사용합니다.

GameplayEffect는 수정자(Modifier)와 실행(Execution, GameplayEffectExecutionCalculation)을 통해 속성을 변경합니다.

GameplayEffect에는 세 가지 지속 시간 유형이 있습니다: Instant, Duration, Infinite.

또한, GameplayEffect는 GameplayCue를 추가하거나 실행할 수 있습니다. Instant GameplayEffect는 GameplayCue GameplayTag에서 Execute를 호출하는 반면, Duration 또는 Infinite GameplayEffect는 GameplayCue GameplayTag에서 Add와 Remove를 호출합니다.

|   |   |   |
|---|---|---|
|지속 시간 유형|GameplayCue|이벤트 사용 시기|
|Instant|실행|Attribute의 BaseValue에 대한 즉각적인 영구 변경에 사용됩니다. GameplayTag는 적용되지 않으며, 심지어 한 프레임 동안에도 적용되지 않습니다.|
|Duration|추가 & 삭제|Attribute의 CurrentValue에 대한 임시 변경을 적용하고, GameplayEffect가 만료되거나 수동으로 제거될 때 제거될 GameplayTag를 적용하는 데 사용됩니다. Duration은 UGameplayEffect 클래스/Blueprint에서 지정됩니다.|
|Infinite|추가 & 삭제|Attribute의 CurrentValue에 대한 임시 변경과 GameplayTag를 적용하는 데 사용됩니다. 해당 태그들은 GameplayEffect가 제거될 때 함께 제거되며, 자동으로 만료되지 않으므로 Ability나 ASC(AbilitySystemComponent)를 통해 수동으로 제거해야 합니다.|

Duration 및 Infinite GameplayEffect는 지정된 주기(Period)마다 수정자(Modifier)와 실행(Execution)을 적용하는 Periodic Effect(주기적인 효과)를 적용할 수 있는 옵션이 있습니다. Periodic Effect는 Attribute의 BaseValue를 변경하거나 GameplayCue를 실행할 때 Instant GameplayEffect처럼 처리됩니다. 이러한 효과는 시간에 따른 피해(DOT, Damage Over Time) 유형의 효과에 유용합니다. 

> **💡 NOTE**: Periodic Effect는 예측할 수 없습니다.

Duration 및 Infinite GameplayEffect는 적용 후 Ongoing 태그 요구 사항이 충족되지 않거나 충족될 때, 일시적으로 꺼지거나 켜질 수 있습니다(GameplayEffect Tag). GameplayEffect를 끄면 수정자와 적용된 GameplayEffect의 효과는 제거되지만 GameplayEffect 자체는 제거되지 않습니다. GameplayEffect를 다시 켜면 수정자와 GameplayEffect가 다시 적용됩니다.

Duration 및 Infinite GameplayEffect의 수정자를 수동으로 다시 계산해야 하는 경우(예: 속성에서 가져오지 않는 데이터를 사용하는 MMC가 있는 경우), UAbilitySystemComponent::ActiveGameplayEffects.SetActiveGameplayEffectLevel(FActiveGameplayEffectHandle ActiveHandle, int32 NewLevel)를 호출하여 이미 가지고 있는 동일한 레벨을 적용할 수 있습니다. 이를 위해 UAbilitySystemComponent::ActiveGameplayEffects.GetActiveGameplayEffect(ActiveHandle).Spec.GetLevel()을 사용할 수 있습니다. Attribute에서 기반을 둔 수정자는 해당 Attribute가 업데이트될 때 자동으로 업데이트됩니다. SetActiveGameplayEffectLevel() 함수의 주요 기능은 수정자를 업데이트하는 것입니다:


```C++
MarkItemDirty(Effect);
Effect.Spec.CalculateModifierMagnitudes();
// Private 함수로 설정하여, 레벨을 중복으로 설정하거나 필요 이상으로 이 세 함수를 호출하지 않도록 방지합니다.
UpdateAllAggregatorModMagnitudes(Effect);
```

GameplayEffect는 일반적으로 인스턴스화되지 않습니다. Ability 또는 ASC가 GameplayEffect를 적용하려고 할 때 GameplayEffect의 ClassDefaultObject를 기반으로 GameworkEffectSpec을 생성합니다. 성공적으로 적용된 GameworkEffectSpec은 FAactiveGameplayEffect라는 새로운 구조체에 추가되며, 해당 구조체는 ASC가 ActiveGameplayEffect라는 특수한 컨테이너 구조체에서 관리합니다.

### 4.5.2 Gameplay Effect 적용  

GameplayEffect는 다양한 방법으로 적용할 수 있으며, 주로 GameplayAbility의 함수나 ASC의 함수를 통해 이루어집니다. 이러한 함수들은 보통 ApplyGameplayEffectTo 형식을 따르며, 결국에는 UAbilitySystemComponent::ApplyGameplayEffectSpecToSelf()를 호출하여 Target에 효과를 적용합니다.

예를 들어 GameplayAbility를 통해 GameplayEffect를 적용하는 방식이 아니라 투사체를 맞은 적에게 직접 효과를 적용하려는 경우, Target의 ASC를 가져온 다음 ASC의 함수를 사용하여 ApplyGameplayEffectToSelf를 호출해야 합니다.

ASC에서 Duration 또는 Infinite GameplayEffect가 적용될 때 이를 감지하려면, ASC의 Delegate에 바인딩하여 이벤트를 수신할 수 있습니다.


```C++
AbilitySystemComponent->OnActiveGameplayEffectAddedDelegateToSelf.AddUObject(this, &APACharacterBase::OnActiveGameplayEffectAddedCallback);
```

해당 콜백 함수입니다:

```C++
virtual void OnActiveGameplayEffectAddedCallback(UAbilitySystemComponent* Target, const FGameplayEffectSpec& SpecApplied, FActiveGameplayEffectHandle ActiveHandle);
```

서버는 리플리케이션 모드에 관계없이 항상 이 함수를 호출합니다. Autonomous Proxy는 리플리케이션 모드가 Full 혹은 Mixed인 상태에서 리플리케이트된 GameplayEffect에 대해서만 이 함수를 호출합니다. Simulated Proxy는 리플리케이션 모드가 Full인 경우에만 이 함수를 호출합니다.

### 4.5.3 Gameplay Effect 삭제

GameplayEffect는 GameplayAbility의 함수나 ASC의 함수를 통해 다양한 방식으로 제거할 수 있습니다. 일반적으로 RemoveActiveGameplayEffect 형식을 따르며, 이러한 함수들은 결국 Target의 FActiveGameplayEffectsContainer::RemoveActiveEffects()를 호출합니다.

예를 들어 GameplayAbility 외부에서 GameplayEffect를 제거할 경우 어떤 시스템이 특정 대상(Target)의 효과를 제거하려는 경우, 대상의 ASC를 가져온 뒤 ASC의 함수 중 하나를 사용하여 RemoveActiveGameplayEffect를 호출해야 합니다.

ASC에서 Duration 또는 Infinite GameplayEffect가 제거될 때 이를 감지하려면, ASC의 Delegate에 바인딩하여 해당 이벤트를 수신할 수 있습니다:


```
AbilitySystemComponent->OnAnyGameplayEffectRemovedDelegate().AddUObject(this, &APACharacterBase::OnRemoveGameplayEffectCallback);
```

해당 콜백 함수입니다:


```
virtual void OnRemoveGameplayEffectCallback(const FActiveGameplayEffect& EffectRemoved);
```

서버는 리플리케이션 모드에 관계없이 항상 이 함수를 호출합니다.  Autonomous Proxy는 리플리케이션 모드가 Full 혹은 Mixed인 상태에서 리플리케이트된 GameplayEffect에 대해서만 이 함수를 호출합니다. Simulated Proxy는 전체 리플리케이션 모드에서만 이 함수를 호출합니다.

### 4.5.4 Gameplay Effect 모디파이어

모디파이어는 Attribute를 변경하며, Attribute를 예측적으로 변경할 수 있는 유일한 방법입니다. GameplayEffect는 모디파이어를 0개 또는 여러 개 가질 수 있습니다. 각 모디파이어는 지정된 작업을 통해 하나의 Attribute만 변경할 수 있습니다.

|   |   |
|---|---|
|**동작**|**내용**|
|Add|모디파이어의 지정된 특성에 결과를 추가합니다. 빼기에는 음수 값을 사용합니다.|
|Multiply|결과를 모디파이어의 지정된 Attribute으로 곱합니다.|
|Divide|모디파이어의 지정된 Attribute에 대해 결과를 나눕니다.|
|Override|모디파이어의 지정된 Attribute을 결과로 재정의합니다.|

Attribute의 현재값은 기본값에 추가된 모든 모디파이어의 집계 결과입니다. 모디파이어가 집계되는 방식에 대한 공식은 GameplayEffectAggregator.cpp의 FAggregatorModChannel::EvaluateWithBase에 다음과 같이 정의되어 있습니다:

**((InlineBaseValue + Additive) * Multiplicitive) / Division**

모든 재정의 모디파이어는 최종값을 재정의하며 마지막으로 적용된 모디파이어가 우선합니다.

> 💡 **NOTE**: 백분율 기반 변경 사항의 경우 곱셈 작업을 사용하여 더하기 후에 변경이 이루어지도록 해야 합니다

> 💡 **NOTE**: 예측은 백분율 변경에 문제가 있습니다.

모디파이어에는 네 가지 유형이 있습니다: **Scalable **Float****, **Attribute Based**, **Custom Calculation Class**, **Set By Caller**입니다. 이들 모두는 연산에 따라 모디파이어의 지정된 Attribute를 변경하는 데 사용되는 일부 실수 값을 생성합니다.

|   |   |
|---|---|
|모디파이어 유형|내용|
|Scalable Float|FScalableFloat는 변수를 행으로, 레벨을 열로 가진 데이터 테이블을 가리킬 수 있는 구조체입니다. Scalable Float는 지정된 테이블 행의 값을 어빌리티의 현재 레벨(또는 GameplayEffectSpec에서 재정의된 경우 다른 레벨)에서 자동으로 읽습니다. 이 값은 계수를 통해 추가로 조작할 수 있습니다. 데이터 테이블/행이 지정되지 않은 경우, 값을 1로 취급하므로 계수를 사용하여 모든 레벨에서 단일 값으로 하드코딩할 수 있습니다.  <br>  <br><br>![](https://blog.kakaocdn.net/dn/nRu1f/btsjbpU4LaN/CzAcRAJtzwO6YpjNOPRdC1/img.png)|
|Attribute Based|Attribute 기반 모디파이어는 소스(GameplayEffectSpec을 생성한) 또는 타겟(GameplayEffectSpec을 수신한)에 있는 지원 Attribute의 CurrentValue 또는 BaseValue를 받아 계수와 사전 및 사후 계수 추가를 통해 추가로 수정합니다. 스냅샷은 GameplayEffectSpec이 생성될 때 지원 Attribute가 캡처되는 반면, 스냅샷이 없으면 GameplayEffectSpec이 적용될 때 Attribute가 캡처됩니다.|
|Custom Calculation Class|Custom Calculation 클래스는 복잡한 모디파이어에 가장 큰 유연성을 제공합니다. 이 모디파이어는 ModifierMagnitudeCalculation 클래스를 취하며 계수와 사전 및 사후 계수 추가를 통해 결과 부동 소수점 값을 추가로 조작할 수 있습니다.|
|Set By Caller|SetByCaller 모디파이어는 실행 시간에 어빌리티 또는 GameplayEffectSpec에서 GameplayEffectSpec을 만든 사람이 GameplayEffect 외부에 설정하는 값입니다. 예를 들어, 플레이어가 어빌리티를 충전하기 위해 버튼을 누른 시간에 따라 데미지를 설정하려는 경우 SetByCaller를 사용할 수 있습니다. SetByCaller는 본질적으로 GameplayEffectSpec에 있는 TMap<FGameplayTag, float> 입니다. 모디파이어는 Aggregator에 제공된 GameplayTag와 연관된 SetByCaller 값을 찾으라고 지시하는 것뿐입니다. 모디파이어가 사용하는 SetByCaller는 GameplayTag 버전 개념만 사용할 수 있습니다. 여기서 FName 버전은 비활성화됩니다. 모디파이어가 SetByCaller로 설정되어 있지만 GameplayEffectSpec에 올바른 GameplayTag를 가진 SetByCaller가 존재하지 않는 경우, 게임은 런타임 오류를 발생시키고 0 값을 반환합니다. 이는 분할 작업의 경우 문제를 일으킬 수 있습니다. SetByCaller 사용 방법에 대한 자세한 내용은 SetByCaller를 참조하십시오.|

#### 4.5.4.1 곱셈 및 나눗셈 모디파이어

기본적으로 모든 곱셈 및 나눗셈 모디파이어는 Attribute 기본값으로 곱하거나 나누기 전에 함께 추가됩니다.


```
float FAggregatorModChannel::EvaluateWithBase(float InlineBaseValue, const FAggregatorEvaluateParameters& Parameters) const
{
	...
	float Additive = SumMods(Mods[EGameplayModOp::Additive], GameplayEffectUtilities::GetModifierBiasByModifierOp(EGameplayModOp::Additive), Parameters);
	float Multiplicitive = SumMods(Mods[EGameplayModOp::Multiplicitive], GameplayEffectUtilities::GetModifierBiasByModifierOp(EGameplayModOp::Multiplicitive), Parameters);
	float Division = SumMods(Mods[EGameplayModOp::Division], GameplayEffectUtilities::GetModifierBiasByModifierOp(EGameplayModOp::Division), Parameters);
	...
	return ((InlineBaseValue + Additive) * Multiplicitive) / Division;
	...
}
```


```
float FAggregatorModChannel::SumMods(const TArray<FAggregatorMod>& InMods, float Bias, const FAggregatorEvaluateParameters& Parameters)
{
	float Sum = Bias;

	for (const FAggregatorMod& Mod : InMods)
	{
		if (Mod.Qualifies())
		{
			Sum += (Mod.EvaluatedMagnitude - Bias);
		}
	}

	return Sum;
}
```


곱셈 및 나눗셈 모디파이어 모두 이 공식에서 치우침 값이 1입니다.(추가는 치우침이 0입니다)

따라서 다음과 같이 표시됩니다:

**1 + (Mod1.Magnitude - 1) + (Mod2.Magnitude - 1) + ...**

이 공식은 예상치 못한 결과를 초래합니다. 첫째, 이 수식은 모든 모디파이어를 더한 다음 기본값에 곱하거나 나누기 전에 모든 모디파이어를 합칩니다. 대부분의 사람들은 이 수식이 수식들을 곱하거나 나눌 것이라고 예상할 것입니다. 예를 들어 1.5의 Multiply 모디파이가 두 개 있는 경우 대부분의 사람들은 기본값에 1.5 x 1.5 = 2.25를 곱할 것으로 예상합니다. 대신 1.5초를 합산하여 기본값에 2를 곱합니다. (50% 증가 + 또 다른 50% 증가 = 100% 증가) 기본 속도 500에 10% 속도 버프를 적용하면 550이 되는 GameplayPrediction.h의 예시입니다. 10% 속도 버프를 하나 더 추가하면 600이 됩니다.

둘째, 이 공식은 파라곤을 염두에 두고 설계되었기 때문에 사용할 수 있는 값에 대한 문서화되지 않은 규칙이 몇 가지 있습니다.

곱하기와 나누기 곱셈 덧셈 공식에 대한 규칙:

- (No more than one value < 1) AND (Any number of values [1, 2))
- OR (One value >= 2)

수식의 바이어스는 기본적으로 [1, 2] 범위에 있는 숫자의 정수 자릿수를 뺍니다. 첫 번째 모디파이어의 Bias는 시작 Sum 값(루프 전에 Bias로 설정됨)에서 빼기 때문에 어떤 값이든 그 자체로 작동하며, [1, 2] 범위의 숫자에 대해 1 미만의 값이 작동하는 이유이기도 합니다.

곱하기의 몇 가지 예시:

**승수: 0.5**

**1 + (0.5 - 1) = 0.5, correct**

**승수: 0.5, 0.5**

**1 + (0.5 - 1) + (0.5 - 1) = 0**

혹시 1을 예상하셨나요? 1보다 작은 여러 값은 승수를 더하는 데 적합하지 않습니다. 파라곤은 곱하기 모디파이어에 가장 큰 음수값만 사용하도록 설계되었기 때문에 1보다 작은 값은 최대 하나만 기본값에 곱할 수 있습니다.

**승수: 1.1, 0.5**

**1 + (0.5 - 1) + (1.1 - 1) = 0.6, correct**

**승수: 5, 5**

**1 + (5 - 1) + (5 - 1) = 9**

혹시 10을 예상하셨나요? 항상 모디파이어의 합계 - 모디파이어 수 + 1이 됩니다.

많은 게임에서 곱하기 및 나누기 모디파이어가 기본값에 적용하기 전에 함께 곱하고 나누기를 원할 것입니다. 이를 위해서는 FAggregatorModChannel::EvaluateWithBase()에 대한 엔진 코드를 변경해야 합니다.


```
float FAggregatorModChannel::EvaluateWithBase(float InlineBaseValue, const FAggregatorEvaluateParameters& Parameters) const
{
    ...
    float Multiplicitive = MultiplyMods(Mods[EGameplayModOp::Multiplicitive], Parameters);
    float Division = MultiplyMods(Mods[EGameplayModOp::Division], Parameters);
    ...

    return ((InlineBaseValue + Additive) * Multiplicitive) / Division;
}
```


```
float FAggregatorModChannel::MultiplyMods(const TArray<FAggregatorMod>& InMods, const FAggregatorEvaluateParameters& Parameters)
{
    float Multiplier = 1.0f;

    for (const FAggregatorMod& Mod : InMods)
    {
        if (Mod.Qualifies())
        {
            Multiplier *= Mod.EvaluatedMagnitude;
        }
    }

    return Multiplier;
}
```

#### 4.5.4.2 모디파이어의 GameplayTag

소스 태그와 타겟 태그는 각 모디파이어에 대해 설정할 수 있습니다. GameplayEffect의 애플리케이션 태그 요건과 동일하게 작동합니다. 따라서 태그는 이펙트가 적용될 때만 고려됩니다. 즉, 주기적인 무한 이펙트가 있는 경우 이펙트가 처음 적용될 때만 고려되고 주기적으로 실행될 때마다 고려되지 않습니다.

Attribute 기반 모디파이어는 SourceTagFilter 및 TargetTagFilter도 설정할 수 있습니다. Attribute 기반 모디파이어의 소스인 속성의 크기를 결정할 때 이러한 필터를 사용하여 해당 속성에 대한 특정 모디파이어를 제외할 수 있습니다. 소스 또는 대상에 필터의 모든 태그가 없는 모디파이어는 제외됩니다.

자세히 설명합니다: 소스 ASC와 타깃 ASC의 태그는 GameplayEffect에 의해 캡처됩니다. 소스 ASC 태그는 GameplayEffectSpec이 생성될 때 캡처되고, 이펙트가 실행될 때 타겟 ASC 태그가 캡처됩니다. infinite 또는 duration Effect의 모디파이어가 적용될 "자격"이 있고(즉, 해당 Aggregator가 자격이 있음) 해당 필터가 설정되어 있는지 확인할 때 캡처된 태그가 필터와 비교됩니다.

### 4.5.5 Gameplay Effect Stacking(중첩)

기본적으로 GameplayEffect는 애플리케이션의 기존 GameplayEffectSpec 인스턴스를 모르거나 신경쓰지 않는 새 GameplayEffectSpec 인스턴스를 적용합니다. GameplayEffect는 GameplayEffectSpec의 새 인스턴스가 추가되는 대신 현재 존재하는 GameplayEffectSpec의 스택 수가 변경되도록 스택을 설정할 수 있습니다. 스택은 지속시간 및 무한 GameplayEffect에 대해서만 작동합니다.

Stacking에는 두 가지 유형이 있습니다: 소스별 집계와 대상별 집계입니다.

|   |   |
|---|---|
|Stacking Type|내용|
|Aggregate by Source|타겟의 소스 ASC 당 별도의 스택 인스턴스가 있습니다. 각 소스는 X만큼의 스택을 적용할 수 있습니다.|
|Aggregate by Target|소스에 관계없이 타겟에는 스택 인스턴스가 하나만 있습니다. 각 소스는 공유 스택 한도까지 스택을 적용할 수 있습니다.|

스택에는 만료, 기간 새로고침, 기간 재설정에 대한 정책(Policy)도 있습니다. GameplayEffect 블루프린트에는 유용한 호버 툴팁이 있습니다.

샘플 프로젝트에는 GameplayEffectSpec 변경을 수신하는 커스텀 블루프린트 노드가 포함되어 있습니다. HUD UMG 위젯은 이를 사용하여 플레이어가 보유한 패시브 방어구 스택의 양을 업데이트합니다. 이 AsyncTask는 UMG 위젯의 Destruct 이벤트에서 수동으로 EndTask()를 호출할 때까지 영원히 살아있을 것입니다. AsyncTaskEffectStackChanged.h/cpp 를 참고하세요.

![](https://blog.kakaocdn.net/dn/bCsDmX/btsi6RrPUAk/rQGykPd6y7xV2ypAgI6wu1/img.png)

### 4.5.6 어빌리티 부여

GameplayEffect는 ASC에 새로운 GameplayAbility를 부여할 수 있습니다. Duration 혹은 Infinite GameplayEffect만 Ability를 부여할 수 있습니다.

일반적인 사용 사례는 다른 플레이어를 밀치거나 당겨서 이동시키는 것과 같은 동작을 강제로 수행하려는 경우입니다. 플레이어에게 원하는 동작을 하는 자동 활성화 어빌리티를 부여하는 GameplayEffect를 적용하면 됩니다. (어빌리티가 부여되면 동으로 활성화하는 방법은 패시브 어빌리티를 참조하세요)  
  
디자이너는 GameplayEffect가 부여하는 어빌리티, 부여할 레벨, 바인딩할 입력, 부여된 어빌리티의 제거 정책(Removal Policy)을 선택할 수 있습니다.

|   |   |
|---|---|
|Removal Policy|내용|
|Cancel Ability Immediately|부여된 어빌리티는 해당 어빌리티를 부여한 GameplayEffect가 대상에서 제거되면 즉시 취소되고 제거됩니다.|
|Remove Ability on End|부여된 어빌리티는 완료될 때까지 허용된 다음 대상에서 제거됩니다.|
|Do Nothing|부여된 어빌리티는 대상에서 부여된 GameplayEffect를 제거해도 영향을 받지 않습니다. 대상은 나중에 수동으로 제거할 때까지 영구적으로 능력을 보유합니다.|

### 4.5.7 Gameplay Effect Tag

GameplayEffect는 여러 GameplayTagContainer를 포함합니다. 디자이너는 각 카테고리에 대해 추가된 GameplayTagContainer와 제거된 GameplayTagContainer를 편집하고, 그 결과는 컴파일 시 결합된 GameplayTagContainer에 표시됩니다. 추가된 태그는 이 GameplayEffect가 부모 클래스에 없던 새 태그를 추가하는 것입니다. 제거된 태그는 부모 클래스에는 있지만 이 서브클래스에는 없는 태그입니다.

|   |   |
|---|---|
|카테고리|내용|
|Gameplay Effect Asset Tags|GameplayEffect에 있는 태그입니다. 자체적으로 어떤 기능도 수행하지 않으며 GameplayEffect를 설명하는 용도로만 사용됩니다.|
|Granted Tags|GameplayEffect에 존재하지만 GameplayEffect가 적용되는 ASC에도 부여되는 태그입니다. GameplayEffect가 제거되면 ASC에서 제거됩니다. 이는 지속 시간 및 무한 GameplayEffect에 대해서만 작동합니다.|
|Ongoing Tag Requirements|이 태그가 적용되면 GameplayEffect가 켜져 있는지 꺼져 있는지를 결정합니다. GameplayEffect는 꺼져 있어도 여전히 적용될 수 있습니다. 진행 중 태그 요건을 충족하지 못해 GameplayEffect가 꺼져 있지만 요건이 충족되면 GameplayEffect가 다시 켜지고 해당 모디파이가 다시 적용됩니다. 이는 지속시간 및 무한 GameplayEffect에 대해서만 작동합니다.|
|Application Tag Requirements|GameplayEffect를 대상에 적용할 수 있는지 여부를 결정하는 대상의 태그입니다. 이러한 요구 사항이 충족되지 않으면 GameplayEffect가 적용되지 않습니다.|
|Remove Gameplay Effects with Tags|에셋 태그 또는 부여된 태그에 이러한 태그가 있는 대상의 GameplayEffect는 이 GameplayEffect가 성공적으로 적용되면 대상에서 제거됩니다.|

### 4.5.8 면역

GameplayEffect는 GameplayTag를 기반으로 다른 GameplayEffect의 적용을 효과적으로 차단하는 면역을 부여할 수 있습니다. 면역은 애플리케이션 태그 요구사항과 같은 다른 수단을 통해서도 효과적으로 달성할 수 있지만, 이 시스템을 사용하면 면역으로 인해 GameplayEffect가 차단될 때를 위한 델리게이트 UAbilitySystemComponent::OnImmunityBlockGameplayEffectDelegate를 제공합니다.  
  
GrantedApplicationImmunityTags는 소스 ASC(소스 어빌리티의 AbilityTags에 태그가 있는 경우 그 태그 포함)에 지정된 태그가 있는지 확인합니다. 태그를 기반으로 특정 캐릭터 또는 소스의 모든 GameplayEffect에 대한 면역을 부여하는 방법입니다.  
  
부여된 애플리케이션 면역 쿼리는 들어오는 GameplayEffectSpec이 쿼리 중 하나라도 일치하는지 확인하여 해당 애플리케이션을 차단하거나 허용합니다.  
  
쿼리에는 GameplayEffect 블루프린트에 유용한 호버 툴팁이 있습니다.

### 4.5.9 Gameplay Effect Spec

GameplayEffectSpec(GESpec)은 **GameplayEffect의 인스턴스**라고 생각하면 됩니다. 이 인스턴스에는 해당 인스턴스가 나타내는 GameplayEffect 클래스, 생성된 레벨, 생성자가 누구인지에 대한 레퍼런스가 들어 있습니다. 디자이너가 런타임 전에 생성해야 하는 GameplayEffect와는 달리 런타임 전에 자유롭게 생성하고 수정할 수 있습니다. GameplayEffect를 적용할 때, GameplayEffect로부터 GameplayEffectSpec이 생성되고 이것이 실제로 타겟에 적용됩니다.  
  
GameplayEffectSpec은 블루프린트 콜러블인 UAbilitySystemComponent::MakeOutgoingSpec()을 사용하여 GameplayEffect로부터 생성됩니다. GameplayEffectSpec을 즉시 적용할 필요는 없습니다. 어빌리티에서 생성된 프로젝타일에 GameplayEffectSpec을 전달하여 나중에 그 프로젝타일이 타격하는 타깃에 적용할 수 있도록 하는 것이 일반적입니다. GameplayEffectSpec가 성공적으로 적용되면 FActiveGameplayEffect라는 새 구조체를 반환합니다.

참고해두면 좋은 GameplayEffectSpec 내용입니다:

- 이 GameplayEffect가 생성된 GameplayEffect 클래스입니다.
- 이 GameplayEffectSpec의 레벨입니다. 보통 GameplayEffectSpec을 생성한 어빌리티의 레벨과 같지만 다를 수 있습니다.
- GameplayEffectSpec의 지속시간입니다. 기본값은 GameplayEffect 의 지속시간이지만 다를 수 있습니다.
- 주기적 이펙트의 GameplayEffectSpec 기간입니다. 기본값은 GameplayEffect의 기간이지만 다를 수 있습니다.
- 이 GameplayEffectSpec의 현재 스택 수입니다. 스택 제한은 GameplayEffect에 있습니다.  
    GameplayEffectContextHandle](<[https://github.com/tranek/GASDocumentation/tree/master#concepts-ge-context](https://github.com/tranek/GASDocumentation/tree/master#concepts-ge-context)>)은 누가 이 GameplayEffectSpec을 생성했는지 알려줍니다.
- GameplayEffectSpec 생성 시 스냅샷으로 인해 캡처된 어트리뷰트입니다.
- GameplayEffect가 부여하는 GameplayTag 외에 GameplayEffect가 타겟에 부여하는 DynamicGrantedTags 입니다.
- GameplayEffect가 가진 애셋 태그 외에 GameplayEffectSpec이 가진 동적 애셋 태그입니다.
- SetByCaller TMap.

#### 4.5.9.1 SetByCaller

SetByCaller를 사용하면 GameplayEffectSpec에 GameplayTag 또는 FName 과 연관된 float 값을 전달할 수 있습니다. 그 값은 각각의 TMap에 저장됩니다: TMap<FGameplayTag, float> 및 TMap<FName, float>에 저장됩니다. 이들은 GameplayEffect의 모디파이어로 사용하거나 float를 이리저리 옮기는 일반적인 수단으로 사용할 수 있습니다. 어빌리티 내부에서 생성된 수치 데이터는 SetByCaller를 통해 GameplayEffectExecutionCalculation 또는 ModifierMagnitudeCalculation에 전달하는 것이 일반적입니다.

|   |   |
|---|---|
|SetByCaller|사용 방|
|Modifiers|GameplayEffect 클래스에서 미리 정의해야 합니다. GameplayTag 버전만 사용할 수 있습니다. GameplayEffect 클래스에 정의되어 있지만 GameplayEffectSpec에 해당 태그와 실수 값 쌍이 없는 경우, 게임에서 GameplayEffectSpec을 적용할 때 런타임 오류가 발생하고 0을 반환합니다. 이는 나누기 연산에서 발생할 수 있는 문제입니다. [https://github.com/tranek/GASDocumentation#concepts-ge-mods](https://github.com/tranek/GASDocumentation#concepts-ge-mods)을 참조하십시오.|
|Elsewhere|어디에도 미리 정의할 필요가 없습니다. GameplayEffectSpec에 존재하지 않는 SetByCaller를 읽으면 선택적 경고와 함께 개발자가 정의한 기본값을 반환할 수 있습니다.|

블루프린트에서 SetByCaller 값을 할당하려면, 필요한 버전에 대한 블루프린트 노드(GameplayTag 또는 FName) 노드를 사용합니다.

![](https://blog.kakaocdn.net/dn/cXCxXc/btsjeYvp5KW/iKOMW1PKIkkK88l2UGmFG0/img.png)

블루프린트에서 SetByCaller 값을 읽으려면, 블루프린트 라이브러리에서 커스텀 노드를 만들어야 합니다.  
C++에서 SetByCaller 값을 할당하려면 필요한 함수 버전(GameplayTag 또는 FName)을 사용하세요:


```
void FGameplayEffectSpec::SetSetByCallerMagnitude(FName DataName, float Magnitude);
```


```
void FGameplayEffectSpec::SetSetByCallerMagnitude(FGameplayTag DataTag, float Magnitude);
```

C++에서 SetByCaller 값을 읽으려면 필요한 함수 버전(GameplayTag 또는 FName)을 사용하세요:


```
float GetSetByCallerMagnitude(FName DataName, bool WarnIfNotFound = true, float DefaultIfNotFound = 0.f) const;
```


```
float GetSetByCallerMagnitude(FGameplayTag DataTag, bool WarnIfNotFound = true, float DefaultIfNotFound = 0.f) const;
```

FName 버전보다 GameplayTag 버전을 사용하는 것이 좋습니다. 이렇게 하면 블루프린트에서 철자 오류를 방지할 수 있습니다.

### 4.5.10 Gameplay Effect Context

GameplayEffectContext 구조체에는 GameplayEffectSpec의 instigator와 타깃 데이터에 대한 정보가 들어있습니다. 이 구조체는 ModifierMagnitudeCalculation / GameplayEffectExecutionCalculation, AttributeSet, GameplayCue 같은 곳에 임의의 데이터를 전달하기 위한 서브클래스로도 좋은 구조체입니다.

GameplayEffectContext를 서브클래싱합니다:

1. 서브클래스 FGameplayEffectContext
2. Override FGameplayEffectContext::GetScriptStruct()
3. FGameplayEffectContext::GetScriptStruct() 재정의
4. 새 데이터를 리플리케이트해야 하는 경우 FGameplayEffectContext::NetSerialize() 를 오버라이드합니다.
5. 부모 구조체 FGameplayEffectContext 에 있는 것처럼 서브클래스에 TStructOpsTypeTraits 를 구현합니다.
6. AbilitySystemGlobals 클래스에서 AllocGameplayEffectContext()를 오버라이드하여 서브클래스의 새 오브젝트를 반환합니다.

[GASShooter](https://github.com/tranek/GASShooter)는 서브클래싱된 GameplayEffectContext를 사용하여 GameplayCue에서 액세스할 수 있는 타겟 데이터를 추가하는데, 특히 산탄총은 적을 두 명 이상 맞출 수 있기 때문입니다.

### 4.5.11 Modifier Magnitude Calculation

ModifierMagnitudeCalculation(ModMagCalc 또는 MMC)는 ameplayEffect에서 모디파이어로 사용되는 강력한 클래스입니다. GameplayEffectExecutionCalculation와 비슷하게 작동하지만 덜 강력하며 가장 중요한 것은 예측할 수 있다는 점입니다. 이 함수의 유일한 목적은 CalculateBaseMagnitude_Implementation()에서 실수 값을 반환하는 것입니다. 블루프린트와 C++에서 이 함수를 서브클래싱하고 오버라이드할 수 있습니다.

MMC는 인스턴트, 지속시간, 무한, 주기적 등 모든 GameplayEffect의 지속시간에 사용할 수 있습니다.  
  
MMC의 강점은 GameplayTag와 SetByCaller를 읽기 위해 GameplayEffectSpec에 대한 전체 액세스 권한으로 GameplayEffect의 소스 또는 타깃에서 원하는 수의 어트리뷰트 값을 캡처할 수 있다는 점입니다. 어트리뷰트는 스냅샷할 수도 있고 아닐 수도 있습니다. 스냅샷 어트리뷰트는 GameplayEffectSpec이 생성될 때 캡처되는 반면, 스냅샷이 아닌 어트리뷰트는 GameplayEffectSpec이 적용될 때 캡처되어 무한 및 지속시간 GameplayEffect에 대해 어트리뷰트가 변경되면 자동으로 업데이트됩니다. 어트리뷰트 캡처는 ASC 의 기존 모드로부터 CurrentValue 를 재계산합니다. 이 재계산은 어빌리티 세트에서 PreAttributeChange()를 실행하지 않으므로 여기서 클램핑을 다시 해야 합니다.

|   |   |   |   |
|---|---|---|---|
|Snapshot|Source or Target|Captured on GameplayEffectSpec|Automatically updates when Attribute changes for Infinite or Duration GE|
|Yes|Source|Creation|No|
|Yes|Target|Application|No|
|No|Source|Application|Yes|
|No|Target|Application|Yes|

MMC의 결과 float는 GameplayEffect의 모디파이어에서 계수와 사전 및 사후 계수 추가를 통해 추가로 수정할 수 있습니다.  
  
예를 들어 대상의 마나 속성을 캡처하는 MMC는 대상의 마나 양과 대상에 있을 수 있는 태그에 따라 감소량이 달라지는 독 효과에서 마나를 감소시킵니다:


```
UPAMMC_PoisonMana::UPAMMC_PoisonMana()
{

    //ManaDef defined in header FGameplayEffectAttributeCaptureDefinition ManaDef;
    ManaDef.AttributeToCapture = UPAAttributeSetBase::GetManaAttribute();
    ManaDef.AttributeSource = EGameplayEffectAttributeCaptureSource::Target;
    ManaDef.bSnapshot = false;

    //MaxManaDef defined in header FGameplayEffectAttributeCaptureDefinition MaxManaDef;
    MaxManaDef.AttributeToCapture = UPAAttributeSetBase::GetMaxManaAttribute();
    MaxManaDef.AttributeSource = EGameplayEffectAttributeCaptureSource::Target;
    MaxManaDef.bSnapshot = false;

    RelevantAttributesToCapture.Add(ManaDef);
    RelevantAttributesToCapture.Add(MaxManaDef);
}

float UPAMMC_PoisonMana::CalculateBaseMagnitude_Implementation(const FGameplayEffectSpec& Spec) const
{
    // Gather the tags from the source and target as that can affect which buffs should be used
    const FGameplayTagContainer* SourceTags = Spec.CapturedSourceTags.GetAggregatedTags();
    const FGameplayTagContainer* TargetTags = Spec.CapturedTargetTags.GetAggregatedTags();

    FAggregatorEvaluateParameters EvaluationParameters;
    EvaluationParameters.SourceTags = SourceTags;
    EvaluationParameters.TargetTags = TargetTags;

    float Mana = 0.f;
    GetCapturedAttributeMagnitude(ManaDef, Spec, EvaluationParameters, Mana);
    Mana = FMath::Max<float>(Mana, 0.0f);

    float MaxMana = 0.f;
    GetCapturedAttributeMagnitude(MaxManaDef, Spec, EvaluationParameters, MaxMana);
    MaxMana = FMath::Max<float>(MaxMana, 1.0f); // Avoid divide by zero

    float Reduction = -20.0f;
    if (Mana / MaxMana > 0.5f)
    {
        // Double the effect if the target has more than half their mana
        Reduction *= 2;
    }

    if (TargetTags->HasTagExact(FGameplayTag::RequestGameplayTag(FName("Status.WeakToPoisonMana"))))
    {
        // Double the effect if the target is weak to PoisonMana
        Reduction *= 2;
    }

    return Reduction;
}
```

### 4.5.12 Gameplay Effect Execution Calculation

GameplayEffect Execution Calculation(실행 계산. 플러그인 소스 코드에서 이 용어를 자주 볼 수 있음.)은 GameplayEffect가 ASC를 변경할 수 있는 가장 강력한 방식입니다. ModifierMagnitudeCalculations와 마찬가지로 어트리뷰트를 캡처하고 선택적으로 스냅샷을 찍을 수 있습니다. MMC와 달리 둘 이상의 어트리뷰트를 변경할 수 있으며 기본적으로 프로그래머가 원하는 모든 것을 할 수 있습니다. 이러한 강력한 성능과 유연성의 단점은 예측할 수 없으며 C++로 구현해야 한다는 것입니다.  
  
ExecutionCalculation는 인스턴트 및 주기적 GameplayEffect와만 사용할 수 있습니다. '실행'이라는 단어가 들어간 것은 일반적으로 이 두 가지 유형의 GameplayEffect를 나타냅니다.  
  
스냅샷을 하면 GameplayEffectSpec이 생성될 때 어트리뷰트를 캡처하는 반면, 스냅샷을 하지 않으면 GameplayEffectSpec이 적용될 때 어트리뷰트를 캡처합니다. 어트리뷰트를 캡처하면 ASC 의 기존 모드에서 CurrentValue 를 재계산합니다. 이 재계산은 어빌리티 세트에서 PreAttributeChange()를 실행하지 않으므로 여기서 클램핑을 다시 수행해야 합니다.

|   |   |   |
|---|---|---|
|스냅샷|Source 혹은 Target|GameplayEffectSpec에 캡처|
|Yes|Source|Creation|
|Yes|Target|Application|
|No|Source|Application|
|No|Target|Application|

어트리뷰트 캡처를 설정하려면, 에픽의 ActionRPG 샘플 프로젝트에서 제시하는 패턴을 따라 어트리뷰트를 보유하는 구조체를 정의하고 캡처 방법을 정의한 다음 구조체의 생성자에서 그 사본 하나를 생성합니다. 모든 ExecCalc에 대해 이와 같은 구조체를 갖게 됩니다. 참고: 각 구조체는 동일한 네임스페이스를 공유하므로 고유한 이름이 필요합니다. 구조체에 동일한 이름을 사용하면 속성 캡처 시 잘못된 동작이 발생할 수 있습니다. (대부분 잘못된 속성 값을 캡처)  
  
로컬 예측, 서버 전용, 서버 시작 GameplayAbility의 경우, ExecCalc 는 서버에서만 호출합니다.  
  
소스 및 타깃의 여러 어트리뷰트에서 읽은 복잡한 수식을 기반으로 받는 대미지를 계산하는 것이 ExecCalc의 가장 일반적인 예입니다. 포함된 샘플 프로젝트에는 GameplayEffectSpec의 SetByCaller에서 대미지 값을 읽은 다음 타깃에서 캡처한 방어구 어트리뷰트를 기반으로 그 값을 완화하는 간단한 대미지 계산용 ExecCalc 가 있습니다. GDDamageExecCalculation.cpp/.h를 참조하세요.

#### 4.5.12.1  Execution Calculation 실행 계산에 데이터 보내기

속성을 캡처하는 것 외에도 몇 가지 방법으로 데이터를 실행 계산으로 전송할 수 있습니다.

##### 4.5.12.1.1 SetByCaller

GameplayEffectSpec에 설정된 모든 SetByCaller는 실행 계산에서 직접 읽을 수 있습니다.


```
const FGameplayEffectSpec& Spec = ExecutionParams.GetOwningSpec();
float Damage = FMath::Max<float>(Spec.GetSetByCallerMagnitude(FGameplayTag::RequestGameplayTag(FName("Data.Damage")), false, -1.0f), 0.0f);
```

##### 4.5.12.1.2 Backing Data Attribute Calculation Modifier

GameplayEffect에 값을 하드코딩하려면, 캡처한 어트리뷰트 중 하나를 백업 데이터로 사용하는 CalculationModifier를 사용하여 값을 전달하면 됩니다.  
  
이 스크린샷 예제에서는 캡처한 대미지 어트리뷰트에 50을 추가하고 있습니다. 오버라이드로 설정하여 하드코딩된 값만 가져오도록 할 수도 있습니다.

![](https://blog.kakaocdn.net/dn/YRAkP/btsjdmDi8bl/e94KST4dGUhQp5j6JsOFN0/img.png)

실행 계산은 어트리뷰트를 캡처할 때 이 값을 읽습니다.

cpp

접기

```
float Damage = 0.0f;
// Capture optional damage value set on the damage GE as a CalculationModifier under the ExecutionCalculation
ExecutionParams.AttemptCalculateCapturedAttributeMagnitude(DamageStatics().DamageDef, EvaluationParameters, Damage);
```

##### 4.5.12.1.3 Backing Data Temporary Variable Calculation Modifier

GameplayEffect에 값을 하드코딩하려면, C++에서 호출되는 임시 변수 또는 트랜지언트 Aggregator를 사용하는 계산 모디파이어를 사용하여 값을 전달하면 됩니다. 임시 변수는 GameplayTag에 연결됩니다.

이 스크린샷 예제에서는 Data.Damage GameplayTag를 사용하여 임시 변수에 50을 추가하고 있습니다.

![](https://blog.kakaocdn.net/dn/SJXrK/btsnFE7QTNG/7sKW9gOPVve8zKECjezHR0/img.png)

백업 임시 변수를 ExecutionCalculation의 생성자에 추가합니다:


```
ValidTransientAggregatorIdentifiers.AddTag(FGameplayTag::RequestGameplayTag("Data.Damage"));
```

실행 계산은 어트리뷰트 캡처 함수와 유사한 특수 캡처 함수를 사용하여 이 값을 읽습니다.


```
float Damage = 0.0f;
ExecutionParams.AttemptCalculateTransientAggregatorMagnitude(FGameplayTag::RequestGameplayTag("Data.Damage"), EvaluationParameters, Damage);
```

##### 4.5.12.1.4 Gameplay Effect Context

GameplayEffectSpec의 커스텀 GameplayEffectContext를 통해 ExecutionCalculation 에 데이터를 전송할 수 있습니다. ExecutionCalculation에서 FGameplayEffectCustomExecutionParameter에서 EffectContext에 액세스할 수 있습니다.


```
float Damage = 0.0f;
ExecutionParams.AttemptCalculateTransientAggregatorMagnitude(FGameplayTag::RequestGameplayTag("Data.Damage"), EvaluationParameters, Damage);
```

GameplayEffectSpec 또는 EffectContext에서 무언가를 변경해야 하는 경우:


```
FGameplayEffectSpec* MutableSpec = ExecutionParams.GetOwningSpecForPreExecuteMod();
FGSGameplayEffectContext* ContextHandle = static_cast<FGSGameplayEffectContext*>(MutableSpec->GetContext().Get());
```

실행 계산에서 GameplayEffectSpec을 수정할 때는 주의하세요. GetOwningSpecForPreExecuteMod()에 대한 코멘트를 참고하세요.


```
/** Non const access. Be careful with this, especially when modifying a spec after attribute capture. */
FGameplayEffectSpec* GetOwningSpecForPreExecuteMod() const;
```

### 4.5.13 Custom Application Requirement

Custom Application Requirement 리퀘이션(CAR) 클래스는 디자이너가 GameplayEffect에 대한 단순한 GameplayTag 검사에 비해 GameplayEffect의 적용 여부를 고급 제어할 수 있도록 해줍니다. 블루프린트에서는 CanApplyGameplayEffect()를 오버라이드하여 구현할 수 있고, C++ 에서는 CanApplyGameplayEffect_Implementation() 를 오버라이드하여 구현할 수 있습니다.  
  
CAR 사용 시기의 예시입니다:

- Target에 특정 양의 속성이 있어야 합니다.
- Target에 특정 수의 GameplayEffectSpec이 있어야 합니다.

CAR은 또한 이 GameplayEffect의 인스턴스가 이미 타겟에 있는지 확인하고 새 인스턴스를 적용하는 대신 기존 인스턴스의 지속 시간을 변경하는 등의 고급 작업을 수행할 수 있습니다(CanApplyGameplayEffect()의 경우 false 반환).

### 4.5.14 Cost Gameplay Effect

GameplayAbility에는 어빌리티의 비용으로 사용하도록 특별히 설계된 선택적 GameplayEffect가 있습니다. 비용은 GameplayAbility를 활성화하기 위해 ASC가 보유해야 하는 어트리뷰트의 양입니다. GA가 비용 GE를 감당할 수 없으면 활성화할 수 없습니다. 이 비용 GE는 어트리뷰트에서 차감하는 하나 이상의 모디파이어가 있는 인스턴트 GameplayEffect여야 합니다. 기본적으로 비용 GE는 예측하도록 되어 있으며, 이 기능을 유지하려면 ExecutionCalculations를 사용하지 않는 것이 좋습니다. 복잡한 비용 계산에는 MMC를 사용할 수 있으며 권장됩니다.  
  
처음 시작할 때는 비용이 있는 고유한 비용 GE가 GA당 하나씩 있을 가능성이 높습니다. 좀 더 고급 기법은 여러 GA에 하나의 Cost GE를 재사용하고 Cost GE에서 생성된 GameplayEffectSpec을 GA별 데이터로 수정하는 것입니다(비용 값은 GA에 정의됨). 이 방법은 인스턴스화된 어빌리티에서만 작동합니다.  
  
Cost GE를 재사용하는 두 가지 기법입니다:  
  
MMC를 사용합니다. 가장 쉬운 방법입니다. GameplayEffectSpec에서 얻을 수 있는 GameplayAbility 인스턴스에서 비용 값을 읽는 MMC를 생성합니다.


```
float UPGMMC_HeroAbilityCost::CalculateBaseMagnitude_Implementation(const FGameplayEffectSpec& Spec) const
{
    const UPGGameplayAbility* Ability = Cast<UPGGameplayAbility>(Spec.GetContext().GetAbilityInstance_NotReplicated());

    if (!Ability)
    {
        return 0.0f;
    }

    return Ability->Cost.GetValueAtLevel(Ability->GetAbilityLevel());
}
```

이 예제에서 비용 값은 제가 추가한 GameplayAbility 자식 클래스의 FScalableFloat입니다.


```
UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = "Cost")
FScalableFloat Cost;
```

![](https://blog.kakaocdn.net/dn/bfG0mK/btsnEWA7nua/tqzO5ZgmFBDbKe3K5Goq7k/img.png)

UGameplayAbility::GetCostGameplayEffect()를 재정의합니다. 이 함수를 재정의하고 런타임에 GameplayAbility의 비용 값을 읽는 GameplayEffect를 생성합니다.

### 4.5.15 Gameplay Effect 쿨타임 

GameplayAbility에는 어빌리티의 재사용 대기시간으로 사용하도록 특별히 설계된 선택적 GameplayEffect가 있습니다. 재사용 대기시간은 어빌리티가 활성화된 후 다시 활성화될 수 있는 시간을 결정합니다. GA가 아직 재사용 대기시간 중이면 활성화할 수 없습니다. 이 쿨타임 GE는 모디파이어가 없는 지속시간  GameplayEffect여야 하며, GameplayEffect의 부여된 태그("쿨타임 태그")에 GameplayAbility 또는 어빌리티 슬롯별(게임에 쿨타임을 공유하는 슬롯에 교환 가능한 어빌리티가 할당된 경우) 고유한 GameplayTag가 있어야 합니다. GA는 실제로 쿨타임 GE가 아닌 쿨타임 태그의 존재 여부를 확인합니다. 기본적으로 쿨타임 GE는 예측하도록 되어 있으며, 그 기능을 유지하려면 ExecutionCalculations 를 사용하지 않는 것이 좋습니다. 복잡한 재사용 대기시간 계산에는 MMC를 사용해도 무방하며 권장합니다.  
  
처음 시작할 때는 재사용 대기시간이 있는 고유한 재사용 대기시간 GE가 GA당 하나씩 있을 가능성이 높습니다. 좀 더 고급 기법은 여러 GA 에 하나의 쿨타임 GE 를 재사용하고, 쿨타임 GE 에서 생성된 GameplayEffectSpec 을 GA 전용 데이터(쿨타임 지속시간과 쿨타임 태그는 GA 에 정의되어 있음)로 수정하는 것입니다. 이 방법은 인스턴스 어빌리티에만 적용됩니다.

재사용 대기시간 GE를 재사용하는 두 가지 기술:

1. SetByCaller를 사용합니다. 가장 쉬운 방법입니다. 공유 재사용 대기시간 GE의 지속시간을 GameplayTag 로 SetByCaller 로 설정합니다. GameplayAbility 서브클래스에 지속시간에 대한 float / FScalableFloat, 고유 쿨타임 태그에 대한 FGameplayTagContainer, 쿨타임 태그와 쿨타임 GE의 태그를 합친 반환 포인터로 사용할 임시 FGameplayTagContainer를 정의합니다.


```
UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = "Cooldown")
FScalableFloat CooldownDuration;

UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = "Cooldown")
FGameplayTagContainer CooldownTags;

// Temp container that we will return the pointer to in GetCooldownTags().
// This will be a union of our CooldownTags and the Cooldown GE's cooldown tags.
UPROPERTY(Transient)
FGameplayTagContainer TempCooldownTags;
```

그런 다음 UGameplayAbility::GetCooldownTags()를 재정의하여 쿨타임 태그와 기존 쿨타임 GE 태그의 합을 반환합니다.


```
const FGameplayTagContainer* UPGGameplayAbility::GetCooldownTags() const
{
    FGameplayTagContainer* MutableTags = const_cast<FGameplayTagContainer*>(&TempCooldownTags);
    MutableTags->Reset(); // MutableTags writes to the TempCooldownTags on the CDO so clear it in case the ability cooldown tags change (moved to a different slot)
    const FGameplayTagContainer* ParentTags = Super::GetCooldownTags();
    if (ParentTags)
    {
        MutableTags->AppendTags(*ParentTags);
    }
    MutableTags->AppendTags(CooldownTags);
    return MutableTags;
}
```

마지막으로, UGameplayAbility::ApplyCooldown()을 오버라이드하여 쿨타임 태그를 주입하고 쿨타임 GameplayEffectSpec에 SetByCaller를 추가합니다.


```
void UPGGameplayAbility::ApplyCooldown(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo) const
{
    UGameplayEffect* CooldownGE = GetCooldownGameplayEffect();
    if (CooldownGE)
    {
        FGameplayEffectSpecHandle SpecHandle = MakeOutgoingGameplayEffectSpec(CooldownGE->GetClass(), GetAbilityLevel());
        SpecHandle.Data.Get()->DynamicGrantedTags.AppendTags(CooldownTags);
        SpecHandle.Data.Get()->SetSetByCallerMagnitude(FGameplayTag::RequestGameplayTag(FName(OurSetByCallerTag)), CooldownDuration.GetValueAtLevel(GetAbilityLevel()));
        ApplyGameplayEffectSpecToOwner(Handle, ActorInfo, ActivationInfo, SpecHandle);
    }
}
```

이 그림에서 쿨타임의 지속 시간 모디파이어는 데이터 태그가 Data,CoolDown인 SetByCaller로 설정되어 있습니다. 위의 코드에서 Data.Cooldown은 OurSetByCallerTag가 됩니다.

![](https://blog.kakaocdn.net/dn/NbBoB/btsnDNdSbKS/D6doDKSyqDIykmadsQ4msK/img.png)

2. MMC를 사용합니다. 이 설정은 쿨타임 GE와 ApplyCooldown에서 SetByCaller를 지속 시간으로 설정하는 것을 제외하고는 위와 동일합니다. 대신 지속 시간을 커스텀 계산 클래스로 설정하고 새로 만들 MMC를 가리킵니다.


```
UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = "Cooldown")
FScalableFloat CooldownDuration;

UPROPERTY(BlueprintReadOnly, EditAnywhere, Category = "Cooldown")
FGameplayTagContainer CooldownTags;

// Temp container that we will return the pointer to in GetCooldownTags().
// This will be a union of our CooldownTags and the Cooldown GE's cooldown tags.
UPROPERTY(Transient)
FGameplayTagContainer TempCooldownTags;
```


```
const FGameplayTagContainer* UPGGameplayAbility::GetCooldownTags() const
{
    FGameplayTagContainer* MutableTags = const_cast<FGameplayTagContainer*>(&TempCooldownTags);
    MutableTags->Reset(); // MutableTags writes to the TempCooldownTags on the CDO so clear it in case the ability cooldown tags change (moved to a different slot)
    const FGameplayTagContainer* ParentTags = Super::GetCooldownTags();
    if (ParentTags)
    {
        MutableTags->AppendTags(*ParentTags);
    }
    MutableTags->AppendTags(CooldownTags);
    return MutableTags;
}
```

마지막으로, UGameplayAbility::ApplyCooldown() 을 오버라이드하여 쿨타임 태그를 쿨타임 GameplayEffectSpec에 주입합니다.


```
void UPGGameplayAbility::ApplyCooldown(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo) const
{
    UGameplayEffect* CooldownGE = GetCooldownGameplayEffect();
    if (CooldownGE)
    {
        FGameplayEffectSpecHandle SpecHandle = MakeOutgoingGameplayEffectSpec(CooldownGE->GetClass(), GetAbilityLevel());
        SpecHandle.Data.Get()->DynamicGrantedTags.AppendTags(CooldownTags);
        ApplyGameplayEffectSpecToOwner(Handle, ActorInfo, ActivationInfo, SpecHandle);
    }
}
```


```
float UPGMMC_HeroAbilityCooldown::CalculateBaseMagnitude_Implementation(const FGameplayEffectSpec& Spec) const
{
    const UPGGameplayAbility* Ability = Cast<UPGGameplayAbility>(Spec.GetContext().GetAbilityInstance_NotReplicated());

    if (!Ability)
    {
        return 0.0f;
    }

    return Ability->CooldownDuration.GetValueAtLevel(Ability->GetAbilityLevel());
}
```

![](https://blog.kakaocdn.net/dn/cIVRIM/btsnGjWy1Yy/wXEHvLPCfwYONhp50LLRG0/img.png)

#### 4.5.15.1 재사용 대기시간 GameplayEffect의 남은 시간 얻기


```
bool APGPlayerState::GetCooldownRemainingForTag(FGameplayTagContainer CooldownTags, float& TimeRemaining, float& CooldownDuration)
{
    if (AbilitySystemComponent && CooldownTags.Num() > 0)
    {
        TimeRemaining = 0.f;
        CooldownDuration = 0.f;

        FGameplayEffectQuery const Query = FGameplayEffectQuery::MakeQuery_MatchAnyOwningTags(CooldownTags);
        TArray< TPair<float, float> > DurationAndTimeRemaining = AbilitySystemComponent->GetActiveEffectsTimeRemainingAndDuration(Query);
        if (DurationAndTimeRemaining.Num() > 0)
        {
            int32 BestIdx = 0;
            float LongestTime = DurationAndTimeRemaining[0].Key;
            for (int32 Idx = 1; Idx < DurationAndTimeRemaining.Num(); ++Idx)
            {
                if (DurationAndTimeRemaining[Idx].Key > LongestTime)
                {
                    LongestTime = DurationAndTimeRemaining[Idx].Key;
                    BestIdx = Idx;
                }
            }

            TimeRemaining = DurationAndTimeRemaining[BestIdx].Key;
            CooldownDuration = DurationAndTimeRemaining[BestIdx].Value;

            return true;
        }
    }

    return false;
}
```

> **💡 NOTE**: 클라이언트에서 재사용 대기시간 잔여 시간을 쿼리하려면 리플리케이트된 GameplayEffect를 수신할 수 있어야 합니다. 이는 ASC의 리플리케이션 모드에 따라 달라집니다.

#### 4.5.15.2 재사용 대기시간 시작 및 종료 청취

쿨타임이 시작되는 시점을 수신하려면, AbilitySystemComponent->OnActiveGameplayEffectAddedDelegateToSelf에 바인딩하여 쿨타임 GE가 적용될 때 응답하거나, AbilitySystemComponent->RegisterGameplayTagEvent(쿨타임 태그, EGameplay 태그 이벤트 유형::새 또는 제거)에 바인딩하여 쿨타임 태그가 추가될 때 응답할 수 있습니다. 쿨타임 GE가 언제 추가되었는지 확인하는 것이 좋은데, 쿨타임 GE를 적용한 GameplayEffectSpec에도 접근할 수 있기 때문입니다. 이를 통해 쿨타임 GE가 로컬에서 예측한 것인지 서버에서 수정한 것인지를 확인할 수 있습니다.  
  
재사용 대기시간이 언제 끝나는지 수신하려면, AbilitySystemComponent->OnAnyGameplayEffectRemovedDelegate() 에 바인딩하여 쿨타임 GE가 제거되는 시점에 응답하거나, AbilitySystemComponent->RegisterGameplayTagEvent(쿨타임 태그, EGameplay 태그 이벤트 유형::NewOrRemoved)에 바인딩하여 쿨타임 태그가 제거되는 시점에 응답하면 됩니다. 서버의 수정된 쿨타임 GE가 들어오면 로컬에서 예측한 쿨타임이 제거되어 쿨타임이 진행 중임에도 불구하고 OnAnyGameplayEffectRemovedDelegate()가 발동되므로 쿨타임 태그가 제거되는 시점을 잘 살펴볼 것을 권장합니다. 예측된 쿨타임 GE를 제거하고 서버의 수정된 쿨타임 GE를 적용하는 동안 쿨타임 태그는 변경되지 않습니다.  
  

> **💡NOTE**: 클라이언트에서 GameplayEffect가 추가 또는 제거되기를 기다리려면 리플리케이트된 GameplayEffect를 수신할 수 있어야 합니다. 이는 ASC 의 리플리케이션 모드에 따라 달라집니다.

  
샘플 프로젝트에는 쿨타임 시작과 끝을 수신하는 커스텀 블루프린트 노드가 포함되어 있습니다. HUD UMG 위젯은 이를 사용하여 메테오의 재사용 대기시간에 남은 시간을 업데이트합니다. 이 AsyncTask 는 UMG 위젯의 Destruct 이벤트에서 수동으로 EndTask()를 호출할 때까지 영원히 살아있습니다. AsyncTaskCooldownChanged.h/cpp를 참고하세요.

![](https://blog.kakaocdn.net/dn/76nz7/btsnD7C7ebz/XKdB90DGiwsGtOmIJspZFk/img.png)

#### 4.5.15.3 쿨타임 예측

현재 재사용 대기시간은 실제로 예측할 수 없습니다. 로컬에서 예측한 쿨타임 GE가 적용될 때 UI 쿨타임 타이머를 시작할 수 있지만, GameplayAbility의 실제 쿨타임은 서버의 쿨타임 잔여 시간에 연동됩니다. 플레이어의 지연 시간에 따라 로컬에서 예측한 쿨타임이 만료되더라도 서버에서는 여전히 쿨타임 중일 수 있으며, 이로 인해 서버의 쿨타임이 만료될 때까지 GameplayAbility가 즉시 다시 활성화되지 않을 수 있습니다.  
  
샘플 프로젝트는 로컬에서 예측한 재사용 대기시간이 시작되면 메테오 어빌리티의 UI 아이콘을 회색으로 표시한 다음 서버의 수정된 재사용 대기시간 GE가 들어오면 재사용 대기시간 타이머를 시작하는 방식으로 이 문제를 처리합니다.  
  
이로 인해 지연 시간이 긴 플레이어는 지연 시간이 짧은 플레이어보다 재사용 대기시간이 짧은 능력의 발사 확률이 낮아져 불리한 게임 플레이를 할 수 있습니다. 포트나이트는 무기에 재사용 대기시간 GameplayEffect를 사용하지 않는 커스텀 북키핑을 적용하여 이러한 문제를 방지합니다.  
  
진정한 예측 재사용 대기시간(플레이어는 로컬 재사용 대기시간이 만료되었지만 서버는 아직 재사용 대기시간 중일 때 GameplayAbility를 활성화할 수 있음)을 허용하는 것은 에픽 게임즈가 향후 GAS의 반복작업에서 언젠가 구현하고자 하는 기능입니다.

### 4.5.16 활성화된 GameplayEffect 지속 시간 변경

쿨타임 GE 또는 지속시간 GameplayEffect의 남은 시간을 변경하려면, GameplayEffectSpec의 Duration을 변경하고, StartServerWorldTime을 업데이트하고, CachedStartServerWorldTime을 업데이트하고, StartWorldTime을 업데이트한 다음 CheckDuration()으로 지속시간 검사를 다시 실행해야 합니다. 서버에서 이 작업을 수행하고 FActiveGameplayEffect를 더티로 표시하면 클라이언트에 변경사항이 리플리케이트됩니다.

> **💡NOTE**: 여기에는 const_cast 가 필요하며 에픽 게임즈가 의도한 지속시간 변경 방식이 아닐 수도 있지만, 지금까지는 잘 작동하는 것 같습니다.


```
bool UPAAbilitySystemComponent::SetGameplayEffectDurationHandle(FActiveGameplayEffectHandle Handle, float NewDuration)
{
    if (!Handle.IsValid())
    {
        return false;
    }

    const FActiveGameplayEffect* ActiveGameplayEffect = GetActiveGameplayEffect(Handle);
    if (!ActiveGameplayEffect)
    {
        return false;
    }

    FActiveGameplayEffect* AGE = const_cast<FActiveGameplayEffect*>(ActiveGameplayEffect);
    if (NewDuration > 0)
    {
        AGE->Spec.Duration = NewDuration;
    }
    else
    {
        AGE->Spec.Duration = 0.01f;
    }

    AGE->StartServerWorldTime = ActiveGameplayEffects.GetServerWorldTime();
    AGE->CachedStartServerWorldTime = AGE->StartServerWorldTime;
    AGE->StartWorldTime = ActiveGameplayEffects.GetWorldTime();
    ActiveGameplayEffects.MarkItemDirty(*AGE);
    ActiveGameplayEffects.CheckDuration(Handle);

    AGE->EventSet.OnTimeChanged.Broadcast(AGE->Handle, AGE->StartWorldTime, AGE->GetDuration());
    OnGameplayEffectDurationChange(*AGE);

    return true;
}
```

### 4.5.17 런타임에 동적으로 GameplayEffect 생성하기

런타임 중 GameplayEffect 동적 생성은 고급 주제입니다. 이 작업을 너무 자주 수행할 필요는 없습니다.

인스턴트 GameplayEffect만 런타임에 C++ 에서 처음부터 생성할 수 있습니다. Duration 및 Infinite GameplayEffect는 런타임에 동적으로 생성할 수 없는데, 그 이유는 리플리케이트할 때 존재하지 않는 GameplayEffect 클래스 정의를 찾기 때문입니다. 이 기능을 구현하려면 대신 에디터에서 일반적으로 하는 것처럼 아키타입 GameplayEffect 클래스를 만들어야 합니다. 그런 다음 런타임에 필요한 내용으로 GameplayEffectSpec 인스턴스를 커스터마이징합니다.

런타임에 생성된 인스턴트 GameplayEffect는 로컬 예측 GameplayAbility 내에서 호출할 수도 있습니다. 하지만 동적 생성에 부작용이 있을 수 있는지는 아직 알려지지 않았습니다.

예제  
샘플 프로젝트는 캐릭터가 Attribute에 있는 킬링 타격을 받으면 골드와 경험치를 킬러에게 돌려주는 게임플레이 이펙트를 생성합니다.


```
// 현상금 지급을 위한 동적 인스턴트 GameplayEffect 만들기
UGameplayEffect* GEBounty = NewObject<UGameplayEffect>(GetTransientPackage(), FName(TEXT("Bounty")));
GEBounty->DurationPolicy = EGameplayEffectDurationType::Instant;

int32 Idx = GEBounty->Modifiers.Num();
GEBounty->Modifiers.SetNum(Idx + 2);

FGameplayModifierInfo& InfoXP = GEBounty->Modifiers[Idx];
InfoXP.ModifierMagnitude = FScalableFloat(GetXPBounty());
InfoXP.ModifierOp = EGameplayModOp::Additive;
InfoXP.Attribute = UGDAttributeSetBase::GetXPAttribute();

FGameplayModifierInfo& InfoGold = GEBounty->Modifiers[Idx + 1];
InfoGold.ModifierMagnitude = FScalableFloat(GetGoldBounty());
InfoGold.ModifierOp = EGameplayModOp::Additive;
InfoGold.Attribute = UGDAttributeSetBase::GetGoldAttribute();

Source->ApplyGameplayEffectToSelf(GEBounty, 1.0f, Source->MakeEffectContext());
```

두 번째 예제는 로컬 예측 GameplayAbility 내에서 생성된 런타임 GameplayEffect를 보여줍니다. 사용은 여러분의 책임하에 하세요(코드 내 주석 참조)!


```
UGameplayAbilityRuntimeGE::UGameplayAbilityRuntimeGE()
{
    NetExecutionPolicy = EGameplayAbilityNetExecutionPolicy::LocalPredicted;
}

void UGameplayAbilityRuntimeGE::ActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, const FGameplayEventData* TriggerEventData)
{
    if (HasAuthorityOrPredictionKey(ActorInfo, &ActivationInfo))
    {
        if (!CommitAbility(Handle, ActorInfo, ActivationInfo))
        {
            EndAbility(Handle, ActorInfo, ActivationInfo, true, true);
        }

        // 런타임 중 GE 생성.
        UGameplayEffect* GameplayEffect = NewObject<UGameplayEffect>(GetTransientPackage(), TEXT("RuntimeInstantGE"));
        GameplayEffect->DurationPolicy = EGameplayEffectDurationType::Instant; // Only instant works with runtime GE.

        // 42로 MyAttribute를 재정의하는 단순 확장 가능한 float 모디파이어를 추가합니다.
        // 실제 애플리케이션에서는 TriggerEventData를 통해 전달된 정보를 소비합니다.
        const int32 Idx = GameplayEffect->Modifiers.Num();
        GameplayEffect->Modifiers.SetNum(Idx + 1);
        FGameplayModifierInfo& ModifierInfo = GameplayEffect->Modifiers[Idx];
        ModifierInfo.Attribute.SetUProperty(UMyAttributeSet::GetMyModifiedAttribute());
        ModifierInfo.ModifierMagnitude = FScalableFloat(42.f);
        ModifierInfo.ModifierOp = EGameplayModOp::Override;

        // GE 적용.

        // 여기서 GESpec을 생성하면 ASC가 GE 클래스 기본 오브젝트에서 GESpec을 생성하는 동작을 피할 수 있습니다.
        // 여기에는 동적 GE가 있으므로 기본 GameplayEffect 클래스로 GESpec을 생성하므로
        // 모디파이어가 손실됩니다. 주의: 여기서 수행한 이 "해킹"이 단점을 가질 수 있는지 여부는 알 수 없습니다!
        // Spec에서 GE는 UPROPERTY이기 때문에 GarbageCollector가 GE 오브젝트를 수집하는 것을 방지합니다.
        FGameplayEffectSpec* GESpec = new FGameplayEffectSpec(GameplayEffect, {}, 0.f); // "new", 수명은 핸들 내의 공유 ptr에 의해 관리되므로
        ApplyGameplayEffectSpecToOwner(Handle, ActorInfo, ActivationInfo, FGameplayEffectSpecHandle(GESpec));
    }
    EndAbility(Handle, ActorInfo, ActivationInfo, false, false);
}
```

### 4.5.18 Gameplay Effect Container

에픽 게임즈의 액션 RPG 샘플 프로젝트는 FGameplayEffectContainer라는 구조체를 구현합니다. 바닐라 GAS에는 없지만 GameplayEffect와 타겟 데이터를 담을 때 매우 편리합니다.GameplayEffect로부터 GameplayEffectSpec을 생성하고 그 GameplayEffectContext에서 기본값을 설정하는 등의 작업을 자동화합니다. GameplayAbility에서 GameplayEffectContainer를 생성하고 스폰된 투사체에 전달하는 것은 매우 쉽고 간단합니다. 바닐라 GAS에서 GameplayEffectContainer없이 어떻게 작동하는지 보여드리기 위해 포함된 샘플 프로젝트에서 GameplayEffectContainer를 구현하지 않았지만, 이 기능을 살펴보고 프로젝트에 추가하는 것을 고려해 보시길 적극 권장합니다  
  
GameplayEffectContainer 내부의 GESpec에 액세스하여 SetByCaller 추가와 같은 작업을 수행하려면 FGameplayEffectContainer를 분해하고 GESpec 배열의 인덱스로 GESpec 레퍼런스에 액세스합니다. 이를 위해서는 액세스하려는 GESpec의 인덱스를 미리 알고 있어야 합니다.

![](https://blog.kakaocdn.net/dn/bsDJMP/btsnD6EcVah/qpmLMsSgVR5pyQZUedgJY1/img.png)

GameplayEffectContainer에는 효율적인 타겟팅을 위한 선택적 수단도 포함되어 있습니다.

## 4.6 GameplayAbility

### 4.6.1 GameplayAbility 정의

[GameplayAbility](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/Abilities/UGameplayAbility/index.html)(GA)는 엑터가 게임에서 할 수 있는 모든 액션 또는 스킬입니다. 예를 들어 전력 질주나 총을 쏘는 등 한 번에 두 개 이상의 GameplayAbility를 활성화할 수 있습니다. Blueprint 또는 C++로 만들 수 있습니다.

  
GameplayAbility의 예시입니다:

- 점프
- 질주
- 총 쏘기
- 특정 초마다 수동적으로 공격 차단하기
- 물약 사용
- 문 열기
- 자원 수집
- 건물 건설

GameplayAbility로 구현해서는 안 되는 것들:

- 기본적인 움직임 입력
- UI와의 상호작용 - GameplayAbility를 사용하여 상점 아이템 구매

**이는 규칙이 아니라 권장 사항일 뿐입니다.** 설계와 구현은 다를 수 있습니다. GameplayAbility에는 Attribute 변경량을 수정하거나 GameplayAbility의 기능을 변경할 수 있는 레벨이 기본 기능으로 제공됩니다.  
  
GameplayAbility는 Net Execution Policy에 따라 소유 클라이언트 또는 서버에서 실행되지만 시뮬레이션된 프록시에서는 실행되지 않습니다. Net Execution Policy은 GameplayAbility가 로컬에서 예측될지 여부를 결정합니다. 여기에는 선택적 비용 및 쿨타임 GameplayEffect에 대한 기본 동작이 포함됩니다. GameplayAbility는 이벤트 대기, 속성 변경 대기, 플레이어가 타겟을 선택할 때까지 기다리거나 루트 모션 소스로 캐릭터를 이동하는 등 시간이 지남에 따라 발생하는 동작에 AbilityTask를 사용합니다. 시뮬레이션된 클라이언트는 GameplayAbility를 실행하지 않습니다. 대신 서버가 어빌리티를 실행하면 시뮬레이션된 프록시에서 시각적으로 재생해야 하는 것(애니메이션 몽타주 등)은 전부 리플리케이트되거나 사운드나 파티클 같은 외형적인 것들은 AbilityTask 또는 GameplayCue를 통해 RPC 처리됩니다.  
  
모든 GameplayAbility는 게임플레이 로직으로 ActivateAbility() 함수를 오버라이드합니다. GameplayAbility가 완료되거나 취소될 때 실행되는 EndAbility()에 추가 로직을 추가할 수 있습니다.  
  
간단한 GameplayAbility의 순서도입니다:

![](https://blog.kakaocdn.net/dn/Vtn30/btsnF7bGqdT/8UVdQZY81wtXkQxnPeJKZk/img.png)

좀 더 복잡한 GameplayAbility의 순서도입니다:

![](https://blog.kakaocdn.net/dn/cnNytk/btsnGYFA46s/5BDe0vip1W1D0DImEh5p6k/img.png)

서로 상호작용(활성화, 취소 등)하는 여러 GameplayAbility를 사용하여 복잡한 어빌리티를 구현할 수 있습니다.

4.6.1.1 Replication Policy

이 옵션은 사용하지 마세요. 이름에 오해의 소지가 있으며 필요하지 않습니다. GameplayAbilitySpec는 기본적으로 서버에서 소유 클라이언트로 리플리케이트됩니다. 위에서 언급했듯이 GameplayAbility는 시뮬레이션된 프록시에서 실행되지 않습니다. AbilityTask와 GameplayCue를 사용하여 시뮬레이션된 프록시에 시각적 변경 사항을 리플리케이트하거나 RPC합니다. 에픽 게임즈의 데이브 라티가 향후 해당 옵션을 제거하고 싶다는 의사를 밝혔습니다.

4.6.1.2 Server Respects Remote Ability Cancellation

이 옵션은 종종 문제를 일으킵니다. 즉, 클라이언트의 GameplayAbility가 취소 또는 자연 완료로 인해 종료되면 서버의 버전이 완료되었는지 여부에 관계없이 강제로 종료됩니다. 후자의 문제는 특히 지연 시간이 긴 플레이어가 사용하는 로컬 예측 GameplayAbility의 경우 중요한 문제입니다. 일반적으로 이 옵션을 비활성화하는 것이 좋습니다.

4.6.1.3 Replicate Input Directly

이 옵션을 설정하면 입력 누르기 및 놓기 이벤트를 항상 서버에 리플리케이트합니다. 에픽은 이 옵션을 사용하지 않고 대신 기존 입력 관련 AbilityTask에 내장된 일반 리플리케이트 이벤트를 사용하는 것을 권장합니다(입력이 ASC에 바인딩된 경우).

에픽 게임즈 주석:

cpp

접기

```
/** Direct Input state replication. These will be called if bReplicateInputDirectly is true on the ability and is generally not a good thing to use. (Instead, prefer to use Generic Replicated Events). */
UAbilitySystemComponent::ServerSetInputPressed()
```

#### 4.6.2 ASC에 입력 바인딩

ASC를 사용하면 입력 액션을 직접 바인딩하고 해당 입력을 부여할 때 해당 입력을 GameplayAbilities에 할당할 수 있습니다. GameplayAbility에 할당된 입력 액션은 GameplayTag 요구 사항이 충족되면 해당 GameplayAbility를 눌렀을 때 자동으로 활성화됩니다. 할당된 입력 액션은 입력에 반응하는 기본 제공 AbilityTask를 사용하는 데 필요합니다.  
  
GameplayAbility를 활성화하기 위해 할당된 입력 동작 외에도 ASC는 일반 확인 및 취소 입력도 허용합니다. 이러한 특수 입력은 AbilityTask가 타겟 액터와 같은 것을 확인하거나 취소하는 데 사용됩니다.  
  
입력을 ASC에 바인딩하려면 먼저 입력 액션 이름을 바이트 단위로 변환하는 열거형을 만들어야 합니다. 이 열거형 이름은 프로젝트 설정에서 입력 액션에 사용된 이름과 정확히 일치해야 합니다. 표시 이름은 중요하지 않습니다.  
  
샘플 프로젝트에서:

cpp

접기

```
UENUM(BlueprintType)
enum class EGDAbilityInputID : uint8
{
	// 0 None
	None		UMETA(DisplayName = "None"),
	// 1 Confirm
	Confirm		UMETA(DisplayName = "Confirm"),
	// 2 Cancel
	Cancel		UMETA(DisplayName = "Cancel"),
	// 3 LMB
	Ability1	UMETA(DisplayName = "Ability1"),
	// 4 RMB
	Ability2	UMETA(DisplayName = "Ability2"),
	// 5 Q
	Ability3	UMETA(DisplayName = "Ability3"),
	// 6 E
	Ability4	UMETA(DisplayName = "Ability4"),
	// 7 R
	Ability5	UMETA(DisplayName = "Ability5"),
	// 8 Sprint
	Sprint		UMETA(DisplayName = "Sprint"),
	// 9 Jump
	Jump		UMETA(DisplayName = "Jump")
};
```

ASC가 캐릭터에 있는 경우, SetupPlayerInputComponent()에 ASC에 바인딩하는 함수를 포함하세요:

cpp

접기

```
// Bind to AbilitySystemComponent
FTopLevelAssetPath AbilityEnumAssetPath = FTopLevelAssetPath(FName("/Script/GASDocumentation"), FName("EGDAbilityInputID"));
AbilitySystemComponent->BindAbilityActivationToInputComponent(PlayerInputComponent, FGameplayAbilityInputBinds(FString("ConfirmTarget"),
    FString("CancelTarget"), AbilityEnumAssetPath, static_cast<int32>(EGDAbilityInputID::Confirm), static_cast<int32>(EGDAbilityInputID::Cancel)));
```

ASC가 PlayerState에 있는 경우, PlayerState가 아직 클라이언트에 리플리케이트되지 않았을 수 있는 잠재적 경합 조건이 SetupPlayerInputComponent() 내부에 있습니다. 따라서 SetupPlayerInputComponent() 및 OnRep_PlayerState()에서 입력에 바인딩을 시도하는 것이 좋습니다. 플레이어 컨트롤러가 클라이언트에게 InputComponent를 생성하는 ClientRestart() 호출을 지시하기 전에 PlayerState가 리플리케이트될 때 액터의 InputComponent가 널이 되는 경우가 있을 수 있으므로 OnRep_PlayerState() 자체만으로는 충분하지 않습니다. 샘플 프로젝트는 프로세스를 게이팅하는  bool을 사용하여 두 위치 모두에서 바인딩을 시도하여 실제로는 입력을 한 번만 바인딩하는 것을 보여줍니다.

> **💡 NOTE**: 샘플 프로젝트에서 열거형의 Confirm 및 Cancel은 프로젝트 설정의 입력 액션 이름(ConfirmTarget 및 CancelTarget)과 일치하지 않지만, BindAbilityActivationToInputComponent()에서 이들 사이의 매핑을 제공했습니다. 매핑을 제공하기 때문에 특별하며 일치할 필요는 없지만 일치할 수 있습니다. 열거형의 다른 모든 입력은 프로젝트 설정의 입력 액션 이름과 일치해야 합니다. 하나의 입력으로만 활성화되는 GameplayAbility(MOBA처럼 항상 같은 '슬롯'에 존재)의 경우, 저는 해당 입력을 정의할 수 있는 변수를 UGameplayAbility 서브클래스에 추가하는 것을 선호합니다. 그러면 어빌리티를 부여할 때 ClassDefaultObject에서 이를 읽을 수 있습니다.

4.6.2.1 GameplayAbility를 활성화하지 않고 입력에 바인딩

GameplayAbility가 입력을 눌렀을 때 자동으로 활성화되지 않도록 하되 여전히 입력에 바인딩하여 AbilityTasks와 함께 사용하려면, 기본값이 true인 새로운 부울 변수를 UGameplayAbility 서브클래스에 추가하고 UAbilitySystemComponent::AbilityLocalInputPressed()를 오버라이드할 수 있습니다.

cpp

접기

```
void UGSAbilitySystemComponent::AbilityLocalInputPressed(int32 InputID)
{
    // Consume the input if this InputID is overloaded with GenericConfirm/Cancel and the GenericConfim/Cancel callback is bound
    if (IsGenericConfirmInputBound(InputID))
    {
        LocalInputConfirm();
        return;
    }

    if (IsGenericCancelInputBound(InputID))
    {
        LocalInputCancel();
        return;
    }

    // ---------------------------------------------------------

    ABILITYLIST_SCOPE_LOCK();
    for (FGameplayAbilitySpec& Spec : ActivatableAbilities.Items)
    {
        if (Spec.InputID == InputID)
        {
            if (Spec.Ability)
            {
                Spec.InputPressed = true;
                if (Spec.IsActive())
                {
                    if (Spec.Ability->bReplicateInputDirectly && IsOwnerActorAuthoritative() == false)
                    {
                        ServerSetInputPressed(Spec.Handle);
                    }

                    AbilitySpecInputPressed(Spec);

                    // Invoke the InputPressed event. This is not replicated here. If someone is listening, they may replicate the InputPressed event to the server.
                    InvokeReplicatedEvent(EAbilityGenericReplicatedEvent::InputPressed, Spec.Handle, Spec.ActivationInfo.GetActivationPredictionKey());
                }
                else
                {
                    UGSGameplayAbility* GA = Cast<UGSGameplayAbility>(Spec.Ability);
                    if (GA && GA->bActivateOnInput)
                    {
                        // Ability is not active, so try to activate it
                        TryActivateAbility(Spec.Handle);
                    }
                }
            }
        }
    }
}
```

#### 4.6.3 어빌리티 부여

ASC에 GameplayAbility를 부여하면 해당 GameplayAbility가 활성화 가능한 어빌리티 목록에 추가되어 GameplayTag 요구 사항을 충족하는 경우 마음대로 활성화할 수 있습니다. 서버에서 GameplayAbility를 부여하면 소유 클라이언트에 GameplayAbilitySpec을 자동으로 리플리케이트합니다. 다른 클라이언트/시뮬레이션된 프록시는 GameplayAbilitySpec을 받지 않습니다.  
  
샘플 프로젝트는 게임 시작 시 읽어들여 부여하는 Character 클래스에 `TArray<TSubclassOf<UGDGameplayAbility>>`를 저장합니다

```C++
void AGDCharacterBase::AddCharacterAbilities()
{
    // Grant abilities, but only on the server	
    if (Role != ROLE_Authority || !AbilitySystemComponent.IsValid() || AbilitySystemComponent->bCharacterAbilitiesGiven)
    {
        return;
    }

    for (TSubclassOf<UGDGameplayAbility>& StartupAbility : CharacterAbilities)
    {
        AbilitySystemComponent->GiveAbility(
            FGameplayAbilitySpec(StartupAbility, GetAbilityLevel(StartupAbility.GetDefaultObject()->AbilityID), static_cast<int32>(StartupAbility.GetDefaultObject()->AbilityInputID), this));
    }

    AbilitySystemComponent->bCharacterAbilitiesGiven = true;
}
```

이러한 GameplayAbility를 부여할 때는 UGameplayAbility 클래스, 어빌리티 레벨, 바인딩된 입력, 소스 오브젝트 또는 누가 이 ASC에 이 GameplayAbility를 부여했는지가 포함된 GameplayAbilitySpec를 생성합니다.

### 4.6.4 어빌리티 활성화

GameplayAbility에 입력 액션이 할당된 경우, 입력이 눌려지고 해당 GameplayTag 요건을 충족하면 자동으로 활성화됩니다. 이것이 항상 GameplayAbility를 활성화하는 바람직한 방법은 아닐 수 있습니다. ASC는 GameplayTag, GameplayAbility 클래스, GameplayAbilitySpecHandle, 이벤트에 의해 GameplayAbility를 활성화하는 네 가지 다른 메서드를 제공합니다. 이벤트로 GameplayAbility를 활성화하면 이벤트와 함께 데이터 페이로드를 전달할 수 있습니다.

```C++
UFUNCTION(BlueprintCallable, Category = "Abilities")
bool TryActivateAbilitiesByTag(const FGameplayTagContainer& GameplayTagContainer, bool bAllowRemoteActivation = true);

UFUNCTION(BlueprintCallable, Category = "Abilities")
bool TryActivateAbilityByClass(TSubclassOf<UGameplayAbility> InAbilityToActivate, bool bAllowRemoteActivation = true);

bool TryActivateAbility(FGameplayAbilitySpecHandle AbilityToActivate, bool bAllowRemoteActivation = true);

bool TriggerAbilityFromGameplayEvent(FGameplayAbilitySpecHandle AbilityToTrigger, FGameplayAbilityActorInfo* ActorInfo, FGameplayTag Tag, const FGameplayEventData* Payload, UAbilitySystemComponent& Component);

FGameplayAbilitySpecHandle GiveAbilityAndActivateOnce(const FGameplayAbilitySpec& AbilitySpec, const FGameplayEventData* GameplayEventData);
```

이벤트별로 GameplayAbility를 활성화하려면 GameplayAbility에 트리거가 설정되어 있어야 합니다.GameplayTag를 할당하고 GameplayEvent에 대한 옵션을 선택합니다. 이벤트를 전송하려면 UAbilitySystemBlueprintLibrary::SendGameplayEventToActor(AActor* Actor, FGameplayTag EventTag, FGameplayEventData Payload) 함수를 사용합니다. 이벤트로 GameplayAbility를 활성화하면 데이터가 포함된 페이로드를 전달할 수 있습니다. **GameplayAbilityTrigger를 사용하면 GameplayTag가 추가되거나 제거될 때 GameplayAbility를 활성화할 수도 있습니다.**

> **💡Note**: 블루프린트에서 이벤트에서 GameplayAbility를 활성화할 때는 ActivateAbilityFromEvent 노드를 사용해야 하며, 표준 ActivateAbility 노드는 그래프에 존재할 수 없습니다. ActivateAbility 노드가 존재하는 경우, 항상 ActivateAbilityFromEvent 노드를 통해 호출됩니다.

> **💡Note**: 항상 패시브 어빌리티처럼 실행되는 GameplayAbility가 없는 한, GameplayAbility가 종료되어야 할 때 EndAbility()를 호출하는 것을 잊지 마세요.

**로컬로 예측된** GameplayAbility의 활성화 시퀀스입니다:

1. 소유 클라이언트가 TryActivateAbility()를 호출합니다.
2. InternalTryActivateAbility()를 호출합니다.
3. CanActivateAbility()를 호출하여 GameplayTag 요건 충족 여부, ASC가 비용을 감당할 수 있는지, GameplayTag가 쿨타임 중이 아닌지, 현재 활성화된 다른 인스턴스가 없는지 반환합니다.
4. CallServerTryActivateAbility()를 호출하고 생성한 예측 키를 전달합니다.
5. CallActivateAbility()를 호출합니다.
6. 에픽 게임즈는 이를 "boilerplate init stuff"이라고 부릅니다.
7. ActivateAbility()를 호출하여 최종적으로 어빌리티를 활성화합니다.

서버가 CallServerTryActivateAbility()를 수신합니다.

1. ServerTryActivateAbility()를 호출합니다.
2. InternalServerTryActivateAbility()을 호출합니다.
3. InternalTryActivateAbility()를 호출합니다.
4. CanActivateAbility()를 호출하여 GameplayTag 요건 충족 여부, ASC가 비용을 감당할 수 있는지, GameplayTag가 쿨타임 중 아닌지, 현재 활성화된 다른 인스턴스가 없는지 반환합니다.
5. 서버에 의해 활성화가 확인되었다는 활성화 정보를 업데이트하고 OnConfirmDelegate 델리게이트를 브로드캐스트하도록 알리는 데 성공하면 ClientActivateAbilitySucceed()를 호출합니다. 이는 입력 확인과 동일하지 않습니다.
6. CallActivateAbility()를 호출합니다.
7. 에픽 게임즈는 이를 "boilerplate init stuff"이라고 부릅니다.
8. ActivateAbility()를 호출하여 최종적으로 어빌리티를 활성화합니다.

서버가 언제든지 활성화에 실패하면 ClientActivateAbilityFailed()를 호출하여 클라이언트의 GameplayAbility를 즉시 종료하고 예측된 변경 사항을 취소합니다.

#### 4.6.4.1 패시브 어빌리티

자동으로 활성화되고 지속적으로 실행되는 패시브 게임플레이 어빌리티를 구현하려면, 게임플레이 어빌리티가 부여되고 아바타 액터가 설정될 때 자동으로 호출되는 UGameplayAbility::OnAvatarSet()을 오버라이드하고 TryActivateAbility()를 호출하면 됩니다.  
  
GameplayAbility 가 부여될 때 활성화할지 여부를 지정하는 bool을 커스텀 UGameplayAbility 클래스에 추가하는 것이 좋습니다. 샘플 프로젝트에서는 패시브 방어구 스태킹 어빌리티에 대해 이렇게 합니다.  
  
패시브 게임플레이 어빌리티는 일반적으로 [Net Execution Policy](https://github.com/tranek/GASDocumentation#concepts-ga-net)이 서버 전용입니다.

```
void UGDGameplayAbility::OnAvatarSet(const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilitySpec& Spec)
{
    Super::OnAvatarSet(ActorInfo, Spec);

    if (bActivateAbilityOnGranted)
    {
        ActorInfo->AbilitySystemComponent->TryActivateAbility(Spec.Handle, false);
    }
}
```

에픽 게임즈는 이 함수를 패시브 어빌리티를 시작하고 BeginPlay 유형의 작업을 하기에 적합한 곳이라고 설명합니다.

#### 4.6.4.2 활성화 실패 태그

Ability에는 Ability 활성화 실패 이유를 알려주는 기본 로직이 있습니다. 이를 활성화하려면 기본 실패 케이스에 해당하는 GameplayTag를 설정해야 합니다.

다음 태그(또는 자신만의 명명 규칙)를 프로젝트에 추가하세요:

```C++
+GameplayTagList=(Tag="Activation.Fail.BlockedByTags",DevComment="")
+GameplayTagList=(Tag="Activation.Fail.CantAffordCost",DevComment="")
+GameplayTagList=(Tag="Activation.Fail.IsDead",DevComment="")
+GameplayTagList=(Tag="Activation.Fail.MissingTags",DevComment="")
+GameplayTagList=(Tag="Activation.Fail.Networking",DevComment="")
+GameplayTagList=(Tag="Activation.Fail.OnCooldown",DevComment="")
```

그 다음, 이 태그들을 GASDocumentation\Config\DefaultGame.ini에 추가하세요:

```C++
[/Script/GameplayAbilities.AbilitySystemGlobals]
ActivateFailIsDeadName=Activation.Fail.IsDead
ActivateFailCooldownName=Activation.Fail.OnCooldown
ActivateFailCostName=Activation.Fail.CantAffordCost
ActivateFailTagsBlockedName=Activation.Fail.BlockedByTags
ActivateFailTagsMissingName=Activation.Fail.MissingTags
ActivateFailNetworkingName=Activation.Fail.Networking
```

이제 Ability 활성화가 실패할 때마다, 해당 GameplayTag가 출력 로그 메시지에 포함되거나 showdebug AbilitySystem HUD에서 표시됩니다.

```C++
LogAbilitySystem: Display: InternalServerTryActivateAbility. Rejecting ClientActivation of Default__GA_FireGun_C. InternalTryActivateAbility failed: Activation.Fail.BlockedByTags
LogAbilitySystem: Display: ClientActivateAbilityFailed_Implementation. PredictionKey :109 Ability: Default__GA_FireGun_C
```

![](https://blog.kakaocdn.net/dn/bpEuqz/btsnOe8Eq0t/MoBfIdWlvITbL2j2SnmQR1/img.png)

### 4.6.5  Ability 취소

GameplayAbility를 내부에서 취소하려면 CancelAbility()를 호출합니다. 이 함수는 EndAbility()를 호출하고, 그 파라미터 중 WasCancelled를 true로 설정합니다. 외부에서 GameplayAbility를 취소하려면, ASC는 몇 가지 함수를 제공합니다

```C++
/** 지정된 Ability CDO를 취소합니다. */
void CancelAbility(UGameplayAbility* Ability);	

/** 전달된 Spec Handle로 표시된 Ability를 취소합니다. Handle이 재활성화된 Ability 목록에 없으면 아무 일도 일어나지 않습니다. */
void CancelAbilityHandle(const FGameplayAbilitySpecHandle& AbilityHandle);

/** 지정된 태그로 모든 Ability를 취소합니다. Ignore 인스턴스는 취소하지 않습니다. */
void CancelAbilities(const FGameplayTagContainer* WithTags=nullptr, const FGameplayTagContainer* WithoutTags=nullptr, UGameplayAbility* Ignore=nullptr);

/** 태그와 관계없이 모든 Ability를 취소합니다. Ignore 인스턴스는 취소하지 않습니다. */
void CancelAllAbilities(UGameplayAbility* Ignore=nullptr);

/** 모든 Ability를 취소하고 남아있는 인스턴스된 Ability를 종료합니다. */
virtual void DestroyActiveState();
```

> **💡Note**: CancelAllAbilities는 인스턴스화되지 않은 GameplayAbility가 있을 경우 제대로 작동하지 않는 것 같습니다. 비인스턴스화된 GameplayAbility를 처리하고 멈추는 경우가 발생하는 것 같습니다. CancelAbilities는 비인스턴스화된 GameplayAbility를 더 잘 처리할 수 있으며, 이는 샘플 프로젝트에서 사용되는 방식입니다 (Jump는 비인스턴스화된 GameplayAbility입니다). 결과는 환경에 따라 달라질 수 있습니다.

### 4.6.6 활성화된 Ability 얻기

초보자들은 종종 활성화된 Ability를 어떻게 얻을 수 있나요?라고 묻습니다. 이는 Ability의 변수 값을 설정하거나 Ability를 취소하기 위해서일 수 있습니다. 한 번에 여러 개의 GameplayAbility가 활성화될 수 있기 때문에, 단 하나의 **활성화된 Ability**는 존재하지 않습니다. 대신, ASC의 ActivatableAbilities 목록을 검색하여 원하는 Asset)또는 부여된 GameplayTag와 일치하는 Ability를 찾아야 합니다.

UAbilitySystemComponent::GetActivatableAbilities()는 순회할 수 있는 `TArray<FGameplayAbilitySpec>`를 반환합니다.

ASC는 또한 GameplayTagContainer를 매개변수로 받아 GameplayAbilitySpecs 목록을 직접 순회하는 대신 검색을 도와주는 다른 헬퍼 함수를 제공합니다. bOnlyAbilitiesThatSatisfyTagRequirements 파라미터는 GameplayTag 요구사항을 충족하고 지금 당장 활성화될 수 있는 GameplayAbilitySpec만 반환합니다. 예를 들어, 무기를 가진 기본 공격 능력과 맨손 기본 공격 Ability가 있을 경우, 무기가 장착되어 있는지에 따라 해당 GameplayTag 요구 사항을 설정하고 올바른 능력이 활성화됩니다. 이 함수에 대한 에픽 게임즈의 주석에서 더 많은 정보를 확인할 수 있습니다.


```C++
UAbilitySystemComponent::GetActivatableGameplayAbilitySpecsByAllMatchingTags(const FGameplayTagContainer& GameplayTagContainer, TArray < struct FGameplayAbilitySpec* >& MatchingGameplayAbilities, bool bOnlyAbilitiesThatSatisfyTagRequirements = true)
```

원하는 FGameplayAbilitySpec을 찾았다면, 그 위에서 IsActive()를 호출할 수 있습니다.

#### 4.6.7 Instancing Policy

GameplayAbility의 Instancing Policy는 Ability가 활성화될 때 어떻게 인스턴스화되는지를 결정합니다.

|   |   |   |
|---|---|---|
|**Instancing Policy**|**설명**|**사용 예시**|
|Instanced Per Actor|각 ASC는 활성화 간에 재사용되는 하나의 GameplayAbility 인스턴스를 가집니다.|가장 자주 사용되는 Instancing Policy입니다. 모든 Ability에 사용할 수 있으며, 활성화 간에 지속성을 제공합니다. 디자이너는 필요시 변수들을 수동으로 리셋해야 합니다.|
|Instanced Per Execution|GameplayAbility가 활성화될 때마다 새로운 인스턴스가 생성됩니다.|변수들이 매번 리셋되므로 해당 GameplayAbility는 활성화할 때마다 새로 생성됩니다. 성능은 Instanced Per Actor보다 나쁘지만, 변수 리셋이 필요할 때 유용합니다. 샘플 프로젝트에서는 이 방식을 사용하지 않습니다.|
|Non-Instanced|GameplayAbility는 ClassDefaultObject에서 작동하며 인스턴스가 생성되지 않습니다.|성능이 가장 좋지만 기능적으로 제한적입니다. 상태를 저장할 수 없고, 동적 변수를 사용할 수 없으며, AbilityTask 델리게이트와 바인딩할 수 없습니다. 주로 MOBA나 RTS에서 자주 사용되는 간단한 Ability(예: 미니언 기본 공격)에 적합합니다. 샘플 프로젝트의 Jump GameplayAbility는 Non-Instanced입니다.|

### 4.6.8 Net Execution Policy

GameplayAbility의 Net Execution Policy는 GameplayAbility를 누가 실행하는지와 그 실행 순서를 결정합니다.

|   |   |
|---|---|
|**Net Execution Policy**|**설명**|
|Local Only|GameplayAbility는 소유한 클라이언트에서만 실행됩니다. 로컬에서만 시각적 효과를 변경하는 Ability에 유용할 수 있습니다. 싱글 플레이어 게임에서는 Server Only를 사용해야 합니다.|
|Local Predicted|Local Predicted GameplayAbility는 먼저 소유한 클라이언트에서 활성화되고, 그 후 서버에서 실행됩니다. 서버는 클라이언트가 예측한 내용을 수정합니다. 예측에 대한 자세한 내용은 [Prediction](https://github.com/tranek/GASDocumentation?tab=readme-ov-file#concepts-p)을 참조해주세요.|
|Server Only|GameplayAbility는 오직 서버에서만 실행됩니다. Passive GameplayAbility는 보통 Server Only입니다. 싱글 플레이어 게임에서는 이 방식을 사용해야 합니다.|
|Server Initiated|Server Initiated GameplayAbility는 먼저 서버에서 활성화되고, 그 후 소유한 클라이언트에서 실행됩니다. 개인적으로는 이 방법은 많이 사용하지 않았습니다.|

### 4.6.9  Ability 태그

GameplayAbility는 내장된 로직을 가진 GameplayTagContainer와 함께 제공됩니다. 이 GameplayTag는 복제되지 않습니다.

|   |   |
|---|---|
|**GameplayTagContainer**|**설명**|
|Ability Tags|GameplayAbility가 소유한 GameplayTag입니다. 이들은 GameplayAbility를 설명하는 데 사용됩니다.|
|Cancel Abilities with Tag|해당 GameplayAbility가 활성화될 때, 해당 Ability Tag에 포함된 GameplayTag를 가진 다른 GameplayAbility는 취소됩니다.|
|Block Abilities with Tag|해당 GameplayAbility가 활성화되는 동안, 해당 Ability Tag에 포함된 GameplayTag를 가진 다른 GameplayAbility는 활성화될 수 없습니다.|
|Activation Owned Tags|해당 GameplayAbility가 활성화되는 동안 소유자에게 주어지는 GameplayTags입니다. 단, 이들은 리플리케이되지 않습니다.|
|Activation Required Tags|해당 GameplayAbility는 소유자가 모든 해당 GameplayTag를 가지고 있어야만 활성화될 수 있습니다.|
|Activation Blocked Tags|해당 GameplayAbility는 소유자가 해당 GameplayTag를 가진 경우 활성화될 수 없습니다.|
|Source Required Tags|해당 GameplayAbility는 소스가 모든 해당 GameplayTag를 가지고 있어야만 활성화될 수 있습니다. 소스의 GameplayTag는 이벤트로 트리거될 때만 설정됩니다.|
|Source Blocked Tags|해당 GameplayAbility는 소스가 해당 GameplayTag를 가진 경우 활성화될 수 없습니다. 소스의 GameplayTag는 이벤트로 트리거될 때만 설정됩니다.|
|Target Required Tags|해당 GameplayAbility는 대상이 모든 해당 GameplayTag를 가지고 있어야만 활성화될 수 있습니다. 대상의 GameplayTag는 이벤트로 트리거될 때만 설정됩니다.|
|Target Blocked Tags|해당 GameplayAbility는 대상이 해당 GameplayTag를 가진 경우 활성화될 수 없습니다. 대상의 GameplayTag는 이벤트로 트리거될 때만 설정됩니다.|

### 4.6.10 GameplayAbilitySpec

GameplayAbilitySpec는 GameplayAbility가 부여된 후 ASC에 존재하며, 활성화 가능한 GameplayAbility - GameplayAbility 클래스, 레벨, 입력 바인딩, 그리고 GameplayAbility 클래스와 분리하여 유지해야 하는 런타임 상태를 정의합니다.

GameplayAbility가 서버에서 부여되면, 서버는 GameplayAbilitySpec을 소유하는 클라이언트에게 복제하여 해당 클라이언트가 이를 활성화할 수 있도록 합니다. GameplayAbilitySpec을 활성화하면, Instancing Policy에 따라 GameplayAbility의 인스턴스를 생성하거나(비인스턴스형 GameplayAbility는 생성하지 않음) 합니다.

### 4.6.11 Ability에 데이터 전달하기

GameplayAbility의 일반적인 패러다임은 Activate->Generate Data->Apply->End입니다. 때때로 기존 데이터를 처리해야 할 때가 있습니다. GAS는 외부 데이터를 GameplayAbility에 전달하는 몇 가지 방법을 제공합니다.

|   |   |
|---|---|
|**Method**|**내용**|
|Activate GameplayAbility by Event|이벤트를 사용하여 데이터 페이로드가 포함된 GameplayAbility를 활성화합니다. 이벤트의 페이로드는 로컬 예측(Local Predicted)된 GameplayAbility의 경우 클라이언트에서 서버로 복제됩니다. Optional Object 또는 TargetData 변수는 기존 변수에 맞지 않는 임의의 데이터를 위한 변수로 사용됩니다. 단점은 입력 바인드를 통해 Ability를 활성화할 수 없다는 점입니다. GameplayAbility를 이벤트로 활성화하려면, GameplayAbility에서 트리거를 설정해야 합니다. GameplayTag를 할당하고 GameplayEvent 옵션을 선택합니다. 이벤트를 보내려면, 함수 UAbilitySystemBlueprintLibrary::SendGameplayEventToActor(AActor* Actor, FGameplayTag EventTag, FGameplayEventData Payload)를 사용합니다.|
|Use WaitGameplayEvent AbilityTask|WaitGameplayEvent AbilityTask를 사용하여 GameplayAbility가 활성화된 후 이벤트를 기다리도록 할 수 있습니다. 이벤트 페이로드와 이를 보내는 과정은 GameplayAbility를 이벤트로 활성화하는 것과 동일합니다. 단점은 AbilityTask에 의해 이벤트가 복제되지 않으므로, Local Only 및 Server Only GameplayAbilities에서만 사용해야 한다는 점입니다. 이벤트 페이로드를 복제하는 자체 AbilityTask를 작성할 수 있는 가능성도 있습니다.|
|Use TargetData|커스텀 TargetData 구조체는 클라이언트와 서버 간에 임의의 데이터를 전달하는 좋은 방법입니다.|
|Store Data on the OwnerActor or AvatarActor|소유자(OwnerActor), 아바타(AvatarActor), 또는 참조를 얻을 수 있는 다른 객체에 저장된 리플리케이트된 변수를 사용하십시오. 해당 방법은 가장 유연하며 입력 바인딩으로 활성화된 GameplayAbility와 함께 작동합니다. 그러나 해당 방법은 데이터가 사용할 때 리플리케이트를 통해 동기화될 것인지를 보장하지 않습니다. 이를 미리 보장해야 합니다. 즉, 리플리케이트된 변수를 설정한 후 바로 GameplayAbility를 활성화하면 패킷 손실로 인해 수신자에서 발생하는 순서를 보장할 수 없습니다.|

### 4.6.12 Ability Cost 그리고 Cooldown

GameplayAbility는 선택적 Cost와 Cooldown 기능을 제공합니다. Cost는 ASC가 GameplayAbility를 활성화하기 위해 가져야 하는 미리 정의된 Attribute 값이며, 이는 Instant GameplayEffect (Cost GE)로 구현됩니다. Cooldown은 GameplayAbility가 만료될 때까지 재활성화를 방지하는 타이머로, Duration GameplayEffect (Cooldown GE)로 구현됩니다.

GameplayAbility가 UGameplayAbility::Activate()를 호출하기 전에, 먼저 UGameplayAbility::CanActivateAbility()를 호출합니다. 이 함수는 소유한 ASC가 Cost를 감당할 수 있는지 확인(UGameplayAbility::CheckCost())하고, GameplayAbility가 Cooldown 상태가 아닌지 확인(UGameplayAbility::CheckCooldown())합니다.

GameplayAbility가 Activate()를 호출한 후에는 언제든지 UGameplayAbility::CommitAbility()를 사용하여 Cost와 Cooldown을 커밋할 수 있습니다. 해당 함수는 UGameplayAbility::CommitCost()와 UGameplayAbility::CommitCooldown()을 호출합니다. 디자이너는 Cost와 Cooldown이 동시에 커밋되지 않아야 한다면 이를 별도로 호출할 수 있습니다. Cost와 Cooldown을 커밋하는 것은 CheckCost()와 CheckCooldown()을 다시 한 번 호출하며, 이는 해당 항목과 관련하여 GameplayAbility가 실패할 수 있는 마지막 기회입니다. GameplayAbility가 활성화된 후 소유한 ASC의 Attribute가 변경될 수 있으므로, 커밋 시점에서 Cost를 충족하지 못할 수 있습니다. Cost와 Cooldown을 커밋하는 것은 [Prediction Key](https://github.com/tranek/GASDocumentation?tab=readme-ov-file#concepts-p-key)가 유효한 경우 [로컬 예측](https://github.com/tranek/GASDocumentation?tab=readme-ov-file#concepts-p)이 가능합니다. 구현에 대한 자세한 내용은 [CostGE](https://github.com/tranek/GASDocumentation#concepts-ge-cost) 및 [CooldownGE](https://github.com/tranek/GASDocumentation#concepts-ge-cooldown)를 참조하세요.

### 4.6.13 Ability 레벨업

Ability를 레벨 업하는 두 가지 일반적인 방법이 있습니다:

|   |   |
|---|---|
|**레벨 업 방법**|**설명**|
|Ungrant and Regrant at the New Level|ASC에서 GameplayAbility를 제거(Ungrant)한 후, 서버에서 다음 레벨로 다시 부여(Regrant)합니다. 이때 활성화 상태의 GameplayAbility는 종료됩니다.|
|Increase the GameplayAbilitySpec's Level|서버에서 해당 GameplayAbilitySpec을 찾아 레벨을 증가시키고, 이를 Dirty로 표시하여 소유 클라이언트로 리플리케이트되도록 합니다. 활성화 상태의 GameplayAbility는 종료하지 않습니다.|

위 두 방법의 주요 차이는 레벨 업 시 활성 상태인 능력을 취소할지 여부입니다. 사용하는 Ability에 따라 두 가지 방법을 모두 활용해야 할 가능성이 높습니다. 이를 위해 UGameplayAbility 서브클래스에 bool 변수를 추가하여 어느 방법을 사용할지 지정하는 것을 추천합니다.

### 4.6.14 GameplayAbilitySet

GameplayAbilitySet는 GameplayAbility를 부여하는 로직이 있는 캐릭터의 시작GameplayAbility의 입력 바인딩과 목록을 보관하기 위한 편의성 데이터 에셋 클래스입니다. 서브클래스에는 추가 로직이나 프로퍼티를 포함할 수도 있습니다. 파라곤에는 영웅마다 주어진 모든 GameplayAbility를 포함하는 GameplayAbilitySet이 있었습니다.  
이 클래스는 적어도 지금까지 살펴본 바에 따르면 불필요한 클래스입니다. 샘플 프로젝트는 GDCharacterBase와 그 서브클래스 내부에서 GameplayAbilitySet의 모든 기능을 처리합니다.

GameplayAbilitySet는 UDataAsset 클래스의 편리한 서브클래스로, 캐릭터의 입력 바인딩과 시작 시 부여되는 GameplayAbility 목록을 저장하고, 이를 부여하는 로직을 포함합니다. 서브클래스는 추가 로직이나 프로퍼티를 포함할 수도 있습니다. Paragon에서는 영웅별 GameplayAbilitySet을 만들어 해당 영웅에게 부여되는 모든 GameplayAbility를 포함시켰습니다. 저는 현재까지 본 바로는 이 클래스가 필수적이라고 생각되지는 않습니다. 샘플 프로젝트에서는 GameplayAbilitySet의 모든 기능을 GDCharacterBase와 그 서브클래스 내부에서 처리하고 있습니다.

### 4.6.15 Ability Batching

기존 GameplayAbility의 수명 주기에는 클라이언트에서 서버까지 최소 2~3개의 RPC(Remote Procedure Call)가 포함됩니다.

1. CallServerTryActivateAbility()
2. ServerSetReplicatedTargetData() (선택 사항)
3. ServerEndAbility()

Gameplay Ability가 이 모든 작업을 한 프레임 내에서 원자적 그룹으로 수행하는 경우, 이 워크플로를 최적화하여 모든 두세 개의 RPC를 하나로 Batch(결합)할 수 있습니다. GAS에서는 이 RPC 최적화를 Ability Batching이라고 부릅니다.  
대표적인 예로 히트스캔(instant hit) 총을 들 수 있습니다. 히트스캔 총은 활성화, 라인 트레이스, 타겟 데이터(TargetData)를 서버에 전송, Ability 종료를 한 프레임 내의 원자적 그룹으로 처리합니다. GASShooter 샘플 프로젝트는 히트스캔 총에 이 기술을 활용하는 방법을 보여줍니다.

반자동 총기는 CallServerTryActivateAbility(), ServerSetReplicatedTargetData() (총알 명중 데이터), ServerEndAbility()를 하나의 RPC로 배치하여 세 개의 RPC를 하나로 줄이는 최상의 시나리오입니다.

자동/연발 총기는 첫 번째 총알의 CallServerTryActivateAbility()와 ServerSetReplicatedTargetData()를 하나의 RPC로 배칭합니다. 이후의 각 총알은 ServerSetReplicatedTargetData()가 별도의 RPC로 전송됩니다. 마지막으로, 총이 사격을 멈출 경우 ServerEndAbility()가 별도의 RPC로 전송됩니다. 이는 첫 번째 총알 발사 시에만 두 개의 RPC를 배칭해 하나로 줄이고 이후에는 더 이상 최적화할 수 없는 최악의 시나리오입니다. 이 시나리오는 Gameplay Event를 통해 Ability를 활성화하고 TargetData를 EventPayload에 포함하여 클라이언트에서 서버로 전송하는 방식으로도 구현할 수 있습니다. 그러나 이 방식의 단점은 TargetData를 Ability 외부에서 생성해야 한다는 점이며, 반면 Batching 접근법은 Ability 내부에서 TargetData를 생성합니다.

Ability Batching은 기본적으로 ASC(Ability System Component)에서 비활성화되어 있습니다.  
이를 활성화하려면, ShouldDoServerAbilityRPCBatch()를 재정의하여 true를 반환하도록 설정합니다.

```C++
virtual bool ShouldDoServerAbilityRPCBatch() const override { return true; }
```

이제 Ability Batching이 활성화되었으므로, 배칭하려는 Ability를 활성화하기 전에 FScopedServerAbilityRPCBatcher 구조체를 생성해야 합니다. 이 특별한 구조체는 범위 내의 모든 발생하는 모든 Ability를 배칭하려고 시도합니다. FScopedServerAbilityRPCBatcher가 범위를 벗어나면 이후에 할성화되는 Ability들은 더 이상 배칭을 시도하지 않습니다.

FScopedServerAbilityRPCBatcher는 배칭이 가능한 각 함수에 있는 특수 코드를 사용하여 RPC 호출을 가로채고, 해당 메시지를 Barch 구조체에 대신 패킹합니다. 그리고 FScopedServerAbilityRPCBatcher가 범위를 벗어나면, 자동으로 해당 Batch 구조체를 서버에 RPC로 전송합니다. 이 작업은 UAbilitySystemComponent::EndServerAbilityRPCBatch()에서 이루어집니다. 서버는 이 Batch RPC를 UAbilitySystemComponent::ServerAbilityRPCBatch_Internal(FServerAbilityRPCBatch& BatchInfo) 함수에서 수신합니다. BatchInfo 매개변수에는 Ability 종료해야 하는지 여부에 대한 flag, 활성화 시 입력 여부에 대한 flag, TargetData가 포함되어 있는 경우 TargetData가 포함됩니다. 해당 함수는 배칭이 올바르게 작동하는지 확인하기 위해 중단점을 설정하기 적합한 곳입니다. 또는, cvar AbilitySystem.ServerRPCBatching.Log 1을 사용하여 특수 Ability Batching 로그를 활성화할 수도 있습니다.

이 메커니즘은 C++에서만 가능하며, FGameplayAbilitySpecHandle을 통해서만 Ability를 활성화할 수 있습니다.


```C++
bool UGSAbilitySystemComponent::BatchRPCTryActivateAbility(FGameplayAbilitySpecHandle InAbilityHandle, bool EndAbilityImmediately)
{
    bool AbilityActivated = false;
    if (InAbilityHandle.IsValid())
    {
        FScopedServerAbilityRPCBatcher GSAbilityRPCBatcher(this, InAbilityHandle);
        AbilityActivated = TryActivateAbility(InAbilityHandle, true);

        if (EndAbilityImmediately)
        {
            FGameplayAbilitySpec* AbilitySpec = FindAbilitySpecFromHandle(InAbilityHandle);
            if (AbilitySpec)
            {
                UGSGameplayAbility* GSAbility = Cast<UGSGameplayAbility>(AbilitySpec->GetPrimaryInstance());
                GSAbility->ExternalEndAbility();
            }
        }

        return AbilityActivated;
    }

    return AbilityActivated;
}
```

GASShooter는 반자동 및 자동 총기에 대해 배칭된 GameplayAbility를 동일하게 사용하며, EndAbility()는 Ability 내에서 직접 호출되지 않습니다. 대신, EndAbility()는 플레이어 입력을 관리하고 현재 발사 모드에 따라 배치된 Ability 호출을 처리하는 로컬 전용 Ability에서 처리됩니다. 모든 RPC가 FScopedServerAbilityRPCBatcher 범위 내에서 발생해야 하므로, EndAbilityImmediately 파라미터를 제공하여 로컬 전용 Ability가 해당 Ability가 EndAbility() 호출을 배칭해야 하는지(반자동), 아니면 배칭하지 않아야 하는지(자동) 지정할 수 있게 합니다. EndAbility() 호출은 나중에 별도의 RPC로 발생하게 됩니다.

GASShooter는 배칭된 Ability를 트리거하는 로컬 전용 Ability에서 사용하는 Blueprint 노드를 노출하여 Ability 배칭을 허용합니다.

![](https://blog.kakaocdn.net/dn/Ma4Fu/btsnLcwuNL4/FAJhyfhE0PgULfycMsDzp0/img.png)

### 4.6.16 Net Security Policy

GameplayAbility의 NetSecurityPolicy는 Ability가 네트워크에서 실행될 위치를 결정하며, 제한된 Ability를 실행하려는 클라이언트로부터 보호합니다.

|   |   |
|---|---|
|**NetSecurityPolicy**|**설명**|
|ClientOrServer|보안 요구 사항이 없습니다.  <br>클라이언트와 서버 모두 자유롭게 Ability를 실행하고 종료할 수 있습니다.|
|ServerOnlyExecution|클라이언트가 Ability의 실행을 요청하면 서버에서 이를 무시합니다.  <br>클라이언트는 여전히 서버에게 Ability를 취소하거나 종료하도록 요청할 수 있습니다.|
|ServerOnlyTermination|클라이언트가 Ability의 취소나 종료를 요청하면 서버에서 이를 무시합니다.  <br>클라이언트는 여전히 Ability의 실행을 요청할 수 있습니다.|
|ServerOnly|서버가 Ability의 실행과 종료를 모두 제어합니다. 클라이언트가 어떤 요청을 하더라도 무시됩니다.|

## 4.7 AbilityTask

### 4.7.1 AbilityTask 정의

GameplayAbility는 한 프레임에서만 실행됩니다. 이로 인해 유연성이 제한됩니다. 시간이 지남에 따라 발생하는 작업이나 특정 시점에 호출되는 델리게이트에 반응해야 하는 작업을 수행하기 위해 우리는 AbilityTask라는 지연 작업을 사용합니다. GAS는 기본적으로 여러 종류의 AbilityTask를 제공합니다:

- RootMotionSource로 캐릭터 이동을 위한 작업
- 애니메이션 몽타주를 재생하는 작업
- Attribute 변경에 반응하는 작업
- GameplayEffect 변경에 반응하는 작업
- 플레이어 입력에 반응하는 작업
- 그 외의 작업들

UAbilityTask 생성자는 게임 전역에서 동시에 실행할 수 있는 최대 1000개의 AbilityTask만을 허용합니다. 이는 수백 명의 캐릭터가 동시에 존재하는 게임(예: RTS 게임)을 설계할 때 유의해야 합니다.

### 4.7.2 커스텀 AbilityTask

여러분은 종종 자신만의 커스텀 AbilityTask(C++)를 만들게 될 것입니다. 샘플 프로젝트에는 두 가지 커스텀 AbilityTask가 포함되어 있습니다:

- **PlayMontageAndWaitForEvent**: 기본 PlayMontageAndWait와 WaitGameplayEvent AbilityTask를 결합한 것입니다. 이 AbilityTask는 애니메이션 몽타주가 AnimNotify에서 발생한 GameplayEvent를 GameplayAbility로 다시 전달하도록 합니다. 애니메이션 몽타주 중 특정 시점에 행동을 트리거하는 데 사용합니다.
- **WaitReceiveDamage**: 해당 AbilityTask는 OwnerActor가 피해를 받을 때를 감지합니다. 패시브 갑옷 스택 능력은 영웅이 피해를 입을 때마다 갑옷 스택을 제거합니다.

AbilityTask는 다음과 같은 구성 요소로 이루어집니다:

- AbilityTask의 새 인스턴스를 생성하는 정적 함수
- AbilityTask가 완료되었을 때 방송되는 델리게이트
- 주요 작업을 시작하고 외부 델리게이트에 바인딩하는 Activate() 함수
- 외부 델리게이트와의 바인딩을 해제하는 등 정리를 위한 OnDestroy() 함수
- 바인딩된 외부 델리게이트에 대한 콜백 함수
- 멤버 변수와 내부 헬퍼 함수들

> **💡Note**: AbilityTask는 한 가지 유형의 출력 델리게이트만 선언할 수 있습니다. 매개변수 사용 여부에 관계없이 모든 출력 델리게이트는 이 유형이어야 합니다. 사용하지 않는 델리게이트 매개변수에는 기본값을 전달해야 합니다.

AbilityTask는 해당 GameplayAbility를 실행하는 클라이언트나 서버에서만 실행됩니다. 하지만 AbilityTask는 bSimulatedTask = true;를 AbilityTask 생성자에 설정하고, InitSimulatedTask(UGameplayTasksComponent& InGameplayTasksComponent)를 오버라이드하며, 필요한 멤버 변수들을 리플리케이트되도록 설정하면 시뮬레이션 클라이언트에서 실행되도록 설정할 수 있습니다. 이는 모든 이동 변경 사항을 리플리케이트하는 대신 전체 이동 AbilityTask를 시뮬레이션하고자 하는 드문 상황에서 유용합니다. 모든 RootMotionSource 관련 AbilityTask가 이렇게 동작합니다. AbilityTask_MoveToLocation.h/.cpp를 예시로 참고할 수 있습니다.

AbilityTask는 생성자에서 bTickingTask = true;를 설정하고 virtual void TickTask(float DeltaTime)를 오버라이드하면 틱(Tick)을 실행할 수 있습니다. 이는 프레임 간에 부드럽게 값을 보간(lerp)해야 할 때 유용합니다. AbilityTask_MoveToLocation.h/.cpp에서 예시를 확인할 수 있습니다.

### 4.7.3 AbilityTask 사용

C++(GDGA_FireGun.cpp)에서 AbilityTask를 생성하고 활성화하려면 다음과 같이 합니다:


```C++
UGDAT_PlayMontageAndWaitForEvent* Task = UGDAT_PlayMontageAndWaitForEvent::PlayMontageAndWaitForEvent(this, NAME_None, MontageToPlay, FGameplayTagContainer(), 1.0f, NAME_None, false, 1.0f);
Task->OnBlendOut.AddDynamic(this, &UGDGA_FireGun::OnCompleted);
Task->OnCompleted.AddDynamic(this, &UGDGA_FireGun::OnCompleted);
Task->OnInterrupted.AddDynamic(this, &UGDGA_FireGun::OnCancelled);
Task->OnCancelled.AddDynamic(this, &UGDGA_FireGun::OnCancelled);
Task->EventReceived.AddDynamic(this, &UGDGA_FireGun::EventReceived);
Task->ReadyForActivation();
```

Blueprint에서는 AbilityTask에 대해 생성한 Blueprint 노드를 사용하면 됩니다. ReadyForActivation()을 호출할 필요가 없으며, 이는 Engine/Source/Editor/GameplayTasksEditor/Private/K2Node_LatentGameplayTaskCall.cpp에서 자동으로 호출됩니다. K2Node_LatentGameplayTaskCall은 또한 AbilityTask 클래스에 BeginSpawningActor()와 FinishSpawningActor()가 있으면 자동으로 호출합니다(예: AbilityTask_WaitTargetData 참조). 다시 한 번 강조하자면, K2Node_LatentGameplayTaskCall은 Blueprint에서만 자동으로 호출됩니다. C++에서는 ReadyForActivation(), BeginSpawningActor(), FinishSpawningActor()를 수동으로 호출해야 합니다.

![](https://blog.kakaocdn.net/dn/nhC8k/btsn7wHZ8fp/O1kNP2fGKod79nJ5JbMrWK/img.png)

Blueprint에서 AbilityTask를 수동으로 취소하려면, AbilityTask 객체(Async Task Proxy)에서 EndTask()를 호출하거나 C++에서 동일하게 호출하면 됩니다.

### 4.7.4 Root Motion Source AbilityTask

GAS에는 CharacterMovementComponent에 연결된 Root Motion Source를 사용하여 넉백, 복잡한 점프, 당기기, 돌진 등 시간 경과에 따라 캐릭터를 움직일 수 있는 AbilityTask가 포함되어 있습니다.

RootMotionSource AbilityTasks의 예측은 엔진 버전 4.19와 4.25+에서는 정상적으로 작동합니다. 하지만 4.20-4.24 버전에서는 예측에 버그가 있어, 멀티플레이어에서 네트워크 수정이 필요하며, 싱글 플레이에서는 완벽하게 작동합니다. 4.25의 예측 수정 사항을 4.20-4.24 버전의 엔진에 적용하는 것도 가능합니다.

> **💡Note**: RootMotionSource AbilityTask의 예측은 엔진 버전 4.19 및 4.25 이상에서는 정상 작동합니다. 하지만 엔진 4.20~4.24 버전에서는 예측에 버그가 있어, 멀티플레이어에서 네트워크 수정이 필요하며 싱글 플레이에서는 완벽하게 작동합니다. 4.25의 예측 수정 사항을 4.20-4.24 버전의 엔진에 적용하는 것도 가능합니다.

### 4.8 GameplayCue

### 4.8.1 GameplayCue 정의

GameplayCue(GC)는 게임플레이와 관련되지 않은 작업들을 실행하는데 사용됩니다. 예를 들어, 사운드 효과, 파티클 효과, 카메라 흔들기 등입니다. GameplayCue는 일반적으로 리플리케이트 되어 실행되며(명시적으로 로컬에서만 실행, 추가 또는 제거되지 않는 한) 예측됩니다.

GameplayCue는 해당 GameplayTag와 반드시 **GameplayCue**라는 부모 이름 및 이벤트 유형(Execute, Add, Remove)을 함께 ASC를 통해 GameplayCueManager로 보내어 트리거됩니다. GameplayCueNotify 객체와 IGameplayCueInterface를 구현한 다른 액터들은 GameplayCue의 GameplayTag(GameplayCueTag)에 따라 이 이벤트를 구독할 수 있습니다.

> **💡Note**: 다시 한 번 말씀드리자면, GameplayCue의 GameplayTag는 반드시 GameplayCue라는 부모 GameplayTag로 시작해야 합니다. 예를 들어, 유효한 GameplayCue GameplayTag는 GameplayCue.A.B.C와 같습니다.

GameplayCueNotify에는 Static과 Actor라는 두 가지 종류가 있습니다. 각각은 서로 다른 이벤트에 응답하고, 다른 유형의 GameplayEffect가 이들을 트리거할 수 있습니다. 해당 이벤트를 오버라이드하여 필요한 로직을 구현하면 됩니다.

|   |   |   |   |
|---|---|---|---|
|**GameplayCue 클래스**|**이벤트**|**GameplayEffect 유형**|**설명**|
|GameplayCueNotify_Static|Execute|Instant or Periodic|Static GameplayCueNotify는 CDO에서 작동하며(인스턴스가 없음을 의미) 타격 임팩트와 같은 일회성 효에 적합합니다.|
|GameplayCueNotify_Actor|Add 혹은 Remove|Duration or Infinite|Actor GameplayCueNotify가 추가되면 새 인스턴스를 스폰합니다. 인스턴스화되어 있기 때문에 제거될 때까지 계속 동작을 할 수 있습니다. 백킹 지속 시간 또는 무한 GameplayEffect가 제거되거나 수동으로 remove를 호출하면 제거되는 사운드 및 파티클 이펙트를 루핑하는 데 좋습니다. 또한 동시에 추가할 수 있는 개수를 관리할 수 있는 옵션도 제공되므로 동일한 효과를 여러 번 적용할 때 사운드나 파티클이 한 번만 시작되도록 할 수 있습니다.  <br>  <br>Actor GameplayCueNotify는 추가될 때마다 새로운 인스턴스를 생성합니다. 이들은 인스턴스화되어 있으므로 시간이 지나면서 반복되는 소리나 파티클 효과를 처리할 수 있습니다. 이들은 해당 Duration이나 Infinite GameplayEffect가 제거되면 자동으로 제거됩니다. 또는 수동으로 제거를 호출할 수도 있습니다. 또한 여러 번 적용된 동일한 효과가 소리나 파티클을 한 번만 시작하도록 허용하는 옵션도 있습니다.|

GameplayCueNotify는 기술적으로 모든 이벤트에 응답할 수 있지만 일반적으로 위 방식을 사용합니다.

> **💡Note**: GameplayCueNotify_Actor를 사용할 때, Remove 시 Auto Destroy를 체크하지 않으면 이후 동일한 GameplayCueTag에 대한 Add 호출이 작동하지 않을 수 있습니다.

전체가 아닌 ASC [Replication Mode](https://github.com/tranek/GASDocumentation#concepts-asc-rm)를 사용하는 경우, 서버 플레이어(리스닝 서버)에서 추가 및 제거 GC 이벤트가 두 번 발생합니다. 한 번은 GE를 적용할 때, 다른 한 번은 "최소" NetMultiCast에서 클라이언트로 전송할 때 발생합니다. 하지만 WhileActive 이벤트는 여전히 한 번만 발동합니다. 모든 이벤트는 클라이언트에서 한 번만 발생합니다.

ASC 리플리케이션 모드가 Full이 아닌 경우, 서버 플레이어(리스닝 서버)에서는 Add 및 Remove GC 이벤트가 두 번 발생합니다. 첫 번째는 GE를 적용하는 것이고, 두 번째는 **최소한의** NetMultiCast를 통해 클라이언트에 전달됩니다. 하지만

WhileActive 이벤트는 여전히 한 번만 발생합니다. 모든 이벤트는 클라이언트에서 한 번만 발생합니다.

샘플 프로젝트에는 스턴과 스프린트 효과를 위한 GameplayCueNotify_Actor와 FireGun의 발사체 충돌을 위한 GameplayCueNotify_Static이 포함되어 있습니다. 이러한 GC는 GE를 통해 리플리케이트하는 대신 로컬에서 트리거하여 최적화할 수 있습니다. 샘플 프로젝트에서는 초보자에게 적합한 방법으로 이를 보여주기로 했습니다.

### 4.8.2 GameplayCue 트리거링

GameplayEffect가 성공적으로 적용되었을 때(태그나 면역에 의해 차단되지 않았을 때) GameplayEffect 내부에서 트리거되어야 하는 모든 GameplayCue의 GameplayTag를 채웁니다.

![](https://blog.kakaocdn.net/dn/69uoY/btsnZ0DENR4/Qn0PqaxlAcuSz4viR9ZqZ1/img.png)

UGameplayAbility는 GameplayCue를 실행, 추가 또는 제거하는 블루프린트 노드를 제공합니다.

![](https://blog.kakaocdn.net/dn/VGhOY/btsn0GLLCiA/Gnvk7PRn6bj4OMRl28H6r1/img.png)

C++에서는 ASC에서 직접 함수를 호출하거나 ASC 서브클래스에서 블루프린트로 노출할 수 있습니다:

cpp

접기

```
/** GameplayCue는 독립적으로 올 수 있습니다. 이들은 EffectContext를 전달하여 히트 결과 등을 처리할 수 있습니다. */
void ExecuteGameplayCue(const FGameplayTag GameplayCueTag, FGameplayEffectContextHandle EffectContext = FGameplayEffectContextHandle());
void ExecuteGameplayCue(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters);

/** 지속적인 GameplayCue를 추가합니다. */
void AddGameplayCue(const FGameplayTag GameplayCueTag, FGameplayEffectContextHandle EffectContext = FGameplayEffectContextHandle());
void AddGameplayCue(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters);

/** 지속적인 GameplayCue를 제거합니다. */
void RemoveGameplayCue(const FGameplayTag GameplayCueTag);

/** 자체적으로 추가된 GameplayCue를 제거합니다. 즉, GameplayEffect의 일부로 추가되지 않은 경우입니다. */
void RemoveAllGameplayCues();
```

### 4.8.3 로컬 GameplayCue

GameplayAbility와 ASC에서 GameplayCue를 발사하는 함수는 기본적으로 리플리케이트됩니다. 각 GameplayCue 이벤트는 멀티캐스트 RPC입니다. 이로 인해 많은 RPC 호출이 발생할 수 있습니다. GAS는 동일한 GameplayCue RPC가 네트워크 업데이트당 최대 두 번만 실행되도록 제한합니다. 이를 피하기 위해 가능한 경우 로컬 GameplayCue를 사용합니다. 로컬 GameplayCue는 개별 클라이언트에서만 Execute, Add, 또는 Remove가 실행됩니다.

로컬 GameplayCue를 사용할 수 있는 시나리오:

- 발사체 충돌
- 근접 충돌 충돌
- 애니메이션 몽타주에서 발동되는 GameplayCue

로컬 GameplayCue 함수(ASC 서브클래스에 추가해야 할 함수들) 입니다:

cpp

접기

```
UFUNCTION(BlueprintCallable, Category = "GameplayCue", Meta = (AutoCreateRefTerm = "GameplayCueParameters", GameplayTagFilter = "GameplayCue"))
void ExecuteGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters);

UFUNCTION(BlueprintCallable, Category = "GameplayCue", Meta = (AutoCreateRefTerm = "GameplayCueParameters", GameplayTagFilter = "GameplayCue"))
void AddGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters);

UFUNCTION(BlueprintCallable, Category = "GameplayCue", Meta = (AutoCreateRefTerm = "GameplayCueParameters", GameplayTagFilter = "GameplayCue"))
void RemoveGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters);
```

cpp

접기

```
void UPAAbilitySystemComponent::ExecuteGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters)
{
    UAbilitySystemGlobals::Get().GetGameplayCueManager()->HandleGameplayCue(GetOwner(), GameplayCueTag, EGameplayCueEvent::Type::Executed, GameplayCueParameters);
}

void UPAAbilitySystemComponent::AddGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters)
{
    UAbilitySystemGlobals::Get().GetGameplayCueManager()->HandleGameplayCue(GetOwner(), GameplayCueTag, EGameplayCueEvent::Type::OnActive, GameplayCueParameters);
    UAbilitySystemGlobals::Get().GetGameplayCueManager()->HandleGameplayCue(GetOwner(), GameplayCueTag, EGameplayCueEvent::Type::WhileActive, GameplayCueParameters);
}

void UPAAbilitySystemComponent::RemoveGameplayCueLocal(const FGameplayTag GameplayCueTag, const FGameplayCueParameters& GameplayCueParameters)
{
    UAbilitySystemGlobals::Get().GetGameplayCueManager()->HandleGameplayCue(GetOwner(), GameplayCueTag, EGameplayCueEvent::Type::Removed, GameplayCueParameters);
}
```

만약 GameplayCue가 로컬에서 추가되었다면, 로컬에서 제거되어야 합니다. 만약 리플리케이트를 통해 추가되었다면, 리플리케이트를 통해 제거되어야 합니다.

### 4.8.4 GameplayCue 파라미터

GameplayCue는 FGameplayCueParameters 구조체를 받아 해당 GameplayCue에 대한 추가 정보를 전달합니다. 만약 GameplayCue가 GameplayAbility나 ASC의 함수에서 수동으로 트리거된다면, GameplayCue에 전달되는 FGameplayCueParameters 구조체를 수동으로 채워야 합니다. 만약 GameplayCue가 GameplayEffect에 의해 트리거된다면, 다음과 같은 변수들이 FGameplayCueParameters 구조체에 자동으로 채워집니다:

- AggregatedSourceTags
- AggregatedTargetTags
- GameplayEffectLevel
- AbilityLevel
- EffectContext
- Magnitude (만약 GameplayEffect에 Magnitude를 위한 Attribute가 선택되어 있고, 그 Attribute에 영향을 미치는 해당 Modifier가 있는 경우)

FGameplayCueParameters 구조체의 SourceObject 변수는 GameplayCue를 수동으로 트리거할 때 임의의 데이터를 GameplayCue로 전달하는 데 유용한 장소일 수 있습니다.

> **💡Note**: Instigator와 같은 일부 변수는 이미 EffectContext에 존재할 수도 있습니다. EffectContext는 또한 GameplayCue를 월드에 어디에 스폰할지에 대한 FHitResult를 포함할 수 있습니다.   
> EffectContext 를 서브클래싱하는 것은 GameplayEffect에 의해 트리거되는 GameplayCue에 더 많은 데이터를 전달하는 좋은 방법일 수 있습니다.

자세한 내용은 FGameplayCueParameters 구조체를 채우는 UAbilitySystemGlobals의 3가지 함수들을 참조해주세요. 해당 함수들은 가상 함수이므로, 이를 오버라이드하여 더 많은 정보를 자동으로 채울 수 있습니다.


```C++
/** GameplayCue 파라미터 초기화 */
virtual void InitGameplayCueParameters(FGameplayCueParameters& CueParameters, const FGameplayEffectSpecForRPC &Spec);
virtual void InitGameplayCueParameters_GESpec(FGameplayCueParameters& CueParameters, const FGameplayEffectSpec &Spec);
virtual void InitGameplayCueParameters(FGameplayCueParameters& CueParameters, const FGameplayEffectContextHandle& EffectContext);
```

### 4.8.5 GameplayCue Manager

기본적으로 GameplayCueManager는 게임 디렉토리 전체를 스캔하여 GameplayCueNotify를 찾고, 게임 실행 시 이를  메모리에 로드합니다. 이 경로를 변경하려면 DefaultGame.ini에서 설정할 수 있습니다.


```C++
[/Script/GameplayAbilities.AbilitySystemGlobals]
GameplayCueNotifyPaths="/Game/GASDocumentation/Characters"
```

GameplayCueManager가 모든 GameplayCueNotify를 스캔하고 찾도록 할 수 있지만, 게임 시작 시 모든 것을 비동기적으로 로드하지 않도록 설정할 수 있습니다. 이렇게 하면 GameplayCueNotify와 그와 관련된 모든 사운드와 파티클이 레벨에서 사용되었는지와 관계없이 메모리에 로드되지 않습니다. Paragon과 같은 대형 게임에서는 이로 인해 수백 메가바이트의 불필요한 자산이 메모리에 로드되어 게임 시작 시 Hitching(버벅거림)이나 Freezing(게임 멈춤)을 초래할 수 있습니다.

게임 시작 시 모든 GameplayCue를 비동기적으로 로드하는 대신, GameplayCue가 게임 내에서 트리거될 때만 비동기적으로 로드하도록 설정할 수 있습니다. 이 방법은 불필요한 메모리 사용을 줄이고 게임이 시작될 때 GameplayCue를 비동기적으로 로드할 때 발생할 수 있는 게임의 하드 프리징을 방지하는 데 도움이 됩니다. 그러나 특정 GameplayCue가 게임 중 처음 트리거될 때 약간의 지연이 발생할 수 있습니다. 이 지연은 SSD에서는 발생하지 않으며, HDD에서는 테스트되지 않았습니다. UE Editor를 사용할 경우, GameplayCue가 처음 로드될 때 파티클 시스템을 컴파일해야 할 수 있으므로 약간의 Hitching이나 Freezing이 발생할 수 있습니다. 그러나 빌드에서는 이미 파티클 시스템이 컴파일되었으므로 문제가 되지 않습니다.

먼저 UGameplayCueManager를 서브클래싱하고, AbilitySystemGlobals 클래스가 우리의 UGameplayCueManager 서브클래스를 사용하도록 DefaultGame.ini에서 설정해야 합니다.

```
[/Script/GameplayAbilities.AbilitySystemGlobals]
GlobalGameplayCueManagerClass="/Script/ParagonAssets.PBGameplayCueManager"
```

그 후, UGameplayCueManager 서브클래스에서 ShouldAsyncLoadRuntimeObjectLibraries()를 오버라이드합니다.

```C++
virtual bool ShouldAsyncLoadRuntimeObjectLibraries() const override
{
    return false;
}
```

### 4.8.6 GameplayCue가 발동되지 않도록 방지

때때로 GameplayCue가 실행되지 않기를 원할 수 있습니다. 예를 들어, 공격을 차단하는 경우 피해 GameplayEffect에 연결된 피격 임팩트를 재생하지 않거나 대신 커스텀 피격 임팩트를 재생하고 싶을 수 있습니다. 이 경우 GameplayEffectExecutionCalculation 내에서 OutExecutionOutput.MarkGameplayCuesHandledManually()를 호출하고, 이후 ASC의 Target이나 Source에 수동으로 GameplayCue 이벤트를 전송할 수 있습니다.

특정 ASC에서 GameplayCue가 전혀 실행되지 않게 하려면, AbilitySystemComponent->bSuppressGameplayCues = true;로 설정할 수 있습니다.

### 4.8.7 GameplayCue 일괄 처리

GameplayCue가 트리거되었을 때 각 GameplayCue는 Unreliable NetMulticast RPC입니다. 여러 GameplayCue를 동시에 발사하는 상황에서는, 이를 하나의 RPC로 압축하거나 데이터를 덜 전송하여 대역폭을 절약할 수 있는 몇 가지 최적화 방법이 있습니다.

#### 4.8.7.1 수동 RPC

예를 들어, 샷건이 8개의 총알을 발사한다고 가정해 보겠습니다. 그러면 8개의 트레이스와 임팩트 GameplayCue가 발생합니다. GASShooter는 이를 하나의 RPC로 합치는 간단한 방법을 사용하여 모든 트레이스 정보를 EffectContext에 TargetData로 저장합니다. 이렇게 하면 RPC 수가 8에서 1로 줄어들지만, 여전히 그 하나의 RPC에서 약 500바이트의 데이터가 전송됩니다. 더 최적화된 방법은 임팩트 위치를 효율적으로 인코딩하는 커스텀 구조체를 사용하여 RPC를 보내거나, 랜덤 시드 번호를 사용해 수신 측에서 임팩트 위치를 재생성하거나 근사화하는 방법입니다. 클라이언트는 이 커스텀 구조체를 언팩하여 로컬에서 실행되는 GameplayCue로 변환합니다.

이 방법은 다음과 같이 작동합니다:

1. FScopedGameplayCueSendContext를 선언합니다. 이것은 UGameplayCueManager::FlushPendingCues()의 호출을 범위 밖으로 나올 때까지 억제하여, 모든 GameplayCue가 FScopedGameplayCueSendContext 범위 밖으로 나올 때까지 큐에 저장됩니다.
2. UGameplayCueManager::FlushPendingCues()를 오버라이드하여, 일부 GameplayTag에 따라 배치할 수 있는 GameplayCue들을 커스텀 구조체에 병합하고 이를 클라이언트로 RPC로 전송합니다.
3. 클라이언트는 커스텀 구조체를 수신하고 이를 로컬에서 실행되는 GameplayCue로 언팩합니다.

이 방법은 FGameplayCueParameters에 맞지 않는 특정 GameplayCue 파라미터가 필요할 때, 예를 들어 피해 수치, 치명타 표시, 방어구가 파괴된 표시, 치명적인 타격 표시 등을 추가하려고 할 때 유용하게 사용할 수 있습니다.

#### 4.8.7.2 하나의 GE에 여러 GC

GameplayEffect의 모든 GameplayCue는 이미 하나의 RPC에 전송되어 있습니다. 기본적으로 UGameplayCueManager::InvokeGameplayCueAddedAndWhileActive_FromSpec()은 ASC의 리플리케이션 모드와 상관없이 신뢰할 수 없는 NetMultiCast에서 전체 GameplayEffectSpec을 (하지만 FGameplayEffectSpecForRPC로 변환하여) 전송합니다. GameplayEffectSpec에 무엇이 있느냐에 따라 대역폭이 많이 소모될 수 있습니다. cvar AbilitySystem.AlwaysConvertGESpecToGCParams 1을 설정하여 이를 최적화할 수 있습니다. 그러면 GameplayEffectSpec을 FGameplayEffectSpec 전체가 아닌 FGameplayCueParameter 구조체로 변환하고 이를 RPC 합니다. 이렇게 하면 잠재적으로 대역폭을 절약할 수 있지만, GESpec이 GameplayCueParameters로 변환되는 방식과 GC가 알아야 하는 정보에 따라 정보가 적을 수도 있습니다.

모든 GameplayCue는 이미 하나의 RPC로 전송됩니다. 기본적으로 UGameplayCueManager::InvokeGameplayCueAddedAndWhileActive_FromSpec()는 전체 GameplayEffectSpec(그러나 FGameplayEffectSpecForRPC로 변환된 형태)을 NetMulticast로 전송합니다. 이는 ASC의 리플리케이션 모드와 관계없이 신뢰할 수 없는 방식으로 전송됩니다. 이 방식은 GameplayEffectSpec에 포함된 데이터에 따라 많은 대역폭을 차지할 수 있습니다. 이를 최적화하려면 cvar AbilitySystem.AlwaysConvertGESpecToGCParams 1을 설정할 수 있습니다. 이 설정은 GameplayEffectSpec을 FGameplayCueParameters 구조체로 변환하여, FGameplayEffectSpecForRPC 대신 이 구조체만 RPC로 전송하게 합니다. 이 방식은 대역폭을 절약할 수 있지만, FGameplayCueParameters로 변환되는 과정에서 정보가 일부 손실될 수 있으며, 이는 각 GameplayCue가 요구하는 정보에 따라 다를 수 있습니다.

### 4.8.8 GameplayCue 이벤트

GameplayCue는 특정 EGameplayCueEvent에 반응합니다:

|   |   |
|---|---|
|**EGameplayCueEvent**|**설명**|
|OnActive|GameplayCue가 활성화(추가)될 때 호출됩니다.|
|WhileActive|Called when GameplayCue is active, even if it wasn't actually just applied (Join in progress, etc). This is not Tick! It's called once just like OnActive when a GameplayCueNotify_Actor is added or becomes relevant. If you need Tick(), just use the GameplayCueNotify_Actor's Tick(). It's an AActor after all.  <br>GameplayCue가 활성 상태일 때 호출되며, 실제로 바로 적용되지 않았더라도 진행 중인 경우에 호출됩니다(진행 중 조인 등). 이는 Tick이 아니며**,** GameplayCueNotify_Actor가 추가되거나 유효해질 때 한 번만 호출됩니다. Tick()이 필요하면 GameplayCueNotify_Actor의 Tick()을 사용해야 합니다. 결국 이것은 AActor입니다.|
|Removed|GameplayCue가 제거될 때 호출됩니다. 이 이벤트에 응답하는 블루프린트 GameplayCue 함수는 OnRemove입니다.|
|Executed|Called when a GameplayCue is executed: instant effects or periodic Tick(). The Blueprint GameplayCue function that responds to this event is OnExecute.  <br>GameplayCue가 실행될 때 호출됩니다: Instant Effect나 Periodic(주기적인) Tick(). 이 이벤트에 응답하는 블루프린트 GameplayCue 함수는 OnExecute입니다.|

GameplayCue 시작 시 발생하는 GameplayCue의 모든 이펙트에 OnActive를 사용하되, 늦게 참여하는 플레이어가 놓쳐도 괜찮은 경우 사용합니다. WhileActive는 GameplayCue에서 지속적으로 발생하는 효과에 사용하며, 늦게 합류한 플레이어도 볼 수 있도록 해야 합니다. 예를 들어 MOBA에서 타워 구조물이 폭발하는 GameplayCue가 있을 때, 초기 폭발 파티클 시스템과 폭발 사운드는 OnActive에 넣고 폭발 후 지속적으로 발생하는 불꽃 파티클이나 사운드는 WhileActive에 넣을 수 있습니다. 이 시나리오에서는 뒤늦게 합류한 플레이어가 초기 폭발을 OnActive에서 재생하는 것은 의미가 없지만, 폭발이 발생한 후 지면에 지속적이고 반복되는 불꽃 이펙트를 WhileActive에서 볼 수 있게 하려는 것입니다. OnRemove는 OnActive와 WhileActive에 추가된 모든 항목을 정리해야 합니다. WhileActive는 액터가 GameplayCueNotify_Actor의 연관성 범위에 들어올 때마다 호출됩니다. OnRemove는 액터가 GameplayCueNotify_Actor의 연관성 범위를 벗어날 때마다 호출됩니다.

### 4.8.9 GameplayCue 안전성

GameplayCue는 일반적으로 비신뢰성을 가지므로, 직접적으로 게임 플레이에 영향을 미치는 요소에는 적합하지 않습니다.

  
**실행된 GameplayCue**: 비신뢰성 멀티캐스트(Unreliable Multicast)를 통해 적용되며 항상 신뢰성이 보장되지 않습니다.

  
GameplayEffect에서 적용된 GameplayCue입니다:

- Autonomous Proxy는 OnActive, WhileActive, OnRemove 이벤트를 신뢰성 있게 수신합니다.  FActiveGameplayEffectsContainer::NetDeltaSerialize()는 OnActive와 WhileActive를 호출하기 위해 UAbilitySystemComponent::HandleDeferredGameplayCues()를 실행합니다. FActiveGameplayEffectsContainer::RemoveActiveGameplayEffectGrantedTagsAndModifiers()는 OnRemoved를 호출합니다.
- Simulated Proxy는 WhileActive와 OnRemove를 신뢰성 있게 수신합니다. UAbilitySystemComponent::MinimalReplicationGameplayCues의 리플리케이션은 WhileActive와 OnRemove를 호출합니다. OnActive 이벤트는 비신뢰성 멀티캐스트에 의해 호출됩니다.

GameplayEffect 없이 적용된 GameplayCue입니다:

- Autonomous Proxy는 OnRemove를 신뢰성 있게 수신합니다. OnActive와 WhileActive 이벤트는 비신뢰성 멀티캐스트로 호출됩니다.
- Simulated Proxy는 WhileActive와 OnRemove를 신뢰성 있게 수신합니다. UAbilitySystemComponent::MinimalReplicationGameplayCues의 리플리케이션은 WhileActive와 OnRemove를 호출합니다. OnActive 이벤트는 비신뢰성 멀티캐스트에 의해 호출됩니다.

GameplayCue에서 신뢰성이 필요한 경우, 해당 GameplayCue를 GameplayEffect를 통해 적용하고, WhileActive에서 FX를 추가하며 OnRemove에서 FX를 제거하도록 설정하세요.

### 4.9 전역 AbilitySystem

[AbilitySystemGlobals](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/UAbilitySystemGlobals/index.html) 클래스는 GAS에 대한 전역 정보를 담고 있습니다. 대부분의 변수는 DefaultGame.ini에서 설정할 수 있습니다. 일반적으로 이 클래스와 상호작용할 필요는 없지만, 그 존재를 알고 있어야 합니다. [GameplayCueManager](https://github.com/tranek/GASDocumentation#concepts-gc-manager) 또는 [GameplayEffectContext](https://github.com/tranek/GASDocumentation#concepts-ge-context)와 같은 것을 서브클래싱해야 하는 경우, AbilitySystemGlobals를 통해 서브클래싱해야 합니다.

AbilitySystemGlobals 클래스는 GAS에 대한 전역 정보를 보유합니다. 대부분의 변수는 DefaultGame.ini에서 설정할 수 있습니다. 일반적으로 이 클래스를 직접 다룰 필요는 없지만, 그 존재에 대해 알고 있어야 합니다. 예를 들어 GameplayCueManager나 GameplayEffectContext 같은 것을 서브클래싱하려면 AbilitySystemGlobals를 통해 이를 처리해야 합니다.  
  
AbilitySystemGlobals를 서브클래싱하려면 DefaultGame.ini에서 클래스 이름을 설정하세요:

```C++
[/Script/GameplayAbilities.AbilitySystemGlobals]
AbilitySystemGlobalsClassName="/Script/ParagonAssets.PAAbilitySystemGlobals"
```

### 4.9.1 InitGlobalData()

UE 4.24 ~ 5.2 사이에서는 TargetData를 사용하기 위해 UAbilitySystemGlobals::Get().InitGlobalData()를 호출해야 하며, 그렇지 않을 경우 ScriptStructCache와 관련된 오류가 발생하고 클라이언트가 서버와 연결이 끊길 수 있습니다. 이 함수는 프로젝트에서 한 번만 호출하면 됩니다. 만약 **AbilitySystemGlobals**의 GlobalAttributeSetDefaultsTableNames를 사용하는 도중 충돌이 발생한다면, Fortnite처럼 AssetManager나 GameInstance에서 UAbilitySystemGlobals::Get().InitGlobalData()를 나중에 호출해야 할 수도 있습니다. 는 이 함수를 UAssetManager::StartInitialLoading()에서 호출했고, Paragon은 UEngine::Init()에서 호출했습니다. 샘플 프로젝트에서는 이를 UAssetManager::StartInitialLoading()에 배치하는 것이 좋은 방법으로 제시됩니다. 이 코드는 TargetData 문제를 방지하기 위해 프로젝트에 복사해 사용하는 기본 코드로 간주할 수 있습니다. UE 5.3부터는 이 함수가 자동으로 호출됩니다.

만약 AbilitySystemGlobals의 GlobalAttributeSetDefaultsTableNames를 사용하는 도중 크래시가 발생한다면, Fortnite처럼 AssetManager나 GameInstance에서 UAbilitySystemGlobals::Get().InitGlobalData()를 나중에 호출해야 할 수도 있습니다.

## 4.10 예측(Prediction)

GAS는 클라이언트 측 예측을 기본적으로 지원하지만, 모든 것을 예측하지는 않습니다. GAS에서의 클라이언트 측 예측은 클라이언트가 서버의 승인을 기다리지 않고 GameplayAbility를 활성화하고 GameplayEffect를 적용할 수 있다는 의미입니다. 클라이언트는 서버가 이를 허용할 것이라고 예측하고, 예측한 대로 타겟에 GameplayEffect를 적용합니다. 그 후 서버는 클라이언트가 예측한 것이 맞았는지 여부를 알려줍니다. 만약 클라이언트가 잘못 예측했다면, 서버와 일치하도록 변경 사항을 **롤백**합니다.

GAS 관련 예측의 결정적인 출처는 GameplayPrediction.h에 있는 플러그인 소스 코드입니다. 에픽 게임즈의 마인드셋은 **할 수 있는 것만 예측하라**입니다. 예를 들어, Paragon과 Fortnite는 피해를 예측하지 않습니다. 대부분 ExecutionCalculation를 사용하여 피해를 처리하며, 이는 예측할 수 없습니다. 그렇다고 해서 피해 같은 것을 예측할 수 없다는 것은 아닙니다. 만약 예측이 잘 된다면, 그렇게 하는 것도 좋습니다.

> "모든 것을 완벽하게 자동으로 예측하는" 솔루션에 올인하는 것도 아닙니다. 저희는 여전히 플레이어 예측을 최소한으로 유지하는 것이 가장 좋다고 생각합니다(즉, 플레이어가 피할 수 있는 최소한의 것만 예측하는 것이 좋습니다).

[Network Prediction Plugin](https://github.com/tranek/GASDocumentation#concepts-p-npp)에 대한 에픽 게임즈의 데이브 라티의 코멘트.

**예측되는 것:**

- Ability 활성화
- 트리거된 이벤트
- GameplayEffect 적용
    - Attribute 수정(예외: Execution은 전혀 예측되지 않으며, Attribute Modifier에서 예측됩니다.)
    - GameplayTag 수정
- GameplayCue 이벤트(예측된 GameplayEffect와 그 자체로도 가능합니다.)
- 몽타주
- 움직임 (UE5 UCharacterMovement 내장)

**예측할 수 없는 것:**

- GameplayEffect 제거
- GameplayEffect 주기적 효과 (예: 지속 피해)

_From GameplayPrediction.h_

우리는 GameplayEffect의 적용은 예측할 수 있지만, GameplayEffect의 제거는 예측할 수 없습니다. 이 제한을 해결하기 위한 방법 중 하나는, GameplayEffect를 제거하려고 할 때 그 반대 효과를 예측하는 것입니다. 예를 들어, 40%의 이동 속도 감소를 예측한다고 가정합시다. 이를 예측적으로 제거하려면 40%의 이동 속도 증가를 적용한 후, 두 개의 GameplayEffect를 동시에 제거하는 방법을 사용할 수 있습니다. 이 방법은 모든 시나리오에 적합하지 않으며, GameplayEffect 제거 예측에 대한 지원은 여전히 필요합니다. Dave Ratti는 이 기능을 GAS의 향후 버전에 추가하고자 하는 의사를 표명했습니다.

GameplayEffect 제거를 예측할 수 없기 때문에 GameplayAbility의 Cooldown도 완전히 예측할 수 없습니다. Cooldown GameplayEffect에 대한 반대 효과는 없기 때문에, 서버의 Cooldown GE는 클라이언트에 복제되어 있으며, 이를 우회하려는 시도(예: Minimal 리플리케이션 모드)는 서버에서 거부됩니다. 즉, 높은 지연 시간을 가진 클라이언트는 서버에 Cooldown을 요청하고 서버의 Cooldown GE 제거를 받는 데 더 오랜 시간이 걸립니다. 이로 인해 높은 지연 시간을 가진 플레이어는 낮은 지연 시간을 가진 플레이어들보다 더 낮은 발사 속도를 가지게 되어, 낮은 지연 시간의 플레이어들에게 불리한 상황이 발생합니다. Fortnite는 이 문제를 커스텀 기록 관리로 해결합니다.

피해 예측에 대해 저는 개인적으로 추천하지 않습니다. 이는 많은 사람들이 GAS를 처음 시작할 때 가장 먼저 시도하는 부분입니다. 특히 죽음 예측은 추천하지 않습니다. 피해를 예측할 수 있지만, 이를 잘못 예측하는 것은 어려운 문제입니다. 예를 들어, 적의 피해를 예측하는 데 실패하면, 플레이어는 적의 체력이 갑자기 회복된 것을 볼 수 있습니다. 죽음 예측을 시도하면 특히 불편하고 혼란스러울 수 있습니다. 예를 들어, 캐릭터가 죽었다고 예측하여 Ragdoll 상태가 시작되었지만, 서버가 이를 수정하면 Ragdoll이 멈추고 계속해서 플레이어를 공격할 수 있습니다.

> **💡Note**: 속성을 변경하는 인스턴트 GameplayEffect(예: Cost GE)는 본인에 대해 원활하게 예측할 수 있으며, 다른 캐릭터에 대한 인스턴트 속성 변경을 예측하면 해당 캐릭터의 속성에 짧은 이상 현상 또는 '깜박임'이 표시됩니다. 예측된 인스턴트 GameplayEffect는 실제로 무한 GameplayEffect와 같이 취급되므로 예측이 잘못되었을 경우 롤백할 수 있습니다. 서버의 GameplayEffect가 적용될 때, 동일한 GameplayEffect가 두 개 존재하여 모디파이어가 두 번 적용되거나 잠시 동안 전혀 적용되지 않을 수 있습니다. 결국에는 저절로 수정되지만 때때로 플레이어가 이 문제를 알아차릴 수 있습니다.  
>   
> Instant GameplayEffect(예: Cost GE)는 자신에게 Attribute를 예측하는 데 원활하게 예측할 수 있습니다. 그러나 다른 캐릭터에 대한 Instant Attribute 변경을 예측하면, 그들의 Attribute에 잠시 간격이 생기거나 깜빡임(Blip)이 나타날 수 있습니다. 예측된 Instant GameplayEffect는 Infinite GameplayEffect처럼 처리되어 잘못 예측되었을 경우 롤백할 수 있습니다. 서버의 GameplayEffect가 적용되면 두 개의 동일한 GameplayEffect가 존재하게 되어 잠시 동안 Modifier가 두 번 적용되거나 적용되지 않을 수 있습니다. 결국 수정되지만, 이 깜빡임은 플레이어에게 눈에 띄는 경우가 있을 수 있습니다.  

GAS의 예측 구현이 해결하려는 문제들:

1. "해도 되는가?" 예측을 위한 기본 프로토콜
2. "실행 취소" 예측이 실패했을 때 부작용을 되돌리는 방법
3. "재실행" 클라이언트가 예측한 부작용을 서버에서 리플리케이트하여 다시 실행하지 않도록 하는 방법
4. "완전성" 모든 부작용을 진정으로 예측했는지 확인하는 방법
5. "종속성" 예측된 이벤트와 의존적인 이벤트의 관리 방법
6. "재정의" 서버에서 리플리케이되거나 소유된 상태를 예측적으로 오버라이드하는 방법

_From GameplayPrediction.h_

### 4.10.1 예측 키(Prediction Key)

GAS의 예측은 예측 키(Prediction Key)라는 개념을 기반으로 작동하며, 이는 클라이언트가 GameplayAbility를 활성화할 때 생성하는 정수 식별자입니다.

1. 클라이언트는 GameplayAbility를 활성화할 때 예측 키를 생성합니다. 이것이 Activation Prediction Key입니다.
2. 클라이언트는 이 예측 키를 CallServerTryActivateAbility()와 함께 서버에 전송합니다.
3. 클라이언트는 예측 키가 유효한 동안 적용하는 모든 GameplayEffect에 이 예측 키를 추가합니다.
4. 클라이언트의 예측 키가 범위를 벗어나면, 같은 GameplayAbility에서 추가로 예측된 효과에는 새로운 Scoped Prediction Window가 필요합니다.
5. 서버는 클라이언트로부터 예측 키를 받습니다.
6. 서버는 자신이 적용하는 모든 GameplayEffect에 이 예측 키를 추가합니다.
7. 서버는 예측 키를 클라이언트에게 다시 리플리케이트하여 전송합니다.
8. 클라이언트는 서버로부터 리플리케이트**된** GameplayEffect를 예측 키와 함께 수신합니다. 클라이언트가 적용한 GameplayEffect와 동일한 예측 키를 가진 리플리케이트된 GameplayEffect가 일치하면, 이는 올바르게 예측된 것입니다. 이때 대상에는 잠시 두 개의 GameplayEffect가 존재하게 되며, 클라이언트는 예측한 것을 제거합니다.
9. 클라이언트는 서버로부터 예측 키를 다시 받습니다. 이것이 Replicated Prediction Key입니다. 이 예측 키는 이제 stale(유효하지 않음)로 표시됩니다.
10. 클라이언트는 이제 stale한 Replicated Prediction Key로 생성한 모든 GameplayEffect를 제거합니다. 서버에서 복제된 GameplayEffect는 계속 유지됩니다. 클라이언트가 추가했지만 서버에서 일치하는 복제본을 받지 못한 GameplayEffect는 잘못 예측된 것입니다.

예측 키는 GameplayAbility에서 Activation Prediction Key로 시작되는 명령어 **window**를 통해 원자적으로 그룹화하는 동안 유효하도록 보장됩니다. 이를 한 프레임 동안만 유효한 것으로 생각할 수 있습니다. 지연된 작업을 처리하는 AbilityTask의 콜백은 더 이상 유효한 예측 키를 가지지 않으며, Synch Point가 내장된 AbilityTask가 새로운 Scoped Prediction Window를 생성해야만 예측 키가 유효합니다.

### 4.10.2 Ability에서 새로운 예측 창 만들기

AbilityTask의 콜백에서 더 많은 작업을 예측하려면, 새로운 Scoped Prediction Window와 새로운 Scoped Prediction Key를 생성해야 합니다. 이것은 클라이언트와 서버 간의 Synch Point라고도 불립니다. 입력과 관련된 모든 AbilityTask는 기본적으로 새로운 scoped prediction window를 생성하는 기능을 가지고 있어서, AbilityTask의 콜백에서 실행되는 원자적 코드에는 유효한 scoped prediction key가 제공됩니다.

그러나 WaitDelay와 같은 다른 AbilityTask는 콜백에 대한 새로운 scoped prediction window를 생성하는 기본 코드를 제공하지 않습니다. WaitDelay와 같이 기본 코드가 없는 AbilityTask 후에 행동을 예측해야 할 경우, WaitNetSync AbilityTask를 사용하여 수동으로 새로운 scoped prediction window를 생성해야 합니다. OnlyServerWait 옵션을 사용한 WaitNetSync에 도달하면, 클라이언트는 GameplayAbility의 활성화 예측 키를 기반으로 새로운 scoped prediction key를 생성하고 이를 서버에 RPC로 전송한 후, 새로운 GameplayEffect에 이를 추가합니다.

서버는 OnlyServerWait 옵션이 있는 WaitNetSync에 도달하면, 클라이언트로부터 새로운 scoped prediction key를 받기 전까지 기다립니다. 이 scoped prediction key는 activation prediction key와 동일한 방식으로 작동하며, GameplayEffect에 적용되고 클라이언트로 복제되어 stale로 표시됩니다. scoped prediction key는 범위에서 벗어날 때까지 유효하며, 즉 scoped prediction window가 닫힐 때까지 유효합니다. 다시 말해, 원자적 작업만 새 scoped prediction key를 사용할 수 있으며, 지연된 작업은 사용할 수 없습니다.

필요한 만큼 여러 개의 scoped prediction window를 생성할 수 있습니다.

자신의 AbilityTask에 synch point 기능을 추가하고 싶다면, 입력 관련 AbilityTask들이 WaitNetSync AbilityTask 코드를 어떻게 주입하는지 살펴보세요.

> 💡**Note**: WaitNetSync를 사용할 때, 이는 서버의 GameplayAbility가 클라이언트로부터 정보를 받을 때까지 실행을 차단합니다. 이는 악의적인 사용자가 게임을 해킹하여 새로운 scoped prediction key를 보내는 것을 의도적으로 지연시킬 수 있기 때문에 잠재적으로 악용될 수 있습니다. Epic은 WaitNetSync를 신중하게 사용하고 있으며, 이러한 문제가 우려되는 경우 클라이언트 없이 자동으로 계속 진행되는 지연을 포함한 새로운 버전의 AbilityTask를 빌드하는 것을 권장합니다.

샘플 프로젝트에서는 Sprint GameplayAbility에서 stamina cost를 적용할 때마다 새로운 scoped prediction window를 생성하기 위해 WaitNetSync를 사용하여 이를 예측할 수 있도록 하고 있습니다. 이상적으로는 Cost와 Cooldown을 적용할 때 유효한 예측 키를 갖는 것이 좋습니다.

예측된 GameplayEffect가 소유 클라이언트에서 두 번 재생된다면, 예측 키가 stale되고 **redo** 문제가 발생한 것입니다. 보통은 GameplayEffect를 적용하기 전에 WaitNetSync AbilityTask를 OnlyServerWait 옵션으로 배치하여 새로운 scoped prediction key를 생성하면 이 문제를 해결할 수 있습니다.

### 4.10.3 액터 생성 예측 

클라이언트에서 예측적으로 Actor를 생성하는 것은 고급 주제입니다. GAS에서는 이 기능을 기본적으로 제공하지 않으며, SpawnActor AbilityTask는 서버에서만 Actor를 생성합니다. 핵심 개념은 서버와 클라이언트 모두에서 리플리케이트된 Actor를 생성하는 것입니다.

만약 Actor가 단순히 장식용이거나 게임 플레이에 영향을 미치지 않는다면, 간단한 해결책은 Actor의 IsNetRelevantFor() 함수를 오버라이드하여 서버가 해당 클라이언트로 리플리케이트되는 것을 제한하는 것입니다. 이렇게 하면 소유 클라이언트는 로컬에서 생성된 Actor를 사용하고, 서버와 다른 클라이언트는 서버의 리플리케이트된 Actor를 사용하게 됩니다.

```C++
bool APAReplicatedActorExceptOwner::IsNetRelevantFor(const AActor* RealViewer, const AActor* ViewTarget, const FVector& SrcLocation) const
{
    return !IsOwnedBy(ViewTarget);
}
```

이 코드는 소유자가 아닌 클라이언트만 리플리케이된 Actor를 받을 수 있도록 하여, 각 클라이언트가 소유한 로컬 버전을 사용하게 합니다.

만약 생성된 Actor가 게임플레이에 영향을 미치는 경우(예: 투사체처럼 피해 예측이 필요한 경우), 고급 로직이 필요하며 이는 이 문서의 범위를 벗어납니다. 예를 들어, Unreal Tournament에서는 투사체를 소유 클라이언트에서만 더미로 생성하고, 서버에서 리플리케이트된 투사체와 동기화하는 방법을 사용하고 있습니다. 이 방법은 에픽 게임즈의 GitHub에서 예측적으로 투사체를 생성하는 방법을 확인할 수 있습니다.

### 4.10.4 GAS 예측 기능의 향후 발전

GameplayPrediction.h에서는 향후 GameplayEffect 제거 및 주기적인 GameplayEffect의 예측을 추가할 수 있는 기능을 제공할 수 있다고 명시되어 있습니다.

에픽 게임즈의 데이브 라티는 Cooldown 예측에서 발생하는 지연 시간 불일치 문제를 해결하려는 관심을 표명했으며, 이 문제는 높은 지연 시간을 가진 플레이어가 낮은 지연 시간을 가진 플레이어보다 불리한 상황을 초래할 수 있습니다.

에픽 게임즈의 새로운 Network Prediction 플러그인은 이전의 CharacterMovementComponent와 마찬가지로 GAS와 완전히 호환될 것으로 예상됩니다. 이 플러그인은 GAS의 예측 기능을 개선하고, 예측을 보다 원활하게 처리할 수 있도록 도와줄 것입니다.

### 4.10.5 [Network Prediction Plugin](https://docs.unrealengine.com/4.26/en-US/API/Plugins/NetworkPrediction/)

에픽 게임즈는 CharacterMovementComponent를 새로운 네트워크 예측 플러그인으로 대체하는 프로젝트를 시작했습니다. 해당 플러그인은 아직 초기 단계에 있지만 언리얼 엔진 깃허브에서 얼리 액세스로 이용할 수 있습니다. 향후 언리얼 엔진의 어떤 버전에서 실험적 베타 버전으로 출시될지는 아직 알 수 없습니다.

## 4.11 Targeting

### 4.11.1 Target Data

FGameplayAbilityTargetData는 네트워크를 통해 전달될 Target Data용으로 설계된 일반 구조체입니다. Target Data에는 보통 AActor/UObject 레퍼런스, FHitResults, 그 이외의 위치/방향/원점 정보 등이 포함됩니다. 또한, 해당 구조체를 서브클래싱하면 원하는 데이터를 포함할 수 있어, 클라이언트와 서버 간 데이터를 간편하게 주고 받을 수 있습니다. FGameplayAbilityTargetData는 기본적으로 직접 사용되기보다는 서브클래싱하여 사용하는 것을 목적으로 합니다. GAS는 이미 몇 가지 서브클래싱된 FGameplayAbilityTargetData 구조체를 제공하며, 이는 GameplayAbilityTargetTypes.h에 정의되어 있습니다.

TargetData는 일반적으로 Target Actor에 의해 생성되거나 수동으로 만들어지며, AbilityTask 및 GameplayEffect에서 EffectContext를 통해 소비됩니다. EffectContext에 포함된 덕분에 Execution, MMC, GameplayCue, 그리고 AttributeSet의 백엔드 함수에서 TargetData에 접근할 수 있습니다.

일반적으로 FGameplayAbilityTargetData를 직접 전달하지 않고, FGameplayAbilityTargetDataHandle을 사용합니다. 이 핸들 구조체는 내부적으로 FGameplayAbilityTargetData 포인터를 담은 TArray를 가지고 있으며, 이를 통해 TargetData의 다형성을 지원합니다.

FGameplayAbilityTargetData를 상속한 예제입니다:

```C++
USTRUCT(BlueprintType)
struct MYGAME_API FGameplayAbilityTargetData_CustomData : public FGameplayAbilityTargetData
{
    GENERATED_BODY()
public:

    FGameplayAbilityTargetData_CustomData()
    { }

    UPROPERTY()
        FName CoolName = NAME_None;

    UPROPERTY()
        FPredictionKey MyCoolPredictionKey;

	// FGameplayAbilityTargetData를 상속한 모든 하위 구조체에서 필수입니다.
    virtual UScriptStruct* GetScriptStruct() const override
    {
        return FGameplayAbilityTargetData_CustomData::StaticStruct();
    }

    // 이는 FGameplayAbilityTargetData를 상속한 모든 하위 구조체에 필요합니다.
    bool NetSerialize(FArchive& Ar, class UPackageMap* Map, bool& bOutSuccess)
    {
    	// 엔진은 이미 FName과 FPredictionKey에 대해 NetSerialize를 정의했습니다. 감사합니다, 에픽 게임즈!
        CoolName.NetSerialize(Ar, Map, bOutSuccess);
        MyCoolPredictionKey.NetSerialize(Ar, Map, bOutSuccess);
        bOutSuccess = true;
        return true;
    }
}

template<>
struct TStructOpsTypeTraits<FGameplayAbilityTargetData_CustomData> : public TStructOpsTypeTraitsBase2<FGameplayAbilityTargetData_CustomData>
{
    enum
    {
        WithNetSerializer = true // This is REQUIRED for FGameplayAbilityTargetDataHandle net serialization to work
    };
};
```

핸들에 Target Data를 추가하는 방법:

```C++
UFUNCTION(BlueprintPure)
FGameplayAbilityTargetDataHandle MakeTargetDataFromCustomName(const FName CustomName)
{
    // 우리의 Target Data 타입을 생성합니다.  
    // 핸들은 소멸될 때 데이터를 자동으로 정리하고 삭제합니다.  
    // 만약 이 데이터를 핸들에 추가하지 않는다면 메모리 관리와 메모리 누수 문제가 발생할 수 있으니,  
    // 안전하게 프레임 내 어느 시점에라도 항상 핸들에 추가하는 것이 좋습니다!
    FGameplayAbilityTargetData_CustomData* MyCustomData = new FGameplayAbilityTargetData_CustomData();
    // 구조체의 정보를 설정하여 입력된 이름과 우리가 원하는 다른 변경 사항을 적용합니다.
    MyCustomData->CoolName = CustomName;

	// Blueprint에서 사용할 핸들 래퍼를 만듭니다.
    FGameplayAbilityTargetDataHandle Handle;
    // 타겟 데이터를 핸들에 추가합니다.
    Handle.Add(MyCustomData);
    // 핸들을 Blueprint로 출력합니다.
    return Handle;
}
```

값을 가져오기 위해서는 타입 안전성 검사가 필요합니다. 왜냐하면 핸들의 Target Data에서 값을 가져오는 유일한 방법은 제네릭 C/C++ 캐스팅을 사용하는 것이며, 이는 타입 안전하지 않아서 객체 슬라이싱 및 충돌을 일으킬 수 있기 때문입니다. 타입 검사를 하는 방법에는 여러 가지가 있지만, 일반적인 두 가지 방법은 다음과 같습니다:

- GameplayTag: 특정 코드 아키텍처의 기능이 발생할 때마다 기본 부모 타입으로 캐스팅하여 게임플레이 태그를 얻고, 이를 비교하여 상속된 클래스를 캐스팅할 수 있는 서브클래스 계층을 사용할 수 있습니다.
- 스크립트 구조체 & Static 구조체:대신 직접 클래스 비교를 할 수 있으며(이는 많은 IF 문을 사용하거나 템플릿 함수를 만들 수 있습니다), 아래는 이를 수행하는 예시입니다. 기본적으로 FGameplayAbilityTargetData에서 스크립트 구조체를 가져올 수 있으며(이것이 USTRUCT이고 모든 상속된 클래스가 GetScriptStruct에서 구조체 타입을 지정해야 하는 장점입니다), 원하는 타입인지 비교할 수 있습니다. 

아래는 타입 검사를 위해 이러한 함수를 사용하는 예시입니다:

```C++
UFUNCTION(BlueprintPure)
FName GetCoolNameFromTargetData(const FGameplayAbilityTargetDataHandle& Handle, const int Index)
{
    // NOTE, there is two versions of this '::Get(int32 Index)' function; 
    // 1) const version that returns 'const FGameplayAbilityTargetData*', good for reading target data values 
    // 2) non-const version that returns 'FGameplayAbilityTargetData*', good for modifying target data values
    FGameplayAbilityTargetData* Data = Handle.Get(Index); // This will valid check the index for you 

    // Valid check we have something to use, null data means nothing to cast for
    if (Data == nullptr)
    {
        return NAME_None;
    }
    // This is basically the type checking pass, static_cast does not have type safety, this is why we do this check.
    // If we don't do this then it will object slice the struct and thus we have no way of making sure its that type.
    if (Data->GetScriptStruct() == FGameplayAbilityTargetData_CustomData::StaticStruct())
    {
        // Here is when you would do the cast because we know its the correct type already
        FGameplayAbilityTargetData_CustomData* CustomData = static_cast<FGameplayAbilityTargetData_CustomData*>(Data);
        return CustomData->CoolName;
    }
    return NAME_None;
}
```

### 4.11.2 Target Actor

GameplayAbility는 [TargetActor](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/Abilities/AGameplayAbilityTargetActor/index.html)를 WaitTargetData AbilityTask와 함께 스폰하여 월드의 타겟 정보를 시각화 및 캡처합니다. TargetActor는 선택적으로 [GameplayAbilityWorldReticle](https://github.com/tranek/GASDocumentation#concepts-targeting-reticles)를 사용하여 현재 타겟을 표시할 수 있습니다. 확인되면 타깃 정보는 [TargetData](https://github.com/tranek/GASDocumentation#concepts-targeting-data)로 반환되어 GameplayEffect에 전달할 수 있습니다.  
  
TargetActor는 AActor를 기반으로 하므로 스태틱 메시나 데칼 등 타깃팅하는 위치와 방법을 나타내는 모든 종류의 보이는 컴포넌트를 가질 수 있습니다. 스태틱 메시는 캐릭터가 만들 오브젝트의 배치를 시각화하는 데 사용할 수 있습니다. 데칼은 지면에 효과 영역을 표시하는 데 사용할 수 있습니다. 샘플 프로젝트에서는 지면에 데칼이 있는 [AGameplayAbilityTargetActor_GroundTrace](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/Abilities/AGameplayAbilityTargetActor_Grou-/index.html)를 사용하여 메테오 어빌리티의 피해 영역을 나타냅니다. 또한 아무것도 표시하지 않아도 됩니다. 예를 들어 GASShooter에서 사용되는 것처럼 목표물에 즉시 선을 추적하는 히트스캔 총에 아무 것도 표시하지 않는 것이 좋습니다.  
  
기본 트레이스 또는 콜리전 오버랩을 사용하여 타깃 정보를 캡처하고 그 결과를 TargetActor 구현에 따라 FHitResults 또는 AActor 배열로 타깃 데이터로 변환합니다. WaitTargetData AbilityTask는 TEnumAsByte<EGameplayTargetingConfirmation::Type> ConfirmationType 파라미터를 통해 타깃이 확인되는 시기를 결정합니다. TEnumAsByte<EGameplayTargetingConfirmation::Type::Instant 를 사용하지 않는 경우, 타깃 액터는 일반적으로 Tick() 에서 트레이스/오버랩을 수행한 다음 구현에 따라 그 위치를 FHitResult 에 업데이트합니다. Tick() 에서 트레이스/오버랩을 수행하지만, 리플리케이트되지 않고 일반적으로 한 번에 하나 이상의 (더 많은) 타깃 액터를 실행하지 않기 때문에 일반적으로 나쁘지 않습니다. 다만 Tick() 를 사용하며, 일부 복잡한 타깃 액터는 GASShooter 의 로켓 발사기의 보조 어빌리티처럼 많은 작업을 수행할 수 있다는 점만 유의하세요. Tick()의 트레이싱은 클라이언트에 매우 반응이 좋지만, 퍼포먼스 타격이 너무 크면 타깃 액터의 틱 속도를 낮추는 것을 고려할 수 있습니다. TEnumAsByte<EGameplayTargetingConfirmation::Type::Instant 의 경우, 타깃 액터는 즉시 스폰되어 타깃 데이터를 생성하고 소멸합니다. Tick() 은 호출되지 않습니다.

|   |   |
|---|---|
|EGameplayTargetingConfirmation::Type|대상이 확인된 경우|
|Instant|타겟팅은 '실행' 시점을 결정하는 특별한 로직이나 사용자 입력 없이 즉시 이루어집니다.|
|UserConfirmed|타깃팅은 사용자가 또는 UAbilitySystemComponent::TargetConfirm()을 호출하여 타깃팅을 확인하면 발생합니다. 타깃 액터는 바인딩된 취소 입력에 응답하거나 UAbilitySystemComponent::TargetCancel()을 호출하여 타깃팅을 취소할 수도 있습니다.|
|Custom|GameplayTargeting Ability는 UGameplayAbility::ConfirmTaskByInstanceName() 을 호출하여 타깃팅 데이터가 언제 준비되었는지 결정하는 역할을 합니다. 타깃 액터는 또한 UGameplayAbility::CancelTaskByInstanceName() 에 응답하여 타깃팅을 취소합니다.|
|CustomMulti|GameplayTargeting Ability는 UGameplayAbility::ConfirmTaskByInstanceName() 을 호출하여 타깃팅 데이터가 언제 준비되었는지 결정하는 역할을 합니다. 타깃 액터는 또한 UGameplayAbility::CancelTaskByInstanceName() 에 응답하여 타깃팅을 취소합니다. 데이터 생성 시 어빌리티 태스크를 종료해서는 안 됩니다.|

모든 타깃 액터가 모든 EGameplayTargetingConfirmation::Type 을 지원하지는 않습니다. 예를 들어, AGameplayAabilityTargetActor_GroundTrace는 즉시 확인을 지원하지 않습니다.  
  
WaitTargetData AbilityTask는 AGameplayAbilityTargetActor 클래스를 파라미터로 받아 AbilityTask가 활성화될 때마다 인스턴스를 스폰하고, AbilityTask가 종료되면 타깃 액터를 소멸시킵니다. WaitTargetDataUsingActor AbilityTask는 이미 스폰된 타깃 액터를 받지만, AbilityTask가 종료되면 여전히 소멸시킵니다. 이 두 AbilityTask는 모두 스폰되거나 사용할 때마다 새로 스폰된 타겟 액터가 필요하다는 점에서 비효율적입니다. 프로토타이핑에는 좋지만, 프로덕션에서는 자동 소총의 경우처럼 타깃 데이터를 지속적으로 생성하는 경우가 있다면 최적화를 고려해 볼 수 있습니다. GASShooter에는 커스텀 서브클래스인 [AGameplayAbilityTargetActor](https://github.com/tranek/GASShooter/blob/master/Source/GASShooter/Public/Characters/Abilities/GSGATA_Trace.h)와 새로운 [WaitTargetDataWithReusableActor](https://github.com/tranek/GASShooter/blob/master/Source/GASShooter/Public/Characters/Abilities/AbilityTasks/GSAT_WaitTargetDataUsingActor.h)가 있습니다. AbilityTask를 처음부터 새로 작성하여 타겟 액터를 파괴하지 않고 재사용할 수 있습니다.  
  
Target Actor는 기본적으로 리플리케이트되지 않지만, 게임에서 로컬 플레이어가 타겟팅하는 위치를 다른 플레이어에게 보여주기 위해 필요하다면 리플리케이트되도록 만들 수 있습니다. 여기에는 WaitTargetData AbilityTask 의 RPC 를 통해 서버와 통신하는 기본 기능이 포함되어 있습니다. 타겟 액터의 ShouldProduceTargetDataOnServer 프로퍼티가 false로 설정되어 있으면, 클라이언트는 UAbilityTask_WaitTargetData::OnTargetDataReadyCallback()의 CallServerSetReplicatedTargetData() 를 통해 확인 시 타겟 데이터를 서버에 RPC 합니다. ShouldProduceTargetDataOnServer 가 참이면 클라이언트는 일반 확인 이벤트인 EAbilityGenericReplicatedEvent::GenericConfirm, RPC 를 UAbilityTask_WaitTargetData::OnTargetDataReadyCallback()에서 서버로 전송하고 서버는 RPC 를 수신하면 추적 또는 오버랩 검사를 수행하여 서버에서 데이터를 생성합니다. 클라이언트가 타깃팅을 취소하면 일반 취소 이벤트인 EAbilityGenericReplicatedEvent::GenericCancel, RPC를 UAbilityTask_WaitTargetData::OnTargetDataCancelledCallback에서 서버로 전송합니다. 보시다시피 타겟 액터와 WaitTargetData AbilityTask 모두에 많은 델리게이트가 있습니다. 타깃 액터는 입력에 반응하여 델리게이트 준비, 확인 또는 취소를 위한 타깃 데이터를 생성 및 브로드캐스트합니다. WaitTargetData는 타겟 액터의 타깃 데이터 준비, 확인, 취소 델리게이트를 수신하고 해당 정보를 다시 GameplayAbility와 서버에 전달합니다. 서버에 타깃데이터를 전송하는 경우, 서버에서 유효성 검사를 수행하여 타깃데이터가 타당한지 확인하여 부정행위를 방지할 수 있습니다. 타깃데이터를 서버에서 직접 생성하면 이 문제를 완전히 피할 수 있지만, 소유 클라이언트가 잘못된 예측을 할 가능성이 있습니다.  
  
사용하는 AGameplayAbilityTargetActor의 특정 서브클래스에 따라, WaitTargetData AbilityTask 노드에 노출되는 ExposeOnSpawn 파라미터가 달라집니다. 몇 가지 일반적인 파라미터는 다음과 같습니다:

|   |   |
|---|---|
|Common TargetActor Parameter|내용|
|Debug|True 면, 타깃 액터가 출시되지 않은 빌드에서 트레이스를 수행할 때마다 디버그 트레이싱/중첩 정보를 그립니다. 인스턴트 타깃 액터가 아닌 타깃 액터는 Tick() 에서 트레이스를 수행하므로 이러한 디버그 드로 콜은 Tick() 에서도 발생합니다.|
|Filter|[옵션] 트레이스/중첩이 발생할 때 타깃에서 액터를 필터링(제거)하기 위한 특수 구조체입니다. 일반적인 사용 사례는 플레이어의 폰을 필터링하거나 타깃이 특정 클래스여야 하는 경우입니다. 더 고급 사용 사례는 [Target Data Filter](https://github.com/tranek/GASDocumentation#concepts-target-data-filters)을 참조하세요.|
|Reticle Class|[옵션] 타깃 액터가 스폰할 AGameplayAbilityWorldReticle 의 서브클래스입니다.|
|Reticle Parameters|[선택 사항] 레티클을 구성합니다. [레티클](https://github.com/tranek/GASDocumentation#concepts-targeting-reticles)을 참조하세요.|
|Start Location|트래킹을 시작할 위치에 대한 특수 구조체입니다. 일반적으로 플레이어의 시점, 무기 총구 또는 폰의 위치가 됩니다.|

기본 타겟 액터 클래스를 사용하면 액터가 트레이스/오버랩에 직접 있을 때만 유효한 타깃이 됩니다. 트레이스/오버랩을 벗어나면(움직이거나 한눈을 팔면) 더 이상 유효하지 않습니다. 타겟 액터가 마지막으로 유효한 타깃을 기억하도록 하려면 커스텀 타깃 액터 클래스에 이 기능을 추가해야 합니다. 이를 퍼시스턴트 타깃이라고 부르는 이유는 타겟 액터가 확인 또는 취소를 받거나, 타겟 액터가 트레이스/오버랩에서 새로운 유효한 타깃을 찾거나, 타깃이 더 이상 유효하지 않게(소멸) 될 때까지 지속되기 때문입니다. GASShooter는 로켓 발사기의 보조 능력인 호밍 로켓 조준에 퍼시스턴트 타깃을 사용합니다.

### 4.11.3 Target Data Filter

Make GameplayTargetDataFilter와 Make Filter Handle 노드를 모두 사용하여 플레이어의 폰을 필터링하거나 특정 클래스만 선택할 수 있습니다. 고급 필터링이 필요한 경우, FGameplayTargetDataFilter 를 서브클래싱하고 FilterPassesForActor 함수를 오버라이드하면 됩니다.

```C++
USTRUCT(BlueprintType)
struct GASDOCUMENTATION_API FGDNameTargetDataFilter : public FGameplayTargetDataFilter
{
    GENERATED_BODY()

	/** Returns true if the actor passes the filter and will be targeted */
	virtual bool FilterPassesForActor(const AActor* ActorToBeFiltered) const override;
};
```

하지만 대기 타깃 데이터 노드에 바로 적용되지는 않는데, FGameplayTargetDataFilterHandle 이 필요하기 때문입니다. 서브클래스를 받으려면 새로운 커스텀 Make Filter Handle 을 만들어야 합니다:

```C++
FGameplayTargetDataFilterHandle UGDTargetDataFilterBlueprintLibrary::MakeGDNameFilterHandle(FGDNameTargetDataFilter Filter, AActor* FilterActor)
{
    FGameplayTargetDataFilter* NewFilter = new FGDNameTargetDataFilter(Filter);
    NewFilter->InitializeFilterContext(FilterActor);

    FGameplayTargetDataFilterHandle FilterHandle;
    FilterHandle.Filter = TSharedPtr<FGameplayTargetDataFilter>(NewFilter);
    return FilterHandle;
}
```

### 4.11.4 Gameplay Ability World Reticle

[AGameplayAbilityWorldReticle](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/Abilities/AGameplayAbilityWorldReticle/index.html)(레티클)은 즉시 확인되지 않은 [TargetActor](https://github.com/tranek/GASDocumentation#concepts-targeting-actors)로 타겟팅할 때 타겟팅하는 대상을 시각화합니다. 타깃 액터는 모든 레티클의 생성 및 소멸 수명을 담당합니다. 레티클은 AActor이므로 모든 종류의 비주얼 컴포넌트를 사용하여 표현할 수 있습니다. GASShooter에서 볼 수 있는 일반적인 구현은 위젯 컴포넌트를 사용하여 화면 공간에 (항상 플레이어의 카메라를 향하도록) UMG 위젯을 표시하는 것입니다. 레티클은 어느 AActor 에 있는지 모르지만, 커스텀 타깃 액터에서 그 함수성을 서브클래싱할 수 있습니다. 타깃 액터는 일반적으로 매 Tick() 때마다 레티클의 위치를 타깃의 위치로 업데이트합니다.  
  
GASShooter는 레티클을 사용하여 로켓 발사기의 보조 능력인 호밍 로켓의 고정된 타깃을 표시합니다. 적의 빨간색 표시기는 레티클입니다. 비슷한 흰색 이미지는 로켓 발사기의 십자선입니다.

![](https://blog.kakaocdn.net/dn/dEzO0H/btsn7Ktp5po/Q31dFqkkSiIch2BhnZ7EzK/img.png)

레티클에는 디자이너를 위한 (블루프린트에서 개발하도록 되어 있는) 블루프린트 구현가능 이벤트가 몇 개 포함되어 있습니다:


```C++
/** Called whenever bIsTargetValid changes value. */
UFUNCTION(BlueprintImplementableEvent, Category = Reticle)
void OnValidTargetChanged(bool bNewValue);

/** Called whenever bIsTargetAnActor changes value. */
UFUNCTION(BlueprintImplementableEvent, Category = Reticle)
void OnTargetingAnActor(bool bNewValue);

UFUNCTION(BlueprintImplementableEvent, Category = Reticle)
void OnParametersInitialized();

UFUNCTION(BlueprintImplementableEvent, Category = Reticle)
void SetReticleMaterialParamFloat(FName ParamName, float value);

UFUNCTION(BlueprintImplementableEvent, Category = Reticle)
void SetReticleMaterialParamVector(FName ParamName, FVector value);
```

  
레티클은 타깃 액터에서 제공하는 [FWorldReticleParameter](https://docs.unrealengine.com/en-US/API/Plugins/GameplayAbilities/Abilities/FWorldReticleParameters/index.html)를 선택적으로 사용하여 구성할 수 있습니다. 기본 구조체는 FVector AOEScale 변수 하나만 제공합니다. 기술적으로 이 구조체를 서브클래싱할 수는 있지만, TargetActor는 기본 구조체만 받습니다. 기본 타겟 액터로 서브클래싱할 수 없도록 하는 것은 다소 근시안적인 것 같습니다. 하지만 커스텀 타겟 액터를 직접 만드는 경우, 커스텀 레티클 파라미터 구조체를 제공한 다음 스폰할 때 AGameplayAbilityWorldReticles의 서브클래스에 수동으로 전달할 수 있습니다.  
  
레티클은 기본적으로 리플리케이트되지 않지만, 로컬 플레이어가 타겟팅하는 다른 플레이어를 표시하는 것이 게임에 적합하다면 리플리케이트되도록 할 수 있습니다.  
  
레티클은 현재 유효한 타겟에 기본 타깃액터가 있는 경우에만 표시됩니다. 예를 들어 타겟을 추적하는 데 AGameplayAbilityTargetActor_SingleLineTrace를 사용하는 경우, 레티클은 적이 추적 경로에 바로 있을 때만 나타납니다. 한눈을 팔면 적은 더 이상 유효한 타깃이 아니며 레티클이 사라집니다. 레티클이 마지막 유효한 타겟에 계속 표시되도록 하려면, 타겟 액터를 커스터마이징하여 마지막 유효한 타깃을 기억하고 레티클을 계속 표시하도록 하면 됩니다. 이를 퍼시스턴트 타겟이라고 부르는 이유는 타겟 액터가 확인 또는 취소를 받거나, 타겟 액터가 추적/중첩에서 새로운 유효한 타깃을 찾거나, 타겟이 더 이상 유효하지 않게(소멸) 될 때까지 지속되기 때문입니다. GASShooter는 로켓 발사기의 보조 능력인 호밍 로켓 조준에 퍼시스턴트 타겟을 사용합니다.

### 4.11.5 GameplayEffect Containers Targeting

GameplayEffectContainer는 TargetData를 생성하는 효율적인 방법을 옵션으로 제공합니다. 이 타겟팅은 EffectContainer가 클라이언트와 서버에서 적용될 때 즉시 발생합니다. 이는 TargetActor보다 효율적이며, 타겟팅 객체의 CDO에서 실행되므로(액터를 생성하거나 파괴하지 않음) 성능이 뛰어납니다. 그러나 플레이어 입력이 없고, 확인 없이 즉시 발생하며, 취소할 수 없고, 클라이언트에서 서버로 데이터를 전송할 수 없습니다(두 곳에서 데이터가 생성). 이 방식은 인스턴트 트레이스와 충돌 오버랩에 잘 작동합니다. 에픽 게임즈의 Action RPG 샘플 프로젝트는 두 가지 예시 타겟팅 방법을 GameplayEffectContainer와 함께 제공합니다. 하나는 Ability 소유자를 타겟으로 하고, 다른 하나는 이벤트에서 TargetData를 가져오는 방식입니다. 또한, Blueprint에서 플레이어로부터 일정 오프셋(자식 Blueprint 클래스에서 설정)을 두고 인스턴트 구체 트레이스를 수행하는 예시도 구현되어 있습니다. URPGTargetType을 C++ 또는 Blueprint에서 서브클래스하여 자신만의 타겟팅 유형을 만들 수 있습니다.

# 5. 일반적으로 구현되는 Ability와 Effect

## 5.1 스턴

일반적으로 스턴을 사용하면 캐릭터의 활성화된 모든 GameplayAbility를 취소하고, 새로운 GameplayAbility가 활성화되지 않도록 하며, 스턴이 지속되는 동안 움직이지 못하도록 합니다. 샘플 프로젝트의 메테오 GameplayAbility는 적중된 대상에 스턴을 적용합니다. 대상의 활성화된 게임플레이 어빌리티를 취소하려면, 스턴 GameplayTag가 추가될 때 AbilitySystemComponent->CancelAbilities()를 호출합니다.

  
스턴한 상태에서 새로운 GameplayAbility가 활성화되는 것을 방지하기 위해, GameplayAbility는 활성화 차단 태그인 GameplayTagContainer에 스턴 GameplayTag를 지정합니다. 기절 상태에서 움직이지 않도록 하기 위해 소유자가 기절 GameplayTag를 가지고 있을 때 0을 반환하도록 CharacterMovementComponent의 GetMaxSpeed()를 오버라이드합니다.

## 5.2  스프린트(질주)

샘플 프로젝트는 왼쪽 Shift 키를 누른 상태에서 더 빠르게 달리는 스프린트 방법의 예시를 제공합니다. 더 빠른 움직임은 네트워크를 통해 서버에 플래그를 전송하여 CharacterMovementComponent가 예측적으로 처리합니다. 자세한 내용은 GDCharacterMovementComponent.h/cpp를 참조하세요.  
GA는 좌클릭 입력에 대한 응답을 처리하고, CMC에 스프린트를 시작 및 중지하고, 좌클릭을 누르고 있는 동안 스태미나를 예측하여 충전하도록 지시합니다. 자세한 내용은 GA_Sprint_BP를 참조하세요.

## 5.3 조준경 조준

샘플 프로젝트는 스프린트와 똑같은 방식으로 처리하지만 이동 속도를 증가시키는 대신 감소시킵니다.  
이동 속도 예측 감소에 대한 자세한 내용은 GDCharacterMovementComponent.h/cpp를 참조하세요.  
입력 처리에 대한 자세한 내용은 GA_AimDownSight_BP를 참조하세요. 조준경 조준에는 스태미나 비용이 들지 않습니다.

## 5.4 생명력 흡수

생명력 흡수는 데미지 ExecutionCalculation 안에서 처리합니다. GameplayEffect에는 Effect.CanLifesteal 같은 GameplayTag가 붙습니다. 실행 계산은 GameplayEffectSpec에 해당 Effect.CanLifesteal GameplayTag가 있는지 확인합니다. GameplayTag가 존재하면, 실행 계산은 모디파이어로 부여할 생명력을 가진 [동적 인스턴트 게임플레이 이펙트를 생성](https://github.com/tranek/GASDocumentation#concepts-ge-dynamic)하여 소스의 ASC에 다시 적용합니다.


```C++
if (SpecAssetTags.HasTag(FGameplayTag::RequestGameplayTag(FName("Effect.Damage.CanLifesteal"))))
{
	float Lifesteal = Damage * LifestealPercent;

	UGameplayEffect* GELifesteal = NewObject<UGameplayEffect>(GetTransientPackage(), FName(TEXT("Lifesteal")));
	GELifesteal->DurationPolicy = EGameplayEffectDurationType::Instant;

	int32 Idx = GELifesteal->Modifiers.Num();
	GELifesteal->Modifiers.SetNum(Idx + 1);
	FGameplayModifierInfo& Info = GELifesteal->Modifiers[Idx];
	Info.ModifierMagnitude = FScalableFloat(Lifesteal);
	Info.ModifierOp = EGameplayModOp::Additive;
	Info.Attribute = UPAAttributeSetBase::GetHealthAttribute();

	SourceAbilitySystemComponent->ApplyGameplayEffectToSelf(GELifesteal, 1.0f, SourceAbilitySystemComponent->MakeEffectContext());
}
```

## 5.5 클라이언트 및 서버에서 난수 생성하기

총알 반동이나 확산과 같은 이유로 GameplayAbility 내부에서 "무작위" 숫자를 생성해야 하는 경우가 있습니다. 이때 클라이언트와 서버는 모두 동일한 난수를 생성하기를 원할 것입니다. 이를 위해서는 GameplayAbility를 활성화할 때 랜덤 시드를 동일하게 설정해야 합니다. 클라이언트가 활성화를 잘못 예측하여 난수 시퀀스가 서버와 동기화되지 않을 경우를 대비하여 GameplayAbility를 활성화할 때마다 난수 시드를 설정해야 합니다.

|   |   |
|---|---|
|시드 설정 방법|설명|
|활성화 예측 키|GameplayAbility 활성화 예측 키는 클라이언트와 서버 모두에서 Activation()에서 동기화되어 사용할 수 있도록 보장되는 int16입니다. 이를 클라이언트와 서버 모두에서 랜덤 시드로 설정할 수 있습니다. 이 방법의 단점은 게임이 시작될 때마다 예측 키가 항상 0에서 시작하고 키를 생성할 때마다 사용할 값이 지속적으로 증가한다는 것입니다. 즉, 매 경기마다 정확히 동일한 난수 시퀀스를 갖게 됩니다. 이는 사용자의 필요에 따라 충분히 무작위적일 수도 있고 그렇지 않을 수도 있습니다.|
|게임플레이 어빌리티를 활성화할 때 이벤트 페이로드를 통해 시드를 전송|이벤트별 GameplayAbility를 활성화하고 복제된 이벤트 페이로드를 통해 클라이언트에서 서버로 무작위로 생성된 시드를 전송합니다. 이렇게 하면 무작위성을 높일 수 있지만 클라이언트가 게임을 쉽게 해킹하여 매번 동일한 시드 값만 전송할 수 있습니다. 또한 GameplayAbility를 이벤트별로 활성화하면 입력 바인딩에서 활성화되지 않습니다.|

무작위 편차가 작다면 대부분의 플레이어는 매 게임마다 순서가 동일하다는 것을 눈치채지 못할 것이며, 활성화 예측 키를 무작위 시드로 사용하는 것이 효과적일 것입니다. 해커로부터 보호해야 하는 더 복잡한 작업을 수행하는 경우 서버가 예측 키를 생성하거나 이벤트 페이로드를 통해 전송할 무작위 시드를 생성할 수 있는 서버 시작 게임플레이 어빌리티를 사용하는 것이 더 효과적일 수 있습니다.

## 5.6 크리티컬 히트

치명타 처리는 데미지 ExecutionCalculation 안에서 처리합니다. GameplayEffect에는 Effect.CanCrit와 같은 GameplayTag 가 붙습니다. ExecutionCalculation 은 GameplayEffectSpec 에 해당 Effect.CanCrit GameplayTag가 있는지 확인합니다. GameplayTag 가 존재하면, ExecutionCalculation 은 치명타 확률(소스에서 캡처한 속성)에 해당하는 난수를 생성하고, 성공하면 치명타 대미지(소스에서 캡처한 속성)를 더합니다. 대미지를 예측하지 않기 때문에 ExecutionCalculation은 서버에서만 실행되므로 클라이언트와 서버의 난수 생성기를 동기화하는 것에 대해 걱정할 필요가 없습니다. MMC를 사용하여 대미지 계산을 예측적으로 수행하려면 GameplayEffectSpec->GameplayEffectContext->GameplayAbilityInstance에서 랜덤 시드에 대한 참조를 가져와야 합니다.  
  
GASShooter가 헤드샷을 어떻게 처리하는지 살펴보세요. 무작위 숫자에 의존하지 않고 대신 FHitResult 본 이름을 확인한다는 점을 제외하면 같은 개념입니다.

## 5.7 중첩되지 않는 게임플레이 효과이지만 실제로는 가장 큰 크기만 대상에 미치는 이펙트

파라곤의 둔화 효과는 중첩되지 않았습니다. 각 느린 인스턴스는 정상적으로 적용되고 수명을 추적했지만, 가장 큰 규모의 느린 효과만 실제로 캐릭터에 영향을 미쳤습니다. GAS는 이 시나리오를 AggregatorEvaluateMetaData를 통해 즉시 제공합니다. 자세한 내용과 구현은 [AggregatorEvaluateMetaData()](https://github.com/tranek/GASDocumentation#concepts-as-onattributeaggregatorcreated)를 참조하세요.

## 5.8 게임이 일시 중지된 상태에서 타겟 데이터 생성

플레이어의 WaitTargetData AbilityTask에서 TargetData 생성을 기다리는 동안 게임을 일시정지해야 하는 경우, 일시정지 대신 slomo 0을 사용하는 것이 좋습니다.

## 5.9 원버튼 인터랙션 시스템

[GASShooter](https://github.com/tranek/GASShooter)는 플레이어가 'E'를 길게 눌러 플레이어 부활, 무기 상자 열기, 미닫이문 여닫기 등 상호작용이 가능한 오브젝트와 상호작용할 수 있는 원버튼 상호작용 시스템을 구현했습니다.

# 6. GAS 디버깅

GAS 관련 문제를 디버깅할 때 종종 다음과 같은 사항을 알고 싶어합니다:

- "내 어트리뷰트의 값이 어떻게 되는 거지?"
- "어떤 GameplayTag가 있는 거야?"
- "현재 어떤 GameplayEffect를 사용할 수 있지?"
- "내게 부여된 Ability는 무엇이고, 어떤 Ability가 실행 중이며, 어떤 Ability가 활성화되지 않도록 차단되어 있지?"

GAS에는 런타임에 이러한 질문에 답하기 위한 두 가지 기법, 즉 showdebug abilitysystem과 GameplayDebugger의 후크가 있습니다.

**Tip:** 언리얼 엔진은 C++ 코드 최적화를 선호하기 때문에 일부 함수를 디버깅하기 어렵습니다. 드물지만, 코드 깊숙한 곳을 추적할 때 이런 문제가 발생할 수 있습니다. Visual Studio 솔루션 구성을 DebugGame Editor로 설정해도 코드 추적이나 변수 검사가 불가능한 경우, 최적화된 함수를 UE_DISABLE_OPTIMIZATION 및 UE_ENABLE_OPTIMIZATION 매크로 또는 CoreMiscDefines.h에 정의된 ship 변수로 래핑하여 모든 최적화를 비활성화하면 됩니다. 플러그인을 소스에서 리빌드하지 않는 이상 플러그인 코드에는 사용할 수 없습니다. 이 기능은 인라인 함수의 기능과 위치에 따라 작동할 수도 있고 작동하지 않을 수도 있습니다. 디버깅이 끝나면 매크로를 반드시 제거하세요!

cpp

접기

```
UE_DISABLE_OPTIMIZATION
void MyClass::MyFunction(int32 MyIntParameter)
{
    //내 코드
}
UE_ENABLE_OPTIMIZATION
```

## 6.1 showdebug abilitysystem

게임 내 콘솔에서 showdebug abilitysystem을 입력합니다. 이 기능은 세 개의 "페이지"로 나뉩니다. 세 페이지 모두 현재 가지고 있는 게임플레이 태그를 표시합니다. 콘솔에 AbilitySystem.Debug.NextCategory를 입력하면 페이지 사이를 순환할 수 있습니다.  
  
첫 페이지에는 모든 어트리뷰트의 현재 값이 표시됩니다:

![](https://blog.kakaocdn.net/dn/wRUjM/btszYK3BMOu/b2gpGO5VTQ5bEFZe7otudK/img.png)

두 번째 페이지에는 모든 지속 효과와 무한 게임플레이 효과, 스택 수, 게임플레이 효과에 부여되는 게임플레이 태그, 게임플레이 효과에 부여되는 수정자가 표시됩니다.

![](https://blog.kakaocdn.net/dn/P4IXU/btsz1iZJzii/ltqQ3dMpQoLMB7XOeGoY6K/img.png)

세 번째 페이지에는 내게 부여된 모든 게임플레이 어빌리티, 현재 실행 중인지 여부, 활성화가 차단되었는지 여부, 현재 실행 중인 어빌리티 태스크의 상태가 표시됩니다.

![](https://blog.kakaocdn.net/dn/bDERLL/btsz1TZBc0R/hQ5kM34Tad4GTKDklYCSl1/img.png)

타겟(액터 주위에 초록색 직사각형 프리즘으로 표시됨) 사이를 오가려면 PageUp 키 또는 NextDebugTarget 콘솔 명령을 사용하여 다음 타겟으로 이동하고, PageDown 키 또는 PreviousDebugTarget 콘솔 명령을 사용하여 이전 타겟으로 이동합니다.

> ****💡** Note**: 현재 선택된 디버그 액터에 따라 어빌리티 시스템 정보가 업데이트되도록 하려면, 디폴트게임.ini 의 AbilitySystemGlobals 에서 bUseDebugTargetFromHud=true를 다음과 같이 설정해야 합니다:

cpp

접기

```
[/Script/GameplayAbilities.AbilitySystemGlobals]
bUseDebugTargetFromHud=true
```

> ******💡**** Note**: showdebug 능력 시스템이 작동하려면 게임 모드에서 실제 HUD 클래스가 선택되어 있어야 합니다. 그렇지 않으면 명령을 찾을 수 없고 "알 수 없는 명령"이 반환됩니다.

## 6.2 Gameplay Debugger

GAS는 게임플레이 디버거에 기능을 추가합니다. 아포스트로피(') 키로 게임플레이 디버거에 액세스합니다. 숫자패드의 3을 눌러 어빌리티 카테고리를 활성화합니다. 사용 중인 플러그인에 따라 카테고리가 다를 수 있습니다. 키보드에 노트북과 같은 숫자패드가 없는 경우 프로젝트 설정에서 키 바인딩을 변경할 수 있습니다.  
  
**다른** 캐릭터의 게임플레이 태그, 게임플레이 이펙트, 게임플레이 어빌리티를 확인하고 싶을 때는 게임플레이 디버거를 사용하세요. 안타깝게도 타깃의 어트리뷰트 CurrentValue는 표시되지 않습니다. 화면 중앙에 있는 모든 캐릭터를 대상으로 합니다. 에디터의 월드 아웃라이너에서 타을 선택하거나 다른 캐릭터를 보고 아포스트로피 키(')를 다시 눌러 타깃을 변경할 수 있습니다. 현재 검사 중인 캐릭터는 그 위에 가장 큰 빨간색 원이 표시됩니다.

![](https://blog.kakaocdn.net/dn/lyJIB/btszZmVL6N1/QUZiRDSfDNGVpdV0Lk6F80/img.png)

## 6.3 GAS Logging

GAS 소스 코드에는 다양한 상세도 수준에서 생성되는 많은 로깅 문이 포함되어 있습니다. 이러한 문은 대부분 ABILITY_LOG() 문으로 표시됩니다. 기본 상세 수준은 표시입니다. 그 이상이면 기본적으로 콘솔에 표시되지 않습니다.  
  
로그 카테고리의 상세도 수준을 변경하려면 콘솔에 입력합니다:

cpp

접기

```
log [category] [verbosity]
```

예를 들어 ABILITY_LOG() 문을 사용 설정하려면 콘솔에 입력합니다:

cpp

접기

```
log LogAbilitySystem VeryVerbose
```

기본값으로 재설정하려면 다음과 같이 입력합니다:

cpp

접기

```
log LogAbilitySystem Display
```

모든 로그 카테고리를 표시하려면 다음과 같이 입력합니다:

cpp

접기

```
log list
```

주목할 만한 GAS 관련 로깅 카테고리입니다:

|   |   |
|---|---|
|로깅 카테고리|기본 상세도 수준|
|LogAbilitySystem|Display|
|LogAbilitySystemComponent|Log|
|LogGameplayCueDetails|Log|
|LogGameplayCueTranslator|Display|
|LogGameplayEffectDetails|Log|
|LogGameplayEffects|Display|
|LogGameplayTags|Log|
|LogGameplayTasks|Log|
|VLogAbilitySystem|Display|

자세한 내용은 [로깅 관련 위키](https://unrealcommunity.wiki/logging-lgpidy6i)를 참조하세요.

# 7. 최적화

## 7.1 Ability 일괄 처리

한 프레임에 활성화하고, 선택적으로 타겟 데이터를 서버로 전송하고, 모두 종료하는 게임플레이 어빌리티를 [일괄 처리하여 2~3개의 RPC를 하나의 RPC로 압축](https://github.com/tranek/GASDocumentation#concepts-ga-batching)할 수 있습니다. 이러한 유형의 어빌리티는 일반적으로 히트스캔 건에 사용됩니다.

## [7.2 Gameplay Cue 일괄 처리](https://github.com/tranek/GASDocumentation#72-gameplay-cue-batching)

많은 게임플레이 큐를 동시에 전송하는 경우 [하나의 RPC로 일괄 처리](https://github.com/tranek/GASDocumentation#concepts-gc-batching)하는 것이 좋습니다. 목표는 RPC의 수를 줄이고(게임플레이 큐는 신뢰할 수 없는 넷멀티캐스트입니다) 가능한 한 적은 데이터를 전송하는 것입니다.

## [7.3 AbilitySystemComponent Replication Mode](https://github.com/tranek/GASDocumentation#73-abilitysystemcomponent-replication-mode)

기본적으로 ASC는 [전체 리플리케이션 모드](https://github.com/tranek/GASDocumentation#concepts-asc-rm)입니다. 그러면 모든 GameplayEffect가 모든 클라이언트에 리플리케이트됩니다(싱글 플레이어 게임에서는 괜찮습니다). 멀티플레이어 게임에서는 플레이어 소유 ASC는 혼합 리플리케이션 모드로, AI 제어 캐릭터는 최소 리플리케이션 모드로 설정합니다. 이렇게 하면 플레이어 캐릭터에 적용된 GE는 해당 캐릭터의 소유자에게만 리플리케이트되며, AI 제어 캐릭터에 적용된 GE는 클라이언트에 GE를 리플리케이트하지 않습니다. 게임플레이 태그는 여전히 리플리케이트되며, GameplayCue는 리플리케이션 모드에 관계없이 모든 클라이언트에 여전히 불안정한 넷멀티캐스트가 됩니다. 이렇게 하면 모든 클라이언트가 볼 필요가 없는 GE의 네트워크 데이터가 리플리케이트되는 것을 줄일 수 있습니다.

## [7.4 Attribute Proxy Replication](https://github.com/tranek/GASDocumentation#74-attribute-proxy-replication)

포트나이트 배틀로얄(FNBR)처럼 플레이어가 많은 대규모 게임의 경우, 항상 관련성이 있는 플레이어 스테이트에 다수의 어트리뷰트를 리플리케이트하는 ASC가 많이 존재할 것입니다. 이 병목 현상을 최적화하기 위해 포트나이트는 PlayerState::ReplicateSubobjects()에서 시뮬레이션된 플레이어 제어 프록시에서 ASC와 그 어트리뷰트 세트의 리플리케이션을 모두 비활성화합니다. 자율 프록시와 AI 제어 폰은 여전히 리플리케이션 모드에 따라 완전히 리플리케이트됩니다. 항상 관련성이 있는 플레이어 스테이트의 ASC에 어트리뷰트를 리플리케이트하는 대신, FNBR은 플레이어의 폰에 리플리케이트된 프록시 구조를 사용합니다. 서버의 ASC에서 어트리뷰트가 변경되면 프록시 구조체에서도 변경됩니다. 클라이언트는 프록시 구조체에서 리플리케이트된 어트리뷰트를 받아 로컬 ASC에 변경 사항을 다시 푸시합니다. 이를 통해 어트리뷰트 리플리케이션이 폰의 관련성과 NetUpdateFrequency를 사용할 수 있습니다. 또한 이 프록시 구조체는 비트마스크에 화이트리스트에 있는 작은 게임플레이 태그 세트를 리플리케이트합니다. 이 최적화를 통해 네트워크 상의 데이터 양을 줄이고 폰 관련성을 활용할 수 있습니다. AI 제어 폰은 이미 관련성을 사용하는 폰에 ASC가 있으므로 이 최적화가 필요하지 않습니다.

> 그 이후로 적용된 다른 서버 측 최적화(리플리케이션 그래프 등)에서도 여전히 필요한지 잘 모르겠고, 유지 관리가 가장 쉬운 패턴도 아닙니다.

커뮤니티 질문에 대한 에픽의 Dave Ratti 답변

## 7.5 ASC 지연 Loading

포트나이트 배틀로얄(FNBR)에는 나무, 건물 등 피해를 입힐 수 있는 액터가 많이 있으며, 각 액터마다 ASC가 있습니다. 이로 인해 메모리 비용이 늘어날 수 있습니다. FNBR은 필요할 때(플레이어가 처음 피해를 입었을 때) ASC를 느리게 로드하여 이를 최적화합니다. 이렇게 하면 일부 액터는 경기 중에 피해를 입지 않을 수 있으므로 전체 메모리 사용량을 줄일 수 있습니다.

# 8. Quality of Life Suggestions

## 8.1 Gameplay Effect Containers

GameplayEffectContainer는 게임플레이 이펙트 스펙, 타깃 데이터, 단순 타깃팅, 관련 기능을 사용하기 쉬운 구조체로 결합합니다. 게임플레이 이펙트 스펙을 어빌리티에서 스폰된 프로젝타일에 전송한 다음 나중에 충돌할 때 적용하는 데 유용합니다.

## 8.2 ASC 델리게이트에 바인딩할 블루프린트 비동기 태스크

디자이너 친화적인 반복처리 시간을 늘리려면, 특히 UI용 UMG 위젯을 디자인할 때, (C++로) 블루프린트 비동기 태스크를 생성하여 UMG 블루프린트 그래프에서 직접 ASC의 공통 변경 델리게이트에 바인딩하면 됩니다. 한 가지 주의할 점은 (위젯이 소멸될 때처럼) 수동으로 소멸시켜야 한다는 것입니다. 그렇지 않으면 메모리에 영원히 남게 됩니다. 샘플 프로젝트에는 세 개의 블루프린트 비동기 태스크가 포함되어 있습니다.  
  
어트리뷰트 변경을 수신합니다:

![](https://blog.kakaocdn.net/dn/1ASAz/btsz2iERMkR/ABfkFnCEmAGNcVgRQ9UJ3k/img.png)

쿨타임임이 변경되는지 확인합니다:

![](https://blog.kakaocdn.net/dn/bj7pwt/btsz3M6BWXP/zAViAlGIbeGkL9NdgnQGk1/img.png)

GE 스택 변경 사항에 리슨:

![](https://blog.kakaocdn.net/dn/c3VmvB/btsz1KIruaz/oyQHwyqbq3A0zekqaDITu0/img.png)

# 9. 문제 해결

## 9.1 LogAbilitySystem: Warning: Can't activate LocalOnly or LocalPredicted ability %s when not local!

클라이언트에서 [ASC를 초기화](https://github.com/tranek/GASDocumentation#concepts-asc-setup)해야 합니다.

## 9.2 스크립트 구조체 캐시 오류들

[UAbilitySystemGlobals::InitGlobalData()](https://github.com/tranek/GASDocumentation#concepts-asg-initglobaldata)를 호출해야 합니다.

## 9.3 애니메이션 몽타주가 클라이언트에 리플리케이트되지 않을 경우.

게임플레이 어빌리티에서 PlayMontage 대신 PlayMontageAndWait 블루프린트 노드를 사용하고 있는지 확인하세요. 이 어빌리티 태스크는 ASC를 통해 몽타주를 자동으로 리플리케이트하는 반면, PlayMontage 노드는 그렇지 않습니다.

## 9.4 블루프린트 액터 복제는 AttributeSet을 nullptr로 설정.

언리얼 엔진에 기존 블루프린트 액터 클래스에서 복제된 블루프린트 액터 클래스에 대해 클래스의 AttributeSet 포인터를 nullptr 로 설정하는 버그가 있습니다. 이에 대한 몇 가지 해결 방법이 있습니다. 제 클래스에서 맞춤형 AttributeSet 포인터를 만들지 않고 (.h 에 포인터를 만들지 않고, 생성자에서 CreateDefaultSubobject 를 호출하지 않고) 대신 (샘플 프로젝트에는 표시되지 않은) PostInitializeComponents()에서 ASC 에 AttributeSet 을 직접 추가하는 데 성공한 적이 있습니다. 리플리케이트된 AttributeSet은 여전히 ASC의 SpawnedAttributes 배열에 존재합니다. 다음과 같이 보일 것입니다:


```C++
void AGDPlayerState::PostInitializeComponents()
{
	Super::PostInitializeComponents();

	if (AbilitySystemComponent)
	{
		AbilitySystemComponent->AddSet<UGDAttributeSetBase>();
		// ... any other AttributeSets that you may have
	}
}
```

이 시나리오에서는 매[크로에서 만든 AttributeSet의 함수를 호출](https://github.com/tranek/GASDocumentation#concepts-as-attributes)하는 대신 ASC의 함수를 사용하여 AttributeSet의 값을 읽고 설정합니다.

```C++
/** Returns current (final) value of an attribute */
float GetNumericAttribute(const FGameplayAttribute &Attribute) const;

/** Sets the base value of an attribute. Existing active modifiers are NOT cleared and will act upon the new base value. */
void SetNumericAttributeBase(const FGameplayAttribute &Attribute, float NewBaseValue);
```

따라서 GetHealth()는 다음과 같이 보일 것입니다:

```C++
float AGDPlayerState::GetHealth() const
{
	if (AbilitySystemComponent)
	{
		return AbilitySystemComponent->GetNumericAttribute(UGDAttributeSetBase::GetHealthAttribute());
	}

	return 0.0f;
}
```

health Attribute을 설정(초기화)하면 다음과 같은 모양이 됩니다:

```C++
const float NewHealth = 100.0f;
if (AbilitySystemComponent)
{
	AbilitySystemComponent->SetNumericAttributeBase(UGDAttributeSetBase::GetHealthAttribute(), NewHealth);
}
```

다시 한 번 말씀드리자면, ASC는 AttributeSet 클래스당 최대 하나의 AttributeSet 객체만 기대합니다.

## 9.5 해결되지 않은 외부 심볼 UEPushModelPrivate::MarkPropertyDirty(int, int)

다음과 같은 컴파일러 오류가 발생하면:


```C++
error LNK2019: unresolved external symbol "__declspec(dllimport) void __cdecl UEPushModelPrivate::MarkPropertyDirty(int,int)" (__imp_?MarkPropertyDirty@UEPushModelPrivate@@YAXHH@Z) referenced in function "public: void __cdecl FFastArraySerializer::IncrementArrayReplicationKey(void)" (?IncrementArrayReplicationKey@FFastArraySerializer@@QEAAXXZ)
```

FFastArraySerializer에서 MarkItemDirty()를 호출하려고 할 때 발생하는 문제입니다.   
쿨타임 지속 시간을 업데이트할 때와 같이 ActiveGameplayEffect를 업데이트할 때 이 문제가 발생했습니다.


```C++
ActiveGameplayEffects.MarkItemDirty(*AGE);
```

무슨 일이 일어나고 있냐면 WITH_PUSH_MODEL이 두 곳 이상에서 정의되고 있다는 것입니다. PushModelMacros.h는 0으로 정의하고 있지만 여러 곳에서 1로 정의하고 있습니다. PushModel.h는 이를 1로 보고 있지만 PushModel.cpp는 이를 0으로 보고 있습니다.  
  
해결책은 Build.cs의 프로젝트의 PublicDependencyModuleNames에 NetCore를 추가하는 것입니다.

## 9.6 열거형 이름이 경로 이름으로 표시됨

다음과 같은 컴파일러 경고가 표시되는 경우:

```C++
warning C4996: 'FGameplayAbilityInputBinds::FGameplayAbilityInputBinds': Enum names are now represented by path names. Please use a version of FGameplayAbilityInputBinds constructor that accepts FTopLevelAssetPath. Please update your code to the new API before upgrading to the next release, otherwise your project will no longer compile.
```

UE 5.1에서 BindAbilityActivationToInputComponent() 생성자에 FString 을 사용하는 것이 더이상 사용되지 않습니다. 대신 FTopLevelAssetPath를 전달해야 합니다.  
  
이전, 폐기된 방식입니다:

```C++
AbilitySystemComponent->BindAbilityActivationToInputComponent(InputComponent, FGameplayAbilityInputBinds(FString("ConfirmTarget"),
	FString("CancelTarget"), FString("EGDAbilityInputID"), static_cast<int32>(EGDAbilityInputID::Confirm), static_cast<int32>(EGDAbilityInputID::Cancel)));
```

새로운 방식:

```C++
FTopLevelAssetPath AbilityEnumAssetPath = FTopLevelAssetPath(FName("/Script/GASDocumentation"), FName("EGDAbilityInputID"));
AbilitySystemComponent->BindAbilityActivationToInputComponent(InputComponent, FGameplayAbilityInputBinds(FString("ConfirmTarget"),
	FString("CancelTarget"), AbilityEnumAssetPath, static_cast<int32>(EGDAbilityInputID::Confirm), static_cast<int32>(EGDAbilityInputID::Cancel)));
```

자세한 정보는 Engine\Source\Runtime\CoreUObject\Public\UObject\TopLevelAssetPath.h 를 참고하세요.

# 10. 일반적인 GAS 약어

|                                                                                                        |                     |
| ------------------------------------------------------------------------------------------------------ | ------------------- |
| 이름                                                                                                     | 약어                  |
| AbilitySystemComponent                                                                                 | ASC                 |
| AbilityTask                                                                                            | AT                  |
| [Action RPG Sample Project by Epic](https://www.unrealengine.com/marketplace/en-US/product/action-rpg) | ARPG, ARPG Sample   |
| CharacterMovementComponent                                                                             | CMC                 |
| GameplayAbility                                                                                        | GA                  |
| GameplayAbilitySystem                                                                                  | GAS                 |
| GameplayCue                                                                                            | GC                  |
| GameplayEffect                                                                                         | GE                  |
| GameplayEffectExecutionCalculation                                                                     | ExecCalc, Execution |
| GameplayTag                                                                                            | Tag, GT             |
| ModifierMagnitudeCalculation                                                                           | ModMagCalc, MMC     |

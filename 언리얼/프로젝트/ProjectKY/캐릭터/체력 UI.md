## 개요
각 캐릭터의 체력을 나타내는 Progress Bar 를 어빌리티 시스템 어트리뷰트 세트와 연동하여 구현 한다.

## 구현
우선 플레이어 캐릭터는 PlayerState 가 ASC를 가지고 있고, 적 캐릭터는 자체적으로 ASC를 가지고 있다.
플레이어는 HUD 형태로 보아야 하기 때문에 PlayerController 에서 UI 를 뷰포트에 붙여 PlayerState 값을 넘겨줌으로서 ASC와 연동하며, 적 캐릭터는 3D상 UI 가 나타나야 하기 때문에 별도의 WidgetComponent 를 붙여주고 ASC 와 연동해주었다.

### 베이스 유저 위젯

```C++
UCLASS()  
class PROJECTKY_API UKYUserWidget : public UUserWidget, public IAbilitySystemInterface  
{  
    GENERATED_BODY()  
  
public:  
    virtual void SetAbilitySystemComponent(AActor* InOwner);  
    virtual class UAbilitySystemComponent* GetAbilitySystemComponent() const override;  
  
protected:  
    UPROPERTY(EditAnywhere, Category = GAS)  
    TObjectPtr<class UAbilitySystemComponent> ASC;  
};
```

```C++
#include "UI/KYUserWidget.h"  
#include "AbilitySystemBlueprintLibrary.h"  
  
class UAbilitySystemComponent* UKYUserWidget::GetAbilitySystemComponent() const  
{  
    return ASC;  
}  
  
void UKYUserWidget::SetAbilitySystemComponent(AActor* InOwner)  
{  
    if (IsValid(InOwner))  
    {  
       ASC = UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(InOwner);  
    }  
}
```

베이스가 될 유저 위젯은 동일하게 어빌리티 시스템 인터페이스를 상속받고, Owner 정보를 넘겨받음으로서 현재 위젯을 소유하고 있는 객체의 ASC를 설정할 수 있게 하였다.


### 플레이어

```C++
AKYPlayerController::AKYPlayerController()  
{  
    SetShowMouseCursor(true);  
    InitializeClassFinder(HUDWidgetClass, TEXT("/Game/_Dev/UI/WBP_HUD.WBP_HUD_C"));  
  
}  
  
void AKYPlayerController::SetupHUDWidget()  
{  
    HUDWidget = CreateWidget<UKYHUDUserWidget>(this, HUDWidgetClass);  
    HUDWidget->AddToViewport();  
    HUDWidget->SetAbilitySystemComponent(PlayerState);  
}  
  
void AKYPlayerController::OnPossess(APawn* InPawn)  
{  
    Super::OnPossess(InPawn);  
    SetupHUDWidget();  
}
```

베이스 위젯을 상속받은 HUD 위젯을 생성하였고, 이러한 HUD 위젯을 플레이어 뷰포트에 부착시키면서 PlayerState 를 넘겨줌으로서 ASC를 연동하였다.
이후 HUD 위젯에서는 가지고 있는 ASC를 하위 위젯들한테 전달함으로서 간편하게 어트리뷰트를 연동할 수 있다.


### 적 캐릭터

```C++
void UKYWidgetComponent::InitWidget()  
{  
    Super::InitWidget();  
  
    UKYUserWidget* KYUserWidget = Cast<UKYUserWidget>(GetWidget());  
    if (KYUserWidget)  
    {  
       KYUserWidget->SetAbilitySystemComponent(GetOwner());  
    }  
}
```

```C++
AKYCharacterNonPlayer::AKYCharacterNonPlayer(const FObjectInitializer& ObjectInitializer)  
    : Super(ObjectInitializer)  
{  
    ASC = CreateDefaultSubobject<UAbilitySystemComponent>(TEXT("ASC"));  
    AttributeSetHealth = CreateDefaultSubobject<UKYAttributeSetHealth>(TEXT("AttributeSetHealth"));  
    AttributeSetStance = CreateDefaultSubobject<UKYAttributeSetStance>(TEXT("AttributeSetStance"));  
    AIControllerClass = AKYAIController::StaticClass();  
    AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;  
  
    HPBar = CreateDefaultSubobject<UKYWidgetComponent>(TEXT("Widget"));  
    HPBar->SetupAttachment(GetMesh());  
    HPBar->SetRelativeLocation(FVector(0.0f, 0.0f, 200.0f));  
  
    TSubclassOf<UUserWidget> HPBarWidgetClass;  
    InitializeClassFinder(HPBarWidgetClass, TEXT("/Game/_Dev/UI/WBP_EnemyHPBar.WBP_EnemyHPBar_C"));  
      
    HPBar->SetWidgetClass(HPBarWidgetClass);  
    HPBar->SetWidgetSpace(EWidgetSpace::Screen);  
    HPBar->SetDrawSize(FVector2D(150.0f, 20.0f));  
    HPBar->SetCollisionEnabled(ECollisionEnabled::NoCollision);  
      
}
```

이처럼 위젯 컴포넌트를 생성자에서 등록해주고, 플레이어와 동일하게 베이스 위젯을 상속받은 HP Bar 위젯 클래스를 컴포넌트에 등록해주고 InitWidget 함수를 통해 자동적으로 적캐릭터의 ASC를 넘겨받게 해주었다.

### HP 위젯 제작
![[HealthWidget_0.png]]
![[HealthWidget_1.png]]

```C++
UCLASS()  
class PROJECTKY_API UKYHPBarUserWidget : public UKYUserWidget  
{  
    GENERATED_BODY()  
public:  
    virtual void SetAbilitySystemComponent(AActor* InOwner) override;  
  
protected:  
    virtual void OnHealthChanged(const FOnAttributeChangeData& ChangeData);  
    virtual void OnMaxHealthChanged(const FOnAttributeChangeData& ChangeData);  
  
    void UpdateHPBar();  
protected:  
    UPROPERTY(meta = (BindWidget))  
    TObjectPtr<class UProgressBar> HPProgressBar;  
  
      
    float CurrentHealth = 0.0f;  
    float CurrentMaxHealth = 0.1f;  
      
};
```

```C++
#include "UI/KYHPBarUserWidget.h"  
#include "AbilitySystemComponent.h"  
#include "Components/ProgressBar.h"  
#include "GAS/Attribute/KYAttributeSetHealth.h"  
  
void UKYHPBarUserWidget::SetAbilitySystemComponent(AActor* InOwner)  
{  
    Super::SetAbilitySystemComponent(InOwner);  
  
    if (ASC)  
    {  
       ASC->GetGameplayAttributeValueChangeDelegate(UKYAttributeSetHealth::GetHealthAttribute()).AddUObject(this, &UKYHPBarUserWidget::OnHealthChanged);  
       ASC->GetGameplayAttributeValueChangeDelegate(UKYAttributeSetHealth::GetMaxHealthAttribute()).AddUObject(this, &UKYHPBarUserWidget::OnMaxHealthChanged);  
  
       const UKYAttributeSetHealth* CurrentAttributeSetHealth = ASC->GetSet<UKYAttributeSetHealth>();  
       if (CurrentAttributeSetHealth)  
       {  
          CurrentHealth = CurrentAttributeSetHealth->GetHealth();  
          CurrentMaxHealth = CurrentAttributeSetHealth->GetMaxHealth();  
  
          if (CurrentMaxHealth > 0.0f)  
          {  
             UpdateHPBar();  
          }  
       }  
    }  
}  
  
void UKYHPBarUserWidget::OnHealthChanged(const FOnAttributeChangeData& ChangeData)  
{  
    CurrentHealth = ChangeData.NewValue;  
    if (CurrentHealth < KINDA_SMALL_NUMBER)  
    {  
       HPProgressBar->SetVisibility(ESlateVisibility::Collapsed);  
    }  
    UpdateHPBar();  
}  
  
void UKYHPBarUserWidget::OnMaxHealthChanged(const FOnAttributeChangeData& ChangeData)  
{  
    CurrentMaxHealth = ChangeData.NewValue;  
    UpdateHPBar();  
}  
  
void UKYHPBarUserWidget::UpdateHPBar()  
{  
    if (HPProgressBar)  
    {  
       HPProgressBar->SetPercent(CurrentHealth / CurrentMaxHealth);  
    }  
}
```

BindWidget 메타 정보를 활용해서 위젯을 바인딩해주었고, ASC내에 있는 어트리뷰트 변경시 이벤트를 보내주는 델리게이트를 연동함으로서 체력이 변경될때마다 위젯이 업데이트 될 수 있게 하였다.

## 결과

![[HPUI.gif]]
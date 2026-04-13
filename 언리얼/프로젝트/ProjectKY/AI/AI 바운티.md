## 개요
처치된 적이 가지고 있는 어트리뷰트 세트를 기반하여 랜덤으로 자원을 드랍한다.

##  구현

```C++
UCLASS()  
class PROJECTKY_API UKYAttributeSetEnemy : public UKYAttributeSetBase  
{  
    GENERATED_BODY()  
  
public:  
    UKYAttributeSetEnemy();  
  
    ATTRIBUTE_ACCESSORS(UKYAttributeSetEnemy, DropGold);  
    ATTRIBUTE_ACCESSORS(UKYAttributeSetEnemy, MaxDropGold);  
    ATTRIBUTE_ACCESSORS(UKYAttributeSetEnemy, DropExperience)  
    ATTRIBUTE_ACCESSORS(UKYAttributeSetEnemy, MaxDropExperience)  
  
    mutable FExperienceBountyEvent OnDropExperienceBounty;  
  
    UPROPERTY(BlueprintReadWrite, Category="Bounty", Meta=(AllowPrivateAccess=true))  
    mutable TSubclassOf<UGameplayEffect> DropBountyEffect;  
  
protected:  
    UPROPERTY(BlueprintReadWrite, Category="Attributes", Meta=(AllowPrivateAccess=true))  
    FGameplayAttributeData DropGold;  
      
    UPROPERTY(BlueprintReadWrite, Category="Attributes", Meta=(AllowPrivateAccess=true))  
    FGameplayAttributeData MaxDropGold;  
  
      
    UPROPERTY(BlueprintReadWrite, Category="Attributes", Meta=(AllowPrivateAccess=true))  
    FGameplayAttributeData DropExperience;  
      
    UPROPERTY(BlueprintReadWrite, Category="Attributes", Meta=(AllowPrivateAccess=true))  
    FGameplayAttributeData MaxDropExperience;  
  
  
protected:  
  
    virtual void ClampAttributeOnChange(const FGameplayAttribute& Attribute, float& NewValue) const override;  
  
    virtual void PostAttributeChange(const FGameplayAttribute& Attribute, float OldValue, float NewValue) override;  
      
};
```

바운티 기능을 위한 베이스 스탯을 상속받은 별도의 적 어트리뷰트 세트를 구현해주었다.
바운티 스탯은 초기화 게임 플레이 이펙트가 발동되면서 랜덤으로 설정되며, 이를 베이스로 플레이어에게 주어지는 경험치나 드랍되는 골드의 양을 베이스로 게임플레이 이펙트를 생성할 수 있다.
혹은 레벨에 따른 베이스 바운티 어트리뷰트 드랍 테이블을 구성하고 랜덤으로 추가적인 환경을 조성할 수 있게 구현하였다.

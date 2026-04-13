## 개요
조건이 충족이 되면 기존에 구성한 Attack GameAbility 발동한다.

## 구현

```C++
EBTNodeResult::Type UBTTaskNode_ExecuteGA::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)  
{  
    EBTNodeResult::Type Result = Super::ExecuteTask(OwnerComp, NodeMemory);  
  
    UAbilitySystemComponent* ASC = Cast<UAbilitySystemComponent>(OwnerComp.GetBlackboardComponent()->GetValueAsObject(BBKEY_ASC));  
    if(ASC)  
    {  
       ASC->TryActivateAbilityByClass(AbilityToActivate);  
       return EBTNodeResult::Succeeded;  
    }  
      
    return EBTNodeResult::Failed;  
}
```


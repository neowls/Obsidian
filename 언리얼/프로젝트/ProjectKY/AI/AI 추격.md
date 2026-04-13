## 개요
타겟이 발견되면 발동하는 상태로 해당 타겟의 위치를 실시간으로 업데이트 받으며, 공격할 수 있는 거리까지 추격한다.


```C++
bool UBTDecorator_IsInAttackRange::CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp,  
    uint8* NodeMemory) const  
{  
    bool bResult = Super::CalculateRawConditionValue(OwnerComp, NodeMemory);  
  
    auto ControlledPawn = OwnerComp.GetAIOwner()->GetPawn();  
    if(ControlledPawn == nullptr) return false;  
  
    auto Target = Cast<ACharacter>(OwnerComp.GetBlackboardComponent()->GetValueAsObject(BBKEY_TARGET));  
    if(Target == nullptr) return false;  
  
    bResult = (Target->GetDistanceTo(ControlledPawn) <= 200.0f);  
    return bResult;  
}
```

## 개요
타겟의 방향을 정확히 바라보고있는지 확인한다.
아니라면 해당 방향으로 회전을 한다.

## 구현
```C++
bool UBTDecorator_IsInAttackAngle::CalculateRawConditionValue(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) const  
{  
    bool bResult = Super::CalculateRawConditionValue(OwnerComp, NodeMemory);  
  
    auto ControlledPawn = OwnerComp.GetAIOwner()->GetPawn();  
    auto Target = Cast<AActor>(OwnerComp.GetBlackboardComponent()->GetValueAsObject(BBKEY_TARGET));  
      
    if(ControlledPawn == nullptr || Target == nullptr) return false;  
  
    FVector PawnLocation = ControlledPawn->GetActorLocation();  
    FVector TargetLocation = Target->GetActorLocation();  
  
    FVector TargetDirection = TargetLocation - PawnLocation;  
    TargetDirection.Normalize();  
  
    float Angle = FMath::RadiansToDegrees(FMath::Acos(FVector::DotProduct(ControlledPawn->GetActorForwardVector(), TargetDirection)));  
      
    bResult = Angle < AttackAngle;   
      
    return bResult;  
}
```

우선 데코레이터로 내적을 통해 타겟의 방향이 일정 각도내에 있는지 확인한다.

```C++
EBTNodeResult::Type UBTTaskNode_RotateToTarget::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)  
{  
    EBTNodeResult::Type Result = Super::ExecuteTask(OwnerComp, NodeMemory);  
  
    APawn* ControlledPawn = OwnerComp.GetAIOwner()->GetPawn();  
    if(ControlledPawn == nullptr)  
    {  
       KY_LOG(LogKY, Log, TEXT("Can't find Controlled Pawn"));  
       return Result = EBTNodeResult::Failed;  
    }  
  
    AActor* Target = Cast<AActor>(OwnerComp.GetBlackboardComponent()->GetValueAsObject(BBKEY_TARGET));  
    FVector TargetDirection = Target->GetActorLocation() - ControlledPawn->GetActorLocation();  
    FRotator NewRotation = FMath::RInterpTo(ControlledPawn->GetActorRotation(), TargetDirection.Rotation(), GetWorld()->GetDeltaSeconds(), 25.0f);  
      
    ControlledPawn->SetActorRotation(NewRotation);  
  
    Result = EBTNodeResult::Succeeded;  
      
    return Result;  
}
```

타겟의 방향이 각도내에 없다면 로테이션 태스크를 통해 적절한 각도로 회전한다.

![[Pasted image 20250119211205.png]]

추가적으로 현재 회전이 가능한지 태그(이미 공격중인 경우)를 확인하고 진행한다.

## 결과

![[AIAttackRotation.gif]]
스폰된 자리를 중점으로 일정 시간마다 위치를 바꾸며 주변 위치로 이동하며 타겟을 탐색하는 상태이다.
또한 찾은 플레이어 캐릭터의 위치를 베이스 위치로 반영하여 놓쳤을 경우 마지막 플레이어 위치를 기반으로 순찰할 수 있게한다.

```C++
void UBTService_Detect::TickNode(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory, float DeltaSeconds)  
{  
    Super::TickNode(OwnerComp, NodeMemory, DeltaSeconds);  
      
    APawn* ControlledPawn = OwnerComp.GetAIOwner()->GetPawn();  
    if(ControlledPawn == nullptr) return;  
    UWorld* World = ControlledPawn->GetWorld();  
    FVector Center = ControlledPawn->GetActorLocation();  
    float DetectRadius = 600.0f;  
  
    if(World == nullptr) return;  
    TArray<FOverlapResult> OverlapResults;  
    FCollisionQueryParams Params(NAME_None, false, ControlledPawn);  
    bool bResult = World->OverlapMultiByChannel(  
       OverlapResults,  
       Center,  
       FQuat::Identity,  
       ECC_Pawn,  
       FCollisionShape::MakeSphere(DetectRadius),  
       Params);  
    if(bResult)  
    {  
       for(auto const& OverlapResult : OverlapResults)  
       {  
          ACharacter* Character = Cast<ACharacter>(OverlapResult.GetActor());  
          if(Character && Character->GetController()->IsPlayerController())  
          {  
             OwnerComp.GetBlackboardComponent()->SetValueAsObject(BBKEY_TARGET, Character);  
             OwnerComp.GetBlackboardComponent()->SetValueAsVector(BBKEY_BASEPOS, Character->GetActorLocation());  
             DrawDebugSphere(World, Center, DetectRadius, 16, FColor::Green, false, 0.2f);  
  
             DrawDebugPoint(World, Character->GetActorLocation(), 10.0f, FColor::Blue, false, 0.2f);  
             DrawDebugLine(World, ControlledPawn->GetActorLocation(), Character->GetActorLocation(), FColor::Blue, false, 0.2f);  
             return;  
          }  
       }  
       OwnerComp.GetBlackboardComponent()->SetValueAsObject(BBKEY_TARGET, nullptr);  
    }  
    DrawDebugSphere(World, Center, DetectRadius, 16, FColor::Red, false, 0.2f);  
}
```

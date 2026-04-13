기본적으로 언리얼에서 제공하는 비헤이비어 트리(Behavior Tree)활용하여 구축하며, GAS를 통해 조건, 행동, 반응 등을 구현한다.

## 행동 패턴
일반적인 적 패턴은 크게 아래 다섯개의 상태로 분류한다.
1. [[AI 대기]]
2. [[AI 순찰]]
3. [[AI 추격]]
4. [[AI 공격]]
5. [[AI 배회]]

## 조건
게임플레이 태그(Tag)와 블랙보드(Blackboard)값을 통해 확인한다.
블랙보드값은 타겟의 데이터 유무, 거리, 공격 타이밍, 대기시간 등 전반적인 세부 정보를 통해 조건을 확인한다.

## 구현
![[AI 행동 트리.canvas]]
우선 Blackboard 에서 IsHit bool 값이 변경됨에 따라 최상단 노드의 실행 여부가 결정된다.
만약 피격 상태가 된다면 현재 진행 중인 노드를 모두 멈추고 루트에서 대기 상태가된다.

```C++
void AKYAIController::SetHitStatus(bool bIsHit)  
{  
    UBlackboardComponent* BBComponent = Blackboard.Get();  
    if(UseBlackboard(BBAsset, BBComponent))  
    {  
       Blackboard->SetValueAsBool(BBKEY_ISHIT, bIsHit);  
    }  
}
```

이는 AIController 내부에서 함수 콜에 따라 결정된다.
또, 해당 함수는 적 캐릭터가 피격시 자신을 소유하고 있는 AI 컨트롤러에 함수를 호출한다.

```C++
void AKYCharacterNonPlayer::PossessedBy(AController* NewController)  
{
...

    ASC->RegisterGameplayTagEvent(KYTAG_CHARACTER_HIT).AddUObject(this, &ThisClass::OnHitTagChanged);  
      
}

void AKYCharacterNonPlayer::OnHitTagChanged(const FGameplayTag CallbackTag, int32 NewCount)  
{  
    AKYAIController* AIController = Cast<AKYAIController>(GetController());  
    if (AIController)  
    {  
       AIController->SetHitStatus(NewCount>0);  
    }  
}
```

본래 피격 대미지는 DamageTaken 함수를 통해 전달되지만, 현재 어떠한 피격 상태인지는 ASC에 붙은 태그를 통해 알 수 있다.

피격되지 않은 상태라면 [[AI 순찰]] 태스크를 통해 플레이어 캐릭터를 탐색한다.

타겟이 있다면 좌측 노드가 실행되고, 타겟이 없다면 우측 노드가 실행된다.
또한 피격 상태처럼 타겟 값이 변동됨에 따라 즉각적으로 현재 상태를 취소(Abort)하고 조건을 검사한다.

공격시 공격 사거리 내로 들어가면 공격 타이밍 준비를 한다.
준비가 완료되면 효과와 함께 공격을 시행한다.

## 결과

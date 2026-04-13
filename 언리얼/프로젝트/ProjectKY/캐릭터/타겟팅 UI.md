## 개요
적을 타겟팅할 시 적에게 빌보드 상태로 타겟팅 UI가 표시되게 한다.

## 구현
우선 적 캐릭터에게 타겟팅 위젯 컴포넌트를 별도로 붙여 주었다.

```C++
{
	TargetedWidget = CreateDefaultSubobject<UKYWidgetComponent>(TEXT("Targeted"));  
	TargetedWidget->SetupAttachment(GetMesh());  
	TargetedWidget->SetRelativeLocation(FVector(0.0f, 0.0f, 100.0f));  
	  
	TSubclassOf<UUserWidget> TargetedWidgetClass;  
	InitializeClassFinder(TargetedWidgetClass, TEXT("/Game/_Dev/UI/WBP_TargetPoint.WBP_TargetPoint_C"));  
	  
	TargetedWidget->SetWidgetClass(TargetedWidgetClass);  
	TargetedWidget->SetWidgetSpace(EWidgetSpace::Screen);  
	TargetedWidget->SetDrawSize(FVector2D(50.0f, 50.0f));  
	TargetedWidget->SetCollisionEnabled(ECollisionEnabled::NoCollision);  
	TargetedWidget->SetVisibility(false);
}
```

그리고 타겟터블한 액터인지를 확인하기 위한 인터페이스를 생성하였고, 이를 상속받아 적 캐릭터의 위젯 상태를 변경할 수 있게 하였다.

```C++
class PROJECTKY_API IKYTargetableInterface  
{  
    GENERATED_BODY()  
  
public:  
    virtual void UpdateTargetedStatus(bool InStatus) = 0;  
};
```

```C++
void AKYCharacterNonPlayer::UpdateTargetedStatus(bool InStatus)  
{  
    TargetedWidget->SetVisibility(InStatus);  
}
```

이후 조준 어빌리티에서 타겟팅 시 현재 바라보고 있는 적이 타겟팅 액터에 등록되면 인터페이스 캐스팅을 통해 위젯 상태를 변경하였다.

```C++
void UKYGA_Aiming::SetTargetUIStatus(bool InStatus)  
{  
    if (CurrentTargetDataHandle.Data[0].IsValid() && CurrentTargetDataHandle.Data[0].Get()->GetActors()[0].IsValid())  
    {  
       IKYTargetableInterface* CurrentTarget = Cast<IKYTargetableInterface>(CurrentTargetDataHandle.Data[0].Get()->GetActors()[0].Get());  
       if (CurrentTarget)  
       {  
          CurrentTarget->UpdateTargetedStatus(InStatus);  
       }  
    }  
}
```

## 결과
![[targeting.gif]]

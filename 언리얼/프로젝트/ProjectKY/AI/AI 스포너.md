## 개요
적 캐릭터를 스폰시키는 구역을 구현한다.
아래의 파라미터를 둔다.
- 종류(타입)
- 인원수
- 레벨
- 스폰 범위
- 스폰 회수
- 스폰 주기

## 구현
AActor 를 상속받으며, 스피어 컴포넌트를 통해 스폰 범위를 지정한다.
`TSubClassof<AKYCharacterNonPlayer>` 를 상속받아 타입을 지정한다.
그밖에 파라미터를 통해 스포너의 목적에 맞게 설정할 수 있도록 멤버 변수를 만들어 주었다.

```C++
#pragma once  
  
#include "CoreMinimal.h"  
#include "GameFramework/Actor.h"  
#include "KYSpawnerBase.generated.h"  
  
UCLASS()  
class PROJECTKY_API AKYSpawnerBase : public AActor  
{  
    GENERATED_BODY()  
      
public:   
    AKYSpawnerBase();  
  
protected:  
    virtual void BeginPlay() override;  
  
    virtual void OnConstruction(const FTransform& Transform) override;  
  
    TArray<FVector> GeneratePoissonDiskSamples(FVector Origin, float Radius, float MinDistance, float MinCenterOffSet, int MaxTries);  
  
    void SpawnCharacter();  
  
  
protected:  
    UPROPERTY(EditDefaultsOnly,BlueprintReadWrite, Category="Components")  
    TObjectPtr<class USphereComponent> SpawnArea;  
      
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Spawn")  
    TSubclassOf<class AKYCharacterNonPlayer> SpawnType;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn")  
    uint8 SpawnAmount = 5;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn")  
    uint8 SpawnLevel = 1;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn")  
    bool bSpawnMultiple = false;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn")  
    float MinSpawnDistance = 200.0f;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn")  
    float CenterOffset = 100.0f;  
      
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn",meta = (EditCondition = "bSpawnMultiple", EditConditionHides))  
    uint8 MultipleSpawnCount = 2;  
  
    UPROPERTY(EditAnywhere, BlueprintReadWrite, category="Spawn",meta = (EditCondition = "bSpawnMultiple", EditConditionHides))  
    float MultipleSpawnRate = 10.0f;  
      
    UPROPERTY(VisibleInstanceOnly, Category = "Spawn")  
    TArray<FVector> DebugSpawnPoints;  
      
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Spawn")  
    bool bDebugSpawn = true;  
};
```

> [!tip] EditConditionHides
> 해당 메타 정보를 입력하면 지정한 부울 변수의 상태에 따라 디테일 패널에서 멤버 변수의 가시성이 정해진다.

스폰 시킬 때 조건은 스피어 구역내에 AI 캐릭터가 활동할 수 있는 Nav 공간이여야 하고, 고르게 분포되어야 한다.
이러한 조건에 해당하는 알고리즘으로 **푸아송 디스크 샘플링(Poisson Disk Sampling)** 을 활용하였다.

> [!Info] Poisson Disk Sampling
> 푸아송 디스크 샘플 셋(set)에서 두 개의 샘플들은 서로 가까워지지 않습니다.
> 가장 가까운 거리가 푸아송 디스크 반지름(radius)로 정의되는데, 이는 두 개의 가장 가까운 샘플들 사이의 거리의 절반입니다.
> 일반 랜덤(regular random ) 샘플링과 비교했을 때, 푸아송 디스크 샘플 셋들은 샘플링 영역(domain) 전체에서 더 많은 균일한(uniform) 샘플 분포(distribution)을 제공합니다.
> 
> ![[Pasted image 20250203110024.png]]
> 
> https://youtu.be/7WcmyxyFO7o


```C++
    
#include "System/KYSpawnerBase.h"  
#include "NavigationSystem.h"  
#include "ProjectKY.h"  
#include "Character/KYCharacterNonPlayer.h"  
#include "Components/SphereComponent.h"  
  
  
AKYSpawnerBase::AKYSpawnerBase()  
{  
    SpawnArea = CreateDefaultSubobject<USphereComponent>("SpawnArea");  
    SpawnArea->SetupAttachment(RootComponent);  
    SpawnArea->SetSphereRadius(50.0f);  
}

void AKYSpawnerBase::BeginPlay()  
{  
    Super::BeginPlay();  
    SpawnCharacter();  
}  
  
void AKYSpawnerBase::OnConstruction(const FTransform& Transform)  
{  
    Super::OnConstruction(Transform);  
    FlushPersistentDebugLines(GetWorld());  
    if (bDebugSpawn)  
    {  
        // 스폰 지점 재계산  
        FVector Origin = SpawnArea->GetComponentLocation();  
        float Radius = SpawnArea->GetScaledSphereRadius();  
      
        DebugSpawnPoints = GeneratePoissonDiskSamples(Origin, Radius, MinSpawnDistance, CenterOffset, 30);  
  
        // 디버그 드로잉  
        for (const FVector& SpawnPoint : DebugSpawnPoints)  
        {  
            DrawDebugSphere(GetWorld(), SpawnPoint, 10.0f, 12, FColor::Green, true, -1.0f);  
        }  
  
        // 🔹 중앙 제거 반경을 빨간색 원으로 표시  
        DrawDebugCircle(GetWorld(), Origin, CenterOffset, 32, FColor::Red, true, -1.0f, 0, 5.0f, FVector(1,0,0), FVector(0,1,0));  
    }  
}  
  
  
TArray<FVector> AKYSpawnerBase::GeneratePoissonDiskSamples(FVector Origin, float Radius, float MinDistance, float MinCenterOffset, int MaxTries)  
{  
    TArray<FVector> Points;  
    TArray<FVector> ActiveList;  
  
    float SafeRadius = Radius * 0.9f;  
  
    if (MinCenterOffset >= SafeRadius)  
    {  
        UE_LOG(LogTemp, Warning, TEXT("MinCenterOffset is greater than or equal to SafeRadius. Adjusting SafeRadius."));  
        SafeRadius = MinCenterOffset * 1.1f;  
    }  
  
    // 첫 번째 랜덤 점 생성  
    float InitialAngle = FMath::RandRange(0.0f, 2.0f * PI);  
    float InitialRadius = FMath::RandRange(0.0f, SafeRadius);  
    FVector2D RandomOffset = FVector2D(FMath::Cos(InitialAngle), FMath::Sin(InitialAngle)) * InitialRadius;  
    FVector FirstPoint = FVector(Origin.X + RandomOffset.X, Origin.Y + RandomOffset.Y, Origin.Z);  
  
    Points.Add(FirstPoint);  
    ActiveList.Add(FirstPoint);  
  
    while (ActiveList.Num() > 0 && Points.Num() < SpawnAmount * 2) // 여유 공간 확보를 위해 2배 크기로 생성  
    {  
        int32 RandomIndex = FMath::RandRange(0, ActiveList.Num() - 1);  
        FVector ActivePoint = ActiveList[RandomIndex];  
        bool bFoundValidPoint = false;  
  
        for (int32 i = 0; i < MaxTries; i++)  
        {  
            float SampleAngle = FMath::RandRange(0.0f, 2.0f * PI);  
            float SampleRadius = FMath::RandRange(MinDistance, 2 * MinDistance);  
            FVector2D RandomDir = FVector2D(FMath::Cos(SampleAngle), FMath::Sin(SampleAngle)) * SampleRadius;  
            FVector NewPoint = FVector(ActivePoint.X + RandomDir.X, ActivePoint.Y + RandomDir.Y, Origin.Z);  
  
            if (FVector::DistSquared(Origin, NewPoint) > SafeRadius * SafeRadius)  
            {  
                continue;  
            }  
  
            bool bValid = true;  
            for (const FVector& ExistingPoint : Points)  
            {  
                if (FVector::DistSquared(NewPoint, ExistingPoint) < MinDistance * MinDistance)  
                {  
                    bValid = false;  
                    break;  
                }  
            }  
  
            UNavigationSystemV1* NavSystem = FNavigationSystem::GetCurrent<UNavigationSystemV1>(GetWorld());  
            if (NavSystem)  
            {  
                FNavLocation NavLocation;  
                if (!NavSystem->ProjectPointToNavigation(NewPoint, NavLocation))  
                {  
                    bValid = false;  
                }  
            }  
            else  
            {  
                NewPoint.Z = Origin.Z;  
            }  
  
            if (bValid)  
            {  
                Points.Add(NewPoint);  
                ActiveList.Add(NewPoint);  
                bFoundValidPoint = true;  
                break;  
            }  
        }  
  
        if (!bFoundValidPoint)  
        {  
            ActiveList.RemoveAt(RandomIndex);  
        }  
    }  
  
    // 중앙 반경 내 점 제거  
    Points = Points.FilterByPredicate([&](const FVector& Point)  
    {  
        return FVector::DistSquared(Origin, Point) >= MinCenterOffset * MinCenterOffset;  
    });  
  
    // 개수가 부족할 경우 추가 생성 (무한 루프 방지 추가)  
    int32 MaxAdditionalTries = 100; // 최대 반복 횟수 설정  
    int32 TryCount = 0;   
  
    while (Points.Num() < SpawnAmount && TryCount < MaxAdditionalTries)  
    {  
        TryCount++; // 반복 횟수 증가  
  
        float SampleAngle = FMath::RandRange(0.0f, 2.0f * PI);  
        float SampleRadius = FMath::RandRange(MinDistance, SafeRadius);  
        FVector2D RandomDir = FVector2D(FMath::Cos(SampleAngle), FMath::Sin(SampleAngle)) * SampleRadius;  
        FVector NewPoint = FVector(Origin.X + RandomDir.X, Origin.Y + RandomDir.Y, Origin.Z);  
  
        if (FVector::DistSquared(Origin, NewPoint) < MinCenterOffset * MinCenterOffset)  
        {  
            continue; // 중앙 제거 반경 내 생성 방지  
        }  
  
        bool bValid = true;  
        for (const FVector& ExistingPoint : Points)  
        {  
            if (FVector::DistSquared(NewPoint, ExistingPoint) < MinDistance * MinDistance)  
            {  
                bValid = false;  
                break;  
            }  
        }  
  
        if (bValid)  
        {  
            Points.Add(NewPoint);  
        }  
    }  
  
    // 무한 루프 방지 확인  
    if (TryCount >= MaxAdditionalTries)  
    {  
        KY_LOG(LogKY, Warning, TEXT("Failed to generate enough spawn points. 목표 스폰 포인트 개수를 생성하는데 실패하였습니다."));  
    }  
  
    return Points;  
}  
  
  
void AKYSpawnerBase::SpawnCharacter()  
{  
    if (SpawnType == nullptr) return;  
  
    UWorld* World = GetWorld();  
    if (!World) return;  
  
    FVector Origin = SpawnArea->GetComponentLocation();  
    float Radius = SpawnArea->GetScaledSphereRadius();  
  
    TArray<FVector> SpawnLocations = GeneratePoissonDiskSamples(Origin, Radius, MinSpawnDistance, CenterOffset, 50);  
    int CurrentSpawnCount = 0;  
    for (const FVector& SpawnLocation : SpawnLocations)  
    {  
       FRotator SpawnRotation = FRotator::ZeroRotator;  
  
       World->SpawnActor<AKYCharacterNonPlayer>(SpawnType, SpawnLocation, SpawnRotation);  
        CurrentSpawnCount++;  
        if (CurrentSpawnCount >= SpawnAmount) return;  
    }  
}
```

첫번째 스폰 지점을 기준으로 최소거리와 최대 거리내에 랜덤값을 지정하여 새로 생성한다.
이후 생성된 지점이 기존에 저장된 지점들의 일정 반경내에 있다면 해당 점은 제거되고 다시 생성한다.
 이를 MaxTries 만큼 실행하며, 목표 Amount 만큼 생성될 때까지 반복한다.
 생성된 지점들의 벡터를 저장한 TArray 에 FilterByPredicate 함수를 통해서 중앙 오프셋 반경내에 있는 지점들을 필터해주었다.
 만약 필터링 이후 스폰 지점이 부족하다면 스폰 지점을 채울 때까지, 혹은 일정 Tries 만큼 시도하여 부족한 스폰 지점을 채워준다.
 또한 모든 생성을 마치고도 목표 스폰 지점 갯수에 도달하지 못했다면 경고문을 보내어 적절한 반경, 혹은 갯수, 지점간의 거리를 재설정하도록 알려준다.
 성공적으로 반환된 스폰 지점들은 미리 지정해둔 캐릭터 클래스 스폰 액터 트랜스폼에 활용되어 스폰이 진행된다.

## 결과

![[Spawner.gif]]
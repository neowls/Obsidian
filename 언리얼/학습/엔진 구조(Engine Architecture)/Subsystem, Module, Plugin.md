[Subsystems | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/Subsystems/USubsystem) | [Unreal Engine Modules](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules?application_version=5.6) | [Working with Plugins in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/working-with-plugins-in-unreal-engine?application_version=5.7)

# 개요
`Subsystem`, `Module`, `Plugin`은 기능을 어디에 놓을지 결정하는 엔진 구조의 기본 단위다.
프로젝트가 커질수록 단순 actor/component 추가보다 이 세 계층을 구분하는 능력이 중요해진다.

# 핵심 구분
| 개념 | 책임 | 대표 파일 |
| --- | --- | --- |
| `Subsystem` | 특정 lifetime에 맞는 전역성 객체 | `Subsystem.h`, `EngineSubsystem.h`, `WorldSubsystem.h` |
| `Module` | C++ 컴파일/로드 단위 | `[ModuleName].Build.cs`, `IMPLEMENT_MODULE` |
| `Plugin` | 기능 묶음과 배포 단위 | `.uplugin`, `Source`, `Content`, `Config` |

# Subsystem
Subsystem은 직접 singleton을 만들지 않고도 엔진 lifetime에 붙는 서비스를 만드는 방식이다.
어떤 outer에 붙는지에 따라 생성/소멸 시점이 달라진다.

| 종류 | lifetime | 사용 예 |
| --- | --- | --- |
| `UEngineSubsystem` | 엔진 전체 | 엔진 단위 서비스, 전역 툴 |
| `UGameInstanceSubsystem` | game instance | 세션, 계정, 저장 관리 |
| `UWorldSubsystem` | world | 월드별 매니저, 런타임 시스템 |
| `ULocalPlayerSubsystem` | local player | 입력, UI, 플레이어별 상태 |
| `UEditorSubsystem` | editor | 에디터 툴, 에셋 작업 |
| `UDynamicSubsystem` | 모듈 로드/언로드와 연동 | 플러그인 기반 확장 |

> [!caution]
> `ShouldCreateSubsystem()`을 override하면 특정 환경에서 subsystem이 없을 수 있다. 가져오는 쪽은 항상 null 가능성을 고려해야 한다.

# Module
Module은 Unreal Build Tool이 인식하는 C++ 빌드 단위다.
`Build.cs`는 include 경로, dependency, PCH, precompile 정책을 결정한다.

## Public / Private dependency 감각
| 위치 | 의미 |
| --- | --- |
| `PublicDependencyModuleNames` | 이 모듈의 public header가 노출하는 타입에 필요 |
| `PrivateDependencyModuleNames` | cpp 또는 private header 안에서만 필요 |
| `Public` 폴더 | 외부 모듈이 include할 수 있는 API |
| `Private` 폴더 | 모듈 내부 구현 |

> [!tip]
> dependency는 작게 잡는 것이 좋다. public header에 타입을 노출하지 않는다면 private dependency로 두는 편이 빌드 경계를 깨끗하게 유지한다.

# Plugin
Plugin은 module, content, config, editor 기능을 하나로 묶는 단위다.
엔진 플러그인과 프로젝트 플러그인을 구분하고, runtime/editor module을 분리하는 것이 중요하다.

| 항목 | 확인할 것 |
| --- | --- |
| `.uplugin` | enabled by default, module type, loading phase |
| `Source` | runtime/editor/developer 모듈 분리 |
| `Content` | plugin content 포함 여부 |
| `Config` | plugin 설정 기본값 |
| dependency | 다른 plugin 또는 module 의존성 |

# 설계 기준
- 특정 월드마다 하나씩 있어야 하면 `UWorldSubsystem`을 우선 검토한다.
- 프로젝트 실행 전체에서 하나면 `UGameInstanceSubsystem`을 검토한다.
- 에디터 도구면 runtime module에 넣지 말고 editor module로 분리한다.
- 여러 프로젝트에서 재사용할 기능이면 plugin으로 분리한다.
- 기능이 public API를 노출하지 않으면 private module dependency로 시작한다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Public\Subsystems\Subsystem.h`: `USubsystem`, `ShouldCreateSubsystem()` 기본 구조.
- `Engine\Source\Runtime\Engine\Public\Subsystems\SubsystemCollection.h`: subsystem 생성/보관 컬렉션.
- `Engine\Source\Runtime\Engine\Public\Subsystems\WorldSubsystem.h`: world lifetime subsystem.
- `Engine\Source\Runtime\Core\Public\Modules\ModuleManager.h`: `IMPLEMENT_MODULE`, `IMPLEMENT_PRIMARY_GAME_MODULE`.
- `Engine\Source\Programs\UnrealBuildTool\Configuration\ModuleRules.cs`: `Build.cs`에서 사용하는 `ModuleRules` 정의.

## 심화 보강: Subsystem, Module, Plugin을 실제 설계에 적용하기

### 학습 목표

- Subsystem, Module, Plugin이 각각 해결하는 문제가 무엇인지 구분한다.
- 게임 기능을 어디에 두어야 유지보수와 로딩 순서가 안정적인지 판단한다.
- 엔진 코드 기준으로 Subsystem이 언제 생성되고 Module이 어떻게 로드되는지 이해한다.

### 세 개념의 역할

Subsystem은 특정 수명 주기에 붙는 서비스 객체다. 예를 들어 `UGameInstanceSubsystem`은 게임 인스턴스가 살아 있는 동안 유지되고, `UWorldSubsystem`은 월드별로 생성된다. 그러므로 매니저 싱글턴이 필요한데 수명 주기를 엔진이 관리해주면 좋겠다는 경우 Subsystem이 적합하다.

Module은 C++ 코드의 빌드/로드 단위다. Runtime 모듈, Editor 모듈, Developer 모듈처럼 목적에 따라 분리할 수 있다. Module을 잘 나누면 에디터 전용 코드가 패키지 빌드에 섞이는 문제를 줄일 수 있다.

Plugin은 여러 Module과 리소스, 설정, 에디터 확장을 하나의 배포 단위로 묶는다. 팀 내부 공용 전투 시스템, 툴, 플랫폼 연동 기능처럼 프로젝트 밖에서도 재사용할 가능성이 있으면 Plugin을 고려한다.

### 선택 기준

- 게임 실행 중 계속 접근하는 서비스: Subsystem.
- 컴파일 의존성과 로딩 단위를 나눠야 하는 코드: Module.
- 여러 프로젝트에서 재사용하거나 켜고 끌 수 있는 기능 묶음: Plugin.
- 에디터 UI, 커스텀 애셋 액션, 디테일 패널: Editor Module 또는 Editor Plugin.
- SaveGame, Inventory, Matchmaking처럼 런타임에 필요한 게임 서비스: GameInstanceSubsystem 또는 WorldSubsystem.

### GameInstanceSubsystem 예시

```cpp
UCLASS()
class UInventoryServiceSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    void RegisterItemDefinition(FName ItemId, TObjectPtr<UPrimaryDataAsset> ItemData);
    const UPrimaryDataAsset* FindItemDefinition(FName ItemId) const;

private:
    UPROPERTY()
    TMap<FName, TObjectPtr<UPrimaryDataAsset>> ItemDefinitions;
};
```

```cpp
void UInventoryServiceSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    // AssetManager에서 PrimaryAsset을 조회하거나 프로젝트 설정을 읽어 초기화한다.
}

const UPrimaryDataAsset* UInventoryServiceSubsystem::FindItemDefinition(FName ItemId) const
{
    return ItemDefinitions.FindRef(ItemId);
}
```

사용하는 쪽에서는 직접 싱글턴을 만들지 않고 수명 주기 소유자에서 가져온다.

```cpp
UInventoryServiceSubsystem* InventoryService = GetGameInstance()->GetSubsystem<UInventoryServiceSubsystem>();
```

이 방식은 PIE 여러 인스턴스, 서버/클라이언트 월드, 맵 전환에서 직접 만든 static 싱글턴보다 안전하다.

### WorldSubsystem 예시

`UWorldSubsystem`은 월드마다 상태가 달라야 할 때 유리하다. 예를 들어 월드별 AI Director, 날씨, 지역 이벤트 관리자는 GameInstance 하나에 묶기보다 WorldSubsystem으로 두는 편이 자연스럽다.

```cpp
UCLASS()
class UEncounterWorldSubsystem : public UWorldSubsystem
{
    GENERATED_BODY()

public:
    virtual bool ShouldCreateSubsystem(UObject* Outer) const override;
    void RequestEncounter(FName EncounterId, const FVector& Location);
};
```

```cpp
bool UEncounterWorldSubsystem::ShouldCreateSubsystem(UObject* Outer) const
{
    const UWorld* World = Cast<UWorld>(Outer);
    return World && World->IsGameWorld();
}
```

`ShouldCreateSubsystem`을 사용하면 에디터 프리뷰 월드나 커맨드렛에서 불필요한 시스템이 뜨는 것을 막을 수 있다.

### 엔진에서 Subsystem이 만들어지는 원리

`Engine\Source\Runtime\Engine\Private\Subsystems\SubsystemCollection.cpp`를 보면 `FSubsystemCollectionBase::Initialize`가 Subsystem 클래스를 수집하고 `AddAndInitializeSubsystem`에서 실제 객체를 생성한다. 생성 전에는 `ShouldCreateSubsystem`을 확인하고, 생성 후 `Initialize`를 호출한다.

즉 Subsystem은 마법처럼 전역으로 떠 있는 객체가 아니라, 특정 Outer(GameInstance, World, Engine 등)를 가진 UObject다. 그래서 GC, PIE, 월드 전환의 규칙을 따른다. Subsystem 내부에 월드 액터 포인터를 잡아둘 때는 월드가 바뀌거나 액터가 Destroy될 수 있다는 점을 고려해야 한다.

### Module 작성 예시

```csharp
public class MyGameplayRuntime : ModuleRules
{
    public MyGameplayRuntime(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine"
        });

        PrivateDependencyModuleNames.AddRange(new string[]
        {
            "GameplayTags",
            "GameplayTasks",
            "GameplayAbilities"
        });
    }
}
```

Module의 `.Build.cs`는 단순히 라이브러리를 나열하는 파일이 아니다. Public dependency에 넣은 모듈은 이 모듈을 참조하는 다른 모듈의 컴파일 환경에도 노출된다. Private dependency는 내부 구현에서만 필요할 때 사용한다. 불필요하게 Public으로 올리면 전체 빌드 의존성이 커진다.

### 엔진에서 Module이 로드되는 원리

`FModuleManager::LoadModule`은 모듈 이름으로 DLL/동적 모듈을 찾고 로드한다. 모듈 구현 파일에는 보통 `IMPLEMENT_MODULE(FMyModule, MyModuleName)` 매크로가 있으며, 이 매크로가 엔진에게 모듈 생성 함수를 제공한다.

흐름을 단순화하면 다음과 같다.

1. `.uproject`, `.uplugin`, Target, Build.cs에서 모듈 목록과 타입이 결정된다.
2. 빌드 시 UBT가 모듈별 컴파일 단위를 만든다.
3. 런타임이나 에디터 시작 시 ModuleManager가 필요한 모듈을 로드한다.
4. 모듈 객체의 `StartupModule`이 호출된다.
5. 종료 시 `ShutdownModule`에서 등록한 delegate, style, asset action 등을 해제한다.

### Plugin 설계 사례

팀 공용 Interaction System을 만든다고 가정한다.

- `InteractionRuntime` 모듈: 런타임 컴포넌트, 인터페이스, GameplayTag, 네트워크 로직.
- `InteractionEditor` 모듈: 커스텀 디테일 패널, 디버그 시각화, 에디터 검증 버튼.
- `Content` 폴더: 기본 위젯, 아이콘, 예제 DataAsset.
- `Config` 폴더: 기본 collision channel, gameplay tag 설정.

패키지 빌드에서 에디터 모듈이 들어가면 안 되므로 `.uplugin`의 모듈 타입을 명확히 나눈다. Runtime 모듈이 Editor 모듈을 참조하는 구조는 피한다. 반대로 Editor 모듈이 Runtime 모듈의 타입을 참조하는 것은 일반적이다.

### 자주 막히는 문제

- Subsystem이 생성되지 않는다: Outer 수명 주기, `ShouldCreateSubsystem`, 모듈 로딩 여부를 확인한다.
- PIE에서는 되는데 패키지에서 안 된다: Editor 모듈에 런타임 코드가 들어갔거나 플러그인 모듈 타입이 잘못되었을 수 있다.
- 순환 의존성 빌드 오류: Build.cs의 Public/Private dependency를 다시 분리한다.
- `StartupModule`에서 UObject를 너무 일찍 만진다: 엔진 초기화 단계와 AssetRegistry 준비 시점을 확인한다.
- `ShutdownModule`에서 크래시가 난다: 등록한 delegate, style set, menu extender를 해제했는지 확인한다.

### 실습 과제

1. `UGameInstanceSubsystem`으로 간단한 Item Registry를 만든다.
2. 같은 기능을 static singleton으로 만든 뒤 PIE 2개 인스턴스에서 상태가 섞이는지 비교한다.
3. Runtime 모듈과 Editor 모듈을 분리한 플러그인을 만들고 패키지 빌드를 수행한다.
4. 일부 dependency를 Public에서 Private으로 옮겨 컴파일 영향 범위를 확인한다.

### 부가 자료

- 공식 문서: Programming Subsystems, Unreal Engine Modules, Plugins.
- 엔진 소스: `Engine\Source\Runtime\Engine\Private\Subsystems\SubsystemCollection.cpp`.
- 엔진 소스: `Engine\Source\Runtime\Core\Private\Modules\ModuleManager.cpp`.
- 엔진 헤더: `Engine\Source\Runtime\Core\Public\Modules\ModuleManager.h`.

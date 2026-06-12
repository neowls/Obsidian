---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/lifecycle
  - type/learning
---

# UE 5.7 엔진 생명주기 학습자료

> [!summary] 요약
> UE 5.7 엔진 생명주기 학습자료는 Unreal Engine의 초기화, 모듈(Module), 서브시스템(Subsystem), 객체 생명주기처럼 기반 구조를 이해하기 위한 주제다.
> 기능이 어느 시점에 생성되고 어떤 계층이 책임지는지 판단할 때 사용한다.
> 핵심은 editor/runtime, engine/world/game instance, module/subsystem의 lifetime 차이를 구분하는 것이다.

## 핵심 결론

- 엔진 기반 구조는 "어디에 둘 것인가"보다 "언제 만들어지고 언제 사라지는가"가 먼저다.
- Module, Plugin, Subsystem, UObject는 책임과 lifetime 범위가 다르다.
- 문제가 생기면 초기화 순서, world context, subsystem 종류, module loading phase를 확인한다.

## 개요

작성일: 2026-04-15
분석 기준:
- 설치된 엔진 소스: `C:\Program Files\Epic Games\UE_5.7`
- 로컬 소스 기준 버전: Unreal Engine 5.7
- 공식 문서: Epic Developer Community의 UE 5.5~5.7 문서 및 API 페이지

이 문서에서 말하는 "언리얼 엔진의 생명주기"는 한 가지가 아니다. 실제로는 아래 4개 축이 겹쳐서 돌아간다.

1. 프로세스/엔진 루프 생명주기: 프로그램 시작 -> 엔진 초기화 -> 프레임 루프 -> 종료
2. 게임 세션 생명주기: `UGameInstance` -> `UWorld` -> `GameMode` -> 플레이어 생성 -> 플레이 시작
3. 액터 생명주기: 디스크 로드 / PIE 복제(Replication) / 런타임 스폰 -> 초기화 -> `BeginPlay` -> `EndPlay` -> GC
4. UObject 생명주기: `NewObject`/로딩 -> `PostInitProperties`/`PostLoad` -> 사용 -> `BeginDestroy` -> `FinishDestroy`

핵심은 다음 한 문장으로 요약할 수 있다.

> 언리얼은 "프로세스가 엔진을 띄우고, 엔진이 월드를 만들고, 월드가 액터를 준비시키고, BeginPlay 이후 틱과 GC가 계속 돌다가, 종료 시 EndPlay와 Cleanup을 거쳐 객체를 회수하는 구조"로 움직인다.

---

## 왜 필요한가

기반 구조를 잘못 고르면 코드가 우연히 동작하다가 PIE, packaged build, map travel에서 깨진다. UE 5.7 엔진 생명주기 학습자료를 볼 때는 기능의 소유자와 lifetime을 먼저 결정해야 한다.

## 작동 모델

엔진은 module과 plugin을 로딩해 기능을 등록하고, GameInstance, World, LocalPlayer 같은 계층별 subsystem을 생성한다. UObject lifetime은 outer와 GC에 의해 관리되고, editor와 runtime은 초기화 순서와 사용 가능한 world context가 다르다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| Module / Plugin | 코드 로딩과 기능 배포 단위 | loading phase, dependency |
| Subsystem | 계층별 서비스(Service) 객체 | engine/gameinstance/world/localplayer |
| UObject / Outer | 객체 lifetime과 소유 관계 | outer, GC reference |
| World Context | PIE/editor/runtime world 식별 | current world, net mode |
| Lifecycle hook | 초기화와 종료 지점 | init, start, deinitialize |

## 실행 흐름

1. 엔진이 module loading phase에 따라 plugin/module을 로드한다.
2. 프로젝트와 world가 열리면서 GameInstance, World, Actor 계층이 준비된다.
3. 각 계층의 subsystem과 UObject가 outer/lifetime 규칙에 따라 생성된다.
4. 기능 코드는 자신이 의존하는 world, asset, subsystem이 준비된 뒤 실행되어야 한다.
5. map travel, PIE 종료, module unload 시점에 참조와 delegate를 정리한다.

## 1. 한눈에 보는 전체 흐름

### 1.1 실행 파일 기준 전체 흐름

```text
WinMain
 -> LaunchWindowsStartup
 -> GuardedMain
    -> EnginePreInit
       -> GEngineLoop.PreInit
    -> EngineInit 또는 EditorInit
       -> GEngineLoop.Init
       -> GEngine 생성
       -> UGameEngine::Init
          -> UGameInstance 생성 및 InitializeStandalone
       -> UGameEngine::Start
          -> UGameInstance::StartGameInstance
             -> UEngine::Browse
             -> UEngine::LoadMap
                -> UWorld::InitWorld
                -> SetGameMode
                -> CreateAISystem
                -> InitializeActorsForPlay
                -> SpawnPlayActor(LocalPlayers)
                -> UWorld::BeginPlay
                   -> GameModeBase::StartPlay
                   -> GameStateBase::HandleBeginPlay
                   -> WorldSettings::NotifyBeginPlay
                      -> 각 Actor DispatchBeginPlay
    -> while (!IsEngineExitRequested())
       -> GEngineLoop.Tick
          -> GEngine->Tick
             -> UGameEngine::Tick
                -> UWorld::Tick
    -> EngineExit
       -> GEngineLoop.Exit
```

### 1.2 월드/액터 중심 흐름

```text
LoadMap
 -> InitWorld
 -> SetGameMode
 -> InitializeActorsForPlay
    -> Level::InitializeNetworkActors
    -> GameMode::InitGame
    -> Level::RouteActorInitialize
       -> PreInitializeComponents
       -> InitializeComponents
       -> PostInitializeComponents
 -> SpawnPlayActor(로컬 플레이어)
 -> World::BeginPlay
    -> GameModeBase::StartPlay
    -> GameStateBase::HandleBeginPlay
    -> WorldSettings::NotifyBeginPlay
       -> 모든 Actor::DispatchBeginPlay
          -> Actor::BeginPlay
             -> Component::BeginPlay
 -> Tick 루프
 -> EndPlay
 -> CleanupWorld
 -> GC
```

### 1.3 UObject 기준 흐름

```text
NewObject / StaticConstructObject_Internal
 -> C++ 생성자
 -> PostInitProperties
 -> 사용

또는

패키지 로드
 -> ConditionalPostLoad
 -> PostLoad
 -> 사용

파괴 단계
 -> ConditionalBeginDestroy
 -> BeginDestroy
 -> IsReadyForFinishDestroy
 -> ConditionalFinishDestroy
 -> FinishDestroy
 -> 메모리 해제
```

---

## 2. 공식 문서 기준 정리

공식 문서는 "엔진 루프", "게임 세션", "액터", "UObject/GC"를 각각 다른 문서에서 설명한다. 이 문서에서는 그 내용을 하나의 학습 흐름으로 다시 묶는다.

### 2.1 게임 세션 축

- `UGameInstance` 공식 API 문서는 `GameInstance`를 "실행 중인 게임 인스턴스의 고수준 매니저"로 설명하며, 게임 생성 시 만들어지고 종료 시점까지 유지된다고 적는다. Standalone에서는 1개, PIE에서는 PIE 인스턴스마다 1개가 생긴다.
- `UGameEngine::Start` 공식 API 문서는 Start가 Init과 분리되어 있으며, 후초기화 구성을 마친 뒤 게임을 실제로 시작하는 단계라고 설명한다.
- `AGameModeBase` 공식 API 문서는 GameMode가 서버에서만 인스턴스화되며, 레벨이 게임플레이용으로 초기화될 때 `UGameEngine::LoadMap()` 안에서 만들어진다고 설명한다.

이 세 문서를 합치면 공식 관점의 큰 그림은 다음과 같다.

1. 엔진이 먼저 초기화된다.
2. 그다음 게임 세션 관리자(`UGameInstance`)가 준비된다.
3. 맵 로드 시 월드와 GameMode가 실제 플레이용으로 세팅된다.
4. 그 이후에 플레이어와 액터가 본격적으로 플레이 상태로 진입한다.

### 2.2 액터 축

Epic의 [Actor Lifecycle](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-actor-lifecycle) 문서는 액터 생명주기를 네 갈래로 정리한다.

1. Load From Disk
2. Play In Editor
3. Spawning
4. Deferred Spawn

특히 중요한 공식 포인트는 아래와 같다.

- 디스크에서 로드된 액터는 `PostLoad`를 탄다.
- 런타임 스폰된 액터는 `PostActorCreated`를 탄다.
- `PostLoad`와 `PostActorCreated`는 상호 배타적이다.
- 초기화 공통 단계로 `PreInitializeComponents -> InitializeComponent -> PostInitializeComponents -> BeginPlay`가 있다.
- 액터 제거는 `Destroy` 호출 시점이 아니라, `PendingKill` 표시 후 GC가 실제 메모리를 회수하는 시점에 완료된다.
- `OnDestroyed`보다 `EndPlay`에 정리 로직을 두는 쪽이 안전하다.

즉, 액터 관점에서 "생성"은 하나가 아니라 "어떻게 월드에 들어왔는가"에 따라 진입 훅이 달라진다.

### 2.3 UObject 축

Epic의 [Unreal Object Handling](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine?application_version=5.6) 문서는 UObject 시스템의 핵심 자동화를 설명한다.

- `UObject`는 생성 시 생성자 호출 전에 메모리가 0으로 초기화된다.
- 리플렉션이 보이는 참조(`UPROPERTY`, UE 컨테이너)는 액터/컴포넌트가 제거될 때 자동으로 null 처리될 수 있다.
- GC는 root set에서 시작해 참조 그래프를 따라 도달 가능한 객체를 살리고, 나머지를 회수한다.
- 액터는 보통 `Destroy()`로 제거 의도를 표시하고, 실제 메모리 회수는 GC 단계에서 일어난다.

즉, UObject 생명주기는 일반 C++ 객체의 `new/delete` 감각으로 보면 안 된다.
언리얼의 객체는 "리플렉션 시스템 + 로더 + GC + 게임플레이 훅"이 결합된 관리 객체다.

---

## 3. UE 5.7 소스 기준 상세 분석

이제부터는 설치된 UE 5.7 소스의 실제 호출 흐름을 따라간다.

### 3.1 Windows 엔트리포인트 -> Launch 계층

Windows 시작점은 `WinMain`이다.

- `Engine/Source/Runtime/Launch/Private/Windows/LaunchWindows.cpp:315-336`
  - `WinMain` -> `LaunchWindowsStartup(...)` -> 종료 시 `LaunchWindowsShutdown()`

실제 엔진 부트스트랩은 `Launch.cpp`의 `GuardedMain`이 담당한다.

- `Engine/Source/Runtime/Launch/Private/Launch.cpp:38-71`
  - `EnginePreInit()` -> `GEngineLoop.PreInit()`
  - `EngineInit()` -> `GEngineLoop.Init()`
  - `EngineTick()` -> `GEngineLoop.Tick()`
  - `EngineExit()` -> `GEngineLoop.Exit()`

- `Engine/Source/Runtime/Launch/Private/Launch.cpp:87-204`
  - `GuardedMain()`에서
    - `EnginePreInit(CmdLine)`
    - `EditorInit(GEngineLoop)` 또는 `EngineInit()`
    - `while (!IsEngineExitRequested()) EngineTick();`
    - 스코프 종료 시 `EngineExit()` 보장

정리하면, 운영체제 입장에서 언리얼은 결국 아래처럼 보인다.

```text
OS -> WinMain -> GuardedMain -> GEngineLoop.PreInit/Init/Tick/Exit
```

### 3.2 `FEngineLoop`가 엔진 인스턴스를 만드는 단계

`FEngineLoop::Init()`은 실제 `GEngine` 객체를 선택하고 만든다.

- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:4682-4728`
  - 게임 모드라면 설정에서 `GameEngine` 클래스를 읽고
  - `GEngine = NewObject<UEngine>(GetTransientPackage(), EngineClass);`
  - 에디터라면 `UUnrealEdEngine` 계열을 만든다

즉, `FEngineLoop`는 단순히 루프만 도는 게 아니라, **어떤 엔진 구현체를 쓸지 결정하는 부트스트랩 레이어**다.

### 3.3 `UGameEngine::Init`에서 `UGameInstance`가 생긴다

- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1205-1252`
  - `UGameEngine::Init()`은 먼저 `UEngine::Init()`을 호출한다
  - 이후 `GameInstanceClass`를 로드한다
  - `GameInstance = NewObject<UGameInstance>(this, GameInstanceClass);`
  - `GameInstance->InitializeStandalone();`

- `Engine/Source/Runtime/Engine/Private/GameInstance.cpp:96-129`
  - `UGameInstance::Init()`에서
    - `ReceiveInit()`
    - 온라인 세션/입력/네트워크 delegate 등록
    - `SubsystemCollection.Initialize(this)`

즉, `UGameInstance`는 맵보다 먼저 생기며, 게임 세션 전체를 잡는 뼈대다.
월드가 바뀌어도 GameInstance는 보통 유지되고, 월드 컨텍스트와 로컬 플레이어, 세션 객체를 붙잡는다.

### 3.4 `UGameEngine::Start`는 "진짜 게임 시작" 단계다

- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1317-1323`
  - `UGameEngine::Start()`는 로그를 찍고
  - `GameInstance->StartGameInstance();`

- `Engine/Source/Runtime/Engine/Private/GameInstance.cpp:625-733`
  - `UGameInstance::StartGameInstance()`는
    - 기본 URL을 구성하고
    - 커맨드라인 override를 처리하고
    - replay 옵션 등을 본 뒤
    - 최종적으로 `Engine->Browse(...)`로 진입한다

여기서 중요한 감각은 이렇다.

- `Init`은 엔진 객체와 세션 객체를 준비하는 단계
- `Start`는 실제로 "첫 월드로 들어가는 단계"

### 3.5 `Browse`와 `LoadMap`이 월드 생명주기를 시작한다

#### 3.5.1 Browse

- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:15282-15363`
  - `UEngine::Browse()`는 URL 유효성 검사
  - travel failure 처리
  - pending net game 정리/생성
  - 최종적으로 `LoadMap`으로 연결되는 여행(travel) 진입점 역할

`Browse`는 "어디로 갈지 결정하는 단계"다.
실제 월드 생성/교체는 `LoadMap`에서 일어난다.

#### 3.5.2 LoadMap 핵심 시퀀스

`UEngine::LoadMap()`은 언리얼 게임플레이 생명주기의 중심축이다.

- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:15706-15787`
  - `PreLoadMap` delegate
  - 스트리밍/기존 패키지 정리
  - 맵 로드 준비

- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:16145-16279`
  - `World()->AddToRoot()`
  - `World()->InitWorld()`
  - `World()->SetGameMode(URL)`
  - `World()->CreateAISystem()`
  - `World()->InitializeActorsForPlay(URL, true, &Context)`
  - 로컬 플레이어용 `SpawnPlayActor`
  - `World()->BeginPlay()`

이 순서는 실무적으로 매우 중요하다.

```text
LoadMap
 -> InitWorld
 -> SetGameMode
 -> CreateAISystem
 -> InitializeActorsForPlay
 -> SpawnPlayActor
 -> BeginPlay
```

즉, 액터들의 컴포넌트 초기화와 GameMode 준비는 `BeginPlay`보다 먼저 끝나야 한다.

### 3.6 `UWorld::InitializeActorsForPlay`는 "플레이 시작 직전의 대규모 정렬"이다

- `Engine/Source/Runtime/Engine/Private/World.cpp:5842-5900`
  - 시간값 리셋
  - URL 옵션 세팅
  - `UpdateWorldComponents(...)`
  - "Bringing world up for play" 로그 출력

- `Engine/Source/Runtime/Engine/Private/World.cpp:5903-5934`
  - 각 레벨에 대해 `Level->InitializeNetworkActors()`
  - `bStartup = true`, `bActorsInitialized = true`
  - 서버라면 `SpawnServerActors(this)`
  - `AuthorityGameMode->InitGame(...)`
  - 각 레벨에 대해 `Level->RouteActorInitialize(...)`

즉, `InitializeActorsForPlay`는 단순히 액터 몇 개 켜는 함수가 아니라 아래 작업을 묶는다.

1. 월드 컴포넌트 등록
2. 네트워크 역할 세팅
3. 서버 액터 생성
4. GameMode 초기화
5. 액터 컴포넌트 초기화 루프 라우팅

### 3.7 `BeginPlay`는 `UWorld`가 직접 각 액터를 돌리는 것이 아니라, `GameMode -> GameState -> WorldSettings` 체인으로 라우팅된다

여기서 많은 사람이 한 번 헷갈린다.
`UWorld::BeginPlay()`가 곧바로 모든 액터에 `BeginPlay()`를 호출하는 구조가 아니다.

#### 3.7.1 `UWorld::BeginPlay`

- `Engine/Source/Runtime/Engine/Private/World.cpp:6044-6078`
  - 월드 서브시스템 `OnWorldBeginPlay`
  - `GameMode->StartPlay()`
  - `AISystem->StartPlay()`
  - `OnWorldBeginPlay.Broadcast()`
  - 물리 씬 `OnWorldBeginPlay()`

#### 3.7.2 `AGameModeBase::StartPlay`

- `Engine/Source/Runtime/Engine/Private/GameModeBase.cpp:204-207`
  - `GameState->HandleBeginPlay();`

#### 3.7.3 `AGameStateBase::HandleBeginPlay`

- `Engine/Source/Runtime/Engine/Private/GameStateBase.cpp:205-210`
  - `bReplicatedHasBegunPlay = true;`
  - `GetWorldSettings()->NotifyBeginPlay();`
  - `GetWorldSettings()->NotifyMatchStarted();`

#### 3.7.4 `AWorldSettings::NotifyBeginPlay`

- `Engine/Source/Runtime/Engine/Private/WorldSettings.cpp:353-368`
  - 월드가 아직 `BegunPlay`가 아니면
  - 전체 액터를 순회하면서 `DispatchBeginPlay()`
  - 마지막에 `World->SetBegunPlay(true);`

즉, 초기 `BeginPlay` 실제 라우팅 체인은 다음과 같다.

```text
UWorld::BeginPlay
 -> AGameModeBase::StartPlay
 -> AGameStateBase::HandleBeginPlay
 -> AWorldSettings::NotifyBeginPlay
 -> for (모든 Actor) DispatchBeginPlay
    -> AActor::BeginPlay
```

이 체인을 알아두면 다음 질문에 답할 수 있다.

- 왜 서버와 클라이언트에서 `BeginPlay` 타이밍이 조금 달라질 수 있나?
- 왜 `GameMode`는 서버에만 존재하는가?
- 왜 월드 전체 `BeginPlay` 진입점이 `WorldSettings`에 숨어 있는가?

### 3.8 `AActor::BeginPlay`는 컴포넌트 BeginPlay와 Tick 등록까지 담당한다

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4753-4794`
  - `SetLifeSpan(InitialLifeSpan)`
  - `RegisterAllActorTickFunctions(true, false)`
  - 모든 컴포넌트 순회
    - 등록된 컴포넌트면 tick 함수 등록
    - `Component->BeginPlay()`
  - `ReceiveBeginPlay()`
  - 상태를 `HasBegunPlay`로 변경

즉, 액터 `BeginPlay`는 "블루프린트 이벤트 하나"가 아니라,

1. 수명 설정
2. 액터 틱 등록
3. 컴포넌트 BeginPlay 전파
4. Blueprint `ReceiveBeginPlay`

를 모두 묶는 실제 런타임 진입점이다.

### 3.9 프레임 루프: `FEngineLoop::Tick -> UGameEngine::Tick -> UWorld::Tick`

#### 3.9.1 엔진 루프 틱

- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:5536-5582`
  - 종료 요청 체크
  - heartbeat
  - hotfixables
  - 렌더링 tickable 처리 등 프레임 준비

- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:5825-5829`
  - `GEngine->Tick(FApp::GetDeltaTime(), bIdleMode);`

#### 3.9.2 게임 엔진 틱

- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1867-1934`
  - 각 WorldContext에 대해
    - `TickWorldTravel(Context, DeltaSeconds)`
    - `Context.World()->Tick(LEVELTICK_All, DeltaSeconds)`
    - reflection capture / streaming / map change 처리

즉, `UGameEngine::Tick`는 여러 월드 컨텍스트를 돌리는 관리자 계층이다.

#### 3.9.3 월드 틱

월드 틱 구현은 `World.cpp`가 아니라 `LevelTick.cpp`에 있다.

- `Engine/Source/Runtime/Engine/Private/LevelTick.cpp:1477-1552`
  - `UWorld::Tick`
  - `OnWorldTickStart`
  - 네트워크 dispatch
  - 클라이언트 net tick

- `Engine/Source/Runtime/Engine/Private/LevelTick.cpp:1711-1857`
  - `FTickTaskManagerInterface::Get().StartFrame(...)`
  - `RunTickGroup(TG_PrePhysics)`
  - `RunTickGroup(TG_StartPhysics)`
  - `RunTickGroup(TG_DuringPhysics, false)`
  - `RunTickGroup(TG_EndPhysics)`
  - `RunTickGroup(TG_PostPhysics)`
  - `CurrentLatentActionManager.ProcessLatentActions(...)`
  - `GetTimerManager().Tick(DeltaSeconds)`
  - `FTickableGameObject::TickObjects(...)`
  - 카메라 업데이트
  - 스트리밍 상태 업데이트
  - `RunTickGroup(TG_PostUpdateWork)`
  - `RunTickGroup(TG_LastDemotable)`
  - `EndFrame()`

이 구조 때문에 언리얼의 "한 프레임"은 단순한 for-loop가 아니라 **tick group 기반 파이프라인**이다.

### 3.10 종료 루프

#### 3.10.1 GameEngine 종료 준비

- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1325-1368`
  - `UGameEngine::PreExit()`
  - 각 월드에 대해
    - `World->BeginTearingDown()`
    - 네트워크 종료
    - 스트리밍 강제 unload
    - `World->EndPlay(EEndPlayReason::Quit)`
    - `World->GetGameInstance()->Shutdown()`
    - `World->CleanupWorld()`

#### 3.10.2 엔진 루프 종료

- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:4919-4965`
  - `FEngineLoop::Exit()`
  - `GIsRunning = 0`
  - 프리로드 스크린 정리
  - visual logger / asset compiling / messaging / trace service 종료
  - 엔진 전역 서비스 해제

즉, 종료는 "프로세스가 죽는다"로 끝나지 않는다.
언리얼은 종료 직전에도 월드, 네트워크, 서브시스템, 전역 서비스, 로딩 화면, 컴파일러 매니저를 순서대로 정리한다.

---

## 4. 액터 생명주기 상세 분석

공식 문서와 소스 코드를 합쳐서 보면 액터는 3개의 대표 진입 경로를 가진다.

1. 디스크 로드
2. PIE 복제
3. 런타임 스폰

### 4.1 디스크 로드 경로

공식 문서의 요약:

- 패키지/레벨에서 액터가 로드된다
- `PostLoad`
- `InitializeActorsForPlay`
- `RouteActorInitialize`
- `BeginPlay`

소스 기준 근거:

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:1103-1144`
  - `AActor::PostLoad()`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1341-1412`
  - `UObject::ConditionalPostLoad()` 내부에서 최종적으로 `PostLoad()` 호출
- `Engine/Source/Runtime/Engine/Private/World.cpp:5903-5934`
  - `InitializeNetworkActors`
  - `RouteActorInitialize`
- `Engine/Source/Runtime/Engine/Private/Level.cpp:3817-3908`
  - `PreInitializeComponents`
  - `InitializeComponents`
  - `PostInitializeComponents`
  - 월드가 이미 begun play 상태면 `DispatchBeginPlay`

실무 해석:

- 레벨에 배치되어 저장된 액터는 생성자가 핵심이 아니라 `PostLoad()`가 핵심이다.
- 버전 업 대응, 옛 데이터 보정, 직렬화 후 fixup은 `PostLoad()`에서 한다.
- 하지만 월드/플레이 상태에 의존하는 로직을 `PostLoad()`에 넣으면 위험하다. 아직 플레이 시작 전일 수 있다.

### 4.2 PIE 경로

공식 문서상 PIE는 디스크 로드 대신 "에디터 월드에서 복제"가 일어난다.

- 에디터 액터를 새 PIE 월드로 duplicate
- `UObject::PostDuplicate`
- `InitializeActorsForPlay`
- `RouteActorInitialize`
- `BeginPlay`

실무 해석:

- PIE는 "에디터 데이터의 런타임 복제"에 가깝다.
- 에디터 상태를 들고 온 뒤 플레이용 월드로 다시 준비시키는 경로이므로
  - editor-only 상태
  - transient 상태
  - construction script 결과
  를 섞어 생각하면 쉽게 헷갈린다.

따라서 PIE 버그를 볼 때는 항상 질문을 바꿔야 한다.

- 이 액터는 "로드된 것"인가?
- "복제된 것"인가?
- "스폰된 것"인가?

### 4.3 스폰 경로

스폰 경로는 액터 생명주기에서 가장 실무성이 높다.

#### 4.3.1 `PostSpawnInitialize`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4249-4310`
  - 소스 주석이 직접 전체 흐름을 정리한다
  - 기본 정보 세팅
  - Owner / Instigator / NetRole 세팅
  - 루트 컴포넌트 transform 적용
  - 기본(native) 컴포넌트 생성/등록

이 함수의 주석은 사실상 스폰 라이프사이클의 공식 코드 버전 요약이다.

```text
PostSpawnInitialize
 -> PreInitializeComponents
 -> construction
 -> components OnComponentCreated
 -> InitializeComponent
 -> PostInitializeComponents
```

#### 4.3.2 `FinishSpawning`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4347-4399`
  - deferred spawn이면 여기서 마무리된다
  - `ExecuteConstruction(...)`
  - `PostActorConstruction()`
  - `World->OnActorFinishedSpawning(this)`

#### 4.3.3 `ExecuteConstruction` / `OnConstruction`

- `Engine/Source/Runtime/Engine/Private/ActorConstruction.cpp:816-862`
  - 블루프린트 계층 구성 및 construction script 실행 준비
- `Engine/Source/Runtime/Engine/Private/ActorConstruction.cpp:995-1005`
  - `ProcessUserConstructionScript()`
  - `OnConstruction(Transform)`

즉, Construction 단계는 단순히 BP 노드를 한 번 돌리는 게 아니라,

1. 클래스 계층별 construction script 실행
2. 컴포넌트 재구성
3. 이후 `OnConstruction` 알림

으로 이어진다.

#### 4.3.4 `PostActorConstruction`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4403-4503`
  - `PreInitializeComponents()`
  - `InitializeComponents()`
  - 충돌 처리
  - `PostInitializeComponents()`
  - 조건 만족 시 `DispatchBeginPlay()`

즉, 스폰 액터는 `BeginPlay`까지 한 함수 체인 안에서 꽤 깊게 이어질 수 있다.

### 4.4 `PreInitializeComponents` / `PostInitializeComponents`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:6556-6572`
  - `PreInitializeComponents()`
  - 입력 자동 수신 등, 컴포넌트 fully initialized 직전 준비

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:6544-6554`
  - `PostInitializeComponents()`
  - `bActorInitialized = true`
  - 복제 컴포넌트 갱신

여기는 실무에서 중요하다.

- 생성자는 월드가 없을 수 있다
- `PostLoad`는 아직 플레이 세션이 아닐 수 있다
- `PostInitializeComponents`는 "이 액터가 월드에서 실질적으로 조립 완료되었다"는 보장이 강하다

네트워크, 컴포넌트 상호 참조, 런타임 준비 로직은 이 단계가 더 맞는 경우가 많다.

### 4.5 파괴 경로

#### 4.5.1 `Destroy`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:5288-5305`
  - `AActor::Destroy()`
  - 월드가 있으면 `World->DestroyActor(this, ...)`
  - 즉시 메모리 해제가 아니라 "제거 요청"

#### 4.5.2 `EndPlay`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:3232-3258`
  - 복제 시스템 정리
  - `ReceiveEndPlay`
  - `OnEndPlay.Broadcast`
  - 모든 컴포넌트 `EndPlay`

#### 4.5.3 `Destroyed`

- `Engine/Source/Runtime/Engine/Private/Actor.cpp:3284-3290`
  - `RouteEndPlay(EEndPlayReason::Destroyed)`
  - `ReceiveDestroyed()`
  - `OnDestroyed.Broadcast(this)`

공식 문서도 `OnDestroyed`는 legacy 성격이며, 정리 로직은 `EndPlay`로 옮기라고 권장한다.

실무 규칙:

- 게임플레이 정리: `EndPlay`
- low-level 자원 정리: `BeginDestroy`/`FinishDestroy`
- `Destroy()`는 의도 표시일 뿐, 즉시 free가 아니다

---

## 5. UObject 생명주기 상세 분석

### 5.1 생성 경로: `NewObject` -> `StaticConstructObject_Internal`

UObject는 보통 `new`로 만들지 않는다.
언리얼은 `NewObject`/`StaticConstructObject_Internal` 경로를 강제한다.

- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4921-4970`
  - `StaticConstructObject_Internal(...)`
  - `StaticAllocateObject(...)`
  - 클래스 생성자(`ClassConstructor`) 호출

- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4041-4097`
  - `FObjectInitializer`
  - 생성 중 스레드 컨텍스트 구성

- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:3961-3984`
  - `UObject::PostInitProperties()`

- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4425-4455`
  - 생성 후 `Obj->PostInitProperties()`
  - `Super::PostInitProperties()`를 안 부르면 fatal

이 단계의 의미:

1. 메모리 확보
2. C++ 생성자 실행
3. 리플렉션/서브오브젝트/프로퍼티 초기화
4. `PostInitProperties()`

즉, `PostInitProperties()`는 "생성자는 끝났고, UE가 관리하는 초기화도 끝난 직후"의 훅이다.

### 5.2 로드 경로: `ConditionalPostLoad` -> `PostLoad`

로드된 객체는 생성된 객체와 생명주기가 다르다.

- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1341-1412`
  - `UObject::ConditionalPostLoad()`
  - `RF_NeedPostLoad` 확인
  - archetype `ConditionalPostLoad()`
  - subobject `ConditionalPostLoadSubobjects()`
  - 최종적으로 `PostLoad()`

여기서 중요한 점:

- `PostLoad()`는 "직렬화된 데이터를 읽은 뒤의 보정 단계"다
- 생성자와 달리, 이미 저장된 옛 값들이 들어와 있다
- 버전 업에 따른 데이터 마이그레이션은 대체로 여기서 한다

공식 문서가 `PostLoad`와 `PostActorCreated`를 상호 배타적이라고 설명하는 이유도 여기에 있다.

- 로드 경로는 `PostLoad`
- 스폰 경로는 `PostActorCreated`

이 둘을 섞으면 로직이 꼬인다.

### 5.3 파괴 경로: `BeginDestroy` -> `FinishDestroy`

- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1071-1098`
  - `UObject::BeginDestroy()`
  - linker 분리
  - 이름/외부 패키지 정리

- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1101-1119`
  - `UObject::FinishDestroy()`
  - non-native property 파괴

공식 문서 설명과 소스가 정확히 맞물린다.

1. `BeginDestroy`
2. `IsReadyForFinishDestroy`
3. `FinishDestroy`

즉, 파괴는 1프레임짜리 이벤트가 아니라, **GC가 여러 pass에 걸쳐 처리할 수 있는 비동기형 종료 프로토콜**이다.

### 5.4 GC는 "도달 가능성 분석 + 파괴 라우팅 + 점진적 purge"다

GC 핵심 구현은 `GarbageCollection.cpp`에 있다.

- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:4528-4546`
  - `PerformReachabilityAnalysis(...)`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:5680-5806`
  - `CollectGarbageImpl(...)`
  - reachability analysis 후 post collect 단계
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:6203-6262`
  - `CollectGarbage(...)`
  - `TryCollectGarbage(...)`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:4652-5088`
  - `IncrementalPurgeGarbage(...)`
  - `ConditionalFinishDestroy()`
  - 시간 제한 기반 incremental purge

즉, GC는 대략 이렇게 움직인다.

```text
CollectGarbage / TryCollectGarbage
 -> Reachability analysis
 -> 도달 불가 객체 판정
 -> ConditionalBeginDestroy
 -> IncrementalPurgeGarbage
 -> IsReadyForFinishDestroy 검사
 -> ConditionalFinishDestroy
 -> 실제 메모리 회수
```

### 5.5 엔진 틱과 GC 스케줄링

GC는 "원할 때 아무 때나" 도는 것이 아니라 엔진이 조건부로 스케줄링한다.

- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:1887-1958`
  - `UEngine::ConditionalCollectGarbage()`
  - 강제 GC 조건 검사
  - full purge 여부 검사
  - 월드 begun play 여부 / dedicated server 연결 여부 등으로 빈도 조정

- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:16334-16368`
  - `UEngine::TrimMemory()`
  - LoadMap 전후 메모리 정리 시 full purge 수행

즉, 액터를 `Destroy()`했다고 해서 바로 메모리가 사라지지 않는 이유는,
엔진이 GC 타이밍을 별도 정책으로 관리하기 때문이다.

---

## 6. 어떤 훅에 코드를 넣어야 하나

생명주기를 공부하는 목적은 결국 "어디에 코드를 넣어야 안전한가"를 아는 데 있다.

### 6.1 생성/초기값 설정

- 생성자
  - 용도: 기본 서브오브젝트 생성, 기본값 설정
  - 장점: 가장 빠른 단계
  - 주의: 월드/게임플레이 상태를 가정하면 안 된다

- `PostInitProperties`
  - 용도: UE 초기화 이후의 후처리
  - 장점: UObject 초기화가 마무리된 시점
  - 주의: 로드된 데이터 보정용으로는 `PostLoad`가 더 적합하다

### 6.2 로드 후 보정

- `PostLoad`
  - 용도: 버전 업 대응, 직렬화된 데이터 fixup
  - 적합한 예: 저장 포맷 변경, deprecated 프로퍼티 마이그레이션
  - 주의: 스폰된 액터에서는 호출되지 않는다

- `PostActorCreated`
  - 용도: 새로 스폰된 액터가 생성 직후 해야 할 처리
  - 주의: 로드된 액터에서는 호출되지 않는다

### 6.3 Construction 단계

- `OnConstruction`
  - 용도: 에디터 배치/런타임 스폰 공통 construction 결과 조정
  - 적합한 예: BP exposed 변수로 컴포넌트 재배치
  - 주의: gameplay start 훅이 아니다

### 6.4 플레이 직전/직후

- `PreInitializeComponents`
  - 용도: 컴포넌트 initialize 직전 준비
  - 적합한 예: 입력 등록 준비, 초기 컴포넌트 상태 조정

- `PostInitializeComponents`
  - 용도: 액터와 컴포넌트가 실질적으로 조립 완료된 시점
  - 적합한 예: 컴포넌트 간 참조 연결, 복제 설정, 런타임 준비

- `BeginPlay`
  - 용도: 실제 게임플레이 시작
  - 적합한 예: 타이머 시작, AI 시작, 외부 시스템 등록

### 6.5 종료/정리

- `EndPlay`
  - 용도: 게임플레이 레벨 cleanup
  - 적합한 예: delegate 해제, 타이머 중지, 런타임 시스템 unregister
  - 권장: 대부분의 gameplay cleanup은 여기에 둔다

- `BeginDestroy` / `FinishDestroy`
  - 용도: low-level 자원 정리
  - 적합한 예: 렌더링/스레드 자원 해제
  - 비권장: gameplay logic cleanup

### 6.6 가장 흔한 실수

1. 생성자에서 월드 의존 로직을 실행한다.
2. `PostLoad`에서 플레이 상태를 가정한다.
3. `PostInitializeComponents`, `PostLoad`, `PostInitProperties`, `EndPlay`에서 `Super`를 안 부른다.
4. 액터가 `Destroy()`된 직후 메모리까지 바로 없어졌다고 착각한다.
5. raw pointer를 오래 들고 있으면서 `UPROPERTY`/`TWeakObjectPtr`를 쓰지 않는다.

---

## 7. 암기용 체크리스트

아래 12개만 정확히 기억해도 생명주기 디버깅 속도가 크게 빨라진다.

1. 프로세스 시작점은 `WinMain`이지만 실질적 엔진 시작점은 `GuardedMain`이다.
2. 엔진 루프의 축은 `PreInit -> Init -> Tick -> Exit`다.
3. `FEngineLoop::Init`가 `GEngine` 구현체를 만든다.
4. `UGameEngine::Init`가 `UGameInstance`를 만든다.
5. `UGameEngine::Start`가 첫 월드 진입을 시작한다.
6. `Browse`는 여행(travel) 결정, `LoadMap`은 월드 생성/교체 담당이다.
7. `LoadMap`의 핵심 순서는 `InitWorld -> SetGameMode -> InitializeActorsForPlay -> BeginPlay`다.
8. 월드 전체 `BeginPlay`는 `GameMode -> GameState -> WorldSettings` 체인으로 라우팅된다.
9. 디스크 로드 액터는 `PostLoad`, 스폰 액터는 `PostActorCreated`를 탄다.
10. `PostInitializeComponents`는 "조립 완료", `BeginPlay`는 "게임플레이 시작"이다.
11. `Destroy()`는 제거 요청이지 즉시 free가 아니다.
12. 실제 메모리 해제는 GC의 `BeginDestroy -> FinishDestroy` 파이프라인에서 일어난다.

---

## 8. 원문 링크와 소스 위치

### 8.1 공식 문서

- [Actor Lifecycle (UE 5.7)](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-actor-lifecycle)
- [Unreal Object Handling (UE 5.6)](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-object-handling-in-unreal-engine?application_version=5.6)
- [UGameInstance API (UE 5.5)](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/Engine/UGameInstance?application_version=5.5)
- [UGameEngine API (UE 5.5)](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/Engine/UGameEngine?application_version=5.5)
- [AGameModeBase API / official Python doc mirror on Epic site (UE 5.5)](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/GameModeBase.html?application_version=5.5)
- [Game Flow Overview (conceptual reference, UE 4.27)](https://dev.epicgames.com/documentation/en-us/unreal-engine/game-flow-overview?application_version=4.27)

### 8.2 UE 5.7 로컬 소스에서 직접 확인한 핵심 위치

- `Engine/Source/Runtime/Launch/Private/Windows/LaunchWindows.cpp:315-336`
- `Engine/Source/Runtime/Launch/Private/Launch.cpp:38-71`
- `Engine/Source/Runtime/Launch/Private/Launch.cpp:87-204`
- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:4682-4728`
- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:5536-5829`
- `Engine/Source/Runtime/Launch/Private/LaunchEngineLoop.cpp:4919-4965`
- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1205-1252`
- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1317-1368`
- `Engine/Source/Runtime/Engine/Private/GameEngine.cpp:1867-1934`
- `Engine/Source/Runtime/Engine/Private/GameInstance.cpp:96-129`
- `Engine/Source/Runtime/Engine/Private/GameInstance.cpp:625-733`
- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:15282-15363`
- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:15706-16279`
- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:1887-1958`
- `Engine/Source/Runtime/Engine/Private/UnrealEngine.cpp:16334-16368`
- `Engine/Source/Runtime/Engine/Private/World.cpp:5842-5934`
- `Engine/Source/Runtime/Engine/Private/World.cpp:6044-6078`
- `Engine/Source/Runtime/Engine/Private/WorldSettings.cpp:353-368`
- `Engine/Source/Runtime/Engine/Private/Level.cpp:3642-3694`
- `Engine/Source/Runtime/Engine/Private/Level.cpp:3817-3908`
- `Engine/Source/Runtime/Engine/Private/LevelTick.cpp:1477-2039`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:1103-1144`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:3232-3290`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4249-4503`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:4753-4794`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:5288-5305`
- `Engine/Source/Runtime/Engine/Private/Actor.cpp:6544-6572`
- `Engine/Source/Runtime/Engine/Private/ActorConstruction.cpp:816-1005`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:3961-3984`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4041-4097`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4425-4455`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/UObjectGlobals.cpp:4921-4970`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1071-1119`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/Obj.cpp:1341-1412`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:4528-4546`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:4652-5088`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:5680-5806`
- `Engine/Source/Runtime/CoreUObject/Private/UObject/GarbageCollection.cpp:6203-6262`

---

## 9. 마지막 정리

언리얼의 생명주기를 이해할 때 가장 중요한 태도는 "훅 이름만 외우지 말고, 어떤 경로에서 그 훅에 도달하는지"를 같이 보는 것이다.

- `PostLoad`는 로드 경로다.
- `PostActorCreated`는 스폰 경로다.
- `PostInitializeComponents`는 조립 완료다.
- `BeginPlay`는 게임플레이 시작이다.
- `EndPlay`는 gameplay cleanup이다.
- `BeginDestroy`/`FinishDestroy`는 low-level destruction이다.

이 구분만 명확해지면, 액터가 왜 두 번 초기화되는지, PIE에서만 왜 다르게 보이는지, Destroy 후 왜 포인터가 아직 살아 있는 것처럼 보이는지, GC hitch가 왜 생기는지 같은 문제가 한 번에 읽히기 시작한다.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 어디서든 `GetWorld()`가 항상 유효하다. | 객체 종류와 초기화 시점별 world context를 확인한다. |
| Subsystem은 모두 같은 lifetime이다. | Engine, GameInstance, World, LocalPlayer subsystem을 구분한다. |
| Editor에서 되면 packaged build에서도 초기화 순서가 같다. | module loading phase와 cook/runtime 차이를 확인한다. |

## 디버깅 체크리스트

- [ ] 실행 시점에 필요한 module이 로드되어 있다.
- [ ] world context가 PIE, editor preview, packaged runtime 중 어디인지 확인했다.
- [ ] subsystem 종류와 생성/해제 시점이 기능 lifetime과 맞다.
- [ ] UObject outer와 GC reference가 의도대로 유지된다.
- [ ] map travel, PIE 종료, shutdown에서 delegate와 참조를 정리한다.

## 관련 문서

- [[언리얼 초기화 과정]]
- [[Subsystem, Module, Plugin]]
- [[델리게이트(Delegate)]]
- [[UPROPERTY Object Reference Guide]]
- [[Automation Test]]

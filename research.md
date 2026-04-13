# SpecMesh 계열 심층 조사 보고서

작성일: 2026-03-11  
대상 프로젝트: `F:\UnrealProjects\BackroomCompany`

## 1. 조사 범위

이번 조사는 `SpecMesh` 이름이 직접 붙은 파일뿐 아니라, 실제 참조를 따라 런타임에 연결되는 관련 시스템까지 포함해서 진행했다.

직접 조사한 핵심 파일:

- `Source/BackroomCompany/Public/SpecMeshManager.h`
- `Source/BackroomCompany/Private/SpecMeshManager.cpp`
- `Source/BackroomCompany/Public/SpecMesh.h`
- `Source/BackroomCompany/Private/SpecMesh.cpp`
- `Source/BackroomCompany/Public/SpecMesh/SpecMeshRenderSubsystem.h`
- `Source/BackroomCompany/Private/SpecMesh/SpecMeshRenderSubsystem.cpp`
- `Source/BackroomCompany/Public/SpecMesh/SpecRoomLocatorSubsystem.h`
- `Source/BackroomCompany/Private/SpecMesh/SpecRoomLocatorSubsystem.cpp`
- `Source/BackroomCompany/Public/SpecMesh/SpecMeshRevealStateComponent.h`
- `Source/BackroomCompany/Private/SpecMesh/SpecMeshRevealStateComponent.cpp`
- `Source/BackroomCompany/Public/SpecMesh/SpecMeshMaterialProvider.h`
- `Source/BackroomCompany/Public/Enum/SpecMeshVolatility.h`
- `Source/BackroomCompany/Public/SpecMeshContainable.h`

참조를 따라 추가 조사한 연관 파일:

- `Source/BackroomCompany/Public/MyGameState.h`
- `Source/BackroomCompany/Private/MyGameState.cpp`
- `Source/BackroomCompany/Public/RoomVisitManager.h`
- `Source/BackroomCompany/Private/RoomVisitManager.cpp`
- `Source/BackroomCompany/Public/StaticStageManager.h`
- `Source/BackroomCompany/Private/StaticStageManager.cpp`
- `Source/BackroomCompany/Public/StaticRoomModule/StaticRoomGenerator.h`
- `Source/BackroomCompany/Private/StaticRoomModule/StaticRoomGenerator.cpp`
- `Source/BackroomCompany/Public/StaticRoomModule/StaticRoomModule.h`
- `Source/BackroomCompany/Private/StaticRoomModule/StaticRoomModule.cpp`
- `Source/BackroomCompany/Public/ObservationCamera.h`
- `Source/BackroomCompany/Private/ObservationCamera.cpp`
- `Source/BackroomCompany/Public/PlayerMinimapController.h`
- `Source/BackroomCompany/Private/PlayerMinimapController.cpp`
- `Source/BackroomCompany/Public/PlayerSpectatorPawn.h`
- `Source/BackroomCompany/Private/PlayerSpectatorPawn.cpp`
- `Source/BackroomCompany/BackroomCompanyCharacter.cpp`
- `Source/BackroomCompany/Private/CreatureBase.cpp`
- `Source/BackroomCompany/Private/StaticRoomModule/Creature/StaticRoomCreatureBase.cpp`
- `Source/BackroomCompany/Private/Locker.cpp`
- `Source/BackroomCompany/Private/Wall.cpp`
- `Source/BackroomCompany/Private/RoomModuleBase.cpp`
- `Source/BackroomCompany/Private/ItemDeployer.cpp`
- `Source/BackroomCompany/Private/StaticRoomModule/StaticRoomItemSpawnPoint.cpp`
- `Source/BackroomCompany/Private/ItemWard.cpp`
- `Source/BackroomCompany/Private/RepeaterComponent.cpp`
- `Source/BackroomCompany/Private/StorySlideGroup.cpp`
- `Source/BackroomCompany/Private/HideFromSceneCaptureBase.cpp`
- `Source/BackroomCompany/Public/Enum/RoomVisitState.h`

분석 방법:

- `rg`로 파일/참조/호출 지점을 수집
- 핵심 클래스의 헤더/구현부를 전부 확인
- 이벤트 바인딩, 상태 캐시, 복제 경로, SceneCapture 연동 경로를 중심으로 추적

제외 범위:

- Blueprint 자산, 레벨 배치, 에디터 상 세팅값 자체는 직접 열어보지 않았다
- 따라서 일부 런타임 상태 전이는 Blueprint 또는 레벨 스크립트가 보완하고 있을 가능성이 있다

## 2. 한 줄 요약

현재 `SpecMesh` 시스템은 단순 메시 액터가 아니라, 다음 4개 축이 결합된 "시각화 파이프라인"이다.

1. `ASpecMesh`가 자기 표현 상태와 재질 전환을 담당한다.
2. `USpecMeshManager`가 게임 상태, 방 방문 상태, 정적 방 그래프를 조합해서 최종 상태를 결정한다.
3. `USpecMeshRenderSubsystem`가 SceneCapture 기반 가시성 제어와 관전자용 필터링을 처리한다.
4. `USpecRoomLocatorSubsystem`와 `URoomVisitManager`가 "이 SpecMesh가 어느 방에 속하고, 그 방이 방문/공개 상태인지"를 제공한다.

즉, `SpecMesh`는 단순 렌더링 객체가 아니라 "방 상태를 시각화하는 프런트엔드"에 가깝다.

## 3. 전체 구조

### 3.1 상위 소유 구조

`AMyGameState`가 다음 컴포넌트를 기본 서브오브젝트로 생성한다.

- `USpecMeshManager`
- `URoomVisitManager`
- `USpecMeshRevealStateComponent`

정적 방 스테이지에서는 별도로 `AStaticStageManager`가 존재하며, 여기에 다음 컴포넌트가 붙어 있다.

- `UStaticRoomGenerator`
- `UStaticRoomCreatureSpawner`
- `UStaticRoomItemDeployer`

구조를 단순화하면 아래와 같다.

```text
AMyGameState
  -> USpecMeshManager
  -> URoomVisitManager
  -> USpecMeshRevealStateComponent

AStaticStageManager
  -> UStaticRoomGenerator

ASpecMesh
  -> self register to USpecMeshManager

USpecMeshManager
  -> USpecMeshRenderSubsystem
  -> USpecRoomLocatorSubsystem
  -> URoomVisitManager
  -> UStaticRoomGenerator
```

### 3.2 역할 분리

- `ASpecMesh`
  상태를 실제로 받아서 숨김/표시/재질을 적용하는 말단 표현 객체
- `USpecMeshManager`
  언제 어떤 상태를 적용할지를 결정하는 오케스트레이터
- `USpecMeshRenderSubsystem`
  관전자 카메라와 플레이어 SceneCapture 기준으로 어떤 SpecMesh를 렌더 타깃에 포함시킬지 관리
- `USpecRoomLocatorSubsystem`
  SpecMesh와 StaticRoom 간의 바인딩 해석기
- `URoomVisitManager`
  방 방문 상태의 authoritative/replicated source

## 4. 런타임 흐름

### 4.1 등록 시점

`ASpecMesh::BeginPlay()`에서 다음 순서가 실행된다.

1. `SpecMeshOwner`가 비어 있으면 부모 액터를 owner로 설정
2. 머티리얼 슬롯 캐시 준비
3. `USpecMeshManager`에 자기 자신 등록
4. 현재 상태 기준으로 시각 상태 적용

즉, `SpecMesh`는 외부가 찾아서 등록하는 구조가 아니라 self-registration 구조다.

### 4.2 매니저 초기화

`USpecMeshManager::BeginPlay()`는 다음을 수행한다.

- `AMyGameState` 확인
- `USpecMeshRenderSubsystem`, `USpecRoomLocatorSubsystem` 캐시
- 레거시 `URoomGenerator::Client_OnRoomGeneratingDone` 바인딩
- `AMyGameState`의 `Client_OnStageStart`, `Client_OnStageEnd`, `NetMulticast_OnInGamePlayerChanged` 바인딩
- `URoomVisitManager::OnRoomVisitStateChanged()` 바인딩
- `Initialize()` 호출

즉, 이 컴포넌트는 스테이지 전환과 방 방문 상태 변화 양쪽에 모두 반응한다.

### 4.3 방 생성 완료 판정

`USpecMeshManager`는 단순히 "방 생성 이벤트를 받았다"만으로 완료로 보지 않는다.  
`TryFinalizeRoomGenerationAfterRenderReady()`에서 아래 조건을 모두 만족해야 `bIsRoomGenerated = true`가 된다.

- `AMyGameState`가 유효함
- 현재 flow state가 `OnStage`
- 정적 방 스테이지라면 `UStaticRoomGenerator`가 바인딩됨
- `USpecMeshRenderSubsystem`이 유효한 SceneCapture 컴포넌트를 확보함

이 설계의 의미:

- 방 생성과 렌더링 준비를 분리했다
- 로컬 클라이언트의 카메라/캡처 준비 상태에 따라 완료 시점이 조금 늦어질 수 있다
- 준비가 덜 되면 `TemporaryArrayBeforeInitializing`에 등록 대기시킨다

### 4.4 초기 상태 적용

방 생성 완료 후 `USpecMeshManager`는 등록된 모든 SpecMesh에 기본 상태를 먼저 준다.

- Visit: `Unvisited`
- Reveal: `Reveal`

그 다음 정적 방 스테이지이면 정적 방 문맥을 재구축해서 실제 방 방문/공개 상태로 덮어쓴다.

### 4.5 정적 방 스테이지에서의 상태 계산

정적 방 스테이지에서는 다음 순서가 핵심이다.

1. `USpecRoomLocatorSubsystem::RebuildStaticRoomCache()`
2. `USpecMeshManager::RefreshStaticRoomRevealCaches()`
3. `USpecMeshManager::RebuildStaticRoomSpecEntryArray()`
4. `URoomVisitManager`에서 방 방문 상태 조회
5. `USpecMeshRenderSubsystem::ApplyRoomStateToSpecMesh()`
6. 마커류는 `UpdateDynamicMarkerStates()`로 추가 보정

### 4.6 Reveal 계산 방식

Reveal은 단순 visited/non-visited가 아니다.

- 방문한 방은 시작점이 된다
- `StaticRoomRevealDepth`만큼 BFS로 인접 방을 확장한다
- 확장된 방 집합은 `RevealedStaticRoomIdSet`
- 그 외 유효한 방은 `Conceal`
- 유효하지 않거나 매핑 실패 시 `Invalid`

즉, 정적 방에서는 "방문한 방 + 인접 N단계"가 공개 범위다.

### 4.7 Tick 시점 처리

`USpecMeshManager::TickComponent()`는 다음을 수행한다.

- 정적 방이면 `UStaticRoomGenerator` 바인딩 재시도
- 아직 완료 전이면 방 생성 완료 조건 재검사
- 정적 방이면 동적 마커 상태 갱신
- `USpecMeshRenderSubsystem::TickRender()` 호출
- 디버그 문자열 표시

즉, Manager는 직접 렌더링하지 않지만, 매 프레임 렌더 서브시스템을 구동하는 scheduler 역할을 한다.

## 5. 핵심 클래스별 상세 분석

### 5.1 `ASpecMesh`

핵심 책임:

- visit/reveal state 보관
- 실제 actor visibility 적용
- 재질 슬롯 캐시 보관
- 재질 공급자에게서 재질을 받아 상태별로 적용

중요 프로퍼티:

- `Volatility`
  `Permanent`면 스테이지 종료 후에도 `PermanentMeshArray`에 보존
- `ShowOn`
  관전자/플레이어/미니맵 표시 정책
- `Category`
  `Terrain` 또는 `Marker`
- `RevealPolicy`
  `FollowRoomReveal` 또는 `AlwaysVisible`
- `StaticRoomBindingMode`
  방 매핑 규칙
- `RoomTrackingPolicy`
  동적 마커 갱신 정책
- `ElementMaterialTypeArray`
  슬롯별 논리 재질 타입

재질 처리 규칙:

- `AlwaysVisible`
  원본 머티리얼 유지
- `Marker`
  marker용 머티리얼 적용
- 일반 메시 + `Visited`
  슬롯별 논리 재질 적용, 없으면 원본 fallback
- 일반 메시 + `Unvisited`
  `Wall` 슬롯은 `Wall`, 나머지는 `Void`

중요한 포인트:

- `ASpecMesh`는 재질 공급자를 직접 알지 못하고 `ISpecMeshMaterialProvider` 인터페이스만 본다
- 실제 공급자는 현재 코드상 `USpecMeshManager` 하나뿐이다
- `ApplyPresentationFromCurrentState()`가 최종 가시성/재질 적용의 단일 진입점이다

### 5.2 `USpecMeshManager`

핵심 책임:

- GameState 이벤트 수신
- RoomVisit 상태 수신
- StaticRoom reveal 범위 계산
- SpecMesh -> Room 매핑 재구축
- 최종 상태를 RenderSubsystem에 전달

내부 캐시:

- `StaticRoomSpecEntryArray`
  SpecMesh와 RoomId의 페어 캐시
- `RevealedStaticRoomIdSet`
  reveal 대상 room id 집합
- `FrontierStaticRoomIdSet`
  frontier room id 집합

실제 동작 특징:

- manager 자신은 별도 replicated state를 거의 갖지 않는다
- 최종 시각 상태는 각 클라이언트가 local context와 replicated room visit data를 조합해서 계산한다
- 서버는 `ResolveRoomVisitStateForContext(RoomId, true)`, 클라이언트는 `false`를 사용한다

정적 방 관련 핵심 함수:

- `RefreshStaticRoomSpecMeshContext()`
  room cache, reveal cache, spec entry를 한 번에 갱신
- `RefreshStaticRoomRevealCaches()`
  방문 방 기반 BFS reveal 계산
- `ApplyStaticRoomSpecMeshStates()`
  서버 authoritative path
- `ApplyReplicatedStaticRoomSpecMeshStates()`
  클라이언트 replicated path

### 5.3 `USpecMeshRenderSubsystem`

이름은 render subsystem이지만 실제 역할은 "SceneCapture visibility coordinator"에 가깝다.

핵심 책임:

- ObservationCamera SceneCapture와 Player SceneCapture 연결
- 등록된 SpecMesh를 show-only / hidden list에 반영
- 관전자 대상 플레이어의 층수 기준으로 필터링
- 중복 state apply 방지

주요 배열:

- `MeshArray`
  현재 관리 중인 메시
- `PermanentMeshArray`
  stage end 후에도 유지할 메시
- `TemporaryArrayBeforeInitializing`
  capture 준비 전 대기 큐
- `AppliedSpecMeshStateMap`
  마지막 적용 상태 캐시

중요한 동작:

- 플레이어 1인칭 SceneCapture에서는 SpecMesh를 숨긴다
- ObservationCamera SceneCapture에는 ShowOnly로 넣는다
- reveal state가 `Reveal`이 아니면 observation show-only에서 제거한다
- 매 프레임 관전 대상 플레이어의 floor를 기준으로 어떤 SpecMesh를 관전자에게 보여줄지 결정한다

`ShowOn` 처리 실질 규칙:

- `MinimapOnly`
  Manager 단계에서 아예 등록 스킵
- `Player`
  floor가 달라도 강제로 표시
- `Monster`
  floor가 달라도 강제로 표시
- 나머지 값
  일반 floor 비교 경로

즉, enum은 여러 값이 있지만 실제로 의미 있게 구현된 것은 일부다.

### 5.4 `USpecRoomLocatorSubsystem`

핵심 책임:

- 정적 방 캐시 재구축
- SpecMesh가 어느 StaticRoom에 속하는지 해석
- Marker가 현재 어느 방에 대응하는지 위치 기반으로 해석

바인딩 모드 해석:

- `StaticRoomActor`
  명시적 방 액터 참조
- `StaticRoomId`
  명시적 RoomId
- `OwnerActorLocation`
  owner actor 위치로 방 탐색
- `LegacyAuto`
  owner/parent/attach parent/owner chain으로 room 추론

중요한 구현 포인트:

- `FindStaticRoomByLocation()`는 먼저 `UBoxComponent` bounds 내부 포함 여부를 본다
- 어느 박스에도 속하지 않으면 가장 가까운 room actor를 fallback으로 사용한다

즉, 완전한 공간 분할이 아니라 "박스 포함 우선, 실패 시 최근접 room" 전략이다.

### 5.5 `USpecMeshRevealStateComponent`

실제 로직은 거의 없다.

- `BeginPlay()`에서 `StaticRoomRevealDepth`를 Manager에 한 번 전달
- 그 이후 별도 이벤트 처리 없음

즉, 이 컴포넌트는 reveal depth 설정용 bootstrap 역할이다.

### 5.6 `ISpecMeshMaterialProvider`

인터페이스는 단순하다.

- `FindSpecMeshMaterial(MaterialType)`
- `HasAnySpecMeshMaterials()`

현재 코드 기준 구현체는 `USpecMeshManager`만 확인된다.

## 6. 연관 시스템 분석

### 6.1 `AMyGameState`

SpecMesh 시스템 입장에서 `AMyGameState`는 root context다.

제공하는 것:

- `USpecMeshManager`, `URoomVisitManager`, `USpecMeshRevealStateComponent` 생성
- stage start/end delegate 발행
- `NetMulticast_OnInGamePlayerChanged` 발행
- `GetPlayerCurrentFloorByZOffset()` 제공
- 정적 방 스테이지 여부 판단 함수 제공

중요한 연결:

- `USpecMeshManager`는 GameState의 stage/event 흐름에 종속
- `USpecMeshRenderSubsystem::TickRender()`와 `PlayerMinimapController`가 floor 계산을 `AMyGameState`에 의존

### 6.2 `URoomVisitManager`

이 컴포넌트는 정적 방 방문 상태의 authoritative source다.

핵심 기능:

- 서버에서 실제 방문 room set 유지
- `StaticRoomStateRepArray`로 클라이언트에 복제
- `OnRoomVisitStateChanged()` delegate로 상태 변경 broadcast
- 플레이어의 `URoomRecognizerComponent`와 바인딩

SpecMesh 관점에서 중요 포인트:

- Manager는 reveal이 아니라 visit를 이 컴포넌트에서 가져온다
- 클라이언트는 replicated array 기반으로만 상태를 읽는다
- 정적 방 그래프가 바뀌면 `HandleStaticRoomGraphChanged()`가 호출되어 상태가 prune된다

### 6.3 `UStaticRoomGenerator`

이 컴포넌트는 정적 방 스테이지에서 room graph의 source of truth다.

SpecMesh 시스템과 연결되는 핵심:

- `GetValidRoomArrayCopy()`
- `RoomIdRepArray`
- `NetMulticast_OnRoomGenerationDone`
- `AssignValidRoomIds()`
- `RebuildValidRoomCache()`

RoomId 처리 방식:

- 서버가 `ValidRoomArray`를 path-name 정렬 후 0..N-1 room id 부여
- `RoomIdRepArray`로 client에 복제
- client는 `ApplyReplicatedRoomIdArray()`로 각 room actor에 동일 id를 적용

즉, `SpecMesh`가 참조하는 room id는 generator가 만든 공통 식별자에 의존한다.

### 6.4 `AStaticRoomModule`

SpecMesh 시스템에는 두 가지 역할을 한다.

1. 방 그래프 노드
2. 일부 SpecMesh의 logical owner

중요 함수:

- `GetConnectedRoomArray()`
  BFS reveal 계산의 간선 source
- `GetResolvedRoomID()`
  RoomID가 없으면 `FCrc::StrCrc32(GetPathName())` fallback

즉, room 연결 그래프와 식별자 해석 모두 `AStaticRoomModule`이 제공한다.

### 6.5 관전자 경로: `AObservationCamera`, `APlayerSpectatorPawn`

`AObservationCamera`:

- `InGamePlayerArray`를 기준으로 관전 대상 player state를 선택
- `CurrentPlayerState`를 유지
- `USpecMeshRenderSubsystem::TickRender()`가 이 상태를 읽어서 현재 관전 대상 층을 계산

`APlayerSpectatorPawn`:

- BeginPlay에서 `USpecMeshManager`를 참조 캐시
- `CheckFallDownTick()`에서 `GetLowestFloorForSpectator()`를 사용
- 관전자 pawn이 너무 낮은 층에 떨어지면 다른 플레이어를 재선택

즉, SpecMesh는 관전자 UX와 직접 연결되어 있다.

### 6.6 플레이어 미니맵 경로: `UPlayerMinimapController`

이 시스템은 Manager 기반이 아니라 별도 로컬 visited-set 기반이다.

핵심 특징:

- `Client_OverlapRoom()`로 방 겹침 시 SpecMesh를 visited set에 추가
- `TickComponent()`에서 visited spec mesh와 repeater spec mesh를 show-only 관리
- floor 비교는 `AMyGameState::GetPlayerCurrentFloorByZOffset()`
- 다른 플레이어 위치 표현을 위해 SpecMesh의 static mesh 자체를 교체하기도 함

중요한 의미:

- 관전자용 SpecMesh 제어와 플레이어 minimap용 제어가 통합되어 있지 않다
- `SpecMeshRevealState`와 minimap show-only는 별개 레이어다

### 6.7 SpecMesh owner를 세팅하는 객체들

다음 클래스들이 `SetSpecMeshOwner()`를 직접 호출한다.

- `ABackroomCompanyCharacter`
- `ACreatureBase`
- `AStaticRoomCreatureBase`
- `ALocker`
- `AWall`
- `ARoomModuleBase`
- `UItemDeployer`
- `AStaticRoomItemSpawnPoint`
- `AItemWard`

의미:

- `SpecMeshOwner`는 단순 부가 정보가 아니라 room locator, floor/filter, overlay 보정에서 사용되는 핵심 문맥이다
- owner 세팅이 잘못되면 room binding과 overlay 위치 보정이 흔들릴 수 있다

### 6.8 기타 SpecMesh 관련 보조 사용처

- `RepeaterComponent`
  다른 플레이어의 SpecMesh에 `OtherPlayerStaticMesh`를 주입
- `BackroomCompanyCharacter`
  미니맵용 friend spec mesh를 다른 플레이어 child spec mesh에 세팅
- `StorySlideGroup`
  특정 SceneCapture에서 SpecMesh를 숨김
- `HideFromSceneCaptureBase`
  플레이어 child SpecMesh를 SceneCapture에서 숨김

즉, `SpecMesh`는 SpecMeshManager만 쓰는 닫힌 시스템이 아니다.  
다른 UI/캡처 시스템도 직접 child actor를 찾아서 만지고 있다.

## 7. Enum과 실제 구현의 대응

### 7.1 `ESpecMeshVolatility`

- `Permanent`
  stage end 후에도 유지됨
- `Temporary`
  stage end 시 정리 대상
- `None`
  현재 코드상 별도 의미 없음

### 7.2 `ESpecMeshMobility`

- enum은 존재하지만 조사 범위의 C++ 코드에서 실제 사용처를 찾지 못했다

### 7.3 `ESpecMeshShowOn`

실제 의미가 있는 구현:

- `MinimapOnly`
  manager registration 스킵
- `Player`
  관전자/미니맵에서 player overlay 취급
- `Monster`
  관전자 overlay 취급

현재 코드만 보면 사실상 구현이 빈약한 값:

- `All`
- `None`
- `ObservationOnly`

### 7.4 `ESpecMeshCategory`

- `Terrain`
  일반 메시 처리
- `Marker`
  marker용 재질/동적 room 추적 처리

### 7.5 `ESpecMeshRevealPolicy`

- `FollowRoomReveal`
  room reveal 결과를 따른다
- `AlwaysVisible`
  reveal을 무시하고 항상 표시하며 원본 머티리얼 사용

### 7.6 `ESpecMeshRoomBindingMode`

실제 사용된다.

- `LegacyAuto`
- `StaticRoomActor`
- `StaticRoomId`
- `OwnerActorLocation`

### 7.7 `ESpecMeshRoomTrackingPolicy`

현재 구현상 의미:

- `None`
  동적 마커 갱신 안 함
- `OnDemand`
  한 번 visited/reveal 되면 이후 갱신 스킵
- `Continuous`
  스킵 조건 없이 계속 갱신

## 8. 중요한 관찰 사항

### 8.1 이 시스템의 중심은 `ASpecMesh`가 아니라 `USpecMeshManager`

이름만 보면 `ASpecMesh`가 중심처럼 보이지만, 실제 중심은 Manager다.

- `ASpecMesh`는 상태를 적용만 한다
- 상태 결정은 Manager가 한다
- SceneCapture 렌더 레이어 관리는 RenderSubsystem이 한다
- Room binding 해석은 RoomLocatorSubsystem이 한다

즉, `ASpecMesh`는 leaf object다.

### 8.2 정적 방 스테이지 전용 로직 비중이 크다

레거시 room generator 지원도 남아 있지만, 현재 구조의 복잡도 대부분은 정적 방 reveal/visit 처리에서 나온다.

- room id 복제
- room graph BFS
- marker room 추적
- client/server visit state 분리

즉, 현 시스템은 사실상 "StaticRoom stage minimap/spectator reveal system"으로 진화한 상태다.

### 8.3 SceneCapture 의존성이 매우 강하다

`SpecMeshRenderSubsystem`는 일반 렌더링보다는 SceneCapture hidden/show-only 조작에 집중되어 있다.

- 플레이어 1인칭 캡처
- 관전자 ObservationCamera 캡처
- 기타 StorySlide/HideFromSceneCapture 기반 캡처

즉, SpecMesh의 존재 이유가 화면 메시에만 있는 것이 아니라 "특정 캡처 타깃에서만 보이는 대체 시각화"에 있다.

### 8.4 minimap 경로와 spectator 경로가 분리되어 있다

SpecMeshManager/RenderSubsystem는 spectator용 show-only와 방 상태 기반 reveal을 관리한다.  
반면 `PlayerMinimapController`는 overlap visited-set과 local show-only를 사용한다.

이것은 장점과 단점이 모두 있다.

- 장점
  플레이어 minimap 요구사항을 별도로 빠르게 조정 가능
- 단점
  reveal/visit 규칙이 두 경로에서 쉽게 어긋날 수 있음

## 9. 리스크와 설계 부채

### 9.1 `ARoomModuleBase::SpecMeshActorArray`는 현재 코드상 사실상 죽어 있다

관찰 내용:

- `RoomModuleBase.cpp`에서 `SpecMeshActorArray.Add(...)`가 주석 처리되어 있음
- 그런데 아래 함수들은 여전히 `SpecMeshActorArray`를 사용
  - `GetSpecMeshArray()`
  - `GetFirstSpecMesh()`
  - `UpdateFloorInfo()`
  - `EndPlay()`

영향:

- `GetFirstSpecMesh()`는 빈 배열이면 out-of-bounds 가능성
- `UpdateFloorInfo()`는 실제 child spec mesh에 floor를 전달하지 못함
- 이 배열에 의존하는 외부 코드가 있으면 latent bug가 될 수 있음

판단:

- 현재는 `SpecMeshChildActorArray` 기반 로직으로 이전 중이거나, 과거 구현 잔재일 가능성이 높다

### 9.2 `FrontierStaticRoomIdSet`는 계산만 하고 사용하지 않는다

관찰 내용:

- reveal cache 계산 중 frontier room id를 수집
- 이후 read 지점을 찾지 못함

판단:

- 예정 기능의 잔재이거나, debug/hud 연계가 제거된 후 남은 캐시일 가능성이 크다

### 9.3 server/client static room context가 side mission 상태에 따라 어긋날 여지가 있다

관찰 내용:

- `UStaticRoomGenerator::GetValidRoomArrayCopy()`는 서버에서 side mission room을 필터링할 수 있음
- `SpecRoomLocatorSubsystem`와 `RoomVisitManager`는 이 함수 결과를 사용
- 반면 `RoomIdRepArray` 갱신 경로는 `ValidRoomArray` 전체를 기준으로 돈다
- client의 `ApplyReplicatedRoomIdArray()`는 전체 room id를 다시 적용한다

의미:

- side mission 진행 중 server와 client가 "유효한 방 집합"을 다르게 볼 가능성이 있다

이 부분은 실제 의도일 수도 있지만, SpecMesh reveal/visit 일관성 측면에서는 확인이 필요하다.

### 9.4 `FindStaticRoomByLocation()`의 최근접 fallback은 잘못된 room 판정을 만들 수 있다

조건:

- marker나 owner actor가 어느 room box에도 안 들어가 있을 때

결과:

- 가장 가까운 room actor가 선택된다

리스크:

- corridor, 문턱, 박스 밖 임시 위치, 이동형 owner의 경우 잘못된 room binding이 생길 수 있다

### 9.5 static stage에서 `OnStage` 전환 시점은 C++만 보면 분명하지 않다

관찰 내용:

- `USpecMeshManager::TryFinalizeRoomGenerationAfterRenderReady()`는 `CurrentFlowState == OnStage`를 요구
- 그런데 static stage C++ 경로만 보면 `CurrentState = EGameFlowState::OnStage` 설정 지점이 명확하지 않다
- story path는 `StoryManager`가, legacy path는 `OnLoadingComplete()`가 상태를 바꾼다

판단:

- Blueprint 또는 다른 외부 경로에서 상태를 올리는 것으로 보인다
- 이 전제가 깨지면 SpecMesh finalize가 영원히 늦춰질 수 있다

### 9.6 `PlayerMinimapController`는 Manager와 다른 owner 문맥을 쓴다

관찰 내용:

- `SpecMeshRenderSubsystem`는 `GetSpecMeshOwner()`를 사용
- `PlayerMinimapController`는 일부 조건에서 `SpecMesh->GetOwner()`를 비교

리스크:

- child actor ownership과 logical owner 문맥이 항상 같다는 보장이 없으면, 미니맵 표시 규칙이 manager 경로와 달라질 수 있다

### 9.7 일부 enum/필드/함수는 현재 구현에서 사실상 휴면 상태다

예시:

- `ESpecMeshMobility`
- `ASpecMesh::Floor`
- `ASpecMesh::GetFloor()`
- `ASpecMesh::SetSpecMeshMaterial()`
- `ASpecMesh::SetSpecMeshState()`
- `ASpecMesh::SetSpecMeshRevealState()`
- `ESpecMeshShowOn::ObservationOnly`
- `ESpecMeshShowOn::None`

이 자체가 버그는 아니지만, 유지보수 관점에서는 의도와 실제 구현이 벌어져 있다는 신호다.

## 10. 성능 관점 메모

### 10.1 Tick 비용은 대부분 선형 탐색

정적 방 활성 중 매 프레임 수행될 수 있는 작업:

- `USpecMeshRenderSubsystem::TickRender()`
  모든 등록 SpecMesh 순회
- `USpecMeshRenderSubsystem::UpdateDynamicMarkerStates()`
  모든 등록 SpecMesh 중 marker 순회
- marker location -> room 해석 시 `FindStaticRoomByLocation()`
  room 수만큼 선형 탐색

즉, 대략 `O(mesh)` + `O(marker * room)` 경향이 있다.

### 10.2 reveal cache 계산도 visited room 수에 따라 반복 BFS가 생긴다

`RefreshStaticRoomRevealCaches()`는 visited room마다 BFS를 시작한다.  
reveal depth가 작으면 문제 없을 가능성이 높지만, room 수가 커지면 중복 탐색이 생긴다.

### 10.3 상태 apply 자체는 캐시로 중복을 줄이고 있다

장점:

- `AppliedSpecMeshStateMap`로 동일 상태 재적용 방지
- 실제 `SetSpecMeshStates()` 호출 수를 줄인다

즉, 병목은 "상태 계산"보다 "대상 탐색" 쪽일 가능성이 더 크다.

## 11. 검증 포인트

다음 시나리오를 확인하면 이 시스템을 실제로 이해했는지 빠르게 검증할 수 있다.

1. 일반 stage와 static room stage에서 stage start 직후 SpecMesh가 어떻게 달라지는지 비교
2. `StaticRoomRevealDepth = 1 / 2 / 3`에서 reveal 범위가 BFS 인접 깊이대로 확장되는지 확인
3. marker를 `LegacyAuto`, `StaticRoomActor`, `StaticRoomId`, `OwnerActorLocation` 각각으로 배치해서 room binding 결과 비교
4. `RoomTrackingPolicy = OnDemand`와 `Continuous`의 차이를 실제 moving marker로 비교
5. `Volatility = Permanent` 메시가 stage end 후 유지되는지 확인
6. `ShowOn = MinimapOnly`, `Player`, `Monster`, `ObservationOnly`, `None`를 각각 배치해 실제 동작 차이 확인
7. side mission room이 있는 static stage에서 host/client가 같은 room reveal 결과를 보는지 비교
8. `bDrawSpecMeshDebugVisibilityText`와 `RoomVisitManager` 디버그 문자열을 함께 켜서 room visit / reveal / actor visibility를 동시에 확인

## 12. 결론

현재 `SpecMesh` 시스템은 다음 세 가지를 동시에 만족시키려는 구조다.

- 방 방문 상태 기반 시각화
- 관전자/플레이어/미니맵용 별도 SceneCapture 렌더 레이어
- 정적 방 스테이지의 room graph 기반 reveal 제어

전체적으로는 의도가 분명하고, `ASpecMesh` 표현 로직과 `USpecMeshManager` 상태 결정 로직도 잘 분리되어 있다.  
다만 실제 코드에는 "이전 구현의 흔적"과 "서브시스템 간 중복/비대칭"도 분명히 남아 있다.

특히 아래 네 가지는 이후 유지보수 시 가장 먼저 신경 써야 한다.

- `ARoomModuleBase::SpecMeshActorArray`의 휴면 상태
- `FrontierStaticRoomIdSet` 같은 미사용 캐시
- side mission room filtering으로 인한 server/client 문맥 차이 가능성
- minimap 경로와 manager 경로가 분리되어 있다는 점

정리하면, 이 시스템은 이미 "작동하는 기능 묶음"을 넘어서 "작은 시각화 프레임워크"에 가까우며, 앞으로 손댈 때는 `SpecMesh` 자체보다 `Manager + RoomVisit + StaticRoomGenerator + SceneCapture` 묶음을 하나의 단위로 보는 것이 맞다.

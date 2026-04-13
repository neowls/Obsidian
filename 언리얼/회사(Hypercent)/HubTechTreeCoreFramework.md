# Hub Tech Tree Core Framework

## 문서 목적
이 문서는 `BackroomCompany` 프로젝트의 Hub 테크트리 코어 프레임워크를 처음 보는 팀원이 빠르게 이해할 수 있도록 작성한 설명서입니다.

이 문서가 설명하는 목표는 아래와 같습니다.
- 이 시스템이 무엇을 담당하는지 이해한다.
- 현재 구현된 범위와 아직 구현되지 않은 범위를 구분한다.
- 데이터, 상태, 인터페이스, 클래스, 변수, 함수가 각각 어떤 역할을 하는지 이해한다.
- 이후 UI, 창고, 실제 효과 구현 담당자가 어디에 붙어야 하는지 알 수 있게 한다.

---

## 현재 구현 범위
현재 구현된 것은 **테크트리 코어 프레임워크**입니다.

포함된 범위:
- DataTable 기반 노드 정의 구조
- `GameplayTag` 기반 노드 식별
- 노드 간 선행조건 / 의존 관계 모델
- 영구 해금 상태 관리
- 구매 상태 관리
- 현재 활성 상태 관리
- 첫 활성화 / 무료 재활성화 로직
- 수동 비활성화
- 의존 관계 기반 연쇄 비활성화
- 비용 처리 인터페이스
- executor 기반 효과 훅
- 복제, 저장, 로드

의도적으로 제외된 범위:
- 테크트리 UI
- Hub 모니터 연동
- 창고 구현
- 아이템 제작 구현
- 실제 비용 차감 구현
- 실제 노드 효과 구현
- UI 배치 데이터
- UI 연결선 전용 데이터

즉, 현재 상태는 **시스템의 뼈대와 확장 포인트만 준비된 상태**입니다.

---

## 한눈에 보는 핵심 개념

### 1. 관계는 두 종류다
이 시스템은 노드 간 관계를 두 종류로 분리합니다.

| 관계   | 필드                     | 의미                     | 언제 사용되는가                |
| ---- | ---------------------- | ---------------------- | ----------------------- |
| 선행조건 | `PrerequisiteNodeTags` | 노드가 한 번 해금되기 위해 필요한 조건 | 영구 해금 판정 시              |
| 의존   | `DependencyNodeTags`   | 노드가 현재 켜져 있기 위해 필요한 조건 | 활성화 / 활성 유지 / 연쇄 비활성화 시 |

중요한 차이:
- 선행조건은 한 번 만족되면 해금이 영구 유지됩니다.
- 의존은 현재 상태 조건입니다. 의존 노드가 꺼지면 해당 노드도 꺼집니다.

### 2. 상태는 4단계다
| 상태 | 의미 |
| --- | --- |
| `Locked` | 아직 해금되지 않음 |
| `Unlocked` | 해금은 되었지만 아직 한 번도 활성화하지 않음 |
| `Deactivated` | 과거에 활성화한 적이 있고 현재는 꺼져 있음 |
| `Activated` | 현재 켜져 있음 |

### 3. 비용은 첫 활성화 때만 든다
- `Unlocked -> Activated` 최초 활성화: 비용 필요
- `Deactivated -> Activated` 재활성화: 비용 없음
- `Activated -> Deactivated`: 환불 없음

### 4. 식별자는 `NodeTag`다
노드의 실제 식별자는 `FGameplayTag NodeTag`입니다.

예시:
- `TechTree.Crafting.Workbench`
- `TechTree.Light.EmergencyLamp`
- `TechTree.Cart.SpeedUpgrade`

중요한 점:
- 노드 식별은 **정확한 태그 일치** 기준입니다.
- 카테고리 분류는 **상위 태그 매칭**으로 처리할 수 있습니다.
- 즉, `TechTree.Crafting.Workbench`는 하나의 노드이면서 동시에 `TechTree.Crafting` 카테고리에 속합니다.

### 5. 수동 비활성화는 노드별로 허용된다
각 노드는 `bCanManuallyDeactivate`로 수동 비활성화 허용 여부를 가집니다.
- `true`: 플레이어나 외부 시스템이 직접 끌 수 있음
- `false`: 직접 끌 수 없음

단, 의존 관계 때문에 꺼지는 연쇄 비활성화는 이 값과 무관하게 발생합니다.

### 6. 자동 재활성화는 없다
의존 노드가 다시 켜져도 의존받는 노드는 자동으로 켜지지 않습니다.
다시 `TryActivateNode()`를 통해 수동으로 켜야 합니다.

### 7. 코어에는 UI 전용 데이터가 없다
현재 코어는 순수 테크트리 정의와 상태만 가집니다.

따라서:
- 연결선은 UI가 `PrerequisiteNodeTags`를 기준으로 계산합니다.
- 위치는 UI 계층이 별도 규칙이나 별도 데이터로 관리합니다.
- 연결선 전용 배열, 좌표 같은 UI 전용 필드는 코어에 존재하지 않습니다.

---

## 간단한 예시
예시 노드 구성:
- A: `TechTree.Crafting.Workbench`
- B: `TechTree.Crafting.AdvancedWorkbench`, `PrerequisiteNodeTags = [A]`
- C: `TechTree.Light.WorkbenchLamp`, `DependencyNodeTags = [A]`

동작:
1. 게임 시작 시 A는 선행조건이 없으므로 `Unlocked`가 됩니다.
2. A를 처음 활성화하면 비용을 내고 `Activated`가 됩니다.
3. A가 켜진 순간 B는 영구 해금되어 `Unlocked`가 됩니다.
4. C는 A가 켜져 있을 때만 활성화할 수 있습니다.
5. C를 한 번 활성화했다가 끄면 `Deactivated`가 됩니다.
6. A를 끄면 C도 의존 관계 때문에 함께 `Deactivated` 됩니다.
7. A를 다시 켜도 C는 자동으로 켜지지 않습니다.

이 예시에서 알 수 있는 핵심:
- B는 해금 관계
- C는 활성 유지 관계
- 두 관계는 같은 것이 아닙니다.

---

## 전체 구조

```text
AMyGameState
 └─ UTechTreeManagerComponent
     ├─ UDataTable (row type: FTechTreeNodeDefinition)
     ├─ ITechTreeCostProvider
     ├─ UTechTreeNodeExecutor
     ├─ UnlockedNodeTags
     ├─ PurchasedNodeTags
     ├─ ActivatedNodeTags
     ├─ RuntimeNodeDefinitions
     ├─ OrderedNodeTags
     └─ InvalidNodeTags

UBackroomCompanySaveGame
 ├─ UnlockedTechTreeNodeTags
 ├─ PurchasedTechTreeNodeTags
 └─ ActivatedTechTreeNodeTags

UGameSaveComponent
 ├─ SaveData()에서 진행 상태 저장
 ├─ LoadData()에서 진행 상태 복원
 ├─ OnGameOver()에서 최소 진행 상태 보존
 └─ LoadInitData()에서 전체 진행 초기화
```

역할 요약:
- `UDataTable`: 원본 노드 데이터
- `UTechTreeManagerComponent`: 상태 계산과 실행의 중심
- `ITechTreeCostProvider`: 창고/재화 시스템 연결점
- `UTechTreeNodeExecutor`: 노드별 실제 효과 연결점
- `UBackroomCompanySaveGame`: 세이브 파일 저장소

---

## 파일별 역할
| 파일                                                                     | 역할                              |
| ---------------------------------------------------------------------- | ------------------------------- |
| `Source/BackroomCompany/Public/TechTree/TechTreeTypes.h`               | enum, struct 등 공용 타입 정의         |
| `Source/BackroomCompany/Public/TechTree/TechTreeCostProvider.h`        | 비용 처리 인터페이스 정의                  |
| `Source/BackroomCompany/Public/TechTree/TechTreeNodeExecutor.h`        | executor 베이스 클래스 정의             |
| `Source/BackroomCompany/Private/TechTree/TechTreeNodeExecutor.cpp`     | executor 기본 구현                  |
| `Source/BackroomCompany/Public/TechTree/TechTreeManagerComponent.h`    | 매니저 공개 API, 멤버, delegate 선언     |
| `Source/BackroomCompany/Private/TechTree/TechTreeManagerComponent.cpp` | 매니저 실제 로직 구현                    |
| `Source/BackroomCompany/Public/MyGameState.h`                          | `TechTreeManager` 멤버와 getter 노출 |
| `Source/BackroomCompany/Private/MyGameState.cpp`                       | `TechTreeManager` 생성            |
| `Source/BackroomCompany/Public/BackroomCompanySaveGame.h`              | 테크트리 진행 상태 세이브 필드 정의            |
| `Source/BackroomCompany/Private/GameSaveComponent.cpp`                 | 저장/로드/게임오버/초기화와 테크트리 연결         |
| `Config/DefaultGameplayTags.ini`                                       | `TechTree.*` 태그 등록              |

---

# 타입 상세 설명

## `ETechTreeNodeState`
파일: `TechTreeTypes.h`

노드의 현재 상태를 표현하는 enum입니다.

| 값 | 의미 |
| --- | --- |
| `Locked` | 아직 해금되지 않음 |
| `Unlocked` | 영구 해금됨, 아직 미구매 |
| `Deactivated` | 과거 구매 및 활성화 이력 있음, 현재 비활성 |
| `Activated` | 현재 활성 |

설계 포인트:
- `Unlocked`는 현재 구현에서 영구 해금 목록 `UnlockedNodeTags`로 저장됩니다.
- `Deactivated`는 별도 배열로 저장되지 않고 `PurchasedNodeTags`에 있고 `ActivatedNodeTags`에는 없는 상태로 계산됩니다.

## `ETechTreeActivationResult`
파일: `TechTreeTypes.h`

활성화 시도 또는 활성화 가능 여부 검사 결과를 표현합니다.

| 값 | 의미 |
| --- | --- |
| `Success` | 성공 |
| `NotAuthority` | 서버 권한 없음 |
| `InvalidNode` | `NodeTag`가 정의에 없음 |
| `DefinitionInvalid` | 정의 검증 실패로 런타임에서 제외된 노드 |
| `AlreadyActivated` | 이미 활성 상태 |
| `Locked` | 아직 영구 해금되지 않음 |
| `DependencyInactive` | 의존 노드가 현재 활성 상태가 아님 |
| `CostProviderUnavailable` | 비용 provider가 연결되지 않음 |
| `InsufficientCost` | 비용 부족 |
| `ExecutorRejected` | executor 추가 조건이 거부함 |

## `ETechTreeDeactivationResult`
파일: `TechTreeTypes.h`

비활성화 시도 결과를 표현합니다.

| 값                            | 의미                  |
| ---------------------------- | ------------------- |
| `Success`                    | 성공                  |
| `NotAuthority`               | 서버 권한 없음            |
| `InvalidNode`                | `NodeTag`가 정의에 없음   |
| `DefinitionInvalid`          | 정의 검증 실패 노드         |
| `NotActivated`               | 현재 켜져 있지 않음         |
| `ManualDeactivationDisabled` | 수동 비활성화를 허용하지 않는 노드 |

## `FTechTreeItemCost`
파일: `TechTreeTypes.h`

노드의 아이템 비용 한 항목을 나타내는 구조체입니다.

| 변수 | 타입 | 의미 |
| --- | --- | --- |
| `ItemType` | `EItem` | 필요한 아이템 종류 |
| `RequiredCount` | `int32` | 필요한 개수 |

유효성 규칙:
- `ItemType == EItem::None` 이면 invalid
- `RequiredCount <= 0` 이면 invalid

주의:
- 동일 아이템 타입이 여러 번 입력되면 `NormalizeItemCosts()`에서 합산됩니다.
- 합산 과정은 `TMap`을 사용하므로 최종 배열 순서는 입력 순서를 보장하지 않습니다.

## `FTechTreeNodeDefinition`
파일: `TechTreeTypes.h`

테크트리 노드 하나의 원본 데이터를 담는 핵심 구조체이자 DataTable row 타입입니다.

구조:
- `FTableRowBase`를 상속합니다.
- 따라서 `UDataTable`의 row struct로 직접 사용할 수 있습니다.

| 변수                       | 타입                                   | 의미                          |
| ------------------------ | ------------------------------------ | --------------------------- |
| `NodeTag`                | `FGameplayTag`                       | 고유 노드 태그                    |
| `Name`                   | `FText`                              | 표시 이름                       |
| `Description`            | `FText`                              | 상세 설명                       |
| `PrerequisiteNodeTags`   | `TArray<FGameplayTag>`               | 영구 해금에 필요한 선행 노드 목록         |
| `DependencyNodeTags`     | `TArray<FGameplayTag>`               | 현재 활성 유지/재활성화에 필요한 의존 노드 목록 |
| `CurrencyCost`           | `int32`                              | 최초 활성화 시 재화 비용              |
| `ItemCosts`              | `TArray<FTechTreeItemCost>`          | 최초 활성화 시 아이템 비용 목록          |
| `bCanManuallyDeactivate` | `bool`                               | 수동 비활성화 허용 여부               |
| `ExecutorClass`          | `TSubclassOf<UTechTreeNodeExecutor>` | 노드 효과 실행기 클래스               |

설계 포인트:
- `NodeTag`가 실제 식별자입니다.
- `PrerequisiteNodeTags`는 unlock 조건입니다.
- `DependencyNodeTags`는 activate 유지 조건입니다.
- `ExecutorClass`가 `nullptr`이어도 노드는 상태적으로는 정상 동작합니다.
- `RowName`은 에디터에서 각 행을 구분하기 위한 보조 키일 뿐, 런타임 식별자나 save/load 기준은 아닙니다.
- save/load, 참조, 검증의 실제 기준은 `NodeTag`입니다.

## `FTechTreeNodeStateInfo`
파일: `TechTreeTypes.h`

전체 상태를 일괄 조회할 때 쓰는 단순 구조체입니다.

| 변수        | 타입                   | 의미        |
| --------- | -------------------- | --------- |
| `NodeTag` | `FGameplayTag`       | 대상 노드 태그  |
| `State`   | `ETechTreeNodeState` | 계산된 현재 상태 |

---

# DataTable 구성 설명

## 어떤 에셋을 만들어야 하나
테크트리 정의는 `FTechTreeNodeDefinition` row struct를 사용하는 `UDataTable` 에셋으로 관리합니다.

즉 구성은 아래와 같습니다.
- 테크트리 1개 = DataTable 1개
- 노드 1개 = DataTable row 1개
- 노드 참조 = `NodeTag` 값으로 연결

## row 입력 방식
각 row에 아래 값을 입력합니다.
- `NodeTag`
- `Name`
- `Description`
- `PrerequisiteNodeTags`
- `DependencyNodeTags`
- `CurrencyCost`
- `ItemCosts`
- `bCanManuallyDeactivate`
- `ExecutorClass`

## `RowName`과 `NodeTag`의 차이
중요:
- `RowName`은 사람이 보기 편한 라벨 정도로 생각하면 됩니다.
- 매니저는 `NodeTag`를 진짜 식별자로 사용합니다.
- 같은 `NodeTag`가 두 row에 들어가면 invalid 처리됩니다.

예시:
- RowName: `Workbench`
- NodeTag: `TechTree.Crafting.Workbench`

이 경우 런타임에서 의미 있는 값은 `TechTree.Crafting.Workbench`입니다.

## 태그 네이밍 규칙
권장 규칙:
- `TechTree.<Category>.<NodeName>`

예시:
- `TechTree.Cart.SpeedUpgrade`
- `TechTree.Light.EmergencyLamp`
- `TechTree.MothJelly.GrowthBoost`
- `TechTree.Crafting.Workbench`

카테고리 판별 예시:
- `TechTree.Crafting.Workbench`는 `TechTree.Crafting`에 속합니다.
- 외부 시스템은 `NodeTag.MatchesTag(TechTree.Crafting)` 방식으로 그룹핑할 수 있습니다.

## DataTable 행 순서는 신뢰하지 않는다
이 코어는 DataTable 입력 순서를 공개 순서로 사용하지 않습니다.
`GetAllNodeDefinitions()`와 `GetAllNodeStates()`는 항상 `NodeTag.ToString()` 사전순으로 정렬된 결과를 반환합니다.

즉:
- 행 순서는 관리 편의용일 뿐입니다.
- UI에서 안정적인 순서가 필요하면 태그 네이밍 체계까지 함께 고려해야 합니다.

## UI 연결선은 어떻게 계산하는가
코어는 연결선 데이터를 주지 않습니다.
UI는 각 노드의 `PrerequisiteNodeTags`를 보고 선을 계산하면 됩니다.

예시:
- 노드 `TechTree.Crafting.AdvancedWorkbench`의 `PrerequisiteNodeTags = [TechTree.Crafting.Workbench]`
- UI는 후행 노드에서 선행 노드로 선을 그리면 됩니다.
- 선행 노드가 없는 루트 노드는 연결선이 없습니다.

## UI 위치는 어디에 있는가
현재 코어에는 위치 데이터가 없습니다.
따라서 위치는 아래 중 하나로 UI가 해결해야 합니다.
- UI 내부 규칙으로 자동 배치
- 별도 UI 전용 DataTable/설정 데이터
- 위젯 블루프린트 내부 배치 데이터

---

# GameplayTag 설정 설명

## `DefaultGameplayTags.ini`
프로젝트는 config 기반 GameplayTag 등록 방식을 사용합니다.
현재 테크트리용 기본 루트 태그는 아래가 등록되어 있습니다.
- `TechTree`
- `TechTree.Cart`
- `TechTree.Light`
- `TechTree.MothJelly`
- `TechTree.Crafting`

의미:
- 카테고리 뼈대는 이미 준비되어 있습니다.
- 실제 노드용 leaf tag는 DataTable 작성 전에 config에 추가해야 합니다.

예시:
- `TechTree.Crafting.Workbench`
- `TechTree.Crafting.AdvancedWorkbench`
- `TechTree.Light.EmergencyLamp`

---

# 비용 처리 인터페이스 설명

## `UTechTreeCostProvider` / `ITechTreeCostProvider`
파일: `TechTreeCostProvider.h`

테크트리 코어가 외부 비용 시스템과 연결되는 인터페이스입니다.

왜 필요한가:
- 테크트리 코어는 창고 구조를 모릅니다.
- 테크트리 코어는 돈이 어디 저장되는지 모릅니다.
- 테크트리 코어는 인벤토리/보관소의 실제 구현을 몰라도 되어야 합니다.

그래서 비용 검증과 차감은 외부 구현체에게 위임합니다.

### 함수
| 함수 | 반환값 | 역할 |
| --- | --- | --- |
| `CanAffordNodeActivation(const UTechTreeManagerComponent*, const FTechTreeNodeDefinition&) const` | `ETechTreeActivationResult` | 최초 활성화 비용을 지불 가능한지 검사 |
| `ConsumeNodeActivationCost(UTechTreeManagerComponent*, const FTechTreeNodeDefinition&)` | `ETechTreeActivationResult` | 최초 활성화 비용을 실제 차감 |

기본 구현:
- 두 함수 모두 기본값으로 `CostProviderUnavailable`을 반환합니다.
- 즉, provider를 연결하지 않으면 첫 활성화는 항상 실패합니다.

중요한 점:
- 비용 provider는 **첫 활성화 때만 호출**됩니다.
- 이미 `Purchased` 상태인 노드의 재활성화에는 호출되지 않습니다.
- provider 객체는 `UObject`여야 하며 `UTechTreeCostProvider` 인터페이스를 구현해야 합니다.

---

# 노드 효과 executor 설명

## `UTechTreeNodeExecutor`
파일: `TechTreeNodeExecutor.h`, `TechTreeNodeExecutor.cpp`

노드별 실제 게임 효과를 외부 클래스로 분리하기 위한 베이스 클래스입니다.

클래스 특성:
- `Blueprintable`
- `EditInlineNew`
- `DefaultToInstanced`

의미:
- C++ / Blueprint 양쪽에서 파생 클래스를 만들 수 있습니다.
- 노드마다 다른 executor 클래스를 지정할 수 있습니다.

### 함수
| 함수 | 역할 | 기본 구현 |
| --- | --- | --- |
| `CanActivate(...) const` | 추가 조건 검사 | `Success` 반환 |
| `ApplyActivation(...)` | 활성화 직후 효과 적용 | no-op |
| `ApplyDeactivation(...)` | 비활성화 직후 효과 해제 | no-op |
| `ReapplyOnLoad(...)` | 로드 후 현재 활성 효과 재적용 | no-op |

중요한 점:
- executor 인스턴스는 필요할 때마다 `NewObject`로 새로 생성됩니다.
- 즉, executor 내부에 장기 상태를 저장하는 구조가 아닙니다.
- 상태 저장이 필요하면 다른 시스템이나 세이브 데이터에 보관해야 합니다.

호출 시점:
- `CanActivateNode()` 중 `CanActivate()`
- `TryActivateNode()` 중 `ApplyActivation()`
- `TryDeactivateNode()` / 연쇄 비활성화 중 `ApplyDeactivation()`
- `LoadNodeProgress()` 이후 `ReapplyActivatedNodes()` 중 `ReapplyOnLoad()`

---

# 핵심 매니저 설명

## `UTechTreeManagerComponent`
파일: `TechTreeManagerComponent.h`, `TechTreeManagerComponent.cpp`

테크트리 시스템의 중심 컴포넌트입니다.

이 컴포넌트가 담당하는 일:
- DataTable 읽기
- 노드 정의 검증
- 런타임 캐시 구성
- 영구 해금 상태 관리
- 구매 상태 관리
- 현재 활성 상태 관리
- 활성화/비활성화 가능 여부 판단
- 비용 provider 호출
- executor 호출
- 복제
- 저장/로드 복원

왜 `GameState`에 붙는가:
- 테크트리는 플레이어 개인 상태가 아니라 세션 공유형 상태입니다.
- 모든 플레이어가 같은 Hub 진행도를 보아야 하므로 `AMyGameState`에 부착했습니다.

## delegate 설명
| delegate | 파라미터 | 의미 |
| --- | --- | --- |
| `OnTechTreeInitialized` | 없음 | `BeginPlay()`에서 런타임 정의 구성 완료 후 호출 |
| `OnNodeActivated` | `FGameplayTag NodeTag` | 새로 켜진 노드가 있을 때 호출 |
| `OnNodeDeactivated` | `FGameplayTag NodeTag` | 새로 꺼진 노드가 있을 때 호출 |

중요한 점:
- 활성/비활성 이벤트는 `ActivatedNodeTags` 변화만 기준으로 발생합니다.
- 해금(`Unlocked`)이나 구매(`Purchased`) 변화 전용 delegate는 현재 없습니다.

## 멤버 변수 설명

### 설정 및 복제 대상
| 변수 | 타입 | 의미 |
| --- | --- | --- |
| `TechTreeDefinitionTable` | `UDataTable*` | 원본 노드 정의 DataTable |
| `UnlockedNodeTags` | `TArray<FGameplayTag>` | 영구 해금된 노드 목록 |
| `PurchasedNodeTags` | `TArray<FGameplayTag>` | 비용을 한 번이라도 지불한 노드 목록 |
| `ActivatedNodeTags` | `TArray<FGameplayTag>` | 현재 활성 노드 목록 |
| `CostProviderObject` | `TObjectPtr<UObject>` | 비용 provider 객체 참조 |

설명:
- `UnlockedNodeTags`, `PurchasedNodeTags`, `ActivatedNodeTags`는 모두 복제됩니다.
- 세 배열 모두 `OnRep_NodeProgress()`를 공유합니다.
- `CostProviderObject`는 `Transient`이며 저장/복제되지 않습니다.

### 런타임 캐시
| 변수 | 타입 | 의미 |
| --- | --- | --- |
| `RuntimeNodeDefinitions` | `TMap<FGameplayTag, FTechTreeNodeDefinition>` | 검증 통과한 노드 정의 맵 |
| `OrderedNodeTags` | `TArray<FGameplayTag>` | 유효한 노드의 정렬된 순서 |
| `InvalidNodeTags` | `TSet<FGameplayTag>` | 검증 실패 노드 태그 집합 |
| `PreviousActivatedNodeTags` | `TArray<FGameplayTag>` | 이전 활성 목록. 복제 delta 계산용 |

## 공개 함수 설명

### 생성/초기화/복제
| 함수 | 역할 |
| --- | --- |
| `UTechTreeManagerComponent()` | Tick 비활성화, 기본 복제 활성화 |
| `BeginPlay()` | 런타임 정의 초기화, 서버에서 초기 해금 갱신, 이전 활성 목록 초기화, 초기화 delegate 브로드캐스트 |
| `GetLifetimeReplicatedProps(...) const` | `UnlockedNodeTags`, `PurchasedNodeTags`, `ActivatedNodeTags` 복제 등록 |

`BeginPlay()`의 핵심:
- 서버에서는 `UpdateUnlockedNodes()`를 호출해 루트 노드처럼 선행조건이 없는 노드를 `Unlocked`로 만듭니다.
- 이후 `OnTechTreeInitialized`가 호출됩니다.

### 비용 provider 연결
| 함수 | 역할 |
| --- | --- |
| `SetCostProvider(UObject* InCostProvider)` | 인터페이스를 구현한 provider 등록. 성공 시 `true` |
| `ClearCostProvider()` | 등록된 provider 해제 |

`SetCostProvider()`의 실패 조건:
- `InCostProvider`가 invalid
- `UTechTreeCostProvider` 인터페이스를 구현하지 않음

### 진행 상태 초기화/로드
| 함수 | 역할 |
| --- | --- |
| `ResetNodeProgress()` | `Unlocked / Purchased / Activated`를 모두 지우고 루트 노드를 다시 해금 |
| `ResetActivatedNodes()` | 구 호출부 호환용 래퍼. 현재는 `ResetNodeProgress()` 호출 |
| `LoadNodeProgress(...)` | 저장된 `Unlocked / Purchased / Activated` 3종 상태 복원 |
| `LoadActivatedNodeTags(...)` | 입력 배열을 3종 상태 모두로 간주하는 간편 래퍼 |

`ResetNodeProgress()` 특징:
- 서버 권한에서만 동작합니다.
- 단순히 비우는 것이 아니라 `UpdateUnlockedNodes()`를 다시 호출합니다.
- 따라서 선행조건이 없는 노드는 초기화 직후 `Unlocked`가 됩니다.

`LoadNodeProgress()` 특징:
- 저장된 태그 중 invalid 노드는 무시합니다.
- `Activated`에 들어 있는 노드는 자동으로 `Unlocked`, `Purchased`에도 포함시킵니다.
- 복원 후 `UpdateUnlockedNodes()`를 호출해 추가로 영구 해금 가능한 노드를 보정합니다.
- 이어서 `PruneActivatedNodesWithInactiveDependencies()`로 의존이 깨진 활성 노드를 제거합니다.
- 마지막으로 `ReapplyActivatedNodes()`를 호출해 현재 활성 노드 효과만 복원합니다.

### 활성화/비활성화
| 함수 | 반환값 | 역할 |
| --- | --- | --- |
| `CanActivateNode(FGameplayTag NodeTag) const` | `ETechTreeActivationResult` | 지금 활성화 가능한지 검사 |
| `TryActivateNode(FGameplayTag NodeTag)` | `ETechTreeActivationResult` | 실제 활성화 수행 |
| `CanDeactivateNode(FGameplayTag NodeTag) const` | `ETechTreeDeactivationResult` | 지금 수동 비활성화 가능한지 검사 |
| `TryDeactivateNode(FGameplayTag NodeTag)` | `ETechTreeDeactivationResult` | 실제 수동 비활성화 수행 |

`CanActivateNode()` 검사 순서:
1. 서버 권한 확인
2. 노드 존재 확인
3. invalid 노드 여부 확인
4. 이미 활성인지 확인
5. 영구 해금 여부 확인
6. 의존 노드가 현재 모두 켜져 있는지 확인
7. 아직 구매 전이면 비용 provider 존재 및 비용 지불 가능 여부 확인
8. executor 추가 조건 확인

`TryActivateNode()` 동작:
- `CanActivateNode()`를 먼저 호출합니다.
- 최초 활성화라면 provider를 통해 비용을 차감하고 `PurchasedNodeTags`에 등록합니다.
- executor가 있으면 `ApplyActivation()`을 호출합니다.
- `ActivatedNodeTags`에 추가합니다.
- `UpdateUnlockedNodes()`를 호출해 이번 활성화로 새로 해금되는 노드를 반영합니다.
- 활성/비활성 delegate를 브로드캐스트합니다.

재활성화 동작:
- 노드가 이미 `Purchased` 상태이면 비용 provider를 호출하지 않습니다.
- 즉, `Deactivated -> Activated`는 무료입니다.

`CanDeactivateNode()` 검사 순서:
1. 서버 권한 확인
2. 노드 존재 확인
3. invalid 노드 여부 확인
4. 현재 활성 상태인지 확인
5. `bCanManuallyDeactivate` 확인

`TryDeactivateNode()` 동작:
- 수동으로 끄려는 대상 노드의 검사만 `CanDeactivateNode()`를 통과해야 합니다.
- 이후 `DeactivateNodeAndDependents()`를 호출해 의존 노드를 재귀적으로 함께 끕니다.
- 연쇄 비활성화되는 자식 노드는 `bCanManuallyDeactivate`가 false여도 꺼집니다.

### 조회 함수
| 함수 | 역할 |
| --- | --- |
| `IsNodeUnlocked(FGameplayTag NodeTag) const` | 영구 해금 여부 확인 |
| `IsNodePurchased(FGameplayTag NodeTag) const` | 구매 여부 확인 |
| `IsNodeActivated(FGameplayTag NodeTag) const` | 현재 활성 여부 확인 |
| `GetNodeState(FGameplayTag NodeTag) const` | 현재 상태를 계산해 반환 |
| `GetNodeDefinitionByTag(FGameplayTag NodeTag, FTechTreeNodeDefinition& OutNodeDefinition) const` | 특정 노드 정의 복사 반환 |
| `GetAllNodeDefinitions() const` | 모든 유효 노드 정의를 순서대로 반환 |
| `GetAllNodeStates() const` | 모든 유효 노드의 현재 상태 반환 |
| `GetUnlockedNodeTags() const` | 영구 해금 목록 반환 |
| `GetPurchasedNodeTags() const` | 구매 목록 반환 |
| `GetActivatedNodeTags() const` | 현재 활성 목록 반환 |

`GetNodeState()` 우선순위:
1. invalid 또는 미존재 노드면 `Locked`
2. 활성 상태면 `Activated`
3. 구매했지만 비활성이면 `Deactivated`
4. 해금됐지만 미구매면 `Unlocked`
5. 나머지는 `Locked`

## 보호/비공개 함수 설명

### 복제 콜백
| 함수 | 역할 |
| --- | --- |
| `OnRep_NodeProgress()` | 클라이언트에서 복제된 진행 상태 수신 시 활성/비활성 delta 이벤트 계산 |

설명:
- `Unlocked`나 `Purchased` 변경 전용 이벤트는 보내지 않습니다.
- 비교 기준은 `PreviousActivatedNodeTags`와 현재 `ActivatedNodeTags`입니다.

### 런타임 정의 구성
| 함수 | 역할 |
| --- | --- |
| `InitializeRuntimeDefinitions()` | DataTable을 읽어 런타임 캐시 구성 및 검증 수행 |
| `NormalizeItemCosts(TArray<FTechTreeItemCost>&)` | 동일 아이템 비용 합산 |

`InitializeRuntimeDefinitions()` 단계:
1. 캐시 초기화
2. `TechTreeDefinitionTable` 유효성 확인
3. DataTable row struct가 `FTechTreeNodeDefinition`인지 확인
4. 모든 row 수집
5. `NodeTag` 중복 수집
6. 1차 런타임 맵 구성
7. 비용/참조/순환 검증
8. invalid 노드 제거
9. item cost 정규화
10. `NodeTag.ToString()` 사전순으로 `OrderedNodeTags` 구성

`InitializeRuntimeDefinitions()`의 안전장치:
- DataTable이 비어 있거나 미설정이면 빈 테크트리로 시작합니다.
- DataTable row struct가 다르면 경고를 남기고 초기화를 중단합니다.

### 진행 상태 보정
| 함수 | 역할 |
| --- | --- |
| `UpdateUnlockedNodes()` | 현재 활성 상태를 바탕으로 새로 영구 해금 가능한 노드 추가 |
| `PruneActivatedNodesWithInactiveDependencies()` | 의존이 깨진 활성 노드 제거 |
| `BroadcastNodeProgressChanges(const TArray<FGameplayTag>&)` | 이전 활성 목록과 비교해 activation / deactivation 이벤트 발행 |
| `ReapplyActivatedNodes()` | 현재 활성 노드 executor의 `ReapplyOnLoad()` 실행 |

`UpdateUnlockedNodes()` 특징:
- 해금 조건은 `AreAllPrerequisitesActivated()`입니다.
- 이미 해금된 노드는 다시 검사하지 않습니다.
- 즉, 이 함수는 해금을 되돌리지 않습니다.

`PruneActivatedNodesWithInactiveDependencies()` 특징:
- 한 노드 제거가 다른 노드의 의존 실패를 만들 수 있으므로 안정화될 때까지 반복합니다.
- 주로 로드 직후 저장 상태를 정리할 때 사용됩니다.

### 비활성화 재귀 처리
| 함수 | 역할 |
| --- | --- |
| `DeactivateNodeAndDependents(FGameplayTag NodeTag, TSet<FGameplayTag>& ProcessedNodeTags)` | 대상 노드와 의존 자식 노드를 재귀적으로 비활성화 |
| `AddUniqueNodeTag(TArray<FGameplayTag>&, FGameplayTag) const` | 배열에 중복 없이 태그 추가 |
| `RemoveNodeTag(TArray<FGameplayTag>&, FGameplayTag) const` | 배열에서 태그 제거 |

`DeactivateNodeAndDependents()` 특징:
- 먼저 자기 자신을 끕니다.
- executor가 있으면 `ApplyDeactivation()`을 호출합니다.
- 이후 `DependencyNodeTags`에 자신을 포함한 현재 활성 노드를 찾아 재귀적으로 끕니다.
- `ProcessedNodeTags`는 중복 재귀를 막는 안전장치입니다.

### 노드 조회/검증 함수
| 함수 | 역할 |
| --- | --- |
| `FindNodeDefinition(FGameplayTag NodeTag) const` | 런타임 정의 맵에서 노드 조회 |
| `AreAllPrerequisitesActivated(const FTechTreeNodeDefinition&) const` | 선행조건이 현재 모두 활성인지 확인 |
| `AreAllDependenciesActivated(const FTechTreeNodeDefinition&) const` | 의존 노드가 현재 모두 활성인지 확인 |
| `HasPrerequisiteCycle(FGameplayTag NodeTag) const` | 선행조건 그래프 순환 검사 |
| `HasDependencyCycle(FGameplayTag NodeTag) const` | 의존 그래프 순환 검사 |
| `DoesNodeReachTargetThroughPrerequisites(...) const` | 선행조건 DFS 탐색 |
| `DoesNodeReachTargetThroughDependencies(...) const` | 의존 DFS 탐색 |
| `IsDefinitionTagInvalid(FGameplayTag NodeTag) const` | invalid 노드인지 확인 |

중요한 점:
- 선행조건 판정은 `Activated` 기준입니다. `Unlocked`만으로는 다른 노드를 해금시키지 못합니다.
- 의존 판정도 `Activated` 기준입니다. `Deactivated`는 의존 충족으로 보지 않습니다.
- 노드 참조는 exact match입니다. 상위 태그 매칭으로 노드를 찾지 않습니다.

---

# 런타임 흐름 설명

## 1. 시작 시 초기화
`BeginPlay()`에서 수행되는 일:
1. 복제 활성화
2. `InitializeRuntimeDefinitions()` 실행
3. 서버라면 `UpdateUnlockedNodes()` 실행
4. `PreviousActivatedNodeTags` 저장
5. `OnTechTreeInitialized` 브로드캐스트

결과:
- 선행조건이 없는 루트 노드는 시작 시 `Unlocked`
- 정의가 잘못된 노드는 런타임에서 제거

## 2. 첫 활성화 흐름
1. `CanActivateNode()` 검사
2. 비용 provider로 구매 가능 여부 확인
3. 비용 provider로 실제 차감
4. executor `ApplyActivation()` 호출
5. `PurchasedNodeTags`와 `ActivatedNodeTags` 갱신
6. `UpdateUnlockedNodes()` 호출
7. activation event 브로드캐스트

## 3. 재활성화 흐름
1. 노드가 `Purchased` 상태인지 확인됨
2. 비용 provider 생략
3. executor `ApplyActivation()` 호출
4. `ActivatedNodeTags` 갱신
5. activation event 브로드캐스트

## 4. 수동 비활성화 흐름
1. `CanDeactivateNode()`로 수동 비활성화 가능 여부 확인
2. executor `ApplyDeactivation()` 호출
3. 본인 `ActivatedNodeTags` 제거
4. 자신을 의존하던 활성 노드를 재귀적으로 함께 제거
5. deactivation event 브로드캐스트

## 5. 로드 흐름
1. 세이브에서 `Unlocked / Purchased / Activated` 태그 목록을 읽음
2. `LoadNodeProgress()`로 전달
3. invalid 노드 제거
4. `Activated` 노드를 `Unlocked`, `Purchased`에도 보정
5. `UpdateUnlockedNodes()` 실행
6. `PruneActivatedNodesWithInactiveDependencies()` 실행
7. 활성 노드 executor의 `ReapplyOnLoad()` 실행
8. activation / deactivation event 브로드캐스트

---

# 정의 검증 규칙
`InitializeRuntimeDefinitions()`에서 아래를 검사합니다.

| 검증 항목 | 설명 |
| --- | --- |
| row struct 일치 | DataTable row type이 `FTechTreeNodeDefinition`이어야 함 |
| `NodeTag` valid | 비어 있는 태그는 허용되지 않음 |
| 중복 `NodeTag` 금지 | 같은 태그 두 개 이상 금지 |
| `CurrencyCost >= 0` | 음수 비용 금지 |
| 아이템 비용 유효성 | `EItem::None`, `RequiredCount <= 0` 금지 |
| 선행 참조 유효성 | 존재하지 않는 `PrerequisiteNodeTags` 금지 |
| 의존 참조 유효성 | 존재하지 않는 `DependencyNodeTags` 금지 |
| 선행 순환 금지 | A -> B -> A 형태 금지 |
| 의존 순환 금지 | A depends on B, B depends on A 금지 |

invalid 처리 결과:
- `InvalidNodeTags`에 기록됩니다.
- `RuntimeNodeDefinitions`에서 제거됩니다.
- `GetAllNodeDefinitions()`와 `GetAllNodeStates()`에 나오지 않습니다.
- 상태 조회 시 사실상 `Locked`처럼 보입니다.
- 활성화/비활성화 대상이 될 수 없습니다.

---

# `AMyGameState` 연동 설명
파일: `MyGameState.h`, `MyGameState.cpp`

테크트리와 직접 관련된 부분은 크지 않습니다. 핵심은 매니저를 생성하고 외부에서 접근할 수 있게 하는 것입니다.

## 관련 멤버
| 위치 | 이름 | 의미 |
| --- | --- | --- |
| `MyGameState.h` | `UTechTreeManagerComponent* TechTreeManager` | GameState가 소유하는 테크트리 매니저 |
| `MyGameState.h` | `GetTechTreeManager() const` | 외부 시스템 접근용 getter |
| `MyGameState.cpp` | `CreateDefaultSubobject<UTechTreeManagerComponent>("TechTreeManager")` | 생성자에서 매니저 생성 |

설계 의미:
- 세션 공유 상태이므로 GameState 소유가 적절합니다.
- UI, 저장 시스템, 후속 게임플레이 시스템은 `GetTechTreeManager()`로 접근합니다.

---

# 세이브 데이터 설명

## `UBackroomCompanySaveGame`
파일: `BackroomCompanySaveGame.h`

테크트리 관련 세이브 필드는 아래 3개입니다.

| 변수 | 의미 |
| --- | --- |
| `UnlockedTechTreeNodeTags` | 영구 해금된 노드 |
| `PurchasedTechTreeNodeTags` | 비용을 지불한 노드 |
| `ActivatedTechTreeNodeTags` | 현재 켜져 있는 노드 |

버전 정보:
- `LatestVersion = 207021`

의미:
- `NodeTag` 기반 저장 포맷으로 전환되면서 세이브 버전이 올라갔습니다.
- 아직 라이브 기능이 아니므로 구버전 `NodeId` 기반 테크트리 세이브 마이그레이션은 제공하지 않습니다.

## `UGameSaveComponent`
파일: `GameSaveComponent.cpp`

### 관련 함수
| 함수 | 역할 |
| --- | --- |
| `SaveData()` | 현재 진행 상태 저장 |
| `LoadData()` | 세이브 파일에서 진행 상태 로드 |
| `OnGameOver()` | 게임오버 상황에서도 최소 진행 상태 보존 |
| `LoadInitData(bool bIsGameOvered)` | 새 시작/초기화 시 테크트리 상태 리셋 |

### `SaveData()`
저장하는 값:
- `UnlockedTechTreeNodeTags`
- `PurchasedTechTreeNodeTags`
- `ActivatedTechTreeNodeTags`

### `LoadData()`
로드 방식:
1. 세이브에서 세 배열을 읽음
2. `TechTreeManager->LoadNodeProgress(...)` 호출

주의:
- 구버전 `NodeId` 기반 테크트리 데이터 승격 로직은 없습니다.
- 예전 포맷의 테크트리 진행도는 유지되지 않습니다.

### `OnGameOver()`
게임오버 세이브에도 테크트리 3종 상태를 저장합니다.
즉, 게임오버가 나도 정책상 유지해야 하는 진행도는 남길 수 있습니다.

### `LoadInitData()`
초기화 시 `TechTreeManager->ResetNodeProgress()`를 호출합니다.
이 함수는 모든 진행도를 비우고 루트 노드만 다시 해금합니다.

---

# 후속 구현자가 붙는 방법

## UI 담당자
주로 사용할 API:
- `GetAllNodeDefinitions()`
- `GetAllNodeStates()`
- `GetNodeDefinitionByTag()`
- `GetNodeState()`
- `CanActivateNode()`
- `TryActivateNode()`
- `CanDeactivateNode()`
- `TryDeactivateNode()`
- `OnTechTreeInitialized`
- `OnNodeActivated`
- `OnNodeDeactivated`

주의:
- 현재 활성/비활성 API는 서버 권한 기준입니다.
- 클라이언트 UI에서 직접 호출하면 `NotAuthority`가 나옵니다.
- 실제 UI에서는 PlayerController나 상호작용 액터를 통한 서버 RPC 래퍼가 필요합니다.
- 연결선은 `PrerequisiteNodeTags`를 기준으로 계산해야 합니다.
- 위치 정보는 코어가 주지 않으므로 UI 측 배치 규칙이 필요합니다.
- 카테고리 탭/필터는 `NodeTag.MatchesTag(TechTree.Crafting)` 같은 방식으로 구현하면 됩니다.

## 비용 시스템 담당자
할 일:
- `ITechTreeCostProvider` 구현체 작성
- `CanAffordNodeActivation()`에서 비용 가능 여부 판단
- `ConsumeNodeActivationCost()`에서 실제 차감 수행
- 서버에서 `SetCostProvider()`로 매니저에 등록

## 노드 효과 담당자
할 일:
- `UTechTreeNodeExecutor` 파생 클래스 작성
- `CanActivate()`에서 추가 조건 검사
- `ApplyActivation()`에서 효과 적용
- `ApplyDeactivation()`에서 효과 해제
- `ReapplyOnLoad()`에서 로드 후 복원
- 노드의 `ExecutorClass`에 해당 클래스 지정

---

# 자주 헷갈리는 포인트

## `PrerequisiteNodeTags`와 `DependencyNodeTags`는 같은가?
아닙니다.
- `PrerequisiteNodeTags`: 해금 조건
- `DependencyNodeTags`: 현재 ON 유지 조건

## `Unlocked`와 `Deactivated`는 같은가?
아닙니다.
- `Unlocked`: 아직 한 번도 돈을 내고 켠 적 없음
- `Deactivated`: 과거에 켠 적 있어서 재활성화가 무료

## 의존 노드가 다시 켜지면 자동 복구되는가?
아닙니다. 자동 재활성화는 없습니다.

## `NodeTag`는 카테고리 태그와 같은가?
하나의 노드는 leaf tag 하나를 가집니다. 카테고리는 그 상위 태그로 표현됩니다.
예를 들어 `TechTree.Crafting.Workbench`는 노드이면서 동시에 `TechTree.Crafting` 카테고리에 속합니다.

## 노드 찾기에 `MatchesTag`를 쓰는가?
아닙니다. 노드 참조와 상태 조회는 exact match 기준입니다.
`MatchesTag`는 그룹핑/필터링 용도입니다.

## UI 연결선 데이터는 어디 있는가?
코어에는 없습니다. `PrerequisiteNodeTags`를 기준으로 UI가 계산해야 합니다.

## UI 위치 데이터는 어디 있는가?
코어에는 없습니다. UI가 별도 규칙이나 별도 데이터로 처리해야 합니다.

## invalid 노드는 어떻게 보이는가?
런타임에서 제거되며 외부에서는 거의 `Locked`처럼 보입니다.

## `OnNodeActivated`, `OnNodeDeactivated`는 해금도 알려주는가?
아닙니다. 현재 활성 상태 변화만 알려줍니다.

---

# 현재 프레임워크의 한계와 주의사항
- UI는 아직 없습니다.
- 창고 연동은 아직 없습니다.
- 비용 provider 기본 구현은 아무 것도 하지 않습니다.
- executor 기본 구현도 아무 것도 하지 않습니다.
- per-player 진행도는 지원하지 않습니다.
- 노드 해금/구매 전용 이벤트는 없습니다.
- `PruneActivatedNodesWithInactiveDependencies()`는 로드 시 상태 보정용입니다.
- 노드를 끄는 경로는 반드시 매니저 API를 통하는 것이 안전합니다. 배열을 직접 수정하면 연쇄 비활성화와 이벤트가 누락될 수 있습니다.
- DataTable 행 순서는 코어의 반환 순서를 보장하지 않습니다. 코어는 `NodeTag.ToString()` 사전순을 사용합니다.
- 새 노드를 추가할 때는 DataTable row 작성과 함께 GameplayTag config 등록도 필요합니다.

---

# 요약
현재 Hub 테크트리 코어는 아래를 보장합니다.
- DataTable 기반 노드 정의
- `GameplayTag` 기반 노드 식별
- 선행조건 기반 영구 해금
- 의존 기반 활성 유지
- 최초 비용 지불, 이후 무료 재활성화
- 수동 비활성화와 의존 연쇄 비활성화
- 복제, 저장, 로드
- 비용 처리와 실제 효과 구현의 외부 위임
- UI 전용 데이터가 제거된 순수 코어 구조

즉, 지금 구조는 UI, 창고, 제작, 실제 해금 효과가 이후 단계에서 독립적으로 붙을 수 있도록 만든 **견고한 코어 프레임워크**입니다.

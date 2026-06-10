[Automation System User Guide | Unreal Engine Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-system-user-guide-in-unreal-engine?application_version=5.6)

# 개요
`Automation Test`는 에디터와 커맨드라인에서 반복 가능한 검증을 실행하기 위한 테스트 시스템이다.
언리얼 프로젝트가 커지면 수동 PIE 확인만으로는 회귀를 잡기 어렵기 때문에, 작은 C++ 테스트와 에디터 테스트를 분리해서 쌓는 것이 좋다.

# 테스트 종류
| 종류 | 특징 | 사용 예 |
| --- | --- | --- |
| Simple Automation Test | 단일 테스트 함수 | 순수 로직, 작은 유틸 검증 |
| Complex Automation Test | 여러 파라미터/케이스 생성 | 에셋, 맵, 데이터 테이블 일괄 검증 |
| Functional Test | 레벨 안에서 실행 | gameplay scenario, AI 이동 |
| Editor Test | 에디터 context 필요 | asset import, blueprint compile |
| Runtime Test | 런타임 모듈에서 실행 | 엔진/게임 로직 회귀 |

# 기본 C++ 구조
```cpp
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FMyGameplayRuleTest,
    "Project.Gameplay.Rule.MyRule",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FMyGameplayRuleTest::RunTest(const FString& Parameters)
{
    TestEqual(TEXT("Damage"), ComputeDamage(10, 2), 20);
    return true;
}
```

# 플래그 감각
| 플래그 | 의미 |
| --- | --- |
| `EditorContext` | 에디터 환경에서 실행 |
| `ClientContext` | 클라이언트 context |
| `ServerContext` | 서버 context |
| `EngineFilter` | 엔진/프로젝트 기본 테스트 목록 |
| `ProductFilter` | 제품 품질 검증 |
| `SmokeFilter` | 빠른 smoke 테스트 |
| `StressFilter` | 오래 걸릴 수 있는 스트레스 테스트 |
| `RequiresUser` | 사용자 개입 필요 |

# 우선 적용할 테스트 후보
- GameplayTag/DataTable/DataAsset 필수 row 검증.
- GAS ability grant/cost/cooldown 데이터 무결성 검증.
- Blueprint compile 또는 parent class 누락 검증.
- 중요한 map load smoke test.
- serialization/cook에서 빠지면 안 되는 primary asset 검증.

> [!caution]
> automation test는 테스트 대상이 deterministic해야 가치가 있다. 랜덤, 시간, 네트워크, async load가 섞인 테스트는 seed와 timeout 기준을 먼저 고정해야 한다.

# 커맨드라인 관점
AutomationController는 `RunTests` 명령을 통해 테스트 큐를 실행한다.
CI를 붙일 때는 에디터 실행 옵션, test filter, report output, timeout, crash log 수집을 한 묶음으로 봐야 한다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\AutomationTest\Public\Misc\AutomationTest.h`: automation test 기본 매크로와 base.
- `Engine\Source\Developer\AutomationController\Public\IAutomationControllerModule.h`: controller module 인터페이스.
- `Engine\Source\Developer\AutomationController\Private\AutomationControllerManager.cpp`: `RunTests` 실행 관리.
- `Engine\Source\Developer\AutomationController\Private\AutomationCommandline.cpp`: commandline parsing.
- `Engine\Plugins\Tests\EditorTests\Source\EditorTests\Private\UnrealEd\BlueprintAutomationTests.cpp`: blueprint compile test 예시.
- `Engine\Source\Editor\UnrealEd\Private\Tests\AutomationEditorCommon.cpp`: editor 공통 테스트 예시.

## 2026-05-12 심화 보강: 테스트를 실제로 추가하는 법

# 학습 목표
이 문서의 목표는 자동화 테스트를 “있는 기능”으로 아는 것이 아니라, 작은 검증 하나를 직접 추가하고 실행하는 것이다.
최소 목표는 다음 세 가지다.

- `IMPLEMENT_SIMPLE_AUTOMATION_TEST`가 어떤 객체를 등록하는지 이해한다.
- 에셋/데이터 검증 테스트를 어디에 두면 좋은지 판단한다.
- 테스트 실패 로그를 보고 어떤 데이터가 깨졌는지 찾는다.

# 사용법 1: 프로젝트 모듈에 간단한 로직 테스트 추가
가장 작은 테스트는 순수 함수 검증이다.
예를 들어 대미지 계산 유틸이 있다면 아래처럼 테스트할 수 있다.

```cpp
#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FDamageFormulaTest,
    "Project.Gameplay.Damage.Formula",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FDamageFormulaTest::RunTest(const FString& Parameters)
{
    const int32 BaseDamage = 100;
    const float Multiplier = 1.5f;
    const int32 Result = FMath::RoundToInt(BaseDamage * Multiplier);

    TestEqual(TEXT("100 damage with 1.5 multiplier"), Result, 150);
    return true;
}
#endif
```

## 배치 위치
테스트 코드는 보통 아래 중 하나에 둔다.

| 위치 | 장점 | 주의 |
| --- | --- | --- |
| 게임 모듈 `Private/Tests` | 프로젝트 코드에 접근하기 쉽다 | shipping build에 섞이지 않게 guard 필요 |
| 별도 test module | 의존성과 빌드 대상을 분리하기 좋다 | `.Build.cs`, `.uproject` 설정이 늘어난다 |
| plugin test module | 재사용 plugin 검증에 적합 | runtime/editor 의존성 분리 필요 |

# 사용법 2: DataTable 필수 Row 검증
실무에서 가장 효과가 큰 테스트는 “데이터가 빠지면 바로 알려주는 테스트”다.
예를 들어 스킬 데이터 테이블에 필수 row가 있어야 한다면 아래 패턴을 쓴다.

```cpp
#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Engine/DataTable.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FSkillDataTableSmokeTest,
    "Project.Data.Skill.RequiredRows",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FSkillDataTableSmokeTest::RunTest(const FString& Parameters)
{
    const FStringAssetReference TablePath(TEXT("/Game/Data/DT_Skill.DT_Skill"));
    UDataTable* Table = Cast<UDataTable>(TablePath.TryLoad());
    TestNotNull(TEXT("Skill data table must load"), Table);

    if (!Table)
    {
        return false;
    }

    TestTrue(TEXT("Attack.Light row exists"), Table->GetRowMap().Contains(FName("Attack.Light")));
    TestTrue(TEXT("Attack.Heavy row exists"), Table->GetRowMap().Contains(FName("Attack.Heavy")));
    return true;
}
#endif
```

이 테스트의 가치는 로직보다 운영에 있다.
누군가 row 이름을 바꾸거나 데이터 테이블을 옮기면, 패키징 전에 바로 드러난다.

# 왜 그렇게 동작하는가
`IMPLEMENT_SIMPLE_AUTOMATION_TEST`는 테스트 클래스를 만들고 automation framework에 등록하는 매크로다.
에디터나 commandlet에서 automation test list를 수집하면 이 등록 정보가 테스트 목록에 나타난다.
테스트 실행 시 `RunTest()`가 호출되고, `TestEqual`, `TestTrue`, `TestNotNull` 같은 assertion이 실패 정보를 기록한다.

커맨드라인 실행은 `AutomationController`가 테스트 목록을 구성한 뒤 `RunTests` 명령으로 worker에게 실행을 요청하는 구조다.
엔진 소스의 `AutomationCommandline.cpp`는 `RunTests` 명령 파싱을, `AutomationControllerManager.cpp`는 큐 실행과 결과 수집을 담당한다.

# 커맨드라인 실행 예시
프로젝트에서 자동화 테스트를 CI에 붙일 때는 대략 이런 형태가 된다.

```powershell
UnrealEditor-Cmd.exe "D:\Project\MyProject.uproject" -ExecCmds="Automation RunTests Project.Data; Quit" -TestExit="Automation Test Queue Empty" -unattended -nop4 -nosplash
```

실제 경로와 옵션은 프로젝트마다 다르지만 핵심은 같다.

- `UnrealEditor-Cmd.exe`: UI 없이 실행
- `Automation RunTests ...`: 특정 prefix의 테스트 실행
- `Quit`: 테스트 후 종료
- `-TestExit`: automation queue 종료 조건
- `-unattended`: 사용자 입력 없이 실행

# 실패 사례와 원리
## 테스트가 목록에 안 뜬다
- `WITH_DEV_AUTOMATION_TESTS` guard가 현재 빌드에서 꺼져 있을 수 있다.
- 파일이 module build에 포함되지 않았을 수 있다.
- test module이 `.uproject` 또는 `.uplugin`에 등록되지 않았을 수 있다.
- flag가 현재 실행 context와 맞지 않을 수 있다.

## 에셋 테스트가 로컬에서는 되는데 CI에서 실패한다
- asset path가 redirector에 의존하고 있을 수 있다.
- CI machine에 필요한 plugin이 꺼져 있을 수 있다.
- editor-only module이 runtime commandlet에서 로드되지 않을 수 있다.
- DDC나 source control sync 누락으로 asset이 없을 수 있다.

# 추가 학습 과제
- `Project.Data` prefix로 DataTable/PrimaryAsset 검증 테스트를 3개 만든다.
- 일부러 row를 삭제하고 실패 로그가 어떤 식으로 나오는지 기록한다.
- editor context test와 engine filter test가 목록에서 어떻게 다르게 보이는지 확인한다.

## 2026-05-12 심화 보강 보완: 점검과 추가 학습

### 자주 막히는 문제

- 테스트가 검색되지 않는다: test flag, module loading, editor-only/runtime 모듈 위치를 확인한다.
- 로컬에서는 성공하지만 CI에서 실패한다: 시간 의존성, asset path, map loading, platform setting을 확인한다.
- Latent 테스트가 끝나지 않는다: 완료 조건을 명확히 두고 timeout을 설정한다.
- 테스트가 서로 영향을 준다: 생성한 UObject/World/설정 값을 테스트 끝에서 정리한다.

### 실습 과제

1. 순수 함수 테스트와 asset validation 테스트를 각각 하나씩 작성한다.
2. 커맨드라인에서 특정 test filter만 실행한다.
3. 실패 로그가 CI에서 읽기 좋도록 `AddError`, `AddWarning`, context 메시지를 정리한다.

### 부가 자료

- 공식 문서: Automation System, Functional Testing.
- 엔진 소스: `Engine\Source\Runtime\Core\Public\Misc\AutomationTest.h`.
- 실행 예시: `UnrealEditor-Cmd.exe Project.uproject -ExecCmds="Automation RunTests Project; Quit" -unattended -nop4`.

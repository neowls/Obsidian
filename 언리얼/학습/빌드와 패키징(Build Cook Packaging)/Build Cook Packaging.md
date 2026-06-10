[UnrealBuildTool | Unreal Engine Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-build-tool-in-unreal-engine?application_version=5.6) | [Cooking and Chunking](https://dev.epicgames.com/documentation/en-us/unreal-engine/cooking-content-and-creating-chunks-in-unreal-engine?application_version=5.6)

# 개요
`Build`, `Cook`, `Stage`, `Package`는 배포 파이프라인의 서로 다른 단계다.
에디터에서 `Package Project` 버튼 하나로 보이지만, 문제를 디버깅할 때는 단계별로 분리해서 봐야 한다.

# 단계 구분
| 단계 | 담당 | 결과 |
| --- | --- | --- |
| Build | `UnrealBuildTool` | 실행 파일, DLL, 모듈 바이너리 |
| Cook | `UCookOnTheFlyServer`, cook commandlet | 플랫폼용 cooked asset |
| Stage | `AutomationTool` | 배포 폴더에 파일 배치 |
| Package | platform packaging tool | pak/iostore/exe/installable package |
| Archive | AutomationTool | 보관 위치로 결과물 복사 |

# Build
UnrealBuildTool은 `.sln`을 기준으로 빌드하지 않는다.
실제 빌드 기준은 target, module, plugin, platform, configuration이다.

| 파일 | 의미 |
| --- | --- |
| `.Target.cs` | 어떤 target을 어떤 configuration/platform으로 빌드할지 |
| `.Build.cs` | module dependency와 빌드 규칙 |
| `.uproject` | 프로젝트 module/plugin 목록 |
| `.uplugin` | plugin module 목록과 loading phase |

> [!info]
> IDE 프로젝트 파일은 편집 편의용이다. 빌드 판단은 UnrealBuildTool이 source tree와 target/module rules를 읽어서 한다.

# Cook
Cook은 에디터 asset을 대상 플랫폼에서 읽을 수 있는 형식으로 변환하는 단계다.
문제가 나면 `Unknown Cook Failure`로 뭉뚱그려 보일 수 있으므로, 마지막 error만 보지 말고 앞쪽 warning과 failed package를 찾아야 한다.

## cook 문제를 볼 때의 순서
1. target platform이 맞는지 확인한다.
2. redirector, missing asset, soft reference 누락을 확인한다.
3. editor-only asset이 runtime 참조에 섞였는지 본다.
4. DDC, `Saved`, `Intermediate`가 오래된 상태인지 확인한다.
5. World Partition/PCG처럼 cook 중 generated package가 생기는 시스템을 따로 확인한다.

# Packaging Settings
`UProjectPackagingSettings`는 에디터 UI의 packaging 설정이 코드에서 어떻게 보이는지 확인할 때의 시작점이다.
빌드 여부, cook 설정, pak/iostore, chunk, map list 같은 옵션이 이 계층과 연결된다.

| 옵션 축 | 디버깅 질문 |
| --- | --- |
| Build | packaging 때 실행 파일도 다시 빌드하는가 |
| Cook | by the book인가, cook on the fly인가 |
| Maps | 포함할 map이 명시되어 있는가 |
| Pak / IoStore | 패키징 포맷이 무엇인가 |
| Chunk | asset manager / primary asset label로 chunk가 갈라지는가 |

# 포럼 사례에서 얻는 체크포인트
첫 packaging 시도만 실패하고 두 번째는 성공하는 사례는 cook 자체보다 resource, stale build data, prebuilt data 문제일 수 있다.
이런 경우 log에서 `Cooked packages ... Remain 0`처럼 cook 완료 흔적과 실제 exit code를 분리해 보는 것이 좋다.

# 엔진 소스 참고 포인트
- `Engine\Source\Programs\UnrealBuildTool\UnrealBuildTool.cs`: UBT 진입점.
- `Engine\Source\Programs\UnrealBuildTool\Configuration\ModuleRules.cs`: module build rule 구조.
- `Engine\Source\Programs\AutomationTool\Scripts\BuildCookRun.Automation.cs`: build/cook/stage/package 자동화 명령.
- `Engine\Source\Programs\AutomationTool\AutomationUtils\ProjectParams.cs`: AutomationTool이 받는 프로젝트 파라미터.
- `Engine\Source\Editor\UnrealEd\Classes\CookOnTheSide\CookOnTheFlyServer.h`: cook server의 큰 구조.
- `Engine\Source\Developer\DeveloperToolSettings\Classes\Settings\ProjectPackagingSettings.h`: packaging setting 정의.

## 2026-05-12 심화 보강: 로그를 읽고 실패를 분해하는 법

# 학습 목표
Build/Cook/Packaging을 배우는 목적은 버튼을 누르는 법이 아니다.
실패했을 때 어느 단계가 실패했는지 분리하고, 원인을 좁히는 능력이 목표다.

- 컴파일 실패와 cook 실패를 구분한다.
- cook은 “에셋 변환”이며 compile과 다른 문제라는 점을 이해한다.
- `BuildCookRun` 로그에서 단계 전환을 찾는다.
- 패키징 실패를 asset reference, plugin, platform setting, generated package 문제로 나눈다.

# 사용법 1: 에디터에서 패키징 전 확인할 것
패키징 버튼을 누르기 전에 아래를 먼저 확인한다.

| 확인 항목 | 이유 |
| --- | --- |
| startup map / game default map | 패키징 후 빈 맵으로 시작하는 문제 방지 |
| plugin enabled state | editor-only plugin을 runtime에서 참조하는 문제 방지 |
| maps to cook | soft reference map 누락 방지 |
| asset redirector | cook 중 old path reference 문제 방지 |
| target platform | Windows/Android 등 platform-specific setting 확인 |
| build configuration | Development와 Shipping 차이 확인 |

# 사용법 2: AutomationTool 명령으로 단계 재현
에디터 UI 대신 명령으로 실행하면 CI와 같은 흐름을 재현할 수 있다.

```powershell
Engine\Build\BatchFiles\RunUAT.bat BuildCookRun `
  -project="D:\Project\MyProject.uproject" `
  -noP4 `
  -platform=Win64 `
  -clientconfig=Development `
  -build `
  -cook `
  -stage `
  -pak `
  -archive `
  -archivedirectory="D:\Builds\MyProject"
```

각 옵션은 독립된 단계를 켠다.
`-build`가 실패하면 C++/module 문제이고, `-cook`이 실패하면 에셋 로드/변환 문제일 가능성이 높다.

# 왜 그렇게 동작하는가
`RunUAT.bat BuildCookRun`은 AutomationTool의 `BuildCookRun.Automation.cs`로 이어진다.
AutomationTool은 `ProjectParams`를 만들고, 지정된 옵션에 따라 build, cook, stage, package, archive 단계를 순서대로 실행한다.

Build 단계는 `UnrealBuildTool`을 호출한다.
이때 `.Target.cs`와 `.Build.cs`가 읽히고, module dependency가 맞지 않으면 compile/link 단계에서 실패한다.

Cook 단계는 에디터 에셋을 대상 플랫폼용 cooked package로 변환한다.
`UCookOnTheFlyServer`는 package request, asset registry, dependency, save package를 관리한다.
이 단계에서는 C++ 코드가 이미 빌드되어 있어도 asset load 실패만으로 실패할 수 있다.

# 로그 읽는 법
패키징 로그는 마지막 줄만 보면 안 된다.
아래 키워드를 기준으로 뒤에서 앞으로 추적한다.

| 키워드 | 의미 |
| --- | --- |
| `Error:` | 실제 실패 후보 |
| `Warning:` | cook 실패의 원인이 앞쪽 warning일 수 있음 |
| `Unknown Cook Failure` | 최종 요약일 뿐, 원인은 앞쪽에 있음 |
| `LogCook` | cook 진행 상황 |
| `LogSavePackage` | package 저장 문제 |
| `LogLinker` | asset load/link 문제 |
| `Missing` / `Can't find file` | reference 누락 |
| `EditorOnly` | runtime에 editor-only 참조가 섞였을 가능성 |

# 사례 1: Unknown Cook Failure
증상은 `Unknown Cook Failure` 하나로 끝난다.
이때 실제 원인은 보통 그 위쪽에 있다.

확인 순서:
1. 최초 `Error:`를 찾는다.
2. 에셋 경로가 있는지 확인한다.
3. 해당 에셋이 editor에서 열리는지 확인한다.
4. redirector fix-up을 수행한다.
5. soft reference라면 cook 대상에 들어가는지 확인한다.
6. plugin asset이면 plugin이 target에서 enabled인지 확인한다.

# 사례 2: 에디터에서는 되지만 packaged build에서 asset이 없음
에디터는 asset registry와 loose content를 넓게 볼 수 있다.
반면 packaged build는 cook된 asset만 볼 수 있다.
따라서 코드에서 문자열 path로만 로드하는 asset은 cook에 포함되지 않을 수 있다.

해결 방향:
- hard reference로 연결한다.
- `PrimaryAssetLabel` 또는 Asset Manager 규칙으로 cook에 포함한다.
- Packaging Settings의 additional asset directories를 검토한다.
- DataTable, PCG graph, World Partition generated package도 같은 기준으로 본다.

# 사례 3: plugin module 때문에 Shipping 빌드 실패
Editor module을 runtime module에서 include하면 에디터에서는 빌드되다가 Shipping에서 깨질 수 있다.
원인은 editor target에는 editor module이 있지만 game target에는 없기 때문이다.

해결 방향:
- `.Build.cs`에서 editor-only dependency를 runtime module에서 제거한다.
- editor 기능은 별도 `MyPluginEditor` module로 옮긴다.
- `#if WITH_EDITOR`로 코드 경계를 분리한다.

# 추가 학습 과제
- 일부러 존재하지 않는 asset path를 DataTable에 넣고 cook log가 어떻게 실패하는지 기록한다.
- `-build` 없이 `-cook`만 실행했을 때와 전체 BuildCookRun을 비교한다.
- plugin의 runtime/editor module 분리 전후로 Shipping build dependency 차이를 확인한다.

## 2026-05-12 심화 보강 보완: 표준 학습 체크포인트

### 기본 사용 절차

1. Development Editor 빌드가 깨끗하게 되는지 먼저 확인한다.
2. 프로젝트 설정에서 Target Platform, Maps to Cook, Packaging 설정을 정리한다.
3. `RunUAT BuildCookRun`으로 Build, Cook, Stage, Package를 한 번에 실행한다.
4. 실패하면 가장 마지막 Error만 보지 말고, 그보다 앞선 첫 원인 로그를 찾는다.
5. 패키지 실행 후 누락 애셋, 플러그인 로딩, 설정 파일 반영 여부를 확인한다.

### 동작 원리

UBT는 C++ 모듈과 타깃을 빌드하고, Cook은 UObject/Asset을 플랫폼용 직렬화 데이터로 변환한다. Stage는 실행에 필요한 파일을 임시 배포 폴더로 모으고, Package는 플랫폼별 형식으로 묶는다. 이 네 단계 중 어느 단계에서 실패했는지 먼저 나누면 로그 해석이 훨씬 쉬워진다.

### 자주 막히는 문제

- Editor에서는 되는데 패키지에서 asset이 없다: soft reference, Primary Asset Rule, Maps to Cook을 확인한다.
- Shipping에서 플러그인이 빠진다: `.uplugin`의 module type, loading phase, platform allow list를 확인한다.
- Cook 실패 원인이 불분명하다: 첫 `LogCook: Error` 또는 `Ensure condition failed` 위치를 찾는다.
- 빌드 머신에서만 실패한다: 환경 변수, SDK, DerivedDataCache, 경로 길이와 한글 경로를 확인한다.

### 실습 과제

1. 같은 프로젝트를 Development와 Shipping으로 패키징해 로그 차이를 비교한다.
2. 의도적으로 soft reference asset을 cook에서 빠뜨리고 오류를 재현한다.
3. Runtime 모듈과 Editor 모듈을 잘못 섞은 플러그인을 만들어 패키지 오류를 확인한다.

### 부가 자료

- 공식 문서: Packaging Unreal Engine Projects, Build Operations, Cooking Content.
- 엔진 소스: `Engine\Source\Programs\UnrealBuildTool`.
- 엔진 소스: `Engine\Source\Programs\AutomationTool\Scripts\BuildCookRun.Automation.cs`.

---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/assets
  - type/learning
---

# 에셋 레지스트리(Asset Registry)

> [!summary] 요약
> 에셋 레지스트리(Asset Registry)는 에셋 검색, 식별, 로딩, cook 포함 여부를 관리하는 언리얼 콘텐츠 파이프라인 주제다.
> 에디터에서는 보이지만 런타임이나 패키징(Packaging) 결과에서 에셋을 찾지 못할 때 확인한다.
> 핵심은 Asset Registry의 메타데이터 검색과 Asset Manager의 의도적 로딩 정책을 분리하는 것이다.

## 핵심 결론

- Asset Registry는 에셋 정보를 찾는 시스템이고, Asset Manager는 로딩 정책과 primary asset 관리를 담당한다.
- hard reference, soft reference, primary asset rule은 cook 결과와 런타임 로딩에 다른 영향을 준다.
- 문제가 생기면 asset path, primary asset type/name, scan timing, cook rule, redirector를 확인한다.

## 개요
에디터가 로드되면서 로드되지 않은 에셋에 대한 정보를 비동기적으로 긁어모으는 에디터 서브시스템(Subsystem)이다.
에셋 매니저(Asset Manager)의 내부 시스템을 위한 데이터 저장소를 제공한다.
이 정보는 에디터가 에셋을 로드하지 않고 목록을 만들 수 있도록 메모리에 저장된다.
또한 정보는 권위적(authoritative)이며, 메모리의 에셋이나 디스크의 파일이 변경되면 최신으로 자동 유지된다.
주로 에디터내에 컨텐츠 브라우저에 사용되지만, 에디터 코드의 어디에서도 사용될 수 있다.

## 왜 필요한가

에셋 문제는 에디터 검색, 런타임 로드, 패키징 포함이 서로 다르게 동작해서 헷갈리기 쉽다. 에셋 레지스트리(Asset Registry)를 볼 때는 검색 가능한 정보와 실제 로드 가능한 객체를 분리해야 한다.

## 작동 모델

Asset Registry는 패키지와 태그 정보를 인덱싱해 에셋을 빠르게 찾게 해준다. Asset Manager는 PrimaryAssetId와 rule을 기준으로 어떤 에셋을 언제 로드하고 cook에 포함할지 결정한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| Asset Registry | 에셋 메타데이터 검색 | scan 완료, package path |
| Asset Data | 로드 전 에셋 정보 | class, tags, object path |
| Asset Manager | primary asset 정책 | type/name, rules |
| Soft Object Path | 지연 로딩 참조 | path 유효성, redirector |
| Cook Rule | 패키징 포함 여부 | always cook, chunk, directory |

## 실행 흐름

1. 에디터나 런타임 시작 시 asset registry가 패키지 정보를 스캔한다.
2. 검색 조건으로 asset data를 찾고 필요한 식별자를 만든다.
3. Asset Manager가 primary asset rule과 bundle 정보를 해석한다.
4. soft/hard reference와 cook rule에 따라 패키징 포함 여부가 결정된다.
5. 런타임에서 streamable manager나 asset manager가 실제 UObject를 로드한다.

## 에셋 목록 구하기
클래스별 에셋 목록을 만들려면, 에셋 레지스트리 모듈(Module)을 로드한 다음 `Module.Get().GetAssetsByClass()`을 부르기(Invoke)하면 된다.

```C++
FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");
TArray<FAssetData> AssetData;
const UClass* Class = UStaticMesh::StaticClass();
AssetRegistryModule.Get().GetAssetsByClass(Class, AssetData);
```
에셋의 로드/언로드 여부를 기술하는 `FAssetData` 오브젝트 목록을 반환하며, 이는 에셋 로드전에 결정 가능한 정보를 담는다.

## 멤버 및 함수

| 멤버                                   | 설명                                                                                                                                                                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FName ObjectPath`                   | 애셋에 대한 `Package.GroupNames.AssetName` 형태의 오브젝트 경로입니다.                                                                                                                                                                                     |
| `FName PackageName`                  | 애셋이 들어있는 패키지 이름입니다.                                                                                                                                                                                                                       |
| `FName PackagePath`                  | 애셋이 들어있는 패키지 경로입니다.                                                                                                                                                                                                                       |
| `FName GroupNames`                   | 애셋이 들어있는 그룹 이름 목록은 '`.`' 으로 구분합니다. 그룹이 없으면 `NAME_None` 입니다.                                                                                                                                                                               |
| `FName AssetName`                    | 패키지나 그룹을 뺀 애셋 이름입니다.                                                                                                                                                                                                                      |
| `FName AssetClass`                   | 애셋의 클래스 이름입니다.                                                                                                                                                                                                                            |
| `TMap<FName, FString> TagsAndValues` | `AssetRegistrySearchable` (검색가능 애셋 레지스트리) 마킹된 프로퍼티에 대한 값 매핑입니다. 자세한 정보는 [태그와 값](https://dev.epicgames.com/documentation/ko-kr/unreal-engine/asset-registry?application_version=4.27#%ED%83%9C%EA%B7%B8%EC%99%80%EA%B0%92) 부분을 참고하시기 바랍니다. |

| 함수                         | 설명                          |
| -------------------------- | --------------------------- |
| `GetAssetsByPackageName()` | 특정 패키지의 애셋 목록을 반환합니다.       |
| `GetAssetsByPath()`        | 지정된 경로의 애셋 목록을 반환합니다.       |
| `GetAssetByObjectPath()`   | 지정된 오브젝트 경로의 애셋 목록을 반환합니다.  |
| `GetAssetsByTagValues()`   | 지정된 태그와 값 세트의 애셋 목록을 반환합니다. |
| `GetAllAssets()`           | 모든 애셋 목록을 반환합니다. 느릴 수 있습니다. |

## FAssetData 를 UObject* 로 변환하기
`FAssetData` 오브젝트는 `FAssetData` 가 나타내는 `UObject*` 를 반환하는 함수 `GetAsset()` 이 있다.
필요한 에셋을 로드한 다음 반환한다.
에셋이 로드되었는지 확인만 하려면, `IsAssetLoaded()` 를 사용한다.

## 필터 만들기
`GetAsset()` 를 부를 때 `FARFilter` 를 제공하여 여러 범주별로 필터링되는 에셋 목록을 만들 수 있다.
- PackageName
- PackagePath
- Collection
- Class
- Tags/Value 짝

```C++
FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");
TArray<FAssetData> AssetData;
FARFilter Filter;
Filter.Classes.Add(UStaticMesh::StaticClass());
Filter.PackagePaths.Add("/Game/Meshes");
AssetRegistryModule.Get().GetAssets(Filter, AssetData);
```

## 태그와 값
에셋 레지스트리에서 반환된 `FAssetData` 오브젝트에는 `TagsAndValues` 라는 이름과 값 매핑이 들어있다.
이것은 `FAssetData` 가 나타내는 에셋의 프로퍼티 값과 연관된 값의 목록이다.
해당 정보는 에셋이 저장되어 에셋이 들어있는 `UAsset` 파일의 헤더에 기록될 때 수집된다.
에셋 레지스트리는 이 헤더를 읽은 다음 그에 맞게 `TagsAndValues` 맵을 채운다.
에셋 레지스트리는 `AssetRegistrySeachable` `UPROPERTY()` 플래그로 마킹된 프로퍼티만 모은다.

- 예시(UTexture)
```C++
/** 이 텍스처를 샘플링할 때 사용할 텍스처 필터링 모드입니다. */
	UPROPERTY(Category=Texture, AssetRegistrySearchable)
	TEnumAsByte<enum TextureFilter> Filter;
```

에셋 레지스트리가 UPropery 직계가 아닌 정보를 검색할 수 있도록 하려면, 에셋의 클래스에서 가상 함수 `GetAssetRegistryTags()` 를 구현하여 `TagsAndValues` 맵에 키/값 짝을 수동으로 추가해주면 된다.

## 비동기 데이터 수집
에셋 레지스트리는 `UAsset` 파일을 비동기식으로 읽기에, 요청한 시간에 모든 에셋 목록 전체가 없을 수도 있다.
에디터 코드에서 전체 목록을 요청하면, 에셋 레지스트리는 에셋이 언제 발견/생성, 이름 변경, 제거되었는가에 대한 델리게이트 콜백을 제공한다.
에셋 레지스트리가 초기 검색을 완료한 시점에 대한 델리게이트도 있는데, 여러 시스템 유용하다.

 **에셋 레지스트리 모듈을 로드한 다음 `IAssetRegistry` 에 제공된 함수를 사용하여 이 델리게이트에 등록하면 된다.**

```C++
/** 레지스트리에 애셋이 추가될 때에 대한 콜백을 등록/해제합니다. */
	virtual FAssetAddedEvent& OnAssetAdded() = 0;

	/** 레지스트리에서 애셋이 제거될 때에 대한 콜백을 등록/해제합니다. */
	virtual FAssetRemovedEvent& OnAssetRemoved() = 0;

	/** 레지스트리에 애셋 이름이 변경될 때에 대한 콜백을 등록/해제합니다. */
	virtual FAssetRenamedEvent& OnAssetRenamed() = 0;

	/** 애셋 레지스트리가 파일 로드를 완료했을 때에 대한 콜백을 등록/해제합니다. */
	virtual FFilesLoadedEvent& OnFilesLoaded() = 0;

	/** 백그라운드 파일 로드 진행상황 업데이트를 위한 콜백을 등록/해제합니다. */
	virtual FFileLoadProgressUpdatedEvent& OnFileLoadProgressUpdated() = 0;

	/** 현재 애셋 레지스트리가 파일을 로드중이라 모든 애셋에 대해 알지 못하면 참을 반환합니다. */
	virtual bool IsLoadingAssets() = 0;
```

- 예시
```C++
void FMyClass::FMyClass()
	{
		// 업데이트 감지를 위해 애셋 레지스트리 모듈을 로드합니다.
		FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");
		AssetRegistryModule.Get().OnAssetAdded().AddRaw( this, &FMyClass::OnAssetAdded );
	}

	FMyClass::~FMyClass()
	{
		// 델리게이트 등록해제를 위해 애셋 레지스트리 모듈을 로드합니다.
		FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");
		AssetRegistryModule.Get().OnAssetAdded().RemoveAll( this );
	}

	void FMyClass::OnAssetAdded(const FAssetData& AssetData)
	{
		// 애셋 레지스트리가 애셋을 발견했습니다.
		// 즉 방금 생성되었거나 방금 디스크에서 찾았다는 뜻입니다.
		// 이 함수의 코드가 빠른지 확인, 아니면 수집 프로세스가 늦춰집니다.
	}
```

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 에디터 Content Browser에 보이면 패키징에도 포함된다. | cook rule, primary asset rule, reference chain을 확인한다. |
| Asset Registry 검색 결과는 이미 로드된 객체다. | asset data와 실제 UObject 로딩을 구분한다. |
| soft reference는 경로만 맞으면 항상 안전하다. | redirector, rename, cook 포함 여부를 같이 검증한다. |

## 디버깅 체크리스트

- [ ] asset path와 object path가 redirector 없이 유효하다.
- [ ] Asset Registry scan 완료 후 검색하고 있다.
- [ ] PrimaryAssetType/Name과 rules가 의도대로 잡힌다.
- [ ] soft reference 대상이 cook에 포함된다.
- [ ] 패키징 빌드(Build)에서 asset load 실패 로그를 확인했다.

## 관련 문서

- [[에셋 매니저(Asset Manager)]]
- [[UPROPERTY Object Reference Guide]]
- [[Subsystem, Module, Plugin]]
- [[World Partition과 Data Layer]]

# 개요
에디터가 로드되면서 로드되지 않은 에셋에 대한 정보를 비동기적으로 긁어모으는 에디터 서브시스템이다.
에셋 매니저의 내부 시스템을 위한 데이터 저장소를 제공한다.
이 정보는 에디터가 에셋을 로드하지 않고 목록을 만들 수 있도록 메모리에 저장된다.
또한 정보는 권위적(authoritative)이며, 메모리의 에셋이나 디스크의 파일이 변경되면 최신으로 자동 유지된다.
주로 에디터내에 컨텐츠 브라우저에 사용되지만, 에디터 코드의 어디에서도 사용될 수 있다.

# 에셋 목록 구하기
클래스별 에셋 목록을 만들려면, 에셋 레지스트리 모듈을 로드한 다음 `Module.Get().GetAssetsByClass()`을 부르기(Invoke)하면 된다.

```C++
FAssetRegistryModule& AssetRegistryModule = FModuleManager::LoadModuleChecked<FAssetRegistryModule>("AssetRegistry");
TArray<FAssetData> AssetData;
const UClass* Class = UStaticMesh::StaticClass();
AssetRegistryModule.Get().GetAssetsByClass(Class, AssetData);
```
에셋의 로드/언로드 여부를 기술하는 `FAssetData` 오브젝트 목록을 반환하며, 이는 에셋 로드전에 결정 가능한 정보를 담는다.

# 멤버 및 함수

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
# FAssetData 를 UObject* 로 변환하기
`FAssetData` 오브젝트는 `FAssetData` 가 나타내는 `UObject*` 를 반환하는 함수 `GetAsset()` 이 있다.
필요한 에셋을 로드한 다음 반환한다.
에셋이 로드되었는지 확인만 하려면, `IsAssetLoaded()` 를 사용한다.

# 필터 만들기
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

# 태그와 값
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

# 비동기 데이터 수집
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

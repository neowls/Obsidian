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

# 에셋 매니저(Asset Manager)

> [!summary] 요약
> 에셋 매니저(Asset Manager)는 에셋 검색, 식별, 로딩, cook 포함 여부를 관리하는 언리얼 콘텐츠 파이프라인 주제다.
> 에디터에서는 보이지만 런타임이나 패키징(Packaging) 결과에서 에셋을 찾지 못할 때 확인한다.
> 핵심은 Asset Registry의 메타데이터 검색과 Asset Manager의 의도적 로딩 정책을 분리하는 것이다.

## 핵심 결론

- Asset Registry는 에셋 정보를 찾는 시스템이고, Asset Manager는 로딩 정책과 primary asset 관리를 담당한다.
- hard reference, soft reference, primary asset rule은 cook 결과와 런타임 로딩에 다른 영향을 준다.
- 문제가 생기면 asset path, primary asset type/name, scan timing, cook rule, redirector를 확인한다.

## 개요
- 싱글톤 UObject 로, 엔진에서 제공하는 서브시스템(Subsystem)과 유사하다.
- 맵 혹은 모드에 한정되어 있지 않다.
- [[에셋 레지스트리(Asset Registry)]] 를 활용하여 언로딩된 에셋을 쿼리 및 분류한다.
- 전반적인 에셋의 로딩 상태를 관리한다.
- 쿠킹과 비동기 로딩같은 기존 시스템을 통합한다.
- 개별 게임에 대해 재정의 및 확장할 수 있도록 설계되었다.

## 왜 필요한가

에셋 문제는 에디터 검색, 런타임 로드, 패키징 포함이 서로 다르게 동작해서 헷갈리기 쉽다. 에셋 매니저(Asset Manager)를 볼 때는 검색 가능한 정보와 실제 로드 가능한 객체를 분리해야 한다.

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

## 사용 이유
- 기존 사용되고있는 ObjectLibrary의 확장이다.
- 로드가능한 다양한 인벤토리 아이템들을 쿼리할 수 있다.
- 블루프린트 클래스의 복잡성을 배제할 수 있다.
- 긴 로드 시간 및 높은 메모리 사용량을 처리할 수 있다.
- 하드 참조에서 비동기 소프트 참조로 바꾸는 것을 지원한다.
- 클라이언트/서버/메뉴/플레이 등 각각 다른 로딩 상태의 데이터를 처리할 수 있다.
- 복잡한 패킹과 청킹 규칙을 설정할 수 있다.

## 주요 요소
모든 에셋을 두 가지 타입으로 구분한다.

## 프라이머리 에셋(Primary Asset)
에셋 매니저가 직접적으로 처리하며 로딩 가능한 에셋이다.

## 세컨더리 에셋(Secondary Asset)
에셋 매니저가 직접처리하지 않으며, 프라이머리 에셋이 참조하거나 사용하려는 경우 자동으로 로드한다.

## 특징
`GetPrimaryAssetID` 함수를 호출하여 확보한 ID에서 프라이머리 에셋을 직접 조작할 수 있다.
특정한 `UObject` 클래스로 제작한 에셋을 프라이머리 에셋으로 지정하려면 `GetPrimaryAssetId` 함수를 오버라이드하여 유효한 `FPrimaryAssetId` 구조체를 반환하면 된다.
기본적으로 `UWorld` 에셋만 프라이머리 에셋이고 나머지 에셋은 모두 세컨더리 에셋이다.

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

- [[에셋 레지스트리(Asset Registry)]]
- [[UPROPERTY Object Reference Guide]]
- [[World Partition과 Data Layer]]
- [[Subsystem, Module, Plugin]]

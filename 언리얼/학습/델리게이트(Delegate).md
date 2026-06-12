---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/delegate
  - type/learning
---

# 델리게이트(Delegate)

> [!summary] 요약
> 델리게이트(Delegate)는 객체 사이의 직접 의존을 줄이고 이벤트 발생 지점과 반응 지점을 연결하는 언리얼 콜백 시스템이다.
> UI, 애니메이션, gameplay event, async completion처럼 실행 시점이 분리된 기능을 만들 때 사용한다.
> 핵심은 delegate 종류, binding lifetime, UObject GC, broadcast 시점의 유효성을 함께 보는 것이다.

## 핵심 결론

- dynamic, multicast, single-cast, native delegate는 reflection/Blueprint/성능/직렬화 특성이 다르다.
- binding한 객체의 lifetime이 delegate보다 짧을 수 있으므로 해제 시점을 명확히 둔다.
- 문제가 생기면 bind 함수 종류, UObject 유효성, broadcast 호출 경로, 중복 binding을 확인한다.

## 개요
C++ 오브젝트 상의 멤버 함수를 가리키고 실행시키는 데이터 유형이다.

Delegate (델리게이트)로 C++ 오브젝트 상의 멤버 함수 호출을 일반적이고 유형적으로 안전한 방식으로 할 수 있습니다. 델리게이트를 사용하여 임의 오브젝트의 멤버 함수에 동적으로 바인딩시킬 수 있으며, 그런 다음 그 오브젝트에서 함수를 호출할 수 있습니다. 호출하는 곳에서 오브젝트의 유형을 몰라도 말이지요.

델리게이트 오브젝트는 복사해도 완벽히 안전합니다. 델리게이트는 값으로 전달 가능하나 보통 추천할 만 하지는 않는데, heap 에 메모리를 할당해야 하기 때문입니다. **가급적이면 델리게이트는 항상 참조 전달해야 합니다.**

델리게이트는 싱글-캐스트(형 변환)와 멀티-캐스트 모두 지원되며, 디스크에 안전하게 Serialize 시킬 수 있는 "다이내믹" 델리게이트도 물론입니다.

- 싱글-캐스트
- 멀티-캐스트
	- 이벤트
- 다이내믹 (UObject, Serialize 가능)

## 왜 필요한가

Delegate는 편하지만 호출 흐름이 숨기 쉬워서 의존성과 lifetime 문제가 늦게 드러난다. 델리게이트(Delegate)를 볼 때는 누가 이벤트를 소유하고 누가 언제 해제되는지 먼저 정리해야 한다.

## 작동 모델

이벤트를 발생시키는 객체가 delegate를 보유하고, 관심 있는 객체가 함수를 바인딩한다. Broadcast 시점에는 등록된 대상이 순서대로 호출되며, dynamic delegate는 reflection을 통해 Blueprint와 직렬화 흐름에 연결된다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| Delegate 선언 | 호출 시그니처 정의 | single/multicast/dynamic 여부 |
| Event owner | delegate 보관과 broadcast | broadcast 시점과 조건 |
| Listener | callback 함수 제공 | binding/unbinding lifetime |
| UObject binding | GC와 reflection 연결 | `AddDynamic`, `RemoveDynamic` |
| Handle | native binding 해제 기준 | `FDelegateHandle` 보관 |

## 실행 흐름

1. 이벤트 소유자가 delegate 타입과 시그니처를 선언한다.
2. listener가 초기화 시점에 적절한 bind API로 함수를 등록한다.
3. 이벤트 발생 시 소유자가 broadcast 또는 execute를 호출한다.
4. listener lifetime이 끝나기 전에 unbind하거나 handle을 해제한다.
5. Blueprint/dynamic delegate는 reflection 이름과 UObject 유효성까지 확인한다.

## 선언
델리게이트의 선언은 제공되어 있는 선언 매크로 중 하나를 사용하여 이루어집니다. 사용되는 매크로는 델리게이트에 바인딩되는 함수의 시그너처에 따라 결정됩니다. 시스템에서는 델리게이트 유형을 선언해 낼 수 있는 범용 함수 시그너처의 다양한 조합을 미리 정의, 이를 통해 반환값과 파라미터에 대한 유형 이름을 필요한 대로 채워넣습니다. 현재 다음 항목들의 어떠한 조합에 대해서도 델리게이트 시그너처가 지원됩니다:

- 값을 반환하는 함수
- "페이로드"(payload, 유상) 변수 4 개 까지
- 함수 파라미터 8 개 까지
- 'const' 로 선언된 함수

이 표에서 델리게이트 선언에 사용할 매크로를 찾을 수 있습니다.

|함수 시그너처|선언 매크로|
|---|---|
|`void Function()`|`DECLARE_DELEGATE( DelegateName )`|
|`void Function( <Param1> )`|`DECLARE_DELEGATE_OneParam( DelegateName, Param1Type )`|
|`void Function( <Param1>, <Param2> )`|`DECLARE_DELEGATE_TwoParams( DelegateName, Param1Type, Param2Type )`|
|`void Function( <Param1>, <Param2>, ... )`|`DECLARE_DELEGATE_<Num>Params( DelegateName, Param1Type, Param2Type, ... )`|
|`<RetVal> Function()`|`DECLARE_DELEGATE_RetVal( RetValType, DelegateName )`|
|`<RetVal> Function( <Param1> )`|`DECLARE_DELEGATE_RetVal_OneParam( RetValType, DelegateName, Param1Type )`|
|`<RetVal> Function( <Param1>, <Param2> )`|`DECLARE_DELEGATE_RetVal_TwoParams( RetValType, DelegateName, Param1Type, Param2Type )`|
|`<RetVal> Function( <Param1>, <Param2>, ... )`|`DECLARE_DELEGATE_RetVal_<Num>Params( RetValType, DelegateName, Param1Type, Param2Type, ... )`|

멀티-캐스트, 다이내믹, 래핑된(wrapped) 델리게이트에 대한 변종 매크로도 제공됩니다:

- DECLARE_MULTICAST_DELEGATE...
- DECLARE_DYNAMIC_DELEGATE...
- DECLARE_DYNAMIC_MULTICAST_DELEGATE...
- DECLARE_DYNAMIC_DELEGATE...
- DECLARE_DYNAMIC_MULTICAST_DELEGATE...

델리게이트 시그너처 선언은 글로벌 영역에, 네임스페이스 안이나 심지어 (함수 본문은 제외한) 클래스 선언부 안에까지도 존재 가능합니다.

## 바인딩
델리게이트 시스템은 특정 유형의 오브젝트를 이해하고 있으며, 이러한 오브젝트를 사용할 때는 추가적으로 사용할 수 있는 기능이 있습니다. UObject 나 공유 포인터 클래스 멤버에 델리게이트를 바인딩하는 경우, 델리게이트 시스템은 그 오브젝트에 대한 약 참조(Weak Reference)를 유지할 수 있어, 델리게이트 치하에서 오브젝트가 소멸된 경우 `IsBound()` 나 `ExecuteIfBound()` 함수를 호출하여 처리해 줄 수 있습니다. 참고로 여러가지 지원되는 오브젝트 유형에 대해서는 특수한 바인딩 문법이 사용됩니다.

|함수|설명|
|---|---|
|`Bind()`|기존 델리게이트 오브젝트에 바인딩합니다.|
|`BindStatic()`|raw C++ 포인터 글로벌 함수 델리게이트를 바인딩합니다.|
|`BindRaw()`|날(raw) C++ 포인터 델리게이트에 바인딩합니다. 날 포인터는 어떠한 종류의 레퍼런스도 사용하지 않아, 만약 오브젝트가 델리게이트 치하에서 삭제된 경우 호출하기가 안전하지 않을 수도 있습니다. Execute() 호출시에는 조심하세요!|
|`BindSP()`|공유 포인터-기반 멤버 함수 델리게이트에 바인딩합니다. 공유 포인터 델리게이트는 오브젝트로의 약 참조를 유지합니다. `ExecuteIfBound()` 로 호출할 수 있습니다.|
|`BindUObject()`|UObject 기반 멤버 함수 델리게이트를 바인딩합니다. UObject 델리게이트는 오브젝트로의 약 참조를 유지합니다. `ExecuteIfBound()` 로 호출할 수 있습니다.|
|`UnBind()`|이 델리게이트 바인딩을 해제합니다.|

이 함수들의 변종, 인수, 구현을 확인하시려면 (`..\UE4\Engine\Source\Runtime\Core\Public\Templates\` 에 있는) `DelegateSignatureImpl.inl` 파일을 확인해 주시기 바랍니다.

## 페이로드 데이터
델리게이트에 바인딩할 때, 페이로드 데이터를 같이 전해줄 수 있습니다. 페이로드 데이터란 바인딩된 함수를 불러낼(invoke) 때 직접 전해지는 임의의 변수를 말합니다. 바인딩 시간에 델리게이트 자체적으로 파라미터를 보관할 수 있게 되니 매우 유용합니다. ("다이내믹"을 제외한) 모든 델리게이트 유형은 페이로드 변수를 자동으로 지원합니다. 이 예제는 커스텀 변수 둘, 즉 bool 과 int32 를 델리게이트에 전달합니다. 그런 다음 델리게이트를 불러낼 때 이 파라미터가 바인딩된 함수에 전달됩니다. 여분의 변수 인수는 반드시 델리게이트 유형 파라미터 인수 이후에 받아야 합니다.

`MyDelegate.BindRaw( &MyFunction, true, 20 );`

## 실행
델리게이트에 바인딩된 함수는 델리게이트의 `Execute()` 함수를 호출하여 실행됩니다. 델리게이트를 실행하기 전 "바인딩" 되었는지 반드시 확인해야 합니다. 이는 코드 안전성을 도모하기 위함인데, 초기화되지 않은 상태로 접근이 가능한 반환값과 출력 파라미터가 델리게이트에 있을 수 있기 때문입니다. 바인딩되지 않은 델리게이트를 실행시키면 일부 인스턴스에서 메모리에 낙서를 해버릴 수가 있습니다. 델리게이트가 실행해도 안전한 지는 `IsBound()` 를 호출하여 검사해 볼 수 있습니다. 또한 반환값이 없는 델리게이트에 대해서는 `ExecuteIfBound()` 를 호출할 수 있으나, 출력 파라미터는 초기화되지 않을 수 있다는 점 주의하시기 바랍니다.

|실행 함수|설명|
|---|---|
|`Execute()`||
|`ExecuteIfBound()`||
|`IsBound()`|

## 예제
아무데서나 호출했으면 하는 메서드를 가진 클래스가 있다고 쳐 봅시다:

```cpp
	class FLogWriter	{		void WriteToLog( FString );	};
```

WriteToLog 함수를 호출하려면, 해당 함수의 시그너처에 맞는 델리게이트 유형을 생성해야 합니다. 그러기 위해서는 먼저 아래 매크로 중 하나를 사용하여 델리게이트를 선언해야 합니다. 여기 예제에서는 단순한 델리게이트 유형입니다:

```cpp
	DECLARE_DELEGATE_OneParam( FStringDelegate, FString );
```

이는 'FStringDelegate' 라는 델리게이트 유형을 생성하며, 'FString' 유형 파라미터를 하나 받습니다.

클래스에서 이 'FStringDelegate' 를 어떻게 사용하는가, 예제는 이렇습니다:

```cpp
	class FMyClass	{		FStringDelegate WriteToLogDelegate;	};
```

이렇게 하여 위 클래스의 임의 클래스 안에 있는 메서드로의 포인터를 담을 수 있습니다. 위 클래스가 이 델리게이트에 대해 아는 것이라고는, 함수 시그너처 뿐입니다.

이제 델리게이트 할당을 위해, 단순히 델리게이트 클래스의 인스턴스를 생성하고, 그 메서드를 소유하는 클래스와 함께 템플릿 파라미터로 전해줍니다. 자기 오브젝트의 인스턴스와 그 메서드의 실제 함수 주소 역시도 전해줘야 합니다. 그래서 여기서는 우리 'FLogWriter' 클래스의 인스턴스를 생성한 다음, 그 오브젝트 인스턴스의 'WriteToLog' 메서드에 대한 델리게이트를 생성하겠습니다.

```cpp
	TSharedRef< FLogWriter > LogWriter( new FLogWriter() ); 	WriteToLogDelegate.BindSP( LogWriter, &FLogWriter::WriteToLog );
```

이렇게 하여 클래스의 메서드에 델리게이트를 동적으로 바인딩하였습니다.

`BindSP` 의 `SP` 부분은 `shared pointer`, 공유 포인터를 뜻하는데, 공유 포인터에 소유된 오브젝트에 바인딩하고 있기 때문입니다. BindRaw(), BindUObject() 처럼 다양한 오브젝트 유형 버전도 있습니다.

이제 'FLogWriter' 클래스에 대해 아무것도 모를지라도 FMyClass 를 통해 'WriteToLog' 메서드를 호출할 수 있습니다! 자신의 델리게이트를 호출하려면, 그냥 'Execute()' 메서드를 사용하면 됩니다:

```cpp
	WriteToLogDelegate.Execute( TEXT( "델리게이트 쥑이네!" ) );
```

델리게이트에 함수를 바인딩하기 전 Execute() 를 호출하면 assert 가 발동됩니다. 그런 경우를 피하기 위해 대부분 이렇게 하는 것이 좋습니다:

```cpp
	WriteToLogDelegate.ExecuteIfBound( TEXT( "함수가 바인딩되었을 때만 실행!" ) );
```

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| Multicast delegate는 항상 안전하게 아무 때나 호출할 수 있다. | listener lifetime과 중복 binding, broadcast 재진입을 확인한다. |
| `AddDynamic`과 `AddUObject`는 같은 용도다. | Blueprint 노출, reflection, 성능, 해제 방식을 기준으로 고른다. |
| 바인딩만 하면 자동으로 한 번만 호출된다. | 필요하면 `AddUnique`나 명시적 unbind 정책을 사용한다. |

## 디버깅 체크리스트

- [ ] delegate 종류가 Blueprint 노출, multicast 여부, 성능 요구와 맞다.
- [ ] bind 시점과 unbind 시점이 객체 lifetime과 맞다.
- [ ] 중복 binding 여부를 확인했다.
- [ ] broadcast 전 listener UObject가 유효한지 확인했다.
- [ ] native delegate는 `FDelegateHandle`을 보관하고 해제한다.

## 관련 문서

- [[언리얼 초기화 과정]]
- [[UE 5.7 엔진 생명주기 학습자료]]
- [[Subsystem, Module, Plugin]]
- [[UPROPERTY Object Reference Guide]]
- [[에셋 매니저(Asset Manager)]]

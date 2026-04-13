## 문서 목적
이 문서는 `UPROPERTY() TObjectPtr<T>` 와 `UPROPERTY() T*` 의 차이를 팀 내에서 빠르게 공유하기 위한 개요 문서입니다.

이 문서의 목표:
- 두 선언이 무엇이 같고 무엇이 다른지 빠르게 정리한다.
- 실무에서 어떤 기준으로 타입을 선택해야 하는지 남긴다.
- 성능과 유지보수 관점에서 기대할 수 있는 이점을 정리한다.
- 나중에 엔진 업그레이드나 코드 리뷰 때 참조할 기준점을 만든다.

---

## 적용 범위
- 프로젝트 기준 버전: `UE 5.5.4`
- 내부 동작 확인 기준: 로컬 엔진 소스 `C:\Unreal_5.7_hyper`
- 주의:
  - 본 문서의 핵심 결론은 `5.5.x` 와 `5.7` 사이에서 동일한 방향성을 갖는다.
  - 세부 구현 라인이나 내부 최적화는 엔진 버전에 따라 달라질 수 있다.

---

## 가장 중요한 결론
`UPROPERTY() UObject*` 와 `UPROPERTY() TObjectPtr<UObject>` 는 둘 다 엔진이 아는 **강한 UObject 참조**입니다.

즉:
- 둘 다 `UPROPERTY` 이면 GC가 참조를 본다.
- 둘 다 reflection/serialization 대상이 된다.
- 둘 다 객체를 살려두는 strong reference 역할을 할 수 있다.

차이는 여기서 생깁니다:
- raw pointer는 전통적인 native pointer 방식이다.
- `TObjectPtr` 는 strong reference에 더해 엔진 내부 추적 기능이 붙은 wrapper 방식이다.

쉽게 비유하면:
- `UPROPERTY() UObject*` 는 엔진 주소록에 등록된 일반 연락처
- `UPROPERTY() TObjectPtr<UObject>` 는 엔진 주소록에 등록된 추적 태그가 붙은 연락처

---

## 같은 점
- 둘 다 `UPROPERTY` 면 strong reference다.
- 둘 다 `FObjectProperty` 계열 reflection 경로를 사용한다.
- 둘 다 직렬화 대상이다.
- 둘 다 Blueprint / editor property 로 다룰 수 있다.
- 둘 다 기본 게임플레이 코드에서는 거의 같은 문법으로 사용한다.

예시:

```cpp
UPROPERTY()
UMyObject* RawRef = nullptr;

UPROPERTY()
TObjectPtr<UMyObject> ObjectRef = nullptr;
```

둘 다 아래처럼 사용한다.

```cpp
if (RawRef)
{
    RawRef->DoSomething();
}

if (ObjectRef)
{
    ObjectRef->DoSomething();
}
```

---

## 다른 점

### 1. `TObjectPtr` 는 handle-aware reference 다
- raw pointer는 "지금 당장 쓸 실제 메모리 주소"에 가깝다.
- `TObjectPtr` 는 필요 시 엔진이 해석할 수 있는 handle 성격을 가진 wrapper다.
- 그래서 에디터, 쿠킹, 로딩 파이프라인에서 더 유연하게 다룰 수 있다.

### 2. `TObjectPtr` 는 access tracking 을 지원한다
- raw pointer는 그냥 포인터를 읽는 동작이라 엔진이 참조 사용 시점을 추적하기 어렵다.
- `TObjectPtr` 는 참조를 resolve/dereference 하는 경로에 엔진 추적 포인트를 연결하기 쉽다.
- 이 특성은 cook dependency 추적이나 editor 분석 도구에 유리하다.

### 3. `TObjectPtr` 는 optional lazy resolve 경로를 가진다
- raw pointer는 결국 실제 `UObject*` 값으로 수렴한다.
- `TObjectPtr` 는 상황에 따라 아직 완전히 resolve 되지 않은 상태를 유지할 수 있다.
- 에디터/로드/placeholder 처리에서 이런 차이가 의미를 가진다.

### 4. `TObjectPtr` 는 incremental GC barrier 와 더 잘 맞는다
- raw pointer 멤버 대입은 그냥 C++ 포인터 대입이다.
- `TObjectPtr` 는 대입/복사 시 incremental GC 중인 객체를 reachable 로 표시하는 barrier 경로를 탈 수 있다.
- 즉, modern GC 경로와의 협력이 더 강하다.

### 5. `TObjectPtr` 는 최신 엔진 툴링과 정책에 더 맞다
- UHT 는 raw pointer member 와 `TObjectPtr` member 를 구분한다.
- 엔진은 `TObjectPtr` 기반 멤버 선언을 권장하고 있다.
- 새 코드 기준으로는 `UObject` 멤버는 `TObjectPtr` 가 기본 선택지에 가깝다.

---

## 성능 관점에서의 현실적인 판단
`TObjectPtr` 는 보통 **게임플레이 프레임 타임 최적화 수단이 아니다**.

중요한 포인트:
- `sizeof(TObjectPtr<T>)` 는 포인터 크기와 같아서 메모리 부담은 거의 없다.
- hot path 에서 raw pointer 보다 반드시 빠르지 않다.
- 에디터 빌드에서는 tracking/resolve 비용 때문에 raw 보다 미세하게 느릴 수도 있다.

대신 기대할 수 있는 이점:
- 에디터 참조 처리 안정성
- cook dependency 추적 정확성
- incremental GC 대응
- 리인스턴싱/직렬화/툴링 경로에서의 안전성
- 팀 코드베이스의 일관성

즉, `TObjectPtr` 의 이점은 보통 `FPS` 보다
- iteration speed
- debugging quality
- pipeline correctness
- maintenance cost
에 더 가깝다.

---

## 게임 개발에서 얻을 수 있는 실질적 이점

### 1. 에디터/쿠킹 파이프라인 안정성
- 에셋이나 UObject 참조를 엔진이 더 잘 추적할 수 있다.
- 어떤 참조가 실제로 사용되었는지 분석하기 쉬워진다.
- 큰 프로젝트에서 cook dependency 문제를 추적할 때 도움이 된다.

### 2. modern GC 경로와의 호환성
- incremental GC 사용 시 멤버 참조 업데이트가 더 안전한 방향으로 동작한다.
- 수동 reference collector 경로도 raw pointer 대신 `TObjectPtr` 를 선호하는 방향이다.

### 3. 엔진 업그레이드 내성
- UE 최신 방향은 `UObject` 멤버를 `TObjectPtr` 로 선언하는 쪽이다.
- 장기적으로는 raw member pointer 에 대한 경고나 정책 강화와 충돌할 가능성이 더 낮다.

### 4. 팀 코드 가독성
- `UPROPERTY() TObjectPtr<T>` 를 보면 바로 "이건 엔진 관리 strong reference 멤버"라는 의도가 보인다.
- raw pointer 멤버는 문맥을 더 읽어야 한다.

---

## 실무 선택 기준

### `TObjectPtr` 를 기본으로 쓰는 경우
- `UObject` 계열 멤버 변수
- `AActor` / `UActorComponent` / `UDataAsset` / `UObject` 멤버 참조
- editor/cook/serialization 경로를 타는 reflected strong reference

예시:

```cpp
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Camera")
TObjectPtr<UCameraComponent> CameraComponent = nullptr;

UPROPERTY(EditDefaultsOnly, Category="Config")
TObjectPtr<UDataAsset> ItemConfig = nullptr;
```

### raw pointer 를 쓰는 경우
- 함수 파라미터
- 함수 반환값
- 로컬 변수
- 아주 짧은 스코프의 일시 참조

예시:

```cpp
UCameraComponent* GetCameraComponent() const
{
    return CameraComponent;
}

void ApplyDamage(AActor* TargetActor);
```

### 다른 포인터를 써야 하는 경우
- 소유하지 않고 살아있는지만 보고 싶다: `TWeakObjectPtr`
- 에셋 경로를 들고 있고 로드를 미루고 싶다: `TSoftObjectPtr`

---

## 자주 나오는 오해

### 오해 1. `TObjectPtr` 만 GC safe 하다
아니다.
- `UPROPERTY() UObject*` 도 strong reference 이다.
- `UPROPERTY() TObjectPtr<UObject>` 도 strong reference 이다.

### 오해 2. `TObjectPtr` 가 런타임 성능을 크게 올린다
아니다.
- 보통 핵심 이점은 gameplay CPU 보다는 editor/cook/GC/tooling 쪽이다.

### 오해 3. `TObjectPtr` 가 `TSoftObjectPtr` 를 대체한다
아니다.
- `TObjectPtr` 는 hard reference 다.
- 로드를 지연하고 싶으면 `TSoftObjectPtr` 가 맞다.

### 오해 4. `TObjectPtr` 가 ownership 을 가진다
아니다.
- `shared_ptr` 같은 ownership 포인터가 아니다.
- 엔진 친화적인 UObject strong reference wrapper 에 가깝다.

---

## 팀 권장 규칙
- `UObject` 멤버 변수는 기본적으로 `UPROPERTY() TObjectPtr<T>` 를 사용한다.
- 함수 파라미터, 반환값, 로컬 변수는 raw `T*` 를 유지한다.
- soft reference 나 weak reference 문제를 `TObjectPtr` 로 해결하려 하지 않는다.
- 성능 최적화가 필요할 때는 `TObjectPtr` 자체보다 호출 경로와 resolve 빈도를 먼저 프로파일링한다.

---

## 현재 진행 상태
완료:
- `UPROPERTY() TObjectPtr<T>` 와 `UPROPERTY() T*` 의 strong reference 공통점 정리
- handle / access tracking / lazy resolve / barrier / tooling 차이 정리
- 성능 관점의 현실적 기대치 정리
- 실무 선택 기준과 예시 정리

아직 다루지 않은 범위:
- `TWeakObjectPtr`, `TSoftObjectPtr`, `TStrongObjectPtr` 와의 상세 비교
- NetSerialize / replication 경로 세부 동작
- Blueprint generated class / reinstancing 세부 케이스

---

## 빠른 결론
한 줄로 정리하면:

`UPROPERTY() UObject*` 는 여전히 유효한 strong reference 이지만, 새 멤버 선언에서는 `UPROPERTY() TObjectPtr<T>` 가 엔진의 현재 방향과 더 잘 맞는 기본 선택지다.


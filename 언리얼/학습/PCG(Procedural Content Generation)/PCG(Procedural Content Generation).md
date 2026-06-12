---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/pcg
  - type/learning
---

# PCG(Procedural Content Generation)

> [!summary] 요약
> PCG(Procedural Content Generation)는 큰 월드, 런타임 시스템, 데이터 계층, procedural generation, 대규모 AI 객체가 함께 동작하는 월드 관리 주제다.
> 스트리밍, 생성, 활성화, 대량 객체 처리 결과가 예상과 다를 때 확인한다.
> 핵심은 editor-time 데이터와 runtime 활성 상태, persistent 객체와 streaming 객체를 구분하는 것이다.

## 핵심 결론

- World Partition, Data Layer, PCG, Mass/SmartObjects는 로드 상태와 활성 상태를 분리해서 봐야 한다.
- 큰 월드 시스템은 actor reference, streaming cell, runtime generation source가 엇갈리면 문제가 생긴다.
- 문제가 생기면 cell/layer 상태, generation source, subsystem 등록, persistent collection을 순서대로 확인한다.

## 참고 자료

[Procedural Content Generation Framework in Unreal Engine | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/procedural-content-generation-framework-in-unreal-engine?application_version=5.7) | [Unreal Engine 5.7 is now available](https://www.unrealengine.com/news/unreal-engine-5-7-is-now-available)

## 개요
`PCG(Procedural Content Generation)`는 에디터와 런타임에서 절차적으로 포인트, 메시, 액터, 데이터 결과를 만드는 프레임워크다.
UE 5.7에서는 PCG Framework가 production-ready로 소개되었고, PCG Editor Mode와 GPU compute 개선, Polygon2D/Spline 연산 등이 중요한 변화로 언급된다.

## 왜 필요한가

월드 관리 문제는 객체가 "없다"기보다 아직 로드되지 않았거나 활성화되지 않은 상태일 때가 많다. PCG(Procedural Content Generation)를 볼 때는 데이터가 존재하는 위치와 런타임에 활성화되는 시점을 구분해야 한다.

## 작동 모델

World Partition은 월드를 cell 단위로 나누고 streaming source를 기준으로 로드한다. Data Layer와 PCG, SmartObjects, MassEntity 같은 시스템은 로드된 world 상태 위에서 별도의 활성화, generation, registration 절차를 수행한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| World Partition / Cell | 월드 스트리밍 단위 | grid, loading range, spatially loaded |
| Data Layer | actor 묶음의 활성/로드 상태 | asset, instance, runtime state |
| PCG Component / Graph | 절차적 생성 실행 | generation source, partitioned mode |
| SmartObject / Mass | 대량 상호작용/엔티티 관리 | registration, persistent collection |
| Subsystem | 월드 단위 시스템 상태 | init, tick, runtime data |

## 실행 흐름

1. 에디터에서 actor, graph, layer, smart object 데이터가 저장된다.
2. cook 또는 world open 시 descriptor와 registry가 런타임 데이터를 준비한다.
3. streaming source와 runtime state가 어떤 cell/layer를 로드하거나 활성화할지 결정한다.
4. PCG, SmartObject, Mass 같은 시스템이 로드된 객체를 등록하거나 생성한다.
5. streaming 변화와 상태 전환에 맞춰 참조, navigation, AI, save data를 갱신한다.

## 핵심 구성
| 요소 | 엔진 클래스 | 역할 |
| --- | --- | --- |
| PCG Graph | `UPCGGraph` | 노드와 파라미터를 담는 절차 생성 규칙 |
| PCG Component | `UPCGComponent` | actor에 붙어 graph를 실행하는 런타임/에디터 진입점 |
| PCG Subsystem | `UPCGSubsystem` | world 단위 실행, scheduling, partition 관리 |
| PCG Data | `UPCGData` | point, spatial, param 등 graph 사이를 흐르는 데이터 |
| PCG Settings | `UPCGSettings` | 노드별 설정과 실행 element 생성 기준 |
| PCG Partition Actor | `APCGPartitionActor` | partitioned PCG 결과를 cell 단위로 나누는 actor |
| Runtime Gen Scheduler | `FPCGRuntimeGenScheduler` | runtime generation scheduling |

## 기본 흐름
1. `UPCGGraph`에 입력, 필터, 변환, spawn 노드를 구성한다.
2. actor의 `UPCGComponent`가 graph를 참조한다.
3. component가 generation trigger에 따라 graph 실행을 요청한다.
4. `UPCGSubsystem`이 실행을 관리한다.
5. node는 `UPCGData`를 읽고 새 `UPCGData` 또는 managed resource를 만든다.
6. spawn 결과는 cleanup/regenerate 대상이 될 수 있도록 component가 관리한다.

## World Partition과의 연결
partitioned PCG는 World Partition과 함께 쓸 때 cell 단위 생성/저장을 고려해야 한다.
에디터 viewport에서는 보이지만 PIE나 packaged build에서 안 보이는 문제는 generation source, partition actor, landscape cache, serialization 설정을 같이 확인해야 한다.

> [!caution]
> PCG 결과가 에디터에서 보인다고 packaged build에서도 자동으로 같은 방식으로 생성된다고 보면 안 된다. runtime trigger, serialized result, partition 설정, referenced asset cook 포함 여부를 분리해서 확인해야 한다.

## 실무 사용 기준
| 목적 | 권장 접근 |
| --- | --- |
| 반복 배치/장식 | editor-time generation 후 결과 관리 |
| 플레이어 주변 동적 생성 | runtime generation source와 partition 설정 확인 |
| 대규모 바이옴 | PCG Biome / World Partition / HLOD와 같이 설계 |
| 런타임 성능 민감 | graph cost, point count, GPU compute, managed resource cleanup 확인 |
| 멀티플레이 | 서버 생성 결과와 클라이언트 가시성을 별도로 검증 |

## 디버깅 체크리스트
- PCG plugin이 켜져 있는지 확인한다.
- `UPCGComponent`의 generation trigger를 확인한다.
- partitioned 옵션을 켰다면 `APCGPartitionActor` 생성과 cell 연결을 본다.
- PIE와 editor viewport generation source가 같은지 확인한다.
- packaged build에서는 generated resource가 cook에 들어갔는지 확인한다.
- landscape/cache/data layer를 input으로 쓰면 streaming 상태를 같이 본다.

## 엔진 소스 참고 포인트
- `Engine\Plugins\PCG\Source\PCG\Public\PCGGraph.h`: `UPCGGraph`, graph instance 구조.
- `Engine\Plugins\PCG\Source\PCG\Public\PCGComponent.h`: graph 실행을 요청하는 component.
- `Engine\Plugins\PCG\Source\PCG\Public\Subsystems\PCGSubsystem.h`: world subsystem과 execution 관리.
- `Engine\Plugins\PCG\Source\PCG\Public\PCGData.h`: graph를 흐르는 data의 기본 타입.
- `Engine\Plugins\PCG\Source\PCG\Public\PCGSettings.h`: node settings 기본 구조.
- `Engine\Plugins\PCG\Source\PCG\Public\Grid\PCGPartitionActor.h`: partitioned PCG actor.
- `Engine\Plugins\PCG\Source\PCG\Public\RuntimeGen\PCGRuntimeGenScheduler.h`: runtime generation scheduler.

## 2026-05-12 심화 보강: 따라 하는 사용법과 원리

이 섹션은 이어지는 세부 항목을 통해 관련 개념과 확인 지점을 정리한다.

## 학습 목표
이 문서를 학습한 뒤에는 아래 질문에 답할 수 있어야 한다.

- PCG Graph가 직접 actor를 만드는 것이 아니라, `UPCGComponent`와 `UPCGSubsystem`을 통해 실행되는 이유
- Editor-time generation과 runtime generation의 차이
- Partitioned PCG에서 왜 `APCGPartitionActor`가 생기는지
- 에디터에서는 보이는데 패키징(Packaging) 빌드(Build)에서는 결과가 안 나오는 이유를 어떻게 추적할지

## 사용법 1: Static Mesh를 바닥에 흩뿌리는 기본 PCG Graph
가장 단순한 학습 예시는 바닥 actor 위에 바위나 풀 mesh를 배치하는 것이다.

## 준비
1. `Edit > Plugins`에서 `Procedural Content Generation Framework`를 활성화한다.
2. 레벨에 바닥용 Static Mesh Actor 또는 Landscape를 둔다.
3. 콘텐츠 브라우저에서 `PCG Graph` 에셋을 만든다.
4. 배치 기준 actor에 `PCG Component`를 추가한다.
5. `PCG Component`의 Graph에 만든 `PCG Graph`를 지정한다.

## Graph 구성 예시
| 단계 | 노드 | 의미 |
| --- | --- | --- |
| 1 | `Input` | PCG Component가 붙은 actor나 landscape를 입력으로 사용 |
| 2 | `Surface Sampler` 또는 `Mesh Sampler` | 표면 위 point 생성 |
| 3 | `Density Filter` | 너무 빽빽한 point 제거 |
| 4 | `Transform Points` | 위치, 회전, 스케일 랜덤화 |
| 5 | `Static Mesh Spawner` | point마다 mesh instance 생성 |

실습에서는 먼저 point 수를 적게 잡아야 한다.
처음부터 수천 개를 생성하면 graph 문제인지 성능 문제인지 구분하기 어렵다.

> [!tip]
> PCG 학습의 첫 목표는 멋진 결과가 아니라 “입력 데이터가 point로 변환되고, point가 resource 생성으로 바뀌는 흐름”을 보는 것이다.

## 사용법 2: 블루프린트/코드에서 재생성 타이밍 제어
PCG Component는 에디터에서 자동 생성되게 둘 수도 있지만, 게임 중 특정 이벤트에 맞춰 생성하도록 만들 수도 있다.
블루프린트에서는 보통 `Generate`와 `Cleanup` 계열 함수를 사용한다.
C++에서는 `UPCGComponent::Generate()`와 `UPCGComponent::Cleanup()` 흐름으로 이해하면 된다.

```cpp
void AMyPCGVolumeActor::RegeneratePCG()
{
    if (UPCGComponent* PCGComp = FindComponentByClass<UPCGComponent>())
    {
        PCGComp->Cleanup();
        PCGComp->Generate();
    }
}
```

이 코드는 “결과를 지우고 다시 만든다”는 의도를 보여주는 예시다.
실제 프로젝트에서는 현재 generation task가 진행 중인지, runtime에서 허용된 trigger인지, partitioned component인지도 확인해야 한다.

## 왜 그렇게 동작하는가
엔진 코드 기준으로 `UPCGComponent::Generate()`는 바로 모든 mesh를 만드는 함수가 아니다.
흐름은 다음과 같이 나뉜다.

1. `UPCGComponent::ShouldGenerate()`가 trigger, force, component 상태를 검사한다.
2. 조건이 맞으면 `UPCGSubsystem::ScheduleComponent()`로 실행을 예약한다.
3. graph executor가 노드 단위 task를 실행한다.
4. 각 node의 `UPCGSettings`가 실제 element를 만들고, input `UPCGData`를 output `UPCGData`로 바꾼다.
5. spawn node는 결과 actor/component/ISM 같은 managed resource를 만든다.
6. cleanup 때는 component가 관리 중인 resource를 찾아 정리한다.

즉 PCG는 “그래프를 순서대로 즉시 실행하는 에디터 스크립트”가 아니라, subsystem과 task scheduler 위에서 동작하는 데이터 처리 파이프라인이다.
이 구조 때문에 대규모 graph, partitioned generation, runtime generation을 같은 틀에서 처리할 수 있다.

## Partitioned PCG 원리
Partitioned PCG를 켜면 원본 component 하나가 모든 결과를 직접 들고 있지 않는다.
대신 월드 grid와 겹치는 영역에 `APCGPartitionActor`가 생기고, partition actor 안에 local PCG component가 매핑된다.

엔진 코드에서는 `FPCGActorAndComponentMapping`이 original component와 partition actor/local component의 관계를 관리한다.
`APCGPartitionActor::GetLocalComponent()`와 `AddGraphInstance()` 같은 함수가 이 구조를 보여준다.

이 방식의 의미는 다음과 같다.

- World Partition cell 단위로 PCG 결과를 나눌 수 있다.
- 멀리 있는 cell의 결과를 계속 메모리에 들고 있지 않아도 된다.
- 원본 graph를 유지하면서 cell별 local execution 결과를 따로 관리할 수 있다.

## 사례: 에디터에서는 보이는데 PIE/패키징에서 안 보이는 경우
이 문제는 흔하다. 원인을 한 번에 “PCG 버그”로 보면 안 된다.

## 확인 순서
1. Graph가 editor-only generation으로만 실행된 것은 아닌지 본다.
2. `UPCGComponent`의 generation trigger가 runtime에서 실행되는지 확인한다.
3. partitioned PCG라면 `APCGPartitionActor`가 해당 cell에 존재하는지 본다.
4. spawn되는 mesh/material이 cook에 포함되는지 확인한다.
5. input landscape 또는 data layer가 아직 loaded 상태인지 확인한다.
6. graph 결과를 저장해 두는 방식인지, 런타임에 매번 생성하는 방식인지 구분한다.

## 사례: 플레이어 주변에만 동적으로 생성하기
런타임 생성은 “플레이어 근처만 생성”이라는 요구와 잘 맞지만, 네트워크와 저장 문제를 동반한다.

- 서버 권한(Authority) 결과가 필요한 gameplay actor라면 서버에서 생성하고 복제(Replication)해야 한다.
- 장식용 foliage라면 클라이언트 로컬 생성도 가능하지만 deterministic seed를 맞춰야 시각 차이가 줄어든다.
- 저장/로드가 필요한 결과라면 PCG 결과를 그대로 믿기보다 seed, graph version, player edit diff를 따로 기록하는 편이 낫다.

## 추가 학습 과제
- 같은 graph를 editor-time generation과 runtime generation으로 각각 실행해 보고 결과 차이를 기록한다.
- partitioned PCG를 켠 뒤 World Outliner에서 `APCGPartitionActor`가 어떻게 생기는지 확인한다.
- mesh reference를 soft reference로 바꾼 뒤 packaged build에서 cook 누락이 발생하는지 테스트한다.

## 2026-05-12 심화 보강 보완: 점검과 추가 학습

### 자주 막히는 문제

- PCG Graph를 수정했는데 결과가 그대로다: 컴포넌트가 자동 생성 모드인지, `Generate`/`Cleanup`을 호출했는지, 캐시가 남아 있는지 확인한다.
- 에디터에서는 보이는데 패키지에서 결과가 다르다: 런타임 생성 여부, 참조된 Static Mesh/Data Asset의 cook 포함 여부를 확인한다.
- 너무 많은 인스턴스가 생긴다: density, bounds, pruning, seed를 확인하고 출력 포인트 수를 먼저 디버그한다.
- World Partition에서 셀마다 결과가 끊긴다: Partition Actor 경계, seed, 입력 bounds가 셀 단위로 어떻게 나뉘는지 확인한다.

### 부가 자료

- 공식 문서: Procedural Content Generation Framework, PCG Biomes, PCG Runtime Generation.
- 엔진 소스: `Engine\Plugins\PCG\Source\PCG\Private\PCGComponent.cpp`.
- 엔진 소스: `Engine\Plugins\PCG\Source\PCG\Private\Grid\PCGPartitionActor.cpp`.
- 실습 도구: PCG Debug View, generated points inspection, World Partition Preview.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 에디터에 배치된 actor는 런타임에 항상 존재한다. | streaming cell과 Data Layer runtime state를 확인한다. |
| 로드 상태와 활성 상태는 같다. | loaded, activated, generated, registered 상태를 분리한다. |
| 대규모 시스템은 actor 참조로 직접 연결해도 된다. | descriptor, subsystem, registry 기반 연결을 우선 검토한다. |

## 관련 문서

- 관련 문서가 아직 정리되지 않았다.

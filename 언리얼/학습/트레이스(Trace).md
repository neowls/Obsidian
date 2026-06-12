---
type: unreal-learning
status: review
migration_status: done
updated: 2026-06-10
tags:
  - unreal
  - unreal/trace
  - type/learning
---

# 트레이스(Trace)

> [!summary] 요약
> 트레이스(Trace)는 벡터, 좌표계, 충돌 쿼리, transform 해석을 통해 게임 월드의 방향과 접촉을 판단하는 주제다.
> 조준, 감지, 이동 방향, trace hit, 회전 보정이 예상과 다를 때 확인한다.
> 핵심은 월드/로컬 공간, 정규화 여부, collision channel, hit result 의미를 먼저 구분하는 것이다.

## 핵심 결론

- 벡터 계산은 방향, 크기, 기준 좌표계를 분리해야 해석이 흔들리지 않는다.
- trace와 collision 결과는 channel/object type/response 설정에 크게 의존한다.
- 문제가 생기면 입력 벡터 정규화, transform 기준, collision profile, debug draw 결과를 순서대로 확인한다.

## 개요
두 지점이 제공되었을 때 직선상으로 뻗어나가 무엇이 존재하는지 확인할 수 있는 메서드이다.
본질적으로 다른 소프트웨어의 레이 캐스트(Raycast) 혹은 레이 트레이스(Raytrace)와 같다.

> [!info] 각 트레이스의 타입, 종류, 범위
> | 종류 | 타입 | 범위 |
> | :-----: | :-----: | :-----: |
> |   쉐이프   |   채널    |   싱글    |
> |   라인    |  오브젝트   |   멀티    |

## 왜 필요한가

수학과 충돌 쿼리 문제는 결과값만 보면 맞는지 판단하기 어렵다. 트레이스(Trace)를 볼 때는 계산 기준과 시각화 결과를 함께 놓아야 실제 월드에서 어떤 의미인지 빠르게 확인할 수 있다.

## 작동 모델

게임플레이 코드는 위치와 방향을 벡터/transform으로 표현하고, 월드 쿼리는 그 값을 collision 설정과 함께 해석한다. 내적/외적은 방향 관계를 수치로 바꾸고, trace는 월드의 물리/충돌 설정을 기준으로 hit 정보를 반환한다.

## 주요 객체와 책임

| 객체 | 책임 | 먼저 볼 것 |
| --- | --- | --- |
| `FVector` / `FTransform` | 위치, 방향, 좌표계 표현 | world/local 기준, normalize |
| `UWorld` trace API | line/sweep/overlap query 실행 | channel/object query |
| Collision Profile | 충돌 응답 정의 | preset, response, object type |
| `FHitResult` | 쿼리 결과 정보 | blocking hit, impact point, normal |
| Debug Draw | 계산 결과 시각화 | 시작/끝점, 법선, 색상 |

## 실행 흐름

1. 기준 actor 또는 component에서 world/local 위치와 방향을 얻는다.
2. 필요한 경우 방향 벡터를 정규화하고 회전/transform을 적용한다.
3. collision channel, object query, ignore list를 명시한다.
4. trace, sweep, overlap을 실행하고 blocking/overlap 결과를 구분한다.
5. debug draw와 hit normal/impact point로 계산이 의도와 맞는지 검증한다.

## 채널 · 오브젝트 유형

![[LineTracemark.png]]
트레이스는 피직스 시스템을 사용하며, 대상 카테고리를 정의할 수 있다.
크게 **채널(Channel)** 과 **오브젝트 유형(Object Type)** 으로 나눌 수 있다.

채널은 대표적으로 비저빌리티(Visibility)와 카메라(Camera) 에 사용되며,
오브젝트 유형은 씬에 콜리전이 있는 피직스 액터 유형으로, 폰(Pawn), 비히클(Vehicle), 디스트럭터블(Destructible) 액터 등에 사용된다.

## 콜리전(Collision)

![[Pasted image 20241217154000.png]]
쏘는 트레이스가 있다면 이를 맞을 객체도 필요하다.
콜리전(Collision) 항목에서 트레이스 감지 및 다른 객체와의 물리적 상호작용을 설정할 수 있다.
트레이스와 관련된 항목으로는 **Collision Enabled, Object Type, Trace Responses** 이 세가지만 보면된다.

### Collision Enabled

| 종류                |                   설명                    | 트레이스 여부 |
| :---------------- | :-------------------------------------: | :-----: |
| NoCollision       |            어떠한 상호작용도 하지 않는다.            |    X    |
| Query Only        |             트레이스 상호작용만 한다.              |    O    |
| Physics Only      |              물리적 상호작용만 한다.              |    X    |
| Collision Enabled |              모든 상호작용을 한다.               |    O    |
| Probe Only        | NoCollision 과 유사하지만 NavMesh 구성하는데 작용된다. |    X    |
| Query and Probe   |     Probe Only 에서 트레이스 상호작용이 추가된다.      |    O    |
말 그대로 이 객체의 콜리전이 어떠한 방식으로 동작할지 설정하는 부분이다.

> [!tip] 팁
> 물리적 충돌은 원하지 않지만 어떠한 상호작용되는 필드를 구성하고 싶다면 Query Only 로 구성하면 된다.
> 반대로, 물리적 충돌만 원하고 트레이스 되는걸 원치않는다면 Physics Only 로 구성하면 된다.
>

### Object Type
오브젝트 타입 설정하는 부분이다.
오브젝트 타입을 활용한 라인 트레이스를 쏘았을 때 **맞은 객체가 해당 설정을 어떻게 했느냐**에 따라 감지될지 안될지가 결정된다.
추가적으로 오브젝트 트레이스는 Collision Responses 설정과는 무관하게 동작한다.

> [!example] 예시
> 만약 맞는 객체가 이 설정을 WorldStatic 으로 설정하였고, 쏘는 트레이스도 WorldStatic 을 포함하고 있다면 감지가 되지만, 이부분이 서로 다르다면 감지되지 않는다.
>
> ![[Pasted image 20241217160342.png]]
>

### Trace Responses
채널 트레이스에 감지될 때 사용되며, **Ignore, Overlap, Block** 세가지로 구분된다.
- Ignore : 말그대로 전반적인 트레이스 감지에서 제외된다.
- Overlap : 멀티 채널 트레이스에서 주로 사용되며 감지되지만 트레이스를 막지않고 통과시킨다.
- Block : 트레이스에 감지되며 통과시키지 않는다.

## 싱글 또는 멀티 히트 반환
트레이스를 할 때, 감지된 것 중 범주에 일치하는 첫 번째 것을 반환하도록 하거나, 모든 것을 반환하도록 할 수 있다.

![[Pasted image 20241216095403.png]]

> [!Caution] 멀티 트레이스 사용시 주의사항
> - 채널
> 	- 첫 번째까지 포함하여 모든 오버랩(Overlap)을 반환한다.
>
>
> - 오브젝트
>	- 트레이스에 설정된 오브젝트 유형과 일치하는 모든 것을 반환한다.
>	- 트레이스의 시작과 끝 사이의 오브젝트 수를 계산하는 데 유용하다.

## 히트 결과(Hit Result)
트레이스는 기본적으로 무언가 감지할 때 **Hit Result** 구조체를 반환한다.

| **멤버**              | 정의                                                                  |
| ------------------- | ------------------------------------------------------------------- |
| **Blocking Hit**    | 히트가 블로킹 히트였는지 여부, 트레이스가 겹치게만 하고 멈추지는 않도록 하는 기능때문에 채널 멀티 트레이스시 사용된다. |
| **Initial Overlap** | 결과 중 첫 번째 오버랩인지 여부                                                  |
| **Time**            | 트레이스 방향 상의 임팩트 시간으로 0.0 ~ 1.0 까지 이며, 히트가 없는 경우 1.0 반환 한다.           |
| **Distance**        | 시작 지점에서 위치까지 월드 스페이스 거리                                             |
| **Location**        | 트레이스 쉐이프에 따라 변경된 히트의 월드 스페이스 위치                                     |
| **Impact Point**    | 트레이스 쉐이프를 포함하지 않은 히트의 절대 위치                                         |
| **Normal**          | 트레이스 방향                                                             |
| **Impact Normal**   | 히트 표면 노멀 값                                                          |
| **Phys Mat**        | 히트 표면의 피지컬 머터리얼 값                                                   |
| **Hit Actor**       | 히트된 액터                                                              |
| **Hit Component**   | 히트된 특정 컴포넌트                                                         |
| **Hit Bone Name**   | **스켈레탈 메쉬**에 대해 트레이스를 한 경우 히트한 본 이름                                 |
| **Bone Name**       | 트레이스 본 히트의 이름                                                       |
| **Hit Item**        | 프리미티브의 어느 아이템에 히트했는지 기록하는 프리미티브 전용 데이터                              |
| **Element Index**   | 여러 파트로 프리미티브와 충돌할 경우 히트한 파트 인덱스                                     |
| **Face Index**      | 트라이메시 또는 랜드스케이프와 충돌하는 경우 히트한 면 인덱스                                  |
| **Trace Start**     | 트레이스 시작 위치                                                          |
| **Trace End**       | 트레이스 끝 위치                                                           |

## 쉐이프 트레이스(Shape Trace)

![[Pasted image 20241216095442.png]]

라인 트레이스(Line Trace)가 충분치 않은 경우, 쉐이프 트레이스(Shape Trace)를 사용하면 원하는 결과를 얻을 수도 있다.
쉐이프 트레이스에는 박스 트레이스(Box Trace), 캡슐 트레이스(Capsule Trace), 구체 트레이스(Sphere Trace) 등이 있다.

![[Pasted image 20241216095633.png]]

각 쉐이프 트레이스 함수는 시작 지점(Start)에서 끝 지점(End)까지 스윕(Sweep) 및 검사를 할 때 라인 트레이스처럼 작동하나, 레이캐스트에서 **어떤 부피를 갖는 모양을 사용하여 한번 더 검사를 한다는 점**이 다르다.
쉐이프 트레이스 또한 싱글 · 멀티 트레이스로 사용할 수 있으며, 각각 라인 트레이스와 같은 방식으로 구성할 수 있지만, 쉐이프의 크기나 방향 관련해서 추가적인 정보를 제공해 줘야 한다.

## 트레이스에서 UV 좌표 구하기
1. 상단 편집(Edit) 메뉴의 프로젝트 세팅 창(Project Settings...)을 연다.
	![[Pasted image 20241216100904.png]]
2. 프로젝트 세팅의 피직스(Physics) 섹션에서 **히트 결과에서 UV 지원(Support UV From Hit Result)** 기능을 켠다.
	![[Pasted image 20241216100909.png]]
3. 에디터를 재시작한다.

## 흔한 실수와 안전한 대안

| 오해 | 안전한 대안 |
| --- | --- |
| 벡터 값이 맞으면 방향 판단도 맞다. | 정규화 여부와 world/local 기준을 먼저 확인한다. |
| trace가 안 맞으면 시작/끝점만 문제다. | collision channel, object type, response, ignored actor를 같이 본다. |
| hit location과 impact point는 항상 같다. | sweep, shape trace, penetration 상황에서 의미를 구분한다. |

## 디버깅 체크리스트

- [ ] 시작점, 끝점, 방향 벡터를 debug draw로 시각화했다.
- [ ] 벡터가 필요한 곳에서 정규화되었고 0 벡터를 처리했다.
- [ ] world/local transform 변환 방향이 의도와 맞다.
- [ ] collision profile, channel, object response, ignore list를 확인했다.
- [ ] `FHitResult`의 blocking hit, actor/component, normal, impact point를 구분했다.

## 관련 문서

- [[내적과 외적]]
- [[이동 벡터 회전]]
- [[Gameplay Cameras]]
- [[AI 지각(AI Perception)]]
- [[환경 쿼리 시스템(EQS)]]

[GameplayCameraComponent | Unreal Engine 5.7 Python API | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/GameplayCameraComponent?application_version=5.7) | [UGameplayCameraComponent API](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/GameplayCameras/GameFramework/UGameplayCameraComponent/__ctor)

# 개요
`Gameplay Cameras`는 기존 `CameraComponent`와 `PlayerCameraManager`만으로 처리하기 어려운 복잡한 카메라 규칙을 asset, node, evaluator, evaluation context로 분리하는 카메라 프레임워크다.
액션 게임에서는 락온, 벽 충돌, 자동 회전, 조준, 연출 카메라가 동시에 영향을 주므로 카메라를 단순 spring arm 설정으로만 보지 않는 것이 중요하다.

# 기존 카메라와의 구분
| 계층 | 역할 |
| --- | --- |
| `UCameraComponent` | actor에 붙는 전통 카메라 컴포넌트 |
| `APlayerCameraManager` | 최종 view target과 camera POV 계산 |
| `UGameplayCameraComponent` | camera asset을 evaluation context 안에서 실행 |
| `UGameplayCameraSystemComponent` | camera system host 역할 |
| `FCameraSystemEvaluator` | camera node graph를 평가하는 런타임 |
| `UCameraNode` / evaluator | 카메라 동작을 구성하는 노드와 실행 객체 |

# 핵심 흐름
1. 카메라 규칙을 camera asset/node로 구성한다.
2. `UGameplayCameraComponent` 또는 system host가 evaluation context를 만든다.
3. active camera rig가 evaluator에 의해 평가된다.
4. blend stack, input node, shake, framing node가 최종 pose/FOV를 만든다.
5. PlayerCameraManager 또는 host가 결과를 실제 view에 반영한다.

# 액션 게임 기준 체크포인트
| 문제 | 봐야 할 축 |
| --- | --- |
| 락온 카메라 | target actor, yaw/pitch clamp, obstacle handling |
| 회피/처형 연출 | gameplay camera activation과 blend out |
| 좁은 공간 | collision, shoulder offset, camera distance |
| 조준 모드 | FOV, sensitivity, control rotation ownership |
| 멀티플레이 | local player 전용 카메라와 replicated state 분리 |

> [!caution]
> 카메라 결과는 대개 로컬 플레이어 표현이다. 서버 상태로 복제할 값과 로컬 카메라 보정 값을 섞으면 네트워크 설계가 복잡해진다.

# 디버깅 체크리스트
- 어떤 actor/component가 active camera evaluation context를 소유하는지 확인한다.
- blend stack에 남은 이전 camera rig가 있는지 본다.
- control rotation을 카메라가 쓰는지, character movement가 쓰는지 분리한다.
- Gameplay Camera와 기존 SpringArm/CameraComponent를 동시에 쓸 때 최종 POV 주체를 확인한다.
- camera shake와 gameplay camera node가 같은 축을 중복 수정하지 않는지 본다.

# 엔진 소스 참고 포인트
- `Engine\Plugins\Cameras\GameplayCameras\Source\GameplayCameras\Public\GameFramework\GameplayCameraComponent.h`: `UGameplayCameraComponent`.
- `Engine\Plugins\Cameras\GameplayCameras\Source\GameplayCameras\Public\GameFramework\GameplayCameraSystemComponent.h`: camera system component.
- `Engine\Plugins\Cameras\GameplayCameras\Source\GameplayCameras\Public\Core\CameraSystemEvaluator.h`: evaluator 본체.
- `Engine\Plugins\Cameras\GameplayCameras\Source\GameplayCameras\Public\Core\CameraNodeEvaluator.h`: node evaluator 기본 구조.
- `Engine\Plugins\Cameras\GameplayCameras\Source\GameplayCameras\Public\Core\CameraEvaluationContext.h`: context 구조.
- `Engine\Source\Runtime\Engine\Classes\Camera\PlayerCameraManager.h`: 최종 player camera manager와 기존 경로 비교.

## 2026-05-12 심화 보강: Gameplay Cameras를 기능 단위 카메라 시스템으로 쓰기

### 학습 목표

- 기존 `PlayerCameraManager`/CameraComponent 방식과 Gameplay Cameras의 차이를 이해한다.
- Camera Rig, Camera Asset, Evaluation Context가 어떤 역할을 하는지 구분한다.
- 락온, 대화, 처형 연출처럼 상황별 카메라를 안전하게 전환하는 패턴을 익힌다.

### 왜 필요한가

전통적인 카메라 구현은 PlayerCameraManager에서 여러 조건문을 두거나, Pawn의 SpringArm/CameraComponent 설정을 직접 바꾸는 방식이 많다. 처음에는 단순하지만 락온, 조준, 대화, 시네마틱, 처형, 탑승, 관전 카메라가 늘어나면 조건문과 보간 상태가 복잡하게 얽힌다.

Gameplay Cameras는 카메라 동작을 Camera Rig/Node/Evaluator로 분리해 상황별 카메라 구성을 독립적으로 만들려는 시스템이다. 핵심은 카메라 로직을 하나의 거대한 Tick 함수가 아니라 평가 가능한 카메라 그래프로 구성한다는 점이다.

### 기본 사용 흐름

1. 프로젝트에서 Gameplay Cameras 플러그인/모듈 사용 여부를 확인한다.
2. Camera Asset 또는 Camera Rig Asset을 만든다.
3. 기본 Follow, Aim, Offset, Blend 같은 노드를 구성한다.
4. PlayerController 또는 Pawn 쪽에 Gameplay Camera 관련 Component를 둔다.
5. 상황이 시작될 때 Camera Rig를 Activate하고, 끝날 때 비활성화하거나 우선순위를 낮춘다.
6. 최종 카메라 결과가 PlayerCameraManager를 통해 뷰로 반영되는지 확인한다.

### 사용 사례: 락온 카메라

락온 카메라는 일반 추적 카메라와 다르게 플레이어와 타겟의 관계를 중심으로 회전한다.

- 입력이 없을 때도 타겟을 화면 중심 근처에 유지한다.
- 플레이어가 가까이 붙으면 카메라 충돌과 FOV를 조정한다.
- 타겟이 죽거나 시야 밖으로 멀어지면 일반 카메라로 돌아간다.

Gameplay Cameras를 사용하면 `DefaultFollowRig`, `LockOnRig`, `DialogueRig`처럼 상황별 Rig를 만들고, 게임 상태에 따라 활성 Rig를 바꾸는 식으로 설계할 수 있다.

```cpp
void AMyPlayerController::StartLockOn(AActor* NewTarget)
{
    LockOnTarget = NewTarget;

    if (CameraEvaluationComponent && LockOnCameraRig)
    {
        FGameplayCameraRigActivationParams Params;
        Params.CameraRig = LockOnCameraRig;
        Params.EvaluationContextOwner = this;
        CameraEvaluationComponent->ActivateCameraRig(Params);
    }
}
```

실제 프로젝트에서는 사용 중인 UE5.7 Gameplay Cameras API의 파라미터 타입과 활성화 함수 시그니처를 헤더에서 확인해야 한다. 원리는 타겟을 바꿀 때 SpringArm 값을 직접 덮어쓰기보다, 락온용 Camera Rig를 활성화하고 평가 그래프가 원하는 뷰를 산출하게 만드는 것이다.

### 엔진에서 카메라 평가가 흐르는 방식

UE5.7 엔진 소스의 `Engine\Plugins\Cameras\GameplayCameras\Source`를 기준으로 보면 다음 흐름을 확인할 수 있다.

1. Blueprint Function 또는 코드에서 Camera Rig 활성화를 요청한다.
2. `UControllerGameplayCameraEvaluationComponent::ActivateCameraRig`가 요청을 받아 평가 시스템에 전달한다.
3. Camera Rig는 Root Node Evaluator를 통해 평가된다.
4. Gameplay Camera Component/System은 매 프레임 카메라 뷰를 계산한다.
5. `UGameplayCamerasPlayerCameraManager::DoUpdateCamera`가 계산된 카메라 뷰를 PlayerCameraManager의 결과로 반영한다.

즉 최종 뷰는 여전히 Unreal의 카메라 파이프라인 안에서 PlayerCameraManager를 통해 사용되지만, 그 뷰를 만드는 내부 로직을 Gameplay Cameras가 더 구조화된 방식으로 담당한다.

### 기존 CameraComponent와 섞어 쓸 때의 원칙

- 하나의 프레임에 최종 카메라 권한을 가진 시스템은 하나로 정한다.
- Pawn의 SpringArm 값과 Gameplay Camera Rig가 동시에 같은 값을 보간하면 흔들림이 생긴다.
- 카메라 충돌은 SpringArm 충돌, Camera Rig collision node, 커스텀 trace 중 어디에서 처리할지 정한다.
- 시네마틱 카메라와 게임플레이 카메라의 우선순위 전환 규칙을 명확히 한다.

### 사례: 대화 카메라

NPC와 대화할 때는 일반 카메라를 그대로 쓰기보다 대화용 Rig를 따로 두는 편이 좋다.

- 시작: Player와 NPC 위치를 기준으로 over-the-shoulder Rig 활성화.
- 진행: 현재 말하는 대상에 따라 target actor를 전환.
- 선택지: UI가 가리지 않도록 화면 오른쪽 여백을 유지.
- 종료: 일반 Follow Rig로 블렌드 아웃.

이때 대화 시스템이 카메라 컴포넌트 값을 직접 수정하지 않고 `DialogueCameraMode` 같은 상태만 알리게 하면 카메라 로직과 대화 로직의 결합이 줄어든다.

### 사례: 보스 처형 연출

처형 연출에서는 카메라가 애니메이션과 정밀하게 맞아야 한다.

- 애니메이션 몽타주 구간 시작 시 처형 Camera Rig를 활성화한다.
- 타겟 소켓 또는 Motion Warping target과 같은 기준 transform을 카메라 입력으로 사용한다.
- 연출 구간 중 플레이어 입력 카메라 회전을 잠근다.
- 종료 직전에 일반 게임플레이 Rig로 블렌드한다.

여기서 중요한 원리는 카메라가 애니메이션을 따라가는 것이 아니라, 둘 다 같은 게임플레이 기준점(target transform)을 참조하도록 만드는 것이다. 그래야 타겟 위치가 조금 달라도 연출이 안정적으로 맞는다.

### 자주 막히는 문제

- 카메라가 한 프레임 튄다: Rig 활성화 시 초기값이 현재 카메라와 맞지 않거나 블렌드 시간이 0일 수 있다.
- 입력 회전과 Rig 회전이 싸운다: Controller rotation, Pawn control rotation, Camera Rig의 yaw/pitch 소유권을 정리한다.
- 시네마틱 후 카메라가 돌아오지 않는다: 이전 Rig를 stack에서 제거하거나 우선순위를 복구했는지 확인한다.
- 멀티플레이에서 다른 플레이어 카메라가 바뀐다: 카메라 활성화는 로컬 PlayerController 기준으로 처리해야 한다.
- 패키지에서 asset이 누락된다: Camera Asset 참조가 soft reference라면 cook 경로를 확인한다.

### 실습 과제

1. 기본 Follow Rig와 Aim Rig를 만들고 우클릭 조준 시 전환한다.
2. 락온 타겟을 바꾸면서 카메라가 얼마나 안정적으로 보간되는지 확인한다.
3. 대화 시작/종료에 Rig를 블렌드하고 UI 영역을 피해 composition을 맞춘다.
4. 같은 기능을 PlayerCameraManager 조건문 방식으로 구현해 복잡도 차이를 비교한다.

### 부가 자료

- 공식 문서: Gameplay Cameras, PlayerCameraManager, Camera Components.
- 엔진 소스: `Engine\Plugins\Cameras\GameplayCameras\Source\Runtime\GameplayCameras`.
- 확인 파일: `GameplayCameraComponent.cpp`, `GameplayCamerasPlayerCameraManager.cpp`, `ControllerGameplayCameraEvaluationComponent.cpp`.

[UAnimNotifyState_MotionWarping::OnBecomeRelevant | Unreal Engine 5.7 Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/MotionWarping/UAnimNotifyState_MotionWarping/OnBecomeRelevant) | [MotionWarpingTarget | Unreal Python 5.7](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/MotionWarpingTarget?application_version=5.7)

# 개요
`모션 워핑(Motion Warping)`은 루트 모션 애니메이션의 이동/회전 결과를 런타임 목표 지점에 맞게 보정하는 기능이다.
공격, 처형, 벽 넘기, 상호작용처럼 애니메이션의 시작 위치는 매번 다르지만 끝 위치는 정확히 맞아야 하는 동작에 사용한다.

# 전제조건
- `Motion Warping` 플러그인이 활성화되어 있어야 한다.
- 캐릭터 또는 소유 actor에 `UMotionWarpingComponent`가 필요하다.
- 애니메이션에 `AnimNotifyState_MotionWarping` window를 배치한다.
- 코드나 블루프린트에서 warp target을 추가해야 한다.

# 핵심 구성
| 요소 | 역할 |
| --- | --- |
| `UMotionWarpingComponent` | warp target 보관, notify window 감지, root motion 보정 |
| `FMotionWarpingTarget` | 정렬해야 하는 목표 transform 또는 component/bone 참조 |
| `UAnimNotifyState_MotionWarping` | 애니메이션 구간 안에서 warping window를 정의 |
| `URootMotionModifier` | root motion을 실제로 수정하는 modifier 기본 클래스 |
| `URootMotionModifier_Warp` | 목표 transform에 맞춰 root motion 보정 |
| `URootMotionModifier_SkewWarp` | skew 방식 warping |
| `URootMotionModifier_AdjustmentBlendWarp` | adjustment blend 방식 warping |
| `URootMotionModifier_PrecomputedWarp` | stationary target에 적합한 precomputed 방식 |

# 런타임 흐름
1. gameplay가 상호작용 지점, 적 위치, ledge 위치 같은 warp target을 계산한다.
2. `UMotionWarpingComponent::AddOrUpdateWarpTarget()`으로 이름 있는 target을 등록한다.
3. montage/sequence가 재생된다.
4. animation notify state가 relevant해지는 구간에서 root motion modifier가 생성된다.
5. component가 매 update마다 root motion을 modifier에 통과시킨다.
6. modifier가 target 기준으로 translation/rotation을 보정한다.

# 타겟 설계
warp target 이름은 notify window와 gameplay 코드가 만나는 계약이다.
예를 들어 처형이면 `ExecutionTarget`, 벽 넘기면 `VaultTarget`, 공격 위치 보정이면 `AttackWarpTarget`처럼 용도를 명확히 나눈다.

| 상황 | target 기준 |
| --- | --- |
| 처형 | 적 캐릭터의 socket 또는 capsule 앞 transform |
| 벽 넘기 | ledge detection 결과 transform |
| 근접 공격 보정 | 타겟 actor 위치 + offset |
| 문 열기/상호작용 | 상호작용 actor의 scene component |

> [!caution]
> target을 늦게 넣으면 notify window가 이미 지나가서 warping이 적용되지 않을 수 있다. 보통 montage 재생 직전 또는 notify window 시작 전에는 target이 준비되어야 한다.

# 디버깅 체크리스트
- 플러그인이 켜져 있는지 확인한다.
- 캐릭터에 `UMotionWarpingComponent`가 있는지 확인한다.
- notify state의 target name과 코드에서 등록한 target name이 같은지 확인한다.
- root motion animation인지 확인한다.
- montage section 전환 때문에 notify window가 건너뛰어지지 않는지 확인한다.
- target이 moving component라면 follow component 설정과 offset 방향을 확인한다.
- 네트워크에서는 서버 권한 위치와 클라이언트 시각 보정을 따로 검증한다.

# 엔진 소스 참고 포인트
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\MotionWarpingComponent.h`: component와 target 관리.
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\RootMotionModifier.h`: modifier와 target 구조.
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\AnimNotifyState_MotionWarping.h`: warping window notify.
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\RootMotionModifier_SkewWarp.h`: skew warp 구현.
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\RootMotionModifier_AdjustmentBlendWarp.h`: adjustment blend 구현.
- `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Public\MotionWarpingSwitchOffCondition.h`: target 조건 기반 중단.

## 2026-05-12 심화 보강: 처형/벽넘기 예제로 이해하기

# 학습 목표
모션 워핑을 온전히 이해하려면 “target을 넣으면 맞춰 준다”에서 멈추면 안 된다.
아래 흐름을 설명할 수 있어야 한다.

- notify window가 modifier를 언제 만들고 언제 끝내는지
- root motion이 world transform으로 바뀌기 전에 왜 보정되는지
- target name이 gameplay code와 animation notify 사이의 계약인 이유
- 네트워크에서 위치 보정과 시각 보정이 왜 분리되어야 하는지

# 사용법 1: 처형 몽타주를 적 위치에 맞추기
처형 애니메이션은 공격자와 피격자의 상대 위치가 정확해야 한다.
이때 공격자 캐릭터의 root motion을 피격자 앞의 정렬 위치로 보정한다.

## 에디터 설정
1. `Motion Warping` 플러그인을 활성화한다.
2. 공격자 캐릭터 blueprint 또는 C++ 클래스에 `MotionWarpingComponent`를 추가한다.
3. 처형 montage의 원하는 구간에 `AnimNotifyState_MotionWarping`을 추가한다.
4. notify의 Warp Target Name을 `ExecutionTarget`으로 지정한다.
5. root motion이 실제로 들어 있는 montage인지 확인한다.

## C++ target 등록 예시
```cpp
void AMyCharacter::PlayExecution(AActor* Victim)
{
    if (!MotionWarpingComponent || !Victim)
    {
        return;
    }

    const FVector VictimLocation = Victim->GetActorLocation();
    const FVector VictimForward = Victim->GetActorForwardVector();
    const FVector AttackerTargetLocation = VictimLocation - VictimForward * 120.0f;
    const FRotator AttackerTargetRotation = VictimForward.Rotation();

    MotionWarpingComponent->AddOrUpdateWarpTargetFromTransform(
        TEXT("ExecutionTarget"),
        FTransform(AttackerTargetRotation, AttackerTargetLocation));

    PlayAnimMontage(ExecutionMontage);
}
```

핵심은 montage를 재생하기 전에 target을 등록하는 것이다.
notify window가 이미 지나간 뒤 target을 넣으면 modifier가 유효한 target을 찾지 못할 수 있다.

# 사용법 2: 벽넘기 Vault에 적용하기
벽넘기는 ledge trace 결과를 target으로 쓰기 좋다.
흐름은 다음과 같다.

1. forward trace로 넘을 수 있는 벽을 찾는다.
2. top trace/down trace로 착지 지점을 계산한다.
3. 착지 지점을 `VaultTarget`으로 등록한다.
4. vault montage를 재생한다.
5. motion warping window에서 root motion을 착지 지점에 맞춘다.

```cpp
void AMyCharacter::StartVault(const FTransform& VaultLandingTransform)
{
    MotionWarpingComponent->AddOrUpdateWarpTargetFromTransform(
        TEXT("VaultTarget"),
        VaultLandingTransform);

    PlayAnimMontage(VaultMontage);
}
```

# 왜 그렇게 동작하는가
엔진 코드 기준 흐름은 다음과 같다.

1. `UMotionWarpingCharacterAdapter`가 `CharacterMovementComponent`의 `ProcessRootMotionPreConvertToWorld` delegate에 바인딩된다.
2. root motion이 world space로 변환되기 전, `UMotionWarpingComponent::ProcessRootMotionPreConvertToWorld()`가 호출된다.
3. component는 현재 animation time과 notify window를 보고 `UpdateWithContext()`를 실행한다.
4. notify window가 relevant해지면 `UAnimNotifyState_MotionWarping::OnBecomeRelevant()`가 modifier를 만든다.
5. `URootMotionModifier_Warp::Update()`가 현재 animation 구간, target, root motion delta를 기준으로 보정량을 계산한다.
6. 최종적으로 보정된 local root motion이 character movement에 전달된다.

이 구조 때문에 모션 워핑은 “캐릭터 위치를 강제로 set actor location 하는 기능”이 아니다.
루트 모션 자체를 목표 transform에 맞도록 변형하는 기능이다.
그래서 animation pose와 movement 결과의 싱크가 비교적 자연스럽다.

# 실패 사례와 원인
## 캐릭터가 전혀 보정되지 않는다
- montage가 root motion을 사용하지 않는다.
- notify window가 실제 재생 구간과 겹치지 않는다.
- target name이 `ExecutionTarget`과 `executiontarget`처럼 다르다.
- `MotionWarpingComponent`가 없는 actor에서 montage를 재생하고 있다.

## 회전은 맞는데 위치가 어긋난다
- target transform의 forward 방향이 반대로 계산되었을 수 있다.
- capsule half height나 mesh offset을 고려하지 않았을 수 있다.
- montage 시작 root pose와 gameplay target 기준 pose가 다를 수 있다.

## 네트워크에서 밀려 보인다
- 서버와 클라이언트가 서로 다른 target transform을 계산했을 수 있다.
- montage 시작 시점이 replicated montage와 어긋났을 수 있다.
- root motion source와 character movement correction이 서로 보정하고 있을 수 있다.

# 실전 설계 팁
- 처형처럼 결과 위치가 gameplay 판정에 중요하면 서버가 target을 확정한다.
- 카메라용 연출 위치처럼 시각 품질만 중요하면 로컬 보정도 가능하다.
- target name은 enum 또는 상수로 관리해서 notify와 코드 오타를 줄인다.
- 디버그 draw로 target transform의 위치와 forward 방향을 반드시 확인한다.

## 2026-05-12 심화 보강 보완: 표준 학습 체크포인트

### 기본 사용 절차

1. 루트 모션이 들어 있는 Montage를 준비한다.
2. Montage 안에 Motion Warping Notify State를 추가하고 warp window를 지정한다.
3. 캐릭터에 `UMotionWarpingComponent`를 추가한다.
4. 실행 직전에 `AddOrUpdateWarpTarget`으로 목표 위치와 회전을 넣는다.
5. Montage를 재생하고, notify 구간 안에서 루트 모션이 목표 기준으로 보정되는지 확인한다.

### 동작 원리

Motion Warping은 애니메이션 자체를 새로 굽는 기능이 아니다. Montage에서 추출된 root motion이 월드 좌표로 변환되기 전에 `UMotionWarpingComponent`가 개입해 목표 transform에 맞게 translation/rotation을 수정한다. Notify State는 어느 구간에서 어떤 modifier를 적용할지 알려주고, warp target은 그 modifier가 맞춰야 할 기준점이 된다.

### 자주 막히는 문제

- 캐릭터가 목표에 맞지 않는다: warp target 이름과 Notify State의 target 이름이 같은지 확인한다.
- 회전만 틀어진다: rotation warping 옵션과 root motion rotation 포함 여부를 확인한다.
- 전혀 동작하지 않는다: Montage가 root motion을 추출하는지, CharacterMovement delegate가 연결되는지 확인한다.
- 네트워크에서 어긋난다: 서버 권한, montage 재생 타이밍, warp target 복제/계산 위치를 분리해서 점검한다.

### 실습 과제

1. Vault Montage에 warp target을 넣고 낮은 장애물과 높은 장애물에서 결과를 비교한다.
2. 같은 Montage로 좌/우 30도 회전된 target을 처리한다.
3. target을 한 프레임 늦게 넣었을 때 어떤 오차가 생기는지 기록한다.

### 부가 자료

- 공식 문서: Motion Warping.
- 엔진 소스: `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Private\MotionWarpingComponent.cpp`.
- 엔진 소스: `Engine\Plugins\Animation\MotionWarping\Source\MotionWarping\Private\RootMotionModifier.cpp`.

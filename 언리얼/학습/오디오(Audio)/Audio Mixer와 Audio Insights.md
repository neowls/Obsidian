[Audio Mixer Overview | Unreal Engine Documentation | Epic Developer Community](https://dev.epicgames.com/documentation/en-us/unreal-engine/audio-mixer-overview?application_version=4.27) | [Audio Mixer API | Unreal Engine 5.7 Documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AudioMixer)

# 개요
`Audio Mixer`는 플랫폼별 오디오 출력을 공통 렌더링 구조로 다루는 오디오 엔진 계층이다.
게임플레이 문서에서는 사운드 큐, 사운드 웨이브, 오디오 컴포넌트가 먼저 보이지만, 성능과 믹싱 문제는 audio device, source voice, submix, effect chain 관점으로 내려가야 한다.

# 핵심 구성
| 요소 | 역할 |
| --- | --- |
| `UAudioComponent` | 월드의 사운드 재생 컴포넌트 |
| `USoundBase` | 재생 가능한 사운드 에셋의 공통 기반 |
| `USoundCue` | 노드 기반 사운드 선택/변형 |
| `USoundWave` | 실제 wave/streaming asset |
| `FAudioDevice` | 엔진 오디오 장치 계층 |
| `Audio::FMixerDevice` | Audio Mixer 구현 장치 |
| `USoundSubmix` | 여러 소스를 섞고 effect를 적용하는 버스 |
| Audio Insights | 오디오 분석/디버깅 툴 |

# 런타임 흐름
1. gameplay 코드가 `PlaySound`, `SpawnSound`, `UAudioComponent::Play()`로 재생을 요청한다.
2. `USoundBase::Parse()` 계열이 wave instance와 parameter를 만든다.
3. audio device가 source를 관리한다.
4. Audio Mixer가 source voice를 믹싱하고 submix graph를 거친다.
5. 최종 output stream으로 보낸다.

# 실무 체크포인트
| 문제 | 확인할 것 |
| --- | --- |
| 소리가 안 남 | component activation, attenuation, concurrency, owner destruction |
| 멀리서 갑자기 끊김 | attenuation, virtualization, concurrency rule |
| UI 소리와 월드 소리 분리 | sound class, submix, attenuation off |
| 전투 피드백 약함 | transient sound, hit timing, mix ducking, layer |
| 성능 문제 | active source count, streaming, decompression, submix effect cost |

> [!tip]
> 액션 게임에서는 타격음 하나보다 `피격 사운드 + 무기 레이어 + 피치/볼륨 랜덤 + submix ducking + 카메라/진동`을 함께 설계해야 피드백이 안정된다.

# 디버깅 체크리스트
- 사운드가 spawn되지 않은 것인지, spawn됐지만 culled/virtualized된 것인지 구분한다.
- `UAudioComponent` lifetime이 actor destruction에 같이 묶여 있는지 확인한다.
- concurrency 때문에 새 소리가 이전 소리를 끊는지 본다.
- attenuation shape가 실제 위치와 맞는지 시각화한다.
- submix/effect chain이 전체 mix를 과도하게 누르지 않는지 확인한다.

# 엔진 소스 참고 포인트
- `Engine\Source\Runtime\Engine\Classes\Components\AudioComponent.h`: `UAudioComponent`.
- `Engine\Source\Runtime\Engine\Classes\Sound\SoundBase.h`: `USoundBase`와 parse 진입점.
- `Engine\Source\Runtime\Engine\Classes\Sound\SoundCue.h`: sound cue 구조.
- `Engine\Source\Runtime\Engine\Classes\Sound\SoundSubmix.h`: submix 에셋.
- `Engine\Source\Runtime\AudioMixer\Public\AudioMixerDevice.h`: `Audio::FMixerDevice`.
- `Engine\Source\Runtime\AudioMixer\Public\AudioMixerSubmix.h`: submix mixer 계층.
- `Engine\Plugins\AudioInsights\Source`: 오디오 인사이트 툴 구현.

## 심화 보강: Audio Mixer와 Audio Insights로 소리를 설계하고 검증하기

### 학습 목표

- Sound Cue/MetaSound/AudioComponent가 실제 재생 파이프라인에서 어떤 역할을 하는지 이해한다.
- Attenuation, Concurrency, Submix, Effect Chain을 실전 기준으로 설정한다.
- Audio Insights로 소리 수, 가상화, 볼륨, 서브믹스 흐름을 확인하는 방법을 익힌다.

### 기본 재생 구조

언리얼에서 소리를 재생한다는 것은 단순히 wav 파일을 틀어주는 것이 아니다. 게임 스레드에서 재생 요청을 만들고, 오디오 시스템은 그것을 ActiveSound/WaveInstance 같은 내부 표현으로 바꾼 뒤 오디오 렌더 스레드와 플랫폼 장치로 전달한다. Audio Mixer는 이 과정에서 여러 소리의 믹싱, 서브믹스, 이펙트, 공간화, 플랫폼 출력을 담당한다.

일반적인 흐름은 다음처럼 이해하면 된다.

1. 게임 코드나 Blueprint가 SoundBase를 재생한다.
2. AudioComponent 또는 일회성 재생 요청이 생성된다.
3. Attenuation, Concurrency, SoundClass, Submix routing이 적용된다.
4. 실제 파형 또는 MetaSound 출력이 WaveInstance/Source Voice로 처리된다.
5. Submix Graph를 거쳐 최종 마스터 출력으로 믹싱된다.
6. Audio Insights에서 활성 소리, 라우팅, 볼륨, 가상화 상태를 관찰할 수 있다.

### 기본 사용 예시

일회성 효과음은 `SpawnSoundAtLocation` 또는 `PlaySoundAtLocation`으로 시작할 수 있다.

```cpp
UGameplayStatics::SpawnSoundAtLocation(
    this,
    HitImpactSound,
    ImpactLocation,
    ImpactRotation,
    1.0f,
    1.0f,
    0.0f,
    HitAttenuation,
    HitConcurrency
);
```

계속 제어해야 하는 소리라면 AudioComponent를 보관한다.

```cpp
EngineLoopAudio = UGameplayStatics::SpawnSoundAttached(
    EngineLoopSound,
    VehicleMesh,
    NAME_None,
    FVector::ZeroVector,
    EAttachLocation::KeepRelativeOffset,
    true
);

if (EngineLoopAudio)
{
    EngineLoopAudio->SetFloatParameter(TEXT("RPM"), CurrentRPM);
}
```

일회성 충돌음은 component를 저장하지 않아도 되지만, 엔진 루프, 차징 사운드, 보스 심장 박동처럼 값이 계속 변하는 소리는 AudioComponent로 관리하는 편이 낫다.

### Attenuation 설정 원리

Attenuation은 거리에 따른 볼륨 변화만 의미하지 않는다. 공간화, 초점, 필터, occlusion, reverb send까지 함께 다루는 경우가 많다.

- Inner Radius: 이 거리 안에서는 최대 볼륨을 유지한다.
- Falloff Distance: 소리가 감쇠되어 들리지 않게 되는 범위.
- Spatialization: 좌우/3D 위치감 적용 여부.
- Occlusion: 벽 뒤에 있을 때 trace로 막힘을 판단하고 필터/볼륨을 조정.
- Focus: 카메라 전방의 소리와 후방의 소리에 다른 가중치를 줄 수 있다.

예를 들어 발소리는 좁은 Attenuation과 낮은 우선순위를 사용하고, 보스 포효는 넓은 Attenuation과 높은 우선순위를 사용한다. 모든 소리를 넓게 만들면 믹스가 탁해지고, 오디오 소스 수가 불필요하게 늘어난다.

### Concurrency 설정 원리

Concurrency는 같은 유형의 소리가 동시에 너무 많이 재생되는 것을 제한한다. 총알 충돌음, 발소리, UI 클릭음처럼 짧고 반복되는 소리에 특히 중요하다.

- Max Count: 동시에 유지할 수 있는 소리 수.
- Resolution Rule: 초과 시 어떤 소리를 제거할지 결정한다.
- Volume Scale: 같은 그룹이 많이 재생될 때 볼륨을 줄인다.
- Limit to Owner: 같은 액터 소리끼리만 제한할지 정한다.

사례로, 기관총이 벽을 때릴 때 충돌음을 제한하지 않으면 수십 개의 impact sound가 동시에 발생한다. Concurrency를 설정하면 가까운 소리 또는 최신 소리만 남기고 나머지를 정리할 수 있다.

### Submix와 Effect Chain

Submix는 오디오의 버스/그룹이라고 이해하면 된다. 모든 소리를 Master로 바로 보내기보다 Music, SFX, Dialogue, Ambience 같은 Submix로 나누면 믹싱과 효과 적용이 쉬워진다.

- Music Submix: 전투/탐험 음악 볼륨을 제어.
- Dialogue Submix: 대사 ducking, 라디오 필터 적용.
- SFX Submix: 폭발, 무기, 피격음 압축.
- Ambience Submix: 환경음, 바람, 비, 군중 소리.

예를 들어 대사가 나올 때 SFX와 Music을 약간 낮추는 ducking을 만들려면 SoundClass만으로 처리할 수도 있지만, Submix Effect와 Control Bus를 함께 사용하면 더 유연한 믹스 제어가 가능하다.

### Audio Insights로 확인할 것

Audio Insights는 소리가 왜 안 들리는가를 추측이 아니라 데이터로 확인하기 위한 도구다. 다음 항목을 우선 확인한다.

- 활성 AudioComponent 수와 실제 playing source 수.
- 소리가 virtualized 상태인지, stopped 상태인지.
- Concurrency 때문에 kill되었는지.
- Attenuation 거리 밖인지.
- Submix routing이 의도한 그룹으로 들어가는지.
- 특정 SoundClass 또는 Control Bus 볼륨이 0에 가까운지.

### 사례: 보스전 믹스 설계

보스전에서는 소리 우선순위가 게임 정보 전달과 직결된다.

- 보스 패턴 전조음: 높은 priority, 넓은 attenuation, UI보다 약간 낮은 ducking.
- 플레이어 피격음: owner 기준으로 명확하게 들리도록 설정.
- 일반 몬스터 발소리: concurrency로 제한.
- 음악: 보스 체력 페이즈에 따라 parameter로 intensity 변경.
- 환경음: 전투 중에는 ducking으로 존재감 감소.

이 설계를 Audio Insights에서 검증할 때는 실제 보스전 상황을 만들어 source 수가 과도하지 않은지, 전조음이 concurrency에 밀려 죽지 않는지, 음악 parameter가 정상적으로 바뀌는지 확인한다.

### 자주 막히는 문제

- 소리가 안 들린다: AudioComponent가 생성되었는지, volume이 0인지, attenuation 거리 밖인지, concurrency에 의해 제거되었는지 확인한다.
- 에디터에서는 들리는데 패키지에서 안 들린다: asset cook, platform compression, soft reference 로딩 경로를 확인한다.
- 소리가 너무 많이 겹친다: Concurrency와 virtualize when silent 설정을 확인한다.
- 3D 소리 방향이 이상하다: listener 위치, spatialization plugin, attenuation asset을 확인한다.
- MetaSound parameter가 반영되지 않는다: parameter 이름, 타입, AudioComponent 생명 주기를 확인한다.

### 실습 과제

1. 발소리 Sound를 만들고 표면 재질별 parameter로 다른 샘플을 재생한다.
2. 총알 impact sound에 Concurrency를 적용한 버전과 적용하지 않은 버전을 비교한다.
3. Music/SFX/Dialogue Submix를 만들고 대사 중 SFX ducking을 구현한다.
4. Audio Insights로 보스전 상황의 source count와 submix routing을 기록한다.

### 부가 자료

- 공식 문서: Audio Mixer, Audio Insights, Sound Attenuation, Sound Concurrency, Submixes, MetaSounds.
- 엔진 소스: `Engine\Source\Runtime\Engine\Private\AudioDevice.cpp`.
- 엔진 소스: `Engine\Source\Runtime\AudioMixer`.
- 실험 도구: Audio Insights, `stat audio`, `au.Debug.Sounds` 계열 콘솔 명령.

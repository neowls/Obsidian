---
aliases:
  - "NightCaretaker Sound Detail"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - archive
  - companion
type: project-document
project: NightCaretaker
category: archive-companion
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# NightCaretaker Sound Detail

> [!summary] 문서 목적
> 이 문서는 `야간 관리인: 307호의 민원`의 사운드 제작 명세다. Master 문서의 사운드 방향을 실제 제작자가 사용할 수 있는 공간, 상태, 민원, UI 기준으로 풀어 쓴다.

## 핵심 결론

- 이 문서는 보조 시각화 또는 세부 자료이며, 활성 기준은 루트 Master 문서를 우선한다.
- 다이어그램, 매트릭스, 와이어프레임은 현재 판단의 근거로 사용할 수 있지만 그대로 구현 기준이 되지는 않는다.
- 필요 시 본문의 항목을 Planning/Development/Art Master로 승격한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 보조 시각화/동반 자료 |
| 파일 경로 | `Archive/Companion/NightCaretaker_Sound_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 목적 | 주요 섹션 |
| 사운드 목표 | 주요 섹션 |
| 상태 입력 계약 | 주요 섹션 |
| 사운드 카테고리 | 주요 섹션 |
| 명명 규칙 | 주요 섹션 |
| 믹스와 접근성 | 주요 섹션 |
| 공간별 Ambience | 주요 섹션 |
| PowerState 반응 | 주요 섹션 |
| TensionStage 반응 | 주요 섹션 |
| 민원 도메인별 SFX | 주요 섹션 |
| ENCComplaintRuntimeState Cue | 주요 섹션 |
| UI Sound | 주요 섹션 |
| 실패 압박 사운드 | 주요 섹션 |
| 307호 사운드 단계 | 주요 섹션 |
| 추가 섹션 3 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 목적

이 문서는 `야간 관리인: 307호의 민원`의 사운드 제작 명세다. Master 문서의 사운드 방향을 실제 제작자가 사용할 수 있는 공간, 상태, 민원, UI 기준으로 풀어 쓴다.

이 문서는 companion 문서다. 최종 기준은 아래 Master 문서와 함께 본다.

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`

## 사운드 목표

사운드는 공포를 직접 설명하지 않는다. 플레이어가 업무를 수행하는 동안 들리는 정상적인 소리의 거리, 방향, 반복, 누락을 조금씩 어긋나게 만들어 "내가 제대로 들었는가"를 의심하게 만드는 것이 목표다.

핵심 감정은 다음 순서로 진행한다.

1. 낡았지만 실제로 작동하는 야간 근무지.
2. 소리의 원인을 찾을 수는 있지만 확신이 약해지는 건물.
3. 기록, 조명, 생활 소음이 서로 맞지 않는 상태.
4. 307호를 확인하지 않으면 업무가 끝나지 않는 압박.

## 상태 입력 계약

사운드는 새 게임 진행 상태를 만들지 않는다. 아래 입력만 사용한다.

| 입력 | 사운드 사용처 |
| --- | --- |
| `ENCShiftPhase` | 관리실, 조사, 보고, 정지 상태에 따른 ambience/UI context |
| `ENCComplaintRuntimeState` | 수락, 조사 시작, 보고 가능, 제출, 완료/재접수 one-shot |
| `PowerState` | 전기음, 비상등 hum, 정전 정적, 지하 저주파 |
| `TensionStage` | 방향감, 거리감, 정적 길이, 잔향 꼬리 오염 |
| `Room307Stage` | 307호 사운드 노출 단계 |
| `DomainTags` | 민원 도메인별 SFX 팔레트 선택 |
| `Evidence.Audio` | 들은 단서 발견과 보고 가능 피드백 |

## 사운드 카테고리

| 코드 | 카테고리 | 설명 |
| --- | --- | --- |
| `AMB` | Ambience loop | 공간별 지속 환경음. 상태에 따라 layer가 변한다. |
| `SFX` | World one-shot | 상호작용, 월드 반응, 단서 발견에 쓰는 짧은 소리. |
| `UI` | UI/업무 소리 | 보드, 보고서, 기록장, 설정 조작의 물성. |
| `MS` | MetaSound layer | 전기, 생활 소음, 저주파, 정적을 상태 반응형으로 제어하는 레이어. |
| `STG` | Stinger | 챕터, 실패 압박, 307호 단계 전환을 짧게 각인하는 소리. |

## 명명 규칙

| 접두어 | 패턴 | 예시 |
| --- | --- | --- |
| `AMB_` | `AMB_<Space>_<State>_Loop` | `AMB_Hallway_PowerNormal_Loop` |
| `SFX_` | `SFX_<Domain>_<Action>_<Variant>` | `SFX_Lighting_FluorescentBuzz_A` |
| `UI_` | `UI_<Surface>_<Action>` | `UI_Report_SubmitStamp` |
| `MS_` | `MS_<System>_<Layer>` | `MS_ElectricHum_StateLayer` |
| `STG_` | `STG_<Context>_<Beat>` | `STG_Room307_DoorStay` |

변형이 필요한 one-shot은 `_A`, `_B`, `_C`처럼 끝에 붙인다. 같은 민원에서 반복 재생될 가능성이 있으면 최소 3개 변형을 둔다.

## 믹스와 접근성

- Master, Ambience, SFX, UI 볼륨은 분리한다.
- Dynamic Range 옵션을 둔다. 낮은 다이내믹 레인지에서도 단서성 소리가 묻히면 안 된다.
- UI sound는 너무 작아도 안 되지만 공포 연출보다 업무 물성이 우선이다.
- `Evidence.Audio` 단서는 자막 또는 기록장 텍스트와 함께 확인 가능해야 한다.
- 실패 압박은 고음 경고음 반복으로 처리하지 않는다.
- 강한 저주파는 장시간 유지하지 않고, 지하실과 307호 후반에만 제한적으로 사용한다.

## 공간별 Ambience

| 공간 | 기본 레이어 | 상태 반응 | 제작 기준 |
| --- | --- | --- | --- |
| 관리실 | 형광등 험, 환풍기, 종이, 사무기기 잔소음, 약한 인터폰 정적 | 보고 후 짧은 정적, 실패 후 전기 톤 미세 변화 | 플레이어가 돌아오는 현실 기준점 |
| 복도 | 긴 잔향, 문틈 생활음, 배관음, 먼 발소리 가능성 | `TensionStage` 상승 시 방향/거리 신뢰 오염 | 가장 오래 듣는 핵심 공간 |
| 계단실 | 콘크리트 반향, 금속 난간 울림, 위/아래층 충격음 | `PowerState` 악화 시 반향 꼬리 증가 | 수직 깊이와 고립감 |
| 엘리베이터 앞 | 모터 잔향, 문틈 금속음, 층수 표시음의 미세 불안 | 정전 시 모터 소리보다 멎은 뒤 정적을 강조 | 기다림의 압박 |
| 세대 내부 | 냉장고 자리 잔진동, 배관, 바닥 삐걱임, 낮은 생활 잔향 | 민원 도메인별 단서 소리 노출 | 사람이 있었던 흔적 |
| 지하 전기실 | 펌프, 배전반, 습기 찬 저주파, 금속 진동 | `BasementIndependent`에서 좁은 대역 압박 강화 | 챕터 3 체류 압박 |
| 307호 앞 | 일반 복도 ambience에서 시작, 후반 문 안쪽 저활동 소리 추가 | `Room307Stage`에 따라 생활음/도어락/정적 노출 | 직접 설명 없는 수렴감 |

## PowerState 반응

| `PowerState` | 전기음 | 정적/저주파 | 공간감 |
| --- | --- | --- | --- |
| `Normal` | 안정적인 형광등/환풍기 hum | 거의 없음 | 실제 건물 기준 |
| `PartialOutage` | 일부 fixture buzz와 간헐적 접점음 | 짧은 끊김 | 복도 리듬이 어긋남 |
| `FloorOutage` | 전기음이 갑자기 빠짐 | 정적과 먼 배관음 증가 | 소리가 멀리 들림 |
| `EmergencyOnly` | 비상등 hum과 좁은 대역의 전기음 | 낮은 저역이 얇게 유지 | 안전장치가 불안하게 들림 |
| `BasementIndependent` | 배전반/펌프 중심 | 지속 저주파와 금속 진동 | 지하만 별도 세계처럼 들림 |

## TensionStage 반응

| `TensionStage` | 사운드 변화 |
| --- | --- |
| `Stage0_Normal` | 원인 추적이 가능한 생활/설비음 |
| `Stage1_Discomfort` | 같은 소리의 위치가 살짝 늦게 따라오는 느낌 |
| `Stage2_RecordConflict` | 보드/종이/인터폰 계열 소리의 타이밍 어긋남 |
| `Stage3_SpaceBreak` | 잔향 꼬리와 거리감 오염, 복도 끝 저역 증가 |
| `Stage4_Room307Focus` | 307호 관련 소리가 문보다 건물 전체에서 수렴 |

긴장 단계는 볼륨 증가 단계가 아니다. 밀도를 올리기보다 방향감, 거리, 침묵의 길이, 소리 시작 위치를 바꾼다.

## 민원 도메인별 SFX

| `DomainTags` | 대표 SFX | `Evidence.Audio` 사용 |
| --- | --- | --- |
| `Complaint.Domain.Lighting` | 형광등 buzz, 안정기, 스위치 접점, 램프 케이스 떨림 | 고장음이 정상 원인인지 이상인지 판단하는 단서 |
| `Complaint.Domain.Power` | 차단기, 배전반 릴레이, 비상등 hum, 정전 직전 톤 변화 | 정전 전후 상태 변화 단서 |
| `Complaint.Domain.Water` | 물방울, 배관 압력, 욕실 배수, 젖은 바닥 발소리 | 보이지 않는 누수 경로 단서 |
| `Complaint.Domain.Intercom` | 호출음, 통화 전 정적, 끊긴 발화 파편 | 통신 원인인지 생활 소음인지 의심하게 하는 단서 |
| `Complaint.Domain.LifeNoise` | TV 저음, 가구 끌림, 낮은 말소리, 발소리 | 사람이 있는지 없는지 판단하는 단서 |
| `Complaint.Domain.Record` | 종이, 스탬프, 프린터, 보드 갱신음 어긋남 | 기록 충돌을 청각적으로 확인하는 단서 |
| `Complaint.Domain.Space` | 반사 지연, 거리감 불일치, 복도 끝 저역 | 실제 거리와 들리는 거리의 불일치 단서 |
| `Complaint.Domain.Security` | 도어락, CCTV 노이즈, 경보 시작/중단, 모니터 buzz | 장치 고장과 이상 현상 사이 단서 |

## ENCComplaintRuntimeState Cue

| 상태 | Cue 기준 |
| --- | --- |
| `Available` | 보드에 새 민원이 붙는 종이/클립 소리. 과장 금지. |
| `Accepted` | 펜 체크, 낮은 확인음, 관리실 ambience 유지. |
| `Investigating` | 현장 ambience layer 활성. 도메인 SFX 팔레트 준비. |
| `AwaitingReport` | 기록장 갱신, 보고 가능을 알리는 짧은 종이음. |
| `Closed` | 해결 완료는 작고 건조하게. 재접수 가능성은 같은 cue의 타이밍 변주로 암시. |

## UI Sound

| UI | 사운드 기준 | 금지 |
| --- | --- | --- |
| Runtime HUD | 최소한의 prompt feedback, 도구 전환 소리 | 계속 울리는 알림음 |
| Interaction Prompt | 대상 확인 시 얇은 포커스 cue | 공포 stinger |
| Complaint Board | 종이, 압정, 펜, 낮은 확인음 | 전자식 퀘스트 완료음 |
| Report Form | 스탬프, 펜 긁힘, 짧은 정적 | 성공/실패 fanfare |
| Notebook | 페이지 넘김, 펜, 종이 마찰 | 읽기 방해 루프 |
| Document Viewer | 오래된 종이, 파일철, 얇은 마찰음 | 초자연 설명 효과음 |
| Pause/Settings | 낮은 버튼음, 종이 계열 | 안전한 메인 메뉴 음악처럼 들리는 루프 |

## 실패 압박 사운드

실패 압박은 플레이어를 처벌하는 경고음이 아니다. 건물과 기록이 플레이어 판단을 덜 믿게 만드는 방향으로 들려야 한다.

| 실패 상황 | 사운드 반응 |
| --- | --- |
| 오판 | 보고 직후 1초 내외 정적, 관리실 전기음 톤 변화 |
| 단서 누락 | 현장 복귀 시 같은 소리의 위치가 달라짐 |
| 정전 체류 | 비상등 hum과 먼 생활 소음 간격 증가 |
| 반복 민원 | 이전에 들은 cue를 비슷하지만 다른 타이밍으로 재사용 |
| 307호 관련 실패 | 도어락/문틈 소리보다 기록/보드 사운드의 어긋남 우선 |

## 307호 사운드 단계

| `Room307Stage` | 노출 목표 | 허용 사운드 |
| --- | --- | --- |
| `Absent` | 아직 아무 의미가 없어야 함 | 일반 복도 ambience만 사용 |
| `NumberTrace` | 숫자가 스쳤다는 감각 | 전기 톤 미세 변화, 종이 마찰 |
| `RecordIntrusion` | 기록 체계에 끼어듦 | 보드 갱신음 타이밍 어긋남, 명부 페이지 소리 |
| `ThirdFloorUnstable` | 3층 전체가 불안 | 복도 끝 저역, 위치가 애매한 TV/물소리 |
| `DoorStay` | 문 앞에 머무르게 함 | 도어락 근접음, 문 안쪽 저활동 소리 |
| `Threshold` | 문턱 앞 확신 붕괴 | 정적, 반사 지연, 호흡처럼 오해될 수 있는 공간음 |
| `Interior` | 확인 이후 해석 잔상 | 생활 흔적 잔향, 보고 후 남는 정적 |

307호 사운드는 초반부터 전용 테마처럼 들리면 실패다. 처음에는 건물의 다른 소리와 구분되지 않아야 한다.

## P0 제작 목록

| 우선순위 | 항목 | 최소 수량 |
| --- | --- | --- |
| P0 | 관리실 base ambience | 1 loop |
| P0 | 복도 base ambience | 1 loop |
| P0 | 복도 power variation | 3 layer |
| P0 | 지하 전기실 ambience | 1 loop |
| P0 | 형광등/스위치/배전반 SFX | 8 one-shot |
| P0 | 물/배관 SFX | 6 one-shot |
| P0 | 인터폰/전화 SFX | 6 one-shot |
| P0 | 생활 소음 파편 | 10 one-shot 또는 short loop |
| P0 | UI 보드/보고서/기록장 | 12 one-shot |
| P0 | 실패 압박 cue | 3 stinger |
| P0 | 307호 단계 cue | 5 cue |

## 제작 금지 규칙

- 공포를 큰 stinger와 과한 저음으로만 해결하지 않는다.
- 존재의 정체를 명확히 설명하는 괴물음은 쓰지 않는다.
- UI 사운드가 공포 게임식 효과음처럼 튀면 안 된다.
- 너무 많은 레이어로 실제 공간감을 무너뜨리지 않는다.
- `Room307Stage`가 `Absent` 또는 `NumberTrace`일 때 307호 전용 문 안쪽 소리를 쓰지 않는다.
- 민원 제목 문자열로 사운드를 선택하지 않는다.
- 보고 실패를 플레이어 조작 방해 사운드로 표현하지 않는다.

## 검증 체크리스트

- 모든 sound cue가 공간, 상태, 민원 도메인, UI 입력 중 하나에 연결되어 있는가.
- `ENCShiftPhase`, `ENCComplaintRuntimeState`, `PowerState`, `TensionStage`, `Room307Stage`, `DomainTags`, `Evidence.Audio` 외 새 상태명을 구현 계약처럼 쓰지 않았는가.
- 307호 사운드가 초반부터 과노출되지 않는가.
- UI sound가 UI/UX 문서의 접근성, 볼륨 분리, 조작 방해 금지 기준과 충돌하지 않는가.
- MetaSound layer가 볼륨 상승만으로 긴장도를 표현하지 않는가.
- 소리의 원인을 화면이 지나치게 직접 설명하지 않는가.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

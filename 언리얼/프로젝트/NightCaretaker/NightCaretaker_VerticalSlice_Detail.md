# NightCaretaker Vertical Slice Detail

## 목적

이 문서는 데모 수직 슬라이스를 실제 구현 티켓과 smoke-test 기준으로 전환하기 위한 companion 문서다. 목표는 전체 게임 축소판이 아니라 `업무 루프가 공포로 변하는 과정`을 30~45분 안에 검증하는 것이다.

기준 문서:

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`
- `Document/NightCaretaker_LevelSpace_Detail.md`

## 구현 티켓 그룹

| Group | 책임 | 완료 기준 |
| --- | --- | --- |
| `VS-BLOCKOUT` | 관리실, 2층 복도, 3층 복도, 지하, 307호 앞 route 구성 | 10단계 route가 끊기지 않는다 |
| `VS-INTERACTION` | 보드, 도구, 문, 인터폰, 형광등, 배전반, 택배 상호작용 | 각 단계에 최소 1개 이상 조작/조사 interaction 존재 |
| `VS-COMPLAINT` | 10개 민원 runtime row와 evidence/report loop 연결 | `Accepted -> Investigating -> AwaitingReport -> Closed` 루프 확인 |
| `VS-UI` | HUD prompt, board, report, notebook, document viewer 연결 | 다음 행동은 보이지만 공포 원인은 설명하지 않음 |
| `VS-AUDIO` | ambience, SFX, UI sound, MetaSound layer 연결 | `Evidence.Audio`와 상태 layer가 report loop와 맞음 |
| `VS-LIGHTING` | `PowerState`별 조명 preset과 정전 이벤트 | 길찾기 유지와 긴장 상승이 동시에 성립 |
| `VS-QADEBUG` | 단계별 시작/검증 debug와 smoke-test pass | 각 route step을 독립 재현 가능 |

## 10단계 Route Checklist

| Step | 콘텐츠 | 필수 공간/상태 | 구현 티켓 | Smoke-test 기준 |
| --- | --- | --- | --- | --- |
| 1 | 관리실 인수인계 | `LOC_OFFICE_MAIN`, `ENCShiftPhase::BoardReview` | `VS-BLOCKOUT-01`, `VS-INTERACTION-01`, `VS-UI-01` | 보드, 도구, 보고 위치를 5분 안에 이해 |
| 2 | `CMP_PRO_OfficeLightBuzz` | 관리실 형광등, `PowerState=Normal` | `VS-INTERACTION-02`, `VS-COMPLAINT-01`, `VS-LIGHTING-01` | 보드 활성화와 `3F 07` 흔적 확인 |
| 3 | `CMP_PRO_203_WaterAtDoor` | `LOC_2F_203_DOOR`, 2층 복도 | `VS-BLOCKOUT-02`, `VS-COMPLAINT-02` | visual/environmental evidence로 보고 가능 |
| 4 | `CMP_CH1_2F_IntercomStatic` | `LOC_2F_INTERCOM`, `Evidence.Audio` | `VS-INTERACTION-02`, `VS-AUDIO-02`, `VS-UI-02` | 오디오 단서 확보 후 보고 가능 |
| 5 | `CMP_CH1_3F_EmergencyLight` | `LOC_3F_EMERGENCY_LIGHT`, `Room307Stage=ThirdFloorUnstable` | `VS-BLOCKOUT-02`, `VS-LIGHTING-01`, `VS-AUDIO-01` | 3층이 2층과 다르게 느껴짐 |
| 6 | `CMP_CH2_302_TVHum` | `LOC_3F_302_DOOR`, `TensionStage=Stage2_RecordConflict` | `VS-COMPLAINT-02`, `VS-AUDIO-02`, `VS-UI-02` | 정상/이상 판단 불안 체감 |
| 7 | 정전 이벤트 | `PowerState=FloorOutage` 또는 `EmergencyOnly` | `VS-LIGHTING-02`, `VS-AUDIO-01`, `VS-QADEBUG-01` | 길찾기 유지와 지하 접근 목표 생성 |
| 8 | `CMP_CH3_BasementPumpAlarm` | `LOC_BSMT_PUMP`, `AccessState=TemporaryUnlocked` | `VS-BLOCKOUT-02`, `VS-AUDIO-02`, `VS-COMPLAINT-02` | 지하가 공식 조사 구역으로 전환 |
| 9 | `CMP_CH3_BasementPanelMislabel` | `LOC_BSMT_PANEL`, `Progression.Story.BasementPowerLinked` | `VS-INTERACTION-02`, `VS-UI-02`, `VS-LIGHTING-02` | 전기 계통과 307 단서 연결 |
| 10 | `CMP_CH4_307_PackageAtDoor` 맛보기 | `LOC_3F_307_DOOR`, `Room307Stage=DoorStay` | `VS-BLOCKOUT-02`, `VS-AUDIO-02`, `VS-QADEBUG-02` | 307호를 열지 않아도 다음 목표로 각인 |

## 구현 티켓 목록

| TicketId | Group | 내용 | 의존성 |
| --- | --- | --- | --- |
| `VS-BLOCKOUT-01` | `VS-BLOCKOUT` | 관리실, 2층 복도, 3층 복도, 지하 전기실, 307호 앞 연결 route blockout | 없음 |
| `VS-BLOCKOUT-02` | `VS-BLOCKOUT` | `LocationId` marker와 접근 gate 배치 | `VS-BLOCKOUT-01` |
| `VS-INTERACTION-01` | `VS-INTERACTION` | 민원 보드, 공구함, 손전등, 보고 위치 interaction 연결 | `VS-BLOCKOUT-01` |
| `VS-INTERACTION-02` | `VS-INTERACTION` | 형광등, 203호 문 앞, 인터폰, 배전반, 택배 조사 interaction 연결 | `VS-INTERACTION-01` |
| `VS-COMPLAINT-01` | `VS-COMPLAINT` | 수직 슬라이스 10단계 민원 row와 progression chain 검증 | `VS-BLOCKOUT-02` |
| `VS-COMPLAINT-02` | `VS-COMPLAINT` | evidence threshold와 report result 처리 연결 | `VS-COMPLAINT-01` |
| `VS-UI-01` | `VS-UI` | Board, Report, Notebook P0 화면 연결 | `VS-COMPLAINT-01` |
| `VS-UI-02` | `VS-UI` | route별 HUD prompt와 document viewer text 연결 | `VS-UI-01` |
| `VS-AUDIO-01` | `VS-AUDIO` | 관리실, 2층/3층 복도, 지하 ambience 기본 layer 연결 | `VS-BLOCKOUT-01` |
| `VS-AUDIO-02` | `VS-AUDIO` | 인터폰, TV hum, 펌프, 307 문틈 cue와 `Evidence.Audio` 연결 | `VS-COMPLAINT-02` |
| `VS-LIGHTING-01` | `VS-LIGHTING` | 관리실/복도/지하 `PowerState` preset 연결 | `VS-BLOCKOUT-01` |
| `VS-LIGHTING-02` | `VS-LIGHTING` | 정전 이벤트와 비상등 route 검증 | `VS-LIGHTING-01` |
| `VS-QADEBUG-01` | `VS-QADEBUG` | 10단계 시작 상태 재현 debug command/checklist 정리 | `VS-COMPLAINT-01` |
| `VS-QADEBUG-02` | `VS-QADEBUG` | smoke-test pass/fail 기록표 작성 | 모든 P0 ticket |

## Smoke-Test Pass Criteria

- 5분 안에 플레이어가 보드, 도구, 보고 위치를 이해한다.
- 15~20분 안에 정상 민원과 이상 민원의 차이를 체감한다.
- 관리실, 복도, 세대 문 앞, 지하실이 기능적으로 연결된다.
- 사운드 없이도 보드 -> 현장 -> 단서 -> 보고 루프가 성립한다.
- 사운드와 조명을 켰을 때 긴장 상승이 분명하다.
- 데모 종료 시 플레이어가 307호 내부 확인을 다음 목표로 기억한다.

## 구현 금지선

- 수직 슬라이스를 위해 새 runtime state를 만들지 않는다.
- route를 길게 늘려 플레이타임을 확보하지 않는다.
- UI가 정답을 직접 설명하지 않는다.
- 조명/사운드가 길찾기를 망가뜨리지 않는다.
- 307호 내부는 맛보기 단계에서 열지 않는다.

# NightCaretaker Complaint/Anomaly Detail

## 목적

이 문서는 `야간 관리인: 307호의 민원`의 20개 민원과 연결 이상 현상을 production 제작 기준으로 확장한 companion 문서다. Master 문서를 대체하지 않고, 민원/이상 현상 제작자가 UI, 장면, 단서, 사운드, 보고 결과, 실패 압박을 빠르게 확인하는 기준으로 사용한다.

기준 문서:

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`

## 공통 제작 템플릿

각 민원은 아래 항목을 반드시 가진다.

| 항목 | 의미 |
| --- | --- |
| UI | 민원 보드, 보고서, 기록장, 문서 뷰어, prompt에 노출되는 정보 |
| Scene Beats | 플레이어가 현장에서 실제로 확인하는 3~5개 장면 비트 |
| Evidence | 보고 가능 상태를 만드는 증거 태그와 단서 |
| Sound | ambience, SFX, UI sound, MetaSound layer cue |
| Anomaly | 연결되는 `ANM_...`와 이상 현상 역할 |
| Result | `Resolved`, `NoAnomaly`, `NeedsFollowUp` 처리 기준 |
| Failure | 실패 압박이 다음 1~3분 플레이에 미치는 변화 |
| Validation | 제작 완료 확인 기준 |

## Chapter Prologue

### CMP_PRO_OfficeLightBuzz

- Goal: 업무 루프와 전기/기록 불안의 첫 인상을 만든다.
- UI: 보드 첫 민원, 공구 필요 표시, 형광등 focus prompt.
- Scene Beats: 관리실 깜빡임 확인 -> 안정기 커버 확인 -> 교체 스티커 아래 `3F 07` 흔적 확인 -> 스위치 재점등.
- Evidence: `Evidence.Visual`; linked anomaly `ANM_OFFICE_3F07_NOTE`.
- Sound: `SFX_Lighting_FluorescentBuzz`, `UI_Board_AcceptComplaint`, 약한 인터폰 정적.
- Result: `Resolved`는 보드 활성화, `NeedsFollowUp`은 인터폰 잡음 유지.
- Failure: 관리실 조명 불안정과 보고 UI 가독성 저하.
- Validation: 안정기 조치, 3F 07 흔적, 보고서 제출까지 한 루프가 3분 안에 가능해야 한다.

### CMP_PRO_203_WaterAtDoor

- Goal: 설명 가능한 누수처럼 시작하지만 원인이 남는 불안을 만든다.
- UI: 2층 203호 위치 카드, 손전등 필요 표시, 환경 단서 기록장 항목.
- Scene Beats: 젖은 타일 확인 -> 천장/벽 마름 확인 -> 문틈 냉기 확인 -> 문 안쪽 TV 백색소음 청취.
- Evidence: `Evidence.Visual`, `Evidence.Environmental`; linked anomaly `ANM_203_WATER_WITHOUT_SOURCE`.
- Sound: `SFX_Water_DripUnderDoor`, 아주 낮은 TV noise, 축축한 발소리.
- Result: `NeedsFollowUp` 권장, 완료 시 챕터 1 진입.
- Failure: 2층 바닥 오염 레이어와 젖은 발소리 강화.
- Validation: 물기 원인이 완전히 설명되지 않아야 하며, 직접 공포 연출은 없어야 한다.

## Chapter 1

### CMP_CH1_2F_IntercomStatic

- Goal: 설비 고장과 생활 소음 파편을 섞어 오디오 단서 신뢰를 흔든다.
- UI: 인터폰 수리 민원, 드라이버 필요 표시, 오디오 단서 badge.
- Scene Beats: 패널 열기 -> 배선 확인 -> 207/307 유사 긁힘 확인 -> 테스트 호출.
- Evidence: `Evidence.Audio`, `Evidence.Visual`; linked anomaly `ANM_INTERCOM_VOICE`.
- Sound: `SFX_Intercom_StaticVoice`, 호출음 절단, 생활 소음 파편.
- Result: `NeedsFollowUp`이면 인터폰이 이후 상호작용 포인트로 남는다.
- Failure: 관리실 수신 민원 음성이 짧게 잘린다.
- Validation: 오디오 단서 없이는 `AwaitingReport`가 되면 안 된다.

### CMP_CH1_1F_MailboxMisdelivery

- Goal: 기록 공포의 첫 진입점을 만든다.
- UI: 우편함/명부 대조 task, 문서 뷰어, 기록장 tab.
- Scene Beats: 오배송 라벨 확인 -> 우편함 이름표 대조 -> 관리실 명부 확인 -> 라벨 조각 기록.
- Evidence: `Evidence.Document`, `Evidence.Records`; linked anomaly `ANM_MAILBOX_RECORD_CONFLICT`.
- Sound: `UI_Notebook_PageTurn`, 우편함 금속 마찰, 종이 cue.
- Result: `NeedsFollowUp` 권장, 완료 시 `Progression.Story.RecordMismatchNoted`.
- Failure: 같은 라벨이 보드나 우편함에 다시 출력된다.
- Validation: 문패/우편함/명부 중 최소 2개 매체가 충돌해야 한다.

### CMP_CH1_3F_EmergencyLight

- Goal: 3층이 다른 층과 다르게 작동한다는 감각을 만든다.
- UI: 전기/조명 domain, 3층 위치, 전기 도구 필요 표시.
- Scene Beats: 3층 비상등 상시 점등 확인 -> 배터리 커버 확인 -> 주변 문패/복도 기준점 확인.
- Evidence: `Evidence.Visual`, `Evidence.Environmental`; linked anomaly `ANM_3F_PERSISTENT_EMERGENCY_LIGHT`.
- Sound: 비상등 hum, `MS_ElectricHum_StateLayer`, 짧은 전기 tone drop.
- Result: `NeedsFollowUp`이면 `Progression.Story.ThreeFloorUnstable`.
- Failure: 3층 조명 변주가 이후 민원에서 기본 압박이 된다.
- Validation: 307호는 직접 보스룸처럼 보이지 않고 3층 전체가 불안해야 한다.

### CMP_CH1_205_OdorAtDoor

- Goal: 오염/습기/환기 불량으로 불쾌감을 만든다.
- UI: 205호 환경 점검, 온도/오염 단서 기록.
- Scene Beats: 문 앞 냄새 확인 -> 환기구 확인 -> 바닥/문틈 습기 대조 -> 위험 없음과 불쾌함이 공존.
- Evidence: `Evidence.Environmental`, `Evidence.Visual`; linked anomaly `ANM_205_WATER_WITHOUT_SOURCE`.
- Sound: 낮은 환풍기, 배관 압력, 젖은 바닥 마찰.
- Result: `NoAnomaly`와 `NeedsFollowUp` 둘 다 가능하되 `NeedsFollowUp` 권장.
- Failure: 2층 습기 데칼과 환풍기 소리가 증가한다.
- Validation: 냄새는 텍스트/환경 단서로만 다루고 과한 시각 혐오는 피한다.

### CMP_CH1_StairAutoLightDelay

- Goal: 불이 켜지기 전 1초를 공포 자원으로 만든다.
- UI: 계단실 자동등 지연, 손전등/드라이버 표시.
- Scene Beats: 센서 접근 -> 암부 체류 -> 반사 지연 확인 -> 조치 후 재테스트.
- Evidence: `Evidence.Visual`, `Evidence.Audio`; linked anomaly `ANM_STAIR_REFLECTION_DELAY`.
- Sound: relay delay, 계단실 반향, 짧은 정적.
- Result: `Resolved`면 챕터 2 진입.
- Failure: 계단실이 이후 이동 압박 경로로 오염된다.
- Validation: 지연이 점프 스케어가 아니라 플레이어가 기다리는 시간의 불안으로 작동해야 한다.

## Chapter 2

### CMP_CH2_302_TVHum

- Goal: 눈보다 귀를 믿게 했다가 다시 무너뜨린다.
- UI: 판정형 보고서, 오디오/환경 evidence badge.
- Scene Beats: 응답 없는 문 확인 -> TV 저음 청취 -> 전력 기록 대조 -> 생활 소음 위치 흔들림.
- Evidence: `Evidence.Audio`, `Evidence.Environmental`; linked anomalies `ANM_302_TV_ON_IN_DARK`, `ANM_LIFE_NOISE_IN_VACANT_UNIT`.
- Sound: `SFX_LifeNoise_TVHum`, 위치가 흔들리는 low hum.
- Result: `NeedsFollowUp` 권장.
- Failure: 다음 생활 소음 민원에서 소리 위치가 달라진다.
- Validation: 소리의 주체를 보여주면 실패다.

### CMP_CH2_204_NameplateMismatch

- Goal: 세대 표기의 신뢰를 무너뜨린다.
- UI: 문패/우편함/명부 대조 화면, 기록장 conflict 항목.
- Scene Beats: 문패 확인 -> 우편함 확인 -> 명부 확인 -> 같은 이름/다른 호수 충돌 기록.
- Evidence: `Evidence.Document`, `Evidence.Records`, `Evidence.Visual`; linked anomalies `ANM_204_NAMEPLATE_MISMATCH`, `ANM_RECORD_CONFLICT`.
- Sound: 문패 금속 접촉, 종이/스탬프 timing offset.
- Result: `NeedsFollowUp` 권장, record conflict 진행.
- Failure: 보드 행 정렬과 문패 가독성이 미세하게 어긋난다.
- Validation: 플레이어가 어느 기록을 믿어야 하는지 확정할 수 없어야 한다.

### CMP_CH2_4F_CCTVBlank

- Goal: 안전 장치와 관리실 기록의 신뢰를 깨뜨린다.
- UI: CCTV viewer, 시간 로그 문서, 현장 확인 task.
- Scene Beats: 모니터 blank 확인 -> 시간 로그 gap 확인 -> 4층 현장 대조 -> 모니터 복귀 timing 확인.
- Evidence: `Evidence.Visual`, `Evidence.Document`, `Evidence.Records`; linked anomaly `ANM_4F_CCTV_TIME_GAP`.
- Sound: monitor buzz, static dropout, 짧은 silence.
- Result: `NeedsFollowUp` 권장.
- Failure: CCTV가 안전장치가 아니라 불신 매체가 된다.
- Validation: 영상 자체보다 영상/기록/현장의 불일치를 보여야 한다.

### CMP_CH2_ElevatorFloorError

- Goal: 층 감각과 이동 신뢰를 흔든다.
- UI: 엘리베이터 층 표시 점검, 보고서 판정.
- Scene Beats: 표시층 확인 -> 실제 도착층 확인 -> 문 열림 소리 지연 확인 -> 층수 표기 기록.
- Evidence: `Evidence.Visual`, `Evidence.Audio`; linked anomaly `ANM_ELEVATOR_FLOOR_MISMATCH`.
- Sound: floor ding mismatch, 금속문 잔향.
- Result: `NeedsFollowUp` 권장, 3층 불안 강화.
- Failure: 이동 경로 안내와 층 표기 신뢰가 하락한다.
- Validation: 길찾기를 불가능하게 만들지 않고 의심만 남긴다.

### CMP_CH2_ReopenedLightCase

- Goal: 건물이 해결 완료를 인정하지 않는 구조를 드러낸다.
- UI: 닫은 민원 재접수 row, 이전 보고서 viewer.
- Scene Beats: 완료 기록 확인 -> 재출력 보드 확인 -> 3층 조명 상태 재확인 -> 같은 소리의 변주 확인.
- Evidence: `Evidence.Document`, `Evidence.Records`, `Evidence.Visual`; linked anomalies `ANM_COMPLAINT_REPEATS`, `ANM_RECORD_CONFLICT`.
- Sound: `UI_Board_Reprint`, 이전 조명 buzz의 변형.
- Result: `NeedsFollowUp` 단일 권장, `Progression.Story.ComplaintLoopObserved`.
- Failure: 재접수 빈도와 보드 오염 강화.
- Validation: 반복이 버그처럼 보이지 않고 의도된 민원 loop로 읽혀야 한다.

## Chapter 3

### CMP_CH3_BasementPumpAlarm

- Goal: 지하실 진입을 정당화하고 설비 압박을 만든다.
- UI: 제한 구역 notice, 펌프 경보 민원, breaker tool 표시.
- Scene Beats: 경보 청취 -> 젖은 바닥 확인 -> 펌프 확인 -> 배전반 접근.
- Evidence: `Evidence.Audio`, `Evidence.Environmental`; linked anomaly `ANM_BSMT_PANEL_LABEL_CHANGED`.
- Sound: pump low frequency, breaker click, alarm cut.
- Result: `Resolved` 또는 `NeedsFollowUp`, 완료 시 지하 해금.
- Failure: 정전 체류 압박과 저주파가 증가한다.
- Validation: 지하가 전투 공간이 아니라 설비 공간의 압력으로 무서워야 한다.

### CMP_CH3_306_OpenDoorAlarm

- Goal: 306과 307의 기록/센서 미끄러짐을 만든다.
- UI: 도어 센서 로그, 306호 위치, 기록장 대조.
- Scene Beats: 문 닫힘 확인 -> 센서 로그 확인 -> 306/307 표기 흔들림 확인 -> 경보 재현.
- Evidence: `Evidence.Visual`, `Evidence.Records`; linked anomaly `ANM_306_DOOR_SENSOR_MISMATCH`.
- Sound: 도어 relay, 짧은 경보 절단음.
- Result: `NeedsFollowUp` 권장, `Progression.Story.Room307DoorReached`.
- Failure: 도어락 cue가 다른 층에서도 반복된다.
- Validation: 307호 직접 노출 전 306호를 거울 민원으로 사용한다.

### CMP_CH3_ExitSignDepth

- Goal: 복도 길이와 기준점 신뢰를 무너뜨린다.
- UI: 비상구 거리감 점검, 판정형 보고서.
- Scene Beats: 비상구 표지 확인 -> 기준점 걸음 수 대조 -> 반사 지연 확인 -> 복귀 후 기록 대조.
- Evidence: `Evidence.Visual`, `Evidence.Environmental`; linked anomalies `ANM_HALLWAY_STRETCH`, `ANM_REFLECTION_DELAY`.
- Sound: hallway low-end, reflection delay.
- Result: `NeedsFollowUp`, `Progression.Story.SpaceDepthShift`.
- Failure: 복도 기준점과 사운드 거리감이 더 불안정해진다.
- Validation: 복도 변형은 과한 판타지가 아니라 기준점 이동처럼 보여야 한다.

### CMP_CH3_BasementPanelMislabel

- Goal: 건물 인프라까지 307호 불일치가 번진 것을 보여준다.
- UI: 배전반 라벨 대조, 문서 viewer, breaker tool 표시.
- Scene Beats: 라벨 확인 -> 실제 라인 대조 -> 3층 전원 불안정 확인 -> 307 line 흔적 기록.
- Evidence: `Evidence.Document`, `Evidence.Environmental`, `Evidence.Records`; linked anomalies `ANM_BSMT_PANEL_LABEL_CHANGED`, `ANM_RECORD_CONFLICT`.
- Sound: panel hum, 라벨 종이 마찰, breaker resonance.
- Result: `NeedsFollowUp` 권장, `Progression.Story.BasementPowerLinked`.
- Failure: 전원 상태와 기록 불일치가 강화된다.
- Validation: 라벨은 정답을 알려주는 표가 아니라 불신을 여는 기록이어야 한다.

## Chapter 4

### CMP_CH4_307_PackageAtDoor

- Goal: 307호 앞 첫 체류를 만든다.
- UI: 택배/명부 대조, 307호 위치, story critical 표시.
- Scene Beats: 젖은 택배 확인 -> 운송장 대조 -> 명부에 없는 세대 확인 -> 문 안쪽 정적 확인.
- Evidence: `Evidence.Document`, `Evidence.Visual`, `Evidence.Records`; linked anomaly `ANM_307_PACKAGE_AT_MISSING_UNIT`.
- Sound: 젖은 종이, 복도 끝 저역, 문틈 전조.
- Result: `NeedsFollowUp`, `Progression.Story.Room307PackageSeen`.
- Failure: 307호 앞 흔적이 다음 방문마다 늘어난다.
- Validation: 307호는 아직 열리지 않고, 존재 여부만 강하게 압박해야 한다.

### CMP_CH4_307_LifeNoise

- Goal: 비어 있는 세대의 현재진행형 생활감을 만든다.
- UI: 오디오 판정형 보고서, 인터폰/명부 대조.
- Scene Beats: 문 앞 청취 -> 인터폰 호출 -> 응답 없음 확인 -> 생활 소음/기록 충돌.
- Evidence: `Evidence.Audio`, `Evidence.Visual`, `Evidence.Records`; linked anomaly `ANM_307_LIFE_NOISE_IN_VACANT_UNIT`.
- Sound: 307 내부 저활동 소리, 인터폰 정적, 낮은 말소리 파편.
- Result: `NeedsFollowUp`, `Progression.Story.Room307LifeNoise`.
- Failure: 생활음이 관리실과 복도 끝까지 따라온다.
- Validation: 명확한 대화나 실체음은 금지한다.

### CMP_CH4_RecordResident307

- Goal: 307호가 장소이자 기록 병변임을 명확히 만든다.
- UI: 명부, 정비 로그, 우편함 정보, 플레이어 필체 메모 viewer.
- Scene Beats: 명부 확인 -> 정비 로그 대조 -> 우편함 기록 확인 -> 플레이어 필체와 닮은 메모 기록.
- Evidence: `Evidence.Document`, `Evidence.Records`, `Evidence.Visual`; linked anomaly `ANM_307_RECORD_CONFLICT`.
- Sound: record timing offset, 프린터/종이 cue, 짧은 정적.
- Result: `NeedsFollowUp`, `Progression.Story.Room307RecordConflict`.
- Failure: 기록 UI 오염과 보드 재출력 압박 강화.
- Validation: 플레이어가 기록을 정리할수록 더 의심하게 만들어야 한다.

### CMP_CH4_FinalCheck307

- Goal: 전투나 설명이 아니라 확인 강박과 해석 잔상으로 결론낸다.
- UI: 최종 보고서, 마스터키/접근 제한 prompt, 모든 evidence domain 요약.
- Scene Beats: 문턱 체류 -> 내부 생활 흔적 확인 -> 반사 지연 확인 -> 기록/소리/공간 단서 종합 -> 마지막 보고.
- Evidence: `Evidence.Document`, `Evidence.Records`, `Evidence.Visual`, `Evidence.Audio`, `Evidence.Environmental`; linked anomalies `ANM_307_RECORD_CONFLICT`, `ANM_307_REFLECTION_DELAY`, `ANM_HALLWAY_STRETCH`.
- Sound: threshold silence, reflection delay, 문 안쪽 저활동 소리, final report silence.
- Result: `Resolved`는 제한적 해결, `NeedsFollowUp`는 잔상 엔딩.
- Failure: 결말 전 UI, 기록, 공간 기준점이 동시에 약해진다.
- Validation: 실체를 닫아 설명하지 않고, 플레이어가 마지막 보고의 의미를 의심해야 한다.

## 이상 현상 저작 기준

| 유형 | 대표 Anomaly | 제작 기준 |
| --- | --- | --- |
| 기록 충돌 | `ANM_RECORD_CONFLICT`, `ANM_307_RECORD_CONFLICT` | 보드, 명부, 라벨, 로그 중 최소 2개 매체가 서로를 부정한다. |
| 소리/생활 흔적 | `ANM_LIFE_NOISE_IN_VACANT_UNIT`, `ANM_307_LIFE_NOISE_IN_VACANT_UNIT` | 소리 주체를 보여주지 않고 문/벽/인터폰을 경유한다. |
| 전기/설비 | `ANM_3F_PERSISTENT_EMERGENCY_LIGHT`, `ANM_BSMT_PANEL_LABEL_CHANGED` | 조명/전원 상태와 기록이 동시에 어긋난다. |
| 공간/반사 | `ANM_HALLWAY_STRETCH`, `ANM_REFLECTION_DELAY`, `ANM_307_REFLECTION_DELAY` | 복도 기준점, 반사, 걸음 수, 잔향이 서로 맞지 않는다. |
| 보안/장치 | `ANM_4F_CCTV_TIME_GAP`, `ANM_306_DOOR_SENSOR_MISMATCH` | 안전장치가 플레이어를 보호하기보다 판단을 흔든다. |

## 최종 검증

- 20개 `CMP_...`가 모두 UI, scene beat, evidence, sound, anomaly, result, failure, validation을 가진다.
- 모든 `ANM_...`은 최소 하나의 민원에서 production 역할이 있다.
- `RequiredEvidenceTags`와 `EvidenceTagsGranted`는 서로 연결된다.
- `Room307Stage`는 챕터 4 전까지 직접 노출하지 않는다.
- 실패 압박은 조작 방해가 아니라 다음 민원/공간/기록/사운드의 신뢰 하락으로 나타난다.

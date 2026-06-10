---
aliases:
  - "NightCaretaker Level/Space Detail"
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

# NightCaretaker Level/Space Detail

> [!summary] 문서 목적
> 이 문서는 `야간 관리인: 307호의 민원`의 레벨/공간 제작 companion 문서다. 공간을 배경이 아니라 민원, 단서, UI, 조명, 사운드, 접근 상태가 연결되는 production 단위로 정의한다.

## 핵심 결론

- 이 문서는 보조 시각화 또는 세부 자료이며, 활성 기준은 루트 Master 문서를 우선한다.
- 다이어그램, 매트릭스, 와이어프레임은 현재 판단의 근거로 사용할 수 있지만 그대로 구현 기준이 되지는 않는다.
- 필요 시 본문의 항목을 Planning/Development/Art Master로 승격한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 보조 시각화/동반 자료 |
| 파일 경로 | `Archive/Companion/NightCaretaker_LevelSpace_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 목적 | 주요 섹션 |
| 제작 원칙 | 주요 섹션 |
| 공간 제작 매트릭스 | 주요 섹션 |
| 수직 슬라이스 Route | 주요 섹션 |
| Blockout 우선순위 | 주요 섹션 |
| 구현/저작 경계 | 주요 섹션 |
| 검증 체크리스트 | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 목적

이 문서는 `야간 관리인: 307호의 민원`의 레벨/공간 제작 companion 문서다. 공간을 배경이 아니라 민원, 단서, UI, 조명, 사운드, 접근 상태가 연결되는 production 단위로 정의한다.

기준 문서:

- `Document/NightCaretaker_Planning_Master.md`
- `Document/NightCaretaker_Development_Master.md`
- `Document/NightCaretaker_Art_Master.md`

## 제작 원칙

- 하나의 건물을 넓게 만들기보다, 좁은 공간을 반복 방문하면서 상태 변화로 새로움을 만든다.
- 모든 주요 공간은 첫 방문 기준점과 재방문 변주를 모두 가져야 한다.
- `LocationId`는 민원, 단서, UI 목표, 레벨 actor 배치가 만나는 기준점이다.
- `AccessState`, `PowerState`, `TensionStage`, `Room307Stage`, `Progression.*`는 공간 표현을 바꾸는 입력이지, 레벨이 새로 계산하는 상태가 아니다.
- 수직 슬라이스는 전체 게임 축소판이 아니라 `업무 루프가 공포로 변하는 과정`을 검증하는 route다.

## 공간 제작 매트릭스

| 공간 | 대표 `LocationId` | 포함 민원 | 접근/상태 hook | 필수 제작물 | 재방문 변주 |
| --- | --- | --- | --- | --- | --- |
| 관리실 | `LOC_OFFICE_MAIN`, `LOC_OFFICE_BOARD_3F_LIGHT`, `LOC_OFFICE_307_RECORDS` | `CMP_PRO_OfficeLightBuzz`, `CMP_CH2_ReopenedLightCase`, `CMP_CH4_RecordResident307` | `ENCShiftPhase::BoardReview`, `RecordIntegrity`, `TensionStage` | 민원 보드, 공구함, 명부, 정비 로그, 전화/인터폰, 형광등 | 보드 재출력, 기록 오염, 조명 tone 변화 |
| 1층 로비/우편함 | `LOC_1F_MAILBOX` | `CMP_CH1_1F_MailboxMisdelivery` | `Progression.Story.IntercomStaticObserved` | 우편함, 라벨, 입주 안내판, CCTV 표식, 로비 조명 | 라벨 위치, 명부와의 불일치 |
| 2층 복도 | `LOC_2F_203_DOOR`, `LOC_2F_INTERCOM`, `LOC_2F_204_DOOR`, `LOC_2F_205_DOOR`, `LOC_2F_EXIT_HALL` | 203 물기, 인터폰, 204 문패, 205 냄새, 비상구 거리감 | `Progression.Chapter.One`, `TensionStage` | 세대 문, 인터폰, 환기구, 젖은 타일, 비상구 표지 | 물기 확산, 문패 충돌, 복도 깊이감 |
| 3층 복도 | `LOC_3F_EMERGENCY_LIGHT`, `LOC_3F_302_DOOR`, `LOC_3F_306_DOOR`, `LOC_3F_307_DOOR` | 3층 비상등, 302 TV, 306 문 센서, 307 택배/소음 | `Room307Stage`, `TensionStage` | 비상등, 302/306/307 문, 도어락, 문패, 복도 끝 암부 | 307 흔적 증가, 생활 소음, 문틈 정적 |
| 계단실/엘리베이터 | `LOC_STAIR_1F_2F`, `LOC_ELEVATOR_MAIN` | 계단 자동등, 엘리베이터 층 오류 | `PowerState`, `TensionStage` | 센서등, 층수 표기, 난간, 엘리베이터 버튼/표시창 | 자동등 지연, 층 표시 오류, 반향 변화 |
| 4층/CCTV | `LOC_4F_CCTV` | `CMP_CH2_4F_CCTVBlank` | `Progression.Story.RecordMismatchNoted` | CCTV 카메라, 모니터 대응 표식, 시간 로그 단서 | 영상 blank와 현장 불일치 |
| 지하 전기실 | `LOC_BSMT_PUMP`, `LOC_BSMT_PANEL` | 지하 펌프, 배전반 라벨 | `AccessState=TemporaryUnlocked`, `PowerState`, `Progression.Story.SpaceDepthShift` | 지하 계단, 펌프, 배전반, 케이블, 라벨, 경고등, 젖은 바닥 | 저주파, 라벨 변경, 정전 체류 압박 |
| 307호 내부 | `LOC_3F_307_INTERIOR` | `CMP_CH4_FinalCheck307` | `Room307Stage=Threshold/Interior`, `AccessState=Unlocked` | 현관, 좁은 전실, 생활 흔적, 반사면, 문턱, 기록 단서 | 반사 신뢰 붕괴, 생활 흔적 잔상 |

## 수직 슬라이스 Route

| 순서 | 공간 route | 필수 민원/상태 | 검증 기준 |
| --- | --- | --- | --- |
| 1 | 관리실 인수인계 | `ENCShiftPhase::BoardReview` | 보드, 도구, 보고 위치를 5분 안에 이해한다 |
| 2 | 관리실 조명 조치 | `CMP_PRO_OfficeLightBuzz` | 형광등, 스위치, 안정기, 3F 07 흔적이 한 공간 안에서 닫힌다 |
| 3 | 2층 203호 조사 | `CMP_PRO_203_WaterAtDoor` | 203호 문 앞에서 visual/environmental evidence를 확보한다 |
| 4 | 2층 인터폰 | `CMP_CH1_2F_IntercomStatic` | audio evidence와 설비 수리 행동이 연결된다 |
| 5 | 3층 비상등 | `CMP_CH1_3F_EmergencyLight` | 3층 복도가 다른 층보다 불안정하게 읽힌다 |
| 6 | 302호 앞 | `CMP_CH2_302_TVHum` | 빈집 생활 소음과 전력 기록 충돌을 판정한다 |
| 7 | 정전 복귀 | `PowerState=FloorOutage/EmergencyOnly` | 지하 목표가 생기되 길찾기가 불가능해지지 않는다 |
| 8 | 지하 펌프 | `CMP_CH3_BasementPumpAlarm` | 제한 구역이 공식 조사 구역으로 바뀐다 |
| 9 | 지하 배전반 | `CMP_CH3_BasementPanelMislabel` | 전기 계통과 307 단서가 연결된다 |
| 10 | 307호 앞 | `CMP_CH4_307_PackageAtDoor` | 문을 열지 않아도 다음 목표로 307호가 각인된다 |

## Blockout 우선순위

| 우선순위 | 공간 | 완료 기준 |
| --- | --- | --- |
| P0-A | 관리실 | 민원 수락, 보고, 도구 준비, 조명 조치가 가능한 밀도 |
| P0-A | 2층 복도 | 203호, 인터폰, 젖은 타일, 문패 기준점 완성 |
| P0-A | 3층 복도 | 302호, 307호 앞, 비상등, 복도 끝 암부 완성 |
| P0-A | 지하 전기실 | 지하 진입, 펌프, 배전반, 라벨 대조 가능 |
| P0-B | 계단실/엘리베이터 | 이동 경로와 센서등/층 오류 검증 가능 |
| P0-B | 307호 문 앞 | 택배, 문틈, 도어락, 문패만으로 압박 생성 |
| P1 | 1층 로비/우편함 | 기록형 민원과 로비 기준점 제공 |
| P1 | 4층/CCTV | CCTV blank와 안전장치 불신 제공 |
| P2 | 307호 내부 | 최종 확인과 반사/기록/생활 흔적 결론 제공 |

## 구현/저작 경계

- Level Blueprint는 상태 이벤트를 소비해 조명, 문, 프랍, 사운드 source를 바꾼다.
- Level Blueprint가 `CompletionTags`를 임의로 추가하지 않는다.
- 문/엘리베이터/지하 접근은 `AccessState`와 progression tag를 읽어 prompt와 개폐 가능 여부만 결정한다.
- `LocationId` 문자열을 분해해서 층/호수를 추론하지 않는다.
- 재방문 변주는 길찾기를 망가뜨리지 않는다. 기준점은 남기고 신뢰만 낮춘다.

## 검증 체크리스트

- 모든 수직 슬라이스 단계가 한 route로 이어지는가.
- 각 공간에 담당 `CMP_...`와 대표 `LocationId`가 있는가.
- 각 공간에 조명 hook과 사운드 원인 포인트가 있는가.
- 첫 방문 기준점과 재방문 변주가 모두 정의되어 있는가.
- 307호는 챕터 4 전까지 직접 노출되지 않고 숫자/기록/3층 불안으로만 예고되는가.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

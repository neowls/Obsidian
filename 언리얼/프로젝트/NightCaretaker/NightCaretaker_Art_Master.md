---
aliases:
  - "야간 관리인: 307호의 민원 - 아트 마스터"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - art
  - active-doc
type: project-document
project: NightCaretaker
category: active-art
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# 야간 관리인: 307호의 민원 - 아트 마스터

> [!summary] 문서 목적
> 이 문서는 아트 작업자가 바로 무엇을 조사하고, 어떤 목업을 만들고, 어떤 에셋부터 제작해야 하는지 판단하기 위한 기준서다.

## 핵심 결론

- 아트 판단은 P0 루트의 기능성, 길찾기, 307호 누적 훅을 우선한다.
- 분위기보다 공간의 용도, 조명 원인, 프랍의 기능을 먼저 설명한다.
- 고품질 제작 전 reference board, blockout, lighting state sheet를 먼저 검증한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 활성 아트 기준서 |
| 파일 경로 | `NightCaretaker_Art_Master.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 문서 정보 | 주요 섹션 |
| 1. Art Target | 주요 섹션 |
| 비주얼 한 줄 | 세부 기준 |
| 핵심 목표 | 세부 기준 |
| 디자인 원칙 | 세부 기준 |
| 2. Reference Board Requirements | 주요 섹션 |
| P0 레퍼런스 보드 | 세부 기준 |
| 레퍼런스 수집 키워드 | 세부 기준 |
| 참고작 분석 규칙 | 세부 기준 |
| 3. Current Content Snapshot | 주요 섹션 |
| 4. P0 Visual Route | 주요 섹션 |
| 5. Required Mockups | 주요 섹션 |
| 6. P0 Asset Backlog | 주요 섹션 |
| ART-P0-01 Corridor Modular Kit | 세부 기준 |
| 추가 섹션 21 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 문서 역할 | 활성 아트/비주얼 제작 기준서 |
| 상태 | Operational Draft |
| 갱신일 | 2026-05-26 |
| 기획 기준 | `Document/NightCaretaker_Planning_Master.md` |
| 개발 기준 | `Document/NightCaretaker_Development_Master.md` |
| 이전 장문 백업 | `Document/Archive/Art/NightCaretaker_Art_Master_PreOperationalRefresh_20260526.md` |
| 원본 상세 보관 | `Document/Archive/Art` |

이 문서는 아트 작업자가 바로 무엇을 조사하고, 어떤 목업을 만들고, 어떤 에셋부터 제작해야 하는지 판단하기 위한 기준서다.
무드 설명보다 레퍼런스 수집, 산출물, 제작 순서, 리뷰 기준을 우선한다.

## 1. Art Target

### 비주얼 한 줄

낡은 한국/동아시아식 아파트의 야간 관리 업무 공간을 현실적으로 만들고, 그 현실적인 기준점이 307호를 중심으로 조금씩 어긋나게 만든다.

### 핵심 목표

| 항목 | 결정 |
| --- | --- |
| 첫 인상 | 오래되고 실제로 사람이 살던 아파트. 공포 세트장이 아니라 생활 공간이어야 한다. |
| 공포 방식 | 괴이한 오브젝트보다 조명, 표기, 얼룩, 문틈, 소리의 위치가 어긋나는 방식. |
| 제작 우선순위 | 플레이 루프에 필요한 공간과 프랍을 먼저 만든다. 장식용 밀도는 후순위다. |
| P0 결과 | 관리실 -> 2층 민원 -> 3층/307 문 앞까지의 루트가 플레이 가능하고 읽히는 상태. |
| 금지 | 과한 고어, 의식용 상징, 판타지 괴물 장식, 의미 없는 쓰레기 밀도, 과도한 블루/퍼플 공포 조명. |

### 디자인 원칙

| Pillar | 작업 규칙 | 리뷰 질문 |
| --- | --- | --- |
| Functional First | 모든 공간과 프랍은 먼저 기능을 설명해야 한다. | 플레이어가 이 물건/공간의 용도를 3초 안에 이해하는가? |
| Lived-In Residue | 사람의 흔적은 남기되 NPC 존재감은 과하게 만들지 않는다. | 방금 사람이 있었는지, 오래 방치됐는지 구분되는가? |
| Fluorescent Realism | 형광등, 비상등, 단말, 인터폰 같은 실제 광원에서 무드를 만든다. | 조명이 예쁜가보다 왜 이렇게 보이는지 설명되는가? |
| Controlled Distortion | 변주는 작고 명확해야 한다. | 이전 상태와 비교해 무엇이 달라졌는지 보이는가? |
| 307 Restraint | 307호는 초반에 많이 보여주지 않는다. | 직접 공포보다 신경 쓰이는 여백이 있는가? |

## 2. Reference Board Requirements

아트 작업 전 레퍼런스 보드를 먼저 만든다.
레퍼런스는 그대로 복제하지 않고, 기능/재질/조명/노후 흔적을 분석하기 위해 사용한다.

### P0 레퍼런스 보드

| 보드 | 필요한 자료 | 최소 수량 | 확인할 포인트 |
| --- | --- | --- | --- |
| `REF_Apt_Corridor` | 오래된 복도식 아파트, 공용 복도, 층 표지 | 20장 | 폭, 천장 높이, 문 간격, 조명 위치, 바닥 재질 |
| `REF_Manager_Office` | 관리실, 경비실, CCTV/단말, 도구함 | 20장 | 책상 배치, 종이 기록, 전화/무전, 조명, 낡은 장비 |
| `REF_Stair_Lobby` | 계단실, 1층 로비, 우편함, 인터폰 | 20장 | 시야 차단, 층수 표기, 엘리베이터/계단 연결 |
| `REF_Doors_Nameplates` | 현관문, 문패, 호수 표찰, 우편함 이름 | 20장 | 숫자 표기, 노후, 스티커 흔적, 잠금장치 |
| `REF_Lighting_Electric` | 형광등, 비상등, 배전반, 전기실 | 20장 | 광원 색, 깜빡임 원인, 케이블/스위치 배치 |
| `REF_Damage_Decals` | 누수, 결로, 곰팡이, 벽지 뜸, 타일 오염 | 20장 | 가장자리 패턴, 색 범위, 습기 방향, 반복 방지 |
| `REF_307_Threshold` | 닫힌 문 앞 생활 흔적, 택배, 문틈, 신발장 | 15장 | 직접 설명 없이 존재감을 만드는 물건 |

### 레퍼런스 수집 키워드

| 목적 | 검색/수집 키워드 예시 |
| --- | --- |
| 현실 아파트 | 오래된 복도식 아파트, 90년대 아파트 복도, 구축 아파트 계단실, 아파트 관리실 |
| 시설물 | 아파트 배전반, 비상등, 형광등 안정기, 인터폰 패널, 우편함, CCTV 모니터 |
| 표면 | 누수 벽지, 결로 곰팡이, 낡은 장판, 오래된 타일, 페인트 박리, 녹슨 철문 |
| 307호 | 닫힌 현관문 문틈, 빈집 우편물, 문 앞 택배, 문패 스티커 흔적 |

### 참고작 분석 규칙

| 참고 방향 | 배울 점 | 복제 금지 |
| --- | --- | --- |
| 반복 복도형 공포 게임 | 같은 경로를 다시 지날 때 차이를 인식시키는 방법 | 동일한 루프 구조나 대표 장면 복제 |
| 생활 공간 기반 공포 | 평범한 생활 물건으로 불안을 만드는 방법 | 상징물/낙서/고어 과잉 |
| 야간 근무/업무형 공포 | 모니터, 기록, 체크리스트가 불안을 만드는 방식 | UI를 업무가 아니라 퍼즐 장치로만 쓰는 방식 |
| 동아시아 아파트/상가 공포 | 좁은 공용공간, 형광등, 오래된 표지의 현실감 | 과장된 폐허화 |

작업자는 레퍼런스를 볼 때 `무섭다`가 아니라 `왜 이 공간이 실제처럼 보이는가`, `어느 부분이 기능을 설명하는가`, `어떤 작은 차이가 불안을 만드는가`를 기록한다.

## 3. Current Content Snapshot

| 영역 | 현재 자산 |
| --- | --- |
| 레벨 | `Content/NightCaretaker/Level/DevLevel.umap`, `Level.umap`, `Prop_Pallet.umap` |
| 모듈 | `Props/Module/SM_Floor_01A`, `SM_Wall_01A`, `SM_Wall_01B`, `SM_Wall_02A` |
| 재질/텍스처 | `Props/Module/MI_Wall`, `T_Wall_D`, `T_Wall_N`, `T_Wall_ORM`, `Props/MI/MI_Tile_01A` |
| 프랍/문 | `Props/BP_NCDoor`, `BP_NCDoorBase`, `BP_PhysicalPropBase`, `BP_PhysicalPropCube` |
| 플레이어/UI | `Character/BP_NCCharacter`, `Widget/WBP_NCPlayerHUD` |
| 데이터 | `Data/Complaint`, `Data/Anomaly`, `Data/DT_ChapterComplaint` |

현재는 P0 공간을 완성하기에 필요한 모듈/문/기본 프랍의 시작점이 있다.
다음 작업은 에셋을 늘리기보다 P0 루트를 읽히게 만드는 blockout, 라이트, 기능성 프랍, 표면 변주다.

## 4. P0 Visual Route

P0 아트는 전체 아파트가 아니라 아래 루트만 먼저 완성한다.

1. 관리실: 접수, 도구, 보고의 시작점.
2. 로비/계단 연결: 외부와 단절되는 첫 기준점.
3. 2층 복도/203호 앞: 정상 민원 기준선.
4. 3층 복도/302호 앞: 이상 민원 전환 지점.
5. 307호 문 앞: 직접 진입 전까지의 결론 지점.

| 공간 | 플레이 목적 | 아트 책임 | P0 완료 기준 |
| --- | --- | --- | --- |
| 관리실 | 민원 접수, 도구 선택, 보고 | 단말, 전화/무전, 도구함, 기록물, 형광등 | 플레이어가 업무 공간임을 즉시 이해한다. |
| 로비/계단 | 반복 이동 기준점 | 층 표지, 우편함, 엘리베이터/계단 입구 | 길찾기 기준점이 된다. |
| 2층/203호 | 정상 민원 | 누수 흔적, 밸브/문 앞 단서, 평범한 조명 | 현실적인 고장으로 읽힌다. |
| 3층/302호 | 이상 민원 | TV/소리 단서, 어두운 문틈, 307 방향 시선 유도 | 정상 해결 후에도 소리/시선이 남는다. |
| 307호 앞 | 누적 훅 | 문패, 문틈, 우편물/택배, 미세한 조명 차이 | 들어가지 않아도 신경 쓰인다. |

## 5. Required Mockups

아래 목업은 고품질 에셋 제작 전에 먼저 만든다.

| Mockup | 형식 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| P0 Route Topdown | 간단 평면도 이미지 또는 Mermaid/PNG | 관리실에서 203, 302, 307까지 동선 결정 | 플레이어 동선, 시야 유도, backtracking 지점 표시 |
| Corridor Elevation | 정면/측면 스케치 | 문 간격, 조명, 표지판, 배전함 위치 결정 | 모듈 길이와 반복 패턴이 정해짐 |
| Management Office Layout | 러프 3D blockout 또는 2D 배치도 | 접수 단말, 도구함, 보고 위치 결정 | 플레이어가 180도 안에서 주요 기능을 찾음 |
| Door/Nameplate Sheet | 이미지 보드 | 203/302/307 문과 문패 차이 결정 | 307은 튀지 않지만 반복 확인하게 만듦 |
| Lighting State Sheet | 5단계 이미지/표 | Stable, Flicker, PartialOutage, Emergency, 307Focus 정의 | 라이트 색/밝기/깜빡임 차이가 명확함 |
| 307 Escalation Paintover | Stage 0~3 이미지 | P0에서 307이 어떻게 변하는지 결정 | Stage별 변화가 작지만 비교 가능함 |

목업은 예쁘게 마감하지 않는다.
목업의 목적은 제작자가 같은 장면을 떠올리게 만드는 것이다.

## 6. P0 Asset Backlog

### ART-P0-01 Corridor Modular Kit

| 항목 | 내용 |
| --- | --- |
| 목적 | 2층/3층 복도를 빠르게 조립하고 반복 변주할 수 있게 한다. |
| 산출물 | 벽, 바닥, 천장, 모서리, 문틀, 복도 끝 캡, 배전함 슬롯 |
| 기준 | 203/302/307 앞이 같은 모듈을 쓰되 문패/조명/얼룩으로 구분된다. |
| 검증 | P0 루트 blockout에 배치했을 때 길찾기가 가능하고 반복감이 과하지 않다. |

### ART-P0-02 Door And Nameplate Set

| 항목 | 내용 |
| --- | --- |
| 목적 | 민원 위치와 307호 훅을 명확히 만든다. |
| 산출물 | 일반 현관문, 203/302/307 문패, 문틈 shadow decal, 잠금장치, 오래된 스티커 흔적 |
| 기준 | 307호 문은 초반에 튀지 않고, 반복 방문 시 변화가 보일 여지를 둔다. |
| 검증 | 플레이어가 호수를 읽고 목적지를 찾을 수 있다. |

### ART-P0-03 Management Office Gameplay Kit

| 항목 | 내용 |
| --- | --- |
| 목적 | 접수, 도구 선택, 보고가 한 공간에서 읽히게 한다. |
| 산출물 | 관리실 책상, 낡은 모니터/단말, 전화/무전, 도구함, 서류함, 형광등, 공지판 |
| 기준 | 단말/도구함/보고 위치가 명확하고 서로 시야를 방해하지 않는다. |
| 검증 | 신규 플레이어가 관리실에서 첫 상호작용 지점을 찾는다. |

### ART-P0-04 Lighting And Electrical Kit

| 항목 | 내용 |
| --- | --- |
| 목적 | 조명 변화만으로 상태를 읽히게 한다. |
| 산출물 | 형광등, 비상등, 스위치, 배전반, 케이블, light function/깜빡임 프리셋 |
| 기준 | Stable/Flicker/PartialOutage/Emergency/307Focus 상태가 구분된다. |
| 검증 | 공포 조명이어도 상호작용 대상과 길찾기는 읽힌다. |

### ART-P0-05 Leak And Residue Decal Pack

| 항목 | 내용 |
| --- | --- |
| 목적 | 203호 누수 민원과 생활 흔적을 설명한다. |
| 산출물 | 물자국, 젖은 바닥, 벽지 뜸, 곰팡이, 타일 오염, 먼지 가장자리 |
| 기준 | 원인을 추적할 수 있는 방향성과 위치성이 있어야 한다. |
| 검증 | 플레이어가 누수 단서를 시각적으로 찾는다. |

### ART-P0-06 Complaint Props

| 항목 | 내용 |
| --- | --- |
| 목적 | 민원 단서가 단순 텍스트가 아니라 세계 안 물건으로 보이게 한다. |
| 산출물 | 밸브/배관 커버, TV glow proxy, 우편물, 메모, 관리 기록, 인터폰 패널 |
| 기준 | 단서 프랍은 `Evidence.Visual/Audio/Document`와 연결될 수 있게 명확한 형태를 가진다. |
| 검증 | UI 없이도 무엇을 조사해야 할지 대략 이해된다. |

### ART-P0-07 Room 307 Threshold Set

| 항목 | 내용 |
| --- | --- |
| 목적 | 307호 내부를 열지 않고도 존재감을 만든다. |
| 산출물 | 307 문, 문패 변주, 문틈 어둠, 얇은 빛, 우편물/택배, 생활 흔적 2~3종 |
| 기준 | Stage 0~3 변화가 비교 가능하되 과장되지 않는다. |
| 검증 | 플레이어가 자발적으로 307호 앞을 다시 확인한다. |

## 7. Production Order

| 단계 | 작업 | 산출물 | Gate |
| --- | --- | --- | --- |
| A0. Reference Board | P0 레퍼런스 수집과 분석 | 7개 보드, 키워드/분석 메모 | 제작자가 같은 공간 이미지를 공유한다. |
| A1. Route Blockout | P0 루트 greybox | P0 test map 또는 blockout level | 동선과 상호작용 위치가 확정된다. |
| A2. Mockup Pass | 필수 목업 6종 | topdown, elevation, office layout, door sheet, lighting sheet, 307 paintover | 고품질 제작 전 방향 승인 |
| A3. Modular Kit Pass | 복도/문/조명 기본 키트 | 모듈 mesh/material instance | 2층/3층 루트 조립 가능 |
| A4. Gameplay Prop Pass | 관리실/민원 프랍 | 단말, 도구함, 누수/TV/기록 단서 | 플레이어 목적이 시각적으로 읽힘 |
| A5. Lighting State Pass | P0 조명 상태 | Stable/Flicker/PartialOutage/307Focus | 길찾기와 공포 무드가 공존 |
| A6. 307 Escalation Pass | Stage 0~3 문 앞 변화 | 307 threshold set | 내부 없이도 훅이 생김 |
| A7. Optimization/Polish | 충돌, LOD/Nanite, material 정리 | P0 pass-ready scene | Win64 P0 테스트 안정성 |

## 8. Folder And Naming Rules

| 유형 | 권장 위치 | 네이밍 |
| --- | --- | --- |
| 모듈 메시 | `Content/NightCaretaker/Props/Module` | `SM_AptCorridor_Wall_01A` |
| 머티리얼 인스턴스 | `Content/NightCaretaker/Props/MI` | `MI_AptWall_Damp_01` |
| 프랍 BP | `Content/NightCaretaker/Props` | `BP_NC_OfficeTerminal`, `BP_NC_LeakValve` |
| 데이터 연동 프랍 | `Content/NightCaretaker/Props` | `BP_Evidence_203Leak_01` |
| 레벨 | `Content/NightCaretaker/Level` | `LV_P0VerticalSlice` |
| UI/문서 텍스처 | `Content/NightCaretaker/Widget` 또는 전용 폴더 | `T_UI_ComplaintBoard_01` |

새 폴더를 늘리기 전에 기존 `Content/NightCaretaker` 구조 안에서 정리한다.
외부 marketplace/Fab 에셋은 바로 P0에 섞지 말고, 필요한 경우 `Content/Fab`에서 검토 후 프로젝트 스타일에 맞춰 이관한다.

## 9. Material And Lighting Rules

### 재질

| 대상 | 기준 |
| --- | --- |
| 벽/천장 | 저채도 페인트/벽지, 습기와 손때가 모서리에 쌓이는 구조 |
| 바닥 | 반복 타일/장판 패턴, 물자국과 반사가 과하지 않게 |
| 금속 | 현관문, 배전함, 손잡이는 긁힘/녹/스티커 흔적 중심 |
| 유리/플라스틱 | 인터폰, 비상등, 단말 화면은 너무 선명하지 않게 |
| 데칼 | 방향성과 원인이 있어야 한다. 무작위 오염 금지 |

### 조명

| 상태 | 색/밝기 기준 | 용도 |
| --- | --- | --- |
| Stable | 차갑지만 생활 가능한 형광등 | 정상 민원 기준선 |
| Flicker | 짧고 드문 깜빡임 | 불안 시작 |
| PartialOutage | 복도 일부만 꺼짐 | 방향 유도/시야 제한 |
| Emergency | 낮은 비상등, 붉은색 남발 금지 | 정전/지하실 |
| 307Focus | 307 문 앞만 설명하기 어려운 어둠/잔광 | Stage 2~3 |

조명은 예쁜 화면보다 플레이어가 목적지를 찾고 단서를 읽을 수 있는지를 우선한다.

## 10. 307 Visual Progression

| Stage | P0 시각 변화 | 금지 |
| --- | --- | --- |
| 0 | 평범한 307 문과 문패 | 초반부터 오컬트 장식 |
| 1 | 단말/우편함/문패 숫자 확인 빈도 증가 | 숫자 과잉 반복 |
| 2 | 문패 스티커 흔적, 우편물 이름 불일치 | 문 자체를 괴물처럼 변형 |
| 3 | 문틈 어둠, 얇은 빛, 소리 방향과 맞지 않는 그림자 | 내부 실루엣 직접 노출 |

307호는 `이상한 방`보다 `모든 정상 민원이 다시 모이는 장소`처럼 보여야 한다.

## 11. Review Checklist

### 레퍼런스 리뷰

- 현실 공간 레퍼런스가 충분한가?
- 각 레퍼런스가 기능, 재질, 조명, 노후 흔적 중 무엇을 설명하는지 적혀 있는가?
- 참고작 레퍼런스가 복제 대상이 아니라 분석 대상으로 정리되어 있는가?

### Blockout 리뷰

- 관리실에서 첫 상호작용 지점을 찾을 수 있는가?
- 203/302/307 목적지가 표지와 문패로 읽히는가?
- 반복 동선에서 어디가 안전 기준점인지 알 수 있는가?
- 307호 앞이 너무 일찍 강한 공포로 소비되지 않는가?

### Asset 리뷰

- 에셋이 플레이 루프와 연결되는가?
- 기능성 프랍과 장식 프랍이 구분되는가?
- 같은 모듈 반복이 눈에 거슬리지 않는가?
- 데칼/오염이 원인과 방향을 가진가?

### Lighting 리뷰

- 어두워도 길과 단서가 읽히는가?
- 조명 변화가 상태 변화와 연결되는가?
- 307호 조명은 과장보다 비교 가능한 미세 차이로 작동하는가?

## 12. P0 Art Acceptance Criteria

| 기준 | 통과 신호 |
| --- | --- |
| 역할 인지 | 관리실을 보면 접수/도구/보고 공간이라는 것을 이해한다. |
| 동선 인지 | 플레이어가 203, 302, 307 위치를 표지와 문패로 찾는다. |
| 민원 인지 | 누수/TV/기록 단서가 텍스트 없이도 조사 대상으로 보인다. |
| 307 훅 | 307 내부를 보지 않아도 다시 확인하고 싶어진다. |
| 상태 변화 | Stable/Flicker/PartialOutage/307Focus 조명 상태가 구분된다. |
| 제작 효율 | 같은 복도 모듈로 2층/3층을 만들고 소품/조명/표기로 구분한다. |
| 성능 | P0 루트에서 불필요하게 무거운 고해상도/고복잡도 에셋을 남발하지 않는다. |

## 13. Immediate Next Tasks

| 순서 | 작업 | 산출물 |
| --- | --- | --- |
| 1 | P0 레퍼런스 보드 7개 만들기 | 이미지 보드와 분석 메모 |
| 2 | P0 루트 topdown 목업 | 관리실-203-302-307 동선 |
| 3 | 관리실 layout 목업 | 단말/도구함/보고 위치 |
| 4 | 복도 elevation 목업 | 문 간격, 조명, 표지판, 배전함 |
| 5 | 307 Stage 0~3 paintover | 문 앞 변화 4장 |
| 6 | Corridor modular kit 확장 | 벽/바닥/천장/문틀 |
| 7 | Door/nameplate set 제작 | 203/302/307 문과 문패 |
| 8 | Management office gameplay kit 제작 | 단말, 도구함, 서류, 형광등 |
| 9 | Leak/residue decal pack 제작 | 203호 누수 단서 |
| 10 | Lighting state 적용 | Stable/Flicker/307Focus |

## 14. Open Questions

| 질문 | 현재 기본값 |
| --- | --- |
| P0 레벨을 기존 `Level.umap`에 만들지 별도 레벨로 만들지 | 별도 `LV_P0VerticalSlice` 권장 |
| 실제 한국 아파트 색감을 얼마나 직접적으로 가져갈지 | 현실감 우선, 지역성은 표지/프랍으로 제한 |
| 307호 문은 초반부터 다른 재질이어야 하는지 | 같은 문 세트 + 미세 변주 |
| 세대 내부를 P0에 포함할지 | P0에서는 문 앞/문틈까지만 |
| 외부 에셋을 사용할지 | blockout 검증 후 부족분만 제한 사용 |

## 15. Maintenance Rule

아트 문서의 새 항목은 다음 형식으로만 본문에 넣는다.

```text
작업자는 [플레이어가 보거나 판단해야 하는 것]을 위해 [에셋/목업/레퍼런스]를 만든다.
완료 기준은 [플레이 루프에서 관찰 가능한 결과]다.
```

이 형식으로 쓸 수 없는 무드 문장은 Archive 또는 Source 작업 문서에 둔다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

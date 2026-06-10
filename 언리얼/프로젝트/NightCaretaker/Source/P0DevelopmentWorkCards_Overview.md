---
aliases:
  - "P0 Development Work Cards Overview"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - source
  - worklog
type: project-document
project: NightCaretaker
category: source-worklog
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# P0 Development Work Cards Overview

> [!summary] 문서 목적
> `P0DevelopmentWorkCards`는 P0 데모 수직 슬라이스 구현을 실제 개발 작업 단위로 쪼갠 문서다. 기존 `P0RuntimeKickoff`가 구현 순서를 정했다면, 이 문서는 각 기능/구조를 **누가 어떤 owner/API를 사용해 무엇을 만들고 어떻게 검증할지**까지 고정한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/P0DevelopmentWorkCards_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Implementation Anchors | 주요 섹션 |
| Card Board | 주요 섹션 |
| Priority Rule | 주요 섹션 |
| Non-Goals | 주요 섹션 |
| Validation State | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

`P0DevelopmentWorkCards`는 P0 데모 수직 슬라이스 구현을 실제 개발 작업 단위로 쪼갠 문서다. 기존 `P0RuntimeKickoff`가 구현 순서를 정했다면, 이 문서는 각 기능/구조를 **누가 어떤 owner/API를 사용해 무엇을 만들고 어떻게 검증할지**까지 고정한다.

## Scope

- 범위는 30-45분 P0 데모 외부 테스트 가능 상태까지다.
- 본편 제작, 307호 내부, 적 AI 추격, 전투, 복잡한 저장/로드, 멀티 엔딩은 포함하지 않는다.
- C++ 신규 대형 subsystem을 전제로 하지 않는다. 기존 owner를 우선 사용한다.
- 기준 문서는 `Document/Source/P0DevelopmentWorkCards_Overview.md`와 `Document/Source/P0DevelopmentWorkCards_Detail.md`다.
- 읽기용 HTML companion은 `Document/NightCaretaker_P0Development_WorkCards.html`에 둔다.

## Current Implementation Anchors

| Area | Existing Owner | Usage In Cards |
| --- | --- | --- |
| Complaint loop | `UNCComplaintRuntimeSubsystem` | register, accept, investigate, evidence, report, close |
| Shift state | `UNCShiftStateComponent` | chapter, phase, focused complaint, progression tags |
| Runtime data | `UNCComplaintRuntimeComponent` | live complaint state and discovered evidence storage |
| HUD | `UNCUISubsystem`, `UNCPlayerHUDWidget` | reticle, prompt bridge, UI lifetime |
| Player flow | `ANCPlayerControllerBase`, `ANCPlayerCharacter` | HUD setup, input, grab/door interaction |
| Debug | `UNCDebugCheatManager` | shift/complaint/evidence dump and smoke setup |
| Data | `UNCComplaintDefinition`, `FNCChapterComplaintRow` | complaint authoring, location id, evidence/report tags |

## Card Board

| Order | Card | Maps To | Dependency | Output Gate |
| --- | --- | --- | --- | --- |
| 0 | `DEV-P0-000 Build And PIE Baseline` | Week 0 | 없음 | C++ build와 `DevLevel` PIE 가능 여부 확인 |
| 1 | `DEV-P0-010 P0 Route Skeleton` | `CARD-P0-001`, `VS-BLOCKOUT-01` | `DEV-P0-000` | 관리실에서 307호 앞까지 이동 |
| 2 | `DEV-P0-020 Location Marker And Gate Contract` | `CARD-P0-002`, `VS-BLOCKOUT-02` | `DEV-P0-010` | route step별 위치 판정 |
| 3 | `DEV-P0-030 Office Interaction Shell` | `CARD-P0-003`, `VS-INTERACTION-01` | `DEV-P0-010` | 보드/도구/보고 위치 이해 |
| 4 | `DEV-P0-040 Complaint Seed Data` | `CARD-P0-004`, `VS-COMPLAINT-01` | `DEV-P0-020` | 첫 P0 민원 ID/tag/result 기준 고정 |
| 5 | `DEV-P0-050 Complaint Runtime Loop` | `CARD-P0-004`, `VS-COMPLAINT-01` | `DEV-P0-040` | 첫 민원이 report close까지 진행 |
| 6 | `DEV-P0-060 Board Report Notebook UI Bridge` | `CARD-P0-005`, `VS-UI-01` | `DEV-P0-050` | UI가 runtime state 표시 |
| 7 | `DEV-P0-070 HUD Prompt And Route Guidance` | `CARD-P0-006`, `VS-UI-02` | `DEV-P0-030`, `DEV-P0-060` | route prompt 연결 |
| 8 | `DEV-P0-080 Baseline Lighting State` | `CARD-P0-007`, `VS-LIGHTING-01` | `DEV-P0-010` | 조명 preset이 길찾기를 해치지 않음 |
| 9 | `DEV-P0-090 Baseline Audio Cue` | `CARD-P0-007`, `VS-AUDIO-01` | `DEV-P0-010` | 기본 ambience/cue가 route와 맞음 |
| 10 | `DEV-P0-100 Debug Smoke Commands` | `CARD-P0-008`, `VS-QADEBUG-01` | `DEV-P0-050` | 주요 상태를 debug로 재현 |
| 11 | `DEV-P0-110 P0 End-To-End Smoke Pass` | Demo lock | `DEV-P0-070`, `DEV-P0-080`, `DEV-P0-090`, `DEV-P0-100` | 30-45분 P0 흐름 통과 |

## Priority Rule

1. `DEV-P0-000`부터 `DEV-P0-020`까지는 모든 작업의 재현 기반이다.
2. `DEV-P0-030`과 `DEV-P0-050`이 끝나기 전에는 UI polish를 늘리지 않는다.
3. `DEV-P0-080`과 `DEV-P0-090`은 route readability를 해치지 않는 placeholder 수준으로 시작한다.
4. `DEV-P0-100`은 편의 기능이 아니라 이후 회귀 검증의 필수 조건으로 본다.

## Non-Goals

- 새 저장/로드 시스템 완성.
- 307호 내부 구현.
- 별도 quest manager, global singleton, 새 runtime state 축 추가.
- UI mockup만 먼저 만드는 작업.
- 아트 polish를 위해 route/complaint loop를 지연시키는 작업.

## Validation State

- 이 문서는 개발 작업카드 기준 문서다.
- 현재 C++, Blueprint, map, Data Asset은 수정하지 않았다.
- 정적 문서 검증만 수행한다.

## Update Log

- 2026-05-25: P0 development work cards overview created. Card IDs, dependencies, owner anchors, output gates, priority rule, non-goals, and validation state recorded.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

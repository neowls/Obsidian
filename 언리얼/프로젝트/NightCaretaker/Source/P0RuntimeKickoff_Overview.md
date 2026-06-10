---
aliases:
  - "P0 Runtime Kickoff Overview"
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

# P0 Runtime Kickoff Overview

> [!summary] 문서 목적
> `P0RuntimeKickoff`는 데모 수직 슬라이스의 P0 구현 착수 순서와 첫 검증 루프를 고정하는 작업 문서다. 목표는 `Document/NightCaretaker_VerticalSlice_Detail.md`에 정의된 기존 `VS-*` 티켓을 실행 가능한 kickoff queue로 정리하고, 첫 ...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/P0RuntimeKickoff_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Status | 주요 섹션 |
| Kickoff Order | 주요 섹션 |
| Recommended Work Cards | 주요 섹션 |
| State Contract | 주요 섹션 |
| Completed | 주요 섹션 |
| Remaining | 주요 섹션 |
| Risks | 주요 섹션 |
| Validation State | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

`P0RuntimeKickoff`는 데모 수직 슬라이스의 P0 구현 착수 순서와 첫 검증 루프를 고정하는 작업 문서다. 목표는 `Document/NightCaretaker_VerticalSlice_Detail.md`에 정의된 기존 `VS-*` 티켓을 실행 가능한 kickoff queue로 정리하고, 첫 코드/Blueprint 작업자가 어느 티켓부터 착수해야 하는지 명확히 남기는 것이다.

## Scope

- `Document/Source/P0RuntimeKickoff_Overview.md`와 `Document/Source/P0RuntimeKickoff_Detail.md`만 추가한다.
- 코드, Blueprint asset, 맵, Unreal 에디터 자산, Data Asset은 수정하지 않는다.
- 기존 `VS-BLOCKOUT`, `VS-INTERACTION`, `VS-COMPLAINT`, `VS-UI`, `VS-AUDIO`, `VS-LIGHTING`, `VS-QADEBUG` 그룹과 티켓 ID를 재사용한다.
- 새 runtime state, 새 진행 축, 새 티켓 명명 체계는 만들지 않는다.

## Current Status

- 문서/기획 확장과 vertical slice companion 문서 작성은 완료된 상태다.
- 다음 단계는 P0 구현 착수이며, 첫 전체 P0 티켓은 `VS-BLOCKOUT-01`이다.
- 첫 코드/상호작용 착수 티켓은 `VS-INTERACTION-01`이다.
- 첫 민원 루프 착수 티켓은 `VS-COMPLAINT-01`이다.
- 첫 UI 착수 티켓은 `VS-UI-01`이다.

## Kickoff Order

| Order | Ticket | Purpose | Starts After | First Validation |
| --- | --- | --- | --- | --- |
| 1 | `VS-BLOCKOUT-01` | 관리실, 2층 복도, 3층 복도, 지하 전기실, 307호 앞 연결 route blockout | 없음 | 10단계 route의 핵심 공간이 끊기지 않고 연결된다 |
| 2 | `VS-BLOCKOUT-02` | `LocationId` marker와 접근 gate 배치 | `VS-BLOCKOUT-01` | route step별 위치 판정과 접근 제한이 재현 가능하다 |
| 3 | `VS-INTERACTION-01` | 민원 보드, 공구함, 손전등, 보고 위치 interaction 연결 | `VS-BLOCKOUT-01` | 보드, 도구, 보고 위치를 5분 안에 이해한다 |
| 4 | `VS-COMPLAINT-01` | 수직 슬라이스 10단계 민원 row와 progression chain 검증 | `VS-BLOCKOUT-02` | `Accepted -> Investigating -> AwaitingReport -> Closed` 루프가 성립한다 |
| 5 | `VS-UI-01` | Board, Report, Notebook P0 화면 연결 | `VS-COMPLAINT-01` | 다음 행동은 보이지만 공포 원인은 설명하지 않는다 |

## Recommended Work Cards

현재 개발 단계에서는 아래 카드 순서로 진행하는 것이 가장 안전하다. 앞 카드가 다음 카드의 재현성과 검증 기준을 만든다.

| Priority | Card | Target Ticket | Outcome |
| --- | --- | --- | --- |
| 1 | `CARD-P0-001 Route Skeleton` | `VS-BLOCKOUT-01` | 관리실에서 307호 앞까지 P0 route가 끊기지 않는다 |
| 2 | `CARD-P0-002 Location Gates` | `VS-BLOCKOUT-02` | `LocationId` marker와 접근 gate로 route step 판정이 가능하다 |
| 3 | `CARD-P0-003 Office Interactions` | `VS-INTERACTION-01` | 민원 보드, 공구함, 손전등, 보고 위치가 최소 동작한다 |
| 4 | `CARD-P0-004 Complaint Seed Loop` | `VS-COMPLAINT-01` | 첫 민원이 수락, 조사, 보고 가능, 종료 상태를 통과한다 |
| 5 | `CARD-P0-005 Board Report UI` | `VS-UI-01` | Board/Report/Notebook이 실제 runtime state를 표시한다 |
| 6 | `CARD-P0-006 Route Prompts` | `VS-UI-02` | route별 HUD prompt와 document viewer text가 연결된다 |
| 7 | `CARD-P0-007 Baseline Mood` | `VS-AUDIO-01`, `VS-LIGHTING-01` | ambience와 조명 preset이 길찾기를 해치지 않고 긴장을 만든다 |
| 8 | `CARD-P0-008 Debug Smoke Loop` | `VS-QADEBUG-01` | 10단계 route 시작 상태를 독립 재현할 수 있다 |

## State Contract

P0 구현은 다음 기존 상태 축만 사용한다.

- `ENCShiftPhase`
- `ENCComplaintRuntimeState`
- `PowerState`
- `TensionStage`
- `Room307Stage`
- `RecordIntegrity`

지원 식별자와 태그는 기존 문서의 `LocationId`, `AccessState`, `Progression.*`, `Evidence.*`, `DomainTags`를 재사용한다. 이 문서는 새 enum, 새 subsystem state, 새 Blueprint 전역 변수를 요구하지 않는다.

## Completed

- 기존 vertical slice 티켓의 첫 실행 순서를 정했다.
- P0 구현 착수 전 확인해야 할 입력 문서와 runtime 계약을 wave 단위로 정리했다.
- `VS-BLOCKOUT-01`, `VS-BLOCKOUT-02`, `VS-INTERACTION-01`, `VS-COMPLAINT-01`, `VS-UI-01`을 첫 검증 루프의 핵심 티켓으로 고정했다.
- 현재 개발 단계에서 바로 사용할 8개 작업 카드를 정리했다.
- 8개 작업 카드의 실제 개발 세분화는 `Document/Source/P0DevelopmentWorkCards_Overview.md`와 `Document/Source/P0DevelopmentWorkCards_Detail.md`에서 `DEV-P0-*` 카드로 관리한다.

## Remaining

- `VS-BLOCKOUT-01` 구현 착수:
  - P0 blockout map 또는 현재 대상 map 확인,
  - 관리실, 2층 복도, 3층 복도, 지하 전기실, 307호 앞 route 연결,
  - route smoke-test 기준 작성.
- `VS-BLOCKOUT-02` 구현 착수:
  - `LocationId` marker 배치,
  - 접근 gate와 route step 판정 연결.
- `VS-INTERACTION-01` 구현 착수:
  - 민원 보드, 공구함, 손전등, 보고 위치의 기본 interaction 연결.
- `VS-COMPLAINT-01` 구현 착수:
  - 10단계 민원 row와 progression chain 검증.
- `VS-UI-01` 구현 착수:
  - Board, Report, Notebook P0 화면을 민원 runtime loop에 연결.
- `DEV-P0-*` 작업카드 착수:
  - `DEV-P0-000 Build And PIE Baseline`,
  - `DEV-P0-010 P0 Route Skeleton`,
  - `DEV-P0-020 Location Marker And Gate Contract`.

## Risks

- `VS-COMPLAINT-01`을 `VS-BLOCKOUT-02`보다 먼저 구현하면 위치/접근 조건을 임시 처리할 가능성이 높다.
- `VS-UI-01`을 민원 runtime loop 없이 먼저 만들면 화면 mockup과 실제 `ENCComplaintRuntimeState` 흐름이 어긋날 수 있다.
- `PowerState`, `TensionStage`, `Room307Stage`, `RecordIntegrity`를 각 파트에서 따로 저장하면 문서 계약과 다른 중복 상태가 생긴다.
- P0 route를 길게 늘리면 30~45분 검증 목표보다 동선 양이 먼저 커진다.

## Validation State

- 현재 검증 범위는 정적 문서 검증이다.
- Unreal Editor, Blueprint compile, C++ build, PIE smoke-test는 수행하지 않았다.
- 문서 검증 명령:
  - `rg --line-number "P0RuntimeKickoff" Document/Source`
  - `rg --line-number "VS-BLOCKOUT-01|VS-INTERACTION-01|VS-COMPLAINT-01|VS-UI-01" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md`
  - `rg --line-number "ENCShiftPhase|ENCComplaintRuntimeState|PowerState|TensionStage|Room307Stage" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md`
  - `rg --line-number "[ \t]+$" Document/Source/P0RuntimeKickoff_Overview.md Document/Source/P0RuntimeKickoff_Detail.md`
  - `git diff --check`

## Update Log

- 2026-04-26: `P0RuntimeKickoff` work item created. First P0 execution order, state contract, remaining work, risks, and document validation plan recorded.
- 2026-04-26: Added recommended P0 development work cards from route skeleton through debug smoke loop.
- 2026-05-25: Added reference to `P0DevelopmentWorkCards` as the detailed implementation card layer for the existing P0 kickoff queue.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

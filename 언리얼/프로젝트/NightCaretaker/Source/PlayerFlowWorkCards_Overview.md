---
aliases:
  - "Player Flow Work Cards - Overview"
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

# Player Flow Work Cards - Overview

> [!summary] 문서 목적
> 개발자가 프레임워크/API가 아니라 실제 게임 클라이언트를 실행한 뒤 보이는 화면과 플레이 흐름 기준으로 작업을 이해할 수 있게 한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlayerFlowWorkCards_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Status | 주요 섹션 |
| Core Decision | 주요 섹션 |
| P0 Flow Cards | 주요 섹션 |
| First Implementation Focus | 주요 섹션 |
| Validation State | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

개발자가 프레임워크/API가 아니라 실제 게임 클라이언트를 실행한 뒤 보이는 화면과 플레이 흐름 기준으로 작업을 이해할 수 있게 한다.

## Scope

- 클라이언트 실행부터 첫 플레이 세션, 메뉴, 옵션, 인트로, 일시정지, 저장/로드, 민원 플레이 루프까지의 흐름을 정의한다.
- 이 문서는 구현 클래스 중심 문서가 아니다. 플레이어가 보는 화면, 누르는 조작, 그 결과 동작해야 하는 기능을 기준으로 작업카드를 만든다.
- P0 기준은 15~20분 수직 슬라이스다.
- HTML 작업카드로 옮기기 전 Markdown 기준안으로 작성한다.

## Current Status

- Status: Complete
- Detail document: `Document/Source/PlayerFlowWorkCards_Detail.md`
- HTML conversion: Not started

## Core Decision

P0에서 가장 먼저 만들어야 할 흐름은 `메인 메뉴 -> 새 게임 -> 첫 근무 시작 -> 민원 1건 완료 -> 보고 -> 다음 민원`이다.

개발 카드가 시스템 이름으로 보이지 않더라도, 실제 플레이어 관점에서는 다음 순서가 먼저 보여야 한다.

1. 게임 실행.
2. 밝기/감마 등 첫 실행 설정 또는 메인 메뉴 진입.
3. 새 게임 또는 이어하기 선택.
4. 인트로/근무 시작.
5. 관리실에서 민원 접수.
6. 도구 선택.
7. 현장 이동과 단서 확인.
8. 조치 또는 이상 판정.
9. 보고.
10. 저장/체크포인트.
11. 다음 민원 또는 종료.

## P0 Flow Cards

| Order | Card                                      | Purpose                       |
| ----- | ----------------------------------------- | ----------------------------- |
| 0     | `FLOW-P0-00 Client Boot And First Launch` | 게임 실행, 초기 설정, 첫 화면 결정         |
| 1     | `FLOW-P0-01 Title And Main Menu`          | 새 게임, 이어하기, 불러오기, 옵션, 종료      |
| 2     | `FLOW-P0-02 Options And Accessibility`    | 밝기/감마, 오디오, 입력, 접근성           |
| 3     | `FLOW-P0-03 New Game Start`               | 새 게임 선택, 저장 슬롯, 덮어쓰기 확인       |
| 4     | `FLOW-P0-04 Load And Continue`            | 이어하기/불러오기/손상 저장 처리            |
| 5     | `FLOW-P0-05 Opening Sequence`             | 첫 근무 시작, 컷신/조작 가능 구간, 스킵/일시정지 |
| 6     | `FLOW-P0-06 Runtime Controls`             | 이동, 시야, 상호작용, 도구, 기록, 일시정지    |
| 7     | `FLOW-P0-07 Office Hub Flow`              | 관리실에서 보드/도구함/보고 위치 이해         |
| 8     | `FLOW-P0-08 Complaint Board Flow`         | 민원 접수 화면과 선택 결과               |
| 9     | `FLOW-P0-09 Tool Preparation Flow`        | 도구 선택, 잘못된 도구, 되돌아가기          |
| 10    | `FLOW-P0-10 Field Investigation Flow`     | 현장 이동, 단서 조사, HUD/프롬프트        |
| 11    | `FLOW-P0-11 Report Flow`                  | 보고 UI, 정상/이상 판정, 다음 상태        |
| 12    | `FLOW-P0-12 Pause During Play`            | 일시정지, 옵션, 나가기, 컷신 중 제한        |
| 13    | `FLOW-P0-13 Save And Checkpoint Rules`    | 자동 저장 시점, 종료 후 재시작 위치         |
| 14    | `FLOW-P0-14 Demo End Flow`                | P0 종료 화면, 메인 메뉴 복귀, 저장 여부     |

## First Implementation Focus

HTML 카드의 `DEV-P0-01 Shift Bootstrap`보다 더 플레이 플로우 관점에서 보면 첫 구현 묶음은 다음이다.

1. `FLOW-P0-01 Title And Main Menu`
2. `FLOW-P0-03 New Game Start`
3. `FLOW-P0-05 Opening Sequence`
4. `FLOW-P0-07 Office Hub Flow`

이 네 가지가 연결되어야 플레이어가 "게임을 켜서 근무를 시작했다"는 흐름을 이해할 수 있다.

## Validation State

- Markdown player-flow work cards: Complete
- C++/Blueprint implementation: Not started
- HTML conversion: Not started

## Update Log

- 2026-05-26: 플레이어/클라이언트 실행 관점의 P0 플로우 작업카드 문서 작성.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

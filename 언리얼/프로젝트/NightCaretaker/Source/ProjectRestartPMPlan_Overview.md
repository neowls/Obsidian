---
aliases:
  - "Project Restart PM Plan Overview"
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

# Project Restart PM Plan Overview

> [!summary] 문서 목적
> `ProjectRestartPMPlan`은 `2026-05-25` 기준으로 NightCaretaker 개발을 재개하기 위한 PM 운영 문서다. 목표는 기존 `P0RuntimeKickoff` 구현 순서를 팀 일정, 역할 분담, 주간 검증 게이트로 바꿔 **8주 안에 30-45분 P0 데모 수직 슬라이스**...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/ProjectRestartPMPlan_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Current Status | 주요 섹션 |
| PM Scope | 주요 섹션 |
| Milestone Schedule | 주요 섹션 |
| Workstream Priority | 주요 섹션 |
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

`ProjectRestartPMPlan`은 `2026-05-25` 기준으로 NightCaretaker 개발을 재개하기 위한 PM 운영 문서다. 목표는 기존 `P0RuntimeKickoff` 구현 순서를 팀 일정, 역할 분담, 주간 검증 게이트로 바꿔 **8주 안에 30-45분 P0 데모 수직 슬라이스**를 외부 테스트 가능한 상태까지 끌어올리는 것이다.

## Current Status

- 현재 브랜치는 `develop-0.1`이며 작업트리는 깨끗한 상태에서 계획을 시작했다.
- 최근 흐름은 3월 C++ 런타임/상호작용 기반, 4월 문서/아트 에셋/위젯 정리, 5월 HUD 텍스처 업데이트로 이어졌다.
- 코드 기반에는 RealityCam, 이동/스프린트, 물리 프랍, 물리 문, `UNCComplaintRuntimeSubsystem`, `UNCShiftStateComponent`, 기본 HUD framework가 있다.
- 콘텐츠 기반에는 `DevLevel`, `Level`, `Prop_Pallet`, 최소 Data Asset, 외부/임시 아트 에셋 묶음이 있다.
- 다음 실제 착수점은 `CARD-P0-001 Route Skeleton`이며, 첫 구현 티켓은 `VS-BLOCKOUT-01`이다.
- 가독성 높은 companion HTML은 `Document/NightCaretaker_ProjectRestart_PMPlan.html`에 둔다.
- 실제 개발 착수용 세부 카드는 `Document/Source/P0DevelopmentWorkCards_Overview.md`와 `Document/Source/P0DevelopmentWorkCards_Detail.md`를 따른다.

## PM Scope

- 첫 목표는 본편 제작이 아니라 30-45분 데모 수직 슬라이스다.
- 아트 담당자는 주 8-12시간, Unreal Editor 직접 작업 가능으로 계획한다.
- 사용자는 PM, 개발, 기획, FX, 사운드 placeholder, 통합 리뷰를 담당한다.
- 307호 내부, 전투, 적 AI 추격, 복잡한 저장/로드, 멀티 엔딩은 이번 P0 범위 밖이다.

## Milestone Schedule

| Week | Date | PM Focus | Dev Focus | Art Focus | Gate |
| --- | --- | --- | --- | --- | --- |
| 0 | `2026-05-25` - `2026-05-31` | 재개 준비, 범위 잠금 | 빌드/실행 확인, P0 map 결정 | 기존 자산 재사용 목록 정리 | P0 대상 map과 작업 board 확정 |
| 1-2 | `2026-06-01` - `2026-06-14` | route review | `VS-BLOCKOUT-01`, `VS-BLOCKOUT-02` | corridor, door, lighting fixture 1차 | 관리실에서 307호 앞까지 이동 |
| 3-4 | `2026-06-15` - `2026-06-28` | 첫 민원 루프 검증 | `VS-INTERACTION-01`, `VS-COMPLAINT-01`, `VS-UI-01` 시작 | office kit, 2F 기준점 | 민원 1건이 보고까지 닫힘 |
| 5-6 | `2026-06-29` - `2026-07-12` | 데모 chain lock | 10단계 route chain, 정전/지하/307 맛보기 | 3F, basement, 307 door front | 30-45분 end-to-end 진행 |
| 7 | `2026-07-13` - `2026-07-19` | demo lock | debug smoke loop, 최소 checkpoint | lighting/readability pass | 외부 테스트 후보 빌드 |
| 8 | `2026-07-20` - `2026-07-26` | 외부 테스트와 판정 | critical bug fix | polish only | 다음 단계 결정 |

## Workstream Priority

1. Route와 위치 판정을 먼저 잠근다.
2. 민원 보드, 도구, 보고 위치를 5분 안에 이해되게 만든다.
3. 첫 민원 1건을 `Accepted -> Investigating -> AwaitingReport -> Closed`로 닫는다.
4. UI는 mock data가 아니라 `UNCComplaintRuntimeSubsystem` 상태를 표시한다.
5. 아트/조명/사운드는 route readability를 해치지 않는 선에서 붙인다.

## Risks

- 아트 시간이 주 8-12시간이므로, 개발자는 blockout과 integration을 먼저 진행하고 아트는 반복 재사용 가능한 kit부터 맡긴다.
- UI를 먼저 크게 만들면 실제 민원 runtime과 어긋날 수 있으므로 첫 UI는 Board/Report/Notebook P0만 연결한다.
- route를 늘려 플레이타임을 확보하지 않는다. 밀도는 민원, 조명, 사운드, 기록 변화로 만든다.
- `NO_COOKING` 자산은 참조/임시 보관으로 보고, 생산 자산은 `Content/NightCaretaker` 아래에 정리한다.

## Validation State

- 현재 구현 검증은 아직 수행하지 않았다.
- 이 문서는 PM 계획 문서이며 C++, Blueprint, map, Data Asset은 수정하지 않는다.
- HTML companion은 `NightCaretaker_DocTheme.css`의 `doc-project-restart-pm` 스타일을 사용한다.
- 개발 작업카드 companion은 `Document/NightCaretaker_P0Development_WorkCards.html`에 둔다.
- 첫 실제 검증은 Week 0에서 Unreal Editor 실행, C++ build, `DevLevel` PIE smoke-test로 진행한다.

## Update Log

- 2026-05-25: Project restart PM plan created. P0 demo goal, role split, 8-week milestone schedule, workstream priorities, and validation gates recorded.
- 2026-05-25: Added readable HTML companion document with shared CSS styling and sectioned PM dashboard layout.
- 2026-05-25: Linked P0 development work cards as the concrete implementation handoff for the PM plan.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

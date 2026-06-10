---
aliases:
  - "Master Docs Operational Refresh - Overview"
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

# Master Docs Operational Refresh - Overview

> [!summary] 문서 목적
> `NightCaretaker_Planning_Master.md`의 실행 중심 스타일에 맞춰 `Development_Master`와 `Art_Master`를 실제 작업 기준서로 재작성한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/MasterDocsOperationalRefresh_Overview.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Goal | 주요 섹션 |
| Scope | 주요 섹션 |
| Current Status | 주요 섹션 |
| Completed Work | 주요 섹션 |
| Remaining Work | 주요 섹션 |
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

`NightCaretaker_Planning_Master.md`의 실행 중심 스타일에 맞춰 `Development_Master`와 `Art_Master`를 실제 작업 기준서로 재작성한다.

## Scope

- `NightCaretaker_Development_Master.md`를 기능 개발 순서, 시스템 책임, P0 수직 슬라이스 구현 단계, 검증 기준 중심으로 재작성한다.
- `NightCaretaker_Art_Master.md`를 비주얼 기준, 레퍼런스 학습 방식, P0 산출물, 제작 순서, 리뷰 기준 중심으로 재작성한다.
- 기존 장문 마스터 문서는 Archive에 백업한다.
- README와 companion 인덱스는 새 구조에 맞게 필요한 만큼 갱신한다.

## Current Status

- Status: Complete
- Development Master rewrite: Complete
- Art Master rewrite: Complete
- README update: Complete

## Completed Work

- 현재 `Source` C++ 구조를 확인했다.
- 현재 `Content/NightCaretaker` 자산 폴더와 주요 uasset 목록을 확인했다.
- 현재 `DefaultGameplayTags.ini`의 complaint/anomaly/evidence/progression 태그 구성을 확인했다.
- 기존 Development/Art Master를 Archive에 백업했다.
- `NightCaretaker_Development_Master.md`를 P0 기능 개발 순서와 구현 기준 중심으로 재작성했다.
- `NightCaretaker_Art_Master.md`를 레퍼런스, 목업, P0 에셋, 제작 순서 중심으로 재작성했다.
- Development/Art Master HTML companion view를 추가했다.
- README와 Archive companion 인덱스를 갱신했다.

## Remaining Work

- 구현/아트 작업이 진행되면 마스터 문서와 HTML companion view를 함께 갱신해야 한다.

## Risks

- 문서를 압축하면 기존 상세 설명 일부가 최상위에서 사라진다. 대신 백업과 Archive 원본으로 추적 가능하게 한다.
- 개발 문서가 실제 코드 상태와 어긋나면 구현 우선순위가 흐려질 수 있으므로 현재 클래스/API 기준으로 작성한다.
- 아트 문서가 추상 무드에 머물면 작업자가 무엇부터 만들지 알 수 없으므로 P0 산출물과 리뷰 기준을 명확히 둔다.

## Validation State

- Development Master backup: Complete
- Art Master backup: Complete
- Master rewrites: Complete
- Link review: Complete
- HTML companion views: Complete

## Update Log

- 2026-05-26: 작업 문서 생성. 개발/아트 마스터를 Planning Master 스타일의 실무 기준서로 재작성하는 범위 확정.
- 2026-05-26: 기존 Development/Art Master를 Archive에 백업했다.
- 2026-05-26: Development/Art Master 재작성과 HTML companion view 생성을 완료했다.
- 2026-05-26: README, companion 인덱스, HTML/CSS 연결을 검증했다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

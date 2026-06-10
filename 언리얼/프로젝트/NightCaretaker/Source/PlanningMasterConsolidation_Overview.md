---
aliases:
  - "Planning Master Consolidation - Overview"
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

# Planning Master Consolidation - Overview

> [!summary] 문서 목적
> `Document` 최상위 문서 수를 줄이고, `NightCaretaker_Planning_Master.md`를 실제 기획 결정과 제작 기준 중심의 활성 문서로 재작성한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/PlanningMasterConsolidation_Overview.md` |
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

`Document` 최상위 문서 수를 줄이고, `NightCaretaker_Planning_Master.md`를 실제 기획 결정과 제작 기준 중심의 활성 문서로 재작성한다.

## Scope

- `NightCaretaker_Planning_Master.md`를 짧고 명료한 GDD/제품 기준서로 재작성한다.
- 최상위 companion Markdown/HTML/CSS 문서는 삭제하지 않고 `Document/Archive/Companion` 아래로 이동한다.
- `Document/README.md`를 새 문서 구조에 맞게 갱신한다.
- 개발/아트 마스터의 대규모 재작성은 이번 범위에서 제외한다.

## Current Status

- Status: Complete
- Planning rewrite: Complete
- Companion archive: Complete
- README update: Complete

## Completed Work

- 기존 `Document` 최상위 파일 24개를 확인했다.
- 기존 `Planning_Master`가 상세 문서 병합본 성격으로 2,600라인 이상인 것을 확인했다.
- 보조 문서가 Master를 대체하지 않는 companion 문서임을 README에서 확인했다.
- 기존 `NightCaretaker_Planning_Master.md`를 `Document/Archive/Planning/NightCaretaker_Planning_Master_PreConsolidation_20260526.md`로 백업했다.
- `NightCaretaker_Planning_Master.md`를 활성 기획 기준서 구조로 재작성했다.
- 최상위 companion 문서/HTML/CSS 20개를 `Document/Archive/Companion`으로 이동했다.
- `Document/README.md`, `Document/Archive/README.md`, `Document/Archive/Companion/README.md`를 새 구조에 맞게 갱신했다.
- `Planning_Master`를 읽기 위한 HTML/CSS companion view를 추가했다.

## Remaining Work

- Development Master와 Art Master 압축은 별도 작업으로 진행할 수 있다.
- HTML 뷰어를 계속 유지하려면 Planning Master 변경 시 같이 갱신해야 한다.

## Risks

- Planning Master를 압축하면 일부 세부 문장이 최상위에서 사라진다. 대신 원본과 companion 문서를 Archive에 남겨 추적 가능하게 한다.
- Development/Art Master는 아직 장문 구조이므로, 추후 별도 패스로 같은 방식의 압축이 필요할 수 있다.

## Validation State

- Document file count: Complete
- Archive move verification: Complete
- README link review: Complete
- HTML/CSS companion view: Complete

## Update Log

- 2026-05-26: 작업 문서 생성. Planning Master 재작성과 Document companion 정리를 같은 작업 범위로 확정했다.
- 2026-05-26: Planning Master 재작성 완료. 긴 병합본 대신 제품 기준, 플레이 루프, 민원 모델, 307 단계, 수직 슬라이스 기준 중심으로 정리했다.
- 2026-05-26: 최상위 companion 문서 20개를 Archive로 이동하고 README 구조를 갱신했다.
- 2026-05-26: 최상위 `Document` 파일 수가 24개에서 4개로 줄어든 것을 확인했다.
- 2026-05-26: `Archive/Companion`에 Planning Master HTML/CSS 보기용 문서를 추가했다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

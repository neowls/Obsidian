---
aliases:
  - "Game Design Documentation Research - Overview"
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

# Game Design Documentation Research - Overview

> [!summary] 문서 목적
> `NightCaretaker` 기획 문서를 다시 쓰기 전에, 실제 게임 기획 문서가 반드시 결정해야 하는 내용과 문서 품질 기준을 정리한다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/GameDesignDocumentationResearch_Overview.md` |
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
| Key Findings | 주요 섹션 |
| Recommended Next Use | 주요 섹션 |
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

`NightCaretaker` 기획 문서를 다시 쓰기 전에, 실제 게임 기획 문서가 반드시 결정해야 하는 내용과 문서 품질 기준을 정리한다.

## Scope

- 게임 디자인 방법론, GDD 운영 방식, 플레이테스트 기반 검증, 심리 공포 장르 적용 기준을 조사한다.
- 조사 결과를 향후 기획 문서 작성/검토에 바로 쓸 수 있는 체크리스트와 템플릿으로 정리한다.
- 기존 `Document` 문서를 직접 재작성하지 않는다. 이번 산출물은 재작성 기준서다.

## Current Status

- Status: Complete
- Workspace: `Document/Source`
- Detail document: `Document/Source/GameDesignDocumentationResearch_Detail.md`

## Completed Work

- 기존 `Document` 구조와 `NightCaretaker_Planning_Master.md`의 큰 목차를 확인했다.
- 공개 자료, 업계 글, GDC 세션, 논문/학술 자료를 조사했다.
- 공통적으로 반복되는 게임 기획 문서 요건을 `NightCaretaker` 재작성 기준으로 변환했다.
- 향후 기획 문서 작성에 사용할 품질 기준, 섹션 템플릿, 검토 체크리스트를 정리했다.

## Remaining Work

- 기존 `NightCaretaker_Planning_Master.md` 재작성은 별도 작업으로 진행해야 한다.
- 재작성 시 이 문서의 체크리스트를 기준으로 기존 섹션을 유지, 삭제, 병합, 재작성한다.

## Key Findings

1. GDD는 백과사전이 아니라 결정 도구다.
2. 좋은 기획 문서는 플레이어 경험, 플레이어 행동, 시스템 반응, 검증 방법을 함께 적는다.
3. 거대한 단일 문서보다 짧은 기준서와 주제별 상세 문서가 유지보수에 유리하다.
4. 심리 공포 기획은 "무섭다"가 아니라 불확실성, 제한된 주체성, 반복 루프의 붕괴를 설계해야 한다.
5. 문서 품질은 문장량이 아니라 구현자와 플레이테스트가 바로 사용할 수 있는 결정 밀도로 판단해야 한다.

## Recommended Next Use

`NightCaretaker` 기획 문서를 다시 쓸 때는 바로 장문 GDD를 쓰지 말고, 다음 순서로 진행한다.

1. 한 페이지짜리 제품 기준서를 먼저 쓴다.
2. 핵심 플레이 루프와 플레이어 동사를 확정한다.
3. 민원/이상 현상 시스템을 데이터 구조와 판정 규칙으로 분해한다.
4. 수직 슬라이스 합격 기준을 만든다.
5. 플레이테스트 결과가 나온 뒤 세부 콘텐츠 목록을 확장한다.

## Risks

- 웹 자료는 작성 시점과 맥락이 다르므로, 단일 템플릿을 절대 규칙으로 삼으면 문서가 다시 장황해질 수 있다.
- `NightCaretaker`의 실제 플레이 콘셉트가 불명확한 상태에서 세부 시스템을 먼저 쓰면 문서가 다시 추상 문장으로 채워질 수 있다.
- 연구/업계 자료의 언어를 그대로 옮기면 프로젝트 현실과 맞지 않을 수 있으므로, 반드시 UE 구현 범위와 1인/소규모 제작 범위로 다시 줄여야 한다.

## Validation State

- 문서 저장 검증: Complete
- 링크/출처 정리: Complete
- 기존 문서 직접 수정: Not started

## Update Log

- 2026-05-26: 작업 문서 생성. 기존 문서 재작성 전 기준 정립 작업으로 범위를 확정했다.
- 2026-05-26: 게임 디자인 방법론, GDD 운영, 문서 작성법, 심리 공포 설계 자료를 취합해 재사용 가능한 기준서로 정리했다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

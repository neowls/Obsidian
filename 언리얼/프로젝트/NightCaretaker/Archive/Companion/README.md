---
aliases:
  - "Companion Archive"
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

# Companion Archive

> [!summary] 문서 목적
> 이 폴더는 `Document` 최상위에 있던 보조 Markdown/HTML/CSS 문서를 보관한다.

## 핵심 결론

- 이 문서는 보조 시각화 또는 세부 자료이며, 활성 기준은 루트 Master 문서를 우선한다.
- 다이어그램, 매트릭스, 와이어프레임은 현재 판단의 근거로 사용할 수 있지만 그대로 구현 기준이 되지는 않는다.
- 필요 시 본문의 항목을 Planning/Development/Art Master로 승격한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 보조 시각화/동반 자료 |
| 파일 경로 | `Archive/Companion/README.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 목적 | 주요 섹션 |
| 구성 | 주요 섹션 |
| 사용 원칙 | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 목적

이 폴더는 `Document` 최상위에 있던 보조 Markdown/HTML/CSS 문서를 보관한다.
현재 제작 판단의 기준은 최상위 Master 문서이며, 이 폴더의 자료는 특정 주제를 더 자세히 추적할 때만 사용한다.

## 구성

| 분류 | 파일 |
| --- | --- |
| 마스터 문서 뷰 | `NightCaretaker_Planning_Master_View.html`, `NightCaretaker_Development_Master_View.html`, `NightCaretaker_Art_Master_View.html`, `NightCaretaker_Planning_Master_View.css` |
| 게임 플로우 | `NightCaretaker_GameFlow_Diagrams.md`, `NightCaretaker_GameFlow_Visual.html` |
| UI/UX | `NightCaretaker_UIUX_Detail.md`, `NightCaretaker_UIUX_Diagrams.md`, `NightCaretaker_UIUX_Wireframes.html` |
| 사운드 | `NightCaretaker_Sound_Detail.md`, `NightCaretaker_Sound_Diagrams.md`, `NightCaretaker_Sound_Matrix.html` |
| 민원/이상 현상 | `NightCaretaker_ComplaintAnomaly_Detail.md`, `NightCaretaker_ComplaintAnomaly_Diagrams.md`, `NightCaretaker_ComplaintAnomaly_Matrix.html` |
| 레벨/공간 | `NightCaretaker_LevelSpace_Detail.md`, `NightCaretaker_LevelSpace_Diagrams.md`, `NightCaretaker_LevelSpace_Matrix.html` |
| 수직 슬라이스 | `NightCaretaker_VerticalSlice_Detail.md`, `NightCaretaker_VerticalSlice_Diagrams.md`, `NightCaretaker_VerticalSlice_Checklist.html` |
| PM/작업 보드 | `NightCaretaker_ProjectRestart_PMPlan.html`, `NightCaretaker_P0Development_WorkCards.html` |
| HTML 테마 | `NightCaretaker_DocTheme.css` |

## 사용 원칙

- Master 문서와 충돌하면 Master 문서를 우선한다.
- 기존 HTML 보드/매트릭스는 `NightCaretaker_DocTheme.css`를 사용한다.
- 마스터 문서 뷰 3종은 `NightCaretaker_Planning_Master_View.css`를 사용한다.
- 여기 있는 내용을 현재 기준으로 되살릴 때는 관련 Master 문서에 요약한 뒤, 원문 링크를 남긴다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

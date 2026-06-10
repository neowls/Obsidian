---
aliases:
  - "Visualization Template Cleanup Detail"
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

# Visualization Template Cleanup Detail

> [!summary] 문서 목적
> The HTML companion documents should read as one documentation family: dark background, low-saturation panels, restrained amber/teal/rust/olive accents, and consistent car...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/VisualizationTemplateCleanup_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Design Intent | 주요 섹션 |
| File Ownership | 주요 섹션 |
| Template Contract | 주요 섹션 |
| Shared Theme Responsibilities | 주요 섹션 |
| Data Preservation Rules | 주요 섹션 |
| Validation Plan | 주요 섹션 |
| Validation Results | 주요 섹션 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Design Intent

The HTML companion documents should read as one documentation family: dark background, low-saturation panels, restrained amber/teal/rust/olive accents, and consistent card/table/code/nav treatment. The cleanup keeps each file's content as authored and moves presentation into a single shared CSS file.

## File Ownership

| File | Responsibility |
| --- | --- |
| `Document/NightCaretaker_DocTheme.css` | Shared static HTML documentation theme. |
| `Document/NightCaretaker_GameFlow_Visual.html` | Game flow timeline, loop, state, failure, demo route companion. |
| `Document/NightCaretaker_UIUX_Wireframes.html` | UI/UX wireframe companion with mock HUD, board, report, notebook, and settings frames. |
| `Document/NightCaretaker_Sound_Matrix.html` | Sound matrix companion. |
| `Document/NightCaretaker_ComplaintAnomaly_Matrix.html` | Complaint/anomaly matrix companion. |
| `Document/NightCaretaker_LevelSpace_Matrix.html` | Level/space matrix companion. |
| `Document/NightCaretaker_VerticalSlice_Checklist.html` | Vertical slice route and ticket checklist companion. |
| `Document/README.md` | Documentation hub and policy note. |

## Template Contract

Every target HTML file should include:

```html
<meta name="nightcaretaker-doc-template" content="dark-low-saturation-v1">
<link rel="stylesheet" href="./NightCaretaker_DocTheme.css">
```

Each document may also set a body class for document-specific refinements, for example `doc-game-flow` or `doc-uiux-wireframes`. These classes are presentation hooks only and must not change content semantics.

## Shared Theme Responsibilities

- Define the base palette using `#111214`, `#1a1d21`, `#22272d`, `#3a4048`, `#ebe5d9`, and `#aaa195`.
- Limit accents to muted amber, teal, rust, and olive families.
- Provide common styling for `header`, `main`, `nav`, `.wrap`, `.tags`, `.tag`, `.grid`, `.card`, `.table-wrap`, `table`, `code`, and `footer`.
- Provide specialized support for:
  - Game flow timeline and route cards.
  - UI/UX wireframe frames and mock controls.
  - Matrix table readability and horizontal overflow.
  - Vertical slice checklist cards and status labels.

## Data Preservation Rules

- Do not change table rows, cell text, card text, section ids, or nav link targets.
- Do not remove existing static document relationships.
- Do not introduce external web dependencies.
- Keep the HTML files openable from disk with the CSS file in the same folder.

## Validation Plan

- Confirm each HTML references `NightCaretaker_DocTheme.css`.
- Confirm no target HTML contains an inline `<style>` block.
- Confirm old bright palette values are removed from the target HTML.
- Confirm key headings, section ids, and table/card structures remain present.
- Run trailing whitespace checks for edited HTML/CSS/Source docs.
- Run `git diff --check`.

## Validation Results

- Stylesheet reference: passed for all six target HTML files.
- Template meta: passed for all six target HTML files.
- Inline `<style>` blocks: none found in target HTML files.
- Old bright palette values: none found in target HTML files or `NightCaretaker_DocTheme.css`.
- Structure spot check: major headings, section ids, tables, cards, and article blocks remain present.
- Trailing whitespace: none found in edited HTML/CSS/Source files.
- `git diff --check`: passed with line-ending warnings only for pre-existing modified documents.

## Update Log

- 2026-04-26: Initial detail document created before implementation. Baseline inspection found six target HTML files and an existing README note that already references a dark common CSS direction at a high level.
- 2026-04-26: Added `NightCaretaker_DocTheme.css` with common base, card, table, code, footer, game-flow, UI/UX wireframe, matrix, and checklist styles.
- 2026-04-26: Converted all six target HTML files from inline style blocks to the shared `NightCaretaker_DocTheme.css` link and added `dark-low-saturation-v1` template metadata.
- 2026-04-26: Added body classes: `doc-game-flow`, `doc-uiux-wireframes`, `doc-sound-matrix`, `doc-complaint-anomaly-matrix`, `doc-level-space-matrix`, and `doc-vertical-slice-checklist`.
- 2026-04-26: Completed validation and removed a leftover non-policy accent color from the shared CSS so accents stay within amber, teal, rust, and olive families.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

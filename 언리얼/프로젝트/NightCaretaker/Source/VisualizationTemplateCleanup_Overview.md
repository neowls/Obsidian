---
aliases:
  - "Visualization Template Cleanup Overview"
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

# Visualization Template Cleanup Overview

> [!summary] 문서 목적
> Unify the six HTML companion visualization documents under one shared dark, low-saturation template without changing their document data, section ids, or link structure.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/VisualizationTemplateCleanup_Overview.md` |
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
| Blockers | 주요 섹션 |
| Risks | 주요 섹션 |
| Validation State | 주요 섹션 |
| Latest Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Goal

Unify the six HTML companion visualization documents under one shared dark, low-saturation template without changing their document data, section ids, or link structure.

## Scope

- Add `Document/NightCaretaker_DocTheme.css` as the shared HTML documentation theme.
- Replace duplicated inline `<style>` blocks in the six companion HTML files with a shared stylesheet reference.
- Keep the documents directly openable as static files from the `Document` folder.
- Update `Document/README.md` with the shared CSS and template policy.

## Current Status

Complete.

## Completed Work

- Confirmed the target HTML files and existing README state.
- Confirmed there are pre-existing modified and untracked documentation files in the worktree.
- Established that this pass is documentation/HTML/CSS only.
- Added `Document/NightCaretaker_DocTheme.css`.
- Updated the six companion HTML files to reference the shared CSS and template meta tag.
- Added document-specific body classes for scoped presentation hooks.
- Updated `Document/README.md` with the shared CSS link and HTML template policy.

## Remaining Work

- None for this cleanup pass.

## Blockers

- None.

## Risks

- The Game Flow document currently uses an older bright palette and more unique layout classes, so the shared CSS must preserve its timeline readability.
- UI/UX wireframe elements use more specialized mock UI classes, so the shared theme must include those controls explicitly.
- Existing untracked companion documents are assumed to be intentional and must not be removed or reverted.

## Validation State

Passed.

- Confirmed all six HTML files reference `NightCaretaker_DocTheme.css` and the `dark-low-saturation-v1` template meta tag.
- Confirmed no target HTML file contains an inline `<style>` block.
- Confirmed old bright palette values `#f2f4f5`, `#ffffff`, `#eef1f0`, and `#f8f6ef` are absent from the shared CSS and target HTML files.
- Confirmed major headings, section ids, tables, cards, and article structures remain present after the head/style cleanup.
- Confirmed no trailing whitespace in edited HTML/CSS/Source docs.
- `git diff --check` passed. Git reported line-ending warnings for pre-existing modified master documents and `Document/README.md`, but no whitespace errors.

## Latest Update Log

- 2026-04-26: Started cleanup pass. Inspected target HTML/README files and created task-level tracking documents.
- 2026-04-26: Added shared CSS, converted six HTML files to the common template reference, and documented the README policy. Validation is now in progress.
- 2026-04-26: Completed validation. No inline style blocks, old bright palette values, trailing whitespace, or diff-check whitespace errors remain in the edited files.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

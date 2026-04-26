# Visualization Template Cleanup Detail

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

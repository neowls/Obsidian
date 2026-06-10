# AGENTS.md - Obsidian Vault Writing Rules

## Scope

These instructions apply to work in this Obsidian vault rooted at `C:\Users\DAMO\Documents\Obsidian`.

Use this file as the default operational rule set for Markdown document creation, document cleanup, note restructuring, template writing, HTML document creation, and Obsidian-oriented HTML/CSS examples in this vault.

More specific `AGENTS.md` files in subfolders may add narrower rules. When both apply, follow the user's explicit request first, then the nearest applicable `AGENTS.md`, then this root file.

## Required References

Before creating, rewriting, or substantially reorganizing Obsidian Markdown documents, read:

- `Obsidian 문서 가독성 기준.md`

Treat `Obsidian 문서 가독성 기준.md` as the source of truth for:

- Obsidian Markdown readability
- dark-theme-friendly writing
- headings, paragraphs, lists, tables, links, tags, callouts, and Properties
- Templates, Daily notes, Bases, Canvas, Backlinks, and Outgoing links usage
- HTML and CSS snippet guidance for Obsidian
- document review checklist

Before creating, rewriting, or substantially reorganizing standalone HTML/CSS documents, game/development/planning HTML pages, visual documentation pages, or CSS examples, read:

- `HTML CSS 문서 제작 및 활용 기준.md`

Treat `HTML CSS 문서 제작 및 활용 기준.md` as the source of truth for:

- semantic HTML document structure
- CSS layout, tokens, cascade layers, selectors, and component patterns
- game-oriented UI patterns such as HUDs, inventories, skill trees, timelines, flowcharts, dashboards, and design matrices
- creative CSS techniques such as gradients, clipping, masking, blend modes, glass panels, glow, cyberpunk/HUD panels, transitions, and scroll-driven effects
- accessibility, responsive behavior, dark theme readability, print/PDF handling, browser support, and fallback rules

If a required reference document is missing or unreadable, mention that in the final response and proceed with best effort using this file.

## Working Defaults

- Preserve the user's original meaning, terminology, and folder context.
- Prefer readable structure over decorative formatting.
- For new notes, default to: summary, key conclusions, details, examples, references.
- Use Obsidian features only when they improve navigation, reuse, or readability.
- Use callouts for semantic emphasis such as summary, warning, tip, example, and note. Do not use callouts as decoration.
- Keep paragraphs short enough to scan.
- Use tables for comparisons, option lists, property lists, and checklists.
- Use code fences with language identifiers for Markdown, CSS, HTML, code, or command examples.
- Avoid adding inline HTML styles. Prefer Markdown structure, `cssclasses`, or CSS snippet examples.
- Do not modify `.obsidian`, theme files, existing snippets, or workspace settings unless the user explicitly asks.

## HTML/CSS Document Defaults

- Start with semantic HTML and document structure before visual styling.
- Prefer CSS custom properties, cascade layers, reusable component classes, and explicit layout patterns over one-off styling.
- For game/development/planning documents, consider functional visual patterns before decorative cards: HUD panels, status strips, matrices, timelines, flowcharts, skill trees, inventories, dashboards, and debug checklists.
- Use creative CSS only when it improves information hierarchy, state recognition, immersion, or navigation.
- Include responsive behavior, keyboard focus states, reduced-motion handling, and fallback for newer CSS features when relevant.
- For career, resume, portfolio, or printable technical documents, include print/PDF-friendly CSS when the output is intended to be shared or printed.

## Dark Theme Bias

The vault uses a dark Minimal-oriented setup. When writing or proposing styles:

- Avoid pure black backgrounds and pure white body text as defaults.
- Avoid excessive saturated accent colors.
- Avoid long bold, italic, or highlighted passages.
- Prefer high enough contrast, comfortable line height, and clear section hierarchy.
- Check that examples remain readable in a dark theme.

## Response Expectations

When finishing a document-writing task:

- State which file was created or modified.
- Mention whether `Obsidian 문서 가독성 기준.md` was applied.
- Mention whether `HTML CSS 문서 제작 및 활용 기준.md` was applied for HTML/CSS work.
- Call out any intentionally skipped changes, such as not editing CSS snippets or not touching `.obsidian` settings.

# AGENTS.md - Obsidian Vault Writing Rules

## Scope

These instructions apply to the Obsidian vault rooted at `C:\Users\DAMO\Documents\Obsidian`.

Use this file as the default operational rule set for:

- Markdown document creation, cleanup, restructuring, and template writing
- Technical explanation notes, especially programming, Unreal Engine, game development, and tool documentation
- Standalone HTML/CSS documentation pages
- Obsidian-oriented HTML/CSS examples

More specific `AGENTS.md` files in subfolders may add narrower rules. Follow this priority:

1. User's explicit request
2. Nearest applicable `AGENTS.md`
3. This root `AGENTS.md`
4. General Markdown, HTML, CSS, and documentation conventions

## Required References

Before creating, rewriting, or substantially reorganizing Obsidian Markdown documents, read:

- `Obsidian 문서 가독성 기준.md`

Treat it as the source of truth for:

- technical note structure
- Obsidian Markdown readability
- headings, paragraphs, lists, tables, links, tags, Properties, and callouts
- templates, index notes, concept notes, troubleshooting notes, and review checklists
- dark-theme-friendly writing

Before creating, rewriting, or substantially reorganizing standalone HTML/CSS documents, visual documentation pages, game/development/planning HTML pages, or CSS examples, read:

- `HTML CSS 문서 제작 및 활용 기준.md`

Treat it as the source of truth for:

- semantic HTML document structure
- CSS tokens, layout, typography, accessibility, responsive behavior, and print rules
- technical-document UI patterns such as summaries, TOCs, flow diagrams, state panels, comparison tables, debug checklists, and code examples
- game/development documentation patterns such as HUD panels, timelines, matrices, skill trees, inventories, dashboards, and interactive learning blocks

If a required reference document is missing or unreadable, mention that in the final response and proceed with best effort using this file.

## Core Writing Model

For technical information notes, prefer this reader-first structure:

```md
# Topic

> [!summary]
> One-sentence definition.
> When to use it.
> The 2-3 conclusions a future reader must remember.

## Why It Matters

## Mental Model

## Key Parts

## Execution Flow

## Minimal Example

## Common Confusions

## Debugging Checklist

## Related Notes
```

The goal is not to store everything. The goal is to reduce the cost of re-understanding the topic later.

For most learning notes, the first screen should answer:

- What is this?
- When do I use it?
- What should I remember?
- What should I inspect first when it breaks?

## Working Defaults

- Preserve the user's original meaning, terminology, and folder context.
- Prefer readable structure over decorative formatting.
- Keep paragraphs short enough to scan.
- Use headings to expose the document's shape.
- Use tables for comparisons, option lists, property lists, state matrices, and checklists.
- Use numbered lists for procedures and execution order.
- Use callouts only for semantic emphasis: summary, warning, tip, example, note.
- Use code fences with language identifiers.
- Prefer practical examples over abstract description when teaching technical behavior.
- Separate explanation, how-to, reference, and troubleshooting content when a note becomes too large.
- Avoid adding inline HTML styles. Prefer Markdown structure, `cssclasses`, or CSS snippet examples.
- Do not modify `.obsidian`, theme files, existing snippets, workspace settings, generated standalone copies, or unrelated notes unless the user explicitly asks.

## Markdown Defaults

For Obsidian Markdown work:

- Use `#` once per document.
- Use `##` and `###` for the main reading structure.
- Avoid deep heading levels; split the note when `####` becomes common.
- Put a summary callout near the top for technical notes.
- Keep tables compact. Move long explanations below the table.
- Use internal links only when they improve navigation or future retrieval.
- Keep tags narrow and useful for search/filtering.
- Use Properties for short structured metadata, not prose.

## HTML/CSS Defaults

For standalone HTML/CSS documents:

- Start with semantic HTML before visual styling.
- Use `main`, `article`, `section`, `aside`, `nav`, `header`, `footer`, `figure`, and `details` according to meaning.
- Keep heading order logical and do not skip levels for appearance.
- Use CSS custom properties for color, spacing, typography, radius, shadows, and motion.
- Prefer readable width, stable layout, accessible contrast, visible focus states, responsive behavior, and reduced-motion support.
- For game/development documents, visualize state, flow, ownership, timing, selection, score, or debugging behavior before adding decoration.
- Include print/PDF CSS for career, resume, portfolio, and shareable technical documents when relevant.

## Dark Theme Bias

The vault uses a dark Minimal-oriented setup. When writing or proposing styles:

- Avoid pure black backgrounds and pure white body text as defaults.
- Avoid excessive saturated accent colors.
- Avoid long bold, italic, or highlighted passages.
- Prefer comfortable line height and clear section hierarchy.
- Check that examples remain readable in a dark theme.

## Response Expectations

When finishing a document-writing task:

- State which files were created or modified.
- Mention whether `Obsidian 문서 가독성 기준.md` was applied.
- Mention whether `HTML CSS 문서 제작 및 활용 기준.md` was applied for HTML/CSS work.
- State any intentionally skipped changes, such as not editing CSS snippets, `.obsidian` settings, generated standalone copies, or unrelated subfolder rules.
- If validation was run, summarize it. If validation was not possible, say so briefly.

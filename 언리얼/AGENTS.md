# AGENTS.md - Unreal Learning Material Rules

## Scope

These instructions apply when working on Unreal learning materials under `학습/**`, especially Markdown source notes and HTML/CSS interactive learning pages.

If the task is about Unreal project source code, builds, gameplay implementation, or non-learning documentation outside `학습/**`, do not force this learning-material template unless the user explicitly asks for it.

Codex-style agents normally read applicable `AGENTS.md` files automatically when working in this tree. Keep this file self-contained so future tasks do not require the user to repeat these preferences.

## Repository Survey Snapshot

The learning folder currently contains these major groups:

- `학습/**/*.md`: Obsidian source notes. Surveyed count: 53 Markdown files.
- `학습/HTML/**`: converted HTML learning pages. Surveyed count: 97 HTML files including standalone copies.
- `학습/HTML/styles.css`: shared visual system for the main HTML set.
- `학습/HTML/interactive-enhancements.js`: shared enhancement script for interactive labs.
- `학습/HTML/Standalone_HTML_CSS_Included/**`: offline/self-contained HTML copies. Treat these as distribution copies, not the primary source, unless the user asks to update standalone output.
- `학습/IMG/**`: image and GIF assets. Surveyed count: 81 PNG and 5 GIF files.

Main topic folders include:

- `게임 어빌리티 시스템(GAS)`
- `네비게이션(Navigation)`
- `네트워킹(Networking)`
- `물리(Physics)`
- `애니메이션(Animation)`
- `행동 트리(Behavior Tree)`
- `환경 쿼리 시스템(EQS)`
- `AI 지각(AI Perception)`
- root-level core topics such as Trace, Delegate, Dot/Cross, Asset Manager, Asset Registry, RPC, Replication, pointer/reference guides, and UE lifecycle.

Existing reference documents:

- `학습/언리얼 학습 문서 작성 양식.md`
- `학습/인터랙티브 시각화 학습자료 제작 가이드.md`

Use the rules in this `AGENTS.md` as the operational default. The two reference documents are supporting context.

## Required Workflow

For any new or modified learning material:

1. Inspect the relevant existing Markdown, HTML, `styles.css`, `interactive-enhancements.js`, and `index.html` entries before editing.
2. Identify whether the change belongs to source Markdown, HTML conversion, shared CSS/JS, index navigation, standalone copies, or image assets.
3. Preserve existing style and naming patterns.
4. Prefer improving the actual learning experience over adding decorative UI.
5. If a document has an HTML version, keep the source concept, title, and navigation coherent between Markdown and HTML.
6. If standalone copies or zip output are not updated, state that clearly in the final response.

## Markdown Template

New or cleaned Markdown learning notes should follow this structure unless the topic clearly requires a different order:

```md
[공식문서 제목 | Unreal Engine 문서](공식문서 URL)

# 개요
이 기능이 무엇인지, 언제 쓰는지, 무엇을 해결하는지 설명한다.

## 전제조건
- 필요한 플러그인
- 필요한 클래스/컴포넌트
- 필요한 에셋 또는 설정

# 핵심 개념
한글 설명을 우선하고 영어 원문 용어를 괄호로 병기한다.

## 주요 요소
| 이름 | 역할 | 주의점 |
| --- | --- | --- |
| 요소 | 설명 | 조건 |

# 동작 흐름
실행 순서, 엔진 내부 처리 순서, 데이터 흐름을 단계별로 정리한다.

# 사용 방법
에디터 경로, 코드 경로, 설정 순서를 구체적으로 쓴다.

# 주의사항
> [!caution]
> 오해하기 쉬운 조건, 성능 비용, 네트워크/권한/수명주기 제약을 적는다.

# 디버깅 체크리스트
- 무엇을 먼저 볼지
- 어떤 로그/뷰/디버거를 확인할지

# 엔진 소스 참고 포인트
- `Engine/Source/...`
- 이 파일을 보면 알 수 있는 것

# 요약
핵심만 짧게 정리한다.
```

Markdown rules:

- First substantial section should usually be `# 개요`.
- Use tables for options, type comparisons, property lists, network conditions, and class responsibilities.
- Use Obsidian callouts: `[!info]`, `[!tip]`, `[!caution]`, `[!example]`, `[!note]`.
- Use Obsidian image embeds as `![[...]]` for Markdown source notes.
- Avoid long unstructured paragraphs.
- Prefer practical Unreal context over abstract textbook explanation.

## HTML Learning Page Template

New or improved HTML pages should follow the established structure:

- `<!doctype html>` and `<html lang="ko">`
- `<meta charset="utf-8">`
- responsive viewport meta
- correct relative link to shared `styles.css`
- `topbar` with brand link
- `main.site-shell`
- `article.content`
- first major `section.panel` should contain a visual or interactive overview when useful
- `aside.toc` with anchors to major sections
- footer text: `원본 Markdown을 학습용 HTML로 재구성했습니다.`
- include `interactive-enhancements.js` when using `.interactive-lab`

When adding or moving HTML files:

- Update `학습/HTML/index.html` if the page should be discoverable.
- Keep category placement consistent: Core, Networking, AI, GAS, Animation, Behavior Tree, Navigation, Physics.
- Use correct relative paths for nested folders.
- Do not treat `Standalone_HTML_CSS_Included` as primary source. Update it only when the task explicitly includes offline copies or packaging.

## Interactive Visualization Requirement

Interactive visual examples are the default for HTML learning pages when the concept involves flow, state, direction, ownership, collision, timing, search, evaluation, or selection.

An interactive lab should normally include:

- Controls: buttons, segmented controls, sliders, toggles, or checkboxes.
- Scene: SVG or HTML/CSS world representation that changes immediately.
- State chips: concise status such as current target, execution site, hit order, selected branch, score, or condition result.
- Event log: one or more lines explaining why the current result happened.
- Accessible state: `aria-pressed`, `aria-live="polite"`, SVG `role="img"` plus `title`/`desc` or `aria-label`.

Use the shared pattern:

```html
<div class="interactive-lab topic-lab" data-topic-sim>
  <div class="lab-toolbar stacked-toolbar">...</div>
  <div class="sim-workbench">...</div>
  <div class="lab-state-row" aria-live="polite">...</div>
  <div class="event-log" data-topic-log>...</div>
</div>
```

## Topic-Specific Visualization Standards

Trace and collision:

- Show the trace source as a character, weapon, sensor, or emitter.
- Trace must visibly start at the actual source/muzzle, not an arbitrary old origin.
- Impact markers and effects belong on the surface ImpactPoint, not the object center.
- Show response differences: Overlap passes through, Block stops, Ignore/filter mismatch is dimmed or excluded.
- Show Single vs Multi return differences with hit order and result count.
- Avoid CSS `transform` animation on SVG groups that already use `transform="translate(...)"`; it can override the SVG position and move effects to the viewport corner. Use opacity/stroke animation, or nest a child group for scaling.

Dot and cross product:

- Pair mathematical vectors with game examples.
- Dot examples: field of view, front/side/back, backstab, target lock, aim assist.
- Cross examples: left/right turn direction, steering, rotation sign, area/orientation.
- A single angle slider should update both the vector diagram and game scenes when possible.

RPC and networking:

- Do not show only abstract cards when object scenes would be clearer.
- Use visible server, owning client, other client, owned pawn, world object, replicated actor, or packet concepts.
- Show caller, RPC type, actor ownership, execution target, failure reason, and packet/signal movement.
- Use red/danger styling for blocked calls and amber/orange for successful routes.

Replication:

- Show authority state, replicated property, condition filter, relevancy, dormancy, RepNotify, or Fast Array delta as a data-flow scene.
- Make owner-only, skip-owner, relevant client, and server-only behavior visually distinct.

GAS:

- Prefer pipeline scenes: input -> ASC -> spec/ability -> cost/cooldown -> gameplay effect -> attribute/cue.
- Show authority/prediction when relevant.
- Use actual gameplay concepts such as character, target, attribute bar, gameplay tag, effect stack, cooldown timer, and cue visual.

Animation:

- Show pose selection, motion matching candidates, motion warping target, montage/task timing, or linked graph routing as animated state.
- Use character silhouettes, pose cards, root motion paths, and target markers instead of generic boxes.

Behavior Tree / AI / EQS / Navigation:

- Show decision flow and world context together.
- Behavior Tree should show selector/sequence/task/decorator/service status.
- EQS should show candidate generation, tests, scores, and selected item.
- Navigation should show path, link, area cost, crowd/RVO avoidance, or filter result.
- AI Perception should show listener, stimulus, sense, memory age, and Blackboard update.

Physics:

- Show vectors, forces, impulses, collision normals, sweep, rotation, constraints, or movement response in a scene.

Asset systems and references:

- Show registry scan, asset id, soft reference, async load, bundle, primary/secondary asset relation, GC reachability, or pointer lifetime as data flow.

## Visual Design Rules

- Keep the dark orange Linux developer/terminal style.
- Avoid returning to green-dominant palettes unless the user explicitly requests it.
- Use restrained amber/orange accents for active paths and success.
- Use red/danger for blocked, failed, invalid, or risky conditions.
- Use dark brown/black surfaces for depth.
- Do not add decorative blobs, generic gradients, or unrelated illustration.
- Cards should be used for repeated items, metrics, panels, or tools, not nested decorative containers.
- Responsive layouts must collapse cleanly to one column on narrow screens.
- Text must not overlap or overflow buttons, cards, SVG labels, or scene elements.

## Implementation Rules

- Reuse `학습/HTML/styles.css` patterns before inventing new styles.
- Reuse `.interactive-lab`, `.lab-toolbar`, `.segmented-control`, `.mini-button`, `.primary-button`, `.metric-grid`, `.state-chip`, and `.event-log` where possible.
- Add shared CSS only when it benefits multiple pages or fits existing patterns.
- Keep per-page JavaScript small and local unless a behavior is clearly reusable.
- Use `querySelector`/`dataset` patterns consistent with existing interactive pages.
- Maintain `aria-pressed` on selectable buttons.
- Respect `prefers-reduced-motion`.
- Keep SVG viewBox coordinates coherent. If a visual point represents a real concept, make the coordinate match that concept.
- Avoid CSS transforms on SVG elements used for semantic positioning unless you are sure it will not override SVG transforms.

## Validation Checklist

Before finalizing learning-material changes:

- Confirm changed files are in the intended area.
- For HTML with inline scripts, run a syntax check equivalent to:

```powershell
node -e "const fs=require('fs'); const file='학습/HTML/FILE.html'; const html=fs.readFileSync(file,'utf8'); const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]); scripts.forEach((code,i)=>new Function(code)); console.log('ok')"
```

- For CSS edits, check basic brace balance or run an available formatter/linter if present.
- Search for broken relative script/style paths after moving or adding nested HTML files.
- Verify interactive controls update the scene, state chips, and log consistently.
- Check mobile breakpoints when changing grids or fixed-format scenes.
- If visual coordinates matter, verify source point, target point, hit point, and labels are semantically correct.
- If standalone copies or zip output are not regenerated, mention that in the final answer.

## Final Response Expectations

When reporting work on learning materials:

- Mention the changed files.
- Summarize the learning-experience improvement, not just code changes.
- State what validation was run.
- State any remaining limitation, especially if standalone copies or visual browser screenshots were not updated.


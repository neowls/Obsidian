# AGENTS.md - Unreal Learning Material Rules

## Scope

These instructions apply when working on Unreal learning materials under `학습/**`, especially Markdown source notes and HTML/CSS interactive learning pages.

If the task is about Unreal project source code, builds, gameplay implementation, or non-learning documentation outside `학습/**`, do not force this learning-material template unless the user explicitly asks for it.

Follow this priority:

1. User's explicit request
2. This `언리얼/AGENTS.md`
3. Root `AGENTS.md`
4. `학습/언리얼 학습 문서 작성 양식.md`
5. `학습/인터랙티브 시각화 학습자료 제작 가이드.md`

## Required Workflow

For any new or modified learning material:

1. Inspect the relevant existing Markdown, HTML, `styles.css`, `interactive-enhancements.js`, and `index.html` entries before editing.
2. Identify whether the change belongs to source Markdown, HTML conversion, shared CSS/JS, index navigation, standalone copies, or image assets.
3. Prefer improving the learning experience over adding decorative UI.
4. Keep Markdown source concepts, HTML titles, and navigation coherent when both versions exist.
5. Do not update `학습/HTML/Standalone_HTML_CSS_Included/**` unless the user explicitly asks for offline copies or packaging.
6. If standalone copies or zip output are not updated, state that clearly in the final response.

## Markdown Standard

All Unreal learning Markdown should use one document title and `##` section headings:

```md
---
type: unreal-learning
status: review
updated: 2026-06-10
tags:
  - unreal
  - unreal/topic
  - type/learning
---

# 문서 제목

> [!summary] 요약
> 이 기능이 무엇인지 한 문장으로 정의한다.
> 언제 쓰는지 적는다.
> 나중에 반드시 기억할 결론 2~3개를 적는다.

## 핵심 결론

- 가장 중요한 조건
- 실무에서 먼저 확인할 것
- 실패할 때 볼 지점

## 개요

## 작동 모델

## 주요 요소

| 요소 | 역할 | 주의점 |
| --- | --- | --- |

## 동작 흐름

1. 입력 또는 이벤트가 발생한다.
2. 엔진 시스템이 조건을 평가한다.
3. 상태나 데이터가 바뀐다.
4. 결과가 화면, 로그, 객체, 네트워크에 반영된다.

## 사용 방법

## 자주 헷갈리는 점

## 디버깅 체크리스트

- [ ] 필수 설정을 확인했다.
- [ ] 호출 시점과 실행 주체를 확인했다.
- [ ] 로그, 디버거, 에디터 시각화 도구로 상태를 확인했다.

## 엔진 소스 참고 포인트

## 관련 문서
```

### Markdown Rules

- `#` heading은 파일당 1개만 사용한다.
- 기존 `# 개요`, `# 핵심 개념`, `# 사용 방법`은 `##`로 내린다.
- 공식 문서 링크는 삭제하지 말고 `## 공식 문서` 또는 `## 관련 문서`에 보존한다.
- 한글 설명을 우선하고 영어 원문 용어는 괄호로 병기한다.
- 옵션, 타입, 조건, 클래스 책임은 표로 정리한다.
- 주의사항, 팁, 예외는 Obsidian callout으로 정리한다.
- 이미지가 필요하면 Markdown 원본에서는 `![[...]]` 형식의 Obsidian 임베드를 사용한다.
- 긴 문단은 짧은 문단, 목록, 표, 체크리스트로 나눈다.
- 짧거나 빈약한 문서는 추측으로 채우지 말고 `needs-content` 또는 `merge-candidate`로 진행 문서에 남긴다.

## HTML Learning Page Standard

HTML learning pages should follow the established site structure:

- `<!doctype html>` and `<html lang="ko">`
- responsive viewport meta
- correct relative link to shared `styles.css`
- `topbar` with brand link
- `main.site-shell`
- `article.content`
- `aside.toc` with anchors to major sections
- footer text: `원본 Markdown을 학습용 HTML로 재구성했습니다.`
- include `interactive-enhancements.js` when using `.interactive-lab`

When adding or moving HTML files:

- Update `학습/HTML/index.html` if the page should be discoverable.
- Keep category placement consistent: Core, Networking, AI, GAS, Animation, Behavior Tree, Navigation, Physics.
- Use correct relative paths for nested folders.
- Do not treat `Standalone_HTML_CSS_Included` as primary source.

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

## Topic Visualization Standards

- Trace and collision: show source, path shape, surface impact point, response differences, and Single/Multi result count.
- Dot and cross product: pair vector math with game examples such as FOV, back attack, turn direction, and steering.
- RPC and networking: show server, owning client, other client, actor ownership, packet route, execution target, and failure reason.
- Replication: show authority, property change, condition filter, relevancy, dormancy, RepNotify, or Fast Array delta.
- GAS: show input -> ASC -> ability spec -> cost/cooldown -> gameplay effect -> attribute/cue.
- Animation: show pose selection, motion matching candidates, motion warping target, montage timing, or linked graph routing.
- Behavior Tree / AI / EQS / Navigation: show decision flow and world context together.
- Physics: show vectors, forces, impulses, collision normals, sweep, rotation, constraints, or movement response.
- Asset systems and references: show registry scan, asset id, soft reference, async load, bundle, GC reachability, or pointer lifetime.

## Visual Design Rules

- Keep the dark orange Linux developer/terminal style.
- Use restrained amber/orange accents for active paths and success.
- Use red/danger for blocked, failed, invalid, or risky conditions.
- Avoid green-dominant palettes unless the user explicitly requests them.
- Do not add decorative blobs, generic gradients, or unrelated illustration.
- Cards should be used for repeated items, metrics, panels, or tools, not nested decorative containers.
- Responsive layouts must collapse cleanly to one column on narrow screens.
- Text must not overlap or overflow buttons, cards, SVG labels, or scene elements.

## Validation Checklist

Before finalizing learning-material changes:

- Confirm changed files are in the intended area.
- For Markdown, check code fence balance and one `#` title per file.
- For HTML with inline scripts, run a syntax check equivalent to:

```powershell
node -e "const fs=require('fs'); const file='학습/HTML/FILE.html'; const html=fs.readFileSync(file,'utf8'); const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]); scripts.forEach((code,i)=>new Function(code)); console.log('ok')"
```

- For CSS edits, check basic brace balance or run an available formatter/linter if present.
- Search for broken relative script/style paths after moving or adding nested HTML files.
- Verify interactive controls update the scene, state chips, and log consistently.
- If standalone copies or zip output are not regenerated, mention that in the final answer.

## Final Response Expectations

When reporting work on learning materials:

- Mention the changed files or changed file groups.
- Summarize the learning-experience improvement, not just mechanical edits.
- State what validation was run.
- State any remaining limitation, especially if standalone copies or visual browser screenshots were not updated.

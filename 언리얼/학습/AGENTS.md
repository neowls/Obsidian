# AGENTS.md - Unreal Learning Notes Rules

## Scope

These instructions apply to all learning materials under `언리얼/학습/**`.

Use this file for:

- Unreal Engine Markdown learning notes
- notes rewritten from official documentation, blogs, forums, talks, and source-code reading
- troubleshooting notes, reference notes, index notes, and source-capture notes
- HTML/CSS/JS learning pages that are derived from Markdown notes

Follow this priority:

1. User's explicit request
2. This `언리얼/학습/AGENTS.md`
3. `언리얼/AGENTS.md`
4. Root `AGENTS.md`
5. `언리얼/학습/언리얼 학습 문서 작성 양식.md`
6. `언리얼/학습/인터랙티브 시각화 학습자료 제작 가이드.md`

## Reference Documents

Before creating, rewriting, or substantially reorganizing Markdown learning notes, read:

- `C:\Users\DAMO\Documents\Obsidian\Obsidian 문서 가독성 기준.md`
- `언리얼/학습/언리얼 학습 문서 작성 양식.md`

Before creating or restructuring HTML/CSS learning pages, also read:

- `C:\Users\DAMO\Documents\Obsidian\HTML CSS 문서 제작 및 활용 기준.md`
- `언리얼/학습/인터랙티브 시각화 학습자료 제작 가이드.md`

Do not update `HTML/Standalone_HTML_CSS_Included/**`, generated zip files, exported copies, or unrelated image assets unless the user explicitly asks.

## Source Pattern References

The writing rules in this folder are influenced by well-structured Unreal learning sources. Use their structure, not their wording.

| Source type | Example | Pattern to learn |
| --- | --- | --- |
| Official docs | Epic Developer Community documentation | definition, scope, prerequisites, ordered implementation, options, code snippets |
| Expert tutorial | Tom Looman Unreal articles | target reader, practical context, class responsibility, access patterns, readable examples |
| Pitfall guide | WizardCell multiplayer articles | common mistake, why it fails, safer alternative, context-specific behavior |
| Deep index | Ikrima/Gamedev Guide | broad topic map, engine internals grouping, reference-style navigation |
| Community/forum | Unreal forums, community wiki | concrete symptom, environment, attempted fix, accepted workaround, version caveat |

External pages are not templates to copy. Extract reusable information architecture:

- who this is for
- what problem it solves
- which engine objects are involved
- what must be configured
- what happens at runtime
- what commonly goes wrong
- how to verify or debug it

## Source Trust Rules

Classify claims before turning them into notes.

| Tier | Source | Use as |
| --- | --- | --- |
| 1 | Epic official documentation, release notes, API docs | baseline behavior and public contract |
| 2 | local engine source, sample projects, Lyra/Stack-O-Bot equivalents when available | implementation evidence |
| 3 | expert blogs, conference talks, recognized tutorials | practical interpretation |
| 4 | community wiki, forum answers, issue threads | case study or workaround |
| 5 | copied snippets, old UE4 posts, unsourced claims | unverified lead |

Rules:

- Prefer official docs and local engine source for current engine behavior.
- Treat blogs as expert interpretation, not authoritative engine contracts.
- Treat forum posts as problem reports unless confirmed by docs, source, or local testing.
- Mark version-sensitive information with the Unreal version when known.
- Do not generalize a workaround from one forum post into a universal rule without verification.
- Preserve useful source URLs in frontmatter `source:` or a `## 출처` section.
- Remove webpage chrome such as share links, author widgets, previous/next links, newsletter prompts, and comment UI.

## First-Screen Contract

Every Unreal learning note should answer these questions before the first long explanation:

- What is this?
- When do I use it?
- What engine objects or systems are involved?
- What is the most important condition or failure point?
- What should I inspect first when it breaks?

The summary must contain information, not document-format narration.

Good:

```md
> [!summary] 요약
> RPC는 한 머신의 함수 호출을 서버나 owning client 같은 다른 실행 위치로 전달하는 원격 함수 호출 방식이다.
> 입력 요청, 서버 검증, 순간 연출처럼 상태 복제만으로 표현하기 어려운 일회성 행동에 사용한다.
> 핵심은 actor ownership과 호출 위치가 맞아야 기대한 대상에서 실행된다는 점이다.
```

Avoid:

```md
> 이 글이 무엇을 다룬다는 형식 설명만 반복한다.
> 주제 자체의 정의, 사용 조건, 기억할 결론을 말하지 않는다.
```

## Unreal Explanation Lens

When writing Unreal notes, always consider these axes. Include the relevant ones explicitly.

| Axis | Questions |
| --- | --- |
| Version | Which UE version is this based on? Is it UE4-era, UE5, or UE5.7-specific? |
| Runtime site | Editor, PIE, runtime, server, client, dedicated server, listen server? |
| Authority | Who owns the final state? Server, local client, subsystem, asset manager? |
| Ownership | Which object owns this object? `Owner`, `Outer`, `AvatarActor`, `Controller`, `World`? |
| Lifetime | Constructor, `PostInit`, `BeginPlay`, possession, replication receive, destruction? |
| Data path | Config, asset, component, subsystem, replicated property, async load, tag, attribute? |
| Failure mode | Silent no-op, crash, wrong client, late replication, null pointer, stale reference? |
| Verification | Log, debugger, console command, editor visualizer, stat command, engine source file? |

## Default Markdown Shape

Use this as the default for concept and system notes:

```md
---
type: unreal-learning
status: draft
migration_status: needs-content
updated: 2026-06-10
source:
tags:
  - unreal
  - unreal/topic
  - type/learning
---

# Topic

> [!summary] 요약
> One-sentence definition.
> When to use it.
> The key condition, limitation, or first debugging point.

## 핵심 결론

- The conclusion a future reader must remember.
- The condition that changes behavior.
- The first thing to inspect when it breaks.

## 왜 필요한가

## 작동 모델

## 주요 객체와 책임

| 객체/요소 | 역할 | 확인할 것 |
| --- | --- | --- |

## 실행 흐름

1. Trigger or input.
2. Engine system evaluates context.
3. State, data, object, or network message changes.
4. Result appears in game, log, editor, or replicated client.

## 사용 예시

```cpp
// Minimal example only.
```

확인할 것:

- Which object owns the call?
- Which machine or lifecycle phase runs it?
- Which value or state changes?

## 흔한 실수와 안전한 대안

| 실수 | 왜 문제인가 | 안전한 대안 |
| --- | --- | --- |

## 디버깅 체크리스트

- [ ] 필수 설정이 켜져 있는지 확인했다.
- [ ] 실행 주체와 호출 시점을 확인했다.
- [ ] owner, outer, world, authority, lifecycle 중 관련 축을 확인했다.
- [ ] 로그, 디버거, 에디터 시각화, 엔진 소스 중 하나로 검증했다.

## 엔진 소스 참고 포인트

- `Engine/Source/...`: what this file proves.

## 출처

- [Source title](URL)

## 관련 문서

- [[]]
```

## Note Type Rules

Choose a note type before rewriting. Do not force every note into the same shape.

### Concept Note

Use for systems, classes, features, and engine concepts.

Required sections:

- `요약`
- `핵심 결론`
- `왜 필요한가`
- `작동 모델`
- `주요 객체와 책임`
- `실행 흐름`
- `흔한 실수와 안전한 대안`
- `디버깅 체크리스트`
- `관련 문서`

### How-To Note

Use when the reader wants to do a task.

Prefer:

- goal
- prerequisites
- steps
- expected result
- verification
- failure recovery

The procedure must be numbered. Put options and flags in tables.

### Pitfall or Best-Practice Note

Use for WizardCell-style "this looks right but fails" topics.

Prefer:

- tempting mistake
- why it fails
- context where it appears
- safer alternative
- quick test
- related deeper notes

Do not write vague advice such as "be careful". Name the condition that fails.

### Engine Source Deep Dive

Use when the note is based on local engine source.

Prefer:

- public behavior
- relevant classes/files
- call path
- key branches or conditions
- what changed across versions if known
- what this means in project code

Avoid pasting large engine-source excerpts. Summarize the flow and cite file paths.

### Troubleshooting Note

Use for symptoms.

Prefer:

- symptom
- environment
- reproduction condition
- likely causes
- inspection order
- fix
- prevention

### Source Capture Note

Use when importing a blog, forum, or article before integrating it into concept notes.

Required sections:

- `출처 정보`
- `핵심 주장`
- `검증 필요`
- `내 해석`
- `연결할 문서`

Do not leave source capture notes as raw copied webpages.

### Index Note

Use for roadmap and topic navigation.

Prefer:

- starting path
- prerequisite concepts
- topic groups
- learning order
- gaps and next notes

## Unreal Topic Requirements

Add these topic-specific details when relevant.

| Topic | Must include |
| --- | --- |
| Networking/RPC | server, owning client, other client, ownership, relevancy, reliability, late joiner behavior |
| Replication | authoritative state, replicated property registration, condition, dormancy, RepNotify, update frequency |
| GAS | ASC, owner/avatar actor, ability spec, cost, cooldown, GE, attribute, tag, cue, prediction |
| AI/Behavior Tree | controller, brain component, blackboard, task/decorator/service, perception input, abort condition |
| EQS/Navigation | generator, test, score, query context, navmesh, area cost, filter, path following |
| Animation | pose source, montage timing, root motion, sync marker, notify, motion matching/warping target |
| Physics/Trace | source, shape, channel, object response, hit result, sweep, overlap/block/ignore |
| Asset systems | asset id, soft reference, registry scan, bundle, async load, GC reachability |
| Build/Packaging | target, config, cook, pak/iostore, plugin/module dependency, log location |
| Engine lifecycle | module load, subsystem init, world creation, actor/component initialization, teardown |

## Section Quality Rules

- `요약` must not say "this document explains". It must define the subject.
- `핵심 결론` must be actionable or memorable. Avoid generic bullets.
- `작동 모델` should describe object relationships and runtime behavior, not repeat the overview.
- `실행 흐름` should be ordered and inspectable.
- `사용 예시` should be minimal and followed by "확인할 것".
- `흔한 실수와 안전한 대안` should name a concrete misuse.
- `디버깅 체크리스트` should start with the cheapest checks.
- `엔진 소스 참고 포인트` should include why each file matters.
- `관련 문서` should link only useful neighbors, not every possible topic.

## Terminology Rules

Use Korean-first terminology with the official or commonly used English term on first meaningful appearance.

This is not phonetic transcription. If a clear Korean technical equivalent exists, prefer it over a Korean rendering of English pronunciation.

Preferred:

```md
태스크(Task)는 비헤이비어 트리의 리프 노드다.
태스크는 성공, 실패, 진행 중 상태를 명확히 반환해야 한다.
```

Rules:

- For Unreal concepts, systems, editor features, and node names, write `한글 용어(English Term)` on first meaningful appearance.
- After the first appearance in the same note, use the Korean term unless the English term improves search or disambiguation.
- Prefer specific compound terms over generic words: `블랙보드 키(Blackboard Key)`, `예측 키(Prediction Key)`, `강 참조(Hard Reference)`.
- Prefer Korean equivalents over phonetic loanwords when the meaning is clear: use `강 참조` instead of `하드 레퍼런스`, and `약 참조` instead of `소프트 레퍼런스`.
- `약 참조` is context-sensitive. Use `약 참조(Soft Reference)` for asset-loading soft references, and `약 참조(Weak Reference)` for delegate/shared-pointer lifetime references.
- Preserve common Unreal loanwords when they are more recognizable in Korean usage, such as `리플리케이션`, `오소리티`, `오너십`, and pair them with English when first introduced if needed.
- Do not translate or gloss code identifiers. Function names, class names, properties, enum values, console commands, module names, and file paths stay as code spans: `ExecuteTask()`, `UAbilityTask`, `bReplicates`, `GameplayAbilities`.
- Do not add parenthesized English every time a term appears. Repeated glosses reduce readability.
- Do not change Obsidian link targets just to add terminology glosses. Use the existing linked note title or a display alias when needed.

## External Source Rewrite Rules

When turning a forum/blog/site article into a vault note:

1. Record source URL, author if visible, publication/update date if visible, and checked date if needed.
2. Remove page chrome, advertisements, share links, comments, newsletter prompts, and unrelated navigation.
3. Rewrite in Korean using the vault's terminology.
4. Convert long prose into definitions, tables, flows, examples, and checklists.
5. Keep exact quotations short and only when wording matters.
6. Separate "source claim", "verified behavior", and "my project note" when certainty differs.
7. Prefer internal links to existing vault notes after the first rewrite pass.
8. If the source is old or UE4-specific, mark the version caveat.

## Status and Metadata

Use frontmatter for structured state.

```yaml
type: unreal-learning
status: draft | review | stable | archived
migration_status: done | needs-content | merge-candidate | skipped
updated: 2026-06-10
source:
tags:
  - unreal
  - unreal/topic
  - type/learning
```

Rules:

- `status` describes document maturity.
- `migration_status` describes the current cleanup/rewrite state.
- Use `draft` for incomplete, imported, or placeholder notes.
- Use `review` for readable but still improvable notes.
- Use `stable` only for guides and notes that can act as a reference point.
- Use `source:` for one main source. Use `## 출처` for multiple sources.

## HTML Learning Pages

For HTML pages, keep `언리얼/학습/인터랙티브 시각화 학습자료 제작 가이드.md` as the main source of truth.

Additional rules:

- A static HTML page should still expose purpose, key conclusion, and reading path in the first viewport.
- An interactive page should include controls, scene, state summary, and event log.
- Use visualizations for flow, state, ownership, timing, selection, score, path, collision, or replication.
- Do not create decorative diagrams that do not help debugging or understanding.
- Keep Markdown source and HTML title/sections coherent.
- Do not regenerate standalone offline copies unless explicitly asked.

## Validation Checklist

Before finalizing changes under `언리얼/학습/**`:

- [ ] Changed files are in the intended learning-material scope.
- [ ] Required reference documents were applied.
- [ ] Markdown has one real `#` title outside code fences.
- [ ] Code fences are balanced.
- [ ] Summary is information-dense and has no generic document narration.
- [ ] Headings have blank lines before them outside code fences.
- [ ] No empty parent heading is immediately followed by another same-level heading.
- [ ] Obsidian links resolve or are intentionally left as placeholders in examples.
- [ ] External-source notes preserve source metadata.
- [ ] HTML/CSS/JS/standalone/generated assets were not changed unless requested.
- [ ] If HTML or JS changed, syntax and interaction checks were run.

## Final Response Expectations

When reporting work in this folder:

- Mention files created or modified.
- State whether `Obsidian 문서 가독성 기준.md` was applied.
- State whether `HTML CSS 문서 제작 및 활용 기준.md` was applied if HTML/CSS was involved.
- Summarize the learning-experience improvement.
- State validation results.
- Mention intentionally skipped generated assets, standalone copies, `.obsidian`, or unrelated project files.

---
aliases:
  - "Failure Pressure Detail"
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

# Failure Pressure Detail

> [!summary] 문서 목적
> Failure in this project should not be designed as a generic punishment system. The desired emotional result is not irritation, but a sense that the building has become le...

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/FailurePressure_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Intent | 주요 섹션 |
| Design Problem | 주요 섹션 |
| Design Answer | 주요 섹션 |
| Failure Categories | 주요 섹션 |
| Soft Failure | 세부 기준 |
| Pressure Failure | 세부 기준 |
| Hard Failure | 세부 기준 |
| Anti-Frustration Rules | 주요 섹션 |
| Document Impact | 주요 섹션 |
| GDD | 세부 기준 |
| Development Plan | 세부 기준 |
| Gameplay Guide | 세부 기준 |
| Update Log | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Intent

Failure in this project should not be designed as a generic punishment system. The desired emotional result is not irritation, but a sense that the building has become less trustworthy, less stable, and more hostile after the player's mistake or delay.

## Design Problem

The prior documents already said that failure should mainly be "work-state deterioration" rather than death. However, that statement alone leaves an implementation risk: if work-state deterioration only means longer walking, repeated tasks, or broad inconvenience, the result stops being horror and becomes mechanical annoyance.

## Design Answer

Failure must satisfy three conditions:

1. It must make the situation scarier.
2. It must change the next few minutes of play.
3. It must not simply force the same task repetition.

This means failure is best expressed through state corruption and atmosphere escalation rather than raw time loss.

## Failure Categories

### Soft Failure

Used for small delays, missed clues, or minor misreports.

Desired outputs:

- one complaint worsens,
- lighting degrades,
- a familiar area becomes slightly wrong,
- a follow-up report becomes more unsettling.

### Pressure Failure

Used for repeated errors, blackout neglect, or extended exposure to unstable areas.

Desired outputs:

- record corruption,
- repeated complaint resurfacing,
- soundscape hostility,
- rerouted movement,
- stronger 307 intrusion.

### Hard Failure

Reserved for late-game clear danger states only.

Desired outputs:

- short checkpoint rollback,
- forced retreat,
- brief loss of control.

Not allowed:

- long chapter resets,
- replaying large solved sections unchanged,
- punishment with no new horror information.

## Anti-Frustration Rules

- A single failure should not erase 10 to 15 minutes of progress.
- After failure, the player should get a new readable objective within 1 to 3 minutes.
- Failure must change at least one of: light, sound, route, record, or complaint state.
- The player should understand why they are now in a worse state, but should not be fully certain what comes next.

## Document Impact

### GDD

The GDD now defines failure as a horror-state escalation system and gives examples of how failure should mutate the building.

### Development Plan

The development plan now treats failure as a production rule set, with explicit pressure tiers and anti-frustration constraints.

### Gameplay Guide

The guide now explains failure in direct player-facing language so the concept stays communicable.

## Update Log

- 2026-03-29: Failure pressure clarification added to the planning set.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

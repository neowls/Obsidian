---
aliases:
  - HTML CSS 기준
  - HTML 문서 제작 기준
  - CSS 활용 카탈로그
  - 게임 문서 HTML CSS 기준
tags:
  - html
  - css
  - web-design
  - game-ui
  - documentation
type: guide
status: stable
usage: prompt-reference
created: 2026-05-26
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# HTML CSS 문서 제작 및 활용 기준

> [!summary] 목적
> 이 문서는 HTML 문서 작성법과 CSS 활용법을 종합한 기준서이다. 특히 게임 개발, 게임 기획, 학습 자료, 기술 문서, 포트폴리오, 이력서, 자기소개서 같은 문서를 HTML로 만들 때 AI가 참고할 수 있는 제작 기준과 CSS 패턴 카탈로그를 제공한다.

## AI 적용 규칙

프롬프트에서 이 파일을 읽고 적용하라고 지시받은 AI는 이 섹션을 우선 적용한다.

1. 이 문서는 HTML 문서 제작, CSS 스타일 설계, 시각적 문서 UI, 게임/개발/기획 학습 페이지를 만들 때 적용하는 기준이다.
2. 우선순위는 `사용자 지시 > 대상 문서의 기존 목적과 톤 > 이 기준 문서 > 일반 HTML/CSS 관례` 순서로 둔다.
3. 기존 산출물의 스타일을 무비판적으로 따라 하지 말고, 이 문서의 표준/패턴 기준을 바탕으로 새로 설계한다.
4. HTML은 의미 구조를 먼저 잡고, CSS는 구조를 보강하는 방식으로 사용한다.
5. 시각 효과는 정보 구조, 몰입감, 탐색성, 상태 이해를 돕는 경우에만 사용한다.
6. 게임 문서에서는 HUD, 상태 패널, 인벤토리, 스킬 트리, 로드맵, 매트릭스, 타임라인, 플로우차트 같은 기능형 UI 패턴을 우선 고려한다.
7. 개발/학습 문서에서는 코드 가독성, 단계별 흐름, 비교표, 디버깅 체크리스트, 시각적 요약을 우선한다.
8. 커리어 문서에서는 인쇄/PDF 호환성, 명확한 계층, 절제된 강조, 스캔 가능한 성과 중심 레이아웃을 우선한다.
9. 새로운 CSS 기능은 `Baseline`, MDN 호환성, `@supports` fallback, `prefers-reduced-motion`을 고려한다.
10. 접근성은 장식보다 우선한다. focus 표시, 대비, semantic HTML, 키보드 이동, reduced motion을 깨뜨리지 않는다.
11. 코드 예시는 HTML, CSS, JavaScript를 분리해서 제시하고, 불필요한 프레임워크 의존성을 만들지 않는다.
12. 작업 후에는 `검토 체크리스트`를 기준으로 구조, 반응형, 접근성, 성능, 유지보수성을 점검한다.

### 프롬프트에서 부르는 방법

```text
`HTML CSS 문서 제작 및 활용 기준.md`를 먼저 읽고,
그 기준에 맞춰 게임/개발/기획 문서를 HTML로 작성해줘.
특히 `AI 적용 규칙`, `CSS 활용 지도`, `게임 문서 특화 패턴`, `검토 체크리스트`를 우선 반영해줘.
기존 산출물 스타일은 그대로 복제하지 말고, 이 기준서의 패턴 카탈로그를 참고해 새로 설계해줘.
```

## 빠른 결론

1. HTML은 문서의 의미 구조이고, CSS는 그 구조를 읽기 좋고 기능적으로 보이게 하는 표현 계층이다.
2. 멋진 CSS보다 먼저 좋은 정보 구조, 제목 계층, 탐색 흐름, 접근성을 만든다.
3. 게임 문서는 단순 카드 나열보다 HUD, 상태, 흐름, 규칙, 선택지, 피드백을 시각화할 때 가치가 높다.
4. CSS는 레이아웃, 타이포그래피, 색상, 상태, 반응형, 애니메이션, 데이터 표현, 출력/PDF까지 담당할 수 있다.
5. Flexbox는 1차원 정렬, Grid는 2차원 배치, container query는 컴포넌트 단위 반응형에 쓴다.
6. `custom properties`는 색상, 간격, 반경, 그림자, 모션 시간을 토큰화하는 핵심 도구이다.
7. `@layer`는 reset, base, layout, components, utilities의 우선순위를 명시해 유지보수를 돕는다.
8. `:has()`, `:is()`, `:where()`, `:focus-visible`, `::marker`, `::before`, `::after`는 기능형 UI를 만드는 핵심 선택자이다.
9. gradients, masks, clip-path, filters, blend modes는 이미지를 늘리지 않고 그래픽 효과를 만드는 도구이다.
10. transitions, keyframes, transforms, scroll-driven animation은 흐름과 상태 변화를 설명하는 데 쓰고 장식용 반복 모션은 줄인다.
11. CSS-only 차트와 다이어그램은 간단한 수치/관계 표현에 좋지만, 복잡한 데이터 분석은 SVG나 JS 차트가 낫다.
12. 프린트/PDF를 고려하는 커리어 문서와 기술 문서는 `@media print`, `@page`, 색상 절약, 링크 URL 표시를 별도로 설계한다.

## 자료 수집 기준

이 문서는 다음 범주의 자료를 종합한다.

| 범주 | 대표 자료 | 활용 기준 |
| --- | --- | --- |
| HTML 표준 | [WHATWG HTML](https://html.spec.whatwg.org/), [MDN HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) | 문서 구조, semantic element, 내장 상호작용 |
| CSS 표준/레퍼런스 | [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference), [W3C CSS](https://www.w3.org/Style/CSS/) | 속성, 모듈, 호환성 확인 |
| 학습형 공식 자료 | [web.dev Learn CSS](https://web.dev/learn/css), [web.dev Learn Design](https://web.dev/learn/design) | 반응형, 접근성, 모션, 실무 패턴 |
| 접근성 | [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/), [web.dev Accessibility](https://web.dev/learn/accessibility) | 대비, focus, 모션, semantic HTML |
| 창의적 CSS | [Codrops](https://tympanus.net/codrops/), [CSS-Tricks](https://css-tricks.com/), [Smashing Magazine CSS](https://www.smashingmagazine.com/category/css/) | 창의적 레이아웃, 효과, 실험적 패턴 |
| 현대 CSS 패턴 | [Modern CSS Solutions](https://moderncss.dev/), [Every Layout](https://every-layout.dev/layouts/) | 유지보수 가능한 실전 컴포넌트 |
| CSS 컴포넌트/영감 | [Uiverse](https://uiverse.io/), [CSS Pattern](https://css-pattern.com/), [PixelFlow](https://pixelflow.website/) | 버튼, 카드, 배경, 로더, 시각 아이디어 |
| 게임 UI 영감 | [RPGUI](https://ronenness.github.io/RPGUI/) 등 game UI 자료 | HUD, 인벤토리, RPG 패널, 스킬/상태 UI |

> [!warning] 레퍼런스 사용 원칙
> 창의적 CSS 예시는 그대로 복사하는 자료가 아니라 기법을 추출하는 자료이다. 실제 문서에는 접근성, 다크 테마, 반응형, 유지보수성을 맞춰 재설계한다.

## HTML 문서 작성 기준

### 기본 골격

HTML 문서는 다음 골격을 기본값으로 둔다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>문서 제목</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">본문으로 이동</a>

  <header class="site-header">
    <nav aria-label="주요 탐색"></nav>
  </header>

  <main id="main" class="page-shell">
    <article class="doc">
      <header class="doc-hero">
        <p class="eyebrow">문서 유형</p>
        <h1>문서 제목</h1>
        <p class="lede">문서의 목적과 읽는 방법을 짧게 설명한다.</p>
      </header>
    </article>
  </main>
</body>
</html>
```

### semantic element

| 요소 | 용도 | 기준 |
| --- | --- | --- |
| `main` | 페이지의 핵심 본문 | 문서당 1개 |
| `article` | 독립적으로 읽을 수 있는 글 | 기술 문서, 학습 페이지, 블로그 |
| `section` | 제목이 있는 의미 단위 | 반드시 heading과 함께 사용 |
| `nav` | 탐색 링크 묶음 | `aria-label`로 목적 표시 |
| `aside` | 보조 정보 | TOC, 참고, 경고, 관련 문서 |
| `header` / `footer` | 문서 또는 섹션의 머리/꼬리 | 전역과 지역 맥락 구분 |
| `figure` / `figcaption` | 이미지, 다이어그램, 코드 결과 설명 | 시각 자료의 의미 보존 |
| `details` / `summary` | 접기/펼치기 | FAQ, 긴 예시, 보충 설명 |
| `dialog` | 모달 | JS 제어와 focus 관리 필요 |
| `button` | 동작 | 링크처럼 쓰지 않기 |
| `a` | 이동 | 버튼처럼 쓰지 않기 |

### 문서 유형별 구조

| 문서 유형 | 권장 구조 |
| --- | --- |
| 게임 시스템 설명 | 요약, 시스템 목표, 플레이어 경험, 핵심 규칙, 데이터 구조, 상태 흐름, 예외, 디버깅 |
| 게임 기획서 | 비전, 대상 경험, 핵심 루프, 기능 목록, UX 플로우, 밸런스 변수, 리스크 |
| 개발 학습 문서 | 개념, 전제조건, 동작 흐름, 코드 예시, 디버깅, 실수 패턴, 요약 |
| 기술 블로그 | 문제, 맥락, 해결 전략, 구현, 검증, 배운 점 |
| 포트폴리오 | 역할, 문제, 기여, 결과, 스크린샷/링크, 기술 스택 |
| 이력서/자기소개서 | 요약, 핵심 역량, 경험, 성과, 프로젝트, 교육/자격, 연락처 |

### 접근성 기본값

- 제목은 `h1 -> h2 -> h3` 순서로 건너뛰지 않는다.
- 이미지에는 의미 있는 `alt`를 둔다. 장식 이미지는 빈 `alt=""` 또는 CSS background로 처리한다.
- 링크 텍스트는 "여기"가 아니라 목적지를 설명한다.
- 키보드로 이동 가능한 요소는 focus 표시가 있어야 한다.
- 색상만으로 상태를 구분하지 않는다.
- 모션은 `prefers-reduced-motion`을 지원한다.
- 표는 실제 데이터 비교에 사용하고, 레이아웃 용도로 쓰지 않는다.

## CSS 핵심 체계

### 레이어 구조

문서형 HTML에서는 CSS를 다음 순서로 나누면 유지보수가 쉽다.

```css
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

@layer tokens {
  :root {
    --bg: #111315;
    --surface: #1a1d21;
    --surface-2: #22262c;
    --text: #e6e0d2;
    --muted: #a9a192;
    --accent: #66d9c6;
    --danger: #ff6b6b;
    --radius: 8px;
    --gap: clamp(0.75rem, 1.5vw, 1.25rem);
    --shadow-soft: 0 16px 40px rgb(0 0 0 / 0.28);
    --motion-fast: 140ms;
    --motion-normal: 220ms;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font: 16px/1.6 system-ui, sans-serif;
  }
}
```

### 디자인 토큰

토큰은 문서 전체의 일관성을 만든다.

| 토큰 | 예시 | 용도 |
| --- | --- | --- |
| 색상 | `--bg`, `--surface`, `--accent` | 테마 전환, 상태색 |
| 간격 | `--space-1`, `--gap` | section, card, grid |
| 반경 | `--radius`, `--radius-pill` | 버튼, 패널, 칩 |
| 그림자 | `--shadow-soft`, `--glow-accent` | 깊이, 강조 |
| 타이포그래피 | `--step-0`, `--step-1` | 제목/본문 크기 |
| 모션 | `--motion-fast`, `--ease-out` | hover, panel transition |
| 레이아웃 | `--content`, `--sidebar` | 문서 폭, sidebar 폭 |

### 선택자 활용

| 선택자 | 활용 |
| --- | --- |
| `:is()` | 여러 선택자 그룹을 간결하게 묶기 |
| `:where()` | specificity를 올리지 않고 기본 스타일 지정 |
| `:has()` | 자식 상태에 따라 부모 스타일 변경 |
| `:not()` | 예외 처리 |
| `:focus-visible` | 키보드 focus 표시 |
| `:focus-within` | 카드/폼 그룹 focus 강조 |
| `:checked` | CSS-only 토글, 탭, 필터 |
| `:target` | 앵커 기반 섹션 강조 |
| `:user-invalid` | 사용자 입력 후 validation 표시 |
| `::before`, `::after` | 장식, connector, badge, overlay |
| `::marker` | 목록 marker 커스터마이징 |
| `::selection` | 선택 영역 스타일 |

```css
.card:has(:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.doc :where(h2, h3) {
  scroll-margin-top: 5rem;
}

.steps li::marker {
  color: var(--accent);
  font-weight: 700;
}
```

## CSS 활용 지도

### 레이아웃

| 목표 | 우선 기술 | 보조 기술 |
| --- | --- | --- |
| 버튼/메타 정보 한 줄 정렬 | Flexbox | gap, wrap |
| 카드 그리드 | CSS Grid | `auto-fit`, `minmax()` |
| 대시보드 | Grid | named areas, subgrid |
| 본문+TOC | Grid | sticky aside |
| 컴포넌트 자체 반응형 | Container query | `container-type` |
| 전체 viewport 반응형 | Media query | mobile-first |
| 가로 스크롤 목록 | Scroll snap | `overflow-x` |
| 고정 비율 이미지/패널 | `aspect-ratio` | object-fit |
| 큰 문서 인쇄 | `@media print` | `@page`, page breaks |

### 시각 효과

| 목표 | 기술 |
| --- | --- |
| 다크 표면 깊이 | layered background, subtle shadow |
| HUD 패널 | border, gradient line, clip-path corner |
| 네온 강조 | text-shadow, box-shadow, low-saturation glow |
| 유리 질감 | `backdrop-filter`, translucent background, border |
| 종이/카드 느낌 | shadow, border, low contrast background |
| 픽셀/RPG UI | image border, inset shadow, hard edges |
| 사이버펑크 UI | diagonal clip, scanline, glow, warning accent |
| 배경 패턴 | repeating gradients, radial gradients |
| 비정형 이미지 | `clip-path`, `mask-image`, SVG mask |
| 그래픽 합성 | `mix-blend-mode`, `background-blend-mode`, filters |

### 기능형 UI

| 목표 | 기술 |
| --- | --- |
| 접기 설명 | `details`, `summary` |
| CSS-only 탭 | radio + `:checked`, 또는 JS와 ARIA |
| FAQ | `details` list |
| 진행률 | `progress`, CSS bar, conic gradient |
| 상태 배지 | custom properties + semantic classes |
| skeleton loading | gradient animation + reduced motion |
| tooltip | `aria-describedby` + CSS, 필요 시 JS |
| TOC | sticky aside + anchor links |
| 타임라인 | list + pseudo-element connector |
| 플로우차트 | grid/flex + pseudo connector, 복잡하면 SVG |
| 스킬 트리 | CSS grid + node states + connector lines |
| 인벤토리 | grid slots + item rarity + hover/focus state |
| HUD | fixed/absolute panels + responsive scale |

## 레이아웃 패턴

### 문서 shell

```css
.page-shell {
  width: min(100% - 2rem, 1180px);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 4rem);
}

.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
  gap: clamp(1.5rem, 4vw, 3rem);
}

.toc {
  position: sticky;
  top: 1rem;
  align-self: start;
}

@media (max-width: 860px) {
  .doc-layout {
    grid-template-columns: 1fr;
  }

  .toc {
    position: static;
  }
}
```

### 자동 카드 그리드

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: var(--gap);
}
```

### Bento grid

게임 기획 요약, 시스템 대시보드, 포트폴리오 성과 요약에 적합하다.

```css
.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: minmax(8rem, auto);
  gap: var(--gap);
}

.bento-card {
  grid-column: span 2;
  padding: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: var(--radius);
  background: var(--surface);
}

.bento-card.is-wide {
  grid-column: span 4;
}

.bento-card.is-tall {
  grid-row: span 2;
}

@media (max-width: 760px) {
  .bento {
    grid-template-columns: 1fr;
  }

  .bento-card,
  .bento-card.is-wide {
    grid-column: auto;
  }
}
```

### Container query

컴포넌트가 어느 위치에 놓여도 스스로 반응하도록 만든다.

```css
.system-card {
  container-type: inline-size;
}

.system-card__body {
  display: grid;
  gap: 0.75rem;
}

@container (min-width: 34rem) {
  .system-card__body {
    grid-template-columns: 12rem 1fr;
  }
}
```

### Sidebar + content

Every Layout의 Sidebar 패턴처럼, 좁으면 자동으로 쌓이게 만든다.

```css
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.with-sidebar > :first-child {
  flex-basis: 18rem;
  flex-grow: 1;
}

.with-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 55%;
}
```

## 타이포그래피와 문서 가독성

### 유동 글자 크기

`vw`만으로 글자 크기를 키우면 모바일/대형 화면에서 깨지기 쉽다. `clamp()`로 최소/선호/최대값을 둔다.

```css
:root {
  --step--1: clamp(0.875rem, 0.84rem + 0.2vw, 1rem);
  --step-0: clamp(1rem, 0.96rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.12rem + 0.65vw, 1.6rem);
  --step-2: clamp(1.6rem, 1.35rem + 1.2vw, 2.25rem);
  --step-3: clamp(2.1rem, 1.7rem + 2vw, 3.5rem);
}

h1 {
  font-size: var(--step-3);
  line-height: 1.05;
}

p,
li {
  font-size: var(--step-0);
}
```

### 읽기 폭

```css
.prose {
  max-inline-size: 72ch;
  line-height: 1.65;
}

.prose :where(h2, h3) {
  line-height: 1.2;
  margin-block-start: 2em;
  margin-block-end: 0.6em;
}
```

### 코드 블록

```css
pre {
  overflow: auto;
  padding: 1rem;
  border-radius: var(--radius);
  background: #0b0d10;
  border: 1px solid rgb(255 255 255 / 0.1);
}

code {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.92em;
}
```

## 색상과 다크 테마

### 다크 테마 팔레트

```css
:root {
  color-scheme: dark;
  --bg: #111315;
  --surface: #191c20;
  --surface-raised: #22262b;
  --text: #e8e2d5;
  --muted: #aaa292;
  --line: #34383f;
  --accent: #6bd9c7;
  --accent-2: #9f8cff;
  --warning: #f2c66d;
  --danger: #ff7777;
  --success: #8bdc8b;
}
```

### OKLCH와 color-mix

현대 CSS에서는 `oklch()`와 `color-mix()`를 사용하면 색상 변형이 더 예측 가능하다. 단, 호환성은 확인한다.

```css
:root {
  --brand: oklch(75% 0.12 180);
  --brand-soft: color-mix(in oklch, var(--brand), transparent 78%);
  --brand-line: color-mix(in oklch, var(--brand), black 45%);
}
```

### 상태색

| 상태 | 색상 방향 | 사용처 |
| --- | --- | --- |
| 정보 | 청록/파랑 | 시스템 안내, 참고 |
| 성공 | 녹색 | 완료, 통과 |
| 경고 | 노랑/호박 | 주의, 비용, 조건 |
| 위험 | 빨강 | 실패, 치명 조건 |
| 희귀도 | 회색/파랑/보라/금색 | 아이템 카드, 스킬 등급 |

색상만으로 상태를 구분하지 말고 텍스트, 아이콘, border style을 함께 둔다.

## 그래픽 CSS 패턴

### Gradient background

```css
.hero-surface {
  background:
    radial-gradient(circle at 15% 10%, rgb(107 217 199 / 0.22), transparent 32rem),
    radial-gradient(circle at 85% 18%, rgb(159 140 255 / 0.18), transparent 28rem),
    linear-gradient(135deg, #111315, #1a1d22 58%, #101215);
}
```

### 반복 패턴

```css
.grid-bg {
  background:
    linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

### Gradient border

```css
.gradient-border {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    linear-gradient(135deg, var(--accent), transparent, var(--accent-2)) border-box;
  border-radius: var(--radius);
}
```

### Glassmorphism

유리 효과는 배경이 복잡할수록 텍스트 대비가 약해질 수 있다. 게임 HUD나 상태 패널에 제한적으로 쓴다.

```css
.glass-panel {
  background: rgb(24 28 34 / 0.62);
  border: 1px solid rgb(255 255 255 / 0.14);
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.35);
  backdrop-filter: blur(18px) saturate(130%);
}
```

### Neumorphism

입체감은 좋지만 대비가 약해지기 쉬우므로 버튼/입력 UI에는 주의한다.

```css
.soft-panel {
  background: #1d2025;
  box-shadow:
    10px 10px 24px rgb(0 0 0 / 0.38),
    -8px -8px 20px rgb(255 255 255 / 0.04);
}
```

### Cyberpunk/HUD cut corner

```css
.hud-panel {
  --cut: 16px;
  position: relative;
  padding: 1rem;
  background: linear-gradient(135deg, rgb(24 28 34 / 0.95), rgb(13 16 20 / 0.95));
  border: 1px solid color-mix(in oklch, var(--accent), transparent 35%);
  clip-path: polygon(
    var(--cut) 0,
    100% 0,
    100% calc(100% - var(--cut)),
    calc(100% - var(--cut)) 100%,
    0 100%,
    0 var(--cut)
  );
}

.hud-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(107 217 199 / 0.12), transparent);
  transform: translateX(-100%);
  animation: scan 4s linear infinite;
}

@keyframes scan {
  to {
    transform: translateX(100%);
  }
}
```

### Mask reveal

```css
.fade-edge {
  mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
}
```

### Clip-path image

```css
.cut-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  clip-path: polygon(0 0, 92% 0, 100% 18%, 100% 100%, 8% 100%, 0 82%);
}
```

### Blend mode overlay

```css
.poster {
  background:
    linear-gradient(135deg, rgb(20 220 190 / 0.25), rgb(180 80 255 / 0.2)),
    url("image.jpg") center / cover;
  background-blend-mode: screen, normal;
}
```

## 애니메이션과 상호작용

### 기본 transition

```css
.interactive-card {
  transition:
    transform var(--motion-normal) ease,
    border-color var(--motion-fast) ease,
    background-color var(--motion-fast) ease;
}

.interactive-card:hover,
.interactive-card:focus-within {
  transform: translateY(-2px);
  border-color: var(--accent);
}
```

### 성능 원칙

- 가능한 한 `transform`, `opacity` 중심으로 애니메이션한다.
- `width`, `height`, `top`, `left`를 반복적으로 애니메이션하면 layout 비용이 커질 수 있다.
- `will-change`는 필요한 순간에만 사용하고 남발하지 않는다.
- 장식 모션은 `prefers-reduced-motion`에서 줄이거나 제거한다.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

### @property로 animatable token 만들기

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.animated-ring {
  --angle: 0deg;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    conic-gradient(from var(--angle), var(--accent), var(--accent-2), var(--accent)) border-box;
  border: 1px solid transparent;
  animation: spin-angle 5s linear infinite;
}

@keyframes spin-angle {
  to {
    --angle: 360deg;
  }
}
```

### Scroll-driven animation

문서 읽기 진행률, 장별 reveal, 타임라인 진행 표시 등에 적합하다. 지원 여부를 확인하고 fallback을 둔다.

```css
@supports (animation-timeline: scroll()) {
  .reading-progress {
    transform-origin: left;
    animation: progress linear both;
    animation-timeline: scroll(root block);
  }

  @keyframes progress {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
}
```

### View transition

SPA나 문서 내 동적 화면 전환에 쓸 수 있다. 정적 HTML 문서에서는 필수는 아니다.

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 180ms;
}
```

## 기능형 CSS 패턴

### 상태 배지

```html
<span class="status-badge" data-tone="warning">검토 필요</span>
```

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.25em 0.65em;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid var(--badge-line);
  background: var(--badge-bg);
  color: var(--badge-text);
}

.status-badge[data-tone="warning"] {
  --badge-bg: rgb(242 198 109 / 0.14);
  --badge-line: rgb(242 198 109 / 0.4);
  --badge-text: #f5d58a;
}
```

### Timeline

```html
<ol class="timeline">
  <li>
    <time>Phase 1</time>
    <strong>Prototype</strong>
    <p>핵심 루프를 검증한다.</p>
  </li>
  <li>
    <time>Phase 2</time>
    <strong>Vertical Slice</strong>
    <p>전투, UI, 진행 흐름을 연결한다.</p>
  </li>
</ol>
```

```css
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.timeline li {
  position: relative;
  padding-inline-start: 2rem;
}

.timeline li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0.35rem;
  top: 0.3rem;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--accent);
}

.timeline li::after {
  content: "";
  position: absolute;
  inset-inline-start: 0.68rem;
  top: 1.2rem;
  bottom: -1rem;
  width: 1px;
  background: var(--line);
}

.timeline li:last-child::after {
  display: none;
}
```

### Progress ring

```css
.progress-ring {
  --value: 72%;
  width: 7rem;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(circle closest-side, var(--surface) 72%, transparent 73%),
    conic-gradient(var(--accent) var(--value), rgb(255 255 255 / 0.12) 0);
  font-weight: 800;
}
```

### CSS-only details accordion

```css
details {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

summary {
  cursor: pointer;
  padding: 0.85rem 1rem;
  font-weight: 700;
}

details[open] summary {
  border-bottom: 1px solid var(--line);
}

details > :not(summary) {
  padding-inline: 1rem;
}
```

### Responsive table wrapper

```css
.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.table-scroll table {
  width: 100%;
  border-collapse: collapse;
  min-width: 42rem;
}
```

### Skill tree

스킬 트리는 복잡해지면 SVG나 JS가 필요하다. 간단한 기술 트리, 학습 로드맵, 기능 의존성은 CSS Grid로 충분하다.

```html
<section class="skill-tree" aria-label="스킬 트리">
  <button class="skill-node is-unlocked">기본 이동</button>
  <button class="skill-node is-active">회피</button>
  <button class="skill-node is-locked">공중 회피</button>
</section>
```

```css
.skill-tree {
  display: grid;
  grid-template-columns: repeat(3, minmax(8rem, 1fr));
  gap: 1.25rem;
}

.skill-node {
  min-height: 5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
}

.skill-node.is-active {
  border-color: var(--accent);
  box-shadow: 0 0 24px rgb(107 217 199 / 0.18);
}

.skill-node.is-locked {
  opacity: 0.5;
  filter: grayscale(0.6);
}
```

### Inventory grid

```css
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
  gap: 0.5rem;
}

.slot {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.05), transparent),
    var(--surface);
}

.slot[data-rarity="legendary"] {
  border-color: #e6b85c;
  box-shadow: inset 0 0 0 1px rgb(230 184 92 / 0.3), 0 0 18px rgb(230 184 92 / 0.18);
}
```

### Flowchart

```css
.flow {
  display: grid;
  gap: 1rem;
}

.flow-step {
  position: relative;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.flow-step + .flow-step::before {
  content: "↓";
  position: absolute;
  inset-inline-start: 50%;
  top: -1.1rem;
  transform: translateX(-50%);
  color: var(--accent);
}
```

### Dashboard metric card

```css
.metric-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}

.metric-card .value {
  font-size: clamp(1.8rem, 5vw, 3rem);
  line-height: 1;
  font-weight: 850;
}

.metric-card .delta {
  color: var(--success);
  font-size: 0.9rem;
}
```

## 게임 문서 특화 패턴

### 게임 시스템 설명 페이지

권장 섹션은 다음과 같다.

1. `System Summary`: 시스템 목적과 플레이어 경험.
2. `Core Loop`: 입력, 판단, 결과, 피드백.
3. `State Model`: 상태와 전이.
4. `Data Table`: 주요 변수와 기본값.
5. `UI Feedback`: HUD, 알림, 사운드, 애니메이션.
6. `Edge Cases`: 실패 조건, 예외, 네트워크/저장.
7. `Debug Checklist`: 로그, 뷰포트, 재현 단계.

### 전투/HUD 문서

| 정보 | 추천 UI |
| --- | --- |
| 체력/스태미나/마나 | progress bar, segmented meter |
| 버프/디버프 | icon chip, countdown badge |
| 스킬 쿨다운 | radial progress, disabled state |
| 타겟 정보 | compact HUD card |
| 위험 경고 | high contrast alert strip |
| 튜토리얼 안내 | anchored callout, dismissible hint |

### 기획 매트릭스

```html
<table class="design-matrix">
  <thead>
    <tr>
      <th>기능</th>
      <th>플레이어 가치</th>
      <th>개발 비용</th>
      <th>리스크</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>회피</th>
      <td>전투 리듬</td>
      <td>중간</td>
      <td>애니메이션 cancel 규칙</td>
    </tr>
  </tbody>
</table>
```

### 스킬/아이템 카드

| 카드 영역 | 표시 정보 |
| --- | --- |
| 상단 | 이름, 타입, 희귀도 |
| 본문 | 효과, 조건, 수치 |
| 하단 | 쿨다운, 비용, 태그 |
| 상태 | 잠김, 해금, 장착, 강화 가능 |

### 학습용 인터랙티브 문서

게임/개발 학습 자료는 다음 패턴이 효과적이다.

- 좌측: 개념 설명
- 우측: 상태 패널 또는 다이어그램
- 하단: 단계별 실행 흐름
- 접기 영역: 긴 코드, 엔진 소스, 추가 참고
- 색상: 개념 종류별로 제한된 토큰 사용

## 개발/기획/커리어 문서 활용

### 기술 문서

- 긴 설명보다 흐름도, 비교표, 체크리스트를 우선한다.
- 코드 예시는 핵심 부분만 보이고, 전체 코드는 접기 영역에 둔다.
- API, 클래스, 옵션은 표로 정리한다.
- 오류/주의점은 경고 패널로 분리한다.

### 포트폴리오

- 프로젝트별 카드에는 문제, 역할, 해결, 결과를 고정 순서로 둔다.
- 스크린샷은 과하게 어둡거나 흐리게 처리하지 않는다.
- 기술 스택은 배지로 표시하되 너무 많은 색을 쓰지 않는다.
- 인쇄/PDF 버전을 고려해 배경 장식 의존도를 낮춘다.

### 이력서/자기소개서

- 장식보다 정보 밀도와 계층이 중요하다.
- `@media print`에서 배경색, 그림자, 애니메이션을 제거한다.
- 성과는 숫자와 행동 동사 중심으로 표시한다.
- 화면용과 인쇄용 스타일을 분리한다.

```css
@media print {
  :root {
    color-scheme: light;
  }

  body {
    background: white;
    color: black;
  }

  .no-print,
  nav,
  .decorative-bg {
    display: none !important;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
  }

  section {
    break-inside: avoid;
  }
}
```

## CSS 패턴 카탈로그

| 만들고 싶은 것 | 쓸 기술 | 주의 |
| --- | --- | --- |
| 읽기 좋은 기술 문서 | semantic HTML, prose width, sticky TOC | 장식보다 구조 우선 |
| 게임 HUD | grid/flex, fixed panels, gradients, glow | 작은 화면에서 겹침 방지 |
| 스킬 트리 | grid, pseudo connector, state class | 복잡하면 SVG/JS |
| 인벤토리 | grid slots, aspect-ratio, rarity token | hover만 의존하지 않기 |
| 능력치 카드 | bento grid, metric card | 숫자 단위 명확히 표시 |
| 로드맵 | timeline, counters, connector | 모바일에서 세로형 |
| 플로우차트 | CSS grid, pseudo arrows, SVG | 방향/분기 명확히 |
| 비교 매트릭스 | table, sticky header | 모바일 overflow 처리 |
| 코드 학습 페이지 | code block, callout, split layout | 줄바꿈과 가로 스크롤 처리 |
| 포트폴리오 | project cards, screenshots, print CSS | 과한 모션 금지 |
| 이력서 | print CSS, counters, compact sections | 배경색에 의존 금지 |
| 사이버펑크 패널 | clip-path, gradient border, scanline | 대비와 피로도 관리 |
| 유리 카드 | backdrop-filter, transparent fill | 텍스트 배경 대비 확보 |
| 네온 버튼 | box-shadow, text-shadow, border | glow 과다 사용 금지 |
| 로더 | skeleton, shimmer | 실제 지연이 짧으면 생략 |
| 읽기 진행률 | scroll-driven animation | fallback 필요 |
| 탭 UI | radio/JS + ARIA | 접근성 복잡하면 JS 사용 |
| 접기 설명 | details/summary | summary 텍스트 명확히 |
| 차트 | CSS bars/conic/SVG | 정밀 데이터는 차트 라이브러리 |

## 브라우저 지원과 fallback

새 기능은 다음 순서로 판단한다.

1. MDN의 Baseline/compatibility 확인.
2. 실사용 브라우저 범위 확인.
3. `@supports`로 지원 브라우저에만 적용.
4. 미지원 시 읽기 가능한 기본 레이아웃 제공.

```css
.panel {
  border: 1px solid var(--line);
  background: var(--surface);
}

@supports (backdrop-filter: blur(12px)) {
  .panel.is-glass {
    background: rgb(24 28 34 / 0.62);
    backdrop-filter: blur(12px);
  }
}
```

## 전체 HTML 템플릿

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>게임 시스템 문서</title>
  <style>
    @layer reset, tokens, base, layout, components;

    @layer reset {
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; }
      img { max-width: 100%; display: block; }
    }

    @layer tokens {
      :root {
        color-scheme: dark;
        --bg: #111315;
        --surface: #1a1d21;
        --text: #e8e2d5;
        --muted: #aaa292;
        --line: #34383f;
        --accent: #6bd9c7;
        --radius: 8px;
      }
    }

    @layer base {
      body {
        background: var(--bg);
        color: var(--text);
        font: 16px/1.6 system-ui, sans-serif;
      }

      a { color: var(--accent); }
      :focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
    }

    @layer layout {
      .page {
        width: min(100% - 2rem, 1180px);
        margin-inline: auto;
        padding-block: 3rem;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 18rem;
        gap: 2rem;
      }

      @media (max-width: 860px) {
        .grid { grid-template-columns: 1fr; }
      }
    }

    @layer components {
      .panel {
        padding: 1rem;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <article class="grid">
      <div>
        <header>
          <p>Game System</p>
          <h1>전투 스태미나 시스템</h1>
          <p>플레이어 행동 비용과 회복 리듬을 설명한다.</p>
        </header>

        <section class="panel">
          <h2>핵심 규칙</h2>
          <ul>
            <li>회피는 스태미나를 소비한다.</li>
            <li>공격 중 회복은 지연된다.</li>
            <li>스태미나 부족 시 고위험 행동을 제한한다.</li>
          </ul>
        </section>
      </div>

      <aside class="panel" aria-label="문서 요약">
        <h2>요약</h2>
        <p>전투 템포와 리스크 관리를 위한 자원 시스템.</p>
      </aside>
    </article>
  </main>
</body>
</html>
```

## 검토 체크리스트

문서를 만들거나 수정한 뒤 아래 기준을 확인한다.

- [ ] HTML 제목 계층이 의미 순서대로 구성되어 있다.
- [ ] `main`, `article`, `section`, `aside`, `nav`가 의미에 맞게 쓰였다.
- [ ] 링크와 버튼의 역할이 뒤섞이지 않았다.
- [ ] 키보드 focus 표시가 보인다.
- [ ] 색상만으로 상태를 전달하지 않는다.
- [ ] 본문 읽기 폭과 줄간격이 장문에 적합하다.
- [ ] 모바일에서 카드, 표, HUD, 사이드바가 겹치지 않는다.
- [ ] 표는 가로 스크롤 또는 모바일 대체 구조를 가진다.
- [ ] 모션은 `prefers-reduced-motion`을 지원한다.
- [ ] 새 CSS 기능은 `@supports` 또는 fallback을 가진다.
- [ ] 그래픽 효과가 텍스트 가독성을 해치지 않는다.
- [ ] 게임 UI 스타일이 문서의 정보 전달을 방해하지 않는다.
- [ ] 인쇄/PDF가 필요한 문서는 `@media print`가 있다.
- [ ] CSS 토큰과 class 이름이 재사용 가능하게 정리되어 있다.
- [ ] 외부 레퍼런스의 코드를 그대로 복제하지 않고 목적에 맞게 재구성했다.

## 참고 자료

### 공식/표준

- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- [MDN HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/)
- [W3C CSS](https://www.w3.org/Style/CSS/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [web.dev Learn CSS](https://web.dev/learn/css)
- [web.dev Learn Design](https://web.dev/learn/design)
- [web.dev Baseline](https://web.dev/baseline)

### 핵심 CSS 기능

- [MDN CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [MDN Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout)
- [MDN CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables)
- [MDN Cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [MDN CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors)
- [MDN Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN CSS masking](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_masking)
- [MDN CSS scroll-driven animations](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN CSS paged media](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Paged_media)

### 창의적/실전 CSS

- [Modern CSS Solutions](https://moderncss.dev/)
- [Every Layout](https://every-layout.dev/layouts/)
- [Codrops](https://tympanus.net/codrops/)
- [CSS-Tricks Gradients Guide](https://css-tricks.com/a-complete-guide-to-css-gradients/)
- [Smashing Magazine CSS](https://www.smashingmagazine.com/category/css/)
- [Uiverse](https://uiverse.io/)
- [CSS Pattern](https://css-pattern.com/)
- [PixelFlow](https://pixelflow.website/)
- [RPGUI](https://ronenness.github.io/RPGUI/)

## 운영 규칙

- 이 문서는 HTML/CSS 문서를 새로 만들 때의 기준서로 사용한다.
- 기존 HTML 산출물을 그대로 따라 하기보다, 이 문서의 패턴을 상황에 맞게 조합한다.
- 게임 문서에서는 몰입감과 기능성을 함께 보되, 정보 전달이 최우선이다.
- CSS 효과를 추가할 때마다 "이 효과가 구조, 탐색, 상태 이해를 돕는가"를 확인한다.
- 새로운 CSS 기능은 재미보다 안정성과 fallback을 먼저 확인한다.

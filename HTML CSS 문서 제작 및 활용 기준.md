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
updated: 2026-06-10
cssclasses:
  - readable-guide
---

# HTML CSS 문서 제작 및 활용 기준

> [!summary] 목적
> 이 문서는 기술 설명글, 학습 자료, 게임/개발 문서, 포트폴리오, 이력서처럼 읽기와 이해가 중요한 HTML/CSS 문서를 만들기 위한 기준서이다. HTML은 의미 구조를 만들고, CSS는 그 구조를 더 읽기 쉽고 탐색하기 쉽게 보강한다.

## AI 적용 규칙

AI가 이 문서를 기준으로 HTML/CSS 문서를 만들거나 고칠 때는 아래 규칙을 우선한다.

1. 의미 구조를 먼저 설계하고 시각 스타일은 그 다음에 적용한다.
2. 독자가 첫 화면에서 문서의 목적, 핵심 결론, 읽는 순서를 알 수 있게 한다.
3. 기술 문서는 장식보다 상태, 흐름, 관계, 조건, 예외, 디버깅 정보를 잘 보이게 만든다.
4. HTML은 `main`, `article`, `section`, `aside`, `nav`, `header`, `footer`, `figure`, `details`를 의미에 맞게 쓴다.
5. CSS는 custom properties, cascade layers, readable width, 명확한 heading rhythm, 접근성, 반응형을 기본값으로 둔다.
6. 게임/개발 문서에서는 HUD, 상태 패널, 타임라인, 플로우, 매트릭스, 디버그 체크리스트, 인터랙티브 예시를 우선 고려한다.
7. 새로운 CSS 기능은 MDN 호환성, `@supports`, fallback, `prefers-reduced-motion`을 고려한다.
8. 링크와 버튼의 역할을 섞지 않는다. 키보드 focus 표시를 유지한다.
9. 색상만으로 상태를 전달하지 않는다. 텍스트, 아이콘, border, label을 함께 쓴다.
10. 작업 후에는 `검토 체크리스트`를 기준으로 구조, 반응형, 접근성, 가독성, 유지보수성을 점검한다.

## 빠른 기준

좋은 HTML 기술 문서는 다음 질문에 빠르게 답한다.

- 이 문서는 무엇을 설명하는가?
- 독자는 어떤 순서로 읽어야 하는가?
- 핵심 개념과 작동 흐름은 무엇인가?
- 옵션, 상태, 예외는 어디에서 확인하는가?
- 예시와 디버깅 절차는 어디에 있는가?

시각 스타일은 다음 목적 중 하나를 만족해야 한다.

| 목적 | 예시 |
| --- | --- |
| 정보 위계 | 제목, lede, summary panel, TOC |
| 관계 이해 | flowchart, dependency map, state diagram |
| 상태 인식 | badge, alert strip, progress, disabled state |
| 비교 | matrix, table, split panel |
| 실습 | interactive lab, controls, live log |
| 재확인 | checklist, reference table, debug panel |

장식만 있고 위 목적에 기여하지 않는 효과는 줄인다.

## 기본 HTML 구조

문서형 HTML은 아래 구조를 기본값으로 쓴다.

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
    <nav aria-label="주요 탐색">
      <a href="index.html">Index</a>
    </nav>
  </header>

  <main id="main" class="page-shell">
    <article class="doc-layout">
      <div class="doc-main">
        <header class="doc-hero">
          <p class="eyebrow">문서 유형</p>
          <h1>문서 제목</h1>
          <p class="lede">문서의 목적과 핵심 결론을 짧게 설명한다.</p>
        </header>

        <section aria-labelledby="summary-title" class="panel">
          <h2 id="summary-title">핵심 요약</h2>
          <ul>
            <li>첫 번째 결론</li>
            <li>두 번째 결론</li>
          </ul>
        </section>
      </div>

      <aside class="toc" aria-label="문서 목차">
        <h2>목차</h2>
        <ol>
          <li><a href="#summary-title">핵심 요약</a></li>
        </ol>
      </aside>
    </article>
  </main>
</body>
</html>
```

## Semantic HTML 기준

| 요소 | 용도 | 기준 |
| --- | --- | --- |
| `main` | 페이지의 핵심 본문 | 문서당 1개 |
| `article` | 독립적으로 읽을 수 있는 문서 | 기술 문서, 학습 페이지, 블로그 |
| `section` | 제목이 있는 의미 단위 | 반드시 heading과 함께 사용 |
| `nav` | 탐색 링크 묶음 | `aria-label`로 목적 표시 |
| `aside` | 보조 정보 | TOC, 요약, 관련 문서, 참고 |
| `header` | 페이지나 섹션의 도입 | 제목, 요약, 메타 정보 |
| `footer` | 출처, 갱신 정보, 보조 링크 | 본문과 구분 |
| `figure` | 이미지, 도표, 코드 결과 | `figcaption`으로 의미 설명 |
| `details` | 접기/펼치기 | 긴 예시, FAQ, 로그 |
| `button` | 동작 | 이동 링크처럼 쓰지 않기 |
| `a` | 이동 | 동작 버튼처럼 쓰지 않기 |

제목은 `h1 -> h2 -> h3` 순서로 사용한다. 모양 때문에 heading level을 건너뛰지 않는다.

## 기술 문서 섹션 구조

HTML 기술 문서는 아래 순서를 기본값으로 둔다.

```html
<article class="doc">
  <header class="doc-hero">
    <p class="eyebrow">Technical Note</p>
    <h1>기능 이름</h1>
    <p class="lede">한 문장 정의와 사용 맥락.</p>
  </header>

  <section class="summary-panel">
    <h2>핵심 결론</h2>
  </section>

  <section>
    <h2>왜 필요한가</h2>
  </section>

  <section>
    <h2>작동 모델</h2>
  </section>

  <section>
    <h2>동작 흐름</h2>
  </section>

  <section>
    <h2>최소 예제</h2>
  </section>

  <section>
    <h2>자주 헷갈리는 점</h2>
  </section>

  <section>
    <h2>디버깅 체크리스트</h2>
  </section>
</article>
```

문서 유형별로 강조할 부분은 다르게 둔다.

| 문서 유형 | 강조할 구조 |
| --- | --- |
| 개발 학습 문서 | 개념, 전제조건, 흐름, 코드 예시, 디버깅 |
| 게임 시스템 설명 | 목표, 플레이어 경험, 상태 모델, 변수, 예외 |
| 기술 레퍼런스 | API, 옵션, 속성, 조건, 제한, 호환성 |
| 문제 해결 문서 | 증상, 원인 후보, 확인 순서, 해결, 재발 방지 |
| 포트폴리오 | 문제, 역할, 해결, 결과, 링크, 스크린샷 |
| 이력서 | 요약, 역량, 경험, 성과, 프로젝트, 연락처 |

## CSS 기본 체계

문서형 CSS는 레이어를 나누면 유지보수가 쉽다.

```css
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  img,
  svg {
    max-width: 100%;
  }
}

@layer tokens {
  :root {
    color-scheme: dark light;
    --bg: #111315;
    --surface: #1a1d21;
    --surface-raised: #22262b;
    --text: #e8e2d5;
    --muted: #aaa292;
    --line: #34383f;
    --accent: #6bd9c7;
    --warning: #f2c66d;
    --danger: #ff7777;
    --success: #8bdc8b;
    --radius: 8px;
    --content: 72ch;
    --page: 1180px;
    --gap: clamp(1rem, 2vw, 1.5rem);
    --motion-fast: 140ms;
    --motion-normal: 220ms;
  }
}

@layer base {
  body {
    background: var(--bg);
    color: var(--text);
    font: 16px/1.65 system-ui, sans-serif;
  }

  a {
    color: var(--accent);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
}
```

## 레이아웃 기준

### 읽기 shell

```css
.page-shell {
  width: min(100% - 2rem, var(--page));
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 4rem);
}

.doc-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
  gap: clamp(1.5rem, 4vw, 3rem);
}

.doc-main {
  max-inline-size: var(--content);
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

### 본문 rhythm

```css
.doc-main :where(h1, h2, h3) {
  line-height: 1.2;
}

.doc-main h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-block: 0 0.5em;
}

.doc-main h2 {
  margin-block: 2em 0.6em;
}

.doc-main p,
.doc-main li {
  line-height: 1.65;
}

.lede {
  color: var(--muted);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
}
```

## 컴포넌트 기준

### 패널

```css
.panel {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
}
```

패널은 반복 항목, 요약, 상태, 도구, 예시를 담을 때 쓴다. 페이지 전체 섹션을 장식용 카드로 감싸지 않는다.

### 상태 배지

```html
<span class="status-badge" data-tone="warning">검토 필요</span>
```

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.25em 0.65em;
  border: 1px solid var(--badge-line);
  border-radius: 999px;
  background: var(--badge-bg);
  color: var(--badge-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.status-badge[data-tone="warning"] {
  --badge-bg: rgb(242 198 109 / 0.14);
  --badge-line: rgb(242 198 109 / 0.45);
  --badge-text: #f5d58a;
}
```

색상만으로 상태를 전달하지 말고 텍스트 label을 함께 둔다.

### 코드 블록

```css
pre {
  overflow: auto;
  padding: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: var(--radius);
  background: #0b0d10;
}

code {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.92em;
}
```

### 반응형 표

```html
<div class="table-scroll">
  <table>
    <thead>
      <tr>
        <th>항목</th>
        <th>역할</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Input</td>
        <td>시작 조건</td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.table-scroll table {
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
}
```

### Details accordion

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

## 기술 정보 시각화 패턴

시각 요소는 정보를 더 잘 이해하게 할 때만 쓴다.

| 목표 | 권장 패턴 |
| --- | --- |
| 실행 순서 | timeline, numbered flow, event log |
| 상태 변화 | state panel, badge, transition diagram |
| 조건 평가 | decision matrix, checklist, pass/fail rows |
| 데이터 흐름 | pipeline, arrows, source/target panels |
| 선택/점수 | ranked list, score table, heatmap-lite |
| 디버깅 | symptom table, inspection checklist, log panel |
| 게임 시스템 | HUD, resource meter, cooldown ring, skill tree |
| 공간/방향 | SVG scene, vector diagram, path overlay |

### Timeline

```css
.timeline {
  list-style: none;
  padding: 0;
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
  top: 0.35rem;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--accent);
}

.timeline li::after {
  content: "";
  position: absolute;
  inset-inline-start: 0.68rem;
  top: 1.25rem;
  bottom: -1rem;
  width: 1px;
  background: var(--line);
}

.timeline li:last-child::after {
  display: none;
}
```

### Flow step

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

### Debug checklist

```html
<section class="panel debug-panel">
  <h2>디버깅 체크리스트</h2>
  <ol>
    <li>필수 설정이 켜져 있는지 확인한다.</li>
    <li>호출 시점과 실행 주체를 확인한다.</li>
    <li>로그와 런타임 상태를 비교한다.</li>
  </ol>
</section>
```

## 게임/개발 문서 패턴

게임과 개발 문서는 단순 카드 나열보다 상태와 흐름을 보여줄 때 가치가 크다.

| 주제 | 보여줄 것 |
| --- | --- |
| 전투/HUD | 자원, 쿨다운, 버프, 경고, 입력 피드백 |
| AI/Behavior Tree | 의사결정 흐름, 조건, 현재 노드, Blackboard 상태 |
| EQS/Navigation | 후보 생성, 점수, 선택 결과, 경로, 비용 |
| Networking | 서버, owning client, other client, RPC 경로, 실패 이유 |
| Replication | authority, condition, relevancy, dormancy, RepNotify |
| GAS | 입력, ASC, ability, cost, cooldown, effect, tag, cue |
| Animation | pose 선택, montage timing, root motion, target marker |
| Physics | force, impulse, sweep, collision normal, constraint |

인터랙티브 문서가 필요하면 아래 구성을 우선한다.

- controls: 버튼, 토글, 슬라이더, segmented control
- scene: 상태가 바로 바뀌는 SVG 또는 HTML/CSS 장면
- state chips: 현재 선택, 점수, 실행 위치, 결과
- event log: 왜 그런 결과가 나왔는지 설명
- accessibility: `aria-pressed`, `aria-live`, SVG `role="img"` 또는 `aria-label`

## 접근성 기준

- `html lang="ko"`를 둔다.
- `meta viewport`를 둔다.
- 제목 계층을 건너뛰지 않는다.
- 링크 텍스트는 목적지를 설명한다.
- 이미지에는 의미 있는 `alt`를 둔다. 장식 이미지는 `alt=""` 또는 CSS background로 처리한다.
- 키보드 focus 표시를 제거하지 않는다.
- 색상만으로 상태를 구분하지 않는다.
- 표는 데이터 비교에 사용하고 레이아웃 용도로 쓰지 않는다.
- 모션은 `prefers-reduced-motion`을 지원한다.

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

## 반응형과 fallback

새 CSS 기능은 다음 순서로 판단한다.

1. MDN Baseline 또는 compatibility를 확인한다.
2. 기본 레이아웃이 기능 없이도 읽히게 만든다.
3. `@supports`로 지원 브라우저에만 향상 효과를 적용한다.
4. 모바일에서 사이드바, 표, HUD, SVG label이 겹치지 않게 확인한다.

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

## 인쇄/PDF 기준

이력서, 포트폴리오, 공유용 기술 문서는 인쇄 스타일을 둔다.

```css
@media print {
  :root {
    color-scheme: light;
  }

  body {
    background: white;
    color: black;
  }

  nav,
  .no-print,
  .decorative-bg {
    display: none !important;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
  }

  section,
  figure,
  pre {
    break-inside: avoid;
  }
}
```

## 전체 템플릿

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>기술 문서</title>
  <style>
    @layer reset, tokens, base, layout, components;

    @layer reset {
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; }
      img, svg { max-width: 100%; }
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
        font: 16px/1.65 system-ui, sans-serif;
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

      .doc-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 18rem;
        gap: 2rem;
      }

      .doc-main {
        max-inline-size: 72ch;
      }

      @media (max-width: 860px) {
        .doc-layout { grid-template-columns: 1fr; }
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
  <a class="skip-link" href="#main">본문으로 이동</a>

  <main id="main" class="page">
    <article class="doc-layout">
      <div class="doc-main">
        <header>
          <p>Technical Note</p>
          <h1>기능 이름</h1>
          <p>이 기능이 무엇이고 언제 쓰는지 설명한다.</p>
        </header>

        <section class="panel">
          <h2>핵심 결론</h2>
          <ul>
            <li>가장 중요한 결론.</li>
            <li>먼저 확인할 조건.</li>
          </ul>
        </section>
      </div>

      <aside class="panel" aria-label="문서 요약">
        <h2>요약</h2>
        <p>나중에 다시 읽을 때 필요한 핵심만 둔다.</p>
      </aside>
    </article>
  </main>
</body>
</html>
```

## 검토 체크리스트

문서를 만들거나 수정한 뒤 아래 기준을 확인한다.

- [ ] 첫 화면에서 목적, 핵심 결론, 읽는 순서가 보인다.
- [ ] `main`, `article`, `section`, `aside`, `nav`가 의미에 맞게 쓰였다.
- [ ] 제목 계층이 순서대로 구성되어 있다.
- [ ] 링크와 버튼의 역할이 뒤섞이지 않았다.
- [ ] 키보드 focus 표시가 보인다.
- [ ] 색상만으로 상태를 전달하지 않는다.
- [ ] 본문 읽기 폭과 줄간격이 장문에 적합하다.
- [ ] 모바일에서 사이드바, 표, HUD, SVG label이 겹치지 않는다.
- [ ] 표는 가로 스크롤 또는 모바일 대체 구조를 가진다.
- [ ] 코드블록은 가로 스크롤이 가능하다.
- [ ] 모션은 `prefers-reduced-motion`을 지원한다.
- [ ] 새 CSS 기능은 `@supports` 또는 fallback을 가진다.
- [ ] 그래픽 효과가 텍스트 가독성을 해치지 않는다.
- [ ] 인쇄/PDF가 필요한 문서는 `@media print`가 있다.
- [ ] CSS token과 class 이름이 재사용 가능하게 정리되어 있다.

## 참고 자료

| 자료 | 활용 |
| --- | --- |
| [MDN HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) | HTML 요소와 의미 구조 확인 |
| [MDN Headings](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | heading 계층과 접근성 기준 |
| [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) | CSS 속성, 선택자, 모듈 확인 |
| [MDN Cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) | CSS 우선순위 관리 |
| [MDN CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables) | 디자인 토큰 관리 |
| [MDN Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) | 컴포넌트 단위 반응형 |
| [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | 모션 민감도 대응 |
| [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) | 접근성 기준 |
| [W3C WAI Writing for Web Accessibility](https://www.w3.org/WAI/tips/writing/) | 읽기 쉬운 웹 문서 작성 |
| [Diátaxis](https://diataxis.fr/) | 문서 목적별 구조화 |
| [web.dev Learn CSS](https://web.dev/learn/css) | 현대 CSS 학습 기준 |
| [web.dev Learn Accessibility](https://web.dev/learn/accessibility) | 접근성 기본 흐름 |

## 운영 규칙

- 이 문서는 standalone HTML/CSS 문서의 기준점으로 사용한다.
- 기존 산출물을 그대로 복제하기보다, 이 문서의 구조와 패턴을 상황에 맞게 조합한다.
- 게임 문서에서는 몰입감보다 정보 전달, 상태 이해, 디버깅 가능성을 우선한다.
- CSS 효과를 추가할 때마다 "이 효과가 구조, 탐색, 상태 이해를 돕는가"를 확인한다.
- 새로운 CSS 기능은 재미보다 안정성과 fallback을 먼저 확인한다.

---
aliases:
  - Obsidian 가독성 기준
  - 마크다운 스타일 가이드
  - 다크 테마 문서 작성 기준
tags:
  - obsidian
  - markdown
  - readability
  - dark-theme
type: guide
status: stable
usage: prompt-reference
created: 2026-05-26
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# Obsidian 문서 가독성 기준

> [!summary] 목적
> 이 문서는 Obsidian에서 오래 읽어도 피로가 적고, 다시 찾아보기 쉬우며, 어두운 계열 테마에서도 깔끔하게 보이는 Markdown 작성 기준을 정리한 기준서이다. 현재 Vault의 `Minimal` 테마, `minimal-flexoki-dark` 계열, 18px 본문 크기, `space.css` 스니펫 환경을 전제로 한다.

## AI 적용 규칙

프롬프트에서 이 파일을 읽고 적용하라고 지시받은 AI는 이 섹션을 우선 적용한다.

1. 이 문서는 `C:\Users\DAMO\Documents\Obsidian` Vault의 Markdown 문서 작성, 수정, 재구성, 템플릿 생성, CSS 예시 작성에 적용되는 스타일 기준이다.
2. 우선순위는 `사용자의 명시 지시 > 현재 편집 대상 문서의 기존 규칙 > 이 기준 문서 > 일반 Markdown/Obsidian 관례` 순서로 둔다.
3. 기존 문서를 수정할 때는 원래 문서의 목적, 용어, 폴더 맥락을 유지하고, 가독성 개선에 필요한 구조 정리만 한다.
4. 새 문서를 만들 때는 `요약 -> 핵심 결론 -> 상세 -> 예시 -> 참고` 흐름을 기본값으로 사용한다.
5. Obsidian 전용 문법은 내부 링크, 콜아웃, Properties, Templates, Bases처럼 실제 활용성이 있을 때만 사용한다.
6. HTML 인라인 스타일은 새로 늘리지 않는다. 반복 스타일은 CSS snippet 예시나 `cssclasses` 방식으로 제안한다.
7. 다크 테마 기준을 우선하여 순백/순검정 대비, 과한 강조색, 긴 굵은 문장, 넓게 퍼진 장문을 피한다.
8. 문서가 길어질수록 제목 계층, 표, 목록, 콜아웃, 체크리스트를 사용해 스캔 가능하게 만든다.
9. `.obsidian` 설정, 기존 CSS snippet, 테마 파일은 사용자가 명시적으로 요청하지 않는 한 변경하지 않는다.
10. 작업 후에는 이 문서의 `검토 체크리스트`에 맞춰 제목 구조, 문단 길이, 코드블록, 링크, 다크 테마 가독성을 점검한다.

### 프롬프트에서 부르는 방법

아래처럼 지시하면 이 문서를 작업 기준으로 삼기 쉽다.

```text
`Obsidian 문서 가독성 기준.md`를 먼저 읽고, 그 기준에 맞춰 이 문서를 재구성해줘.
특히 `AI 적용 규칙`, `문서 구조 기준`, `Markdown 작성 기준`, `검토 체크리스트`를 우선 반영해줘.
원문 의미는 보존하고, Obsidian에서 읽기 좋은 다크 테마 친화 Markdown으로 정리해줘.
```

## 빠른 결론

1. 한 문서는 하나의 중심 주제만 다룬다.
2. 문서 시작 10줄 안에 목적, 결론, 읽는 순서를 둔다.
3. 제목은 `#`부터 건너뛰지 않고 계층적으로 쓴다.
4. 긴 문단은 3~5문장 안에서 끊고, 목록은 5~7개 단위로 나눈다.
5. 표는 비교와 체크리스트에만 쓰고, 설명문을 표 안에 길게 넣지 않는다.
6. 콜아웃은 정보의 성격을 구분할 때만 쓴다. 장식용으로 남발하지 않는다.
7. 어두운 테마에서는 순백색 텍스트와 순검정 배경을 피하고, 짙은 회색 표면과 부드러운 밝은 회색 텍스트를 쓴다.
8. 본문은 16px 이상, 장문은 줄간격 1.5 안팎, 줄 길이는 너무 넓게 퍼지지 않게 관리한다.
9. HTML은 Markdown으로 해결되지 않는 경우에만 쓰고, 반복 스타일은 CSS snippet과 `cssclasses`로 분리한다.
10. 링크, 태그, 속성은 "나중에 찾기 위한 장치"로 쓰며, 꾸미기 용도로 쓰지 않는다.

## 현재 Vault 기준

| 항목 | 현재 상태 | 기준 |
| --- | --- | --- |
| 테마 | `Minimal` | 기본 스타일은 Minimal 설정을 우선한다. |
| 다크 스킴 | `minimal-flexoki-dark` | 따뜻한 저채도 다크 팔레트를 유지한다. |
| 본문 크기 | 18px | 장문 읽기에 적합하므로 유지한다. |
| 줄간격 | Minimal 1.5, `space.css` 일부 1.4 | 장문은 1.5를 우선하고, 편집 화면 밀도가 높으면 1.4까지 허용한다. |
| 활성 CSS snippet | `space.css` | 폭 확장과 문단 간격을 이미 조정 중이므로 새 CSS는 충돌을 피한다. |
| 주요 코어 플러그인 | Backlinks, Outgoing links, Tags, Daily notes, Templates, Canvas, Bases, Outline | 기본 기능 중심으로 문서 체계를 만든다. |
| 주요 커뮤니티 플러그인 | Minimal Settings, Editing Toolbar, Excalidraw, Kanban, Table Editor, Remotely Save | 편집 보조와 시각 자료에 활용한다. |

> [!important] 기본 원칙
> 이 Vault에서는 문서의 "예쁨"보다 읽기 흐름, 검색성, 재사용성을 우선한다. 시각 효과는 문서 구조를 더 명확하게 할 때만 사용한다.

## 문서 구조 기준

### 기본 뼈대

대부분의 학습, 조사, 정리 문서는 아래 순서를 기본으로 쓴다.

```markdown
---
tags:
  - topic/example
status: draft
created: 2026-05-26
updated: 2026-05-26
---

# 문서 제목

> [!summary] 요약
> 이 문서에서 다루는 핵심 결론을 2~4줄로 적는다.

## 핵심 결론

- 가장 중요한 결론
- 바로 써먹을 수 있는 기준
- 주의해야 할 점

## 배경

왜 이 내용을 정리하는지 적는다.

## 상세

내용을 제목, 목록, 표, 예시로 나누어 정리한다.

## 예시

실제 사용 예시를 둔다.

## 참고

- [자료명](https://example.com)
```

### 제목 계층

| 계층 | 용도 | 기준 |
| --- | --- | --- |
| `#` | 문서 제목 | 파일당 1개만 사용한다. |
| `##` | 큰 장 | 문서의 주요 목차이다. |
| `###` | 세부 장 | 설명, 기준, 예시를 나눈다. |
| `####` | 보조 항목 | 너무 많아지면 문서를 분리한다. |

제목은 키워드가 먼저 보이게 쓴다.

```markdown
## 좋은 예
## Markdown 표 작성 기준

## 피할 예
## 표에 대해서 알아야 할 여러 가지 내용
```

### 문단

- 한 문단은 한 생각만 담는다.
- 장문 문단은 3~5문장 안에서 끊는다.
- 문단 사이에는 빈 줄을 둔다.
- 강조 문장은 굵게 처리하기보다 별도 문단이나 콜아웃으로 분리한다.
- 웹 문서처럼 스캔되는 글은 첫 문장에 결론을 둔다.

### 목록

목록은 순서가 중요하면 번호 목록, 순서가 중요하지 않으면 글머리 목록을 쓴다.

```markdown
1. 자료를 수집한다.
2. 기준을 뽑는다.
3. 내 Vault에 맞게 적용한다.

- 비교 기준
- 장점
- 단점
- 예외
```

목록이 7개를 넘으면 작은 제목으로 쪼개거나 표로 바꾼다.

## Markdown 작성 기준

### 호환성 기준

Obsidian은 CommonMark, GitHub Flavored Markdown, LaTeX, Obsidian 확장 문법을 함께 지원한다. 다른 앱으로 옮길 가능성이 있는 문서는 CommonMark와 GitHub Flavored Markdown 중심으로 작성하고, Obsidian 전용 기능은 필요한 곳에만 쓴다.

| 구분 | 예시 | 이동성 |
| --- | --- | --- |
| 기본 Markdown | 제목, 목록, 링크, 이미지, 코드블록 | 높음 |
| GFM 확장 | 표, 체크박스, 취소선 | 높음 |
| Obsidian 확장 | `[[내부 링크]]`, `![[임베드]]`, 콜아웃, 블록 참조 | Obsidian 중심 |
| HTML | `<span>`, `<table>`, `<details>` | 렌더러마다 다름 |
| CSS snippet | `cssclasses`, 테마 변수 | Obsidian 중심 |

> [!warning] HTML 안의 Markdown
> Obsidian은 HTML 태그 내부의 Markdown을 렌더링하지 않는다. `<div>**굵게**</div>`처럼 쓰면 굵게 표시되지 않을 수 있다. HTML이 필요하면 그 안에서는 HTML 문법만 쓰거나, Markdown 구조를 유지하고 CSS로 스타일링한다.

### 강조

```markdown
**중요한 용어**
*가벼운 강조*
==하이라이트==
~~취소된 내용~~
`짧은 코드 또는 명령어`
```

사용 기준은 다음과 같다.

| 표현 | 용도 | 남용 시 문제 |
| --- | --- | --- |
| `**굵게**` | 핵심 용어, 결론 | 전체가 시끄러워진다. |
| `==하이라이트==` | 나중에 다시 볼 표시 | 색이 많아져 문서가 산만해진다. |
| `` `코드` `` | 파일명, 명령어, 속성명 | 일반 문장 흐름이 끊긴다. |
| 콜아웃 | 주의, 요약, 예시 | 문서 전체가 박스처럼 보인다. |

### 표

표는 비교, 기준, 속성 정리에 적합하다.

```markdown
| 항목 | 권장 | 피할 것 |
| --- | --- | --- |
| 제목 | 짧고 구체적으로 | 긴 문장형 제목 |
| 표 | 비교 중심 | 긴 설명문 채우기 |
| 링크 | 의미 있는 문장에 연결 | "여기"만 링크 |
```

표 안에는 짧은 문구를 넣는다. 설명이 길어지면 표 아래에 문단으로 뺀다.

### 코드블록

코드블록에는 언어명을 붙인다.

````markdown
```cpp
void Example()
{
    UE_LOG(LogTemp, Log, TEXT("Readable code block"));
}
```

```css
.markdown-preview-view {
  line-height: 1.5;
}
```
````

명령어는 코드블록보다 짧은 인라인 코드가 읽기 쉽다.

```markdown
`Ctrl + P`로 Command Palette를 연다.
```

### 체크박스

작업은 체크박스로, 설명은 일반 목록으로 쓴다.

```markdown
## 작업

- [ ] 자료 수집
- [ ] 기준 정리
- [ ] 예시 추가
- [ ] 검토
```

완료 이력까지 오래 남길 작업은 `done`, `updated`, `status` 같은 속성을 함께 둔다.

### 링크

내부 링크는 문서 간 관계가 실제로 있을 때만 만든다.

```markdown
[[옵시디언/콜아웃]]
[[Obsidian 문서 가독성 기준#Markdown 작성 기준]]
[[문서명|표시할 이름]]
```

사용 기준은 다음과 같다.

| 링크 | 용도 |
| --- | --- |
| 내부 링크 | 관련 노트 연결 |
| 백링크 | 어떤 문서가 이 주제를 참조하는지 확인 |
| 아웃고잉 링크 | 현재 문서에서 뻗어나가는 자료 확인 |
| 태그 | 같은 성격의 문서 묶기 |

### 태그

태그는 상태, 주제, 자료 유형을 분리해서 쓴다.

```yaml
tags:
  - obsidian/markdown
  - status/draft
  - type/guide
```

권장 규칙은 다음과 같다.

- 태그는 3~7개 안에서 유지한다.
- 공백 대신 `kebab-case`나 `/` 계층을 쓴다.
- `#공부`, `#정리`, `#중요`처럼 너무 넓은 태그는 줄인다.
- 문서 제목으로 충분한 정보는 태그로 반복하지 않는다.

### Properties

속성은 기계가 읽을 수 있는 짧은 정보에만 쓴다.

```yaml
---
title: Obsidian 문서 가독성 기준
status: stable
type: guide
created: 2026-05-26
updated: 2026-05-26
tags:
  - obsidian
  - markdown
---
```

| 속성 | 용도 |
| --- | --- |
| `status` | `draft`, `review`, `stable`, `archived` |
| `type` | `guide`, `note`, `project`, `reference`, `daily` |
| `created` | 최초 작성일 |
| `updated` | 마지막 갱신일 |
| `source` | 원문 URL |
| `cssclasses` | 문서별 스타일 적용 |

> [!note] 속성에 넣지 않을 것
> 긴 설명, Markdown 서식, 중첩 구조는 속성보다 본문에 두는 편이 낫다. 속성은 검색, 필터링, Bases, Dataview 같은 도구가 읽기 쉬워야 한다.

## Obsidian 활용 기준

### Templates

반복되는 문서에는 Template을 쓴다.

```markdown
---
status: draft
type: note
created: "{{date:YYYY-MM-DD}}"
updated: "{{date:YYYY-MM-DD}}"
tags:
  - inbox
---

# {{title}}

> [!summary] 요약
> 

## 핵심

- 

## 상세

## 참고

- 
```

템플릿은 다음 기준으로 나눈다.

| 템플릿 | 목적 |
| --- | --- |
| 학습 노트 | 개념, 원리, 예시, 질문 정리 |
| 자료 수집 | URL, 요약, 인용, 내 해석 분리 |
| 프로젝트 | 목표, 범위, 작업, 결정, 회고 |
| Daily note | 오늘 할 일, 기록, 배운 것, 내일로 넘길 것 |
| 블로그 초안 | 독자, 결론, 구조, 본문, 퇴고 체크 |

### Daily notes

Daily note는 모든 내용을 영구 보관하는 장소가 아니라 임시 수집과 하루 단위 기록의 입구로 쓴다.

```markdown
# {{date:YYYY-MM-DD}}

## 오늘의 초점

- 

## 할 일

- [ ] 

## 기록

- 

## 배운 것

- 

## 옮길 것

- [ ] 영구 노트로 분리:
```

기준은 다음과 같다.

- 하루 기록은 빠르게 쓴다.
- 중요한 내용은 주제 노트로 옮긴다.
- 반복 체크리스트는 너무 길게 만들지 않는다.
- Daily note에서 시작하되, 지식은 주제별 문서에 남긴다.

### Bases

Bases는 Markdown 파일과 Properties를 데이터베이스처럼 보는 기능이다. 프로젝트, 독서 목록, 학습 자료, 글쓰기 초안처럼 상태와 날짜가 중요한 문서에 적합하다.

```yaml
filters:
  and:
    - file.hasTag("obsidian")
views:
  - type: table
    name: "Obsidian 자료"
    order:
      - file.name
      - note.status
      - note.updated
```

Bases를 쓰기 좋은 경우는 다음과 같다.

| 대상 | 필요한 속성 |
| --- | --- |
| 학습 자료 | `topic`, `status`, `difficulty`, `updated` |
| 프로젝트 | `status`, `priority`, `deadline`, `owner` |
| 블로그 초안 | `status`, `audience`, `published`, `updated` |
| 독서 목록 | `author`, `status`, `rating`, `finished` |

### Canvas

Canvas는 긴 글을 쓰기 전 구조를 잡거나, 개념 사이 관계를 시각화할 때 쓴다.

사용 기준은 다음과 같다.

- 개념 관계가 복잡할 때 사용한다.
- 최종 지식은 Markdown 노트로 옮긴다.
- Canvas는 지도이고, 노트는 본문이다.
- 카드가 많아지면 주제별 Canvas로 분리한다.

### Backlinks와 Outgoing links

내부 링크를 만들었다면 Backlinks와 Outgoing links를 주기적으로 확인한다.

| 기능 | 확인할 것 |
| --- | --- |
| Backlinks | 이 문서를 참조하는 문맥 |
| Unlinked mentions | 링크로 바꿀 만한 언급 |
| Outgoing links | 이 문서가 의존하는 자료 |
| Graph view | 연결이 너무 끊긴 문서 또는 과하게 연결된 문서 |

## 콜아웃 기준

콜아웃은 문서 흐름을 돕기 위한 구조 장치이다.

```markdown
> [!note] 일반 정보
> 본문 흐름에서 보조 설명이 필요할 때 사용한다.

> [!tip] 팁
> 바로 적용 가능한 요령을 적는다.

> [!warning] 주의
> 실수하기 쉬운 조건이나 제한을 적는다.

> [!example] 예시
> 사용 예시를 보여준다.

> [!summary] 요약
> 장이나 문서의 결론을 압축한다.
```

### 타입별 용도

| 타입 | 용도 | 권장 빈도 |
| --- | --- | --- |
| `summary`, `tldr` | 문서 시작 또는 장 끝 요약 | 낮음 |
| `note`, `info` | 보조 정보 | 중간 |
| `tip`, `hint` | 실전 팁 | 중간 |
| `warning`, `caution` | 주의사항 | 낮음 |
| `danger`, `error` | 치명적 문제 | 매우 낮음 |
| `example` | 예시 | 중간 |
| `quote`, `cite` | 인용 또는 출처 메모 | 낮음 |

### 접기 콜아웃

긴 보충 설명은 접기 콜아웃으로 둔다.

```markdown
> [!example]- 긴 예시
> 기본 상태에서는 접혀 있다.
> 필요할 때만 펼쳐서 본다.
```

접기 기준은 다음과 같다.

- 본문 이해에 필수이면 접지 않는다.
- 참고용 코드, 긴 로그, 긴 사례는 접는다.
- 너무 많은 접기 블록은 문서 탐색을 방해한다.

## 어두운 계열 가독성 기준

### 색상

어두운 테마는 단순히 색을 반전하는 방식으로 만들면 읽기 어렵다. 순검정 배경과 순백색 텍스트는 대비가 강해 글자가 번져 보이거나 피로해질 수 있다.

권장 방향은 다음과 같다.

| 요소 | 권장 |
| --- | --- |
| 배경 | 순검정 `#000000`보다 짙은 회색 계열 |
| 표면 | 배경보다 조금 밝은 회색 |
| 본문 | 순백색보다 낮은 밝기의 밝은 회색 |
| 보조 텍스트 | 본문보다 낮은 대비, 단 WCAG 기준 미달 금지 |
| 강조색 | 채도를 낮추고 넓은 면적에 쓰지 않기 |
| 경고색 | 빨강/노랑을 큰 배경으로 쓰지 않고 선, 아이콘, 제목 위주로 사용 |

### 대비

기본 목표는 다음과 같다.

| 대상 | 최소 목표 |
| --- | --- |
| 일반 본문 | 4.5:1 이상 |
| 큰 텍스트 | 3:1 이상 |
| 아이콘, 경계, 포커스 표시 | 3:1 이상 |
| 장시간 읽는 본문 | 가능하면 7:1에 가깝게, 단 과도한 눈부심은 피하기 |

> [!warning] 대비 숫자만 믿지 않기
> WCAG 대비 기준을 통과해도 글자가 너무 얇거나, 배경이 복잡하거나, 색이 너무 선명하면 실제 읽기는 불편할 수 있다. 다크 테마에서는 대비, 글자 굵기, 줄간격, 배경 복잡도를 함께 본다.

### 줄 길이와 줄간격

장문은 너무 넓게 펼치지 않는다. 현재 `space.css`는 읽기 폭을 넓히는 설정을 포함하므로, 긴 글에서는 Obsidian의 readable line length나 Minimal의 line width 설정을 함께 확인한다.

권장 기준은 다음과 같다.

| 항목 | 기준 |
| --- | --- |
| 본문 크기 | 16~18px 이상 |
| 장문 줄간격 | 1.5 전후 |
| 짧은 UI 텍스트 | 1.2~1.35 |
| 문단 간격 | 약 1em |
| 목록 간격 | 문단보다 조금 좁게 |
| 제목 위 여백 | 제목 아래보다 넓게 |

### 글자 스타일

- 긴 문장을 전부 굵게 쓰지 않는다.
- 긴 문장을 전부 기울임으로 쓰지 않는다.
- 대문자만 긴 줄로 쓰지 않는다.
- 작은 글자에는 너무 낮은 대비를 쓰지 않는다.
- 다크 테마에서는 너무 얇은 폰트 굵기를 피한다.

## HTML + CSS 활용 기준

### 인라인 HTML을 써도 되는 경우

Markdown만으로 표현하기 어려운 경우에 제한적으로 쓴다.

```html
<kbd>Ctrl</kbd> + <kbd>P</kbd>

<details>
  <summary>접기 제목</summary>
  <p>HTML 안에서는 Markdown 문법 대신 HTML을 쓴다.</p>
</details>
```

피할 예시는 다음과 같다.

```html
<p style="font-size: 70px">너무 큰 텍스트</p>
<center>가운데 정렬</center>
<big>크게</big>
```

이런 방식은 문서마다 스타일이 흩어지고, 모바일이나 다른 테마에서 깨지기 쉽다. 반복되는 스타일은 CSS snippet으로 옮긴다.

### cssclasses 사용

문서별 스타일이 필요하면 frontmatter에 `cssclasses`를 넣는다.

```yaml
---
cssclasses:
  - readable-guide
---
```

그리고 CSS snippet에서 클래스를 정의한다.

```css
.readable-guide.markdown-preview-view {
  --line-height-normal: 1.55;
}
```

### Minimal 환경용 CSS 예시

아래 CSS는 바로 적용하라는 뜻이 아니라, 필요한 경우 `.obsidian/snippets`에 별도 파일로 저장해 실험할 수 있는 예시이다. 기존 `space.css`와 충돌할 수 있으므로 적용 전 한 항목씩 테스트한다.

```css
/* readable-guide.css */

.theme-dark .readable-guide {
  --text-normal: #d8d2c2;
  --text-muted: #aaa391;
  --background-primary: #141414;
  --background-secondary: #1b1b1b;
  --background-modifier-border: #34312b;
}

.readable-guide.markdown-preview-view,
.readable-guide.markdown-source-view {
  line-height: 1.55;
}

.readable-guide.markdown-preview-view h1,
.readable-guide.markdown-preview-view h2,
.readable-guide.markdown-preview-view h3 {
  margin-top: 1.8em;
  margin-bottom: 0.55em;
}

.readable-guide.markdown-preview-view p {
  margin-block: 0.9em;
}

.readable-guide.markdown-preview-view table {
  font-size: 0.95em;
}

.readable-guide.markdown-preview-view code {
  font-size: 0.92em;
}

.readable-guide.markdown-preview-view .callout {
  border-radius: 8px;
}
```

## 바로 쓰는 템플릿

### 학습 노트

````markdown
---
type: study
status: draft
created: "{{date:YYYY-MM-DD}}"
updated: "{{date:YYYY-MM-DD}}"
tags:
  - study
---

# {{title}}

> [!summary] 요약
> 

## 핵심 개념

- 

## 왜 중요한가

- 

## 작동 방식

1. 
2. 
3. 

## 예시

```text
예시를 적는다.
```

## 헷갈리는 점

- 

## 관련 문서

- [[]]
````

### 자료 수집 노트

```markdown
---
type: source
status: inbox
source:
created: "{{date:YYYY-MM-DD}}"
updated: "{{date:YYYY-MM-DD}}"
tags:
  - source
---

# {{title}}

> [!summary] 한 줄 요약
> 

## 출처

- URL:
- 작성자:
- 발행일:
- 확인일: {{date:YYYY-MM-DD}}

## 핵심 주장

- 

## 쓸 만한 내용

- 

## 내 해석

- 

## 연결할 문서

- [[]]
```

### 프로젝트 노트

```markdown
---
type: project
status: active
priority: medium
created: "{{date:YYYY-MM-DD}}"
updated: "{{date:YYYY-MM-DD}}"
tags:
  - project
---

# {{title}}

> [!summary] 목표
> 

## 성공 기준

- 

## 범위

- 포함:
- 제외:

## 작업

- [ ] 

## 결정 기록

| 날짜 | 결정 | 이유 |
| --- | --- | --- |
| {{date:YYYY-MM-DD}} |  |  |

## 참고

- 
```

### 블로그 초안

```markdown
---
type: writing
status: draft
audience:
created: "{{date:YYYY-MM-DD}}"
updated: "{{date:YYYY-MM-DD}}"
tags:
  - writing
---

# {{title}}

> [!summary] 독자가 얻어갈 것
> 

## 독자

- 

## 핵심 결론

- 

## 글 구조

1. 문제 제기
2. 핵심 설명
3. 예시
4. 정리

## 초안

## 퇴고 체크

- [ ] 제목이 구체적인가
- [ ] 첫 문단에 결론이 있는가
- [ ] 긴 문단을 나눴는가
- [ ] 표와 목록이 과하지 않은가
- [ ] 출처를 남겼는가
```

## 검토 체크리스트

문서를 다 쓴 뒤 아래 기준으로 빠르게 확인한다.

- [ ] 제목만 훑어도 구조가 보인다.
- [ ] 첫 화면에서 목적과 결론이 보인다.
- [ ] 한 문단이 너무 길지 않다.
- [ ] 목록이 7개 이상이면 나누었다.
- [ ] 표 안에 긴 문장을 넣지 않았다.
- [ ] 콜아웃을 장식용으로 쓰지 않았다.
- [ ] 링크 텍스트만 봐도 이동할 곳을 알 수 있다.
- [ ] 태그가 너무 넓거나 중복되지 않는다.
- [ ] 코드블록에 언어명을 붙였다.
- [ ] 다크 테마에서 흐리거나 눈부신 색이 없다.

## 자료별 핵심 정리

| 자료 | 핵심 반영 |
| --- | --- |
| [Obsidian Flavored Markdown](https://help.obsidian.md/obsidian-flavored-markdown) | Obsidian은 CommonMark, GFM, LaTeX와 자체 확장을 함께 지원한다. HTML 안의 Markdown은 렌더링되지 않는다. |
| [Obsidian Callouts](https://help.obsidian.md/callouts) | 콜아웃은 타입, 제목 변경, 접기, 중첩, CSS 커스터마이징을 지원한다. |
| [Obsidian CSS snippets](https://help.obsidian.md/snippets) | CSS snippet은 `.obsidian/snippets`에 두고 Appearance에서 활성화한다. CSS 변수와 `cssclasses`를 활용한다. |
| [Obsidian Templates](https://help.obsidian.md/Plugins/Templates) | `{{date}}`, `{{time}}`, `{{title}}` 같은 변수를 이용해 반복 문서를 줄인다. |
| [Obsidian Properties](https://help.obsidian.md/properties) | 속성은 짧고 구조화된 데이터에 적합하며, Markdown 서식이나 중첩 속성에는 제한이 있다. |
| [Obsidian Bases](https://obsidian.md/help/bases) | Properties 기반으로 파일을 표, 목록, 카드, 지도 형태로 보고 필터링한다. |
| [CommonMark](https://commonmark.org/) | Markdown의 모호함을 줄이기 위한 호환성 높은 표준이다. |
| [GitHub Flavored Markdown](https://github.github.com/gfm/) | CommonMark에 표, 체크박스, 취소선 등 실무 확장을 더한다. |
| [Markdown Guide](https://www.markdownguide.org/basic-syntax/) | 기본/확장 Markdown 문법 확인용 참고 자료이다. |
| [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | 일반 텍스트 4.5:1, 큰 텍스트 3:1 대비 기준을 제시한다. |
| [NN/g Low-Contrast Text](https://www.nngroup.com/articles/low-contrast/) | 저대비 텍스트는 가독성, 탐색성, 사용자 신뢰를 떨어뜨린다. |
| [USWDS Typography](https://designsystem.digital.gov/components/typography/) | 장문 줄간격, 문단 간격, 여백, 글꼴 스타일 사용 기준을 참고한다. |
| [Material Design Dark Theme](https://design.google/library/material-design-dark-theme) | 다크 테마는 순검정이 아니라 짙은 회색, 낮은 채도, 계층적 표면을 활용한다. |
| [MDN prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-color-scheme) | 사용자 시스템의 라이트/다크 선호를 감지하는 CSS 미디어 쿼리이다. |
| [MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) | 브라우저 기본 UI까지 색상 스킴에 맞게 렌더링하도록 힌트를 준다. |
| [Minimal Guide](https://minimal.guide/Home) | Minimal 테마의 line width, color scheme, helper classes, plugin support를 참고한다. |
| [Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/) | 메타데이터를 색인하고 쿼리해 동적 목록과 표를 만들 수 있다. |
| [Tasks User Guide](https://publish.obsidian.md/tasks/) | Vault 전체 작업을 쿼리하고 완료 상태를 관리할 수 있다. |
| [Obsidian Web Clipper Templates](https://help.obsidian.md/web-clipper/templates) | 웹 자료를 템플릿과 메타데이터로 수집하는 흐름에 적합하다. |

## 운영 규칙

이 문서는 한 번 만들고 끝내는 문서가 아니라 Vault 스타일 기준의 기준점으로 쓴다.

- 새 문서 템플릿을 만들 때 이 문서의 구조를 먼저 확인한다.
- CSS를 추가하기 전 이 문서의 다크 테마 기준을 확인한다.
- 글이 읽기 어렵다고 느껴지면 색보다 구조, 줄 길이, 문단 길이를 먼저 고친다.
- Obsidian 전용 문법은 편리하지만, 외부 공유 가능성이 있는 문서에는 최소화한다.
- 1~2개월에 한 번 실제로 자주 쓰는 문서와 맞지 않는 기준을 갱신한다.

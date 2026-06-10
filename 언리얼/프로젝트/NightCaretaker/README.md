---
aliases:
  - "NightCaretaker Document Hub"
tags:
  - nightcaretaker
  - project/nightcaretaker
  - hub
type: project-document
project: NightCaretaker
category: hub
status: organized
updated: 2026-05-26
cssclasses:
  - readable-guide
---

# NightCaretaker Document Hub

> [!summary] 문서 목적
> 이 폴더는 현재 제작 판단에 필요한 활성 문서만 전면에 둔다.

## 핵심 결론

- 이 문서는 NightCaretaker 프로젝트의 참고/보관 자료다.
- 현재 제작 판단은 루트의 Planning, Development, Art Master를 우선한다.
- 원문 내용은 유지하되, 후속 작업자가 빠르게 탐색할 수 있도록 구조를 보강했다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 문서 허브 |
| 파일 경로 | `README.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| 목적 | 주요 섹션 |
| 현재 활성 문서 | 주요 섹션 |
| 읽기 순서 | 주요 섹션 |
| 보관 문서 | 주요 섹션 |
| 현재 정리 상태 | 주요 섹션 |
| 유지보수 규칙 | 주요 섹션 |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## 목적

이 폴더는 현재 제작 판단에 필요한 활성 문서만 전면에 둔다.
세부 원문, 보조 다이어그램, HTML 보드, 과거 작업 산출물은 삭제하지 않고 `Archive` 또는 `Source`에서 추적한다.

## 현재 활성 문서

| 문서 | 역할 | 먼저 볼 때 |
| --- | --- | --- |
| [NightCaretaker_Planning_Master.md](./NightCaretaker_Planning_Master.md) | 제품 방향, 플레이 루프, 민원/이상 현상 모델, 수직 슬라이스 기준 | 게임이 무엇인지, 무엇을 만들지 결정할 때 |
| [NightCaretaker_Development_Master.md](./NightCaretaker_Development_Master.md) | UE 구현 구조, 런타임 시스템, 데이터/상태 계약 | C++/Blueprint 구현 기준이 필요할 때 |
| [NightCaretaker_Art_Master.md](./NightCaretaker_Art_Master.md) | 비주얼 방향, 환경/조명/프랍 제작 기준 | 레벨/아트/무드 제작 기준이 필요할 때 |

최상위 `Document`는 위 3개 마스터와 이 README만 유지한다.

## 읽기 순서

1. 제품 방향과 수직 슬라이스 범위를 확인하려면 `Planning_Master`를 읽는다.
2. 실제 UE 구현, 데이터 구조, 런타임 연결은 `Development_Master`에서 확인한다.
3. 공간, 조명, 프랍, 시각 무드는 `Art_Master`에서 확인한다.
4. 과거 원문이나 보조 다이어그램이 필요할 때만 `Archive`를 연다.
5. 작업 이력, 조사 결과, 의사결정 과정은 `Source`를 연다.

## 보관 문서

| 경로 | 역할 |
| --- | --- |
| [Archive/Planning](./Archive/Planning) | 기존 GDD, 307 비트시트, 민원 20종, 심리 공포 가이드, 이전 Planning Master 백업 |
| [Archive/Development](./Archive/Development) | 개발 원본 상세 문서 |
| [Archive/Art](./Archive/Art) | 아트 원본 상세 문서 |
| [Archive/Companion](./Archive/Companion) | 보조 다이어그램, HTML 보드, 매트릭스, 와이어프레임, PM 보드 |
| [Source](./Source) | 작업 단위 문서, 조사 결과, 정리/수정 이력 |

보기용 HTML 문서가 필요하면 아래 companion view를 연다.

| HTML View | 경로 |
| --- | --- |
| Planning Master View | [NightCaretaker_Planning_Master_View.html](./Archive/Companion/NightCaretaker_Planning_Master_View.html) |
| Development Master View | [NightCaretaker_Development_Master_View.html](./Archive/Companion/NightCaretaker_Development_Master_View.html) |
| Art Master View | [NightCaretaker_Art_Master_View.html](./Archive/Companion/NightCaretaker_Art_Master_View.html) |

## 현재 정리 상태

- `NightCaretaker_Planning_Master.md`는 2026-05-26에 활성 기획 기준서로 재작성했다.
- 기존 장문 Planning Master는 `Archive/Planning/NightCaretaker_Planning_Master_PreConsolidation_20260526.md`에 보관했다.
- 최상위 companion 문서와 HTML 보드는 `Archive/Companion`으로 이동했다.
- Planning/Development/Art Master 보기용 HTML은 `Archive/Companion`에 추가했고, 공통 보기용 CSS는 `NightCaretaker_Planning_Master_View.css`를 사용한다.
- `Development_Master`와 `Art_Master`는 2026-05-26에 Planning Master와 같은 실행 중심 기준서로 재작성했다.

## 유지보수 규칙

- 새 문서를 만들기 전에 기존 3개 마스터 중 하나의 섹션으로 흡수 가능한지 먼저 판단한다.
- 새 companion 문서가 필요하면 최상위에 두지 말고 `Archive/Companion` 또는 작업 중인 `Source` 문서에서 시작한다.
- 제품 기준으로 확정된 내용만 마스터 문서에 반영한다.
- 미정, 아이디어, 폐기안은 마스터 본문이 아니라 `Source`나 `Archive`에 남긴다.
- 마스터 문서에 새 항목을 추가할 때는 플레이어 행동, 시스템 반응, 구현 단위, 검증 기준을 함께 적는다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

---
aliases:
  - "Game Design Documentation Research - Detail"
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

# Game Design Documentation Research - Detail

> [!summary] 문서 목적
> 이 문서는 `NightCaretaker`의 기획 문서를 다시 작성하기 위한 사전 기준서다.

## 핵심 결론

- 이 문서는 작업 이력, 조사, 결정 과정, 구현 handoff를 추적하는 자료다.
- 활성 기준은 루트 Master 문서에 반영된 항목으로 판단한다.
- 후속 작업자는 입력 문서, 산출물, 완료 기준, 남은 리스크를 먼저 확인한다.

## 문서 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | NightCaretaker / 야간 관리인: 307호의 민원 |
| 문서 범주 | 작업 이력/조사 자료 |
| 파일 경로 | `Source/GameDesignDocumentationResearch_Detail.md` |
| 프로젝트 경로 | `D:\UnrealProjects\NightCaretaker` |
| 정리 기준 | `Obsidian 문서 가독성 기준.md`, `HTML CSS 문서 제작 및 활용 기준.md` |

## 문서 지도

| 섹션 | 역할 |
| --- | --- |
| Purpose | 주요 섹션 |
| Working Assumptions | 주요 섹션 |
| Executive Conclusion | 주요 섹션 |
| Research Tracks | 주요 섹션 |
| Source Review | 주요 섹션 |
| What A Game Design Document Must Decide | 주요 섹션 |
| Good GDD Quality Bar | 주요 섹션 |
| Recommended Documentation Architecture | 주요 섹션 |
| NightCaretaker GDD Template | 주요 섹션 |
| 0. Document Control | 세부 기준 |
| 1. One-Page Game Brief | 세부 기준 |
| 2. Player Fantasy And Role | 세부 기준 |
| 3. Design Pillars | 세부 기준 |
| 4. Player Verbs | 세부 기준 |
| 추가 섹션 11 개 | 원문 본문에서 이어서 확인한다. |

## 적용 기준

- 원문 의미와 프로젝트 용어를 보존한다.
- 긴 설명은 제목, 표, 목록, 체크리스트 중심으로 탐색 가능하게 유지한다.
- 활성 기준과 보관 자료를 구분한다.
- HTML companion 문서는 각 파일 내부에 CSS를 포함하는 self-contained 문서로 관리한다.

## 본문

## Purpose

이 문서는 `NightCaretaker`의 기획 문서를 다시 작성하기 위한 사전 기준서다.
목표는 "읽을 수 있는 긴 문서"가 아니라 "게임을 만들 때 결정과 검증에 쓰이는 문서"의 기준을 세우는 것이다.

## Working Assumptions

- 프로젝트는 UE 5.7.4, Win64 우선의 1인칭 싱글플레이 심리 공포 게임으로 본다.
- 현재 요청의 산출물은 기존 기획 문서 재작성본이 아니라, 향후 재작성에 사용할 조사/작성 규격 문서다.
- 문서는 한국어로 작성하되, 출처 제목과 고유 용어는 원문을 병기한다.
- 영상 자료는 공개 세션 페이지, 설명, 관련 요약이 확인 가능한 범위에서 반영한다. 접근 제한이 있는 전체 영상의 세부 발언은 임의로 단정하지 않는다.

## Executive Conclusion

기존 기획 문서가 장황하지만 실속이 약하게 느껴지는 주된 이유는 보통 문장량 문제가 아니다.
게임 기획 문서가 반드시 고정해야 하는 결정이 빠져 있거나, 결정과 구현/검증의 연결이 약할 때 그런 느낌이 난다.

앞으로 `NightCaretaker` 기획 문서는 다음 질문에 계속 답해야 한다.

| 질문 | 문서에 남아야 하는 형태 |
| --- | --- |
| 플레이어는 지금 무엇을 하려고 하는가? | 플레이어 동사, 목표, 입력, 시야/정보 |
| 게임은 어떻게 반응하는가? | 규칙, 상태 변화, 피드백, 실패/성공 조건 |
| 그 반응이 어떤 감정을 만들도록 설계되었는가? | 긴장, 의심, 안도, 불확실성 같은 목표 경험 |
| 구현자는 무엇을 만들면 되는가? | 데이터 필드, 이벤트, UI, 레벨 요소, 사운드/아트 요청 |
| 맞게 만들었는지 어떻게 확인하는가? | 수직 슬라이스 합격 기준, 플레이테스트 질문, 관찰 지표 |

`NightCaretaker`의 기획 중심축은 "야간 관리인의 민원 처리 루프가 점점 신뢰할 수 없게 변한다"여야 한다.
이 축에서 벗어난 설명, 세계관, 장치, 연출은 우선순위를 낮춰야 한다.

## Research Tracks

조사는 다음 축으로 정리한다.

1. 게임 디자인 방법론: 플레이어 경험, 메커닉, 다이내믹, 디자인 언어.
2. GDD 운영법: 거대한 정적 문서 대신 유지 가능한 기준서와 작은 상세 문서.
3. 문서 작성법: 독자, 목적, 구조, 업데이트 방식.
4. 심리 공포 적용: 불확실성, 제한된 주체성, 반복 루프 붕괴.

## Source Review

| Source | Type | Useful Point | Application |
| --- | --- | --- | --- |
| [MDA: A Formal Approach to Game Design and Game Research](https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/) | 논문/프레임워크 | 게임을 Mechanics, Dynamics, Aesthetics 관계로 분석한다. 디자이너는 메커닉을 만들지만 플레이어는 경험을 먼저 느낀다. | "무서운 분위기"를 직접 쓰지 말고, 어떤 규칙과 반응이 어떤 긴장을 만드는지 추적한다. |
| [Doug Church, Formal Abstract Design Tools](https://www.gamedeveloper.com/design/formal-abstract-design-tools) | 업계 방법론 | 공통 디자인 언어가 필요하며, 의도, 인지 가능한 결과, 스토리 같은 추상 도구로 플레이를 설명한다. | 민원 처리의 모든 핵심 행동에 "플레이어 의도"와 "인지 가능한 결과"를 붙인다. |
| [Game Design Methods: A 2003 Survey](https://www.gamedeveloper.com/design/game-design-methods-a-2003-survey) | 업계 조사 | 디자인 문서는 템플릿 자체보다 질문을 강제하는 구조가 중요하다. 과도한 전체 템플릿은 유지 비용이 커진다. | `Planning_Master`를 거대한 백과사전으로 두지 말고, 핵심 질문과 결정을 우선한다. |
| [Tim Ryan, The Anatomy of a Design Document](https://www.gamedeveloper.com/design/the-anatomy-of-a-design-document-part-1-documentation-guidelines-for-the-game-concept-and-proposal) | GDD 가이드 | 문서는 비전, 내용, 구현 계획을 전달해야 하며, 일정/테스트 계획으로 번역 가능해야 한다. | 각 섹션 끝에 구현 영향과 검증 기준을 붙인다. |
| [Stone Librande, One-Page Designs](https://www.gdcvault.com/play/1012356/One-Page%E2%80%8B) | GDC 영상 세션 | 긴 GDD는 읽히지 않기 쉽고, 한 페이지 안에 관계를 보여주는 시각적 설계 문서가 효과적이다. | 핵심 루프, 공간 흐름, 민원 상태 전이는 한 페이지 다이어그램으로 요약한다. |
| [GameDeveloper summary of One-Page Designs](https://www.gamedeveloper.com/design/video-one-page-designs) | 영상 소개/요약 | 전통적 GDD의 약점과 간결한 one-page design의 목적을 설명한다. | 마스터 문서 앞부분에 "게임의 한 페이지 기준"을 둔다. |
| [Valve, The Cabal design process](https://www.gamedeveloper.com/design/the-cabal-valve-s-design-process-for-creating-i-half-life-i-) | 업계 포스트모템 | 조용히 관찰하는 플레이테스트와 액션 아이템화가 의견 싸움을 줄인다. 디자인 문서는 프레임워크일 뿐, 플레이테스트가 품질을 결정한다. | 공포 루프는 내부 확신보다 관찰 테스트로 검증한다. |
| [Rayman Origins rational design article](https://www.gamedeveloper.com/design/-em-rayman-origins-em-designer-chris-mcentee-s-rational-approach-to-game-design) | 업계 방법론 | 불필요한 정보를 제거하고, 메커닉을 읽기 쉽게 소개하며, 난이도/학습 곡선을 관리한다. | 민원 난이도는 "도구, 이동 거리, 정보 모호성, 위험도" 같은 축으로 관리한다. |
| [The Level Design Book - Metrics](https://book.leveldesignbook.com/process/blockout/metrics) | 레벨 디자인 문서 | Rational design은 수치화에 유용하지만 공식주의 위험이 있다. | 공포 리듬은 수치표로 보조하되, 플레이테스트 관찰로 보정한다. |
| [Game Ontology Project](https://dl.digra.org/index.php/dl/article/view/136) | 학술 프레임워크 | 여러 게임을 분석해 공통 개념 계층을 만들려는 시도다. | 민원, 도구, 공간, 이상 현상을 같은 용어 체계로 관리한다. |
| [Patterns in Game Design excerpt](https://www.gamedeveloper.com/design/book-excerpt-i-patterns-in-game-design-i-using-design-patterns) | 디자인 패턴 | 패턴은 다학제 팀의 소통을 돕고, 특정 게임 맥락에 맞게 조합해야 한다. | "민원 접수", "신뢰 붕괴", "안전지대 귀환" 같은 반복 패턴을 정의한다. |
| [Designing Game Feel: A Survey](https://arxiv.org/abs/2011.09201) | 논문/서베이 | 게임 feel은 순간 상호작용의 감정적 영향 설계다. | 문 열기, 손전등, 무전, 수리 입력 같은 작은 행동의 반응성을 별도 품질 기준으로 둔다. |
| [Paralysing Fear: Player Agency Parameters in Horror Games](https://dl.digra.org/index.php/dl/article/view/1051) | 공포 게임 논문 | 공포는 플레이어 주체성 조절과 연결된다. 캐릭터, 시스템, 플레이어 차원의 agency 조작이 있다. | 통제 상실을 쓰되, 불공정하거나 입력을 빼앗는 방식은 제한한다. |
| [The Underwood Project: ambiguous threat](https://link.springer.com/article/10.3758/s13428-022-02002-3) | 심리/가상환경 연구 | 직접 위협 전의 예감, 시간/공간/정체/행동 선택의 불확실성이 긴장을 만든다. | 307호와 민원 이상 징후는 "언제, 어디서, 무엇이, 무엇을 해야 하는지"를 단계적으로 흐린다. |
| [Playing with Fear: The Aesthetics of Horror in Recent Indie Games](https://septentrio.uit.no/index.php/eludamos/article/view/vol10no1-12) | 인디 공포 연구 | 공포는 fiction emotion, gameplay emotion, artifact emotion이 섞여 평가된다. | 스토리 설정의 무서움과 실제 플레이 중 불안이 서로 따로 놀지 않게 만든다. |
| [GitBook, How to write a GDD](https://www.gitbook.com/blog/how-to-write-a-game-design-document) | 현대 GDD 가이드 | GDD, pitch deck, TDD를 구분하고, 게임별로 다른 구조가 필요하다고 본다. | 기획, 피치, 기술 문서를 섞지 않는다. |
| [Nuclino, GDD template](https://www.nuclino.com/articles/game-design-document-template) | 현대 GDD 가이드 | 현대 GDD는 가볍고, 협업 가능하고, 프로젝트와 함께 업데이트되어야 한다. | 큰 문서는 기준만 유지하고, 상세는 작은 문서/표로 쪼갠다. |
| [Diataxis](https://diataxis.fr/) | 문서 구조 프레임워크 | 문서는 튜토리얼, how-to, reference, explanation이라는 서로 다른 독자 요구를 가진다. | 기획 의도, 제작 절차, 데이터 표, 설명 문서를 한 섹션 안에 뒤섞지 않는다. |
| [Google Technical Writing - Audience](https://developers.google.com/tech-writing/one/audience) | 기술 문서 가이드 | 좋은 문서는 독자가 과제를 수행하는 데 필요한 지식과 독자의 현재 지식 사이의 차이를 채운다. | 문서 독자를 "나중의 나", "구현자", "아티스트/사운드", "테스터"로 명시한다. |
| [Microsoft Style Guide - Writing for all abilities](https://learn.microsoft.com/en-us/style-guide/accessibility/writing-all-abilities) | 문서 스타일 가이드 | 중요한 것부터 말하고, 짧고 의미 있는 문단과 구조를 사용한다. | 장식적 문장보다 결정, 표, 조건, 예시를 앞세운다. |
| [Steam Playtest documentation](https://partner.steamgames.com/doc/features/playtest) | 플랫폼 문서 | Steam은 별도 child appID로 낮은 리스크의 플레이테스트를 지원한다. | Steam 데모 전 외부 테스트 경로를 기획 검증 계획에 포함할 수 있다. |

## What A Game Design Document Must Decide

GDD가 최소한 결정해야 하는 항목은 다음이다.

| Area | Required Decision | Bad Version | Good Version |
| --- | --- | --- | --- |
| Concept | 이 게임이 무엇이고 무엇이 아닌가 | "심리 공포 관리 게임" | "플레이어는 야간 관리인으로 민원을 처리한다. 공포는 업무 루프가 무너질 때 발생한다. 전투/퇴마/운영 시뮬레이션은 아니다." |
| Player role | 플레이어의 권한과 한계 | "플레이어는 조사한다" | "플레이어는 관리인 권한으로 공용구역과 신고 세대 앞까지 접근하지만, 임의 침입은 제한된다." |
| Player verbs | 반복 행동 | "탐색, 수리, 조사" | "접수한다, 도구를 챙긴다, 이동한다, 확인한다, 수리한다, 보고한다, 의심한다." |
| Core loop | 1분/5분/30분 단위 반복 | "민원을 처리한다" | "관리실 접수 -> 도구 선택 -> 현장 이동 -> 단서 확인 -> 정상/이상 판정 -> 조치 -> 보고 -> 다음 민원." |
| System response | 행동 결과 | "이상 현상이 생긴다" | "조명 복구 시 복도 A는 밝아지지만, 307호 문틈 소리는 사라지지 않는다." |
| Progression | 무엇이 새로 열리는가 | "밤이 깊어진다" | "시간대가 바뀔수록 접근 층, 민원 유형, 단서 모순, 307호 접근 권한이 단계적으로 변한다." |
| Content structure | 콘텐츠를 어떻게 생산하는가 | "민원 20개" | "각 민원은 위치, 정상 원인, 이상 징후, 필요 도구, 완료 조건, 실패/지연 결과, 재사용 에셋을 가진다." |
| UX | 플레이어가 정보를 어떻게 아는가 | "UI는 몰입형" | "민원은 관리실 단말/무전/쪽지 중 하나로 접수되며, 현재 목표는 diegetic UI 우선, 최소 HUD 보조로 표시한다." |
| Horror rule | 공포가 어떻게 만들어지는가 | "갑자기 놀라게 한다" | "직접 위협 전의 시간/공간/정체/행동 불확실성을 증가시키고, 반복 업무 규칙을 조금씩 어긴다." |
| Scope | 무엇을 만들지 않는가 | "가능하면 다양하게" | "데모에는 전투, 자유 경제, NPC 대화 트리, 다층 랜덤 생성, 복잡한 퍼즐 박스를 넣지 않는다." |
| Validation | 맞는지 어떻게 볼 것인가 | "재미있으면 통과" | "첫 5분 안에 역할을 이해하고, 첫 이상 민원에서 정상/이상 구분을 고민하며, 307호에 접근하고 싶다는 반응이 나오면 통과." |

## Good GDD Quality Bar

좋은 기획 문서는 다음 조건을 만족한다.

| Quality | Requirement |
| --- | --- |
| Decision density | 한 문단마다 실제 결정을 담는다. 분위기 문장만 있는 문단은 줄인다. |
| Player-first | 시스템 이름보다 플레이어가 보는 것, 하는 것, 판단하는 것을 먼저 쓴다. |
| Implementable | 구현자가 데이터, 이벤트, UI, 레벨 배치, 사운드 요청으로 바꿀 수 있다. |
| Testable | "무섭다", "몰입된다" 같은 목표를 관찰 가능한 행동과 질문으로 바꾼다. |
| Scoped | 하지 않을 것을 명시해 범위 팽창을 막는다. |
| Current | 변경 이력과 최종 결정 상태를 구분한다. |
| Visual | 루프, 공간, 상태 전이는 표/다이어그램으로 읽게 한다. |
| Honest | 미정 항목은 확정처럼 쓰지 않고 Open Question으로 남긴다. |

나쁜 기획 문서의 흔한 신호는 다음이다.

| Smell | Why It Fails |
| --- | --- |
| 형용사가 많고 규칙이 없다 | "기괴한", "불길한", "몰입감 있는"만으로는 구현할 수 없다. |
| 세계관은 긴데 플레이어 행동이 짧다 | 게임이 아니라 설정 문서가 된다. |
| 참고작만 나열한다 | 어떤 요소를 왜 빌리는지 결정하지 않으면 복제도 학습도 아니다. |
| 콘텐츠 개수만 많다 | 생산 파이프라인과 품질 기준이 없으면 목록은 부채가 된다. |
| 시스템이 서로 연결되지 않는다 | UI, 레벨, 사운드, 데이터가 각각 따로 논다. |
| 검증 방법이 없다 | 문서가 맞는지 틀린지 판단할 수 없다. |

## Recommended Documentation Architecture

`NightCaretaker`에는 한 개의 거대한 GDD보다 다음 구조가 더 적합하다.

| Document Layer | Role | Recommended Location |
| --- | --- | --- |
| One-page product spine | 게임의 약속, 핵심 루프, 금지 사항, 수직 슬라이스 목표 | `Document/NightCaretaker_Planning_Master.md` 최상단 |
| Design pillar reference | 3~5개 설계 원칙과 예외 규칙 | Planning Master |
| Core loop spec | 민원 처리 루프, 상태 전이, 성공/실패 조건 | Planning Master 또는 별도 companion |
| Content reference tables | 민원/이상 현상/도구/공간 목록 | 별도 표 또는 companion 문서 |
| Feature specs | 특정 시스템의 상세 규칙 | 필요할 때 작은 Detail 문서 |
| TDD | UE 구현 구조, 클래스, 데이터 에셋, 이벤트, 저장/로드 | Development Master 또는 Source 작업 문서 |
| Playtest log | 테스트 목표, 관찰, 액션 아이템, 변경 결정 | Source 작업 문서 |

Diataxis 기준으로는 기획 의도는 explanation, 제작 절차는 how-to, 민원/도구/태그 표는 reference로 분리한다.
한 섹션에서 의도, 작업 절차, 데이터 표, 회고를 모두 섞지 않는다.

## NightCaretaker GDD Template

다음 템플릿은 기존 기획 문서를 다시 쓸 때의 권장 구조다.

### 0. Document Control

| Field | Content |
| --- | --- |
| Version | 작성일, 수정일, 작성자 |
| Status | Draft, Review, Approved, Deprecated |
| Decision owner | 최종 판단자 |
| Related docs | 개발/아트/사운드/레벨 문서 링크 |

### 1. One-Page Game Brief

| Prompt | Required Answer |
| --- | --- |
| One sentence | 한 문장으로 장르, 역할, 핵심 갈등, 차별점을 말한다. |
| Player promise | 플레이어가 왜 이 게임을 사거나 데모를 실행해야 하는지 말한다. |
| Core loop | 6~8단계 이하로 반복 행동을 쓴다. |
| Design pillars | 최대 5개. 각 pillar는 예시와 금지 예시를 포함한다. |
| Non-goals | 전투, 퇴마, 자유 시뮬레이션처럼 하지 않을 것을 확정한다. |
| Vertical slice proof | 데모가 반드시 증명해야 할 3~5개 기준을 쓴다. |

### 2. Player Fantasy And Role

필수 질문:

- 플레이어는 어떤 직업/상황/권한을 갖는가?
- 플레이어가 할 수 없는 일은 무엇인가?
- 플레이어가 위험을 감수하고 현장에 가야 하는 이유는 무엇인가?
- 플레이어가 "나는 관리인이다"라고 느끼는 상호작용은 무엇인가?

`NightCaretaker` 예시:

| Element | Example Direction |
| --- | --- |
| Role | 오래된 아파트의 야간 관리인 |
| Authority | 민원 접수, 공용구역 점검, 기본 수리, 보고 |
| Limitation | 전투 불가, 강제 침입 제한, 전문 장비 부족 |
| Pressure | 민원 누적, 주민 불신, 관리실 지시, 밤 시간 제한 |

### 3. Design Pillars

각 pillar는 반드시 "구현 규칙"과 "금지 규칙"을 가진다.

| Pillar | Implementation Rule | Anti-Example |
| --- | --- | --- |
| Mundane duty becomes horror | 모든 공포는 먼저 평범한 민원으로 시작한다. | 처음부터 괴이한 장소 탐험으로 시작한다. |
| Few actions, high meaning | 적은 상호작용을 반복하되 결과와 맥락을 바꾼다. | 매 민원마다 완전히 새 미니게임을 만든다. |
| Uncertainty before threat | 직접 위협보다 시간/공간/정체/행동 불확실성을 먼저 쌓는다. | 괴물을 자주 정면으로 보여준다. |
| Safe place erodes | 관리실/복도 같은 안전 기준점이 단계적으로 흔들린다. | 안전지대가 초반부터 완전히 무력하다. |
| Scope discipline | 데모는 민원 루프와 307호 호기심만 증명한다. | 세계관, NPC, 퍼즐, 랜덤 이벤트를 동시에 증명하려 한다. |

### 4. Player Verbs

모든 주요 시스템은 플레이어 동사로 시작한다.

| Verb | Input/Interface | System Response | Emotional Purpose | Validation |
| --- | --- | --- | --- | --- |
| 접수한다 | 관리실 단말/무전 | 민원 위치, 증상, 우선도 표시 | 업무 시작, 책임감 | 첫 1분 내 다음 목적지를 이해한다. |
| 챙긴다 | 도구함 | 도구 선택, 인벤토리 제한 | 선택 부담 | 잘못 챙긴 도구가 동선 비용을 만든다. |
| 이동한다 | 1인칭 이동/엘리베이터/계단 | 층, 조명, 문 상태 변화 | 예감, 공간 기억 | 플레이어가 주요 경로를 외운다. |
| 확인한다 | 상호작용/관찰 | 단서, 소리, 문틈, 냄새/텍스트 | 의심 | 정상/이상 판단을 말로 설명할 수 있다. |
| 조치한다 | 수리/차단/보고 | 상태 변경, 새 단서, 지연 결과 | 안도 또는 불안 | 완료 후에도 찝찝함이 남는다. |
| 보고한다 | 관리실 기록 | 다음 민원/기록/모순 해금 | 의미 부여 | 플레이어가 다음 밤의 이유를 이해한다. |

### 5. Core Loop Spec

루프는 시간 단위별로 나눈다.

| Loop Scale | Duration | Content |
| --- | --- | --- |
| Micro | 5~20초 | 문 확인, 스위치, 소리 방향 확인, 단서 줍기 |
| Short | 1~3분 | 민원 접수에서 현장 도착까지 |
| Medium | 5~10분 | 한 민원 해결과 보고 |
| Session | 20~40분 | 한 밤의 민원 묶음, 이상 징후 escalation |
| Game | 2~4시간 또는 목표 범위 | 307호 진실/건물의 규칙 이해 |

각 루프는 다음 항목을 가진다.

| Required Field | Meaning |
| --- | --- |
| Start trigger | 루프가 시작되는 이벤트 |
| Player goal | 플레이어가 믿는 목표 |
| Hidden tension | 실제로 쌓이는 위험/모순 |
| Success condition | 시스템상 완료 |
| Emotional residue | 완료 후 남는 감정 |
| Next hook | 다음 행동을 하게 만드는 정보 |

### 6. Complaint And Anomaly System

민원은 단순 스토리 카드가 아니라 생산 가능한 데이터 단위여야 한다.

| Field | Meaning |
| --- | --- |
| ComplaintId | 고유 ID |
| DisplayTitle | 플레이어에게 보이는 접수 제목 |
| Location | 건물/층/호수/공용구역 |
| NormalCause | 정상 원인 |
| AnomalyLayer | 이상 현상 버전 또는 변형 |
| RequiredTool | 필요한 도구 |
| ClueList | 확인해야 할 단서 |
| CompletionRule | 완료 판정 |
| FailOrDelayRule | 지연, 오판, 방치 결과 |
| HorrorBeat | 긴장 포인트 |
| ReuseAssets | 재사용 에셋 |
| TestNote | 플레이테스트에서 확인할 것 |

나쁜 작성:

> 307호에서 이상한 소리가 나고 무서운 일이 벌어진다.

좋은 작성:

| Field | Example |
| --- | --- |
| DisplayTitle | 3층 배관 소음 민원 |
| NormalCause | 305호 싱크대 밸브 헐거움 |
| AnomalyLayer | 점검 중 307호 문 안쪽에서 같은 수리 소리가 2초 늦게 반복됨 |
| RequiredTool | 렌치 |
| CompletionRule | 밸브 조임 후 관리실에 보고 |
| HorrorBeat | 정상 원인을 해결했는데도 복도 배관음이 307호 방향으로 이동함 |
| TestNote | 플레이어가 "해결했는데 왜 아직 들리지?"라고 반응하는지 관찰 |

### 7. Horror Design Rules

심리 공포는 다음 네 가지 불확실성을 조절한다.

| Uncertainty | Design Use |
| --- | --- |
| Time | 언제 일이 벌어질지 모르게 한다. 단, 완전 랜덤 남발은 피한다. |
| Space | 어디서 소리가 났는지, 어느 문이 바뀌었는지 헷갈리게 한다. |
| Identity | 원인이 고장인지 사람인지 건물인지 확정되지 않게 한다. |
| Action | 지금 해야 할 일이 수리인지 보고인지 도망인지 고민하게 한다. |

Agency를 제한할 때는 규칙이 필요하다.

| Allowed | Avoid |
| --- | --- |
| 문이 잠겨 있어 다른 경로를 찾아야 한다. | 입력을 갑자기 빼앗아 플레이어를 죽인다. |
| 손전등 배터리가 낮아 시야가 줄어든다. | 아무 예고 없이 화면을 가린다. |
| 관리실 지시가 모순되어 판단을 요구한다. | 정답을 알 수 없는 선택으로 즉시 실패시킨다. |
| 익숙한 복도 구조가 미세하게 바뀐다. | 길찾기 불가능한 미로로 바꾼다. |

### 8. Level And Space Requirements

공포 레벨 문서는 "방 목록"보다 "플레이어 기억과 변화"를 기록해야 한다.

| Required Item | Question |
| --- | --- |
| Home base | 플레이어가 안전하다고 믿는 위치는 어디인가? |
| Routine route | 민원 처리 때 반복해서 지나는 경로는 어디인가? |
| Observation point | 307호나 이상 징후를 볼 수 있는 지점은 어디인가? |
| Change rule | 시간이 지날수록 무엇이 바뀌는가? |
| Backtracking value | 돌아오는 길에 새로 보이는 것은 무엇인가? |
| Performance risk | 조명, 사운드, 스트리밍, 블루프린트 Tick 위험은 무엇인가? |

### 9. UX And Feedback Requirements

UI/UX 문서는 화면 모양보다 정보 흐름을 먼저 결정한다.

| Information | Primary Channel | Fallback |
| --- | --- | --- |
| Current complaint | 관리실 단말, 무전 | 최소 목표 텍스트 |
| Required tool | 도구함 라벨, 접수 내용 | 인벤토리 표시 |
| Location | 층 표지판, 호수 표찰 | 지도/간단한 안내 |
| Completion | 실제 상태 변화, 보고 가능 상태 | 버튼 프롬프트 |
| Anomaly clue | 사운드, 조명, 문 상태 | 기록 텍스트 |

접근성/입력 문서에는 키보드, 마우스, 게임패드, 리매핑, 자막, 사운드 방향성 보조 여부를 포함한다.

### 10. Vertical Slice Acceptance Criteria

수직 슬라이스는 "많이 보여주는 것"이 아니라 핵심 위험을 증명하는 것이다.

| Criterion | Pass Signal |
| --- | --- |
| Role clarity | 플레이어가 5분 안에 자신이 야간 관리인이고 민원을 처리해야 한다는 것을 이해한다. |
| Loop clarity | 첫 민원에서 접수, 이동, 확인, 조치, 보고 흐름을 혼자 수행한다. |
| Horror identity | 플레이어가 "고장인지 이상 현상인지 모르겠다"는 판단을 경험한다. |
| 307 hook | 307호에 들어가지 않아도 307호를 신경 쓰게 된다. |
| Scope proof | 전투나 복잡한 퍼즐 없이도 긴장이 유지된다. |
| Production proof | 같은 데이터 구조로 민원 3개 이상을 만들 수 있다. |

## Requirement Writing Pattern

기획 요구사항은 다음 형태로 쓴다.

```text
[Subject]는 [조건]에서 [행동/상태 변화]를 해야 한다.
이 규칙의 목적은 [플레이어 경험/제작 이유]다.
통과 기준은 [관찰 가능한 결과]다.
```

예시:

```text
민원 데이터는 위치, 필요 도구, 정상 원인, 이상 징후, 완료 조건을 가져야 한다.
이 규칙의 목적은 민원 콘텐츠를 반복 제작 가능한 단위로 만들기 위함이다.
통과 기준은 같은 구조로 정상 민원 1개와 이상 민원 2개를 구현하고, 관리실 보고까지 완료되는 것이다.
```

피해야 할 형태:

```text
민원은 다양하고 공포스럽게 만든다.
```

## Playtest And Validation Workflow

Valve의 사례처럼, 플레이테스트는 기획 의견을 증명하는 장치가 아니라 틀린 가정을 빨리 찾는 장치로 운용한다.

| Step | Rule |
| --- | --- |
| Define question | "무서운가?"보다 "플레이어가 정상/이상 판정을 망설이는가?"를 묻는다. |
| Observe silently | 튜토리얼이 아니라 테스트라면 힌트를 주지 않는다. |
| Record actions | 막힌 지점, 시선, 되돌아간 경로, 오해한 용어를 기록한다. |
| Convert to action item | 감상평을 수정 작업으로 바꾼다. |
| Update docs | 검증된 결정만 본문에 넣고, 실패한 가정은 변경 로그에 남긴다. |

`NightCaretaker` 초기 테스트 질문:

| Test Question | Observation |
| --- | --- |
| 플레이어가 첫 민원을 혼자 시작하는가? | 단말/무전/문 프롬프트에서 헤매는 시간 |
| 플레이어가 필요한 도구를 이해하는가? | 도구함 재방문 횟수 |
| 플레이어가 정상 고장과 이상 징후를 구분하려 하는가? | 단서 재확인, 보고 전 망설임 |
| 307호가 신경 쓰이는가? | 자발적으로 307호 쪽을 보거나 접근하는 행동 |
| 공포가 불공정하게 느껴지는가? | 원인 없는 피해, 길찾기 포기, 입력 불신 반응 |

## Documentation Maintenance Rules

문서는 다음 규칙으로 관리한다.

| Rule | Reason |
| --- | --- |
| 첫 페이지는 항상 최신 결정만 둔다. | 긴 문서를 다 읽지 않아도 방향을 알 수 있어야 한다. |
| 미정은 `Open Question`에 둔다. | 가짜 확정을 막는다. |
| 콘텐츠 표는 본문 산문보다 우선한다. | 제작과 검수가 쉬워진다. |
| 각 섹션은 owner와 validation을 가진다. | 책임과 통과 기준이 흐려지지 않는다. |
| 플레이테스트 후 문서를 갱신한다. | 문서가 실제 게임과 분리되지 않게 한다. |
| 삭제한 아이디어는 Archive 또는 변경 로그에 둔다. | 같은 논쟁이 반복되지 않게 한다. |

## Rewrite Checklist For Existing Planning Docs

기존 `NightCaretaker_Planning_Master.md`를 재작성할 때 다음 순서로 판단한다.

1. 이 섹션이 실제 결정을 담고 있는가?
2. 플레이어가 무엇을 보는지, 무엇을 하는지, 무엇을 판단하는지 적혀 있는가?
3. 구현자가 데이터/레벨/UI/사운드/블루프린트 작업으로 바꿀 수 있는가?
4. 수직 슬라이스에서 검증할 방법이 있는가?
5. 같은 내용이 다른 섹션에 반복되어 있지 않은가?
6. 참고작을 언급했다면, 어떤 요소를 왜 참고하는지 분해했는가?
7. "하지 않을 것"이 명시되어 있는가?
8. 현재 확정, 가설, 아이디어, 폐기 항목이 구분되어 있는가?

재작성 우선순위:

| Priority | Target |
| --- | --- |
| P0 | One-page brief, design pillars, core loop, vertical slice criteria |
| P1 | Complaint/anomaly data model, first 3 complaints, 307 escalation path |
| P2 | Level route, UI information flow, sound/lighting rules |
| P3 | Full complaint pack, narrative archive, marketing text |

## Practical Rule For Future Documents

앞으로 기획 문서를 쓸 때 한 섹션이 다음 문장을 완성하지 못하면 아직 쓸 준비가 덜 된 것이다.

```text
플레이어는 [상황]에서 [행동]을 한다.
게임은 [규칙]에 따라 [반응]한다.
그 결과 플레이어는 [감정/판단]을 하게 된다.
이 기능은 [데이터/레벨/UI/사운드/코드]로 구현된다.
통과 기준은 [관찰 가능한 결과]다.
```

이 형식으로 바꿀 수 없는 문장은 아이디어 메모에 남기고, 제품 기준 문서 본문에는 넣지 않는다.

## 검토 체크리스트

- [ ] 현재 판단 기준과 보관/조사 자료가 구분되어 있다.
- [ ] 다음 작업자가 먼저 볼 섹션을 문서 지도에서 찾을 수 있다.
- [ ] 표, 목록, 체크리스트가 긴 문단을 보완한다.
- [ ] Planning/Development/Art Master와 충돌하는 항목은 별도로 승격 또는 폐기 판단한다.
- [ ] HTML companion이 필요한 경우 외부 CSS 의존 없이 내장 CSS로 작성한다.

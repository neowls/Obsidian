# NightCaretaker Game Flow Diagrams

이 문서는 `NightCaretaker_Planning_Master.md`의 게임 플로우 제작 명세를 빠르게 읽기 위한 companion 문서다. 기준 문서는 Master 문서이며, 이 문서는 플로우를 시각적으로 확인하기 위한 보조 자료다.

## 전체 캠페인 플로우

```mermaid
flowchart TD
    A[시작 메뉴] --> B[출근 / 인수인계]
    B --> C[관리실 기준점 학습]
    C --> D[민원 보드 확인]
    D --> E[도구 준비]
    E --> F[현장 이동]
    F --> G[단서 조사]
    G --> H{보고 가능한가?}
    H -- 아니오 --> G
    H -- 예 --> I[관리실 복귀]
    I --> J[보고 / 판정]
    J --> K[월드 상태 갱신]
    K --> L{챕터 게이트 충족?}
    L -- 아니오 --> D
    L -- 예 --> M[다음 챕터 / 새 구역 해금]
    M --> N{307호 최종 단계?}
    N -- 아니오 --> D
    N -- 예 --> O[307호 진입 / 마지막 보고]
    O --> P[결말]
```

## 민원 1건 시퀀스

```mermaid
sequenceDiagram
    participant Player as Player
    participant Board as Complaint Board
    participant Runtime as Complaint Runtime
    participant World as World Actors
    participant Audio as Audio / Lighting
    participant Report as Report UI

    Player->>Board: 민원 선택
    Board->>Runtime: AcceptComplaint(ComplaintId)
    Runtime->>World: 위치 / 단서 / 상호작용 활성화
    Runtime->>Audio: 민원 도메인 ambience 활성화
    Player->>World: 이동 및 조사
    World->>Runtime: EvidenceTag 등록
    Runtime->>Board: 보고 가능 상태 갱신
    Player->>Report: 보고 결과 선택
    Report->>Runtime: SubmitReport(ComplaintId, Result)
    Runtime->>World: 문 / 조명 / 기록 / 구역 상태 갱신
    Runtime->>Audio: 긴장도와 전원 상태 반영
    Runtime->>Board: 다음 민원 또는 재접수 상태 갱신
```

## 상태 모델

```mermaid
stateDiagram-v2
    [*] --> OffDuty
    OffDuty --> ShiftIntro: NewGame
    ShiftIntro --> OfficeReview: 인수인계 확인
    OfficeReview --> ComplaintSelection: 민원 보드 활성화
    ComplaintSelection --> ToolPrep: 민원 수락
    ToolPrep --> FieldTransit: 도구 준비 완료
    FieldTransit --> Investigation: 현장 도착
    Investigation --> ReportReady: 최소 단서 충족
    ReportReady --> OfficeReturn: 복귀 목표 표시
    OfficeReturn --> ReportSubmission: 보고 UI 열림
    ReportSubmission --> WorldUpdate: 보고 제출
    WorldUpdate --> ComplaintSelection: 다음 민원
    WorldUpdate --> ChapterTransition: 챕터 게이트 충족
    ChapterTransition --> ComplaintSelection: 다음 챕터 시작
    ChapterTransition --> FinalApproach: 307호 최종 게이트
    FinalApproach --> Ending: 마지막 보고 / 진입
    Ending --> [*]
```

## 실패와 회복 플로우

```mermaid
flowchart LR
    A[단서 누락 / 오판 / 지연] --> B{실패 단계}
    B --> C[Soft Failure]
    B --> D[Pressure Failure]
    B --> E[Hard Failure]
    C --> F[민원 악화 / 추가 점검]
    D --> G[기록 오염 / 동선 우회 / 소음 강화]
    E --> H[짧은 체크포인트 / 강제 퇴각]
    F --> I[1~3분 안에 회복 목표 제공]
    G --> I
    H --> I
    I --> J[새 감각 정보 또는 단서 제공]
    J --> K[루프 복귀]
```

## 데모 / 수직 슬라이스 Route

```mermaid
flowchart TD
    A[관리실 진입] --> B[CMP_PRO_OfficeLightBuzz]
    B --> C[민원 보드 활성화]
    C --> D[CMP_PRO_203_WaterAtDoor]
    D --> E[CMP_CH1_2F_IntercomStatic]
    E --> F[CMP_CH1_3F_EmergencyLight]
    F --> G[CMP_CH2_302_TVHum]
    G --> H[정전 이벤트]
    H --> I[CMP_CH3_BasementPumpAlarm]
    I --> J[CMP_CH3_BasementPanelMislabel]
    J --> K[CMP_CH4_307_PackageAtDoor]
    K --> L[307호 앞 도달]
    L --> M[문 너머 음성 / 데모 종료]
```

## 챕터 게이트 요약

| 구간 | 핵심 목표 | 반드시 검증할 플레이 이해 |
| --- | --- | --- |
| 프롤로그 | 관리실, 도구, 보고 루프 학습 | 이 게임은 민원을 처리하는 게임이다. |
| 챕터 1 | 현실적 민원과 작은 위화감 | 같은 업무라도 현장 상태가 이상할 수 있다. |
| 챕터 2 | 판정형 민원과 기록 불일치 | 수리가 아니라 보고 판단이 진행을 바꾼다. |
| 챕터 3 | 정전, 지하실, 설비 계통 | 건물 상태가 플레이어에게 압박으로 돌아온다. |
| 챕터 4 | 307호로 모든 단서 수렴 | 307호를 확인해야 이 밤이 끝난다. |
| 결말 | 마지막 보고 또는 마지막 진입 | 해결보다 해석과 잔상이 남아야 한다. |

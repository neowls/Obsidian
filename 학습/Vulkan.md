## 개요


## 구성 요소
### 1. 인스턴스(Instance)
- 애플리케이션과 Vulkan 라이브러리 사이의 연결점
- 레이어(Validation, Debug)·확장(Extensions)을 활성화하여 디버깅·추가 기능 사용 가능.
- 로더(Loader) → 레이어(Layer) → ICD(Installable Client Driver) 간 호출을 연결해 주는 중요한 디스패치(Dispatch) 구조체의 포인터
- 

### 2. 물리 디바이스

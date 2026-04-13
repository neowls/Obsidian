- 단일 어트리뷰트 데이터 묶음
- GameplayAttributeData 는 하나의 값이 아닌 두 가지 값으로 구성되어 있다.
	- BaseValue : 기본 값. 영구히 적용되는 고정 스탯 값을 관리하는데 사용된다.
	- CurrentValue : 변동 값. 버프(Buff) 등으로 임시적으로 변동된 값을 관리하는데 사용된다. (BaseValue + GE에 의한 값)
- 어트리뷰트 세트 접근자 매크로
	- 많이 수행되는 기능에 대해 매크로를 만들어 제공한다.
- ASC는 초기화 될 때 같은 액터에 있는 UAttributeSet 타입 객체를 찾아서 등록한다.
# 어트리뷰트 세트의 주요 함수
- PreAttributeChange : 어트리뷰트 변경 전에 호출
- PostAttributeChange : 어트리뷰트 변경 후에 호출
- PreGameplayEffectExecute : 게임플레이 이펙트 적용 전에 호출
- PostGameplayEffectExecute : 게임플레이 이펙트 적용 후에 호출

# 어트리뷰트
FGameplayAttributeData 구조체로 정의된 float 값
일반적으로 [[게임플레이 이펙트(GE)]]에 의해서만 수정되어야 ASC가 변경사항을 예측할 수 있다.
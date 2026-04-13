- 줄여서 GE(Gameplay Effect)로 불린다.
- GAS는 게임에 영향을 주는 객체를 별도로 분리해서 관리한다.
- 게임에 영향을 준다는 것은 대부분 게임 데이터를 변경한다는 것을 의미한다.
- 따라서 대부분 게임플레이 이펙트와 ==어트리뷰트==는 함께 동작하도록 구성되어 있다.
- GAS 시스템에서 가장 많은 기능을 제공하는 클래스이다.
- 아래 세 가지 타입 중 하나를 선택할 수 있다.
	- Instant : 어트리뷰트에 즉각적으로 적용되는 게임플레이 이펙트. 한 프레임에 실행된다.
	- Duration : 지정한 시간 동안 동작하는 게임플레이 이펙트.
	- Infinite : 명시적으로 종료하지 않으면 계속 동작하는 게임플레이 이펙트.

# 게임플레이 이펙트 모디파이어(Modifier)
- GE에서 어트리뷰트의 변경 방법을 지정한 설정을 모디파이어라고 한다.
- 모디파이어의 사용 방법
	- 적용할 어트리뷰트의 지정
	- 적용 방식의 설정 : 더하기, 곱하기, 나누기, 덮어쓰기
- 모디파이어의 계산 방법
	- ScalableFloat : 실수 (데이터 테이블과 연동 가능)
	- AttributeBased : 특정 어트리뷰트에 기반
	- CustomCalculationClass : 계산을 담당하는 전용 클래스의 활용
	- SetByCaller : 데이터 태그를 활용한 데이터 전달
- 모디파이어 없이 자체 계산 로직을 만드는 것도 가능하다.(GameplayEffectExecutionCalculation)

## ==C++로 설정하기에는 문법이 복잡하기 때문에, 블루프린트로 제작하는 것을 권장한다.==

``` C++
UProjectGE_AttackDamage::UProjectGE_AttackDamage()
{
	DurationPolicy = EGameplayEffectDurationType::Instant // 적용 기간 설정

	FGameplayModifierInfo HealthModifier;
	HealthModifier.Attribute = FGameplayAttribute(FindFieldChecked<FPropery>(UCharacterAttributeSet::StaticClass(), GET_MEMBER_NAME_CHECKED(UCharacterAttributeSet, Health))); // friend class 지정 필요
	HealthModifier.ModifierOp = EGameplayModOp::Additive // 계산 방법 설정

	FScalableFloat DamageAmount(-30.0f) // 값 지정
	FGameplayEffectModifierMagnitude ModMagnitude(DamageAmount); // 적용될 실제 값

	HealthModifier.ModifierMagnitude = ModMagnitude; // 실제값 반영
	Modifier.Add(HealthModifier);

}

```


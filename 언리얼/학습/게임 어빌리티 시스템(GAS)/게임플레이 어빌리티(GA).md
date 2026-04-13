- 줄여서 GA(Gameplay Ability)로 불린다.
- ASC에 등록되어 발동시킬 수 있는 액션 명령이다.
	- 공격, 마법, 특수 공격 등
	- 간단한 액션 뿐만 아니라 상황에 따른 복잡한 액션도 수행이 가능하다.
# GA 발동 과정
- ASC에 어빌리티를 등록 : ASC의 GiveAbility 함수에 발동할 GA의 타입을 전달한다.
	- 발동할 GA 타입 정보를 **게임플레이 어빌리티 스펙(GameplayAbilitySpec)** 이라고 한다.
- ASC에게 어빌리티를 발동하라고 명령 : ASC의 TryActivateAbility 함수에 발동할 GA의 타입을 전달
		- ASC에 등록된 타입이면 GA의 인스턴스가 생성된다.
- 발동된 GA에는 발동한 액터와 실행 정보가 기록된다.
		- SpecHandle : 발동된 어빌리티에 대한 핸들
		- ActorInfo : 어빌리티의 소유자와 아바타 정보
		- ActivationInfo : 발동 방식에 대한 정보
# GA의 주요 함수
- CanActivateAbility : 어빌리티가 발동될 수 있는지 파악
- ActivateAbility : 어빌리티가 발동될 때 호출
- CancelAbility : 어빌리티가 취소될 때 호출
- EndAbility : 스스로 어빌리티를 마무리 할 때 호출
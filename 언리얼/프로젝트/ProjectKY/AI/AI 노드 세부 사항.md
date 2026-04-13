## 플레이어 오토 타겟 유무. (변수로 작성)
- 오토타겟이 아닐 때
	- 주기적으로 주변을 탐색한다. (Detection) <font color="#92d050">(Service)</font>
	- 근처 적이 탐색하면 연동 받는다. (Synced Option)
- 오토 타겟일 때
	- 자동적으로 타겟팅

## [[AI 순찰]]
- 타겟팅된 플레이어 혹은 객체가 없는지 확인한다. (Blackboard Condition) <font color="#de7802">(Decorator)</font>
- 베이스 포지션 중점으로 일정 반경내 위치를 지정한다. (Find Position) <font color="#245bdb">(Task)</font> TODO::EQS로??
- 지정된 위치로 이동한다. (Move To) <font color="#245bdb">(Task)</font>
- 대기한다. (Wait) <font color="#245bdb">(Task)</font>

## [[AI 추격]]
- 타겟 포커싱을 해제한다. (Clear Focus) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 속도를 조정한다 (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 플레이어 위치를 실시간으로 추격한다. (Move To) <font color="#245bdb">(Task)</font>
- 공격 대기 지점까지 도달했을 경우 중단한다. (Distance Condition) <font color="#de7802">(Decorator)</font>

## [[AI 배회]]
- 타겟 포커싱을 실시한다. (Focus Target) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 속도를 조정한다. (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 플레이어의 주변의 대기 공간을 탐색한다. (EQS Location) <font color="#245bdb">(Task)</font>
- 가장 가까운 대기 공간으로 이동한다. (Move To) <font color="#245bdb">(Task)</font>

## [[AI 공격]]
- 공격 가능 상태인지 확인한다. (Attack State Condition) <font color="#de7802">(Decorator)</font>
- 공격 시전 상태에 들어간다. (Ready To Attack) <font color="#245bdb">(Task)</font>
- 공격 어빌리티를 발동한다. (Execute GameAbility) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 타켓 포커싱을 해제한다.  (Clear Focus) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>

## 회피
- 플레이어 공격 대기 상태인지 확인한다. (Ready State Condition) <font color="#de7802">(Decorator)</font>
- 플레이어와의 거리를 확인한다. (Distance Condition) <font color="#de7802">(Decorator)</font>
- 일정 거리 뒤로 회피한다. (Play Montage) <font color="#245bdb">(Task)</font>
- 쿨타임을 가진다. (CoolTime) <font color="#245bdb">(Task)</font>

## 가드
- 플레이어 공격 대기 상태인지 확인한다. (Ready State Condition) <font color="#de7802">(Decorator)</font>
- 플레이어와의 거리를 확인한다. (Distance Condition) <font color="#de7802">(Decorator)</font>
- 가드한다. (Hold Guard) <font color="#245bdb">(Task)</font>
- 플레이어로부터의 공격이 일정 시간 들어오지 않는다면 해제한다. (Release Guard) <font color="#245bdb">(Task)</font>

## 특수 공격
- 플레이어 공격 가능 상태인지 확인한다. (Attack State Condition) <font color="#de7802">(Decorator)</font>
- 일정 확률로 발동한다. 
- 공격 시전 상태에 들어간다. (Ready To Attack) <font color="#245bdb">(Task)</font>
- 공격 어빌리티를 발동한다. (Execute GameAbility) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
- 타켓 포커싱을 해제한다.  (Clear Focus) (Restart Cancel Just Once) <font color="#245bdb">(Task)</font>
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as/assembly/index'
import { onIncentiveCreated, onStake } from '../src/mappings/staking'
import { getStakeId } from '../src/functions/staking'
import { createIncentiveCreatedEvent, createStakeEvent, createUnstakeEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
let incentiveId = BigInt.fromString('1')
let amount = BigInt.fromString('1000000')
let startTime = BigInt.fromString('1646068510')
let endTime = BigInt.fromString('1646075000')
let incentiveCreatedEvent = createIncentiveCreatedEvent(
  TOKEN,
  REWARD_TOKEN,
  ALICE,
  incentiveId,
  amount,
  startTime,
  endTime
)

function cleanup(): void {
  clearStore()
}

test('Create incentive', () => {
  onIncentiveCreated(incentiveCreatedEvent)

  assert.fieldEquals('Incentive', incentiveId.toString(), 'id', incentiveId.toString())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'creator', ALICE.toHex())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'pool', TOKEN.toHex())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'rewardRemaining', amount.toString())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'endTime', endTime.toString())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'rewardPerLiquidity', '1')
  assert.fieldEquals('Incentive', incentiveId.toString(), 'lastRewardTime', startTime.toString())
  assert.fieldEquals('Incentive', incentiveId.toString(), 'liquidityStaked', '0')


  cleanup()
})

test('Incentive is updated when staking', () => {
  onIncentiveCreated(incentiveCreatedEvent)
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: the incentive values belonging to the token is updated
  

  cleanup()
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onIncentiveCreated, onStake, onSubscribe, onUnstake, onUnsubscribe } from '../src/mappings/staking'
import {
  createIncentiveCreatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createUnstakeEvent,
  createUnsubscribeEvent,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const INCENTIVE_ID = BigInt.fromString('1')
let INITIAL_AMOUNT = BigInt.fromString('1000000')
let startTime = BigInt.fromString('1646068510')
let endTime = BigInt.fromString('1646075000')
let incentiveCreatedEvent = createIncentiveCreatedEvent(
  TOKEN,
  REWARD_TOKEN,
  ALICE,
  INCENTIVE_ID,
  INITIAL_AMOUNT,
  startTime,
  endTime
)

function cleanup(): void {
  clearStore()
}

test('Create incentive', () => {
  onIncentiveCreated(incentiveCreatedEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'id', INCENTIVE_ID.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'creator', ALICE.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'token', TOKEN.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardRemaining', INITIAL_AMOUNT.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'endTime', endTime.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardPerLiquidity', '1')
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'lastRewardTime', startTime.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')

  cleanup()
})

test('subscribe/unsubscribe updates the incentives staked liquidity', () => {
  onIncentiveCreated(incentiveCreatedEvent)
  const amount = BigInt.fromString('10000000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let unsubscribeEvent = createUnsubscribeEvent(INCENTIVE_ID, ALICE)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')

  onStake(stakeEvent)

  // When: subscribe event is triggered
  onSubscribe(subscribeEvent)

  // Then: the incentives staked liquidity is increased
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', amount.toString())

  // And: an unsubscribe decreases liquidity
  onUnsubscribe(unsubscribeEvent)
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')

  cleanup()
})

test('User stakes twice in two different incentives, but only subscribed to one incentive results in one incentive liquidity update', () => {
  let amount = BigInt.fromU32(1000000)
  let amount2 = BigInt.fromU32(2000000)
  let incentiveId = BigInt.fromU32(2)
  const token2 = Address.fromString('0x0000000000000000000000000000000000000002')
  let incentiveCreatedEvent2 = createIncentiveCreatedEvent(
    token2,
    REWARD_TOKEN,
    ALICE,
    incentiveId,
    amount2,
    startTime,
    endTime
  )
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let stakeEvent2 = createStakeEvent(token2, ALICE, amount)

  onIncentiveCreated(incentiveCreatedEvent)
  onIncentiveCreated(incentiveCreatedEvent2)

  // When: User stakes
  onStake(stakeEvent)
  onStake(stakeEvent2)

  // Then: incentives liquidity is 0
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')
  assert.fieldEquals('Incentive', incentiveId.toString(), 'liquidityStaked', '0')

  // When: user subscribes
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  onSubscribe(subscribeEvent)

  // Then: the subscribed incentive liquidity is updated
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', INITIAL_AMOUNT.toString())

  // And: the non-subscribed incentive liquidity remains unchanged
  assert.fieldEquals('Incentive', incentiveId.toString(), 'liquidityStaked', '0')

  cleanup()
})

test('User stakes to the same incentive twice, liquidity is updated', () => {
  let amount = BigInt.fromU32(1000000)

  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)

  onIncentiveCreated(incentiveCreatedEvent)

  // When: User stakes
  onStake(stakeEvent)

  // Then: incentive liquidity is 0
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')

  // When: user subscribes
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  onSubscribe(subscribeEvent)

  // Then: the subscribed incentive liquidity is updated
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', INITIAL_AMOUNT.toString())

  // And: staking another time increases the liquidity
  onStake(stakeEvent)
  assert.fieldEquals(
    'Incentive',
    INCENTIVE_ID.toString(),
    'liquidityStaked',
    INITIAL_AMOUNT.times(BigInt.fromU32(2)).toString()
  )

  cleanup()
})

test('Unstake decreases the incentives liquidity', () => {
  let amount = BigInt.fromU32(1000000)
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)

  onIncentiveCreated(incentiveCreatedEvent)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', INITIAL_AMOUNT.toString())

  onUnstake(unstakeEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')
})

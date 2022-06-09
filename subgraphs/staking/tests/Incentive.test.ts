import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import {
  onIncentiveCreated,
  onIncentiveUpdated,
  onStake,
  onSubscribe,
  onUnstake,
  onUnsubscribe,
} from '../src/mappings/staking'
import {
  createIncentiveCreatedEvent,
  createIncentiveUpdatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createTokenMock,
  createUnstakeEvent,
  createUnsubscribeEvent,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const INCENTIVE_ID = BigInt.fromString('1')
const INITIAL_AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1654765057') // Thu Jun 09 2022 10:57:37 GMT+0200 (Central European Summer Time)
const END_TIME = BigInt.fromString('1655197057') // 5 days later,	Tue Jun 14 2022 10:57:37 GMT+0200 (Central European Summer Time)
let incentiveCreatedEvent = createIncentiveCreatedEvent(
  TOKEN,
  REWARD_TOKEN,
  ALICE,
  INCENTIVE_ID,
  INITIAL_AMOUNT,
  START_TIME,
  END_TIME
)
incentiveCreatedEvent.block.timestamp = START_TIME

function cleanup(): void {
  clearStore()
}

test('Create incentive', () => {
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')

  onIncentiveCreated(incentiveCreatedEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'id', INCENTIVE_ID.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'farm', TOKEN.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'createdBy', ALICE.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'stakeToken', TOKEN.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsRemaining', INITIAL_AMOUNT.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'endTime', END_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'lastRewardTime', START_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'createdAtBlock', incentiveCreatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'createdAtTimestamp', incentiveCreatedEvent.block.timestamp.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtBlock', incentiveCreatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtTimestamp', incentiveCreatedEvent.block.timestamp.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtBlock', incentiveCreatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtTimestamp', incentiveCreatedEvent.block.timestamp.toString())

  cleanup()
})

test('Updating incentive with positive amount increases rewardsRemaining', () => {
  let amount = BigInt.fromString('1000000')
  let newStartTime = BigInt.fromU32(0)
  let newEndTime = BigInt.fromU32(0)
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent) // stake and subscribe is required for rewardsRemaining to update

  let incentiveUpdatedEvent = createIncentiveUpdatedEvent(INCENTIVE_ID, amount, newStartTime, newEndTime)
  incentiveUpdatedEvent.block.number = BigInt.fromString('123321')
  incentiveUpdatedEvent.block.timestamp = BigInt.fromString('1654851457')
  onIncentiveUpdated(incentiveUpdatedEvent)

  let rewardsPaidOut = '200000'
  let expectedRewardAmount = '1800000' // 1000000 initial, 2000000 after update, -200000 after 1 of 5 days has passed
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsRemaining', expectedRewardAmount)
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsAccured', rewardsPaidOut)
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'endTime', END_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'startTime', START_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', amount.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtBlock', incentiveUpdatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtTimestamp', incentiveUpdatedEvent.block.timestamp.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtBlock', incentiveUpdatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtTimestamp', incentiveUpdatedEvent.block.timestamp.toString())

  cleanup()
})


test('Updating incentive with positive amount when no liquidity is staked does not affect rewardsRemaining', () => {
  let amount = BigInt.fromString('1337')
  let newStartTime = BigInt.fromU32(0)
  let newEndTime = BigInt.fromU32(0)
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)

  // When: updating the incentive
  let incentiveUpdatedEvent = createIncentiveUpdatedEvent(INCENTIVE_ID, amount, newStartTime, newEndTime)
  incentiveUpdatedEvent.block.number = BigInt.fromU32(123321)
  incentiveUpdatedEvent.block.timestamp = BigInt.fromU32(1654851457) // a day later
  onIncentiveUpdated(incentiveUpdatedEvent)

  // Then: after a day has passed, incentives rewardsRemaining is unaffected due to no liquidity
  let expectedRewardAmount = INITIAL_AMOUNT.plus(amount).toString()
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsRemaining', expectedRewardAmount)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'endTime', END_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'startTime', START_TIME.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtBlock', incentiveUpdatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'modifiedAtTimestamp', incentiveUpdatedEvent.block.timestamp.toString())

  // And: rewardsUpdated fields are not updated
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtBlock', incentiveCreatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtTimestamp', incentiveCreatedEvent.block.timestamp.toString())

  cleanup()
})

test('Updating incentive with negative amount decreases rewardsRemaining', () => {
  let amount = BigInt.fromString('-1000001')
  let newStartTime = BigInt.fromU32(0)
  let newEndTime = BigInt.fromU32(0)
  let stakeAmount = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, stakeAmount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent) // stake and subscribe is required for rewardsRemaining to update

  // When: Incentive is updated
  let incentiveUpdatedEvent = createIncentiveUpdatedEvent(INCENTIVE_ID, amount, newStartTime, newEndTime)
  incentiveUpdatedEvent.block.number = BigInt.fromU32(1337)
  incentiveUpdatedEvent.block.timestamp = BigInt.fromU32(1654851457) // a day later
  onIncentiveUpdated(incentiveUpdatedEvent)

  // Then: the remaining reward is 0
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsRemaining', '0')
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtBlock', incentiveUpdatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtTimestamp', incentiveUpdatedEvent.block.timestamp.toString())


  cleanup()
})

test('Updating incentive with timestamps before the block timestamp results in usage of block timestamp', () => {
  let amount = BigInt.fromString('-600000')
  let newStartTime = BigInt.fromU32(1646143287) // Tue Mar 01 2022 14:01:27 GMT+0000
  let newEndTime = BigInt.fromU32(1646316087) // Thu Mar 03 2022 14:01:27 GMT+0000
  let timestamp = BigInt.fromU32(1646352000) // Fri Mar 04 2022 00:00:00 GMT+0000, Next
  let stakeAmount = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, stakeAmount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent) // stake and subscribe is required for rewardsRemaining to update

  // When: Incentive is updated
  let incentiveUpdatedEvent = createIncentiveUpdatedEvent(INCENTIVE_ID, amount, newStartTime, newEndTime)
  incentiveUpdatedEvent.block.timestamp = timestamp
  onIncentiveUpdated(incentiveUpdatedEvent)

  // Then: The block timestamp is used instead of newStartTime/newEndTime
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'endTime', timestamp.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'lastRewardTime', timestamp.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtBlock', incentiveUpdatedEvent.block.number.toString())
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'rewardsUpdatedAtTimestamp', incentiveUpdatedEvent.block.timestamp.toString())

  cleanup()
})

test('subscribe/unsubscribe updates the incentives staked liquidity', () => {
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
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
    START_TIME,
    END_TIME
  )
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let stakeEvent2 = createStakeEvent(token2, ALICE, amount)

  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
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

  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
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
  let expectedLiquidity = INITIAL_AMOUNT.times(BigInt.fromU32(2)).toString()
  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', expectedLiquidity)

  cleanup()
})

test('Unstake decreases the incentives liquidity', () => {
  let amount = BigInt.fromU32(1000000)
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)

  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', INITIAL_AMOUNT.toString())

  onUnstake(unstakeEvent)

  assert.fieldEquals('Incentive', INCENTIVE_ID.toString(), 'liquidityStaked', '0')
  cleanup()
})

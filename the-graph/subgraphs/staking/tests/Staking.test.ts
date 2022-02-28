import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as/assembly/index'
import { onIncentiveCreated, onStake, onSubscribe, onUnstake, onUnsubscribe } from '../src/mappings/staking'
import { getStakeId } from '../src/functions/staking'
import { createIncentiveCreatedEvent, createStakeEvent, createSubscribeEvent, createUnstakeEvent, createUnsubscribeEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const INCENTIVE_ID = BigInt.fromString('1')
const INITIAL_AMOUNT = BigInt.fromString('1000000')

function setup(): void {
  const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
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
  onIncentiveCreated(incentiveCreatedEvent)
}

function cleanup(): void {
  clearStore()
}

test('Stake', () => {
  setup()

  const amount = BigInt.fromString("10000000")
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakeId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('Stake', stakeId, 'id', stakeId)
  assert.fieldEquals('Stake', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.toString())

  // When: Alice stakes another time
  onStake(stakeEvent)

  // Then: The liquidity is doubled
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.times(BigInt.fromString("2")).toString())

  cleanup()
})



test('Stake and unstake', () => {
  setup()

  const amount = BigInt.fromString("10000000")
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, amount)

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakeId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('Stake', stakeId, 'id', stakeId)
  assert.fieldEquals('Stake', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.toString())

  // When: Alice unstakes
  onUnstake(unstakeEvent)

  // Then: Stake entity liquidity is updated
  assert.fieldEquals('Stake', stakeId, 'liquidity', '0')

  cleanup()
})


test('subscribe/unsubscribe updates the incentives staked liquidity', () => {
  setup()
  const amount = BigInt.fromString("10000000")
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

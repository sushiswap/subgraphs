import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onClaim, onIncentiveCreated, onStake, onSubscribe, onUnsubscribe } from '../src/mappings/staking'
import {
  createClaimEvent,
  createIncentiveCreatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createTokenMock,
  createUnsubscribeEvent,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const INCENTIVE_ID = BigInt.fromString('1')
const INCENTIVE_ID2 = BigInt.fromString('1')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const TOKEN2 = Address.fromString('0x0000000000000000000000000000000000000002')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000003')

function setup(): void {
  let amount = BigInt.fromString('1000000')
  let startTime = BigInt.fromString('1646068510')
  let endTime = BigInt.fromString('1646075000')

  let incentiveCreatedEvent = createIncentiveCreatedEvent(
    TOKEN,
    REWARD_TOKEN,
    ALICE,
    INCENTIVE_ID,
    amount,
    startTime,
    endTime
  )

  let incentiveCreatedEvent2 = createIncentiveCreatedEvent(
    TOKEN,
    REWARD_TOKEN,
    ALICE,
    INCENTIVE_ID2,
    amount,
    startTime,
    endTime
  )
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  createTokenMock(TOKEN2.toHex(), BigInt.fromString('18'), 'Alice LP Token', 'ALP')
  onIncentiveCreated(incentiveCreatedEvent)
  onIncentiveCreated(incentiveCreatedEvent2)
}

function cleanup(): void {
  clearStore()
}

test('Users subscription counts increment/decrement as expected', () => {
  setup()
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let subscribeEvent2 = createSubscribeEvent(INCENTIVE_ID2, ALICE)
  let unsubscribeEvent = createUnsubscribeEvent(INCENTIVE_ID2, ALICE)
  
  // When: alice subscribes to an incentive
  onSubscribe(subscribeEvent)

  // Then: total and active sub count is increased
  assert.fieldEquals('User', ALICE.toHex(), 'totalSubscriptionCount', '1')
  assert.fieldEquals('User', ALICE.toHex(), 'activeSubscriptionCount', '1')

  // When: alice subscribes to another incentive
  onSubscribe(subscribeEvent2)

  // Then: both counts are increased again
  assert.fieldEquals('User', ALICE.toHex(), 'totalSubscriptionCount', '2')
  assert.fieldEquals('User', ALICE.toHex(), 'activeSubscriptionCount', '2')

  // When: alice unsubscribes
  onUnsubscribe(unsubscribeEvent)

  // Then: active sub count is decreased
  assert.fieldEquals('User', ALICE.toHex(), 'activeSubscriptionCount', '1')

  // And: total sub count remains
  assert.fieldEquals('User', ALICE.toHex(), 'totalSubscriptionCount', '2')

  cleanup()
})

test('Claiming reward increases the rewardClaimCount', () => {
  setup()
  let amount = BigInt.fromString('100000000')
  let amount2 = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let claimEvent = createClaimEvent(INCENTIVE_ID, ALICE, amount2)

  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  onClaim(claimEvent)
  assert.fieldEquals('User', ALICE.toHex(), 'rewardClaimCount', '1')

  cleanup()
})

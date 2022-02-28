import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getSubscriptionId } from '../src/functions/subscription'
import { onIncentiveCreated, onSubscribe, onUnsubscribe } from '../src/mappings/staking'
import { createIncentiveCreatedEvent, createSubscribeEvent, createUnsubscribeEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const INCENTIVE_ID = BigInt.fromString('1')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')

function setup(): void {
  const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
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
  onIncentiveCreated(incentiveCreatedEvent)
}

function cleanup(): void {
  clearStore()
}

test('Subscribe', () => {
  setup()
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  onSubscribe(subscribeEvent)

  let subscribeId = getSubscriptionId(ALICE.toHex(), INCENTIVE_ID.toString())
  assert.fieldEquals('Subscription', subscribeId, 'id', subscribeId)
  assert.fieldEquals('Subscription', subscribeId, 'user', ALICE.toHex())
  assert.fieldEquals('Subscription', subscribeId, 'incentive', INCENTIVE_ID.toString())

  cleanup()
})

test('Subscribe and Unsubscribe', () => {
  setup()
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let unsubscribeEvent = createUnsubscribeEvent(INCENTIVE_ID, ALICE)
  onSubscribe(subscribeEvent)

  let subscribeId = getSubscriptionId(ALICE.toHex(), INCENTIVE_ID.toString())
  assert.fieldEquals('Subscription', subscribeId, 'id', subscribeId)
  assert.fieldEquals('Subscription', subscribeId, 'user', ALICE.toHex())
  assert.fieldEquals('Subscription', subscribeId, 'incentive', INCENTIVE_ID.toString())

  onUnsubscribe(unsubscribeEvent)

  assert.notInStore('Subscription', subscribeId)

  cleanup()
})

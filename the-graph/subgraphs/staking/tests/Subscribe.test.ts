import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getSubscriptionId } from '../src/functions/index'
import { onIncentiveCreated, onSubscribe, onUnsubscribe } from '../src/mappings/staking'
import { DEFAULT_REWARD_PER_LIQUIDITY } from '../src/constants/index'
import { createIncentiveCreatedEvent, createSubscribeEvent, createTokenMock, createUnsubscribeEvent } from './mocks'

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
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString("18"), "SushiToken", "SUSHI")
  createTokenMock(TOKEN.toHex(), BigInt.fromString("18"), "SushiSwap LP Token", "SLP")
  onIncentiveCreated(incentiveCreatedEvent)
}

function cleanup(): void {
  clearStore()
}

test('Subscribe', () => {
  setup()
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  subscribeEvent.block.number = BigInt.fromString("1337")
  subscribeEvent.block.timestamp = BigInt.fromString("1333337")
  
  onSubscribe(subscribeEvent)

  let subscribeId = getSubscriptionId(ALICE.toHex(), '1')
  assert.fieldEquals('Subscription', subscribeId, 'id', subscribeId)
  assert.fieldEquals('Subscription', subscribeId, 'user', ALICE.toHex())
  assert.fieldEquals('Subscription', subscribeId, 'incentive', INCENTIVE_ID.toString())
  assert.fieldEquals('Subscription', subscribeId, 'rewardPerLiquidity', DEFAULT_REWARD_PER_LIQUIDITY.toString())
  assert.fieldEquals('Subscription', subscribeId, 'token', TOKEN.toHex())
  assert.fieldEquals('Subscription', subscribeId, 'block', subscribeEvent.block.number.toString())
  assert.fieldEquals('Subscription', subscribeId, 'timestamp', subscribeEvent.block.timestamp.toString())


  cleanup()
})



test('Subscribe and Unsubscribe', () => {
  setup()
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let unsubscribeEvent = createUnsubscribeEvent(INCENTIVE_ID, ALICE)
  onSubscribe(subscribeEvent)

  let subscribeId = getSubscriptionId(ALICE.toHex(), '1')
  onUnsubscribe(unsubscribeEvent)

  assert.notInStore('Subscription', subscribeId)

  cleanup()
})

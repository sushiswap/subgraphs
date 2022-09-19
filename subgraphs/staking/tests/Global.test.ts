import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { GLOBAL } from '../src/constants'
import { onClaim, onIncentiveCreated, onStake, onSubscribe, onUnstake } from '../src/mappings/staking'
import {
  createClaimEvent,
  createIncentiveCreatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createTokenMock,
  createUnstakeEvent,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const INCENTIVE_ID = BigInt.fromString('1')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const START_TIME = BigInt.fromString('1640995261') // Sat Jan 01 2022 00:01:01 GMT+0000
const END_TIME = BigInt.fromString('1641859261') // 	Tue Jan 11 2022 00:01:01 GMT+0000
const AMOUNT = BigInt.fromString('1000')

function setup(): void {
  cleanup()

  let incentiveCreatedEvent = createIncentiveCreatedEvent(
    TOKEN,
    REWARD_TOKEN,
    ALICE,
    INCENTIVE_ID,
    AMOUNT,
    START_TIME,
    END_TIME
  )
  incentiveCreatedEvent.block.timestamp = START_TIME
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
}

function cleanup(): void {
  clearStore()
}

test('stake increases tx count by 1', () => {
  setup()
  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)

  onStake(stakeEvent)

  assert.fieldEquals('Global', GLOBAL, 'transactionCount', '1')

  cleanup()
})

test('stake and unstake increases tx count by 2', () => {
  setup()

  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, AMOUNT)
  onStake(stakeEvent)
  onUnstake(unstakeEvent)

  assert.fieldEquals('Global', GLOBAL, 'transactionCount', '2')

  cleanup()
})

test('stake and claim increases tx count by 2', () => {
  setup()
  let amount2 = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let claimEvent = createClaimEvent(INCENTIVE_ID, ALICE, amount2)
  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  onClaim(claimEvent)

  assert.fieldEquals('Global', GLOBAL, 'transactionCount', '2')
  cleanup()
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { onClaim, onIncentiveCreated, onStake, onSubscribe, onUnstake } from '../src/mappings/staking'
import { CLAIM, STAKE, STAKING_CONTRACT_ADDRESS, UNSTAKE } from './../src/constants'
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

test('on stake event, a transaction entity is created', () => {
  setup()
  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)
  const id = 'tx:1'

  onStake(stakeEvent)

  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', STAKE)
  assert.fieldEquals('Transaction', id, 'farm', TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'user', ALICE.toHex())
  assert.fieldEquals('Transaction', id, 'to', STAKING_CONTRACT_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'token', TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'txHash', stakeEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', stakeEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', stakeEvent.block.timestamp.toString())

  cleanup()
})

test('on unstake event, a transaction entity is created', () => {
  setup()

  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, AMOUNT)
  onStake(stakeEvent)
  onUnstake(unstakeEvent)
  const id = 'tx:2' // Start at one, first tx was from staking

  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', UNSTAKE)
  assert.fieldEquals('Transaction', id, 'farm', TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'user', ALICE.toHex())
  assert.fieldEquals('Transaction', id, 'to', STAKING_CONTRACT_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'token', TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'txHash', unstakeEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', unstakeEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', unstakeEvent.block.timestamp.toString())

  cleanup()
})

test('on claim event, a transaction entity is created', () => {
  setup()
  let amount2 = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, AMOUNT)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let claimEvent = createClaimEvent(INCENTIVE_ID, ALICE, amount2)

  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  onClaim(claimEvent)

  const id = 'tx:2' // Start at one, first tx was from staking

  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', CLAIM)
  assert.fieldEquals('Transaction', id, 'farm', TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'incentive', INCENTIVE_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', amount2.toString())
  assert.fieldEquals('Transaction', id, 'user', ALICE.toHex())
  assert.fieldEquals('Transaction', id, 'to', ALICE.toHex())
  assert.fieldEquals('Transaction', id, 'token', REWARD_TOKEN.toHex())
  assert.fieldEquals('Transaction', id, 'txHash', claimEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', claimEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', claimEvent.block.timestamp.toString())

  cleanup()
})

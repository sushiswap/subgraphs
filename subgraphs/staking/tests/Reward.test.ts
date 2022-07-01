import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getRewardId } from '../src/functions/index'
import { onClaim, onIncentiveCreated, onStake, onSubscribe } from '../src/mappings/staking'
import {
  createClaimEvent,
  createIncentiveCreatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createTokenMock,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const CHARLIE = Address.fromString('0x0000000000000000000000000000000000000b12')
const INCENTIVE_ID = BigInt.fromString('1')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const START_TIME = BigInt.fromString('1640995261')// Sat Jan 01 2022 00:01:01 GMT+0000
const END_TIME = BigInt.fromString('1641859261')// 	Tue Jan 11 2022 00:01:01 GMT+0000


function setup(): void {
  let amount = BigInt.fromString('1000')

  let incentiveCreatedEvent = createIncentiveCreatedEvent(
    TOKEN,
    REWARD_TOKEN,
    ALICE,
    INCENTIVE_ID,
    amount,
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

test('Reward is created on subscription', () => {
  setup()

  const amount = BigInt.fromString('1000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  const id = getRewardId(ALICE.toHex(), INCENTIVE_ID.toString())

  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  assert.fieldEquals('Reward', id, 'id', id)
  assert.fieldEquals('Reward', id, 'user', ALICE.toHex())
  assert.fieldEquals('Reward', id, 'token', REWARD_TOKEN.toHex())
  assert.fieldEquals('Reward', id, 'incentive', INCENTIVE_ID.toString())
  assert.fieldEquals('Reward', id, 'claimedAmount', "0")
  assert.fieldEquals('Reward', id, 'claimableAmount', "0")
  assert.fieldEquals('Reward', id, 'createdAtBlock', subscribeEvent.block.number.toString())
  assert.fieldEquals('Reward', id, 'createdAtTimestamp', subscribeEvent.block.timestamp.toString())
  assert.fieldEquals('Reward', id, 'modifiedAtBlock', subscribeEvent.block.number.toString())
  assert.fieldEquals('Reward', id, 'modifiedAtTimestamp', subscribeEvent.block.timestamp.toString())

  cleanup()
})

test('Two user stakes, after half of the incentives duration has passed a third user subscribed, which updates the claimableAmount', () => {
  setup()

  const aliceAmount = BigInt.fromString('1000')
  const bobAmount = BigInt.fromString('500')
  const charlieAmount = BigInt.fromString('500')

  let aliceStakeEvent = createStakeEvent(TOKEN, ALICE, aliceAmount)
  let bobStakeEvent = createStakeEvent(TOKEN, BOB, bobAmount)
  let charlieStakeEvent = createStakeEvent(TOKEN, CHARLIE, charlieAmount)
  aliceStakeEvent.block.timestamp = START_TIME
  bobStakeEvent.block.timestamp = START_TIME

  let aliceSubscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let bobSubscribeEvent = createSubscribeEvent(INCENTIVE_ID, BOB)
  let charlieSubscribeEvent = createSubscribeEvent(INCENTIVE_ID, CHARLIE)
  aliceSubscribeEvent.block.timestamp = START_TIME
  bobSubscribeEvent.block.timestamp = START_TIME
  const aliceRewardId = getRewardId(ALICE.toHex(), INCENTIVE_ID.toString())
  const bobRewardId = getRewardId(BOB.toHex(), INCENTIVE_ID.toString())
  onStake(aliceStakeEvent)
  onStake(bobStakeEvent)
  onSubscribe(aliceSubscribeEvent)
  onSubscribe(bobSubscribeEvent)

  // assert.fieldEquals('Reward', id, 'id', id)
  assert.fieldEquals('Reward', aliceRewardId, 'claimedAmount', "0")
  assert.fieldEquals('Reward', aliceRewardId, 'claimableAmount', "0")
  assert.fieldEquals('Reward', aliceRewardId, 'modifiedAtTimestamp', aliceSubscribeEvent.block.timestamp.toString())


  assert.fieldEquals('Reward', bobRewardId, 'claimedAmount', "0")
  assert.fieldEquals('Reward', bobRewardId, 'claimableAmount', "0")
  assert.fieldEquals('Reward', bobRewardId, 'modifiedAtTimestamp', bobSubscribeEvent.block.timestamp.toString())

  // When: charlie subscribes after 50% of duration has passed
  onStake(charlieStakeEvent)
  charlieSubscribeEvent.block.timestamp = BigInt.fromString("1641427261") // 1641427261, half way, 5 days after creation, 5 days left.
  onSubscribe(charlieSubscribeEvent)

  // Then: rewards are updated
  assert.fieldEquals('Reward', aliceRewardId, 'claimedAmount', "0")
  assert.fieldEquals('Reward', aliceRewardId, 'claimableAmount', "0.0000000000000003333333333333333333333333333333334")
  assert.fieldEquals('Reward', aliceRewardId, 'modifiedAtTimestamp', charlieSubscribeEvent.block.timestamp.toString())


  assert.fieldEquals('Reward', bobRewardId, 'claimedAmount', "0")
  assert.fieldEquals('Reward', bobRewardId, 'claimableAmount', "0.0000000000000001666666666666666666666666666666667")
  assert.fieldEquals('Reward', bobRewardId, 'modifiedAtTimestamp', charlieSubscribeEvent.block.timestamp.toString())

  cleanup()
})

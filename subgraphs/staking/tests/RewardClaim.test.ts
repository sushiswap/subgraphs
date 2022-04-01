import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getRewardClaimId } from '../src/functions/index'
import { onClaim, onIncentiveCreated, onStake, onSubscribe } from '../src/mappings/staking'
import {
  createClaimEvent,
  createIncentiveCreatedEvent,
  createStakeEvent,
  createSubscribeEvent,
  createTokenMock,
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const INCENTIVE_ID = BigInt.fromString('1')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')

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
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'SushiSwap LP Token', 'SLP')
  onIncentiveCreated(incentiveCreatedEvent)
}

function cleanup(): void {
  clearStore()
}

test('RewardClaim entity is created on claim event', () => {
  setup()
  let amount = BigInt.fromString('100000000')
  let amount2 = BigInt.fromString('10000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let subscribeEvent = createSubscribeEvent(INCENTIVE_ID, ALICE)
  let claimEvent = createClaimEvent(INCENTIVE_ID, ALICE, amount2)

  onStake(stakeEvent)
  onSubscribe(subscribeEvent)

  onClaim(claimEvent)
  let claimId = getRewardClaimId(ALICE.toHex(), '1')
  assert.fieldEquals('RewardClaim', claimId, 'id', claimId)
  assert.fieldEquals('RewardClaim', claimId, 'user', ALICE.toHex())
  assert.fieldEquals('RewardClaim', claimId, 'token', REWARD_TOKEN.toHex())
  assert.fieldEquals('RewardClaim', claimId, 'incentive', INCENTIVE_ID.toString())
  assert.fieldEquals('RewardClaim', claimId, 'amount', amount2.toString())

  cleanup()
})

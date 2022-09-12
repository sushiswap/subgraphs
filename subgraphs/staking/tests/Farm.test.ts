import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import {
  onIncentiveCreated
} from '../src/mappings/staking'
import {
  createIncentiveCreatedEvent, createTokenMock
} from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const INCENTIVE_ID = BigInt.fromString('1')
const INCENTIVE_ID2 = BigInt.fromString('2')
const INITIAL_AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1646068510')
const END_TIME = BigInt.fromString('1646075000')
let incentiveCreatedEvent = createIncentiveCreatedEvent(
  TOKEN,
  REWARD_TOKEN,
  ALICE,
  INCENTIVE_ID,
  INITIAL_AMOUNT,
  START_TIME,
  END_TIME
)

function cleanup(): void {
  clearStore()
}

test('Farm is created on incentive creation event', () => {
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'SushiToken', 'SUSHI')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')
  let incentiveCreatedEvent2 = createIncentiveCreatedEvent(
    TOKEN,
    REWARD_TOKEN,
    ALICE,
    INCENTIVE_ID2,
    INITIAL_AMOUNT,
    START_TIME,
    END_TIME
  )

  onIncentiveCreated(incentiveCreatedEvent)

  assert.fieldEquals('Farm', TOKEN.toHex(), 'id', TOKEN.toHex())
  assert.fieldEquals('Farm', TOKEN.toHex(), 'stakeToken', TOKEN.toHex())
  assert.fieldEquals('Farm', TOKEN.toHex(), 'incentives', "[1]")
  assert.fieldEquals('Farm', TOKEN.toHex(), 'createdAtBlock', incentiveCreatedEvent.block.number.toString())
  assert.fieldEquals('Farm', TOKEN.toHex(), 'createdAtTimestamp', incentiveCreatedEvent.block.timestamp.toString())


  onIncentiveCreated(incentiveCreatedEvent2)

  assert.entityCount("Farm", 1)
  assert.fieldEquals('Farm', TOKEN.toHex(), 'incentives', "[1, 2]")

  cleanup()
})

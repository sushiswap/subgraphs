import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { WEEK, YEAR } from '../src/constants'
import { onCreateVesting } from '../src/mappings/vesting'
import { createTokenMock, createVestingEvent } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const VESTING_ID = BigInt.fromString('1')
const CLIFF_AMOUNT = BigInt.fromString('100000000')
const STEPS_AMOUNT = BigInt.fromString('10000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const CLIFF_DURATION = BigInt.fromU32(YEAR)
const biweekly = 2 * WEEK
const STEP_DURATION = BigInt.fromU32(biweekly)
const STEPS = BigInt.fromU32(26)

let vestingEvent: CreateVestingEvent

function setup(): void {
  vestingEvent = createVestingEvent(
    VESTING_ID,
    WETH_ADDRESS,
    SENDER,
    RECIEVER,
    START_TIME,
    CLIFF_DURATION,
    STEP_DURATION,
    STEPS,
    CLIFF_AMOUNT,
    STEPS_AMOUNT,
    true
  )
  createTokenMock(WETH_ADDRESS.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onCreateVesting(vestingEvent)
}

function cleanup(): void {
  clearStore()
}

test('users are created on stream creation event', () => {
  setup()

  assert.entityCount('User', 2)
  assert.fieldEquals('User', SENDER.toHex(), 'id', SENDER.toHex())
  assert.fieldEquals('User', SENDER.toHex(), 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('User', SENDER.toHex(), 'createdAtTimestamp', vestingEvent.block.timestamp.toString())
  assert.fieldEquals('User', RECIEVER.toHex(), 'id', RECIEVER.toHex())
  assert.fieldEquals('User', SENDER.toHex(), 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('User', SENDER.toHex(), 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

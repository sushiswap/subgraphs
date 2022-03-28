import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { ACTIVE, CANCELLED, WEEK, YEAR } from '../src/constants'
import { onCreateVesting } from '../src/mappings/vesting'
import { createCancelStreamEvent, createTokenMock, createVestingEvent, createWithdrawEvent } from './mocks'
import { LogCreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const VESTING_ID = BigInt.fromString('1')
const CLIFF_AMOUNT = BigInt.fromString('1000000')
const STEPS_AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const CLIFF_DURATION = BigInt.fromU32(YEAR)
const biweekly = 2 * WEEK
const STEP_DURATION = BigInt.fromU32(biweekly) 
const STEPS = BigInt.fromU32(26)

const END_TIME = START_TIME.plus(CLIFF_DURATION).plus(STEPS.times(STEP_DURATION))

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

test('Created vesting contains expected fields', () => {
  setup()

  const id = VESTING_ID.toString()
  assert.fieldEquals('Vesting', id, 'id', id)
  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())
  assert.fieldEquals('Vesting', id, 'cliffDuration', CLIFF_DURATION.toString())
  assert.fieldEquals('Vesting', id, 'stepDuration', STEP_DURATION.toString())
  assert.fieldEquals('Vesting', id, 'cliffAmount', CLIFF_AMOUNT.toString())
  assert.fieldEquals('Vesting', id, 'stepAmount', STEPS_AMOUNT.toString())
  assert.fieldEquals('Vesting', id, 'token', WETH_ADDRESS.toHex())
  // assert.fieldEquals('Vesting', id, 'schedule', id)
  assert.fieldEquals('Vesting', id, 'status', ACTIVE)
  assert.fieldEquals('Vesting', id, 'createdBy', SENDER.toHex())
  assert.fieldEquals('Vesting', id, 'fromBentoBox', 'true')
  assert.fieldEquals('Vesting', id, 'startedAt', START_TIME.toString())
  assert.fieldEquals('Vesting', id, 'expiresAt', END_TIME.toString())
  assert.fieldEquals('Vesting', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

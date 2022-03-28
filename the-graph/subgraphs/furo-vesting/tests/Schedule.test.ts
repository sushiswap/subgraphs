import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { assert, clearStore, logStore, test } from 'matchstick-as'
import { ACTIVE, CANCELLED, CLIFF, END, START, STEP, WEEK, YEAR } from '../src/constants'
import { onCreateVesting } from '../src/mappings/vesting'
import { createCancelStreamEvent, createTokenMock, createVestingEvent, createWithdrawEvent } from './mocks'
import { LogCreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'

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

const END_TIME = START_TIME.plus(CLIFF_DURATION).plus(STEPS.times(STEP_DURATION)) // Sun Mar 24 2024 12:24:55 GMT+0000, two years later
const TOTAL_AMOUNT = CLIFF_AMOUNT.plus(STEPS.times(STEPS_AMOUNT)) // 100000000 + (26 * 10000000) = 360000000

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

test('vesting creates a schedule and schedule periods', () => {
  setup()

  const id = VESTING_ID.toString()
  assert.fieldEquals('Schedule', id, 'id', id)
  assert.fieldEquals('Schedule', id, 'vesting', id)

  let passedTime = START_TIME
  let passedAmount = BigInt.fromString("0")
  const startPeriodId = id.concat(':period:0')
  assert.fieldEquals('SchedulePeriod', startPeriodId, 'id', startPeriodId)
  assert.fieldEquals('SchedulePeriod', startPeriodId, 'type', START)
  assert.fieldEquals('SchedulePeriod', startPeriodId, 'time', passedTime.toString())
  assert.fieldEquals('SchedulePeriod', startPeriodId, 'amount', passedAmount.toString())

  passedTime = passedTime.plus(CLIFF_DURATION)
  passedAmount = passedAmount.plus(CLIFF_AMOUNT)
  const cliffPeriodId = id.concat(':period:1')
  assert.fieldEquals('SchedulePeriod', cliffPeriodId, 'id', cliffPeriodId)
  assert.fieldEquals('SchedulePeriod', cliffPeriodId, 'type', CLIFF)
  assert.fieldEquals('SchedulePeriod', cliffPeriodId, 'time', passedTime.toString())
  assert.fieldEquals('SchedulePeriod', cliffPeriodId, 'amount', passedAmount.toString())

  const createdPeriodCount = 2

  for (let i = 0; i < STEPS.toI32() - 1; i++) {
    passedTime = passedTime.plus(STEP_DURATION)
    passedAmount = passedAmount.plus(STEPS_AMOUNT)
    const stepPeriodCount = createdPeriodCount + i
    const stepPeriodId = id.concat(':period:'.concat(stepPeriodCount.toString()))
    assert.fieldEquals('SchedulePeriod', stepPeriodId, 'id', stepPeriodId)
    assert.fieldEquals('SchedulePeriod', stepPeriodId, 'type', STEP)
    assert.fieldEquals('SchedulePeriod', stepPeriodId, 'time', passedTime.toString())
    assert.fieldEquals('SchedulePeriod', stepPeriodId, 'amount', passedAmount.toString())
  }


  passedTime = passedTime.plus(STEP_DURATION)
  passedAmount = passedAmount.plus(STEPS_AMOUNT)
  const endPeriodNumber = createdPeriodCount + STEPS.toI32()
  const endPeriodId = id.concat(':period:'.concat(endPeriodNumber.toString()))
  assert.fieldEquals('SchedulePeriod', endPeriodId, 'id', endPeriodId)
  assert.fieldEquals('SchedulePeriod', endPeriodId, 'type', END)
  assert.fieldEquals('SchedulePeriod', endPeriodId, 'time', passedTime.toString())
  assert.fieldEquals('SchedulePeriod', endPeriodId, 'amount', passedAmount.toString())

  assert.fieldEquals('Vesting', id, 'expiresAt', passedTime.toString())

  cleanup()
})

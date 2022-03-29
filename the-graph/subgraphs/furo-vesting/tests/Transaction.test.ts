import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { LogCreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { ACTIVE, CANCELLED, DEPOSIT, DISBURSEMENT, WEEK, WITHDRAWAL, YEAR } from '../src/constants'
import { onCancelVesting, onCreateVesting, onWithdraw } from '../src/mappings/vesting'
import { createCancelVestingEvent, createTokenMock, createVestingEvent, createWithdrawEvent } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIPIENT = Address.fromString('0x0000000000000000000000000000000000000b0b')
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
    RECIPIENT,
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

test('Deposit transaction is created on vesting creation event', () => {
  setup()

  const id = VESTING_ID.toString().concat(":tx:0")
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DEPOSIT)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', TOTAL_AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})


test('Disbursement transactions are created when vesting is cancelled', () => {
  setup()
  let recipientAmount = CLIFF_AMOUNT
  let ownerAmount = TOTAL_AMOUNT.minus(recipientAmount)
  let cancelVestingEvent = createCancelVestingEvent(VESTING_ID, ownerAmount, recipientAmount, WETH_ADDRESS, true)

  onCancelVesting(cancelVestingEvent)

  const id = VESTING_ID.toString().concat(":tx:1")
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', recipientAmount.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())


  const id2 = VESTING_ID.toString().concat(":tx:2")
  assert.fieldEquals('Transaction', id2, 'id', id2)
  assert.fieldEquals('Transaction', id2, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id2, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id2, 'amount', ownerAmount.toString())
  assert.fieldEquals('Transaction', id2, 'to', SENDER.toHex())
  assert.fieldEquals('Transaction', id2, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id2, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id2, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id2, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})


test('Withdrawal event creates withdrawal transaction', () => {
  setup()
  const amount = CLIFF_AMOUNT.plus(STEPS_AMOUNT)
  let withdrawalEvent = createWithdrawEvent(VESTING_ID, amount, WETH_ADDRESS, true)

  onWithdraw(withdrawalEvent)

  const id = VESTING_ID.toString().concat(":tx:1")
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', WITHDRAWAL)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', amount.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})
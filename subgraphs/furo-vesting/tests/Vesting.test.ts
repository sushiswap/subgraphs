import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { ACTIVE, CANCELLED, WEEK, YEAR, ZERO_ADDRESS } from '../src/constants'
import { onCancelVesting, onCreateVesting, onTransfer, onWithdraw } from '../src/mappings/vesting'
import { createCancelVestingEvent, createTokenMock, createTransferEvent, createVestingEvent, createWithdrawEvent } from './mocks'

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

test('Created vesting contains expected fields', () => {
  setup()

  const id = VESTING_ID.toString()
  assert.fieldEquals('Vesting', id, 'id', id)
  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())
  assert.fieldEquals('Vesting', id, 'cliffDuration', CLIFF_DURATION.toString())
  assert.fieldEquals('Vesting', id, 'stepDuration', STEP_DURATION.toString())
  assert.fieldEquals('Vesting', id, 'cliffAmount', CLIFF_AMOUNT.toString())
  assert.fieldEquals('Vesting', id, 'stepAmount', STEPS_AMOUNT.toString())
  assert.fieldEquals('Vesting', id, 'totalAmount', TOTAL_AMOUNT.toString())
  assert.fieldEquals('Vesting', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Vesting', id, 'status', ACTIVE)
  assert.fieldEquals('Vesting', id, 'createdBy', SENDER.toHex())
  assert.fieldEquals('Vesting', id, 'fromBentoBox', 'true')
  assert.fieldEquals('Vesting', id, 'startedAt', START_TIME.toString())
  assert.fieldEquals('Vesting', id, 'expiresAt', END_TIME.toString())
  assert.fieldEquals('Vesting', id, 'txHash', vestingEvent.transaction.hash.toHex())
  assert.fieldEquals('Vesting', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())
  assert.fieldEquals('Vesting', id, 'modifiedAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'modifiedAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

test('Stop vesting updates the vesting entity', () => {
  setup()
  const id = VESTING_ID.toString()
  let recipientAmount = CLIFF_AMOUNT
  let ownerAmount = TOTAL_AMOUNT.minus(recipientAmount)
  let cancelVestingEvent = createCancelVestingEvent(VESTING_ID, ownerAmount, recipientAmount, WETH_ADDRESS, true)
  assert.fieldEquals('Vesting', id, 'withdrawnAmount', '0')

  onCancelVesting(cancelVestingEvent)

  assert.fieldEquals('Vesting', id, 'status', CANCELLED)
  assert.fieldEquals('Vesting', id, 'cancelledAtBlock', cancelVestingEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'cancelledAtTimestamp', cancelVestingEvent.block.timestamp.toString())
  assert.fieldEquals('Vesting', id, 'modifiedAtBlock', cancelVestingEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'modifiedAtTimestamp', cancelVestingEvent.block.timestamp.toString())
  assert.fieldEquals('Vesting', id, 'withdrawnAmount', cancelVestingEvent.params.recipientAmount.toString())


  cleanup()
})

test('On withdraw event, withdrawnAmount field is updated', () => {
  setup()
  const amount = BigInt.fromString('1337420')
  let withdrawalEvent = createWithdrawEvent(VESTING_ID, WETH_ADDRESS, amount, true)

  onWithdraw(withdrawalEvent)

  assert.fieldEquals('Vesting', VESTING_ID.toString(), 'withdrawnAmount', amount.toString())

  cleanup()
})


test('Mint transaction does NOT update the vesting recipient', () => {
  setup()
  const id = VESTING_ID.toString()
  let transactionEvent = createTransferEvent(RECIEVER, ZERO_ADDRESS, VESTING_ID)
  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())

  onTransfer(transactionEvent)

  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())

  cleanup()
})


test('Burn transaction does NOT update the vesting recipient', () => {
  setup()
  const id = VESTING_ID.toString()
  let transactionEvent = createTransferEvent(ZERO_ADDRESS, RECIEVER, VESTING_ID)
  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())

  onTransfer(transactionEvent)

  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())

  cleanup()
})


test('Transfer event updates the vesting recipient', () => {
  setup()
  const id = VESTING_ID.toString()
  let transactionEvent = createTransferEvent(RECIEVER, SENDER, VESTING_ID)

  assert.fieldEquals('Vesting', id, 'recipient', RECIEVER.toHex())

  // When: Reciever transfers the vesting to sender
  onTransfer(transactionEvent)

  // Then: The Vestings recipient is updated
  assert.fieldEquals('Vesting', id, 'recipient', SENDER.toHex())
  assert.fieldEquals('Vesting', id, 'modifiedAtBlock', transactionEvent.block.number.toString())
  assert.fieldEquals('Vesting', id, 'modifiedAtTimestamp', transactionEvent.block.timestamp.toString())

  cleanup()
})
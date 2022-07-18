import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { CreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { WEEK, YEAR } from '../src/constants'
import { onCancelStream, onCreateStream, onUpdateStream, onWithdrawStream } from '../src/mappings/stream'
import { onCancelVesting, onCreateVesting, onWithdrawVesting } from '../src/mappings/vesting'
import { DEPOSIT, DISBURSEMENT, EXTEND, WITHDRAWAL } from './../src/constants'
import {
  createCancelStreamEvent,
  createCancelVestingEvent,
  createStreamEvent,
  createTokenMock,
  createUpdateStreamEvent,
  createVestingEvent,
  createWithdrawStreamEvent,
  createWithdrawVestingEvent,
} from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const STREAM_ID = BigInt.fromString('1001')
const AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const END_TIME = BigInt.fromString('1650972295') // 	Tue Apr 26 2022 11:24:55 GMT+0000, One month later

const RECIPIENT = Address.fromString('0x0000000000000000000000000000000000000b0b')
const VESTING_ID = BigInt.fromString('1')
const CLIFF_AMOUNT = BigInt.fromString('100000000')
const STEPS_AMOUNT = BigInt.fromString('10000000')
const CLIFF_DURATION = BigInt.fromU32(YEAR)
const biweekly = 2 * WEEK
const STEP_DURATION = BigInt.fromU32(biweekly)
const STEPS = BigInt.fromU32(26)

const TOTAL_AMOUNT = CLIFF_AMOUNT.plus(STEPS.times(STEPS_AMOUNT)) // 100000000 + (26 * 10000000) = 360000000

let vestingEvent: CreateVestingEvent
let streamEvent: CreateStreamEvent

function setupVesting(): void {
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

function setupStream(): void {
  cleanup()

  streamEvent = createStreamEvent(STREAM_ID, SENDER, RECIEVER, WETH_ADDRESS, AMOUNT, START_TIME, END_TIME, true)
  createTokenMock(WETH_ADDRESS.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onCreateStream(streamEvent)
}

function cleanup(): void {
  clearStore()
}

test('on create stream event, a transaction entity is created', () => {
  setupStream()
  const id = STREAM_ID.toString().concat(':tx:0')

  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DEPOSIT)
  assert.fieldEquals('Transaction', id, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', streamEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', streamEvent.block.timestamp.toString())

  cleanup()
})

test('Cancel stream', () => {
  setupStream()
  const id1 = STREAM_ID.toString().concat(':tx:1')
  const id2 = STREAM_ID.toString().concat(':tx:2')
  const amount2 = BigInt.fromString('2000000')
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, amount2, AMOUNT, WETH_ADDRESS, true)
  cancelStreamEvent.block.number = BigInt.fromString('123')
  cancelStreamEvent.block.timestamp = BigInt.fromString('11111111')

  onCancelStream(cancelStreamEvent)
  assert.entityCount('Transaction', 3)
  assert.fieldEquals('Transaction', id1, 'id', id1)
  assert.fieldEquals('Transaction', id1, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id1, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id1, 'amount', amount2.toString())
  assert.fieldEquals('Transaction', id1, 'to', SENDER.toHex())
  assert.fieldEquals('Transaction', id1, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id1, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id1, 'txHash', cancelStreamEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id1, 'createdAtBlock', cancelStreamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id1, 'createdAtTimestamp', cancelStreamEvent.block.timestamp.toString())

  assert.fieldEquals('Transaction', id2, 'id', id2)
  assert.fieldEquals('Transaction', id2, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id2, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id2, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id2, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id2, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id2, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id2, 'txHash', cancelStreamEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id2, 'createdAtBlock', cancelStreamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id2, 'createdAtTimestamp', cancelStreamEvent.block.timestamp.toString())
  cleanup()
})

test('Withdraw from stream creates a Transaction', () => {
  setupStream()
  const id = STREAM_ID.toString().concat(':tx:1')
  const amount2 = BigInt.fromString('2000')
  let withdrawalEvent = createWithdrawStreamEvent(STREAM_ID, amount2, RECIEVER, WETH_ADDRESS, true)
  withdrawalEvent.block.number = BigInt.fromString('123')
  withdrawalEvent.block.timestamp = BigInt.fromString('11111111')

  onWithdrawStream(withdrawalEvent)
  assert.entityCount('Transaction', 2)
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', WITHDRAWAL)
  assert.fieldEquals('Transaction', id, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', amount2.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', withdrawalEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', withdrawalEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', withdrawalEvent.block.timestamp.toString())

  cleanup()
})

test('Update stream creates a transaction', () => {
  setupStream()
  const id = STREAM_ID.toString().concat(':tx:1')
  const extendTime = BigInt.fromString('2628000') // a month in seconds
  let updateStreamEvent = createUpdateStreamEvent(STREAM_ID, AMOUNT, extendTime, true)

  onUpdateStream(updateStreamEvent)

  assert.entityCount('Transaction', 2)
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', EXTEND)
  assert.fieldEquals('Transaction', id, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', updateStreamEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', updateStreamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', updateStreamEvent.block.timestamp.toString())

  cleanup()
})

test('Deposit transaction is created on vesting creation event', () => {
  setupVesting()

  const id = VESTING_ID.toString().concat(':tx:0')
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DEPOSIT)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', TOTAL_AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', vestingEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

test('Disbursement transactions are created when vesting is cancelled', () => {
  setupVesting()
  let recipientAmount = CLIFF_AMOUNT
  let ownerAmount = TOTAL_AMOUNT.minus(recipientAmount)
  let cancelVestingEvent = createCancelVestingEvent(VESTING_ID, ownerAmount, recipientAmount, WETH_ADDRESS, true)

  onCancelVesting(cancelVestingEvent)

  const id = VESTING_ID.toString().concat(':tx:1')
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', recipientAmount.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', vestingEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  const id2 = VESTING_ID.toString().concat(':tx:2')
  assert.fieldEquals('Transaction', id2, 'id', id2)
  assert.fieldEquals('Transaction', id2, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id2, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id2, 'amount', ownerAmount.toString())
  assert.fieldEquals('Transaction', id2, 'to', SENDER.toHex())
  assert.fieldEquals('Transaction', id2, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id2, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', vestingEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id2, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id2, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

test('Withdrawal event creates withdrawal transaction', () => {
  setupVesting()
  const amount = BigInt.fromString('1337420')
  let withdrawalEvent = createWithdrawVestingEvent(VESTING_ID, WETH_ADDRESS, amount, true)

  onWithdrawVesting(withdrawalEvent)

  const id = VESTING_ID.toString().concat(':tx:1')
  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', WITHDRAWAL)
  assert.fieldEquals('Transaction', id, 'vesting', VESTING_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', amount.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIPIENT.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'txHash', vestingEvent.transaction.hash.toHex())
  assert.fieldEquals('Transaction', id, 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { ACTIVE, CANCELLED, STREAM_PREFIX, ZERO_ADDRESS } from './../src/constants'
import { onCancelStream, onCreateStream, onTransferStream, onUpdateStream, onWithdrawStream } from '../src/mappings/stream'
import {
  createCancelStreamEvent,
  createStreamEvent,
  createTokenMock,
  createTransferStreamEvent,
  createUpdateStreamEvent,
  createWithdrawStreamEvent
} from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const STREAM_ID = BigInt.fromString('1001')
const AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const END_TIME = BigInt.fromString('1650972295') // 	Tue Apr 26 2022 11:24:55 GMT+0000, One month later
let streamEvent: CreateStreamEvent

function setup(): void {
  streamEvent = createStreamEvent(STREAM_ID, SENDER, RECIEVER, WETH_ADDRESS, AMOUNT, START_TIME, END_TIME, true)
  createTokenMock(WETH_ADDRESS.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onCreateStream(streamEvent)
}

function cleanup(): void {
  clearStore()
}

test('Stream entity contains expected fields', () => {
  setup()

  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  assert.fieldEquals('Stream', id, 'id', id)
  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())
  assert.fieldEquals('Stream', id, 'totalAmount', AMOUNT.toString())
  assert.fieldEquals('Stream', id, 'withdrawnAmount', '0')
  assert.fieldEquals('Stream', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Stream', id, 'status', ACTIVE)
  assert.fieldEquals('Stream', id, 'createdBy', SENDER.toHex())
  assert.fieldEquals('Stream', id, 'fromBentoBox', 'true')
  assert.fieldEquals('Stream', id, 'startedAt', START_TIME.toString())
  assert.fieldEquals('Stream', id, 'expiresAt', END_TIME.toString())
  assert.fieldEquals('Stream', id, 'txHash', streamEvent.transaction.hash.toHex())
  assert.fieldEquals('Stream', id, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'createdAtTimestamp', streamEvent.block.timestamp.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())
  assert.fieldEquals('Stream', id, 'transactionCount', '1')

  cleanup()
})

test('Cancel stream', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, AMOUNT, AMOUNT, WETH_ADDRESS, true)
  cancelStreamEvent.block.number = BigInt.fromString('123')
  cancelStreamEvent.block.timestamp = BigInt.fromString('11111111')

  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())
  assert.fieldEquals('Stream', id, 'withdrawnAmount', '0')
  assert.fieldEquals('Stream', id, 'totalAmount', AMOUNT.toString())

  // When: a stream is cancelled
  onCancelStream(cancelStreamEvent)

  // Then: modifiedAt is updated
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', cancelStreamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', cancelStreamEvent.block.timestamp.toString())

  // And: withdrawnAmount is updated
  assert.fieldEquals('Stream', id, 'withdrawnAmount', cancelStreamEvent.params.recipientBalance.toString())

  // And: the amount remains and the status is changed
  assert.fieldEquals('Stream', id, 'status', CANCELLED)
  assert.fieldEquals('Stream', id, 'totalAmount', AMOUNT.toString())

  cleanup()
})

test('Update stream', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  const extendTime = BigInt.fromString('2628000') // a month in seconds
  let updateStreamEvent = createUpdateStreamEvent(STREAM_ID, AMOUNT, extendTime, true)
  updateStreamEvent.block.number = BigInt.fromString('123')
  updateStreamEvent.block.timestamp = BigInt.fromString('11111111')

  assert.fieldEquals('Stream', id, 'status', ACTIVE)
  assert.fieldEquals('Stream', id, 'totalAmount', AMOUNT.toString())
  assert.fieldEquals('Stream', id, 'expiresAt', END_TIME.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())

  onUpdateStream(updateStreamEvent)

  let expectedAmount = AMOUNT.plus(AMOUNT).toString()
  let expectedExpirationDate = END_TIME.plus(extendTime).toString()
  assert.fieldEquals('Stream', id, 'status', ACTIVE)
  assert.fieldEquals('Stream', id, 'totalAmount', expectedAmount)
  assert.fieldEquals('Stream', id, 'expiresAt', expectedExpirationDate)
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', updateStreamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', updateStreamEvent.block.timestamp.toString())

  cleanup()
})

test('Withdraw from stream', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  const amount2 = BigInt.fromString('2000')
  let withdrawalEvent = createWithdrawStreamEvent(STREAM_ID, amount2, RECIEVER, WETH_ADDRESS, true)
  withdrawalEvent.block.number = BigInt.fromString('123')
  withdrawalEvent.block.timestamp = BigInt.fromString('11111111')

  assert.fieldEquals('Stream', id, 'withdrawnAmount', '0')
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())

  onWithdrawStream(withdrawalEvent)
  assert.fieldEquals('Stream', id, 'withdrawnAmount', amount2.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', withdrawalEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', withdrawalEvent.block.timestamp.toString())

  cleanup()
})


test('Mint transaction does NOT update the streams recipient', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  let transactionEvent = createTransferStreamEvent(RECIEVER, ZERO_ADDRESS, STREAM_ID)
  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())

  onTransferStream(transactionEvent)

  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())

  cleanup()
})


test('Burn transaction does NOT update the streams recipient', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  let transactionEvent = createTransferStreamEvent(ZERO_ADDRESS, RECIEVER, STREAM_ID)
  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())

  onTransferStream(transactionEvent)

  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())

  cleanup()
})


test('Transfer event updates the stream recipient', () => {
  setup()
  const id = STREAM_PREFIX.concat(STREAM_ID.toString())
  let transactionEvent = createTransferStreamEvent(RECIEVER, SENDER, STREAM_ID)

  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())

  // When: Reciever transfers the stream to sender
  onTransferStream(transactionEvent)

  // Then: The Streams recipient is updated
  assert.fieldEquals('Stream', id, 'recipient', SENDER.toHex())

  cleanup()
})
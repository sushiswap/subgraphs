import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { LogCreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { CANCELLED, DEPOSIT, DISBURSEMENT, ONGOING, WITHDRAWAL } from '../src/constants'
import { onCancelStream, onCreateStream } from '../src/mappings/furo-stream'
import { createCancelStreamEvent, createStreamEvent, createTokenMock } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
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

test('on create stream event, a transaction entity is created', () => {
  setup()
  const id = STREAM_ID.toString().concat(":tx:0")

  assert.fieldEquals('Transaction', id, 'id', id)
  assert.fieldEquals('Transaction', id, 'type', DEPOSIT)
  assert.fieldEquals('Transaction', id, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id, 'createdAtTimestamp', streamEvent.block.timestamp.toString())

  cleanup()
})


test('Cancel stream', () => {
  setup()
  const id1 = STREAM_ID.toString().concat(":tx:0")
  const id2 = STREAM_ID.toString().concat(":tx:1")
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, AMOUNT, AMOUNT, WETH_ADDRESS, true)
  cancelStreamEvent.block.number = BigInt.fromString("123")
  cancelStreamEvent.block.timestamp = BigInt.fromString("11111111")

  onCancelStream(cancelStreamEvent)
  assert.entityCount('Transaction', 2)
  assert.fieldEquals('Transaction', id1, 'id', id1)
  assert.fieldEquals('Transaction', id1, 'type', WITHDRAWAL)
  assert.fieldEquals('Transaction', id1, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id1, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id1, 'to', SENDER.toHex())
  assert.fieldEquals('Transaction', id1, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id1, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id1, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id1, 'createdAtTimestamp', streamEvent.block.timestamp.toString())

  assert.fieldEquals('Transaction', id2, 'id', id2)
  assert.fieldEquals('Transaction', id2, 'type', DISBURSEMENT)
  assert.fieldEquals('Transaction', id2, 'stream', STREAM_ID.toString())
  assert.fieldEquals('Transaction', id2, 'amount', AMOUNT.toString())
  assert.fieldEquals('Transaction', id2, 'to', RECIEVER.toHex())
  assert.fieldEquals('Transaction', id2, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Transaction', id2, 'toBentoBox', 'true')
  assert.fieldEquals('Transaction', id2, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Transaction', id2, 'createdAtTimestamp', streamEvent.block.timestamp.toString())
  cleanup()
})

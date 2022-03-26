import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { LogCreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { CANCELLED, ONGOING } from '../src/constants'
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

test('Stream entity contains expected fields', () => {
  setup()

  const id = STREAM_ID.toString()
  assert.fieldEquals('Stream', id, 'id', id)
  assert.fieldEquals('Stream', id, 'recipient', RECIEVER.toHex())
  assert.fieldEquals('Stream', id, 'amount', AMOUNT.toString())
  assert.fieldEquals('Stream', id, 'withdrawnAmount', '0')
  assert.fieldEquals('Stream', id, 'token', WETH_ADDRESS.toHex())
  assert.fieldEquals('Stream', id, 'status', ONGOING)
  assert.fieldEquals('Stream', id, 'createdBy', SENDER.toHex())
  assert.fieldEquals('Stream', id, 'fromBentoBox', 'true')
  assert.fieldEquals('Stream', id, 'startedAt', START_TIME.toString())
  assert.fieldEquals('Stream', id, 'expiresAt', END_TIME.toString())
  assert.fieldEquals('Stream', id, 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'createdAtTimestamp', streamEvent.block.timestamp.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())

  cleanup()
})


test('Cancel stream', () => {
  setup()
  const id = STREAM_ID.toString()
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, AMOUNT, AMOUNT, WETH_ADDRESS, true)
  cancelStreamEvent.block.number = BigInt.fromString("123")
  cancelStreamEvent.block.timestamp = BigInt.fromString("11111111")

  assert.fieldEquals('Stream', id, 'modifiedAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', streamEvent.block.timestamp.toString())

  onCancelStream(cancelStreamEvent)
  
  assert.fieldEquals('Stream', id, 'status', CANCELLED)
  assert.fieldEquals('Stream', id, 'modifiedAtBlock', cancelStreamEvent.block.number.toString())
  assert.fieldEquals('Stream', id, 'modifiedAtTimestamp', cancelStreamEvent.block.timestamp.toString())

  cleanup()
})

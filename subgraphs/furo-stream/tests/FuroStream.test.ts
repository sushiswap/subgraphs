import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, log, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { FURO_STREAM } from './../src/constants'
import { onCancelStream, onCreateStream, onWithdraw } from '../src/mappings/stream'
import { createCancelStreamEvent, createStreamEvent, createTokenMock, createWithdrawEvent } from './mocks'

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

test('counter variables increases when stream is created', () => {
  setup()

  assert.fieldEquals('FuroStream', FURO_STREAM, 'streamCount', '1')
  assert.fieldEquals('FuroStream', FURO_STREAM, 'userCount', '2')
  assert.fieldEquals('FuroStream', FURO_STREAM, 'transactionCount', '1')

  cleanup()
})

test('transaction count increases when a stream is cancelled', () => {
  setup()
  const amount2 = BigInt.fromString('2000000')
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, amount2, AMOUNT, WETH_ADDRESS, true)

  onCancelStream(cancelStreamEvent)

  assert.fieldEquals('FuroStream', FURO_STREAM, 'transactionCount', '3')

  cleanup()
})

test('transaction count increases on withdrawal', () => {
  setup()
  const amount2 = BigInt.fromString('2000')
  let withdrawalEvent = createWithdrawEvent(STREAM_ID, amount2, RECIEVER, WETH_ADDRESS, true)

  onWithdraw(withdrawalEvent)

  assert.fieldEquals('FuroStream', FURO_STREAM, 'transactionCount', '2')

  cleanup()
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { onCreateStream } from '../src/mappings/stream'
import { createStreamEvent, createTokenMock } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const TOKEN_NAME = 'Wrapped Ether'
const TOKEN_DECIMALS = BigInt.fromString('18')
const TOKEN_SYMBOL = 'WETH'
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const STREAM_ID = BigInt.fromString('1001')
const AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const END_TIME = BigInt.fromString('1650972295') // 	Tue Apr 26 2022 11:24:55 GMT+0000, One month later
let streamEvent: CreateStreamEvent

function setup(): void {
  streamEvent = createStreamEvent(STREAM_ID, SENDER, RECIEVER, WETH_ADDRESS, AMOUNT, START_TIME, END_TIME, true)
  createTokenMock(WETH_ADDRESS.toHex(), TOKEN_DECIMALS, TOKEN_NAME, TOKEN_SYMBOL)
  onCreateStream(streamEvent)
}

function cleanup(): void {
  clearStore()
}

test('Token is created on stream creation event', () => {
  setup()

  assert.entityCount('Token', 1)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'id', WETH_ADDRESS.toHex())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'decimals', TOKEN_DECIMALS.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'name', TOKEN_NAME)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'symbol', TOKEN_SYMBOL)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtTimestamp', streamEvent.block.timestamp.toString())

  cleanup()
})

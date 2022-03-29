import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { WEEK, YEAR } from '../src/constants'
import { onCreateVesting } from '../src/mappings/vesting'
import { createTokenMock, createVestingEvent } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const TOKEN_NAME = 'Wrapped Ether'
const TOKEN_DECIMALS = BigInt.fromString('18')
const TOKEN_SYMBOL = 'WETH'
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
  createTokenMock(WETH_ADDRESS.toHex(), TOKEN_DECIMALS, TOKEN_NAME, TOKEN_SYMBOL)
  onCreateVesting(vestingEvent)
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
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})

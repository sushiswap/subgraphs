import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { GLOBAL_ID, WEEK, YEAR } from './../src/constants'
import { onCancelStream, onCreateStream, onWithdrawStream } from '../src/mappings/stream'
import {
  createCancelStreamEvent,
  createCancelVestingEvent,
  createStreamEvent,
  createTokenMock,
  createVestingEvent,
  createWithdrawStreamEvent,
  createWithdrawVestingEvent,
} from './mocks'
import { onCancelVesting, onWithdrawVesting, onCreateVesting } from '../src/mappings/vesting'
import { CreateVesting } from '../generated/FuroVesting/FuroVesting'


const VESTING_ID = BigInt.fromString('1')
const CLIFF_AMOUNT = BigInt.fromString('100000000')
const STEPS_AMOUNT = BigInt.fromString('10000000')
const CLIFF_DURATION = BigInt.fromU32(YEAR)
const biweekly = 2 * WEEK
const STEP_DURATION = BigInt.fromU32(biweekly)
const STEPS = BigInt.fromU32(26)

const TOTAL_AMOUNT = CLIFF_AMOUNT.plus(STEPS.times(STEPS_AMOUNT)) // 100000000 + (26 * 10000000) = 360000000

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const STREAM_ID = BigInt.fromString('1001')
const AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const END_TIME = BigInt.fromString('1650972295') // 	Tue Apr 26 2022 11:24:55 GMT+0000, One month later
let streamEvent: CreateStreamEvent
let vestingEvent: CreateVesting


function vestingSetup(): void {
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


function streamSetup(): void {
  streamEvent = createStreamEvent(STREAM_ID, SENDER, RECIEVER, WETH_ADDRESS, AMOUNT, START_TIME, END_TIME, true)
  createTokenMock(WETH_ADDRESS.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onCreateStream(streamEvent)
}

function cleanup(): void {
  clearStore()
}

test('counter variables increases when stream is created', () => {
  streamSetup()

  assert.fieldEquals('Global', GLOBAL_ID, 'streamCount', '1')
  assert.fieldEquals('Global', GLOBAL_ID, 'userCount', '2')
  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '1')

  cleanup()
})

test('transaction count increases when a stream is cancelled', () => {
  streamSetup()
  const amount2 = BigInt.fromString('2000000')
  let cancelStreamEvent = createCancelStreamEvent(STREAM_ID, amount2, AMOUNT, WETH_ADDRESS, true)

  onCancelStream(cancelStreamEvent)

  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '3')

  cleanup()
})

test('transaction count increases on withdrawal from stream', () => {
  streamSetup()
  const amount2 = BigInt.fromString('2000')
  let withdrawalEvent = createWithdrawStreamEvent(STREAM_ID, amount2, RECIEVER, WETH_ADDRESS, true)

  onWithdrawStream(withdrawalEvent)

  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '2')

  cleanup()
})

test('counter variables increases when vesting is created', () => {
  vestingSetup()

  assert.fieldEquals('Global', GLOBAL_ID, 'vestingCount', '1')
  assert.fieldEquals('Global', GLOBAL_ID, 'userCount', '2')
  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '1')

  cleanup()
})

test('transaction count increases when a vesting is cancelled', () => {
  vestingSetup()
  let recipientAmount = CLIFF_AMOUNT
  let ownerAmount = TOTAL_AMOUNT.minus(recipientAmount)
  let cancelVestingEvent = createCancelVestingEvent(VESTING_ID, ownerAmount, recipientAmount, WETH_ADDRESS, true)

  onCancelVesting(cancelVestingEvent)

  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '3')

  cleanup()
})

test('transaction count increases on vesting withdrawal', () => {
  vestingSetup()
  const amount = BigInt.fromString('1337420')
  let withdrawalEvent = createWithdrawVestingEvent(VESTING_ID, WETH_ADDRESS, amount, true)

  onWithdrawVesting(withdrawalEvent)

  assert.fieldEquals('Global', GLOBAL_ID, 'transactionCount', '2')

  cleanup()
})

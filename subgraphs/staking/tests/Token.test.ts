import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onIncentiveCreated } from '../src/mappings/staking'
import { createIncentiveCreatedEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000002')
const INCENTIVE_ID = BigInt.fromString('1')
const INITIAL_AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1646068510')
const END_TIME = BigInt.fromString('1646075000')
let incentiveCreatedEvent = createIncentiveCreatedEvent(
  TOKEN,
  REWARD_TOKEN,
  ALICE,
  INCENTIVE_ID,
  INITIAL_AMOUNT,
  START_TIME,
  END_TIME
)

function cleanup(): void {
  clearStore()
}

test('Create incentive creates two tokens', () => {
  let decimals = BigInt.fromString('18')
  let rewardTokenName = 'SushiToken'
  let rewardTokenSymbol = 'SUSHI'
  let tokenName = 'SushiSwap LP Token'
  let tokenSymbol = 'SLP'
  createTokenMock(REWARD_TOKEN.toHex(), decimals, rewardTokenName, rewardTokenSymbol)
  createTokenMock(TOKEN.toHex(), decimals, tokenName, tokenSymbol)

  onIncentiveCreated(incentiveCreatedEvent)

  assert.entityCount('Token', 2)

  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'id', REWARD_TOKEN.toHex())
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'symbol', rewardTokenSymbol)
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'symbolSuccess', 'true')
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'name', rewardTokenName)
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'nameSuccess', 'true')
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'decimals', decimals.toString())
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'decimalsSuccess', 'true')

  assert.fieldEquals('Token', TOKEN.toHex(), 'id', TOKEN.toHex())
  assert.fieldEquals('Token', TOKEN.toHex(), 'symbol', tokenSymbol)
  assert.fieldEquals('Token', TOKEN.toHex(), 'symbolSuccess', 'true')
  assert.fieldEquals('Token', TOKEN.toHex(), 'name', tokenName)
  assert.fieldEquals('Token', TOKEN.toHex(), 'nameSuccess', 'true')
  assert.fieldEquals('Token', TOKEN.toHex(), 'decimals', decimals.toString())
  assert.fieldEquals('Token', TOKEN.toHex(), 'decimalsSuccess', 'true')
  cleanup()
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getStakePositionId } from '../src/functions/index'
import { onStake, onUnstake } from '../src/mappings/staking'
import { createStakeEvent, createTokenMock, createUnstakeEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')

function cleanup(): void {
  clearStore()
}

test('StakePosition', () => {
  const amount = BigInt.fromString('10000000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  stakeEvent.block.number = BigInt.fromString('1337')
  stakeEvent.block.timestamp = BigInt.fromString('1333337')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakePositionId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'id', stakeId)
  assert.fieldEquals('StakePosition', stakeId, 'farm', TOKEN.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'token', TOKEN.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'liquidity', amount.toString())
  assert.fieldEquals('StakePosition', stakeId, 'createdAtBlock', stakeEvent.block.number.toString())
  assert.fieldEquals('StakePosition', stakeId, 'createdAtTimestamp', stakeEvent.block.timestamp.toString())
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtBlock', stakeEvent.block.number.toString())
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtTimestamp', stakeEvent.block.timestamp.toString())

  // When: Alice stakes another time
  onStake(stakeEvent)

  // Then: The liquidity is doubled
  assert.entityCount('StakePosition', 1)
  assert.fieldEquals('StakePosition', stakeId, 'liquidity', amount.times(BigInt.fromString('2')).toString())

  cleanup()
})

test('Stake and unstake', () => {
  const amount = BigInt.fromString('10000000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, amount)
  unstakeEvent.block.timestamp = BigInt.fromString('10000000')
  unstakeEvent.block.number = BigInt.fromString('1337')
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Some LP Token', 'SLP')

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakePositionId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'id', stakeId)
  assert.fieldEquals('StakePosition', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('StakePosition', stakeId, 'liquidity', amount.toString())
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtBlock', stakeEvent.block.number.toString())
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtTimestamp', stakeEvent.block.timestamp.toString())

  // When: Alice unstakes
  onUnstake(unstakeEvent)

  // Then: Stake entity liquidity is updated
  assert.fieldEquals('StakePosition', stakeId, 'liquidity', '0')
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtBlock', unstakeEvent.block.number.toString())
  assert.fieldEquals('StakePosition', stakeId, 'modifiedAtTimestamp', unstakeEvent.block.timestamp.toString())

  cleanup()
})


import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getStakeId } from '../src/functions/index'
import { onStake, onUnstake } from '../src/mappings/staking'
import { createStakeEvent, createUnstakeEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')

function cleanup(): void {
  clearStore()
}

test('Stake', () => {
  const amount = BigInt.fromString('10000000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  stakeEvent.block.number = BigInt.fromString("1337")
  stakeEvent.block.timestamp = BigInt.fromString("1333337")

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakeId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('Stake', stakeId, 'id', stakeId)
  assert.fieldEquals('Stake', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.toString())
  assert.fieldEquals('Stake', stakeId, 'block', stakeEvent.block.number.toString())
  assert.fieldEquals('Stake', stakeId, 'timestamp', stakeEvent.block.timestamp.toString())

  // When: Alice stakes another time
  onStake(stakeEvent)

  // Then: The liquidity is doubled
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.times(BigInt.fromString('2')).toString())

  cleanup()
})

test('Stake and unstake', () => {
  const amount = BigInt.fromString('10000000')
  let stakeEvent = createStakeEvent(TOKEN, ALICE, amount)
  let unstakeEvent = createUnstakeEvent(TOKEN, ALICE, amount)

  // When: Alice stakes an amount
  onStake(stakeEvent)

  // Then: A stake entity is created
  const stakeId = getStakeId(ALICE.toHex(), TOKEN.toHex())
  assert.fieldEquals('Stake', stakeId, 'id', stakeId)
  assert.fieldEquals('Stake', stakeId, 'user', ALICE.toHex())
  assert.fieldEquals('Stake', stakeId, 'liquidity', amount.toString())

  // When: Alice unstakes
  onUnstake(unstakeEvent)

  // Then: Stake entity liquidity is updated
  assert.fieldEquals('Stake', stakeId, 'liquidity', '0')

  cleanup()
})

import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { XSUSHI_ADDRESS } from '../src/constants/addresses'
import { onSushiTransfer } from '../src/mappings/xsushi'
import { createSushiTransferEvent } from './mocks'

function cleanup(): void {
  clearStore()
}

test('Fee is sent twice, FeeSender is created and updated', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const amount = BigInt.fromString('1337')
  let transferEvent = createSushiTransferEvent(sender, XSUSHI_ADDRESS, amount)
  let transferEvent2 = createSushiTransferEvent(sender, XSUSHI_ADDRESS, amount)
  transferEvent2.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  transferEvent2.block.number = BigInt.fromString('42000')
  transferEvent2.block.timestamp = BigInt.fromString('547547547')

  onSushiTransfer(transferEvent)

  assert.entityCount('FeeSender', 1)
  assert.fieldEquals('FeeSender', sender.toHex(), 'id', sender.toHex())
  assert.fieldEquals('FeeSender', sender.toHex(), 'totalFeeSent', amount.toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())

  onSushiTransfer(transferEvent2)
  assert.fieldEquals('FeeSender', sender.toHex(), 'totalFeeSent', amount.times(BigInt.fromString('2')).toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'modifiedAtBlock', transferEvent2.block.number.toString())
  assert.fieldEquals('FeeSender', sender.toHex(), 'modifiedAtTimestamp', transferEvent2.block.timestamp.toString())

  cleanup()
})

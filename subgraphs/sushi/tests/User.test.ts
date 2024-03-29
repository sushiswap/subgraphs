import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

test('Transfer event creates two users', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const receiver = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(sender, receiver, amount)

  onTransfer(transferEvent)

  assert.entityCount('User', 2)
  assert.fieldEquals('User', sender.toHex(), 'id', sender.toHex())
  assert.fieldEquals('User', sender.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', sender.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('User', sender.toHex(), 'balance', '-1337')

  assert.fieldEquals('User', receiver.toHex(), 'id', receiver.toHex())
  assert.fieldEquals('User', receiver.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', receiver.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('User', receiver.toHex(), 'balance', amount.toString())
})

test('Two transfers updates users modifiedAt fields', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const receiver = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(sender, receiver, amount)

  onTransfer(transferEvent)

  assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())

  const block = BigInt.fromString('420')
  const timestamp = BigInt.fromString('42124114140')
  transferEvent.block.number = block
  transferEvent.block.timestamp = timestamp
  onTransfer(transferEvent)
  assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', block.toString())
  assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', timestamp.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtBlock', block.toString())
  assert.fieldEquals('User', receiver.toHex(), 'modifiedAtTimestamp', timestamp.toString())
})

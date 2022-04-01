import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test, clearStore } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, BURN, MINT, TRANSFER } from '../src/mappings/constants'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

function cleanup(): void {
  clearStore()
}

test('Transfer', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(sender, reciever, amount)

  onTransfer(transferEvent)
  const transactionId = transferEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'id', transactionId)
  assert.fieldEquals('Transaction', transactionId, 'from', sender.toHex())
  assert.fieldEquals('Transaction', transactionId, 'to', reciever.toHex())
  assert.fieldEquals('Transaction', transactionId, 'amount', transferEvent.params.value.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasUsed', transferEvent.block.gasUsed.toString())
  assert.fieldEquals('Transaction', transactionId, 'type', TRANSFER)
  assert.fieldEquals('Transaction', transactionId, 'gasLimit', transferEvent.transaction.gasLimit.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasPrice', transferEvent.transaction.gasPrice.toString())
  assert.fieldEquals('Transaction', transactionId, 'block', transferEvent.block.number.toString())
  assert.fieldEquals('Transaction', transactionId, 'timestamp', transferEvent.block.timestamp.toString())

  cleanup()
})

test('Zero address is sender sets transaction type to MINT', () => {
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)

  onTransfer(transferEvent)
  const transactionId = transferEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'from', ADDRESS_ZERO.toHex())
  assert.fieldEquals('Transaction', transactionId, 'type', MINT)

  cleanup()
})

test('Zero address is reciever sets transaction type to BURN', () => {
  const sender = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(sender, ADDRESS_ZERO, amount)

  onTransfer(transferEvent)
  const transactionId = transferEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'to', ADDRESS_ZERO.toHex())
  assert.fieldEquals('Transaction', transactionId, 'type', BURN)

  cleanup()
})

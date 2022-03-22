import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

test('Transfer', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(sender, reciever, amount)

  onTransfer(transferEvent)
  const transactionId = transferEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'id', transactionId)
  assert.fieldEquals('Transaction', transactionId, 'amount', transferEvent.params.value.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasUsed', transferEvent.block.gasUsed.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasLimit', transferEvent.transaction.gasLimit.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasPrice', transferEvent.transaction.gasPrice.toString())
  assert.fieldEquals('Transaction', transactionId, 'block', transferEvent.block.number.toString())
  assert.fieldEquals('Transaction', transactionId, 'timestamp', transferEvent.block.timestamp.toString())
})

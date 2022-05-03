import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test, clearStore } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, BURN, FEES, MINT, TRANSFER } from '../src/constants'
import { XSUSHI_ADDRESS } from '../src/constants/addresses'
import { onTransfer } from '../src/mappings/xsushi'
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

test('Zero address is sender, transaction type is set to MINT', () => {
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)

  onTransfer(transferEvent)
  const transactionId = transferEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'from', ADDRESS_ZERO.toHex())
  assert.fieldEquals('Transaction', transactionId, 'type', MINT)

  cleanup()
})

test('Zero address is reciever, transaction type is set to BURN', () => {
  const sender = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)
  let burnEvent = createTransferEvent(sender, ADDRESS_ZERO, amount)
  burnEvent.transaction.hash = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2B");
  
  onTransfer(mintEvent)
  onTransfer(burnEvent)
  const transactionId = burnEvent.transaction.hash.toHex()
  assert.fieldEquals('Transaction', transactionId, 'to', ADDRESS_ZERO.toHex())
  assert.fieldEquals('Transaction', transactionId, 'type', BURN)
  assert.fieldEquals('Transaction', transactionId, 'amount', amount.toString())

  cleanup()
})

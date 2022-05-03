import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, test, clearStore } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, XSUSHI } from '../src/mappings/constants'
import { onTransfer } from '../src/mappings/xsushi'
import { createTransferEvent } from './mocks'

function cleanup(): void {
  clearStore()
}

test('XSushi entitys count field increase on transactions', () => {
  cleanup()
  const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(alice, bob, amount)

  // When: Alice transfers to Bob
  onTransfer(transferEvent)

  // Then: The xsushi entitys fields are updated
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '2')

  // And: supply remains unchanged
  assert.fieldEquals('XSushi', XSUSHI, 'totalSupply', '0')

  // When: the zero-address make a transaction (mint)
  let mintEvent = createTransferEvent(ADDRESS_ZERO, bob, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  onTransfer(mintEvent)

  // Then: count fields are increased
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '2')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '3')

  // And: supply is increased
  assert.fieldEquals('XSushi', XSUSHI, 'totalSupply', amount.toString())

  // When: the zero-address recieves a transaction (burn)
  let burnEvent = createTransferEvent(alice, ADDRESS_ZERO, BigInt.fromString('337'))
  burnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  onTransfer(burnEvent)

  // Then: the transaction count increase and userCount remains
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '3')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '3')

  // And: the total supply is decreased
  assert.fieldEquals('XSushi', XSUSHI, 'totalSupply', '1000')
})

test('xSushiEntered is increased on mint', () => {
  cleanup()
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)

  onTransfer(transferEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiEntered', amount.toString())
})

test('xSushiLeaved is increased on burn', () => {
  cleanup()
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(reciever, ADDRESS_ZERO, amount)

  onTransfer(transferEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiLeaved', amount.toString())
})

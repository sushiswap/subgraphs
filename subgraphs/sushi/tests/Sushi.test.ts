import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, test, logStore } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, SUSHI } from '../src/constants'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

test('Sushi entities count field increase on transactions', () => {
  const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')

  // When: the zero-address make a transaction (mint)
  let mintEvent = createTransferEvent(ADDRESS_ZERO, bob, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  onTransfer(mintEvent)

  // Then: The sushi entities fields are updated
  assert.fieldEquals('Sushi', SUSHI, 'transactionCount', '1')
  assert.fieldEquals('Sushi', SUSHI, 'totalUserCount', '2')
  assert.fieldEquals('Sushi', SUSHI, 'holderCount', '1')

  // And: supply remains changed
  assert.fieldEquals('Sushi', SUSHI, 'totalSupply', amount.toString())

  let transferEvent = createTransferEvent(bob, alice, amount)
  transferEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes

  // When: Bob transfers all sushi to Alice
  onTransfer(transferEvent)

  // Then: transaction count & userCount increased but holderCount unchanged as lost 1 holder and gain 1 holder
  assert.fieldEquals('Sushi', SUSHI, 'transactionCount', '2')
  assert.fieldEquals('Sushi', SUSHI, 'totalUserCount', '3')
  assert.fieldEquals('Sushi', SUSHI, 'holderCount', '1')

  // And: supply is unchanged
  assert.fieldEquals('Sushi', SUSHI, 'totalSupply', amount.toString())

  // When: Alice transfer half back to Bob
  transferEvent = createTransferEvent(alice, bob, amount.div(BigInt.fromU32(2)))
  transferEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000003') as Bytes
  onTransfer(transferEvent)

  // Then: transaction count & holderCount increased but totalUserCount unchanged as no new user
  assert.fieldEquals('Sushi', SUSHI, 'transactionCount', '3')
  assert.fieldEquals('Sushi', SUSHI, 'totalUserCount', '3')
  assert.fieldEquals('Sushi', SUSHI, 'holderCount', '2')

  // And: supply is unchanged
  assert.fieldEquals('Sushi', SUSHI, 'totalSupply', amount.toString())

  // When: the zero-address receives a transaction (burn)
  let burnEvent = createTransferEvent(bob, ADDRESS_ZERO, amount.div(BigInt.fromU32(2)))
  burnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000004') as Bytes
  onTransfer(burnEvent)

  // Then: the transaction count increase and totalUserCount remains but holderCount reduce as lost one holder (alice)
  assert.fieldEquals('Sushi', SUSHI, 'transactionCount', '4')
  assert.fieldEquals('Sushi', SUSHI, 'totalUserCount', '3')
  assert.fieldEquals('User', bob.toHex(), 'balance', BigInt.zero().toString())
  assert.fieldEquals('Sushi', SUSHI, 'holderCount', '1')

  // And: the total supply is decreased
  assert.fieldEquals('Sushi', SUSHI, 'totalSupply', amount.minus(amount.div(BigInt.fromU32(2))).toString())
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

test('Transfer event creates two users', () => {
    const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const amount = BigInt.fromString("1337")
    let transferEvent = createTransferEvent(alice, bob, amount)

    onTransfer(transferEvent)

    assert.entityCount('User', 2)
    assert.fieldEquals('User', alice.toHex(), 'id', alice.toHex())
    assert.fieldEquals('User', alice.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', alice.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', alice.toHex(), 'balance', "-1337")

    assert.fieldEquals('User', bob.toHex(), 'id', bob.toHex())
    assert.fieldEquals('User', bob.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', bob.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', bob.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', bob.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', bob.toHex(), 'balance', amount.toString())
 
})

test('Two transfers updates a users modifiedAt fields', () => {
    const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const amount = BigInt.fromString("1337")
    let transferEvent = createTransferEvent(alice, bob, amount)

    onTransfer(transferEvent)

    assert.fieldEquals('User', alice.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())

    const block = BigInt.fromString("420")
    const timestamp = BigInt.fromString("42124114140")
    transferEvent.block.number = block
    transferEvent.block.timestamp = timestamp
    onTransfer(transferEvent)
    assert.fieldEquals('User', alice.toHex(), 'modifiedAtBlock', block.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedAtTimestamp', timestamp.toString())
 
})

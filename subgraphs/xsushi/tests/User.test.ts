import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { onTransfer } from '../src/mappings/xsushi'
import { createTransferEvent } from './mocks'

test('Transfer event creates two users', () => {
    const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const amount = BigInt.fromString("1337")
    let transferEvent = createTransferEvent(sender, reciever, amount)

    onTransfer(transferEvent)

    assert.entityCount('User', 2)
    assert.fieldEquals('User', sender.toHex(), 'id', sender.toHex())
    assert.fieldEquals('User', sender.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', sender.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', sender.toHex(), 'balance', "-1337")

    assert.fieldEquals('User', reciever.toHex(), 'id', reciever.toHex())
    assert.fieldEquals('User', reciever.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', reciever.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', reciever.toHex(), 'balance', amount.toString())
 
})

test('A second transaction updates a users modifiedAt fields', () => {
    const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const amount = BigInt.fromString("1337")
    let transferEvent = createTransferEvent(sender, reciever, amount)

    onTransfer(transferEvent)

    assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtTimestamp', transferEvent.block.timestamp.toString())

    const block = BigInt.fromString("420")
    const timestamp = BigInt.fromString("42124114140")
    transferEvent.block.number = block
    transferEvent.block.timestamp = timestamp
    onTransfer(transferEvent)
    assert.fieldEquals('User', sender.toHex(), 'modifiedAtBlock', block.toString())
    assert.fieldEquals('User', sender.toHex(), 'modifiedAtTimestamp', timestamp.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtBlock', block.toString())
    assert.fieldEquals('User', reciever.toHex(), 'modifiedAtTimestamp', timestamp.toString())
 
})

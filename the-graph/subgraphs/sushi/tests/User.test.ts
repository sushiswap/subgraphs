import { Address, BigInt } from '@graphprotocol/graph-ts'
import { test, assert} from 'matchstick-as/assembly/index'
import { User } from '../generated/schema'
import { createUser } from '../src/mappings/functions/user'
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
    assert.fieldEquals('User', alice.toHex(), 'creationBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', alice.toHex(), 'creationTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', alice.toHex(), 'modifiedTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', alice.toHex(), 'balance', "-1337")

    assert.fieldEquals('User', bob.toHex(), 'id', bob.toHex())
    assert.fieldEquals('User', bob.toHex(), 'creationBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', bob.toHex(), 'creationTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', bob.toHex(), 'modifiedBlock', transferEvent.block.number.toString())
    assert.fieldEquals('User', bob.toHex(), 'modifiedTimestamp', transferEvent.block.timestamp.toString())
    assert.fieldEquals('User', bob.toHex(), 'balance', amount.toString())
 
})

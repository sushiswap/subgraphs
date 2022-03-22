import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { SUSHI } from '../src/mappings/constants'
import { onTransfer } from '../src/mappings/sushi'
import { createTransferEvent } from './mocks'

test('Sushi entitys count field increase on transactions', () => {
    const zero = Address.fromString('0x0000000000000000000000000000000000000000')
    const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const amount = BigInt.fromString("1337")
    let transferEvent = createTransferEvent(alice, bob, amount)

    // When: Alice transfers to Bob
    onTransfer(transferEvent)

    // Then: The sushi entitys fields are updated
    assert.fieldEquals('Sushi', SUSHI, 'transactionCount', "1")
    assert.fieldEquals('Sushi', SUSHI, 'userCount',  "2")

    // And: supply remains unchanged
    assert.fieldEquals('Sushi', SUSHI, 'totalSupply',  "0")

    // When: the zero-address make a transaction (mint)
    let mintEvent = createTransferEvent(zero, bob, amount)
    onTransfer(mintEvent)

    // Then: count fields are increased
    assert.fieldEquals('Sushi', SUSHI, 'transactionCount', "2")
    assert.fieldEquals('Sushi', SUSHI, 'userCount',  "3")

    // And: supply is increased
    assert.fieldEquals('Sushi', SUSHI, 'totalSupply',  amount.toString())

    // When: the zero-address recieves a transaction (burn)
    let burnEvent = createTransferEvent(alice, zero, BigInt.fromString("337"))
    onTransfer(burnEvent)

    // Then: the transaction count increase and userCount remains
    assert.fieldEquals('Sushi', SUSHI, 'transactionCount', "3")
    assert.fieldEquals('Sushi', SUSHI, 'userCount',  "3")

    // And: the total supply is decreased
    assert.fieldEquals('Sushi', SUSHI, 'totalSupply', "1000")
})

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { onStart } from '../src/mappings/auction-maker'
import { MAX_TTL, MIN_TTL } from '../src/mappings/constants'
import { createStartEvent } from './mocks'

test('Auction is created', () => {
    const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const token = Address.fromString('0x0000000000000000000000000000000000000001')
    const amount = BigInt.fromString("1337")
    const rewardAmount = BigInt.fromString("420")
    let event = createStartEvent(token, alice, amount, rewardAmount)

    onStart(event)

    const id = token.toHex()
    assert.fieldEquals('Auction', id, 'id', id)
    assert.fieldEquals('Auction', id, 'highestBidder', alice.toHex())
    assert.fieldEquals('Auction', id, 'bidAmount', amount.toString())
    assert.fieldEquals('Auction', id, 'rewardAmount', rewardAmount.toString())
    assert.fieldEquals('Auction', id, 'minTTL', event.block.timestamp.plus(MIN_TTL).toString())
    assert.fieldEquals('Auction', id, 'maxTTL', event.block.timestamp.plus(MAX_TTL).toString())
    assert.fieldEquals('Auction', id, 'createdAtBlock', event.block.number.toString())
    assert.fieldEquals('Auction', id, 'createdAtTimestamp', event.block.timestamp.toString())
    assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', event.block.number.toString())
    assert.fieldEquals('Auction', id, 'modifiedAtBlock', event.block.timestamp.toString())
})


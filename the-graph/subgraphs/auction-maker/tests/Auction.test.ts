import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test, clearStore } from 'matchstick-as/assembly/index'
import { onBid, onAuctionCreated, onAuctionEnded } from '../src/mappings/auction-maker'
import { MAX_TTL, MIN_TTL } from '../src/mappings/constants'
import { createBidEvent, createAuctionCreatedEvent, createAuctionEndedEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')
function cleanup(): void {
  clearStore()
}

test('Auction is created', () => {
  let event = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)

  onAuctionCreated(event)

  const id = TOKEN.toHex()
  assert.fieldEquals('Auction', id, 'id', id)
  assert.fieldEquals('Auction', id, 'highestBidder', ALICE.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'rewardAmount', REWARD_AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'minTTL', event.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'maxTTL', event.block.timestamp.plus(MAX_TTL).toString())
  assert.fieldEquals('Auction', id, 'createdAtBlock', event.block.number.toString())
  assert.fieldEquals('Auction', id, 'createdAtTimestamp', event.block.timestamp.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', event.block.number.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', event.block.timestamp.toString())

  cleanup()
})

test('Bid updates the auction', () => {
  let auctionEvent = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  let bidEvent = createBidEvent(TOKEN, BOB, AMOUNT)
  const id = TOKEN.toHex()

  // When: an auction event occurs
  onAuctionCreated(auctionEvent)

  // Then: the auction entity contains the expected field values
  let maxTTL = auctionEvent.block.timestamp.plus(MAX_TTL).toString()
  assert.fieldEquals('Auction', id, 'highestBidder', ALICE.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'minTTL', auctionEvent.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'maxTTL', maxTTL)
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', auctionEvent.block.number.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', auctionEvent.block.timestamp.toString())

  // When: A bid occurs
  bidEvent.block.timestamp = BigInt.fromString('1648063447')
  bidEvent.block.number = BigInt.fromString('14444408')
  onBid(bidEvent)

  // Then: the auctions highest bidder and amount is updated
  assert.entityCount('Auction', 1)
  assert.fieldEquals('Auction', id, 'highestBidder', BOB.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())

  // And: the timestamps are also updated
  assert.fieldEquals('Auction', id, 'minTTL', bidEvent.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', bidEvent.block.timestamp.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', bidEvent.block.number.toString())

  // And: maxTTL remain unchanged
  assert.fieldEquals('Auction', id, 'maxTTL', maxTTL)

  cleanup()
})

test('Auction ends and is removed from store', () => {
    let auctionCreatedEvent = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
    let auctionEndedEvent = createAuctionEndedEvent(TOKEN, BOB, AMOUNT)
  
    onAuctionCreated(auctionCreatedEvent)
    assert.entityCount('Auction', 1)

    onAuctionEnded(auctionEndedEvent)
    assert.notInStore('Auction', TOKEN.toHex())
    assert.entityCount('Auction', 0)


    cleanup()
  })
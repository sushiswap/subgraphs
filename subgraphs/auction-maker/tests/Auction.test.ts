import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onAuctionCreated, onAuctionEnded, onBid } from '../src/mappings/auction-maker'
import { BID_TOKEN_ADDRESS, FINISHED, MAX_TTL, MIN_TTL, ONGOING } from '../src/constants'
import { createAuctionCreatedEvent, createAuctionEndedEvent, createBidEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')

function setup(): void {
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  createTokenMock(BID_TOKEN_ADDRESS.toHex(), BigInt.fromString('18'), 'Sushi Token', 'SUSHI')
}

function cleanup(): void {
  clearStore()
}

test('Auction is created', () => {
  setup()
  let event = createAuctionCreatedEvent(REWARD_TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)

  onAuctionCreated(event)

  const id = REWARD_TOKEN.toHex().concat(':0')
  assert.fieldEquals('Auction', id, 'id', id)
  assert.fieldEquals('Auction', id, 'status', ONGOING)
  assert.fieldEquals('Auction', id, 'leadingBid', event.transaction.hash.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Auction', id, 'bidToken', BID_TOKEN_ADDRESS.toHex())
  assert.fieldEquals('Auction', id, 'rewardAmount', REWARD_AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'minTTL', event.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'maxTTL', event.block.timestamp.plus(MAX_TTL).toString())
  assert.fieldEquals('Auction', id, 'txHash', event.transaction.hash.toHex())
  assert.fieldEquals('Auction', id, 'createdAtBlock', event.block.number.toString())
  assert.fieldEquals('Auction', id, 'createdAtTimestamp', event.block.timestamp.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', event.block.number.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', event.block.timestamp.toString())

  cleanup()
})

test('Bid updates the auction', () => {
  setup()
  let auctionEvent = createAuctionCreatedEvent(REWARD_TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  let bidEvent = createBidEvent(REWARD_TOKEN, BOB, AMOUNT)
  bidEvent.block.timestamp = BigInt.fromString('1648063447')
  bidEvent.block.number = BigInt.fromString('14444408')
  const id = REWARD_TOKEN.toHex().concat(':0')

  // When: an auction event occurs
  onAuctionCreated(auctionEvent)

  // Then: the auction entity contains the expected field values
  let maxTTL = auctionEvent.block.timestamp.plus(MAX_TTL).toString()
  assert.fieldEquals('Auction', id, 'leadingBid', auctionEvent.transaction.hash.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('Auction', id, 'minTTL', auctionEvent.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'maxTTL', maxTTL)
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', auctionEvent.block.number.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', auctionEvent.block.timestamp.toString())

  // When: A bid occurs
  onBid(bidEvent)

  // Then: the auctions highest bidder and amount is updated
  assert.entityCount('Auction', 1)
  assert.fieldEquals('Auction', id, 'leadingBid', bidEvent.transaction.hash.toHex())
  assert.fieldEquals('Auction', id, 'bidAmount', AMOUNT.toString())

  // And: the timestamps are also updated
  assert.fieldEquals('Auction', id, 'minTTL', bidEvent.block.timestamp.plus(MIN_TTL).toString())
  assert.fieldEquals('Auction', id, 'modifiedAtTimestamp', bidEvent.block.timestamp.toString())
  assert.fieldEquals('Auction', id, 'modifiedAtBlock', bidEvent.block.number.toString())

  // And: maxTTL remain unchanged
  assert.fieldEquals('Auction', id, 'maxTTL', maxTTL)

  cleanup()
})

test('start two auctions with the same token sets the id and counters correctly', () => {
  setup()
  let auctionCreatedEvent = createAuctionCreatedEvent(REWARD_TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  let auctionEndedEvent = createAuctionEndedEvent(REWARD_TOKEN, BOB, AMOUNT)
  auctionEndedEvent.block.timestamp = BigInt.fromString('1648063447')
  auctionEndedEvent.block.number = BigInt.fromString('14444408')
  const auction1 = REWARD_TOKEN.toHex().concat(':0')
  const auction2 = REWARD_TOKEN.toHex().concat(':1')
  onAuctionCreated(auctionCreatedEvent)

  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'auctionCount', '0')

  // When: auction ends
  onAuctionEnded(auctionEndedEvent)

  // Then: fields are set to indicate it's finished
  assert.fieldEquals('Auction', auction1, 'status', FINISHED)
  assert.fieldEquals('Auction', auction1, 'modifiedAtTimestamp', auctionEndedEvent.block.timestamp.toString())
  assert.fieldEquals('Auction', auction1, 'modifiedAtBlock', auctionEndedEvent.block.number.toString())

  // And: the tokens auction count is increased
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'auctionCount', '1')

  // When: creating a new auction with the same token
  onAuctionCreated(auctionCreatedEvent)

  // Then: the auction status is ongoing
  assert.fieldEquals('Auction', auction2, 'status', ONGOING)
  assert.fieldEquals('Auction', auction2, 'rewardToken', REWARD_TOKEN.toHex())

  // When: the second auction ends
  onAuctionEnded(auctionEndedEvent)

  // Then: the status is changed and tokens auction count is increased
  assert.fieldEquals('Auction', auction2, 'status', FINISHED)
  assert.fieldEquals('Token', REWARD_TOKEN.toHex(), 'auctionCount', '2')

  cleanup()
})

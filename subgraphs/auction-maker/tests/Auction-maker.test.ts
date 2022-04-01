import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onAuctionCreated, onAuctionEnded, onBid } from '../src/mappings/auction-maker'
import { AUCTION_MAKER } from '../src/mappings/constants'
import { createAuctionCreatedEvent, createAuctionEndedEvent, createBidEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const WETH = Address.fromString('0x0000000000000000000000000000000000000001')
const WBTC = Address.fromString('0x0000000000000000000000000000000000000002')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')

function setup(): void {
  let event = createAuctionCreatedEvent(WETH, ALICE, AMOUNT, REWARD_AMOUNT)
  createTokenMock(WETH.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onAuctionCreated(event)
}

function cleanup(): void {
  clearStore()
}

test('Auction count is increased when new auctions are created', () => {
  setup()
  let event2 = createAuctionCreatedEvent(WBTC, ALICE, AMOUNT, REWARD_AMOUNT)

  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'auctionCount', '1')

  createTokenMock(WBTC.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onAuctionCreated(event2)
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'auctionCount', '2')

  cleanup()
})

test('Bid count increases for each bid', () => {
  setup()
  let bidEvent = createBidEvent(WETH, BOB, AMOUNT)

  // Expect: a bid to be created on auction creation and bid count should be 1
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'bidCount', '1')

  // When: another bid is placed
  createTokenMock(WETH.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onBid(bidEvent)

  // Then: bid count is increased again
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'bidCount', '2')

  cleanup()
})

test('When an auction ends, finished auction count is increased', () => {
  setup()
  let auctionEndedEvent = createAuctionEndedEvent(WETH, BOB, AMOUNT)
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'finishedAuctionCount', '0')

  onAuctionEnded(auctionEndedEvent)
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'finishedAuctionCount', '1')

  cleanup()
})

test('User count increases when new users are participating in an auction', () => {
  setup()
  let bidEvent = createBidEvent(WETH, BOB, AMOUNT)
  let bidEvent2 = createBidEvent(WETH, ALICE, AMOUNT)

  // Expect: a bid to be created on auction creation and user count should be 1
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'userCount', '1')

  // When: another bid is placed
  createTokenMock(WETH.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  createTokenMock(WETH.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  onBid(bidEvent)

  // Then: user count is increased
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'userCount', '2')

  // And: When the first bidder bids again, the userCount remains
  onBid(bidEvent2)
  assert.fieldEquals('AuctionMaker', AUCTION_MAKER, 'userCount', '2')

  cleanup()
})

import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, test, clearStore } from 'matchstick-as/assembly/index'
import { Started as AuctionCreatedEvent } from '../generated/AuctionMaker/AuctionMaker'
import { onBid, onAuctionCreated, onAuctionEnded } from '../src/mappings/auction-maker'
import { MAX_TTL, MIN_TTL } from '../src/mappings/constants'
import { createBidEvent, createAuctionCreatedEvent, createAuctionEndedEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')
let auctionCreationEvent: AuctionCreatedEvent
function setup(): void {
  auctionCreationEvent = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  onAuctionCreated(auctionCreationEvent)
}

function cleanup(): void {
  clearStore()
}

test('Bid is created on auction creation event', () => {
  setup()
  const bidId = auctionCreationEvent.transaction.hash.toHex()

  assert.entityCount('Bid', 1)
  assert.fieldEquals('Bid', bidId, 'id', bidId)
  assert.fieldEquals('Bid', bidId, 'user', ALICE.toHex())
  assert.fieldEquals('Bid', bidId, 'amount', AMOUNT.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtBlock', auctionCreationEvent.block.number.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtTimestamp', auctionCreationEvent.block.timestamp.toString())
  cleanup()
})

test('Bid is created on bid event', () => {
  setup()
  let bidEvent = createBidEvent(TOKEN, BOB, AMOUNT)
  let bidId = "0x0000000000000000000000000000000000000002"
  bidEvent.transaction.hash = Address.fromString(bidId) as Bytes;
  assert.entityCount('Bid', 1)

  onBid(bidEvent)
  assert.entityCount('Bid', 2)
  assert.fieldEquals('Bid', bidId, 'id', bidId)
  assert.fieldEquals('Bid', bidId, 'user', BOB.toHex())
  assert.fieldEquals('Bid', bidId, 'amount', AMOUNT.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtBlock', bidEvent.block.number.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtTimestamp', bidEvent.block.timestamp.toString())

  cleanup()
})


test('Bid is created on auction end event', () => {
  setup()
  let auctionEndedEvent = createAuctionEndedEvent(TOKEN, ALICE, AMOUNT)
  let bidId = "0x0000000000000000000000000000000000000002"
  auctionEndedEvent.transaction.hash = Address.fromString(bidId) as Bytes;
  assert.entityCount('Bid', 1)

  onAuctionEnded(auctionEndedEvent)
  assert.entityCount('Bid', 2)
  assert.fieldEquals('Bid', bidId, 'id', bidId)
  assert.fieldEquals('Bid', bidId, 'user', ALICE.toHex())
  assert.fieldEquals('Bid', bidId, 'amount', AMOUNT.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtBlock', auctionEndedEvent.block.number.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtTimestamp', auctionEndedEvent.block.timestamp.toString())

  cleanup()
})
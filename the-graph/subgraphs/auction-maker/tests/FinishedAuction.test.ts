import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { Started as AuctionCreatedEvent } from '../generated/AuctionMaker/AuctionMaker'
import { onAuctionCreated, onAuctionEnded, onBid } from '../src/mappings/auction-maker'
import { createAuctionCreatedEvent, createAuctionEndedEvent, createBidEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const CHARLIE = Address.fromString('0x000000000000000000000000000000000c0a071e')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')
let auctionCreationEvent: AuctionCreatedEvent

function setup(): void {
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  auctionCreationEvent = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  onAuctionCreated(auctionCreationEvent)
}

function cleanup(): void {
  clearStore()
}

test('Auction runs twice with the same token results in two FinishedAuction entities', () => {
  setup()
  let auctionId1 = TOKEN.toHex().concat(":0")
  let auctionId2 = TOKEN.toHex().concat(":1")
  let auctionCreationEvent2 = createAuctionCreatedEvent(TOKEN, CHARLIE, AMOUNT, REWARD_AMOUNT)
  let auctionEndedEvent = createAuctionEndedEvent(TOKEN, BOB, AMOUNT)
  let auctionEndedEvent2 = createAuctionEndedEvent(TOKEN, CHARLIE, AMOUNT)

  onAuctionEnded(auctionEndedEvent)
  assert.entityCount('FinishedAuction', 1)
  assert.fieldEquals('FinishedAuction', auctionId1, 'id', auctionId1)
  assert.fieldEquals('FinishedAuction', auctionId1, 'winner', ALICE.toHex())
  assert.fieldEquals('FinishedAuction', auctionId1, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('FinishedAuction', auctionId1, 'rewardAmount', REWARD_AMOUNT.toString())
  assert.fieldEquals('FinishedAuction', auctionId1, 'createdAtBlock', auctionCreationEvent.block.number.toString())
  assert.fieldEquals('FinishedAuction', auctionId1, 'createdAtTimestamp', auctionCreationEvent.block.timestamp.toString())


  onAuctionCreated(auctionCreationEvent2)
  onAuctionEnded(auctionEndedEvent2)

  assert.entityCount('FinishedAuction', 2)
  assert.fieldEquals('FinishedAuction', auctionId2, 'id', auctionId2)
  assert.fieldEquals('FinishedAuction', auctionId2, 'winner', CHARLIE.toHex())
  assert.fieldEquals('FinishedAuction', auctionId2, 'bidAmount', AMOUNT.toString())
  assert.fieldEquals('FinishedAuction', auctionId2, 'rewardAmount', REWARD_AMOUNT.toString())
  assert.fieldEquals('FinishedAuction', auctionId2, 'createdAtBlock', auctionCreationEvent.block.number.toString())
  assert.fieldEquals('FinishedAuction', auctionId2, 'createdAtTimestamp', auctionCreationEvent.block.timestamp.toString())
  cleanup()
})
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { Started as AuctionCreatedEvent } from '../generated/AuctionMaker/AuctionMaker'
import { BID_TOKEN_ADDRESS } from '../src/constants'
import { onAuctionCreated, onBid } from '../src/mappings/auction-maker'
import { createAuctionCreatedEvent, createBidEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')
let auctionCreationEvent: AuctionCreatedEvent
const AUCTION_ID = TOKEN.toHex().concat(':0')

function setup(): void {
  createTokenMock(TOKEN.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  createTokenMock(BID_TOKEN_ADDRESS.toHex(), BigInt.fromString('18'), 'Sushi Token', 'SUSHI')
  auctionCreationEvent = createAuctionCreatedEvent(TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  onAuctionCreated(auctionCreationEvent)
}

function cleanup(): void {
  clearStore()
}

test('UserAuction is created on auction creation event', () => {
  setup()
  const id = ALICE.toHex().concat(":").concat(AUCTION_ID)

  assert.entityCount('UserAuction', 1)
  assert.fieldEquals('UserAuction', id, 'id', id)
  assert.fieldEquals('UserAuction', id, 'user', ALICE.toHex())
  assert.fieldEquals('UserAuction', id, 'auction', AUCTION_ID)
  cleanup()
})

test('UserAuction is created on bid event', () => {
  setup()
  let bidEvent = createBidEvent(TOKEN, BOB, AMOUNT)
  const id = BOB.toHex().concat(":").concat(AUCTION_ID)

  assert.entityCount('Bid', 1)

  onBid(bidEvent)
  assert.entityCount('UserAuction', 2)
  assert.fieldEquals('UserAuction', id, 'id', id)
  assert.fieldEquals('UserAuction', id, 'user', BOB.toHex())
  assert.fieldEquals('UserAuction', id, 'auction', AUCTION_ID)
  cleanup()
})

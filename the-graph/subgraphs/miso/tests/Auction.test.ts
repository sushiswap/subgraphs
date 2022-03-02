import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getCommitmentId, getParticipantId } from '../src/functions/index'
import { onAddedCommitment, onAuctionCancelled, onAuctionFinalized } from '../src/mappings/auction'
import { onAuctionTemplateAdded, onMarketCreated } from '../src/mappings/market'
import {
  createAddedCommitmentEvent,
  createAuctionCancelledEvent,
  createAuctionFinalizedEvent,
  createAuctionTemplateAddedEvent,
  createMarketCreatedEvent
} from './mocks'

const FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000420')
const TEMPLATE_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000101')
const AUCTION = Address.fromString('0x00000000000000000000000000000000000be990') // This is actually a deployed bentobox
const ALICE = Address.fromString('0x00000000000000000000000000000000000471ce')
function setup(): void {
  let templateId = BigInt.fromString('1')
  let addTemplateEvent = createAuctionTemplateAddedEvent(FACTORY_ADDRESS, TEMPLATE_ADDRESS, templateId)
  let auctionCreatedEvent = createMarketCreatedEvent(FACTORY_ADDRESS, ALICE, AUCTION, TEMPLATE_ADDRESS)

  onAuctionTemplateAdded(addTemplateEvent)
  onMarketCreated(auctionCreatedEvent)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'id', AUCTION.toHex())
  assert.fieldEquals('Auction', AUCTION.toHex(), 'factory', FACTORY_ADDRESS.toHex())
  assert.fieldEquals('Auction', AUCTION.toHex(), 'template', TEMPLATE_ADDRESS.toHex())
  assert.fieldEquals('Auction', AUCTION.toHex(), 'deploymentTimestamp', auctionCreatedEvent.block.timestamp.toString())
}
function cleanup(): void {
  clearStore()
}

test('When a commit is added, a commitment and participant entity is created', () => {
  setup()
  let amount = BigInt.fromString('1000000000000000')
  let commitmentEvent = createAddedCommitmentEvent(AUCTION, ALICE, amount)

  onAddedCommitment(commitmentEvent)

  let commitmentId = getCommitmentId(commitmentEvent)
  let expectedCommitmentId = commitmentEvent.address
    .toHex()
    .concat(commitmentEvent.params.addr.toHex())
    .concat(commitmentEvent.block.number.toString())
    .concat(commitmentEvent.transactionLogIndex.toString())
  assert.stringEquals(commitmentId, expectedCommitmentId)

  let participantId = getParticipantId(ALICE.toHex(), AUCTION.toHex())
  let expectedParticipantId = ALICE.toHex() + ':' + AUCTION.toHex()
  assert.stringEquals(participantId, expectedParticipantId)

  assert.fieldEquals('Commitment', commitmentId, 'id', commitmentId)
  assert.fieldEquals('Commitment', commitmentId, 'auction', AUCTION.toHex())
  assert.fieldEquals('Commitment', commitmentId, 'participant', participantId)
  assert.fieldEquals('Commitment', commitmentId, 'user', ALICE.toHex())
  assert.fieldEquals('Commitment', commitmentId, 'amount', commitmentEvent.params.commitment.toString())
  assert.fieldEquals('Commitment', commitmentId, 'block', commitmentEvent.block.number.toString())
  assert.fieldEquals('Commitment', commitmentId, 'timestamp', commitmentEvent.block.timestamp.toString())

  assert.fieldEquals('Participant', participantId, 'id', participantId)
  assert.fieldEquals('Participant', participantId, 'auction', AUCTION.toHex())
  assert.fieldEquals('Participant', participantId, 'user', ALICE.toHex())

  cleanup()
})

test('Auctions commitment count and partipant count is increased', () => {
  setup()
  let amount = BigInt.fromString('1000000000000000')
  let commitmentEvent = createAddedCommitmentEvent(AUCTION, ALICE, amount)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'commitmentCount', '0')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'participantCount', '0')

  // When: A commitment event triggers
  onAddedCommitment(commitmentEvent)

  // Then: Alice commitment increased the auctions participantCount and commitmentCount
  assert.fieldEquals('Auction', AUCTION.toHex(), 'commitmentCount', '1')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'participantCount', '1')

  // When: Alice doubles down on her investment
  onAddedCommitment(commitmentEvent)

  // Then: commitment is increased, but participant remains the same
  assert.fieldEquals('Auction', AUCTION.toHex(), 'commitmentCount', '2')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'participantCount', '1')

  cleanup()
})

test('Auctions committed amount is increased for each commitment', () => {
  setup()
  let amount = BigInt.fromString('1000000000000000')
  let commitmentEvent = createAddedCommitmentEvent(AUCTION, ALICE, amount)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'committed', '0')

  // When: A commitment event triggers
  onAddedCommitment(commitmentEvent)

  // Then: The aunction.committed value is increased
  assert.fieldEquals('Auction', AUCTION.toHex(), 'committed', amount.toString())

  // When: Alice doubles down on her investment
  onAddedCommitment(commitmentEvent)

  // Then: The aunction.committed value is doubled
  let expectedAmount = amount.times(BigInt.fromString('2')).toString()
  assert.fieldEquals('Auction', AUCTION.toHex(), 'committed', expectedAmount)

  cleanup()
})

test('Auction is finalized', () => {
  setup()
  let finalizedEvent = createAuctionFinalizedEvent(AUCTION)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'finalized', 'false')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'cancelled', 'false')

  onAuctionFinalized(finalizedEvent)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'finalized', 'true')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'cancelled', 'false')

  cleanup()
})

test('Auction is cancelled', () => {
  setup()
  let cancelEvent = createAuctionCancelledEvent(AUCTION)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'finalized', 'false')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'cancelled', 'false')

  onAuctionCancelled(cancelEvent)

  assert.fieldEquals('Auction', AUCTION.toHex(), 'finalized', 'false')
  assert.fieldEquals('Auction', AUCTION.toHex(), 'cancelled', 'true')

  cleanup()
})

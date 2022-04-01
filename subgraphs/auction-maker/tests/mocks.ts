import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  Ended as AuctionEndedEvent,
  PlacedBid as BidEvent,
  Started as AuctionCreatedEvent,
} from '../generated/AuctionMaker/AuctionMaker'

export function createAuctionCreatedEvent(
  token: Address,
  bidder: Address,
  bidAmount: BigInt,
  rewardAmount: BigInt
): AuctionCreatedEvent {
  let mockEvent = newMockEvent()
  let event = new AuctionCreatedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let bidderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(bidder))
  let bidAmountParam = new ethereum.EventParam('bidAmount', ethereum.Value.fromUnsignedBigInt(bidAmount))
  let rewardAmountParam = new ethereum.EventParam('rewardAmount', ethereum.Value.fromUnsignedBigInt(rewardAmount))
  event.parameters.push(tokenParam)
  event.parameters.push(bidderParam)
  event.parameters.push(bidAmountParam)
  event.parameters.push(rewardAmountParam)

  return event
}

export function createBidEvent(token: Address, bidder: Address, bidAmount: BigInt): BidEvent {
  let mockEvent = newMockEvent()
  let event = new BidEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let bidderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(bidder))
  let bidAmountParam = new ethereum.EventParam('bidAmount', ethereum.Value.fromUnsignedBigInt(bidAmount))
  event.parameters.push(tokenParam)
  event.parameters.push(bidderParam)
  event.parameters.push(bidAmountParam)

  return event
}

export function createAuctionEndedEvent(token: Address, bidder: Address, bidAmount: BigInt): AuctionEndedEvent {
  let mockEvent = newMockEvent()
  let event = new AuctionEndedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let bidderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(bidder))
  let bidAmountParam = new ethereum.EventParam('bidAmount', ethereum.Value.fromUnsignedBigInt(bidAmount))
  event.parameters.push(tokenParam)
  event.parameters.push(bidderParam)
  event.parameters.push(bidAmountParam)

  return event
}

export function createTokenMock(contractAddress: string, decimals: BigInt, name: string, symbol: string): void {
  createMockedFunction(Address.fromString(contractAddress), 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromUnsignedBigInt(decimals),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ])
}

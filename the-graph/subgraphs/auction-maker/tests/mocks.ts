import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { PlacedBid as PlaceBidEvent, Started as CreateAuctionEvent } from '../generated/AuctionMaker/AuctionMaker'

export function createAuctionEvent(token: Address, bidder: Address, bidAmount: BigInt, rewardAmount: BigInt): CreateAuctionEvent {
  let mockEvent = newMockEvent()
  let event = new CreateAuctionEvent(
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


export function createPlaceBidEvent(token: Address, bidder: Address, bidAmount: BigInt): PlaceBidEvent {
  let mockEvent = newMockEvent()
  let event = new PlaceBidEvent(
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

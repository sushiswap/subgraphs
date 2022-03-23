import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { Started as StartEvent } from '../generated/AuctionMaker/AuctionMaker'

export function createStartEvent(token: Address, bidder: Address, bidAmount: BigInt, rewardAmount: BigInt): StartEvent {
  let mockEvent = newMockEvent()
  let event = new StartEvent(
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

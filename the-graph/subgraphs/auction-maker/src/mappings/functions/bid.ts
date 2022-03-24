import { PlacedBid as BidEvent, Started as AuctionCreatedEvent } from '../../../generated/AuctionMaker/AuctionMaker'
import { Bid } from '../../../generated/schema'
import { increaseBidCount } from './auction-maker'
import { getOrCreateToken } from './token'

export function createInitialBid(event: AuctionCreatedEvent): Bid {
  const token = getOrCreateToken(event.params.token.toHex())
  const bid = new Bid(event.transaction.hash.toHex())
  bid.token = token.id
  bid.user = event.params.bidder.toHex()
  bid.amount = event.params.bidAmount
  bid.createdAtBlock = event.block.number
  bid.createdAtTimestamp = event.block.timestamp
  bid.save()

  increaseBidCount()

  return bid
}

export function createBid(event: BidEvent): Bid {
  const token = getOrCreateToken(event.params.token.toHex())
  const bid = new Bid(event.transaction.hash.toHex())
  bid.token = token.id
  bid.user = event.params.bidder.toHex()
  bid.amount = event.params.bidAmount
  bid.createdAtBlock = event.block.number
  bid.createdAtTimestamp = event.block.timestamp
  bid.save()

  increaseBidCount()

  return bid
}

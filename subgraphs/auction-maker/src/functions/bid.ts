import { PlacedBid as BidEvent, Started as AuctionCreatedEvent } from '../../generated/AuctionMaker/AuctionMaker'
import { Auction, Bid } from '../../generated/schema'
import { increaseBidCount } from './auction-maker'

export function createInitialBid(auction: Auction, event: AuctionCreatedEvent): Bid {
  const bid = new Bid(event.transaction.hash.toHex())
  bid.auction = auction.id
  bid.bidToken = auction.bidToken
  bid.rewardToken = auction.rewardToken
  bid.user = event.params.bidder.toHex()
  bid.amount = event.params.bidAmount
  bid.createdAtBlock = event.block.number
  bid.createdAtTimestamp = event.block.timestamp
  bid.save()

  increaseBidCount()

  return bid
}

export function createBid(auction: Auction, event: BidEvent): Bid {
  const bid = new Bid(event.transaction.hash.toHex())
  bid.auction = auction.id
  bid.bidToken = auction.bidToken
  bid.rewardToken = auction.rewardToken
  bid.user = event.params.bidder.toHex()
  bid.amount = event.params.bidAmount
  bid.createdAtBlock = event.block.number
  bid.createdAtTimestamp = event.block.timestamp
  bid.save()

  increaseBidCount()

  return bid
}

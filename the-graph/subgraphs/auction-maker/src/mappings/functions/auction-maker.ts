import { Started as CreateAuctionEvent, BidEvent as PlaceBidEvent } from '../../../generated/AuctionMaker/AuctionMaker'
import { Auction } from '../../../generated/schema'
import { MAX_TTL, MIN_TTL } from '../constants'

export function createAuction(event: CreateAuctionEvent): Auction {
  const auction = new Auction(event.params.token.toHex())

  auction.highestBidder = event.params.bidder.toHex()
  auction.bidAmount = event.params.bidAmount
  auction.rewardAmount = event.params.rewardAmount
  auction.maxTTL = event.block.timestamp.plus(MAX_TTL)
  auction.minTTL = event.block.timestamp.plus(MIN_TTL)
  auction.createdAtBlock = event.block.number
  auction.createdAtTimestamp = event.block.timestamp
  auction.modifiedAtBlock = event.block.number
  auction.modifiedAtTimestamp = event.block.timestamp
  auction.save()

  return auction
}

export function updateAuction(event: PlaceBidEvent): Auction {
  let auction = Auction.load(event.params.token.toHex())

  if (auction == null) {
    auction = new Auction(event.params.token.toHex())
  }

  auction.highestBidder = event.params.bidder.toHex()
  auction.bidAmount = event.params.bidAmount
  auction.minTTL = event.block.timestamp.plus(MIN_TTL)
  auction.modifiedAtBlock = event.block.number
  auction.modifiedAtTimestamp = event.block.timestamp
  auction.save()

  return auction
}

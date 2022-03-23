import { Started as StartEvent } from '../../../generated/AuctionMaker/AuctionMaker'
import { Auction } from '../../../generated/schema'
import { MAX_TTL, MIN_TTL } from '../constants'

export function getOrCreateAuction(event: StartEvent): Auction {
  let auction = Auction.load(event.params.token.toHex())

  if (auction === null) {
    return createAuction(event)
  }

  return auction as Auction
}

function createAuction(event: StartEvent): Auction {
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

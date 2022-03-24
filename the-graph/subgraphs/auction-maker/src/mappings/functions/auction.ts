import { log, store } from '@graphprotocol/graph-ts'
import {
  Started as CreateAuctionEvent,
  PlacedBid as BidEvent,
  Ended as AuctionEndedEvent,
} from '../../../generated/AuctionMaker/AuctionMaker'
import { Auction } from '../../../generated/schema'
import { MAX_TTL, MIN_TTL } from '../constants'
import { increaseAuctionCount, increaseFinishedAuctionCount } from './auction-maker'

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

  increaseAuctionCount()

  return auction
}

export function updateAuction(event: BidEvent): Auction {
  const auction = getOrCreateAuction(event.params.token.toHex())
  auction.highestBidder = event.params.bidder.toHex()
  auction.bidAmount = event.params.bidAmount
  auction.minTTL = event.block.timestamp.plus(MIN_TTL)
  auction.modifiedAtBlock = event.block.number
  auction.modifiedAtTimestamp = event.block.timestamp
  auction.save()

  return auction
}

export function deleteAuction(event: AuctionEndedEvent): Auction {
  const auction = getOrCreateAuction(event.params.token.toHex())
  store.remove('Auction', auction.id)
  return auction
}

function getOrCreateAuction(id: string): Auction {
  let auction = Auction.load(id)

  if (auction == null) {
    auction = new Auction(id)
  }

  return auction
}

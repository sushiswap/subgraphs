import { BigInt } from '@graphprotocol/graph-ts'
import {
  Ended as AuctionEndedEvent,
  PlacedBid as BidEvent,
  Started as CreateAuctionEvent,
} from '../../../generated/AuctionMaker/AuctionMaker'
import { Auction } from '../../../generated/schema'
import { FINISHED, MAX_TTL, MIN_TTL, ONGOING } from '../constants'
import { increaseAuctionCount, increaseFinishedAuctionCount } from './auction-maker'
import { getOrCreateToken } from './token'

export function createAuction(event: CreateAuctionEvent): Auction {
  const token = getOrCreateToken(event.params.token.toHex())
  const auctionId = token.id.concat(':').concat(token.auctionCount.toString())
  const auction = new Auction(auctionId)

  auction.status = ONGOING
  auction.token = token.id
  auction.leadingBid = event.transaction.hash.toHex()
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
  const token = getOrCreateToken(event.params.token.toHex())
  const auctionId = token.id.concat(':').concat(token.auctionCount.toString())
  const auction = getOrCreateAuction(auctionId)
  auction.leadingBid = event.transaction.hash.toHex()
  auction.bidAmount = event.params.bidAmount
  auction.minTTL = event.block.timestamp.plus(MIN_TTL)
  auction.modifiedAtBlock = event.block.number
  auction.modifiedAtTimestamp = event.block.timestamp
  auction.save()

  return auction
}

export function endAuction(event: AuctionEndedEvent): Auction {
  const token = getOrCreateToken(event.params.token.toHex())
  const auctionId = token.id.concat(':').concat(token.auctionCount.toString())
  const auction = getOrCreateAuction(auctionId)
  auction.status = FINISHED
  auction.modifiedAtBlock = event.block.number
  auction.modifiedAtTimestamp = event.block.timestamp
  auction.save()

  token.auctionCount = token.auctionCount.plus(BigInt.fromU32(1))
  token.save()

  increaseFinishedAuctionCount()

  return auction
}

function getOrCreateAuction(id: string): Auction {
  let auction = Auction.load(id)

  if (auction == null) {
    auction = new Auction(id)
    auction.save()
  }

  return auction
}

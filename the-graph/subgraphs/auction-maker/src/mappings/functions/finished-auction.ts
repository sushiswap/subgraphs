import { ethereum } from '@graphprotocol/graph-ts'
import { Auction, FinishedAuction } from '../../../generated/schema'
import { getFinishedAuctionCount, increaseFinishedAuctionCount } from './auction-maker'

export function createFinishedAuction(auction: Auction, event: ethereum.Event): FinishedAuction {
  const finishedAuction = new FinishedAuction(auction.id.concat(':').concat(getFinishedAuctionCount().toString()))
  finishedAuction.winner = auction.highestBidder
  finishedAuction.bidAmount = auction.bidAmount
  finishedAuction.rewardAmount = auction.rewardAmount
  finishedAuction.createdAtBlock = event.block.number
  finishedAuction.createdAtTimestamp = event.block.timestamp
  finishedAuction.save()

  increaseFinishedAuctionCount()

  return finishedAuction
}

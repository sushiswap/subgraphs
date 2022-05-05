import { BigInt } from '@graphprotocol/graph-ts'
import { AuctionMaker } from '../../generated/schema'
import { AUCTION_MAKER } from '../constants'

export function increaseUserCount(): void {
  const auctionMaker = getOrCreateAuctionMaker()
  auctionMaker.userCount = auctionMaker.userCount.plus(BigInt.fromU32(1))
  auctionMaker.save()
}

export function increaseBidCount(): void {
  const auctionMaker = getOrCreateAuctionMaker()
  auctionMaker.bidCount = auctionMaker.bidCount.plus(BigInt.fromU32(1))
  auctionMaker.save()
}

export function increaseAuctionCount(): void {
  const auctionMaker = getOrCreateAuctionMaker()
  auctionMaker.auctionCount = auctionMaker.auctionCount.plus(BigInt.fromU32(1))
  auctionMaker.save()
}

export function increaseFinishedAuctionCount(): void {
  const auctionMaker = getOrCreateAuctionMaker()
  auctionMaker.finishedAuctionCount = auctionMaker.finishedAuctionCount.plus(BigInt.fromU32(1))
  auctionMaker.save()
}

export function getFinishedAuctionCount(): BigInt {
  const auctionMaker = getOrCreateAuctionMaker()
  return auctionMaker.finishedAuctionCount
}

function getOrCreateAuctionMaker(): AuctionMaker {
  const auctionMaker = AuctionMaker.load(AUCTION_MAKER)

  if (auctionMaker === null) {
    return createAuctionMaker()
  }

  return auctionMaker as AuctionMaker
}

function createAuctionMaker(): AuctionMaker {
  const auctionMaker = new AuctionMaker(AUCTION_MAKER)
  auctionMaker.save()
  return auctionMaker
}

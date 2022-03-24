import {
  Ended as AuctionEndedEvent,
  PlacedBid as BidEvent,
  Started as AuctionCreatedEvent
} from '../../generated/AuctionMaker/AuctionMaker'
import { createAuction, deleteAuction, updateAuction } from './functions/auction'
import { createBid, createInitialBid } from './functions/bid'
import { createFinishedAuction } from './functions/finished-auction'
import { getOrCreateUser } from './functions/user'

export function onAuctionCreated(event: AuctionCreatedEvent): void {
  getOrCreateUser(event.params.bidder.toHex(), event)
  createAuction(event)
  createInitialBid(event)
}

export function onBid(event: BidEvent): void {
  getOrCreateUser(event.params.bidder.toHex(), event)
  updateAuction(event)
  createBid(event)
}

export function onAuctionEnded(event: AuctionEndedEvent): void {
  getOrCreateUser(event.params.bidder.toHex(), event)
  const auction = deleteAuction(event)
  createFinishedAuction(auction, event)
}

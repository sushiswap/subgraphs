import { log, store } from '@graphprotocol/graph-ts';
import { Started as AuctionCreatedEvent, BidEvent as BidEvent, Ended as AuctionEndedEvent } from '../../generated/AuctionMaker/AuctionMaker'
import { createAuction, updateAuction } from './functions/auction-maker'

export function onAuctionCreated(event: AuctionCreatedEvent): void {
    const auction = createAuction(event)

}

export function onBid(event: BidEvent): void {
    const auction = updateAuction(event)
}

export function onAuctionEnded(event: AuctionEndedEvent): void {
    store.remove('Auction', event.params.token.toHex())
}

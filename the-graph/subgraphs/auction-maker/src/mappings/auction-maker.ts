import { store } from '@graphprotocol/graph-ts';
import { Ended as AuctionEndedEvent, PlacedBid as BidEvent, Started as AuctionCreatedEvent } from '../../generated/AuctionMaker/AuctionMaker';
import { createAuction, deleteAuction, updateAuction } from './functions/auction';
import { createBid } from './functions/bid';

export function onAuctionCreated(event: AuctionCreatedEvent): void {
    const auction = createAuction(event)
    const userId = event.params.bidder.toHex()
    const amount = event.params.bidAmount
    createBid(userId, amount, event)

}

export function onBid(event: BidEvent): void {
    const auction = updateAuction(event)
    const userId = event.params.bidder.toHex()
    const amount = event.params.bidAmount
    createBid(userId, amount, event)

}

export function onAuctionEnded(event: AuctionEndedEvent): void {
    deleteAuction(event)
    // TODO: archive node
}

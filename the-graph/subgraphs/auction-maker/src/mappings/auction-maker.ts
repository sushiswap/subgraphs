import { store } from '@graphprotocol/graph-ts';
import { Ended as AuctionEndedEvent, PlacedBid as BidEvent, Started as AuctionCreatedEvent } from '../../generated/AuctionMaker/AuctionMaker';
import { createAuction, deleteAuction, updateAuction } from './functions/auction';

export function onAuctionCreated(event: AuctionCreatedEvent): void {
    const auction = createAuction(event)

}

export function onBid(event: BidEvent): void {
    const auction = updateAuction(event)
}

export function onAuctionEnded(event: AuctionEndedEvent): void {
    deleteAuction(event)
    // TODO: archive node
}

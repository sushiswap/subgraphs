import { Ended as AuctionEndedEvent, PlacedBid as BidEvent, Started as AuctionCreatedEvent } from '../../generated/AuctionMaker/AuctionMaker';
import { createAuction, deleteAuction, updateAuction } from './functions/auction';
import { createBid } from './functions/bid';
import { getOrCreateUser } from './functions/user';

export function onAuctionCreated(event: AuctionCreatedEvent): void {
    const user = getOrCreateUser(event.params.bidder.toHex(), event)
    createAuction(event)
    createBid(user.id, event.params.bidAmount, event)

}

export function onBid(event: BidEvent): void {
    const user = getOrCreateUser(event.params.bidder.toHex(), event)
    updateAuction(event)
    createBid(user.id, event.params.bidAmount, event)

}

export function onAuctionEnded(event: AuctionEndedEvent): void {
    getOrCreateUser(event.params.bidder.toHex(), event)
    // TODO: archive node, ended by?
    deleteAuction(event)
}

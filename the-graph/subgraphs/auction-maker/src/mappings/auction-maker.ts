import { log } from '@graphprotocol/graph-ts';
import { Started as CreateAuctionEvent, PlacedBid as PlaceBidEvent } from '../../generated/AuctionMaker/AuctionMaker'
import { createAuction, updateAuction } from './functions/auction-maker'

export function onCreateAuction(event: CreateAuctionEvent): void {
    const auction = createAuction(event)

}


export function onPlaceBid(event: PlaceBidEvent): void {
    const auction = updateAuction(event)
    if (auction == null) {
        log.warning("Should not be possible",[]);
    }
}

import { Started as StartEvent } from '../../generated/AuctionMaker/AuctionMaker'
import { getOrCreateAuction } from './functions/auction-maker'

export function onStart(event: StartEvent): void {
    const auction = getOrCreateAuction(event)

}

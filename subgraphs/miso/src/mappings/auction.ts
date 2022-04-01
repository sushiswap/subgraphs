import { BigInt } from '@graphprotocol/graph-ts'
import { AddedCommitment, AuctionCancelled, AuctionFinalized } from '../../generated/templates/MisoAuction/MisoAuction'
import { createCommitment, getAuction } from '../functions'

export function onAddedCommitment(event: AddedCommitment): void {
  createCommitment(event)

  const auction = getAuction(event.address.toHex())
  auction.commitmentCount = auction.commitmentCount.plus(BigInt.fromI32(1))
  auction.committed = auction.committed.plus(event.params.commitment)
  auction.save()
}

export function onAuctionFinalized(event: AuctionFinalized): void {
  const auction = getAuction(event.address.toHex())
  auction.finalized = true
  auction.finalizedTimestamp = event.block.timestamp
  auction.save()
}

export function onAuctionCancelled(event: AuctionCancelled): void {
  const auction = getAuction(event.address.toHex())
  auction.cancelled = true
  auction.cancelledTimestamp = event.block.timestamp
  auction.save()
}

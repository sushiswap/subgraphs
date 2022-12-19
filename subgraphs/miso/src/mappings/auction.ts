import { Address, BigInt } from '@graphprotocol/graph-ts'
import { AddedCommitment, AuctionCancelled, AuctionFinalized, AuctionPointListUpdated, DocumentRemoved, DocumentUpdated } from '../../generated/templates/CrowdsaleAuction/CrowdsaleAuction'
import { createCommitment, getAuction, removeDocument, updateDocument } from '../functions'

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

export function onDocumentUpdated(event: DocumentUpdated): void {
  updateDocument(event.address.toHex(), event.params._name.toHex(), event.params._data)
}

export function onDocumentRemoved(event: DocumentRemoved): void {
  removeDocument(event.address.toHex(), event.params._name.toHex(), event.params._data)
}

export function onPointListUpdated(event: AuctionPointListUpdated): void {

  const auction = getAuction(event.address.toHex())
  if (event.params.pointList != Address.fromString("0x0000000000000000000000000000000000000000")) {
    auction.pointList = event.params.pointList.toHex()
  }
  auction.usePointList = event.params.enabled
  auction.pointList = event.params.pointList.toHex()
  auction.save()
}
import { log } from '@graphprotocol/graph-ts'
import { AuctionTemplateAdded, AuctionTemplateRemoved, MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { MisoAuction } from '../../generated/templates'
import { AuctionType } from '../constants'
import { createAuction, createTemplate, getOrCreateFactory, getTemplate } from '../functions'

export function onAuctionTemplateAdded(event: AuctionTemplateAdded): void {
  getOrCreateFactory(event.address.toHex())
  createTemplate(event)
}

export function onAuctionTemplateRemoved(event: AuctionTemplateRemoved): void {
  const template = getTemplate(event.params.auction.toHex())
  template.removed = true
  template.save()
}

export function onMarketCreated(event: MarketCreated): void {
  const auction = createAuction(event)
  if (!auction) {
    log.warning("auction return null, ignore.", [])
  }
  else {
    MisoAuction.create(event.params.addr)
  }
}

import { AuctionTemplateAdded, AuctionTemplateRemoved, MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { MisoAuction } from '../../generated/templates'
import { createTemplate, getTemplate, createAuction, getOrCreateFactory } from '../functions'

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
  createAuction(event)
  MisoAuction.create(event.params.addr)
}

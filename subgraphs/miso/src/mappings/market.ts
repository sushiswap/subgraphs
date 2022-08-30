import { AuctionTemplateAdded, AuctionTemplateRemoved, MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { BatchAuction, CrowdsaleAuction, DutchAuction } from '../../generated/templates'
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
  createAuction(event)
  const template = getTemplate(event.params.marketTemplate.toHex())
  if (template.type == AuctionType.CROWDSALE) {
    CrowdsaleAuction.create(event.params.addr)
  }
  else if (template.type == AuctionType.DUTCH) {
    DutchAuction.create(event.params.addr)
  }
  else if (template.type == AuctionType.BATCH) {
    BatchAuction.create(event.params.addr)
  }
}

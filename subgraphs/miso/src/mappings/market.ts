import { Address, BigInt, log } from '@graphprotocol/graph-ts'
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
  if(event.address.equals(Address.fromString('0x9d6c60d26B8f776B85d5731AD56b88973C3D370b'))) {
    log.debug("VERSION 0.1 {}", [event.address.toHex()])
  }
  if(event.address.equals(Address.fromString('0x9a40B4497b62607ED9014e8E14284b21095a572C'))) {
    log.debug("VERSION 0.2 {}", [event.address.toHex()])
  }
  if(event.address.equals(Address.fromString('0xc35dadb65012ec5796536bd9864ed8773abc74c4'))) {
    log.debug("VERSION 1.0 {}", [event.address.toHex()])
  }
  createAuction(event)
  MisoAuction.create(event.params.addr)
}

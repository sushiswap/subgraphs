import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'

export function createAuction(event: MarketCreated): Auction {
  const auction = new Auction(event.params.addr.toHex())

  auction.factory = event.address.toHex()
  auction.template = event.params.marketTemplate.toHex()
  auction.deploymentTimestamp = event.block.timestamp
  auction.save()

  return auction as Auction
}

export function getAuction(id: string): Auction {
  const auction = Auction.load(id)
  return auction as Auction
}

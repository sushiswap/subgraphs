import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { MisoAuction } from '../../generated/templates'

export function onMarketCreated(event: MarketCreated): void {
  MisoAuction.create(event.params.addr)
}

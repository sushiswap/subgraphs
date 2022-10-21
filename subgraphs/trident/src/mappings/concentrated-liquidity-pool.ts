import { handleMint } from '../concentrated/mint'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Collect as CollectEvent
} from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { updateTvlAndTokenPrices } from '../update-price-tvl-volume'



export function onSwap(event: SwapEvent): void {
  // updates prices
}

export function onMint(event: MintEvent): void {
  handleMint(event)
  // TODO: update tvl
  // TODO: update snapshots
}

export function onBurn(event: BurnEvent): void {

}


export function onCollect(event: CollectEvent): void {

}

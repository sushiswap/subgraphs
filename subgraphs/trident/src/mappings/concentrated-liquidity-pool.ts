import { handleMint } from '../concentrated/mint'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Collect as CollectEvent
} from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'



export function onSwap(event: SwapEvent): void {

}

export function onMint(event: MintEvent): void {
  handleMint(event)
  // TODO: update snapshots
}

export function onBurn(event: BurnEvent): void {

}


export function onCollect(event: CollectEvent): void {

}

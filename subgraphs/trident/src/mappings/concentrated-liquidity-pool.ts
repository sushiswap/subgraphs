import {
  Burn as BurnEvent, Collect as CollectEvent, Mint as MintEvent,
  Swap as SwapEvent
} from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { handleBurn, handleMint } from '../concentrated'
import { updateFactorySnapshots, updatePairSnapshots, updateTokenSnapshots } from '../functions'


export function onSwap(event: SwapEvent): void {
  // updates prices
}

export function onMint(event: MintEvent): void {
  handleMint(event)
  updateFactorySnapshots(event)
  updateTokenSnapshots(event.block.timestamp, event.address)
  updatePairSnapshots(event.block.timestamp, event.address)
}

export function onBurn(event: BurnEvent): void {
  handleBurn(event)
  updateFactorySnapshots(event)
  updateTokenSnapshots(event.block.timestamp, event.address)
  updatePairSnapshots(event.block.timestamp, event.address)
}


export function onCollect(event: CollectEvent): void {

}

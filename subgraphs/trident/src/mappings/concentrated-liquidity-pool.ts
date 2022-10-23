
import { updateApr } from '../swap'
import {
  Burn as BurnEvent, Collect as CollectEvent, Mint as MintEvent,
  Swap as SwapEvent
} from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { handleBurn, handleMint, handleCollect, handleSwap } from '../concentrated'
import { updateFactorySnapshots, updatePairSnapshots, updateTokenSnapshots } from '../functions'


export function onSwap(event: SwapEvent): void {

  const volume = handleSwap(event) // TODO: Prices are only updated in here, consider if it should be runnin in the other handlers as well
  updateFactorySnapshots(event, volume)
  updateTokenSnapshots(event.block.timestamp, event.address, volume)
  updatePairSnapshots(event.block.timestamp, event.address, volume)
  updateApr(event)
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
  handleCollect(event)
}

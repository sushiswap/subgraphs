import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap,
  Sync,
  Transfer
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { updateLiquidity, updateTvlAndTokenPrices as updateTvlAndPrices, updateVolume } from '../update-price-tvl-volume'

export function onSync(event: Sync): void {
  updateTvlAndPrices(event)
}

export function onMint(event: MintEvent): void {
  updateLiquidity(event)
}

export function onBurn(event: BurnEvent): void {
  updateLiquidity(event)
}

export function onTransfer(event: Transfer): void {
  updateLiquidity(event)
}

export function onSwap(event: Swap): void {
  updateVolume(event)
}

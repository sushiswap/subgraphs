
import { Transfer } from '../../generated/Factory/ERC20'
import { Sync } from '../../generated/Factory/Pair'
import { Swap } from '../../generated/templates/Pair/Pair'
import { updateLiquidity, updateTvlAndTokenPrices, updateVolume } from '../update-price-tvl-volume'

export function onSync(event: Sync): void {
  updateTvlAndTokenPrices(event)
}

export function onTransfer(event: Transfer): void {
  updateLiquidity(event)
}

export function onSwap(event: Swap): void {
  updateVolume(event)
}

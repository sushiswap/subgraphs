import { Address } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent
} from '../../generated/templates/Pair/Pair'
import { handleBurn } from '../burn'
import {
  createLiquidityPositionSnapshot,
  getOrCreateLiquidityPosition,
  getOrCreateUser,
  updateFactoryDaySnapshot,
  updatePairSnapshots,
  updateTokenDaySnapshots
} from '../functions'
import { handleMint } from '../mint'
import { handleSwap, updateApr } from '../swap'
import { createLiquidityPositions, handleTransferMintBurn as handleTransfer } from '../transfer'
import { updateLiquidity, updateTvlAndTokenPrices, updateVolume } from '../update-price-tvl-volume'

export function onSync(event: SyncEvent): void {
  updateTvlAndTokenPrices(event)
}

export function onTransfer(event: TransferEvent): void {
  getOrCreateUser(event.params.to)
  getOrCreateUser(event.params.from)
  updateLiquidity(event)
  handleTransfer(event)
  createLiquidityPositions(event)
}

export function onSwap(event: SwapEvent): void {
  const volume = updateVolume(event)
  handleSwap(event, volume.volumeUSD)
  updateFactoryDaySnapshot(event, volume)
  updateTokenDaySnapshots(event.block.timestamp, event.address, volume)
  updatePairSnapshots(event.block.timestamp, event.address, volume)
  updateApr(event)
}

export function onMint(event: MintEvent): void {
  let mint = handleMint(event)
  if (mint !== null) {
    const liquidityPosition = getOrCreateLiquidityPosition(Address.fromString(mint.to), event.address, event.block)
    createLiquidityPositionSnapshot(liquidityPosition, event.block)
    updateTokenDaySnapshots(event.block.timestamp, event.address)
    updatePairSnapshots(event.block.timestamp, event.address)
  }
}

export function onBurn(event: BurnEvent): void {
  let burn = handleBurn(event)
  if (burn.sender) {
    const liquidityPosition = getOrCreateLiquidityPosition(Address.fromString(burn.sender!), event.address, event.block)
    createLiquidityPositionSnapshot(liquidityPosition, event.block)
  }
  updateTokenDaySnapshots(event.block.timestamp, event.address)
  updatePairSnapshots(event.block.timestamp, event.address)
}
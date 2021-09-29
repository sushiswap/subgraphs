import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Collect as CollectEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync as SyncEvent,
} from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'

import { getOrCreateConcentratedLiquidityPool } from '../functions'

export function onMint(event: MintEvent): void {
  log.debug('[ConcentratedLiquidity] onMint...', [])

  const pool = getOrCreateConcentratedLiquidityPool(event.address)
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

  pool.save()
}

export function onBurn(event: BurnEvent): void {
  log.debug('[ConcentratedLiquidity] onBurn...', [])

  const pool = getOrCreateConcentratedLiquidityPool(event.address)
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

  pool.save()
}

export function onSwap(event: SwapEvent): void {
  log.debug('[ConcentratedLiquidity] onSwap...', [])

  const pool = getOrCreateConcentratedLiquidityPool(event.address)
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

  pool.save()
}

export function onCollect(event: CollectEvent): void {
  log.debug('[ConcentratedLiquidity] onCollect...', [])

  const pool = getOrCreateConcentratedLiquidityPool(event.address)
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

  pool.save()
}

export function onSync(event: SyncEvent): void {
  log.debug('[ConcentratedLiquidity] onSync...', [])

  const pool = getOrCreateConcentratedLiquidityPool(event.address)
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

  pool.save()
}

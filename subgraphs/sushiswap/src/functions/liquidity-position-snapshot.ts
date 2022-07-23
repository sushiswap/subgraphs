import { ethereum } from '@graphprotocol/graph-ts'
import { getOrCreateBundle, getPair } from '.'
import { LiquidityPosition, LiquidityPositionSnapshot } from '../../generated/schema'
import { getPairKpi } from './pair-kpi'
import { getTokenPrice } from './token-price'

export function createLiquidityPositionSnapshot(position: LiquidityPosition, block: ethereum.Block): void {
  const timestamp = block.timestamp.toI32()

  const id = position.id.concat('-').concat(timestamp.toString())

  const bundle = getOrCreateBundle()
  const pair = getPair(position.pair)
  const pairKpi = getPairKpi(position.pair)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const snapshot = new LiquidityPositionSnapshot(id)

  snapshot.timestamp = timestamp
  snapshot.block = block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0Price.derivedNative.times(bundle.nativePrice)
  snapshot.token1PriceUSD = token1Price.derivedNative.times(bundle.nativePrice)
  snapshot.reserve0 = pairKpi.reserve0
  snapshot.reserve1 = pairKpi.reserve1
  snapshot.reserveUSD = pairKpi.liquidityUSD
  snapshot.liquidityTokenTotalSupply = pairKpi.liquidity
  snapshot.liquidityTokenBalance = position.balance
  snapshot.liquidityPosition = position.id
  snapshot.save()
}

import { ethereum } from '@graphprotocol/graph-ts'
import { getOrCreateBundle, getPair } from '.'
import { LiquidityPosition, LiquidityPositionSnapshot } from '../../generated/schema'
import { BIG_INT_ONE } from '../constants'
import { getTokenPrice } from './token-price'
import { getUserKpi } from './user-kpi'

export function createLiquidityPositionSnapshot(position: LiquidityPosition, block: ethereum.Block): void {
  const timestamp = block.timestamp.toI32()

  const userKpi = getUserKpi(position.user)
  const id = position.id
    .concat('-')
    .concat(timestamp.toString())
    .concat('-')
    .concat(userKpi.lpSnapshotsCount.toString())

  const bundle = getOrCreateBundle()
  const pair = getPair(position.pair)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const snapshot = new LiquidityPositionSnapshot(id)

  snapshot.timestamp = timestamp
  snapshot.block = block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0Price.derivedNative.times(bundle.nativePrice)
  snapshot.token1PriceUSD = token1Price.derivedNative.times(bundle.nativePrice)
  snapshot.reserve0 = pair.reserve0
  snapshot.reserve1 = pair.reserve1
  snapshot.reserveUSD = pair.liquidityUSD
  snapshot.liquidityTokenTotalSupply = pair.liquidity
  snapshot.liquidityTokenBalance = position.balance
  snapshot.liquidityPosition = position.id
  snapshot.save()

  userKpi.lpSnapshotsCount = userKpi.lpSnapshotsCount.plus(BIG_INT_ONE)
  userKpi.save()
}

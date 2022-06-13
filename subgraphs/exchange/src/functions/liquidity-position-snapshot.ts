import { Address, ethereum } from '@graphprotocol/graph-ts'
import { LiquidityPosition, LiquidityPositionSnapshot } from '../../generated/schema'
import { getOrCreateBundle, getOrCreatePair, getOrCreateToken } from '.'

export function createLiquidityPositionSnapshot(position: LiquidityPosition, block: ethereum.Block): void {
  const timestamp = block.timestamp.toI32()

  const id = position.id.concat('-').concat(timestamp.toString())

  const bundle = getOrCreateBundle()

  const pair = getOrCreatePair(Address.fromString(position.pair), block)

  const token0 = getOrCreateToken(pair.token0)

  const token1 = getOrCreateToken(pair.token1)

  const snapshot = new LiquidityPositionSnapshot(id)

  snapshot.timestamp = timestamp
  snapshot.block = block.number.toI32()
  snapshot.user = position.user
  snapshot.pair = position.pair
  snapshot.token0PriceUSD = token0.derivedETH.times(bundle.ethPrice)
  snapshot.token1PriceUSD = token1.derivedETH.times(bundle.ethPrice)
  snapshot.reserve0 = pair.reserve0
  snapshot.reserve1 = pair.reserve1
  snapshot.reserveUSD = pair.reserveUSD
  snapshot.liquidityTokenTotalSupply = pair.totalSupply
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance
  snapshot.liquidityPosition = position.id
  snapshot.save()
}

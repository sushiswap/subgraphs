import { PairCreated } from '../../generated/Factory/Factory'
import { Pair } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, LEGACY, PairType, SWAP_FEE, TWAP_ENABLED } from '../constants'
import { getOrCreateFactory } from './factory'
import { getOrCreateToken, isBlacklistedToken } from './token'
import { createTokenPair } from './token-pair'
import { createWhitelistedTokenPairs } from './whitelisted-token-pair'

export function createPair(event: PairCreated): Pair | null {
  const id = event.params.pair.toHex()

  let token0 = getOrCreateToken(event.params.token0.toHex())
  let token1 = getOrCreateToken(event.params.token1.toHex())


  if (isBlacklistedToken(token0.id) || isBlacklistedToken(token1.id)) {
    return null
  }

  const pair = new Pair(id)

  createTokenPair(token0.id, id)
  createTokenPair(token1.id, id)
  createWhitelistedTokenPairs(token0.id, token1.id, id)

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.type = PairType.CONSTANT_PRODUCT_POOL
  pair.swapFee = SWAP_FEE
  pair.twapEnabled = TWAP_ENABLED
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.source = LEGACY

  pair.createdAtTimestamp = event.block.timestamp
  pair.createdAtBlock = event.block.number

  pair.reserve0 = BIG_INT_ZERO
  pair.reserve1 = BIG_INT_ZERO
  pair.token0Price = BIG_DECIMAL_ZERO
  pair.token1Price = BIG_DECIMAL_ZERO
  pair.liquidity = BIG_INT_ZERO
  pair.trackedLiquidityNative = BIG_DECIMAL_ZERO
  pair.liquidityNative = BIG_DECIMAL_ZERO
  pair.liquidityUSD = BIG_DECIMAL_ZERO
  pair.volumeNative = BIG_DECIMAL_ZERO
  pair.volumeUSD = BIG_DECIMAL_ZERO
  pair.volumeToken0 = BIG_DECIMAL_ZERO
  pair.volumeToken1 = BIG_DECIMAL_ZERO
  pair.feesNative = BIG_DECIMAL_ZERO
  pair.feesUSD = BIG_DECIMAL_ZERO
  pair.apr = BIG_DECIMAL_ZERO
  pair.aprUpdatedAtTimestamp = BIG_INT_ZERO
  pair.txCount = BIG_INT_ZERO

  pair.save()

  const factory = getOrCreateFactory()
  factory.pairCount = factory.pairCount.plus(BIG_INT_ONE)
  factory.save()

  // create the tracked contract based on the template
  PairTemplate.create(event.params.pair)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}

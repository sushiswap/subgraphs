import { BigDecimal } from '@graphprotocol/graph-ts'
import { convertTokenToDecimal, getOrCreateBundle, getOrCreateFactory, getOrCreateToken, getTokenPrice } from '../functions'
import { Bundle, Factory, Pair, Token } from '../../generated/schema'
import { AmountType, getAdjustedAmounts } from './pricing'
import { PairType } from '../constants'
/**
 * Updates all dervived TVL values. This includes all ETH and USD
 * TVL metrics for a given pool, as well as in the aggregate factory.
 *
 * NOTE: tokens locked should be updated before this function is called,
 * as this logic starts its calculations based on TVL for token0 and token1
 * in the pool.
 *
 * This function should be used whenever the TVL of tokens changes within a pool.
 * Aka: mint, burn, swap, collect
 *
 * @param pair
 * @param factory
 * @param oldPairLiquidityNative
 */
export function updateDerivedTVLAmounts(
  pair: Pair,
  oldPairLiquidityNative: BigDecimal,
): void {
  const bundle = getOrCreateBundle()
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)
  const factory = getOrCreateFactory(PairType.CONCENTRATED_LIQUIDITY_POOL)

  // Update token TVL values.
  token0.liquidityUSD = token0.liquidityUSD.times(token0Price.derivedNative.times(bundle.nativePrice))
  token1.liquidityUSD = token1.liquidityUSD.times(token1Price.derivedNative.times(bundle.nativePrice))

  const reserve0Decimals = convertTokenToDecimal(pair.reserve0, token0.decimals)
  const reserve1Decimals = convertTokenToDecimal(pair.reserve1, token1.decimals)
  // Get tracked and untracked amounts based on tokens in pool.
  let amounts: AmountType = getAdjustedAmounts(
    reserve0Decimals,
    token0 as Token,
    reserve1Decimals,
    token1 as Token
  )

  // Update pool TVL values.
  pair.liquidityNative = amounts.eth
  pair.liquidityUSD = amounts.usd
//   pair.totalValueLockedETHUntracked = amounts.ethUntracked
//   pair.totalValueLockedUSDUntracked = amounts.usdUntracked

  /**
   * ----- RESET ------
   * We need to reset factory values before updating with new amounts.
   */
  factory.liquidityNative = factory.liquidityNative.minus(oldPairLiquidityNative)
  factory.liquidityUSD = factory.liquidityUSD.minus(oldPairLiquidityNative)

  // Add new TVL based on pool.
  factory.liquidityNative = factory.liquidityNative.plus(amounts.eth)
//   factory.totalValueLockedETHUntracked = factory.totalValueLockedETHUntracked.plus(amounts.ethUntracked)
  factory.liquidityUSD = factory.liquidityNative.times(bundle.nativePrice)
//   factory.totalValueLockedUSDUntracked = factory.totalValueLockedETHUntracked.times(bundle.ethPriceUSD)

  // Save entities.
  token0.save()
  token1.save()
  factory.save()
  pair.save()
}

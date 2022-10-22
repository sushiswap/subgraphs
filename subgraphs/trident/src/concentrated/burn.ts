import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { getConcentratedLiquidityInfo } from '../functions'
import { Burn, Mint } from '../../generated/schema'
import { Burn as BurnEvent } from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, PairType } from '../constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateFactory,
  getOrCreateToken, getOrCreateTransaction, getPair,
  getTokenPrice,
  increaseFactoryTransactionCount
} from '../functions'
import { updateDerivedTVLAmounts } from './tvl'

export function handleBurn(event: BurnEvent): Burn | null {

  getOrCreateTransaction(event)
  
  const pair = getPair(event.address.toHex())

  const id = event.transaction.hash.toHex().concat('-cl-').concat(pair.txCount.toString().toString())

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const concentratedLiquidity = getConcentratedLiquidityInfo(pair.id)
  
  // Update TVL values.
  let oldLiquidityNative = pair.liquidityNative
  token0.liquidity = token0.liquidity.minus(event.params.amount0)
  token1.liquidity = token1.liquidity.minus(event.params.amount1)
  pair.reserve0 = pair.reserve0.minus(event.params.amount0)
  pair.reserve1 = pair.reserve1.minus(event.params.amount1)
  updateDerivedTVLAmounts(pair, oldLiquidityNative)
  
  // TODO: update cl events?
  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  // if (
  //   concentratedLiquidity.tick !== null &&
  //   BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
  //   BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  // ) {
  //   pool.liquidity = pool.liquidity.plus(event.params.amount)
  // }



  // get new amounts of USD and ETH for tracking
  const bundle = getOrCreateBundle()
  const amountTotalUSD = token1Price.derivedNative
    .times(amount1)
    .plus(token0Price.derivedNative.times(amount0))
    .times(bundle.nativePrice)

  let burn = Burn.load(id)
  if (burn === null) {
    burn = new Burn(id)
    burn.transaction = event.transaction.hash.toHex()
    burn.timestamp = event.block.timestamp
    burn.pair = event.address.toHex()
    burn.liquidity = BIG_DECIMAL_ZERO // must be set to be compatible with current schema
    burn.complete = true
    // burn.to = // If we want to track this, we need to add it to the event.

    burn.amount0 = amount0 as BigDecimal
    burn.amount1 = amount1 as BigDecimal
    burn.logIndex = event.logIndex
    burn.amountUSD = amountTotalUSD as BigDecimal
    burn.save()
  }

  pair.txCount = pair.txCount.plus(BIG_INT_ONE)
  pair.save()
  token0.txCount = token0.txCount.plus(BIG_INT_ONE)
  token0.save()
  token1.txCount = token1.txCount.plus(BIG_INT_ONE)
  token1.save()

  increaseFactoryTransactionCount(PairType.CONCENTRATED_LIQUIDITY_POOL)
  return burn
}

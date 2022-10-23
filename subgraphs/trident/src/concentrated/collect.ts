import { Collect } from '../../generated/schema'
import { Collect as CollectEvent } from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { BIG_INT_ONE, PairType } from '../constants'
import {
  convertTokenToDecimal, getConcentratedLiquidityInfo, getOrCreateBundle, getOrCreateToken, getOrCreateTransaction, getPair,
  getTokenPrice,
  increaseFactoryTransactionCount
} from '../functions'
import { getAdjustedAmounts } from './pricing'
import { updateDerivedTVLAmounts } from './tvl'

export function handleCollect(event: CollectEvent): Collect | null {

  getOrCreateTransaction(event)

  const pair = getPair(event.address.toHex())

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const oldReserve0 = convertTokenToDecimal(pair.reserve0, token0.decimals)
  const oldReserve1 = convertTokenToDecimal(pair.reserve1, token1.decimals)
  const amounts = getAdjustedAmounts(
    oldReserve0,
    token0,
    oldReserve1,
    token1
  )
  const concentratedLiquidity = getConcentratedLiquidityInfo(pair.id)

  // Update TVL values.
  let oldLiquidityNative = pair.liquidityNative
  token0.liquidity = token0.liquidity.minus(event.params.amount0)
  token1.liquidity = token1.liquidity.minus(event.params.amount1)
  pair.reserve0 = pair.reserve0.minus(event.params.amount0)
  pair.reserve1 = pair.reserve1.minus(event.params.amount1)
  updateDerivedTVLAmounts(pair, oldLiquidityNative)

  // TODO: save collected fees for token 0 and 1? save on concentratedLiquidityInfo?
  pair.feesUSD = pair.feesUSD.plus(amounts.native)

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

    const id = event.transaction.hash.toHex().concat('-cl-').concat(event.logIndex.toString())
  let collect = Collect.load(id)
  if (collect === null) {
    collect = new Collect(id)
    collect.transaction = event.transaction.hash.toHex()
    collect.timestamp = event.block.timestamp
    collect.pair = event.address.toHex()
    // collect.owner = // If we want to track this, we need to add it to the event. Currently only sender?

    collect.amount0 = amount0
    collect.amount1 = amount1
    collect.amountUSD = amountTotalUSD
    // TODO: update event, add ticks?
    collect.logIndex = event.logIndex
    collect.save()
  }


  pair.txCount = pair.txCount.plus(BIG_INT_ONE)
  pair.save()
  token0.txCount = token0.txCount.plus(BIG_INT_ONE)
  token0.save()
  token1.txCount = token1.txCount.plus(BIG_INT_ONE)
  token1.save()

  increaseFactoryTransactionCount(PairType.CONCENTRATED_LIQUIDITY_POOL)
  return collect
}

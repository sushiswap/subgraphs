import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { TokenPrice } from '../generated/schema'
import { Swap as SwapEvent, Sync as SyncEvent, Transfer as TransferEvent } from '../generated/templates/Pair/Pair'
import {
  BIG_DECIMAL_ZERO, BIG_INT_ZERO,
  MINIMUM_USD_THRESHOLD_NEW_PAIRS,
  WHITELISTED_TOKEN_ADDRESSES
} from './constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateToken,
  getPair,
  getTokenPrice,
  isBlacklistedToken
} from './functions'
import { getOrCreateFactory } from './functions/factory'
import { getNativePriceInUSD, updateTokenPrice } from './pricing'
import { isBurn, isInitialTransfer, isMint } from './transfer'


export function updateTvlAndTokenPrices(event: SyncEvent): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const factory = getOrCreateFactory()

  // Reset liquidity, will be updated again later when price is updated
  token0.liquidity = token0.liquidity.minus(pair.reserve0)
  token1.liquidity = token1.liquidity.minus(pair.reserve1)
  token0.save()
  token1.save()

  factory.liquidityNative = factory.liquidityNative.minus(pair.trackedLiquidityNative)

  // before updating reserve, set product of current reserves for the first transaction for every block, used to detect sandwich attacks
  if (pair._kUpdatedAtBlock) {
    if (!pair._kUpdatedAtBlock!.equals(event.block.number)) {
    pair._k = pair.reserve1.gt(BIG_INT_ZERO) ? pair.reserve0.divDecimal(pair.reserve1.toBigDecimal()) : BIG_DECIMAL_ZERO
    pair._cache_reserve0 = pair.reserve0
    pair._cache_reserve1 = pair.reserve1
    pair._kUpdatedAtBlock = event.block.number
    }
  } else {
      pair._k = pair.reserve1.gt(BIG_INT_ZERO) ? pair.reserve0.divDecimal(pair.reserve1.toBigDecimal()) : BIG_DECIMAL_ZERO
      pair._kUpdatedAtBlock = event.block.number
      pair._cache_reserve0 = pair.reserve0
      pair._cache_reserve1 = pair.reserve1
  }

  pair.reserve0 = event.params.reserve0
  pair.reserve1 = event.params.reserve1
  const reserve0Decimals = convertTokenToDecimal(pair.reserve0, token0.decimals)
  const reserve1Decimals = convertTokenToDecimal(pair.reserve1, token1.decimals)

  if (pair.reserve1.notEqual(BIG_INT_ZERO)) {
    pair.token0Price = reserve0Decimals.div(reserve1Decimals)
  } else {
    pair.token0Price = BIG_DECIMAL_ZERO
  }

  if (pair.reserve0.notEqual(BIG_INT_ZERO)) {
    pair.token1Price = reserve1Decimals.div(reserve0Decimals)
  } else {
    pair.token1Price = BIG_DECIMAL_ZERO
  }
  pair.save()

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice, event.block.number)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice, event.block.number)


  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityNative: BigDecimal
  if (bundle.nativePrice.notEqual(BIG_DECIMAL_ZERO)) {
    trackedLiquidityNative = getLiquidityUSD(reserve0Decimals, token0Price, reserve1Decimals, token1Price).div(
      bundle.nativePrice
    )
  } else {
    trackedLiquidityNative = BIG_DECIMAL_ZERO
  }

  // Set token liquidity with updated prices
  token0.liquidity = token0.liquidity.plus(pair.reserve0)
  token0.liquidityNative = convertTokenToDecimal(token0.liquidity, token0.decimals).times(
    token0Price.derivedNative
  )
  token0.liquidityUSD = token0.liquidityNative.times(bundle.nativePrice)

  token1.liquidity = token1.liquidity.plus(pair.reserve1)
  token1.liquidityNative = convertTokenToDecimal(token1.liquidity, token1.decimals).times(
    token1Price.derivedNative
  )
  token1.liquidityUSD = token1.liquidityNative.times(bundle.nativePrice)
  token0.save()
  token1.save()

  pair.trackedLiquidityNative = trackedLiquidityNative
  pair.liquidityNative = reserve0Decimals
    .times(token0Price.derivedNative)
    .plus(reserve1Decimals.times(token1Price.derivedNative))

  pair.liquidityUSD = pair.liquidityNative.times(bundle.nativePrice)
  pair.save()

  factory.liquidityNative = factory.liquidityNative.plus(trackedLiquidityNative)
  factory.liquidityUSD = factory.liquidityNative.times(bundle.nativePrice)
  factory.save()
}

export function updateVolume(event: SwapEvent): Volume {
  const pair = getPair(event.address.toHex())
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
  const amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
  const amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
  const amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)
  const amount0Total = amount0Out.plus(amount0In)
  const amount1Total = amount1Out.plus(amount1In)

  const volumeUSD = getVolumeUSD(amount0Total, amount1Total, pair.id)
  const bundle = getOrCreateBundle()
  let volumeNative: BigDecimal

  if (bundle.nativePrice.equals(BIG_DECIMAL_ZERO)) {
    volumeNative = BIG_DECIMAL_ZERO
  } else {
    volumeNative = volumeUSD.div(bundle.nativePrice)
  }

  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = volumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

  token0.volume = token0.volume.plus(amount0Total)
  token0.volumeNative = token0.volumeNative.plus(volumeNative)
  token0.volumeUSD = token0.volumeUSD.plus(volumeUSD)
  token0.feesNative = token0.feesNative.plus(feesNative)
  token0.feesUSD = token0.feesUSD.plus(feesUSD)
  token0.save()

  token1.volume = token1.volume.plus(amount1Total)
  token1.volumeNative = token1.volumeNative.plus(volumeNative)
  token1.volumeUSD = token1.volumeUSD.plus(volumeUSD)
  token1.feesNative = token1.feesNative.plus(feesNative)
  token1.feesUSD = token1.feesUSD.plus(feesUSD)
  token1.save()

  pair.volumeNative = pair.volumeNative.plus(volumeNative)
  pair.volumeUSD = pair.volumeUSD.plus(volumeUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amount0Total)
  pair.volumeToken1 = pair.volumeToken1.plus(amount1Total)
  pair.feesNative = pair.feesNative.plus(feesNative)
  pair.feesUSD = pair.feesUSD.plus(feesUSD)
  pair.save()

  // Don't track volume for these tokens in total exchange volume
  if (!isBlacklistedToken(token0.id) && !isBlacklistedToken(token1.id)) {
    const factory = getOrCreateFactory()
    factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)
    factory.volumeNative = factory.volumeNative.plus(volumeNative)
    factory.feesNative = factory.feesNative.plus(feesNative)
    factory.feesUSD = factory.feesUSD.plus(feesUSD)
    factory.save()
  }

  return {
    volumeUSD,
    volumeNative,
    feesNative,
    feesUSD,
    amount0Total,
    amount1Total
  }
}

export function updateLiquidity(event: TransferEvent): void {
  if (isInitialTransfer(event)) {
    return
  }

  const pair = getPair(event.address.toHex())

  if (isMint(event)) {
    pair.liquidity = pair.liquidity.plus(event.params.value)
  }

  if (isBurn(event)) {
    pair.liquidity = pair.liquidity.minus(event.params.value)
  }

  pair.save()
}

/**
 * Accepts tokens and amounts, return tracked amount based on if the token is priced
 * If one token is priced, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getVolumeUSD(
  tokenAmount0: BigDecimal,
  tokenAmount1: BigDecimal,
  pairAddress: string
): BigDecimal {
  const bundle = getOrCreateBundle()

  const pair = getPair(pairAddress)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  // both tokens are priced, take average of both amounts
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // take full value of the priced token
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && !token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the priced token
  if (!token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount1.times(price1)
  }


  // neither token is priced, tracked volume is 0
  return BIG_DECIMAL_ZERO
}

/**
 * Accepts tokens and amounts, return tracked amount based on if the token is priced
 * If one token is priced, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0Price: TokenPrice,
  tokenAmount1: BigDecimal,
  token1Price: TokenPrice
): BigDecimal {
  const bundle = getOrCreateBundle()
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  // both tokens are priced, take average of both amounts
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take full value of the priced token
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && !token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take full value of the priced token
  if (!token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }


  // neither token is priced, tracked liqudity is 0
  return BIG_DECIMAL_ZERO
}



export class Volume {
  volumeUSD: BigDecimal
  volumeNative: BigDecimal
  feesNative: BigDecimal
  feesUSD: BigDecimal
  amount0Total: BigDecimal
  amount1Total: BigDecimal
}
import { BigDecimal } from '@graphprotocol/graph-ts'
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
  const currentToken0Price = getTokenPrice(pair.token0)
  const currentToken1Price = getTokenPrice(pair.token1)
  const bundle = getOrCreateBundle()
  const factory = getOrCreateFactory()

  // Reset liquidity, will be updated again later when price is updated
  token0.liquidity = token0.liquidity.minus(pair.reserve0)
  token1.liquidity = token1.liquidity.minus(pair.reserve1)
  const token0LiquidityNative = convertTokenToDecimal(pair.reserve0, token0.decimals).times(
    currentToken0Price.derivedNative
  )
  const token1LiquidityNative = convertTokenToDecimal(pair.reserve1, token1.decimals).times(
    currentToken1Price.derivedNative
  )
  token0.liquidityNative = token0.liquidityNative.minus(token0LiquidityNative)
  token1.liquidityNative = token1.liquidityNative.minus(token1LiquidityNative)
  token0.liquidityUSD = token0.liquidityUSD.minus(token0LiquidityNative.times(bundle.nativePrice))
  token1.liquidityUSD = token1.liquidityUSD.minus(token1LiquidityNative.times(bundle.nativePrice))
  factory.liquidityNative = factory.liquidityNative.minus(pair.liquidityNative)

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

  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)

  // get tracked liquidity - will be 0 if neither is in whitelist
  let liquidityNative: BigDecimal
  if (bundle.nativePrice.notEqual(BIG_DECIMAL_ZERO)) {
    liquidityNative = getTrackedLiquidityUSD(reserve0Decimals, token0Price, reserve1Decimals, token1Price).div(
      bundle.nativePrice
    )
  } else {
    liquidityNative = BIG_DECIMAL_ZERO
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

  pair.liquidityNative = reserve0Decimals
    .times(token0Price.derivedNative)
    .plus(reserve1Decimals.times(token1Price.derivedNative))

  pair.liquidityUSD = pair.liquidityNative.times(bundle.nativePrice)
  pair.save()

  factory.liquidityNative = factory.liquidityNative.plus(liquidityNative)
  factory.liquidityUSD = factory.liquidityNative.times(bundle.nativePrice)
  factory.save()
}

export function updateVolume(event: SwapEvent): Volume {
  const pair = getPair(event.address.toHex())
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
  const amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
  const amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
  const amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)
  const amount0Total = amount0Out.plus(amount0In)
  const amount1Total = amount1Out.plus(amount1In)

  const trackedVolumeUSD = getTrackedVolumeUSD(amount0Total, amount1Total, pair.id)
  const bundle = getOrCreateBundle()
  const volumeNative = token0Price.derivedNative
    .times(amount1Total)
    .plus(token1Price.derivedNative.times(amount0Total))
    .div(BigDecimal.fromString('2'))
  const untrackedVolumeUSD = volumeNative.times(bundle.nativePrice)
  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = trackedVolumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))


  token0.volume = token0.volume.plus(amount0Total)
  token0.volumeNative = token0.volumeNative.plus(volumeNative)
  token0.volumeUSD = token0.volumeUSD.plus(trackedVolumeUSD)
  token0.untrackedVolumeUSD = token0.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  token0.feesNative = token0.feesNative.plus(feesNative)
  token0.feesUSD = token0.feesUSD.plus(feesUSD)
  token0.save()

  token1.volume = token1.volume.plus(amount1Total)
  token1.volumeNative = token1.volumeNative.plus(volumeNative)
  token1.volumeUSD = token1.volumeUSD.plus(trackedVolumeUSD)
  token1.untrackedVolumeUSD = token1.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  token1.feesNative = token1.feesNative.plus(feesNative)
  token1.feesUSD = token1.feesUSD.plus(feesUSD)
  token1.save()

  pair.volumeNative = pair.volumeNative.plus(volumeNative)
  pair.volumeUSD = pair.volumeUSD.plus(trackedVolumeUSD)
  pair.untrackedVolumeUSD = pair.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amount0Total)
  pair.volumeToken1 = pair.volumeToken1.plus(amount1Total)
  pair.feesNative = pair.feesNative.plus(feesNative)
  pair.feesUSD = pair.feesUSD.plus(feesUSD)
  pair.save()

  // Don't track volume for these tokens in total exchange volume
  if (!isBlacklistedToken(token0.id) && !isBlacklistedToken(token1.id)) {
    const factory = getOrCreateFactory()
    factory.volumeUSD = factory.volumeUSD.plus(trackedVolumeUSD)
    factory.volumeNative = factory.volumeNative.plus(volumeNative)
    factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(untrackedVolumeUSD)
    factory.feesNative = factory.feesNative.plus(feesNative)
    factory.feesUSD = factory.feesUSD.plus(feesUSD)
    factory.save()
  }

  return {
    volumeUSD: trackedVolumeUSD != BIG_DECIMAL_ZERO ? trackedVolumeUSD : untrackedVolumeUSD,
    volumeNative,
    untrackedVolumeUSD,
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
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  tokenAmount1: BigDecimal,
  pairAddress: string
): BigDecimal {
  const bundle = getOrCreateBundle()

  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  const reserve0USD = convertTokenToDecimal(pair.reserve0, token0.decimals).times(price0)
  const reserve1USD = convertTokenToDecimal(pair.reserve1, token1.decimals).times(price1)
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
      return BIG_DECIMAL_ZERO
    }
  }
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && !WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
      return BIG_DECIMAL_ZERO
    }
  }
  if (!WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
      return BIG_DECIMAL_ZERO
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && !WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELISTED_TOKEN_ADDRESSES.includes(token0.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0Price: TokenPrice,
  tokenAmount1: BigDecimal,
  token1Price: TokenPrice
): BigDecimal {
  const bundle = getOrCreateBundle()
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && !WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO
}



export class Volume {
  volumeUSD: BigDecimal
  volumeNative: BigDecimal
  untrackedVolumeUSD: BigDecimal
  feesNative: BigDecimal
  feesUSD: BigDecimal
  amount0Total: BigDecimal
  amount1Total: BigDecimal
}
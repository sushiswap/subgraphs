import { BigDecimal } from '@graphprotocol/graph-ts'
import { TokenPrice } from '../generated/schema'
import {
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent
} from '../generated/templates/ConstantProductPool/ConstantProductPool'
import {
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  PairType,
  MINIMUM_USD_THRESHOLD_NEW_PAIRS,
  WHITELISTED_TOKEN_ADDRESSES
} from './constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateFactory,
  getOrCreateToken,
  getPair,
  getRebase,
  getTokenPrice,
  toElastic
} from './functions'
import { getNativePriceInUSD, updateTokenPrice } from './pricing'
import { isBurn, isInitialTransfer, isMint } from './transfer'

export function updateTvlAndTokenPrices(event: SyncEvent): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const factory = getOrCreateFactory(PairType.CONSTANT_PRODUCT_POOL)

  // Reset token liquidity, will be updated again later when price is updated
  token0.liquidity = token0.liquidity.minus(pair.reserve0)
  token1.liquidity = token1.liquidity.minus(pair.reserve1)
  token0.save()
  token1.save()
  factory.liquidityNative = factory.liquidityNative.minus(pair.trackedLiquidityNative)

  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)

  const reserve0 = toElastic(rebase0, event.params.reserve0, false)
  const reserve1 = toElastic(rebase1, event.params.reserve1, false)

  pair.reserve0 = reserve0
  pair.reserve1 = reserve1
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

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)


  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityNative: BigDecimal
  if (bundle.nativePrice.notEqual(BIG_DECIMAL_ZERO)) {
    trackedLiquidityNative = getTrackedLiquidityUSD(reserve0Decimals, token0Price, reserve1Decimals, token1Price).div(
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
  pair.liquidityNative = convertTokenToDecimal(pair.reserve0, token0.decimals)
    .times(token0Price.derivedNative)
    .plus(convertTokenToDecimal(pair.reserve1, token1.decimals).times(token1Price.derivedNative))

  pair.liquidityUSD = pair.liquidityNative.times(bundle.nativePrice)
  pair.save()

  factory.liquidityNative = factory.liquidityNative.plus(trackedLiquidityNative)
  factory.liquidityUSD = factory.liquidityNative.times(bundle.nativePrice)
  factory.save()

}

export function updateVolume(event: SwapEvent): Volume {
  const pair = getPair(event.address.toHex())
  const tokenIn = getOrCreateToken(event.params.tokenIn.toHex())
  const tokenOut = getOrCreateToken(event.params.tokenOut.toHex())
  const amountIn = convertTokenToDecimal(event.params.amountIn, tokenIn.decimals)
  const amountOut = convertTokenToDecimal(event.params.amountOut, tokenOut.decimals)

  const isFirstToken = pair.token0 == event.params.tokenIn.toHex()
  const trackedVolumeUSD = getTrackedVolumeUSD(amountIn, amountOut, pair.id, isFirstToken)
  const bundle = getOrCreateBundle()

  let volumeNative: BigDecimal

  if (bundle.nativePrice.equals(BIG_DECIMAL_ZERO)) {
    volumeNative = BIG_DECIMAL_ZERO
  } else {
    volumeNative = trackedVolumeUSD.div(bundle.nativePrice)
  }


  const untrackedVolumeUSD = volumeNative.times(bundle.nativePrice)
  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = trackedVolumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

  tokenIn.volume = tokenIn.volume.plus(amountIn)
  tokenIn.volumeNative = tokenIn.volumeNative.plus(volumeNative)
  tokenIn.volumeUSD = tokenIn.volumeUSD.plus(trackedVolumeUSD)
  tokenIn.untrackedVolumeUSD = tokenIn.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  tokenIn.feesNative = tokenIn.feesNative.plus(feesNative)
  tokenIn.feesUSD = tokenIn.feesUSD.plus(feesUSD)
  tokenIn.save()

  tokenOut.volume = tokenOut.volume.plus(amountOut)
  tokenOut.volumeNative = tokenOut.volumeNative.plus(volumeNative)
  tokenOut.volumeUSD = tokenOut.volumeUSD.plus(trackedVolumeUSD)
  tokenOut.untrackedVolumeUSD = tokenOut.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  tokenOut.feesNative = tokenOut.feesNative.plus(feesNative)
  tokenOut.feesUSD = tokenOut.feesUSD.plus(feesUSD)
  tokenOut.save()


  pair.volumeNative = pair.volumeNative.plus(volumeNative)
  pair.volumeUSD = pair.volumeUSD.plus(trackedVolumeUSD)
  pair.untrackedVolumeUSD = pair.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amountIn)
  pair.volumeToken1 = pair.volumeToken1.plus(amountOut)
  pair.feesNative = pair.feesNative.plus(feesNative)
  pair.feesUSD = pair.feesUSD.plus(feesUSD)
  pair.save()

  const factory = getOrCreateFactory(PairType.CONSTANT_PRODUCT_POOL)
  factory.volumeUSD = factory.volumeUSD.plus(trackedVolumeUSD)
  factory.volumeNative = factory.volumeNative.plus(volumeNative)
  factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  factory.feesNative = factory.feesNative.plus(feesNative)
  factory.feesUSD = factory.feesUSD.plus(feesUSD)
  factory.save()

  return {
    volumeUSD: trackedVolumeUSD != BIG_DECIMAL_ZERO ? trackedVolumeUSD : untrackedVolumeUSD,
    volumeNative,
    untrackedVolumeUSD,
    feesNative,
    feesUSD,
    amount0Total: amountIn,
    amount1Total: amountOut
  }
}

export function updateLiquidity(event: TransferEvent): void {
  if (isInitialTransfer(event)) {
    return
  }
  const pair = getPair(event.address.toHex())

  if (isMint(event)) {
    pair.liquidity = pair.liquidity.plus(event.params.amount)
  }

  if (isBurn(event)) {
    pair.liquidity = pair.liquidity.minus(event.params.amount)
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
  pairAddress: string,
  isFirstToken: boolean
): BigDecimal {
  const bundle = getOrCreateBundle()

  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(isFirstToken ? pair.token0 : pair.token1)
  const token1 = getOrCreateToken(!isFirstToken ? pair.token0 : pair.token1)
  const token0Price = getTokenPrice(token0.id)
  const token1Price = getTokenPrice(token1.id)
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  const reserve0USD = convertTokenToDecimal(isFirstToken ? pair.reserve0 : pair.reserve1, token0.decimals).times(price0)
  const reserve1USD = convertTokenToDecimal(!isFirstToken ? pair.reserve0 : pair.reserve1, token1.decimals).times(price1)
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
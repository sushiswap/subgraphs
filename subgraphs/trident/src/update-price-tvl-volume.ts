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
  const volumeUSD = getVolumeUSD(amountIn, amountOut, pair.id, isFirstToken)
  const bundle = getOrCreateBundle()

  let volumeNative: BigDecimal

  if (bundle.nativePrice.equals(BIG_DECIMAL_ZERO)) {
    volumeNative = BIG_DECIMAL_ZERO
  } else {
    volumeNative = volumeUSD.div(bundle.nativePrice)
  }

  const fee = pair.swapFee.divDecimal(BigDecimal.fromString('10000')).times(BigDecimal.fromString('0.83333333333'))
  const feesNative = volumeNative.times(fee)
  const feesUSD = volumeUSD.times(fee)

  tokenIn.volume = tokenIn.volume.plus(amountIn)
  tokenIn.volumeNative = tokenIn.volumeNative.plus(volumeNative)
  tokenIn.volumeUSD = tokenIn.volumeUSD.plus(volumeUSD)
  tokenIn.feesNative = tokenIn.feesNative.plus(feesNative)
  tokenIn.feesUSD = tokenIn.feesUSD.plus(feesUSD)
  tokenIn.save()

  tokenOut.volume = tokenOut.volume.plus(amountOut)
  tokenOut.volumeNative = tokenOut.volumeNative.plus(volumeNative)
  tokenOut.volumeUSD = tokenOut.volumeUSD.plus(volumeUSD)
  tokenOut.feesNative = tokenOut.feesNative.plus(feesNative)
  tokenOut.feesUSD = tokenOut.feesUSD.plus(feesUSD)
  tokenOut.save()


  pair.volumeNative = pair.volumeNative.plus(volumeNative)
  pair.volumeUSD = pair.volumeUSD.plus(volumeUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amountIn)
  pair.volumeToken1 = pair.volumeToken1.plus(amountOut)
  pair.feesNative = pair.feesNative.plus(feesNative)
  pair.feesUSD = pair.feesUSD.plus(feesUSD)
  pair.save()

  const factory = getOrCreateFactory(PairType.CONSTANT_PRODUCT_POOL)
  factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)
  factory.volumeNative = factory.volumeNative.plus(volumeNative)
  factory.feesNative = factory.feesNative.plus(feesNative)
  factory.feesUSD = factory.feesUSD.plus(feesUSD)
  factory.save()

  return {
    volumeUSD,
    volumeNative,
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
 * Accepts tokens and amounts, return tracked amount based on if the token is priced
 * If one token is priced, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getVolumeUSD(
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


  // both tokens are priced, take average of both amounts
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString('2'))
  }

  // take full value of the priced token
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && !token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
    return tokenAmount0.times(price0)
  }

  // take full value of the priced token
  if (!token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
    return tokenAmount1.times(price1)
  }


  // neither token is priced, tracked volume is 0
  return BIG_DECIMAL_ZERO
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
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
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take full value of the priced token
  if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && !token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take full value of the priced token
  if (!token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO) ) {
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
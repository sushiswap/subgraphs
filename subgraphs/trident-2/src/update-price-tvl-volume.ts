import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent,
} from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO, BIG_INT_ZERO, FactoryType, MINIMUM_USD_THRESHOLD_NEW_PAIRS, WHITELISTED_TOKEN_ADDRESSES } from './constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateFactory,
  getOrCreateToken,
  getPair,
  getPairKpi,
  getRebase,
  getTokenKpi,
  getTokenPrice,
  toElastic,
} from './functions'
import { getNativePriceInUSD, updateTokenPrice } from './pricing'
import { TokenPrice } from '../generated/schema'
import { isBurn, isInitialTransfer, isMint } from './transfer'

export function updateTvlAndTokenPrices(event: SyncEvent): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Kpi = getTokenKpi(pair.token0)
  const token1Kpi = getTokenKpi(pair.token1)
  const currentToken0Price = getTokenPrice(pair.token0)
  const currentToken1Price = getTokenPrice(pair.token1)
  const bundle = getOrCreateBundle()

  // Reset token liquidity, will be updated again later when price is updated
  token0Kpi.liquidity = token0Kpi.liquidity.minus(pairKpi.reserve0)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(pairKpi.reserve1)
  const token0LiquidityNative = convertTokenToDecimal(pairKpi.reserve0, token0.decimals).times(
    currentToken0Price.derivedNative
  )
  const token1LiquidityNative = convertTokenToDecimal(pairKpi.reserve1, token1.decimals).times(
    currentToken1Price.derivedNative
  )
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.minus(token0LiquidityNative)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.minus(token1LiquidityNative)
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.minus(token0LiquidityNative.times(bundle.nativePrice))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.minus(token1LiquidityNative.times(bundle.nativePrice))

  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)

  const reserve0 = toElastic(rebase0, event.params.reserve0, false)
  const reserve1 = toElastic(rebase1, event.params.reserve1, false)

  pairKpi.reserve0 = reserve0
  pairKpi.reserve1 = reserve1

  if (pairKpi.reserve1.notEqual(BIG_INT_ZERO)) {
    pairKpi.token0Price = convertTokenToDecimal(pairKpi.reserve0, token0.decimals).div(
      convertTokenToDecimal(pairKpi.reserve1, token1.decimals)
    )
  } else {
    pairKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (pairKpi.reserve0.notEqual(BIG_INT_ZERO)) {
    pairKpi.token1Price = convertTokenToDecimal(pairKpi.reserve1, token1.decimals).div(
      convertTokenToDecimal(pairKpi.reserve0, token0.decimals)
    )
  } else {
    pairKpi.token1Price = BIG_DECIMAL_ZERO
  }

  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)

  // Set token liquidity with updated prices
  token0Kpi.liquidity = token0Kpi.liquidity.plus(pairKpi.reserve0)
  token0Kpi.liquidityNative = convertTokenToDecimal(token0Kpi.liquidity, token0.decimals).times(
    token0Price.derivedNative
  )
  token0Kpi.liquidityUSD = token0Kpi.liquidityNative.times(bundle.nativePrice)

  token1Kpi.liquidity = token1Kpi.liquidity.plus(pairKpi.reserve1)
  token1Kpi.liquidityNative = convertTokenToDecimal(token1Kpi.liquidity, token1.decimals).times(
    token1Price.derivedNative
  )
  token1Kpi.liquidityUSD = token1Kpi.liquidityNative.times(bundle.nativePrice)
  token0Kpi.save()
  token1Kpi.save()

  pairKpi.liquidityNative = convertTokenToDecimal(pairKpi.reserve0, token0.decimals)
    .times(token0Price.derivedNative)
    .plus(convertTokenToDecimal(pairKpi.reserve1, token1.decimals).times(token1Price.derivedNative))

  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()
}

export function updateVolume(event: SwapEvent): BigDecimal {
  const pair = getPair(event.address.toHex())
  const pairKpi = getPairKpi(event.address.toHex())
  const token0 = getOrCreateToken(event.params.tokenIn.toHex())
  const token1 = getOrCreateToken(event.params.tokenOut.toHex())
  const token0Price = getTokenPrice(token0.id)
  const token1Price = getTokenPrice(token1.id)
  const token0Kpi = getTokenKpi(token0.id)
  const token1Kpi = getTokenKpi(token1.id)
  
  const amount0Total = convertTokenToDecimal(event.params.amountIn, token0.decimals)
  const amount1Total = convertTokenToDecimal(event.params.amountOut, token1.decimals)

  const trackedVolumeUSD = getTrackedVolumeUSD(amount0Total, amount1Total, pair.id)
  const bundle = getOrCreateBundle()
  const volumeNative = token0Price.derivedNative
    .times(amount1Total)
    .plus(token1Price.derivedNative.times(amount0Total))
    .div(BigDecimal.fromString('2'))
  const untrackedVolumeUSD = volumeNative.times(bundle.nativePrice)

  token0Kpi.volume = token0Kpi.volume.plus(amount0Total)
  token0Kpi.volumeUSD = token0Kpi.volumeUSD.plus(trackedVolumeUSD)
  token0Kpi.untrackedVolumeUSD = token0Kpi.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  token0Kpi.save()

  token1Kpi.volume = token1Kpi.volume.plus(amount1Total)
  token1Kpi.volumeUSD = token1Kpi.volumeUSD.plus(trackedVolumeUSD)
  token1Kpi.untrackedVolumeUSD = token1Kpi.untrackedVolumeUSD.plus(untrackedVolumeUSD)

  token1Kpi.save()

  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = trackedVolumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

  pairKpi.volumeNative = pairKpi.volumeNative.plus(volumeNative)
  pairKpi.volumeUSD = pairKpi.volumeUSD.plus(trackedVolumeUSD)
  pairKpi.untrackedVolumeUSD = pairKpi.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  pairKpi.volumeToken0 = pairKpi.volumeToken0.plus(amount0Total)
  pairKpi.volumeToken1 = pairKpi.volumeToken1.plus(amount1Total)
  pairKpi.feesNative = pairKpi.feesNative.plus(feesNative)
  pairKpi.feesUSD = pairKpi.feesUSD.plus(feesUSD)
  pairKpi.save()

  const factory = getOrCreateFactory(FactoryType.CONSTANT_PRODUCT_POOL)
  factory.volumeUSD = factory.volumeUSD.plus(trackedVolumeUSD)
  factory.volumeNative = factory.volumeNative.plus(volumeNative)
  factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(untrackedVolumeUSD)
  factory.feesNative = factory.feesNative.plus(feesNative)
  factory.feesUSD = factory.feesUSD.plus(feesUSD)
  factory.save()

  return trackedVolumeUSD != BIG_DECIMAL_ZERO ? trackedVolumeUSD : untrackedVolumeUSD
}

export function updateLiquidity<T extends ethereum.Event>(event: T): void {
  if (event instanceof MintEvent) {
    const pairAddress = event.address.toHex()

    const pair = getPair(pairAddress)
    const token0 = getOrCreateToken(pair.token0)
    const token1 = getOrCreateToken(pair.token1)

    const token0Kpi = getTokenKpi(token0.id)
    token0Kpi.liquidity = token0Kpi.liquidity.plus(event.params.amount0)

    const token1Kpi = getTokenKpi(token1.id)
    token1Kpi.liquidity = token1Kpi.liquidity.plus(event.params.amount1)

    token0Kpi.save()
    token1Kpi.save()
  } else if (event instanceof BurnEvent) {
    const pairAddress = event.address.toHex()
    const pair = getPair(pairAddress)
    const token0 = getOrCreateToken(pair.token0)
    const token1 = getOrCreateToken(pair.token1)

    const token0Kpi = getTokenKpi(token0.id)
    token0Kpi.liquidity = token0Kpi.liquidity.minus(event.params.amount0)

    const token1Kpi = getTokenKpi(token1.id)
    token1Kpi.liquidity = token1Kpi.liquidity.minus(event.params.amount1)

    token0Kpi.save()
    token1Kpi.save()
  } else if (event instanceof TransferEvent) {
    if (isInitialTransfer(event)) {
      return
    }

    const pairAddress = event.address.toHex()
    const pairKpi = getPairKpi(pairAddress)

    if (isMint(event)) {
      pairKpi.liquidity = pairKpi.liquidity.plus(event.params.amount)
    }

    if (isBurn(event)) {
      pairKpi.liquidity = pairKpi.liquidity.minus(event.params.amount)
    }

    pairKpi.save()
  }
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
  const pairKpi = getPairKpi(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)
  const price0 = token0Price.derivedNative.times(bundle.nativePrice)
  const price1 = token1Price.derivedNative.times(bundle.nativePrice)

  const reserve0USD = convertTokenToDecimal(pairKpi.reserve0, token0.decimals).times(price0)
  const reserve1USD = convertTokenToDecimal(pairKpi.reserve1, token1.decimals).times(price1)
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

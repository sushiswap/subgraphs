import { BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { TokenPrice } from '../generated/schema'
import {
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent,
} from '../generated/templates/ConstantProductPool/ConstantProductPool'
import {
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  FactoryType,
  MINIMUM_USD_THRESHOLD_NEW_PAIRS,
  WHITELISTED_TOKEN_ADDRESSES,
} from './constants'
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
  const tokenIn = getOrCreateToken(event.params.tokenIn.toHex())
  const tokenOut = getOrCreateToken(event.params.tokenOut.toHex())
  const tokenInPrice = getTokenPrice(tokenIn.id)
  const tokenOutPrice = getTokenPrice(tokenOut.id)
  const tokenInKpi = getTokenKpi(tokenIn.id)
  const tokenOutKpi = getTokenKpi(tokenOut.id)

  const amountIn = convertTokenToDecimal(event.params.amountIn, tokenIn.decimals)
  const amountOut = convertTokenToDecimal(event.params.amountOut, tokenOut.decimals)

  const volumeNative = amountIn.times(tokenInPrice.derivedNative).plus(amountOut.times(tokenOutPrice.derivedNative))
  const bundle = getOrCreateBundle()

  const volumeUSD = volumeNative.times(bundle.nativePrice)

  tokenInKpi.volume = tokenInKpi.volume.plus(amountIn)
  tokenInKpi.volumeUSD = tokenInKpi.volumeUSD.plus(volumeUSD)
  tokenInKpi.save()

  tokenOutKpi.volume = tokenOutKpi.volume.plus(amountOut)
  tokenOutKpi.volumeUSD = tokenOutKpi.volumeUSD.plus(volumeUSD)

  tokenOutKpi.save()

  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = volumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

  pairKpi.volumeNative = pairKpi.volumeNative.plus(volumeNative)
  pairKpi.volumeUSD = pairKpi.volumeUSD.plus(volumeUSD)
  pairKpi.volumeToken0 = pairKpi.volumeToken0.plus(amountIn)
  pairKpi.volumeToken1 = pairKpi.volumeToken1.plus(amountOut)
  pairKpi.feesNative = pairKpi.feesNative.plus(feesNative)
  pairKpi.feesUSD = pairKpi.feesUSD.plus(feesUSD)
  pairKpi.save()

  const factory = getOrCreateFactory(FactoryType.CONSTANT_PRODUCT_POOL)
  factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)
  factory.volumeNative = factory.volumeNative.plus(volumeNative)
  factory.feesNative = factory.feesNative.plus(feesNative)
  factory.feesUSD = factory.feesUSD.plus(feesUSD)
  factory.save()

  return volumeUSD
}

export function updateLiquidity(event: TransferEvent): void {
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

import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Sync,
  Transfer
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO } from '../constants'
import {
  convertTokenToDecimal, getOrCreateBundle, getOrCreateToken,
  getPair, getPairKpi, getRebase,
  getTokenPrice,
  toAmount
} from '../functions'
import { getNativePriceInUSD, updateTokenKpiPrice } from '../pricing'


export function onSync(event: Sync): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const newToken0Liquidity = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  const newToken1Liquidity = convertTokenToDecimal(event.params.reserve1, token1.decimals)
  const token0LiquidityDifference = newToken0Liquidity.minus(pairKpi.token0Liquidity)
  const token1LiquidityDifference = newToken1Liquidity.minus(pairKpi.token1Liquidity)

  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)
  const reserve0 = toAmount(event.params.reserve0, rebase0).div(
    convertTokenToDecimal(BigInt.fromI32(10), token0.decimals)
  )
  const reserve1 = toAmount(event.params.reserve1, rebase1).div(
    convertTokenToDecimal(BigInt.fromI32(10), token1.decimals)
  )

  pairKpi.token0Liquidity = newToken0Liquidity
  pairKpi.token1Liquidity = newToken1Liquidity

  if (pairKpi.token1Liquidity.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token0Price = pairKpi.token0Liquidity.div(pairKpi.token1Liquidity)
  } else {
    pairKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (pairKpi.token0Liquidity.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token1Price = pairKpi.token1Liquidity.div(pairKpi.token0Liquidity)
  } else {
    pairKpi.token1Price = BIG_DECIMAL_ZERO
  }

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenKpiPrice(pair.token0, bundle.nativePrice)
  const token1Price = updateTokenKpiPrice(pair.token1, bundle.nativePrice)

  pairKpi.liquidityNative = token0Price.liquidity
    .times(token0Price.derivedNative)
    .plus(token1Price.liquidity.times(token1Price.derivedNative))
  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()

  token0Price.liquidity = token0Price.liquidity.plus(reserve0)
  // token0Price.liquidityNative = token0Price.liquidityNative.plus(reserve0.times(token0Price.derivedNative))
  // token0Price.liquidityUSD = token0Price.liquidityUSD.plus(token0Price.liquidityNative.times(bundle.nativePrice))
  token0Price.save()

  token1Price.liquidity = token1Price.liquidity.plus(reserve1)
  // token1Price.liquidityNative = token1Price.liquidityNative.plus(reserve1.times(token1Price.derivedNative))
  // token1Price.liquidityUSD = token1Price.liquidityUSD.plus(token1Price.liquidityNative.times(bundle.nativePrice))
  token1Price.save()

  token0Price.liquidity = token0Price.liquidity.plus(token0LiquidityDifference)
  token1Price.liquidity = token1Price.liquidity.plus(token1LiquidityDifference)
  token0Price.save()
  token1Price.save()

  pairKpi.liquidityNative = pairKpi.token0Liquidity
    .times(token0Price.derivedNative as BigDecimal)
    .plus(pairKpi.token1Liquidity.times(token1Price.derivedNative as BigDecimal))

  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()
}

export function onMint(event: MintEvent): void {
  const pairAddress = event.address.toHex()

  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const token0Price = getTokenPrice(token0.id)
  token0Price.liquidity = token0Price.liquidity.plus(amount0)

  const amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const token1Price = getTokenPrice(token1.id)
  token1Price.liquidity = token1Price.liquidity.plus(amount1)

  token0Price.save()
  token1Price.save()
}

export function onBurn(event: BurnEvent): void {
  const pairAddress = event.address.toHex()
  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const token0Price = getTokenPrice(token0.id)
  token0Price.liquidity = token0Price.liquidity.minus(amount0)

  const amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const token1Price = getTokenPrice(token1.id)
  token1Price.liquidity = token1Price.liquidity.minus(amount1)

  token0Price.save()
  token1Price.save()
}

export function onTransfer(event: Transfer): void {
  if (isInitialTransfer(event)) {
    return
  }

  const pairAddress = event.address.toHex()
  const pairKpi = getPairKpi(pairAddress)

  const liquidity = event.params.amount.divDecimal(BigDecimal.fromString('1e18'))

  if (isMint(event)) {
    pairKpi.liquidity = pairKpi.liquidity.plus(liquidity)
  }

  if (isBurn(event)) {
    pairKpi.liquidity = pairKpi.liquidity.minus(liquidity)
  }

  pairKpi.save()
}

function isInitialTransfer(event: Transfer): boolean {
  return event.params.recipient == ADDRESS_ZERO && event.params.amount.equals(BigInt.fromI32(1000))
}

function isMint(event: Transfer): boolean {
  return event.params.sender == ADDRESS_ZERO
}

function isBurn(event: Transfer): boolean {
  return event.params.recipient == ADDRESS_ZERO
}

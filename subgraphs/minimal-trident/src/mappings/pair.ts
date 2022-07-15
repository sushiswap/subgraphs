import { BigInt } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Sync,
  Transfer,
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO, BIG_INT_ZERO } from '../constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateToken,
  getPair,
  getPairKpi,
  getRebase,
  getTokenKpi,
  toAmount,
} from '../functions'
import { getNativePriceInUSD, updateTokenPrice } from '../pricing'

export function onSync(event: Sync): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const token0Kpi = getTokenKpi(pair.token0)
  const token1Kpi = getTokenKpi(pair.token1)

  // Reset liquidity
  token0Kpi.liquidity = token0Kpi.liquidity.minus(pairKpi.token0Liquidity)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(pairKpi.token1Liquidity)

  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)

  const reserve0 = toAmount(event.params.reserve0, rebase0)
  const reserve0Decimal = convertTokenToDecimal(toAmount(event.params.reserve0, rebase0), token0.decimals)
  const reserve1 = toAmount(event.params.reserve1, rebase1)
  const reserve1Decimal = convertTokenToDecimal(toAmount(event.params.reserve1, rebase1), token1.decimals)

  pairKpi.token0Liquidity = reserve0
  pairKpi.token1Liquidity = reserve1

  if (pairKpi.token1Liquidity.notEqual(BIG_INT_ZERO)) {
    pairKpi.token0Price = convertTokenToDecimal(pairKpi.token0Liquidity, token0.decimals).div(
      convertTokenToDecimal(pairKpi.token1Liquidity, token1.decimals)
    )
  } else {
    pairKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (pairKpi.token0Liquidity.notEqual(BIG_INT_ZERO)) {
    pairKpi.token1Price = convertTokenToDecimal(pairKpi.token1Liquidity, token1.decimals).div(
      convertTokenToDecimal(pairKpi.token0Liquidity, token0.decimals)
    )
  } else {
    pairKpi.token1Price = BIG_DECIMAL_ZERO
  }

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)

  token0Kpi.liquidity = token0Kpi.liquidity.plus(reserve0)
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.plus(reserve0Decimal.times(token0Price.derivedNative))
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.plus(token0Kpi.liquidityNative.times(bundle.nativePrice))

  token1Kpi.liquidity = token1Kpi.liquidity.plus(reserve1)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.plus(reserve1Decimal.times(token1Price.derivedNative))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.plus(token1Kpi.liquidityNative.times(bundle.nativePrice))

  token0Kpi.save()
  token1Kpi.save()

  pairKpi.liquidityNative = reserve0Decimal
    .times(token0Price.derivedNative)
    .plus(reserve1Decimal.times(token1Price.derivedNative))

  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()
}

export function onMint(event: MintEvent): void {
  const pairAddress = event.address.toHex()

  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  // const amount0 = event.params.amount0
  // .divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(token0.decimals.toI32() as u8)
  //     .toBigDecimal()
  // )
  const token0Kpi = getTokenKpi(token0.id)
  token0Kpi.liquidity = token0Kpi.liquidity.plus(event.params.amount0)

  // const amount1 = event.params.amount1.divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(token1.decimals.toI32() as u8)
  //     .toBigDecimal()
  // )
  const token1Kpi = getTokenKpi(token1.id)
  token1Kpi.liquidity = token1Kpi.liquidity.plus(event.params.amount1)

  token0Kpi.save()
  token1Kpi.save()
}

export function onBurn(event: BurnEvent): void {
  const pairAddress = event.address.toHex()
  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  // const amount0 = event.params.amount0.divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(token0.decimals.toI32() as u8)
  //     .toBigDecimal()
  // )
  const token0Kpi = getTokenKpi(token0.id)
  token0Kpi.liquidity = token0Kpi.liquidity.minus(event.params.amount0)

  // const amount1 = event.params.amount1.divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(token1.decimals.toI32() as u8)
  //     .toBigDecimal()
  // )
  const token1Kpi = getTokenKpi(token1.id)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(event.params.amount1)

  token0Kpi.save()
  token1Kpi.save()
}

export function onTransfer(event: Transfer): void {
  if (isInitialTransfer(event)) {
    return
  }

  const pairAddress = event.address.toHex()
  const pairKpi = getPairKpi(pairAddress)

  // const liquidity = event.params.amount.divDecimal(BigDecimal.fromString('1e18'))

  if (isMint(event)) {
    pairKpi.liquidity = pairKpi.liquidity.plus(event.params.amount)
  }

  if (isBurn(event)) {
    pairKpi.liquidity = pairKpi.liquidity.minus(event.params.amount)
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

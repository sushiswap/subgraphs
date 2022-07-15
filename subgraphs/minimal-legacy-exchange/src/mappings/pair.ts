import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Transfer } from '../../generated/Factory/ERC20'
import { Sync } from '../../generated/Factory/Pair'
import { PairKpi } from '../../generated/schema'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO, BIG_INT_ZERO } from '../constants'
import { convertTokenToDecimal, getOrCreateBundle, getOrCreateToken, getPair } from '../functions'
import { getPairKpi } from '../functions/pair-kpi'
import { getTokenKpi } from '../functions/token-kpi'
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
  token0Kpi.liquidity = token0Kpi.liquidity.minus(pairKpi.reserve0)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(pairKpi.reserve1)

  const reserve0 = event.params.reserve0
  const reserve1 = event.params.reserve1
  const reserve0Decimal = convertTokenToDecimal(reserve0, token0.decimals)
  const reserve1Decimal = convertTokenToDecimal(reserve1, token1.decimals)

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

export function onTransfer(event: Transfer): void {
  if (isInitialTransfer(event)) {
    return
  }
  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)
  if (isMint(event)) {
    pairKpi.liquidity = pairKpi.liquidity.plus(event.params.value)
    pairKpi.save()
  } else if (isBurn(event)) {
    pairKpi.liquidity = pairKpi.liquidity.minus(event.params.value)
    pairKpi.save()
  }
}

function isInitialTransfer(event: Transfer): boolean {
  return event.params.to == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))
}

function isMint(event: Transfer): boolean {
  return event.params.from == ADDRESS_ZERO
}

function isBurn(event: Transfer): boolean {
  return event.params.to == ADDRESS_ZERO && event.params.from.toHex() == event.address.toHex()
}

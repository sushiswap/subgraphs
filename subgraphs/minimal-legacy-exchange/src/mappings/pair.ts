import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Transfer } from '../../generated/Factory/ERC20'
import { Sync } from '../../generated/Factory/Pair'
import { PairKpi } from '../../generated/schema'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO } from '../constants'
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
  token0Kpi.liquidity = token0Kpi.liquidity.minus(pairKpi.token0Liquidity)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(pairKpi.token1Liquidity)

  const newToken0Liquidity = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  const newToken1Liquidity = convertTokenToDecimal(event.params.reserve1, token1.decimals)

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

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)
  token0Kpi.liquidity = token0Kpi.liquidity.plus(newToken0Liquidity)
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.plus(newToken0Liquidity.times(token0Price.derivedNative))
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.plus(token0Kpi.liquidityNative.times(bundle.nativePrice))

  token1Kpi.liquidity = token1Kpi.liquidity.plus(newToken1Liquidity)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.plus(newToken1Liquidity.times(token1Price.derivedNative))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.plus(token1Kpi.liquidityNative.times(bundle.nativePrice))

  token0Kpi.save()
  token1Kpi.save()

  pairKpi.liquidityNative = pairKpi.token0Liquidity
    .times(token0Price.derivedNative as BigDecimal)
    .plus(pairKpi.token1Liquidity.times(token1Price.derivedNative as BigDecimal))

  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()
}

export function onTransfer(event: Transfer): void {
  if (isInitialTransfer(event)) {
    return
  }

  const value = event.params.value.divDecimal(BigDecimal.fromString('1e18'))
  const pairKpi = getPairKpi(event.address.toHex())
  if (isMint(event)) {
    pairKpi.liquidity = pairKpi.liquidity.plus(value)
    pairKpi.save()
  } else if (isBurn(event, pairKpi)) {
    pairKpi.liquidity = pairKpi.liquidity.minus(value)
    pairKpi.save()
  }
}

function isInitialTransfer(event: Transfer): boolean {
  return event.params.to == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))
}

function isMint(event: Transfer): boolean {
  return event.params.from == ADDRESS_ZERO
}

function isBurn(event: Transfer, pairKpi: PairKpi): boolean {
  return event.params.to == ADDRESS_ZERO && event.params.from.toHex() == pairKpi.id
}

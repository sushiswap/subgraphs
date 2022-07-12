import { BigDecimal } from '@graphprotocol/graph-ts'
import { Sync } from '../../generated/Factory/Pair'
import { BIG_DECIMAL_ZERO } from '../constants'
import { convertTokenToDecimal, getOrCreateBundle, getOrCreateToken, getPair } from '../functions'
import { getPairKpi } from '../functions/pair-kpi'
import { getNativePriceInUSD, updateTokenKpiPrice as updateTokenPrice } from '../pricing'

export function onSync(event: Sync): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)


  const token0LiquidityDifference = convertTokenToDecimal(event.params.reserve0, token0.decimals).minus(pairKpi.token0Liquidity)
  const token1LiquidityDifference = convertTokenToDecimal(event.params.reserve1, token1.decimals).minus(pairKpi.token1Liquidity)

  pairKpi.token0Liquidity = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  pairKpi.token1Liquidity = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  
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

  const token0Price = updateTokenPrice(pair.token0, bundle.nativePrice)
  const token1Price = updateTokenPrice(pair.token1, bundle.nativePrice)

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

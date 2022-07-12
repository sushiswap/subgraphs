import { BigDecimal } from '@graphprotocol/graph-ts'
import { Sync } from '../../generated/Factory/Pair'
import { BIG_DECIMAL_ZERO } from '../constants'
import { convertTokenToDecimal, getOrCreateBundle, getOrCreateToken, getPair } from '../functions'
import { getPairKpi } from '../functions/pair-kpi'
import { getNativePriceInUSD, updateTokenKpiPrice } from '../pricing'

export function onSync(event: Sync): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  pairKpi.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  pairKpi.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  if (pairKpi.reserve1.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token0Price = pairKpi.reserve0.div(pairKpi.reserve1)
  } else {
    pairKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (pairKpi.reserve0.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token1Price = pairKpi.reserve1.div(pairKpi.reserve0)
  } else {
    pairKpi.token1Price = BIG_DECIMAL_ZERO
  }

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenKpiPrice(pair.token0)
  const token1Price = updateTokenKpiPrice(pair.token1)

  pairKpi.reserveNative = pairKpi.reserve0
    .times(token0Price.derivedNative as BigDecimal)
    .plus(pairKpi.reserve1.times(token1Price.derivedNative as BigDecimal))

  pairKpi.save()
}

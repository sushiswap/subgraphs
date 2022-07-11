import { BigDecimal } from '@graphprotocol/graph-ts'
import { Sync } from '../../generated/Factory/Pair'
import { BIG_DECIMAL_ZERO } from '../constants'
import { convertTokenToDecimal, getOrCreateBundle, getOrCreateToken, getPool } from '../functions'
import { getPoolKpi } from '../functions/pool-data'
import { getTokenKpi } from '../functions/token-data'
import { findEthPerToken, getNativePriceInUSD } from '../pricing'

export function onSync(event: Sync): void {
  const poolId = event.address.toHex()
  const pool = getPool(poolId)
  const poolKpi = getPoolKpi(poolId)

  const token0 = getOrCreateToken(pool.token0)
  const token0Kpi = getTokenKpi(pool.token0)
  const token1 = getOrCreateToken(pool.token1)
  const token1Kpi = getTokenKpi(pool.token1)

  poolKpi.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  poolKpi.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  if (poolKpi.reserve1.notEqual(BIG_DECIMAL_ZERO)) {
    poolKpi.token0Price = poolKpi.reserve0.div(poolKpi.reserve1)
  } else {
    poolKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (poolKpi.reserve0.notEqual(BIG_DECIMAL_ZERO)) {
    poolKpi.token1Price = poolKpi.reserve1.div(poolKpi.reserve0)
  } else {
    poolKpi.token1Price = BIG_DECIMAL_ZERO
  }

  const bundle = getOrCreateBundle()
  bundle.ethPrice = getNativePriceInUSD()
  bundle.save()

  token0Kpi.derivedETH = findEthPerToken(token0, token0Kpi)
  token1Kpi.derivedETH = findEthPerToken(token1, token1Kpi)

  poolKpi.reserveETH = poolKpi.reserve0
    .times(token0Kpi.derivedETH as BigDecimal)
    .plus(poolKpi.reserve1.times(token1Kpi.derivedETH as BigDecimal))

  poolKpi.save()
  token0Kpi.save()
  token1Kpi.save()
}

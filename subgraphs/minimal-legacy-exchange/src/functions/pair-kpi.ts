import { PairKpi } from '../../generated/schema'
import { BIG_DECIMAL_ZERO } from '../constants'

export function createPairKpi(id: string): PairKpi {
  let kpi = new PairKpi(id)
  kpi.reserve0 = BIG_DECIMAL_ZERO
  kpi.reserve1 = BIG_DECIMAL_ZERO
  kpi.token0Price = BIG_DECIMAL_ZERO
  kpi.token1Price = BIG_DECIMAL_ZERO
  kpi.reserveNative = BIG_DECIMAL_ZERO
  kpi.totalSupply = BIG_DECIMAL_ZERO
  kpi.save()
  return kpi as PairKpi
}

export function getPairKpi(address: string): PairKpi {
  return PairKpi.load(address) as PairKpi
}

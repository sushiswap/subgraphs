import { BigInt, Address } from '@graphprotocol/graph-ts'
import { KashiPairKpi } from '../../generated/schema'

import { STARTING_INTEREST_PER_YEAR } from '../constants'

export function createKashiPairKpi(id: Address): KashiPairKpi {
  const kpi = new KashiPairKpi(id.toHex())
  kpi.borrowAPR = BigInt.fromU32(0)
  kpi.supplyAPR = STARTING_INTEREST_PER_YEAR
  kpi.utilization = BigInt.fromU32(0)
  kpi.totalFeesEarnedFraction = BigInt.fromU32(0)
  kpi.save()
  return kpi
}

export function getKashiPairKpi(id: string): KashiPairKpi {
  return KashiPairKpi.load(id) as KashiPairKpi
}

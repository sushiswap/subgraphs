import { BigInt } from '@graphprotocol/graph-ts'
import { StrategyKpi } from '../../generated/schema'

export function getStrategyKpi(strategyAddress: string): StrategyKpi {
  return StrategyKpi.load(strategyAddress) as StrategyKpi
}

export function createStrategyKpi(strategyAddress: string): StrategyKpi {
  const kpi = new StrategyKpi(strategyAddress)
  kpi.harvestCount = BigInt.fromU32(0)
  kpi.investOrDivestCount = BigInt.fromU32(0)
  kpi.investCount = BigInt.fromU32(0)
  kpi.divestCount = BigInt.fromU32(0)
  kpi.profitOrLossCount = BigInt.fromU32(0)
  kpi.profitCount = BigInt.fromU32(0)
  kpi.lossCount = BigInt.fromU32(0)
  kpi.profitAndLoss = BigInt.fromI32(0)
  kpi.invested = BigInt.fromU32(0)
  kpi.divested = BigInt.fromI32(0)
  kpi.save()
  return kpi
}

export function getOrCreateStrategyKpi(strategyAddress: string): StrategyKpi {
  const kpi = StrategyKpi.load(strategyAddress)

  if (kpi === null) {
    return createStrategyKpi(strategyAddress)
  }

  return kpi
}

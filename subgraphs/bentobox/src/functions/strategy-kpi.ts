import { BigInt } from '@graphprotocol/graph-ts'
import { StrategyKpi } from '../../generated/schema'
import {
  increaseStrategySnapshotDivestKpi,
  increaseStrategySnapshotHarvestCount,
  increaseStrategySnapshotInvestKpi,
  increaseStrategySnapshotLossKpi,
  increaseStrategySnapshotProfitKpi
} from './strategy-kpi-snapshots'

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

export function increaseHarvestCount(strategyAddress: string, timestamp: BigInt): void {
  const strategyKpi = getOrCreateStrategyKpi(strategyAddress)
  strategyKpi.harvestCount = strategyKpi.harvestCount.plus(BigInt.fromU32(1))
  strategyKpi.save()
  increaseStrategySnapshotHarvestCount(strategyAddress, timestamp)
}

export function increaseInvestKpi(strategyAddress: string, amount: BigInt, timestamp: BigInt): void {
  const strategyKpi = getOrCreateStrategyKpi(strategyAddress)
  strategyKpi.investOrDivestCount = strategyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  strategyKpi.investCount = strategyKpi.investCount.plus(BigInt.fromU32(1))
  strategyKpi.invested = strategyKpi.invested.plus(amount)
  strategyKpi.save()
  increaseStrategySnapshotInvestKpi(strategyAddress, amount, timestamp)
}

export function increaseDivestKpi(strategyAddress: string, amount: BigInt, timestamp: BigInt): void {
  const strategyKpi = getOrCreateStrategyKpi(strategyAddress)
  strategyKpi.investOrDivestCount = strategyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  strategyKpi.divestCount = strategyKpi.divestCount.plus(BigInt.fromU32(1))
  strategyKpi.divested = strategyKpi.divested.plus(amount)
  strategyKpi.save()
  increaseStrategySnapshotDivestKpi(strategyAddress, amount, timestamp)
}

export function increaseProfitKpi(strategyAddress: string, amount: BigInt, timestamp: BigInt): void {
  const strategyKpi = getOrCreateStrategyKpi(strategyAddress)
  strategyKpi.profitOrLossCount = strategyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  strategyKpi.profitCount = strategyKpi.profitCount.plus(BigInt.fromU32(1))
  strategyKpi.profitAndLoss = strategyKpi.profitAndLoss.plus(amount)
  strategyKpi.save()
  increaseStrategySnapshotProfitKpi(strategyAddress, amount, timestamp)
}

export function increaseLossKpi(strategyAddress: string, amount: BigInt, timestamp: BigInt): void {
  const strategyKpi = getOrCreateStrategyKpi(strategyAddress)
  strategyKpi.profitOrLossCount = strategyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  strategyKpi.lossCount = strategyKpi.lossCount.plus(BigInt.fromU32(1))
  strategyKpi.profitAndLoss = strategyKpi.profitAndLoss.minus(amount)
  strategyKpi.save()
  increaseStrategySnapshotLossKpi(strategyAddress, amount, timestamp)
}

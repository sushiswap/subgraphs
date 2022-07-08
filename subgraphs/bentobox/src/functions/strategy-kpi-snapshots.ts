import { BigInt } from '@graphprotocol/graph-ts'
import { StrategyDailyKpi, StrategyHourlyKpi } from '../../generated/schema'
import { DAY_INFIX, HOUR_INFIX } from '../constants/index'
import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants/time'
import { getStrategyKpi } from './strategy-kpi'

function getOrCreateStrategyHourlyKpi(strategyId: string, timestamp: BigInt): StrategyHourlyKpi {
  let id = getStrategyHourlyKpiId(strategyId, timestamp)

  let hourlyKpi = StrategyHourlyKpi.load(id)

  if (hourlyKpi === null) {
    hourlyKpi = new StrategyHourlyKpi(id)
    hourlyKpi.date = getHourStartDate(timestamp)
    const kpi = getStrategyKpi(strategyId)
    hourlyKpi.harvestCount = kpi.harvestCount
    hourlyKpi.investOrDivestCount = kpi.investOrDivestCount
    hourlyKpi.investCount = kpi.investCount
    hourlyKpi.divestCount = kpi.divestCount
    hourlyKpi.profitOrLossCount = kpi.profitOrLossCount
    hourlyKpi.profitCount = kpi.profitCount
    hourlyKpi.lossCount = kpi.lossCount
    hourlyKpi.profitAndLoss = kpi.profitAndLoss
    hourlyKpi.invested = kpi.invested
    hourlyKpi.divested = kpi.divested
    hourlyKpi.newHarvestCount = BigInt.fromU32(0)
    hourlyKpi.newInvestOrDivestCount = BigInt.fromU32(0)
    hourlyKpi.newInvestCount = BigInt.fromU32(0)
    hourlyKpi.newDivestCount = BigInt.fromU32(0)
    hourlyKpi.newProfitOrLossCount = BigInt.fromU32(0)
    hourlyKpi.newProfitCount = BigInt.fromU32(0)
    hourlyKpi.newLossCount = BigInt.fromU32(0)
    hourlyKpi.newProfitAndLoss = BigInt.fromU32(0)
    hourlyKpi.newInvested = BigInt.fromU32(0)
    hourlyKpi.newDivested = BigInt.fromU32(0)
    hourlyKpi.save()
  }

  return hourlyKpi
}

function getOrCreateStrategyDailyKpi(strategyId: string, timestamp: BigInt): StrategyDailyKpi {
  let id = getStrategyDailyKpiId(strategyId, timestamp)
  let dailyKpi = StrategyDailyKpi.load(id)

  if (dailyKpi === null) {
    dailyKpi = new StrategyDailyKpi(id)
    dailyKpi.date = getHourStartDate(timestamp)
    const kpi = getStrategyKpi(strategyId)
    dailyKpi.harvestCount = kpi.harvestCount
    dailyKpi.investOrDivestCount = kpi.investOrDivestCount
    dailyKpi.investCount = kpi.investCount
    dailyKpi.divestCount = kpi.divestCount
    dailyKpi.profitOrLossCount = kpi.profitOrLossCount
    dailyKpi.profitCount = kpi.profitCount
    dailyKpi.lossCount = kpi.lossCount
    dailyKpi.profitAndLoss = kpi.profitAndLoss
    dailyKpi.invested = kpi.invested
    dailyKpi.divested = kpi.divested
    dailyKpi.newHarvestCount = BigInt.fromU32(0)
    dailyKpi.newInvestOrDivestCount = BigInt.fromU32(0)
    dailyKpi.newInvestCount = BigInt.fromU32(0)
    dailyKpi.newDivestCount = BigInt.fromU32(0)
    dailyKpi.newProfitOrLossCount = BigInt.fromU32(0)
    dailyKpi.newProfitCount = BigInt.fromU32(0)
    dailyKpi.newLossCount = BigInt.fromU32(0)
    dailyKpi.newProfitAndLoss = BigInt.fromU32(0)
    dailyKpi.newInvested = BigInt.fromU32(0)
    dailyKpi.newDivested = BigInt.fromU32(0)
    dailyKpi.save()
  }

  return dailyKpi
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique hour within unix history
  return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function getStrategyHourlyKpiId(strategyId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return strategyId.concat(HOUR_INFIX).concat(BigInt.fromI32(startDate).toString())
}

function getStrategyDailyKpiId(strategyId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return strategyId.concat(DAY_INFIX).concat(BigInt.fromI32(startDate).toString())
}

export function increaseStrategySnapshotHarvestCount(strategyId: string, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateStrategyHourlyKpi(strategyId, timestamp)
  hourlyKpi.harvestCount = hourlyKpi.harvestCount.plus(BigInt.fromU32(1))
  hourlyKpi.newHarvestCount = hourlyKpi.newHarvestCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()
  let dailyKpi = getOrCreateStrategyDailyKpi(strategyId, timestamp)
  dailyKpi.harvestCount = dailyKpi.harvestCount.plus(BigInt.fromU32(1))
  dailyKpi.newHarvestCount = dailyKpi.newHarvestCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseStrategySnapshotInvestKpi(strategyId: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateStrategyHourlyKpi(strategyId, timestamp)
  hourlyKpi.investOrDivestCount = hourlyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  hourlyKpi.newInvestOrDivestCount = hourlyKpi.newInvestOrDivestCount.plus(BigInt.fromU32(1))

  hourlyKpi.investCount = hourlyKpi.investCount.plus(BigInt.fromU32(1))
  hourlyKpi.newInvestCount = hourlyKpi.newInvestCount.plus(BigInt.fromU32(1))

  hourlyKpi.invested = hourlyKpi.invested.plus(amount)
  hourlyKpi.newInvested = hourlyKpi.newInvested.plus(amount)
  hourlyKpi.save()

  let dailyKpi = getOrCreateStrategyDailyKpi(strategyId, timestamp)
  dailyKpi.investOrDivestCount = dailyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  dailyKpi.newInvestOrDivestCount = dailyKpi.newInvestOrDivestCount.plus(BigInt.fromU32(1))

  dailyKpi.investCount = dailyKpi.investCount.plus(BigInt.fromU32(1))
  dailyKpi.newInvestCount = dailyKpi.newInvestCount.plus(BigInt.fromU32(1))

  dailyKpi.invested = dailyKpi.invested.plus(amount)
  dailyKpi.newInvested = dailyKpi.newInvested.plus(amount)
  dailyKpi.save()
}

export function increaseStrategySnapshotDivestKpi(strategyId: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateStrategyHourlyKpi(strategyId, timestamp)
  hourlyKpi.investOrDivestCount = hourlyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  hourlyKpi.newInvestOrDivestCount = hourlyKpi.newInvestOrDivestCount.plus(BigInt.fromU32(1))

  hourlyKpi.divestCount = hourlyKpi.divestCount.plus(BigInt.fromU32(1))
  hourlyKpi.newDivestCount = hourlyKpi.newDivestCount.plus(BigInt.fromU32(1))

  hourlyKpi.divested = hourlyKpi.divested.plus(amount)
  hourlyKpi.newDivested = hourlyKpi.newDivested.plus(amount)
  hourlyKpi.save()

  let dailyKpi = getOrCreateStrategyDailyKpi(strategyId, timestamp)
  dailyKpi.investOrDivestCount = dailyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  dailyKpi.newInvestOrDivestCount = dailyKpi.newInvestOrDivestCount.plus(BigInt.fromU32(1))

  dailyKpi.divestCount = dailyKpi.divestCount.plus(BigInt.fromU32(1))
  dailyKpi.newDivestCount = dailyKpi.newDivestCount.plus(BigInt.fromU32(1))

  dailyKpi.divested = dailyKpi.divested.plus(amount)
  dailyKpi.newDivested = dailyKpi.newDivested.plus(amount)
  dailyKpi.save()
}

export function increaseStrategySnapshotProfitKpi(strategyId: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateStrategyHourlyKpi(strategyId, timestamp)
  hourlyKpi.profitOrLossCount = hourlyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  hourlyKpi.newProfitOrLossCount = hourlyKpi.newProfitOrLossCount.plus(BigInt.fromU32(1))

  hourlyKpi.profitCount = hourlyKpi.profitCount.plus(BigInt.fromU32(1))
  hourlyKpi.newProfitCount = hourlyKpi.newProfitCount.plus(BigInt.fromU32(1))

  hourlyKpi.profitAndLoss = hourlyKpi.profitAndLoss.plus(amount)
  hourlyKpi.newProfitAndLoss = hourlyKpi.newProfitAndLoss.plus(amount)
  hourlyKpi.save()

  let dailyKpi = getOrCreateStrategyDailyKpi(strategyId, timestamp)
  dailyKpi.profitOrLossCount = dailyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  dailyKpi.newProfitOrLossCount = dailyKpi.newProfitOrLossCount.plus(BigInt.fromU32(1))

  dailyKpi.profitCount = dailyKpi.profitCount.plus(BigInt.fromU32(1))
  dailyKpi.newProfitCount = dailyKpi.newProfitCount.plus(BigInt.fromU32(1))

  dailyKpi.profitAndLoss = dailyKpi.profitAndLoss.plus(amount)
  dailyKpi.newProfitAndLoss = dailyKpi.newProfitAndLoss.plus(amount)
  dailyKpi.save()
}

export function increaseStrategySnapshotLossKpi(strategyId: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateStrategyHourlyKpi(strategyId, timestamp)
  hourlyKpi.profitOrLossCount = hourlyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  hourlyKpi.newProfitOrLossCount = hourlyKpi.newProfitOrLossCount.plus(BigInt.fromU32(1))

  hourlyKpi.lossCount = hourlyKpi.lossCount.plus(BigInt.fromU32(1))
  hourlyKpi.newLossCount = hourlyKpi.newLossCount.plus(BigInt.fromU32(1))

  hourlyKpi.profitAndLoss = hourlyKpi.profitAndLoss.minus(amount)
  hourlyKpi.newProfitAndLoss = hourlyKpi.newProfitAndLoss.minus(amount)
  hourlyKpi.save()

  let dailyKpi = getOrCreateStrategyDailyKpi(strategyId, timestamp)
  dailyKpi.profitOrLossCount = dailyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  dailyKpi.newProfitOrLossCount = dailyKpi.newProfitOrLossCount.plus(BigInt.fromU32(1))

  dailyKpi.lossCount = dailyKpi.lossCount.plus(BigInt.fromU32(1))
  dailyKpi.newLossCount = dailyKpi.newLossCount.plus(BigInt.fromU32(1))

  dailyKpi.profitAndLoss = dailyKpi.profitAndLoss.minus(amount)
  dailyKpi.newProfitAndLoss = dailyKpi.newProfitAndLoss.minus(amount)
  dailyKpi.save()
}

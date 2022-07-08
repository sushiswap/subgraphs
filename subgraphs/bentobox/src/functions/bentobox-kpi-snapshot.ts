import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants/time'

import { BigInt } from '@graphprotocol/graph-ts'
import { BentoBoxDailyKpi, BentoBoxHourlyKpi, BentoBoxKpi } from '../../generated/schema'
import { BENTOBOX_DAY_KPI_PREFIX, BENTOBOX_HOURLY_KPI_PREFIX } from '../constants'
import { getBentoBoxKpi } from './bentobox-kpi'

function getOrCreateBentoBoxHourlyKpi(timestamp: BigInt): BentoBoxHourlyKpi {
  let id = getBentoBoxHourlyKpiId(timestamp)

  let hourlyKpi = BentoBoxHourlyKpi.load(id)

  if (hourlyKpi === null) {
    hourlyKpi = new BentoBoxHourlyKpi(id)
    const kpi = getBentoBoxKpi()
    hourlyKpi.date = getHourStartDate(timestamp)
    hourlyKpi.depositCount = kpi.depositCount
    hourlyKpi.withdrawCount = kpi.withdrawCount
    hourlyKpi.transferCount = kpi.transferCount
    hourlyKpi.userCount = kpi.userCount
    hourlyKpi.protocolCount = kpi.protocolCount
    hourlyKpi.tokenCount = kpi.tokenCount
    hourlyKpi.masterContractCount = kpi.masterContractCount
    hourlyKpi.cloneCount = kpi.cloneCount
    hourlyKpi.flashloanCount = kpi.flashloanCount
    hourlyKpi.transactionCount = kpi.transactionCount
    hourlyKpi.strategyCount = kpi.strategyCount
    hourlyKpi.pendingStrategyCount = kpi.pendingStrategyCount
    hourlyKpi.activeStrategyCount = kpi.activeStrategyCount
    hourlyKpi.newDepositCount = BigInt.fromU32(0)
    hourlyKpi.newWithdrawCount = BigInt.fromU32(0)
    hourlyKpi.newTransferCount = BigInt.fromU32(0)
    hourlyKpi.newUserCount = BigInt.fromU32(0)
    hourlyKpi.newProtocolCount = BigInt.fromU32(0)
    hourlyKpi.newTokenCount = BigInt.fromU32(0)
    hourlyKpi.newMasterContractCount = BigInt.fromU32(0)
    hourlyKpi.newCloneCount = BigInt.fromU32(0)
    hourlyKpi.newFlashloanCount = BigInt.fromU32(0)
    hourlyKpi.newTransactionCount = BigInt.fromU32(0)
    hourlyKpi.newStrategyCount = BigInt.fromU32(0)
    hourlyKpi.newPendingStrategyCount = BigInt.fromU32(0)
    hourlyKpi.newActiveStrategyCount = BigInt.fromU32(0)
    hourlyKpi.save()
  }

  return hourlyKpi
}

function getOrCreateBentoBoxDailyKpi(timestamp: BigInt): BentoBoxDailyKpi {
  let id = getBentoBoxDailyKpiId(timestamp)
  let dailyKpi = BentoBoxDailyKpi.load(id)

  if (dailyKpi === null) {
    dailyKpi = new BentoBoxDailyKpi(id)
    const kpi = getBentoBoxKpi()
    dailyKpi.date = getHourStartDate(timestamp)
    dailyKpi.depositCount = kpi.depositCount
    dailyKpi.withdrawCount = kpi.withdrawCount
    dailyKpi.transferCount = kpi.transferCount
    dailyKpi.userCount = kpi.userCount
    dailyKpi.protocolCount = kpi.protocolCount
    dailyKpi.tokenCount = kpi.tokenCount
    dailyKpi.masterContractCount = kpi.masterContractCount
    dailyKpi.cloneCount = kpi.cloneCount
    dailyKpi.flashloanCount = kpi.flashloanCount
    dailyKpi.transactionCount = kpi.transactionCount
    dailyKpi.strategyCount = kpi.strategyCount
    dailyKpi.pendingStrategyCount = kpi.pendingStrategyCount
    dailyKpi.activeStrategyCount = kpi.activeStrategyCount
    dailyKpi.newDepositCount = BigInt.fromU32(0)
    dailyKpi.newWithdrawCount = BigInt.fromU32(0)
    dailyKpi.newTransferCount = BigInt.fromU32(0)
    dailyKpi.newUserCount = BigInt.fromU32(0)
    dailyKpi.newProtocolCount = BigInt.fromU32(0)
    dailyKpi.newTokenCount = BigInt.fromU32(0)
    dailyKpi.newMasterContractCount = BigInt.fromU32(0)
    dailyKpi.newCloneCount = BigInt.fromU32(0)
    dailyKpi.newFlashloanCount = BigInt.fromU32(0)
    dailyKpi.newTransactionCount = BigInt.fromU32(0)
    dailyKpi.newStrategyCount = BigInt.fromU32(0)
    dailyKpi.newPendingStrategyCount = BigInt.fromU32(0)
    dailyKpi.newActiveStrategyCount = BigInt.fromU32(0)
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

function getBentoBoxHourlyKpiId(timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return BENTOBOX_HOURLY_KPI_PREFIX.concat(BigInt.fromI32(startDate).toString())
}

function getBentoBoxDailyKpiId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return BENTOBOX_DAY_KPI_PREFIX.concat(BigInt.fromI32(startDate).toString())
}

export function increaseSnapshotDepositCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.depositCount = hourlyKpi.depositCount.plus(BigInt.fromU32(1))
  hourlyKpi.newDepositCount = hourlyKpi.newDepositCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.depositCount = dailyKpi.depositCount.plus(BigInt.fromU32(1))
  dailyKpi.newDepositCount = dailyKpi.newDepositCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotWithdrawCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.withdrawCount = hourlyKpi.withdrawCount.plus(BigInt.fromU32(1))
  hourlyKpi.newWithdrawCount = hourlyKpi.newWithdrawCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.withdrawCount = dailyKpi.withdrawCount.plus(BigInt.fromU32(1))
  dailyKpi.newWithdrawCount = dailyKpi.newWithdrawCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotTransferCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.transferCount = hourlyKpi.transferCount.plus(BigInt.fromU32(1))
  hourlyKpi.newTransferCount = hourlyKpi.newTransferCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.transferCount = dailyKpi.transferCount.plus(BigInt.fromU32(1))
  dailyKpi.newTransferCount = dailyKpi.newTransferCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotProtocolCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.protocolCount = hourlyKpi.protocolCount.plus(BigInt.fromU32(1))
  hourlyKpi.newProtocolCount = hourlyKpi.newProtocolCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.protocolCount = dailyKpi.protocolCount.plus(BigInt.fromU32(1))
  dailyKpi.newProtocolCount = dailyKpi.newProtocolCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}


export function increaseSnapshotUserCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.userCount = hourlyKpi.userCount.plus(BigInt.fromU32(1))
  hourlyKpi.newUserCount = hourlyKpi.newUserCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.userCount = dailyKpi.userCount.plus(BigInt.fromU32(1))
  dailyKpi.newUserCount = dailyKpi.newUserCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotTokenCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.tokenCount = hourlyKpi.tokenCount.plus(BigInt.fromU32(1))
  hourlyKpi.newTokenCount = hourlyKpi.newTokenCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.tokenCount = dailyKpi.tokenCount.plus(BigInt.fromU32(1))
  dailyKpi.newTokenCount = dailyKpi.newTokenCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotMasterContractCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.masterContractCount = hourlyKpi.masterContractCount.plus(BigInt.fromU32(1))
  hourlyKpi.newMasterContractCount = hourlyKpi.newMasterContractCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.masterContractCount = dailyKpi.masterContractCount.plus(BigInt.fromU32(1))
  dailyKpi.newMasterContractCount = dailyKpi.newMasterContractCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotCloneContractCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.cloneCount = hourlyKpi.cloneCount.plus(BigInt.fromU32(1))
  hourlyKpi.newCloneCount = hourlyKpi.newCloneCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.cloneCount = dailyKpi.cloneCount.plus(BigInt.fromU32(1))
  dailyKpi.newCloneCount = dailyKpi.newCloneCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotFloashLoanCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.flashloanCount = hourlyKpi.flashloanCount.plus(BigInt.fromU32(1))
  hourlyKpi.newFlashloanCount = hourlyKpi.newFlashloanCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.flashloanCount = dailyKpi.flashloanCount.plus(BigInt.fromU32(1))
  dailyKpi.newFlashloanCount = dailyKpi.newFlashloanCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotTransactionCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.transactionCount = hourlyKpi.transactionCount.plus(BigInt.fromU32(1))
  hourlyKpi.newTransactionCount = hourlyKpi.newTransactionCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.transactionCount = dailyKpi.transactionCount.plus(BigInt.fromU32(1))
  dailyKpi.newTransactionCount = dailyKpi.newTransactionCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotStrategyCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.strategyCount = hourlyKpi.strategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.newStrategyCount = hourlyKpi.newStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.strategyCount = dailyKpi.strategyCount.plus(BigInt.fromU32(1))
  dailyKpi.newStrategyCount = dailyKpi.newStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotPendingStrategyCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.pendingStrategyCount = hourlyKpi.pendingStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.newPendingStrategyCount = hourlyKpi.newPendingStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.pendingStrategyCount = dailyKpi.pendingStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.newPendingStrategyCount = dailyKpi.newPendingStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function decreaseSnapshotPendingStrategyCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.pendingStrategyCount = hourlyKpi.pendingStrategyCount.minus(BigInt.fromU32(1))
  hourlyKpi.newPendingStrategyCount = hourlyKpi.newPendingStrategyCount.minus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.pendingStrategyCount = dailyKpi.pendingStrategyCount.minus(BigInt.fromU32(1))
  dailyKpi.newPendingStrategyCount = dailyKpi.newPendingStrategyCount.minus(BigInt.fromU32(1))
  dailyKpi.save()
}

export function increaseSnapshotActiveStrategyCounts(timestamp: BigInt): void {
  const hourlyKpi = getOrCreateBentoBoxHourlyKpi(timestamp)
  hourlyKpi.activeStrategyCount = hourlyKpi.activeStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.newActiveStrategyCount = hourlyKpi.newActiveStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()

  const dailyKpi = getOrCreateBentoBoxDailyKpi(timestamp)
  dailyKpi.activeStrategyCount = dailyKpi.activeStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.newActiveStrategyCount = dailyKpi.newActiveStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}
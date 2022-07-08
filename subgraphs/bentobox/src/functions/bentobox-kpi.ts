import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BentoBoxKpi } from '../../generated/schema'
import { BENTOBOX_ADDRESS } from '../constants'
import {
  decreaseSnapshotPendingStrategyCounts,
  increaseSnapshotActiveStrategyCounts,
  increaseSnapshotCloneContractCounts,
  increaseSnapshotDepositCounts,
  increaseSnapshotFloashLoanCounts,
  increaseSnapshotMasterContractCounts,
  increaseSnapshotPendingStrategyCounts,
  increaseSnapshotProtocolCounts,
  increaseSnapshotStrategyCounts,
  increaseSnapshotTokenCounts,
  increaseSnapshotTransactionCounts,
  increaseSnapshotTransferCounts,
  increaseSnapshotUserCounts,
  increaseSnapshotWithdrawCounts,
} from './bentobox-kpi-snapshot'

export function createBentoBoxKpi(id: Address = BENTOBOX_ADDRESS): BentoBoxKpi {
  const kpi = new BentoBoxKpi(id.toHex())
  kpi.depositCount = BigInt.fromU32(0)
  kpi.withdrawCount = BigInt.fromU32(0)
  kpi.transferCount = BigInt.fromU32(0)
  kpi.userCount = BigInt.fromU32(0)
  kpi.protocolCount = BigInt.fromU32(0)
  kpi.tokenCount = BigInt.fromU32(0)
  kpi.masterContractCount = BigInt.fromU32(0)
  kpi.cloneCount = BigInt.fromU32(0)
  kpi.flashloanCount = BigInt.fromU32(0)
  kpi.transactionCount = BigInt.fromU32(0)
  kpi.strategyCount = BigInt.fromU32(0)
  kpi.pendingStrategyCount = BigInt.fromU32(0)
  kpi.activeStrategyCount = BigInt.fromU32(0)
  kpi.save()
  return kpi
}

export function getBentoBoxKpi(id: Address = BENTOBOX_ADDRESS): BentoBoxKpi {
  return BentoBoxKpi.load(id.toHex()) as BentoBoxKpi
}

export function getOrCreateBentoBoxKpi(id: Address = BENTOBOX_ADDRESS): BentoBoxKpi {
  const kpi = BentoBoxKpi.load(id.toHex())

  if (kpi === null) {
    return createBentoBoxKpi()
  }

  return kpi
}

export function increaseDepositCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.depositCount = kpi.depositCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotDepositCounts(timestamp)
}

export function increaseWithdrawCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.withdrawCount = kpi.withdrawCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotWithdrawCounts(timestamp)
}

export function increaseTransferCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.transferCount = kpi.transferCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotTransferCounts(timestamp)
}

export function increaseProtocolCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.protocolCount = kpi.protocolCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotProtocolCounts(timestamp)
}

export function increaseUserCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.userCount = kpi.userCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotUserCounts(timestamp)
}

export function increaseTokenCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.tokenCount = kpi.tokenCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotTokenCounts(timestamp)
}

export function increaseMasterContractCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.masterContractCount = kpi.masterContractCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotMasterContractCounts(timestamp)
}

export function increaseCloneContractCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.cloneCount = kpi.cloneCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotCloneContractCounts(timestamp)
}

export function increaseFlashLoanCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.flashloanCount = kpi.flashloanCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotFloashLoanCounts(timestamp)
}

export function increaseTransactionCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.transactionCount = kpi.transactionCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotTransactionCounts(timestamp)
}

export function increaseStrategyCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.strategyCount = kpi.strategyCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotStrategyCounts(timestamp)
}

export function increasePendingStrategyCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.pendingStrategyCount = kpi.pendingStrategyCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotPendingStrategyCounts(timestamp)
}

export function decreasePendingStrategyCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.pendingStrategyCount = kpi.pendingStrategyCount.minus(BigInt.fromU32(1))
  kpi.save()
  decreaseSnapshotPendingStrategyCounts(timestamp)
}

export function increaseActiveStrategyCount(timestamp: BigInt): void {
  const kpi = getBentoBoxKpi()
  kpi.activeStrategyCount = kpi.activeStrategyCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseSnapshotActiveStrategyCounts(timestamp)
}

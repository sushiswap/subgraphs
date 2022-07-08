import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS } from '../constants'
import { BentoBoxKpi } from '../../generated/schema'

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


export function increaseDepositCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.depositCount = kpi.depositCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseWithdrawCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.withdrawCount = kpi.withdrawCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseTransferCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.transferCount = kpi.transferCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseProtocolCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.protocolCount = kpi.protocolCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseUserCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.userCount = kpi.userCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseTokenCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.tokenCount = kpi.tokenCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseMasterContractCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.masterContractCount = kpi.masterContractCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseCloneContractCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.cloneCount = kpi.cloneCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseFlashLoanCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.flashloanCount = kpi.flashloanCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseTransactionCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.transactionCount = kpi.transactionCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseStrategyCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.strategyCount = kpi.strategyCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function increasePendingStrategyCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.pendingStrategyCount = kpi.pendingStrategyCount.plus(BigInt.fromU32(1))
  kpi.save()
}

export function decreasePendingStrategyCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.pendingStrategyCount = kpi.pendingStrategyCount.minus(BigInt.fromU32(1))
  kpi.save()
}

export function increaseActiveStrategyCount(): void {
  const kpi = getBentoBoxKpi()
  kpi.activeStrategyCount = kpi.activeStrategyCount.plus(BigInt.fromU32(1))
  kpi.save()
}

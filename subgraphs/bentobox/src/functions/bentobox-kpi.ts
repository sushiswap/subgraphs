import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS } from '../constants'
import { BentoBoxKpi } from '../../generated/schema'

export function createBentoBoxKpi(id: Address = BENTOBOX_ADDRESS): BentoBoxKpi {
  const kpi = new BentoBoxKpi(id.toHex())
  kpi.depositCount = BigInt.fromU32(0)
  kpi.withdrawCount = BigInt.fromU32(0)
  kpi.transferCount = BigInt.fromU32(0)
  kpi.protocolCount = BigInt.fromU32(0)
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

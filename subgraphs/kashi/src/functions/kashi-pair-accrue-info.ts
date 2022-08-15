import { Address } from '@graphprotocol/graph-ts'
import { KashiPairAccrueInfo } from '../../generated/schema'
import { KashiPair as KashiPairContract } from '../../generated/BentoBox/KashiPair'

export function createKashiPairAccrueInfo(id: Address): KashiPairAccrueInfo {
  const pairContract = KashiPairContract.bind(id)
  const accrueInfo = pairContract.accrueInfo()
  const kashiPairAccureInfo = new KashiPairAccrueInfo(id.toHex())
  kashiPairAccureInfo.interestPerSecond = accrueInfo.value0
  kashiPairAccureInfo.lastAccrued = accrueInfo.value1
  kashiPairAccureInfo.feesEarnedFraction = accrueInfo.value2
  kashiPairAccureInfo.save()
  return kashiPairAccureInfo
}

export function getKashiPairAccrueInfo(id: string): KashiPairAccrueInfo {
  return KashiPairAccrueInfo.load(id) as KashiPairAccrueInfo
}

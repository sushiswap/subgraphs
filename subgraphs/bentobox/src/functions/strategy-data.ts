import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BentoBox } from '../../generated/BentoBox/BentoBox'
import { StrategyData } from '../../generated/schema'
import { BENTOBOX_ADDRESS } from '../constants'

export function createStrategyData(tokenAddress: string): StrategyData {
  const data = new StrategyData(tokenAddress)
  data.strategyStartDate = BigInt.fromU32(0)
  data.targetPercentage = BigInt.fromU32(0)
  data.balance = BigInt.fromU32(0)
  data.save()
  return data
}

export function getStrategyData(tokenAddress: string): StrategyData {
  return StrategyData.load(tokenAddress) as StrategyData
}

export function getOrCreateStrategyData(tokenAddress: string): StrategyData {
  const strategyData = StrategyData.load(tokenAddress)

  if (strategyData === null) {
    return createStrategyData(tokenAddress)
  }

  return strategyData
}

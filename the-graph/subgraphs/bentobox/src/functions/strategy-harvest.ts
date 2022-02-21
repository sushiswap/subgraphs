import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { LogStrategyLoss, LogStrategyProfit } from '../../generated/BentoBox/BentoBox'
import { StrategyHarvest } from '../../generated/schema'

export function createProfitStrategyHarvest(
  strategyId: string,
  profit: BigDecimal,
  elastic: BigDecimal,
  event: LogStrategyProfit
): StrategyHarvest {
  return createStrategyHarvest(strategyId, profit, elastic, event.block.number, event.block.timestamp)
}

export function createLossStrategyHarvest(
  strategyId: string,
  loss: BigDecimal,
  elastic: BigDecimal,
  event: LogStrategyLoss
): StrategyHarvest {
  let _loss = BigDecimal.fromString('0').minus(loss)
  return createStrategyHarvest(strategyId, _loss, elastic, event.block.number, event.block.timestamp)
}

function createStrategyHarvest(
  strategyId: string,
  amount: BigDecimal,
  elastic: BigDecimal,
  blockNumber: BigInt,
  timestamp: BigInt
): StrategyHarvest {
  const strategyHarvest = new StrategyHarvest(getStrategyHarvestId(strategyId, blockNumber.toString()))
  strategyHarvest.strategy = strategyId
  strategyHarvest.profit = amount
  strategyHarvest.tokenElastic = elastic
  strategyHarvest.timestamp = timestamp
  strategyHarvest.block = blockNumber
  strategyHarvest.save()
  return strategyHarvest
}

export function getStrategyHarvestId(strategyId: string, blockNumber: string): string {
  return strategyId + '-' + blockNumber
}

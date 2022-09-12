import { ethereum } from '@graphprotocol/graph-ts'
import { Strategy } from '../../generated/schema'
import { createStrategyKpi } from './strategy-kpi'

export function createStrategy(strategyAddress: string, tokenAddress: string, event: ethereum.Event): Strategy {
  const strategy = new Strategy(strategyAddress)

  createStrategyKpi(strategyAddress)

  strategy.kpi = strategy.id
  strategy.token = tokenAddress
  strategy.block = event.block.number
  strategy.timestamp = event.block.timestamp
  strategy.save()

  return strategy
}

export function getStrategy(id: string): Strategy {
  return Strategy.load(id) as Strategy
}

export function getOrCreateStrategy(strategyAddress: string, tokenAddress: string, event: ethereum.Event): Strategy {
  let strategy = Strategy.load(strategyAddress)

  if (strategy === null) {
    return createStrategy(strategyAddress, tokenAddress, event)
  }

  return strategy
}

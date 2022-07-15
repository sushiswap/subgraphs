import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Harvest } from '../../generated/schema'
import { getOrCreateStrategyKpi, increaseHarvestCount } from './strategy-kpi'

export function createHarvest(
  id: string,
  strategyAddress: string,
  tokenAddress: string,
  event: ethereum.Event
): Harvest {
  const harvest = new Harvest(id)
  harvest.strategy = strategyAddress
  harvest.token = tokenAddress
  harvest.block = event.block.number
  harvest.timestamp = event.block.timestamp
  harvest.save()

  increaseHarvestCount(strategyAddress, event.block.timestamp)

  return harvest
}

export function getOrCreateHarvest(
  id: string,
  strategyAddress: string,
  tokenAddress: string,
  event: ethereum.Event
): Harvest {
  let harvest = Harvest.load(id)

  if (harvest === null) {
    harvest = createHarvest(id, strategyAddress, tokenAddress, event)
  }

  return harvest as Harvest
}

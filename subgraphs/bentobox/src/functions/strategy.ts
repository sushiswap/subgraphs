import { ethereum } from '@graphprotocol/graph-ts'
import { Strategy } from '../../generated/schema'

export function getOrCreateStrategy(strategyId: string, tokenId: string, block: ethereum.Block): Strategy {
  let strategy = Strategy.load(strategyId)

  if (strategy === null) {
    strategy = new Strategy(strategyId)
    strategy.token = tokenId
  }

  strategy.timestamp = block.timestamp
  strategy.block = block.number
  strategy.save()

  return strategy as Strategy
}

import { ethereum } from '@graphprotocol/graph-ts'
import { Farm } from '../../generated/schema'

export function getOrCreateFarm(id: string, event: ethereum.Event): Farm {
  let farm = Farm.load(id)

  if (farm === null) {
    farm = new Farm(id)
    farm.stakeToken = id
    farm.createdAtBlock = event.block.number
    farm.createdAtTimestamp = event.block.timestamp
    farm.save()
  }

  return farm as Farm
}

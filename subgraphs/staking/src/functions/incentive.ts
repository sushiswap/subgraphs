import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Incentive } from '../../generated/schema'

export function getOrCreateIncentive(id: string, event: ethereum.Event): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
    incentive.modifiedAtBlock = event.block.number
    incentive.modifiedAtTimestamp = event.block.timestamp
    incentive.save()
  }

  return incentive as Incentive
}

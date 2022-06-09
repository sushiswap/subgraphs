import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Incentive } from '../../generated/schema'

export function getOrCreateIncentive(id: string): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
    incentive.save()
  }

  return incentive as Incentive
}

export function updateRewards(incentive: Incentive, event: ethereum.Event): Incentive {
  if (incentive.liquidityStaked > BigInt.fromI32(0)) {
    let totalTime = incentive.endTime.minus(incentive.startTime)
    let passedTime = event.block.timestamp.minus(incentive.rewardsUpdatedAtTimestamp)
    let reward = incentive.rewardsRemaining.times(passedTime).div(totalTime)

    incentive.rewardsRemaining = incentive.rewardsRemaining.minus(reward)
    incentive.rewardsPaidOut = incentive.rewardsPaidOut.plus(reward)
    incentive.rewardsUpdatedAtTimestamp = event.block.timestamp
    incentive.rewardsUpdatedAtBlock = event.block.number
  } 
  return incentive
}

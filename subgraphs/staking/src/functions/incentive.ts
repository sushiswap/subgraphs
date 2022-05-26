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

export function accrueRewards(incentive: Incentive, timestamp: BigInt): Incentive {
  let maxTime = timestamp < incentive.endTime ? timestamp : incentive.endTime

  if (incentive.liquidityStaked > BigInt.fromI32(0) && incentive.lastRewardTime < maxTime) {
    let totalTime = incentive.endTime.minus(incentive.lastRewardTime)
    let passedTime = maxTime.minus(incentive.lastRewardTime)
    let reward = incentive.rewardRemaining.times(passedTime).div(totalTime)

    incentive.rewardRemaining = incentive.rewardRemaining.minus(reward)
    incentive.lastRewardTime = maxTime
  } else if (incentive.liquidityStaked == BigInt.fromI32(0)) {
    incentive.lastRewardTime = maxTime
  }
  return incentive
}

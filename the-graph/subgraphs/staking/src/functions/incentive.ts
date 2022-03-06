import { BigInt } from '@graphprotocol/graph-ts'
import { Incentive } from '../../generated/schema'
import { REWARD_PER_LIQUIDITY_MULTIPLIER } from '../../src/constants'

export function getOrCreateIncentive(id: string): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
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
    let rewardPerLiquidity = reward.times(REWARD_PER_LIQUIDITY_MULTIPLIER).div(incentive.liquidityStaked)

    incentive.rewardPerLiquidity = incentive.rewardPerLiquidity.plus(rewardPerLiquidity)
    incentive.rewardRemaining = incentive.rewardRemaining.minus(reward)
    incentive.lastRewardTime = maxTime
  } else if (incentive.liquidityStaked == BigInt.fromI32(0)) {
    incentive.lastRewardTime = maxTime
  }
  return incentive
}

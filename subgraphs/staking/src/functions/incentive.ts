import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Incentive } from '../../generated/schema'
import { toDecimal } from './number-converter'
import { getReward } from './reward'
import { getOrCreateStakePosition } from './stake-position'
import { getOrCreateToken } from './token'

export function getOrCreateIncentive(id: string): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
    incentive.save()
  }

  return incentive as Incentive
}

export function updateRewards(incentive: Incentive, event: ethereum.Event): Incentive {

  if (incentive.liquidityStaked.gt(BigInt.fromI32(0))) {
    let totalTime = incentive.endTime.minus(incentive.startTime)
    let passedTime = event.block.timestamp.minus(incentive.rewardsUpdatedAtTimestamp)
    let reward = incentive.rewardsRemaining.times(passedTime).div(totalTime)
    if (incentive.rewardsRemaining.gt(reward)) {
      incentive.rewardsRemaining = incentive.rewardsRemaining.minus(reward)
    } else {
      incentive.rewardsRemaining = BigInt.fromI32(0)
    }
    incentive.rewardsAccrued = incentive.rewardsAccrued.plus(reward)
    incentive.rewardsUpdatedAtTimestamp = event.block.timestamp
    incentive.rewardsUpdatedAtBlock = event.block.number
    let stakeToken = getOrCreateToken(incentive.stakeToken)

    let rewardCount = incentive.rewards ? incentive.rewards.length : 0
    for (let i = 0; i < rewardCount; i++) {
      let reward = getReward(incentive.rewards[i])
      let stakePosition = getOrCreateStakePosition(reward.user, incentive.stakeToken)
      const passedTime = event.block.timestamp.minus(reward.modifiedAtTimestamp)
      if (stakePosition.liquidity.gt(BigInt.fromU32(0)) && passedTime.gt(BigInt.fromU32(0))) {
        const share = toDecimal(stakePosition.liquidity, stakeToken.decimals)
        .div(toDecimal(incentive.liquidityStaked, stakeToken.decimals))
        const percentagePassed = passedTime.divDecimal(totalTime.toBigDecimal())

        reward.claimableAmount = reward.claimableAmount.plus(share.times(percentagePassed))
        reward.modifiedAtBlock = event.block.number
        reward.modifiedAtTimestamp = event.block.timestamp
        reward.save()
      }
    }
  }
  return incentive
}

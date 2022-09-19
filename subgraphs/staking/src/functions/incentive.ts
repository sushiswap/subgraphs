import { BigInt, ethereum } from '@graphprotocol/graph-ts'
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
    const isActive = event.block.timestamp.le(incentive.endTime)
    let currentTime = isActive ? event.block.timestamp : incentive.endTime
    let totalTime = incentive.endTime.minus(incentive.rewardsUpdatedAtTimestamp)
    let passedTime = currentTime.minus(incentive.rewardsUpdatedAtTimestamp)
    let rewardsAccrued = incentive.rewardsRemaining.times(passedTime).div(totalTime)
    if (isActive) {
      incentive.rewardsAccrued = incentive.rewardsAccrued.plus(rewardsAccrued)
      incentive.rewardsRemaining = incentive.rewardsRemaining.minus(rewardsAccrued)
      incentive.rewardsUpdatedAtTimestamp = event.block.timestamp
      incentive.rewardsUpdatedAtBlock = event.block.number
    } else if (incentive.rewardsRemaining.le(BigInt.fromI32(0))) {
      incentive.rewardsAccrued = incentive.rewardsAccrued.plus(incentive.rewardsRemaining)
      incentive.rewardsRemaining = BigInt.fromI32(0)
      incentive.rewardsUpdatedAtTimestamp = event.block.timestamp
      incentive.rewardsUpdatedAtBlock = event.block.number
    }

    let stakeToken = getOrCreateToken(incentive.stakeToken)
    let rewardToken = getOrCreateToken(incentive.rewardToken)

    let rewardCount = incentive.rewards ? incentive.rewards.length : 0
    for (let i = 0; i < rewardCount; i++) {
      let reward = getReward(incentive.rewards[i])
      let stakePosition = getOrCreateStakePosition(reward.user, incentive.stakeToken)

      if (stakePosition.liquidity.gt(BigInt.fromU32(0)) && reward.modifiedAtTimestamp.le(incentive.endTime)) {
        const share = toDecimal(stakePosition.liquidity, stakeToken.decimals).div(
          toDecimal(incentive.liquidityStaked, stakeToken.decimals)
        )

        const claimableAmount = toDecimal(rewardsAccrued, rewardToken.decimals).times(share)
        reward.claimableAmount = reward.claimableAmount.plus(claimableAmount)
        reward.modifiedAtBlock = event.block.number
        reward.modifiedAtTimestamp = event.block.timestamp
        reward.save()
      }
    }
  }
  return incentive
}

import { BigDecimal, BigInt, store } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import {
  Claim,
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Subscribe,
  Unstake,
  Unsubscribe,
} from '../../generated/Staking/Staking'
import {
  createClaimTransaction,
  createStakeTransaction,
  createUnstakeTransaction,
  getOrCreateFarm,
  getOrCreateIncentive,
  getOrCreateReward,
  getOrCreateRewardClaim,
  getOrCreateStakePosition,
  getOrCreateSubscription,
  getOrCreateToken,
  getOrCreateUser,
  getSubscription,
  getSubscriptionByIncentiveId,
  updateRewards,
} from '../../src/functions'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let creator = getOrCreateUser(event.params.creator.toHex())
  let rewardToken = getOrCreateToken(event.params.rewardToken.toHex())
  let token = getOrCreateToken(event.params.token.toHex())
  let farm = getOrCreateFarm(event.params.token.toHex(), event)

  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive.farm = farm.id
  incentive.createdBy = creator.id
  incentive.stakeToken = token.id
  incentive.rewardToken = rewardToken.id
  incentive.endTime = event.params.endTime
  incentive.startTime = event.params.startTime
  incentive.rewardsRemaining = event.params.amount
  incentive.createdAtBlock = event.block.number
  incentive.createdAtTimestamp = event.block.timestamp
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.rewardsUpdatedAtBlock = event.block.number
  incentive.rewardsUpdatedAtTimestamp = event.block.timestamp
  incentive.save()
}

export function onIncentiveUpdated(event: IncentiveUpdated): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  updateRewards(incentive, event)

  let newStartTime = event.params.newStartTime.toI32()
  let newEndTime = event.params.newEndTime.toI32()
  let timestamp = event.block.timestamp.toI32()
  let changeAmount = event.params.changeAmount

  if (newStartTime != 0) {
    if (newStartTime < timestamp) {
      newStartTime = timestamp
    }
    incentive.startTime = BigInt.fromI32(newStartTime)
  }

  if (newEndTime != 0) {
    if (newEndTime < timestamp) {
      newEndTime = timestamp
    }
    incentive.endTime = BigInt.fromI32(newEndTime)
  }

  let zero = BigInt.fromU32(0)
  if (changeAmount > zero) {
    incentive.rewardsRemaining = incentive.rewardsRemaining.plus(event.params.changeAmount)
  } else if (changeAmount < zero) {
    let amount = changeAmount.abs()
    if (amount > incentive.rewardsRemaining) {
      incentive.rewardsRemaining = zero
    } else {
      incentive.rewardsRemaining = incentive.rewardsRemaining.minus(amount)
    }
  }

  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()
}

export function onStake(event: Stake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())
  createStakeTransaction(event)

  let stakePosition = getOrCreateStakePosition(user.id, token.id)
  stakePosition.liquidity = stakePosition.liquidity.plus(event.params.amount)
  stakePosition.user = user.id
  stakePosition.token = token.id
  stakePosition.createdAtBlock = event.block.number
  stakePosition.createdAtTimestamp = event.block.timestamp
  stakePosition.modifiedAtBlock = event.block.number
  stakePosition.modifiedAtTimestamp = event.block.timestamp
  stakePosition.save()

  for (let i = 1; i <= user.totalSubscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)
      updateRewards(incentive, event)
      incentive.liquidityStaked = incentive.liquidityStaked.plus(event.params.amount)
      incentive.modifiedAtBlock = event.block.number
      incentive.modifiedAtTimestamp = event.block.timestamp
      incentive.save()
    }
  }
}

export function onUnstake(event: Unstake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())
  createUnstakeTransaction(event.params.token.toHex(), event)

  let stakePosition = getOrCreateStakePosition(user.id, token.id)
  stakePosition.liquidity = stakePosition.liquidity.minus(event.params.amount)
  stakePosition.user = user.id
  stakePosition.createdAtBlock = event.block.number
  stakePosition.createdAtTimestamp = event.block.timestamp
  stakePosition.modifiedAtBlock = event.block.number
  stakePosition.modifiedAtTimestamp = event.block.timestamp
  stakePosition.save()

  for (let i = 1; i <= user.totalSubscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)
      updateRewards(incentive, event)
      incentive.liquidityStaked = incentive.liquidityStaked.minus(event.params.amount)
      incentive.modifiedAtBlock = event.block.number
      incentive.modifiedAtTimestamp = event.block.timestamp
      incentive.save()
    }
  }
}

export function onSubscribe(event: Subscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  updateRewards(incentive, event)
  let user = getOrCreateUser(event.params.user.toHex())
  let stakePosition = getOrCreateStakePosition(user.id, incentive.stakeToken)

  user.totalSubscriptionCount = user.totalSubscriptionCount.plus(BigInt.fromU32(1))
  user.activeSubscriptionCount = user.activeSubscriptionCount.plus(BigInt.fromU32(1))
  user.save()

  let reward = getOrCreateReward(user.id, incentive.id)
  reward.user = user.id
  reward.token = incentive.rewardToken
  reward.incentive = incentive.id
  reward.createdAtBlock = event.block.number
  reward.createdAtTimestamp = event.block.timestamp
  reward.modifiedAtBlock = event.block.number
  reward.modifiedAtTimestamp = event.block.timestamp
  reward.save()

  const rewards = incentive.rewards
  rewards.push(reward.id)
  incentive.rewards = rewards

  let subscription = getOrCreateSubscription(user.id, user.totalSubscriptionCount.toString())

  subscription.user = user.id
  subscription.incentive = event.params.id.toString()
  subscription.createdAtBlock = event.block.number
  subscription.createdAtTimestamp = event.block.timestamp
  subscription.token = incentive.stakeToken
  subscription.save()

  incentive.liquidityStaked = incentive.liquidityStaked.plus(stakePosition.liquidity)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()
}

export function onUnsubscribe(event: Unsubscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  updateRewards(incentive, event)
  let user = getOrCreateUser(event.params.user.toHex())
  user.activeSubscriptionCount = user.activeSubscriptionCount.minus(BigInt.fromU32(1))
  user.save()
  let stakePosition = getOrCreateStakePosition(user.id, incentive.stakeToken)

  let reward = getOrCreateReward(user.id, incentive.id)
  const rewards = incentive.rewards

  for (var i = 0; i < rewards.length; i++) {
    if (rewards[i] == reward.id) {
      rewards.splice(i, 1)
      incentive.rewards = rewards
      break
    }
  }

  incentive.liquidityStaked = incentive.liquidityStaked.minus(stakePosition.liquidity)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()

  let subscription = getSubscriptionByIncentiveId(user, event.params.id.toString())
  if (subscription !== null) {
    store.remove('_Subscription', subscription.id)
  } else {
    log.error('onUnsubscribe: Missing subscription, inconsistent subgraph state.', [])
  }
}

export function onClaim(event: Claim): void {
  let user = getOrCreateUser(event.params.user.toHex())
  let incentive = getOrCreateIncentive(event.params.id.toString())
  createClaimTransaction(incentive, event)
  
  updateRewards(incentive, event)
  incentive.modifiedAtBlock = event.block.number
  incentive.modifiedAtTimestamp = event.block.timestamp
  incentive.save()

  user.rewardClaimCount = user.rewardClaimCount.plus(BigInt.fromI32(1))
  user.save()

  let reward = getOrCreateReward(user.id, incentive.id)
  reward.claimableAmount = BigDecimal.fromString('0')
  reward.claimedAmount = reward.claimedAmount.plus(event.params.amount)
  reward.modifiedAtBlock = event.block.number
  reward.modifiedAtTimestamp = event.block.timestamp
  reward.save()

  let rewardClaim = getOrCreateRewardClaim(user.id, user.rewardClaimCount.toString())
  rewardClaim.token = incentive.rewardToken
  rewardClaim.user = user.id
  rewardClaim.incentive = incentive.id
  rewardClaim.amount = event.params.amount
  rewardClaim.save()
}

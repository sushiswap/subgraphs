import { BigInt, store } from '@graphprotocol/graph-ts'
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
import { DEFAULT_REWARD_PER_LIQUIDITY } from '../../src/constants'
import {
  accrueRewards,
  getOrCreateIncentive,
  getOrCreateRewardClaim,
  getOrCreateStake,
  getOrCreateSubscription,
  getOrCreateToken,
  getOrCreateUser,
  getSubscription,
  getSubscriptionByIncentiveId,
} from '../../src/functions'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let creator = getOrCreateUser(event.params.creator.toHex())
  let rewardToken = getOrCreateToken(event.params.rewardToken.toHex())
  let token = getOrCreateToken(event.params.token.toHex())

  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive.creator = creator.id
  incentive.token = token.id
  incentive.rewardToken = rewardToken.id
  incentive.lastRewardTime = event.params.startTime
  incentive.endTime = event.params.endTime
  incentive.rewardPerLiquidity = DEFAULT_REWARD_PER_LIQUIDITY
  incentive.rewardRemaining = event.params.amount
  incentive.block = event.block.number
  incentive.timestamp = event.block.timestamp

  incentive.save()
}

export function onIncentiveUpdated(event: IncentiveUpdated): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive = accrueRewards(incentive, event.block.timestamp)

  let newStartTime = event.params.newStartTime.toI32()
  let newEndTime = event.params.newEndTime.toI32()
  let timestamp = event.block.timestamp.toI32()
  let changeAmount = event.params.changeAmount

  if (newStartTime != 0) {
    if (newStartTime < timestamp) {
      newStartTime = timestamp
    }
    incentive.lastRewardTime = BigInt.fromI32(newStartTime)
  }

  if (newEndTime != 0) {
    if (newEndTime < timestamp) {
      newEndTime = timestamp
    }
    incentive.endTime = BigInt.fromI32(newEndTime)
  }

  let zero = BigInt.fromU32(0 as u8)
  if (changeAmount > zero) {
    incentive.rewardRemaining = incentive.rewardRemaining.plus(event.params.changeAmount)
  } else if (changeAmount < zero) {
    let amount = changeAmount.abs()
    if (amount > incentive.rewardRemaining) {
      incentive.rewardRemaining = zero
    } else {
      incentive.rewardRemaining = incentive.rewardRemaining.minus(amount)
    }
  }
  incentive.save()
}

export function onStake(event: Stake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.plus(event.params.amount)
  stake.user = user.id
  stake.token = token.id
  stake.block = event.block.number
  stake.timestamp = event.block.timestamp
  stake.save()

  for (let i = 1; i <= user.subscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)
      incentive = accrueRewards(incentive, event.block.timestamp)

      incentive.liquidityStaked = incentive.liquidityStaked.plus(event.params.amount)
      incentive.save()
    }
  }
}

export function onUnstake(event: Unstake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.minus(event.params.amount)
  stake.user = user.id
  stake.block = event.block.number
  stake.timestamp = event.block.timestamp
  stake.save()

  for (let i = 1; i <= user.subscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)

      incentive = accrueRewards(incentive, event.block.timestamp)
      incentive.liquidityStaked = incentive.liquidityStaked.minus(event.params.amount)
      incentive.save()
    }
  }
}

export function onSubscribe(event: Subscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive = accrueRewards(incentive, event.block.timestamp)
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, incentive.token)

  incentive.liquidityStaked = incentive.liquidityStaked.plus(stake.liquidity)
  incentive.save()

  user.subscriptionCount = user.subscriptionCount.plus(BigInt.fromU32(1 as u8))
  user.save()

  let subscription = getOrCreateSubscription(user.id, user.subscriptionCount.toString())

  subscription.user = user.id
  subscription.incentive = event.params.id.toString()
  subscription.rewardPerLiquidity = incentive.rewardPerLiquidity
  subscription.block = event.block.number
  subscription.timestamp = event.block.timestamp
  subscription.token = incentive.token
  subscription.save()
}

export function onUnsubscribe(event: Unsubscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive = accrueRewards(incentive, event.block.timestamp)
  let user = getOrCreateUser(event.params.user.toHex())
  let stake = getOrCreateStake(user.id, incentive.token)

  incentive.liquidityStaked = incentive.liquidityStaked.minus(stake.liquidity)
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
  incentive = accrueRewards(incentive, event.block.timestamp)
  incentive.save()
  let subscription = getSubscriptionByIncentiveId(user, incentive.id)

  if (subscription !== null) {
    subscription.rewardPerLiquidity = incentive.rewardPerLiquidity
    subscription.save()
  } else {
    log.error('onClaim: Missing subscription, inconsistent subgraph state. Skipping event', [])
    return
  }

  user.rewardClaimCount = user.rewardClaimCount.plus(BigInt.fromI32(1 as u8))
  user.save()

  let rewardClaim = getOrCreateRewardClaim(user.id, user.rewardClaimCount.toString())
  rewardClaim.token = incentive.rewardToken
  rewardClaim.user = user.id
  rewardClaim.incentive = incentive.id
  rewardClaim.amount = event.params.amount
  rewardClaim.save()
}

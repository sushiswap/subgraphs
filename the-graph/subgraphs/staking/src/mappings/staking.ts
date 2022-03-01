import { BigInt, store } from '@graphprotocol/graph-ts'
import {
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Subscribe,
  Unstake,
  Unsubscribe,
} from '../../generated/Staking/Staking'
import {
  getOrCreateIncentive,
  getOrCreateStake,
  getOrCreateSubscription,
  getOrCreateToken,
  getOrCreateUser,
  getSubscriptionId,
  isSubscribed,
} from '../../src/functions'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let creator = getOrCreateUser(event.params.creator.toHex())
  let rewardToken = getOrCreateToken(event.params.rewardToken.toHex())
  let token = getOrCreateToken(event.params.token.toHex())

  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive.creator = creator.id
  incentive.pool = token.id
  incentive.rewardToken = rewardToken.id
  incentive.lastRewardTime = event.params.startTime
  incentive.endTime = event.params.endTime
  incentive.rewardPerLiquidity = BigInt.fromU32(1)
  incentive.rewardRemaining = event.params.amount

  incentive.save()

  // TODO: owner should get a stake entity? liquidity? check contract
}

export function onIncentiveUpdated(event: IncentiveUpdated): void {
  //   if (
  //     incentive.liquidityStaked > 0 &&
  //     incentive.lastRewardTime < maxTime
  // ) {
  // incentive.rewardPerLiquidity += reward * type(uint112).max / incentive.liquidityStaked;
  // incentive.rewardRemaining -= uint112(reward);
  // incentive.lastRewardTime = uint32(maxTime);
  //   else if (incentive.liquidityStaked == 0) {
  //     incentive.lastRewardTime = uint32(maxTime);
  // }
  // claimReward}
}

export function onStake(event: Stake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.plus(event.params.amount)
  stake.user = user.id
  stake.save()

  //TODO: accrue rewards, claim

  let incentives = user.incentives
  if (incentives === null) {
    return
  }

  for (let i = 0; i < incentives.length; i++) {
    let incentiveId = incentives[i]
    if (isSubscribed(user.id, incentiveId)) {
      let incentive = getOrCreateIncentive(incentiveId)
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
  stake.save()
}

export function onSubscribe(event: Subscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())

  let stake = getOrCreateStake(event.params.user.toHex(), incentive.pool)

  incentive.liquidityStaked = incentive.liquidityStaked.plus(stake.liquidity)
  incentive.save()

  let subscription = getOrCreateSubscription(event.params.user.toHex(), event.params.id.toString())

  subscription.user = event.params.user.toHex()
  subscription.incentive = event.params.id.toString()
  subscription.save()

  //TODO: accrueRewards
}

export function onUnsubscribe(event: Unsubscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())

  let stake = getOrCreateStake(event.params.user.toHex(), incentive.pool)

  incentive.liquidityStaked = incentive.liquidityStaked.minus(stake.liquidity)
  incentive.save()

  //TODO: accrueRewards
  //TODO: CLAIM REWARDS - ignore flag?

  //TODO: Soft delete instead? Use case?
  store.remove('Subscription', getSubscriptionId(event.params.user.toHex(), event.params.id.toString()))
}

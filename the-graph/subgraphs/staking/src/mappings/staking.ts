import { BigInt, log, store } from '@graphprotocol/graph-ts'
import { logStore } from 'matchstick-as'
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
  getSubscription,
  getSubscriptionId,
  isSubscribed,
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

  for (let i = 1; i <= user.subscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)
      incentive.liquidityStaked = incentive.liquidityStaked.plus(event.params.amount)
      incentive.save()
    }
  }

  //TODO: accrue rewards, claim
}

export function onUnstake(event: Unstake): void {
  let token = getOrCreateToken(event.params.token.toHex())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, token.id)
  stake.liquidity = stake.liquidity.minus(event.params.amount)
  stake.user = user.id
  stake.save()

  for (let i = 1; i <= user.subscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())

    if (subscription !== null) {
      let incentive = getOrCreateIncentive(subscription.incentive)
      incentive.liquidityStaked = incentive.liquidityStaked.minus(event.params.amount)
      incentive.save()
    }
  }
}

export function onSubscribe(event: Subscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  let user = getOrCreateUser(event.params.user.toHex())

  let stake = getOrCreateStake(user.id, incentive.token)

  incentive.liquidityStaked = incentive.liquidityStaked.plus(stake.liquidity)
  incentive.save()

  user.subscriptionCount = user.subscriptionCount.plus(BigInt.fromU32(1 as u8))
  user.save()

  let subscription = getOrCreateSubscription(user.id, user.subscriptionCount.toString())

  subscription.user = user.id
  subscription.incentive = event.params.id.toString()
  subscription.save()

  //TODO: accrueRewards
}

export function onUnsubscribe(event: Unsubscribe): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  let user = getOrCreateUser(event.params.user.toHex())
  let stake = getOrCreateStake(user.id, incentive.token)

  incentive.liquidityStaked = incentive.liquidityStaked.minus(stake.liquidity)
  incentive.save()
  for (let i = 1; i <= user.subscriptionCount.toI32(); i++) {
    let subscription = getSubscription(user.id, i.toString())
    if (subscription !== null && subscription.incentive == event.params.id.toString()) {
      store.remove('Subscription', subscription.id)
      break
    }
  }

  //TODO: accrueRewards
  //TODO: CLAIM REWARDS - ignore flag?

  //TODO: Soft delete instead? Use case?

  // store.remove('Subscription', getSubscriptionId(user.id, ))
}

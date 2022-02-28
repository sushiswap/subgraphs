import {
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Staking,
  Subscribe,
  Unstake,
  Unsubscribe,
} from '../../generated/Staking/Staking'

import { BigInt, store } from '@graphprotocol/graph-ts'
import { getOrCreateToken } from '../../src/functions/token'
import { getOrCreateStake } from '../../src/functions/staking'
import { getOrCreateIncentive } from '../../src/functions/incentive'
import { getOrCreateSubscription, getSubscriptionId } from '../../src/functions/subscription'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())
  incentive.creator = event.params.creator.toHex()
  incentive.pool = event.params.token.toHex()
  incentive.rewardToken = event.params.rewardToken.toHex()
  incentive.lastRewardTime = event.params.startTime
  incentive.endTime = event.params.endTime
  incentive.rewardPerLiquidity = BigInt.fromU32(1)
  incentive.rewardRemaining = event.params.amount

  getOrCreateToken(event.params.rewardToken.toHex())
  incentive.save()
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
  getOrCreateToken(event.params.token.toHex())

  let stake = getOrCreateStake(event.params.user.toHex(), event.params.token.toHex())
  stake.liquidity = stake.liquidity.plus(event.params.amount)
  stake.user = event.params.user.toHex()
  stake.save()

  //TODO: accrue rewards
}

export function onUnstake(event: Unstake): void {
  getOrCreateToken(event.params.token.toHex())

  let stake = getOrCreateStake(event.params.user.toHex(), event.params.token.toHex())
  stake.liquidity = stake.liquidity.minus(event.params.amount)
  stake.user = event.params.user.toHex()
  stake.save()
}

export function onUnsubscribe(event: Unsubscribe): void {
  store.remove('Subscription', getSubscriptionId(event.params.user.toHex(), event.params.id.toString()))
}

export function onSubscribe(event: Subscribe): void {
  let subscription = getOrCreateSubscription(event.params.user.toHex(), event.params.id.toString())

  subscription.user = event.params.user.toHex()
  subscription.incentive = event.params.id.toString()
  subscription.save()
}

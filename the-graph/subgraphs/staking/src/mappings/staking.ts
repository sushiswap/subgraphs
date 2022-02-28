import {
  IncentiveCreated,
  IncentiveUpdated,
  Stake,
  Staking,
  Subscribe,
  Unstake,
  Unsubscribe,
} from '../../generated/Staking/Staking'

import { BigInt } from '@graphprotocol/graph-ts'
import { getOrCreateToken } from '../../src/functions/token'
import { getOrCreateStake } from '../../src/functions/staking'
import { getOrCreateIncentive } from '../../src/functions/incentive'

export function onIncentiveCreated(event: IncentiveCreated): void {
  let incentive = getOrCreateIncentive(event.params.id.toString())

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
  // claimReward
}

export function onIncentiveUpdated(event: IncentiveUpdated): void {}

export function onStake(event: Stake): void {
  getOrCreateToken(event.params.token.toHex())

  let stake = getOrCreateStake(event.params.user.toHex(), event.params.token.toHex())
  stake.liquidity = stake.liquidity.plus(event.params.amount)
  stake.user = event.params.user.toHex()
  stake.save()
}


export function onUnstake(event: Unstake): void {
  getOrCreateToken(event.params.token.toHex())

  let stake = getOrCreateStake(event.params.user.toHex(), event.params.token.toHex())
  stake.liquidity = stake.liquidity.minus(event.params.amount)
  stake.user = event.params.user.toHex()
  stake.save()
}

export function onUnsubscribe(event: Unsubscribe): void {}

export function onSubscribe(event: Subscribe): void {
  
}
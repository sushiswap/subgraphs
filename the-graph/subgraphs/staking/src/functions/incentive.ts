import { Incentive } from '../../generated/schema'
import { IncentiveCreated } from '../../generated/Staking/Staking'

export function getOrCreateIncentive(id: string): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
    incentive.save()
  }

  return incentive as Incentive
}

export function createIncentive(event: IncentiveCreated): Incentive {
//   let incentive = new Incentive(event.params.id.toString())
//   incentive.creator = event.params.creator.toHex()
//   incentive = event.params.token.toHex()
//   incentive.creator = event.params.creator.toHex()
//   incentive.creator = event.params.creator.toHex()
//   incentive.save()

//   return incentive as Incentive
}

// incentives[incentiveId] = Incentive({
//     creator: msg.sender,
//     token: token,
//     rewardToken: rewardToken,
//     lastRewardTime: startTime,
//     endTime: endTime,
//     rewardRemaining: rewardAmount,
//     liquidityStaked: 0,
//     rewardPerLiquidity: 1
// });

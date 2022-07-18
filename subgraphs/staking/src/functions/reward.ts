import { Reward } from '../../generated/schema'

export function getOrCreateReward(userId: string, incentiveId: string): Reward {
  const id = getRewardId(userId, incentiveId)
  let reward = Reward.load(id)

  if (reward === null) {
    reward = new Reward(id)
    reward.save()
  }

  return reward as Reward
}


export function getReward(id: string): Reward {
  return Reward.load(id) as Reward
}

export function getRewardId(userId: string, incentiveId: string): string {
  return userId.concat(':').concat(incentiveId)
}

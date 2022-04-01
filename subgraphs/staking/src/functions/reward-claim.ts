import { RewardClaim } from '../../generated/schema'

export function getOrCreateRewardClaim(userId: string, index: string): RewardClaim {
  let id = getRewardClaimId(userId, index)
  let rewardClaim = RewardClaim.load(id)

  if (rewardClaim === null) {
    rewardClaim = new RewardClaim(id)
    rewardClaim.save()
  }

  return rewardClaim as RewardClaim
}

export function getRewardClaimId(userId: string, index: string): string {
  return userId.concat(':').concat(index)
}

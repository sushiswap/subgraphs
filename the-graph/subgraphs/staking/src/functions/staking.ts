import { Stake } from '../../generated/schema'

export function getOrCreateStake(userId: string, tokenId: string): Stake {
  const id = getStakeId(userId, tokenId)
  let stake = Stake.load(id)

  if (stake === null) {
    stake = new Stake(id)
    stake.save()
  }

  return stake as Stake
}

export function getStakeId(userId: string, tokenId: string): string {
  return userId.concat(':').concat(tokenId)
}

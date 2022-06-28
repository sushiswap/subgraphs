import { StakePosition } from '../../generated/schema'

export function getOrCreateStakePosition(userId: string, tokenId: string): StakePosition {
  const id = getStakePositionId(userId, tokenId)
  let stake = StakePosition.load(id)

  if (stake === null) {
    stake = new StakePosition(id)
    stake.farm = tokenId
    stake.save()
  }

  return stake as StakePosition
}

export function getStakePositionId(userId: string, tokenId: string): string {
  return userId.concat(':').concat(tokenId)
}

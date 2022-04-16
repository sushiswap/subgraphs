import { UserAuction } from '../../../generated/schema'

export function getOrCreateUserAuction(userId: string, auctionId: string): UserAuction {
  const id = userId.concat(':').concat(auctionId)
  let userAuction = UserAuction.load(id)

  if (userAuction == null) {
    userAuction = new UserAuction(id)
    userAuction.user = userId
    userAuction.auction = auctionId
    userAuction.save()
  }

  return userAuction
}

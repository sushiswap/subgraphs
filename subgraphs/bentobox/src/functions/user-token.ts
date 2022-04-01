import { Token, UserToken } from '../../generated/schema'

export function getOrCreateUserToken(userId: string, token: Token): UserToken {
  let userToken = UserToken.load(getUserTokenId(userId, token.id))

  if (userToken === null) {
    userToken = new UserToken(getUserTokenId(userId, token.id))
    userToken.user = userId
    userToken.token = token.id
  }

  userToken.save()

  return userToken as UserToken
}

export function getUserTokenId(userId: string, tokenId: string): string {
  return userId.concat('-').concat(tokenId)
}

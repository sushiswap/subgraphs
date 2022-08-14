import { BIG_INT_ONE } from '../constants'
import { TokenPair } from '../../generated/schema'
import { getOrCreateToken } from './token'

export function createTokenPair(tokenId: string, pairId: string): TokenPair {

  let token = getOrCreateToken(tokenId)
  const id = tokenId.concat(":").concat(token.pairCount.toString())
  let tokenPair = new TokenPair(id)
  tokenPair.token = id
  tokenPair.pair = pairId
  tokenPair.token = tokenId
  tokenPair.save()
  token.pairCount = token.pairCount.plus(BIG_INT_ONE)
  token.save()

  return tokenPair as TokenPair
}

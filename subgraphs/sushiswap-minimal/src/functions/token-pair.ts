import { BIG_INT_ONE } from '../constants'
import { _TokenPair } from '../../generated/schema'
import { getOrCreateToken } from './token'

export function createTokenPair(tokenId: string, pairId: string): _TokenPair {
  let token = getOrCreateToken(tokenId)
  const id = tokenId.concat(':').concat(token.pairCount.toString())
  let tokenPair = new _TokenPair(id)
  tokenPair.token = id
  tokenPair.pair = pairId
  tokenPair.token = tokenId
  tokenPair.save()
  token.pairCount = token.pairCount.plus(BIG_INT_ONE)
  token.save()

  return tokenPair as _TokenPair
}

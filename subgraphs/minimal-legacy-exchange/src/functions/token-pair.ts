import { BigInt } from '@graphprotocol/graph-ts'
import { TokenPair } from '../../generated/schema'
import { getTokenPrice } from './token-price'

export function createTokenPair(tokenId: string, pairId: string): TokenPair {

  let tokenPrice = getTokenPrice(tokenId)
  const id = tokenId.concat(":").concat(tokenPrice.pairCount.toString())
  let tokenPair = new TokenPair(id)
  tokenPair.token = id
  tokenPair.pair = pairId
  tokenPair.token = tokenId
  tokenPair.save()
  tokenPrice.pairCount = tokenPrice.pairCount.plus(BigInt.fromU32(1))
  tokenPrice.save()

  return tokenPair as TokenPair
}

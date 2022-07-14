import { BigInt } from '@graphprotocol/graph-ts'
import { TokenPair } from '../../generated/schema'
import { getTokenKpi } from './token-kpi'

export function createTokenPair(tokenId: string, pairId: string): TokenPair {
  let tokenKpi = getTokenKpi(tokenId)
  const id = tokenId.concat(':').concat(tokenKpi.pairCount.toString())
  let tokenPair = new TokenPair(id)
  tokenPair.token = id
  tokenPair.pair = pairId
  tokenPair.token = tokenId
  tokenPair.save()
  tokenKpi.pairCount = tokenKpi.pairCount.plus(BigInt.fromU32(1))
  tokenKpi.save()

  return tokenPair as TokenPair
}

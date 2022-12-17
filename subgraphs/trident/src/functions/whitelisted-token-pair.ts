import { Token, _TokenPair, _WhitelistedTokenPair } from '../../generated/schema'
import { BIG_INT_ONE, WHITELISTED_TOKEN_ADDRESSES } from '../constants'
import { getOrCreateToken } from './token'

/**
 * Create an entity to track whitelisted pairs.
 * Example: if token0 is USDC, and token1 is ABC. USDC is whitelisted, ABC is NOT. 
 * Then for ABC, we create a new entity to track the pair with USDC. But for USDC, we don't create a new entity, because ABC is not whitelisted.
 * @param token0 
 * @param token1 
 * @param pairId 
 */
export function createWhitelistedTokenPairs(token0Id: string, token1Id: string, pairId: string): void {

  if (WHITELISTED_TOKEN_ADDRESSES.includes(token1Id)) {
    let token0 = getOrCreateToken(token0Id)
    const id = token0.id.concat(":").concat(token0.whitelistedPairCount.toString())
    let tokenPair = new _WhitelistedTokenPair(id)
    tokenPair.token = id
    tokenPair.pair = pairId
    tokenPair.token = token0.id
    tokenPair.save()
    token0.whitelistedPairCount = token0.whitelistedPairCount.plus(BIG_INT_ONE)
    token0.save()
  }

  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0Id)) {
    let token1 = getOrCreateToken(token1Id)
    const id = token1.id.concat(":").concat(token1.whitelistedPairCount.toString())
    let tokenPair = new _WhitelistedTokenPair(id)
    tokenPair.token = id
    tokenPair.pair = pairId
    tokenPair.token = token1.id
    tokenPair.save()
    token1.whitelistedPairCount = token1.whitelistedPairCount.plus(BIG_INT_ONE)
    token1.save()
  }

}

import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from '../constants'
import { TokenPrice } from '../../generated/schema'
import { createRebase } from './rebase'

export function createTokenPrice(id: string): TokenPrice {
  let price = new TokenPrice(id)
  price.token = id
  price.derivedNative = BIG_DECIMAL_ZERO
  price.liquidity = BIG_DECIMAL_ZERO
  price.pairCount = BIG_INT_ZERO
  price.lastUsdPrice = BIG_DECIMAL_ZERO
  price.save()

  return price as TokenPrice
}

export function getTokenPrice(id: string): TokenPrice {
  return TokenPrice.load(id) as TokenPrice
}

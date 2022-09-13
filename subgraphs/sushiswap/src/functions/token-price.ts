import { TokenPrice } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from '../constants'

export function createTokenPrice(id: string): TokenPrice {
  let price = new TokenPrice(id)
  price.token = id
  price.derivedNative = BIG_DECIMAL_ZERO
  price.lastUsdPrice = BIG_DECIMAL_ZERO
  price.pricedOffPairUpdatedAtTimestamp = BIG_INT_ZERO
  price.save()

  return price as TokenPrice
}

export function getTokenPrice(id: string): TokenPrice {
  return TokenPrice.load(id) as TokenPrice
}

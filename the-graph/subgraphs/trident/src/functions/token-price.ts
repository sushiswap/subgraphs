import { TokenPrice } from '../../generated/schema'

export function createTokenPrice(token: string): TokenPrice {
  const tokenPrice = new TokenPrice(token)
  tokenPrice.save()
  return tokenPrice
}

export function getTokenPrice(token: string): TokenPrice | null {
  return TokenPrice.load(token)
}

export function getOrCreateTokenPrice(token: string): TokenPrice {
  const tokenPrice = getTokenPrice(token)

  if (tokenPrice === null) {
    return createTokenPrice(token)
  }

  return tokenPrice as TokenPrice
}

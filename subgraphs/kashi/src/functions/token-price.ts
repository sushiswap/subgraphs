import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS, BTC_ADDRESSES, ETH_ADDRESSES, NATIVE_ADDRESS, STABLE_ADDRESSES } from '../constants'
import { Price } from '../../generated/schema'

export function createTokenPrice(token: string): Price {
  const price = new Price(token)
  price.token = token
  price.bentoBox = BENTOBOX_ADDRESS.toHex()
  price.native = BigDecimal.fromString(NATIVE_ADDRESS == token ? '1' : '0')
  price.eth = BigDecimal.fromString(ETH_ADDRESSES.includes(token) ? '1' : '0')
  price.btc = BigDecimal.fromString(BTC_ADDRESSES.includes(token) ? '1' : '0')
  price.usd = BigDecimal.fromString(STABLE_ADDRESSES.includes(token) ? '1' : '0')
  price.save()
  return price as Price
}

export function getTokenPrice(token: string): Price {
  return Price.load(token) as Price
}

export function getOrCreateTokenPrice(token: string): Price {
  const price = Price.load(token)

  if (price === null) {
    return createTokenPrice(token)
  }

  return price
}

export function updateTokenPrice(token: string): Price {
  const price = Price.load(token)
  // TODO:
  return price as Price
}

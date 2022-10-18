import { BigInt, log } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS } from '../constants'
import { Price } from '../../generated/schema'

export function createTokenPrice(token: string): Price {
  const price = new Price(token)
  price.token = token
  price.bentoBox = BENTOBOX_ADDRESS.toHex()
  price.eth = BigInt.fromU32(0)
  price.usd = BigInt.fromU32(0)
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

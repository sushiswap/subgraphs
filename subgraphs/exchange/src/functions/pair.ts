import { Address } from '@graphprotocol/graph-ts'
import { PairCreated__Params } from '../../generated/Factory/Factory'
import { getOrCreateToken } from './token'
import { Pair } from '../../generated/schema'
import { FACTORY_ADDRESS, WHITELISTED_TOKEN_ADDRESSES } from '../constants/index'
import { Pair as PairTemplate } from '../../generated/templates'

export function createPair(params: PairCreated__Params): Pair {
  const id = params.pair.toHex()

  const token0 = getOrCreateToken(params.token0.toHex())
  const token1 = getOrCreateToken(params.token1.toHex())

  const pair = new Pair(id)

  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id)) {
    const newPairs = token1.whitelistPairs
    newPairs.push(pair.id)
    token1.whitelistPairs = newPairs
  }
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    const newPairs = token0.whitelistPairs
    newPairs.push(pair.id)
    token0.whitelistPairs = newPairs
  }

  token0.save()
  token1.save()

  pair.factory = FACTORY_ADDRESS.toHex()

  pair.name = token0.symbol.concat('-').concat(token1.symbol)

  pair.token0 = token0.id
  pair.token1 = token1.id

  pair.timestamp = params._event.block.timestamp
  pair.block = params._event.block.number

  pair.save()

  // create the tracked contract based on the template
  PairTemplate.create(params.pair)

  return pair as Pair
}

export function getPair(address: Address): Pair {
  return Pair.load(address.toHex()) as Pair
}

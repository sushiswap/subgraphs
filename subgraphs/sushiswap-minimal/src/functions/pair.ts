import { PairCreated } from '../../generated/Factory/Factory'
import { Pair } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { BIG_INT_ONE, BIG_INT_ZERO, LEGACY, PairType, SWAP_FEE, TWAP_ENABLED } from '../constants'
import { getOrCreateFactory } from './factory'
import { getOrCreateToken } from './token'
import { createTokenPair } from './token-pair'

export function createPair(event: PairCreated): Pair {
  const id = event.params.pair.toHex()

  let token0 = getOrCreateToken(event.params.token0.toHex())
  let token1 = getOrCreateToken(event.params.token1.toHex())

  const pair = new Pair(id)

  createTokenPair(token0.id, id)
  createTokenPair(token1.id, id)

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.type = PairType.CONSTANT_PRODUCT_POOL
  pair.swapFee = SWAP_FEE
  pair.twapEnabled = TWAP_ENABLED
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.source = LEGACY

  pair.createdAtTimestamp = event.block.timestamp
  pair.createdAtBlock = event.block.number

  pair.reserve0 = BIG_INT_ZERO
  pair.reserve1 = BIG_INT_ZERO
  pair.save()

  const factory = getOrCreateFactory()
  factory.pairCount = factory.pairCount.plus(BIG_INT_ONE)
  factory.save()

  PairTemplate.create(event.params.pair)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}

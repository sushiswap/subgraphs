import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pair } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { BIG_INT_ONE, LEGACY, SWAP_FEE, TWAP_ENABLED } from '../constants'
import { getOrCreateFactory } from './factory'
import { createPairKpi } from './pair-kpi'
import { getOrCreateToken } from './token'
import { createTokenPair } from './token-pair'

export function createPair(params: PairCreated__Params): Pair {
  const id = params.pair.toHex()

  let token0 = getOrCreateToken(params.token0.toHex())
  let token1 = getOrCreateToken(params.token1.toHex())

  const pair = new Pair(id)
  createPairKpi(id)

  createTokenPair(token0.id, id)
  createTokenPair(token1.id, id)

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.swapFee = SWAP_FEE
  pair.twapEnabled = TWAP_ENABLED
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.token0Price = token0.id
  pair.token1Price = token1.id
  pair.kpi = id
  pair.source = LEGACY
  pair.save()

  const factory = getOrCreateFactory()
  factory.pairCount = factory.pairCount.plus(BIG_INT_ONE)
  factory.save()

  // create the tracked contract based on the template
  PairTemplate.create(params.pair)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}
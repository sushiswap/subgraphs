import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pair } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { createPairKpi } from './pair-kpi'
import { getOrCreateToken } from './token'
import { getTokenPrice } from './token-price'

export function createPair(params: PairCreated__Params): Pair {
  const id = params.pair.toHex()

  let token0 = getOrCreateToken(params.token0.toHex())
  let token1 = getOrCreateToken(params.token1.toHex())
  let token0Price = getTokenPrice(params.token0.toHex())
  let token1Price = getTokenPrice(params.token1.toHex())

  const pair = new Pair(id)
  createPairKpi(id)

  const token0Pairs = token1Price.pairs
  token0Pairs.push(pair.id)
  token1Price.pairs = token0Pairs
  token1Price.save()

  const token1Pairs = token0Price.pairs
  token1Pairs.push(pair.id)
  token0Price.pairs = token1Pairs
  token0Price.save()

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.kpi = id
  pair.save()

  // create the tracked contract based on the template
  PairTemplate.create(params.pair)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}

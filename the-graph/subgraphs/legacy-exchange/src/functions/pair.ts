import { Pair, PairKpi } from '../../generated/schema'
import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'
import { getOrCreateToken } from './token'
import { getOrCreateFactory } from './factory'

export function createPair(pairCreatedParams: PairCreated__Params): Pair {
  const id = pairCreatedParams.pair.toHex()

  const factory = getOrCreateFactory()

  const token0 = getOrCreateToken(pairCreatedParams.token0.toHex())
  const token1 = getOrCreateToken(pairCreatedParams.token1.toHex())

  const pair = new Pair(id)

  pair.factory = factory.id

  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.block = pairCreatedParams._event.block.number
  pair.timestamp = pairCreatedParams._event.block.timestamp

  const kpi = createPairKpi(id)
  pair.kpi = kpi.id

  pair.save()

  PairTemplate.create(pairCreatedParams.pair)

  return pair
}

export function createPairKpi(id: string): PairKpi {
  const kpi = new PairKpi(id)
  kpi.save()
  return kpi as PairKpi
}

export function getPairKpi(id: string): PairKpi {
  return PairKpi.load(id) as PairKpi
}

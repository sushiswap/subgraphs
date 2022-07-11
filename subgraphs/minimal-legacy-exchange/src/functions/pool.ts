import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pool } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { createPoolKpi } from './pool-data'
import { getOrCreateToken } from './token'
import { getTokenKpi } from './token-data'

export function createPool(params: PairCreated__Params): Pool {
  const id = params.pair.toHex()

  let token0 = getOrCreateToken(params.token0.toHex())
  let token1 = getOrCreateToken(params.token1.toHex())
  let token0Kpi = getTokenKpi(params.token0.toHex())
  let token1Kpi = getTokenKpi(params.token1.toHex())

  const pool = new Pool(id)
  createPoolKpi(id)

  const kpi0NewPools = token1Kpi.pools
  kpi0NewPools.push(pool.id)
  token1Kpi.pools = kpi0NewPools
  token1Kpi.save()

  const kpi1NewPools = token0Kpi.pools
  kpi1NewPools.push(pool.id)
  token0Kpi.pools = kpi1NewPools
  token0Kpi.save()

  pool.name = token0.symbol.concat('-').concat(token1.symbol)
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.kpi = id
  pool.save()

  // create the tracked contract based on the template
  PairTemplate.create(params.pair)

  return pool as Pool
}

export function getPool(address: string): Pool {
  return Pool.load(address) as Pool
}

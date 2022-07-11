import { Address } from '@graphprotocol/graph-ts'
import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pool } from '../../generated/schema'
import { Pair as PairTemplate } from '../../generated/templates'
import { WHITELISTED_TOKEN_ADDRESSES } from '../constants/index'
import { createPoolKpi } from './pool-data'
import { getOrCreateToken } from './token'
import { getTokenKpi } from './token-data'

export function createPool(params: PairCreated__Params): Pool {
  const id = params.pair.toHex()

  let token0 = getOrCreateToken(params.token0.toHex())
  let token1 = getOrCreateToken(params.token1.toHex())
  let token0Data = getTokenKpi(params.token0.toHex())
  let token1Data = getTokenKpi(params.token1.toHex())

  const pool = new Pool(id)

  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id)) {
    const newPairs = token1Data.whitelistPools
    newPairs.push(pool.id)
    token1Data.whitelistPools = newPairs
    token1Data.save()
  }
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    const newPairs = token0Data.whitelistPools
    newPairs.push(pool.id)
    token0Data.whitelistPools = newPairs
    token0Data.save()
  }

  pool.name = token0.symbol.concat('-').concat(token1.symbol)
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.kpi = id
  pool.save()

  createPoolKpi(id)

  // create the tracked contract based on the template
  PairTemplate.create(params.pair)

  return pool as Pool
}

export function getPool(address: string): Pool {
  return Pool.load(address) as Pool
}

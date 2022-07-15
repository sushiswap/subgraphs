import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { DeployPool__Params } from '../../generated/MasterDeployer/MasterDeployer'
import { Pair } from '../../generated/schema'
import { ConstantProductPool } from '../../generated/templates'
import { TRIDENT } from '../constants'
import { createPairKpi } from './pair-kpi'
import { getOrCreateToken } from './token'
import { createTokenPair } from './token-pair'

export function createPair(params: DeployPool__Params): Pair {
  const id = params.pool.toHex()

  const decoded = ethereum.decode('(address,address,uint256,bool)', params.deployData)!.toTuple()
  const token0Address = decoded[0].toAddress().toHex()
  const token1Address = decoded[1].toAddress().toHex()
  const swapFee = decoded[2].toBigInt() as BigInt
  const twapEnabled = decoded[3].toBoolean() as boolean

  let token0 = getOrCreateToken(token0Address)
  let token1 = getOrCreateToken(token1Address)

  const pair = new Pair(id)
  createPairKpi(id)

  createTokenPair(token0.id, id)
  createTokenPair(token1.id, id)

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.token0Price = token0.id
  pair.token1Price = token1.id
  pair.kpi = id
  pair.source = TRIDENT
  pair.swapFee = swapFee
  pair.twapEnabled = twapEnabled
  pair.save()

  // create the tracked contract based on the template
  ConstantProductPool.create(params.pool)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}

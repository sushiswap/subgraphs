import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { DeployPool } from '../../generated/MasterDeployer/MasterDeployer'
import { Pair } from '../../generated/schema'
import { ConstantProductPool } from '../../generated/templates'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, TRIDENT } from '../constants'
import { getOrCreateFactory } from './factory'
import { getOrCreateToken } from './token'
import { createTokenPair } from './token-pair'

export function createPair(event: DeployPool, type: string): Pair {
  const id = event.params.pool.toHex()

  const decoded = ethereum.decode('(address,address,uint256,bool)', event.params.deployData)!.toTuple()
  const isCorrectOrder = decoded[0].toAddress().toHex() < decoded[1].toAddress().toHex()
  const token0Address = isCorrectOrder ? decoded[0].toAddress().toHex() : decoded[1].toAddress().toHex()
  const token1Address = !isCorrectOrder ? decoded[0].toAddress().toHex() : decoded[1].toAddress().toHex()

  const swapFee = decoded[2].toBigInt() as BigInt
  const twapEnabled = decoded[3].toBoolean() as boolean

  let token0 = getOrCreateToken(token0Address)
  let token1 = getOrCreateToken(token1Address)

  const pair = new Pair(id)


  createTokenPair(token0.id, id)
  createTokenPair(token1.id, id)

  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.type = type
  pair.source = TRIDENT
  pair.swapFee = swapFee
  pair.twapEnabled = twapEnabled
  pair.createdAtTimestamp = event.block.timestamp
  pair.createdAtBlock = event.block.number

  pair.reserve0 = BIG_INT_ZERO
  pair.reserve1 = BIG_INT_ZERO
  pair.token0Price = BIG_DECIMAL_ZERO
  pair.token1Price = BIG_DECIMAL_ZERO
  pair.liquidity = BIG_INT_ZERO
  pair.trackedLiquidityNative = BIG_DECIMAL_ZERO
  pair.liquidityNative = BIG_DECIMAL_ZERO
  pair.liquidityUSD = BIG_DECIMAL_ZERO
  pair.volumeNative = BIG_DECIMAL_ZERO
  pair.volumeUSD = BIG_DECIMAL_ZERO
  pair.volumeToken0 = BIG_DECIMAL_ZERO
  pair.volumeToken1 = BIG_DECIMAL_ZERO
  pair.feesNative = BIG_DECIMAL_ZERO
  pair.feesUSD = BIG_DECIMAL_ZERO
  pair.apr = BIG_DECIMAL_ZERO
  pair.aprUpdatedAtTimestamp = BIG_INT_ZERO
  pair.txCount = BIG_INT_ZERO
  pair.save()

  const factory = getOrCreateFactory(type)
  factory.pairCount = factory.pairCount.plus(BIG_INT_ONE)
  factory.save()
  // create the tracked contract based on the template
  ConstantProductPool.create(event.params.pool)

  return pair as Pair
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}


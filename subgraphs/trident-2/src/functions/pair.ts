import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { DeployPool } from '../../generated/MasterDeployer/MasterDeployer'
import { Pair } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, PairType, TRIDENT } from '../constants'
import { getOrCreateToken } from './token'
import { createTokenPair } from './token-pair'

export function createPair(event: DeployPool, type: string): Pair {
  const id = event.params.pool.toHex()

  const decoded = decodePool(event, type)
  const isCorrectOrder = decoded[0].toAddress().toHex() < decoded[1].toAddress().toHex()
  const token0Address = isCorrectOrder ? decoded[0].toAddress().toHex() : decoded[1].toAddress().toHex()
  const token1Address = !isCorrectOrder ? decoded[0].toAddress().toHex() : decoded[1].toAddress().toHex()

  const swapFee = decoded[2].toBigInt() as BigInt
  const twapEnabled = getTwap(decoded, type)

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
  pair.liquidityNative = BIG_DECIMAL_ZERO
  pair.liquidityUSD = BIG_DECIMAL_ZERO
  pair.volumeNative = BIG_DECIMAL_ZERO
  pair.volumeUSD = BIG_DECIMAL_ZERO
  pair.untrackedVolumeUSD = BIG_DECIMAL_ZERO
  pair.volumeToken0 = BIG_DECIMAL_ZERO
  pair.volumeToken1 = BIG_DECIMAL_ZERO
  pair.feesNative = BIG_DECIMAL_ZERO
  pair.feesUSD = BIG_DECIMAL_ZERO
  pair.apr = BIG_DECIMAL_ZERO
  pair.aprUpdatedAtTimestamp = BIG_INT_ZERO
  pair.txCount = BIG_INT_ZERO

  pair.save()

  return pair as Pair
}

// TODO: refactor, make it return 4 params, set twap to false if not constant product pool
function decodePool(event: DeployPool, type: string): ethereum.Tuple {
  if (type === PairType.CONSTANT_PRODUCT_POOL) {
    return ethereum.decode('(address,address,uint256,bool)', event.params.deployData)!.toTuple()
  }
  else if (type === PairType.STABLE_POOL) {
    return ethereum.decode('(address,address,uint256)', event.params.deployData)!.toTuple()
  }
  else {
    throw new Error(
      `Unknown pair type: ${type}, currently available: ${PairType.CONSTANT_PRODUCT_POOL} and ${PairType.STABLE_POOL}. Did you forget to add it to the list of supported pairs?`
    )
  }
}


function getTwap(decoded: ethereum.Tuple, type: string): boolean {
  if (type === PairType.CONSTANT_PRODUCT_POOL) {
    return decoded[3].toBoolean() as boolean
  }
  else {
    return false
  }
}

export function getPair(address: string): Pair {
  return Pair.load(address) as Pair
}


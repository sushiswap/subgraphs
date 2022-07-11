import { BigDecimal } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  FACTORY_ADDRESS,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES
} from './constants'
import { getOrCreateToken } from './functions'
import { getTokenKpi } from './functions/token-data'
import { Pool, Token, TokenKpi } from '../generated/schema'
import { Factory as FactoryContract } from '../generated/templates/Pair/Factory'
import { getPoolKpi } from './functions/pool-data'


export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export function getNativePriceInUSD(): BigDecimal {

  let count = 0
  let weightdPrice = BigDecimal.fromString('0')
  let nativeReserve = BigDecimal.fromString('0')
  let stablePrices: BigDecimal[] = []
  let nativeReserves: BigDecimal[] = []

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const stablePool = Pool.load(address)
    if (stablePool === null) {
      continue
    }
    const stablePoolKpi = getPoolKpi(address)

    if (
      (stablePool.token0 == NATIVE_ADDRESS && stablePoolKpi.reserve0.lt(MINIMUM_NATIVE_LIQUIDITY)) ||
      (stablePool.token1 == NATIVE_ADDRESS && stablePoolKpi.reserve1.lt(MINIMUM_NATIVE_LIQUIDITY))
    ) {
      continue
    }

    const stableFirst = STABLE_TOKEN_ADDRESSES.includes(stablePool.token0)

    nativeReserve = nativeReserve.plus(!stableFirst ? stablePoolKpi.reserve0 : stablePoolKpi.reserve1)

    nativeReserves.push(!stableFirst ? stablePoolKpi.reserve0 : stablePoolKpi.reserve1)

    stablePrices.push(stableFirst ? stablePoolKpi.token0Price : stablePoolKpi.token1Price)

    count = count + 1
  }

  if (count > 0) {
    for (let j = 0; j < count; j++) {
      const price = stablePrices[j]
      const weight = nativeReserves[j].div(nativeReserve)
      weightdPrice = weightdPrice.plus(price.times(weight))
    }
  }

  return weightdPrice
}

export function findEthPerToken(token: Token, tokenKpi: TokenKpi): BigDecimal {
  if (token.id == NATIVE_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  const isStable = STABLE_TOKEN_ADDRESSES.includes(token.id)
  const whitelist = tokenKpi.whitelistPools

  let mostReseveEth = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < whitelist.length; ++i) {
    const poolAddress = whitelist[i]
    const pool = Pool.load(poolAddress)
    if (pool === null) {
      continue // Not created yet
    }
    const poolKpi = getPoolKpi(poolAddress)

    // If the token is a stable, we price it from the pair with native
    // However, if there isn't enough liquidity to mass minimum native liquidity check, continue and use the pair
    // with most liqudidity
    // NOTE: the idea behind this is that most stables will be priced off native, and the rest could be 
    // priced off those stables, avoiding circular price dependency
    if (isStable) {
      if (pool.token0 == token.id && pool.token1 == NATIVE_ADDRESS && poolKpi.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY)) {
        const token1Kpi = getTokenKpi(pool.token1)
        return poolKpi.token1Price.times(token1Kpi.derivedETH)
      } else if (
        pool.token1 == token.id &&
        pool.token0 == NATIVE_ADDRESS &&
        poolKpi.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY)
      ) {
        const token0Kpi = getTokenKpi(pool.token0)
        return poolKpi.token0Price.times(token0Kpi.derivedETH)
      }
    }
    
    if (pool.token0 == token.id && poolKpi.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && poolKpi.reserveETH.gt(mostReseveEth)) {
      const token1 = getOrCreateToken(pool.token1)
      if (token1.decimalsSuccess) {
        const token1Kpi = getTokenKpi(pool.token1)
        mostReseveEth = poolKpi.reserveETH
        currentPrice = poolKpi.token1Price.times(token1Kpi.derivedETH)
      }
    }

    if (pool.token1 == token.id && poolKpi.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && poolKpi.reserveETH.gt(mostReseveEth)) {
      const token0 = getOrCreateToken(pool.token0)
      if (token0.decimalsSuccess) {
        const token0Kpi = getTokenKpi(pool.token0)
        mostReseveEth = poolKpi.reserveETH
        currentPrice = poolKpi.token0Price.times(token0Kpi.derivedETH)
      }
    }
  }

  return currentPrice
}

import { BigDecimal } from '@graphprotocol/graph-ts'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  FACTORY_ADDRESS,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES,
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

/**
 * Updates the token KPI price for the given token.
 * Find the pool that contains the most liquidity and is safe from circular price dependency, 
 * (e.g. if DAI is priced off USDC, then USDC cannot be priced off DAI)
 * @param tokenAddress The address of the token kpi to update
 * @returns 
 */
export function updateTokenKpiPrice(tokenAddress: string): TokenKpi {
  const token = getOrCreateToken(tokenAddress)
  const currentTokenKpi = getTokenKpi(tokenAddress)
  if (token.id == NATIVE_ADDRESS) {
    return currentTokenKpi
  }

  const pools = currentTokenKpi.pools

  let pricedOffToken = ''
  let mostReseveEth = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < pools.length; ++i) {
    const poolAddress = pools[i]
    const pool = Pool.load(poolAddress)
    if (pool === null) {
      continue // Not created yet
    }
    const poolKpi = getPoolKpi(poolAddress)
    const poolToken0Kpi = getTokenKpi(pool.token0)
    const poolToken1Kpi = getTokenKpi(pool.token1)

    if (
      pool.token0 == token.id &&
      poolToken1Kpi.pricedOffToken != token.id &&
      passesLiquidityCheck(poolKpi.reserve0, mostReseveEth)
    ) {
      const token1 = getOrCreateToken(pool.token1)
      if (token1.decimalsSuccess) {
        const token1Kpi = getTokenKpi(pool.token1)
        pricedOffToken = token1Kpi.id
        mostReseveEth = poolKpi.reserveETH
        currentPrice = poolKpi.token1Price.times(token1Kpi.derivedETH)
      }
    }

    if (
      pool.token1 == token.id &&
      poolToken0Kpi.pricedOffToken != token.id &&
      passesLiquidityCheck(poolKpi.reserve1, mostReseveEth)
    ) {
      const token0 = getOrCreateToken(pool.token0)
      if (token0.decimalsSuccess) {
        const token0Kpi = getTokenKpi(pool.token0)
        pricedOffToken = token0Kpi.id
        mostReseveEth = poolKpi.reserveETH
        currentPrice = poolKpi.token0Price.times(token0Kpi.derivedETH)
      }
    }
  }

  if (currentPrice.gt(BIG_DECIMAL_ZERO)) {
    currentTokenKpi.pricedOffToken = pricedOffToken
    currentTokenKpi.derivedETH = currentPrice
    currentTokenKpi.save()
  }
  return currentTokenKpi
}

function passesLiquidityCheck(reserveETH: BigDecimal, mostReseveEth: BigDecimal): boolean {
  return reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && reserveETH.gt(mostReseveEth)
}

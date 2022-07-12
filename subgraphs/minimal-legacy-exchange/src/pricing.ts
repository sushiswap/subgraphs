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
import { getTokenPrice } from './functions/token-price'
import { Pair, Token, TokenPrice } from '../generated/schema'
import { Factory as FactoryContract } from '../generated/templates/Pair/Factory'
import { getPairKpi } from './functions/pair-kpi'

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export function getNativePriceInUSD(): BigDecimal {
  let count = 0
  let weightdPrice = BigDecimal.fromString('0')
  let nativeReserve = BigDecimal.fromString('0')
  let stablePrices: BigDecimal[] = []
  let nativeReserves: BigDecimal[] = []

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const stablePool = Pair.load(address)
    if (stablePool === null) {
      continue
    }
    const stablePoolKpi = getPairKpi(address)

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
export function updateTokenKpiPrice(tokenAddress: string): TokenPrice {
  const token = getOrCreateToken(tokenAddress)
  const currentTokenPrice = getTokenPrice(tokenAddress)
  if (token.id == NATIVE_ADDRESS) {
    if (!currentTokenPrice.derivedNative.equals(BIG_DECIMAL_ONE)) {
      currentTokenPrice.derivedNative = BIG_DECIMAL_ONE
      currentTokenPrice.save()
    }
    return currentTokenPrice
  }

  const pairs = currentTokenPrice.pairs

  let pricedOffToken = ''
  let pricedOffPair = ''
  let mostReseveEth = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < pairs.length; ++i) {
    const poolAddress = pairs[i]
    const pair = Pair.load(poolAddress)
    if (pair === null) {
      continue // Not created yet
    }
    const pairKpi = getPairKpi(poolAddress)
    const pairToken0Price = getTokenPrice(pair.token0)
    const pairToken1Price = getTokenPrice(pair.token1)

    if (
      pair.token0 == token.id &&
      pairToken1Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairKpi.reserve0, mostReseveEth)
    ) {
      const token1 = getOrCreateToken(pair.token1)
      if (token1.decimalsSuccess) {
        const token1Price = getTokenPrice(pair.token1)
        pricedOffToken = token1Price.id
        pricedOffPair = pair.id
        mostReseveEth = pairKpi.reserveNative
        currentPrice = pairKpi.token1Price.times(token1Price.derivedNative)
      }
    }

    if (
      pair.token1 == token.id &&
      pairToken0Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairKpi.reserve1, mostReseveEth)
    ) {
      const token0 = getOrCreateToken(pair.token0)
      if (token0.decimalsSuccess) {
        const token0Price = getTokenPrice(pair.token0)
        pricedOffToken = token0Price.id
        pricedOffPair = pair.id
        mostReseveEth = pairKpi.reserveNative
        currentPrice = pairKpi.token0Price.times(token0Price.derivedNative)
      }
    }
  }

  if (currentPrice.gt(BIG_DECIMAL_ZERO)) {
    currentTokenPrice.pricedOffToken = pricedOffToken
    currentTokenPrice.pricedOffPair = pricedOffPair
    currentTokenPrice.derivedNative = currentPrice
    currentTokenPrice.save()
  }
  return currentTokenPrice
}

function passesLiquidityCheck(reserveETH: BigDecimal, mostReseveEth: BigDecimal): boolean {
  return reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && reserveETH.gt(mostReseveEth)
}

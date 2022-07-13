import { BigDecimal } from '@graphprotocol/graph-ts'
import { Pair, TokenPair, TokenPrice } from '../generated/schema'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES
} from './constants'
import { getOrCreateToken } from './functions'
import { getPairKpi } from './functions/pair-kpi'
import { getTokenPrice } from './functions/token-price'


export function getNativePriceInUSD(): BigDecimal {
  let count = 0
  let weightdPrice = BigDecimal.fromString('0')
  let nativeReserve = BigDecimal.fromString('0')
  let stablePrices: BigDecimal[] = []
  let nativeReserves: BigDecimal[] = []

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const stablePair = Pair.load(address)
    if (stablePair === null) {
      continue
    }
    const stablePairKpi = getPairKpi(address)

    if (
      (stablePair.token0 == NATIVE_ADDRESS && stablePairKpi.token0Liquidity.lt(MINIMUM_NATIVE_LIQUIDITY)) ||
      (stablePair.token1 == NATIVE_ADDRESS && stablePairKpi.token1Liquidity.lt(MINIMUM_NATIVE_LIQUIDITY))
    ) {
      continue
    }

    const stableFirst = STABLE_TOKEN_ADDRESSES.includes(stablePair.token0)

    nativeReserve = nativeReserve.plus(!stableFirst ? stablePairKpi.token0Liquidity : stablePairKpi.token1Liquidity)

    nativeReserves.push(!stableFirst ? stablePairKpi.token0Liquidity : stablePairKpi.token1Liquidity)

    stablePrices.push(stableFirst ? stablePairKpi.token0Price : stablePairKpi.token1Price)

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
 * Find the pair that contains the most liquidity and is safe from circular price dependency,
 * (e.g. if DAI is priced off USDC, then USDC cannot be priced off DAI)
 * @param tokenAddress The address of the token kpi to update
 * @returns
 */
export function updateTokenKpiPrice(tokenAddress: string, nativePrice: BigDecimal): TokenPrice {
  const token = getOrCreateToken(tokenAddress)
  const currentTokenPrice = getTokenPrice(tokenAddress)
  if (token.id == NATIVE_ADDRESS) {
    if (!currentTokenPrice.derivedNative.equals(BIG_DECIMAL_ONE)) {
      currentTokenPrice.derivedNative = BIG_DECIMAL_ONE
      currentTokenPrice.save()
    }
    return currentTokenPrice
  }


  let pricedOffToken = ''
  let pricedOffPair = ''
  let mostLiquidity = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < currentTokenPrice.pairCount.toI32(); ++i) {
    const tokenPairRelationshipId = token.id.concat(":").concat(i.toString())
    const tokenPairRelationship = TokenPair.load(tokenPairRelationshipId)

    if (tokenPairRelationship === null) {
      continue // Not created yet
    }

    const pair = Pair.load(tokenPairRelationship.pair)
    if (pair === null) {
      continue // Not created yet
    }

    const pairKpi = getPairKpi(pair.id)
    const pairToken0Price = getTokenPrice(pair.token0)
    const pairToken1Price = getTokenPrice(pair.token1)

    if (
      pair.token0 == token.id &&
      pairToken1Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairKpi.token0Liquidity, mostLiquidity)
    ) {
      const token1 = getOrCreateToken(pair.token1)
      if (token1.decimalsSuccess) {
        const token1Price = getTokenPrice(pair.token1)
        pricedOffToken = token1Price.id
        pricedOffPair = pair.id
        mostLiquidity = pairKpi.liquidityNative
        currentPrice = pairKpi.token1Price.times(token1Price.derivedNative)
      }
    }

    if (
      pair.token1 == token.id &&
      pairToken0Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairKpi.token1Liquidity, mostLiquidity)
    ) {
      const token0 = getOrCreateToken(pair.token0)
      if (token0.decimalsSuccess) {

        const token0Price = getTokenPrice(pair.token0)
        pricedOffToken = token0Price.id
        pricedOffPair = pair.id
        mostLiquidity = pairKpi.liquidityNative
        currentPrice = pairKpi.token0Price.times(token0Price.derivedNative)
      }
    }
  }

  if (currentPrice.gt(BIG_DECIMAL_ZERO)) {
    currentTokenPrice.pricedOffToken = pricedOffToken
    currentTokenPrice.pricedOffPair = pricedOffPair
    currentTokenPrice.derivedNative = currentPrice
    currentTokenPrice.lastUsdPrice = currentPrice.times(nativePrice)
    currentTokenPrice.save()
  }
  return currentTokenPrice
}

function passesLiquidityCheck(reserveNative: BigDecimal, mostReseveEth: BigDecimal): boolean {
  return reserveNative.gt(MINIMUM_NATIVE_LIQUIDITY) && reserveNative.gt(mostReseveEth)
}

import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { Pair, TokenPair, TokenPrice } from '../generated/schema'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES,
  INIT_CODE_HASH,
  PRESET_STABLE_POOL_ADDRESSES,
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

  // NOTE: if no initCodeHash is added to the configuration, we will use a preset pool list instead. The reason for this criteria is that
  // polygon has a bug that makes addresses non deterministic.
  const stablePoolAddresses = INIT_CODE_HASH != "" ? STABLE_POOL_ADDRESSES : PRESET_STABLE_POOL_ADDRESSES

  for (let i = 0; i < stablePoolAddresses.length; i++) {
    const address = stablePoolAddresses[i]

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
 * Updates the token price.
 * Find the pair that contains the most liquidity and is safe from circular price dependency,
 * (e.g. if DAI is priced off USDC, then USDC cannot be priced off DAI)
 * @param tokenPrice The token price to update
 * @returns
 */
export function updateTokenPrice(tokenPrice: TokenPrice, nativePrice: BigDecimal): TokenPrice {

  if (tokenPrice.id == NATIVE_ADDRESS) {
    if (!tokenPrice.derivedNative.equals(BIG_DECIMAL_ONE)) {
      tokenPrice.derivedNative = BIG_DECIMAL_ONE
      tokenPrice.save()
    }
    return tokenPrice
  }

  let pricedOffToken = ''
  let pricedOffPair = ''
  let mostLiquidity = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < tokenPrice.pairCount.toI32(); ++i) {
    const tokenPairRelationshipId = tokenPrice.id.concat(':').concat(i.toString())
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
      pair.token0 == tokenPrice.id &&
      pairToken1Price.pricedOffToken != tokenPrice.id &&
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
      pair.token1 == tokenPrice.id &&
      pairToken0Price.pricedOffToken != tokenPrice.id &&
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
    tokenPrice.pricedOffToken = pricedOffToken
    tokenPrice.pricedOffPair = pricedOffPair
    tokenPrice.derivedNative = currentPrice
    tokenPrice.lastUsdPrice = currentPrice.times(nativePrice)
    tokenPrice.save()
  }
  return tokenPrice
}

function passesLiquidityCheck(reserveNative: BigDecimal, mostReseveEth: BigDecimal): boolean {
  return reserveNative.gt(MINIMUM_NATIVE_LIQUIDITY) && reserveNative.gt(mostReseveEth)
}

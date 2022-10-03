import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { Pair, TokenPrice, _TokenPair } from '../generated/schema'
import { Factory as FactoryContract } from '../generated/templates/Pair/Factory'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  FACTORY_ADDRESS,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES
} from './constants'
import { convertTokenToDecimal, getOrCreateToken } from './functions'
import { getTokenPrice } from './functions/token-price'

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

export function getNativePriceInUSD(): BigDecimal {
  let count = 0
  let weightdPrice = BigDecimal.fromString('0')
  let nativeReserve = BigDecimal.fromString('0')
  let stablePrices: BigDecimal[] = []
  let nativeReserves: BigDecimal[] = []
  const nativeToken = getOrCreateToken(NATIVE_ADDRESS)

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const stablePair = Pair.load(address)
    if (stablePair === null) {
      continue
    }
    // Technically one of the reserves could be wrong below because we are using nativeToken.decimals, however, 
    // since we are only using the reserve for the native, it doesn't matter
    const reserve0 = convertTokenToDecimal(stablePair.reserve0, nativeToken.decimals)
    const reserve1 = convertTokenToDecimal(stablePair.reserve1, nativeToken.decimals)
    if (
      (stablePair.token0 == NATIVE_ADDRESS && reserve0.lt(MINIMUM_NATIVE_LIQUIDITY)) ||
      (stablePair.token1 == NATIVE_ADDRESS && reserve1.lt(MINIMUM_NATIVE_LIQUIDITY))
    ) {
      continue
    }

    const stableFirst = STABLE_TOKEN_ADDRESSES.includes(stablePair.token0)

    nativeReserve = nativeReserve.plus(!stableFirst ? reserve0 : reserve1)

    nativeReserves.push(!stableFirst ? reserve0 : reserve1)

    stablePrices.push(stableFirst ? stablePair.token0Price : stablePair.token1Price)

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
 * @param tokenAddress The address of the token to update
 * @returns
 */
export function updateTokenPrice(tokenAddress: string, nativePrice: BigDecimal, blockNumber: BigInt): TokenPrice {
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

  for (let i = 0; i < token.pairCount.toI32(); ++i) {
    const tokenPairRelationshipId = token.id.concat(':').concat(i.toString())
    const tokenPairRelationship = _TokenPair.load(tokenPairRelationshipId)

    if (tokenPairRelationship === null) {
      continue // Not created yet
    }

    const pair = Pair.load(tokenPairRelationship.pair)
    if (pair === null) {
      continue // Not created yet
    }


    const token0 = getOrCreateToken(pair.token0)
    const token1 = getOrCreateToken(pair.token1)

    const currentProduct = pair.reserve1.gt(BIG_INT_ZERO) ? pair.reserve0.divDecimal(pair.reserve1.toBigDecimal()) : BIG_DECIMAL_ZERO

    if (pair._kUpdatedAtBlock && pair._k) {
      if (pair._kUpdatedAtBlock!.equals(blockNumber) && pair._k!.gt(BIG_DECIMAL_ZERO) && currentProduct.gt(BIG_DECIMAL_ZERO)) {
        const change = currentProduct.div(pair._k!)
        if (change.gt(BigDecimal.fromString("1000")) || change.lt(BigDecimal.fromString("0.001"))) {
          log.debug("skipping pair {} {} because of drastic reserve change. Change: {}", [pair.name, pair.id, change.toString()])
          continue
        }
      }
    }

    const pairToken0Price = getTokenPrice(pair.token0)
    const pairToken1Price = getTokenPrice(pair.token1)
    const token0NativeLiquidity = convertTokenToDecimal(pair.reserve0, token0.decimals).times(pairToken0Price.derivedNative)
    const token1NativeLiquidity = convertTokenToDecimal(pair.reserve1, token1.decimals).times(pairToken1Price.derivedNative)

    // NOTE: We have to calculate this because the pair.nativeLiquidity field is being updated after this function is called
    // e.g. if we used pair.liquidityNative, it would still have the inflated value from the attackers swap
    const pairLiquidityNative = token0NativeLiquidity.plus(token1NativeLiquidity) 

    if (
      pair.token0 == token.id &&
      pairToken1Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairLiquidityNative, mostLiquidity)
    ) {
      if (token1.decimalsSuccess) {
        const token1Price = getTokenPrice(pair.token1)
        pricedOffToken = token1Price.id
        pricedOffPair = pair.id
        mostLiquidity = pairLiquidityNative
        currentPrice = pair.token1Price.times(token1Price.derivedNative)
      }
    }

    if (
      pair.token1 == token.id &&
      pairToken0Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairLiquidityNative, mostLiquidity)
    ) {
      if (token0.decimalsSuccess) {
        const token0Price = getTokenPrice(pair.token0)
        pricedOffToken = token0Price.id
        pricedOffPair = pair.id
        mostLiquidity = pairLiquidityNative
        currentPrice = pair.token0Price.times(token0Price.derivedNative)
      }
    }
  }

  currentTokenPrice.pricedOffToken = pricedOffToken
  currentTokenPrice.pricedOffPair = pricedOffPair
  currentTokenPrice.derivedNative = currentPrice
  currentTokenPrice.lastUsdPrice = currentPrice.times(nativePrice)
  currentTokenPrice.save()

  return currentTokenPrice
}

function passesLiquidityCheck(reserveNative: BigDecimal, mostReseveEth: BigDecimal): boolean {
  return reserveNative.gt(MINIMUM_NATIVE_LIQUIDITY) && reserveNative.gt(mostReseveEth)
}


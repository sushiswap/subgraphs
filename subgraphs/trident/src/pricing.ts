import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { Pair, _TokenPair, TokenPrice, _WhitelistedTokenPair } from '../generated/schema'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES,
  TOKENS_TO_PRICE_OFF_NATIVE,
  TOKENS_TO_PRICE_OFF_NATIVE_ADDRESSES
} from './constants'
import { convertTokenToDecimal, getOrCreateToken } from './functions'
import { getTokenPrice } from './functions/token-price'

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
 * Find the whitelisted pair that contains the most liquidity and is safe from circular price dependency,
 * (e.g. if DAI is priced off USDC, then USDC cannot be priced off DAI)
 * @param tokenAddress The address of the token to update
 * @returns
 */
export function updateTokenPrice(tokenAddress: string, nativePrice: BigDecimal): TokenPrice {
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

  // This ensures that some tokens are priced off native, stable pools might contain more liquidity than native pairing
  if (TOKENS_TO_PRICE_OFF_NATIVE_ADDRESSES.includes(tokenAddress)) {
    const pairs = TOKENS_TO_PRICE_OFF_NATIVE.get(tokenAddress)
    for (let i = 0; i < pairs.length; i++) {
      const pair = Pair.load(pairs[i])
      if (pair != null) {
        const isNativeFirst = pair.token0 == NATIVE_ADDRESS
        const nativeTokenPrice = getTokenPrice(isNativeFirst ? pair.token0 : pair.token1)
        const pairTokenPrice = isNativeFirst ? pair.token0Price : pair.token1Price
        if (passesLiquidityCheck(pair.liquidityNative, mostLiquidity)) {
          pricedOffToken = nativeTokenPrice.id
          pricedOffPair = pair.id
          mostLiquidity = pair.liquidityNative
          currentPrice = pairTokenPrice.times(nativeTokenPrice.derivedNative)
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



  for (let i = 0; i < token.whitelistedPairCount.toI32(); ++i) {
    const tokenPairRelationshipId = token.id.concat(':').concat(i.toString())
    const tokenPairRelationship = _WhitelistedTokenPair.load(tokenPairRelationshipId)

    if (tokenPairRelationship === null) {
      continue // Not created yet
    }

    const pair = Pair.load(tokenPairRelationship.pair)
    if (pair === null) {
      continue // Not created yet
    }

    const token0 = getOrCreateToken(pair.token0)
    const token1 = getOrCreateToken(pair.token1)
    const pairToken0Price = getTokenPrice(pair.token0)
    const pairToken1Price = getTokenPrice(pair.token1)

    const token0NativeLiquidity = convertTokenToDecimal(pair.reserve0, token0.decimals).times(pairToken0Price.derivedNative)
    const token1NativeLiquidity = convertTokenToDecimal(pair.reserve1, token1.decimals).times(pairToken1Price.derivedNative)

    // NOTE: We have to calculate this because the pair.nativeLiquidity field is being updated after this function is called
    const pairLiquidityNative = token0NativeLiquidity.plus(token1NativeLiquidity) 

    let balance = BIG_DECIMAL_ZERO
    if (token0NativeLiquidity.gt(BIG_DECIMAL_ZERO) && token1NativeLiquidity.gt(BIG_DECIMAL_ZERO)) {
      balance = token0NativeLiquidity.div(token1NativeLiquidity)
      if (balance.gt(BigDecimal.fromString('1.25')) || balance.lt(BigDecimal.fromString('0.75'))) {
        log.debug('NOT BALANCED, balance: {}, pair: {} {}', [balance.toString(), pair.name, pair.id])
        continue
      } 
      // If we get here, the pair is balanced
    } else {
      // NOT BALANCED, one of the tokens has no liquidityNative
      continue
    }

    if (
      pair.token0 == token.id &&
      pairToken1Price.pricedOffToken != token.id &&
      passesLiquidityCheck(pairLiquidityNative, mostLiquidity)
    ) {
      const token1 = getOrCreateToken(pair.token1)
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
      const token0 = getOrCreateToken(pair.token0)
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

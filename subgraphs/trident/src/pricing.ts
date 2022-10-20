import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { Pair, _TokenPair, TokenPrice, Bundle } from '../generated/schema'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  STABLE_POOL_ADDRESSES,
  STABLE_TOKEN_ADDRESSES
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


export function updateTokenPrices(token0Address: string, token1Address: string, nativePrice: BigDecimal): TokenPrices {
  const token0 = getOrCreateToken(token0Address)
  const token1 = getOrCreateToken(token1Address)
  const token0PriceOptions = getPriceOptions(token0Address, nativePrice).sort(comparePriceOptions)
  const token1PriceOptions = getPriceOptions(token1Address, nativePrice).sort(comparePriceOptions)


  const token0Price = getTokenPrice(token0Address)
  if (token0Address != NATIVE_ADDRESS && token0PriceOptions.length > 0) {
    token0Price.pricedOffToken = token0PriceOptions[0].priceOffToken
    token0Price.pricedOffPair = token0PriceOptions[0].priceOffPair
    token0Price.derivedNative = token0PriceOptions[0].derivedNative
    token0Price.lastUsdPrice = token0PriceOptions[0].lastUsdPrice
  } 
  const token1Price = getTokenPrice(token1Address)
  if (token1Address != NATIVE_ADDRESS && token1PriceOptions.length > 0) {
    token1Price.pricedOffToken = token1PriceOptions[0].priceOffToken
    token1Price.pricedOffPair = token1PriceOptions[0].priceOffPair
    token1Price.derivedNative = token1PriceOptions[0].derivedNative
    token1Price.lastUsdPrice = token1PriceOptions[0].lastUsdPrice
  }

  if (token0Address == NATIVE_ADDRESS || token1Address == NATIVE_ADDRESS) {
    if (token0Address == NATIVE_ADDRESS) {
      token1Price.save()
      log.debug("PRICING: N-X {} is native, saving {}", [token0.symbol, token1.symbol])
    } else {
      token0Price.save()
      log.debug("PRICING: X-N {} is native, saving {}", [token1.symbol, token0.symbol])
    }
    return { token0Price, token1Price }
  }

  // Check if collision
  if (token0Price.pricedOffToken == token1Address && token1Price.pricedOffToken == token0Address) {
    if (token0PriceOptions.length == 1 && token1PriceOptions.length == 1) {
      token0Price.save()
      token1Price.pricedOffToken = ''
      token1Price.pricedOffPair = ''
      token1Price.derivedNative = BIG_DECIMAL_ZERO
      token1Price.lastUsdPrice = BIG_DECIMAL_ZERO
      token1Price.save()
      log.debug("PRICING: 1-1C {} gets price, no candidate left for {}", [token0.symbol, token1.symbol])
    } else if (token0PriceOptions.length == 1 && token1PriceOptions.length > 1) {
      token0Price.save()
      manageAlternativeOption(token1Price, token1PriceOptions, token0Address)
      token1Price.save()
      log.debug("PRICING: 1->1C {} gets price, {} uses an alternative (if any)", [token0.symbol, token1.symbol])

    } else if (token0PriceOptions.length > 1 && token1PriceOptions.length == 1) {
      token1Price.save()
      manageAlternativeOption(token0Price, token0PriceOptions, token1Address)
      token0Price.save()
      log.debug("PRICING: >1-1C {} gets price, {} uses an alternative (if any)", [token1.symbol, token0.symbol])
    } else {
      // TODO: improve, this could check liquidity on their second best options and give the first alternative to the token with 
      // less liquidity on the second alternative, for now
      token0Price.save()
      manageAlternativeOption(token1Price, token1PriceOptions, token0Address)
      token1Price.save()
      log.debug("PRICING: >1->1C {} gets price, {} uses an alternative (if any)", [token0.symbol, token1.symbol])
    }
    return { token0Price, token1Price }
  } else {
    // no collision, save both
    token0Price.save()
    token1Price.save()
    log.debug("PRICING: Default {}-{}, both {} and {} gets the best price option", [
      token0PriceOptions.length.toString(),
      token1PriceOptions.length.toString(),
      token0.symbol,
      token1.symbol
    ])
    log.debug("PRICING: Default POP {} {}", [
      token0Price.pricedOffPair ? token0Price.pricedOffPair! : "Not available",
      token1Price.pricedOffPair ? token1Price.pricedOffPair! : "Not available",
  
    ])
    return { token0Price, token1Price }
  }


}


function manageAlternativeOption(tokenPrice: TokenPrice, options: PriceOption[], address: string): void {
  let option: PriceOption
  for (let i = 0; i < options.length; i++) {
    if (options[i].priceOffToken != address) {
      option = options[i]
      break
    }
  }
  if (option) {
    tokenPrice.pricedOffToken = option.priceOffToken
    tokenPrice.pricedOffPair = option.priceOffPair
    tokenPrice.derivedNative = option.derivedNative
    tokenPrice.lastUsdPrice = option.lastUsdPrice
  } else {
    tokenPrice.pricedOffToken = ''
    tokenPrice.pricedOffPair = ''
    tokenPrice.derivedNative = BIG_DECIMAL_ZERO
    tokenPrice.lastUsdPrice = BIG_DECIMAL_ZERO
  }
}


function comparePriceOptions(a: PriceOption, b: PriceOption): i32 {
  if (a.liquidityNative.lt(b.liquidityNative)) {
    return 1;
  }
  if (a.liquidityNative.gt(b.liquidityNative)) {
    return -1;
  }
  return 0;
}

/**
 * Find the pairs safe from circular pricing,
 * (e.g. if DAI is priced off USDC, then USDC cannot be priced off DAI)
 * @param tokenAddress The address of the token to update
 * @returns
 */
function getPriceOptions(tokenAddress: string, nativePrice: BigDecimal): PriceOption[] {
  let priceOptions: PriceOption[] = []
  const token = getOrCreateToken(tokenAddress)
  const currentTokenPrice = getTokenPrice(tokenAddress)
  if (token.id == NATIVE_ADDRESS) {
    if (!currentTokenPrice.derivedNative.equals(BIG_DECIMAL_ONE)) {
      currentTokenPrice.derivedNative = BIG_DECIMAL_ONE
      currentTokenPrice.save()
    }
    return []
  }


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

    const pairToken0Price = getTokenPrice(pair.token0)
    const pairToken1Price = getTokenPrice(pair.token1)
    if (
      pair.token0 == token.id &&
      pairToken1Price.pricedOffToken != token.id &&
      pair.liquidityNative.gt(MINIMUM_NATIVE_LIQUIDITY)
    ) {
      const token1 = getOrCreateToken(pair.token1)
      if (token1.decimalsSuccess) {
        const token1Price = getTokenPrice(pair.token1)

        priceOptions.push({
          priceOffToken: token1Price.id,
          priceOffPair: pair.id,
          liquidityNative: pair.liquidityNative,
          derivedNative: pair.token1Price.times(token1Price.derivedNative),
          lastUsdPrice: pair.token1Price.times(token1Price.derivedNative).times(nativePrice)
        })
      }
    }

    if (
      pair.token1 == token.id &&
      pairToken0Price.pricedOffToken != token.id &&
      pair.liquidityNative.gt(MINIMUM_NATIVE_LIQUIDITY)
    ) {
      const token0 = getOrCreateToken(pair.token0)
      if (token0.decimalsSuccess) {
        const token0Price = getTokenPrice(pair.token0)

        priceOptions.push({
          priceOffToken: token0Price.id,
          priceOffPair: pair.id,
          liquidityNative: pair.liquidityNative,
          derivedNative: pair.token0Price.times(token0Price.derivedNative),
          lastUsdPrice: pair.token0Price.times(token0Price.derivedNative).times(nativePrice)
        })
      }
    }
  }

  return priceOptions
}

class PriceOption {
  priceOffToken: string
  priceOffPair: string
  liquidityNative: BigDecimal
  derivedNative: BigDecimal
  lastUsdPrice: BigDecimal
}

export class TokenPrices {
  token0Price: TokenPrice
  token1Price: TokenPrice
}
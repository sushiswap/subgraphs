// Pricing module...
import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { PairAsset, Token, TokenPrice } from '../../generated/schema'
import { NATIVE_ADDRESS, STABLE_POOL_ADDRESSES, STABLE_TOKEN_ADDRESSES } from '../constants'
import { getOrCreateWhitelistedPair } from './whitelisted-pair'
import { getPairAsset } from './pair'
import { getWhitelistedPair } from '.'

export function createTokenPrice(token: string): TokenPrice {
  const tokenPrice = new TokenPrice(token)
  tokenPrice.token = token
  tokenPrice.save()
  return tokenPrice
}

export function getTokenPrice(token: string): TokenPrice {
  log.debug('getTokenPrice {}', [token])
  return TokenPrice.load(token) as TokenPrice
}

export function getOrCreateTokenPrice(token: string): TokenPrice {
  const tokenPrice = TokenPrice.load(token)

  if (tokenPrice === null) {
    return createTokenPrice(token)
  }

  return tokenPrice as TokenPrice
}

// Native token price, WETH on mainnet.
export function getNativeTokenPrice(): TokenPrice {
  return getOrCreateTokenPrice(NATIVE_ADDRESS)
}

// Minimum liqudiity threshold in native currency
const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('3')

export function getNativePriceInUSD(): BigDecimal {
  // 1. Generate list of stable pairs
  // Cont. until getCreate2Address is available we'll just have to use a configured stable pool list instead
  // 2. Loop over the stable pool addresses
  // 3. Fetch stable assets of pairs from database
  // 4. If assets don't exist or threshold is not reached, continue
  // 5. Total the native side of the reserves
  // 6. Add stable "reserve", and stable "price" into array, and incrememnt count.
  // 7. Finally, loop over the count and calculated a weighted price.

  let count = 0

  let weightdPrice = BigDecimal.fromString('0')

  let nativeReserve = BigDecimal.fromString('0')

  let stablePrices: BigDecimal[] = []

  let stableReserves: BigDecimal[] = []

  let nativeReserves: BigDecimal[] = []

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const asset0 = PairAsset.load(address.concat(':asset:0'))
    const asset1 = PairAsset.load(address.concat(':asset:1'))

    if (
      asset0 === null ||
      asset1 === null ||
      (asset0.token == NATIVE_ADDRESS && asset0.reserve.le(MINIMUM_NATIVE_LIQUIDITY)) ||
      (asset1.token == NATIVE_ADDRESS && asset1.reserve.le(MINIMUM_NATIVE_LIQUIDITY))
    ) {
      continue
    }

    const stableFirst = STABLE_TOKEN_ADDRESSES.includes(asset0.token)

    nativeReserve = nativeReserve.plus(!stableFirst ? asset0.reserve : asset1.reserve)

    nativeReserves.push(!stableFirst ? asset0.reserve : asset1.reserve)

    stableReserves.push(stableFirst ? asset0.reserve : asset1.reserve)

    stablePrices.push(stableFirst ? asset0.price : asset1.price)

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

export function updateTokenPrice(token: Token): TokenPrice {
  log.debug('updateTokenPrice {}', [token.symbol])

  const nativeTokenPrice = getTokenPrice(NATIVE_ADDRESS)

  log.debug('updateTokenPrice 2', [])

  if (token.id == NATIVE_ADDRESS) {
    // Unless this subgraph understands BentoBox shares/amounts, derivedNative will be 1e18 shares of the NATIVE token
    nativeTokenPrice.derivedNative = BigDecimal.fromString('1')
    nativeTokenPrice.derivedUSD = getNativePriceInUSD()
    nativeTokenPrice.save()

    return nativeTokenPrice
  }

  let mostLiquidity = BigDecimal.fromString('0')
  const tokenPriceToUpdate = getTokenPrice(token.id)

  for (let i = 0, j = tokenPriceToUpdate.whitelistedPairCount.toI32(); i < j; i++) {
    log.debug('Token whitelisted pool #{}', [token.id.concat(':').concat(i.toString())])
    //0xaba8cac6866b83ae4eec97dd07ed254282f6ad8a
    const whitelistedPair = getWhitelistedPair(token.id.concat(':').concat(i.toString()))

    const asset0 = getPairAsset(whitelistedPair.pair.concat(':asset:0'))
    const asset1 = getPairAsset(whitelistedPair.pair.concat(':asset:1'))
    if (token.id == asset0.token) {
      const tokenPrice1 = getTokenPrice(asset1.token)
      const nativeLiquidity = asset1.reserve.times(tokenPrice1.derivedNative)

      if (nativeLiquidity.gt(mostLiquidity) && nativeLiquidity.gt(MINIMUM_NATIVE_LIQUIDITY)) {
        mostLiquidity = nativeLiquidity
        const derivedNative = asset1.price.times(tokenPrice1.derivedNative)
        const derivedUSD = derivedNative.times(nativeTokenPrice.derivedUSD)
        tokenPriceToUpdate.derivedNative = derivedNative
        tokenPriceToUpdate.derivedUSD = derivedUSD
      }
    }

    if (token.id == asset1.token) {
      const tokenPrice0 = getTokenPrice(asset0.token)
      const nativeLiquidity = asset0.reserve.times(tokenPrice0.derivedNative)
      if (nativeLiquidity.gt(mostLiquidity) && nativeLiquidity.gt(MINIMUM_NATIVE_LIQUIDITY)) {
        mostLiquidity = nativeLiquidity
        const derivedNative = asset0.price.times(tokenPrice0.derivedNative)
        const derivedUSD = derivedNative.times(nativeTokenPrice.derivedUSD)
        tokenPriceToUpdate.derivedNative = derivedNative
        tokenPriceToUpdate.derivedUSD = derivedUSD
      }
    }
  }

  tokenPriceToUpdate.save()

  return tokenPriceToUpdate
}

// Pricing module...

import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'
import { NATIVE_ADDRESS, STABLE_TOKEN_ADDRESSES, STABLE_POOL_ADDRESSES } from '../constants/addresses'
import { ConstantProductPoolAsset, Token } from '../../generated/schema'

export function isStableFirst(asset: ConstantProductPoolAsset): bool {
  return STABLE_TOKEN_ADDRESSES.includes(asset.token)
}

export function getNativePrice(): BigDecimal {
  // 1. Generate list of stable pairs
  // Cont. until getCreate2Address is available we'll just have to use a configured stable pool list instead

  // 2. Loop over the stable pool addresses
  // 3. Fetch stable assets of pairs from database
  // 4. If assets don't exist or threshold is not reached, continue
  // 5. Total the native side of the reserves
  // 6. Add stable reserve, and stable "price" into array, and incrememnt count.
  // 7. Finally, loop over the count and calculated a weighted price.

  let count = 0

  let weightdPrice = BigDecimal.fromString('0')

  let nativeReserve = BigDecimal.fromString('0')

  let stablePrices: BigDecimal[] = []

  let stableReserves: BigDecimal[] = []

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const address = STABLE_POOL_ADDRESSES[i]

    const asset0 = ConstantProductPoolAsset.load(address.concat(':asset:0'))
    const asset1 = ConstantProductPoolAsset.load(address.concat(':asset:1'))

    if (
      asset0 === null ||
      asset1 === null ||
      asset0.reserve.equals(BigDecimal.fromString('0')) ||
      asset1.reserve.equals(BigDecimal.fromString('0'))
    ) {
      continue
    }

    const stableFirst = isStableFirst(asset0)

    nativeReserve = nativeReserve.plus(stableFirst ? asset1.reserve : asset0.reserve)

    stableReserves.push(stableFirst ? asset0.reserve : asset1.reserve)

    stablePrices.push(stableFirst ? asset0.price : asset1.price)

    count = count + 1
  }

  if (count > 0) {
    for (let j = 0; j < count; j++) {
      const price = stablePrices[j]
      const reserve = stableReserves[j]
      const weight = reserve.div(nativeReserve)

      weightdPrice = weightdPrice.plus(price.times(weight))
    }
  }

  return weightdPrice
}

export function getNativePerToken(token: Token): BigDecimal {
  // Fetch whitelisted pairs from database

  if (Address.fromString(token.id) == NATIVE_ADDRESS) {
    return BigDecimal.fromString('1')
  }

  return BigDecimal.fromString('0')
}

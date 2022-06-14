import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Pair } from '../../generated/schema'
import { MINIMUM_USD_THRESHOLD_NEW_PAIRS } from '../constants'

export function isNewPair(pair: Pair, price0: BigDecimal, price1: BigDecimal): boolean {
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    const reserve0USD = pair.reserve0.times(price0)
    const reserve1USD = pair.reserve1.times(price1)
    if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
      return true
    }
    return false
  }
  return false
}

export function isReservePassingThreshold(pair: Pair): boolean {
  return pair.reserveUSD.gt(BigDecimal.fromString('50000'))
}

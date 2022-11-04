import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO } from '../constants'

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BigInt.fromI32(0)) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}
// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(BIG_DECIMAL_ZERO)) {
    return BIG_DECIMAL_ZERO
  } else {
    return amount0.div(amount1)
  }
}

export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
  if (power.equals(BIG_INT_ZERO)) {
    return BIG_DECIMAL_ONE
  }
  let negativePower = power.lt(BIG_INT_ZERO)
  let result = BIG_DECIMAL_ZERO.plus(value)
  let powerAbs = power.abs()
  for (let i = BIG_INT_ONE; i.lt(powerAbs); i = i.plus(BIG_INT_ONE)) {
    result = result.times(value)
  }

  if (negativePower) {
    result = safeDiv(BIG_DECIMAL_ONE, result)
  }

  return result
}
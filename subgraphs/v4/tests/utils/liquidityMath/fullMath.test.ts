import { BigInt } from '@graphprotocol/graph-ts'
import { assert, describe, test } from 'matchstick-as/assembly/index'

import { FullMath } from '../../../src/utils/liquidityMath/fullMath'

describe('FullMath', () => {
  test('mulDivRoundingUp should correctly multiply and divide without rounding', () => {
    const a = BigInt.fromI32(10)
    const b = BigInt.fromI32(5)
    const denominator = BigInt.fromI32(2)
    const result = FullMath.mulDivRoundingUp(a, b, denominator)
    assert.bigIntEquals(result, BigInt.fromI32(25))
  })

  test('mulDivRoundingUp should round up when there is a remainder', () => {
    const a = BigInt.fromI32(10)
    const b = BigInt.fromI32(5)
    const denominator = BigInt.fromI32(3)
    const result = FullMath.mulDivRoundingUp(a, b, denominator)
    assert.bigIntEquals(result, BigInt.fromI32(17)) // (10 * 5) / 3 = 16.66... rounds up to 17
  })

  test('mulDivRoundingUp should handle large numbers', () => {
    const a = BigInt.fromString('1000000000000000000') // 1e18
    const b = BigInt.fromString('2000000000000000000') // 2e18
    const denominator = BigInt.fromString('1000000000000000000') // 1e18
    const result = FullMath.mulDivRoundingUp(a, b, denominator)
    assert.bigIntEquals(result, BigInt.fromString('2000000000000000000'))
  })

  test('mulDivRoundingUp should return one when product is less than denominator', () => {
    const a = BigInt.fromI32(1)
    const b = BigInt.fromI32(1)
    const denominator = BigInt.fromI32(2)
    const result = FullMath.mulDivRoundingUp(a, b, denominator)
    assert.bigIntEquals(result, BigInt.fromI32(1)) // Rounds up from 0.5 to 1
  })

  test('mulDivRoundingUp should handle zero inputs correctly', () => {
    const zero = BigInt.fromI32(0)
    const nonZero = BigInt.fromI32(5)
    assert.bigIntEquals(FullMath.mulDivRoundingUp(zero, nonZero, nonZero), BigInt.fromI32(0))
    assert.bigIntEquals(FullMath.mulDivRoundingUp(nonZero, zero, nonZero), BigInt.fromI32(0))
  })
})

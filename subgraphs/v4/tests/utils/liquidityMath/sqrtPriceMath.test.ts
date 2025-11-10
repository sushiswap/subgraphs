import { BigInt } from '@graphprotocol/graph-ts'
import { assert, describe, test } from 'matchstick-as/assembly/index'

import { SqrtPriceMath } from '../../../src/utils/liquidityMath/sqrtPriceMath'

describe('SqrtPriceMath', () => {
  describe('getAmount0Delta', () => {
    test('calculates amount0 correctly when sqrtRatioAX96 < sqrtRatioBX96', () => {
      const sqrtRatioAX96 = BigInt.fromString('1000000000000000000') // 1e18
      const sqrtRatioBX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = false

      const result = SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('26409387504754779197847983445'))
    })

    test('calculates amount0 correctly when sqrtRatioAX96 > sqrtRatioBX96', () => {
      const sqrtRatioAX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const sqrtRatioBX96 = BigInt.fromString('1000000000000000000') // 1e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = false

      const result = SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('26409387504754779197847983445'))
    })

    test('rounds up when specified', () => {
      const sqrtRatioAX96 = BigInt.fromString('1000000000000000000') // 1e18
      const sqrtRatioBX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = true

      const result = SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('26409387504754779197847983446'))
    })
  })

  describe('getAmount1Delta', () => {
    test('calculates amount1 correctly when sqrtRatioAX96 < sqrtRatioBX96', () => {
      const sqrtRatioAX96 = BigInt.fromString('1000000000000000000') // 1e18
      const sqrtRatioBX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = false

      const result = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('6310887'))
    })

    test('calculates amount1 correctly when sqrtRatioAX96 > sqrtRatioBX96', () => {
      const sqrtRatioAX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const sqrtRatioBX96 = BigInt.fromString('1000000000000000000') // 1e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = false

      const result = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('6310887'))
    })

    test('rounds up when specified', () => {
      const sqrtRatioAX96 = BigInt.fromString('1000000000000000000') // 1e18
      const sqrtRatioBX96 = BigInt.fromString('1500000000000000000') // 1.5e18
      const liquidity = BigInt.fromString('1000000000000000000') // 1e18
      const roundUp = true

      const result = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp)
      assert.bigIntEquals(result, BigInt.fromString('6310888'))
    })
  })
})

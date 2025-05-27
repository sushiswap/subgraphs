import { BigInt } from '@graphprotocol/graph-ts'

import { ONE_BI, Q96 } from '../../constants'
import { FullMath } from './fullMath'

// https://github.com/Uniswap/sdks/blob/30b98e09d0486cd5cc3e4360e3277eb7cb60d2d5/sdks/v3-sdk/src/utils/sqrtPriceMath.ts#L25
export abstract class SqrtPriceMath {
  public static getAmount0Delta(
    sqrtRatioAX96: BigInt,
    sqrtRatioBX96: BigInt,
    liquidity: BigInt,
    roundUp: boolean,
  ): BigInt {
    if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
      const temp = sqrtRatioAX96
      sqrtRatioAX96 = sqrtRatioBX96
      sqrtRatioBX96 = temp
    }

    const numerator1 = liquidity.leftShift(96)
    const numerator2 = sqrtRatioBX96.minus(sqrtRatioAX96)

    return roundUp
      ? FullMath.mulDivRoundingUp(
          FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96),
          ONE_BI,
          sqrtRatioAX96,
        )
      : numerator1.times(numerator2).div(sqrtRatioBX96).div(sqrtRatioAX96)
  }

  public static getAmount1Delta(
    sqrtRatioAX96: BigInt,
    sqrtRatioBX96: BigInt,
    liquidity: BigInt,
    roundUp: boolean,
  ): BigInt {
    if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
      const temp = sqrtRatioAX96
      sqrtRatioAX96 = sqrtRatioBX96
      sqrtRatioBX96 = temp
    }

    const difference = sqrtRatioBX96.minus(sqrtRatioAX96)

    return roundUp ? FullMath.mulDivRoundingUp(liquidity, difference, Q96) : liquidity.times(difference).div(Q96)
  }
}

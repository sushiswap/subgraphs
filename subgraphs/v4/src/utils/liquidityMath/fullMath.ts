import { BigInt } from '@graphprotocol/graph-ts'

import { ONE_BI } from '../../constants'
// https://github.com/Uniswap/sdks/blob/30b98e09d0486cd5cc3e4360e3277eb7cb60d2d5/sdks/v3-sdk/src/utils/fullMath.ts#L4
export abstract class FullMath {
  public static mulDivRoundingUp(a: BigInt, b: BigInt, denominator: BigInt): BigInt {
    const product = a.times(b)
    let result = product.div(denominator)
    if (!product.mod(denominator).isZero()) result = result.plus(ONE_BI)
    return result
  }
}

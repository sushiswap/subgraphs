import { BigInt } from '@graphprotocol/graph-ts'

import { hexToBigInt } from '..'
import { MaxUint256 } from '../../constants'

// https://github.com/Uniswap/sdks/blob/92b765bdf2759e5e6639a01728a96df81efbaa2b/sdks/v3-sdk/src/utils/tickMath.ts

function mulShift(val: BigInt, mulBy: BigInt): BigInt {
  return val.times(mulBy).rightShift(128)
}

export abstract class TickMath {
  /**
   * The minimum tick that can be used on any pool.
   */
  public static MIN_TICK: number = -887272
  /**
   * The maximum tick that can be used on any pool.
   */
  public static MAX_TICK: number = -TickMath.MIN_TICK

  /**
   * The sqrt ratio corresponding to the minimum tick that could be used on any pool.
   */
  public static MIN_SQRT_RATIO: BigInt = BigInt.fromString('4295128739')
  /**
   * The sqrt ratio corresponding to the maximum tick that could be used on any pool.
   */
  public static MAX_SQRT_RATIO: BigInt = BigInt.fromString('1461446703485210103287273052203988822378723970342')

  /**
   * Returns the sqrt ratio as a Q64.96 for the given tick. The sqrt ratio is computed as sqrt(1.0001)^tick
   * @param tick the tick for which to compute the sqrt ratio
   */
  public static getSqrtRatioAtTick(tick: i32): BigInt {
    if (tick < TickMath.MIN_TICK || tick > TickMath.MAX_TICK) {
      throw new Error('TICK')
    }
    const absTick: i32 = tick < 0 ? -tick : tick

    let ratio: BigInt =
      (absTick & 0x1) != 0
        ? hexToBigInt('0xfffcb933bd6fad37aa2d162d1a594001')
        : hexToBigInt('0x100000000000000000000000000000000')
    if ((absTick & 0x2) != 0) ratio = mulShift(ratio, hexToBigInt('0xfff97272373d413259a46990580e213a'))
    if ((absTick & 0x4) != 0) ratio = mulShift(ratio, hexToBigInt('0xfff2e50f5f656932ef12357cf3c7fdcc'))
    if ((absTick & 0x8) != 0) ratio = mulShift(ratio, hexToBigInt('0xffe5caca7e10e4e61c3624eaa0941cd0'))
    if ((absTick & 0x10) != 0) ratio = mulShift(ratio, hexToBigInt('0xffcb9843d60f6159c9db58835c926644'))
    if ((absTick & 0x20) != 0) ratio = mulShift(ratio, hexToBigInt('0xff973b41fa98c081472e6896dfb254c0'))
    if ((absTick & 0x40) != 0) ratio = mulShift(ratio, hexToBigInt('0xff2ea16466c96a3843ec78b326b52861'))
    if ((absTick & 0x80) != 0) ratio = mulShift(ratio, hexToBigInt('0xfe5dee046a99a2a811c461f1969c3053'))
    if ((absTick & 0x100) != 0) ratio = mulShift(ratio, hexToBigInt('0xfcbe86c7900a88aedcffc83b479aa3a4'))
    if ((absTick & 0x200) != 0) ratio = mulShift(ratio, hexToBigInt('0xf987a7253ac413176f2b074cf7815e54'))
    if ((absTick & 0x400) != 0) ratio = mulShift(ratio, hexToBigInt('0xf3392b0822b70005940c7a398e4b70f3'))
    if ((absTick & 0x800) != 0) ratio = mulShift(ratio, hexToBigInt('0xe7159475a2c29b7443b29c7fa6e889d9'))
    if ((absTick & 0x1000) != 0) ratio = mulShift(ratio, hexToBigInt('0xd097f3bdfd2022b8845ad8f792aa5825'))
    if ((absTick & 0x2000) != 0) ratio = mulShift(ratio, hexToBigInt('0xa9f746462d870fdf8a65dc1f90e061e5'))
    if ((absTick & 0x4000) != 0) ratio = mulShift(ratio, hexToBigInt('0x70d869a156d2a1b890bb3df62baf32f7'))
    if ((absTick & 0x8000) != 0) ratio = mulShift(ratio, hexToBigInt('0x31be135f97d08fd981231505542fcfa6'))
    if ((absTick & 0x10000) != 0) ratio = mulShift(ratio, hexToBigInt('0x9aa508b5b7a84e1c677de54f3e99bc9'))
    if ((absTick & 0x20000) != 0) ratio = mulShift(ratio, hexToBigInt('0x5d6af8dedb81196699c329225ee604'))
    if ((absTick & 0x40000) != 0) ratio = mulShift(ratio, hexToBigInt('0x2216e584f5fa1ea926041bedfe98'))
    if ((absTick & 0x80000) != 0) ratio = mulShift(ratio, hexToBigInt('0x48a170391f7dc42444e8fa2'))
    if (tick > 0) ratio = MaxUint256.div(ratio)

    return ratio
      .div(BigInt.fromI32(2).pow(32))
      .plus(ratio.mod(BigInt.fromI32(2).pow(32)).gt(BigInt.zero()) ? BigInt.fromI32(1) : BigInt.zero())
  }
}

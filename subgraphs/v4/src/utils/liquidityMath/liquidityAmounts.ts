import { BigInt } from '@graphprotocol/graph-ts'

import { ZERO_BI } from '../../constants'
import { SqrtPriceMath } from './sqrtPriceMath'
import { TickMath } from './tickMath'

// https://github.com/Uniswap/v3-sdk/blob/4e16fe8e56c8c26541545f138c89133794c7ce72/src/entities/position.ts#L68-L127
export function getAmount0(
  tickLower: i32,
  tickUpper: i32,
  currTick: i32,
  amount: BigInt,
  currSqrtPriceX96: BigInt,
): BigInt {
  const sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower)
  const sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper)

  let amount0 = ZERO_BI
  const roundUp = amount.gt(ZERO_BI)

  if (currTick < tickLower) {
    amount0 = SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, amount, roundUp)
  } else if (currTick < tickUpper) {
    amount0 = SqrtPriceMath.getAmount0Delta(currSqrtPriceX96, sqrtRatioBX96, amount, roundUp)
  } else {
    amount0 = ZERO_BI
  }

  return amount0
}

export function getAmount1(
  tickLower: i32,
  tickUpper: i32,
  currTick: i32,
  amount: BigInt,
  currSqrtPriceX96: BigInt,
): BigInt {
  const sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower)
  const sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper)

  let amount1 = ZERO_BI
  const roundUp = amount.gt(ZERO_BI)

  if (currTick < tickLower) {
    amount1 = ZERO_BI
  } else if (currTick < tickUpper) {
    amount1 = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, currSqrtPriceX96, amount, roundUp)
  } else {
    amount1 = SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, amount, roundUp)
  }

  return amount1
}

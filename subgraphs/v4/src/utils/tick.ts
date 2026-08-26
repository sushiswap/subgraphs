import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

import { ModifyLiquidity } from '../../generated/PoolManager/PoolManager'
import { Tick } from '../../generated/schema'
import { ONE_BD, ZERO_BI } from '../constants'
import { fastExponentiation, safeDiv } from './index'

export function createTick(tickId: string, tickIdx: i32, poolId: string, event: ModifyLiquidity): Tick {
  const tick = new Tick(tickId)
  tick.tickIdx = BigInt.fromI32(tickIdx)
  tick.pool = poolId
  tick.poolAddress = poolId

  tick.createdAtTimestamp = event.block.timestamp
  tick.createdAtBlockNumber = event.block.number
  tick.liquidityGross = ZERO_BI
  tick.liquidityNet = ZERO_BI

  tick.price0 = ONE_BD
  tick.price1 = ONE_BD

  // 1.0001^tick is token1/token0.
  const price0 = fastExponentiation(BigDecimal.fromString('1.0001'), tickIdx)
  tick.price0 = price0
  tick.price1 = safeDiv(ONE_BD, price0)

  return tick
}

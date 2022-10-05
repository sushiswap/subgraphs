import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BIG_INT_ZERO } from '../constants'
import { ConcentratedLiquidityInfo } from '../../generated/schema'

export function createConcentratedLiquidityInfo(address: Address, tickSpacing: BigInt): ConcentratedLiquidityInfo {
  const id = address.toHex()

  let info = new ConcentratedLiquidityInfo(id)
  info.tick = tickSpacing
  info.sqrtPrice = BIG_INT_ZERO
  info.feeGrowthGlobal0X128 = BIG_INT_ZERO
  info.feeGrowthGlobal1X128 = BIG_INT_ZERO
  info.observationIndex = BIG_INT_ZERO
  info.save()

  return info
}

export function getConcentratedLiquidityInfo(address: string): ConcentratedLiquidityInfo {
  return ConcentratedLiquidityInfo.load(address) as ConcentratedLiquidityInfo
}

import { Address, BigInt } from '@graphprotocol/graph-ts'
import { ConcentratedLiquidityInfo } from '../../generated/schema'

export function createConcentratedLiquidityInfo(address: Address, tickSpacing: BigInt): ConcentratedLiquidityInfo {
  const id = address.toHex()

  let info = new ConcentratedLiquidityInfo(id)
  info.tickSpacing = tickSpacing
  info.save()

  return info
}

export function getConcentratedLiquidityInfo(address: string): ConcentratedLiquidityInfo {
  return ConcentratedLiquidityInfo.load(address) as ConcentratedLiquidityInfo
}

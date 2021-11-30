import { ConstantProductPoolKpi, PoolDaySnapshot, ConstantProductPool } from '../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function updatePoolHourSnapshot(timestamp: BigInt, poolKpi: ConstantProductPoolKpi): void {
  let hourIndex = timestamp.toI32() / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let dayPairID = poolKpi.id.concat('-').concat(BigInt.fromI32(hourIndex).toString())

  let snapshot = PoolDaySnapshot.load(dayPairID)

  if (snapshot === null) {
    snapshot = new PoolDaySnapshot(dayPairID)
    snapshot.date = hourStartUnix
    snapshot.pool = poolKpi.id
  }

  snapshot.liquidity = poolKpi.liquidity
  snapshot.liquidityNative = poolKpi.liquidityNative
  snapshot.liquidityUSD = poolKpi.liquidityUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BigInt.fromI32(1))
  snapshot.save()
}

export function updatePoolDaySnapshot(timestamp: BigInt, poolKpi: ConstantProductPoolKpi): void {
  let dayID = timestamp.toI32() / 86400
  let dayStartTimestamp = dayID * 86400
  let dayPairID = poolKpi.id.concat('-').concat(BigInt.fromI32(dayID).toString())

  let snapshot = PoolDaySnapshot.load(dayPairID)

  if (snapshot === null) {
    snapshot = new PoolDaySnapshot(dayPairID)
    snapshot.date = dayStartTimestamp
    snapshot.pool = poolKpi.id
  }

  snapshot.liquidity = poolKpi.liquidity
  snapshot.liquidityNative = poolKpi.liquidityNative
  snapshot.liquidityUSD = poolKpi.liquidityUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BigInt.fromI32(1))
  snapshot.save()
}

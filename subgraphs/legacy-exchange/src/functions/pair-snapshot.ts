import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants'
import { PairDaySnapshot, PairHourSnapshot, PairKpi } from '../../generated/schema'

import { BigInt } from '@graphprotocol/graph-ts'

export function updatePairHourSnapshot(timestamp: BigInt, pairKpi: PairKpi): PairHourSnapshot {
  let id = getPairHourSnapshotId(pairKpi.id, timestamp)

  let snapshot = PairHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pairKpi.id
  }

  snapshot.liquidity = pairKpi.liquidity
  snapshot.liquidityNative = pairKpi.liquidityNative
  snapshot.liquidityUSD = pairKpi.liquidityUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BigInt.fromI32(1))
  snapshot.save()

  return snapshot
}

export function updatePairDaySnapshot(timestamp: BigInt, pairKpi: PairKpi): PairDaySnapshot {
  let id = getPairDaySnapshotId(pairKpi.id, timestamp)
  let snapshot = PairDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairDaySnapshot(id)
    snapshot.date = getDayStartDate(timestamp)
    snapshot.pair = pairKpi.id
  }

  snapshot.liquidity = pairKpi.liquidity
  snapshot.liquidityNative = pairKpi.liquidityNative
  snapshot.liquidityUSD = pairKpi.liquidityUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BigInt.fromI32(1))
  snapshot.save()

  return snapshot
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique hour within unix history
  return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

export function getPairHourSnapshotId(pairKpiId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return pairKpiId.concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}

export function getPairDaySnapshotId(pairKpiId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return pairKpiId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

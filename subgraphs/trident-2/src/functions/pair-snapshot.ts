
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PairDaySnapshot, PairHourSnapshot, PairKpi } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants'
import { convertTokenToDecimal } from './number-converter'
import { getPairKpi } from './pair-kpi'

export function updatePairSnapshots(timestamp: BigInt, pairAddress: Address): void {
  let pairKpi = getPairKpi(pairAddress.toHex())
  updatePairHourSnapshot(timestamp, pairKpi)
  updatePairDaySnapshot(timestamp, pairKpi)
}

function updatePairHourSnapshot(timestamp: BigInt, pairKpi: PairKpi): void {
  let id = getPairHourSnapshotId(pairKpi.id, timestamp)

  let snapshot = PairHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pairKpi.id
    snapshot.transactionCount = BIG_INT_ZERO
  }
  snapshot.liquidity = convertTokenToDecimal(pairKpi.liquidity, BigInt.fromU32(18))
  snapshot.liquidityNative = pairKpi.liquidityNative
  snapshot.liquidityUSD = pairKpi.liquidityUSD
  snapshot.volumeNative = pairKpi.volumeNative
  snapshot.volumeUSD = pairKpi.volumeUSD
  snapshot.feesNative = pairKpi.feesNative
  snapshot.feesUSD = pairKpi.feesUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}

function updatePairDaySnapshot(timestamp: BigInt, pairKpi: PairKpi): void {
  let id = getPairDaySnapshotId(pairKpi.id, timestamp)
  let snapshot = PairDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairDaySnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pairKpi.id
    snapshot.transactionCount = BIG_INT_ZERO
  }
  snapshot.liquidity = convertTokenToDecimal(pairKpi.liquidity, BigInt.fromU32(18))
  snapshot.liquidityNative = pairKpi.liquidityNative
  snapshot.liquidityUSD = pairKpi.liquidityUSD
  snapshot.volumeNative = pairKpi.volumeNative
  snapshot.volumeUSD = pairKpi.volumeUSD
  snapshot.feesNative = pairKpi.feesNative
  snapshot.feesUSD = pairKpi.feesUSD
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
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


export function getPairDaySnapshot(pairKpiId: string, timestamp: BigInt, daysAgo: i32): PairDaySnapshot | null {
    let startTime = BigInt.fromI32(timestamp.minus(BigInt.fromI32(daysAgo * DAY_IN_SECONDS)).toI32())
    let id = getPairDaySnapshotId(pairKpiId, startTime)
    let snapshot = PairDaySnapshot.load(id)
    if (snapshot !== null) {
      return snapshot
    }
  return null
}

/**
 * Get the last active hour snapshot for a pair, starting at 24 hours ago. If no snapshot is found,
 * iterate between 24-48 hours ago until a snapshot is found or else return null. 
 * @param pairKpiId 
 * @param timestamp 
 * @returns 
 */
 export function getAprSnapshot(pairKpiId: string, timestamp: BigInt): PairHourSnapshot | null {
  for (let i = 23; i <= 47; i++) {
   let startTime = BigInt.fromI32(timestamp.minus(BigInt.fromI32(i * HOUR_IN_SECONDS)).toI32())
   let id = getPairHourSnapshotId(pairKpiId, startTime)
   let snapshot = PairHourSnapshot.load(id)
   if (snapshot !== null) {
     return snapshot
   }
 }
 return null
}


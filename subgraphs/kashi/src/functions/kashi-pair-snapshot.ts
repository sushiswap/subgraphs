import { BigInt } from '@graphprotocol/graph-ts'
import { KashiPair, KashiPairDaySnapshot, KashiPairHourSnapshot } from '../../generated/schema'
import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants'

export function updateKashiPairSnapshots(timestamp: BigInt, pair: KashiPair): void {
  updatePairHourSnapshot(timestamp, pair)
  updatePairDaySnapshot(timestamp, pair)
}

function updatePairHourSnapshot(timestamp: BigInt, pair: KashiPair): void {
  let id = getPairHourSnapshotId(pair.id, timestamp)

  let snapshot = KashiPairHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new KashiPairHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pair.id
  }
  snapshot.totalCollateralShare = pair.totalCollateralShare
  snapshot.exchangeRate = pair.exchangeRate
  snapshot.totalSupply = pair.totalSupply
  snapshot.supplyAPR = pair.supplyAPR
  snapshot.borrowAPR = pair.borrowAPR
  snapshot.utilization = pair.utilization
  snapshot.totalFeesEarnedFraction = pair.totalFeesEarnedFraction
  snapshot.interestPerSecond = pair.interestPerSecond
  snapshot.feesEarnedFraction = pair.feesEarnedFraction
  snapshot.lastAccrued = pair.lastAccrued
  snapshot.totalAssetBase = pair.totalAssetBase
  snapshot.totalAssetElastic = pair.totalAssetElastic
  snapshot.totalBorrowBase = pair.totalBorrowBase
  snapshot.totalBorrowElastic = pair.totalBorrowElastic
  snapshot.save()
}

function updatePairDaySnapshot(timestamp: BigInt, pair: KashiPair): void {
  let id = getPairDaySnapshotId(pair.id, timestamp)

  let snapshot = KashiPairDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new KashiPairDaySnapshot(id)
    snapshot.date = getDayStartDate(timestamp)
    snapshot.pair = pair.id
  }
  snapshot.totalCollateralShare = pair.totalCollateralShare
  snapshot.exchangeRate = pair.exchangeRate
  snapshot.totalSupply = pair.totalSupply
  snapshot.supplyAPR = pair.supplyAPR
  snapshot.borrowAPR = pair.borrowAPR
  snapshot.utilization = pair.utilization
  snapshot.totalFeesEarnedFraction = pair.totalFeesEarnedFraction
  snapshot.interestPerSecond = pair.interestPerSecond
  snapshot.feesEarnedFraction = pair.feesEarnedFraction
  snapshot.lastAccrued = pair.lastAccrued
  snapshot.totalAssetBase = pair.totalAssetBase
  snapshot.totalAssetElastic = pair.totalAssetElastic
  snapshot.totalBorrowBase = pair.totalBorrowBase
  snapshot.totalBorrowElastic = pair.totalBorrowElastic
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

export function getPairHourSnapshotId(pairId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return pairId.concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}

export function getPairDaySnapshotId(pairId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return pairId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { DaySnapshot, HourSnapshot, WeekSnapshot, XSushi } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS, WEEK_IN_SECONDS } from '../constants'
import { getOrCreateXSushi } from './xsushi'

export class Snapshots {
  hour: HourSnapshot
  day: DaySnapshot
  week: WeekSnapshot
}

export function updateSnapshots(timestamp: BigInt): Snapshots {
  let xSushi = getOrCreateXSushi()
  return {
    hour: updateHourSnapshot(timestamp, xSushi),
    day: updateDaySnapshot(timestamp, xSushi),
    week: updateWeeklySnapshot(timestamp, xSushi)
  }
}

function updateHourSnapshot(
  timestamp: BigInt,
  xSushi: XSushi,
): HourSnapshot {
  let id = getPairHourSnapshotId(timestamp)

  let snapshot = HourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new HourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.newTransactions = BIG_INT_ZERO
    snapshot.newSushiStaked = BIG_DECIMAL_ZERO
    snapshot.newSushiHarvested = BIG_DECIMAL_ZERO
    snapshot.newFeeAmount = BIG_DECIMAL_ZERO
    snapshot.newXSushiBurned = BIG_DECIMAL_ZERO
    snapshot.newXSushiMinted = BIG_DECIMAL_ZERO
  }

  snapshot.userCount = xSushi.userCount
  snapshot.transactionCount = xSushi.transactionCount
  snapshot.sushiSupply = xSushi.sushiSupply
  snapshot.xSushiSupply = xSushi.xSushiSupply
  snapshot.sushiStaked = xSushi.sushiStaked
  snapshot.sushiHarvested = xSushi.sushiHarvested
  snapshot.totalFeeAmount = xSushi.totalFeeAmount
  snapshot.xSushiBurned = xSushi.xSushiBurned
  snapshot.xSushiMinted = xSushi.xSushiMinted
  snapshot.xSushiSushiRatio = xSushi.xSushiSushiRatio
  snapshot.sushiXsushiRatio = xSushi.sushiXsushiRatio

  snapshot.save()
  return snapshot
}

function updateDaySnapshot(
  timestamp: BigInt,
  xSushi: XSushi
): DaySnapshot {
  let id = getPairDaySnapshotId(timestamp)
  let snapshot = DaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new DaySnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.newTransactions = BIG_INT_ZERO
    snapshot.newSushiStaked = BIG_DECIMAL_ZERO
    snapshot.newSushiHarvested = BIG_DECIMAL_ZERO
    snapshot.newFeeAmount = BIG_DECIMAL_ZERO
    snapshot.newXSushiBurned = BIG_DECIMAL_ZERO
    snapshot.newXSushiMinted = BIG_DECIMAL_ZERO
  }

  snapshot.userCount = xSushi.userCount
  snapshot.transactionCount = xSushi.transactionCount
  snapshot.sushiSupply = xSushi.sushiSupply
  snapshot.xSushiSupply = xSushi.xSushiSupply
  snapshot.sushiStaked = xSushi.sushiStaked
  snapshot.sushiHarvested = xSushi.sushiHarvested
  snapshot.totalFeeAmount = xSushi.totalFeeAmount
  snapshot.xSushiBurned = xSushi.xSushiBurned
  snapshot.xSushiMinted = xSushi.xSushiMinted
  snapshot.xSushiSushiRatio = xSushi.xSushiSushiRatio
  snapshot.sushiXsushiRatio = xSushi.sushiXsushiRatio

  snapshot.save()
  return snapshot
}


function updateWeeklySnapshot(
  timestamp: BigInt,
  xSushi: XSushi
): WeekSnapshot {
  let id = getPairWeeklySnapshotId(timestamp)
  let snapshot = WeekSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new WeekSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.newTransactions = BIG_INT_ZERO
    snapshot.newSushiStaked = BIG_DECIMAL_ZERO
    snapshot.newSushiHarvested = BIG_DECIMAL_ZERO
    snapshot.newFeeAmount = BIG_DECIMAL_ZERO
    snapshot.newXSushiBurned = BIG_DECIMAL_ZERO
    snapshot.newXSushiMinted = BIG_DECIMAL_ZERO
  }

  snapshot.userCount = xSushi.userCount
  snapshot.transactionCount = xSushi.transactionCount
  snapshot.sushiSupply = xSushi.sushiSupply
  snapshot.xSushiSupply = xSushi.xSushiSupply
  snapshot.sushiStaked = xSushi.sushiStaked
  snapshot.sushiHarvested = xSushi.sushiHarvested
  snapshot.totalFeeAmount = xSushi.totalFeeAmount
  snapshot.xSushiBurned = xSushi.xSushiBurned
  snapshot.xSushiMinted = xSushi.xSushiMinted
  snapshot.xSushiSushiRatio = xSushi.xSushiSushiRatio
  snapshot.sushiXsushiRatio = xSushi.sushiXsushiRatio

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

function getWeeklyStartDate(timestamp: BigInt): i32 {
  let weeklyIndex = timestamp.toI32() / WEEK_IN_SECONDS // get unique day within unix history
  return weeklyIndex * WEEK_IN_SECONDS // want the rounded effect
}


export function getPairHourSnapshotId(timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return 'hour-'.concat(BigInt.fromI32(startDate).toString())
}

export function getPairDaySnapshotId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return 'day-'.concat(BigInt.fromI32(startDate).toString())
}

export function getPairWeeklySnapshotId(timestamp: BigInt): string {
  let startDate = getWeeklyStartDate(timestamp)
  return 'week-'.concat(BigInt.fromI32(startDate).toString())
}


/**
 * Get the weekly APR, starting at 6 months from the given timestamp. If no snapshot is found return null. 
 * @param timestamp 
 * @returns 
 */
export function getAprSnapshot(timestamp: BigInt): WeekSnapshot | null {
  // TODO: weekly
  // for (let i = 23; i <= 47; i++) {
  //   let startTime = BigInt.fromI32(timestamp.minus(BigInt.fromI32(i * HOUR_IN_SECONDS)).toI32())
  //   let id = getPairWeeklySnapshotId(startTime)
  //   let snapshot = PairHourSnapshot.load(id)
  //   if (snapshot !== null) {
  //     return snapshot
  //   }
  // }
  return null
}
import { BigInt } from '@graphprotocol/graph-ts'
import { DaySnapshot, HourSnapshot, WeekSnapshot, XSushi } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS, YEAR_IN_SECONDS, WEEK_IN_SECONDS } from '../constants'
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
  let id = getHourSnapshotId(timestamp)

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
  snapshot.apr1m = xSushi.apr1m
  snapshot.apr3m = xSushi.apr3m
  snapshot.apr6m = xSushi.apr6m
  snapshot.apr12m = xSushi.apr12m

  snapshot.save()
  return snapshot
}

function updateDaySnapshot(
  timestamp: BigInt,
  xSushi: XSushi
): DaySnapshot {
  let id = getDaySnapshotId(timestamp)
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
  snapshot.apr1m = xSushi.apr1m
  snapshot.apr3m = xSushi.apr3m
  snapshot.apr6m = xSushi.apr6m
  snapshot.apr12m = xSushi.apr12m

  snapshot.save()
  return snapshot
}


function updateWeeklySnapshot(
  timestamp: BigInt,
  xSushi: XSushi
): WeekSnapshot {
  let id = getWeekSnapshotId(timestamp)
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
  snapshot.apr1m = xSushi.apr1m
  snapshot.apr3m = xSushi.apr3m
  snapshot.apr6m = xSushi.apr6m
  snapshot.apr12m = xSushi.apr12m

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


export function getHourSnapshotId(timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return 'hour-'.concat(BigInt.fromI32(startDate).toString())
}

export function getDaySnapshotId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return 'day-'.concat(BigInt.fromI32(startDate).toString())
}

export function getWeekSnapshotId(timestamp: BigInt): string {
  let startDate = getWeeklyStartDate(timestamp)
  return 'week-'.concat(BigInt.fromI32(startDate).toString())
}


/**
 * Get a day snapshot, given a timeframe and timestamp. If no snapshot is found return null. 
 * Example: 
 * if timestamp = now, and timeframe = (4 weeks in seconds)
 * Then we find the snapshot and day after the given timeframe to account for the snapshot duration.  
 * @param timestamp 
 * @param timeframe 
 * @returns 
 */
export function getAprSnapshot(timestamp: BigInt, timeframe: i32): DaySnapshot | null {
  let startTime = BigInt.fromI32(timestamp.minus(BigInt.fromI32(timeframe)
    .plus((BigInt.fromI32(DAY_IN_SECONDS)))
    )
    .toI32())
  let id = getDaySnapshotId(startTime)
  let snapshot = DaySnapshot.load(id)

  return snapshot
}


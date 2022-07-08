
import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants/time'

import { BigInt } from '@graphprotocol/graph-ts'
import { BentoBoxDailyKpi, BentoBoxHourlyKpi } from '../../generated/schema'
import { BENTOBOX_DAY_KPI_PREFIX, BENTOBOX_HOURLY_KPI_PREFIX } from '../constants'

export function updateBentoBoxHourlyKpi(timestamp: BigInt): BentoBoxHourlyKpi {
  let id = getBentoBoxHourlyKpiId(timestamp)

  let hourlyKpi = BentoBoxHourlyKpi.load(id)

  if (hourlyKpi === null) {
    hourlyKpi = new BentoBoxHourlyKpi(id)
    hourlyKpi.date = getHourStartDate(timestamp)
  }

  hourlyKpi.transactionCount = hourlyKpi.transactionCount.plus(BigInt.fromI32(1))
  hourlyKpi.save()

  return hourlyKpi
}

export function updateBentoBoxDailyKpi(timestamp: BigInt): BentoBoxDailyKpi {
  let id = getBentoBoxDailyKpiId(timestamp)
  let snapshot = BentoBoxDailyKpi.load(id)

  if (snapshot === null) {
    snapshot = new BentoBoxDailyKpi(id)
    snapshot.date = getDayStartDate(timestamp)
  }

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

export function getBentoBoxHourlyKpiId(timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return BENTOBOX_HOURLY_KPI_PREFIX.concat(BigInt.fromI32(startDate).toString())
}

export function getBentoBoxDailyKpiId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return BENTOBOX_DAY_KPI_PREFIX.concat(BigInt.fromI32(startDate).toString())
}

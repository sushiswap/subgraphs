import { BigInt } from '@graphprotocol/graph-ts'
import { Schedule, SchedulePeriod, Vesting } from '../../generated/schema'
import { CLIFF, END, START, STEP } from '../constants'

export function createSchedule(vesting: Vesting): Schedule {
  let schedule = getOrCreateSchedule(vesting.id)
  schedule.vesting = vesting.id
  schedule.save()

  createSchedulePeriods(vesting)
  return schedule
}

function createSchedulePeriods(vesting: Vesting): void {
  let passedTime = vesting.startedAt
  let passedAmount = BigInt.fromU32(0)
  savePeriod(vesting.id, 0, START, passedTime, passedAmount)

  passedTime = passedTime.plus(vesting.cliffDuration)
  passedAmount = passedAmount.plus(vesting.cliffAmount)
  savePeriod(vesting.id, 1, CLIFF, passedTime, passedAmount)

  const createdPeriodCount = 2
  for (let i = 0; i < vesting.steps.toI32() - 1; i++) {
    passedTime = passedTime.plus(vesting.stepDuration)
    passedAmount = passedAmount.plus(vesting.stepAmount)
    const id = createdPeriodCount + i
    savePeriod(vesting.id, id, STEP, passedTime, passedAmount)
  }

  passedTime = passedTime.plus(vesting.stepDuration)
  passedAmount = passedAmount.plus(vesting.stepAmount)
  const endPeriodId = createdPeriodCount + vesting.steps.toI32() - 1
  savePeriod(vesting.id, endPeriodId, END, passedTime, passedAmount)
}

function getOrCreateSchedule(id: string): Schedule {
  let schedule = Schedule.load(id)

  if (schedule === null) {
    schedule = new Schedule(id)
  }

  schedule.save()

  return schedule as Schedule
}

function getOrCreateSchedulePeriod(id: string, number: i32): SchedulePeriod {
  const periodId = id.concat(':period:').concat(number.toString())
  let period = SchedulePeriod.load(periodId)

  if (period === null) {
    period = new SchedulePeriod(periodId)
  }

  period.save()

  return period as SchedulePeriod
}

function savePeriod(vestId: string, number: i32, type: string, time: BigInt, amount: BigInt): void {
  let period = getOrCreateSchedulePeriod(vestId, number)
  period.type = type
  period.time = time
  period.amount = amount
  period.schedule = vestId
  period.save()
}

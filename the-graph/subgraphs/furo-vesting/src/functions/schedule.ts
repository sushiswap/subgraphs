import { BigInt } from '@graphprotocol/graph-ts'
import { Schedule, SchedulePeriod, Vesting } from '../../generated/schema'
import { CLIFF, END, START, STEP } from '../constants'

export function createSchedule(vesting: Vesting): Schedule {
  let schedule = getOrCreateSchedule('1') // FIXME: waiting for event to change, hardcoded for now
  schedule.vesting = '1'
  schedule.save()

  createSchedulePeriods(vesting)
  return schedule
}

function createSchedulePeriods(vesting: Vesting): void {
  let passedTime = vesting.startedAt
  let passedAmount = BigInt.fromU32(0)
  let vestId = '1' // FIXME: hardcoded for now, change when event is updated
  savePeriod(vestId, 0, START, passedTime, passedAmount)

  passedTime = passedTime.plus(vesting.cliffDuration)
  passedAmount = passedAmount.plus(vesting.cliffAmount)
  savePeriod(vestId, 1, CLIFF, passedTime, passedAmount)

  for (let i = 2; i < vesting.steps.toI32() - 1; i++) {
    passedTime = passedTime.plus(vesting.stepDuration)
    passedAmount = passedAmount.plus(vesting.stepAmount)
    savePeriod(vestId, i, STEP, passedTime, passedAmount)
  }

  passedTime = passedTime.plus(vesting.stepDuration)
  passedAmount = passedAmount.plus(vesting.stepAmount)

  savePeriod(vestId, vesting.steps.toI32(), END, passedTime, passedAmount)
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
  period.save()
}

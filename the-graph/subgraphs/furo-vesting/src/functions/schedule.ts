import { Address, BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { LogCreateVesting as CreateVestingEvent } from '../../generated/FuroVesting/FuroVesting'
import { Schedule, SchedulePeriod, Vesting } from '../../generated/schema'
import { CLIFF, END, START, STEP } from '../constants'
import { increaseUserCount } from './furo'

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

export function createSchedule(vesting: Vesting): void {
  // let schedule = getOrCreateSchedule(event.params.vestId)
  let schedule = getOrCreateSchedule('1') // FIXME: waiting for event to change, hardcoded for now
  schedule.vesting = '1'
  schedule.save()

  createSchedulePeriods(vesting)
}

function createSchedulePeriods(vesting: Vesting): void {
  let passedTime = vesting.startedAt
  let passedAmount = BigInt.fromU32(0)

  let startPeriod = getOrCreateSchedulePeriod('1', 0)
  startPeriod.type = START
  startPeriod.time = passedTime
  startPeriod.amount = passedAmount
  startPeriod.save()

  // log.debug('TYPE TIME     AMOUNT', [])
  // log.debug('{} {} {}', [START, passedTime.toString(), passedAmount.toString()])

  passedTime = passedTime.plus(vesting.cliffDuration)
  passedAmount = passedAmount.plus(vesting.cliffAmount)

  let cliffPeriod = getOrCreateSchedulePeriod('1', 1)
  cliffPeriod.type = CLIFF
  cliffPeriod.time = passedTime
  cliffPeriod.amount = passedAmount
  cliffPeriod.save()

  // log.debug('{} {} {}', [CLIFF, passedTime.toString(), passedAmount.toString()])
  for (let i = 2; i < vesting.steps.toI32() - 1; i++) {
    passedTime = passedTime.plus(vesting.stepDuration)
    passedAmount = passedAmount.plus(vesting.stepAmount)

    let stepPeriod = getOrCreateSchedulePeriod('1', i)
    stepPeriod.type = STEP
    stepPeriod.time = passedTime
    stepPeriod.amount = passedAmount
    stepPeriod.save()

    // log.debug('{}  {} {}', [STEP, passedTime.toString(), passedAmount.toString()])
  }

  passedTime = passedTime.plus(vesting.stepDuration)
  passedAmount = passedAmount.plus(vesting.stepAmount)

  let endPeriod = getOrCreateSchedulePeriod('1', vesting.steps.toI32())
  endPeriod.type = END
  endPeriod.time = passedTime
  endPeriod.amount = passedAmount
  endPeriod.save()

  // log.debug('{}   {} {}', [END, passedTime.toString(), passedAmount.toString()])
}

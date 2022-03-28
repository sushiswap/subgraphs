import {
  LogCreateVesting as CreateVestingEvent,
  LogStopVesting as CancelVestingEvent,
  LogWithdraw as WithdrawalEvent,
} from '../../generated/FuroVesting/FuroVesting'
import { createSchedule } from '../functions/schedule'
import { cancelVesting, createVesting } from '../functions/vesting'

export function onCreateVesting(event: CreateVestingEvent): void {
  const vesting = createVesting(event)
  const schedule = createSchedule(vesting)
  vesting.schedule = schedule.id
  vesting.save()
}

export function onCancelVesting(event: CancelVestingEvent): void {
    cancelVesting(event)
}

export function onWithdraw(event: WithdrawalEvent): void {}

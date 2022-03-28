import { LogCreateVesting } from '../../generated/FuroVesting/FuroVesting'
import { createSchedule } from '../functions/schedule'
import { createVesting } from '../functions/vesting'

export function onCreateVesting(event: LogCreateVesting): void {
    const vesting = createVesting(event)
    const schedule = createSchedule(vesting)
    vesting.schedule = schedule.id
    vesting.save()

}
export function onWithdraw(event: LogCreateVesting): void {}

export function onTransfer(event: LogCreateVesting): void {}

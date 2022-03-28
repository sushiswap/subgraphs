import { LogCreateVesting } from '../../generated/FuroVesting/FuroVesting'
import { createVesting } from '../functions/vesting'

export function onCreateVesting(event: LogCreateVesting): void {
    createVesting(event)
}
export function onWithdraw(event: LogCreateVesting): void {}

export function onTransfer(event: LogCreateVesting): void {}

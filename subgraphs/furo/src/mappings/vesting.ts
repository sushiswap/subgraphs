import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent
} from '../../generated/FuroVesting/FuroVesting'
import { cancelVesting, createVesting, createVestingTransaction, transferVesting, updateTokenSnapshots, withdrawFromVesting } from '../functions'


export function onCreateVesting(event: CreateVestingEvent): void {
  const vesting = createVesting(event)
  createVestingTransaction(vesting, event)
  updateTokenSnapshots(event, vesting.token)
}

export function onCancelVesting(event: CancelVestingEvent): void {
  const vesting = cancelVesting(event)
  createVestingTransaction(vesting, event)
  updateTokenSnapshots(event, vesting.token)
}

export function onWithdrawVesting(event: WithdrawEvent): void {
  const vesting = withdrawFromVesting(event)
  createVestingTransaction(vesting, event)
  updateTokenSnapshots(event, vesting.token)
}

export function onTransferVesting(event: TransferEvent): void {
  transferVesting(event)
}

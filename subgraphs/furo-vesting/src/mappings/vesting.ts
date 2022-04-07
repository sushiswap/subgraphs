import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroVesting/FuroVesting'
import { createSchedule } from '../functions/schedule'
import {
  createDepositTransaction,
  createDisbursementTransactions,
  createWithdrawalTransaction,
} from '../functions/transaction'
import { cancelVesting, createVesting, transferVesting, withdrawFromVesting } from '../functions/vesting'

export function onCreateVesting(event: CreateVestingEvent): void {
  const vesting = createVesting(event)
  createSchedule(vesting)
  createDepositTransaction(vesting, event)
}

export function onCancelVesting(event: CancelVestingEvent): void {
  const vesting = cancelVesting(event)
  createDisbursementTransactions(vesting, event)
}

export function onWithdraw(event: WithdrawEvent): void {
  const vesting = withdrawFromVesting(event)
  createWithdrawalTransaction(vesting, event)
}

export function onTransfer(event: TransferEvent): void {
  transferVesting(event)
}
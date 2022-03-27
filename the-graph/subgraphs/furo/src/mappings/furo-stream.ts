import {
  LogCancelStream as CancelStreamEvent,
  LogCreateStream as CreateStreamEvent,
  LogWithdrawFromStream as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'
import { cancelStream, createStream, getOrCreateStream, withdrawFromStream } from '../functions/furo-stream'
import {
  createDepositTransaction,
  createDisbursementTransactions,
  createWithdrawalTransaction,
} from '../functions/transaction'

export function onCreateStream(event: CreateStreamEvent): void {
  const stream = createStream(event)
  createDepositTransaction(stream, event)
}

export function onCancelStream(event: CancelStreamEvent): void {
  const stream = cancelStream(event)
  createDisbursementTransactions(stream, event)
}

export function onWithdraw(event: WithdrawEvent): void {
  const stream = withdrawFromStream(event)
  createWithdrawalTransaction(stream, event)
}

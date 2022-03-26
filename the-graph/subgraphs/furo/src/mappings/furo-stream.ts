import { createDepositTransaction, createDisbursementTransactions } from '../functions/transaction'
import {
  LogCancelStream as CancelStreamEvent,
  LogCreateStream as CreateStreamEvent,
  LogWithdrawFromStream as WithdrawEvent
} from '../../generated/FuroStream/FuroStream'
import { cancelStream, createStream } from '../functions/furo-stream'
import { log } from 'matchstick-as'

export function onCreateStream(event: CreateStreamEvent): void {
  const stream = createStream(event)
  createDepositTransaction(stream, event)
}

export function onWithdraw(event: WithdrawEvent): void {}

export function onCancelStream(event: CancelStreamEvent): void {
  const stream = cancelStream(event)
  createDisbursementTransactions(stream, event)
}

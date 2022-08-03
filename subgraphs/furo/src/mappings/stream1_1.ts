import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  Transfer as TransferEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroStream1_1/FuroStream'
import { cancelStream, createStream, transferStream, updateStream, withdrawFromStream } from '../functions/stream'
import { createStreamTransaction } from '../functions'

export function onCreateStream(event: CreateStreamEvent): void {
  const stream = createStream(event)
  createStreamTransaction(stream, event)
}

export function onCancelStream(event: CancelStreamEvent): void {
  const stream = cancelStream(event)
  createStreamTransaction(stream, event)
}

export function onUpdateStream(event: UpdateStreamEvent): void {
  const stream = updateStream(event)
  createStreamTransaction(stream, event)
}

export function onWithdrawStream(event: WithdrawEvent): void {
  const stream = withdrawFromStream(event)
  createStreamTransaction(stream, event)
}

export function onTransferStream(event: TransferEvent): void {
  transferStream(event)
}

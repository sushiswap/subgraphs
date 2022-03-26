import { createStream } from '../functions/furo-stream'
import {
  LogCancelStream as CancelStreamEvent,
  LogCreateStream as CreateStreamEvent,
  LogWithdrawFromStream as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'

export function onCreateStream(event: CreateStreamEvent): void {
  createStream(event)
}

export function onWithdraw(event: WithdrawEvent): void {}

export function onCancelStream(event: CancelStreamEvent): void {}

import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  FuroStream,
  Transfer as TransferEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'
import { cancelStream, createStream, getStream, transferStream, updateStream, withdrawFromStream } from '../functions/stream'
import { createRebase, createStreamTransaction, getOrCreateRebase, toBase, toElastic } from '../functions'
import { FURO_STREAM_ADDRESS } from '../constants'
import { log } from '@graphprotocol/graph-ts'

export function onCreateStream(event: CreateStreamEvent): void {
  const stream = createStream(event)
  createStreamTransaction(stream, event)
}

export function onCancelStream(event: CancelStreamEvent): void {
  const stream = cancelStream(event)
  createStreamTransaction(stream, event)
}

export function onUpdateStream(event: UpdateStreamEvent): void {
  const contract = FuroStream.bind(FURO_STREAM_ADDRESS)
  const balanceOf = contract.streamBalanceOf(event.params.streamId)

  const streamBeforeUpdate = getStream(event.params.streamId)
  const rebase = createRebase(streamBeforeUpdate.token) // force update rebase, needed because we read balance off the stream contract.
  const topUpShares = toBase(rebase, event.params.topUpAmount, false) // have to convert to share, bug in contract where it emits amount
  const shares = balanceOf.getSenderBalance().minus(streamBeforeUpdate.remainingShares).minus(topUpShares).abs()
  const withdrawnAmount = toElastic(rebase, shares, false)
  const withdrawnShares = toBase(rebase, withdrawnAmount, true)  
  const stream = updateStream(balanceOf.getSenderBalance(), withdrawnShares, event)
  createStreamTransaction(stream, event, withdrawnAmount)
}

export function onWithdrawStream(event: WithdrawEvent): void {
  const stream = withdrawFromStream(event)
  createStreamTransaction(stream, event)
}

export function onTransferStream(event: TransferEvent): void {
  transferStream(event)
}

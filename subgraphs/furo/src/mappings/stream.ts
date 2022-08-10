import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  FuroStream,
  Transfer as TransferEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'
import { cancelStream, createStream, getStream, transferStream, updateStream, withdrawFromStream } from '../functions/stream'
import { createStreamTransaction, getOrCreateRebase, toBase, toElastic } from '../functions'
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
  const rebase = getOrCreateRebase(streamBeforeUpdate.token)
  const remainingShares = streamBeforeUpdate.initialShares.plus(event.params.topUpAmount).minus(balanceOf.getSenderBalance())
  const withdrawnAmountToBentoBox = toElastic(rebase, remainingShares, true).minus(streamBeforeUpdate.withdrawnAmount)

  const stream = updateStream(remainingShares, withdrawnAmountToBentoBox, event)
  createStreamTransaction(stream, event, withdrawnAmountToBentoBox)
}

export function onWithdrawStream(event: WithdrawEvent): void {
  const stream = withdrawFromStream(event)
  createStreamTransaction(stream, event)
}

export function onTransferStream(event: TransferEvent): void {
  transferStream(event)
}

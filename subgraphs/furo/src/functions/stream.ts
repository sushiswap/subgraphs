import { BigInt } from '@graphprotocol/graph-ts'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent, Transfer as TransferEvent, UpdateStream as UpdateStreamEvent, Withdraw as WithdrawEvent
} from '../../generated/FuroStream/FuroStream'
import { Stream } from '../../generated/schema'
import { ACTIVE, CANCELLED, ZERO_ADDRESS } from '../constants'
import { increaseStreamCount } from './global'
import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getStream(id: BigInt): Stream {
  return Stream.load(id.toString()) as Stream
}

export function createStream(event: CreateStreamEvent): Stream {
  let rebase = getOrCreateRebase(event.params.token.toHex())
  let stream = new Stream(event.params.streamId.toString())
  let recipient = getOrCreateUser(event.params.recipient, event)
  let sender = getOrCreateUser(event.params.sender, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)
  let initialShares = event.params.amount
  let initialAmount = toElastic(rebase, event.params.amount, true)
  stream.recipient = recipient.id
  stream.initialShares = initialShares
  stream.initialAmount = initialAmount
  stream.extendedShares = BigInt.fromU32(0)
  stream.remainingShares = initialShares
  stream.withdrawnAmount = BigInt.fromU32(0)
  stream.token = token.id
  stream.status = ACTIVE
  stream.createdBy = sender.id
  stream.fromBentoBox = event.params.fromBentoBox
  stream.startedAt = event.params.startTime
  stream.expiresAt = event.params.endTime
  stream.txHash = event.transaction.hash.toHex()
  stream.transactionCount = BigInt.fromU32(0)
  stream.createdAtBlock = event.block.number
  stream.createdAtTimestamp = event.block.timestamp
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()
  increaseStreamCount()

  return stream
}

export function updateStream(remainingShares: BigInt, withdrawnAmount: BigInt, event: UpdateStreamEvent): Stream {
  let stream = getStream(event.params.streamId)
  stream.extendedShares = stream.extendedShares.plus(event.params.topUpAmount)
  stream.remainingShares = remainingShares
  stream.withdrawnAmount = stream.withdrawnAmount.plus(withdrawnAmount)
  stream.expiresAt = stream.expiresAt.plus(event.params.extendTime)
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function cancelStream(event: CancelStreamEvent): Stream {
  let stream = getStream(event.params.streamId)
  let rebase = getOrCreateRebase(stream.token)
  stream.status = CANCELLED
  stream.withdrawnAmount = stream.withdrawnAmount.plus(toElastic(rebase, event.params.recipientBalance, true))
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function withdrawFromStream(event: WithdrawEvent): Stream {
  const stream = getStream(event.params.streamId)
  let rebase = getOrCreateRebase(stream.token)
  stream.withdrawnAmount = stream.withdrawnAmount.plus(toElastic(rebase, event.params.sharesToWithdraw, true))
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function transferStream(event: TransferEvent): void {
  if (!isValidTransfer(event)) {
    return
  }

  let recipient = getOrCreateUser(event.params.to, event)
  let stream = getStream(event.params.id)
  stream.recipient = recipient.id
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()
}

/**
 * Validate that the transfer is NOT a mint or burn transaction
 * @param event
 * @returns boolean
 */
function isValidTransfer(event: TransferEvent): boolean {
  return !event.params.from.equals(ZERO_ADDRESS) && !event.params.to.equals(ZERO_ADDRESS)
}

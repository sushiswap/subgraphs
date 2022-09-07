import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent, FuroStream, Transfer as TransferEvent, UpdateStream as UpdateStreamEvent, Withdraw as WithdrawEvent
} from '../../generated/FuroStream/FuroStream'
import { Stream } from '../../generated/schema'
import { ACTIVE, CANCELLED, FURO_STREAM_ADDRESS, ZERO_ADDRESS } from '../constants'
import { increaseStreamCount } from './global'
import { getOrCreateRebase, toBase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getStream(id: BigInt): Stream {
  return Stream.load(id.toString()) as Stream
}

export function createStream(event: CreateStreamEvent): Stream {
  // The event.params.sender is the Router contract, but that's being transferred so we need to read it off the contract
  const contract = FuroStream.bind(FURO_STREAM_ADDRESS)
  const owner = contract.streams(event.params.streamId).getSender()
  let sender = getOrCreateUser(owner, event)

  let rebase = getOrCreateRebase(event.params.token.toHex())
  let stream = new Stream(event.params.streamId.toString())
  let recipient = getOrCreateUser(event.params.recipient, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)
  let initialShares = event.params.amount
  let initialAmount = toElastic(rebase, event.params.amount, false)
  stream.recipient = recipient.id
  stream.initialShares = initialShares
  stream.initialAmount = initialAmount
  stream.initialSharesExtended = BigInt.fromU32(0)
  stream.withdrawnAmountAfterExtension = BigInt.fromU32(0)
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
  stream.extendedAtBlock = BigInt.fromU32(0)
  stream.extendedAtTimestamp = BigInt.fromU32(0)
  stream.save()
  increaseStreamCount()

  return stream
}

export function updateStream(remainingShares: BigInt, withdrawnShares: BigInt, event: UpdateStreamEvent): Stream {
  let stream = getStream(event.params.streamId)
  let rebase = getOrCreateRebase(stream.token)
  const topUpShares = toBase(rebase, event.params.topUpAmount, true)
  const withdrawnAmount = toElastic(rebase, withdrawnShares, true)
  stream.extendedShares = stream.extendedShares.plus(topUpShares)
  stream.remainingShares = remainingShares
  stream.initialSharesExtended = remainingShares
  stream.withdrawnAmountAfterExtension = BigInt.fromU32(0)
  stream.withdrawnAmount = stream.withdrawnAmount.plus(withdrawnAmount)
  stream.expiresAt = stream.expiresAt.plus(event.params.extendTime)
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.extendedAtBlock = event.block.number
  stream.extendedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function cancelStream(event: CancelStreamEvent): Stream {
  let stream = getStream(event.params.streamId)
  let rebase = getOrCreateRebase(stream.token)
  stream.status = CANCELLED
  stream.withdrawnAmount = stream.withdrawnAmount.plus(toElastic(rebase, event.params.recipientBalance, true))
  stream.remainingShares = BigInt.fromU32(0)
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function withdrawFromStream(event: WithdrawEvent): Stream {
  const stream = getStream(event.params.streamId)
  let rebase = getOrCreateRebase(stream.token)
  const withdrawnAmount = toElastic(rebase, event.params.sharesToWithdraw, true)
  stream.withdrawnAmount = stream.withdrawnAmount.plus(withdrawnAmount)
  if (!stream.extendedAtTimestamp.equals(BigInt.fromU32(0))) {
    stream.withdrawnAmountAfterExtension = stream.withdrawnAmountAfterExtension.plus(withdrawnAmount)
  }
  stream.remainingShares = stream.remainingShares.minus(event.params.sharesToWithdraw)
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

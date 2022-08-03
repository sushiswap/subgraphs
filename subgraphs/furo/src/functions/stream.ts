import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  Transfer as TransferEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent
} from '../../generated/FuroStream/FuroStream'
import {
  CancelStream as CancelStreamEvent1_1,
  CreateStream as CreateStreamEvent1_1,
  Transfer as TransferEvent1_1,
  UpdateStream as UpdateStreamEvent1_1,
  Withdraw as WithdrawEvent1_1
} from '../../generated/FuroStream1_1/FuroStream'
import { Stream } from '../../generated/schema'
import { ACTIVE, CANCELLED, ZERO_ADDRESS } from '../constants'
import { increaseStreamCount } from './global'
import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getStream(contractAddress: Address, id: BigInt): Stream {
  return Stream.load(contractAddress.toHex().concat("-").concat(id.toString())) as Stream
}

export function createStream<T extends ethereum.Event>(event: T): Stream {
  if (event instanceof CreateStreamEvent || event instanceof CreateStreamEvent1_1) {
    let rebase = getOrCreateRebase(event.params.token.toHex())
    const streamId = event.address.toHex().concat("-").concat(event.params.streamId.toString())
    let stream = new Stream(streamId)
    let recipient = getOrCreateUser(event.params.recipient, event)
    let sender = getOrCreateUser(event.params.sender, event)
    let token = getOrCreateToken(event.params.token.toHex(), event)
    let initialAmount = toElastic(rebase, event.params.amount, true)
    stream.recipient = recipient.id
    stream.contract = event.address.toHex()
    stream.initialAmount = initialAmount
    stream.extendedAmount = BigInt.fromU32(0)
    stream.totalAmount = initialAmount
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
  } else {
    throw new Error('Invalid event type, expected CreateStreamEvent or CreateStreamEvent1_1')
  }

}

export function updateStream<T extends ethereum.Event>(event: T): Stream {
  if (event instanceof UpdateStreamEvent || event instanceof UpdateStreamEvent1_1) {
    let stream = getStream(event.address, event.params.streamId)
    stream.extendedAmount = stream.extendedAmount.plus(event.params.topUpAmount)
    stream.totalAmount = stream.totalAmount.plus(event.params.topUpAmount)
    stream.expiresAt = stream.expiresAt.plus(event.params.extendTime)
    stream.modifiedAtBlock = event.block.number
    stream.modifiedAtTimestamp = event.block.timestamp
    stream.save()

    return stream
  } else {
    throw new Error('Invalid event type, expected UpdateStreamEvent or UpdateStreamEvent1_1')
  }
}

export function cancelStream<T extends ethereum.Event>(event: T): Stream {
  if (event instanceof CancelStreamEvent || event instanceof CancelStreamEvent1_1) {
    let stream = getStream(event.address, event.params.streamId)
    stream.status = CANCELLED
    stream.withdrawnAmount = stream.withdrawnAmount.plus(event.params.recipientBalance)
    stream.modifiedAtBlock = event.block.number
    stream.modifiedAtTimestamp = event.block.timestamp
    stream.save()
    return stream
  } else {
    throw new Error('Invalid event type, expected CancelStreamEvent or CancelStreamEvent1_1')
  }
}

export function withdrawFromStream<T extends ethereum.Event>(event: T): Stream {
  if (event instanceof WithdrawEvent || event instanceof WithdrawEvent1_1) {
    let stream = getStream(event.address, event.params.streamId)
    stream.withdrawnAmount = stream.withdrawnAmount.plus(event.params.sharesToWithdraw)
    stream.modifiedAtBlock = event.block.number
    stream.modifiedAtTimestamp = event.block.timestamp
    stream.save()

    return stream
  } else {
    throw new Error('Invalid event type, expected WithdrawEvent or WithdrawEvent1_1')
  }
}

export function transferStream<T extends ethereum.Event>(event: T): void {
  if (event instanceof TransferEvent || event instanceof TransferEvent1_1) {
    if (!isValidTransfer(event)) {
      return
    }

    let recipient = getOrCreateUser(event.params.to, event)
    let stream = getStream(event.address, event.params.id)
    stream.recipient = recipient.id
    stream.modifiedAtBlock = event.block.number
    stream.modifiedAtTimestamp = event.block.timestamp
    stream.save()
  } else {
    throw new Error('Invalid event type, expected TransferEvent or TransferEvent1_1')
  }
}

/**
 * Validate that the transfer is NOT a mint or burn transaction
 * @param event
 * @returns boolean
 */
function isValidTransfer<T extends ethereum.Event>(event: T): boolean {
  if (event instanceof TransferEvent || event instanceof TransferEvent1_1) {
  return !event.params.from.equals(ZERO_ADDRESS) && !event.params.to.equals(ZERO_ADDRESS)
  } else {
    throw new Error('Invalid event type, expected TransferEvent or TransferEvent1_1')
  }
}

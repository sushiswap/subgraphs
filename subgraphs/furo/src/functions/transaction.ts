import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Withdraw as WithdrawVestingEvent
} from '../../generated/FuroVesting/FuroVesting'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawStreamEvent
} from '../../generated/FuroStream/FuroStream'
import { Stream, Transaction, Vesting } from '../../generated/schema'
import { DEPOSIT, DISBURSEMENT, EXTEND, WITHDRAWAL } from '../constants'
import { increaseTransactionCount } from './global'
import { getOrCreateUser } from './user'

function getOrCreateTransaction(id: string, event: ethereum.Event): Transaction {
  let transaction = Transaction.load(id)

  if (transaction === null) {
    transaction = new Transaction(id)
    transaction.createdAtBlock = event.block.number
    transaction.createdAtTimestamp = event.block.timestamp
    transaction.txHash = event.transaction.hash.toHex()
    increaseTransactionCount()
    transaction.save()
  }

  return transaction as Transaction
}

export function createStreamTransaction<T extends ethereum.Event>(stream: Stream, event: T): void {
  if (event instanceof CreateStreamEvent) {
    const transactionId = stream.id.concat(':tx:').concat(stream.transactionCount.toString())
    let transaction = getOrCreateTransaction(transactionId, event)
    transaction.type = DEPOSIT
    transaction.stream = stream.id
    transaction.amount = event.params.amount
    transaction.to = event.params.recipient.toHex()
    transaction.token = event.params.token.toHex()
    transaction.toBentoBox = event.params.fromBentoBox
    transaction.save()

    stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
    stream.save()
  } else if (event instanceof CancelStreamEvent) {
    const senderTransactionId = stream.id.concat(':tx:').concat(stream.transactionCount.toString())
    let senderTransaction = getOrCreateTransaction(senderTransactionId, event)
    senderTransaction.type = DISBURSEMENT
    senderTransaction.stream = stream.id
    senderTransaction.amount = event.params.senderBalance
    senderTransaction.to = stream.createdBy
    senderTransaction.token = event.params.token.toHex()
    senderTransaction.toBentoBox = event.params.toBentoBox
    senderTransaction.save()

    stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))

    const recipientTransactionId = stream.id.concat(':tx:').concat(stream.transactionCount.toString())
    let recipientTransaction = getOrCreateTransaction(recipientTransactionId, event)
    recipientTransaction.type = DISBURSEMENT
    recipientTransaction.stream = stream.id
    recipientTransaction.amount = event.params.recipientBalance
    recipientTransaction.to = stream.recipient
    recipientTransaction.token = event.params.token.toHex()
    recipientTransaction.toBentoBox = event.params.toBentoBox
    recipientTransaction.save()

    stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
    stream.save()
  } else if (event instanceof WithdrawStreamEvent) {
    const transactionId = stream.id.concat(':tx:').concat(stream.transactionCount.toString())
    let recipient = getOrCreateUser(event.params.withdrawTo, event)
    let transaction = getOrCreateTransaction(transactionId, event)
    transaction.type = WITHDRAWAL
    transaction.stream = stream.id
    transaction.amount = event.params.sharesToWithdraw
    transaction.to = recipient.id
    transaction.token = event.params.token.toHex()
    transaction.toBentoBox = event.params.toBentoBox
    transaction.save()

    stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
    stream.save()
  } else if (event instanceof UpdateStreamEvent) {
    const transactionId = stream.id.concat(':tx:').concat(stream.transactionCount.toString())
    let transaction = getOrCreateTransaction(transactionId, event)
    transaction.type = EXTEND
    transaction.stream = stream.id
    transaction.amount = event.params.topUpAmount
    transaction.to = stream.recipient
    transaction.token = stream.token
    transaction.toBentoBox = event.params.fromBentoBox
    transaction.save()

    stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
    stream.save()
  }
}

export function createVestingTransaction<T extends ethereum.Event>(vesting: Vesting, event: T): void {
  if (event instanceof CreateVestingEvent) {
    const transactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
    let transaction = getOrCreateTransaction(transactionId, event)
    transaction.type = DEPOSIT
    transaction.vesting = vesting.id
    transaction.amount = vesting.totalAmount
    transaction.to = vesting.recipient
    transaction.token = vesting.token
    transaction.toBentoBox = true
    transaction.save()

    vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
    vesting.save()
  } else if (event instanceof CancelVestingEvent) {
    const senderTransactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
    let senderTransaction = getOrCreateTransaction(senderTransactionId, event)
    senderTransaction.type = DISBURSEMENT
    senderTransaction.vesting = vesting.id
    senderTransaction.amount = event.params.recipientAmount
    senderTransaction.to = vesting.recipient
    senderTransaction.token = vesting.token
    senderTransaction.toBentoBox = event.params.toBentoBox
    senderTransaction.save()

    vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))

    const recipientTransactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
    let recipientTransaction = getOrCreateTransaction(recipientTransactionId, event)
    recipientTransaction.type = DISBURSEMENT
    recipientTransaction.vesting = vesting.id
    recipientTransaction.amount = event.params.ownerAmount
    recipientTransaction.to = vesting.createdBy
    recipientTransaction.token = vesting.token
    recipientTransaction.toBentoBox = event.params.toBentoBox
    recipientTransaction.save()

    vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
    vesting.save()
  } else if (event instanceof WithdrawVestingEvent) {
    const transactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
    let transaction = getOrCreateTransaction(transactionId, event)
    transaction.type = WITHDRAWAL
    transaction.vesting = vesting.id
    transaction.amount = event.params.amount
    transaction.to = vesting.recipient
    transaction.token = vesting.token
    transaction.toBentoBox = event.params.toBentoBox
    transaction.save()

    vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
    vesting.save()
  }
}

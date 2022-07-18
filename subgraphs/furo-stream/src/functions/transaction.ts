import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'
import { Stream, Transaction } from '../../generated/schema'
import { DEPOSIT, DISBURSEMENT, EXTEND, WITHDRAWAL } from '../constants'
import { increaseTransactionCount } from './furo-stream'
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

export function createDepositTransaction(stream: Stream, event: CreateStreamEvent): Transaction {
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

  return transaction as Transaction
}

export function createDisbursementTransactions(stream: Stream, event: CancelStreamEvent): void {
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
}

export function createWithdrawalTransaction(stream: Stream, event: WithdrawEvent): Transaction {
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

  return transaction as Transaction
}

export function createExtendTransaction(stream: Stream, event: UpdateStreamEvent): Transaction {
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

  return transaction as Transaction
}

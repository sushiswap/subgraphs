import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Stream, Transaction, User } from '../../generated/schema'
import {
  LogCreateStream as CreateStreamEvent,
  LogCancelStream as CancelStreamEvent,
  LogWithdrawFromStream as WithdrawalEvent
} from '../../generated/FuroStream/FuroStream';
import { DEPOSIT, DISBURSEMENT, WITHDRAWAL } from '../constants';
import { log } from 'matchstick-as';
import { increaseTransactionCount } from './furo';

function getOrCreateTransaction(id: string, event: ethereum.Event): Transaction {
  let transaction = Transaction.load(id)
  
  if (transaction === null) {
    transaction = new Transaction(id)
    transaction.createdAtBlock = event.block.number
    transaction.createdAtTimestamp = event.block.timestamp
    increaseTransactionCount()
  }

  transaction.save()

  return transaction as Transaction
}

export function createDepositTransaction(stream: Stream, event: CreateStreamEvent): Transaction {
  const transactionId = stream.id.concat(":tx:").concat(stream.transactionCount.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = DEPOSIT
  transaction.stream = stream.id
  transaction.amount = event.params.amount
  transaction.to = event.params.recipient.toHex()
  transaction.token = event.params.token.toHex()
  transaction.toBentoBox = event.params.fromBentoBox // TODO: is this logic correctly mapped? negation needed?
  transaction.save()

  stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
  stream.save()

  return transaction as Transaction
}


export function createDisbursementTransactions(stream: Stream, event: CancelStreamEvent): void {  
  const senderTransactionId = stream.id.concat(":tx:").concat(stream.transactionCount.toString())
  let senderTransaction = getOrCreateTransaction(senderTransactionId, event)
  senderTransaction.type = DISBURSEMENT
  senderTransaction.stream = stream.id
  senderTransaction.amount = event.params.senderBalance
  senderTransaction.to = stream.createdBy
  senderTransaction.token = event.params.token.toHex()
  senderTransaction.toBentoBox = event.params.toBentoBox
  senderTransaction.save()

  stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))

  const recipientTransactionId = stream.id.concat(":tx:").concat(stream.transactionCount.toString())
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

export function createWithdrawalTransaction(stream: Stream, event: WithdrawalEvent): Transaction {
  const transactionId = stream.id.concat(":tx:").concat(stream.transactionCount.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = WITHDRAWAL
  transaction.stream = stream.id
  transaction.amount = event.params.sharesToWithdraw
  transaction.to = stream.recipient
  transaction.token = event.params.token.toHex()
  transaction.toBentoBox = event.params.toBentoBox // TODO: is this logic correctly mapped? negation needed?
  transaction.save()

  stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
  stream.save()

  return transaction as Transaction
}

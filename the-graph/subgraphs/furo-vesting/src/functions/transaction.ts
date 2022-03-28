// import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
// import { Stream, Transaction, User } from '../schema'
// import {
//   LogCreateStream as CreateStreamEvent,
//   LogCancelStream as CancelStreamEvent,
//   LogWithdrawFromStream as WithdrawalEvent
// } from '../FuroStream/FuroStream';
// import { DEPOSIT, DISBURSEMENT, WITHDRAWAL } from '../constants';
// import { log } from 'matchstick-as';
// import { increaseTransactionCount } from './furo';

import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { LogCreateVesting as CreateVestingEvent, LogStopVesting as CancelVestingEvent } from '../../generated/FuroVesting/FuroVesting'
import { Transaction, Vesting } from "../../generated/schema"
import { DEPOSIT, DISBURSEMENT } from '../constants'
import { increaseTransactionCount } from './furo'

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

export function createDepositTransaction(vesting: Vesting, event: CreateVestingEvent): Transaction {
  const transactionId = vesting.id.concat(":tx:").concat(vesting.transactionCount.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = DEPOSIT
  transaction.vesting = vesting.id
  transaction.amount = vesting.totalAmount
  transaction.to = vesting.recipient
  transaction.token = vesting.token
  transaction.toBentoBox = true // FIXME: missing param, waiting for event change
  transaction.save()

  vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
  vesting.save()

  return transaction as Transaction
}


export function createDisbursementTransactions(vesting: Vesting, event: CancelVestingEvent): void {  
  const senderTransactionId = vesting.id.concat(":tx:").concat(vesting.transactionCount.toString())
  let senderTransaction = getOrCreateTransaction(senderTransactionId, event)
  senderTransaction.type = DISBURSEMENT
  senderTransaction.vesting = vesting.id
  senderTransaction.amount = event.params.recipientAmount
  senderTransaction.to = vesting.recipient
  senderTransaction.token = event.params.token.toHex()
  senderTransaction.toBentoBox = event.params.toBentoBox
  senderTransaction.save()

  vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))

  const recipientTransactionId = vesting.id.concat(":tx:").concat(vesting.transactionCount.toString())
  let recipientTransaction = getOrCreateTransaction(recipientTransactionId, event)
  recipientTransaction.type = DISBURSEMENT
  recipientTransaction.vesting = vesting.id
  recipientTransaction.amount = event.params.ownerAmount
  recipientTransaction.to = vesting.createdBy
  recipientTransaction.token = event.params.token.toHex()
  recipientTransaction.toBentoBox = event.params.toBentoBox
  recipientTransaction.save()

  vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
  vesting.save()
}

// export function createWithdrawalTransaction(stream: Stream, event: WithdrawalEvent): Transaction {
//   const transactionId = stream.id.concat(":tx:").concat(stream.transactionCount.toString())
//   let transaction = getOrCreateTransaction(transactionId, event)
//   transaction.type = WITHDRAWAL
//   transaction.stream = stream.id
//   transaction.amount = event.params.sharesToWithdraw
//   transaction.to = stream.recipient
//   transaction.token = event.params.token.toHex()
//   transaction.toBentoBox = event.params.toBentoBox // TODO: is this logic correctly mapped? negation needed?
//   transaction.save()

//   stream.transactionCount = stream.transactionCount.plus(BigInt.fromU32(1))
//   stream.save()

//   return transaction as Transaction
// }

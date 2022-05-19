import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroVesting/FuroVesting'
import { Transaction, Vesting } from '../../generated/schema'
import { DEPOSIT, DISBURSEMENT, WITHDRAWAL } from '../constants'
import { increaseTransactionCount } from './furo-vesting'

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

export function createDepositTransaction(vesting: Vesting, event: CreateVestingEvent): Transaction {
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

  return transaction as Transaction
}

export function createDisbursementTransactions(vesting: Vesting, event: CancelVestingEvent): void {
  const senderTransactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
  let senderTransaction = getOrCreateTransaction(senderTransactionId, event)
  senderTransaction.type = DISBURSEMENT
  senderTransaction.vesting = vesting.id
  senderTransaction.amount = event.params.recipientAmount
  senderTransaction.to = vesting.recipient
  senderTransaction.token = event.params.token.toHex()
  senderTransaction.toBentoBox = event.params.toBentoBox
  senderTransaction.save()

  vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))

  const recipientTransactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
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

export function createWithdrawalTransaction(vesting: Vesting, event: WithdrawEvent): Transaction {
  const transactionId = vesting.id.concat(':tx:').concat(vesting.transactionCount.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = WITHDRAWAL
  transaction.vesting = vesting.id
  transaction.amount = event.params.amount
  transaction.to = vesting.recipient
  transaction.token = event.params.token.toHex()
  transaction.toBentoBox = event.params.toBentoBox
  transaction.save()

  vesting.transactionCount = vesting.transactionCount.plus(BigInt.fromU32(1))
  vesting.save()

  return transaction as Transaction
}

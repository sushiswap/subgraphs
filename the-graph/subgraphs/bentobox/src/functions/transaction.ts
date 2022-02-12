import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { getOrCreateBentoBox } from '.'
import { LogDeposit, LogTransfer, LogWithdraw } from '../../generated/BentoBox/BentoBox'
import { Transaction } from '../../generated/schema'
import { DEPOSIT, TRANSFER, WITHDRAW } from '../../src/constants'

export function createDepositTransaction(event: LogDeposit): Transaction {
  const transaction = new Transaction(getTransactionId(event))

  transaction.type = DEPOSIT
  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.token = event.params.token.toHex()
  transaction.share = event.params.share
  transaction.amount = event.params.amount

  transaction.bentoBox = event.address.toHex()
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

  increaseBentoBoxTransactionCount(event.address)
  
  return transaction
}

export function createWithdrawTransaction(event: LogWithdraw): Transaction {
  const transaction = new Transaction(getTransactionId(event))

  transaction.type = WITHDRAW
  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.token = event.params.token.toHex()
  transaction.share = event.params.share
  transaction.amount = event.params.amount

  transaction.bentoBox = event.address.toHex()
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

  increaseBentoBoxTransactionCount(event.address)

  return transaction
}

export function createTransferTransaction(event: LogTransfer): Transaction {
  const transaction = new Transaction(getTransactionId(event))

  transaction.type = TRANSFER
  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.token = event.params.token.toHex()
  transaction.share = event.params.share

  transaction.bentoBox = event.address.toHex()
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

  increaseBentoBoxTransactionCount(event.address)

  return transaction
}

function increaseBentoBoxTransactionCount(address: Address): void {
  const bentoBox = getOrCreateBentoBox(address)
  bentoBox.transactionCount = bentoBox.transactionCount.plus(BigInt.fromU32(1 as u8))
  bentoBox.save()
}

export function getTransactionId(event: ethereum.Event): string {
  return event.transaction.hash.toHex() + '-' + event.logIndex.toString()
}

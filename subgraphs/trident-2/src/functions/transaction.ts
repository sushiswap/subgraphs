import { ethereum } from '@graphprotocol/graph-ts'
import { Transaction } from '../../generated/schema'

export function createTransaction(event: ethereum.Event): Transaction {
  const id = event.transaction.hash.toHex()

  let transaction = new Transaction(id)
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdAtBlock = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp
  transaction.mints = new Array<string>()
  transaction.burns = new Array<string>()
  transaction.swaps = new Array<string>()
  transaction.save()

  return transaction as Transaction
}

export function getOrCreateTransaction(event: ethereum.Event): Transaction {
  const id = event.transaction.hash.toHex()
  let transaction = Transaction.load(id)
  if (transaction === null) {
    transaction = createTransaction(event)
  }

  return transaction as Transaction
}

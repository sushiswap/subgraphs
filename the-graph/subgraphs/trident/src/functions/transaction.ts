import { Transaction } from '../../generated/schema'
import { ethereum } from '@graphprotocol/graph-ts'

export function getOrCreateTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHex())

  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHex())
  }

  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.save()

  return transaction as Transaction
}

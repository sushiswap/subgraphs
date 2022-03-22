
import { Transaction } from '../../../generated/schema'
import { Transfer as TransferEvent } from "../../../generated/Sushi/Sushi"

export function getOrCreateTransaction(event: TransferEvent): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHex())

  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHex())
  }

  transaction.amount = event.params.value
  transaction.gasUsed = event.block.gasUsed
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

  return transaction as Transaction
}

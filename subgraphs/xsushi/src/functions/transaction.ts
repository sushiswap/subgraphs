import { Transaction } from '../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'
import { ADDRESS_ZERO } from '../constants'



export function createTransaction(event: TransferEvent): Transaction {
  const id = event.transaction.hash.toHex()
  const transaction = new Transaction(id)
  return transaction as Transaction
}

export function isMintTransaction(event: TransferEvent): boolean {
  return event.params.from == ADDRESS_ZERO
}

export function isBurnTransaction(event: TransferEvent): boolean {
  return event.params.to == ADDRESS_ZERO
}

export function transactionExists(event: SushiTransferEvent): boolean {
  return Transaction.load(event.transaction.hash.toHex()) !== null
}

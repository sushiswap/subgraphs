import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Transaction } from '../../../generated/schema'
import { Transfer as TransferEvent } from '../../../generated/xSushi/xSushi'
import { Transfer as SushiTransferEvent } from '../../../generated/sushi/sushi'
import { ADDRESS_ZERO, BIG_DECIMAL_1E18, BURN, FEES, MINT, TRANSFER } from '../../constants'
import { XSUSHI_ADDRESS } from '../../constants/addresses'
import { getOrCreateXSushi } from './xsushi'

export function getOrCreateTransaction(event: TransferEvent): Transaction {
  const transaction = Transaction.load(event.transaction.hash.toHex())

  if (transaction === null) {
    return createTransaction(event)
  }

  return transaction as Transaction
}

function createTransaction(event: TransferEvent): Transaction {
  const id = event.transaction.hash.toHex()
  const transaction = new Transaction(id)
  transaction.save()

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

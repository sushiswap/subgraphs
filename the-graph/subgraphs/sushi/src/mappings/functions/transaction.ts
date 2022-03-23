import { BigInt } from '@graphprotocol/graph-ts'
import { Transaction } from '../../../generated/schema'
import { Transfer as TransferEvent } from '../../../generated/Sushi/Sushi'
import { ADDRESS_ZERO, BURN, MINT, TRANSFER } from '../constants'
import { getOrCreateSushi } from './sushi'

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
  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.amount = event.params.value
  transaction.gasUsed = event.block.gasUsed
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp

  const sushi = getOrCreateSushi()
  sushi.transactionCount = sushi.transactionCount.plus(BigInt.fromU32(1))

  if (isBurning(event)) {
    transaction.type = BURN
    sushi.totalSupply = sushi.totalSupply.minus(event.params.value)
  } else if (isMinting(event)) {
    transaction.type = MINT
    sushi.totalSupply = sushi.totalSupply.plus(event.params.value)
  } else {
    transaction.type = TRANSFER
  }
  
  sushi.save()
  transaction.save()
  

  return transaction as Transaction
}

function isMinting(event: TransferEvent): boolean {
  return event.params.from == ADDRESS_ZERO
}

function isBurning(event: TransferEvent): boolean {
  return event.params.to == ADDRESS_ZERO
}

import { Transfer } from '../../generated/templates/Pair/Pair'
import { Transaction } from '../../generated/schema'
import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, NATIVE_ADDRESS } from '../constants'
import { getOrCreateBundle } from './bundle'
import { getOrCreateToken } from './token'
import { convertTokenToDecimal } from './number-converter'

export function createTransaction(event: ethereum.Event): Transaction {
  const id = event.transaction.hash.toHex()

  let transaction = new Transaction(id)
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdAtBlock = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp
  if (event.receipt !== null) {
    transaction.gasUsed = event.receipt!.gasUsed
    transaction.cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    let bundle = getOrCreateBundle()
    let nativeToken = getOrCreateToken(NATIVE_ADDRESS)
    if (bundle.nativePrice.gt(BIG_DECIMAL_ZERO) && transaction.gasUsed !== null) {
      // gas is in gwei, convert to wei, then to native token decimals
      let gasUsedInWei = transaction.gasUsed!.times(BigInt.fromI32(1000000000))
      transaction.gasUsedUSD = convertTokenToDecimal(gasUsedInWei, nativeToken.decimals).times(bundle.nativePrice)
    }
  }
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

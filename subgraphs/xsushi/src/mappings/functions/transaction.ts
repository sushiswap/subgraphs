import { BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Transaction } from '../../../generated/schema'
import { Transfer as TransferEvent } from '../../../generated/xSushi/xSushi'
import { ADDRESS_ZERO, BURN, FEES, MINT, TRANSFER } from '../../constants'
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
  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.amount = event.params.value
  transaction.gasUsed = event.block.gasUsed
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp

  const xSushi = getOrCreateXSushi()
  xSushi.transactionCount = xSushi.transactionCount.plus(BigInt.fromU32(1))

  if (isBurnTransaction(event)) {
    transaction.type = BURN
    const burnAmount = event.params.value.times(xSushi.totalSushiSupply).div(xSushi.totalXsushiSupply)
    xSushi.sushiLeaved = xSushi.sushiLeaved.plus(burnAmount)
    xSushi.totalSushiSupply = xSushi.totalSushiSupply.minus(burnAmount)
    xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.minus(event.params.value)
    // xSushi.xSushiBurned = xSushi.xSushiBurned.plus(event.params.value)
    transaction.amount = burnAmount
  } else if (isMintTransaction(event)) {
    transaction.type = MINT
    xSushi.totalSushiSupply = xSushi.totalSushiSupply.plus(event.params.value)
    xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.plus(event.params.value)
    xSushi.sushiEntered = xSushi.sushiEntered.plus(event.params.value)

    // if (xSushi.totalSushiSupply.isZero() || xSushi.totalXsushiSupply.isZero()) {
    //   xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.plus(event.params.value)
    // } else {
    //   const mintAmount = event.params.value.times(xSushi.totalXsushiSupply).div(xSushi.totalSushiSupply)
    //   xSushi.totalXsushiSupply = mintAmount
    // }
  } 
  // else if (isFeeTransaction(event)) {
  //   transaction.type = FEES
  //   xSushi.totalSushiSupply = xSushi.totalSushiSupply.plus(event.params.value)
  //   xSushi.sushiEntered = xSushi.sushiEntered.plus(event.params.value)
  // } 
  else {
    xSushi.totalSushiSupply = xSushi.totalSushiSupply.plus(event.params.value)
    transaction.type = TRANSFER
  }

  xSushi.save()
  transaction.save()

  return transaction as Transaction
}

function isMintTransaction(event: TransferEvent): boolean {
  return event.params.from == ADDRESS_ZERO
}

function isBurnTransaction(event: TransferEvent): boolean {
  return event.params.to == ADDRESS_ZERO
}

// function isFeeTransaction(event: TransferEvent): boolean {
//   return event.params.to == XSUSHI_ADDRESS
// }

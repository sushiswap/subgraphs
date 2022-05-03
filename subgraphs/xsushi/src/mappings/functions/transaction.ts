import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Transaction } from '../../../generated/schema'
import { Transfer as TransferEvent } from '../../../generated/xSushi/xSushi'
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
    const harvestAmount = event.params.value.times(xSushi.totalSushiSupply).div(xSushi.totalXsushiSupply)
    xSushi.xSushiBurned = xSushi.xSushiBurned.plus(event.params.value)
    xSushi.sushiHarvested = xSushi.sushiHarvested.plus(harvestAmount)
    transaction.amount = harvestAmount
    xSushi.totalSushiSupply = xSushi.totalSushiSupply.minus(harvestAmount)
    xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.minus(event.params.value)
    const xSushiSupply = !xSushi.totalXsushiSupply.isZero() ? xSushi.totalXsushiSupply.divDecimal(BIG_DECIMAL_1E18) : BigDecimal.fromString('1')
    const sushiSupply = !xSushi.totalSushiSupply.isZero() ? xSushi.totalSushiSupply.divDecimal(BIG_DECIMAL_1E18): BigDecimal.fromString('1')
    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)

  } else if (isMintTransaction(event)) {
    transaction.type = MINT
    if (xSushi.totalXsushiSupply.isZero() || xSushi.totalSushiSupply.isZero()) {
      xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.plus(event.params.value)
      xSushi.xSushiMinted = xSushi.xSushiMinted.plus(event.params.value)
    } else {
      const shares = event.params.value.times(xSushi.totalXsushiSupply).div(xSushi.totalSushiSupply)
      xSushi.totalXsushiSupply = xSushi.totalXsushiSupply.plus(shares)
      xSushi.xSushiMinted = xSushi.xSushiMinted.plus(shares)
    }

    xSushi.totalSushiSupply = xSushi.totalSushiSupply.plus(event.params.value)
    xSushi.sushiStaked = xSushi.sushiStaked.plus(event.params.value)
    const xSushiSupply = !xSushi.totalXsushiSupply.isZero() ? xSushi.totalXsushiSupply.divDecimal(BIG_DECIMAL_1E18) : BigDecimal.fromString('1')
    const sushiSupply = !xSushi.totalSushiSupply.isZero() ? xSushi.totalSushiSupply.divDecimal(BIG_DECIMAL_1E18): BigDecimal.fromString('1')
    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)
  } else {
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

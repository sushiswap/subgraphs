import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'

import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import {
  getOrCreateTransaction,
  isBurnTransaction,
  isMintTransaction,
  transactionExists,
} from './functions/transaction'
import { getOrCreateUser } from './functions/user'
import { getOrCreateFee } from './functions/fee'
import { XSUSHI_ADDRESS } from '../constants/addresses'
import { getOrCreateFeeSender } from './functions/fee-sender'
import { getOrCreateXSushi } from './functions/xsushi'
import { BIG_DECIMAL_1E18, BURN, MINT, TRANSFER } from '../constants'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(event.params.from.toHex(), event)
  let reciever = getOrCreateUser(event.params.to.toHex(), event)
  sender.balance = sender.balance.minus(event.params.value)
  sender.modifiedAtBlock = event.block.number
  sender.modifiedAtTimestamp = event.block.timestamp
  sender.save()

  reciever.balance = reciever.balance.plus(event.params.value)
  reciever.modifiedAtBlock = event.block.number
  reciever.modifiedAtTimestamp = event.block.timestamp
  reciever.save()

  const transaction = getOrCreateTransaction(event)
  const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)

  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.amount = value
  transaction.gasUsed = event.block.gasUsed
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp

  const xSushi = getOrCreateXSushi()
  xSushi.transactionCount = xSushi.transactionCount.plus(BigInt.fromU32(1))
  if (isBurnTransaction(event)) {
    transaction.type = BURN
    const harvestAmount = value.times(xSushi.sushiSupply).div(xSushi.xSushiSupply)
    xSushi.xSushiBurned = xSushi.xSushiBurned.plus(value)
    xSushi.sushiHarvested = xSushi.sushiHarvested.plus(harvestAmount)
    transaction.amount = harvestAmount
    xSushi.sushiSupply = xSushi.sushiSupply.minus(harvestAmount)
    xSushi.xSushiSupply = xSushi.xSushiSupply.minus(value) // ???? this makes it minus?
    const xSushiSupply = xSushi.xSushiSupply.gt(BigDecimal.zero())
      ? xSushi.xSushiSupply
      : BigDecimal.fromString('1')
    const sushiSupply = xSushi.sushiSupply.gt(BigDecimal.zero())
      ? xSushi.sushiSupply
      : BigDecimal.fromString('1')
    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)
  } else if (isMintTransaction(event)) {
    transaction.type = MINT

    // calculate sushi entered since the event param only contains xsushi
    const sushiValue =
      xSushi.sushiSupply.gt(BigDecimal.zero()) && xSushi.xSushiSupply.gt(BigDecimal.zero())
        ? value.times(xSushi.xSushiSupply).div(xSushi.sushiSupply)
        : value

    xSushi.sushiSupply = xSushi.sushiSupply.plus(sushiValue)
    xSushi.xSushiSupply = xSushi.xSushiSupply.plus(value)
    xSushi.xSushiMinted = xSushi.xSushiMinted.plus(value)
    xSushi.sushiStaked = xSushi.sushiStaked.plus(sushiValue)
    const xSushiSupply = xSushi.xSushiSupply.gt(BigDecimal.zero())
      ? xSushi.xSushiSupply
      : BigDecimal.fromString('1')
    const sushiSupply = xSushi.sushiSupply.gt(BigDecimal.zero())
      ? xSushi.sushiSupply
      : BigDecimal.fromString('1')
    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)
  } else {
    transaction.type = TRANSFER
  }
  transaction.save()
  xSushi.save()
}

export function onSushiTransfer(event: SushiTransferEvent): void {
  if (event.params.to == XSUSHI_ADDRESS && !transactionExists(event)) {
    const sender = getOrCreateFeeSender(event)
    sender.totalFeeSent = sender.totalFeeSent.plus(event.params.value)
    sender.modifiedAtBlock = event.block.number
    sender.modifiedAtTimestamp = event.block.timestamp
    sender.save()

    const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)

    getOrCreateFee(event)

    let xSushi = getOrCreateXSushi()
    xSushi.totalFeeAmount = xSushi.totalFeeAmount.plus(value)
    xSushi.sushiSupply = xSushi.sushiSupply.plus(value)

    const xSushiSupply = xSushi.xSushiSupply.gt(BigDecimal.zero())
      ? xSushi.xSushiSupply
      : BigDecimal.fromString('1')
    const sushiSupply = xSushi.sushiSupply.gt(BigDecimal.zero())
      ? xSushi.sushiSupply
      : BigDecimal.fromString('1')

    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)
    xSushi.save()
  }
}

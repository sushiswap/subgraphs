import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { XSushi } from '../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'
import { BIG_DECIMAL_1E18, BURN, MINT, TRANSFER, XSUSHI_ADDRESS } from '../constants'
import { getOrCreateFee } from '../functions/fee'
import { getOrCreateFeeSender } from '../functions/fee-sender'
import {
  getOrCreateTransaction,
  isBurnTransaction,
  isMintTransaction,
  transactionExists,
} from '../functions/transaction'
import { getOrCreateUser } from '../functions/user'
import { getOrCreateXSushi } from '../functions/xsushi'

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
  if (isMintTransaction(event)) {
    transaction.type = MINT
    xSushi.xSushiSupply = xSushi.xSushiSupply.plus(value)
    xSushi.xSushiMinted = xSushi.xSushiMinted.plus(value)
  } else if (isBurnTransaction(event)) {
    transaction.type = BURN
    xSushi.xSushiBurned = xSushi.xSushiBurned.plus(value)
    xSushi.xSushiSupply = xSushi.xSushiSupply.minus(value)
    updateRatio(xSushi)
  } else {
    transaction.type = TRANSFER
  }
  transaction.save()
  xSushi.save()
}

export function onSushiTransfer(event: SushiTransferEvent): void {
  const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)
  if (event.params.to == XSUSHI_ADDRESS) {
    // STAKE
    if (transactionExists(event)) {
      let xSushi = getOrCreateXSushi()
      xSushi.sushiSupply = xSushi.sushiSupply.plus(value)
      xSushi.sushiStaked = xSushi.sushiStaked.plus(value)
      xSushi.sushiXsushiRatio = xSushi.sushiSupply.div(xSushi.xSushiSupply)
      xSushi.xSushiSushiRatio = xSushi.xSushiSupply.div(xSushi.sushiSupply)
      xSushi.save()
    }
    // If no transaction exists, it means that the it's a direct transfer (not from enter function in the sushibar contract)
    else {
      const sender = getOrCreateFeeSender(event)
      sender.totalFeeSent = sender.totalFeeSent.plus(event.params.value)
      sender.modifiedAtBlock = event.block.number
      sender.modifiedAtTimestamp = event.block.timestamp
      sender.save()

      getOrCreateFee(event)

      let xSushi = getOrCreateXSushi()
      xSushi.totalFeeAmount = xSushi.totalFeeAmount.plus(value)
      xSushi.sushiSupply = xSushi.sushiSupply.plus(value)
      updateRatio(xSushi)
      xSushi.save()
    }
    // HARVEST
  } else if (event.params.from == XSUSHI_ADDRESS) {
    let xSushi = getOrCreateXSushi()
    xSushi.sushiHarvested = xSushi.sushiHarvested.plus(value)
    xSushi.sushiSupply = xSushi.sushiSupply.minus(value)
    updateRatio(xSushi)
    xSushi.save()
  }
}

function updateRatio(xSushi: XSushi): void {
  if (xSushi.xSushiSupply.gt(BigDecimal.zero()) && xSushi.sushiSupply.gt(BigDecimal.zero())) {
    xSushi.sushiXsushiRatio = xSushi.sushiSupply.div(xSushi.xSushiSupply)
    xSushi.xSushiSushiRatio = xSushi.xSushiSupply.div(xSushi.sushiSupply)
  } else {
    xSushi.sushiXsushiRatio = BigDecimal.fromString('1')
    xSushi.xSushiSushiRatio = BigDecimal.fromString('1')
  }
}

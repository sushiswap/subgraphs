import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'

import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { getOrCreateTransaction } from './functions/transaction'
import { getOrCreateUser } from './functions/user'
import { getOrCreateFee } from './functions/fee'
import { XSUSHI_ADDRESS } from '../constants/addresses'
import { getOrCreateFeeSender } from './functions/fee-sender'
import { getOrCreateXSushi } from './functions/xsushi'
import { BIG_DECIMAL_1E18 } from '../constants'
import { BigDecimal } from '@graphprotocol/graph-ts'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(event.params.from.toHex(), event)
  let reciever = getOrCreateUser(event.params.to.toHex(), event)
  getOrCreateTransaction(event)

  sender.balance = sender.balance.minus(event.params.value)
  sender.modifiedAtBlock = event.block.number
  sender.modifiedAtTimestamp = event.block.timestamp
  sender.save()

  reciever.balance = reciever.balance.plus(event.params.value)
  reciever.modifiedAtBlock = event.block.number
  reciever.modifiedAtTimestamp = event.block.timestamp
  reciever.save()
}

export function onSushiTransfer(event: SushiTransferEvent): void {
  if (event.params.to == XSUSHI_ADDRESS) {
    const sender = getOrCreateFeeSender(event)
    sender.totalFeeSent = sender.totalFeeSent.plus(event.params.value)
    sender.modifiedAtBlock = event.block.number
    sender.modifiedAtTimestamp = event.block.timestamp
    sender.save()

    getOrCreateFee(event)

    let xSushi = getOrCreateXSushi()
    xSushi.totalFeeAmount = xSushi.totalFeeAmount.plus(event.params.value)
    xSushi.totalSushiSupply = xSushi.totalSushiSupply.plus(event.params.value)

    const xSushiSupply = !xSushi.totalXsushiSupply.isZero() ? xSushi.totalXsushiSupply.divDecimal(BIG_DECIMAL_1E18) : BigDecimal.fromString('1')
    const sushiSupply = !xSushi.totalSushiSupply.isZero() ? xSushi.totalSushiSupply.divDecimal(BIG_DECIMAL_1E18): BigDecimal.fromString('1')
    xSushi.sushiXsushiRatio = sushiSupply.div(xSushiSupply)
    xSushi.xSushiSushiRatio = xSushiSupply.div(sushiSupply)
    xSushi.save()
  }
}

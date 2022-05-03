import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'

import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { getOrCreateTransaction } from './functions/transaction'
import { getOrCreateUser } from './functions/user'
import { getOrCreateFee } from './functions/fee'
import { XSUSHI_ADDRESS } from '../constants/addresses'
import { getOrCreateFeeSender } from './functions/fee-sender'
import { getOrCreateXSushi } from './functions/xsushi'

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
    xSushi.save()
  }
}

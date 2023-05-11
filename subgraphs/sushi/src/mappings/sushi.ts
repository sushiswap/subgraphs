import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { ADDRESS_ZERO } from '../constants'
import { UserType } from '../enums'
import { getOrCreateTransaction } from '../functions/transaction'
import { getOrCreateUser } from '../functions/user'

export function onTransfer(event: TransferEvent): void {
  getOrCreateTransaction(event)

  //we don't update balance of address(0) when minting
  const senderAddress = event.params.from
  if (senderAddress != ADDRESS_ZERO) {
    let sender = getOrCreateUser(senderAddress.toHex(), event)
    sender.balance = sender.balance.minus(event.params.value)
    sender.modifiedAtBlock = event.block.number
    sender.modifiedAtTimestamp = event.block.timestamp
    sender.save()
  }

  //we don't update balance of address(0) when burning
  const receiverAddress = event.params.to
  if (receiverAddress != ADDRESS_ZERO) {
    let receiver = getOrCreateUser(receiverAddress.toHex(), event)
    receiver.balance = receiver.balance.plus(event.params.value)
    receiver.modifiedAtBlock = event.block.number
    receiver.modifiedAtTimestamp = event.block.timestamp
    receiver.save()
  }
}
